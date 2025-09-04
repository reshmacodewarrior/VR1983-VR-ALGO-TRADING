from motor.motor_asyncio import AsyncIOMotorClient
from config import settings


client = AsyncIOMotorClient(settings.MONGODB_URI)
db = client[settings.DB_NAME]

users_collection = db.get_collection("users")
tata_collection = db.get_collection("tata_motors")
wipro_collection = db.get_collection("wipro")
brokers_collection = db.get_collection("brokers")
markets_collection = db.get_collection("markets")
notifications_collection = db.get_collection("notifications")
preferences_collection = db.get_collection("preferences")
trades_collection = db.get_collection("trades")
holdings_collection = db.get_collection("holdings")
balance_collection = db.get_collection("balance")