import React, { useState, useEffect } from "react";
import CandlestickChart from "./CandlestickChart";
import { stockAPI, watchlistAPI } from "../services/api";

const SingleStock = ({ period, interval }) => {
  // --- State Hooks ---
  const [symbol, setSymbol] = useState("TATAMOTORS.NS");
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("chart");
  const [holdings, setHoldings] = useState([]);
  const [history, setHistory] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  // Load history on component mount
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    setHistory(savedHistory);
    
    // Only fetch watchlist if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      fetchWatchlist();
    }
  }, []);

  // Check if current symbol is in watchlist whenever symbol or watchlist changes
  useEffect(() => {
    setIsInWatchlist(watchlist.some(item => item.symbol === symbol));
  }, [symbol, watchlist]);

  // --- Fetch Watchlist ---
  const fetchWatchlist = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const data = await watchlistAPI.getWatchlist();
      setWatchlist(data);
    } catch (err) {
      console.error("Error fetching watchlist:", err);
    }
  };

  // --- Add to Watchlist ---
  const addToWatchlist = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first to use watchlist");
        return;
      }

      await watchlistAPI.addToWatchlist(symbol);
      await fetchWatchlist();
    } catch (err) {
      console.error("Error adding to watchlist:", err);
      alert("Failed to add to watchlist");
    }
  };

  // --- Remove from Watchlist ---
  const removeFromWatchlist = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await watchlistAPI.removeFromWatchlist(symbol);
      await fetchWatchlist();
    } catch (err) {
      console.error("Error removing from watchlist:", err);
      alert("Failed to remove from watchlist");
    }
  };

  // --- Add to Search History (Local only) ---
  const addToHistory = (symbol) => {
    let updated = [symbol, ...history.filter((s) => s !== symbol)];
    if (updated.length > 6) updated = updated.slice(0, 6);
    setHistory(updated);
    localStorage.setItem("searchHistory", JSON.stringify(updated));
  };

  // --- Analyze Stock ---
  const analyzeStock = async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    try {
      const data = await stockAPI.getStock(symbol, period, interval);
      setStockData(data);
      addToHistory(symbol);
    } catch (err) {
      setError("Failed to fetch stock data. Please check the symbol.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch Holdings ---
  const fetchHoldings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://192.168.1.58:8000"}/api/holding-view`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
      });

      if (res.ok) {
        const data = await res.json();
        setHoldings(data);
      } else console.error("Holdings API error:", res.status);
    } catch (err) {
      console.error("Error fetching holdings:", err);
    }
  };

  // --- Place Order (Buy/Sell) ---
  const placeOrder = async (symbol, type, qty, exchange = "NSE") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      let formattedSymbol = symbol;
      if (exchange === "NSE" && !symbol.includes(".")) formattedSymbol = `${symbol}.NS`;

      const orderData = {
        symbol: formattedSymbol,
        exchange,
        transaction_type: type.toUpperCase(),
        quantity: parseInt(qty),
        order_type: "MARKET",
        product: "CNC",
      };

      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://192.168.1.58:8000"}/api/order`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const result = await res.json();
        await fetchHoldings();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to place order: ${errorData.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Order error:", err);
      alert("Server error placing order");
    }
  };

  // --- Holdings List Subcomponent ---
  const HoldingsList = () => {
    if (!holdings.length)
      return (
        <div className="p-4 bg-gray-50 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4 text-black">My Holdings</h3>
          <p className="text-gray-500">No holdings yet</p>
        </div>
      );

    const getRiskColor = (risk) => {
      switch (risk?.toLowerCase()) {
        case "low":
          return "text-green-600";
        case "medium":
          return "text-yellow-600";
        case "high":
          return "text-red-600";
        default:
          return "text-gray-600";
      }
    };

    return (
      <div className="p-4 bg-gray-50 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4 text-black">My Holdings</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {["Symbol", "Qty", "Avg Price", "Current Price", "P&L", "Risk", "Exchange", "Action"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {holdings.map((h, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 text-black">{h.symbol}</td>
                  <td className="px-4 py-2 text-black">{h.quantity}</td>
                  <td className="px-4 py-2 text-black">₹{h.average_price?.toFixed(2)}</td>
                  <td className="px-4 py-2 text-black">₹{h.current_price?.toFixed(2)}</td>
                  <td className={`px-4 py-2 ${h.profit_loss >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ₹{h.profit_loss?.toFixed(2)}
                  </td>
                  <td className={`px-4 py-2 font-semibold ${getRiskColor(h.risk_level)}`}>{h.risk_level}</td>
                  <td className="px-4 py-2 text-blue-600 font-medium">{h.exchange}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => placeOrder(h.symbol, "BUY", h.quantity, h.exchange)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Buy More
                    </button>
                    <button
                      onClick={() => placeOrder(h.symbol, "SELL", h.quantity, h.exchange)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Sell
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Tabs configuration
  const tabs = ["chart"];

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      {/* Search Section with Watchlist Button */}
      <div className="mb-6 flex gap-3 items-center">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter symbol (e.g., TATAMOTORS.NS, RELIANCE.NS)"
          className="flex-1 px-4 py-2 border rounded-lg text-black shadow-sm focus:ring focus:ring-blue-300"
        />
        <button
          onClick={analyzeStock}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Analyze Stock"}
        </button>
        
        {/* Watchlist Toggle Button */}
        {localStorage.getItem("token") && stockData && (
          <button
            onClick={isInWatchlist ? removeFromWatchlist : addToWatchlist}
            className={`px-4 py-2 rounded-lg shadow ${
              isInWatchlist 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-green-600 hover:bg-green-700"
            } text-white flex items-center gap-2`}
          >
            {isInWatchlist ? (
              <>
                <span></span> Remove from Watchlist
              </>
            ) : (
              <>
                <span>⭐</span> Add to Watchlist
              </>
            )}
          </button>
        )}
      </div>

      {/* Recent Search History */}
      {history.length > 0 && (
        <div className="mt-2 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <span>⏰</span> Recent Searches
          </h4>
          <div className="flex flex-wrap gap-2">
            {history.map((s, i) => (
              <button
                key={i}
                onClick={() => setSymbol(s)}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full shadow hover:bg-gray-200"
              >
                <span>🔍</span> {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Watchlist Display */}
      {localStorage.getItem("token") && watchlist.length > 0 && (
        <div className="mt-2 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <span>⭐</span> My Watchlist
          </h4>
          <div className="flex flex-wrap gap-2">
            {watchlist.map((item, index) => (
              <div key={index} className="flex items-center gap-1 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full shadow">
                <button
                  onClick={() => setSymbol(item.symbol)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {item.symbol}
                </button>
                <button
                  onClick={async () => {
                    await watchlistAPI.removeFromWatchlist(item.symbol);
                    await fetchWatchlist();
                  }}
                  className="text-red-500 hover:text-red-700 ml-1"
                  title="Remove from watchlist"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      {stockData && (
        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 font-medium ${
                activeTab === tab ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
              }`}
              onClick={() => {
                setActiveTab(tab);
                if (tab === "holdings") fetchHoldings();
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">{error}</div>}

      {/* Tab Content */}
      {activeTab === "chart" && stockData && (
        <>
          <div className="p-4 bg-gray-50 rounded-lg shadow mb-6">
            <CandlestickChart data={stockData.history} symbol={symbol} />
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-black shadow space-y-1">
            <p><strong>Company:</strong> {stockData.name}</p>
            <p><strong>Currency:</strong> {stockData.currency}</p>
            <p><strong>Last Updated:</strong> {new Date(stockData.last_updated).toLocaleString()}</p>
          </div>
        </>
      )}

      {activeTab === "holdings" && <HoldingsList />}
    </div>
  );
};

export default SingleStock;