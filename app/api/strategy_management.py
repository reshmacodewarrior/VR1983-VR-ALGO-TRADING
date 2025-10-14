# api/strategy_management.py - CREATE THIS FILE
from fastapi import APIRouter, HTTPException
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/strategy", tags=["strategy_management"])

# Temporary storage (replace with MongoDB)
user_strategies = {}

@router.post("/create")
async def create_strategy(strategy_data: dict):
    """Create a new strategy"""
    strategy_id = str(uuid.uuid4())
    
    user_strategies[strategy_id] = {
        "id": strategy_id,
        "name": strategy_data.get("name", "My Strategy"),
        "code": strategy_data.get("code", ""),
        "language": strategy_data.get("language", "pinescript"),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    return {"strategy_id": strategy_id, "status": "created"}

@router.get("/list")
async def list_strategies(user_id: str = "demo_user"):  # Add real user auth later
    """Get all strategies for user"""
    user_strats = [s for s in user_strategies.values()]
    return user_strats

@router.get("/{strategy_id}")
async def get_strategy(strategy_id: str):
    """Get specific strategy"""
    if strategy_id not in user_strategies:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    return user_strategies[strategy_id]

@router.put("/{strategy_id}")
async def update_strategy(strategy_id: str, strategy_data: dict):
    """Update strategy"""
    if strategy_id not in user_strategies:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    user_strategies[strategy_id].update({
        "code": strategy_data.get("code", user_strategies[strategy_id]["code"]),
        "name": strategy_data.get("name", user_strategies[strategy_id]["name"]),
        "updated_at": datetime.utcnow()
    })
    
    return {"status": "updated"}