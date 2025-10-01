import React from "react";
import SideNavbar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { Outlet } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 🔹 Top Navbar */}
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar */}
        <SideNavbar />

        {/* Main Content */}
        <div className="flex-1 p-10 relative">
          <Outlet /> {/* 🔹 Nested routes like /home, /market, etc. */}
        </div>
      </div>
      
    </div>
  );
}
