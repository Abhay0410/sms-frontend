// pages/parent/ViewChildAttendance.jsx
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../services/api";
import BackButton from "../../components/BackButton";
import OptimizedImage from "../../components/OptimizedImage";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChartPie,
  FaFilter,
  FaChild,
} from "react-icons/fa";

const API_URL =
  import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

export default function ViewChildAttendance() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadChildren = async () => {
    try {
      const resp = await api.get(API_ENDPOINTS.PARENT.AUTH.PROFILE);
      const parent = resp?.parent || resp?.data?.parent || {};
      const childrenData = parent.children || [];

      setChildren(childrenData);
      
      localStorage.setItem("schoolId", parent.schoolId);

      if (childrenData.length > 0) {
        setSelectedChild(childrenData[0]);
      } else {
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.message || "Failed to load children");
      setLoading(false);
    }
  };

  const loadAttendance = useCallback(
    async () => {
      if (!selectedChild) return;

      try {
        setLoading(true);

        let url = API_ENDPOINTS.PARENT.ATTENDANCE.CHILD(selectedChild._id);
        const params = new URLSearchParams();

        if (filterType === "month") {
          params.append("month", month);
          params.append("year", year);
        } else if (filterType === "range" && startDate && endDate) {
          params.append("startDate", startDate);
          params.append("endDate", endDate);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const resp = await api.get(url);
        const raw = resp?.data || resp;
        const data = raw.data || raw; // successResponse({ data })

        console.log("✅ Parent attendance data:", data);

        setStats({
          totalDays: data.summary?.totalClasses || 0,
          totalPresent: data.summary?.totalPresent || 0,
          totalAbsent: data.summary?.totalAbsent || 0,
          totalLate: 0,
          attendancePercentage: data.summary?.attendancePercentage || 0,
        });

        setAttendance(data.records || []);
      } catch (error) {
        console.error("❌ Parent attendance error:", error);
        toast.error(error.message || "Failed to load attendance");
        setStats(null);
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    },
    [selectedChild, filterType, month, year, startDate, endDate]
  );

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadAttendance();
    }
  }, [selectedChild, filterType, month, year, startDate, endDate, loadAttendance]);

  const handleRangeFilter = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    loadAttendance();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-50 border-green-300 text-green-800";
      case "ABSENT":
        return "bg-red-50 border-red-300 text-red-800";
      case "LATE":
        return "bg-yellow-50 border-yellow-300 text-yellow-800";
      default:
        return "bg-gray-50 border-gray-300 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PRESENT":
        return <FaCheckCircle className="text-green-600" />;
      case "ABSENT":
        return <FaTimesCircle className="text-red-600" />;
      case "LATE":
        return <FaClock className="text-yellow-600" />;
      default:
        return null;
    }
  };

const schoolId =
  selectedChild?.schoolId || localStorage.getItem("schoolId");

const childPhotoUrl = selectedChild?.profilePicture
  ? selectedChild.profilePicture.startsWith("http")
    ? selectedChild.profilePicture
    : `${API_URL}/uploads/${schoolId}/students/${selectedChild.profilePicture}?t=${Date.now()}`
  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
      selectedChild?.name || "Student"
    )}`;

  

  if (loading && children.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-slate-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <BackButton to="/parent/parent-dashboard" />
          <div className="mt-12 text-center py-16 rounded-2xl bg-white shadow-lg border border-slate-100">
            <FaChild className="h-20 w-20 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900">No Children Found</h3>
            <p className="mt-3 text-slate-600">
              No student records are linked to your account
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <BackButton to="/parent/parent-dashboard" />

        {/* Header */}
        <div className="mt-6">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
            Child&apos;s Attendance
          </h2>
          <p className="mt-2 text-slate-600 flex items-center gap-2">
            <FaCalendarAlt className="text-green-600" />
            Track your child&apos;s attendance records
          </p>
        </div>

        {/* Child Selector */}
        {children.length > 1 && (
          <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
            {children.map((child) => (
              <button
                key={child._id}
                onClick={() => setSelectedChild(child)}
                className={`flex-shrink-0 rounded-xl px-6 py-3 font-semibold transition-all ${
                  selectedChild?._id === child._id
                    ? "bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg scale-105"
                    : "bg-white text-slate-700 border-2 border-slate-200 hover:border-green-300"
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        )}

        {/* Selected Child Info */}
        {selectedChild && (
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={childPhotoUrl}
                  alt={selectedChild.name}
                  className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-xl"
                  width={80}
                  height={80}
                />
                <div>
                  <h3 className="text-2xl font-bold">{selectedChild.name}</h3>
                  <p className="text-green-100 font-medium">
                    {selectedChild.studentID}
                  </p>
                  <p className="text-green-100">
                    Class {selectedChild.className} - Section{" "}
                    {selectedChild.section}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100">
              <div className="flex items-center gap-3">
                <FaCalendarAlt className="h-8 w-8 text-slate-600" />
                <div>
                  <p className="text-sm text-slate-600">Total Days</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats.totalDays}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-green-50 p-6 shadow-md border border-green-200">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-700">Present</p>
                  <p className="text-3xl font-bold text-green-900">
                    {stats.totalPresent}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-red-50 p-6 shadow-md border border-red-200">
              <div className="flex items-center gap-3">
                <FaTimesCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-red-700">Absent</p>
                  <p className="text-3xl font-bold text-red-900">
                    {stats.totalAbsent}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-yellow-50 p-6 shadow-md border border-yellow-200">
              <div className="flex items-center gap-3">
                <FaClock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-yellow-700">Late</p>
                  <p className="text-3xl font-bold text-yellow-900">
                    {stats.totalLate}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50 p-6 shadow-md border border-blue-200">
              <div className="flex items-center gap-3">
                <FaChartPie className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-700">Percentage</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {stats.attendancePercentage}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-green-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Filter Attendance
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Filter By
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 font-medium focus:border-green-600 focus:outline-none"
              >
                <option value="all">All Records</option>
                <option value="month">By Month</option>
                <option value="range">Date Range</option>
              </select>
            </div>

            {filterType === "month" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Month
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 font-medium focus:border-green-600 focus:outline-none"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2000, i).toLocaleString("default", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 font-medium focus:border-green-600 focus:outline-none"
                  >
                    {[2023, 2024, 2025, 2026].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {filterType === "range" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 font-medium focus:border-green-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 font-medium focus:border-green-600 focus:outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleRangeFilter}
                    className="w-full rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
                  >
                    Apply
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Attendance Records */}
        <div className="mt-8 rounded-2xl bg-white shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-900">
              Attendance Records ({attendance.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading attendance...</p>
            </div>
          ) : attendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">
                      Date
                    </th>
                    <th className="p-4 text-center text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">
                      Remarks
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">
                      Marked By
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-slate-400" />
                          <span className="font-semibold text-slate-900">
                            {new Date(record.date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-sm text-slate-600">
                            (
                            {new Date(record.date).toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                            )
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-bold ${getStatusColor(
                              record.status
                            )}`}
                          >
                            {getStatusIcon(record.status)}
                            {record.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-600">
                          {record.remarks || "-"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-700">
                          {record.markedBy?.name || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <FaCalendarAlt className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-xl font-semibold text-slate-600">
                No attendance records found
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
