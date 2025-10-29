# middleware/role_middleware.py
from fastapi import HTTPException, status, Depends
from typing import List
from services.user import get_current_user
from schemas.user import UserInDB

def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: UserInDB = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this resource"
            )
        return current_user
    return role_checker

# Specific role checkers for convenience
require_admin = require_roles(["admin"])
require_agency = require_roles(["agency", "admin"])
require_user = require_roles(["user", "agency", "admin"])