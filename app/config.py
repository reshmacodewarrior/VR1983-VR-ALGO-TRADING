from pydantic_settings import BaseSettings
from datetime import timedelta

class Settings(BaseSettings):
    ENVIRONMENT: str = "sandbox"

    SECRET_KEY: str
    REFRESH_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    MONGODB_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "trading_app"
    
    # Email settings
    MAIL_USERNAME: str = "reshmamanikandan1512@gmail.com"
    MAIL_PASSWORD: str = "irxdlyucgsrdjqiw"
    MAIL_FROM: str = "reshmamanikandan1512@gmail.com"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True
    
    # ✅ ADD UPSTOX SETTINGS HERE
    UPSTOX_SANDBOX_CLIENT_ID: str ="876928f8-af4c-498e-a11b-b7b0d6a02389"
    UPSTOX_SANDBOX_CLIENT_SECRET: str ="b9g6hsptub"
    UPSTOX_REDIRECT_URL: str ="https://localhost:8000/api/upstox/callback"
    UPSTOX_AUTH_URL:str="https://api-sandbox.upstox.com"
    UPSTOX_BASE_URL:str="https://api-sandbox.upstox.com/v2"

    class Config:
        env_file = ".env"

settings = Settings()