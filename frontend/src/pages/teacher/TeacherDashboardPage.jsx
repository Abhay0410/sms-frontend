import React from "react";
import { FaChalkboardTeacher, FaUserGraduate, FaBook, FaCheckCircle } from "react-icons/fa";

export default function TeacherDashboardPage() {
  // Teacher Specific Analytics
  const stats = [
    { label: "My Classes", value: "05", icon: <FaChalkboardTeacher />, color: "bg-blue-500" },
    { label: "Total Students", value: "210", icon: <FaUserGraduate />, color: "bg-indigo-500" },
    { label: "Lectures Today", value: "04", icon: <FaBook />, color: "bg-emerald-500" },
    { label: "Attendance Done", value: "85%", icon: <FaCheckCircle />, color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <header>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Command Center</h2>
        <p className="mt-2 text-slate-500 font-medium text-lg italic">Welcome back, Educator.</p>
      </header>

      {/* Analytics Grid */}
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

      {/* Main Feature Cards Grid */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100">
         <h3 className="text-xl font-bold text-slate-800 mb-6 uppercase tracking-tight">Quick Actions</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Yahan aap apne purane cards logic ko map kar sakte hain */}
            <p className="text-slate-400 italic">Select an option from the sidebar to manage your classes.</p>
         </div>
      </div>
    </div>
  );
}