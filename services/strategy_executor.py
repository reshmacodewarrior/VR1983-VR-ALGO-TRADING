# services/strategy_executor.py
import asyncio
import javascript
from typing import Dict, Any, List
from datetime import datetime
from schemas.strategy import BacktestRequest
import pandas as pd

class StrategyExecutor:
    def __init__(self):
        self.supported_languages = {
            "pine_script": self._execute_pine_script,
            "python": self._execute_python,
            "javascript": self._execute_javascript
        }
    
    async def execute_backtest(self, request: BacktestRequest) -> Dict[str, Any]:
        """Execute user's strategy code"""
        try:
            # Get historical data
            data = await self._fetch_historical_data(
                request.symbol,
                request.timeframe,
                request.start_date,
                request.end_date
            )
            
            # Execute strategy based on language
            executor = self.supported_languages[request.language]
            results = await executor(request.strategy_code, data, request.parameters)
            
            return {
                "status": "completed",
                "results": results,
                "performance_metrics": self._calculate_metrics(results)
            }
            
        except Exception as e:
            return {
                "status": "failed",
                "error": str(e)
            }
    
    async def _execute_pine_script(self, code: str, data: pd.DataFrame, params: Dict) -> Dict:
        """Execute Pine Script strategy"""
        # Convert Pine Script to executable format
        # This would use a Pine Script interpreter
        executed_trades = []
        
        # Mock execution - in reality, you'd use a Pine Script interpreter
        for i, row in data.iterrows():
            # Execute user's strategy logic on each bar
            signal = await self._evaluate_pine_script(code, row, params)
            
            if signal:
                executed_trades.append({
                    'timestamp': row.name,
                    'signal': signal['action'],
                    'price': row['close'],
                    'quantity': signal['qty']
                })
        
        return {
            'trades': executed_trades,
            'equity_curve': self._calculate_equity_curve(executed_trades),
            'analysis': self._analyze_trades(executed_trades)
        }
    
    async def _execute_python(self, code: str, data: pd.DataFrame, params: Dict) -> Dict:
        """Execute Python strategy in sandbox"""
        # Execute in secure sandbox
        try:
            # Create secure execution environment
            exec_globals = {
                'data': data,
                'params': params,
                'print': lambda x: None,  # Disable print
                '__builtins__': {}  # Limit builtins for security
            }
            
            # Add safe technical indicators
            exec_globals.update(self._get_safe_indicators())
            
            # Execute user code
            exec(code, exec_globals)
            
            # Extract results
            trades = exec_globals.get('trades', [])
            signals = exec_globals.get('signals', [])
            
            return {
                'trades': trades,
                'signals': signals,
                'execution_log': exec_globals.get('log', [])
            }
            
        except Exception as e:
            raise Exception(f"Python execution error: {str(e)}")
    
    def _get_safe_indicators(self) -> Dict:
        """Provide safe technical indicators for user strategies"""
        return {
            'sma': self._sma,
            'ema': self._ema,
            'rsi': self._rsi,
            'macd': self._macd,
            'bbands': self._bbands,
            'atr': self._atr,
            'cross': self._cross,
            'crossover': self._crossover
        }