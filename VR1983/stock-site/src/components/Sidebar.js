import React, { useState } from "react";

import {
  FaHome,
  FaChartLine,
  FaUser,
  FaSignOutAlt,
  FaBars,
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
      className={`flex flex-col bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white p-5 transition-all duration-300 relative ${
        isOpen ? "w-64" : "w-20"
      } shadow-lg border-r border-blue-700`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-6 bg-blue-700 text-white p-2 rounded-full focus:outline-none z-10 shadow-lg hover:bg-blue-600 transition-all duration-300 hover:scale-110 border border-blue-600"
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
              <h1 className="text-xl font-bold text-white">
                VR ALGO TRADING
              </h1>
              <p className="text-xs text-blue-200 mt-1">Next Generation Trading Platform</p>
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
              } w-full py-3 rounded-lg transition-all duration-200 relative group ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-blue-100 hover:bg-blue-700 hover:text-white"
              }`}
            >
              <div
                className={`transition-transform duration-200 ${
                  isHovered || isActive ? "scale-110" : "scale-100"
                } text-white`}
              >
                {item.icon}
              </div>

              {isOpen && (
                <span className="font-medium">
                  {item.name}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {!isOpen && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-blue-800 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 border border-blue-600">
                  {item.name}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      {isOpen && <div className="border-t border-blue-700 my-4"></div>}

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
              } w-full py-3 rounded-lg transition-all duration-200 group ${
                item.name === "Logout"
                  ? "text-red-300 hover:bg-red-900 hover:text-white"
                  : "text-blue-200 hover:bg-blue-700 hover:text-white"
              }`}
            >
              <div
                className={`transition-transform duration-200 ${
                  isHovered || isActive ? "scale-110" : "scale-100"
                }`}
              >
                {item.icon}
              </div>

              {isOpen && (
                <span>
                  {item.name}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {!isOpen && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-blue-800 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 border border-blue-600">
                  {item.name}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info Footer */}
      {isOpen && (
        <div className="mt-6 pt-4 border-t border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow">
              {localStorage.getItem("user")
                ? JSON.parse(localStorage.getItem("user"))
                    .username?.charAt(0)
                    .toUpperCase()
                : "G"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {localStorage.getItem("user")
                  ? JSON.parse(localStorage.getItem("user")).username
                  : "Guest"}
              </p>
              <p className="text-xs text-blue-200 truncate">
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