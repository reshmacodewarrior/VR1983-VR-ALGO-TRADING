# api/user_api.py
import os
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from database.collections import users_collection
from schemas.user import User, UserInDB, Token, UserUpdate
from services.user import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    get_current_user,
    create_refresh_token,
    verify_refresh_token,
    get_all_users,
    update_user_role,
    get_users_by_role,
    get_user_stats
)
from middleware.role_middleware import require_admin, require_agency, require_user
from config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/user", tags=["users"])
 
# ========== AUTHENTICATION ENDPOINTS ==========

@router.post("/signup")
async def signup(user: User):
    """
    Register a new user account
    - Validates email and username uniqueness
    - Hashes password securely
    - Creates user record with default role
    - Returns user ID and confirmation
    """
    try:
        logger.info(f"Signup attempt - Email: {user.email}, Username: {user.username}")
        
        # Check for existing user
        existing_user = await users_collection.find_one({
            "$or": [
                {"email": user.email},
                {"username": user.username}
            ]
        })
        
        if existing_user:
            if existing_user.get("email") == user.email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
        
        # Hash password and create user
        hashed_password = get_password_hash(user.password)
        user_data = {
            "username": user.username,
            "firstname": user.firstname,
            "lastname": user.lastname,
            "email": user.email,
            "mobile_no": user.mobile_no,
            "hashed_password": hashed_password,
            "brokers": [],
            "watchlist": [],
            "role": user.role,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "refresh_token": None
        }
        
        result = await users_collection.insert_one(user_data)
        
        return {
            "message": "User created successfully", 
            "user_id": str(result.inserted_id),
            "email": user.email,
            "role": user.role
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticate user and generate access/refresh tokens
    - Accepts username or email for login
    - Verifies password against stored hash
    - Generates JWT access token and refresh token
    - Updates last login timestamp
    - Returns user info with tokens
    """
    try:
        user = await users_collection.find_one({
            "$or": [
                {"email": form_data.username},
                {"username": form_data.username}
            ]
        })
        
        if not user or not verify_password(form_data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username/email or password"
            )
        
        # Ensure role exists
        if "role" not in user:
            user["role"] = "user"
        
        # Create tokens with role
        access_token = create_access_token(data={"sub": user["email"], "role": user["role"]})
        refresh_token = create_refresh_token(data={"sub": user["email"]})
        
        # Store refresh token
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
        
        logger.info(f"Successful login for: {user['email']}")
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "username": user["username"],   
                "email": user["email"],
                "firstname": user.get("firstname", ""),
                "lastname": user.get("lastname", ""),
                "role": user["role"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.get("/profile")
async def get_user_profile(current_user: UserInDB = Depends(require_user)):
    """
    Retrieve current authenticated user's profile information
    - Returns complete user profile data
    - Requires valid authentication token
    - Includes personal info, brokers, and watchlist
    """
    try:
        return {
            "id": current_user.id,
            "username": current_user.username,   
            "firstname": current_user.firstname,
            "lastname": current_user.lastname,
            "email": current_user.email,
            "mobile_no": current_user.mobile_no,
            "brokers": current_user.brokers,
            "watchlist": current_user.watchlist,
            "role": current_user.role,
            "created_at": current_user.created_at
        }
    except Exception as e:
        logger.error(f"Profile fetch error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch profile"
        )

@router.put("/profile")
async def update_user_profile(
    update_data: UserUpdate,
    current_user: UserInDB = Depends(require_user)
):
    """
    Update current user's profile information
    - Allows partial updates of user data
    - Validates update fields
    - Updates timestamp automatically
    - Returns success confirmation
    """
    try:
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        if not update_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        update_dict["updated_at"] = datetime.now().isoformat()
        
        result = await users_collection.update_one(
            {"email": current_user.email},
            {"$set": update_dict}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No changes made"
            )
        
        return {"message": "Profile updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

# ========== ADMIN DASHBOARD ENDPOINTS ==========

@router.get("/admin/users")
async def admin_get_all_users(current_user: UserInDB = Depends(require_admin)):
    """
    Retrieve all users in the system (Admin only)
    - Returns complete list of all registered users
    - Includes user details and metadata
    - Restricted to admin role access
    """
    try:
        users = await get_all_users(current_user)
        return [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "firstname": user.firstname,
                "lastname": user.lastname,
                "role": user.role,
                "created_at": user.created_at,
                "mobile_no": user.mobile_no
            }
            for user in users
        ]
    except Exception as e:
        logger.error(f"Admin users fetch error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch users"
        )

@router.get("/admin/users/role/{role}")
async def admin_get_users_by_role(
    role: str,
    current_user: UserInDB = Depends(require_admin)
):
    """
    Filter and retrieve users by specific role (Admin only)
    - Returns users filtered by role type
    - Useful for role-based user management
    - Restricted to admin role access
    """
    try:
        users = await get_users_by_role(role, current_user)
        return [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "firstname": user.firstname,
                "lastname": user.lastname,
                "role": user.role,
                "created_at": user.created_at
            }
            for user in users
        ]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Role-based users fetch error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch users by role"
        )

@router.put("/admin/users/{email}/role")
async def admin_update_user_role(
    email: str, 
    role_update: dict,
    current_user: UserInDB = Depends(require_admin)
):
    """
    Modify user role permissions (Admin only)
    - Updates user's role in the system
    - Enables role-based access control management
    - Restricted to admin role access
    """
    try:
        return await update_user_role(email, role_update.get("role"), current_user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Role update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user role"
        )

@router.get("/admin/stats")
async def admin_get_stats(current_user: UserInDB = Depends(require_admin)):
    """
    Retrieve system user statistics (Admin only)
    - Returns analytics and metrics about users
    - Useful for admin dashboard reporting
    - Restricted to admin role access
    """
    try:
        return await get_user_stats(current_user)
    except Exception as e:
        logger.error(f"Stats fetch error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch statistics"
        )

@router.get("/admin/dashboard")
async def admin_dashboard(current_user: UserInDB = Depends(require_admin)):
    """
    Admin dashboard overview (Admin only)
    - Returns admin-specific features and welcome message
    - Provides overview of admin capabilities
    - Restricted to admin role access
    """
    return {
        "message": "Welcome to Admin Dashboard",
        "user": {
            "email": current_user.email,
            "role": current_user.role
        },
        "features": [
            "View all users",
            "Manage user roles",
            "View user statistics",
            "Filter users by role"
        ]
    }

# ========== AGENCY DASHBOARD ENDPOINTS ==========

@router.get("/agency/users")
async def agency_get_users(current_user: UserInDB = Depends(require_agency)):
    """
    Retrieve users visible to agency role (Agency only)
    - Returns regular users and other agencies
    - Limited visibility compared to admin
    - Restricted to agency role access
    """
    try:
        # Agencies can see regular users and their own agency users
        users = await users_collection.find({
            "role": {"$in": ["user", "agency"]}
        }).to_list(length=1000)
        
        user_list = []
        for user in users:
            user["_id"] = str(user["_id"])
            if "role" not in user:
                user["role"] = "user"
            user_list.append({
                "id": user["_id"],
                "username": user["username"],
                "email": user["email"],
                "role": user["role"],
                "created_at": user.get("created_at")
            })
        
        return user_list
        
    except Exception as e:
        logger.error(f"Agency users fetch error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch users"
        )

@router.get("/agency/dashboard")
async def agency_dashboard(current_user: UserInDB = Depends(require_agency)):
    """
    Agency dashboard overview (Agency only)
    - Returns agency-specific features and welcome message
    - Provides overview of agency capabilities
    - Restricted to agency role access
    """
    return {
        "message": "Welcome to Agency Dashboard",
        "user": {
            "email": current_user.email,
            "role": current_user.role
        },
        "features": [
            "View regular users",
            "View other agencies",
            "Manage user watchlists",
            "Track user activities"
        ]
    }

# ========== TOKEN MANAGEMENT ==========

@router.post("/refresh")
async def refresh_token(request: Request):
    """
    Generate new access token using refresh token
    - Validates existing refresh token
    - Issues new access and refresh tokens
    - Updates refresh token in database
    - Maintains continuous authentication
    """
    try:
        data = await request.json()
        refresh_token = data.get("refresh_token")
        
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refresh token is required"
            )
        
        user = await verify_refresh_token(refresh_token)
        new_access_token = create_access_token(data={"sub": user.email, "role": user.role})
        new_refresh_token = create_refresh_token(data={"sub": user.email})
        
        await users_collection.update_one(
            {"email": user.email},
            {"$set": {"refresh_token": new_refresh_token}}
        )
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to refresh token"
        )

@router.post("/logout")
async def logout(
    request: Request,
    current_user: UserInDB = Depends(require_user)
):
    """
    Invalidate user session and tokens
    - Removes refresh token from database
    - Effectively logs user out of system
    - Requires valid authentication to logout
    - Returns logout confirmation
    """
    try:
        data = await request.json()
        refresh_token = data.get("refresh_token")
        
        update_data = {"$unset": {"refresh_token": ""}}
        if refresh_token:
            await users_collection.update_one(
                {"email": current_user.email, "refresh_token": refresh_token},
                update_data
            )
        else:
            await users_collection.update_one(
                {"email": current_user.email},
                update_data
            )
        
        return {"message": "Successfully logged out"}
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error during logout"
        )