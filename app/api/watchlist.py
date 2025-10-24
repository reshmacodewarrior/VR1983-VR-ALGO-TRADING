import os
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime  # ADD THIS IMPORT
from typing import List
from database.collections import users_collection
from bson import ObjectId  
from schemas.user import WatchlistItem, UserInDB
from .user import get_current_user  

router = APIRouter(prefix="/api/watchlist", tags=["watchlist"])

@router.get("/", response_model=List[WatchlistItem])
async def get_watchlist(current_user: UserInDB = Depends(get_current_user)):
    """
    Get the current user's entire watchlist.
    """
    try:
        user_id = ObjectId(current_user.id)
        user = await users_collection.find_one(
            {"_id": user_id}, 
            {"watchlist": 1}  # Only fetch watchlist field
        )
        
        if user and "watchlist" in user:
            return user["watchlist"]
        return []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching watchlist: {str(e)}"
        )

@router.post("/", response_model=List[WatchlistItem])
async def add_to_watchlist(
    item: WatchlistItem,
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        user_id = ObjectId(current_user.id)

        # Convert to dict and handle optional fields
        item_data = item.model_dump(exclude_unset=True)
        
        # Check if symbol already exists (case-insensitive)
        existing = await users_collection.find_one(
            {
                "_id": user_id, 
                "watchlist.symbol": {"$regex": f"^{item.symbol}$", "$options": "i"}
            }
        )
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Symbol '{item.symbol}' is already in your watchlist."
            )

        # Add timestamp
        item_data["added_at"] = datetime.utcnow().isoformat()

        # Push new item
        result = await users_collection.update_one(
            {"_id": user_id},
            {"$push": {"watchlist": item_data}}
        )

        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Return updated watchlist
        updated_user = await users_collection.find_one(
            {"_id": user_id}, 
            {"watchlist": 1}
        )
        return updated_user.get("watchlist", [])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding to watchlist: {str(e)}"
        )

@router.delete("/{symbol}", response_model=List[WatchlistItem])
async def remove_from_watchlist(symbol: str, current_user: UserInDB = Depends(get_current_user)):
    try:
        user_id = ObjectId(current_user.id)

        result = await users_collection.update_one(
            {"_id": user_id},
            {"$pull": {"watchlist": {"symbol": {"$regex": f"^{symbol}$", "$options": "i"}}}}
        )

        if result.modified_count == 0:
            raise HTTPException(
                status_code=404,
                detail=f"Symbol '{symbol}' not found in watchlist"
            )

        updated_user = await users_collection.find_one(
            {"_id": user_id}, 
            {"watchlist": 1}
        )
        return updated_user.get("watchlist", [])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing from watchlist: {str(e)}"
        )

# Add a PUT endpoint to update entire watchlist
@router.put("/", response_model=List[WatchlistItem])
async def update_watchlist(
    watchlist: List[WatchlistItem],
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        user_id = ObjectId(current_user.id)
        
        watchlist_data = [item.model_dump(exclude_unset=True) for item in watchlist]
        
        # Add timestamps
        for item in watchlist_data:
            if "added_at" not in item:
                item["added_at"] = datetime.utcnow().isoformat()

        result = await users_collection.update_one(
            {"_id": user_id},
            {"$set": {"watchlist": watchlist_data}}
        )

        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return watchlist_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating watchlist: {str(e)}"
        )

@router.get("/debug/user-structure")
async def debug_user_structure(current_user: UserInDB = Depends(get_current_user)):
    """Temporary endpoint to check user data structure"""
    user_id = ObjectId(current_user.id)
    user = await users_collection.find_one({"_id": user_id})
    
    # Return the actual database structure
    return {
        "user_id": str(user_id),
        "has_watchlist_field": "watchlist" in user,
        "watchlist_value": user.get("watchlist", "FIELD_NOT_FOUND"),
        "full_user_structure": {k: type(v).__name__ for k, v in user.items()}
    }
@router.get("/debug/sample-items")
async def debug_sample_items(current_user: UserInDB = Depends(get_current_user)):
    """Check what's actually stored in watchlist"""
    user_id = ObjectId(current_user.id)
    user = await users_collection.find_one({"_id": user_id})
    
    sample_items = user.get("watchlist", [])[:3]  # First 3 items
    
    return {
        "sample_items": sample_items,
        "first_item_type": type(sample_items[0]).__name__ if sample_items else "No items",
        "first_item_structure": dict(sample_items[0]) if sample_items else None
    }
