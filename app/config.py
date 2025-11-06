from pydantic_settings import BaseSettings
from datetime import timedelta

class Settings(BaseSettings):
    SECRET_KEY: str = "WtJyi_5IPAKKr1CUiyjszT5u9-rL7FTmAMW3v-QY0Do"
    REFRESH_SECRET_KEY: str = "HvpSt5m-cPB3NaK0Oy6dKRinXOveuL9YnfD3kL0K3M4"
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
    UPSTOX_CLIENT_ID: str = ""
    UPSTOX_CLIENT_SECRET: str = ""
    UPSTOX_REDIRECT_URL: str = "http://localhost:8000/api/upstox/callback"
    UPSTOX_BASE_URL: str = "https://api.upstox.com/v2"

    class Config:
        env_file = ".env"

settings = Settings()