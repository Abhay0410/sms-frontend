import React from "react";
import { FaChild, FaWallet, FaCheckSquare, FaChartBar } from "react-icons/fa";

export default function ParentDashboardPage() {
  const stats = [
    { label: "Registered Children", value: "02", icon: <FaChild />, color: "bg-blue-500" },
    { label: "Avg Attendance", value: "88%", icon: <FaCheckSquare />, color: "bg-emerald-500" },
    { label: "Recent Grade", value: "A+", icon: <FaChartBar />, color: "bg-purple-500" },
    { label: "Pending Fees", value: "₹0", icon: <FaWallet />, color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Welcome back!</h2>
        <p className="mt-2 text-slate-500 font-medium italic">Your central command for student success.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`${stat.color} p-4 rounded-2xl text-white shadow-md`}>
              {React.cloneElement(stat.icon, { size: 24 })}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 text-center italic text-slate-400">
        Monitoring your children's progress. Use the sidebar to switch between modules.
      </div>
    </div>
  );
}