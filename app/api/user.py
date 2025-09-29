import os
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.params import Body
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.templating import Jinja2Templates
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from datetime import timedelta
from config import settings
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo.errors import DuplicateKeyError, OperationFailure

from database.collections import users_collection
from schemas.user import User, UserInDB, EmailStr
from services.user import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    get_current_user
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
            raise InvalidCredentialsError("Incorrect username/email or password")
        
        if not verify_password(form_data.password, user["hashed_password"]):
            logger.warning(f"Failed login attempt for user: {form_data.username}")
            raise InvalidCredentialsError("Incorrect username/email or password")

        # ⏱ Access token: short (from .env, e.g. 30m)
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"], "type": "access"},
            expires_delta=access_token_expires
        )

        # 🔑 Refresh token: longer (e.g. 7 days)
        refresh_token_expires = timedelta(days=7)
        refresh_token = create_access_token(
            data={"sub": user["email"], "type": "refresh"},
            expires_delta=refresh_token_expires
        )

        logger.info(f"Successful login for user: {user['email']}")
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "username": user["username"],   
                "email": user["email"],
            }
        }
        
    except InvalidCredentialsError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Unexpected error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during login"
        )

@router.post("/verify-password")
async def verify_password(
    request: Request,
    password_data: Dict[str, str],
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Verify user's password and issue a new token if valid
    """
    try:
        # Verify the provided password
        if not verify_password(password_data["password"], current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password"
            )
        
        # Create a new access token
        access_token = create_access_token(data={"sub": current_user.email})
        
        logger.info(f"Password verified successfully for user: {current_user.email}")
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "message": "Password verified successfully"
        }
        
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password field is required"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during password verification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during password verification"
        )

@router.post("/refresh-token")
async def refresh_token(refresh_token: str = Body(..., embed=True)):
    """
    Issue a new access token using a valid refresh token
    """
    try:
        payload = jwt.decode(
            refresh_token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )

        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        # ⏱ Issue new access token
        new_access_token = create_access_token(
            data={"sub": email, "type": "access"},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        logger.info(f"Access token refreshed for user: {email}")
        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    except Exception as e:
        logger.error(f"Error refreshing token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to refresh token"
        )