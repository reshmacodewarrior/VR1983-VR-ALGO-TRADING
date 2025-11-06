import requests
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from config import settings
from database.collections import users_collection, brokers_collection
from schemas.upstox import UpstoxUserProfile, UpstoxConnection, UpstoxTokenResponse

class UpstoxService:
    def __init__(self):
        self.client_id = settings.UPSTOX_CLIENT_ID
        self.client_secret = settings.UPSTOX_CLIENT_SECRET
        self.redirect_uri = settings.UPSTOX_REDIRECT_URL
        self.base_url = settings.UPSTOX_BASE_URL

    async def exchange_code_for_token(self, code: str) -> UpstoxTokenResponse:
        """Exchange authorization code for access token"""
        token_url = f"{self.base_url}/login/authorization/token"
        data = {
            "code": code,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "redirect_uri": self.redirect_uri,
            "grant_type": "authorization_code"
        }
        
        response = requests.post(token_url, data=data)
        response.raise_for_status()
        return UpstoxTokenResponse(**response.json())

    def get_user_profile(self, access_token: str) -> UpstoxUserProfile:
        """Fetch user profile from Upstox"""
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(f"{self.base_url}/user/profile", headers=headers)
        response.raise_for_status()
        profile_data = response.json().get('data', {})
        return UpstoxUserProfile(**profile_data)

    async def store_connection(self, profile: UpstoxUserProfile, token_data: UpstoxTokenResponse) -> str:
        """Store Upstox connection in database with validation"""
        
        # Validate critical fields
        if not profile.user_id:
            raise ValueError("User ID is missing from profile")
        
        broker_connection = {
            "broker_name": "upstox",
            "broker_user_id": profile.user_id,
            "user_name": profile.user_name or "Unknown User",
            "email": profile.email or "",
            "access_token": token_data.access_token,
            "refresh_token": token_data.refresh_token or "",
            "token_expiry": datetime.now() + timedelta(seconds=token_data.expires_in or 86400),
            "created_at": datetime.now(),
            "last_used": datetime.now(),
            "is_active": True,
            "profile_data": profile.dict()
        }
        
        print(f"💾 Storing connection for user: {profile.user_id}")
        print(f"💾 User name: {profile.user_name}")
        print(f"💾 Email: {profile.email}")
        
        # Upsert broker connection
        result = await brokers_collection.update_one(
            {"broker_name": "upstox", "broker_user_id": profile.user_id},
            {"$set": broker_connection},
            upsert=True
        )
        
        print(f"💾 Database operation: matched={result.matched_count}, modified={result.modified_count}")
        
        return profile.user_id
    async def get_active_connection(self, broker_user_id: str = None, email: str = None) -> Optional[Dict[str, Any]]:
        """Retrieve active Upstox connection from database"""
        query = {"broker_name": "upstox", "is_active": True}
        
        if broker_user_id:
            query["broker_user_id"] = broker_user_id
        elif email:
            user = await users_collection.find_one({"email": email})
            if user and user.get('broker_user_id'):
                query["broker_user_id"] = user['broker_user_id']
        
        return await brokers_collection.find_one(query)

    async def refresh_token(self, broker_user_id: str) -> bool:
        """Refresh Upstox access token"""
        connection = await self.get_active_connection(broker_user_id)
        if not connection or not connection.get('refresh_token'):
            return False
        
        refresh_data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "refresh_token": connection['refresh_token'],
            "grant_type": "refresh_token"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/login/authorization/token",
                data=refresh_data
            )
            new_tokens = UpstoxTokenResponse(**response.json())
            
            await brokers_collection.update_one(
                {"broker_name": "upstox", "broker_user_id": broker_user_id},
                {"$set": {
                    "access_token": new_tokens.access_token,
                    "refresh_token": new_tokens.refresh_token or connection['refresh_token'],
                    "token_expiry": datetime.now() + timedelta(seconds=new_tokens.expires_in or 86400),
                    "last_used": datetime.now()
                }}
            )
            return True
        except Exception:
            return False

    async def get_connection_status(self) -> Dict[str, Any]:
        """Check connection status with better error handling"""
        connection = await self.get_active_connection()
        print(f"🔍 Connection found: {connection}")  # Debug log
        
        if connection:
            return {
                "connected": True,
                "user_id": connection.get('broker_user_id'),
                "user_name": connection.get('user_name'),
                "email": connection.get('email'),
                "connected_since": connection.get('created_at'),
                "token_valid": connection.get('token_expiry', datetime.now()) > datetime.now()
            }
        return {"connected": False}
    def construct_auth_url(self) -> str:
        """Construct Upstox authorization URL"""
        from urllib.parse import urlencode
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": "orders placement portfolio trade-read trade-place profile"
        }
        return f"{self.base_url}/login/authorization/dialog?{urlencode(params)}"

# Service instance
upstox_service = UpstoxService()