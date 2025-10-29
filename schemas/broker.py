from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class BrokerType(str, Enum):
    ZERODHA = "zerodha"
    UPSTOX = "upstox"
    ANGEL_ONE = "angel_one"
    ICICI_DIRECT = "icici_direct"

class BrokerStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    EXPIRED = "expired"

class BrokerBase(BaseModel):
    broker_name: BrokerType
    display_name: Optional[str] = None  # ✅ Make optional
    is_active: bool = True  # ✅ Add default value

class BrokerCreate(BaseModel):
    broker_name: str  # ✅ Accept string from frontend
    api_key: str
    api_secret: str

class BrokerResponse(BaseModel):
    id: str
    broker_name: str  # ✅ Change from BrokerType to str
    display_name: Optional[str] = None  # ✅ Make optional
    is_active: bool = True  # ✅ Add default value
    created_at: datetime
    last_used: Optional[datetime] = None  # ✅ Make optional
    status: str = "active"  # ← ADD
    connection_type: str = "oauth"  # ← ADD
    class Config:
        from_attributes = True

class BrokerConnection(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_expiry: Optional[datetime] = None
    broker_user_id: Optional[str] = None
    user_profile: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UpstoxOAuthRequest(BaseModel):
    authorization_code: str