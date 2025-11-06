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