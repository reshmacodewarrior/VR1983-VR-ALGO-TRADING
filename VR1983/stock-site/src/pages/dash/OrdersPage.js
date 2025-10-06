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

  // Primary color for the theme
  const primaryColor = "#42a5f5";

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
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4">
      {/* Page Header */}
      <div 
        className="bg-white border rounded-xl py-4 px-6 mb-6 shadow-lg"
        style={{ borderColor: `${primaryColor}20` }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleHome}
              className="p-3 rounded-xl border shadow-lg hover:scale-105 transition-all"
              style={{ 
                backgroundColor: `${primaryColor}10`,
                borderColor: `${primaryColor}20`
              }}
              title="Go Home"
            >
              <FaHome style={{ color: primaryColor }} />
            </button>
            <div 
              className="p-3 rounded-xl border shadow-lg"
              style={{ 
                backgroundColor: `${primaryColor}10`,
                borderColor: `${primaryColor}20`
              }}
            >
              <FaSync style={{ color: primaryColor }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
              <p className="text-sm" style={{ color: primaryColor }}>View your complete order history and performance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-sm text-gray-600">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all text-white hover:scale-105 ${
                isRefreshing 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : ""
              }`}
              style={{ backgroundColor: isRefreshing ? undefined : primaryColor }}
              onMouseEnter={(e) => {
                if (!isRefreshing) e.target.style.backgroundColor = '#1e88e5';
              }}
              onMouseLeave={(e) => {
                if (!isRefreshing) e.target.style.backgroundColor = primaryColor;
              }}
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
        primaryColor={primaryColor}
      />

      {/* Floating Refresh Button for Mobile */}
      <button
        onClick={refreshData}
        disabled={isRefreshing}
        className="fixed bottom-6 right-6 md:hidden z-10 p-4 text-white rounded-full shadow-2xl hover:scale-105 transition-all"
        style={{ backgroundColor: primaryColor }}
        onMouseEnter={(e) => {
          if (!isRefreshing) e.target.style.backgroundColor = '#1e88e5';
        }}
        onMouseLeave={(e) => {
          if (!isRefreshing) e.target.style.backgroundColor = primaryColor;
        }}
      >
        <FaSync className={isRefreshing ? "animate-spin" : ""} />
      </button>
    </div>
  );
}

export default OrdersPage;