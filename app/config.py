from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    ENVIRONMENT: str = "sandbox"

    # Security
    SECRET_KEY: str
    REFRESH_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    MONGODB_URI: str
    DB_NAME: str

    # Email
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int
    MAIL_SERVER: str
    MAIL_STARTTLS: bool
    MAIL_SSL_TLS: bool
    USE_CREDENTIALS: bool
    VALIDATE_CERTS: bool

    # Upstox Sandbox
    UPSTOX_SANDBOX_CLIENT_ID: str
    UPSTOX_SANDBOX_CLIENT_SECRET: str
    UPSTOX_SANDBOX_REDIRECT_URL: str
    UPSTOX_SANDBOX_BASE_URL: str
    UPSTOX_SANDBOX_AUTH_URL: str
    UPSTOX_SANDBOX_ACCESS_TOKEN: str = None

    # Upstox Live (optional)
    UPSTOX_LIVE_CLIENT_ID: Optional[str] = ""
    UPSTOX_LIVE_CLIENT_SECRET: Optional[str] = ""
    UPSTOX_LIVE_REDIRECT_URL: Optional[str] = ""
    UPSTOX_LIVE_BASE_URL: Optional[str] = ""
    UPSTOX_LIVE_AUTH_URL: Optional[str] = ""

    class Config:
        env_file = ".env"

settings = Settings()
