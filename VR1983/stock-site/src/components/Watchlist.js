import React, { useState, useEffect } from 'react';
import { addToWatchlist, removeFromWatchlist, getWatchlist } from '../services/api';

const Watchlist = ({ userId, onSymbolSelect }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentStocks, setRecentStocks] = useState([]);

  useEffect(() => {
    loadWatchlist();
    loadRecentStocks();
  }, [userId]);

  const loadWatchlist = async () => {
    try {
      const data = await getWatchlist(userId);
      setWatchlist(data.watchlist || []);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    }
  };

  const loadRecentStocks = () => {
    const recent = JSON.parse(localStorage.getItem('recentStocks') || '[]');
    setRecentStocks(recent.slice(0, 6));
  };

  const handleAddToWatchlist = async (symbol) => {
    try {
      await addToWatchlist(userId, symbol);
      await loadWatchlist();
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const handleRemoveFromWatchlist = async (symbol) => {
    try {
      await removeFromWatchlist(userId, symbol);
      await loadWatchlist();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 1) {
      const mockResults = [
        'RELIANCE', 'TATAMOTORS', 'INFY', 'TCS', 'HDFC', 'ICICIBANK',
        'SBIN', 'WIPRO', 'MARUTI', 'ONGC', 'ITC', 'HINDUNILVR'
      ].filter(stock => 
        stock.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(mockResults);
    } else {
      setSearchResults([]);
    }
  };

  const isInWatchlist = (symbol) => {
    return watchlist.some(item => item.symbol === symbol);
  };

  return (
    <div className="watchlist-container bg-gray-800 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-white mb-3">📈 Watchlist</h3>
      
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Search stocks..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
        
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-gray-700 rounded shadow-lg max-h-48 overflow-y-auto">
            {searchResults.map((symbol) => (
              <div key={symbol} className="flex justify-between items-center p-2 hover:bg-gray-600">
                <span 
                  className="text-white cursor-pointer flex-1"
                  onClick={() => onSymbolSelect(symbol)}
                >
                  {symbol}
                </span>
                <button
                  onClick={() => handleAddToWatchlist(symbol)}
                  disabled={isInWatchlist(symbol)}
                  className={`ml-2 px-2 py-1 rounded text-xs ${
                    isInWatchlist(symbol) 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isInWatchlist(symbol) ? 'Added' : 'Add'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {recentStocks.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center text-gray-400 text-sm mb-2">
            <span className="mr-2">🕒</span>
            Recently Viewed
          </div>
          <div className="flex flex-wrap gap-2">
            {recentStocks.map((symbol, index) => (
              <div key={index} className="flex items-center bg-gray-700 rounded px-2 py-1">
                <span 
                  className="text-white text-sm cursor-pointer hover:text-blue-300 mr-2"
                  onClick={() => onSymbolSelect(symbol)}
                >
                  {symbol}
                </span>
                <button
                  onClick={() => handleAddToWatchlist(symbol)}
                  className="text-xs text-green-400 hover:text-green-300"
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="watchlist-items">
        {watchlist.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">
            No stocks in watchlist. Search and add stocks above.
          </p>
        ) : (
          watchlist.map((item) => (
            <div key={item.symbol} className="flex justify-between items-center p-2 hover:bg-gray-700 rounded">
              <div 
                className="flex-1 cursor-pointer text-white hover:text-blue-300"
                onClick={() => onSymbolSelect(item.symbol)}
              >
                {item.symbol}
              </div>
              <button
                onClick={() => handleRemoveFromWatchlist(item.symbol)}
                className="text-red-400 hover:text-red-300 ml-2"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Watchlist;