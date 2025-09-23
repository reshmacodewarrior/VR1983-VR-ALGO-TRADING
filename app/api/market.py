# backend/app/routers/market.py
from typing import Dict, Optional, List, Any
from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, timedelta
from fastapi.responses import JSONResponse
import yfinance as yf
import pandas as pd
import numpy as np
import logging
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/market", tags=["market"])

class StockDashboard:
    def __init__(self):
        self.indian_stocks = self.load_indian_stocks()
        self.us_stocks = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 
            'JPM', 'JNJ', 'V', 'WMT', 'DIS', 'NFLX', 'INTC', 'AMD',
            'BAC', 'XOM', 'PFE', 'CSCO', 'CMCSA', 'ADBE', 'PYPL', 'NFLX'
        ]
        self.crypto = ['BTC-USD', 'ETH-USD', 'BNB-USD', 'ADA-USD', 'XRP-USD']
        self.forex = ['EURUSD=X', 'GBPUSD=X', 'JPYUSD=X', 'CNYUSD=X', 'INRUSD=X']
        self.indices = ['^GSPC', '^IXIC', '^DJI', '^NSEI', '^BSESN']
        
    def load_indian_stocks(self):
        """Load Indian stock symbols with their names"""
        return {
            'RELIANCE.NS': 'Reliance Industries',
            'TATAMOTORS.NS': 'Tata Motors',
            'INFY.NS': 'Infosys',
            'HDFCBANK.NS': 'HDFC Bank',
            'TCS.NS': 'Tata Consultancy Services',
            'ICICIBANK.NS': 'ICICI Bank',
            'HINDUNILVR.NS': 'Hindustan Unilever',
            'SBIN.NS': 'State Bank of India',
            'BAJFINANCE.NS': 'Bajaj Finance',
            'KOTAKBANK.NS': 'Kotak Mahindra Bank',
            'ITC.NS': 'ITC Limited',
            'LT.NS': 'Larsen & Toubro',
            'AXISBANK.NS': 'Axis Bank',
            'BHARTIARTL.NS': 'Bharti Airtel',
            'MARUTI.NS': 'Maruti Suzuki',
            'ASIANPAINT.NS': 'Asian Paints',
            'HINDALCO.NS': 'Hindalco Industries',
            'SUNPHARMA.NS': 'Sun Pharmaceutical',
            'TITAN.NS': 'Titan Company',
            'POWERGRID.NS': 'Power Grid Corporation',
            'NTPC.NS': 'NTPC Limited',
            'ONGC.NS': 'Oil & Natural Gas Corporation',
            'WIPRO.NS': 'Wipro',
            'ADANIPORTS.NS': 'Adani Ports',
            'ULTRACEMCO.NS': 'UltraTech Cement',
            'JSWSTEEL.NS': 'JSW Steel',
            'TECHM.NS': 'Tech Mahindra',
            'GRASIM.NS': 'Grasim Industries',
            'HCLTECH.NS': 'HCL Technologies',
            'DRREDDY.NS': 'Dr. Reddy\'s Laboratories',
            'INDUSINDBK.NS': 'IndusInd Bank',
            'CIPLA.NS': 'Cipla',
            'BAJAJFINSV.NS': 'Bajaj Finserv',
            'TATASTEEL.NS': 'Tata Steel',
            'HEROMOTOCO.NS': 'Hero MotoCorp',
            'COALINDIA.NS': 'Coal India',
            'BPCL.NS': 'Bharat Petroleum',
            'EICHERMOT.NS': 'Eicher Motors',
            'DIVISLAB.NS': 'Divi\'s Laboratories',
            'BRITANNIA.NS': 'Britannia Industries',
            'SBILIFE.NS': 'SBI Life Insurance',
            'HDFCLIFE.NS': 'HDFC Life Insurance',
            'UPL.NS': 'UPL Limited',
            'VEDL.NS': 'Vedanta Limited',
            'SHREECEM.NS': 'Shree Cement',
            'HINDPETRO.NS': 'Hindustan Petroleum',
            'IOC.NS': 'Indian Oil Corporation',
            'GAIL.NS': 'GAIL India',
            'M&M.NS': 'Mahindra & Mahindra'
        }
    def fetch_stock_data(self, symbol: str, period: str = "1d", interval: str = "1d"):
        try:
            stock = yf.Ticker(symbol)
            hist = stock.history(period=period, interval=interval)

            if hist.empty:
                return None

            info = stock.info
            prev_close = info.get(
                'previousClose',
                hist['Close'].iloc[-2] if len(hist) > 1 else hist['Close'].iloc[-1]
            )

            current_price = hist['Close'].iloc[-1]
            change = current_price - prev_close
            change_percent = (change / prev_close) * 100

            stock_name = self.indian_stocks.get(symbol, info.get('longName', symbol))

            # ✅ Fix timezone-aware timestamps
            hist = hist.reset_index()
            if "Datetime" in hist.columns:  # intraday intervals
                hist.rename(columns={"Datetime": "date"}, inplace=True)
            elif "Date" in hist.columns:    # daily/longer intervals
                hist.rename(columns={"Date": "date"}, inplace=True)

            hist["date"] = pd.to_datetime(hist["date"]).dt.strftime("%Y-%m-%d %H:%M:%S")

            hist_dict = hist.to_dict("records")

            return {
                'history': hist_dict,
                'current_price': float(current_price),
                'prev_close': float(prev_close),
                'change': float(change),
                'change_percent': float(change_percent),
                'high': float(hist['High'].max()),
                'low': float(hist['Low'].min()),
                'volume': int(hist['Volume'].sum()),
                'symbol': symbol,
                'name': stock_name,
                'currency': info.get('currency', 'USD'),
                'last_updated': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {str(e)}")
            return None

        
    def fetch_bulk_data(self, symbols: List[str]):
        """Fetch data for multiple symbols"""
        results = {}
        for symbol in symbols:
            data = self.fetch_stock_data(symbol, period="1d", interval="1d")
            if data:
                results[symbol] = data
        return results
    
    def get_categories(self):
        """Get all available categories"""
        return {
            "US Stocks": self.us_stocks[:20],
            "Indian Stocks": list(self.indian_stocks.keys())[:20],
            "Cryptocurrencies": self.crypto,
            "Forex": self.forex,
            "Indices": self.indices
        }

# Initialize dashboard
dashboard = StockDashboard()

@router.get("/stock/{symbol}")
async def get_stock_data(
    symbol: str, 
    period: str = "1d", 
    interval: str = "1d"
):
    """Get data for a single stock"""
    try:
        symbol = symbol.upper()
        data = dashboard.fetch_stock_data(symbol, period, interval)
        if not data:
            raise HTTPException(status_code=404, detail=f"Stock {symbol} not found or data unavailable")
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Error in get_stock_data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/bulk/{category}")
async def get_bulk_data(category: str):
    """Get bulk data for a category"""
    try:
        categories = dashboard.get_categories()
        if category not in categories:
            raise HTTPException(status_code=404, detail=f"Category {category} not found")
        
        symbols = categories[category]
        data = dashboard.fetch_bulk_data(symbols)
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Error in get_bulk_data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/categories")
async def get_categories():
    """Get all available categories"""
    try:
        categories = dashboard.get_categories()
        return JSONResponse(content=list(categories.keys()))
    except Exception as e:
        logger.error(f"Error in get_categories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/indian-stocks")
async def get_indian_stocks():
    """Get Indian stocks data"""
    try:
        symbols = list(dashboard.indian_stocks.keys())[:20]
        data = dashboard.fetch_bulk_data(symbols)
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Error in get_indian_stocks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/search-queue")
async def process_search_queue(symbols: List[str]):
    """Process search queue"""
    try:
        data = dashboard.fetch_bulk_data(symbols)
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Error in process_search_queue: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/historical/{symbol}")
async def get_historical_data(symbol: str, period: str = "1mo", interval: str = "1d"):
    """Get historical market data"""
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period, interval=interval)

        if hist.empty:
            raise HTTPException(status_code=404, detail="No data found for this request")
        
        hist.reset_index(inplace=True)
        hist.rename(columns={
            "Date": "date",
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