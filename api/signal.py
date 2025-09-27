from fastapi import APIRouter
from datetime import datetime
from app.services.storage import trading_signals  # 👈 shared signals

router = APIRouter(prefix="/api", tags=["signals"])



@router.get("/signals")
async def get_signals():
    return {
        "signals": trading_signals,
        "last_updated": datetime.utcnow().isoformat()
    }