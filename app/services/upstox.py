from typing import Optional
from app.config import settings
import httpx

def get_upstox_config():
    if settings.ENVIRONMENT.lower() == "sandbox":
        return {
            "client_id": settings.UPSTOX_SANDBOX_CLIENT_ID,
            "client_secret": settings.UPSTOX_SANDBOX_CLIENT_SECRET,
            "redirect_uri": settings.UPSTOX_SANDBOX_REDIRECT_URL,
            "base_url": settings.UPSTOX_SANDBOX_BASE_URL,
            "auth_url": settings.UPSTOX_SANDBOX_AUTH_URL,
        }
    else:
        return {
            "client_id": settings.UPSTOX_LIVE_CLIENT_ID,
            "client_secret": settings.UPSTOX_LIVE_CLIENT_SECRET,
            "redirect_uri": settings.UPSTOX_LIVE_REDIRECT_URL,
            "base_url": settings.UPSTOX_LIVE_BASE_URL,
            "auth_url": settings.UPSTOX_LIVE_AUTH_URL,
        }

async def exchange_auth_code_for_token(code: str):
    """Service to exchange authorization code for access token"""
    config = get_upstox_config()
    token_url = f"{config['base_url']}/login/authorization/token"

    payload = {
        "code": code,
        "client_id": config["client_id"],
        "client_secret": config["client_secret"],
        "redirect_uri": config["redirect_uri"],
        "grant_type": "authorization_code",
    }

    headers = {
        "accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(token_url, headers=headers, data=payload)
        return response

async def place_order_api(order_data: dict):
    """Service to place a single order"""
    config = get_upstox_config()
    token = settings.UPSTOX_SANDBOX_ACCESS_TOKEN

    if not token:
        raise ValueError("Sandbox access token not configured")

    url = f"{config['base_url']}/order/place"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(url, headers=headers, json=order_data)
        return response

async def place_multiple_orders_api(orders_data: list):
    """Service to place multiple orders"""
    config = get_upstox_config()
    token = settings.UPSTOX_SANDBOX_ACCESS_TOKEN

    if not token:
        raise ValueError("Sandbox access token not configured")

    url = f"{config['base_url']}/order/multi/place"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(url, headers=headers, json=orders_data)
        return response
    
async def modify_order_api(order_data: dict):
    """Service to modify an existing order"""
    config = get_upstox_config()
    token = settings.UPSTOX_SANDBOX_ACCESS_TOKEN

    if not token:
        raise ValueError("Access token not configured")

    # Note: Different base URL for HFT API
    if settings.ENVIRONMENT.lower() == "sandbox":
        url = "https://api-hft.upstox.com/v3/order/modify"
    else:
        url = "https://api-hft.upstox.com/v3/order/modify"

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.put(url, headers=headers, json=order_data)
        return response
    
async def get_order_history_api(order_id: str):
    """Service to get order history"""
    config = get_upstox_config()
    token = settings.UPSTOX_SANDBOX_ACCESS_TOKEN

    if not token:
        raise ValueError("Access token not configured")

    url = f"{config['base_url']}/order/history"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    params = {
        "order_id": order_id
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(url, headers=headers, params=params)
        return response
    
async def get_all_orders_api(
    page: int = 1, 
    page_size: int = 50,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    order_status: Optional[str] = None
):
    """Service to get all orders with pagination and filtering"""
    config = get_upstox_config()
    token = settings.UPSTOX_SANDBOX_ACCESS_TOKEN

    if not token:
        raise ValueError("Access token not configured")

    url = f"{config['base_url']}/order/retrieve-all"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    params = {
        "page": page,
        "page_size": page_size
    }
    
    # Add optional filters
    if from_date:
        params["from_date"] = from_date
    if to_date:
        params["to_date"] = to_date
    if order_status:
        params["order_status"] = order_status

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(url, headers=headers, params=params)
        return response
async def modify_order_api(order_data: dict):
    """Service to modify an existing order"""
    config = get_upstox_config()
    token = settings.UPSTOX_SANDBOX_ACCESS_TOKEN

    if not token:
        raise ValueError("Sandbox access token not configured")

    # Use sandbox HFT API endpoint
    if settings.ENVIRONMENT.lower() == "sandbox":
        url = "https://api-hft.upstox.com/v3/order/modify"
    else:
        url = "https://api-hft.upstox.com/v3/order/modify"

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.put(url, headers=headers, json=order_data)
        return response