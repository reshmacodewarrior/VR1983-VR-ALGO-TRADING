# app/services/scheduler.py
import logging
import asyncio
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
from typing import List, Optional

from services.enhanced_algorithm import enhanced_trading_algorithm
from app.services.storage import trading_signals, user_trading_signals
from database.collections import users_collection
from schemas.user import UserInDB

# Set up logging
logger = logging.getLogger(__name__)

# Global variable to store the scheduler instance
scheduler: Optional[BackgroundScheduler] = None
_loop: Optional[asyncio.AbstractEventLoop] = None


class SchedulerManager:
    """Manager for handling scheduler operations with proper async support"""
    
    def __init__(self):
        self.scheduler = None
        self._running = False
    
    async def start(self):
        """Initialize and start the background scheduler"""
        if self._running:
            logger.warning("⚠️ Scheduler is already running")
            return
        
        try:
            # Create scheduler instance
            self.scheduler = BackgroundScheduler()
            
            # Run every 15 minutes for optimal signal frequency
            self.scheduler.add_job(
                self._safe_check_watchlists,
                trigger=IntervalTrigger(minutes=15),
                id='user_algo_trading_checker',
                name='User-specific algorithmic trading - 15min intervals',
                replace_existing=True
            )
            
            # Start the scheduler
            self.scheduler.start()
            self._running = True
            
            logger.info("✅ User-specific scheduler started successfully")
            logger.info("📊 Will check user watchlists every 15 minutes")
            logger.info("⏰ First analysis will run in 15 minutes")
            
        except Exception as e:
            logger.error(f"❌ Failed to start scheduler: {e}")
            self._running = False
            raise
    
    def _safe_check_watchlists(self):
        """
        Safely run the watchlist check from synchronous scheduler context
        """
        try:
            # Use asyncio.run() for proper event loop management
            asyncio.run(self._check_user_watchlists_and_trigger())
        except Exception as e:
            logger.error(f"❌ Scheduler job failed: {e}")
    
    async def _check_user_watchlists_and_trigger(self):
        """
        Main async method to check user watchlists and generate signals
        """
        logger.info("🔍 User-Specific Analysis: Processing individual watchlists...")
        
        start_time = datetime.utcnow()
        
        try:
            # Get all users with watchlists
            users = await self.get_all_users_with_watchlists()
            
            if not users:
                logger.info("📭 No users with watchlists found")
                return
            
            total_signals = 0
            processed_users = 0
            
            # Process users in batches to avoid overwhelming the system
            for user_data in users:
                try:
                    signals_count = await self._process_user_watchlist(user_data)
                    total_signals += signals_count
                    processed_users += 1
                    
                except Exception as e:
                    logger.error(f"💥 Error processing user {user_data.get('email', 'unknown')}: {e}")
                    continue
            
            # Log summary
            duration = (datetime.utcnow() - start_time).total_seconds()
            logger.info(
                f"📈 Analysis complete: "
                f"Generated {total_signals} signals across {processed_users}/{len(users)} users "
                f"in {duration:.2f}s"
            )
            
        except Exception as e:
            logger.error(f"💥 Critical error in watchlist analysis: {e}")
    
    async def get_all_users_with_watchlists(self) -> List[dict]:
        """
        Fetch all users who have non-empty watchlists
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
    
    async def _process_user_watchlist(self, user_data: dict) -> int:
        """
        Process a single user's watchlist and generate signals
        Returns the number of signals generated for this user
        """
        user = UserInDB(**user_data)
        user_email = user.email
        watchlist = user.watchlist
        
        logger.info(f"👤 Processing watchlist for {user_email}: {len(watchlist)} stocks")
        
        user_signals = []
        
        # Process each stock in the user's watchlist
        for symbol in watchlist:
            try:
                signal = await self._analyze_stock(symbol, user_email, user_data)
                if signal:
                    user_signals.append(signal)
                    
            except Exception as e:
                logger.error(f"💥 Error processing {symbol} for user {user_email}: {e}")
                continue
        
        # Store user-specific signals if any were generated
        if user_signals:
            await self._store_user_signals(user_email, user_signals)
            logger.info(f"💾 Stored {len(user_signals)} signals for user {user_email}")
        
        return len(user_signals)
    
    async def _analyze_stock(self, symbol: str, user_email: str, user_data: dict) -> Optional[dict]:
        """
        Analyze a single stock and return signal if applicable
        """
        # Get trading decision for this specific stock
        decision = enhanced_trading_algorithm(symbol)
        
        if not decision or decision.get('signal') == 'HOLD':
            return None
        
        # Add user-specific information
        decision['user_email'] = user_email
        decision['user_id'] = str(user_data['_id'])
        decision['for_user'] = True
        decision['analyzed_at'] = datetime.utcnow().isoformat()
        
        # Enhanced user-specific logging
        logger.warning(
            f"🎯 USER SIGNAL for {user_email}: {decision['signal']} {symbol} | "
            f"Confidence: {decision.get('confidence', 0)}% | "
            f"Strategy: {decision.get('strategy', 'Unknown')}"
        )
        
        # Log order details
        orders_count = len(decision.get('orders', []))
        if orders_count > 0:
            logger.info(f"   📦 Generated {orders_count} orders for {user_email}")
        
        return decision
    
    async def _store_user_signals(self, user_email: str, signals: List[dict]):
        """
        Store signals specifically for a user
        """
        try:
            signal_data = {
                'user_email': user_email,
                'signals': signals,
                'generated_at': datetime.utcnow().isoformat(),
                'signal_count': len(signals),
                'batch_id': f"batch_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
            }
            
            # Store in user-specific signals collection
            await user_trading_signals.insert_one(signal_data)
            
        except Exception as e:
            logger.error(f"❌ Error storing signals for user {user_email}: {e}")
    
    async def stop(self):
        """Stop the scheduler gracefully"""
        if self.scheduler and self._running:
            self.scheduler.shutdown()
            self._running = False
            logger.info("🛑 Background scheduler stopped gracefully")
    
    def is_running(self) -> bool:
        """Check if scheduler is running"""
        return self._running


# Global scheduler instance
scheduler_manager = SchedulerManager()


async def start_scheduler():
    """
    Initialize and start the scheduler (async version)
    """
    await scheduler_manager.start()


async def stop_scheduler():
    """
    Stop the scheduler gracefully (async version)
    """
    await scheduler_manager.stop()


def get_scheduler_status() -> dict:
    """
    Get current scheduler status
    """
    return {
        'running': scheduler_manager.is_running(),
        'jobs': len(scheduler_manager.scheduler.get_jobs()) if scheduler_manager.scheduler else 0
    }


# For backward compatibility
def start_scheduler_sync():
    """
    Synchronous version for backward compatibility
    """
    try:
        asyncio.run(start_scheduler())
    except RuntimeError:
        # If there's already a running event loop
        loop = asyncio.get_event_loop()
        loop.create_task(start_scheduler())