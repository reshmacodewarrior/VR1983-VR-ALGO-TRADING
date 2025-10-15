from typing import Any, Dict, List, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings


client = AsyncIOMotorClient(settings.MONGODB_URI)
db = client[settings.DB_NAME]

users_collection = db.get_collection("users")
tata_collection = db.get_collection("tata_motors")
wipro_collection = db.get_collection("wipro")
brokers_collection = db.get_collection("brokers")
markets_collection = db.get_collection("markets")
notifications_collection = db.get_collection("notifications")
preferences_collection = db.get_collection("preferences")
trades_collection = db.get_collection("trades")
holdings_collection = db.get_collection("holdings")
balance_collection = db.get_collection("balance")
levels_collection = db.get_collection("levels")
watchlist_collection = db.get_collection("watchlist")
strategies_collection = db.get_collection("strategies")
backtests_collection = db.get_collection("backtests")
strategy_orders_collection = db.get_collection("strategy_orders")

# database/collections.py - UPDATE WITH USER-BASED OPERATIONS
async def create_strategy(strategy_data: Dict[str, Any]) -> str:
    """Save strategy to strategies collection"""
    result = await strategies_collection.insert_one(strategy_data)
    return str(result.inserted_id)

async def get_strategy(strategy_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Get strategy by ID - with user check"""
    query = {"_id": ObjectId(strategy_id)}
    if user_id:
        query["user_id"] = user_id  # Only return if user owns it
    
    strategy = await strategies_collection.find_one(query)
    return strategy

async def get_user_strategies(user_id: str) -> List[Dict[str, Any]]:
    """Get all strategies for a specific user"""
    cursor = strategies_collection.find({"user_id": user_id}).sort("created_at", -1)
    return await cursor.to_list(length=100)

async def get_public_strategies() -> List[Dict[str, Any]]:
    """Get all public strategies for marketplace"""
    cursor = strategies_collection.find({"is_public": True}).sort("created_at", -1)
    return await cursor.to_list(length=100)

async def update_strategy(strategy_id: str, update_data: Dict[str, Any], user_id: Optional[str] = None) -> bool:
    """Update strategy - with user ownership check"""
    query = {"_id": ObjectId(strategy_id)}
    if user_id:
        query["user_id"] = user_id  # Only update if user owns it
    
    result = await strategies_collection.update_one(query, {"$set": update_data})
    return result.modified_count > 0

async def delete_strategy(strategy_id: str, user_id: Optional[str] = None) -> bool:
    """Delete strategy - with user ownership check"""
    query = {"_id": ObjectId(strategy_id)}
    if user_id:
        query["user_id"] = user_id  # Only delete if user owns it
    
    result = await strategies_collection.delete_one(query)
    return result.deleted_count > 0

# ✅ BACKTEST OPERATIONS WITH USER AUTH
async def create_backtest(backtest_data: Dict[str, Any]) -> str:
    """Save backtest result to backtests collection"""
    result = await backtests_collection.insert_one(backtest_data)
    return str(result.inserted_id)

async def get_backtest(backtest_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Get backtest by ID - with user check"""
    query = {"_id": ObjectId(backtest_id)}
    if user_id:
        query["user_id"] = user_id
    
    backtest = await backtests_collection.find_one(query)
    return backtest

async def get_user_backtests(user_id: str) -> List[Dict[str, Any]]:
    """Get all backtests for a user"""
    cursor = backtests_collection.find({"user_id": user_id}).sort("created_at", -1)
    return await cursor.to_list(length=50)

async def get_strategy_backtests(strategy_id: str, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get all backtests for a strategy - with user check"""
    query = {"strategy_id": strategy_id}
    if user_id:
        query["user_id"] = user_id
    
    cursor = backtests_collection.find(query).sort("created_at", -1)
    return await cursor.to_list(length=50)

async def update_backtest(backtest_id: str, update_data: dict):
    try:
        # Temporary fix - use backtest_id field instead of _id
        result = await backtests_collection.update_one(
            {"backtest_id": backtest_id},  # Change this line
            {"$set": update_data}
        )
        return result.modified_count > 0
    except Exception as e:
        print(f"❌ Error updating backtest: {e}")
        return False
