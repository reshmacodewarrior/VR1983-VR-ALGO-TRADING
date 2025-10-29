# api/strategy_management.py - UPDATE WITH USER AUTH
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from database.collections import (
    create_strategy, get_strategy, get_user_strategies, 
    update_strategy, delete_strategy
)
from schemas.strategy import StrategyCreate, StrategyResponse
from services.user import get_current_user  # ✅ IMPORT YOUR AUTH
from schemas.user import UserInDB  # ✅ IMPORT USER SCHEMA

router = APIRouter(prefix="/api/strategy", tags=["strategy_management"])

@router.post("/create", response_model=dict)
async def create_new_strategy(
    strategy_data: StrategyCreate,
    current_user: UserInDB = Depends(get_current_user)  # ✅ USER AUTH
):
    """Create and SAVE strategy for authenticated user"""
    try:
        # Prepare strategy document with user_id from auth
        strategy_doc = {
            "user_id": current_user.id,  # ✅ FROM AUTHENTICATED USER
            "name": strategy_data.name,
            "description": strategy_data.description,
            "code": strategy_data.code,
            "language": strategy_data.language,
            "parameters": strategy_data.parameters,
            "tags": strategy_data.tags,
            "status": "draft",
            "version": 1,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_public": False
        }
        
        strategy_id = await create_strategy(strategy_doc)
        
        return {
            "strategy_id": strategy_id,
            "status": "created",
            "message": "Strategy saved to database successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create strategy: {str(e)}")

@router.get("/list", response_model=List[dict])
async def list_user_strategies(
    current_user: UserInDB = Depends(get_current_user)  # ✅ USER AUTH
):
    """Get all strategies for authenticated user"""
    try:
        strategies = await get_user_strategies(current_user.id)  # ✅ USER SPECIFIC
        
        return [
            {
                "id": str(strategy["_id"]),
                "name": strategy["name"],
                "description": strategy.get("description", ""),
                "language": strategy["language"],
                "status": strategy.get("status", "draft"),
                "created_at": strategy["created_at"],
                "updated_at": strategy["updated_at"],
                "tags": strategy.get("tags", [])
            }
            for strategy in strategies
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch strategies: {str(e)}")

@router.get("/{strategy_id}", response_model=dict)
async def get_strategy_by_id(
    strategy_id: str,
    current_user: UserInDB = Depends(get_current_user)  # ✅ USER AUTH
):
    """Get specific strategy - only if user owns it"""
    try:
        strategy = await get_strategy(strategy_id, current_user.id)  # ✅ USER CHECK
        
        if not strategy:
            raise HTTPException(status_code=404, detail="Strategy not found")
        
        return {
            "id": str(strategy["_id"]),
            "user_id": strategy["user_id"],
            "name": strategy["name"],
            "description": strategy.get("description", ""),
            "code": strategy["code"],
            "language": strategy["language"],
            "parameters": strategy.get("parameters", {}),
            "status": strategy.get("status", "draft"),
            "created_at": strategy["created_at"],
            "updated_at": strategy["updated_at"],
            "tags": strategy.get("tags", []),
            "is_public": strategy.get("is_public", False)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch strategy: {str(e)}")

@router.put("/{strategy_id}", response_model=dict)
async def update_strategy_by_id(
    strategy_id: str, 
    strategy_data: dict,
    current_user: UserInDB = Depends(get_current_user)  # ✅ USER AUTH
):
    """Update strategy - only if user owns it"""
    try:
        update_data = {
            **strategy_data,
            "updated_at": datetime.utcnow()
        }
        
        success = await update_strategy(strategy_id, update_data, current_user.id)  # ✅ USER CHECK
        
        if not success:
            raise HTTPException(status_code=404, detail="Strategy not found or access denied")
        
        return {
            "status": "updated",
            "message": "Strategy updated in database"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update strategy: {str(e)}")

@router.delete("/{strategy_id}")
async def delete_strategy_by_id(
    strategy_id: str,
    current_user: UserInDB = Depends(get_current_user)  # ✅ USER AUTH
):
    """Delete strategy - only if user owns it"""
    try:
        success = await delete_strategy(strategy_id, current_user.id)  # ✅ USER CHECK
        
        if not success:
            raise HTTPException(status_code=404, detail="Strategy not found or access denied")
        
        return {
            "status": "deleted", 
            "message": "Strategy deleted from database"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete strategy: {str(e)}")