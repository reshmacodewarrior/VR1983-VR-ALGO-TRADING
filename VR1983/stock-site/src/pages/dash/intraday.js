import React, { useState, useEffect } from "react";
import Navigation from "../../components/Navigation";
import SingleStock from "../../components/SingleStock";
import BulkViewer from "../../components/BulkViewer";
import IndianStocks from "../../components/IndianStocks";
import SearchQueue from "../../components/SearchQueue";
import Header from "../../components/Header";
import { FaSync, FaRobot, FaChartLine, FaDatabase } from "react-icons/fa";
import OrderViewPanel from "../../components/OrderViewPanel"; // Adjust path as needed

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

  const API_BASE_URL = "http://192.168.1.58:8000";

  // Fetch order view data
  const fetchOrderViewData = async () => {
    try {
      setOrderViewLoading(true);
      setOrderViewError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/order-view`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOrderViewData(data);
    } catch (err) {
      console.error("Error fetching order view:", err);
      setOrderViewError(err.message);
    } finally {
      setOrderViewLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated before fetching data
    const token = localStorage.getItem("token");
    if (token) {
      fetchOrderViewData();
    }
  }, []);

  const refreshData = () => {
    setIsRefreshing(true);
    // This will trigger a re-render and force child components to refresh their data
    setRefreshTrigger(prev => prev + 1);
    
    // Also refresh order view data
    fetchOrderViewData();
    
    // Simulate refresh process
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1500);
  };
  
  const renderView = () => {
    switch (currentView) {
      case "single":
        return (
          <SingleStock 
            period={period} 
            interval={interval} 
            refreshTrigger={refreshTrigger}
            onRefreshComplete={() => setIsRefreshing(false)}
          />
        );
      case "bulk":
        return (
          <BulkViewer 
            period={period} 
            interval={interval} 
            refreshTrigger={refreshTrigger}
            onRefreshComplete={() => setIsRefreshing(false)}
          />
        );
      case "indian":
        return (
          <IndianStocks 
            period={period} 
            interval={interval} 
            refreshTrigger={refreshTrigger}
            onRefreshComplete={() => setIsRefreshing(false)}
          />
        );
      case "queue":
        return (
          <SearchQueue 
            period={period} 
            interval={interval} 
            refreshTrigger={refreshTrigger}
            onRefreshComplete={() => setIsRefreshing(false)}
          />
        );
      default:
        return (
          <SingleStock 
            period={period} 
            interval={interval} 
            refreshTrigger={refreshTrigger}
            onRefreshComplete={() => setIsRefreshing(false)}
          />
        );
    }
  };

  // View statistics for the dashboard header
  const getViewStats = () => {
    switch (currentView) {
      case "single":
        return { icon: <FaChartLine className="text-cyan-400" />, name: "Single Analysis", desc: "Detailed analysis of individual stocks" };
      case "bulk":
        return { icon: <FaDatabase className="text-purple-400" />, name: "Bulk Viewer", desc: "Compare multiple stocks at once" };
      case "indian":
        return { icon: <FaChartLine className="text-green-400" />, name: "Indian Stocks", desc: "Top performing Indian market stocks" };
      case "queue":
        return { icon: <FaRobot className="text-blue-400" />, name: "Search Queue", desc: "Quick search and analysis queue" };
      default:
        return { icon: <FaChartLine className="text-cyan-400" />, name: "Single Analysis", desc: "Detailed analysis of individual stocks" };
    }
  };

  const viewStats = getViewStats();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <Header />
      
      {/* View Header */}
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
              Last updated: {lastUpdated.toLocaleString()}
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
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
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
              Live prices • Real-time data • Algorithmic trading
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
              onClick={refreshData}
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
        onClick={refreshData}
        className="fixed bottom-6 right-6 md:hidden z-10 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:from-blue-500 hover:to-purple-500 transition-all"
      >
        <FaSync className={isRefreshing ? "animate-spin" : ""} />
      </button>
    </div>
  );
}

export default Intraday;