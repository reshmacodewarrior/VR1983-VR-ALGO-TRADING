from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from typing import Dict, List
import asyncio

from services.trading_scheduler import trading_scheduler
from services.automated_trading import automated_trading
from database.collections import (
    trading_signals_collection, 
    trading_orders_collection,
    strategies_collection,
    watchlist_collection
)
from app.schemas.user import UserInDB
from app.services.user import get_current_user

router = APIRouter(prefix="/api/automated-trading", tags=["Automated Trading"])

@router.post("/start")
async def start_automated_trading(
    background_tasks: BackgroundTasks, 
    current_user: UserInDB = Depends(get_current_user)
):
    """Start the automated trading system"""
    try:
        # Initialize trading for this user
        await automated_trading.initialize_trading(str(current_user.id))
        
        # Start scheduler in background
        background_tasks.add_task(trading_scheduler.start_scheduler)
        
        return {
            "success": True,
            "message": "Automated trading system started",
            "interval": "15 minutes",
            "user_id": str(current_user.id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stop")
async def stop_automated_trading():
    """Stop the automated trading system"""
    await trading_scheduler.stop_scheduler()
    return {"success": True, "message": "Automated trading stopped"}

@router.post("/run-now")
async def run_manual_cycle(current_user: UserInDB = Depends(get_current_user)):
    """Run trading cycle immediately"""
    await trading_scheduler.run_manual_cycle(str(current_user.id))
    return {"success": True, "message": "Manual trading cycle executed"}

@router.get("/status")
async def get_trading_status():
    """Get trading system status"""
    return {
        "is_running": trading_scheduler.is_running,
        "next_run": "15 minutes interval" if trading_scheduler.is_running else "Not scheduled"
    }

@router.get("/signals")
async def get_trading_signals(
    current_user: UserInDB = Depends(get_current_user),
    limit: int = 20
):
    """Get recent trading signals for user"""
    signals = await trading_signals_collection.find({
        "user_id": str(current_user.id)
    }).sort("timestamp", -1).limit(limit).to_list(length=limit)
    
    for signal in signals:
        signal["_id"] = str(signal["_id"])
        if 'strategy_id' in signal:
            signal["strategy_id"] = str(signal["strategy_id"])
    
    return {"signals": signals}

@router.get("/orders")
async def get_trading_orders(
    current_user: UserInDB = Depends(get_current_user),
    limit: int = 20
):
    """Get recent trading orders for user"""
    orders = await trading_orders_collection.find({
        "user_id": str(current_user.id)
    }).sort("placed_at", -1).limit(limit).to_list(length=limit)
    
    for order in orders:
        order["_id"] = str(order["_id"])
        order["signal_id"] = str(order["signal_id"])
    
    return {"orders": orders}

@router.get("/statistics")
async def get_trading_statistics(current_user: UserInDB = Depends(get_current_user)):
    """Get trading statistics"""
    user_id = str(current_user.id)
    
    # Count signals
    total_signals = await trading_signals_collection.count_documents({"user_id": user_id})
    executed_signals = await trading_signals_collection.count_documents({
        "user_id": user_id,
        "status": "EXECUTED"
    })
    
    # Count orders
    total_orders = await trading_orders_collection.count_documents({"user_id": user_id})
    successful_orders = await trading_orders_collection.count_documents({
        "user_id": user_id,
        "status": "PLACED"
    })
    
    return {
        "statistics": {
            "total_signals": total_signals,
            "executed_signals": executed_signals,
            "total_orders": total_orders,
            "successful_orders": successful_orders,
            "success_rate": (successful_orders / total_orders * 100) if total_orders > 0 else 0
        }
    }

@router.post("/add-to-watchlist")
async def add_to_watchlist(
    symbol_data: Dict,
    current_user: UserInDB = Depends(get_current_user)
):
    """Add symbol to watchlist"""
    user_id = str(current_user.id)
    
    # Update or create watchlist
    await watchlist_collection.update_one(
        {"user_id": user_id},
        {"$addToSet": {"symbols": symbol_data}},
        upsert=True
    )
    
    return {"success": True, "message": f"Added {symbol_data.get('symbol')} to watchlist"}

@router.get("/watchlist")
async def get_watchlist(current_user: UserInDB = Depends(get_current_user)):
    """Get user's watchlist"""
    watchlist = await watchlist_collection.find_one({"user_id": str(current_user.id)})
    return {"watchlist": watchlist.get('symbols', []) if watchlist else []}