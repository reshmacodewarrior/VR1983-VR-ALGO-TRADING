import datetime
from typing import List
from fastapi import APIRouter

from fastapi import APIRouter
from .user import router as user_router
from .market import router as market_router
from .broker import router as broker_router 
from .password import router as password_router
from .watchlist import router as watchlist_router
from .order import router as order_router   
from .levels import router as levels_router 
from .csv_file import router as csv_router
from .strategy_marketplace import router as strategy_marketplace_router
from .strategy_editor import router as strategy_editor_router   
from .strategy_backtest import router as strategy_backtest_router    
from .strategy_management import router as strategy_management_router   

api_router = APIRouter()

api_router.include_router(user_router)
api_router.include_router(market_router)
api_router.include_router(broker_router)
api_router.include_router(password_router)
api_router.include_router(watchlist_router)
api_router.include_router(order_router)
api_router.include_router(levels_router)
api_router.include_router(csv_router)
api_router.include_router(strategy_marketplace_router)
api_router.include_router(strategy_editor_router)
api_router.include_router(strategy_backtest_router)
api_router.include_router(strategy_management_router)



