// src/pages/StrategyTester.js
import React, { useState, useEffect } from 'react';
import StrategyEditor from '../../components/StrategyEditor';
import BacktestResults from '../../components/BacktestResults';
import StrategyList from '../../components/StrategyList';
import { getStrategies, runBacktest, getBacktestResults } from '../../services/strategyApi';

export default function StrategyTester() {
  const [strategies, setStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [backtestResults, setBacktestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');

  const primaryColor = "#42a5f5";

  // Load user strategies
  useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = async () => {
    try {
      const response = await getStrategies();
      setStrategies(response.data);
    } catch (error) {
      console.error('Failed to load strategies:', error);
    }
  };

  const handleRunBacktest = async (backtestConfig) => {
    setLoading(true);
    try {
      const response = await runBacktest(backtestConfig);
      const backtestId = response.data.backtest_id;
      
      // Poll for results
      const results = await pollBacktestResults(backtestId);
      setBacktestResults(results);
      setActiveTab('results');
    } catch (error) {
      console.error('Backtest failed:', error);
      alert('Backtest failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const pollBacktestResults = async (backtestId, maxAttempts = 30) => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await getBacktestResults(backtestId);
        const data = response.data;
        
        if (data.status === 'completed') {
          return data.results;
        } else if (data.status === 'failed') {
          throw new Error(data.results?.error || 'Backtest failed');
        }
        
        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        throw error;
      }
    }
    throw new Error('Backtest timeout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3" style={{ color: primaryColor }}>
            🚀 Strategy Tester
          </h1>
          <p className="text-gray-600 text-lg">
            Test your trading strategies with real market data
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {[
            { id: 'editor', label: '📝 Strategy Editor' },
            { id: 'list', label: '📂 My Strategies' },
            { id: 'results', label: '📊 Results' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Strategy List */}
          <div className="lg:col-span-1">
            <StrategyList
              strategies={strategies}
              selectedStrategy={selectedStrategy}
              onSelectStrategy={setSelectedStrategy}
              onStrategyUpdate={loadStrategies}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'editor' && (
              <StrategyEditor
                selectedStrategy={selectedStrategy}
                onRunBacktest={handleRunBacktest}
                loading={loading}
                onStrategySave={loadStrategies}
              />
            )}

            {activeTab === 'list' && (
              <div className="bg-white rounded-xl shadow-lg p-6 border" 
                style={{ borderColor: `${primaryColor}20` }}>
                <h2 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>
                  My Strategies ({strategies.length})
                </h2>
                <StrategyList
                  strategies={strategies}
                  selectedStrategy={selectedStrategy}
                  onSelectStrategy={setSelectedStrategy}
                  onStrategyUpdate={loadStrategies}
                  showActions={true}
                />
              </div>
            )}

            {activeTab === 'results' && backtestResults && (
              <BacktestResults results={backtestResults} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}