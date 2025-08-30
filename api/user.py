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
from config import settings

router = APIRouter()

templates = Jinja2Templates(directory="templates")

SECRET_KEY = settings.SECRET_KEY 
ALGORITHM = settings.ALGORITHM
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
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
        return UserInDB(**user)
    return None

@router.get("/users/login")
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

@router.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})
@router.get("/forgot-password", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("forgot_password.html", {"request": request})
@router.get("/loggedin", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@router.get("/signup", response_class=HTMLResponse)
async def signup_page(request: Request):
    return templates.TemplateResponse("signup.html", {"request": request})

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

@router.get("/user/profile")
async def get_user_profile(current_user: UserInDB = Depends(get_current_user)):
    return {
        "username": current_user.username,   
        "firstname": current_user.firstname,
        "lastname": current_user.lastname,
        "email": current_user.email,
        "mobile_no": current_user.mobile_no,
        "created_at": current_user.created_at
    }




# def get_password_hash(password: str) -> str:
#     return pwd_context.hash(password)


# # ---------- Schemas ----------
# class ForgotPasswordRequest(User):
#     email: EmailStr

# class ResetPasswordRequest(User):
#     token: str
#     new_password: str
#     confirm_password: str


# # ---------- Routes ----------
# @router.post("/forgot-password")
# async def forgot_password(req: ForgotPasswordRequest):
#     user = await users_collection.find_one({"email": req.email})
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     # Generate reset token
#     expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
#     payload = {"sub": req.email, "exp": expire}
#     reset_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

#     # Store token and expiry in DB
#     await users_collection.update_one(
#         {"email": req.email},
#         {"$set": {"reset_token": reset_token, "reset_token_expiry": expire}}
#     )

#     reset_link = f"http://localhost:8000/reset-password?token={reset_token}"

#     # TODO: Send reset_link by email
#     # Example: send_email(req.email, "Password Reset", f"Click here: {reset_link}")

#     return {"message": "Password reset link sent", "reset_link": reset_link}  # (remove reset_link in production)


# @router.post("/reset-password")
# async def reset_password(req: ResetPasswordRequest):
#     if req.new_password != req.confirm_password:
#         raise HTTPException(status_code=400, detail="Passwords do not match")

#     try:
#         payload = jwt.decode(req.token, SECRET_KEY, algorithms=[ALGORITHM])
#         email = payload.get("sub")
#     except JWTError:
#         raise HTTPException(status_code=401, detail="Invalid or expired token")

#     user = await users_collection.find_one({"email": email})
#     if not user or user.get("reset_token") != req.token:
#         raise HTTPException(status_code=401, detail="Invalid or expired token")

#     hashed_password = get_password_hash(req.new_password)

#     # Update password and clear reset token
#     await users_collection.update_one(
#         {"email": email},
#         {"$set": {"hashed_password": hashed_password}, "$unset": {"reset_token": "", "reset_token_expiry": ""}}
#     )

#     return {"message": "Password reset successful"}

