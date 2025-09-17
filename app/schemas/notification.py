from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field
from bson import ObjectId


class NotificationType(str, Enum):
    signal = "Signal"
    system = "System"
    order_update = "Order Update"


class Notification(BaseModel):
    user_id: str                  
    message: str
    type: NotificationType         
    is_read: bool = False          


class NotificationInDB(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str
    message: str
    type: NotificationType
    is_read: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)

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
