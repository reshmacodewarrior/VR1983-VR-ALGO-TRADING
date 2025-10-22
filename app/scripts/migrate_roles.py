import asyncio
from database.collections import users_collection

async def migrate_existing_users():
    """Add default 'user' role to existing users without role"""
    result = await users_collection.update_many(
        {"role": {"$exists": False}},
        {"$set": {"role": "user"}}
    )
    print(f"Updated {result.modified_count} users with default role")

if __name__ == "__main__":
    asyncio.run(migrate_existing_users())