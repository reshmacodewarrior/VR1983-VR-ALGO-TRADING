import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AlgorithmicTradingService:
    def __init__(self):
        self.strategies = {
            "moving_average_crossover": self.moving_average_crossover,
            "support_resistance": self.support_resistance,
            "rsi_mean_reversion": self.rsi_mean_reversion
        }
    
    def calculate_technical_indicators(self, data: List[Dict]) -> Dict:
        """
        Calculate various technical indicators from price data
        """
        if not data or len(data) < 20:
            return {}
        
        # Convert to pandas DataFrame for easier calculations
        df = pd.DataFrame(data)
        df['date'] = pd.to_datetime(df['date'])
        df.set_index('date', inplace=True)
        
        # Calculate Simple Moving Averages
        df['sma_20'] = df['close'].rolling(window=20).mean()
        df['sma_50'] = df['close'].rolling(window=50).mean()
        
        # Calculate Exponential Moving Averages
        df['ema_12'] = df['close'].ewm(span=12).mean()
        df['ema_26'] = df['close'].ewm(span=26).mean()
        
        # Calculate MACD
        df['macd'] = df['ema_12'] - df['ema_26']
        df['macd_signal'] = df['macd'].ewm(span=9).mean()
        df['macd_histogram'] = df['macd'] - df['macd_signal']
        
        # Calculate RSI
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        
        # Calculate Bollinger Bands
        df['bb_middle'] = df['close'].rolling(window=20).mean()
        bb_std = df['close'].rolling(window=20).std()
        df['bb_upper'] = df['bb_middle'] + (bb_std * 2)
        df['bb_lower'] = df['bb_middle'] - (bb_std * 2)
        
        # Calculate support and resistance levels
        df['support'], df['resistance'] = self.calculate_support_resistance(df)
        
        # Get the latest values
        latest = df.iloc[-1].to_dict()
        
        return latest
    
    def calculate_support_resistance(self, df: pd.DataFrame, window: int = 20) -> tuple:
        """
        Calculate simple support and resistance levels
        """
        support_levels = []
        resistance_levels = []
        
        for i in range(window, len(df)-window):
            window_high = df['high'].iloc[i-window:i+window].max()
            window_low = df['low'].iloc[i-window:i+window].min()
            
            if df['high'].iloc[i] == window_high:
                resistance_levels.append(df['high'].iloc[i])
            if df['low'].iloc[i] == window_low:
                support_levels.append(df['low'].iloc[i])
        
        # Use the most recent levels or average if none found
        support = np.mean(support_levels[-5:]) if support_levels else df['close'].iloc[-1] * 0.95
        resistance = np.mean(resistance_levels[-5:]) if resistance_levels else df['close'].iloc[-1] * 1.05
        
        return support, resistance
    
    def moving_average_crossover(self, data: List[Dict], indicators: Dict) -> Optional[str]:
        """
        Moving average crossover strategy
        Buy when short MA crosses above long MA
        Sell when short MA crosses below long MA
        """
        if not indicators or 'sma_20' not in indicators or 'sma_50' not in indicators:
            return None
        
        current_close = data[-1]['close']
        sma_20 = indicators['sma_20']
        sma_50 = indicators['sma_50']
        
        # Check if we have enough data
        if sma_20 is None or sma_50 is None:
            return None
        
        # Generate signals
        if sma_20 > sma_50 and current_close > sma_20:
            return "BUY"
        elif sma_20 < sma_50 and current_close < sma_20:
            return "SELL"
        
        return None
    
    def support_resistance(self, data: List[Dict], indicators: Dict) -> Optional[str]:
        """
        Support and resistance strategy
        Buy near support levels, sell near resistance levels
        """
        if not indicators or 'support' not in indicators or 'resistance' not in indicators:
            return None
        
        current_close = data[-1]['close']
        support = indicators['support']
        resistance = indicators['resistance']
        
        # Calculate distance from support/resistance as percentage
        dist_to_support = abs(current_close - support) / support * 100
        dist_to_resistance = abs(current_close - resistance) / resistance * 100
        
        # Generate signals
        if dist_to_support < 1.0:  # Within 1% of support level
            return "BUY"
        elif dist_to_resistance < 1.0:  # Within 1% of resistance level
            return "SELL"
        
        return None
    
    def rsi_mean_reversion(self, data: List[Dict], indicators: Dict) -> Optional[str]:
        """
        RSI based mean reversion strategy
        Buy when RSI is oversold (<30), sell when overbought (>70)
        """
        if not indicators or 'rsi' not in indicators:
            return None
        
        rsi = indicators['rsi']
        
        if rsi < 30:
            return "BUY"
        elif rsi > 70:
            return "SELL"
        
        return None
    
    def generate_signals(self, data: List[Dict], strategy_name: str = "moving_average_crossover") -> Dict:
        """
        Generate trading signals based on the selected strategy
        """
        if not data or len(data) < 50:
            logger.warning("Insufficient data for generating signals")
            return {"signal": "HOLD", "message": "Insufficient data"}
        
        # Calculate technical indicators
        indicators = self.calculate_technical_indicators(data)
        
        # Get the selected strategy
        strategy = self.strategies.get(strategy_name)
        if not strategy:
            return {"signal": "HOLD", "message": f"Strategy {strategy_name} not found"}
        
        # Generate signal
        signal = strategy(data, indicators)
        
        if signal:
            current_price = data[-1]['close']
            return {
                "signal": signal,
                "price": current_price,
                "timestamp": datetime.now().isoformat(),
                "strategy": strategy_name,
                "indicators": indicators,
                "message": f"{signal} signal generated by {strategy_name} strategy at price {current_price}"
            }
        else:
            return {
                "signal": "HOLD",
                "price": data[-1]['close'],
                "timestamp": datetime.now().isoformat(),
                "strategy": strategy_name,
                "indicators": indicators,
                "message": "No clear trading signal"
            }
    
    def backtest_strategy(self, data: List[Dict], strategy_name: str, initial_balance: float = 10000.0) -> Dict:
        """
        Backtest a trading strategy on historical data
        """
        if len(data) < 100:
            return {"error": "Insufficient data for backtesting"}
        
        balance = initial_balance
        position = 0
        trades = []
        
        # Test the strategy on historical data
        for i in range(50, len(data)):
            historical_data = data[:i+1]
            signal_data = self.generate_signals(historical_data, strategy_name)
            
            if signal_data['signal'] == 'BUY' and position == 0:
                # Buy
                position = balance / data[i]['close']
                balance = 0
                trades.append({
                    'type': 'BUY',
                    'price': data[i]['close'],
                    'date': data[i]['date'],
                    'position': position
                })
            elif signal_data['signal'] == 'SELL' and position > 0:
                # Sell
                balance = position * data[i]['close']
                position = 0
                trades.append({
                    'type': 'SELL',
                    'price': data[i]['close'],
                    'date': data[i]['date'],
                    'balance': balance
                })
        
        # Calculate final balance
        if position > 0:
            final_balance = position * data[-1]['close']
        else:
            final_balance = balance
        
        # Calculate performance metrics
        profit_loss = final_balance - initial_balance
        profit_loss_pct = (profit_loss / initial_balance) * 100
        
        return {
            'initial_balance': initial_balance,
            'final_balance': final_balance,
            'profit_loss': profit_loss,
            'profit_loss_pct': profit_loss_pct,
            'trades': trades,
            'number_of_trades': len(trades)
        }

# Singleton instance
algo_trading_service = AlgorithmicTradingService()