import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional, Tuple
import warnings
import asyncio
from database.collections import brokers_collection
from app.schemas.user import UserInDB

warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class EnhancedTradingAlgorithm:
    def __init__(self, initial_capital: float = 100000):
        self.initial_capital = initial_capital
        self.current_capital = initial_capital
        
        # Dynamic risk management
        self.base_stop_loss = 0.018  # 1.8%
        self.base_take_profit = 0.036  # 3.6%
        
    def calculate_sma(self, data: pd.Series, window: int) -> pd.Series:
        """Simple Moving Average"""
        return data.rolling(window=window).mean()
    
    def calculate_ema(self, data: pd.Series, window: int) -> pd.Series:
        """Exponential Moving Average"""
        return data.ewm(span=window, adjust=False).mean()
    
    def calculate_rsi(self, data: pd.Series, window: int = 14) -> pd.Series:
        """Relative Strength Index"""
        delta = data.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def calculate_macd(self, data: pd.Series) -> tuple:
        """MACD Indicator"""
        ema_12 = self.calculate_ema(data, 12)
        ema_26 = self.calculate_ema(data, 26)
        macd = ema_12 - ema_26
        signal = self.calculate_ema(macd, 9)
        histogram = macd - signal
        return macd, signal, histogram
    
    def calculate_bollinger_bands(self, data: pd.Series, window: int = 20) -> tuple:
        """Bollinger Bands"""
        sma = self.calculate_sma(data, window)
        std = data.rolling(window=window).std()
        upper_band = sma + (std * 2)
        lower_band = sma - (std * 2)
        return upper_band, sma, lower_band

    def get_enhanced_price_data(self, symbol: str, period: str = "5d", interval: str = "15m") -> Optional[Dict]:
        """Get comprehensive price data with multiple fallbacks"""
        try:
            # Convert symbol to yfinance format (e.g., "RELIANCE" -> "RELIANCE.NS")
            yf_symbol = f"{symbol}.NS"
            stock = yf.Ticker(yf_symbol)
            
            # Try 15-minute data first
            hist = stock.history(period=period, interval=interval)
            
            if len(hist) > 20:
                current_price = hist['Close'].iloc[-1]
                return {
                    'price': current_price,
                    'data': hist,
                    'reliable': True,
                    'volume': hist['Volume'].iloc[-1] if 'Volume' in hist else 0
                }
            
            # Fallback to 1-hour data
            hist = stock.history(period="5d", interval="1h")
            if len(hist) > 10:
                current_price = hist['Close'].iloc[-1]
                return {
                    'price': current_price,
                    'data': hist,
                    'reliable': True,
                    'volume': hist['Volume'].iloc[-1] if 'Volume' in hist else 0
                }
            
            # Final fallback
            info = stock.info
            current_price = info.get('regularMarketPrice', 
                                   info.get('currentPrice', 
                                   info.get('previousClose', 0)))
            
            if current_price and current_price > 0:
                return {
                    'price': current_price,
                    'data': None,
                    'reliable': False,
                    'volume': 0
                }
                
        except Exception as e:
            logger.warning(f"Price data error for {symbol}: {e}")
        
        return None

    def calculate_technical_indicators(self, hist_data: pd.DataFrame) -> Dict:
        """Calculate multiple technical indicators"""
        if hist_data is None or len(hist_data) < 20:
            return {}
        
        try:
            closes = hist_data['Close']
            
            indicators = {}
            
            # Trend Indicators
            indicators['sma_20'] = self.calculate_sma(closes, 20).iloc[-1]
            indicators['sma_50'] = self.calculate_sma(closes, 50).iloc[-1] if len(closes) >= 50 else closes.iloc[-1]
            indicators['ema_12'] = self.calculate_ema(closes, 12).iloc[-1]
            indicators['ema_26'] = self.calculate_ema(closes, 26).iloc[-1]
            
            # Momentum Indicators
            indicators['rsi'] = self.calculate_rsi(closes, 14).iloc[-1]
            macd, macd_signal, macd_hist = self.calculate_macd(closes)
            indicators['macd'] = macd.iloc[-1]
            indicators['macd_signal'] = macd_signal.iloc[-1]
            indicators['macd_hist'] = macd_hist.iloc[-1]
            
            # Volatility Indicators
            bb_upper, bb_middle, bb_lower = self.calculate_bollinger_bands(closes, 20)
            indicators['bb_upper'] = bb_upper.iloc[-1]
            indicators['bb_middle'] = bb_middle.iloc[-1]
            indicators['bb_lower'] = bb_lower.iloc[-1]
            
            # Volume Analysis
            if 'Volume' in hist_data:
                volume = hist_data['Volume']
                indicators['volume_sma'] = self.calculate_sma(volume, 20).iloc[-1]
                indicators['current_volume'] = volume.iloc[-1]
                indicators['volume_ratio'] = volume.iloc[-1] / indicators['volume_sma'] if indicators['volume_sma'] > 0 else 1
            
            return indicators
            
        except Exception as e:
            logger.warning(f"Technical indicator calculation error: {e}")
            return {}

    def multi_timeframe_analysis(self, symbol: str) -> Dict:
        """Analyze multiple timeframes for better signal confirmation"""
        try:
            price_data = self.get_enhanced_price_data(symbol)
            if not price_data or not price_data['reliable']:
                return {"signal": "HOLD", "confidence": 0, "reason": "Insufficient data"}
            
            current_price = price_data['price']
            hist_data = price_data['data']
            
            # Calculate technical indicators
            indicators = self.calculate_technical_indicators(hist_data)
            if not indicators:
                return {"signal": "HOLD", "confidence": 0, "reason": "Indicator calculation failed"}
            
            # Multi-factor scoring system
            buy_score = 0
            sell_score = 0
            max_score = 100  # Total possible score
            
            # 1. Trend Analysis (30 points)
            if indicators['sma_20'] > indicators['sma_50']:
                buy_score += 30
            else:
                sell_score += 30
            
            # 2. RSI Momentum (25 points)
            if indicators['rsi'] < 30:  # Oversold
                buy_score += 25
            elif indicators['rsi'] > 70:  # Overbought
                sell_score += 25
            # If RSI between 30-70, no points awarded
            
            # 3. MACD Signal (25 points)
            if indicators['macd'] > indicators['macd_signal']:
                buy_score += 25
            else:
                sell_score += 25
            
            # 4. Bollinger Bands Position (20 points)
            if current_price <= indicators['bb_lower'] * 1.02:  # Near lower band
                buy_score += 20
            elif current_price >= indicators['bb_upper'] * 0.98:  # Near upper band
                sell_score += 20
            
            # Determine signal and confidence
            if buy_score > sell_score:
                signal = "BUY"
                confidence = min(95, int((buy_score / max_score) * 100))
            elif sell_score > buy_score:
                signal = "SELL" 
                confidence = min(95, int((sell_score / max_score) * 100))
            else:
                signal = "HOLD"
                confidence = 0
            
            # Volume confirmation boost
            if 'volume_ratio' in indicators and indicators['volume_ratio'] > 1.2:
                confidence = min(95, confidence + 10)
            
            return {
                "signal": signal,
                "confidence": confidence,
                "indicators": indicators,
                "price": current_price
            }
            
        except Exception as e:
            logger.error(f"Multi-timeframe analysis error for {symbol}: {e}")
            return {"signal": "HOLD", "confidence": 0, "reason": f"Analysis error: {e}"}

    def calculate_position_size(self, price: float, confidence: int, user_capital: float = None) -> int:
        """Dynamic position sizing based on confidence"""
        if user_capital is None:
            user_capital = self.current_capital
            
        risk_per_trade = 0.02  # Risk 2% of capital per trade
        risk_amount = user_capital * risk_per_trade
        
        # Adjust for confidence
        confidence_multiplier = confidence / 100
        position_size = int((risk_amount * confidence_multiplier) / price)
        
        return max(1, min(100, position_size))  # Limit between 1 and 100 shares

    def calculate_exit_prices(self, signal: str, entry_price: float) -> Tuple[float, float]:
        """Calculate stop loss and take profit"""
        if signal == "BUY":
            stop_loss = entry_price * (1 - self.base_stop_loss)
            take_profit = entry_price * (1 + self.base_take_profit)
        else:  # SELL
            stop_loss = entry_price * (1 + self.base_stop_loss)
            take_profit = entry_price * (1 - self.base_take_profit)
        
        return stop_loss, take_profit

    def generate_upstox_orders(self, signal: str, symbol: str, quantity: int) -> List[Dict]:
        """Generate Upstox-compatible order structure"""
        orders = []
        timestamp = datetime.utcnow().isoformat()
        correlation_id = f"{symbol}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        
        # Map symbol to Upstox instrument token (you'll need to implement this mapping)
        instrument_token = self.map_symbol_to_instrument_token(symbol)
        
        if signal == "BUY":
            # Main market buy order
            orders.append({
                "correlation_id": f"{correlation_id}_BUY",
                "quantity": quantity,
                "product": "D",
                "validity": "DAY",
                "price": 0,
                "tag": "algo_buy",
                "instrument_token": instrument_token,
                "order_type": "MARKET",
                "transaction_type": "BUY",
                "disclosed_quantity": 0,
                "trigger_price": 0,
                "is_amo": False,
                "slice": True
            })
            
        elif signal == "SELL":
            # Main market sell order
            orders.append({
                "correlation_id": f"{correlation_id}_SELL",
                "quantity": quantity,
                "product": "D",
                "validity": "DAY",
                "price": 0,
                "tag": "algo_sell",
                "instrument_token": instrument_token,
                "order_type": "MARKET",
                "transaction_type": "SELL",
                "disclosed_quantity": 0,
                "trigger_price": 0,
                "is_amo": False,
                "slice": True
            })
        
        return orders

    def map_symbol_to_instrument_token(self, symbol: str) -> str:
        """
        Map stock symbol to Upstox instrument token
        You need to implement proper mapping based on your instrument list
        """
        # Example mapping - you should replace this with actual mapping
        token_mapping = {
            "RELIANCE": "NSE_EQ|INE002A01018",
            "TCS": "NSE_EQ|INE467B01029",
            "INFY": "NSE_EQ|INE009A01021",
            "HDFC": "NSE_EQ|INE001A01036",
            "ICICIBANK": "NSE_EQ|INE090A01021"
        }
        
        return token_mapping.get(symbol, f"NSE_EQ|{symbol}")

    async def place_upstox_orders(self, user_id: str, orders: List[Dict]) -> Dict:
        """Place orders on Upstox for a specific user"""
        try:
            # Get user's Upstox connection
            broker_connection = await brokers_collection.find_one({
                "user_id": user_id,
                "broker_name": "upstox",
                "status": "active"
            })
            
            if not broker_connection:
                return {"success": False, "error": "Upstox connection not found"}
            
            access_token = broker_connection.get('access_token')
            if not access_token:
                return {"success": False, "error": "No access token found"}
            
            # Prepare headers for Upstox API
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': f'Bearer {access_token}'
            }
            
            # Place orders using Upstox multi-order API
            import requests
            response = requests.post(
                'https://api.upstox.com/v2/order/multi/place',
                headers=headers,
                json=orders,
                timeout=30
            )
            
            if response.status_code == 200:
                order_responses = response.json()
                
                # Store order in database
                order_record = {
                    "user_id": user_id,
                    "broker_name": "upstox",
                    "orders_placed": orders,
                    "api_response": order_responses,
                    "timestamp": datetime.utcnow(),
                    "status": "placed"
                }
                
                await brokers_collection.insert_one(order_record)
                
                return {
                    "success": True,
                    "message": f"Successfully placed {len(orders)} orders",
                    "data": order_responses
                }
            else:
                error_detail = f"Upstox API error: {response.status_code} - {response.text}"
                logger.error(f"❌ Order placement failed: {error_detail}")
                return {"success": False, "error": error_detail}
                
        except Exception as e:
            logger.error(f"❌ Order placement error: {str(e)}")
            return {"success": False, "error": str(e)}

    async def enhanced_trading_algorithm_with_auto_order(self, symbol: str, user_data: dict) -> Dict:
        """
        Main enhanced trading algorithm with automatic order placement
        """
        try:
            user_id = str(user_data['_id'])
            user_email = user_data.get('email', 'unknown')
            
            # Get multi-timeframe analysis
            analysis = self.multi_timeframe_analysis(symbol)
            
            if analysis['signal'] == 'HOLD' or analysis['confidence'] < 60:
                return {
                    "signal": "HOLD",
                    "symbol": symbol,
                    "price": 0,
                    "confidence": analysis['confidence'],
                    "strategy": "Multi-Timeframe Analysis",
                    "timeframe": "15min",
                    "timestamp": datetime.utcnow().isoformat(),
                    "reason": analysis.get('reason', 'Low confidence'),
                    "orders_placed": False,
                    "order_response": None
                }
            
            # Calculate position and generate Upstox orders
            current_price = analysis['price']
            quantity = self.calculate_position_size(current_price, analysis['confidence'])
            upstox_orders = self.generate_upstox_orders(analysis['signal'], symbol, quantity)
            
            # Place orders automatically
            order_result = await self.place_upstox_orders(user_id, upstox_orders)
            
            # Enhanced logging
            if order_result.get('success'):
                logger.warning(
                    f"🚀 AUTO ORDER EXECUTED for {user_email}: "
                    f"{analysis['signal']} {quantity} shares of {symbol} @ ~{current_price:.2f} | "
                    f"Confidence: {analysis['confidence']}%"
                )
            else:
                logger.error(
                    f"❌ AUTO ORDER FAILED for {user_email}: "
                    f"{analysis['signal']} {symbol} | Error: {order_result.get('error')}"
                )
            
            return {
                "signal": analysis['signal'],
                "symbol": symbol,
                "price": round(current_price, 2),
                "quantity": quantity,
                "confidence": analysis['confidence'],
                "strategy": "Enhanced Multi-Timeframe",
                "timeframe": "15min",
                "timestamp": datetime.utcnow().isoformat(),
                "indicators": analysis.get('indicators', {}),
                "upstox_orders": upstox_orders,
                "orders_placed": order_result.get('success', False),
                "order_response": order_result,
                "user_email": user_email,
                "analysis": {
                    "trend": "Bullish" if analysis['signal'] == 'BUY' else "Bearish",
                    "momentum": "Strong" if analysis['confidence'] > 80 else "Moderate",
                    "risk_level": "Low" if analysis['confidence'] > 75 else "Medium"
                }
            }
            
        except Exception as e:
            logger.error(f"💥 Enhanced algorithm with auto-order error for {symbol}: {e}")
            return {
                "signal": "HOLD",
                "symbol": symbol,
                "price": 0,
                "confidence": 0,
                "strategy": "Error",
                "timeframe": "15min",
                "timestamp": datetime.utcnow().isoformat(),
                "reason": f"Algorithm error: {e}",
                "orders_placed": False,
                "order_response": {"error": str(e)}
            }

# Global instance
_algo_instance = EnhancedTradingAlgorithm()

async def enhanced_trading_algorithm_with_auto_order(symbol: str, user_data: dict) -> Dict:
    """Main function for external use with auto order placement"""
    return await _algo_instance.enhanced_trading_algorithm_with_auto_order(symbol, user_data)

def enhanced_trading_analysis_only(symbol: str) -> Dict:
    """Analysis only without order placement"""
    return _algo_instance.enhanced_trading_algorithm(symbol)