# services/price_level_algorithm.py
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
import json
import talib
from typing import Dict, List, Tuple

logger = logging.getLogger(__name__)

def generate_dynamic_price_levels(symbol: str) -> Dict:
    """
    Generate dynamic price levels using multiple technical indicators:
    1. Pivot Points (Support/Resistance)
    2. Fibonacci Retracement Levels
    3. Moving Average Support/Resistance
    4. Bollinger Bands
    5. Recent Highs/Lows
    6. Volume Weighted Average Price (VWAP)
    """
    try:
        # Download historical data for different timeframes
        stock = yf.Ticker(symbol)
        
        # Get data for multiple timeframes to capture different perspectives
        daily_data = stock.history(period="2mo", interval="1d")
        hourly_data = stock.history(period="10d", interval="1h")
        
        if len(daily_data) < 20 or len(hourly_data) < 20:
            logger.warning(f"Insufficient data for {symbol}")
            return None
        
        # Get current price
        current_price = daily_data['Close'].iloc[-1]
        
        # Calculate all possible levels from different methods
        all_levels = []
        
        # 1. Pivot Points
        pivot_levels = calculate_pivot_points(daily_data)
        all_levels.extend(pivot_levels)
        
        # 2. Fibonacci Retracement
        fib_levels = calculate_fibonacci_levels(daily_data)
        all_levels.extend(fib_levels)
        
        # 3. Moving Average Levels
        ma_levels = calculate_ma_levels(daily_data)
        all_levels.extend(ma_levels)
        
        # 4. Bollinger Bands
        bb_levels = calculate_bollinger_bands(daily_data)
        all_levels.extend(bb_levels)
        
        # 5. Recent Highs/Lows
        recent_levels = calculate_recent_highs_lows(daily_data)
        all_levels.extend(recent_levels)
        
        # 6. VWAP
        vwap_levels = calculate_vwap_levels(hourly_data)
        all_levels.extend(vwap_levels)
        
        # Filter and select the most significant levels
        significant_levels = select_significant_levels(all_levels, current_price)
        
        # Generate the levels dictionary
        levels = {
            "symbol": symbol,
            "timestamp": datetime.utcnow().isoformat(),
            "current_price": round(current_price, 2),
            "levels": significant_levels
        }
        
        return levels
        
    except Exception as e:
        logger.error(f"Error generating price levels for {symbol}: {e}")
        return None

def calculate_pivot_points(data: pd.DataFrame) -> List[Dict]:
    """Calculate standard pivot point support and resistance levels"""
    latest = data.iloc[-1]
    pivot = (latest['High'] + latest['Low'] + latest['Close']) / 3
    r1 = (2 * pivot) - latest['Low']
    s1 = (2 * pivot) - latest['High']
    r2 = pivot + (latest['High'] - latest['Low'])
    s2 = pivot - (latest['High'] - latest['Low'])
    r3 = latest['High'] + 2 * (pivot - latest['Low'])
    s3 = latest['Low'] - 2 * (latest['High'] - pivot)
    
    return [
        {"id": 1, "name": "Pivot Point", "price": round(pivot, 2), "type": "pivot", "strength": 0.7, "color": "#FFA500"},
        {"id": 2, "name": "Support 1", "price": round(s1, 2), "type": "support", "strength": 0.8, "color": "#00FF00"},
        {"id": 3, "name": "Support 2", "price": round(s2, 2), "type": "support", "strength": 0.6, "color": "#00CC00"},
        {"id": 4, "name": "Support 3", "price": round(s3, 2), "type": "support", "strength": 0.4, "color": "#008800"},
        {"id": 5, "name": "Resistance 1", "price": round(r1, 2), "type": "resistance", "strength": 0.8, "color": "#FF0000"},
        {"id": 6, "name": "Resistance 2", "price": round(r2, 2), "type": "resistance", "strength": 0.6, "color": "#CC0000"},
        {"id": 7, "name": "Resistance 3", "price": round(r3, 2), "type": "resistance", "strength": 0.4, "color": "#880000"}
    ]

def calculate_fibonacci_levels(data: pd.DataFrame) -> List[Dict]:
    """Calculate Fibonacci retracement levels"""
    high = data['High'].max()
    low = data['Low'].min()
    diff = high - low
    
    fib_levels = [0.236, 0.382, 0.5, 0.618, 0.786]
    fib_prices = [high - level * diff for level in fib_levels]
    
    levels = []
    for i, (level, price) in enumerate(zip(fib_levels, fib_prices)):
        levels.append({
            "id": 10 + i,
            "name": f"Fib {int(level*100)}%",
            "price": round(price, 2),
            "type": "fibonacci",
            "strength": 0.7 - (i * 0.1),
            "color": "#6A0DAD"  # Purple
        })
    
    return levels

def calculate_ma_levels(data: pd.DataFrame) -> List[Dict]:
    """Calculate moving average support/resistance levels"""
    ma_periods = [20, 50, 100, 200]
    levels = []
    
    for i, period in enumerate(ma_periods):
        ma = talib.SMA(data['Close'], timeperiod=period)
        if not np.isnan(ma.iloc[-1]):
            levels.append({
                "id": 20 + i,
                "name": f"MA{period}",
                "price": round(ma.iloc[-1], 2),
                "type": "moving_average",
                "strength": 0.8 - (i * 0.15),
                "color": "#FF69B4" if period <= 50 else "#FF1493"  # Pink shades
            })
    
    return levels

