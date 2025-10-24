# app/services/storage.py
from database.collections import trading_signals_collection, user_signals_collection

# In-memory storage (for temporary data)
trading_signals: list[dict] = []
price_levels: dict = {}
user_signals_cache: dict = {}  # Add this line

# Database collections (for persistent storage)
trading_signals_db = trading_signals_collection
user_trading_signals = user_signals_collection  # Add this line