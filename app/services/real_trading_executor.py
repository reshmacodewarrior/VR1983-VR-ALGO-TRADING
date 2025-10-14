# services/real_trading_executor.py
from datetime import datetime
from typing import Dict
from app.schemas.order import OrderRequest
from database.collections import strategy_orders_collection

class RealTradingExecutor:
    async def execute_real_trade(self, user_id: str, strategy_signal: Dict):
        """Execute real trade through your existing order system"""
        
        # Convert strategy signal to your OrderRequest format
        order_request = OrderRequest(
            symbol=strategy_signal['symbol'],
            transaction_type=strategy_signal['action'].upper(),
            order_type="MARKET",
            quantity=strategy_signal['quantity'],
            product="MIS"
        )
        
        # Use your existing order placement
        order_response = await self._place_order(order_request)
        
        # Link strategy with real order
        strategy_order = {
            'user_id': user_id,
            'strategy_id': strategy_signal['strategy_id'],
            'order_id': order_response.order_id,
            'signal_data': strategy_signal,
            'executed_at': datetime.utcnow()
        }
        
        await strategy_orders_collection.insert_one(strategy_order)
        return order_response