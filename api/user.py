import os
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.templating import Jinja2Templates
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from database.collections import users_collection
from schemas.user import User, UserInDB,EmailStr
from services.user import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    get_current_user
)
from config import settings

router = APIRouter(prefix="/api/user", tags=["users"])


@router.get("/email")
async def get_user_by_email(email: str) -> Optional[UserInDB]:
    user = await users_collection.find_one({"email": email})
    if user:
        user["_id"] = str(user["_id"])
        return UserInDB(**user)
    return None

async def authenticate_user(email: str, password: str):
    user = await get_user_by_email(email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


@router.post("/signup")
async def signup(user: User):
    existing_user = await users_collection.find_one({
        "$or": [
            {"email": user.email},
            {"username": user.username}
        ]
    })
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    created_at = datetime.now().isoformat()
    updated_at = datetime.now().isoformat()
    
    user_data = {
        "username": user.username,  
        "firstname": user.firstname,
        "lastname": user.lastname,
        "email": user.email,
        "mobile_no": user.mobile_no,
        "hashed_password": hashed_password,
        "created_at": created_at,
        "updated_at": updated_at
    }
    
    result = await users_collection.insert_one(user_data)
    return {"message": "User created successfully", "user_id": str(result.inserted_id)}

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await users_collection.find_one({
        "$or": [
            {"email": form_data.username},
            {"username": form_data.username}
        ]
    })
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user["email"]}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "username": user["username"],   
            "email": user["email"],
        }
    }

@router.get("/profile")
async def get_user_profile(current_user: UserInDB = Depends(get_current_user)):
    return {
        "username": current_user.username,   
        "firstname": current_user.firstname,
        "lastname": current_user.lastname,
        "email": current_user.email,
        "brokers": current_user.brokers,
        "mobile_no": current_user.mobile_no,
        "created_at": current_user.created_at
    }



