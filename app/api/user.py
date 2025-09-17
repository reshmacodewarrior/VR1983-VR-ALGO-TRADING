import os
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.templating import Jinja2Templates
from datetime import datetime, timedelta
from typing import Optional
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
        
        access_token = create_access_token(data={"sub": user["email"]})
        
        logger.info(f"Successful login for user: {user['email']}")
        return {
            "access_token": access_token,
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

@router.post("/signup")
async def signup(user: User):
    try:
        # Validate input further if needed
        if len(user.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
        existing_user = await users_collection.find_one({
            "$or": [
                {"email": user.email},
                {"username": user.username}
            ]
        })
        
        if existing_user:
            if existing_user.get("email") == user.email:
                raise UserAlreadyExistsError("email", user.email)
            else:
                raise UserAlreadyExistsError("username", user.username)
        
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
        
        logger.info(f"New user created: {user.email}")
        return {"message": "User created successfully", "user_id": str(result.inserted_id)}
    
    except UserAlreadyExistsError as e:
        logger.warning(f"User creation failed - already exists: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except DuplicateKeyError as e:
        logger.warning(f"Database duplicate key error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    except OperationFailure as e:
        logger.error(f"Database operation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database operation failed"
        )
    except Exception as e:
        logger.error(f"Unexpected error during signup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during registration"
        )