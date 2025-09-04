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


@router.get("/stock")
async def root():
    return {"message": "Stock Data API is running", "status": "healthy"}

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

@router.get("/search")
async def search_stocks(query: str):
    """Search stocks by symbol or name"""
    try:
        results = stock_api.search_stocks(query)
        return JSONResponse(content=results)
    except Exception as e:
        logger.error(f"Error in search_stocks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/valid-intervals/{period}")
async def get_valid_intervals(period: str):
    """Get valid intervals for a given period"""
    try:
        valid_intervals = stock_api.get_valid_intervals(period)
        return JSONResponse(content={"period": period, "valid_intervals": valid_intervals})
    except Exception as e:
        logger.error(f"Error in get_valid_intervals: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/categories")
async def get_categories():
    """Get all available stock categories"""
    try:
        categories = stock_api.get_all_categories()
        return JSONResponse(content=list(categories.keys()))
    except Exception as e:
        logger.error(f"Error in get_categories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/historical/{symbol}")
async def get_historical_data(symbol: str, period: str = "1mo", interval: str = "1d"):
    """
    Get historical market data for a symbol.
    """
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period, interval=interval)

        if hist.empty:
            raise HTTPException(status_code=404, detail="No data found for this request")
        hist.reset_index(inplace=True)
        hist.rename(columns={
            "Date": "datetime",
            "Open": "open",
            "High": "high",
            "Low": "low",
            "Close": "close",
            "Volume": "volume"
        }, inplace=True)

        data = hist[["datetime", "open", "high", "low", "close", "volume"]]
        data["datetime"] = data["datetime"].dt.strftime('%Y-%m-%d %H:%M:%S')
        return data.to_dict(orient="records")
    except Exception as e:
        logger.error(f"Error in get_historical_data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")