import React, { useState, useEffect } from "react";
import { stockAPI } from "../services/api";

const SearchQueue = ({ period, interval }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [queue, setQueue] = useState([]);
  const [queueData, setQueueData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const savedQueue = localStorage.getItem("stockQueue");
    if (savedQueue) {
      setQueue(JSON.parse(savedQueue));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("stockQueue", JSON.stringify(queue));
  }, [queue]);

  const searchStocks = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const results = await stockAPI.searchStocks(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error("Error searching stocks:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const addToQueue = (symbol) => {
    if (!queue.includes(symbol)) {
      setQueue([...queue, symbol]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeFromQueue = (index) => {
    setQueue(queue.filter((_, i) => i !== index));
  };

  const analyzeQueue = async () => {
    if (queue.length === 0) return;

    setLoading(true);
    try {
      const data = await stockAPI.getBulkStocks(queue, period, interval);
      setQueueData(data);
    } catch (err) {
      console.error("Error analyzing queue:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearQueue = () => {
    setQueue([]);
    setQueueData([]);
  };

  const getChangeColor = (change) =>
    change >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold";

  const formatCurrency = (value, currency = "USD") => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency === "INR" ? "INR" : "USD",
      minimumFractionDigits: 2,
    });
    return formatter.format(value);
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-4">⚡ Quick Search Queue</h2>

      {/* Search Section */}
      <div className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for stocks..."
            onKeyPress={(e) => e.key === "Enter" && searchStocks()}
            className="flex-1 px-4 py-2 border text-black rounded-lg shadow-sm focus:ring focus:ring-blue-300"
          />
          <button
            onClick={searchStocks}
            disabled={searchLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
          >
            {searchLoading ? "Searching..." : "Search"}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold mb-2">Search Results:</h4>
            {searchResults.map((result) => (
              <div
                key={result.symbol}
                className="flex justify-between items-center py-2 border-b last:border-b-0"
              >
                <div>
                  <span className="font-bold mr-2">{result.symbol}</span>
                  <span className="text-gray-600">{result.name}</span>
                </div>
                <button
                  onClick={() => addToQueue(result.symbol)}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                >
                  ➕ Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Queue Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">
            Current Queue ({queue.length} items)
          </h3>
          <div className="flex gap-2">
            <button
              onClick={analyzeQueue}
              disabled={queue.length === 0 || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Analyze All"}
            </button>
            <button
              onClick={clearQueue}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
            >
              Clear Queue
            </button>
          </div>
        </div>

        {queue.length > 0 ? (
          <div className="space-y-2">
            {queue.map((symbol, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 border rounded-lg"
              >
                <span className="font-medium">{symbol}</span>
                <button
                  onClick={() => removeFromQueue(index)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">
            Your queue is empty. Search above to add stocks.
          </div>
        )}
      </div>

      {/* Results Section */}
      {queueData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">📊 Analysis Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg shadow-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Symbol</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Change</th>
                  <th className="px-4 py-2 text-left">Change %</th>
                  <th className="px-4 py-2 text-left">Volume</th>
                </tr>
              </thead>
              <tbody>
                {queueData.map((stock) => (
                  <tr key={stock.symbol} className="border-t">
                    <td className="px-4 py-2 font-medium">{stock.symbol}</td>
                    <td className="px-4 py-2">
                      {formatCurrency(stock.current_price, stock.currency)}
                    </td>
                    <td className={`px-4 py-2 ${getChangeColor(stock.change)}`}>
                      {formatCurrency(stock.change, stock.currency)}
                    </td>
                    <td className={`px-4 py-2 ${getChangeColor(stock.change)}`}>
                      {stock.change_percent.toFixed(2)}%
                    </td>
                    <td className="px-4 py-2">
                      {stock.volume.toLocaleString()}
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
};

export default SearchQueue;
