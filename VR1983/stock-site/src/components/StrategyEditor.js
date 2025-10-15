// src/components/StrategyEditor.js
import React, { useState, useEffect } from 'react';
import { createStrategy, updateStrategy } from '../services/strategyApi';

export default function StrategyEditor({ 
  selectedStrategy, 
  onRunBacktest, 
  loading, 
  onStrategySave 
}) {
  const [strategy, setStrategy] = useState({
    name: '',
    description: '',
    code: '',
    language: 'pine_script',
    parameters: {}
  });
  const [backtestConfig, setBacktestConfig] = useState({
    symbol: 'RELIANCE',
    timeframe: '1d',
    start_date: '2024-01-01',
    end_date: '2024-03-15',
    initial_capital: 100000,
    commission: 0.001
  });

  const primaryColor = "#42a5f5";

  // Update form when selected strategy changes
  useEffect(() => {
    if (selectedStrategy) {
      setStrategy({
        name: selectedStrategy.name,
        description: selectedStrategy.description || '',
        code: selectedStrategy.code,
        language: selectedStrategy.language,
        parameters: selectedStrategy.parameters || {}
      });
    } else {
      setStrategy({
        name: '',
        description: '',
        code: defaultStrategyCode,
        language: 'pine_script',
        parameters: {}
      });
    }
  }, [selectedStrategy]);

  const handleSaveStrategy = async () => {
    try {
      if (selectedStrategy) {
        await updateStrategy(selectedStrategy.id, strategy);
      } else {
        await createStrategy(strategy);
      }
      onStrategySave();
      alert('Strategy saved successfully!');
    } catch (error) {
      alert('Failed to save strategy: ' + error.message);
    }
  };

  const handleRunTest = () => {
    const backtestRequest = {
      strategy_code: strategy.code,
      language: strategy.language,
      ...backtestConfig
    };
    onRunBacktest(backtestRequest);
  };

  const strategyTemplates = {
    rsi: `//@version=5
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
    strategy.entry("Short", strategy.short)`,

    moving_average: `//@version=5
strategy("Moving Average Crossover", overlay=true)

fast_length = input(10, "Fast MA Length")
slow_length = input(20, "Slow MA Length")

fast_ma = ta.sma(close, fast_length)
slow_ma = ta.sma(close, slow_length)

plot(fast_ma, color=color.blue, linewidth=2)
plot(slow_ma, color=color.red, linewidth=2)

longCondition = ta.crossover(fast_ma, slow_ma)
if (longCondition)
    strategy.entry("Long", strategy.long)

shortCondition = ta.crossunder(fast_ma, slow_ma)
if (shortCondition)
    strategy.entry("Short", strategy.short)`
  };

  const applyTemplate = (templateKey) => {
    setStrategy(prev => ({
      ...prev,
      code: strategyTemplates[templateKey],
      name: templateKey === 'rsi' ? 'RSI Strategy' : 'Moving Average Crossover'
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border" 
      style={{ borderColor: `${primaryColor}20` }}>
      
      {/* Strategy Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: primaryColor }}>
            Strategy Name
          </label>
          <input
            type="text"
            value={strategy.name}
            onChange={(e) => setStrategy(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
            style={{ 
              borderColor: `${primaryColor}40`,
              focusBorderColor: primaryColor
            }}
            placeholder="Enter strategy name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: primaryColor }}>
            Language
          </label>
          <select
            value={strategy.language}
            onChange={(e) => setStrategy(prev => ({ ...prev, language: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
            style={{ 
              borderColor: `${primaryColor}40`,
              focusBorderColor: primaryColor
            }}
          >
            <option value="pine_script">Pine Script</option>
            <option value="python">Python</option>
          </select>
        </div>
      </div>

      {/* Template Buttons */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: primaryColor }}>
          Quick Templates
        </label>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => applyTemplate('rsi')}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
          >
            📈 RSI Strategy
          </button>
          <button
            onClick={() => applyTemplate('moving_average')}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm font-medium"
          >
            📊 Moving Average
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: primaryColor }}>
          Strategy Code
        </label>
        <textarea
          value={strategy.code}
          onChange={(e) => setStrategy(prev => ({ ...prev, code: e.target.value }))}
          rows={15}
          className="w-full px-3 py-2 border rounded-md font-mono text-sm focus:outline-none focus:ring-2"
          style={{ 
            borderColor: `${primaryColor}40`,
            focusBorderColor: primaryColor,
            backgroundColor: '#f8fafc'
          }}
          placeholder="Write your trading strategy code here..."
        />
      </div>

      {/* Backtest Configuration */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: primaryColor }}>
          ⚙️ Backtest Configuration
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Symbol</label>
            <input
              type="text"
              value={backtestConfig.symbol}
              onChange={(e) => setBacktestConfig(prev => ({ ...prev, symbol: e.target.value }))}
              className="w-full px-2 py-1 text-sm border rounded"
              placeholder="RELIANCE"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Timeframe</label>
            <select
              value={backtestConfig.timeframe}
              onChange={(e) => setBacktestConfig(prev => ({ ...prev, timeframe: e.target.value }))}
              className="w-full px-2 py-1 text-sm border rounded"
            >
              <option value="1d">1 Day</option>
              <option value="1h">1 Hour</option>
              <option value="5m">5 Minutes</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Start Date</label>
            <input
              type="date"
              value={backtestConfig.start_date}
              onChange={(e) => setBacktestConfig(prev => ({ ...prev, start_date: e.target.value }))}
              className="w-full px-2 py-1 text-sm border rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">End Date</label>
            <input
              type="date"
              value={backtestConfig.end_date}
              onChange={(e) => setBacktestConfig(prev => ({ ...prev, end_date: e.target.value }))}
              className="w-full px-2 py-1 text-sm border rounded"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSaveStrategy}
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
        >
          💾 Save Strategy
        </button>
        <button
          onClick={handleRunTest}
          disabled={loading || !strategy.code}
          className="px-6 py-2 text-white rounded-md transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: primaryColor }}
        >
          {loading ? '🔄 Testing...' : '🚀 Run Backtest'}
        </button>
      </div>
    </div>
  );
}

const defaultStrategyCode = `//@version=5
strategy("My Strategy", overlay=true)

// Write your trading strategy here
// Example: Buy when price crosses above 20-day SMA
sma20 = ta.sma(close, 20)

longCondition = ta.crossover(close, sma20)
if (longCondition)
    strategy.entry("Long", strategy.long)

// Add your exit conditions here`;