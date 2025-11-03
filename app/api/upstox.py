from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
import urllib.parse

import httpx
from app.config import settings
from app.schemas.upstox import OrderRequest, MultiOrderRequest, SingleOrderRequest,ModifyOrderRequest
from app.services.upstox import (
    get_all_orders_api,
    get_order_history_api,
    get_upstox_config, 
    exchange_auth_code_for_token,
    modify_order_api, 
    place_order_api, 
    place_multiple_orders_api
)

router = APIRouter(prefix="/api/upstox", tags=["Upstox"])

# ---------------------------------------------------------------------
# Step 1: Redirect user to Upstox authorization page
# ---------------------------------------------------------------------
@router.get("/login")
async def upstox_login():
    """Redirect user to Upstox authorization page"""
    try:
        config = get_upstox_config()

        # Base URLs for different environments
        if settings.ENVIRONMENT.lower() == "sandbox":
            base_auth_url = "https://sandbox-api.upstox.com"
        else:
            base_auth_url = config["auth_url"]

        params = {
            "client_id": config["client_id"],
            "redirect_uri": config["redirect_uri"],
            "response_type": "code", 
            "scope": "profile trade-read trade-place orders portfolio",
            "state": "sandbox-auth",
        }

        if settings.ENVIRONMENT.lower() == "sandbox":
            params["ucc"] = "TEST1234"
            # Sandbox uses the old endpoint structure
            auth_url = f"{base_auth_url}/login/authorization/dialog?{urllib.parse.urlencode(params)}"
        else:
            # Live uses v2 endpoint
            auth_url = f"{base_auth_url}/v2/login/authorization/dialog?{urllib.parse.urlencode(params)}"

        print("🔗 Redirecting to:", auth_url)
        return RedirectResponse(auth_url)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication setup failed: {str(e)}")

@router.get("/debug/login")
async def debug_login():
    """Debug login configuration"""
    config = get_upstox_config()
    
    debug_info = {
        "environment": settings.ENVIRONMENT,
        "client_id": config["client_id"],
        "redirect_uri": config["redirect_uri"],
        "auth_url": config["auth_url"],
        "base_url": config["base_url"],
        "has_client_id": bool(config["client_id"]),
        "has_redirect_uri": bool(config["redirect_uri"])
    }
    
    # Build the URL that would be used
    params = {
        "client_id": config["client_id"],
        "redirect_uri": config["redirect_uri"],
        "response_type": "code",
        "scope": "profile trade-read trade-place orders portfolio",
        "state": "sandbox-auth",
    }
    
    if settings.ENVIRONMENT.lower() == "sandbox":
        params["ucc"] = "TEST1234"
        debug_info["constructed_url"] = f"https://sandbox-api.upstox.com/login/authorization/dialog?{urllib.parse.urlencode(params)}"
    else:
        debug_info["constructed_url"] = f"{config['auth_url']}/v2/login/authorization/dialog?{urllib.parse.urlencode(params)}"
    
    return debug_info
@router.get("/callback")
async def upstox_callback(request: Request):
    code = request.query_params.get("code")
    error = request.query_params.get("error")

    if error:
        raise HTTPException(status_code=400, detail=f"Authentication failed: {error}")
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not provided")

    try:
        response = await exchange_auth_code_for_token(code)
        
        try:
            data = response.json()
        except Exception:
            data = {"raw": response.text}

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=data)

        return {
            "message": "✅ Token exchange successful",
            "data": data,
        }

    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

# ---------------------------------------------------------------------
# Single Order Placement
# ---------------------------------------------------------------------
@router.post("/order/place")
async def place_order(order_request: OrderRequest):
    """
    Place an order using the Upstox Sandbox API.
    Requires that a sandbox access token is available in .env.
    """
    try:
        payload = order_request.dict()
        response = await place_order_api(payload)
        data = response.json()

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=data)

        return {"message": "✅ Order placed successfully", "data": data}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

# ---------------------------------------------------------------------
# Multiple Order Placement
# ---------------------------------------------------------------------
@router.post("/order/multi/place")
async def place_multiple_orders(multi_order_request: MultiOrderRequest):
    """
    Place multiple orders using the Upstox API.
    Requires that a sandbox access token is available in .env.
    """
    try:
        payload = [order.dict() for order in multi_order_request.orders]
        response = await place_multiple_orders_api(payload)
        data = response.json()

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=data)

        return {"message": "✅ Multiple orders placed successfully", "data": data}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
@router.get("/instruments/{instrument_token}")
async def get_instrument_details(instrument_token: str):
    """Get instrument details including lot size"""
    config = get_upstox_config()
    token = settings.UPSTOX_SANDBOX_ACCESS_TOKEN

    if not token:
        raise HTTPException(status_code=400, detail="Sandbox access token not configured")

    url = f"{config['base_url']}/master/contract/{instrument_token}"

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(url, headers=headers)
            data = response.json()

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=data)

        return {"message": "✅ Instrument details fetched", "data": data}

    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
@router.put("/order/modify")
async def modify_order(modify_request: ModifyOrderRequest):
    """
    Modify an existing order using the Upstox HFT API.
    Requires that an access token is available in .env.
    """
    try:
        payload = modify_request.dict()
        response = await modify_order_api(payload)
        data = response.json()

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=data)

        return {"message": "✅ Order modified successfully", "data": data}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
@router.get("/order/history")
async def get_order_history(order_id: str):
    """
    Get order history for a specific order ID using the Upstox API.
    Requires that an access token is available in .env.
    """
    try:
        response = await get_order_history_api(order_id)
        data = response.json()

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=data)

        return {"message": "✅ Order history fetched successfully", "data": data}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
@router.get("/orders")
async def get_all_orders(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=500, description="Orders per page (1-500)"),
    from_date: Optional[str] = Query(None, regex="^\d{4}-\d{2}-\d{2}$", description="From date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, regex="^\d{4}-\d{2}-\d{2}$", description="To date (YYYY-MM-DD)"),
    order_status: Optional[str] = Query(None, description="Filter by order status")
):
    """
    Retrieve all orders with advanced filtering and pagination.
    """
    try:
        # Validate date range
        if from_date and to_date and from_date > to_date:
            raise HTTPException(status_code=400, detail="from_date cannot be after to_date")

        response = await get_all_orders_api(
            page=page,
            page_size=page_size,
            from_date=from_date,
            to_date=to_date,
            order_status=order_status
        )
        data = response.json()

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=data)

        return {
            "message": "✅ Orders retrieved successfully",
            "pagination": {
                "page": page,
                "page_size": page_size,
                "has_more": len(data.get('data', [])) == page_size
            },
            "filters_applied": {
                "from_date": from_date,
                "to_date": to_date,
                "order_status": order_status
            },
            "data": data
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
@router.put("/order/modify")
async def modify_order(modify_request: ModifyOrderRequest):
    """
    Modify an existing order using the Upstox HFT API.
    Works with both sandbox and live environments.
    """
    try:
        payload = modify_request.dict()
        response = await modify_order_api(payload)
        data = response.json()

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=data)

        return {"message": "✅ Order modified successfully", "data": data}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")