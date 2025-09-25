import React, { useState, useEffect, useCallback } from "react";
import Navigation from "../../components/Navigation";
import SingleStock from "../../components/SingleStock";
import BulkViewer from "../../components/BulkViewer";
import IndianStocks from "../../components/IndianStocks";
import SearchQueue from "../../components/SearchQueue";
import Header from "../../components/Header";
import { FaSync, FaRobot, FaChartLine, FaDatabase, FaSignOutAlt } from "react-icons/fa";
import OrderViewPanel from "../../components/OrderViewPanel";

function Intraday() {
  const [currentView, setCurrentView] = useState("single");
  const [period, setPeriod] = useState("1mo");
  const [interval, setInterval] = useState("1d");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Order View Panel State
  const [orderViewData, setOrderViewData] = useState([]);
  const [orderViewLoading, setOrderViewLoading] = useState(true);
  const [orderViewError, setOrderViewError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const API_BASE_URL = "http://192.168.1.58:8000";

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (!token || !user) {
      // Redirect to login if not authenticated
      window.location.href = "/login";
    } else {
      setIsAuthenticated(true);
      // Fetch initial data
      fetchOrderViewData();
    }
  }, []);

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
        // Token expired or invalid
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOrderViewData(data);
    } catch (err) {
      console.error("Error fetching order view:", err);
      setOrderViewError(err.message);
      
      if (err.message.includes("401") || err.message.includes("token")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } finally {
      setOrderViewLoading(false);
    }
  }, [API_BASE_URL]);

  // Global refresh function
  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      // Refresh order view data
      await fetchOrderViewData();
      
      // Trigger refresh for all child components
      setRefreshTrigger(prev => prev + 1);
      
      // Update last refresh time
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchOrderViewData]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    if (isAuthenticated) {
      const intervalId = setInterval(() => {
        refreshAllData();
      }, 5 * 60 * 1000); // 5 minutes
      
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, refreshAllData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const renderView = () => {
    const commonProps = {
      period,
      interval,
      refreshTrigger,
      onRefreshComplete: () => setIsRefreshing(false)
    };

    switch (currentView) {
      case "single":
        return <SingleStock {...commonProps} />;
      case "bulk":
        return <BulkViewer {...commonProps} />;
      case "indian":
        return <IndianStocks {...commonProps} />;
      case "queue":
        return <SearchQueue {...commonProps} />;
      default:
        return <SingleStock {...commonProps} />;
    }
  };

  // View statistics for the dashboard header
  const getViewStats = () => {
    switch (currentView) {
      case "single":
        return { icon: <FaChartLine className="text-cyan-400" />, name: "Single Analysis", desc: "" };
      case "bulk":
        return { icon: <FaDatabase className="text-purple-400" />, name: "Bulk Viewer", desc: "Compare multiple stocks at once" };
      case "indian":
        return { icon: <FaChartLine className="text-green-400" />, name: "Indian Stocks", desc: "Top performing Indian market stocks" };
      case "queue":
        return { icon: <FaRobot className="text-blue-400" />, name: "Search Queue", desc: "Quick search and analysis queue" };
      default:
        return { icon: <FaChartLine className="text-cyan-400" />, name: "Single Analysis"};
    }
  };

  const viewStats = getViewStats();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <Header />
      
      {/* Navigation - Moved to top position */}
      <div className="bg-gray-800 border-b border-gray-700 py-2 px-6">
        <div className="container mx-auto">
          <Navigation
            currentView={currentView}
            setCurrentView={setCurrentView}
            period={period}
            setPeriod={setPeriod}
            interval={interval}
            setInterval={setInterval}
          />
        </div>
      </div>

      {/* View Header - Now in the second position with updated styling */}
      <div className="bg-gradient-to-r from-gray-800 to-blue-800 border-b border-gray-700 py-4 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
              {viewStats.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{viewStats.name}</h2>
              <p className="text-blue-200 text-sm">{viewStats.desc}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-sm text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onClick={refreshAllData}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all ${
                isRefreshing 
                  ? "bg-blue-800 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
              }`}
            >
              <FaSync className={`${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh All"}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg bg-red-600 hover:bg-red-500 transition-all"
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="bg-gradient-to-br from-gray-800 to-blue-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          {renderView()}
        </div>
        
        {/* Order View Panel - Added below the main content */}
        <OrderViewPanel 
          orderData={orderViewData}
          loading={orderViewLoading}
          error={orderViewError}
          onRefresh={fetchOrderViewData}
        />
      </main>

      {/* Market Status Bar */}
      <div className="bg-gray-800 border-t border-b border-gray-700 py-2 px-6">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>NASDAQ: <span className="text-green-400 font-medium">+1.2%</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span>NSE: <span className="text-red-400 font-medium">-0.8%</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Crypto: <span className="text-green-400 font-medium">+3.5%</span></span>
              </div>
            </div>
            <div className="text-blue-300">
              Auto-refresh in 5 min • Real-time data • Algorithmic trading
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-4 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-6">
            <span>VR Algo Trading Platform v2.1</span>
            <span>•</span>
            <span>Data provided by Yahoo Finance</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <button
              onClick={refreshAllData}
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              <FaSync className="text-sm" />
              Refresh
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Refresh Button for Mobile */}
      <button
        onClick={refreshAllData}
        disabled={isRefreshing}
        className="fixed bottom-6 right-6 md:hidden z-10 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:from-blue-500 hover:to-purple-500 transition-all"
      >
        <FaSync className={isRefreshing ? "animate-spin" : ""} />
      </button>
    </div>
  );
}

export default Intraday;