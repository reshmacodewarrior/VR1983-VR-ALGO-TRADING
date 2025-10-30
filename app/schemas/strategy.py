from pydantic import BaseModel, Field, validator, ConfigDict
from typing import Optional, Dict, Any, List
from enum import Enum
from datetime import datetime
import re

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

# ✅ ENHANCED: Strategy Creation with Validation
class StrategyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Strategy name")
    description: Optional[str] = Field(None, max_length=500, description="Strategy description")
    code: str = Field(..., min_length=10, max_length=10000, description="Strategy code")
    language: StrategyLanguage = Field(StrategyLanguage.PINE_SCRIPT, description="Programming language")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Strategy parameters")
    tags: List[str] = Field(default_factory=list, description="Strategy tags")

    @validator('name')
    def validate_name(cls, v):
        if not re.match(r'^[a-zA-Z0-9_\-\s]+$', v):
            raise ValueError('Name can only contain letters, numbers, spaces, hyphens, and underscores')
        return v.strip()

    @validator('tags')
    def validate_tags(cls, v):
        if len(v) > 10:
            raise ValueError('Cannot have more than 10 tags')
        for tag in v:
            if len(tag) > 20:
                raise ValueError('Tag cannot exceed 20 characters')
        return v

# ✅ ENHANCED: Strategy Update (Partial Updates)
class StrategyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    code: Optional[str] = Field(None, min_length=10, max_length=10000)
    parameters: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    status: Optional[StrategyStatus] = None

    @validator('name')
    def validate_name(cls, v):
        if v is not None:
            if not re.match(r'^[a-zA-Z0-9_\-\s]+$', v):
                raise ValueError('Name can only contain letters, numbers, spaces, hyphens, and underscores')
            return v.strip()
        return v

# ✅ ENHANCED: Strategy Response
class StrategyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str = Field(..., description="Strategy ID")
    user_id: str = Field(..., description="Owner user ID")
    name: str = Field(..., description="Strategy name")
    description: Optional[str] = Field(None, description="Strategy description")
    code: str = Field(..., description="Strategy code")
    language: str = Field(..., description="Programming language")
    parameters: Dict[str, Any] = Field(..., description="Strategy parameters")
    status: StrategyStatus = Field(StrategyStatus.DRAFT, description="Strategy status")
    version: int = Field(1, description="Strategy version")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    tags: List[str] = Field(..., description="Strategy tags")
    is_public: bool = Field(False, description="Public visibility")
    published_at: Optional[datetime] = Field(None, description="Publication timestamp")

# ✅ ENHANCED: Marketplace Strategy (Limited fields for public viewing)
class MarketplaceStrategy(BaseModel):
    id: str
    name: str
    description: Optional[str]
    language: str
    user_id: str
    published_at: datetime
    rating: float = Field(0, ge=0, le=5)
    downloads: int = Field(0, ge=0)
    tags: List[str]
    # Excludes: code, parameters, etc. for security

# ✅ ENHANCED: Backtest Request with Validation
class BacktestRequest(BaseModel):
    strategy_code: str = Field(..., min_length=10, max_length=10000, description="Strategy code to backtest")
    language: StrategyLanguage = Field(..., description="Programming language")
    symbol: str = Field(..., min_length=1, max_length=10, description="Trading symbol")
    timeframe: str = Field(..., pattern="^(1m|5m|15m|1h|4h|1d|1w)$", description="Timeframe for backtest")
    start_date: str = Field(..., description="Backtest start date (YYYY-MM-DD)")
    end_date: str = Field(..., description="Backtest end date (YYYY-MM-DD)")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Strategy parameters")
    initial_capital: float = Field(100000.0, ge=1000, le=1000000, description="Initial capital")
    commission: float = Field(0.001, ge=0, le=0.1, description="Commission rate")

    @validator('symbol')
    def validate_symbol(cls, v):
        return v.upper().strip()

    @validator('start_date', 'end_date')
    def validate_dates(cls, v, values, **kwargs):
        try:
            datetime.strptime(v, '%Y-%m-%d')
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')
        return v

    @validator('end_date')
    def validate_date_range(cls, v, values):
        if 'start_date' in values and values['start_date']:
            start = datetime.strptime(values['start_date'], '%Y-%m-%d')
            end = datetime.strptime(v, '%Y-%m-%d')
            if end <= start:
                raise ValueError('End date must be after start date')
            if (end - start).days > 365 * 2:  # Max 2 years
                raise ValueError('Backtest period cannot exceed 2 years')
        return v

# ✅ ENHANCED: Backtest Response
class BacktestResponse(BaseModel):
    backtest_id: str = Field(..., description="Backtest session ID")
    status: BacktestStatus = Field(..., description="Backtest status")
    results: Optional[Dict[str, Any]] = Field(None, description="Backtest results")
    error: Optional[str] = Field(None, description="Error message if failed")
    progress: Optional[float] = Field(None, ge=0, le=100, description="Progress percentage")
    execution_time: Optional[float] = Field(None, description="Execution time in seconds")

# ✅ NEW: Backtest Results Detail Schema
class BacktestResults(BaseModel):
    total_return: float = Field(..., description="Total return percentage")
    sharpe_ratio: Optional[float] = Field(None, description="Sharpe ratio")
    max_drawdown: float = Field(..., description="Maximum drawdown percentage")
    win_rate: float = Field(..., description="Win rate percentage")
    total_trades: int = Field(..., description="Total number of trades")
    profitable_trades: int = Field(..., description="Number of profitable trades")
    final_equity: float = Field(..., description="Final equity value")
    metrics: Dict[str, Any] = Field(default_factory=dict, description="Additional metrics")

# ✅ NEW: Strategy Search & Filter Schema
class StrategySearch(BaseModel):
    search: Optional[str] = Field(None, description="Search query")
    language: Optional[StrategyLanguage] = Field(None, description="Filter by language")
    tags: Optional[List[str]] = Field(None, description="Filter by tags")
    min_rating: Optional[float] = Field(None, ge=0, le=5, description="Minimum rating")
    sort_by: str = Field("published_at", description="Sort field")
    sort_order: str = Field("desc", pattern ="^(asc|desc)$", description="Sort order")
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(10, ge=1, le=100, description="Page size")