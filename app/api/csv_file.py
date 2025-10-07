# app/api/csv_routes.py
from fastapi import APIRouter, Query

router = APIRouter(prefix="/csv", tags=["CSV Exports"])

@router.get("/analyze-symbols")
async def analyze_symbols_to_csv(
    symbols: str = Query(..., description="Comma separated symbols")
):
    """
    Analyze symbols and return CSV file
    """
    try:
        from app.services.algo_service import AlgorithmService
        algo_service = AlgorithmService()
        
        symbols_list = [s.strip() for s in symbols.split(",")]
        return algo_service.analyze_symbols_to_csv_response(symbols_list)
        
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/latest-signals")
async def get_latest_signals_csv():
    """
    Get the latest signals as CSV
    """
    try:
        from app.services.algo_service import AlgorithmService
        algo_service = AlgorithmService()
        
        default_symbols = [
            "TATAMOTORS.NS", "RELIANCE.NS", "INFY.NS", 
            "HDFCBANK.NS", "ICICIBANK.NS"
        ]
        
        return algo_service.analyze_symbols_to_csv_response(default_symbols)
        
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))