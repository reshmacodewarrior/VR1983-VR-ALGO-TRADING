# services/enhanced_algorithm.py
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional, Tuple
import warnings
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
            stock = yf.Ticker(symbol)
            
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

    def calculate_position_size(self, price: float, confidence: int) -> int:
        """Dynamic position sizing based on confidence"""
        risk_per_trade = 0.02  # Risk 2% of capital per trade
        risk_amount = self.current_capital * risk_per_trade
        
        # Adjust for confidence
        confidence_multiplier = confidence / 100
        position_size = int((risk_amount * confidence_multiplier) / price)
        
        return max(1, min(50, position_size))  # Limit between 1 and 50 shares

    def calculate_exit_prices(self, signal: str, entry_price: float) -> Tuple[float, float]:
        """Calculate stop loss and take profit"""
        if signal == "BUY":
            stop_loss = entry_price * (1 - self.base_stop_loss)
            take_profit = entry_price * (1 + self.base_take_profit)
        else:  # SELL
            stop_loss = entry_price * (1 + self.base_stop_loss)
            take_profit = entry_price * (1 - self.base_take_profit)
        
        return stop_loss, take_profit

    def generate_orders(self, signal: str, symbol: str, price: float, quantity: int, 
                       stop_loss: float, take_profit: float) -> List[Dict]:
        """Generate comprehensive order structure"""
        orders = []
        timestamp = datetime.utcnow().isoformat()
        base_id = f"{symbol}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        
        if signal == "BUY":
            # Main entry order
            orders.append({
                "order_id": f"{base_id}_MARKET_BUY",
                "symbol": symbol,
                "order_type": "MARKET_ORDER",
                "action": "BUY",
                "quantity": quantity,
                "price": "MARKET_PRICE",
                "estimated_price": round(price, 2),
                "timestamp": timestamp
            })
            
            # Stop loss
            orders.append({
                "order_id": f"{base_id}_STOP_LOSS_SELL",
                "symbol": symbol,
                "order_type": "STOP_MARKET_SELL",
                "action": "SELL",
                "quantity": quantity,
                "stop_price": round(stop_loss, 2),
                "timestamp": timestamp
            })
            
            # Take profit
            orders.append({
                "order_id": f"{base_id}_TAKE_PROFIT_SELL",
                "symbol": symbol,
                "order_type": "LIMIT_SELL",
                "action": "SELL",
                "quantity": quantity,
                "limit_price": round(take_profit, 2),
                "timestamp": timestamp
            })
            
        elif signal == "SELL":
            # Main entry order
            orders.append({
                "order_id": f"{base_id}_MARKET_SELL",
                "symbol": symbol,
                "order_type": "MARKET_ORDER",
                "action": "SELL",
                "quantity": quantity,
                "price": "MARKET_PRICE",
                "estimated_price": round(price, 2),
                "timestamp": timestamp
            })
            
            # Stop loss
            orders.append({
                "order_id": f"{base_id}_STOP_LOSS_BUY",
                "symbol": symbol,
                "order_type": "STOP_MARKET_BUY",
                "action": "BUY",
                "quantity": quantity,
                "stop_price": round(stop_loss, 2),
                "timestamp": timestamp
            })
            
            # Take profit
            orders.append({
                "order_id": f"{base_id}_TAKE_PROFIT_BUY",
                "symbol": symbol,
                "order_type": "LIMIT_BUY",
                "action": "BUY",
                "quantity": quantity,
                "limit_price": round(take_profit, 2),
                "timestamp": timestamp
            })
        
        return orders

    def enhanced_trading_algorithm(self, symbol: str) -> Dict:
        """
        Main enhanced trading algorithm
        """
        try:
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
                    "orders": []
                }
            
            # Calculate position and exit prices
            current_price = analysis['price']
            quantity = self.calculate_position_size(current_price, analysis['confidence'])
            stop_loss, take_profit = self.calculate_exit_prices(analysis['signal'], current_price)
            
            # Generate orders
            orders = self.generate_orders(
                analysis['signal'], symbol, current_price, quantity, stop_loss, take_profit
            )
            
            return {
                "signal": analysis['signal'],
                "symbol": symbol,
                "price": round(current_price, 2),
                "quantity": quantity,
                "confidence": analysis['confidence'],
                "strategy": "Enhanced Multi-Timeframe",
                "timeframe": "15min",
                "stop_loss": round(stop_loss, 2),
                "take_profit": round(take_profit, 2),
                "timestamp": datetime.utcnow().isoformat(),
                "indicators": analysis.get('indicators', {}),
                "orders": orders,
                "analysis": {
                    "trend": "Bullish" if analysis['signal'] == 'BUY' else "Bearish",
                    "momentum": "Strong" if analysis['confidence'] > 80 else "Moderate",
                    "risk_level": "Low" if analysis['confidence'] > 75 else "Medium"
                }
            }
            
        except Exception as e:
            logger.error(f"Enhanced algorithm error for {symbol}: {e}")
            return {
                "signal": "HOLD",
                "symbol": symbol,
                "price": 0,
                "confidence": 0,
                "strategy": "Error",
                "timeframe": "15min",
                "timestamp": datetime.utcnow().isoformat(),
                "reason": f"Algorithm error: {e}",
                "orders": []
            }

# Global instance
_algo_instance = EnhancedTradingAlgorithm()

def enhanced_trading_algorithm(symbol: str) -> Dict:
    """Main function for external use"""
    return _algo_instance.enhanced_trading_algorithm(symbol)