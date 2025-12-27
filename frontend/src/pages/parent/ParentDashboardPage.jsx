import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaBell, FaChild, FaDollarSign, FaUserAlt, FaCalendarAlt, FaCheckSquare, FaChartBar, FaInbox } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";

export default function ParentDashboardPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("My Children");

  const sections = useMemo(() => [
    {
      title: "My Children",
      description: "Central hub for your children's reports.",
      cards: [{ icon: <FaChild />, title: "Children Details", page: "children", color: "text-blue-600", bg: "bg-blue-50" }],
    },
    {
      title: "Academic",
      description: "Monitor daily schedules and outcomes.",
      cards: [
        { icon: <FaChartBar />, title: "Exam Results", page: "child-results", color: "text-purple-600", bg: "bg-purple-50" },
        { icon: <FaCalendarAlt />, title: "Timetable", page: "timetable", color: "text-indigo-600", bg: "bg-indigo-50" },
        { icon: <FaCheckSquare />, title: "Attendance", page: "attendance", color: "text-emerald-600", bg: "bg-emerald-50" },
      ],
    },
    {
      title: "Administrative",
      description: "Manage finances and profile.",
      cards: [
        { icon: <FaDollarSign />, title: "Fees", page: "fee-details", color: "text-amber-600", bg: "bg-amber-50" },
        { icon: <FaInbox />, title: "Mailbox", page: "messages", color: "text-indigo-600", bg: "bg-indigo-50" },
        { icon: <FaBell />, title: "Notices", page: "notifications", color: "text-rose-600", bg: "bg-rose-50" },
        { icon: <FaUserAlt />, title: "Profile", page: "profile", color: "text-slate-600", bg: "bg-slate-50" },
      ],
    },
  ], []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        isOpen={sidebarOpen} setIsOpen={setSidebarOpen}
        sections={sections} activeTab={activeTab} setActiveTab={setActiveTab}
        title="Parent Hub" role="parent"
      />

      <main className="flex-1 overflow-x-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between bg-white px-6 shadow-sm md:hidden border-b">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600"><FaBars size={22} /></button>
          <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Parent Dashboard</span>
          <div className="w-6" />
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <header className="mb-10">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Welcome back!</h2>
            <p className="mt-2 text-slate-500 font-medium italic">Your central command for student success.</p>
          </header>

          {sections.filter(s => s.title === activeTab).map(section => (
            <div key={section.title} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-800 uppercase">{section.title}</h3>
                <p className="text-slate-500 mt-1 font-medium">{section.description}</p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {section.cards.map(c => (
                  <button key={c.title} onClick={() => navigate(`/parent/${c.page}`)} className="group flex flex-col items-start rounded-3xl border border-slate-200 bg-white p-8 text-left transition-all hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1">
                    <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${c.bg} ${c.color} transition-transform group-hover:scale-110 shadow-sm`}>
                      {React.cloneElement(c.icon, { size: 28 })}
                    </div>
                    <h5 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 tracking-tight">{c.title}</h5>
                    <p className="mt-2 text-sm text-slate-400 font-medium">Click to view details and reports.</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}