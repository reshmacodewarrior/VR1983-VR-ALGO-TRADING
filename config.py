from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str ="f5a8341d33fbc6dd8a53e121f4fa0182547cfd212d6ced5fe71db943206b2976"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    MONGODB_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "trading_app"
    
    USERS_COLLECTION: str = "users"
    TATA_COLLECTION: str = "tata_motors"
    WIPRO_COLLECTION: str = "wipro"
    BROKERS_COLLECTION: str = "brokers"
    NOTIFICATIONS_COLLECTION: str = "notifications"
    TRADES_COLLECTION: str = "trades"
    MARKETS_COLLECTION: str ="markets"
    PREFERENCES_COLLECTION: str = "preferences"
    
    # Email settings
    MAIL_USERNAME: str = "reshmamanikandan1512@gmail.com"
    MAIL_PASSWORD: str = "irxdlyucgsrdjqiw"   # use Gmail App Password
    MAIL_FROM: str = "reshmamanikandan1512@gmail.com"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_STARTTLS : bool=True   # enable STARTTLS
    MAIL_SSL_TLS : bool =False  # SSL/TLS mode
    USE_CREDENTIALS : bool =True
    VALIDATE_CERTS : bool =True

    class Config:
        env_file = ".env"
     
settings = Settings()