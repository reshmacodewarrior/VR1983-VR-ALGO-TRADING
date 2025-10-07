import os
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.templating import Jinja2Templates
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo.errors import DuplicateKeyError, OperationFailure

from database.collections import users_collection
from schemas.user import User, UserInDB, EmailStr
from services.user import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    get_current_user,
    create_refresh_token,
    verify_refresh_token
)
from config import settings

# Configure logging
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/user", tags=["users"])

# Custom Exceptions
class UserAlreadyExistsError(Exception):
    def __init__(self, field: str, value: str):
        self.field = field
        self.value = value
        super().__init__(f"User with {field} '{value}' already exists")

class UserNotFoundError(Exception):
    def __init__(self, identifier: str):
        super().__init__(f"User '{identifier}' not found")

class InvalidCredentialsError(Exception):
    pass

class DatabaseOperationError(Exception):
    pass

@router.get("/email")
async def get_user_by_email(email: str) -> Optional[UserInDB]:
    try:
        user = await users_collection.find_one({"email": email})
        if user:
            user["_id"] = str(user["_id"])
            return UserInDB(**user)
        return None
    except Exception as e:
        logger.error(f"Error fetching user by email {email}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user information"
        )

async def authenticate_user(email: str, password: str):
    try:
        user = await get_user_by_email(email)
        if not user:
            return False
        if not verify_password(password, user.hashed_password):
            return False
        return user
    except Exception as e:
        logger.error(f"Authentication error for {email}: {e}")
        return False

# Add these endpoints to your existing router
@router.get("/profile")
async def get_user_profile(current_user: UserInDB = Depends(get_current_user)):
    try:
        return {
            "username": current_user.username,   
            "firstname": current_user.firstname,
            "lastname": current_user.lastname,
            "email": current_user.email,
            "brokers": current_user.brokers,
            "mobile_no": current_user.mobile_no,
            "created_at": current_user.created_at
        }
    except JWTError as e:
        logger.warning(f"JWT error in profile endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    except Exception as e:
        logger.error(f"Error fetching user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user profile"
        )
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        user = await users_collection.find_one({
            "$or": [
                {"email": form_data.username},
                {"username": form_data.username}
            ]
        })
        
        if not user:
            logger.warning(f"Login attempt with non-existent user: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username/email or password"
            )
        
        if not verify_password(form_data.password, user["hashed_password"]):
            logger.warning(f"Failed login attempt for user: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username/email or password"
            )
        
        # Create access token (7 days instead of 30 minutes)
        access_token = create_access_token(data={"sub": user["email"]})
        
        # Create refresh token (7 days from config)
        refresh_token = create_refresh_token(data={"sub": user["email"]})
        
        # Store refresh token in database
        await users_collection.update_one(
            {"email": user["email"]},
            {
                "$set": {
                    "refresh_token": refresh_token, 
                    "last_login": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                }
            }
        )
        
        logger.info(f"Successful login for user: {user['email']}")
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "access_token_expires": 7 * 24 * 60 * 60,  # 7 days in seconds
            "refresh_token_expires": settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
            "user": {
                "username": user["username"],   
                "email": user["email"],
                "firstname": user.get("firstname", ""),
                "lastname": user.get("lastname", "")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during login"
        )

@router.post("/refresh")
async def refresh_token(request: Request):
    """
    Get new access token using refresh token
    """
    try:
        data = await request.json()
        refresh_token = data.get("refresh_token")
        
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refresh token is required"
            )
        
        # Verify refresh token and get user
        user = await verify_refresh_token(refresh_token)
        
        # Create new access token (7 days)
        new_access_token = create_access_token(data={"sub": user.email})
        
        # Optionally create new refresh token (rotate refresh tokens)
        new_refresh_token = create_refresh_token(data={"sub": user.email})
        
        # Update refresh token in database
        await users_collection.update_one(
            {"email": user.email},
            {
                "$set": {
                    "refresh_token": new_refresh_token,
                    "updated_at": datetime.now().isoformat()
                }
            }
        )
        
        logger.info(f"Token refreshed for user: {user.email}")
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "access_token_expires": 7 * 24 * 60 * 60,
            "refresh_token_expires": settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refreshing token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to refresh token"
        )

@router.post("/logout")
async def logout(
    request: Request,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Logout user and invalidate refresh token
    """
    try:
        # Get refresh token from request body if provided
        data = await request.json()
        refresh_token = data.get("refresh_token")
        
        # Remove refresh token from database
        update_data = {"$unset": {"refresh_token": ""}}
        if refresh_token:
            # Only remove the specific refresh token
            await users_collection.update_one(
                {"email": current_user.email, "refresh_token": refresh_token},
                update_data
            )
        else:
            # Remove all refresh tokens for this user
            await users_collection.update_one(
                {"email": current_user.email},
                update_data
            )
        
        logger.info(f"User logged out: {current_user.email}")
        return {"message": "Successfully logged out"}
        
    except Exception as e:
        logger.error(f"Error during logout: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error during logout"
        )

@router.post("/logout-all")
async def logout_all_devices(current_user: UserInDB = Depends(get_current_user)):
    """
    Logout from all devices by removing all refresh tokens
    """
    try:
        # Remove all refresh tokens from database
        await users_collection.update_one(
            {"email": current_user.email},
            {"$unset": {"refresh_token": ""}}
        )
        
        logger.info(f"User logged out from all devices: {current_user.email}")
        return {"message": "Successfully logged out from all devices"}
        
    except Exception as e:
        logger.error(f"Error during logout from all devices: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error during logout"
        )