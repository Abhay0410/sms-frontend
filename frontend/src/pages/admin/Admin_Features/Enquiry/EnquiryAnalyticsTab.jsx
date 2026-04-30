import React, { useState, useEffect } from "react";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import {
  FaUsers,
  FaUserPlus,
  FaWalking,
  FaCheckCircle,
  FaPercent,
  FaExclamationCircle,
} from "react-icons/fa";

export default function EnquiryAnalyticsTab() {
  const [analytics, setAnalytics] = useState(null);
  const [pipeline, setPipeline] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, dashboardRes] = await Promise.all([
        api.get(API_ENDPOINTS.ADMIN.ENQUIRY.ANALYTICS),
        api.get(API_ENDPOINTS.ADMIN.ENQUIRY.DASHBOARD),
      ]);

      // Accommodate variations in API response structures (e.g., standard object vs axios wrapper)
      const aData = analyticsRes?.data || analyticsRes || {};
      const dData = dashboardRes?.data || dashboardRes || {};

      setAnalytics(aData);

      // Map backend grouped pipeline: [{ _id: 'NEW', leads: [...] }] to { 'NEW': [...] }
      let formattedPipeline = {};
      if (Array.isArray(dData.pipeline)) {
        dData.pipeline.forEach(group => {
          formattedPipeline[group._id] = group.leads || [];
        });
      }
      setPipeline(formattedPipeline);
    } catch (err) {
      console.error("Failed to fetch enquiry analytics", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fallback statistical mappings
  const stats = {
    total: analytics?.funnel?.totalLeads ?? 0,
    new: pipeline['NEW']?.length ?? 0, // Derive from active pipeline
    visited: analytics?.funnel?.VISITED ?? analytics?.visited ?? 0,
    converted: analytics?.funnel?.admitted ?? 0,
    rate: analytics?.conversionRate ?? "0%",
  };

  // Kanban Columns Definition
  const KANBAN_COLUMNS = [
    { id: "NEW", title: "New Leads", color: "border-blue-400", bg: "bg-blue-50/50", header: "bg-blue-100/50 text-blue-800" },
    { id: "PENDING", title: "Pending", color: "border-yellow-400", bg: "bg-yellow-50/50", header: "bg-yellow-100/50 text-yellow-800" },
    { id: "FOLLOWED_UP", title: "Followed Up", color: "border-indigo-400", bg: "bg-indigo-50/50", header: "bg-indigo-100/50 text-indigo-800" },
    { id: "VISITED", title: "Visited", color: "border-purple-400", bg: "bg-purple-50/50", header: "bg-purple-100/50 text-purple-800" },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HOT":
        return "bg-red-100 text-red-700";
      case "WARM":
        return "bg-orange-100 text-orange-700";
      case "COLD":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-8 rounded-2xl flex flex-col items-center justify-center text-center border border-red-100">
        <FaExclamationCircle size={36} className="mb-3 text-red-400" />
        <p className="font-semibold">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-medium transition-colors"
        >
          Retry Data Fetch
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* --- TOP STAT CARDS --- */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Leads" value={stats.total} icon={FaUsers} colorClass="bg-blue-100 text-blue-600" />
        <StatCard title="New Leads" value={stats.new} icon={FaUserPlus} colorClass="bg-yellow-100 text-yellow-600" />
        <StatCard title="Visited" value={stats.visited} icon={FaWalking} colorClass="bg-purple-100 text-purple-600" />
        <StatCard title="Converted" value={stats.converted} icon={FaCheckCircle} colorClass="bg-green-100 text-green-600" />
        <StatCard title="Conversion Rate" value={stats.rate} icon={FaPercent} colorClass="bg-indigo-100 text-indigo-600" />
      </div>

      {/* --- KANBAN PIPELINE BOARD --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Active Pipeline</h3>
            <p className="text-sm text-slate-500">Track and manage leads through the admission stages.</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Refresh Board
          </button>
        </div>

        <div className="flex overflow-x-auto pb-4 gap-6 min-h-[400px]">
          {KANBAN_COLUMNS.map((col) => (
            <div key={col.id} className={`flex-none w-80 rounded-2xl border ${col.color} ${col.bg} flex flex-col`}>
              <div className={`px-4 py-3 rounded-t-2xl font-bold text-sm ${col.header} flex justify-between items-center`}>
                {col.title}
                <span className="bg-white/60 px-2 py-0.5 rounded-full text-xs">
                  {pipeline[col.id]?.length || 0}
                </span>
              </div>
              
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {!pipeline[col.id] || pipeline[col.id].length === 0 ? (
                  <div className="text-center text-slate-400 text-xs mt-10 italic">No leads in this stage</div>
                ) : (
                  pipeline[col.id].map((lead) => (
                    <div
                      key={lead._id || lead.id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-sm text-slate-800 line-clamp-1">
                          {lead.studentName}
                        </h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide ${getPriorityColor(lead.priority)}`}>
                          {lead.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2 truncate">
                        {lead.parentName} • {lead.primaryPhone}
                      </p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                        <span className="bg-indigo-50 px-2 py-1 rounded-md text-indigo-700 font-bold">
                          Class: {(
                            lead.targetClassDetails?.[0]?.className || 
                            (Array.isArray(lead.targetClass) ? lead.targetClass[0]?.className : null) || 
                            (typeof lead.targetClass === 'object' && lead.targetClass !== null ? lead.targetClass?.className : (typeof lead.targetClass === 'string' && !/^[0-9a-fA-F]{24}$/.test(lead.targetClass) ? lead.targetClass : "N/A"))
                          )?.replace(/^Class\s/i, '')}
                        </span>
                        <span>{lead.source?.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{title}</p>
      <p className="text-2xl font-black text-slate-800">{value}</p>
    </div>
  </div>
);