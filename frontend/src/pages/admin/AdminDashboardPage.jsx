// import React, { useState, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaBars, FaBell, FaChalkboardTeacher, FaMoneyCheckAlt, FaRegCalendarAlt, FaUserAlt, FaUserGraduate, FaUsersCog, FaBook, FaClipboardList, FaClock, FaUsers, FaChartBar } from "react-icons/fa";
// import Sidebar from "../../components/Sidebar";

// export default function AdminDashboardPage() {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("My Profile");
//   const [activeSubTab, setActiveSubTab] = useState(null);
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const sections = useMemo(() => [
//     {
//       title: "My Profile",
//       description: "Manage your administrative profile and security settings.",
//       icon: <FaUserAlt />,
//       cards: [{ icon: <FaUserAlt />, title: "Profile Management", page: "profile" }],
//     },
//     {
//       title: "User Registration",
//       description: "Enroll and manage school personnel and students.",
//       icon: <FaUsers />,
//       cards: [
//         { icon: <FaChalkboardTeacher />, title: "Teacher Register", page: "register-teacher" },
//         { icon: <FaUserGraduate />, title: "Student Register", page: "register-student" },
//         { icon: <FaUsers />, title: "Admin Register", page: "admin-register" },
//       ],
//     },
//     {
//       title: "Academic Management",
//       icon: <FaBook />,
//       subTabs: [
//         {
//           title: "Class Management",
//           description: "Organize sections and academic levels.",
//           icon: <FaRegCalendarAlt />,
//           cards: [{ icon: <FaRegCalendarAlt />, title: "Class Management", page: "class-management" }],
//         },
//         {
//           title: "Teacher Management",
//           description: "Monitor staff assignments.",
//           icon: <FaUsersCog />,
//           cards: [{ icon: <FaUsersCog />, title: "Teacher Management", page: "teacher-management" }],
//         },
//         {
//           title: "Timetable Management",
//           description: "Coordinate class times.",
//           icon: <FaClock />,
//           cards: [{ icon: <FaClock />, title: "Timetable Management", page: "timetable-management" }],
//         },
//       ],
//     },
//     {
//       title: "Finance",
//       description: "Handle results and revenue.",
//       icon: <FaChartBar />,
//       cards: [
//         { icon: <FaClipboardList />, title: "Results", page: "result-management" },
//         { icon: <FaMoneyCheckAlt />, title: "Fees", page: "fee-management" },
//       ],
//     },
//   ], []);

//   const currentSection = sections.find(s => s.title === activeTab);
//   const displayCards = currentSection?.subTabs 
//     ? currentSection.subTabs.find(st => st.title === activeSubTab)?.cards || []
//     : currentSection?.cards || [];

//   return (
//     <div className="flex min-h-screen bg-slate-50">
//       <Sidebar 
//         isOpen={sidebarOpen} setIsOpen={setSidebarOpen}
//         sections={sections} activeTab={activeTab} setActiveTab={setActiveTab}
//         activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab}
//         title="Admin Panel" role="admin"
//       />

//       <main className="flex-1 p-6 md:p-10">
//         <header className="flex h-16 items-center justify-between md:hidden mb-6">
//           <button onClick={() => setSidebarOpen(true)}><FaBars size={22} /></button>
//           <h1 className="font-bold uppercase tracking-widest">Admin Dashboard</h1>
//           <div className="w-6" />
//         </header>

//         <div className="mb-10">
//           <h1 className="text-3xl font-black text-slate-900 tracking-tight">{activeTab}</h1>
//           <p className="text-slate-500">{activeSubTab ? `Managing ${activeSubTab}` : currentSection?.description}</p>
//         </div>

//         {/* Sub-tab selection row for Academic Management */}
//         {currentSection?.subTabs && (
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
//               {currentSection.subTabs.map((st) => (
//                 <button
//                   key={st.title}
//                   onClick={() => setActiveSubTab(st.title)}
//                   className={`p-6 rounded-2xl border-2 text-left transition-all ${
//                     activeSubTab === st.title ? "bg-white border-indigo-600 shadow-lg" : "bg-white border-slate-100"
//                   }`}
//                 >
//                   <div className={`mb-3 inline-block p-3 rounded-xl ${activeSubTab === st.title ? "text-indigo-600 bg-indigo-50" : "text-slate-500 bg-slate-50"}`}>
//                     {st.icon}
//                   </div>
//                   <h4 className="font-bold text-slate-900">{st.title}</h4>
//                 </button>
//               ))}
//             </div>
//         )}

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {displayCards.map((c) => (
//             <button 
//               key={c.title} 
//               onClick={() => navigate(`/admin/${c.page}`)} 
//               className="group bg-white p-8 rounded-3xl border border-slate-200 text-left hover:shadow-xl hover:border-indigo-400 transition-all"
//             >
//               <div className="mb-4 text-indigo-600 group-hover:scale-110 transition-transform">
//                 {React.cloneElement(c.icon, { size: 40 })}
//               </div>
//               <h5 className="font-bold text-slate-900">{c.title}</h5>
//             </button>
//           ))}
//         </div>
//       </main>
//     </div>
//   );
// }
import React from "react";
import { FaUsers, FaChalkboardTeacher, FaUserGraduate, FaBook } from "react-icons/fa";

export default function AdminDashboardPage() {
  // Static Analytics Data
  const stats = [
    { label: "Total Students", value: "1,250", icon: <FaUserGraduate />, color: "bg-blue-500" },
    { label: "Total Teachers", value: "84", icon: <FaChalkboardTeacher />, color: "bg-indigo-500" },
    { label: "Active Classes", value: "42", icon: <FaBook />, color: "bg-emerald-500" },
    { label: "Total Admin Staff", value: "12", icon: <FaUsers />, color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Overview</h1>
        <p className="text-slate-500 text-lg">Welcome back! Here is what's happening in your school today.</p>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
            <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
              {React.cloneElement(stat.icon, { size: 24 })}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity / Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 h-64 flex items-center justify-center italic text-slate-400">
          [ Recent Registration Trends Chart ]
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 h-64 flex items-center justify-center italic text-slate-400">
          [ Financial Summary Chart ]
        </div>
      </div>
    </div>
  );
}