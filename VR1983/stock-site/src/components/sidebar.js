import React, { useState } from "react";

import {
  FaHome,
  FaChartLine,
  FaExchangeAlt,
  FaClock,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaCog,
  FaQuestionCircle,
  FaWallet,
  FaRobot,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SiIobroker } from "react-icons/si";
import logo from "../asset/vrlogo.png";

export default function SideNavbar() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeHover, setActiveHover] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuth();

  const menuItems = [
    { name: "Home", path: "/home", icon: <FaHome className="text-lg" /> },
    {
      name: "Intraday",
      path: "/intraday",
      icon: <FaChartLine className="text-lg" />,
    },
    {
      name: "Swing",
      path: "/swing",
      icon: <FaExchangeAlt className="text-lg" />,
    },
    {
      name: "Longterm",
      path: "/longterm",
      icon: <FaClock className="text-lg" />,
    },
    {
      name: "Broker Account",
      path: "/broker",
      icon: <SiIobroker className="text-lg" />,
    },
    // { name: "AI Strategies", path: "/strategies", icon: <FaRobot className="text-lg" /> },
    // { name: "Wallet", path: "/wallet", icon: <FaWallet className="text-lg" /> },
    { name: "Profile", path: "/profile", icon: <FaUser className="text-lg" /> },
  ];

  const bottomMenuItems = [
    // { name: "Settings", path: "/settings", icon: <FaCog className="text-lg" /> },
    // { name: "Help", path: "/help", icon: <FaQuestionCircle className="text-lg" /> },
    {
      name: "Logout",
      path: "/login",
      icon: <FaSignOutAlt className="text-lg" />,
    },
  ];

  const handleClick = (item) => {
    if (item.name === "Logout") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setAuth(false);
      navigate("/login");
    } else {
      navigate(item.path);
    }
  };

  const handleMouseEnter = (name) => {
    setActiveHover(name);
  };

  const handleMouseLeave = () => {
    setActiveHover(null);
  };

  return (
    <div
      className={`flex flex-col bg-gradient-to-b from-gray-900 to-blue-900 text-white p-5 transition-all duration-300 relative ${
        isOpen ? "w-64" : "w-20"
      } shadow-2xl`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-6 bg-gradient-to-r from-blue-700 to-purple-700 text-white p-2 rounded-full focus:outline-none z-10 shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
      >
        <FaBars className="text-sm" />
      </button>

      {/* Logo */}
      <div className="flex items-center mb-8 mt-2">
        <div
          onClick={() => navigate("/home")}
          className="cursor-pointer flex items-center gap-3 transition-transform hover:scale-105 duration-300"
        >
          {isOpen && (
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                VR ALGO TRADING
              </h1>
              <p className="text-xs text-blue-300">Next Generation Platform</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isHovered = activeHover === item.name;

          return (
            <button
              key={item.name}
              onClick={() => handleClick(item)}
              onMouseEnter={() => handleMouseEnter(item.name)}
              onMouseLeave={handleMouseLeave}
              className={`flex items-center ${
                isOpen ? "gap-3 px-4" : "justify-center"
              } w-full py-3 rounded-xl transition-all duration-300 relative group ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-300 hover:bg-blue-800/50 hover:text-white"
              }`}
            >
              <div
                className={`transition-transform duration-300 ${
                  isHovered || isActive ? "scale-110" : ""
                }`}
              >
                {item.icon}
              </div>

              {isOpen && <span className="font-medium">{item.name}</span>}

              {/* Tooltip for collapsed state */}
              {!isOpen && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-20">
                  {item.name}
                </div>
              )}

              {/* Active indicator */}
              {isActive && isOpen && (
                <div className="absolute right-3 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      {isOpen && <div className="border-t border-blue-700/50 my-4"></div>}

      {/* Bottom Menu */}
      <nav className="space-y-1">
        {bottomMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isHovered = activeHover === item.name;

          return (
            <button
              key={item.name}
              onClick={() => handleClick(item)}
              onMouseEnter={() => handleMouseEnter(item.name)}
              onMouseLeave={handleMouseLeave}
              className={`flex items-center ${
                isOpen ? "gap-3 px-4" : "justify-center"
              } w-full py-3 rounded-xl transition-all duration-300 group ${
                item.name === "Logout"
                  ? "text-red-300 hover:bg-red-900/50 hover:text-red-100"
                  : isActive
                  ? "bg-blue-800/30 text-white"
                  : "text-gray-400 hover:bg-blue-800/30 hover:text-white"
              }`}
            >
              <div
                className={`transition-transform duration-300 ${
                  isHovered || isActive ? "scale-110" : ""
                }`}
              >
                {item.icon}
              </div>

              {isOpen && <span className="font-medium">{item.name}</span>}

              {/* Tooltip for collapsed state */}
              {!isOpen && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-20">
                  {item.name}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info Footer */}
      {isOpen && (
        <div className="mt-6 pt-4 border-t border-blue-700/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold">
              {localStorage.getItem("user")
                ? JSON.parse(localStorage.getItem("user"))
                    .username?.charAt(0)
                    .toUpperCase()
                : "G"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {localStorage.getItem("user")
                  ? JSON.parse(localStorage.getItem("user")).username
                  : "Guest"}
              </p>
              <p className="text-xs text-blue-300 truncate">
                {localStorage.getItem("user")
                  ? JSON.parse(localStorage.getItem("user")).email
                  : "guest@example.com"}
              </p>
            </div>
          </div>
        </div>
      )}
   
     
    </div>
  );
}
