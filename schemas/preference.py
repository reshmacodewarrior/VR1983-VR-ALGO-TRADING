from pydantic import BaseModel, Field
from bson import ObjectId
from enum import Enum


class RiskLevel(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"

class Preference(BaseModel):
    user_id: str                
    preferred_broker: str
    notifications: bool = True   
    risk_level: str            


class PreferenceInDB(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str
    preferred_broker: str
    notifications: bool
    risk_level: str

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
