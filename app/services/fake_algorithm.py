# app/services/fake_algorithm.py
import yfinance as yf
import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Add this TradingAlgorithm class at the top
class TradingAlgorithm:
    def __init__(self):
        self.name = "Fake Trading Algorithm"
    
    def simple_moving_average_crossover(self, symbol: str) -> dict:
        """
        A simple SMA crossover strategy
        """
        try:
            stock = yf.Ticker(symbol)
            hist = stock.history(period="1d", interval="1m")
            
            if len(hist) < 20:
                return None
                
            short_window = 5
            long_window = 10
            
            hist['short_sma'] = hist['Close'].rolling(window=short_window).mean()
            hist['long_sma'] = hist['Close'].rolling(window=long_window).mean()
            
            current_close = hist['Close'].iloc[-1]
            current_short_sma = hist['short_sma'].iloc[-1]
            current_long_sma = hist['long_sma'].iloc[-1]
            previous_short_sma = hist['short_sma'].iloc[-2]
            previous_long_sma = hist['long_sma'].iloc[-2]
            
            signal = None
            signal_type = None
            confidence = 0
            
            # BUY Signal
            if previous_short_sma <= previous_long_sma and current_short_sma > current_long_sma:
                signal = "BUY"
                signal_type = "SMA_CROSSOVER_UP"
                confidence = min(100, int((current_short_sma - current_long_sma) / current_long_sma * 1000))
                
            # SELL Signal
            elif previous_short_sma >= previous_long_sma and current_short_sma < current_long_sma:
                signal = "SELL" 
                signal_type = "SMA_CROSSOVER_DOWN"
                confidence = min(100, int((current_long_sma - current_short_sma) / current_long_sma * 1000))
            
            if signal:
                return {
                    "signal": signal,
                    "symbol": symbol,
                    "price": round(current_close, 2),
                    "type": signal_type,
                    "confidence": confidence,
                    "short_sma": round(current_short_sma, 2),
                    "long_sma": round(current_long_sma, 2),
                    "timestamp": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Error in SMA crossover algorithm for {symbol}: {e}")
        
        return None

    def random_volatility_strategy(self, symbol: str) -> dict:
        """
        A random strategy that triggers more often during market hours
        """
        try:
            stock = yf.Ticker(symbol)
            info = stock.info
            current_price = info.get('regularMarketPrice', info.get('currentPrice', 0))
            
            if not current_price:
                return None
                
            now = datetime.now()
            is_market_hours = (9 <= now.hour <= 15) and (now.hour != 15 or now.minute <= 30)
            base_probability = 0.4 if is_market_hours else 0.1
            
            market_sentiment = random.choice(["BULLISH", "BEARISH", "NEUTRAL"])
            if market_sentiment == "BULLISH":
                base_probability += 0.2
            elif market_sentiment == "BEARISH":
                base_probability -= 0.1
            
            if random.random() < base_probability:
                signal = random.choice(["BUY", "SELL"])
                return {
                    "signal": signal,
                    "symbol": symbol,
                    "price": round(current_price, 2),
                    "type": f"RANDOM_{market_sentiment}",
                    "confidence": random.randint(30, 90),
                    "timestamp": datetime.utcnow().isoformat(),
                    "message": f"Random {signal} signal based on {market_sentiment.lower()} market sentiment"
                }
                
        except Exception as e:
            logger.error(f"Error in random volatility strategy for {symbol}: {e}")
        
        return None

    def fake_secret_algorithm(self, symbol: str) -> dict:
        """
        Main fake algorithm that combines multiple strategies
        """
        sma_signal = self.simple_moving_average_crossover(symbol)
        if sma_signal:
            return sma_signal
        
        return self.random_volatility_strategy(symbol)

# Keep your existing functions but make sure they use the class
def fake_secret_algorithm(symbol: str) -> dict:
    """Wrapper function for backward compatibility"""
    algorithm = TradingAlgorithm()
    return algorithm.fake_secret_algorithm(symbol)

# Your existing test function
def test_algorithm():
    """Test the algorithm with popular stocks"""
    test_symbols = ["TATAMOTORS.NS", "RELIANCE.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS"]
    
    print("Testing Fake Algorithm...")
    print("=" * 60)
    
    algorithm = TradingAlgorithm()
    
    for symbol in test_symbols:
        result = algorithm.fake_secret_algorithm(symbol)
        if result:
            print(f"🚀 {result['signal']} {symbol} at ₹{result['price']}")
            print(f"   Type: {result['type']}, Confidence: {result['confidence']}%")
            if 'short_sma' in result:
                print(f"   SMA(5): ₹{result['short_sma']}, SMA(10): ₹{result['long_sma']}")
            print(f"   Time: {result['timestamp']}")
            print("-" * 40)
        else:
            print(f"❌ No signal for {symbol}")
            print("-" * 40)

if __name__ == "__main__":
    test_algorithm()