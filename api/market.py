from typing import Dict, Optional, List, Any
from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from fastapi.responses import JSONResponse
import yfinance as yf
import asyncio
import pandas as pd
import logging
import numpy as np
from pydantic import BaseModel

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class StockDataAPI:
    def __init__(self):
        self.indian_stocks = {
            'RELIANCE.NS': 'Reliance Industries', 'TATAMOTORS.NS': 'Tata Motors',
            'INFY.NS': 'Infosys', 'HDFCBANK.NS': 'HDFC Bank', 'TCS.NS': 'Tata Consultancy Services',
            'ICICIBANK.NS': 'ICICI Bank', 'HINDUNILVR.NS': 'Hindustan Unilever',
            'SBIN.NS': 'State Bank of India', 'BAJFINANCE.NS': 'Bajaj Finance',
            'KOTAKBANK.NS': 'Kotak Mahindra Bank', 'ITC.NS': 'ITC Limited',
            'LT.NS': 'Larsen & Toubro', 'AXISBANK.NS': 'Axis Bank',
            'BHARTIARTL.NS': 'Bharti Airtel', 'MARUTI.NS': 'Maruti Suzuki',
            'ASIANPAINT.NS': 'Asian Paints', 'HINDALCO.NS': 'Hindalco Industries',
            'SUNPHARMA.NS': 'Sun Pharmaceutical', 'TITAN.NS': 'Titan Company',
            'POWERGRID.NS': 'Power Grid Corporation', 'NTPC.NS': 'NTPC Limited',
            'ONGC.NS': 'Oil & Natural Gas Corporation', 'WIPRO.NS': 'Wipro',
            'ADANIPORTS.NS': 'Adani Ports', 'ULTRACEMCO.NS': 'UltraTech Cement',
            'JSWSTEEL.NS': 'JSW Steel', 'TECHM.NS': 'Tech Mahindra',
            'GRASIM.NS': 'Grasim Industries', 'HCLTECH.NS': 'HCL Technologies',
            'DRREDDY.NS': 'Dr. Reddy\'s Laboratories', 'INDUSINDBK.NS': 'IndusInd Bank',
            'CIPLA.NS': 'Cipla', 'BAJAJFINSV.NS': 'Bajaj Finserv',
            'TATASTEEL.NS': 'Tata Steel', 'HEROMOTOCO.NS': 'Hero MotoCorp',
            'COALINDIA.NS': 'Coal India', 'BPCL.NS': 'Bharat Petroleum',
            'EICHERMOT.NS': 'Eicher Motors', 'DIVISLAB.NS': 'Divi\'s Laboratories',
            'BRITANNIA.NS': 'Britannia Industries', 'SBILIFE.NS': 'SBI Life Insurance',
            'HDFCLIFE.NS': 'HDFC Life Insurance', 'UPL.NS': 'UPL Limited',
            'VEDL.NS': 'Vedanta Limited', 'SHREECEM.NS': 'Shree Cement',
            'HINDPETRO.NS': 'Hindustan Petroleum', 'IOC.NS': 'Indian Oil Corporation',
            'GAIL.NS': 'GAIL India', 'M&M.NS': 'Mahindra & Mahindra'
        }
        
        self.us_stocks = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 
            'JPM', 'JNJ', 'V', 'WMT', 'DIS', 'NFLX', 'INTC', 'AMD',
            'BAC', 'XOM', 'PFE', 'CSCO', 'CMCSA', 'ADBE', 'PYPL', 'NFLX'
        ]
        
        self.crypto = ['BTC-USD', 'ETH-USD', 'BNB-USD', 'ADA-USD', 'XRP-USD']
        self.forex = ['EURUSD=X', 'GBPUSD=X', 'JPYUSD=X', 'CNYUSD=X', 'INRUSD=X']
        self.indices = ['^GSPC', '^IXIC', '^DJI', '^NSEI', '^BSESN']
        
        # Valid period and interval combinations
        self.valid_combinations = {
            '1d': ['1m', '2m', '5m', '15m', '30m', '60m', '90m'],
            '5d': ['1m', '5m', '15m', '30m', '60m', '90m'],
            '1mo': ['30m', '60m', '90m', '1d'],
            '3mo': ['1d', '5d', '1wk'],
            '6mo': ['1d', '5d', '1wk'],
            '1y': ['1d', '5d', '1wk'],
            '2y': ['1d', '5d', '1wk'],
            '5y': ['1d', '1wk', '1mo'],
            '10y': ['1d', '1wk', '1mo'],
            'ytd': ['1d', '1wk', '1mo'],
            'max': ['1d', '1wk', '1mo']
        }
        
    def validate_period_interval(self, period: str, interval: str) -> bool:
        """Check if the period and interval combination is valid"""
        if period in self.valid_combinations:
            return interval in self.valid_combinations[period]
        return False
    
    def get_valid_intervals(self, period: str) -> List[str]:
        """Get valid intervals for a given period"""
        return self.valid_combinations.get(period, ['1d'])
    
    async def fetch_stock_data(self, symbol: str, period: str = "1d", interval: str = "1d") -> Optional[Dict]:
        """Fetch stock data asynchronously with improved error handling"""
        try:
            # Validate period and interval combination
            if not self.validate_period_interval(period, interval):
                logger.warning(f"Invalid period/interval combination: {period}/{interval}")
                # Try to find a valid alternative
                if period in self.valid_combinations:
                    interval = self.valid_combinations[period][0]  # Use first valid interval
                    logger.info(f"Using alternative interval: {interval}")
                else:
                    period = "1d"
                    interval = "1d"
                    logger.info(f"Using default period/interval: {period}/{interval}")
            
            stock = yf.Ticker(symbol)
            
            # Get historical data
            hist = stock.history(period=period, interval=interval)
            
            if hist.empty:
                logger.warning(f"No historical data found for {symbol} with period={period}, interval={interval}")
                # Try with a different period/interval combination
                if period != "1d" or interval != "1d":
                    logger.info(f"Trying with default period/interval")
                    hist = stock.history(period="1d", interval="1d")
                    if hist.empty:
                        return None
                else:
                    return None
            
            # Get stock info
            info = stock.info
            
            # Calculate previous close safely
            try:
                if len(hist) > 1:
                    prev_close = hist['Close'].iloc[-2]
                else:
                    # For single data point, try to get from info or use current close
                    prev_close = info.get('previousClose', hist['Close'].iloc[-1] if not hist.empty else 0)
            except (IndexError, KeyError):
                prev_close = hist['Close'].iloc[-1] if not hist.empty else 0
            
            if hist.empty:
                return None
                
            current_price = hist['Close'].iloc[-1]
            change = current_price - prev_close
            change_percent = (change / prev_close) * 100 if prev_close != 0 else 0
            
            # Prepare history data - FIXED: Handle Date column properly
            history_data = []
            if not hist.empty:
                hist_reset = hist.reset_index()
                for _, row in hist_reset.iterrows():
                    # Handle date conversion safely
                    date_value = row.get('Date', None)
                    if date_value is not None:
                        if hasattr(date_value, 'isoformat'):
                            date_str = date_value.isoformat()
                        else:
                            date_str = str(date_value)
                    else:
                        date_str = datetime.now().isoformat()
                    
                    history_data.append({
                        'date': date_str,
                        'open': float(row.get('Open', 0)),
                        'high': float(row.get('High', 0)),
                        'low': float(row.get('Low', 0)),
                        'close': float(row.get('Close', 0)),
                        'volume': int(row.get('Volume', 0))
                    })
            
            # Get stock name
            stock_name = self.indian_stocks.get(symbol, info.get('longName', symbol))
            
            return {
                'symbol': symbol,
                'name': stock_name,
                'current_price': float(current_price),
                'prev_close': float(prev_close),
                'change': float(change),
                'change_percent': float(change_percent),
                'open': float(hist['Open'].iloc[-1]),
                'high': float(hist['High'].iloc[-1]),
                'low': float(hist['Low'].iloc[-1]),
                'volume': int(hist['Volume'].iloc[-1]),
                'currency': info.get('currency', 'USD'),
                'last_updated': datetime.now().isoformat(),
                'history': history_data,
                'period': period,
                'interval': interval
            }
            
        except Exception as e:
            logger.error(f"Error fetching {symbol}: {str(e)}")
            return None
    
    async def fetch_bulk_data(self, symbols: List[str], period: str = "1d", interval: str = "1d") -> List[Dict]:
        """Fetch data for multiple symbols concurrently"""
        tasks = [self.fetch_stock_data(symbol, period, interval) for symbol in symbols]
        results = await asyncio.gather(*tasks)
        return [result for result in results if result is not None]
    
    def get_all_categories(self) -> Dict[str, List[str]]:
        """Get all stock categories"""
        return {
            'indian_stocks': list(self.indian_stocks.keys()),
            'us_stocks': self.us_stocks,
            'crypto': self.crypto,
            'forex': self.forex,
            'indices': self.indices
        }
    
    def search_stocks(self, query: str) -> List[Dict[str, str]]:
        """Search stocks by symbol or name"""
        results = []
        query = query.lower()
        
        # Search in all categories
        all_symbols = {
            **self.indian_stocks,
            **{symbol: symbol for symbol in self.us_stocks},
            **{symbol: symbol for symbol in self.crypto},
            **{symbol: symbol for symbol in self.forex},
            **{symbol: symbol for symbol in self.indices}
        }
        
        for symbol, name in all_symbols.items():
            if query in symbol.lower() or query in str(name).lower():
                results.append({
                    'symbol': symbol,
                    'name': name if name != symbol else f"{symbol} (No name available)"
                })
        
        return results[:20]  # Limit to 20 results

