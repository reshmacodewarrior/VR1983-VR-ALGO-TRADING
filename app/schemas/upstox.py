from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class UpstoxTokenResponse(BaseModel):
    access_token: str
    token_type: Optional[str] = None
    expires_in: Optional[int] = None
    refresh_token: Optional[str] = None

class UpstoxUserProfile(BaseModel):
    user_id: str
    user_name: str
    email: str
    exchanges: list[str]
    products: list[str]
    broker: str
    order_types: list[str]
    user_type: str
    poa: bool
    is_active: bool

class UpstoxConnection(BaseModel):
    broker_name: str = "upstox"
    broker_user_id: str
    user_name: str
    email: str
    access_token: str
    refresh_token: Optional[str] = ""
    token_expiry: datetime
    created_at: datetime
    last_used: datetime
    is_active: bool = True
    profile_data: Dict[str, Any]

class ConnectionStatus(BaseModel):
    connected: bool
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    email: Optional[str] = None
    connected_since: Optional[datetime] = None

class DebugConfig(BaseModel):
    client_id: str
    redirect_uri: str
    has_client_id: bool
    has_client_secret: bool
    constructed_auth_url: str

from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal

class UpstoxOrder(BaseModel):
    quantity: int
    product: str = "D"
    validity: str = "DAY"
    price: float = 0
    tag: str = "string"
    instrument_token: str
    order_type: str
    transaction_type: str
    disclosed_quantity: int = 0
    trigger_price: float = 0
    is_amo: bool = False
    slice: bool = True

class UpstoxMultiOrder(BaseModel):
    correlation_id: str = Field(..., description="Unique identifier for each order in the batch")
    quantity: int
    product: str = "D"
    validity: str = "DAY"
    price: float = 0
    tag: str = "string"
    instrument_token: str
    order_type: str
    transaction_type: str
    disclosed_quantity: int = 0
    trigger_price: float = 0
    is_amo: bool = False
    slice: bool = False

class MultiOrderRequest(BaseModel):
    orders: List[UpstoxMultiOrder] = Field(..., min_items=1, max_items=10, description="List of orders to place (max 10 orders)")

class MultiOrderResponse(BaseModel):
    success: bool
    message: str
    data: List[dict]
    failed_orders: List[dict] = []