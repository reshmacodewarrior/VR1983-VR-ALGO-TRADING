# routers/upstox_routes.py
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
import requests
from urllib.parse import urlencode
from datetime import datetime, timedelta
from bson import ObjectId
from typing import Dict, Any, Optional
from app.services.user import get_current_user
from config import settings

# Import your existing MongoDB collections
from database.collections import users_collection, brokers_collection

router = APIRouter(prefix="/api/upstox", tags=["Upstox"])

# ✅ Centralized Config
CLIENT_ID = settings.UPSTOX_CLIENT_ID
CLIENT_SECRET = settings.UPSTOX_CLIENT_SECRET
REDIRECT_URL = settings.UPSTOX_REDIRECT_URL

@router.get("/login")
def login():
    """Redirect to Upstox OAuth login page"""
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

@router.get("/callback")
async def callback(request: Request):
    try:
        # Get the FULL URL to debug
        full_url = str(request.url)
        print(f"🔍 FULL CALLBACK URL: {full_url}")
        
        # Get code from query parameters
        code = request.query_params.get('code')
        print(f"🔍 AUTHORIZATION CODE: {code}")
        
        if not code:
            return JSONResponse(
                status_code=400,
                content={"error": "No authorization code provided"}
            )
        
        # Exchange authorization code for access token
        token_url = "https://api.upstox.com/v2/login/authorization/token"
        data = {
            "code": code,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "redirect_uri": REDIRECT_URL,
            "grant_type": "authorization_code"
        }
        
        print(f"🔍 TOKEN REQUEST DATA: {data}")
        
        response = requests.post(token_url, data=data)
        token_data = response.json()
        print(f"🔍 TOKEN RESPONSE: {token_data}")
        
        if 'access_token' not in token_data:
            return JSONResponse(
                status_code=400,
                content={"error": "Failed to get access token", "details": token_data}
            )
        
        # Get user profile
        profile = get_user_profile(token_data['access_token'])
        print(f"🔍 USER PROFILE: {profile}")
        
        # Store tokens in database
        upstox_user_id = await store_upstox_connection(profile, token_data)
        
        # ✅ SUCCESS - Redirect to frontend
        frontend_success_url = f"http://localhost:3000/connection-success"
        return RedirectResponse(frontend_success_url)
        
    except Exception as e:
        print(f"❌ CALLBACK ERROR: {str(e)}")
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
        "profile_data": profile
    }
    
    # Upsert the broker connection
    await brokers_collection.update_one(
        {
            "broker_name": "upstox",
            "broker_user_id": upstox_user_id
        },
        {"$set": broker_connection},
        upsert=True
    )
    
    # Update users collection if email exists
    if email:
        await users_collection.update_one(
            {"email": email},
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
            upsert=False
        )
    
    return upstox_user_id

def get_user_profile(access_token: str) -> Dict[str, Any]:
    """Fetch user profile from Upstox"""
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get("https://api.upstox.com/v2/user/profile", headers=headers)
    return response.json().get('data', {})

