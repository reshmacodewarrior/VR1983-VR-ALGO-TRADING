# api/upstox.py - UPDATED
from datetime import datetime, timedelta  # Add this import at the top
from typing import Any, Dict, List
from bson import ObjectId
from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import RedirectResponse
from urllib.parse import parse_qs, urlparse
from database.collections import users_collection, brokers_collection,trading_signals_collection,trading_orders_collection
import requests
from app.schemas.user import UserInDB
from app.services.user import get_current_user
from schemas.upstox import DebugConfig, ConnectionStatus, MultiOrderRequest, MultiOrderResponse, UpstoxMultiOrder
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
        
        # Check for existing connection
        existing_connection = await upstox_service.get_active_connection_for_user(str(current_user.id))
        
        if existing_connection:
            user_id = existing_connection.get('broker_user_id')
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
        
        # ✅ Use the corrected service method
        user_id = await upstox_service.store_connection_for_user(profile, token_data, str(current_user.id))
        
        print(f"✅ Successfully connected Upstox for user: {user_id}")
        return RedirectResponse(f"http://localhost:3000/connection-success?user_id={user_id}")
        
    except Exception as e:
        print(f"🔐 Callback error: {str(e)}")
        return RedirectResponse(f"http://localhost:3000/connection-error?error={str(e)}")

