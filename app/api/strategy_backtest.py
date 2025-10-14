# api/strategy_backtest.py - UPDATE WITH USER AUTH
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from typing import Dict, Any, List
import uuid
from datetime import datetime
from services.backtest_engine import BacktestEngine
from database.collections import create_backtest, get_backtest, update_backtest, get_user_backtests
from schemas.strategy import BacktestRequest, BacktestResponse
from services.user import get_current_user  # ✅ IMPORT AUTH
from schemas.user import UserInDB  # ✅ IMPORT USER SCHEMA

router = APIRouter(prefix="/api/strategy", tags=["strategy_backtest"])

@router.post("/backtest", response_model=BacktestResponse)
async def run_strategy_backtest(
    backtest_request: BacktestRequest,
    background_tasks: BackgroundTasks,
    current_user: UserInDB = Depends(get_current_user)  # ✅ USER AUTH
):
    """Run backtest for authenticated user"""
    try:
        backtest_id = str(uuid.uuid4())
        
        # ✅ SAVE WITH USER ID
        backtest_doc = {
            "backtest_id": backtest_id,
            "user_id": current_user.id,  # ✅ FROM AUTH
            "strategy_code": backtest_request.strategy_code,
            "language": backtest_request.language,
            "symbol": backtest_request.symbol,
            "timeframe": backtest_request.timeframe,
            "start_date": backtest_request.start_date,
            "end_date": backtest_request.end_date,
            "parameters": backtest_request.parameters,
            "initial_capital": backtest_request.initial_capital,
            "commission": backtest_request.commission,
            "status": "running",
            "created_at": datetime.utcnow()
        }
        
        await create_backtest(backtest_doc)
        print(f"✅ Backtest {backtest_id} saved for user {current_user.id}")
        
        # Run backtest in background
        background_tasks.add_task(
            execute_and_save_backtest, 
            backtest_id, 
            backtest_request.dict(),
            current_user.id  # ✅ PASS USER ID
        )
        
        return BacktestResponse(
            backtest_id=backtest_id,
            status="running",
            results=None
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backtest failed: {str(e)}")

@router.get("/backtest/{backtest_id}", response_model=dict)
async def get_backtest_results(
    backtest_id: str,
    current_user: UserInDB = Depends(get_current_user)  # ✅ USER AUTH
):
    """Get backtest results - only if user owns it"""
    try:
        backtest = await get_backtest(backtest_id, current_user.id)  # ✅ USER CHECK
        
        if not backtest:
            raise HTTPException(status_code=404, detail="Backtest not found")
        
        return backtest
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch backtest: {str(e)}")

@router.get("/backtests/history", response_model=List[dict])
async def get_user_backtest_history(
    current_user: UserInDB = Depends(get_current_user)  # ✅ USER AUTH
):
    """Get all backtests for authenticated user"""
    try:
        backtests = await get_user_backtests(current_user.id)
        
        return [
            {
                "id": str(backtest["_id"]),
                "backtest_id": backtest.get("backtest_id"),
                "symbol": backtest.get("symbol"),
                "timeframe": backtest.get("timeframe"),
                "status": backtest.get("status"),
                "created_at": backtest.get("created_at"),
                "completed_at": backtest.get("completed_at"),
                "results": backtest.get("results", {})
            }
            for backtest in backtests
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch backtest history: {str(e)}")

async def execute_and_save_backtest(backtest_id: str, backtest_request: Dict[str, Any], user_id: str):
    """Execute backtest and SAVE results"""
    try:
        engine = BacktestEngine()
        results = await engine.run_backtest(backtest_request)
        
        update_data = {
            "status": "completed",
            "results": results,
            "completed_at": datetime.utcnow()
        }
        
        await update_backtest(backtest_id, update_data)
        print(f"✅ Backtest {backtest_id} completed for user {user_id}")
        
    except Exception as e:
        error_data = {
            "status": "failed", 
            "results": {"error": str(e)},
            "completed_at": datetime.utcnow()
        }
        await update_backtest(backtest_id, error_data)
        print(f"❌ Backtest {backtest_id} failed for user {user_id}: {str(e)}")