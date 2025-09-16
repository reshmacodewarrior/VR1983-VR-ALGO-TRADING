# fake_algorithm.py
import yfinance as yf
import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

def simple_moving_average_crossover(symbol: str) -> dict:
    """
    A simple SMA crossover strategy that tends to trigger signals regularly.
    Uses aggressive settings to ensure frequent triggers for demo purposes.
    """
    try:
        # Download historical data - using very short periods for frequent signals
        stock = yf.Ticker(symbol)
        hist = stock.history(period="7d", interval="15m")  # 15-min intervals for last 7 days
        
        if len(hist) < 20:  # Need enough data points
            return None
            
        # Calculate SMAs - using very short windows for frequent crossovers
        short_window = 5    # 5-period SMA (very sensitive)
        long_window = 10    # 10-period SMA
        
        hist['short_sma'] = hist['Close'].rolling(window=short_window).mean()
        hist['long_sma'] = hist['Close'].rolling(window=long_window).mean()
        
        # Get the latest values
        current_close = hist['Close'].iloc[-1]
        current_short_sma = hist['short_sma'].iloc[-1]
        current_long_sma = hist['long_sma'].iloc[-1]
        previous_short_sma = hist['short_sma'].iloc[-2]
        previous_long_sma = hist['long_sma'].iloc[-2]
        
        # Generate signals based on crossover
        signal = None
        signal_type = None
        confidence = 0
        
        # BUY Signal: Short SMA crosses above Long SMA
        if previous_short_sma <= previous_long_sma and current_short_sma > current_long_sma:
            signal = "BUY"
            signal_type = "SMA_CROSSOVER_UP"
            # Calculate confidence based on how much it crossed
            confidence = min(100, int((current_short_sma - current_long_sma) / current_long_sma * 1000))
            
        # SELL Signal: Short SMA crosses below Long SMA
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

def random_volatility_strategy(symbol: str) -> dict:
    """
    A completely random strategy that triggers more often during market hours.
    Perfect for ensuring regular demo signals.
    """
    try:
        stock = yf.Ticker(symbol)
        info = stock.info
        current_price = info.get('regularMarketPrice', info.get('currentPrice', 0))
        
        if not current_price:
            return None
            
        # More likely to trigger during market hours (9 AM to 3:30 PM IST)
        now = datetime.now()
        is_market_hours = (9 <= now.hour <= 15) and (now.hour != 15 or now.minute <= 30)
        
        # Base probability (higher during market hours)
        base_probability = 0.4 if is_market_hours else 0.1  # 40% vs 10% chance
        
        # Add some random market sentiment
        market_sentiment = random.choice(["BULLISH", "BEARISH", "NEUTRAL"])
        if market_sentiment == "BULLISH":
            base_probability += 0.2
        elif market_sentiment == "BEARISH":
            base_probability -= 0.1
        
        # Random trigger
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

def fake_secret_algorithm(symbol: str) -> dict:
    """
    Main fake algorithm that combines multiple strategies.
    Tries SMA crossover first, falls back to random strategy if no signal.
    """
    # Try SMA crossover first
    sma_signal = simple_moving_average_crossover(symbol)
    if sma_signal:
        return sma_signal
    
    # If no SMA signal, try random strategy (higher chance during market hours)
    return random_volatility_strategy(symbol)

# Example usage and test function
def test_algorithm():
    """Test the algorithm with popular stocks"""
    test_symbols = ["TATAMOTORS.NS", "RELIANCE.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS"]
    
    print("Testing Fake Algorithm...")
    print("=" * 60)
    
    for symbol in test_symbols:
        result = fake_secret_algorithm(symbol)
        if result:
            print(f"🚀 {result['signal']} {symbol} at ₹{result['price']}")
            print(f"   Type: {result['type']}, Confidence: {result['confidence']}%")
            if 'short_sma' in result:
                print(f"   SMA({result.get('short_period', 5)}): ₹{result['short_sma']}, SMA({result.get('long_period', 10)}): ₹{result['long_sma']}")
            print(f"   Time: {result['timestamp']}")
            print("-" * 40)
        else:
            print(f"❌ No signal for {symbol}")
            print("-" * 40)

if __name__ == "__main__":
    # Test the algorithm
    test_algorithm()