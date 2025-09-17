import React, { useState, useRef, useEffect } from "react";
import logo from "../asset/vrlogo.png";
import userAvatar from "../asset/user-img.jpg";
import { User, LogOut, Settings, ChevronDown, BarChart3, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function TopNavbar() {
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { setAuth } = useAuth();
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user")) || {
    username: "Guest",
    email: "guest@example.com",
  };

  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  const handleProfile = () => {
    navigate('/profile')
  }

  // Mock notifications data
  const notifications = [
    { id: 1, text: "Your algorithm executed successfully", time: "2 min ago", read: false },
    { id: 2, text: "Market volatility alert", time: "15 min ago", read: false },
    { id: 3, text: "New trading strategy available", time: "1 hour ago", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setAuth(false);
    window.location.reload();
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

      {/* Center Navigation (optional) */}
      {/* <div className="hidden lg:flex items-center space-x-6">
        <a href="#" className="text-blue-200 hover:text-white transition-colors flex items-center gap-1">
          <BarChart3 size={16} />
          <span>Dashboard</span>
        </a>
        <a href="#" className="text-blue-200 hover:text-white transition-colors">Strategies</a>
        <a href="#" className="text-blue-200 hover:text-white transition-colors">Market</a>
        <a href="#" className="text-blue-200 hover:text-white transition-colors">Analytics</a>
      </div> */}

      {/* Right User Section */}
      <div className="flex items-center gap-4">

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