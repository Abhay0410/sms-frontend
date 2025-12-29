import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { FaBars } from "react-icons/fa";

const Layout = ({ sections, title, role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        sections={sections} 
        title={title} 
        role={role} 
      />

      {/* h-screen + overflow-hidden on the main container prevents the whole page from scrolling */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between md:hidden px-6 bg-white border-b border-slate-200">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-800 p-2">
            <FaBars size={22} />
          </button>
          <h1 className="font-bold uppercase tracking-widest text-slate-900">{title}</h1>
          <div className="w-6" />
        </header>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50">
          <div className="max-w-7xl mx-auto">
             <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;