# services/user.py
import os
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from database.collections import users_collection
from schemas.user import UserInDB
from config import settings

SECRET_KEY = settings.SECRET_KEY 
ALGORITHM = settings.ALGORITHM
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/user/login")
REFRESH_SECRET_KEY = SECRET_KEY + "_refresh_secret"

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=10080)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role", "user")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await get_user_by_email(email)
    if user is None:
        raise credentials_exception
    return user

async def get_user_by_email(email: str) -> Optional[UserInDB]:
    user = await users_collection.find_one({"email": email})
    if user:
        user["_id"] = str(user["_id"])
        if "role" not in user:
            user["role"] = "user"
        return UserInDB(**user)
    return None

async def verify_refresh_token(refresh_token: str) -> Optional[UserInDB]:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token",
    )
    try:
        payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        
        user = await users_collection.find_one({
            "email": email,
            "refresh_token": refresh_token
        })
        if not user:
            raise credentials_exception
            
        user["_id"] = str(user["_id"])
        if "role" not in user:
            user["role"] = "user"
        return UserInDB(**user)
    except JWTError:
        raise credentials_exception

async def update_user_role(email: str, role: str, current_user: UserInDB):
    """Update user role (only admins can do this)"""
    allowed_roles = ["user", "agency", "admin"]
    if role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role must be one of {allowed_roles}"
        )
    
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update user roles"
        )
    
    result = await users_collection.update_one(
        {"email": email},
        {"$set": {"role": role, "updated_at": datetime.now().isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": f"User role updated to {role}"}

async def get_all_users(current_user: UserInDB):
    """Get all users (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view all users"
        )
    
    users = await users_collection.find().to_list(length=1000)
    for user in users:
        user["_id"] = str(user["_id"])
        if "role" not in user:
            user["role"] = "user"
    
    return [UserInDB(**user) for user in users]

async def get_users_by_role(role: str, current_user: UserInDB):
    """Get users by specific role (admin and agency can access)"""
    if current_user.role not in ["admin", "agency"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and agencies can filter users by role"
        )
    
    users = await users_collection.find({"role": role}).to_list(length=1000)
    for user in users:
        user["_id"] = str(user["_id"])
    
    return [UserInDB(**user) for user in users]

async def get_user_stats(current_user: UserInDB):
    """Get user statistics (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view user statistics"
        )
    
    total_users = await users_collection.count_documents({})
    admin_users = await users_collection.count_documents({"role": "admin"})
    agency_users = await users_collection.count_documents({"role": "agency"})
    regular_users = await users_collection.count_documents({"role": "user"})
    
    return {
        "total_users": total_users,
        "admin_users": admin_users,
        "agency_users": agency_users,
        "regular_users": regular_users
    }