import React, { useEffect, useState, useMemo, useCallback } from "react";
import { FaUsers, FaChalkboardTeacher, FaUserGraduate, FaBook, FaSync, FaArrowRight , FaPlus, FaWallet, FaChartPie } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, } from 'recharts';
import api from "../../services/api";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import { toast } from "react-toastify";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    studentCount: 0,
    teacherCount: 0,
    classCount: 0,
    totalCapacity: 0,
    classDistribution: [],
    loading: true
  });

  const currentYear = useMemo(() => {
    const now = new Date();
    return now.getMonth() >= 3 ? `${now.getFullYear()}-${now.getFullYear() + 1}` : `${now.getFullYear() - 1}-${now.getFullYear()}`;
  }, []);

  const fetchRealStats = useCallback(async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      
      const [studentResp, teacherResp, classResp] = await Promise.all([
        api.get(`${API_ENDPOINTS.ADMIN.STUDENT.LIST}?academicYear=${currentYear}`),
        api.get(API_ENDPOINTS.ADMIN.TEACHER.LIST),
        api.get(`${API_ENDPOINTS.ADMIN.CLASS.LIST}?academicYear=${currentYear}`)
      ]);

      // ✅ FIX: Extracting counts based on your backend response structures
      const studentList = studentResp?.data?.students || studentResp?.students || [];
      const teacherList = teacherResp?.data?.teachers || teacherResp?.teachers || [];
      const classList = classResp?.data?.classes || classResp?.data || classResp || [];

      // Calculate capacity and distribution
      const totalCap = classList.reduce((acc, cls) => acc + (cls.sections?.reduce((s, sec) => s + (sec.capacity || 0), 0) || 0), 0);
      const distribution = classList.slice(0, 6).map(cls => ({
        name: cls.className,
        students: cls.sections?.reduce((s, sec) => s + (sec.currentStrength || 0), 0) || 0
      }));

      setStats({
        studentCount: studentList.length,
        teacherCount: teacherList.length,
        classCount: classList.length,
        totalCapacity: totalCap,
        classDistribution: distribution,
        loading: false
      });
    } catch  {
      toast.error("Failed to sync live data");
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, [currentYear]);

  useEffect(() => { fetchRealStats(); }, [fetchRealStats]);

  const cards = [
    { label: "Students", value: stats.studentCount, icon: <FaUserGraduate />, color: "bg-blue-600", sub: "Active Enrollment" },
    { label: "Teachers", value: stats.teacherCount, icon: <FaChalkboardTeacher />, color: "bg-indigo-600", sub: "Faculty Registry" },
    { label: "Classes", value: stats.classCount, icon: <FaBook />, color: "bg-emerald-600", sub: "Managed Grades" },
    { label: "Capacity", value: `${((stats.studentCount / (stats.totalCapacity || 1)) * 100).toFixed(1)}%`, icon: <FaChartPie />, color: "bg-orange-500", sub: "Campus Usage" },
  ];

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (stats.loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
      <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Compiling Analytics...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Dynamic Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">School Insights</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Academic Session {currentYear}</p>
        </div>
        <button onClick={fetchRealStats} className="p-4 bg-slate-50 rounded-2xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all active:scale-95 shadow-inner">
          <FaSync size={18} />
        </button>
      </div>

      {/* Modern Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-200/30 group hover:bg-slate-900 transition-all duration-500">
            <div className={`${card.color} h-14 w-14 rounded-2xl text-white flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
            <h3 className="text-4xl font-black text-slate-900 group-hover:text-white transition-colors">{card.value}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 group-hover:text-slate-500">{card.label}</p>
            <div className="mt-4 pt-4 border-t border-slate-50 group-hover:border-white/10">
               <span className="text-[10px] font-bold text-slate-400 uppercase">{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enrollment Bar Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-50">
          <div className="flex items-center justify-between mb-10">
             <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Grade Distribution</h3>
             <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full uppercase">Real-time</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.classDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="students" fill="#4F46E5" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl"></div>
          <h3 className="text-xl font-black text-white mb-8 uppercase tracking-widest">Operations</h3>
          <div className="space-y-4">
             <QuickActionBtn icon={<FaPlus/>} label="Register Student" color="bg-blue-500" />
             <QuickActionBtn icon={<FaBook/>} label="Add Curriculum" color="bg-emerald-500" />
             <QuickActionBtn icon={<FaWallet/>} label="Verify Fees" color="bg-rose-500" />
             <div className="mt-10 p-6 bg-white/5 rounded-[2rem] border border-white/10">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-2">System Status</p>
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
                   <span className="text-xs font-bold text-white">Cloud Sync Active</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionBtn({icon, label, color}) {
    return (
        <button className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex items-center justify-between group transition-all">
            <div className="flex items-center gap-4">
                <div className={`${color} h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg`}>{icon}</div>
                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{label}</span>
            </div>
            <FaArrowRight className="text-slate-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
        </button>
    )
}