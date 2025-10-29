from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from bson import ObjectId
import yfinance as yf
import random
import logging
from datetime import datetime, timezone, timedelta

from database.collections import users_collection, trades_collection, holdings_collection, balance_collection
from schemas.order import OrderRequest, OrderResponse, Trade, Holding
from .user import get_current_user
from schemas.user import UserInDB

router = APIRouter(prefix="/api/order", tags=["Trading"])

# Set up logging
logger = logging.getLogger(__name__)

# Initialize user with virtual balance
async def init_virtual_balance(user_id: str):
    initial_balance = 1000000  # ₹10,00,000 virtual money
    await balance_collection.insert_one({
        "user_id": user_id,
        "cash_balance": initial_balance,
        "updated_at": datetime.utcnow()
    })
    return initial_balance

def get_current_market_price(symbol: str):
    """Get current market price from yfinance with proper error handling"""
    try:
        # Add .NS for NSE symbols if not already present
        if not symbol.endswith('.NS'):
            symbol += '.NS'
            
        ticker = yf.Ticker(symbol)
        
        # Try to get regular market price first
        info = ticker.info
        current_price = info.get('regularMarketPrice')
        
        # If not available, try currentPrice
        if current_price is None:
            current_price = info.get('currentPrice')
            
        # If still not available, get latest historical data
        if current_price is None or current_price == 0:
            hist = ticker.history(period="1d", interval="1m")
            if not hist.empty:
                current_price = hist['Close'].iloc[-1]
        
        # If all else fails, raise an exception
        if current_price is None or current_price == 0:
            raise ValueError(f"Could not fetch price for {symbol}")
            
        return round(current_price, 2)
        
    except Exception as e:
        logger.error(f"Error fetching price for {symbol}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not fetch current market price for {symbol}. Please try again."
        )

@router.post("/order", response_model=OrderResponse)
async def place_order(
    order: OrderRequest,
    current_user: UserInDB = Depends(get_current_user)
):
    """Place an order (paper trading)"""
    user_id = current_user.id
    
    # 1. Get current market price
    try:
        executed_price = get_current_market_price(order.symbol)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error fetching price: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error fetching market price for {order.symbol}"
        )

    # 2. Get user's virtual balance
    balance_data = await balance_collection.find_one({"user_id": user_id})
    if not balance_data:
        cash_balance = await init_virtual_balance(user_id)
    else:
        cash_balance = balance_data["cash_balance"]

    # 3. Calculate order value
    order_value = executed_price * order.quantity

    # 4. Generate a realistic order ID
    order_id = f"{datetime.utcnow().strftime('%y%m%d')}{random.randint(100000, 999999)}"

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
                    "average_price": round(new_avg_price, 2),
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
            last_price = get_current_market_price(holding['symbol'])
        except:
            # If we can't get current price, use the average price
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

# --- NEW CODE FOR ORDER VIEW TABLE PANEL ---
from typing import List
from pydantic import BaseModel

# 1. Define a new Pydantic model for the Order View response
class OrderViewItem(BaseModel):
    no: int  # Sequential number
    symbol: str
    order_price: float  # from trades_collection 'average_price'
    current_price: float
    profit_loss: float  # (current_price - order_price) * quantity
    quantity: int
    risk_level: str  # The new field: e.g., "Low", "Medium", "High"
    # Optional: Add other fields you might need like 'order_id', 'transaction_type'

# 2. Create a function to calculate risk level (simple logic for now)
def calculate_risk_level(profit_loss: float, investment_value: float) -> str:
    """
    A simple function to determine risk level based on P&L.
    You can make this much more sophisticated later (using ATR, volatility, etc.).
    """
    if investment_value == 0:
        return "Medium"
    
    # Calculate P&L as a percentage of the initial investment
    pl_percentage = (profit_loss / investment_value) * 100

    if abs(pl_percentage) > 10:
        return "High"
    elif abs(pl_percentage) > 5:
        return "Medium"
    else:
        return "Low"

