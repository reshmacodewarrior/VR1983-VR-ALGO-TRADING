from fastapi import APIRouter, HTTPException, Query
from app.api.user import get_password_hash
from app.database.collections import markets_collection
from datetime import datetime, timedelta
from app.database.collections import users_collection
from app.config import settings
from pydantic import BaseModel, EmailStr, Field
from jose import JWTError, jwt
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from app.utils import send_reset_email  # Assuming you have a utility function to send emails

router = APIRouter()

from pydantic import BaseModel, EmailStr, Field

class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="User's registered email")


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., description="Password reset token sent by email")
    new_password: str = Field(..., min_length=6, description="New password")
    confirm_password: str = Field(..., min_length=6, description="Confirm new password")

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    user = await users_collection.find_one({"email": req.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": req.email, "exp": expire}
    reset_token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    await users_collection.update_one(
        {"email": req.email},
        {"$set": {"reset_token": reset_token, "reset_token_expiry": expire}}
    )

    reset_link = f"http://192.168.1.58:8000/reset-password?token={reset_token}"

    # Send email
    await send_reset_email(req.email, reset_link)

    return {"message": "Password reset link sent to your email"}

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    if req.new_password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    try:
        payload = jwt.decode(req.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = await users_collection.find_one({"email": email})
    if not user or user.get("reset_token") != req.token:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    hashed_password = get_password_hash(req.new_password)

    await users_collection.update_one(
        {"email": email},
        {"$set": {"hashed_password": hashed_password}, "$unset": {"reset_token": "", "reset_token_expiry": ""}}
    )

    return {"message": "Password reset successful"}
