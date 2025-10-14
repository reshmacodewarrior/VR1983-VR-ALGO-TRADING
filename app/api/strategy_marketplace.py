# api/strategy_marketplace.py
from datetime import datetime
from fastapi import APIRouter
from database.collections import strategies_collection
from app.schemas.strategy import StrategyBase


router = APIRouter(prefix="/api/strategy", tags=["strategy_marketplace"])


@router.post("/publish")
async def publish_strategy(strategy: StrategyBase, user_id: str):
    """User publishes their strategy to marketplace"""
    strategy_doc = {
        **strategy.dict(),
        'user_id': user_id,
        'published_at': datetime.utcnow(),
        'rating': 0,
        'downloads': 0,
        'public': True
    }
    
    result = await strategies_collection.insert_one(strategy_doc)
    return {"strategy_id": str(result.inserted_id)}

@router.get("/marketplace")
async def browse_strategies(category: str = None, rating: float = None):
    """Browse published strategies"""
    query = {'public': True}
    if category:
        query['category'] = category
    
    strategies = await strategies_collection.find(query).sort('rating', -1).to_list(100)
    return strategies