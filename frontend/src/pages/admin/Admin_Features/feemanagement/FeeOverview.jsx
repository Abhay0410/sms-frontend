// components/admin/fee/FeeOverview.jsx
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import {
  FaDollarSign,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaUsers,
} from "react-icons/fa";

export default function FeeOverview({ academicYear }) {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStatistics = useCallback(async () => {
  try {
    setLoading(true);

    const response = await api.get(API_ENDPOINTS.ADMIN.FEE.STATISTICS, {
      params: { academicYear },
    });

    console.log("RAW RESPONSE (intercepted):", response); // ab response.data

    const stats = response?.data || {}; // ← yahi sahi hai

    const statisticsData = {
      totalStudents: Number(stats.totalStudents || 0),
      totalExpected: Number(stats.totalExpected || 0),
      totalCollected: Number(stats.totalCollected || 0),
      totalPending: Number(stats.totalPending || 0),
      collectionPercentage: Number(stats.collectionPercentage || 0),
      paymentStatus: {
        completed: Number(stats.paymentStatus?.completed || 0),
        partial: Number(stats.paymentStatus?.partial || 0),
        pending: Number(stats.paymentStatus?.pending || 0),
        overdue: Number(stats.paymentStatus?.overdue || 0),
      },
    };

    console.log("STATISTICS FROM API:", statisticsData);
    setStatistics(statisticsData);
  } catch (error) {
    console.error("❌ Statistics error:", error);
    setStatistics({
      totalStudents: 0,
      totalExpected: 0,
      totalCollected: 0,
      totalPending: 0,
      collectionPercentage: 0,
      paymentStatus: {
        completed: 0,
        partial: 0,
        pending: 0,
        overdue: 0,
      },
    });
    toast.error("Statistics temporarily unavailable");
  } finally {
    setLoading(false);
  }
}, [academicYear]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600" />
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600">
          No data available for {academicYear}
        </p>
      </div>
    );
  }

  const collectionPercentage = Number(statistics.collectionPercentage || 0);

  return (
    <div className="space-y-8">
      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <FaUsers className="h-8 w-8 text-purple-600" />
            <p className="text-sm text-slate-600">Total Students</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {statistics.totalStudents}
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 p-6 shadow-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <FaDollarSign className="h-8 w-8 text-blue-600" />
            <p className="text-sm text-blue-700">Total Expected</p>
          </div>
          <p className="text-3xl font-bold text-blue-900">
            ₹{Number(statistics.totalExpected || 0).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="rounded-2xl bg-green-50 p-6 shadow-lg border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <FaCheckCircle className="h-8 w-8 text-green-600" />
            <p className="text-sm text-green-700">Total Collected</p>
          </div>
          <p className="text-3xl font-bold text-green-900">
            ₹{Number(statistics.totalCollected || 0).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="rounded-2xl bg-red-50 p-6 shadow-lg border border-red-200">
          <div className="flex items-center gap-3 mb-2">
            <FaExclamationCircle className="h-8 w-8 text-red-600" />
            <p className="text-sm text-red-700">Total Pending</p>
          </div>
          <p className="text-3xl font-bold text-red-900">
            ₹{Number(statistics.totalPending || 0).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Collection progress */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">
            Fee Collection Progress
          </h3>
          <span className="text-3xl font-bold text-purple-600">
            {collectionPercentage}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-6 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(collectionPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <FaCheckCircle className="h-8 w-8 text-green-600" />
            <p className="text-sm text-slate-600">Completed</p>
          </div>
          <p className="text-3xl font-bold text-green-900">
            {statistics.paymentStatus.completed}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Students fully paid
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <FaClock className="h-8 w-8 text-yellow-600" />
            <p className="text-sm text-slate-600">Partial</p>
          </div>
          <p className="text-3xl font-bold text-yellow-900">
            {statistics.paymentStatus.partial}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Students with some dues
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <FaExclamationCircle className="h-8 w-8 text-orange-600" />
            <p className="text-sm text-slate-600">Pending</p>
          </div>
          <p className="text-3xl font-bold text-orange-900">
            {statistics.paymentStatus.pending}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Students yet to start
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <FaExclamationCircle className="h-8 w-8 text-red-600" />
            <p className="text-sm text-slate-600">Overdue</p>
          </div>
          <p className="text-3xl font-bold text-red-900">
            {statistics.paymentStatus.overdue}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Students past due date
          </p>
        </div>
      </div>
    </div>
  );
}
