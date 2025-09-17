import pandas as pd
import yfinance as yf
import time
from datetime import datetime, time as time_only, timedelta
import pytz

# 1. Define the Tata Motors ticker for NSE
TATA_MOTORS_TICKER = "TATAMOTORS.NS"

# 2. Function to fetch historical data using yfinance
def fetch_historical_data(ticker, interval='5m', period='5d'):
    """
    Fetches historical data using yfinance
    """
    try:
        stock = yf.Ticker(ticker)
        df = stock.history(period=period, interval=interval)
        print(f"Fetched {len(df)} records of data")
        return df
    except Exception as e:
        print(f"Error fetching data: {e}")
        return pd.DataFrame()

# 3. Pure Python/Pandas implementation of RSI
def calculate_rsi(series, period=14):
    """
    Calculate RSI using pure pandas
    """
    try:
        delta = series.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    except Exception as e:
        print(f"Error calculating RSI: {e}")
        return pd.Series([None] * len(series), index=series.index)

# 4. Pure Python/Pandas implementation of SMA
def calculate_sma(series, period=20):
    """
    Calculate Simple Moving Average using pandas
    """
    try:
        return series.rolling(window=period).mean()
    except Exception as e:
        print(f"Error calculating SMA: {e}")
        return pd.Series([None] * len(series), index=series.index)

# 5. Calculate indicators without external libraries
def calculate_indicators(df):
    """Calculates RSI and SMA using pure pandas"""
    try:
        df['rsi'] = calculate_rsi(df['Close'], 14)
        df['sma_20'] = calculate_sma(df['Close'], 20)
        print("Indicators calculated successfully")
        return df
    except Exception as e:
        print(f"Error calculating indicators: {e}")
        return df

# 6. Check if market is open
def is_market_open():
    """Check if Indian stock market is currently open"""
    try:
        ist = pytz.timezone('Asia/Kolkata')
        now_ist = datetime.now(ist)
        
        # Market hours: 9:15 AM to 3:30 PM IST, Monday to Friday
        market_open = time_only(9, 15)
        market_close = time_only(15, 30)
        
        if now_ist.weekday() > 4:  # Saturday or Sunday
            print("Market closed: Weekend")
            return False
        
        current_time = now_ist.time()
        is_open = market_open <= current_time <= market_close
        if not is_open:
            print("Market closed: Outside trading hours")
        return is_open
    except Exception as e:
        print(f"Error checking market hours: {e}")
        return False

# 7. Main Algorithm Function
def check_for_signals():
    print("\n" + "="*50)
    print(f"Checking signals at {datetime.now()}")
    print("="*50)
    
    if not is_market_open():
        return "HOLD"
    
    try:
        # Fetch Data - using 15min intervals for better data
        df = fetch_historical_data(TATA_MOTORS_TICKER, interval='15m', period='7d')
        
        if len(df) < 25:
            print(f"Not enough data: only {len(df)} records available")
            return "HOLD"
        
        df = calculate_indicators(df)
        
        # Get the latest completed candle
        latest_candle = df.iloc[-1]
        previous_candle = df.iloc[-2]
        
        print(f"Latest Candle - Time: {latest_candle.name}")
        print(f"Price: ₹{latest_candle['Close']:.2f}")
        print(f"RSI: {latest_candle.get('rsi', 'N/A'):.2f}")
        print(f"SMA20: ₹{latest_candle.get('sma_20', 'N/A'):.2f}")
        
        # Check if indicators were calculated properly
        if pd.isna(latest_candle.get('rsi')) or pd.isna(latest_candle.get('sma_20')):
            print("Indicators not calculated properly. Need more data.")
            return "HOLD"
        
        # Check for BUY Signal
        if (previous_candle['rsi'] < 30 and latest_candle['rsi'] > 30 and 
            latest_candle['Close'] > latest_candle['sma_20']):
            print("🎯 ✅ BUY SIGNAL GENERATED! 🎯")
            print("Reason: RSI crossed above 30 and price above SMA20")
            return "BUY"
        
        # Check for SELL Signal
        elif (previous_candle['rsi'] > 70 and latest_candle['rsi'] < 70 and 
              latest_candle['Close'] < latest_candle['sma_20']):
            print("🎯 ✅ SELL SIGNAL GENERATED! 🎯")
            print("Reason: RSI crossed below 70 and price below SMA20")
            return "SELL"
        
        else:
            print("➡️ No clear trading signal. Holding position.")
            return "HOLD"
            
    except Exception as e:
        print(f"❌ Error in signal generation: {e}")
        return "HOLD"

# 8. Test the algorithm
if __name__ == "__main__":
    print("Starting Tata Motors Intraday Trading Algorithm")
    print("Strategy: RSI Mean Reversion with SMA Filter")
    print("Using pure pandas implementation - no external TA libraries needed")
    print("="*60)
    
    # Test the function once
    signal = check_for_signals()
    print(f"\nFinal Decision: {signal}")
    
    # Uncomment below for continuous running (live trading)
    """
    print("\nStarting continuous monitoring...")
    while True:
        signal = check_for_signals()
        # Sleep for 15 minutes (900 seconds)
        time.sleep(900)
    """