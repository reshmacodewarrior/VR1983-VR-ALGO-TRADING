# services/strategy_templates.py
from typing import Dict


class StrategyTemplates:
    @staticmethod
    def get_templates() -> Dict[str, Dict]:
        return {
            "rsi_strategy": {
                "name": "RSI Oversold/Overbought",
                "language": "pine_script",
                "code": """
//@version=5
strategy("RSI Strategy", overlay=true)

rsi_length = input(14, "RSI Length")
oversold = input(30, "Oversold")
overbought = input(70, "Overbought")

rsi = ta.rsi(close, rsi_length)

longCondition = ta.crossover(rsi, oversold)
if (longCondition)
    strategy.entry("Long", strategy.long)

shortCondition = ta.crossunder(rsi, overbought)
if (shortCondition)
    strategy.entry("Short", strategy.short)
                """,
                "description": "Basic RSI strategy with oversold/overbought levels"
            },
            "moving_average_cross": {
                "name": "Moving Average Crossover",
                "language": "python",
                "code": """
def strategy(data, params):
    fast_period = params.get('fast_period', 10)
    slow_period = params.get('slow_period', 20)
    
    data['fast_ma'] = data['close'].rolling(fast_period).mean()
    data['slow_ma'] = data['close'].rolling(slow_period).mean()
    
    trades = []
    position = 0
    
    for i in range(slow_period, len(data)):
        if data['fast_ma'].iloc[i] > data['slow_ma'].iloc[i] and position <= 0:
            # Buy signal
            trades.append({
                'timestamp': data.index[i],
                'action': 'buy',
                'price': data['close'].iloc[i]
            })
            position = 1
        elif data['fast_ma'].iloc[i] < data['slow_ma'].iloc[i] and position >= 0:
            # Sell signal
            trades.append({
                'timestamp': data.index[i],
                'action': 'sell',
                'price': data['close'].iloc[i]
            })
            position = -1
    
    return trades
                """,
                "description": "Classic moving average crossover strategy"
            }
        }