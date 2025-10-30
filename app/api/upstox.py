from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
import requests
from urllib.parse import urlencode
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from app.services.user import get_current_user
from config import settings
from database.collections import users_collection, brokers_collection

router = APIRouter(prefix="/api/upstox", tags=["Upstox"])

# ✅ Config
CLIENT_ID = settings.UPSTOX_SANDBOX_CLIENT_ID
CLIENT_SECRET = settings.UPSTOX_SANDBOX_CLIENT_SECRET
REDIRECT_URL = settings.UPSTOX_REDIRECT_URL
FRONTEND_SUCCESS = "http://localhost:3000/connection-success"
FRONTEND_ERROR = "http://localhost:3000/connection-error"


# ============================================
# LOGIN - Redirect user to Upstox Authorization page
# ============================================
@router.get("/login")
def login():
    if not CLIENT_ID or not CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Upstox credentials missing. Check .env settings."
        )

    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URL,
        "response_type": "code",
        "scope": "orders placement portfolio trade-read trade-place profile",
        "ucc": "TEST1234"  # ✅ required only for sandbox
    }

    # ✅ correct sandbox endpoint
    auth_url = f"https://api-sandbox.upstox.com/login/authorization/dialog?{urlencode(params)}"
    print(f"🔗 Redirecting to Upstox Sandbox Login: {auth_url}")
    return RedirectResponse(auth_url)
# ============================================
# CALLBACK - Handle OAuth response
# ============================================
@router.get("/callback")
async def callback(request: Request):
    try:
        full_url = str(request.url)
        print(f"🔍 FULL CALLBACK URL: {full_url}")

        code = request.query_params.get("code")
        if not code:
            print("⚠️ No authorization code found in callback — likely a refresh or stray request.")
            return JSONResponse(
                status_code=200,
                content={"status": "ignored", "reason": "no authorization code provided"}
            )

        # Exchange authorization code for token
        token_url = f"{settings.UPSTOX_BASE_URL}/login/authorization/token"
        data = {
            "code": code,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "redirect_uri": REDIRECT_URL,
            "grant_type": "authorization_code",
        }

        print(f"🔍 TOKEN REQUEST DATA: {data}")
        response = requests.post(token_url, data=data)
        token_data = response.json()
        print(f"🔍 TOKEN RESPONSE: {token_data}")

        # Handle Upstox token structure (they return user info directly sometimes)
        if "access_token" not in token_data:
            # Some Upstox responses embed tokens under 'data'
            if "data" in token_data and "access_token" in token_data["data"]:
                token_data = token_data["data"]
            else:
                return JSONResponse(
                    status_code=400,
                    content={"error": "Failed to retrieve access token", "details": token_data}
                )

        # Get user profile
        profile = get_user_profile(token_data["access_token"])
        print(f"🔍 USER PROFILE: {profile}")

        # Save to DB
        upstox_user_id = await store_upstox_connection(profile, token_data)

        print(f"✅ Upstox connection stored successfully for {profile.get('email')} ({upstox_user_id})")
        return RedirectResponse(FRONTEND_SUCCESS)

    except Exception as e:
        print(f"❌ CALLBACK ERROR: {e}")
        return RedirectResponse(f"{FRONTEND_ERROR}?error={str(e)}")


# ============================================
# DATABASE OPERATIONS
# ============================================
async def store_upstox_connection(profile: Dict[str, Any], token_data: Dict[str, Any]) -> str:
    upstox_user_id = profile.get("user_id", "unknown")
    user_name = profile.get("user_name", "Unknown User")
    email = profile.get("email", "")

    broker_doc = {
        "broker_name": "upstox",
        "broker_user_id": upstox_user_id,
        "user_name": user_name,
        "email": email,
        "access_token": token_data["access_token"],
        "refresh_token": token_data.get("refresh_token", ""),
        "token_expiry": datetime.now() + timedelta(seconds=token_data.get("expires_in", 86400)),
        "created_at": datetime.now(),
        "last_used": datetime.now(),
        "is_active": True,
        "profile_data": profile
    }

    await brokers_collection.update_one(
        {"broker_name": "upstox", "broker_user_id": upstox_user_id},
        {"$set": broker_doc},
        upsert=True
    )

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
                "$addToSet": {"connected_brokers": "upstox"}
            },
            upsert=False
        )

    return upstox_user_id