# Create instance of StockDataAPI
stock_api = StockDataAPI()

# API Routes
@router.get("/api")
async def root():
    return {"message": "Stock Data API is running", "status": "healthy"}

@router.get("/api/stock/{symbol}")
async def get_stock_data(
    symbol: str, 
    period: str = "1d", 
    interval: str = "1d"
):
    """Get data for a single stock"""
    try:
        # Ensure symbol is in correct format
        symbol = symbol.upper()
        data = await stock_api.fetch_stock_data(symbol, period, interval)
        if not data:
            raise HTTPException(status_code=404, detail=f"Stock {symbol} not found or data unavailable")
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Error in get_stock_data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/api/search")
async def search_stocks(query: str):
    """Search stocks by symbol or name"""
    try:
        results = stock_api.search_stocks(query)
        return JSONResponse(content=results)
    except Exception as e:
        logger.error(f"Error in search_stocks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/api/valid-intervals/{period}")
async def get_valid_intervals(period: str):
    """Get valid intervals for a given period"""
    try:
        valid_intervals = stock_api.get_valid_intervals(period)
        return JSONResponse(content={"period": period, "valid_intervals": valid_intervals})
    except Exception as e:
        logger.error(f"Error in get_valid_intervals: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/api/categories")
async def get_categories():
    """Get all available stock categories"""
    try:
        categories = stock_api.get_all_categories()
        # Return only the category names, not all symbols
        return JSONResponse(content=list(categories.keys()))
    except Exception as e:
        logger.error(f"Error in get_categories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")



    
