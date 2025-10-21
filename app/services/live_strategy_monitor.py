# services/live_strategy_monitor.py
import asyncio
from datetime import datetime
from typing import Dict


class LiveStrategyMonitor:
    async def start_live_testing(self, strategy_id: str, user_id: str):
        """Start live paper trading for a strategy"""
        while True:
            # Get real-time market data
            market_data = await self._get_live_data()
            
            # Execute user's strategy
            signals = await self._execute_strategy_live(strategy_id, market_data)
            
            # Execute paper trades
            for signal in signals:
                await self._execute_paper_trade(user_id, signal)
            
            await asyncio.sleep(60)  # Check every minute
    
    async def _execute_paper_trade(self, user_id: str, signal: Dict):
        """Execute paper trade (virtual execution)"""
        paper_trade = {
            'user_id': user_id,
            'strategy_id': signal['strategy_id'],
            'symbol': signal['symbol'],
            'action': signal['action'],
            'price': signal['price'],
            'quantity': signal['quantity'],
            'timestamp': datetime.utcnow(),
            'type': 'paper_trade'
        }
        
        # Store in paper trades collection
        await self.paper_trades_collection.insert_one(paper_trade)
    
    