# services/backtest_engine.py
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from datetime import datetime
import yfinance as yf

class BacktestEngine:
    def __init__(self):
        self.initial_capital = 0
        self.current_cash = 0
        self.positions = {}
        self.trades = []
        self.commission_rate = 0.001  # 0.1%
    
    async def run_backtest(self, backtest_request: Dict) -> Dict[str, Any]:
        """Execute real backtest with user's strategy"""
        try:
            # Extract parameters
            symbol = backtest_request.get('symbol', 'RELIANCE')
            timeframe = self._convert_timeframe(backtest_request.get('timeframe', '1d'))
            start_date = backtest_request.get('start_date', '2023-01-01')
            end_date = backtest_request.get('end_date', '2023-12-31')
            strategy_code = backtest_request.get('strategy_code', '')
            language = backtest_request.get('language', 'pine_script')
            
            self.initial_capital = backtest_request.get('parameters', {}).get('initial_capital', 100000)
            self.current_cash = self.initial_capital
            self.trades = []
            self.positions = {}
            
            print(f"🔍 Fetching data for {symbol} from {start_date} to {end_date}")
            
            # Fetch REAL historical data
            data = await self._fetch_historical_data(symbol, timeframe, start_date, end_date)
            
            if data.empty:
                return {"error": f"No historical data found for {symbol}"}
            
            print(f"✅ Data fetched: {len(data)} records")
            
            # Execute strategy based on language
            if language == 'pine_script':
                trades = await self._execute_pine_script(strategy_code, data)
            elif language == 'python':
                trades = await self._execute_python_strategy(strategy_code, data)
            else:
                return {"error": f"Unsupported language: {language}"}
            
            # Calculate REAL performance metrics
            metrics = self._calculate_performance_metrics(trades)
            
            return {
                "total_trades": len(trades),
                "winning_trades": len([t for t in trades if t.get('pnl', 0) > 0]),
                "losing_trades": len([t for t in trades if t.get('pnl', 0) < 0]),
                "trades": trades[-10:],  # Last 10 trades for display
                "metrics": metrics,
                "data_points": len(data),
                "final_capital": self.current_cash
            }
            
        except Exception as e:
            print(f"❌ Backtest error: {str(e)}")
            return {"error": f"Backtest execution failed: {str(e)}"}
    
    def _convert_timeframe(self, tf: str) -> str:
        """Convert timeframe to yfinance format"""
        conversions = {
            '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
            '1h': '1h', '1d': '1d', '1wk': '1wk', '1mo': '1mo'
        }
        return conversions.get(tf, '1d')
    
    async def _fetch_historical_data(self, symbol: str, timeframe: str, 
                                   start_date: str, end_date: str) -> pd.DataFrame:
        """Fetch REAL historical data from yfinance"""
        try:
            # For Indian stocks, try with .NS
            symbols_to_try = [symbol, f"{symbol}.NS", f"{symbol}.BO"]
            
            for sym in symbols_to_try:
                try:
                    print(f"📥 Trying symbol: {sym}")
                    ticker = yf.Ticker(sym)
                    data = ticker.history(start=start_date, end=end_date, interval=timeframe)
                    
                    if not data.empty:
                        print(f"✅ Success with {sym}: {len(data)} records")
                        return data
                    
                except Exception as e:
                    print(f"❌ Failed with {sym}: {e}")
                    continue
            
            return pd.DataFrame()
            
        except Exception as e:
            print(f"❌ Data fetch error: {e}")
            return pd.DataFrame()
    
    async def _execute_pine_script(self, code: str, data: pd.DataFrame) -> List[Dict]:
        """Execute Pine Script strategy with REAL data"""
        trades = []
        position = 0
        entry_price = 0
        
        print(f"🔧 Executing Pine Script strategy on {len(data)} bars")
        
        # Add technical indicators to data
        data = self._add_technical_indicators(data)
        
        for i in range(1, len(data)):
            current_bar = data.iloc[i]

            signal = self._parse_pine_signals(code, data, i)
            
            if signal == "BUY" and position <= 0:
                # Execute REAL buy
                quantity = self._calculate_position_size(current_bar['Close'])
                trade_value = current_bar['Close'] * quantity
                commission = trade_value * self.commission_rate
                
                if self.current_cash >= trade_value + commission:
                    trade = {
                        'timestamp': data.index[i].strftime('%Y-%m-%d %H:%M:%S'),
                        'action': 'BUY',
                        'price': round(current_bar['Close'], 2),
                        'quantity': quantity,
                        'value': round(trade_value, 2),
                        'commission': round(commission, 2),
                        'pnl': 0
                    }
                    trades.append(trade)
                    self.current_cash -= (trade_value + commission)
                    position = quantity
                    entry_price = current_bar['Close']
                    print(f"📈 BUY: {quantity} shares at {current_bar['Close']}")
                    
            elif signal == "SELL" and position > 0:
                # Execute REAL sell
                trade_value = current_bar['Close'] * position
                commission = trade_value * self.commission_rate
                pnl = (current_bar['Close'] - entry_price) * position - commission
                
                trade = {
                    'timestamp': data.index[i].strftime('%Y-%m-%d %H:%M:%S'),
                    'action': 'SELL', 
                    'price': round(current_bar['Close'], 2),
                    'quantity': position,
                    'value': round(trade_value, 2),
                    'commission': round(commission, 2),
                    'pnl': round(pnl, 2)
                }
                trades.append(trade)
                self.current_cash += (trade_value - commission)
                position = 0
                print(f"📉 SELL: P&L = {pnl:.2f}")
        
        return trades
    
    def _add_technical_indicators(self, data: pd.DataFrame) -> pd.DataFrame:
        """Add REAL technical indicators to data"""
        # RSI
        data['rsi'] = self._calculate_rsi(data['Close'], 14)
        
        # Moving Averages
        data['sma_20'] = data['Close'].rolling(20).mean()
        data['sma_50'] = data['Close'].rolling(50).mean()
        
        # EMA
        data['ema_12'] = data['Close'].ewm(span=12).mean()
        data['ema_26'] = data['Close'].ewm(span=26).mean()
        
        return data
        
    def _parse_pine_signals(self, code: str, data: pd.DataFrame, current_index: int) -> str:
        """Parse Pine Script code to generate REAL signals"""
        if current_index < 20:  # Need enough data for indicators
            return "HOLD"
        
        current_bar = data.iloc[current_index]
        prev_bar = data.iloc[current_index-1]
        
        # Calculate RSI if not already in data
        if 'rsi' not in data.columns:
            data['rsi'] = self._calculate_rsi(data['Close'], 14)
        
        current_rsi = data['rsi'].iloc[current_index] if current_index < len(data) else 50
        prev_rsi = data['rsi'].iloc[current_index-1] if current_index > 0 else 50
        
        # 🚨 DEBUG: Print RSI values to see what's happening
        if current_index % 10 == 0:  # Print every 10th bar
            print(f"📊 Bar {current_index}: RSI = {current_rsi:.2f}")
        
        # RSI Strategy Logic
        if pd.notna(prev_rsi) and pd.notna(current_rsi):
            # Buy when RSI crosses above 30 (oversold)
            if prev_rsi < 30 and current_rsi >= 30:
                print(f"🎯 BUY SIGNAL: RSI {prev_rsi:.1f} -> {current_rsi:.1f}")
                return "BUY"
            # Sell when RSI crosses below 70 (overbought)  
            elif prev_rsi > 70 and current_rsi <= 70:
                print(f"🎯 SELL SIGNAL: RSI {prev_rsi:.1f} -> {current_rsi:.1f}")
                return "SELL"
        
        return "HOLD"

    
    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """Calculate REAL RSI indicator"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    async def _execute_python_strategy(self, code: str, data: pd.DataFrame) -> List[Dict]:
        """Execute Python strategy with REAL data"""
        trades = []
        position = 0
        entry_price = 0
        
        try:
            # Add indicators first
            data = self._add_technical_indicators(data)
            
            # Safe execution environment
            safe_globals = {
                'data': data,
                'sma': lambda x, period: x.rolling(period).mean(),
                'ema': lambda x, period: x.ewm(span=period).mean(),
                'rsi': self._calculate_rsi,
                'len': len,
                'range': range
            }
            
            # User strategy code should define a 'execute_strategy' function
            exec(code, safe_globals)
            
            # Get signals from user function
            if 'execute_strategy' in safe_globals:
                signals = safe_globals['execute_strategy'](data)
                
                for signal in signals:
                    if signal.get('action') == 'BUY' and position <= 0:
                        quantity = self._calculate_position_size(signal['price'])
                        trade_value = signal['price'] * quantity
                        commission = trade_value * self.commission_rate
                        
                        if self.current_cash >= trade_value + commission:
                            trade = {
                                'timestamp': signal.get('timestamp', datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
                                'action': 'BUY',
                                'price': round(signal['price'], 2),
                                'quantity': quantity,
                                'value': round(trade_value, 2),
                                'commission': round(commission, 2),
                                'pnl': 0
                            }
                            trades.append(trade)
                            self.current_cash -= (trade_value + commission)
                            position = quantity
                            entry_price = signal['price']
                            
                    elif signal.get('action') == 'SELL' and position > 0:
                        trade_value = signal['price'] * position
                        commission = trade_value * self.commission_rate
                        pnl = (signal['price'] - entry_price) * position - commission
                        
                        trade = {
                            'timestamp': signal.get('timestamp', datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
                            'action': 'SELL',
                            'price': round(signal['price'], 2),
                            'quantity': position,
                            'value': round(trade_value, 2),
                            'commission': round(commission, 2),
                            'pnl': round(pnl, 2)
                        }
                        trades.append(trade)
                        self.current_cash += (trade_value - commission)
                        position = 0
            
        except Exception as e:
            print(f"❌ Python strategy error: {e}")
        
        return trades
    
    def _calculate_position_size(self, price: float) -> int:
        """Calculate REAL position size based on available capital"""
        return max(1, int((self.current_cash * 0.1) / price))  # 10% of capital per trade
    
    def _calculate_performance_metrics(self, trades: List[Dict]) -> Dict[str, Any]:
        """Calculate REAL performance metrics"""
        if not trades:
            return {
                "total_return_pct": 0,
                "total_pnl": 0,
                "win_rate": 0,
                "profit_factor": 0,
                "max_drawdown_pct": 0,
                "sharpe_ratio": 0
            }
        
        # Calculate total P&L from closed trades (with sell actions)
        closed_trades = [t for t in trades if t['action'] == 'SELL']
        total_pnl = sum(t.get('pnl', 0) for t in closed_trades)
        
        winning_trades = [t for t in closed_trades if t.get('pnl', 0) > 0]
        losing_trades = [t for t in closed_trades if t.get('pnl', 0) < 0]
        
        win_rate = (len(winning_trades) / len(closed_trades)) * 100 if closed_trades else 0
        
        total_gains = sum(t.get('pnl', 0) for t in winning_trades)
        total_losses = abs(sum(t.get('pnl', 0) for t in losing_trades))
        profit_factor = total_gains / total_losses if total_losses > 0 else float('inf')
        
        return {
            "total_return_pct": round((total_pnl / self.initial_capital) * 100, 2),
            "total_pnl": round(total_pnl, 2),
            "win_rate": round(win_rate, 2),
            "profit_factor": round(profit_factor, 2) if profit_factor != float('inf') else "Infinite",
            "max_drawdown_pct": round(self._calculate_max_drawdown(trades), 2),
            "sharpe_ratio": round(self._calculate_sharpe_ratio(trades), 2),
            "total_commission": round(sum(t.get('commission', 0) for t in trades), 2),
            "net_profit": round(total_pnl - sum(t.get('commission', 0) for t in trades), 2)
        }
    
    def _calculate_max_drawdown(self, trades: List[Dict]) -> float:
        """Calculate REAL max drawdown"""
        if not trades:
            return 0
        
        equity = self.initial_capital
        peak = equity
        max_drawdown = 0
        
        for trade in trades:
            if trade['action'] == 'BUY':
                equity -= (trade['price'] * trade['quantity'] + trade.get('commission', 0))
            else:  # SELL
                equity += (trade['price'] * trade['quantity'] - trade.get('commission', 0))
                equity += trade.get('pnl', 0)
            
            if equity > peak:
                peak = equity
            
            drawdown = (peak - equity) / peak * 100
            if drawdown > max_drawdown:
                max_drawdown = drawdown
        
        return max_drawdown
    
    def _calculate_sharpe_ratio(self, trades: List[Dict]) -> float:
        """Calculate REAL Sharpe ratio (simplified)"""
        if len(trades) < 2:
            return 0
        
        # Simplified implementation
        returns = [t.get('pnl', 0) / self.initial_capital for t in trades if t.get('pnl', 0) != 0]
        
        if len(returns) < 2:
            return 0
        
        avg_return = np.mean(returns)
        std_return = np.std(returns)
        
        return avg_return / std_return * np.sqrt(252) if std_return != 0 else 0