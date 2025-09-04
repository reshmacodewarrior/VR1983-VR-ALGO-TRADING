from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from bson import ObjectId
from database.collections import users_collection, brokers_collection
from schemas.user import UserInDB
from schemas.broker import BrokerCreate
from .user import get_current_user

router = APIRouter(prefix="/api", tags=["broker"])

@router.post("/broker/add")
async def add_broker(broker: BrokerCreate, current_user: UserInDB = Depends(get_current_user)):
    existing = await users_collection.find_one(
        {"_id": ObjectId(current_user.id), "brokers.broker_name": broker.broker_name}
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Broker already exists for this user"
        )

    broker_data = {
        "broker_name": broker.broker_name,
        "api_key": broker.api_key,
        "api_secret": broker.api_secret,
        "created_at": datetime.utcnow().isoformat()
    }

    await users_collection.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$push": {"brokers": broker_data}}
    )

    broker_record = {
        "user_id": str(current_user.id),
        **broker_data
    }
    await brokers_collection.insert_one(broker_record)

    return {"message": "Broker added successfully", "broker": broker_data}