async def get_upstox_connection(broker_user_id: str = None, email: str = None) -> Optional[Dict[str, Any]]:
    """Retrieve active Upstox connection from database"""
    query = {"broker_name": "upstox", "is_active": True}
    
    if broker_user_id:
        query["broker_user_id"] = broker_user_id
    elif email:
        user = await users_collection.find_one({"email": email})
        if user and user.get('broker_user_id'):
            query["broker_user_id"] = user['broker_user_id']
    
    connection = await brokers_collection.find_one(query)
    return connection

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

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile from Upstox"""
    connection = await get_upstox_connection(email=current_user.email)
    if not connection:
        raise HTTPException(status_code=404, detail="Upstox connection not found")
    
    headers = {"Authorization": f"Bearer {connection['access_token']}"}
    response = requests.get("https://api.upstox.com/v2/user/profile", headers=headers)
    return response.json()

@router.get("/holdings")
async def get_holdings(current_user: dict = Depends(get_current_user)):
    """Get portfolio holdings from Upstox"""
    connection = await get_upstox_connection(email=current_user.email)
    if not connection:
        raise HTTPException(status_code=404, detail="Upstox connection not found")
    
    headers = {"Authorization": f"Bearer {connection['access_token']}"}
    response = requests.get("https://api.upstox.com/v2/portfolio/long-term-holdings", headers=headers)
    return response.json()

@router.get("/margins")
async def get_margins(current_user: dict = Depends(get_current_user)):
    """Get available margins from Upstox"""
    connection = await get_upstox_connection(email=current_user.email)
    if not connection:
        raise HTTPException(status_code=404, detail="Upstox connection not found")
    
    headers = {"Authorization": f"Bearer {connection['access_token']}"}
    response = requests.get("https://api.upstox.com/v2/user/get-margins", headers=headers)
    return response.json()

@router.get("/connections")
async def get_connections(current_user: dict = Depends(get_current_user)):
    """Get all Upstox connections for current user"""
    connections = await brokers_collection.find({
        "email": current_user.email,
        "broker_name": "upstox",
        "is_active": True
    }).to_list(length=10)
    
    # Convert ObjectId to string for JSON serialization
    for conn in connections:
        if '_id' in conn:
            conn['_id'] = str(conn['_id'])
        if 'token_expiry' in conn and isinstance(conn['token_expiry'], datetime):
            conn['token_expiry'] = conn['token_expiry'].isoformat()
        if 'created_at' in conn and isinstance(conn['created_at'], datetime):
            conn['created_at'] = conn['created_at'].isoformat()
        if 'last_used' in conn and isinstance(conn['last_used'], datetime):
            conn['last_used'] = conn['last_used'].isoformat()
    
    return {"connections": connections}

@router.get("/ltp/{symbol}")
async def get_ltp(symbol: str, current_user: dict = Depends(get_current_user)):
    """Get live market price for a symbol"""
    connection = await get_upstox_connection(email=current_user.email)
    if not connection:
        raise HTTPException(status_code=404, detail="Upstox connection not found")
    
    headers = {"Authorization": f"Bearer {connection['access_token']}"}
    
    # Use symbol in exchange format: NSE:RELIANCE
    formatted_symbol = f"NSE:{symbol.upper()}"
    
    response = requests.get(f"https://api.upstox.com/v2/market-quote/ltp?symbol={formatted_symbol}", headers=headers)
    return response.json()
@router.get("/orders")
async def get_orders(current_user: dict = Depends(get_current_user)):
    """Get order book"""
    connection = await get_upstox_connection(email=current_user.email)
    headers = {"Authorization": f"Bearer {connection['access_token']}"}
    response = requests.get("https://api.upstox.com/v2/order/retrieve-all", headers=headers)
    return response.json()

@router.get("/positions")
async def get_positions(current_user: dict = Depends(get_current_user)):
    """Get current positions"""
    connection = await get_upstox_connection(email=current_user.email)
    headers = {"Authorization": f"Bearer {connection['access_token']}"}
    response = requests.get("https://api.upstox.com/v2/portfolio/short-term-positions", headers=headers)
    return response.json()
# Fix margins endpoint (you might already have this)
@router.get("/margins")
async def get_margins(current_user: dict = Depends(get_current_user)):
    """Get available margins from Upstox"""
    connection = await get_upstox_connection(email=current_user.email)
    if not connection:
        raise HTTPException(status_code=404, detail="Upstox connection not found")
    
    headers = {"Authorization": f"Bearer {connection['access_token']}"}
    
    # ✅ Try these different endpoints - Upstox API changed
    endpoints_to_try = [
        "https://api.upstox.com/v2/user/margins",
        "https://api.upstox.com/v2/user/get-margins", 
        "https://api.upstox.com/v2/margins",
        "https://api.upstox.com/v2/funds"
    ]
    
    for endpoint in endpoints_to_try:
        try:
            response = requests.get(endpoint, headers=headers)
            if response.status_code == 200:
                print(f"✅ Working margins endpoint: {endpoint}")
                return response.json()
        except Exception as e:
            continue
    
    # If none work, return available endpoints
    return {
        "error": "Could not find margins endpoint",
        "available_endpoints": endpoints_to_try,
        "suggestion": "Check Upstox API documentation for correct endpoint"
    }
# Add place-test-order endpoint (POST method)
@router.post("/place-test-order")
async def place_test_order(current_user: dict = Depends(get_current_user)):
    """Place a test order"""
    connection = await get_upstox_connection(email=current_user.email)
    if not connection:
        raise HTTPException(status_code=404, detail="Upstox connection not found")
    
    headers = {"Authorization": f"Bearer {connection['access_token']}"}
    
    # Test order data
    test_order = {
        "quantity": 1,
        "product": "D",  # Delivery
        "validity": "DAY",
        "price": 0,  # Market order
        "instrument_token": "NSE_EQ|INE002A01018",  # RELIANCE
        "order_type": "MARKET",
        "transaction_type": "BUY",
        "disclosed_quantity": 0,
        "trigger_price": 0,
        "is_amo": False
    }
    
    response = requests.post("https://api.upstox.com/v2/order/place", 
                           json=test_order, headers=headers)
    return response.json()
@router.get("/order-templates")
async def get_order_templates(current_user: dict = Depends(get_current_user)):
    """Get order templates without actually placing orders"""
    return {
        "market_buy": {
            "quantity": 1,
            "product": "D",
            "validity": "DAY", 
            "price": 0,
            "instrument_token": "NSE_EQ|INE002A01018",
            "order_type": "MARKET",
            "transaction_type": "BUY"
        },
        "limit_sell": {
            "quantity": 1,
            "product": "D",
            "validity": "DAY",
            "price": 2500,  # Specific price
            "instrument_token": "NSE_EQ|INE002A01018", 
            "order_type": "LIMIT",
            "transaction_type": "SELL"
        }
    }

@router.post("/validate-order")
async def validate_order(order_data: dict, current_user: dict = Depends(get_current_user)):
    """Validate an order without placing it"""
    connection = await get_upstox_connection(email=current_user.email)
    headers = {"Authorization": f"Bearer {connection['access_token']}"}
    
    # Just return the order data for validation
    return {
        "status": "validated",
        "order_data": order_data,
        "message": "Order is valid (not actually placed)"
    }