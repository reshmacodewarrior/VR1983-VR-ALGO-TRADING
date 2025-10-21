from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from datetime import datetime

from database.connection import get_db_connection
from schemas.user import User

# Import your existing services
from services.algo_service import AlgorithmService
from services.live_strategy_monitor import LiveStrategyMonitor
from schemas.order import OrderRequest
from schemas.broker import BrokerCreate

admin_router = APIRouter(tags=["admin"])

# Reuse your existing dependencies
async def get_current_user():
    # Your existing user authentication
    pass

async def verify_admin(current_user: User = Depends(get_current_user)):
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@admin_router.get("/dashboard/stats")
async def get_admin_stats(admin: User = Depends(verify_admin)):
    """Admin dashboard statistics"""
    algo_service = AlgorithmService()
    strategy_monitor = LiveStrategyMonitor()
    
    return {
        "system_health": {
            "timestamp": datetime.utcnow(),
            "status": "operational"
        },
        "trading_overview": {
            "active_strategies": await strategy_monitor.get_active_strategies_count(),
            "total_trades_today": await OrderRequest.get_todays_trade_count(),
            "open_positions": await OrderRequest.get_open_positions_count()
        },
        "user_metrics": {
            "total_users": await User.get_total_count(),
            "active_today": await User.get_active_users_count()
        }
    }

@admin_router.get("/strategies/overview")
async def get_strategies_overview(admin: User = Depends(verify_admin)):
    """Get overview of all strategies in system"""
    strategy_monitor = LiveStrategyMonitor()
    return await strategy_monitor.get_all_strategies_admin_view()

@admin_router.get("/system/health")
async def get_system_health(admin: User = Depends(verify_admin)):
    """Comprehensive system health check"""
    broker_manager = BrokerCreate()
    
    return {
        "database": await get_db_connection(),
        "broker_connections": await broker_manager.get_connection_status(),
        "api_status": "healthy",
        "timestamp": datetime.utcnow()
    }