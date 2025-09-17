from typing import Dict, Optional, List, Any
from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from fastapi.responses import JSONResponse
from services.market import stock_api,logger
import yfinance as yf
import asyncio
import pandas as pd
import logging
import numpy as np
from pydantic import BaseModel


router = APIRouter(prefix="/api", tags=["market"])

@router.get("/stock/{symbol}")
async def get_stock_data(
    symbol: str, 
    period: str = "1d", 
    interval: str = "1d"
):
    """Get data for a single stock"""
    try:
        symbol = symbol.upper()
        data = await stock_api.fetch_stock_data(symbol, period, interval)
        if not data:
            raise HTTPException(status_code=404, detail=f"Stock {symbol} not found or data unavailable")
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Error in get_stock_data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/stock/search")
async def search_stocks(query: str):
    """Search stocks by symbol or name"""
    try:
        results = stock_api.search_stocks(query)
        return JSONResponse(content=results)
    except Exception as e:
        logger.error(f"Error in search_stocks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/stock/valid-intervals/{period}")
async def get_valid_intervals(period: str):
    """Get valid intervals for a given period"""
    try:
        valid_intervals = stock_api.get_valid_intervals(period)
        return JSONResponse(content={"period": period, "valid_intervals": valid_intervals})
    except Exception as e:
        logger.error(f"Error in get_valid_intervals: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/stock/categories")
async def get_categories():
    """Get all available stock categories"""
    try:
        categories = stock_api.get_all_categories()
        return JSONResponse(content=list(categories.keys()))
    except Exception as e:
        logger.error(f"Error in get_categories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/stock/historical/{symbol}")
async def get_historical_data(symbol: str, period: str = "1mo", interval: str = "1d"):
    """
    Get historical market data for a symbol.
    """
    try:
        # Add .NS for NSE symbols
        if not symbol.endswith('.NS'):
            symbol = f"{symbol}.NS"
            
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period, interval=interval)

        if hist.empty:
            raise HTTPException(status_code=404, detail="No data found for this request")
        
        hist.reset_index(inplace=True)
        hist.rename(columns={
            "Date": "date",  # Change to "date" for consistency
            "Open": "open",
            "High": "high",
            "Low": "low",
            "Close": "close",
            "Volume": "volume"
        }, inplace=True)

        data = hist[["date", "open", "high", "low", "close", "volume"]]
        data["date"] = data["date"].dt.strftime('%Y-%m-%d %H:%M:%S')
        return data.to_dict(orient="records")
    except Exception as e:
        logger.error(f"Error in get_historical_data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

class LevelSignalRequest(BaseModel):
    symbol: str
    levels: List[float]
    period: str = "1mo"
    interval: str = "1d"

class SignalResponse(BaseModel):
    date: str
    price: float
    type: str  # BUY or SELL
    level: float

@router.post("stock/signals/levels", response_model=List[SignalResponse])
async def generate_level_signals(request: LevelSignalRequest):
    """
    Generate buy/sell signals based on predefined price levels
    """
    try:
        # Fetch historical data
        data = await get_historical_data(request.symbol, request.period, request.interval)
        
        if not data:
            raise HTTPException(status_code=404, detail="No data found for this symbol")
        
        signals = []
        levels = request.levels
        
        for entry in data:
            date = entry["datetime"]
            open_price = entry["open"]
            high = entry["high"]
            low = entry["low"]
            close = entry["close"]
            
            # Check if price touches any of the levels
            for level in levels:
                if low <= level <= high:
                    # Determine if it's a buy or sell signal based on closing price
                    signal_type = "BUY" if close >= level else "SELL"
                    
                    signals.append({
                        "date": date,
                        "price": level,
                        "type": signal_type,
                        "level": level
                    })
        
        return signals
        
    except Exception as e:
        logger.error(f"Error generating level signals: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/stock/{symbol}/with-levels")
async def get_stock_data_with_levels(
    symbol: str, 
    period: str = "1mo", 
    interval: str = "1d"
):
    """
    Get stock data with predefined levels for Tata Motors
    """
    try:
        # Get historical data
        historical_data = await get_historical_data(symbol, period, interval)
        
        # Predefined levels for Tata Motors
        levels = [706, 668, 667, 703]
        
        # Generate signals
        signals = []
        for entry in historical_data:
            date = entry["date"]  # Use "date" instead of "datetime"
            high = entry["high"]
            low = entry["low"]
            close = entry["close"]
            
            for level in levels:
                if low <= level <= high:
                    signal_type = "BUY" if close >= level else "SELL"
                    signals.append({
                        "date": date,
                        "price": level,
                        "type": signal_type,
                        "level": level
                    })
        
        return {
            "symbol": symbol,
            "data": historical_data,
            "levels": levels,
            "signals": signals
        }
        
    except Exception as e:
        logger.error(f"Error in get_stock_data_with_levels: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")