# routers/upstox_routes.py
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
import requests
from urllib.parse import urlencode
import os
import json
from datetime import datetime, timedelta
from bson import ObjectId
from typing import Dict, Any
from config import settings

# Import your existing MongoDB collections
from database.collections import users_collection, brokers_collection

router = APIRouter(prefix="/api/upstox", tags=["Upstox"])
# ✅ NOW USING CENTRALIZED CONFIG
CLIENT_ID = settings.UPSTOX_CLIENT_ID
CLIENT_SECRET = settings.UPSTOX_CLIENT_SECRET
REDIRECT_URL = settings.UPSTOX_REDIRECT_URL

@router.get("/login")
def login():
    if not CLIENT_ID or not CLIENT_SECRET:
        raise HTTPException(
            status_code=500, 
            detail="Upstox credentials not configured. Please check your .env file"
        )
    
    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URL,
        "response_type": "code",
        "scope": "orders placement portfolio trade-read trade-place profile"
    }
    auth_url = f"https://api.upstox.com/v2/login/authorization/dialog?{urlencode(params)}"
    return RedirectResponse(auth_url)

# Step 2: Handle callback after user authorization
@router.get("/callback")
async def callback(code: str, request: Request):
    try:
        # Exchange authorization code for access token
        token_url = "https://api.upstox.com/v2/login/authorization/token"
        data = {
            "code": code,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "redirect_uri": REDIRECT_URL,
            "grant_type": "authorization_code"
        }
        
        response = requests.post(token_url, data=data)
        token_data = response.json()
        
        if 'access_token' not in token_data:
            return JSONResponse(
                status_code=400,
                content={"error": "Failed to get access token", "details": token_data}
            )
        
        # Get user profile to identify the account
        profile = get_user_profile(token_data['access_token'])
        
        # Store tokens in your MongoDB brokers collection
        user_id = await store_upstox_connection(profile, token_data)
        
        # Redirect to success page in frontend
        frontend_success_url = f"http://localhost:3000/connection-success?user_id={user_id}"
        return RedirectResponse(frontend_success_url)
        
    except Exception as e:
        # Redirect to error page
        frontend_error_url = f"http://localhost:3000/connection-error?error={str(e)}"
        return RedirectResponse(frontend_error_url)

async def store_upstox_connection(profile: Dict[str, Any], token_data: Dict[str, Any]) -> str:
    """Store Upstox connection in brokers collection"""
    
    upstox_user_id = profile.get('user_id', 'unknown')
    user_name = profile.get('user_name', 'Unknown User')
    email = profile.get('email', '')
    
    # Prepare broker connection document
    broker_connection = {
        "broker_name": "upstox",
        "broker_user_id": upstox_user_id,
        "user_name": user_name,
        "email": email,
        "access_token": token_data['access_token'],
        "refresh_token": token_data.get('refresh_token', ''),
        "token_expiry": datetime.now() + timedelta(seconds=token_data.get('expires_in', 86400)),
        "created_at": datetime.now(),
        "last_used": datetime.now(),
        "is_active": True,
        "profile_data": profile  # Store full profile for reference
    }
    
    # Upsert the broker connection
    result = await brokers_collection.update_one(
        {
            "broker_name": "upstox",
            "broker_user_id": upstox_user_id
        },
        {"$set": broker_connection},
        upsert=True
    )
    
    # Also update the main users collection if needed
    await users_collection.update_one(
        {"email": email},  # or whatever identifier you use
        {
            "$set": {
                "broker_connected": True,
                "broker_name": "upstox",
                "broker_user_id": upstox_user_id,
                "last_broker_connection": datetime.now()
            },
            "$addToSet": {
                "connected_brokers": "upstox"
            }
        },
        upsert=False  # Only update if user exists
    )
    
    return upstox_user_id

def get_user_profile(access_token: str) -> Dict[str, Any]:
    """Fetch user profile from Upstox"""
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get("https://api.upstox.com/v2/user/profile", headers=headers)
    return response.json().get('data', {})

# Utility function to get active Upstox connection
async def get_upstox_connection(broker_user_id: str = None, email: str = None) -> Dict[str, Any]:
    """Retrieve active Upstox connection from database"""
    query = {"broker_name": "upstox", "is_active": True}
    
    if broker_user_id:
        query["broker_user_id"] = broker_user_id
    elif email:
        # You might need to join with users collection
        user = await users_collection.find_one({"email": email})
        if user and user.get('broker_user_id'):
            query["broker_user_id"] = user['broker_user_id']
    
    connection = await brokers_collection.find_one(query)
    return connection

# Token refresh function
async def refresh_upstox_token(broker_user_id: str) -> bool:
    """Refresh Upstox access token using refresh token"""
    connection = await brokers_collection.find_one({
        "broker_name": "upstox", 
        "broker_user_id": broker_user_id
    })
    
    if not connection or not connection.get('refresh_token'):
        return False
    
    refresh_data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": connection['refresh_token'],
        "grant_type": "refresh_token"
    }
    
    try:
        response = requests.post(
            "https://api.upstox.com/v2/login/authorization/token",
            data=refresh_data
        )
        new_tokens = response.json()
        
        if 'access_token' in new_tokens:
            # Update the connection with new tokens
            await brokers_collection.update_one(
                {"broker_name": "upstox", "broker_user_id": broker_user_id},
                {"$set": {
                    "access_token": new_tokens['access_token'],
                    "refresh_token": new_tokens.get('refresh_token', connection['refresh_token']),
                    "token_expiry": datetime.now() + timedelta(seconds=new_tokens.get('expires_in', 86400)),
                    "last_used": datetime.now()
                }}
            )
            return True
    except Exception as e:
        print(f"Token refresh failed: {e}")
    
    return False