import React, { useEffect, useState } from "react";
import { Wallet, BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "react-toastify";

export default function Holdings() {
  const [holdings, setHoldings] = useState([]);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const primaryColor = "#42a5f5";
  const BASE_URL = process.env.REACT_APP_API_URL || "http://192.168.1.58:8000";

  useEffect(() => {
    fetchHoldings();
  }, []);

  const fetchHoldings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setHoldingsLoading(true);
      const res = await fetch(`${BASE_URL}/api/holding-view`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
      });

      if (res.ok) {
        const data = await res.json();
        setHoldings(data);
      } else {
        console.error("Holdings API error:", res.status);
        toast.error("Failed to fetch holdings");
      }
    } catch (err) {
      console.error("Error fetching holdings:", err);
      toast.error("Failed to fetch holdings");
    } finally {
      setHoldingsLoading(false);
    }
  };

  const placeOrder = async (symbol, type, qty, exchange = "NSE") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
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
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(`${type} order placed successfully! Order ID: ${result.order_id}`);
        await fetchHoldings(); // Refresh holdings
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(`Failed to place order: ${errorData.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Order error:", err);
      toast.error("Server error placing order");
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProfitLossColor = (value) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  // Calculate portfolio totals
  const totalInvestment = holdings.reduce((sum, h) => sum + h.investment_value, 0);
  const totalCurrentValue = holdings.reduce((sum, h) => sum + h.current_value, 0);
  const totalProfitLoss = holdings.reduce((sum, h) => sum + h.profit_loss, 0);
  const totalProfitLossPercentage = totalInvestment > 0 ? ((totalProfitLoss / totalInvestment) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: primaryColor }}>My Holdings</h1>
          <p className="text-gray-600">View and manage your investment portfolio</p>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Wallet style={{ color: primaryColor }} size={24} />
              <h3 className="font-semibold text-gray-600">Total Investment</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{totalInvestment.toFixed(2)}</p>
          </div>

          <div className="bg-white border rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 style={{ color: primaryColor }} size={24} />
              <h3 className="font-semibold text-gray-600">Current Value</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{totalCurrentValue.toFixed(2)}</p>
          </div>

          <div className="bg-white border rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              {totalProfitLoss >= 0 ? (
                <TrendingUp className="text-green-600" size={24} />
              ) : (
                <TrendingDown className="text-red-600" size={24} />
              )}
              <h3 className="font-semibold text-gray-600">Total P&L</h3>
            </div>
            <p className={`text-2xl font-bold ${getProfitLossColor(totalProfitLoss)}`}>
              ₹{totalProfitLoss.toFixed(2)}
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <span 
                className={`text-lg font-semibold ${getProfitLossColor(totalProfitLossPercentage)}`}
              >
                {totalProfitLossPercentage >= 0 ? '+' : ''}{totalProfitLossPercentage.toFixed(2)}%
              </span>
              <h3 className="font-semibold text-gray-600">Return</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{holdings.length} Stocks</p>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-white border rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Stock Holdings</h2>
            <div className="flex items-center gap-4">
              <span style={{ color: primaryColor }}>Total: {holdings.length} stocks</span>
              <button
                onClick={fetchHoldings}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-white hover:scale-105"
                style={{ backgroundColor: primaryColor }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1e88e5';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = primaryColor;
                }}
              >
                <Wallet size={16} />
                Refresh
              </button>
            </div>
          </div>

          {holdingsLoading ? (
            <div className="text-center py-8">
              <div 
                className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
                style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
              ></div>
              <p className="text-gray-600">Loading your holdings...</p>
            </div>
          ) : holdings.length === 0 ? (
            <div className="text-center py-12">
              <Wallet size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Holdings Yet</h3>
              <p className="text-gray-500 mb-6">Start trading to build your portfolio</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: `${primaryColor}20` }}>
                    {["Symbol", "Exchange", "Quantity", "Avg Price", "Current Price", "Investment", "Current Value", "P&L", "Risk", "Actions"].map((header) => (
                      <th 
                        key={header} 
                        className="text-left p-4 font-medium"
                        style={{ color: primaryColor }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding, index) => (
                    <tr 
                      key={index} 
                      className="border-b hover:bg-gray-50 transition-colors"
                      style={{ borderColor: `${primaryColor}10` }}
                    >
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{holding.symbol}</div>
                      </td>
                      <td className="p-4 text-gray-600">{holding.exchange}</td>
                      <td className="p-4 text-right font-mono text-gray-900">{holding.quantity}</td>
                      <td className="p-4 text-right font-mono text-gray-900">₹{holding.average_price.toFixed(2)}</td>
                      <td className="p-4 text-right font-mono text-gray-900">₹{holding.current_price.toFixed(2)}</td>
                      <td className="p-4 text-right font-mono text-gray-900">₹{holding.investment_value.toFixed(2)}</td>
                      <td className="p-4 text-right font-mono text-gray-900">₹{holding.current_value.toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <span className={`font-mono font-semibold ${getProfitLossColor(holding.profit_loss)}`}>
                          ₹{holding.profit_loss.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(holding.risk_level)}`}>
                          {holding.risk_level}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => placeOrder(holding.symbol, "BUY", holding.quantity, holding.exchange)}
                            className="px-3 py-1 rounded text-xs font-medium transition-colors text-white hover:scale-105"
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
                            onClick={() => placeOrder(holding.symbol, "SELL", holding.quantity, holding.exchange)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-medium transition-colors text-white hover:scale-105"
                          >
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}