import React, { useState, useEffect } from "react";
import CandlestickChart from "./CandlestickChart";
import Celebration from "./Celebration";
import { stockAPI } from "../services/api";
import { addToWatchlist} from "../services/api"; // Import watchlist function

const SingleStock = ({ period, interval, onSymbolSelect }) => { // Add onSymbolSelect prop
  const BASE_URL = "http://192.168.1.58:8000";

  // --- State Hooks ---
  const [symbol, setSymbol] = useState("TATAMOTORS.NS");
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("chart");
  const [holdings, setHoldings] = useState([]);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
    
  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("searchHistory") || "[]")
  );

  // --- Load Watchlist Status ---
  const loadWatchlistStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${BASE_URL}/api/watchlist/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setWatchlist(data);
        const inList = data.some(item => 
          item.symbol === symbol || item.symbol === symbol.replace('.NS', '')
        );
        setIsInWatchlist(inList);
      }
    } catch (error) {
      console.error("Error checking watchlist:", error);
    }
  };

  useEffect(() => {
    if (symbol) {
      loadWatchlistStatus();
    }
  }, [symbol]);

  // --- Add to Search History ---
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
      
      // Notify parent component about symbol selection
      if (onSymbolSelect) {
        onSymbolSelect(symbol);
      }
    } catch (err) {
      setError("Failed to fetch stock data. Please check the symbol.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Add to Watchlist ---
  const handleAddToWatchlist = async () => {
    try {
      // Extract base symbol without exchange suffix for watchlist
      const watchlistSymbol = symbol.replace('.NS', '');
      await addToWatchlist(watchlistSymbol, "NSE");
      setIsInWatchlist(true);
      setCelebrationMessage(`Added ${watchlistSymbol} to watchlist!`);
      
      // Reload watchlist status
      await loadWatchlistStatus();
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      setError("Failed to add to watchlist");
    }
  };

  // --- Remove from Watchlist ---
  const handleRemoveFromWatchlist = async () => {
    try {
      const watchlistSymbol = symbol.replace('.NS', '');
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${BASE_URL}/api/watchlist/${watchlistSymbol}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        setIsInWatchlist(false);
        setCelebrationMessage(`Removed ${watchlistSymbol} from watchlist!`);
        await loadWatchlistStatus();
      }
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      setError("Failed to remove from watchlist");
    }
  };

  // --- Fetch Holdings ---
  const fetchHoldings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${BASE_URL}/api/holding-view`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
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

      const res = await fetch(`${BASE_URL}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const result = await res.json();
        setCelebrationMessage(`${type} order placed! Order ID: ${result.order_id}`);
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
          <h3 className="text-lg-green font-medium mb-4">My Holdings</h3>
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
        <h3 className="text-lg font-medium mb-4">My Holdings</h3>
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
                  <td className="px-4 py-2 text-black">₹{h.average_price.toFixed(2)}</td>
                  <td className="px-4 py-2 text-black">₹{h.current_price.toFixed(2)}</td>
                  <td className={`px-4 py-2 ${h.profit_loss >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ₹{h.profit_loss.toFixed(2)}
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

  // --- Render Main ---
  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <Celebration trigger={celebrationMessage} />

      {/* Search */}
      <div className="mb-6 flex gap-3">
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
        
        {/* Watchlist Button */}
        {stockData && (
          <button
            onClick={isInWatchlist ? handleRemoveFromWatchlist : handleAddToWatchlist}
            className={`px-4 py-2 rounded-lg shadow ${
              isInWatchlist 
                ? "bg-red-600 text-white hover:bg-red-700" 
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
          </button>
        )}
      </div>

      {/* ✅ Recent Search History */}
      {history.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {history.map((s, i) => (
            <button
              key={i}
              onClick={() => setSymbol(s)}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full shadow hover:bg-gray-200"
            >
              <span>🕒</span> {s}
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      {stockData && (
        <div className="flex border-b border-gray-200 mb-6">
          {["chart", "holdings"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 font-medium ${activeTab === tab ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
              onClick={() => {
                setActiveTab(tab);
                if (tab === "holdings") fetchHoldings();
              }}
            >
              {tab === "chart" ? "Chart" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {error && <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">{error}</div>}

      {activeTab === "chart" && stockData && (
        <>
          <div className="p-4 bg-gray-50 rounded-lg shadow mb-6">
            <CandlestickChart data={stockData.history} symbol={symbol} />
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-black shadow space-y-1">
            <p><strong>Company:</strong> {stockData.name}</p>
            <p><strong>Currency:</strong> {stockData.currency}</p>
            <p><strong>Last Updated:</strong> {new Date(stockData.last_updated).toLocaleString()}</p>
            <p><strong>Watchlist Status:</strong> {isInWatchlist ? "✅ In Watchlist" : "❌ Not in Watchlist"}</p>
          </div>
        </>
      )}

      {activeTab === "holdings" && <HoldingsList />}
    </div>
  );
};

export default SingleStock;