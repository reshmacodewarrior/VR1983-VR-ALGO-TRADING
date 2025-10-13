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

  // Primary color matching the theme
  const primaryColor = "#42a5f5";

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
        <div 
          className="p-4 rounded-lg shadow"
          style={{
            backgroundColor: `${primaryColor}10`,
            border: `1px solid ${primaryColor}20`
          }}
        >
          <h3 className="text-lg font-medium mb-4" style={{ color: primaryColor }}>My Holdings</h3>
          <p style={{ color: `${primaryColor}80` }}>No holdings yet</p>
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
          return `text-[${primaryColor}]`;
      }
    };

    return (
      <div 
        className="p-4 rounded-lg shadow"
        style={{
          backgroundColor: `${primaryColor}10`,
          border: `1px solid ${primaryColor}20`
        }}
      >
        <h3 className="text-lg font-medium mb-4" style={{ color: primaryColor }}>My Holdings</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: `${primaryColor}20` }}>
            <thead>
              <tr>
                {["Symbol", "Qty", "Avg Price", "Current Price", "P&L", "Risk", "Exchange", "Action"].map((h) => (
                  <th 
                    key={h} 
                    className="px-4 py-2 text-left text-xs font-medium uppercase"
                    style={{ color: `${primaryColor}80`, borderColor: `${primaryColor}20` }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: `${primaryColor}20` }}>
              {holdings.map((h, i) => (
                <tr key={i}>
                  <td className="px-4 py-2" style={{ color: primaryColor }}>{h.symbol}</td>
                  <td className="px-4 py-2" style={{ color: primaryColor }}>{h.quantity}</td>
                  <td className="px-4 py-2" style={{ color: primaryColor }}>₹{h.average_price?.toFixed(2)}</td>
                  <td className="px-4 py-2" style={{ color: primaryColor }}>₹{h.current_price?.toFixed(2)}</td>
                  <td className={`px-4 py-2 ${h.profit_loss >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ₹{h.profit_loss?.toFixed(2)}
                  </td>
                  <td className={`px-4 py-2 font-semibold ${getRiskColor(h.risk_level)}`}>{h.risk_level}</td>
                  <td className="px-4 py-2 font-medium" style={{ color: primaryColor }}>{h.exchange}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => placeOrder(h.symbol, "BUY", h.quantity, h.exchange)}
                      className="px-3 py-1 text-white rounded hover:bg-green-700 transition-colors"
                      style={{ backgroundColor: primaryColor }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#1e88e5';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = primaryColor;
                      }}
                    >
                      Buy More
                    </button>
                    <button
                      onClick={() => placeOrder(h.symbol, "SELL", h.quantity, h.exchange)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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
    <div 
      className="p-6 shadow-lg rounded-xl"
      style={{
        backgroundColor: `${primaryColor}05`,
        border: `1px solid ${primaryColor}20`
      }}
    >
      {/* Search Section with Watchlist Button */}
      <div className="mb-6 flex gap-3 items-center">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter symbol (e.g., TATAMOTORS.NS, RELIANCE.NS)"
          className="flex-1 px-4 py-2 border rounded-lg shadow-sm focus:ring transition-colors"
          style={{
            backgroundColor: 'white',
            color: 'black',
            borderColor: `${primaryColor}40`,
            focusBorderColor: primaryColor,
            focusRingColor: `${primaryColor}20`
          }}
        />
        <button
          onClick={analyzeStock}
          disabled={loading}
          className="px-4 py-2 text-white rounded-lg shadow hover:scale-105 disabled:opacity-50 transition-all"
          style={{ backgroundColor: primaryColor }}
          onMouseEnter={(e) => {
            if (!loading) e.target.style.backgroundColor = '#1e88e5';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.target.style.backgroundColor = primaryColor;
          }}
        >
          {loading ? "Loading..." : "Analyze Stock"}
        </button>
        
        {/* Watchlist Toggle Button */}
        {localStorage.getItem("token") && stockData && (
          <button
            onClick={isInWatchlist ? removeFromWatchlist : addToWatchlist}
            className={`px-4 py-2 rounded-lg shadow hover:scale-105 text-white flex items-center gap-2 transition-all ${
              isInWatchlist 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-green-600 hover:bg-green-700"
            }`}
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
          <h4 
            className="text-sm font-medium mb-2 flex items-center gap-2"
            style={{ color: primaryColor }}
          >
            <span>⏰</span> Recent Searches
          </h4>
          <div className="flex flex-wrap gap-2">
            {history.map((s, i) => (
              <button
                key={i}
                onClick={() => setSymbol(s)}
                className="flex items-center gap-1 px-3 py-1 rounded-full shadow hover:scale-105 transition-all"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                  border: `1px solid ${primaryColor}30`
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = `${primaryColor}25`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = `${primaryColor}15`;
                }}
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
          <h4 
            className="text-sm font-medium mb-2 flex items-center gap-2"
            style={{ color: primaryColor }}
          >
            <span>⭐</span> My Watchlist
          </h4>
          <div className="flex flex-wrap gap-2">
            {watchlist.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center gap-1 px-3 py-1 rounded-full shadow"
                style={{
                  backgroundColor: `${primaryColor}10`,
                  border: `1px solid ${primaryColor}30`
                }}
              >
                <button
                  onClick={() => setSymbol(item.symbol)}
                  className="font-medium hover:scale-105 transition-transform"
                  style={{ color: primaryColor }}
                >
                  {item.symbol}
                </button>
                <button
                  onClick={async () => {
                    await watchlistAPI.removeFromWatchlist(item.symbol);
                    await fetchWatchlist();
                  }}
                  className="ml-1 hover:scale-110 transition-transform"
                  style={{ color: '#ef4444' }}
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
        <div className="flex border-b mb-6" style={{ borderColor: `${primaryColor}20` }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab 
                  ? `border-b-2` 
                  : `style={{ color: "${primaryColor}80" }}`
              }`}
              style={{
                color: activeTab === tab ? primaryColor : `${primaryColor}80`,
                borderColor: activeTab === tab ? primaryColor : 'transparent'
              }}
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
      {error && (
        <div 
          className="p-3 mb-4 rounded-lg border"
          style={{
            color: '#dc2626',
            backgroundColor: '#fef2f2',
            borderColor: '#fecaca'
          }}
        >
          {error}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "chart" && stockData && (
        <>
          <div 
            className="p-4 rounded-lg shadow mb-6"
            style={{
              backgroundColor: `${primaryColor}10`,
              border: `1px solid ${primaryColor}20`
            }}
          >
            <CandlestickChart data={stockData.history} symbol={symbol} />
          </div>
          <div 
            className="p-4 rounded-lg shadow space-y-1"
            style={{
              backgroundColor: `${primaryColor}10`,
              border: `1px solid ${primaryColor}20`,
              color: primaryColor
            }}
          >
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