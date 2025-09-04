from datetime import datetime
import re
from typing import List, Optional, Annotated
from pydantic import BaseModel, Field, field_validator, EmailStr, ConfigDict
from bson import ObjectId

class Token(BaseModel):
    access_token: str
    token_type: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile_no: Optional[str] = None

class WatchlistItem(BaseModel):
    symbol: str = Field(..., description="The trading symbol, e.g., 'RELIANCE', 'INFY'")
    exchange: Optional[str] = Field("NSE", description="The exchange, e.g., 'NSE', 'BSE'") # Optional field

    class Config:
        from_attributes = True

class User(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    firstname: str = Field(..., min_length=1, max_length=50)
    lastname: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    mobile_no: Optional[str] = Field(
        default=None, 
        pattern=r"^\+?[0-9]{10,15}$", 
        description="Mobile number in international format (e.g., +919876543210)"
    )
    brokers: Optional[list] = []
    watchlist: Optional[List[WatchlistItem]] = None
    password: str = Field(..., min_length=8)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one digit")
        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(char.islower() for char in v):
            raise ValueError("Password must contain at least one lowercase letter")
        return v


class UserInDB(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )
    
    id: str = Field(..., alias="_id")
    username: str
    firstname: str
    lastname: str
    email: EmailStr
    mobile_no: Optional[str] = None
    brokers: Optional[list] = []
    watchlist: Optional[List[WatchlistItem]] = None
    hashed_password: str = Field(..., alias="password")
    created_at: datetime
    updated_at: Optional[datetime] = None

    @field_validator("mobile_no")
    @classmethod
    def validate_mobile(cls, v):
        if v is None:
            return v
        pattern = re.compile(r"^\+?[0-9]{10,15}$")  # e.g. +919876543210
        if not pattern.match(v):
            raise ValueError("Invalid mobile number format")
        return v

    @field_validator("id", mode="before")
    @classmethod
    def convert_objectid(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        elif isinstance(v, str) and ObjectId.is_valid(v):
            return v
        raise ValueError("Invalid ObjectId format")


