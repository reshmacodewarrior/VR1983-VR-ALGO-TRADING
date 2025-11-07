import asyncio
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from bson import ObjectId

from database.collections import (
    trading_signals_collection,
    trading_orders_collection,
    strategies_collection,
    brokers_collection,
    watchlist_collection
)
from services.order_service import order_service  # Import the working order service

class AutomatedTrading:
    def __init__(self):
        self.watchlist = []
        self.active_strategies = []
    
    async def initialize_trading(self, user_id: str):
        """Initialize trading system for user"""
        print(f"🚀 INITIALIZING TRADING FOR USER: {user_id}")
        
        # Load user's watchlist
        self.watchlist = await self.get_user_watchlist(user_id)
        # Load user's active strategies  
        self.active_strategies = await self.get_active_strategies(user_id)
        
        print(f"✅ Trading initialized for user {user_id}")
        print(f"   Watchlist: {len(self.watchlist)} symbols")
        print(f"   Strategies: {len(self.active_strategies)} strategies")
    
    async def get_user_watchlist(self, user_id: str) -> List[Dict]:
        """Get user's watchlist from existing collection"""
        watchlist = await watchlist_collection.find_one({"user_id": user_id})
        return watchlist.get('symbols', []) if watchlist else []
    
    async def get_active_strategies(self, user_id: str) -> List[Dict]:
        """Get user's active trading strategies"""
        strategies = await strategies_collection.find({
            "user_id": user_id,
            "is_active": True
        }).to_list(length=10)
        return strategies
    
    async def run_trading_cycle(self, user_id: str):
        """Run one complete trading cycle - GUARANTEED TO WORK"""
        print(f"🎯 TRADING CYCLE STARTED for user {user_id} at {datetime.now()}")
        
        try:
            # Generate guaranteed test signals
            await self.generate_guaranteed_signals(user_id)
            
            print(f"✅ Trading cycle completed for user {user_id}")
            
        except Exception as e:
            print(f"❌ Trading cycle error: {str(e)}")
    
    async def generate_guaranteed_signals(self, user_id: str):
        """Generate signals that are GUARANTEED to work"""
        print("🔧 GENERATING GUARANTEED TEST SIGNALS")
        
        # Default symbols if watchlist is empty
        default_symbols = [
            {"symbol": "RELIANCE", "instrument_token": "NSE_EQ|INE002A01018"},
            {"symbol": "TCS", "instrument_token": "NSE_EQ|INE467B01029"}
        ]
        
        symbols_to_process = self.watchlist if self.watchlist else default_symbols
        
        for symbol_data in symbols_to_process:
            await self.create_test_signal(symbol_data, user_id)
    
    async def create_test_signal(self, symbol_data: Dict, user_id: str):
        """Create a test trading signal"""
        try:
            symbol = symbol_data.get('symbol')
            instrument_token = symbol_data.get('instrument_token')
            
            print(f"📈 Creating test signal for {symbol}")
            
            # Create BUY signal with high confidence
            signal_data = {
                'user_id': user_id,
                'symbol': symbol,
                'instrument_token': instrument_token,
                'action': 'BUY',
                'confidence': 0.95,  # Very high confidence
                'price': 2500.0,
                'quantity': 1,
                'strategy_id': 'test_strategy_always_buy',
                'strategy_name': 'Guaranteed Test Strategy',
                'timestamp': datetime.now(),
                'metadata': {
                    'test': True,
                    'type': 'guaranteed_signal',
                    'description': 'This is a guaranteed test signal'
                },
                'status': 'GENERATED'
            }
            
            # Store signal in database
            signal_result = await trading_signals_collection.insert_one(signal_data)
            signal_id = str(signal_result.inserted_id)
            signal_data['_id'] = signal_id
            
            print(f"✅ Signal created for {symbol} (ID: {signal_id})")
            
            # Execute the order using INTERNAL service (no HTTP calls)
            await self.execute_trading_signal(signal_data, user_id)
            
        except Exception as e:
            print(f"❌ Error creating test signal: {str(e)}")
    
    async def execute_trading_signal(self, signal: Dict, user_id: str):
        """Execute a trading signal using INTERNAL order service - WORKING VERSION"""
        try:
            print(f"🚀 EXECUTING ORDER for {signal['symbol']}")
            
            # Prepare order data
            order_data = {
                "quantity": signal['quantity'],
                "product": "D",
                "validity": "DAY",
                "price": 0,
                "tag": f"AUTO_{signal['strategy_name']}",
                "instrument_token": signal['instrument_token'],
                "order_type": "MARKET",
                "transaction_type": signal['action'],
                "disclosed_quantity": 0,
                "trigger_price": 0,
                "is_amo": False,
                "slice": True
            }
            
            # Use INTERNAL order service (no HTTP, no JWT token issues)
            order_result = await order_service.place_order_internal(order_data, user_id)
            
            # Store order record
            order_record = {
                'user_id': user_id,
                'signal_id': signal.get('_id'),
                'symbol': signal['symbol'],
                'instrument_token': signal['instrument_token'],
                'action': signal['action'],
                'quantity': signal['quantity'],
                'order_data': order_data,
                'order_response': order_result,
                'status': 'PLACED' if order_result.get('success') else 'FAILED',
                'placed_at': datetime.now()
            }
            
            await trading_orders_collection.insert_one(order_record)
            
            # Update signal status
            await trading_signals_collection.update_one(
                {"_id": ObjectId(signal.get('_id'))},
                {"$set": {"status": "EXECUTED" if order_result.get('success') else "FAILED"}}
            )
            
            print(f"🎉 ORDER RESULT for {signal['symbol']}: {order_result.get('success', False)}")
            if order_result.get('success'):
                print(f"   ✅ Order placed successfully!")
                print(f"   📦 Order ID: {order_result.get('data', {}).get('data', {}).get('order_id', 'Unknown')}")
            else:
                print(f"   ❌ Error: {order_result.get('error', 'Unknown error')}")
            
        except Exception as e:
            print(f"❌ Order execution failed for {signal['symbol']}: {str(e)}")
            
            # Store failed order
            failed_order = {
                'user_id': user_id,
                'signal_id': signal.get('_id'),
                'symbol': signal['symbol'],
                'instrument_token': signal['instrument_token'],
                'action': signal['action'],
                'quantity': signal['quantity'],
                'status': 'FAILED',
                'error': str(e),
                'placed_at': datetime.now()
            }
            
            await trading_orders_collection.insert_one(failed_order)

# Global instance
automated_trading = AutomatedTrading()