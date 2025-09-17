import csv
from fastapi import APIRouter, UploadFile, File, Depends
from io import StringIO
from datetime import datetime
from database.collections import levels_collection
from .user import get_current_user
from schemas.user import UserInDB

router = APIRouter(prefix="/api/levels", tags=["Levels"])

@router.post("/upload")
async def upload_levels(
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_user)
):
    """Upload CSV with levels and store in MongoDB"""
    try:
        content = await file.read()
        decoded = content.decode("utf-8")
        reader = csv.DictReader(StringIO(decoded))

        inserted = []
        for row in reader:
            row = {k.lower().strip(): v.strip() for k, v in row.items() if k}

            symbol = row.get("symbol")
            level = row.get("level")
            transaction_type = row.get("transaction_type") or row.get("type")

            if not symbol or not level or not transaction_type:
                continue 

            await levels_collection.insert_one({
                "user_id": current_user.id,
                "symbol": symbol.upper(),
                "level": float(level),
                "transaction_type": transaction_type.upper(),
                "created_at": datetime.utcnow()
            })
            inserted.append(symbol.upper())

        if not inserted:
            return {"message": "No valid rows found in CSV"}

        return {"message": "Levels uploaded successfully", "symbols": list(set(inserted))}

    except Exception as e:
        return {"error": str(e)}
