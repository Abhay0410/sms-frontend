import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaBell, FaChalkboardTeacher, FaClipboardList, FaDollarSign, FaUserAlt, FaCheckSquare, FaPlus, FaListAlt, FaEnvelope } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Class & Subjects");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sections = useMemo(() => [
    {
      title: "Class & Subjects",
      description: "Teaching tools and student groups.",
      icon: <FaChalkboardTeacher />,
      cards: [
        { icon: <FaChalkboardTeacher />, title: "My Classes", page: "my-class", color: "text-blue-600", bg: "bg-blue-50" },
        { icon: <FaClipboardList />, title: "Schedule", page: "my-schedule", color: "text-indigo-600", bg: "bg-indigo-50" },
        { icon: <FaCheckSquare />, title: "Attendance", page: "mark-attendance", color: "text-emerald-600", bg: "bg-emerald-50" },
      ],
    },
    {
      title: "Results",
      description: "Evaluate performance.",
      icon: <FaPlus />,
      cards: [
        { icon: <FaPlus />, title: "Record Marks", page: "create-result", color: "text-purple-600", bg: "bg-purple-50" },
        { icon: <FaListAlt />, title: "Evaluation History", page: "view-results", color: "text-fuchsia-600", bg: "bg-fuchsia-50" },
      ],
    },
    {
      title: "Administrative",
      description: "Official notifications and salary.",
      icon: <FaBell />,
      cards: [
        { icon: <FaBell />, title: "Notices", page: "announcements", color: "text-rose-600", bg: "bg-rose-50" },
        { icon: <FaEnvelope />, title: "Messages", page: "messages", color: "text-indigo-600", bg: "bg-indigo-50" },
        { icon: <FaDollarSign />, title: "Salary", page: "salary-status", color: "text-amber-600", bg: "bg-amber-50" },
        { icon: <FaUserAlt />, title: "Profile", page: "profile", color: "text-slate-600", bg: "bg-slate-50" },
      ],
    },
  ], []);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar 
        isOpen={sidebarOpen} setIsOpen={setSidebarOpen}
        sections={sections} activeTab={activeTab} setActiveTab={setActiveTab}
        title="Teacher Hub" role="teacher"
      />

      <main className="flex-1 p-6 md:p-12">
        <header className="md:hidden mb-6 flex justify-between items-center">
            <button onClick={() => setSidebarOpen(true)}><FaBars size={22} /></button>
            <span className="font-black uppercase tracking-widest text-xs">Instructor Portal</span>
            <div className="w-6" />
        </header>

        <header className="mb-12">
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Command Center</h2>
          <p className="mt-3 text-slate-500 font-medium text-lg italic">Welcome back, Educator.</p>
        </header>

        {sections.filter(s => s.title === activeTab).map(section => (
          <div key={section.title} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{section.title}</h3>
              <p className="text-slate-500 mt-1 font-medium">{section.description}</p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {section.cards.map(c => (
                <button key={c.title} onClick={() => navigate(`/teacher/${c.page}`)} className="group relative flex flex-col items-start rounded-[2.5rem] border border-slate-200 bg-white p-10 text-left transition-all hover:border-indigo-400 hover:shadow-2xl shadow-sm hover:-translate-y-2">
                  <div className={`mb-8 flex h-20 w-20 items-center justify-center rounded-3xl ${c.bg} ${c.color} transition-transform group-hover:scale-110 shadow-sm`}>
                    {React.cloneElement(c.icon, { size: 36 })}
                  </div>
                  <h5 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 tracking-tight">{c.title}</h5>
                  <p className="mt-3 text-sm text-slate-400 font-medium">Click to proceed to this section.</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}