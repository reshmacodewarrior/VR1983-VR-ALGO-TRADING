# schemas/strategy.py
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from enum import Enum

class StrategyLanguage(str, Enum):
    PINE_SCRIPT = "pine_script"
    PYTHON = "python"
    JAVASCRIPT = "javascript"

class StrategyBase(BaseModel):
    name: str
    description: Optional[str] = None
    language: StrategyLanguage = StrategyLanguage.PINE_SCRIPT
    code: str  # User's strategy code
    version: str = "1.0"

class StrategyConfig(BaseModel):
    initial_capital: float = 100000.0
    commission: float = 0.001  # 0.1%
    pyramiding: int = 1  # Max simultaneous trades
    default_qty_type: str = "percent_of_equity"  # "fixed", "percent_of_equity"
    default_qty_value: float = 10.0  # 10% of equity or fixed amount

class BacktestRequest(BaseModel):
    strategy_code: str
    language: StrategyLanguage
    symbol: str
    timeframe: str
    start_date: str
    end_date: str
    config: StrategyConfig
    parameters: Dict[str, Any] = Field(default_factory=dict)

class BacktestResponse(BaseModel):
    backtest_id: str
    status: str
    results: Optional[Dict[str, Any]] = None
    error: Optional[str] = None