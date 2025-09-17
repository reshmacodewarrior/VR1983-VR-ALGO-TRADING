import React, { useState, useEffect } from 'react';
import { stockAPI } from '../services/api';

const BulkViewer = ({ period, interval }) => {
  const [category, setCategory] = useState('indian');
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const categories = {
    indian: { name: 'Indian Stocks', currency: 'INR' },
    us: { name: 'US Stocks', currency: 'USD' },
    crypto: { name: 'Cryptocurrencies', currency: 'USD' },
    forex: { name: 'Forex', currency: 'USD' },
    indices: { name: 'Indices', currency: 'USD' }
  };

  const symbolLists = {
    indian: [
      'RELIANCE.NS', 'TATAMOTORS.NS', 'INFY.NS', 'HDFCBANK.NS', 'TCS.NS',
      'ICICIBANK.NS', 'HINDUNILVR.NS', 'SBIN.NS', 'BAJFINANCE.NS', 'KOTAKBANK.NS',
      'ITC.NS', 'LT.NS', 'AXISBANK.NS', 'BHARTIARTL.NS', 'MARUTI.NS'
    ],
    us: [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'JPM', 'JNJ', 'V',
      'WMT', 'DIS', 'NFLX', 'INTC', 'AMD'
    ],
    crypto: ['BTC-USD', 'ETH-USD', 'BNB-USD', 'ADA-USD', 'XRP-USD'],
    forex: ['EURUSD=X', 'GBPUSD=X', 'JPYUSD=X', 'CNYUSD=X', 'INRUSD=X'],
    indices: ['^GSPC', '^IXIC', '^DJI', '^NSEI', '^BSESN']
  };

  useEffect(() => {
    if (category) {
      loadBulkData();
    }
  }, [category, period, interval]);

  const loadBulkData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const symbols = symbolLists[category];
      const data = await stockAPI.getBulkStocks(symbols, period, interval);
      setStocks(data);
    } catch (err) {
      setError('Failed to load market data. Please try again.');
      console.error('Error loading bulk data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...stocks].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setStocks(sortedData);
  };

  const getChangeColor = (change) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const formatCurrency = (value, currency = 'USD') => {
    if (value === null || value === undefined) return 'N/A';
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'INR' ? 'INR' : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formatter.format(value);
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <span className="ml-1">↕</span>;
    return sortConfig.direction === 'asc' 
      ? <span className="ml-1">↑</span> 
      : <span className="ml-1">↓</span>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl shadow-xl text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
        <p className="text-lg font-semibold">Loading {categories[category].name}...</p>
        <p className="text-blue-300 text-sm">Fetching real-time market data</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 to-blue-900 text-white shadow-xl rounded-2xl border border-gray-700">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Market Overview</h2>
          <p className="text-blue-300">Real-time prices and performance data</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(categories).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          
          <button
            onClick={loadBulkData}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:from-blue-500 hover:to-purple-500 transition-all flex items-center gap-2"
          >
            <span>🔄</span>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-xl mb-4 flex items-center">
          <span className="mr-2">⚠️</span>
          {error}
        </div>
      )}

      {stocks.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-gray-700">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                {[
                  { key: 'symbol', label: 'Symbol' },
                  { key: 'name', label: 'Name' },
                  { key: 'current_price', label: 'Price' },
                  { key: 'change', label: 'Change' },
                  { key: 'change_percent', label: 'Change %' },
                  { key: 'volume', label: 'Volume' },
                  { key: 'high', label: 'High' },
                  { key: 'low', label: 'Low' }
                ].map(({ key, label }) => (
                  <th 
                    key={key}
                    className="px-4 py-3 text-left font-semibold text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort(key)}
                  >
                    <div className="flex items-center">
                      {label}
                      <SortIcon columnKey={key} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock, idx) => (
                <tr
                  key={stock.symbol}
                  className={`border-t border-gray-700 ${idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'} hover:bg-gray-700 transition-colors`}
                >
                  <td className="px-4 py-3 font-medium">{stock.symbol}</td>
                  <td className="px-4 py-3">{stock.name}</td>
                  <td className="px-4 py-3 font-medium">
                    {formatCurrency(stock.current_price, categories[category].currency)}
                  </td>
                  <td className={`px-4 py-3 font-medium ${getChangeColor(stock.change)}`}>
                    {formatCurrency(stock.change, categories[category].currency)}
                  </td>
                  <td className={`px-4 py-3 font-medium ${getChangeColor(stock.change_percent)}`}>
                    {formatPercent(stock.change_percent)}
                  </td>
                  <td className="px-4 py-3">{stock.volume?.toLocaleString() || 'N/A'}</td>
                  <td className="px-4 py-3">
                    {formatCurrency(stock.high, categories[category].currency)}
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrency(stock.low, categories[category].currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && (
          <div className="text-center py-12 text-blue-300 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">No market data available</h3>
            <p>Try selecting a different category or refreshing the data</p>
          </div>
        )
      )}
    </div>
  );
};

export default BulkViewer;