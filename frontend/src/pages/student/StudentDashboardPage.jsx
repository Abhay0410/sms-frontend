import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaBell, FaBook, FaClipboardList, FaDollarSign, FaUserAlt, FaCalendarAlt, FaEnvelope } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Academic");

  const sections = useMemo(() => [
    {
      title: "Academic",
      description: "Access your learning materials and grades.",
      cards: [
        { icon: <FaBook />, title: "My Classes", page: "my-classes", color: "text-blue-600", bg: "bg-blue-50" },
        { icon: <FaClipboardList />, title: "Exam Results", page: "results", color: "text-purple-600", bg: "bg-purple-50" },
        { icon: <FaCalendarAlt />, title: "Timetable", page: "timetable", color: "text-indigo-600", bg: "bg-indigo-50" },
      ],
    },
    {
      title: "Attendance",
      description: "Monitor your presence history.",
      cards: [{ icon: <FaClipboardList />, title: "Daily Records", page: "attendance", color: "text-emerald-600", bg: "bg-emerald-50" }],
    },
    {
      title: "Account",
      description: "Manage profile and communications.",
      cards: [
        { icon: <FaDollarSign />, title: "Fees", page: "fee-details", color: "text-amber-600", bg: "bg-amber-50" },
        { icon: <FaEnvelope />, title: "Messages", page: "messages", color: "text-indigo-600", bg: "bg-indigo-50" },
        { icon: <FaBell />, title: "Notifications", page: "notifications", color: "text-rose-600", bg: "bg-rose-50" },
        { icon: <FaUserAlt />, title: "Profile", page: "profile", color: "text-slate-600", bg: "bg-slate-50" },
      ],
    },
  ], []);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar 
        isOpen={sidebarOpen} setIsOpen={setSidebarOpen}
        sections={sections} activeTab={activeTab} setActiveTab={setActiveTab}
        title="Student Hub" role="student"
      />

      <main className="flex-1 overflow-x-hidden">
        <header className="flex h-16 items-center justify-between bg-white px-6 shadow-sm md:hidden border-b">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600"><FaBars size={22} /></button>
          <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Student Dashboard</span>
          <div className="w-6" />
        </header>

        <div className="p-6 md:p-12 max-w-7xl mx-auto">
          <header className="mb-12">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter">My Workspace</h2>
            <p className="mt-3 text-slate-500 font-medium text-lg leading-relaxed">Ready to continue your academic journey?</p>
          </header>

          {sections.filter(s => s.title === activeTab).map(section => (
            <div key={section.title} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10">
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{section.title}</h3>
                <p className="text-slate-500 mt-1 font-medium">{section.description}</p>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {section.cards.map(c => (
                  <button key={c.title} onClick={() => navigate(`/student/${c.page}`)} className="group relative flex flex-col items-start rounded-[2.5rem] border border-slate-200 bg-white p-10 text-left transition-all hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2">
                    <div className={`mb-8 flex h-20 w-20 items-center justify-center rounded-3xl ${c.bg} ${c.color} transition-transform group-hover:scale-110 shadow-sm`}>
                      {React.cloneElement(c.icon, { size: 36 })}
                    </div>
                    <h5 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 tracking-tight">{c.title}</h5>
                    <p className="mt-3 text-sm text-slate-400 font-medium leading-relaxed">Access information and reports.</p>
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