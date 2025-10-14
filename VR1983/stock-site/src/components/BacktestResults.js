// src/components/BacktestResults.js
import React from 'react';

export default function BacktestResults({ results }) {
  const primaryColor = "#42a5f5";

  if (!results) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border text-center"
        style={{ borderColor: `${primaryColor}20` }}>
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold mb-2">No results yet</h3>
        <p style={{ color: primaryColor }}>Run a backtest to see results</p>
      </div>
    );
  }

  if (results.error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border"
        style={{ borderColor: `${primaryColor}20` }}>
        <div className="text-red-500 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold mb-2">Backtest Failed</h3>
          <p>{results.error}</p>
        </div>
      </div>
    );
  }

  const { metrics, trades, total_trades, winning_trades, losing_trades } = results;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border" 
      style={{ borderColor: `${primaryColor}20` }}>
      
      <h2 className="text-2xl font-bold mb-6" style={{ color: primaryColor }}>
        📊 Backtest Results
      </h2>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Return"
          value={`${metrics?.total_return_pct || 0}%`}
          color={metrics?.total_return_pct >= 0 ? 'green' : 'red'}
        />
        <MetricCard
          title="Win Rate"
          value={`${metrics?.win_rate || 0}%`}
          color="blue"
        />
        <MetricCard
          title="Total Trades"
          value={total_trades || 0}
          color="purple"
        />
        <MetricCard
          title="Max Drawdown"
          value={`${metrics?.max_drawdown_pct || 0}%`}
          color="orange"
        />
      </div>

      {/* Detailed Metrics */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3" style={{ color: primaryColor }}>
          Detailed Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Profit Factor:</span>
            <span className="font-semibold ml-2">{metrics?.profit_factor || 0}</span>
          </div>
          <div>
            <span className="text-gray-600">Sharpe Ratio:</span>
            <span className="font-semibold ml-2">{metrics?.sharpe_ratio || 0}</span>
          </div>
          <div>
            <span className="text-gray-600">Winning Trades:</span>
            <span className="font-semibold ml-2 text-green-600">{winning_trades || 0}</span>
          </div>
          <div>
            <span className="text-gray-600">Losing Trades:</span>
            <span className="font-semibold ml-2 text-red-600">{losing_trades || 0}</span>
          </div>
          <div>
            <span className="text-gray-600">Net Profit:</span>
            <span className="font-semibold ml-2">₹{metrics?.net_profit || 0}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Commission:</span>
            <span className="font-semibold ml-2">₹{metrics?.total_commission || 0}</span>
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      {trades && trades.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: primaryColor }}>
            Recent Trades ({trades.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Time</th>
                  <th className="p-2 text-left">Action</th>
                  <th className="p-2 text-right">Price</th>
                  <th className="p-2 text-right">Qty</th>
                  <th className="p-2 text-right">P&L</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="p-2">{trade.timestamp}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        trade.action === 'BUY' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.action}
                      </span>
                    </td>
                    <td className="p-2 text-right">₹{trade.price}</td>
                    <td className="p-2 text-right">{trade.quantity}</td>
                    <td className={`p-2 text-right font-semibold ${
                      trade.pnl > 0 ? 'text-green-600' : trade.pnl < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {trade.pnl ? `₹${trade.pnl}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const MetricCard = ({ title, value, color }) => {
  const colorClasses = {
    green: 'text-green-600',
    red: 'text-red-600', 
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  return (
    <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
      <div className={`text-2xl font-bold ${colorClasses[color]}`}>
        {value}
      </div>
      <div className="text-sm text-gray-600 mt-1">{title}</div>
    </div>
  );
};