# 3. The new API endpoint for the Order View Table
@router.get("/order-view", response_model=List[OrderViewItem])
async def get_order_view_table(current_user: UserInDB = Depends(get_current_user)):
    """
    Get a consolidated view of orders with current price, P/L, and risk level.
    This is specifically for the new UI panel.
    """
    try:
        # Get the user's recent orders (trades)
        trades = await trades_collection.find({"user_id": current_user.id}).sort("order_timestamp", -1).to_list(50)
        
        order_view_list = []
        
        for index, trade in enumerate(trades):
            symbol = trade["symbol"]
            
            # Get the current market price for this symbol
            try:
                current_price = get_current_market_price(symbol)
            except Exception as e:
                logger.error(f"Could not fetch current price for {symbol}: {e}")
                # If price fetch fails, skip this trade from the list or use order price?
                current_price = trade["average_price"]
            
            # Calculate Profit/Loss
            # For BUY: P/L = (Current - Order) * Qty
            # For SELL: P/L = (Order - Current) * Qty (or just negative of BUY)
            order_value = trade["average_price"] * trade["quantity"]
            if trade["transaction_type"].upper() == "BUY":
                profit_loss = (current_price - trade["average_price"]) * trade["quantity"]
            else:  # SELL
                profit_loss = (trade["average_price"] - current_price) * trade["quantity"]
            
            # Calculate Risk Level
            risk_level = calculate_risk_level(profit_loss, order_value)
            
            # Create the order view item
            order_view_item = {
                "no": index + 1,  # Sequential number
                "symbol": symbol,
                "order_price": trade["average_price"],
                "current_price": current_price,
                "profit_loss": profit_loss,
                "quantity": trade["quantity"],
                "risk_level": risk_level
            }
            
            order_view_list.append(order_view_item)
        
        return order_view_list
        
    except Exception as e:
        logger.error(f"Error in get_order_view_table: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch order view data"
        )
    
from typing import List
from pydantic import BaseModel

class OrderViewPanelItem(BaseModel):
    order_id: str
    symbol: str
    transaction_type: str
    order_price: float
    current_price: float
    quantity: int
    profit_loss: float
    risk_level: str
    timestamp: str  # ISO format timestamp


@router.get("/order-view-panel", response_model=List[OrderViewPanelItem])
async def get_order_view_panel(current_user: UserInDB = Depends(get_current_user)):
    """
    Returns the user's executed orders with full details for the Order View Panel.
    """
    trades = await trades_collection.find(
        {"user_id": current_user.id}
    ).sort("order_timestamp", -1).to_list(100)

    result = []
    for trade in trades:
        symbol = trade["symbol"]

        # Get current market price
        try:
            current_price = get_current_market_price(symbol)
        except:
            current_price = trade["average_price"]

        # Calculate P&L
        if trade["transaction_type"].upper() == "BUY":
            profit_loss = (current_price - trade["average_price"]) * trade["quantity"]
        else:  # SELL
            profit_loss = (trade["average_price"] - current_price) * trade["quantity"]

        # Risk Level
        order_value = trade["average_price"] * trade["quantity"]
        risk_level = calculate_risk_level(profit_loss, order_value)

        result.append(OrderViewPanelItem(
            order_id=trade["order_id"],
            symbol=symbol,
            transaction_type=trade["transaction_type"],
            order_price=trade["average_price"],
            current_price=current_price,
            quantity=trade["quantity"],
            profit_loss=round(profit_loss, 2),
            risk_level=risk_level,
            timestamp=trade["order_timestamp"].isoformat()
        ))

    return result

class HoldingViewItem(BaseModel):
    symbol: str
    exchange: str
    quantity: int
    average_price: float
    current_price: float
    investment_value: float
    current_value: float
    profit_loss: float
    risk_level: str



@router.get("/holding-view", response_model=List[HoldingViewItem])
async def get_holding_view(current_user: UserInDB = Depends(get_current_user)):
    """
    Returns the user's holdings with P&L, risk level, and pre-calculated values.
    """
    holdings = await holdings_collection.find(
        {"user_id": current_user.id}
    ).to_list(100)

    result = []
    for h in holdings:
        try:
            current_price = get_current_market_price(h["symbol"])
        except Exception:
            current_price = h["average_price"]

        quantity = h["quantity"]
        avg_price = h["average_price"]

        # 🔹 Calculations (now on backend)
        investment_value = avg_price * quantity
        current_value = current_price * quantity
        profit_loss = current_value - investment_value
        risk_level = calculate_risk_level(profit_loss, investment_value)

        result.append(HoldingViewItem(
            symbol=h["symbol"],
            exchange=h.get("exchange", "NSE"),
            quantity=quantity,
            average_price=avg_price,
            current_price=current_price,
            investment_value=round(investment_value, 2),
            current_value=round(current_value, 2),
            profit_loss=round(profit_loss, 2),
            risk_level=risk_level,
        ))

    return result