def get_user_profile(access_token: str) -> Dict[str, Any]:
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{settings.UPSTOX_BASE_URL}/user/profile", headers=headers)
    data = response.json()
    return data.get("data", data)

async def get_valid_access_token(email: str) -> str:
    """Get valid access token with automatic refresh if needed"""
    conn = await get_upstox_connection(email=email)
    if not conn:
        raise HTTPException(status_code=404, detail="Upstox connection not found")
    
    # Check if token needs refresh (5 minute buffer)
    if conn["token_expiry"] - timedelta(minutes=5) < datetime.now():
        print("🔄 Token expired or near expiry, attempting refresh...")
        if not await refresh_upstox_token(conn["broker_user_id"]):
            raise HTTPException(status_code=401, detail="Token refresh failed")
        # Reload connection after refresh
        conn = await get_upstox_connection(email=email)
    
    return conn["access_token"]
async def get_upstox_connection(broker_user_id: str = None, email: str = None) -> Optional[Dict[str, Any]]:
    query = {"broker_name": "upstox", "is_active": True}
    if broker_user_id:
        query["broker_user_id"] = broker_user_id
    elif email:
        user = await users_collection.find_one({"email": email})
        if user and user.get("broker_user_id"):
            query["broker_user_id"] = user["broker_user_id"]
    return await brokers_collection.find_one(query)


# ============================================
# UTILITY: REFRESH TOKEN
# ============================================
async def refresh_upstox_token(broker_user_id: str) -> bool:
    conn = await brokers_collection.find_one({"broker_name": "upstox", "broker_user_id": broker_user_id})
    if not conn or not conn.get("refresh_token"):
        return False

    try:
        data = {
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "refresh_token": conn["refresh_token"],
            "grant_type": "refresh_token"
        }
        response = requests.post(f"{settings.UPSTOX_BASE_URL}/login/authorization/token", data=data)
        new_tokens = response.json()

        if "access_token" in new_tokens:
            await brokers_collection.update_one(
                {"broker_name": "upstox", "broker_user_id": broker_user_id},
                {"$set": {
                    "access_token": new_tokens["access_token"],
                    "refresh_token": new_tokens.get("refresh_token", conn["refresh_token"]),
                    "token_expiry": datetime.now() + timedelta(seconds=new_tokens.get("expires_in", 86400)),
                    "last_used": datetime.now()
                }}
            )
            return True
    except Exception as e:
        print(f"Token refresh failed: {e}")
    return False


# ============================================
# UPSTOX API ROUTES
# ============================================
@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    conn = await get_upstox_connection(email=current_user.email)
    if not conn:
        raise HTTPException(status_code=404, detail="Upstox connection not found")
    headers = {"Authorization": f"Bearer {conn['access_token']}"}
    return requests.get(f"{settings.UPSTOX_BASE_URL}/user/profile", headers=headers).json()


@router.get("/holdings")
async def get_holdings(current_user: dict = Depends(get_current_user)):
    conn = await get_upstox_connection(email=current_user.email)
    if not conn:
        raise HTTPException(status_code=404, detail="Upstox connection not found")
    headers = {"Authorization": f"Bearer {conn['access_token']}"}
    return requests.get(f"{settings.UPSTOX_BASE_URL}/portfolio/long-term-holdings", headers=headers).json()


@router.get("/positions")
async def get_positions(current_user: dict = Depends(get_current_user)):
    conn = await get_upstox_connection(email=current_user.email)
    if not conn:
        raise HTTPException(status_code=404, detail="Upstox connection not found")
    headers = {"Authorization": f"Bearer {conn['access_token']}"}
    return requests.get(f"{settings.UPSTOX_BASE_URL}/portfolio/short-term-positions", headers=headers).json()


