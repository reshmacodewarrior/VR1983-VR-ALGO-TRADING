# services/scheduler.py
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
from services.fake_algorithm import fake_secret_algorithm
from app.services.fake_algorithm import fake_secret_algorithm
from app.services.storage import trading_signals
# Set up logging
logger = logging.getLogger(__name__)

# Global variable to store the scheduler instance
scheduler = None



def start_scheduler():
    """
    Initialize and start the background scheduler
    """
    global scheduler
    
    try:
        # Create scheduler instance
        scheduler = BackgroundScheduler()
        
        # Add the job to run every 3 minutes
        scheduler.add_job(
            check_stocks_and_trigger,
            trigger=IntervalTrigger(minutes=30),
            id='algo_trading_checker',
            name='Algorithmic trading signal generator',
            replace_existing=True
        )
        
        # Start the scheduler
        scheduler.start()
        logger.info("✅ Background scheduler started successfully")
        logger.info("📊 Will check for trading signals every 3 minutes")
        
        # Run immediately once on startup
        check_stocks_and_trigger()
        
    except Exception as e:
        logger.error(f"❌ Failed to start scheduler: {e}")
        raise
def check_stocks_and_trigger():
    logger.info("🔍 Background worker: Checking stocks for signals...")
    watched_stocks = ["TATAMOTORS.NS", "RELIANCE.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS"]

    for symbol in watched_stocks:
        decision = fake_secret_algorithm(symbol)

        # fallback: force a debug signal if algo fails
        if not decision:
            decision = {
                "signal": "HOLD",
                "symbol": symbol,
                "price": 0.0,
                "type": "NO_SIGNAL",
                "confidence": 0,
                "timestamp": datetime.utcnow().isoformat()
            }

        trading_signals.append(decision)
        logger.warning(f"📊 Signal added for {symbol}: {decision['signal']}")


def stop_scheduler():
    """
    Stop the background scheduler (useful for testing)
    """
    global scheduler
    if scheduler:
        scheduler.shutdown()
        logger.info("🛑 Background scheduler stopped")