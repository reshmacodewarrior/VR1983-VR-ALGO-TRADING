# services/upstox.py - UPDATED
import base64
import hashlib
from cryptography.fernet import Fernet
from bson import ObjectId
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
    
    def _decrypt_data(self, encrypted_data: str) -> str:
        """Decrypt Fernet encrypted data"""
        if not encrypted_data:
            return ""
        
        try:
            # Check if it's already decrypted (JWT tokens start with eyJ)
            if encrypted_data.startswith('eyJ'):
                return encrypted_data
            
            fernet = Fernet(base64.urlsafe_b64encode(hashlib.sha256(self.encryption_key.encode()).digest()))
            return fernet.decrypt(encrypted_data.encode()).decode()
        except Exception as e:
            print(f"❌ Decryption failed: {str(e)}")
            # Return as-is, might already be decrypted
            return encrypted_data

    def _encrypt_data(self, data: str) -> str:
        """Encrypt data with Fernet"""
        if not data:
            return ""
        fernet = Fernet(base64.urlsafe_b64encode(hashlib.sha256(self.encryption_key.encode()).digest()))
        return fernet.encrypt(data.encode()).decode()

    async def get_decrypted_tokens_for_user(self, user_id: str) -> Dict[str, Any]:
        """Get decrypted tokens for specific user"""
        broker_connection = await self.get_active_connection_for_user(user_id)
        
        if not broker_connection:
            return None
        
        # Decrypt the tokens
        access_token = self._decrypt_data(broker_connection.get('access_token'))
        refresh_token = self._decrypt_data(broker_connection.get('refresh_token'))
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_expiry': broker_connection.get('token_expiry'),
            'broker_user_id': broker_connection.get('broker_user_id'),
            'connection_id': broker_connection['_id']
        }

    async def get_active_connection_for_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get active Upstox connection for specific user"""
        return await brokers_collection.find_one({
            "user_id": user_id,
            "broker_name": "upstox", 
            "status": "active"
        })
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

    async def store_connection_for_user(self, profile: UpstoxUserProfile, token_data: UpstoxTokenResponse, user_id: str) -> str:
        """Store Upstox connection for specific user with user_id"""
        
        if not profile.user_id:
            raise ValueError("User ID is missing from profile")
        
        broker_connection = {
            "user_id": user_id,  # ✅ Add the app user_id
            "broker_name": "upstox",
            "broker_user_id": profile.user_id,  # Upstox user ID
            "user_name": profile.user_name or "Unknown User",
            "email": profile.email or "",
            "access_token": token_data.access_token,
            "refresh_token": token_data.refresh_token or "",
            "token_expiry": datetime.now() + timedelta(seconds=token_data.expires_in or 86400),
            "created_at": datetime.now(),
            "last_used": datetime.now(),
            "is_active": True,
            "status": "active",
            "profile_data": profile.dict()
        }
        
        print(f"💾 Storing connection for app user: {user_id}, upstox user: {profile.user_id}")
        
        # ✅ Use brokers_collection (not broker_connection)
        result = await brokers_collection.update_one(
            {
                "user_id": user_id,  # ✅ Query by app user_id
                "broker_name": "upstox"
            },
            {"$set": broker_connection},
            upsert=True
        )
        
        # Update main users collection
        await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "broker_connected": True,
                    "broker_name": "upstox",
                    "broker_user_id": profile.user_id,
                    "last_broker_connection": datetime.now()
                },
                "$addToSet": {
                    "connected_brokers": "upstox"
                }
            }
        )
        
        print(f"💾 Database result - matched: {result.matched_count}, modified: {result.modified_count}")
        return profile.user_id

    async def get_active_connection_for_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get active Upstox connection for specific user"""
        return await brokers_collection.find_one({
            "user_id": user_id,
            "broker_name": "upstox", 
            "status": "active"
        })

    async def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh access token using refresh token"""
        try:
            data = {
                'grant_type': 'refresh_token',
                'refresh_token': refresh_token,
                'client_id': self.client_id,
                'client_secret': self.client_secret
            }
            
            response = requests.post(
                f'{self.base_url}/login/authorization/token',
                data=data,
                headers={'Accept': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Token refresh failed: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ Token refresh error: {str(e)}")
            raise

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