@router.get("/orders")
async def get_orders(current_user: dict = Depends(get_current_user)):
    conn = await get_upstox_connection(email=current_user.email)
    if not conn:
        raise HTTPException(status_code=404, detail="Upstox connection not found")
    headers = {"Authorization": f"Bearer {conn['access_token']}"}
    return requests.get(f"{settings.UPSTOX_BASE_URL}/order/retrieve-all", headers=headers).json()


@router.get("/margins")
async def get_margins(current_user: dict = Depends(get_current_user)):
    conn = await get_upstox_connection(email=current_user.email)
    if not conn:
        raise HTTPException(status_code=404, detail="Upstox connection not found")

    headers = {"Authorization": f"Bearer {conn['access_token']}"}
    endpoints_to_try = [
        f"{settings.UPSTOX_BASE_URL}/user/margins",
        f"{settings.UPSTOX_BASE_URL}/user/get-margins",
       f"{settings.UPSTOX_BASE_URL}/margins",
        f"{settings.UPSTOX_BASE_URL}/funds"
    ]

    for url in endpoints_to_try:
        try:
            r = requests.get(url, headers=headers)
            if r.status_code == 200:
                print(f"✅ Working margins endpoint: {url}")
                return r.json()
        except Exception:
            continue

    return {"error": "Could not fetch margins", "tried": endpoints_to_try}


@router.post("/place-test-order")
async def place_test_order(current_user: dict = Depends(get_current_user)):
    conn = await get_upstox_connection(email=current_user.email)
    if not conn:
        raise HTTPException(status_code=404, detail="Upstox connection not found")

    headers = {"Authorization": f"Bearer {conn['access_token']}"}
    order = {
        "quantity": 1,
        "product": "D",
        "validity": "DAY",
        "price": 0,
        "instrument_token": "NSE_EQ|INE002A01018",  # RELIANCE
        "order_type": "MARKET",
        "transaction_type": "BUY",
        "disclosed_quantity": 0,
        "trigger_price": 0,
        "is_amo": False
    }
    return requests.post(f"{settings.UPSTOX_BASE_URL}/order/place", json=order, headers=headers).json()


@router.get("/connections")
async def get_connections(current_user: dict = Depends(get_current_user)):
    connections = await brokers_collection.find(
        {"email": current_user.email, "broker_name": "upstox", "is_active": True}
    ).to_list(length=10)

    for conn in connections:
        if "_id" in conn:
            conn["_id"] = str(conn["_id"])
        for field in ["token_expiry", "created_at", "last_used"]:
            if field in conn and isinstance(conn[field], datetime):
                conn[field] = conn[field].isoformat()

    return {"connections": connections}


@router.get("/ltp/{symbol}")
async def get_ltp(symbol: str, current_user: dict = Depends(get_current_user)):
    conn = await get_upstox_connection(email=current_user.email)
    if not conn:
        raise HTTPException(status_code=404, detail="Upstox connection not found")
    headers = {"Authorization": f"Bearer {conn['access_token']}"}
    formatted_symbol = f"NSE:{symbol.upper()}"
    return requests.get(f"{settings.UPSTOX_BASE_URL}/market-quote/ltp?symbol={formatted_symbol}", headers=headers).json()


@router.post("/validate-order")
async def validate_order(order_data: dict, current_user: dict = Depends(get_current_user)):
    return {"status": "validated", "order_data": order_data, "message": "Order validated (not executed)"}
@router.get("/mode")
async def check_upstox_mode(current_user: dict = Depends(get_current_user)):
    """Detect whether Upstox connection is Sandbox or Live"""
    connection = await get_upstox_connection(email=current_user.email)
    if not connection:
        raise HTTPException(status_code=404, detail="Upstox connection not found")

    token = connection["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{settings.UPSTOX_BASE_URL}/user/profile", headers=headers)

    try:
        data = response.json().get("data", {})
    except:
        return {"mode": "unknown"}

    if data.get("user_id", "").startswith("TEST"):
        return {"mode": "sandbox"}
    else:
        return {"mode": "live"}

