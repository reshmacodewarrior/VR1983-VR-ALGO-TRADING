# schemas/strategy.py - ADD USER FIELD
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from enum import Enum
from datetime import datetime

class StrategyLanguage(str, Enum):
    PINE_SCRIPT = "pine_script"
    PYTHON = "python"
    JAVASCRIPT = "javascript"

class StrategyStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class BacktestStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

# ✅ FOR CREATING STRATEGIES (WITH USER AUTH)
class StrategyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    code: str
    language: StrategyLanguage = StrategyLanguage.PINE_SCRIPT
    parameters: Dict[str, Any] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)
    # Remove user_id from here - will come from auth

# ✅ FOR RESPONSE
class StrategyResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    code: str
    language: str
    parameters: Dict[str, Any]
    status: StrategyStatus = StrategyStatus.DRAFT
    version: int = 1
    created_at: datetime
    updated_at: datetime
    tags: List[str]
    is_public: bool = False

    class Config:
        from_attributes = True

# ✅ FOR BACKTEST REQUESTS
class BacktestRequest(BaseModel):
    strategy_code: str
    language: StrategyLanguage
    symbol: str
    timeframe: str
    start_date: str
    end_date: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    initial_capital: float = 100000.0
    commission: float = 0.001

# ✅ FOR BACKTEST RESPONSE
class BacktestResponse(BaseModel):
    backtest_id: str
    status: str
    results: Optional[Dict[str, Any]] = None
    error: Optional[str] = None