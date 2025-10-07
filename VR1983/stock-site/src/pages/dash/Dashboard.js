import React from "react";
import SideNavbar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { Outlet } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 🔹 Top Navbar */}
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SideNavbar />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-3 md:p-4 lg:p-5">
          <Outlet />
        </main>
      </div>     
    </div>
  );
}