import os
from fastapi import APIRouter, Depends, HTTPException, status
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
    from bson import ObjectId
    user_id = ObjectId(current_user.id)
    
    user = await users_collection.find_one({"_id": user_id})
    if user:
        return user.get("watchlist", [])
    return []


@router.post("/", response_model=List[WatchlistItem])
async def add_to_watchlist(
    item: WatchlistItem,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Add a symbol to the current user's watchlist.
    Prevents duplicates based on symbol.
    """
    user_id = ObjectId(current_user.id)

    user = await users_collection.find_one({"_id": user_id})
    current_watchlist = user.get("watchlist", [])  # Get current watchlist or empty list

    for existing_item in current_watchlist:
        if existing_item["symbol"] == item.symbol:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Symbol '{item.symbol}' is already in your watchlist."
            )

    updated_watchlist = current_watchlist + [item.dict()]

    result = await users_collection.update_one(
        {"_id": user_id},
        {"$set": {"watchlist": updated_watchlist}}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update watchlist."
        )

    return updated_watchlist

@router.delete("/{symbol}", response_model=List[WatchlistItem])
async def remove_from_watchlist(
    symbol: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Remove a symbol from the current user's watchlist.
    """
    from bson import ObjectId
    user_id = ObjectId(current_user.id)
    
    user = await users_collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_watchlist = user.get("watchlist", [])
    
    found = False
    updated_watchlist = []
    for item in current_watchlist:
        if item["symbol"] == symbol:
            found = True
        else:
            updated_watchlist.append(item)
    
    if not found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Symbol '{symbol}' not found in your watchlist."
        )

    result = await users_collection.update_one(
        {"_id": user_id},
        {"$set": {"watchlist": updated_watchlist}}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update watchlist."
        )

    return updated_watchlist