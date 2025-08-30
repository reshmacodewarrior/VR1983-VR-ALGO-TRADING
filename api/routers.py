from fastapi import APIRouter
from .user import router as user_router
from .market import router as market_router
from .broker import router as broker_router 
from .password import router as password_router

api_router = APIRouter()

api_router.include_router(user_router)
api_router.include_router(market_router)
api_router.include_router(broker_router)
api_router.include_router(password_router)