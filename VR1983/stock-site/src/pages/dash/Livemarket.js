import React, { useState, useEffect, useCallback } from "react";
import Navigation from "../../components/Navigation";
import SingleStock from "../../components/SingleStock";
import SearchQueue from "../../components/SearchQueue";
import Header from "../../components/Header";
import { FaSync, FaRobot, FaChartLine, FaDatabase, FaSignOutAlt } from "react-icons/fa";

function LiveMarket() {
  const [currentView, setCurrentView] = useState("single");
  const [period, setPeriod] = useState("1mo");
  const [interval, setInterval] = useState("1d");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Primary color for the theme
  const primaryColor = "#42a5f5";

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (!token || !user) {
      window.location.href = "/login";
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  // Global refresh function
  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      // Trigger refresh for all child components
      setRefreshTrigger(prev => prev + 1);
      // Update last refresh time
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    if (isAuthenticated) {
      const intervalId = setInterval(() => {
        refreshAllData();
      }, 5 * 60 * 1000);
      
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
        return { icon: <FaChartLine style={{ color: primaryColor }} />, name: "Single Analysis", desc: "" };
      case "bulk":
        return { icon: <FaDatabase style={{ color: "#9333ea" }} />, name: "Bulk Viewer", desc: "Compare multiple stocks at once" };
      case "indian":
        return { icon: <FaChartLine style={{ color: "#16a34a" }} />, name: "Indian Stocks", desc: "Top performing Indian market stocks" };
      case "queue":
        return { icon: <FaRobot style={{ color: "#4f46e5" }} />, name: "Search Queue", desc: "Quick search and analysis queue" };
      default:
        return { icon: <FaChartLine style={{ color: primaryColor }} />, name: "Single Analysis" };
    }
  };

  const viewStats = getViewStats();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: primaryColor }}
          ></div>
          <p style={{ color: primaryColor }}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header />
      
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 py-2 px-6 shadow-sm">
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

      {/* View Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-xl border shadow-lg"
              style={{
                backgroundColor: `${primaryColor}10`,
                borderColor: `${primaryColor}20`
              }}
            >
              {viewStats.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{viewStats.name}</h2>
              <p style={{ color: primaryColor }} className="text-sm">{viewStats.desc}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onClick={refreshAllData}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all ${
                isRefreshing 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "text-white hover:scale-105"
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
              {isRefreshing ? "Refreshing..." : "Refresh All"}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg text-white hover:scale-105 transition-all"
              style={{ backgroundColor: '#dc2626' }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#dc2626';
              }}
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {renderView()}
        </div>
      </main>

      {/* Market Status Bar */}
      <div className="bg-white border-t border-b border-gray-200 py-2 px-6 shadow-sm">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">NASDAQ: <span className="text-emerald-600 font-medium">+1.2%</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">NSE: <span className="text-red-600 font-medium">-0.8%</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">Crypto: <span className="text-emerald-600 font-medium">+3.5%</span></span>
              </div>
            </div>
            <div style={{ color: primaryColor }} className="font-medium">
              Auto-refresh in 5 min • Real-time data • Algorithmic trading
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-6 shadow-sm">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-6">
            <span>VR Algo Trading Platform v2.1</span>
            <span>•</span>
            <span>Data provided by Yahoo Finance</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <button
              onClick={refreshAllData}
              className="flex items-center gap-1 hover:scale-105 transition-transform"
              style={{ color: primaryColor }}
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

export default LiveMarket;