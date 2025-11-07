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
    user_signals_collection,
    brokers_collection,
    watchlist_collection
)
from services.upstox import upstox_service

class AutomatedTrading:
    def __init__(self):
        self.watchlist = []
        self.active_strategies = []
    
    async def initialize_trading(self, user_id: str):
        """Initialize trading system for user"""
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
        """Run one complete trading cycle"""
        print(f"🔄 Running trading cycle for user {user_id} at {datetime.now()}")
        
        try:
            # Generate signals for each symbol in watchlist
            for symbol_data in self.watchlist:
                await self.generate_and_execute_signals(symbol_data, user_id)
                
            print(f"✅ Trading cycle completed for user {user_id}")
            
        except Exception as e:
            print(f"❌ Trading cycle error for user {user_id}: {str(e)}")
    
    async def generate_and_execute_signals(self, symbol_data: Dict, user_id: str):
        """Generate signals and execute orders for a symbol"""
        try:
            symbol = symbol_data.get('symbol')
            instrument_token = symbol_data.get('instrument_token')
            
            if not instrument_token:
                print(f"⚠️ No instrument token for {symbol}")
                return
            
            # Get historical data
            historical_data = await self.get_historical_data(instrument_token)
            if historical_data is None or len(historical_data) < 20:
                return
            
            # Generate signals from all active strategies
            signals = []
            for strategy in self.active_strategies:
                strategy_signals = await self.run_strategy(
                    strategy, historical_data, symbol, instrument_token
                )
                signals.extend(strategy_signals)
            
            # Execute the strongest signal
            if signals:
                strongest_signal = max(signals, key=lambda x: x.get('confidence', 0))
                
                # Only execute if confidence is high enough
                if strongest_signal.get('confidence', 0) > 0.7:
                    await self.execute_trading_signal(strongest_signal, user_id)
                else:
                    print(f"⏸️  Signal too weak for {symbol}: {strongest_signal.get('confidence', 0):.2f}")
                    
        except Exception as e:
            print(f"❌ Error processing {symbol_data.get('symbol')}: {str(e)}")
    
    async def run_strategy(self, strategy: Dict, historical_data: pd.DataFrame, 
                          symbol: str, instrument_token: str) -> List[Dict]:
        """Run a specific trading strategy"""
        signals = []
        strategy_type = strategy.get('type', 'mean_reversion')
        
        try:
            if strategy_type == 'mean_reversion':
                signal = await self.mean_reversion_strategy(
                    historical_data, symbol, instrument_token, strategy
                )
                if signal:
                    signals.append(signal)
                    
            elif strategy_type == 'momentum':
                signal = await self.momentum_strategy(
                    historical_data, symbol, instrument_token, strategy
                )
                if signal:
                    signals.append(signal)
                    
            elif strategy_type == 'breakout':
                signal = await self.breakout_strategy(
                    historical_data, symbol, instrument_token, strategy
                )
                if signal:
                    signals.append(signal)
                    
        except Exception as e:
            print(f"❌ Strategy {strategy_type} error for {symbol}: {str(e)}")
        
        return signals
    
    async def mean_reversion_strategy(self, data: pd.DataFrame, symbol: str, 
                                    instrument_token: str, strategy: Dict) -> Optional[Dict]:
        """Mean Reversion Strategy"""
        if len(data) < 20:
            return None
        
        # Calculate indicators
        data['SMA_20'] = data['close'].rolling(window=20).mean()
        data['STD_20'] = data['close'].rolling(window=20).std()
        data['Z_SCORE'] = (data['close'] - data['SMA_20']) / data['STD_20']
        
        current_price = data['close'].iloc[-1]
        current_z = data['Z_SCORE'].iloc[-1]
        
        # Generate signal
        if current_z < -2.0:  # Oversold - BUY
            return {
                'symbol': symbol,
                'instrument_token': instrument_token,
                'action': 'BUY',
                'confidence': min(abs(current_z) / 3.0, 1.0),
                'price': current_price,
                'quantity': strategy.get('quantity', 1),
                'strategy_id': str(strategy['_id']),
                'strategy_name': strategy.get('name', 'Mean Reversion'),
                'timestamp': datetime.now(),
                'metadata': {
                    'z_score': float(current_z),
                    'sma_20': float(data['SMA_20'].iloc[-1]),
                    'type': 'mean_reversion'
                }
            }
        elif current_z > 2.0:  # Overbought - SELL
            return {
                'symbol': symbol,
                'instrument_token': instrument_token,
                'action': 'SELL',
                'confidence': min(current_z / 3.0, 1.0),
                'price': current_price,
                'quantity': strategy.get('quantity', 1),
                'strategy_id': str(strategy['_id']),
                'strategy_name': strategy.get('name', 'Mean Reversion'),
                'timestamp': datetime.now(),
                'metadata': {
                    'z_score': float(current_z),
                    'sma_20': float(data['SMA_20'].iloc[-1]),
                    'type': 'mean_reversion'
                }
            }
        
        return None
    
    async def momentum_strategy(self, data: pd.DataFrame, symbol: str,
                              instrument_token: str, strategy: Dict) -> Optional[Dict]:
        """Momentum Strategy"""
        if len(data) < 50:
            return None
        
        # Calculate indicators
        data['SMA_20'] = data['close'].rolling(window=20).mean()
        data['SMA_50'] = data['close'].rolling(window=50).mean()
        
        current_price = data['close'].iloc[-1]
        sma_20 = data['SMA_20'].iloc[-1]
        sma_50 = data['SMA_50'].iloc[-1]
        
        # Generate signal
        if sma_20 > sma_50:  # Uptrend
            momentum_strength = (sma_20 - sma_50) / sma_50
            return {
                'symbol': symbol,
                'instrument_token': instrument_token,
                'action': 'BUY',
                'confidence': min(momentum_strength * 10, 1.0),
                'price': current_price,
                'quantity': strategy.get('quantity', 1),
                'strategy_id': str(strategy['_id']),
                'strategy_name': strategy.get('name', 'Momentum'),
                'timestamp': datetime.now(),
                'metadata': {
                    'sma_20': float(sma_20),
                    'sma_50': float(sma_50),
                    'type': 'momentum'
                }
            }
        elif sma_20 < sma_50:  # Downtrend
            momentum_strength = (sma_50 - sma_20) / sma_20
            return {
                'symbol': symbol,
                'instrument_token': instrument_token,
                'action': 'SELL',
                'confidence': min(momentum_strength * 10, 1.0),
                'price': current_price,
                'quantity': strategy.get('quantity', 1),
                'strategy_id': str(strategy['_id']),
                'strategy_name': strategy.get('name', 'Momentum'),
                'timestamp': datetime.now(),
                'metadata': {
                    'sma_20': float(sma_20),
                    'sma_50': float(sma_50),
                    'type': 'momentum'
                }
            }
        
        return None
    
    async def breakout_strategy(self, data: pd.DataFrame, symbol: str,
                              instrument_token: str, strategy: Dict) -> Optional[Dict]:
        """Breakout Strategy"""
        if len(data) < 20:
            return None
        
        # Calculate resistance and support
        data['RESISTANCE'] = data['high'].rolling(window=20).max()
        data['SUPPORT'] = data['low'].rolling(window=20).min()
        
        current_price = data['close'].iloc[-1]
        resistance = data['RESISTANCE'].iloc[-2]
        support = data['SUPPORT'].iloc[-2]
        
        # Generate signal
        if current_price > resistance * 1.01:  # Breakout above resistance
            return {
                'symbol': symbol,
                'instrument_token': instrument_token,
                'action': 'BUY',
                'confidence': 0.8,
                'price': current_price,
                'quantity': strategy.get('quantity', 1),
                'strategy_id': str(strategy['_id']),
                'strategy_name': strategy.get('name', 'Breakout'),
                'timestamp': datetime.now(),
                'metadata': {
                    'resistance': float(resistance),
                    'support': float(support),
                    'type': 'breakout'
                }
            }
        elif current_price < support * 0.99:  # Breakdown below support
            return {
                'symbol': symbol,
                'instrument_token': instrument_token,
                'action': 'SELL',
                'confidence': 0.8,
                'price': current_price,
                'quantity': strategy.get('quantity', 1),
                'strategy_id': str(strategy['_id']),
                'strategy_name': strategy.get('name', 'Breakout'),
                'timestamp': datetime.now(),
                'metadata': {
                    'resistance': float(resistance),
                    'support': float(support),
                    'type': 'breakout'
                }
            }
        
        return None
    
    async def execute_trading_signal(self, signal: Dict, user_id: str):
        """Execute a trading signal through Upstox"""
        try:
            # Store signal in database
            signal_record = {
                'user_id': user_id,
                'symbol': signal['symbol'],
                'instrument_token': signal['instrument_token'],
                'action': signal['action'],
                'confidence': signal['confidence'],
                'price': signal['price'],
                'quantity': signal['quantity'],
                'strategy_id': signal['strategy_id'],
                'strategy_name': signal['strategy_name'],
                'timestamp': datetime.now(),
                'metadata': signal['metadata'],
                'status': 'GENERATED'
            }
            
            signal_result = await trading_signals_collection.insert_one(signal_record)
            signal_id = str(signal_result.inserted_id)
            
            # Prepare order for Upstox
            order_data = {
                "quantity": signal['quantity'],
                "product": "D",
                "validity": "DAY",
                "price": 0,  # Market order
                "tag": f"{signal['strategy_name']}_{signal['action']}",
                "instrument_token": signal['instrument_token'],
                "order_type": "MARKET",
                "transaction_type": signal['action'],
                "disclosed_quantity": 0,
                "trigger_price": 0,
                "is_amo": False,
                "slice": True
            }
            
            # Get broker connection and place order
            broker_connection = await brokers_collection.find_one({
                "user_id": user_id,
                "broker_name": "upstox",
                "status": "active"
            })
            
            if not broker_connection:
                print(f"❌ No active Upstox connection for user {user_id}")
                return
            
            # Use your existing order placement logic
            from api.upstox import place_order  # Import your working order function
            
            order_result = await place_order(order_data, user_id)
            
            # Store order record
            order_record = {
                'user_id': user_id,
                'signal_id': signal_id,
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
            
            print(f"✅ Order executed for {signal['symbol']}: {signal['action']} "
                  f"{signal['quantity']} shares - Confidence: {signal['confidence']:.2f}")
            
        except Exception as e:
            print(f"❌ Order execution failed for {signal['symbol']}: {str(e)}")
    
    async def get_historical_data(self, instrument_token: str) -> Optional[pd.DataFrame]:
        """Get historical price data"""
        try:
            # You can implement this using Upstox historical API
            # For now, using yfinance as fallback
            import yfinance as yf
            
            symbol_map = {
                "NSE_EQ|INE002A01018": "RELIANCE.NS",
                "NSE_EQ|INE467B01029": "TCS.NS",
                "NSE_EQ|INE009A01021": "INFY.NS",
                "NSE_EQ|INE001A01036": "HDFC.NS",
            }
            
            yf_symbol = symbol_map.get(instrument_token)
            if yf_symbol:
                ticker = yf.Ticker(yf_symbol)
                hist = ticker.history(period="2mo", interval="15m")
                return hist
                
        except Exception as e:
            print(f"❌ Error fetching data for {instrument_token}: {str(e)}")
        
        return None

# Global instance
automated_trading = AutomatedTrading()