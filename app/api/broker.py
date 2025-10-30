# routes/broker.py
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from datetime import datetime, timedelta
from bson import ObjectId
from typing import List, Dict, Any
import secrets
import hashlib
from cryptography.fernet import Fernet
import base64

import requests

from database.collections import users_collection, brokers_collection, preferences_collection
from schemas.user import UserInDB
from schemas.broker import (
    BrokerCreate, BrokerResponse, BrokerConnection, 
    UpstoxOAuthRequest, BrokerType, BrokerStatus
)
from .user import get_current_user
from config import settings

router = APIRouter(prefix="/api/broker", tags=["broker"])

# Simple encryption for sensitive data (use proper key management in production)
def encrypt_data(data: str, key: str) -> str:
    fernet = Fernet(base64.urlsafe_b64encode(hashlib.sha256(key.encode()).digest()))
    return fernet.encrypt(data.encode()).decode()

def decrypt_data(encrypted_data: str, key: str) -> str:
    fernet = Fernet(base64.urlsafe_b64encode(hashlib.sha256(key.encode()).digest()))
    return fernet.decrypt(encrypted_data.encode()).decode()

@router.post("/add", response_model=BrokerResponse)
async def add_broker(
    broker: BrokerCreate, 
    current_user: UserInDB = Depends(get_current_user)
):
    """Add a broker connection for the user"""
    
    # Check if broker already exists
    existing = await brokers_collection.find_one({
        "user_id": str(current_user.id),
        "broker_name": broker.broker_name,
        "status": "active"
    })
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{broker.broker_name} broker already connected"
        )

    # Simple broker data without encryption for now
    broker_data = {
        "user_id": str(current_user.id),
        "broker_name": broker.broker_name,
        "display_name": broker.broker_name,  # ✅ Use broker_name as display_name
        "api_key": broker.api_key,  # ✅ Remove encryption for testing
        "api_secret": broker.api_secret,  # ✅ Remove encryption for testing
        "is_active": True,  # ✅ Add required field
        "status": "active",
        "created_at": datetime.utcnow(),
        "last_used": datetime.utcnow(),
        "connection_type": "api_key"
    }

    result = await brokers_collection.insert_one(broker_data)
    broker_data["id"] = str(result.inserted_id)

    # Update user's brokers list
    await users_collection.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$addToSet": {"connected_brokers": broker.broker_name}}
    )

    # ✅ Return only the fields that BrokerResponse expects
    return BrokerResponse(
        id=broker_data["id"],
        broker_name=broker_data["broker_name"],
        display_name=broker_data["display_name"],
        is_active=broker_data["is_active"],
        created_at=broker_data["created_at"],
        last_used=broker_data["last_used"]
    )

@router.get("/list", response_model=List[BrokerResponse])
async def list_brokers(current_user: UserInDB = Depends(get_current_user)):
    """Get all brokers for current user"""
    brokers = await brokers_collection.find({
        "user_id": str(current_user.id),
        "status": "active"
    }).to_list(length=10)
    
    for broker in brokers:
        broker["id"] = str(broker["_id"])
    
    return [BrokerResponse(**broker) for broker in brokers]

@router.post("/upstox/oauth-callback")
async def upstox_oauth_callback(
    oauth_data: UpstoxOAuthRequest,
    current_user: UserInDB = Depends(get_current_user)
):
    """Handle Upstox OAuth callback and store tokens"""
    
    # Exchange authorization code for tokens
    token_url = f"{settings.UPSTOX_BASE_URL}/login/authorization/token"
    data = {
        "code": oauth_data.authorization_code,
        "client_id": settings.UPSTOX_CLIENT_ID,
        "client_secret": settings.UPSTOX_CLIENT_SECRET,
        "redirect_uri": settings.UPSTOX_REDIRECT_URL,
        "grant_type": "authorization_code"
    }
    
    response = requests.post(token_url, data=data)
    token_data = response.json()
    
    if 'access_token' not in token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to get access token from Upstox"
        )
    
    # Get user profile from Upstox
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    profile_response = requests.get(f"{settings.UPSTOX_BASE_URL}/user/profile", headers=headers)
    profile_data = profile_response.json().get('data', {})
    
    # Create or update broker connection
    encryption_key = settings.SECRET_KEY
    
    broker_connection = {
        "user_id": str(current_user.id),
        "broker_name": BrokerType.UPSTOX,
        "display_name": f"Upstox - {profile_data.get('user_name', 'Unknown')}",
        "client_id": settings.UPSTOX_CLIENT_ID,
        "access_token": encrypt_data(token_data['access_token'], encryption_key),
        "refresh_token": encrypt_data(token_data.get('refresh_token', ''), encryption_key),
        "token_expiry": datetime.utcnow() + timedelta(seconds=token_data.get('expires_in', 86400)),
        "broker_user_id": profile_data.get('user_id'),
        "user_profile": profile_data,
        "status": BrokerStatus.ACTIVE,
        "connection_type": "oauth",
        "created_at": datetime.utcnow(),
        "last_used": datetime.utcnow()
    }
    
    # Upsert the connection
    await brokers_collection.update_one(
        {
            "user_id": str(current_user.id),
            "broker_name": BrokerType.UPSTOX
        },
        {"$set": broker_connection},
        upsert=True
    )
    
    # Update user's connected brokers
    await users_collection.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$addToSet": {"connected_brokers": BrokerType.UPSTOX}}
    )
    
    return {
        "message": "Upstox connected successfully",
        "user_profile": profile_data
    }

@router.delete("/{broker_name}")
async def remove_broker(
    broker_name: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """Remove broker connection (soft delete)"""
    
    result = await brokers_collection.update_one(
        {
            "user_id": str(current_user.id),
            "broker_name": broker_name
        },
        {
            "$set": {
                "status": BrokerStatus.INACTIVE,
                "disconnected_at": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Broker connection not found"
        )
    
    # Remove from user's connected brokers list
    await users_collection.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$pull": {"connected_brokers": broker_name}}
    )
    
    return {"message": f"{broker_name} disconnected successfully"}
# Add this to your broker routes for debugging
@router.post("/add-debug")
async def add_broker_debug(
    broker: dict,  # Accept raw dict instead of Pydantic model
    current_user: UserInDB = Depends(get_current_user)
):
    """Debug endpoint to see what's actually being received"""
    print("🔍 DEBUG - Received data:", broker)
    print("🔍 DEBUG - Data types:", {k: type(v) for k, v in broker.items()})
    
    # Try to validate with your schema
    try:
        validated_data = BrokerCreate(**broker)
        print("✅ DEBUG - Validation passed")
        return {"status": "valid", "data": validated_data.dict()}
    except Exception as e:
        print("❌ DEBUG - Validation failed:", str(e))
        return {"status": "invalid", "error": str(e)}