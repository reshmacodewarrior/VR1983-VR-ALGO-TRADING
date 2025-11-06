import datetime
from typing import Any, Dict
from bson import ObjectId
from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import RedirectResponse
from urllib.parse import parse_qs, urlparse
from database.collections import users_collection, brokers_collection
import requests
from app.schemas.user import UserInDB
from app.services.user import get_current_user
from schemas.upstox import DebugConfig, ConnectionStatus
from services.upstox import upstox_service

router = APIRouter(prefix="/api/upstox", tags=["Upstox"])

@router.get("/login")
def login():
    """Redirect to Upstox login page"""
    if not upstox_service.client_id or not upstox_service.client_secret:
        raise HTTPException(
            status_code=500, 
            detail="Upstox credentials not configured. Please check your .env file"
        )
    
    auth_url = upstox_service.construct_auth_url()
    return RedirectResponse(auth_url)

@router.get("/callback")
async def callback(request: Request, current_user: UserInDB = Depends(get_current_user)):
    """Handle callback from Upstox after user authorization"""
    try:
        # Parse URL parameters
        full_url = str(request.url)
        parsed_url = urlparse(full_url)
        query_params = parse_qs(parsed_url.query)
        code_list = query_params.get('code', [])
        
        # Check for existing connection FOR THIS USER
        existing_connection = await brokers_collection.find_one({
            "user_id": str(current_user.id),  # ← Check for this specific user
            "broker_name": "upstox", 
            "status": "active"
        })
        
        if existing_connection:
            user_id = existing_connection.get('broker_user_id') or existing_connection.get('user_profile', {}).get('user_id')
            print(f"✅ Upstox connection already exists for user: {user_id}")
            return RedirectResponse(f"http://localhost:3000/connection-success?user_id={user_id}&status=already_connected")
        
        if not code_list:
            return RedirectResponse("http://localhost:3000/connection-error?error=no_authorization_code")
        
        code = code_list[0]
        print(f"🔐 Processing authorization code: {code}")
        
        # Exchange code for token
        token_data = await upstox_service.exchange_code_for_token(code)
        
        # Get user profile
        profile = upstox_service.get_user_profile(token_data.access_token)
        
        # Store connection WITH USER ID
        user_id = await store_upstox_connection_for_user(profile, token_data, current_user)
        
        print(f"✅ Successfully connected Upstox for user: {user_id}")
        return RedirectResponse(f"http://localhost:3000/connection-success?user_id={user_id}")
        
    except Exception as e:
        print(f"🔐 Callback error: {str(e)}")
        return RedirectResponse(f"http://localhost:3000/connection-error?error={str(e)}")

async def store_upstox_connection_for_user(profile: Dict[str, Any], token_data: Dict[str, Any], current_user: UserInDB) -> str:
    """Store Upstox connection for specific user"""
    
    broker_connection = {
        "user_id": str(current_user.id),  # ← Your app's user ID
        "broker_name": "upstox",
        "broker_user_id": "upstox_user_id",  # ← Upstox's user ID
        "user_name": profile.get('user_name'),
        "email": profile.get('email'),
        "access_token": token_data['access_token'],
        "refresh_token": token_data.get('refresh_token', ''),
        "token_expiry": datetime.now() + datetime.timedelta(seconds=token_data.get('expires_in', 86400)),
        "created_at": datetime.now(),
        "last_used": datetime.now(),
        "is_active": True,
        "status": "active",
        "profile_data": profile
    }
    
    # Upsert the broker connection FOR THIS USER
    result = await broker_connection.update_one(
        {
            "user_id": str(current_user.id),
            "broker_name": "upstox"
        },
        {"$set": broker_connection},
        upsert=True
    )
    
    # Update the main users collection
    await users_collection.update_one(
        {"_id": ObjectId(current_user.id)},
        {
            "$set": {
                "broker_connected": True,
                "broker_name": "upstox",
                "broker_user_id": profile.get('user_id'),
                "last_broker_connection": datetime.now()
            },
            "$addToSet": {
                "connected_brokers": "upstox"
            }
        }
    )
    
    return profile.get('user_id')

@router.get("/debug/login", response_model=DebugConfig)
async def debug_login():
    """Debug endpoint to check Upstox configuration"""
    auth_url = upstox_service.construct_auth_url()
    return DebugConfig(
        client_id=upstox_service.client_id,
        redirect_uri=upstox_service.redirect_uri,
        has_client_id=bool(upstox_service.client_id),
        has_client_secret=bool(upstox_service.client_secret),
        constructed_auth_url=auth_url
    )
