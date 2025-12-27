// pages/student/ViewAttendance.jsx
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../services/api";
import BackButton from "../../components/BackButton";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChartPie,
  FaFilter,
  FaUserGraduate,
  FaPercentage,
} from "react-icons/fa";

export default function ViewAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all"); // all, month, range
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadAttendance = useCallback(async () => {
    try {
      setLoading(true);

      let url = API_ENDPOINTS.STUDENT.ATTENDANCE.MY_ATTENDANCE;
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
      const data = raw.data || raw; // because backend uses successResponse({ data })

      console.log("✅ Attendance data received:", data);

      // Abhi backend { records, summary } bhej raha hai
      setStudent(null); // future me agar student info bhejna ho to yahan map kar lena

      setStats({
        totalDays: data.summary?.totalClasses || 0,
        totalPresent: data.summary?.totalPresent || 0,
        totalAbsent: data.summary?.totalAbsent || 0,
        totalLate: 0, // abhi LATE calculate nahi kiya
        attendancePercentage: data.summary?.attendancePercentage || 0,
      });

      setAttendance(data.records || []);
    } catch (error) {
      console.error("❌ Error loading attendance:", error);
      toast.error(error.message || "Failed to load attendance");
      setStats(null);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, month, year, startDate, endDate]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

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
        return "bg-green-100 text-green-800 border-green-200";
      case "ABSENT":
        return "bg-red-100 text-red-800 border-red-200";
      case "LATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PRESENT":
        return <FaCheckCircle className="text-green-500" />;
      case "ABSENT":
        return <FaTimesCircle className="text-red-500" />;
      case "LATE":
        return <FaClock className="text-yellow-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDayName = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", { weekday: "long" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-slate-700">
            Loading attendance records...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <BackButton to="/student/student-dashboard" />

        {/* Header Section */}
        <div className="mt-6">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
            My Attendance
          </h2>
          <p className="mt-2 text-slate-600 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-600" />
            Track your attendance records and statistics
          </p>
        </div>

        {/* Student Info Card (future use) */}
        {student && (
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-white">
                <h3 className="text-2xl font-bold">{student.name}</h3>
                <p className="text-blue-100 font-medium">{student.studentID}</p>
                <p className="text-blue-100">
                  Class {student.className} - {student.section}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <FaUserGraduate className="text-white" />
                <span className="text-white font-bold">Student</span>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Overall Percentage */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Attendance
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {stats.attendancePercentage}%
                  </p>
                </div>
                <div className="rounded-xl bg-blue-100 p-3">
                  <FaPercentage className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.attendancePercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Present Days */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Present</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {stats.totalPresent}
                  </p>
                </div>
                <div className="rounded-xl bg-green-100 p-3">
                  <FaCheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {stats.totalDays > 0
                  ? Math.round((stats.totalPresent / stats.totalDays) * 100)
                  : 0}
                % of total
              </p>
            </div>

            {/* Absent Days */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Absent</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {stats.totalAbsent}
                  </p>
                </div>
                <div className="rounded-xl bg-red-100 p-3">
                  <FaTimesCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {stats.totalDays > 0
                  ? Math.round((stats.totalAbsent / stats.totalDays) * 100)
                  : 0}
                % of total
              </p>
            </div>

            {/* Late Days */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Late</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">
                    {stats.totalLate}
                  </p>
                </div>
                <div className="rounded-xl bg-yellow-100 p-3">
                  <FaClock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {stats.totalDays > 0
                  ? Math.round((stats.totalLate / stats.totalDays) * 100)
                  : 0}
                % of total
              </p>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FaFilter className="text-blue-600" />
            Filter Attendance
          </h3>

          <div className="flex flex-wrap gap-4 items-end">
            {/* Filter Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter By
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-xl border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              >
                <option value="all">All Records</option>
                <option value="month">By Month</option>
                <option value="range">Date Range</option>
              </select>
            </div>

            {/* Month Filter */}
            {filterType === "month" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Month
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="rounded-xl border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2000, i).toLocaleString("default", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="rounded-xl border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const yearOption = new Date().getFullYear() - 2 + i;
                      return (
                        <option key={yearOption} value={yearOption}>
                          {yearOption}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </>
            )}

            {/* Date Range Filter */}
            {filterType === "range" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-xl border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-xl border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
                <button
                  onClick={handleRangeFilter}
                  className="rounded-xl bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700 transition"
                >
                  Apply Range
                </button>
              </>
            )}
          </div>
        </div>

        {/* Attendance Records */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FaChartPie className="text-blue-600" />
              Attendance Records
            </h3>
            <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {attendance.length} records found
            </span>
          </div>

          {attendance.length === 0 ? (
            <div className="text-center py-12">
              <FaCalendarAlt className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-slate-900">
                No Attendance Records
              </h4>
              <p className="text-slate-600 mt-2">
                No attendance records found for the selected period.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {attendance.map((record, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl border-2 ${getStatusColor(
                        record.status
                      )}`}
                    >
                      {getStatusIcon(record.status)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {formatDate(record.date)}
                      </p>
                      <p className="text-sm text-slate-600">
                        {getDayName(record.date)}
                      </p>
                      {record.period && (
                        <p className="text-xs text-slate-500 mt-1">
                          Period: {record.period}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        record.status
                      )}`}
                    >
                      {getStatusIcon(record.status)}
                      {record.status}
                    </span>
                    {record.remarks && (
                      <p className="text-xs text-slate-600 mt-1 max-w-xs">
                        {record.remarks}
                      </p>
                    )}
                    {record.markedBy && (
                      <p className="text-xs text-slate-500 mt-1">
                        By: {record.markedBy.name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Section */}
        {stats && attendance.length > 0 && (
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border border-blue-200">
            <h4 className="text-lg font-bold text-slate-900 mb-4">
              Quick Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalDays}
                </p>
                <p className="text-sm text-slate-600">Total Days</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalPresent}
                </p>
                <p className="text-sm text-slate-600">Present Days</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-2xl font-bold text-red-600">
                  {stats.totalAbsent + stats.totalLate}
                </p>
                <p className="text-sm text-slate-600">Missed Days</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
