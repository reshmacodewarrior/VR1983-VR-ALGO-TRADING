from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from typing import Dict, List
from datetime import datetime, timedelta
from bson import ObjectId

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
        if 'strategy_id' in signal and signal['strategy_id']:
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
        if 'signal_id' in order and order['signal_id']:
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

@router.post("/create-default-strategies")
async def create_default_strategies(current_user: UserInDB = Depends(get_current_user)):
    """Create default trading strategies for user"""
    user_id = str(current_user.id)
    
    default_strategies = [
        {
            "user_id": user_id,
            "name": "Mean Reversion Strategy",
            "type": "mean_reversion",
            "description": "Buy oversold, sell overbought stocks",
            "quantity": 1,
            "is_active": True,
            "confidence_threshold": 0.7,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "user_id": user_id,
            "name": "Momentum Strategy", 
            "type": "momentum",
            "description": "Follow the trend - buy uptrend, sell downtrend",
            "quantity": 1,
            "is_active": True,
            "confidence_threshold": 0.6,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "user_id": user_id,
            "name": "Breakout Strategy",
            "type": "breakout",
            "description": "Buy breakouts above resistance, sell breakdowns below support",
            "quantity": 1, 
            "is_active": True,
            "confidence_threshold": 0.8,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]
    
    # Insert strategies
    results = []
    for strategy in default_strategies:
        result = await strategies_collection.insert_one(strategy)
        strategy["_id"] = str(result.inserted_id)
        results.append(strategy)
    
    return {
        "success": True,
        "message": f"Created {len(results)} default strategies",
        "strategies": results
    }

@router.get("/strategies")
async def get_user_strategies(current_user: UserInDB = Depends(get_current_user)):
    """Get user's trading strategies"""
    strategies = await strategies_collection.find({
        "user_id": str(current_user.id)
    }).sort("created_at", -1).to_list(length=10)
    
    for strategy in strategies:
        strategy["_id"] = str(strategy["_id"])
    
    return {
        "success": True,
        "strategies": strategies,
        "count": len(strategies)
    }

@router.post("/force-test")
async def force_test_trading(current_user: UserInDB = Depends(get_current_user)):
    """Force generate test signals and orders"""
    user_id = str(current_user.id)
    
    try:
        # Create test strategy if none exists
        strategies = await strategies_collection.find({
            "user_id": user_id,
            "is_active": True
        }).to_list(length=1)
        
        if not strategies:
            await create_default_strategies(current_user)
        
        # Run trading cycle
        await automated_trading.initialize_trading(user_id)
        await automated_trading.run_trading_cycle(user_id)
        
        return {
            "success": True,
            "message": "Force test completed",
            "user_id": user_id
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/debug/live-activity")
async def debug_live_activity(current_user: UserInDB = Depends(get_current_user)):
    """Get real-time trading activity - WORKING VERSION"""
    try:
        user_id = str(current_user.id)
        
        print(f"🔍 Checking live activity for user: {user_id}")
        
        # Recent signals (last 1 hour)
        recent_signals = await trading_signals_collection.find({
            "user_id": user_id,
            "timestamp": {"$gte": datetime.now() - timedelta(hours=1)}
        }).sort("timestamp", -1).to_list(length=20)
        
        # Recent orders (last 1 hour)
        recent_orders = await trading_orders_collection.find({
            "user_id": user_id,
            "placed_at": {"$gte": datetime.now() - timedelta(hours=1)}
        }).sort("placed_at", -1).to_list(length=20)
        
        print(f"📊 Found {len(recent_signals)} signals and {len(recent_orders)} orders")
        
        # Format response
        for signal in recent_signals:
            signal["_id"] = str(signal["_id"])
            if 'strategy_id' in signal and signal['strategy_id']:
                signal["strategy_id"] = str(signal["strategy_id"])
        
        for order in recent_orders:
            order["_id"] = str(order["_id"])
            if 'signal_id' in order and order['signal_id']:
                order["signal_id"] = str(order["signal_id"])
        
        return {
            "success": True,
            "signals_last_hour": len(recent_signals),
            "orders_last_hour": len(recent_orders),
            "recent_signals": recent_signals,
            "recent_orders": recent_orders,
            "checked_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Live activity error: {str(e)}")
        return {"success": False, "error": str(e)}