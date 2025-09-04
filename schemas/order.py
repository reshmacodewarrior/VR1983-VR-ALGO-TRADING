# schemas/order.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OrderRequest(BaseModel):
    symbol: str
    exchange: str = "NSE"
    transaction_type: str  # "BUY" or "SELL"
    order_type: str = "MARKET"  # "MARKET", "LIMIT", "SL", "SL-M"
    quantity: int
    product: str = "MIS"  # "MIS", "CNC", "NRML"
    validity: str = "DAY"  # "DAY", "IOC"
    price: float = 0.0
    trigger_price: Optional[float] = None

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    status: str
    order_id: str
    message: str
    executed_price: Optional[float] = None

class Trade(BaseModel):
    order_id: str
    symbol: str
    exchange: str
    transaction_type: str
    quantity: int
    order_type: str
    product: str
    status: str
    average_price: float
    order_timestamp: str
    exchange_order_id: Optional[str] = None

class Holding(BaseModel):
    symbol: str
    quantity: int
    average_price: float
    last_price: float
    pnl: float
    exchange: str = "NSE"