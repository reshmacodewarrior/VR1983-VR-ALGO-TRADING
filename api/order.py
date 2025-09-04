from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from bson import ObjectId
import yfinance as yf
import random

from database.collections import users_collection, trades_collection, holdings_collection, balance_collection
from schemas.order import OrderRequest, OrderResponse, Trade, Holding
from .user import get_current_user
from schemas.user import UserInDB

router = APIRouter(prefix="/api", tags=["Trading"])

# Initialize user with virtual balance
async def init_virtual_balance(user_id: str):
    initial_balance = 1000000  # ₹10,00,000 virtual money
    await balance_collection.insert_one({
        "user_id": user_id,
        "cash_balance": initial_balance,
        "updated_at": datetime.utcnow()
    })
    return initial_balance

@router.post("/order", response_model=OrderResponse)
async def place_order(
    order: OrderRequest,
    current_user: UserInDB = Depends(get_current_user)
):
    """Place an order (paper trading)"""
    user_id = current_user.id
    
    # 1. Get current market price from yfinance
    try:
        ticker = yf.Ticker(f"{order.symbol}.NS")
        info = ticker.info
        current_price = info.get('regularMarketPrice', info.get('currentPrice', 0))
        
        if not current_price or current_price == 0:
            hist = ticker.history(period="1d", interval="1m")
            if not hist.empty:
                current_price = hist['Close'].iloc[-1]
            else:
                # Fallback to random price if yfinance fails (for development)
                current_price = random.uniform(100, 5000)
    except Exception as e:
        current_price = random.uniform(100, 5000)  # Fallback

    # 2. Get user's virtual balance
    balance_data = await balance_collection.find_one({"user_id": user_id})
    if not balance_data:
        cash_balance = await init_virtual_balance(user_id)
    else:
        cash_balance = balance_data["cash_balance"]

    # 3. Calculate order value
    executed_price = current_price
    order_value = executed_price * order.quantity

    # 4. Generate a realistic order ID
    order_id = f"{datetime.now().strftime('%y%m%d')}{random.randint(100000, 999999)}"

    # 5. Execute BUY order
    if order.transaction_type.upper() == "BUY":
        if cash_balance < order_value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient balance. Needed: ₹{order_value:.2f}, Available: ₹{cash_balance:.2f}"
            )

        # Update cash balance
        new_balance = cash_balance - order_value
        await balance_collection.update_one(
            {"user_id": user_id},
            {"$set": {"cash_balance": new_balance, "updated_at": datetime.utcnow()}}
        )

        # Add to holdings or update existing
        existing_holding = await holdings_collection.find_one({"user_id": user_id, "symbol": order.symbol})
        if existing_holding:
            new_quantity = existing_holding["quantity"] + order.quantity
            new_avg_price = ((existing_holding["average_price"] * existing_holding["quantity"]) + order_value) / new_quantity
            await holdings_collection.update_one(
                {"user_id": user_id, "symbol": order.symbol},
                {"$set": {
                    "quantity": new_quantity,
                    "average_price": new_avg_price,
                    "last_updated": datetime.utcnow()
                }}
            )
        else:
            await holdings_collection.insert_one({
                "user_id": user_id,
                "symbol": order.symbol,
                "quantity": order.quantity,
                "average_price": executed_price,
                "exchange": order.exchange,
                "last_updated": datetime.utcnow()
            })

    # 6. Execute SELL order
    elif order.transaction_type.upper() == "SELL":
        # Check if user has the holding
        existing_holding = await holdings_collection.find_one({"user_id": user_id, "symbol": order.symbol})
        if not existing_holding or existing_holding["quantity"] < order.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient holdings. You don't have {order.quantity} shares of {order.symbol}"
            )

        # Update cash balance
        new_balance = cash_balance + order_value
        await balance_collection.update_one(
            {"user_id": user_id},
            {"$set": {"cash_balance": new_balance, "updated_at": datetime.utcnow()}}
        )

        # Update holdings
        new_quantity = existing_holding["quantity"] - order.quantity
        if new_quantity == 0:
            await holdings_collection.delete_one({"user_id": user_id, "symbol": order.symbol})
        else:
            await holdings_collection.update_one(
                {"user_id": user_id, "symbol": order.symbol},
                {"$set": {"quantity": new_quantity, "last_updated": datetime.utcnow()}}
            )

    # 7. Record the trade
    trade_data = {
        "order_id": order_id,
        "user_id": user_id,
        "symbol": order.symbol,
        "exchange": order.exchange,
        "transaction_type": order.transaction_type.upper(),
        "quantity": order.quantity,
        "order_type": order.order_type,
        "product": order.product,
        "status": "COMPLETE",
        "average_price": executed_price,
        "order_timestamp": datetime.utcnow(),
        "executed_at": datetime.utcnow()
    }
    
    await trades_collection.insert_one(trade_data)

    return OrderResponse(
        status="success",
        order_id=order_id,
        message="Order executed successfully",
        executed_price=executed_price
    )

@router.get("/orders", response_model=list[Trade])
async def get_order_history(current_user: UserInDB = Depends(get_current_user)):
    """Get user's order history"""
    trades = await trades_collection.find({"user_id": current_user.id}).sort("order_timestamp", -1).to_list(100)
    for trade in trades:
        trade["_id"] = str(trade["_id"])
        trade["order_timestamp"] = trade["order_timestamp"].isoformat()
        if "executed_at" in trade:
            trade["executed_at"] = trade["executed_at"].isoformat()
    return trades

@router.get("/holdings", response_model=list[Holding])
async def get_holdings(current_user: UserInDB = Depends(get_current_user)):
    """Get user's current holdings"""
    holdings = await holdings_collection.find({"user_id": current_user.id}).to_list(100)
    
    # Get current prices for P&L calculation
    result = []
    for holding in holdings:
        try:
            ticker = yf.Ticker(f"{holding['symbol']}.NS")
            info = ticker.info
            last_price = info.get('regularMarketPrice', info.get('currentPrice', holding['average_price']))
        except:
            last_price = holding['average_price']
        
        pnl = (last_price - holding['average_price']) * holding['quantity']
        
        result.append({
            "symbol": holding["symbol"],
            "quantity": holding["quantity"],
            "average_price": holding["average_price"],
            "last_price": last_price,
            "pnl": pnl,
            "exchange": holding.get("exchange", "NSE")
        })
    
    return result

@router.get("/balance")
async def get_balance(current_user: UserInDB = Depends(get_current_user)):
    """Get user's cash balance and total portfolio value"""
    balance_data = await balance_collection.find_one({"user_id": current_user.id})
    if not balance_data:
        cash_balance = await init_virtual_balance(current_user.id)
    else:
        cash_balance = balance_data["cash_balance"]
    
    holdings = await get_holdings(current_user)
    total_holdings_value = sum(h["last_price"] * h["quantity"] for h in holdings)
    total_portfolio_value = cash_balance + total_holdings_value
    
    return {
        "cash_balance": cash_balance,
        "total_holdings_value": total_holdings_value,
        "total_portfolio_value": total_portfolio_value
    }