def calculate_bollinger_bands(data: pd.DataFrame) -> List[Dict]:
    """Calculate Bollinger Band levels"""
    bb_upper, bb_middle, bb_lower = talib.BBANDS(data['Close'], timeperiod=20)
    
    return [
        {
            "id": 30,
            "name": "BB Upper",
            "price": round(bb_upper.iloc[-1], 2),
            "type": "resistance",
            "strength": 0.7,
            "color": "#4682B4"  # Steel blue
        },
        {
            "id": 31,
            "name": "BB Middle",
            "price": round(bb_middle.iloc[-1], 2),
            "type": "pivot",
            "strength": 0.5,
            "color": "#87CEEB"  # Sky blue
        },
        {
            "id": 32,
            "name": "BB Lower",
            "price": round(bb_lower.iloc[-1], 2),
            "type": "support",
            "strength": 0.7,
            "color": "#4682B4"  # Steel blue
        }
    ]

def calculate_recent_highs_lows(data: pd.DataFrame) -> List[Dict]:
    """Calculate recent significant highs and lows"""
    # Recent high (last 10 periods)
    recent_high = data['High'].rolling(window=10).max().iloc[-1]
    # Recent low (last 10 periods)
    recent_low = data['Low'].rolling(window=10).min().iloc[-1]
    
    return [
        {
            "id": 40,
            "name": "Recent High",
            "price": round(recent_high, 2),
            "type": "resistance",
            "strength": 0.8,
            "color": "#DC143C"  # Crimson
        },
        {
            "id": 41,
            "name": "Recent Low",
            "price": round(recent_low, 2),
            "type": "support",
            "strength": 0.8,
            "color": "#32CD32"  # Lime green
        }
    ]

def calculate_vwap_levels(data: pd.DataFrame) -> List[Dict]:
    """Calculate Volume Weighted Average Price"""
    typical_price = (data['High'] + data['Low'] + data['Close']) / 3
    vwap = (typical_price * data['Volume']).cumsum() / data['Volume'].cumsum()
    
    return [
        {
            "id": 50,
            "name": "VWAP",
            "price": round(vwap.iloc[-1], 2),
            "type": "pivot",
            "strength": 0.9,
            "color": "#FFD700"  # Gold
        }
    ]

def select_significant_levels(all_levels: List[Dict], current_price: float) -> List[Dict]:
    """Select the most significant levels, avoiding duplicates and clustering"""
    # Sort by strength (descending)
    all_levels.sort(key=lambda x: x['strength'], reverse=True)
    
    # Group nearby levels (within 0.5% of price)
    significant_levels = []
    price_tolerance = current_price * 0.005  # 0.5% tolerance
    
    for level in all_levels:
        # Check if this level is too close to any already selected level
        is_duplicate = False
        for selected in significant_levels:
            if abs(level['price'] - selected['price']) <= price_tolerance:
                # Keep the stronger level
                if level['strength'] > selected['strength']:
                    significant_levels.remove(selected)
                else:
                    is_duplicate = True
                break
        
        if not is_duplicate and len(significant_levels) < 10:  # Limit to 10 levels
            significant_levels.append(level)
    
    return significant_levels[:10]  # Return top 10 levels

# Trading signal generator based on price levels
def generate_trading_signals(symbol: str, price_levels: Dict) -> Dict:
    """Generate trading signals based on proximity to price levels"""
    if not price_levels or 'levels' not in price_levels:
        return None
    
    current_price = price_levels['current_price']
    levels = price_levels['levels']
    
    # Find the closest support and resistance levels
    closest_support = None
    closest_resistance = None
    support_distance = float('inf')
    resistance_distance = float('inf')
    
    for level in levels:
        distance = abs(level['price'] - current_price)
        if level['type'] == 'support' and distance < support_distance:
            closest_support = level
            support_distance = distance
        elif level['type'] in ['resistance', 'fibonacci'] and distance < resistance_distance:
            closest_resistance = level
            resistance_distance = distance
    
    # Determine signal based on proximity to levels
    signal = "HOLD"
    signal_type = "NO_ACTION"
    confidence = 0
    threshold_percentage = 0.01  # 1% threshold for action
    
    if closest_support and (support_distance / current_price) <= threshold_percentage:
        signal = "BUY"
        signal_type = "SUPPORT_TOUCH"
        confidence = int((1 - (support_distance / current_price)) * 100)
    elif closest_resistance and (resistance_distance / current_price) <= threshold_percentage:
        signal = "SELL"
        signal_type = "RESISTANCE_TOUCH"
        confidence = int((1 - (resistance_distance / current_price)) * 100)
    
    return {
        "signal": signal,
        "symbol": symbol,
        "price": round(current_price, 2),
        "type": signal_type,
        "confidence": min(confidence, 100),
        "timestamp": datetime.utcnow().isoformat(),
        "levels": price_levels
    }