from motor.motor_asyncio import AsyncIOMotorClient
from config import settings


client = AsyncIOMotorClient(settings.MONGODB_URI)
db = client[settings.DB_NAME]

users_collection = db[settings.USERS_COLLECTION]
tata_collection = db[settings.TATA_COLLECTION]
wipro_collection = db[settings.WIPRO_COLLECTION]
brokers_collection = db[settings.BROKERS_COLLECTION]
markets_collection = db[settings.MARKETS_COLLECTION]
notifications_collection = db[settings.NOTIFICATIONS_COLLECTION]
preferences_collection = db[settings.PREFERENCES_COLLECTION]
trades_collection = db[settings.TRADES_COLLECTION]