@router.post("/order/place")
async def place_order(
    order_data: Dict[str, Any],
    user_id: str = None,  # Accept user_id directly
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Place an order through Upstox - FIXED VERSION
    """
    try:
        # Use provided user_id or fallback to current_user
        target_user_id = user_id or str(current_user.id)
        
        print(f"🎯 Placing order for user: {target_user_id}")
        
        # Get user's Upstox connection
        broker_connection = await brokers_collection.find_one({
            "user_id": target_user_id,
            "broker_name": "upstox",
            "status": "active"
        })
        
        if not broker_connection:
            raise HTTPException(
                status_code=400,
                detail="Upstox connection not found. Please connect your Upstox account first."
            )
        
        # 🔓 DECRYPT the access token
        encrypted_token = broker_connection.get('access_token')
        access_token = decrypt_data(encrypted_token)
        
        print(f"✅ Using decrypted token: {access_token[:30]}...")
        
        # Test the token first
        headers = {'Authorization': f'Bearer {access_token}', 'Accept': 'application/json'}
        test_response = requests.get('https://api.upstox.com/v2/user/profile', headers=headers, timeout=10)
        
        if test_response.status_code != 200:
            print(f"❌ Token is invalid: {test_response.status_code}")
            return {
                "success": False,
                "message": "Token is invalid. Please reconnect your Upstox account.",
                "error": test_response.text
            }
        
        # Prepare headers for order placement
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': f'Bearer {access_token}'
        }
        
        print(f"📤 Placing order for {order_data.get('instrument_token', 'unknown')}...")
        
        # Make API call to Upstox
        response = requests.post(
            'https://api.upstox.com/v2/order/place',
            headers=headers,
            json=order_data,
            timeout=30
        )
        
        if response.status_code == 200:
            order_response = response.json()
            print(f"✅ Order placed successfully!")
            return {
                "success": True,
                "message": "Order placed successfully",
                "data": order_response
            }
        else:
            error_detail = f"Upstox API error: {response.status_code} - {response.text}"
            print(f"❌ Order placement failed: {error_detail}")
            return {
                "success": False,
                "message": "Order placement failed",
                "error": error_detail
            }
            
    except Exception as e:
        print(f"❌ Order placement error: {str(e)}")
        return {
            "success": False,
            "message": "Order placement failed",
            "error": str(e)
        }
    
@router.post("/order/place-automated")
async def place_order_automated(
    order_data: Dict[str, Any],
    user_id: str  # Required for automated trading
):
    """
    Place order for automated trading - simplified version
    """
    try:
        print(f"🤖 AUTOMATED ORDER for user: {user_id}")
        
        # Get user's Upstox connection
        broker_connection = await brokers_collection.find_one({
            "user_id": user_id,
            "broker_name": "upstox",
            "status": "active"
        })
        
        if not broker_connection:
            return {
                "success": False,
                "message": "Upstox connection not found",
                "error": "No active Upstox connection"
            }
        
        # Decrypt the access token
        encrypted_token = broker_connection.get('access_token')
        access_token = decrypt_data(encrypted_token)
        
        print(f"🔐 Using token: {access_token[:20]}...")
        
        # Prepare headers
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': f'Bearer {access_token}'
        }
        
        # Make API call to Upstox
        response = requests.post(
            'https://api.upstox.com/v2/order/place',
            headers=headers,
            json=order_data,
            timeout=30
        )
        
        if response.status_code == 200:
            order_response = response.json()
            print(f"✅ Automated order successful!")
            return {
                "success": True,
                "message": "Order placed successfully",
                "data": order_response
            }
        else:
            error_detail = f"Upstox API error: {response.status_code} - {response.text}"
            print(f"❌ Automated order failed: {error_detail}")
            return {
                "success": False,
                "message": "Order placement failed",
                "error": error_detail
            }
            
    except Exception as e:
        print(f"❌ Automated order error: {str(e)}")
        return {
            "success": False,
            "message": "Order placement failed",
            "error": str(e)
        }
@router.get("/debug/connections")
async def debug_connections(current_user: UserInDB = Depends(get_current_user)):
    """Debug all connections for current user"""
    connections = await brokers_collection.find({
        "user_id": str(current_user.id)
    }).to_list(length=10)
    
    for conn in connections:
        conn["_id"] = str(conn["_id"])
    
    return {"connections": connections}

@router.get("/debug/validate-token")
async def debug_validate_token(current_user: UserInDB = Depends(get_current_user)):
    """Validate if token works with Upstox API"""
    broker_connection = await upstox_service.get_active_connection_for_user(str(current_user.id))
    
    if not broker_connection:
        return {"valid": False, "error": "No connection found"}
    
    access_token = broker_connection.get('access_token')
    
    # Test token with profile API
    headers = {
        'Accept': 'application/json',
        'Authorization': f'Bearer {access_token}'
    }
    
    try:
        response = requests.get(
            'https://api.upstox.com/v2/user/profile',
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            return {"valid": True, "message": "Token is valid", "profile": response.json()}
        else:
            return {"valid": False, "error": f"Token validation failed: {response.status_code}", "details": response.text}
            
    except Exception as e:
        return {"valid": False, "error": str(e)}
@router.get("/debug/token-raw")
async def debug_token_raw(current_user: UserInDB = Depends(get_current_user)):
    """Debug raw token data from database"""
    broker_connection = await brokers_collection.find_one({
        "user_id": str(current_user.id),
        "broker_name": "upstox"
    })
    
    if not broker_connection:
        return {"error": "No broker connection found"}
    
    return {
        "has_access_token": bool(broker_connection.get('access_token')),
        "access_token_length": len(broker_connection.get('access_token', '')),
        "access_token_preview": broker_connection.get('access_token', '')[:50] + "..." if broker_connection.get('access_token') else None,
        "has_refresh_token": bool(broker_connection.get('refresh_token')),
        "refresh_token_preview": broker_connection.get('refresh_token', '')[:20] + "..." if broker_connection.get('refresh_token') else None,
        "token_expiry": broker_connection.get('token_expiry'),
        "current_time": datetime.now(),
        "is_expired": broker_connection.get('token_expiry') and broker_connection.get('token_expiry') < datetime.now(),
        "broker_user_id": broker_connection.get('broker_user_id'),
        "user_name": broker_connection.get('user_name')
    }
@router.get("/debug/decrypted-token")
async def debug_decrypted_token(current_user: UserInDB = Depends(get_current_user)):
    """Check the decrypted token"""
    token_data = await upstox_service.get_decrypted_tokens_for_user(str(current_user.id))
    
    if not token_data:
        return {"error": "No token data found"}
    
    access_token = token_data['access_token']
    
    # Analyze the decrypted token
    token_analysis = {
        'length': len(access_token),
        'preview': access_token[:50] + "..." if len(access_token) > 50 else access_token,
        'is_jwt': access_token.startswith('eyJ'),
        'parts': len(access_token.split('.')),
        'starts_with_eyJ': access_token.startswith('eyJ')
    }
    
    # Test the decrypted token
    headers = {'Authorization': f'Bearer {access_token}', 'Accept': 'application/json'}
    try:
        response = requests.get('https://api.upstox.com/v2/user/profile', headers=headers, timeout=10)
        token_analysis['api_test'] = {
            'status_code': response.status_code,
            'valid': response.status_code == 200
        }
    except Exception as e:
        token_analysis['api_test'] = {'error': str(e)}
    
    return {
        'token_analysis': token_analysis,
        'has_refresh_token': bool(token_data.get('refresh_token')),
        'token_expiry': token_data.get('token_expiry'),
        'is_expired': token_data.get('token_expiry') and token_data.get('token_expiry') < datetime.now()
    }
# Add this to your api/upstox.py (TEMPORARY - for testing)

import base64
import hashlib
from cryptography.fernet import Fernet

def decrypt_data(encrypted_data: str) -> str:
    """EXACT SAME decryption as api/broker.py"""
    if not encrypted_data:
        return ""
    
    try:
        # Use the SAME secret key as broker.py
        from config import settings
        key = settings.SECRET_KEY
        
        # Create Fernet instance with the SAME key derivation
        fernet = Fernet(base64.urlsafe_b64encode(hashlib.sha256(key.encode()).digest()))
        
        # Decrypt the data
        decrypted = fernet.decrypt(encrypted_data.encode()).decode()
        
        print(f"🔓 Decryption successful:")
        print(f"   Encrypted: {encrypted_data[:50]}...")
        print(f"   Decrypted: {decrypted[:50]}...")
        
        return decrypted
        
    except Exception as e:
        print(f"❌ Decryption failed: {str(e)}")
        # Return the original, might help with debugging
        return encrypted_data

@router.get("/debug/decryption-test")
async def debug_decryption_test(current_user: UserInDB = Depends(get_current_user)):
    """Test decryption with different approaches"""
    broker_connection = await brokers_collection.find_one({
        "user_id": str(current_user.id),
        "broker_name": "upstox"
    })
    
    if not broker_connection:
        return {"error": "No connection found"}
    
    encrypted_token = broker_connection.get('access_token', '')
    
    # Test 1: Direct decryption
    decrypted_1 = decrypt_data(encrypted_token)
    
    # Test 2: Check if it's base64 encoded
    try:
        import base64
        decoded_base64 = base64.b64decode(encrypted_token).decode('utf-8')
    except:
        decoded_base64 = "Not base64"
    
    return {
        "encrypted_length": len(encrypted_token),
        "encrypted_preview": encrypted_token[:100],
        "decrypted_1_length": len(decrypted_1),
        "decrypted_1_preview": decrypted_1[:100],
        "decrypted_1_is_jwt": decrypted_1.startswith('eyJ'),
        "base64_decoded": decoded_base64[:100] if decoded_base64 != "Not base64" else "Not base64"
    }
@router.post("/force-reconnect")
async def force_reconnect(current_user: UserInDB = Depends(get_current_user)):
    """Force reconnect by deleting old connection and providing new auth URL"""
    
    # Delete ALL existing Upstox connections for this user
    result = await brokers_collection.delete_many({
        "user_id": str(current_user.id),
        "broker_name": "upstox"
    })
    
    print(f"🗑️ Deleted {result.deleted_count} old Upstox connections")
    
    # Get new auth URL
    auth_url = upstox_service.construct_auth_url()
    
    return {
        "message": "Please reconnect using the URL below",
        "auth_url": auth_url,
        "deleted_connections": result.deleted_count
    }
from datetime import datetime, timedelta
from bson import ObjectId

@router.get("/debug/live-activity")
async def debug_live_activity(current_user: UserInDB = Depends(get_current_user)):
    """Get real-time trading activity - WORKING VERSION"""
    try:
        user_id = str(current_user.id)
        
        print(f"🔍 Checking live activity for user: {user_id}")
        
        # Recent signals (last 1 hour)
        recent_signals = await trading_signals_collection.find({
            "user_id": user_id,
            "timestamp": {"$gte": datetime.now() - timedelta(hours=1)}
        }).sort("timestamp", -1).to_list(length=20)
        
        # Recent orders (last 1 hour)
        recent_orders = await trading_orders_collection.find({
            "user_id": user_id,
            "placed_at": {"$gte": datetime.now() - timedelta(hours=1)}
        }).sort("placed_at", -1).to_list(length=20)
        
        print(f"📊 Found {len(recent_signals)} signals and {len(recent_orders)} orders")
        
        # Format response
        for signal in recent_signals:
            signal["_id"] = str(signal["_id"])
            if 'strategy_id' in signal and signal['strategy_id']:
                signal["strategy_id"] = str(signal["strategy_id"])
        
        for order in recent_orders:
            order["_id"] = str(order["_id"])
            if 'signal_id' in order and order['signal_id']:
                order["signal_id"] = str(order["signal_id"])
        
        return {
            "success": True,
            "signals_last_hour": len(recent_signals),
            "orders_last_hour": len(recent_orders),
            "recent_signals": recent_signals,
            "recent_orders": recent_orders,
            "checked_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Live activity error: {str(e)}")
        return {"success": False, "error": str(e)}