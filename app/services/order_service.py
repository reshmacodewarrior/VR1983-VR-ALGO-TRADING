import requests
from typing import Dict, Any
from database.collections import brokers_collection
from config import settings
import base64
import hashlib
from cryptography.fernet import Fernet

class OrderService:
    
    @staticmethod
    async def place_order_internal(order_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Place order internally without HTTP calls - WORKING VERSION"""
        try:
            print(f"🤖 INTERNAL ORDER for user: {user_id}")
            print(f"   Order data: {order_data}")
            
            # Get user's Upstox connection
            broker_connection = await brokers_collection.find_one({
                "user_id": user_id,
                "broker_name": "upstox",
                "status": "active"
            })
            
            if not broker_connection:
                error_msg = "Upstox connection not found"
                print(f"❌ {error_msg}")
                return {
                    "success": False,
                    "message": "Order placement failed",
                    "error": error_msg
                }
            
            print(f"✅ Found Upstox connection for user: {user_id}")
            
            # Decrypt the access token
            encrypted_token = broker_connection.get('access_token')
            access_token = OrderService.decrypt_data(encrypted_token)
            
            print(f"🔐 Using decrypted token: {access_token[:30]}...")
            
            # Prepare headers
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': f'Bearer {access_token}'
            }
            
            print(f"📤 Making API call to Upstox...")
            
            # Make API call to Upstox
            response = requests.post(
                'https://api.upstox.com/v2/order/place',
                headers=headers,
                json=order_data,
                timeout=30
            )
            
            print(f"📥 Upstox response: {response.status_code}")
            
            if response.status_code == 200:
                order_response = response.json()
                print(f"✅ Internal order successful!")
                print(f"   Response: {order_response}")
                return {
                    "success": True,
                    "message": "Order placed successfully",
                    "data": order_response
                }
            else:
                error_detail = f"Upstox API error: {response.status_code} - {response.text}"
                print(f"❌ Internal order failed: {error_detail}")
                return {
                    "success": False,
                    "message": "Order placement failed",
                    "error": error_detail
                }
                
        except Exception as e:
            error_msg = f"Internal order error: {str(e)}"
            print(f"❌ {error_msg}")
            return {
                "success": False,
                "message": "Order placement failed",
                "error": error_msg
            }
    
    @staticmethod
    def decrypt_data(encrypted_data: str) -> str:
        """Decrypt Fernet encrypted data"""
        if not encrypted_data:
            return ""
        
        try:
            # Check if it's already decrypted (JWT tokens start with eyJ)
            if encrypted_data.startswith('eyJ'):
                return encrypted_data
            
            key = settings.SECRET_KEY
            fernet = Fernet(base64.urlsafe_b64encode(hashlib.sha256(key.encode()).digest()))
            return fernet.decrypt(encrypted_data.encode()).decode()
        except Exception as e:
            print(f"❌ Decryption failed: {str(e)}")
            return encrypted_data

# Global instance
order_service = OrderService()