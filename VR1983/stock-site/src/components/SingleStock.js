import React, { useState, useEffect } from "react";
import CandlestickChart from "./CandlestickChart";
import { stockAPI } from "../services/api";

const SingleStock = ({ period, interval }) => {
  const [symbol, setSymbol] = useState("TATAMOTORS.NS");
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("chart");
  const [orders, setOrders] = useState([]);
  const [orderType, setOrderType] = useState("market");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const BASE_URL = "http://192.168.1.58:8000";

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/orders`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      console.log('Orders API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Orders API response data:', data);
        
        // Make sure data is an array before setting it
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error("API did not return an array:", data);
          setOrders([]);
        }
      } else {
        console.error("Orders API error:", response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error("Error details:", errorData);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Validate token and fetch orders on component mount
  useEffect(() => {
    const validateTokenAndFetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }

      try {
        // First validate the token
        const validationResponse = await fetch(`${BASE_URL}/api/user/profile`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (validationResponse.ok) {
          console.log("Token is valid");
          // Token is valid, now fetch orders
          await fetchOrders();
        } else {
          console.log("Token validation failed");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          // Optionally, redirect to login page
        }
      } catch (error) {
        console.error("Error validating token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    };

    validateTokenAndFetchOrders();
  }, []);

  // Update price field when stock data changes
  useEffect(() => {
    if (stockData) {
      setPrice(stockData.current_price);
    }
  }, [stockData]);

  const analyzeStock = async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);

    try {
      const data = await stockAPI.getStock(symbol, period, interval);
      setStockData(data);
    } catch (err) {
      setError(
        "Failed to fetch stock data. Please check the symbol and try again."
      );
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyOrder = async (e) => {
    e.preventDefault();
    if (!stockData) return;
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      const orderData = {
        symbol: symbol.replace('.NS', ''), // Remove .NS for backend
        exchange: "NSE",
        transaction_type: "BUY",
        quantity: parseInt(quantity),
        order_type: orderType.toUpperCase(),
        product: "CNC"
      };

      console.log("Placing order:", orderData);

      const response = await fetch(`${BASE_URL}/api/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      console.log("Order response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Order response data:", result);
        
        alert(`Buy order placed successfully! Order ID: ${result.order_id}`);
        
        // Refresh orders after successful order placement
        await fetchOrders();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to place order: ${errorData.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Order placement error:", error);
      alert("Failed to connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSellOrder = async (e) => {
    e.preventDefault();
    if (!stockData) return;
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      const orderData = {
        symbol: symbol.replace('.NS', ''), // Remove .NS for backend
        exchange: "NSE",
        transaction_type: "SELL",
        quantity: parseInt(quantity),
        order_type: orderType.toUpperCase(),
        product: "CNC"
      };

      console.log("Placing order:", orderData);

      const response = await fetch(`${BASE_URL}/api/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      console.log("Order response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Order response data:", result);
        
        alert(`Sell order placed successfully! Order ID: ${result.order_id}`);
        
        // Refresh orders after successful order placement
        await fetchOrders();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to place order: ${errorData.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Order placement error:", error);
      alert("Failed to connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      // This would call a cancel order API endpoint if you have one
      // For now, we'll just show a message
      alert(`Cancel functionality would be implemented here for order ${orderId}`);
      
      // Refresh orders after cancellation
      await fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order");
    }
  };

  const OrdersList = () => {
    if (orders.length === 0) {
      return (
        <div className="p-4 bg-gray-50 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">My Orders</h3>
          <p className="text-gray-500">No orders yet</p>
        </div>
      );
    }

    return (
      <div className="p-4 bg-gray-50 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">My Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-black whitespace-nowrap">{order.order_id}</td>
                  <td className="px-4 py-2 text-black whitespace-nowrap">{order.symbol}</td>
                  <td className={`px-4 py-2 whitespace-nowrap ${order.transaction_type === "BUY" ? "text-green-600" : "text-red-600"}`}>
                    {order.transaction_type}
                  </td>
                  <td className="px-4 py-2 text-black whitespace-nowrap">{order.quantity}</td>
                  <td className="px-4 py-2 text-black whitespace-nowrap">
                    ₹{order.average_price?.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === "COMPLETE" ? "bg-green-100 text-green-800" : 
                      order.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : 
                      "bg-red-100 text-red-800"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-black whitespace-nowrap">
                    {new Date(order.order_timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {order.status === "PENDING" && (
                      <button
                        onClick={() => cancelOrder(order.order_id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const OrderForm = ({ type }) => {
    if (!stockData) {
      return (
        <div className="p-4 bg-gray-50 rounded-lg shadow">
          <p className="text-gray-500">Please search for a stock first</p>
        </div>
      );
    }

    return (
      <form onSubmit={type === "buy" ? handleBuyOrder : handleSellOrder} className="p-4 bg-gray-50 rounded-lg shadow">
        <h3 className="text-lg font-medium text-black mb-4">{type === "buy" ? "Buy" : "Sell"} {symbol}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="w-full px-3 py-2 text-black border rounded-md shadow-sm focus:ring focus:ring-blue-300"
            >
              <option value="market">Market</option>
              <option value="limit">Limit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Price</label>
            <input
              type="text"
              value={`₹${stockData.current_price.toFixed(2)}`}
              readOnly
              className="w-full px-3 py-2 border text-black rounded-md shadow-sm bg-gray-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full px-3 py-2 border text-black rounded-md shadow-sm focus:ring focus:ring-blue-300"
            />
          </div>
          <div className={orderType === "market" ? "hidden" : ""}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {orderType === "limit" ? "Limit Price" : "Trigger Price"}
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              step="0.01"
              className="w-full px-3 py-2 border text-black rounded-md shadow-sm focus:ring focus:ring-blue-300"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            type === "buy" 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-red-600 hover:bg-red-700 text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? "Processing..." : `${type === "buy" ? "Buy" : "Sell"} ${symbol}`}
        </button>
      </form>
    );
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      {/* Search Header */}
      <div className="mb-6">
        <div className="flex gap-3">
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
        </div>
      </div>

      {/* Navigation Tabs */}
      {stockData && (
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === "chart" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("chart")}
          >
            Chart
          </button>
          
          <button
            className={`px-4 py-2 font-medium ${activeTab === "orders" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
            onClick={() => {
              setActiveTab("orders");
              fetchOrders(); // Refresh orders when clicking the tab
            }}
          >
            My Orders
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === "chart" && stockData && (
        <>
          {/* Chart */}
          <div className="p-4 bg-gray-50 rounded-lg shadow mb-6">
            <CandlestickChart data={stockData.history} symbol={symbol} />
          </div>

          {/* Extra Info */}
          <div className="p-4 bg-gray-50 rounded-lg text-black shadow space-y-1">
            <p>
              <strong>Company:</strong> {stockData.name}
            </p>
            <p>
              <strong>Currency:</strong> {stockData.currency}
            </p>
            <p>
              <strong>Last Updated:</strong>{" "}
              {new Date(stockData.last_updated).toLocaleString()}
            </p>
          </div>
        </>
      )}

      {activeTab === "buy" && <OrderForm type="buy" />}
      {activeTab === "sell" && <OrderForm type="sell" />}
      {activeTab === "orders" && <OrdersList />}
    </div>
  );
};

export default SingleStock;