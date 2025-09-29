import React, { useState, useEffect, useCallback } from "react";
import OrderViewPanel from "../../components/OrderViewPanel";
import { FaSync, FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function OrdersPage() {
  const [orderViewData, setOrderViewData] = useState([]);
  const [orderViewLoading, setOrderViewLoading] = useState(true);
  const [orderViewError, setOrderViewError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://192.168.1.58:8000";

  // Fetch order view data
  const fetchOrderViewData = useCallback(async () => {
    try {
      setOrderViewLoading(true);
      setOrderViewError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const response = await fetch(`${API_BASE_URL}/api/order-view-panel`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOrderViewData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching order view:", err);
      setOrderViewError(err.message);
      
      if (err.message.includes("401") || err.message.includes("token")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate('/login');
      }
    } finally {
      setOrderViewLoading(false);
    }
  }, [API_BASE_URL, navigate]);

  useEffect(() => {
    fetchOrderViewData();
  }, [fetchOrderViewData]);

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchOrderViewData();
    setIsRefreshing(false);
  };

  const handleHome = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white p-4">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-gray-800 to-blue-800 rounded-xl border border-gray-700 py-4 px-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleHome}
              className="p-3 bg-gray-800 rounded-xl border border-gray-700 shadow-lg hover:bg-gray-700 transition-all"
              title="Go Home"
            >
              <FaHome className="text-blue-400" />
            </button>
            <div className="p-3 bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
              <FaSync className="text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">My Orders</h2>
              <p className="text-blue-200 text-sm">View your complete order history and performance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-sm text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all ${
                isRefreshing 
                  ? "bg-blue-800 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
              }`}
            >
              <FaSync className={`${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Order View Panel */}
      <OrderViewPanel 
        orderData={orderViewData}
        loading={orderViewLoading}
        error={orderViewError}
        onRefresh={fetchOrderViewData}
      />

      {/* Floating Refresh Button for Mobile */}
      <button
        onClick={refreshData}
        disabled={isRefreshing}
        className="fixed bottom-6 right-6 md:hidden z-10 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:from-blue-500 hover:to-purple-500 transition-all"
      >
        <FaSync className={isRefreshing ? "animate-spin" : ""} />
      </button>
    </div>
  );
}

export default OrdersPage;