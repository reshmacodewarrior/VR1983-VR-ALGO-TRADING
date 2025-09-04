from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class TradingSignalResponse(BaseModel):
    signal: str
    symbol: str
    timestamp: str
    price: float
    rsi: Optional[float] = None
    sma_20: Optional[float] = None
    reason: Optional[str] = None
    confidence: Optional[float] = None

    model_config = ConfigDict(arbitrary_types_allowed=True)


class BacktestRequest(BaseModel):
    symbol: str
    period: str = "3mo"
    interval: str = "1h"
    rsi_oversold: int = 30
    rsi_overbought: int = 70
    sma_period: int = 20

    model_config = ConfigDict(arbitrary_types_allowed=True)


class BacktestResult(BaseModel):
    total_signals: int
    buy_signals: int
    sell_signals: int
    win_rate: Optional[float] = None
    trades: List[dict]  # Use simple dict instead of typed Dict

    model_config = ConfigDict(arbitrary_types_allowed=True)