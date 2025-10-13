import React, { useEffect, useState } from "react";
import { Wallet, BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "react-toastify";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Holdings() {
  const [holdings, setHoldings] = useState([]);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const [quantities, setQuantities] = useState({});
  const primaryColor = "#42a5f5";
  const buyColor = "#10b981";
  const sellColor = "#ef4444";

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
        
        // Initialize quantities with current holding quantities
        const initialQuantities = {};
        data.forEach(holding => {
          initialQuantities[holding.symbol] = holding.quantity;
        });
        setQuantities(initialQuantities);
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

  const handleQuantityChange = (symbol, value) => {
    setQuantities(prev => ({
      ...prev,
      [symbol]: Math.max(0, parseInt(value) || 0)
    }));
  };

  const placeOrder = async (symbol, type, exchange = "NSE") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const qty = quantities[symbol];
      if (!qty || qty <= 0) {
        toast.error("Please enter a valid quantity");
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

  // Prepare data for charts
  const pieChartData = holdings.map(holding => ({
    name: holding.symbol,
    value: holding.current_value,
    investment: holding.investment_value,
    profitLoss: holding.profit_loss,
    percentage: totalCurrentValue > 0 ? (holding.current_value / totalCurrentValue) * 100 : 0
  }));

  const barChartData = holdings.map(holding => ({
    symbol: holding.symbol,
    investment: holding.investment_value,
    currentValue: holding.current_value,
    profitLoss: holding.profit_loss,
    profitLossPercentage: holding.investment_value > 0 ? 
      (holding.profit_loss / holding.investment_value) * 100 : 0
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];

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
        <div className="bg-white border rounded-2xl p-6 shadow-lg mb-6">
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
                    {["Symbol", "Exchange", "Quantity", "Avg Price", "Current Price", "Investment", "Current Value", "P&L", "Risk", "Quantity", "Actions"].map((header) => (
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
                        <div className={`font-mono font-semibold ${getProfitLossColor(holding.profit_loss)}`}>
                          <div>₹{holding.profit_loss.toFixed(2)}</div>
                          <div className="text-sm">
                            {holding.investment_value > 0 ? 
                              `${((holding.profit_loss / holding.investment_value) * 100).toFixed(2)}%` : '0%'
                            }
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(holding.risk_level)}`}>
                          {holding.risk_level}
                        </span>
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          min="1"
                          value={quantities[holding.symbol] || ''}
                          onChange={(e) => handleQuantityChange(holding.symbol, e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center font-mono"
                          placeholder="Qty"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => placeOrder(holding.symbol, "BUY", holding.exchange)}
                            className="px-3 py-1 rounded text-xs font-medium transition-colors text-white hover:scale-105"
                            style={{ backgroundColor: buyColor }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#059669';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = buyColor;
                            }}
                          >
                            Buy more
                          </button>
                          <button
                            onClick={() => placeOrder(holding.symbol, "SELL", holding.exchange)}
                            className="px-3 py-1 rounded text-xs font-medium transition-colors text-white hover:scale-105"
                            style={{ backgroundColor: sellColor }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#dc2626';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = sellColor;
                            }}
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

        {/* Charts Section */}
        {holdings.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Pie Chart - Portfolio Allocation */}
            <div className="bg-white border rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Portfolio Allocation</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`₹${value.toFixed(2)}`, 'Current Value']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart - Profit/Loss by Stock */}
            <div className="bg-white border rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Profit & Loss Analysis</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="symbol" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'profitLoss') return [`₹${value.toFixed(2)}`, 'P&L'];
                        if (name === 'profitLossPercentage') return [`${value.toFixed(2)}%`, 'P&L %'];
                        return [`₹${value.toFixed(2)}`, name];
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="profitLoss" 
                      name="Profit/Loss" 
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Performance Summary Chart */}
        {holdings.length > 0 && (
          <div className="bg-white border rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Investment vs Current Value</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="symbol" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                  <Legend />
                  <Bar 
                    dataKey="investment" 
                    name="Investment" 
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="currentValue" 
                    name="Current Value" 
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}