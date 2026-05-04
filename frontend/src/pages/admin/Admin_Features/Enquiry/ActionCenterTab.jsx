import React, { useState, useEffect } from "react";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import { format } from "date-fns";
import {
  FaTasks,
  FaExclamationTriangle,
  FaCalendarDay,
  FaPhoneAlt,
  FaArrowRight,
} from "react-icons/fa";
import { toast } from "react-toastify";
import LogFollowUpModal from "./LogFollowUpModal";

export default function ActionCenterTab() {
  const [tasks, setTasks] = useState({ overdue: [], today: [] });
  const [loading, setLoading] = useState(true);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState(null);

  useEffect(() => {
    fetchDashboardTasks();
  }, []);

  const fetchDashboardTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN.ENQUIRY.DASHBOARD);
      const dData = response?.data || response || {};
      setTasks({
        overdue: dData.tasks?.overdue || [],
        today: dData.tasks?.today || [],
      });
    } catch (err) {
      console.error("Failed to fetch action center tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (message) => {
    toast.success(message);
    fetchDashboardTasks(); // Refresh tasks automatically
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* UX Explainer Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FaTasks className="text-indigo-500" /> My Daily Action Plan
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          This dashboard automatically tracks leads that require follow-up calls or interactions today, based on the <span className="font-semibold text-slate-700">Next Action Date</span> you set. Overdue items should be prioritized.
        </p>
      </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* OVERDUE TASKS */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-red-100 flex flex-col overflow-hidden">
        <div className="bg-slate-800 p-4 border-b  flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-700">
            <FaExclamationTriangle size={18} />
            <h3 className="font-bold text-lg text-white">Overdue Follow-ups</h3>
          </div>
          <span className="bg-red-200 text-black px-3 py-1 rounded-full text-xs font-bold">
            {tasks.overdue.length} Action{tasks.overdue.length !== 1 && "s"}
          </span>
        </div>

        <div className="p-4 flex-1 overflow-y-auto max-h-[500px] space-y-3 bg-red-50/30">
          {tasks.overdue.length === 0 ? (
            <div className="text-center py-10 text-slate-400 flex flex-col items-center">
              <FaTasks size={32} className="mb-2 opacity-50" />
              <p className="text-sm">Great job! No overdue tasks.</p>
            </div>
          ) : (
            tasks.overdue.map((task) => (
              <TaskCard key={task._id} task={task} isOverdue={true} onLogInteraction={() => setSelectedEnquiryId(task._id)} />
            ))
          )}
        </div>
      </div>

      {/* TODAY's TASKS */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-indigo-100 flex flex-col overflow-hidden">
        <div className="bg-slate-800 p-4 border-b border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <FaCalendarDay size={18} />
            <h3 className="font-bold text-lg">Today's Tasks</h3>
          </div>
          <span className="bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold">
            {tasks.today.length} Action{tasks.today.length !== 1 && "s"}
          </span>
        </div>

        <div className="p-4 flex-1 overflow-y-auto max-h-[500px] space-y-3 bg-indigo-50/30">
          {tasks.today.length === 0 ? (
            <div className="text-center py-10 text-slate-400 flex flex-col items-center">
              <FaTasks size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No follow-ups scheduled for today.</p>
            </div>
          ) : (
            tasks.today.map((task) => (
              <TaskCard key={task._id} task={task} isOverdue={false} onLogInteraction={() => setSelectedEnquiryId(task._id)} />
            ))
          )}
        </div>
      </div>

      <LogFollowUpModal
        isOpen={!!selectedEnquiryId}
        onClose={() => setSelectedEnquiryId(null)}
        enquiryId={selectedEnquiryId}
        onSuccess={handleSuccess}
      />
    </div>
    </div>
  );
}

const TaskCard = ({ task, isOverdue, onLogInteraction }) => {
  return (
    <div className={`bg-white p-4 rounded-xl shadow-sm border ${isOverdue ? 'border-red-200 hover:border-red-300' : 'border-indigo-100 hover:border-indigo-300'} transition-all group`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-slate-800">{task.studentName}</h4>
          <p className="text-xs text-slate-500 mt-0.5">Parent: {task.parentName}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
          Class: {(
            task.targetClassDetails?.[0]?.className || 
            (Array.isArray(task.targetClass) ? task.targetClass[0]?.className : null) || 
            (typeof task.targetClass === 'object' && task.targetClass !== null ? task.targetClass?.className : (typeof task.targetClass === 'string' && !/^[0-9a-fA-F]{24}$/.test(task.targetClass) ? task.targetClass : "N/A"))
          )?.replace(/^Class\s/i, '')}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <FaPhoneAlt className={isOverdue ? 'text-red-400' : 'text-indigo-400'} size={12} />
          {task.primaryPhone}
        </div>
        <div className="text-xs text-slate-400">
          Due: {task.nextActionDate ? format(new Date(task.nextActionDate), "MMM dd") : "Unknown"}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
        <button
          onClick={onLogInteraction}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
            isOverdue ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
          }`}
        >
          Log Interaction <FaArrowRight size={10} />
        </button>
      </div>
    </div>
  );
};