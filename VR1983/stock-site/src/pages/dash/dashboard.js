import React from "react";
import SideNavbar from "../../components/sidebar";
import Navbar from "../../components/navbar";
import { Outlet } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 from-gray-900 via-gray-800 to-black">
      {/* 🔹 Top Navbar */}
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar */}
        <SideNavbar />

        {/* Main Content */}
        <div className="flex-1 p-10 relative">
          <Outlet /> {/* 🔹 Nested routes like /home, /intraday, etc. */}
        </div>
      </div>
    </div>
  );
}
