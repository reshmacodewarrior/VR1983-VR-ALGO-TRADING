from datetime import datetime
from pydantic import BaseModel, Field
from bson import ObjectId


class MarketData(BaseModel):
    symbol: str
    price: float
    broker_source: str


class MarketDataInDB(BaseModel):
    id: str = Field(..., alias="_id")
    symbol: str
    price: float
    timestamp: datetime
    broker_source: str

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
