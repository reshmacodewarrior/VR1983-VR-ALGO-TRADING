from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field
from bson import ObjectId

# Restrict signal_type to fixed values
class SignalType(str, Enum):
    buy = "Buy"
    sell = "Sell"
    hold = "Hold"


class TradeSignal(BaseModel):
    user_id: str                 # FK → User._id
    symbol: str
    signal_type: SignalType      # Enum instead of free text
    confidence_score: float      # 0.0 → 100.0 (%)


class TradeSignalInDB(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str
    symbol: str
    signal_type: SignalType
    confidence_score: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)  
    # auto set when inserting

    # Convert ObjectId → str for API responses
    @classmethod
    def __get_validators__(cls):
        yield cls.validate_objectid

    @staticmethod
    def validate_objectid(v):
        if isinstance(v, ObjectId):
            return str(v)
        return v

    class Config:
        populate_by_name = True
