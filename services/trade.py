import datetime 
from fastapi import logger
import yfinance as yf
import pandas as pd
import pytz
from datetime import time as time_only
from typing import Dict, List
def calculate_rsi(series, period=14):
    """Calculate RSI using pure pandas"""
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

# Pure pandas implementation of SMA
def calculate_sma(series, period=20):
    """Calculate Simple Moving Average using pandas"""
    return series.rolling(window=period).mean()

# Check if market is open
def is_market_open():
    """Check if Indian stock market is currently open"""
    ist = pytz.timezone('Asia/Kolkata')
    now_ist = datetime.now(ist)
    
    market_open = time_only(9, 15)
    market_close = time_only(15, 30)
    
    if now_ist.weekday() > 4:  # Saturday or Sunday
        return False
    
    current_time = now_ist.time()
    return market_open <= current_time <= market_close

# Generate trading signal
async def generate_trading_signal(symbol, period, interval):
    """Generate trading signal for a symbol"""
    try:
        # Fetch historical data
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period, interval=interval)
        
        if len(df) < 25:
            return {
                "signal": "HOLD",
                "symbol": symbol,
                "timestamp": datetime.now().isoformat(),
                "reason": "Insufficient data",
                "confidence": 0.0
            }
        
        # Calculate indicators
        df['rsi'] = calculate_rsi(df['Close'], 14)
        df['sma_20'] = calculate_sma(df['Close'], 20)
        
        latest = df.iloc[-1]
        previous = df.iloc[-2]
        
        response = {
            "signal": "HOLD",
            "symbol": symbol,
            "timestamp": datetime.now().isoformat(),
            "price": float(latest['Close']),
            "rsi": float(latest['rsi']) if pd.notna(latest['rsi']) else None,
            "sma_20": float(latest['sma_20']) if pd.notna(latest['sma_20']) else None,
            "reason": "No clear signal",
            "confidence": 0.0
        }
        
        # Buy signal logic
        if (pd.notna(previous['rsi']) and pd.notna(latest['rsi']) and
            previous['rsi'] < 30 and latest['rsi'] > 30 and 
            latest['Close'] > latest['sma_20']):
            response.update({
                "signal": "BUY",
                "reason": "RSI crossed above 30 and price above SMA20",
                "confidence": 0.7
            })
        
        # Sell signal logic
        elif (pd.notna(previous['rsi']) and pd.notna(latest['rsi']) and
              previous['rsi'] > 70 and latest['rsi'] < 70 and 
              latest['Close'] < latest['sma_20']):
            response.update({
                "signal": "SELL", 
                "reason": "RSI crossed below 70 and price below SMA20",
                "confidence": 0.7
            })
        
        return response
        
    except Exception as e:
        logger.error(f"Error generating signal for {symbol}: {str(e)}")
        raise e

# Backtest function
async def run_backtest(symbol, period, interval, rsi_oversold, rsi_overbought, sma_period):
    """Backtest the trading strategy"""
    try:
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period, interval=interval)
        
        df['rsi'] = calculate_rsi(df['Close'], 14)
        df['sma'] = calculate_sma(df['Close'], sma_period)
        
        signals = []
        for i in range(1, len(df)):
            prev = df.iloc[i-1]
            curr = df.iloc[i]
            
            if pd.isna(prev['rsi']) or pd.isna(curr['rsi']) or pd.isna(curr['sma']):
                continue
            
            signal = None
            reason = ""
            
            # Buy signal
            if (prev['rsi'] < rsi_oversold and curr['rsi'] > rsi_oversold and 
                curr['Close'] > curr['sma']):
                signal = "BUY"
                reason = f"RSI crossed above {rsi_oversold}"
            
            # Sell signal  
            elif (prev['rsi'] > rsi_overbought and curr['rsi'] < rsi_overbought and 
                  curr['Close'] < curr['sma']):
                signal = "SELL"
                reason = f"RSI crossed below {rsi_overbought}"
            
            if signal:
                signals.append({
                    "timestamp": curr.name.isoformat(),
                    "signal": signal,
                    "price": float(curr['Close']),
                    "rsi": float(curr['rsi']),
                    "sma": float(curr['sma']),
                    "reason": reason
                })
        
        return {
            "total_signals": len(signals),
            "buy_signals": len([s for s in signals if s['signal'] == "BUY"]),
            "sell_signals": len([s for s in signals if s['signal'] == "SELL"]),
            "trades": signals
        }
        
    except Exception as e:
        logger.error(f"Backtest error for {symbol}: {str(e)}")
        raise e