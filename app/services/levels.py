# import csv
# from fastapi import APIRouter, UploadFile, File, Depends
# from io import StringIO
# from database.collections import levels_collection
# from .user import get_current_user
# from schemas.user import UserInDB

# router = APIRouter(prefix="/api/levels", tags=["Levels"])

# @router.post("/upload")
# async def upload_levels(
#     file: UploadFile = File(...),
#     current_user: UserInDB = Depends(get_current_user)
# ):
#     """Upload CSV with levels (symbol, level, transaction_type)"""
#     content = await file.read()
#     decoded = content.decode("utf-8")
#     reader = csv.DictReader(StringIO(decoded))

#     inserted_symbols = []
#     for row in reader:
#         # normalize keys to lowercase
#         row = {k.lower().strip(): v.strip() for k, v in row.items() if k}

#         symbol = row.get("symbol")
#         level = row.get("level")
#         transaction_type = row.get("transaction_type") or row.get("type")

#         if not symbol or not level or not transaction_type:
#             continue  # skip invalid rows

#         await levels_collection.insert_one({
#             "user_id": current_user.id,
#             "symbol": symbol,
#             "level": float(level),
#             "transaction_type": transaction_type.upper()
#         })

#         if symbol.upper() not in inserted_symbols:
#             inserted_symbols.append(symbol.upper())

#     return {"message": "Levels uploaded successfully", "symbols": inserted_symbols}

