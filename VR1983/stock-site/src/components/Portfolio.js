import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

const Portfolio = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_API_URL || "http://192.168.1.58:8000";

  useEffect(() => {
    fetchHoldings();
  }, []);

  const fetchHoldings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/holding-view`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
      });

      if (res.ok) {
        const data = await res.json();
        const processedHoldings = data.map(holding => ({
          symbol: holding.symbol || 'N/A',
          exchange: holding.exchange || 'NSE',
          quantity: holding.quantity || 0,
          average_price: holding.average_price || 0,
          current_price: holding.current_price || 0,
          profit_loss: holding.profit_loss || 0,
          risk_level: holding.risk_level || 'Medium',
          investment_value: (holding.average_price || 0) * (holding.quantity || 0),
          current_value: (holding.current_price || 0) * (holding.quantity || 0)
        }));
        setHoldings(processedHoldings);
      } else {
        setError("Failed to fetch holdings");
      }
    } catch (err) {
      setError("Error fetching portfolio data");
      console.error(err);
    } finally {
      setLoading(false);
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

  const getProfitLossIcon = (value) => {
    return value >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />;
  };

  // Calculate totals
  const totalInvestment = holdings.reduce((sum, h) => sum + h.investment_value, 0);
  const totalCurrentValue = holdings.reduce((sum, h) => sum + h.current_value, 0);
  const totalProfitLoss = holdings.reduce((sum, h) => sum + h.profit_loss, 0);
  const totalProfitLossPercentage = totalInvestment > 0 ? ((totalProfitLoss / totalInvestment) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-600 p-4 rounded-lg max-w-md">
            <p>{error}</p>
            <button 
              onClick={fetchHoldings}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <Wallet size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Portfolio</h1>
              <p className="text-blue-200">Complete overview of your investments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="container mx-auto px-4 py-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Total Investment</p>
                <p className="text-2xl font-bold text-gray-800">₹{totalInvestment.toFixed(2)}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <BarChart3 size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Current Value</p>
                <p className="text-2xl font-bold text-gray-800">₹{totalCurrentValue.toFixed(2)}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Wallet size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Total P&L</p>
                <p className={`text-2xl font-bold ${getProfitLossColor(totalProfitLoss)}`}>
                  ₹{totalProfitLoss.toFixed(2)}
                </p>
                <p className={`text-sm ${getProfitLossColor(totalProfitLoss)}`}>
                  {totalProfitLossPercentage.toFixed(2)}%
                </p>
              </div>
              <div className={`p-3 rounded-full ${totalProfitLoss >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {getProfitLossIcon(totalProfitLoss)}
              </div>
            </div>
          </div>
        </div>

        {/* Holdings Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Wallet size={24} />
            Your Holdings ({holdings.length})
          </h2>
          
          {holdings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Wallet size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Holdings Yet</h3>
              <p className="text-gray-500 mb-6">Start investing to build your portfolio</p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Start Trading
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {holdings.map((holding, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{holding.symbol}</h3>
                        <p className="text-gray-500 text-sm">{holding.exchange}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(holding.risk_level)} border`}>
                        {holding.risk_level}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-semibold ${getProfitLossColor(holding.profit_loss)}`}>
                        ₹{holding.current_price.toFixed(2)}
                      </span>
                      <span className={`text-sm ${getProfitLossColor(holding.profit_loss)} flex items-center gap-1`}>
                        {getProfitLossIcon(holding.profit_loss)}
                        ₹{holding.profit_loss.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{holding.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Price:</span>
                        <span className="font-medium">₹{holding.average_price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Investment:</span>
                        <span className="font-medium">₹{holding.investment_value.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Value:</span>
                        <span className="font-medium">₹{holding.current_value.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Growth</span>
                        <span>{((holding.profit_loss / holding.investment_value) * 100).toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${holding.profit_loss >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(Math.abs((holding.profit_loss / holding.investment_value) * 100), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;