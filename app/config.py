from pydantic_settings import BaseSettings
from datetime import timedelta

class Settings(BaseSettings):
    SECRET_KEY: str ="f5a8341d33fbc6dd8a53e121f4fa0182547cfd212d6ced5fe71db943206b2976"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # 1 minute for testing
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7    # new: refresh token valid for 7 days
    
    MONGODB_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "trading_app"
    
    # Email settings
    MAIL_USERNAME: str = "reshmamanikandan1512@gmail.com"
    MAIL_PASSWORD: str = "irxdlyucgsrdjqiw"   # Gmail App Password
    MAIL_FROM: str = "reshmamanikandan1512@gmail.com"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_STARTTLS : bool=True
    MAIL_SSL_TLS : bool =False
    USE_CREDENTIALS : bool =True
    VALIDATE_CERTS : bool =True

    class Config:
        env_file = ".env"
     
settings = Settings()
