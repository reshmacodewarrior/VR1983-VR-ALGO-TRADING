import React, { useState, useRef, useEffect } from "react";
import logo from "../asset/vrlogo.png";
import userAvatar from "../asset/user-img.jpg";
import { User, LogOut, Settings, ChevronDown, Bell, Wallet, FileText, Search, TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function TopNavbar() {
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [holdingsOpen, setHoldingsOpen] = useState(false);
  const [holdings, setHoldings] = useState([]);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem("user")) || {
    username: "Guest",
    email: "guest@example.com",
  };

  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const holdingsRef = useRef(null);

  const BASE_URL = process.env.REACT_APP_API_URL || "http://192.168.1.58:8000";

  // Primary color - Same as original
  const primaryColor = "#42a5f5";

  // Mock notifications data
  const notifications = [
    { id: 1, text: "Your algorithm executed successfully", time: "2 min ago", read: false },
    { id: 2, text: "Market volatility alert", time: "15 min ago", read: false },
    { id: 3, text: "New trading strategy available", time: "1 hour ago", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch holdings data
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
        const processedHoldings = data.map(holding => ({
          symbol: holding.symbol || 'N/A',
          exchange: holding.exchange || 'NSE',
          quantity: holding.quantity || 0,
          average_price: holding.average_price || 0,
          current_price: holding.current_price || 0,
          profit_loss: holding.profit_loss || 0,
          risk_level: holding.risk_level || 'Medium'
        }));
        setHoldings(processedHoldings);
      } else {
        console.error("Holdings API error:", res.status);
      }
    } catch (err) {
      console.error("Error fetching holdings:", err);
    } finally {
      setHoldingsLoading(false);
    }
  };

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (holdingsRef.current && !holdingsRef.current.contains(event.target)) {
        setHoldingsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfile = () => {
    navigate('/profile');
    setOpen(false);
  };

  const handleOrders = () => {
    navigate('/orders');
  };

  const handleHoldingsClick = () => {
    if (!holdingsOpen) {
      fetchHoldings();
    }
    setHoldingsOpen(!holdingsOpen);
  };

  const handleViewPortfolio = () => {
    setHoldingsOpen(false);
    navigate('/holdings');
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuth(false);
    window.location.reload();
  };

  const HoldingsDropdown = () => {
    if (!holdingsOpen) return null;

    const getRiskColor = (risk) => {
      switch (risk?.toLowerCase()) {
        case 'low': return 'bg-green-100 text-green-800 border-green-200';
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'high': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    const totalProfitLoss = holdings.reduce((sum, h) => sum + (h.profit_loss || 0), 0);
    const totalCurrentValue = holdings.reduce((sum, h) => sum + ((h.current_price || 0) * (h.quantity || 0)), 0);

    return (
      <div className="absolute right-0 top-full mt-3 w-96 bg-white border border-gray-300 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
        <div 
          className="p-5 text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Wallet size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg tracking-tight">My Holdings</h3>
                <p className="text-blue-100 text-sm font-medium">Real-time portfolio overview</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">Total P&L: 
                <span className={totalProfitLoss >= 0 ? "text-green-300 ml-1" : "text-red-300 ml-1"}>
                  ₹{totalProfitLoss.toFixed(2)}
                </span>
              </p>
              <p className="text-xs text-blue-200 font-medium">Value: ₹{totalCurrentValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 max-h-64 overflow-y-auto">
          {holdingsLoading ? (
            <div className="text-center py-6">
              <div 
                className="animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 mx-auto mb-3"
                style={{ borderColor: primaryColor }}
              ></div>
              <p className="text-gray-500 text-sm font-medium">Loading holdings...</p>
            </div>
          ) : holdings.length === 0 ? (
            <div className="text-center py-6">
              <Wallet size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 font-medium">No holdings yet</p>
              <p className="text-gray-400 text-sm mt-1">Start trading to see your portfolio</p>
            </div>
          ) : (
            <div className="space-y-3">
              {holdings.map((holding, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-lg tracking-tight">{holding.symbol}</p>
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">{holding.exchange}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskColor(holding.risk_level)}`}>
                      {holding.risk_level}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600 font-semibold text-xs uppercase tracking-wide">Qty: </span>
                      <span className="text-gray-900 font-bold block text-base">{holding.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-semibold text-xs uppercase tracking-wide">Avg: </span>
                      <span className="text-gray-900 font-bold block text-base">₹{holding.average_price.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-semibold text-xs uppercase tracking-wide">Current: </span>
                      <span className="text-gray-900 font-bold block text-base">₹{holding.current_price.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-semibold text-xs uppercase tracking-wide">P&L: </span>
                      <span className={holding.profit_loss >= 0 ? "text-green-600 font-bold block text-base" : "text-red-600 font-bold block text-base"}>
                        ₹{holding.profit_loss.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button 
            onClick={handleViewPortfolio}
            className="w-full text-white py-3 px-4 rounded-lg hover:opacity-90 transition-all duration-200 text-sm font-bold tracking-wide shadow-lg hover:shadow-xl"
            style={{ backgroundColor: primaryColor }}
          >
            View Full Portfolio Dashboard
          </button>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="w-full text-white px-8 py-4 flex justify-between items-center shadow-lg border-b border-blue-400 sticky top-0 z-50"
      style={{ backgroundColor: primaryColor }}
    >
      {/* Left Logo and Brand */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="relative group">
            <img
              src={logo}
              alt="VR Algo Trading Logo"
              className="h-14 w-auto rounded-2xl border-3 border-white/80 shadow-2xl transition-transform group-hover:scale-105"
            />
            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-3 border-white shadow-lg"></div>
          </div>
        </div>
        
        <div className="hidden md:block">
          <h2 className="font-extrabold text-2xl tracking-tight text-white drop-shadow-sm">
            VR ALGO TRADING
          </h2>
          <p className="text-blue-100 text-sm font-semibold tracking-wide mt-1">Next Generation Trading Platform</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-200" size={20} />
          <input
            type="text"
            placeholder="Search stocks, algorithms, or strategies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200 font-medium"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right User Section */}
      <div className="flex items-center gap-4">

        {/* Orders Button */}
        <button
          onClick={handleOrders}
          className="flex items-center gap-3 px-5 py-3 bg-white/15 hover:bg-white/25 text-white rounded-xl transition-all duration-200 border border-white/20 hover:border-white/30 hover:shadow-lg backdrop-blur-sm group"
        >
          <FileText size={20} className="group-hover:scale-110 transition-transform" />
          <span className="hidden sm:block font-semibold text-sm tracking-wide">My Orders</span>
        </button>

        {/* My Holdings Button */}
        <div className="relative" ref={holdingsRef}>
          <button
            onClick={handleHoldingsClick}
            className="flex items-center gap-3 px-5 py-3 bg-white/15 hover:bg-white/25 text-white rounded-xl transition-all duration-200 border border-white/20 hover:border-white/30 hover:shadow-lg backdrop-blur-sm group relative"
          >
            <TrendingUp size={20} className="group-hover:scale-110 transition-transform" />
            <span className="hidden sm:block font-semibold text-sm tracking-wide">My Holdings</span>
            {holdings.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg border border-white">
                {holdings.length}
              </span>
            )}
          </button>
          
          <HoldingsDropdown />
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 relative text-white border border-transparent hover:border-white/30 hover:shadow-lg backdrop-blur-sm group"
          >
            <Bell size={22} className="group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg border border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-3 w-96 bg-white border border-gray-300 rounded-xl shadow-2xl z-50">
              <div 
                className="p-5 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-white" />
                  <div>
                    <h3 className="font-bold text-lg tracking-tight">Notifications</h3>
                    <p className="text-blue-100 text-sm font-medium">{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border-b border-gray-200 transition-all duration-200 ${
                      !notification.read ? 'bg-blue-50 border-l-4' : 'border-l-4 border-l-transparent'
                    }`}
                    style={{ borderLeftColor: !notification.read ? primaryColor : 'transparent' }}
                  >
                    <p className="text-sm text-gray-800 font-medium">{notification.text}</p>
                    <p className="text-xs text-gray-500 mt-2 font-medium">{notification.time}</p>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button 
                  className="w-full text-center text-sm font-semibold hover:text-blue-800 transition-colors duration-200"
                  style={{ color: primaryColor }}
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative flex items-center gap-4" ref={dropdownRef}>
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold tracking-wide">Welcome, <span className="text-blue-100">{user.username}</span></p>
            <p className="text-xs text-blue-100 font-medium">{user.email}</p>
          </div>
          
          <div 
            className="relative cursor-pointer group"
            onClick={() => setOpen(!open)}
          >
            <img
              src={userAvatar}
              alt="User profile"
              className="h-12 w-12 rounded-2xl border-3 border-white/80 shadow-xl group-hover:border-blue-200 transition-all duration-200 group-hover:scale-105"
            />
            <div 
              className="absolute -bottom-1 -right-1 rounded-full p-1 shadow-lg border border-white"
              style={{ backgroundColor: primaryColor }}
            >
              <ChevronDown 
                size={14} 
                className={`text-white transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
              />
            </div>
          </div>

          {/* Enhanced Dropdown Menu */}
          {open && (
            <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-gray-300 rounded-xl shadow-2xl overflow-hidden z-50">
              <div 
                className="p-5 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <p className="font-bold text-lg tracking-tight truncate">{user.username}</p>
                <p className="text-sm text-blue-100 font-medium truncate">{user.email}</p>
              </div>
              
              <div className="p-2">
                <button 
                  onClick={handleProfile} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-all duration-200 font-semibold group"
                >
                  <User size={18} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
                  <span>Profile</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-all duration-200 font-semibold group">
                  <Settings size={18} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
                  <span>Settings</span>
                </button>
              </div>
              
              <div className="border-t border-gray-200 mx-3"></div>
              
              <div className="p-2">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-semibold group"
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}