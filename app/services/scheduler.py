# app/services/scheduler.py
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
from services.enhanced_algorithm import enhanced_trading_algorithm
from app.services.storage import trading_signals, user_trading_signals
from database.collections import users_collection
from schemas.user import UserInDB
import asyncio

# Set up logging
logger = logging.getLogger(__name__)

# Global variable to store the scheduler instance
scheduler = None

def start_scheduler():
    """
    Initialize and start the background scheduler with 15-minute intervals
    """
    global scheduler
    
    try:
        # Create scheduler instance
        scheduler = BackgroundScheduler()
        
        # Run every 15 minutes for optimal signal frequency
        scheduler.add_job(
            check_user_watchlists_and_trigger,
            trigger=IntervalTrigger(minutes=15),
            id='user_algo_trading_checker',
            name='User-specific algorithmic trading - 15min intervals',
            replace_existing=True
        )
        
        # Start the scheduler
        scheduler.start()
        logger.info("✅ User-specific scheduler started successfully")
        logger.info("📊 Will check user watchlists every 15 minutes")
        
        # Don't run immediately on startup - wait for first scheduled run
        logger.info("⏰ First analysis will run in 15 minutes")
        
    except Exception as e:
        logger.error(f"❌ Failed to start scheduler: {e}")
        raise

async def get_all_users_with_watchlists():
    """
    Fetch all users who have watchlists with stocks
    """
    try:
        users = await users_collection.find({
            "watchlist": {"$exists": True, "$ne": []}
        }).to_list(length=None)
        
        logger.info(f"👥 Found {len(users)} users with watchlists")
        return users
        
    except Exception as e:
        logger.error(f"❌ Error fetching users with watchlists: {e}")
        return []

def check_user_watchlists_and_trigger():
    """
    Check each user's personal watchlist and generate signals specifically for them
    This runs in the background scheduler
    """
    # Create a new event loop for the background task
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Run the async function in the new loop
        loop.run_until_complete(_check_user_watchlists_and_trigger())
    finally:
        loop.close()

async def _check_user_watchlists_and_trigger():
    """
    Actual async implementation of the watchlist checking
    """
    logger.info("🔍 User-Specific Analysis: Processing individual watchlists...")
    
    # Get all users with watchlists
    users = await get_all_users_with_watchlists()
    
    if not users:
        logger.info("📭 No users with watchlists found")
        return
    
    total_signals = 0
    
    for user_data in users:
        try:
            user = UserInDB(**user_data)
            user_email = user.email
            watchlist = user.watchlist
            
            logger.info(f"👤 Processing watchlist for {user_email}: {len(watchlist)} stocks")
            
            user_signals = []
            
            # Analyze each stock in this user's personal watchlist
            for symbol in watchlist:
                try:
                    # Get trading decision for this specific stock
                    decision = enhanced_trading_algorithm(symbol)

                    if decision and decision.get('signal') != 'HOLD':
                        # Add user-specific information
                        decision['user_email'] = user_email
                        decision['user_id'] = str(user_data['_id'])
                        decision['for_user'] = True
                        
                        user_signals.append(decision)
                        total_signals += 1
                        
                        # Enhanced user-specific logging
                        logger.warning(f"🎯 USER SIGNAL for {user_email}: {decision['signal']} {symbol}")
                        logger.info(f"   Confidence: {decision['confidence']}% | Strategy: {decision['strategy']}")
                        
                        # Log order details
                        orders_count = len(decision.get('orders', []))
                        logger.info(f"   📦 Generated {orders_count} orders for {user_email}")
                        
                except Exception as e:
                    logger.error(f"💥 Error processing {symbol} for user {user_email}: {e}")
                    continue
            
            # Store user-specific signals
            if user_signals:
                await store_user_signals(user_email, user_signals)
                logger.info(f"💾 Stored {len(user_signals)} signals for user {user_email}")
            
        except Exception as e:
            logger.error(f"💥 Error processing user {user_data.get('email', 'unknown')}: {e}")
            continue
    
    logger.info(f"📈 Analysis complete: Generated {total_signals} signals across {len(users)} users")

async def store_user_signals(user_email: str, signals: list):
    """
    Store signals specifically for a user
    """
    try:
        timestamp = datetime.utcnow().isoformat()
        
        user_signal_data = {
            'user_email': user_email,
            'signals': signals,
            'generated_at': timestamp,
            'signal_count': len(signals)
        }
        
        # Store in user-specific signals collection
        await user_trading_signals.insert_one(user_signal_data)
        
    except Exception as e:
        logger.error(f"❌ Error storing signals for user {user_email}: {e}")

def stop_scheduler():
    """
    Stop the background scheduler (useful for testing)
    """
    global scheduler
    if scheduler:
        scheduler.shutdown()
        logger.info("🛑 Background scheduler stopped")