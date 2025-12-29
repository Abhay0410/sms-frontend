import React from "react";
import { FaBook, FaClipboardList, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";

export default function StudentDashboardPage() {
  const stats = [
    { label: "Enrolled Classes", value: "06", icon: <FaBook />, color: "bg-blue-500" },
    { label: "Attendance", value: "92%", icon: <FaCheckCircle />, color: "bg-emerald-500" },
    { label: "Upcoming Exams", value: "02", icon: <FaClipboardList />, color: "bg-purple-500" },
    { label: "Today's Periods", value: "05", icon: <FaCalendarAlt />, color: "bg-indigo-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">My Workspace</h2>
        <p className="mt-2 text-slate-500 font-medium text-lg">Ready to continue your academic journey?</p>
      </div>

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

      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 text-center">
        <p className="text-slate-400 italic">Select a module from the sidebar to view your detailed records.</p>
      </div>
    </div>
  );
}