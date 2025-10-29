# api/strategy_marketplace.py - UPDATE WITH USER AUTH
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from database.collections import strategies_collection, get_public_strategies, get_strategy, update_strategy
from schemas.strategy import StrategyCreate
from services.user import get_current_user  # ✅ IMPORT AUTH
from schemas.user import UserInDB  # ✅ IMPORT USER SCHEMA

router = APIRouter(prefix="/api/strategy", tags=["strategy_marketplace"])

@router.post("/publish")
async def publish_strategy(
    strategy_id: str,  # Now takes strategy_id instead of full strategy
    current_user: UserInDB = Depends(get_current_user)  # ✅ USER AUTH
):
    """User publishes their strategy to marketplace - only if they own it"""
    try:
        # Verify user owns the strategy
        strategy = await get_strategy(strategy_id, current_user.id)
        
        if not strategy:
            raise HTTPException(status_code=404, detail="Strategy not found or access denied")
        
        # Update strategy to public
        update_data = {
            "is_public": True,
            "status": "published",
            "published_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        success = await update_strategy(strategy_id, update_data, current_user.id)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to publish strategy")
        
        return {
            "strategy_id": strategy_id,
            "status": "published",
            "message": "Strategy published to marketplace"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to publish strategy: {str(e)}")

@router.get("/marketplace")
async def browse_strategies(
    category: str = None, 
    rating: float = None,
    current_user: UserInDB = Depends(get_current_user)  # ✅ USER AUTH (optional for browsing)
):
    """Browse published strategies - available to all authenticated users"""
    try:
        strategies = await get_public_strategies()
        
        # Filter by category if provided
        if category:
            strategies = [s for s in strategies if category in s.get('tags', [])]
        
        return [
            {
                "id": str(strategy["_id"]),
                "name": strategy["name"],
                "description": strategy.get("description", ""),
                "language": strategy["language"],
                "user_id": strategy["user_id"],
                "published_at": strategy.get("published_at"),
                "rating": strategy.get("rating", 0),
                "downloads": strategy.get("downloads", 0),
                "tags": strategy.get("tags", [])
            }
            for strategy in strategies
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch marketplace strategies: {str(e)}")