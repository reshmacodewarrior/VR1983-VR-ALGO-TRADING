import React, { useState, useRef, useEffect } from "react";
import logo from "../asset/vrlogo.png";
import userAvatar from "../asset/user-img.jpg";
import { User, LogOut, Settings, ChevronDown, Bell, Wallet, FileText } from "lucide-react"; // Added FileText icon
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function TopNavbar() {
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [holdingsOpen, setHoldingsOpen] = useState(false);
  const [holdings, setHoldings] = useState([]);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
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
        // Ensure all fields have default values to avoid empty fields
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
    navigate('/profile');
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuth(false);
    window.location.reload();
  };

  // Holdings List Component (keep your existing HoldingsDropdown component)
  const HoldingsDropdown = () => {
    // ... (keep your existing HoldingsDropdown implementation)
    if (!holdingsOpen) return null;

    const getRiskColor = (risk) => {
      switch (risk?.toLowerCase()) {
        case 'low': return 'bg-green-100 text-green-800';
        case 'medium': return 'bg-yellow-100 text-yellow-800';
        case 'high': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const totalProfitLoss = holdings.reduce((sum, h) => sum + (h.profit_loss || 0), 0);
    const totalCurrentValue = holdings.reduce((sum, h) => sum + ((h.current_price || 0) * (h.quantity || 0)), 0);

    return (
      <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
        <div className="p-4 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Wallet size={18} />
              My Holdings
            </h3>
            <div className="text-right">
              <p className="text-sm">Total P&L: 
                <span className={totalProfitLoss >= 0 ? "text-green-400 ml-1" : "text-red-400 ml-1"}>
                  ₹{totalProfitLoss.toFixed(2)}
                </span>
              </p>
              <p className="text-xs text-blue-200">Value: ₹{totalCurrentValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="p-3 max-h-64 overflow-y-auto">
          {holdingsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 text-sm mt-2">Loading holdings...</p>
            </div>
          ) : holdings.length === 0 ? (
            <div className="text-center py-4">
              <Wallet size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No holdings yet</p>
              <p className="text-gray-400 text-sm">Start trading to see your holdings here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {holdings.map((holding, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{holding.symbol}</p>
                      <p className="text-xs text-gray-600">{holding.exchange}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(holding.risk_level)}`}>
                      {holding.risk_level}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-700 font-medium">Qty: </span>
                      <span className="text-gray-900">{holding.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">Avg: </span>
                      <span className="text-gray-900">₹{holding.average_price.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">Current: </span>
                      <span className="text-gray-900">₹{holding.current_price.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">P&L: </span>
                      <span className={holding.profit_loss >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                        ₹{holding.profit_loss.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <button 
            onClick={handleViewPortfolio}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View Full Portfolio
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-gradient-to-r from-blue-900 to-purple-900 text-white px-6 py-3 flex justify-between items-center shadow-xl sticky top-0 z-50">
      {/* Left Logo and Brand */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={logo}
            alt="VR Algo Trading Logo"
            className="h-14 w-auto rounded-full border-2 border-blue-300 shadow-lg"
          />
          <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        
        <div className="hidden md:block">
          <h2 className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
            VR ALGO TRADING
          </h2>
          <p className="text-xs text-blue-200">Next Generation Trading Platform</p>
        </div>
      </div>

      {/* Right User Section */}
      <div className="flex items-center gap-4">

        {/* Orders Button */}
        <button
          onClick={handleOrders}
          className="flex items-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <FileText size={18} />
          <span className="hidden sm:block">My Orders</span>
        </button>

        {/* My Holdings Button */}
        <div className="relative" ref={holdingsRef}>
          <button
            onClick={handleHoldingsClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-700 rounded-lg transition-colors relative group"
          >
            <Wallet size={18} />
            <span className="hidden sm:block">My Holdings</span>
            {holdings.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
            className="p-2 hover:bg-blue-800 rounded-lg transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
              <div className="p-4 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
                <h3 className="font-semibold">Notifications</h3>
                <p className="text-sm text-blue-200">{unreadCount} unread</p>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-3 border-b border-gray-100 ${!notification.read ? 'bg-blue-50' : ''}`}>
                    <p className="text-sm text-gray-800">{notification.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                ))}
              </div>
              
              <div className="p-3 border-t border-gray-200">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800">
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative flex items-center gap-2" ref={dropdownRef}>
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium">Welcome, <span className="text-cyan-300">{user.username}</span></p>
            <p className="text-xs text-blue-200">{user.email}</p>
          </div>
          
          <div 
            className="relative cursor-pointer group"
            onClick={() => setOpen(!open)}
          >
            <img
              src={userAvatar}
              alt="User profile"
              className="h-10 w-10 rounded-full border-2 border-blue-300 shadow-md group-hover:border-cyan-400 transition-colors"
            />
            <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
              <ChevronDown size={12} className={`text-white transition-transform ${open ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {/* Dropdown Menu */}
          {open && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
              <div className="p-4 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
                <p className="font-semibold truncate">{user.username}</p>
                <p className="text-sm text-blue-200 truncate">{user.email}</p>
              </div>
              
              <div className="p-2">
                <button onClick={handleProfile} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md transition-colors">
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md transition-colors">
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
              </div>
              
              <div className="border-t border-gray-200"></div>
              
              <div className="p-2">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
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