import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import time

from services.automated_trading import automated_trading
from database.collections import users_collection

class TradingScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.is_running = False
    
    async def start_scheduler(self):
        """Start the 15-minute trading scheduler"""
        if self.is_running:
            print("⚠️ Scheduler is already running")
            return
        
        # Run every 15 minutes
        trigger = IntervalTrigger(minutes=15)
        
        self.scheduler.add_job(
            self.run_all_users_trading,
            trigger=trigger,
            id='trading_cycle',
            name='15min_trading_cycle',
            replace_existing=True
        )
        
        self.scheduler.start()
        self.is_running = True
        
        print("✅ Automated trading scheduler started!")
        print("   📅 Running every 15 minutes")
        print("   👥 Processing all users with active strategies")
    
    async def stop_scheduler(self):
        """Stop the trading scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            self.is_running = False
            print("🛑 Trading scheduler stopped")
    
    async def run_all_users_trading(self):
        """Run trading cycle for all active users"""
        print(f"\n🎯 Automated Trading Cycle Started at {datetime.now()}")
        
        try:
            # Get all users with active Upstox connections
            active_users = await users_collection.find({
                "broker_connected": True,
                "broker_name": "upstox"
            }).to_list(length=None)
            
            print(f"👥 Found {len(active_users)} active users")
            
            for user in active_users:
                user_id = str(user['_id'])
                await self.process_user_trading(user_id)
                
            print(f"✅ Trading cycle completed at {datetime.now()}")
            
        except Exception as e:
            print(f"❌ Trading cycle error: {str(e)}")
    
    async def process_user_trading(self, user_id: str):
        """Process trading for a single user"""
        try:
            # Initialize trading for user
            await automated_trading.initialize_trading(user_id)
            
            # Run trading cycle
            await automated_trading.run_trading_cycle(user_id)
            
        except Exception as e:
            print(f"❌ User {user_id} trading error: {str(e)}")
    
    async def run_manual_cycle(self, user_id: str):
        """Run a manual trading cycle (for testing)"""
        print(f"🔧 Manual trading cycle for user {user_id}")
        await self.process_user_trading(user_id)

# Global scheduler instance
trading_scheduler = TradingScheduler()