import React, { useState } from "react";
import {
  FaHome,
  FaChartLine,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaChevronRight,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SiIobroker } from "react-icons/si";

export default function SideNavbar() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeHover, setActiveHover] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuth();

  // Primary color - Same as original
  const primaryColor = "#42a5f5";

  const menuItems = [
    { name: "Home", path: "/home", icon: <FaHome className="text-lg" /> },
    {
      name: "Live Market",
      path: "/livemarket",
      icon: <FaChartLine className="text-lg" />,
    },
    {
      name: "Broker Account",
      path: "/broker",
      icon: <SiIobroker className="text-lg" />,
    },
    { name: "Profile", path: "/profile", icon: <FaUser className="text-lg" /> },
  ];

  const bottomMenuItems = [
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
      className={`flex flex-col bg-white text-gray-800 p-6 transition-all duration-300 relative ${
        isOpen ? "w-72" : "w-20"
      } shadow-xl border-r border-gray-200`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-8 text-white p-2 rounded-full focus:outline-none z-10 shadow-lg hover:scale-110 transition-all duration-300 border"
        style={{
          backgroundColor: primaryColor,
          borderColor: primaryColor,
        }}
      >
        <FaBars className="text-sm" />
      </button>

      {/* Logo Section */}
      <div className="flex items-center mb-10 mt-2">
        <div
          onClick={() => navigate("/home")}
          className="cursor-pointer flex items-center gap-3 transition-transform hover:scale-105 duration-300"
        >
          <div className="flex items-center gap-3">
          
            {isOpen && (
              <div className="flex flex-col">
                <h1 
                  className="text-2xl font-extrabold tracking-tight"
                  style={{ color: primaryColor }}
                >
                  VR ALGO TRADING
                </h1>
                <p className="text-xs text-gray-500 mt-1 font-medium tracking-wide">
                  Next Generation Trading Platform
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 space-y-2">
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
                isOpen ? "gap-4 px-4" : "justify-center"
              } w-full py-3 rounded-xl transition-all duration-200 relative group ${
                isActive
                  ? "text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-md"
              }`}
              style={{
                backgroundColor: isActive ? primaryColor : "",
              }}
            >
              <div
                className={`transition-all duration-200 ${
                  isHovered || isActive ? "scale-110" : "scale-100"
                } ${isActive ? "text-white" : ""}`}
                style={{
                  color: isActive ? "white" : primaryColor,
                }}
              >
                {item.icon}
              </div>

              {isOpen && (
                <div className="flex items-center justify-between flex-1">
                  <span className="font-semibold text-sm tracking-wide">
                    {item.name}
                  </span>
                  {(isHovered || isActive) && (
                    <FaChevronRight className="text-xs opacity-70" />
                  )}
                </div>
              )}

              {/* Enhanced Tooltip for collapsed state */}
              {!isOpen && (
                <div 
                  className="absolute left-full ml-4 px-3 py-2 text-white text-sm font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-20 border"
                  style={{
                    backgroundColor: primaryColor,
                    borderColor: primaryColor,
                  }}
                >
                  {item.name}
                  <div 
                    className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 rotate-45"
                    style={{ backgroundColor: primaryColor }}
                  ></div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      {isOpen && (
        <div className="my-6">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>
      )}

      {/* Bottom Menu */}
      <nav className="space-y-2">
        {bottomMenuItems.map((item) => {
          const isHovered = activeHover === item.name;

          return (
            <button
              key={item.name}
              onClick={() => handleClick(item)}
              onMouseEnter={() => handleMouseEnter(item.name)}
              onMouseLeave={handleMouseLeave}
              className={`flex items-center ${
                isOpen ? "gap-4 px-4" : "justify-center"
              } w-full py-3 rounded-xl transition-all duration-200 group text-red-500 hover:bg-red-50 hover:text-red-700 border border-red-100 hover:border-red-200`}
            >
              <div
                className={`transition-transform duration-200 ${
                  isHovered ? "scale-110" : "scale-100"
                }`}
              >
                {item.icon}
              </div>

              {isOpen && (
                <span className="font-semibold text-sm tracking-wide">
                  {item.name}
                </span>
              )}

              {/* Enhanced Tooltip for collapsed state */}
              {!isOpen && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-20 border border-red-500">
                  {item.name}
                  <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-red-500 rotate-45"></div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Enhanced User Info Footer */}
      {isOpen && (
        <div className="mt-8 pt-6 border-t border-gray-300">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg text-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {localStorage.getItem("user")
                ? JSON.parse(localStorage.getItem("user"))
                    .username?.charAt(0)
                    .toUpperCase()
                : "G"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate tracking-tight">
                {localStorage.getItem("user")
                  ? JSON.parse(localStorage.getItem("user")).username
                  : "Guest"}
              </p>
              <p className="text-xs text-gray-600 truncate font-medium">
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