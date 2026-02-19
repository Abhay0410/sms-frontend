// pages/teacher/Teacher_Features/ViewMySchedule.jsx - UPDATED
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../services/api";
import BackButton from "../../../components/BackButton";
import {
  FaClock,
  FaBook,
  FaChalkboardTeacher,
  FaCalendarWeek,
  FaUsers,
} from "react-icons/fa";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ViewMySchedule() {
  const [scheduleData, setScheduleData] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState("2025-2026"); // ✅ FIXED: Use correct format

const loadMySchedule = useCallback(async () => {
  try {
    setLoading(true);
    // ✅ Use the specific MY_SCHEDULE endpoint
    const resp = await api.get(API_ENDPOINTS.TEACHER.TIMETABLE.MY_SCHEDULE, {
      params: { academicYear }
    });
    
    const responseData = resp.data || resp;
    const actualData = responseData.data || responseData;
    
    setTeacher(actualData.teacher);
    setScheduleData(actualData.schedule);
      
      if (actualData.hasAssignments === false) {
        toast.info("No classes assigned for this academic year");
      } else if (!actualData.schedule || Object.keys(actualData.schedule).length === 0) {
        toast.info("Schedule is empty for the selected academic year");
      } else {
        const totalClasses = Object.values(actualData.schedule || {}).reduce(
          (total, daySchedule) => total + (daySchedule?.length || 0), 0
        );
        toast.success(`Loaded schedule with ${totalClasses} classes`);
      }
    } catch (error) {
      console.error("❌ Failed to load schedule:", error);
      console.error("❌ Error details:", error.response?.data || error.message);
      toast.error(error.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }, [academicYear]);

  useEffect(() => {
    loadMySchedule();
  }, [loadMySchedule]);

  // ✅ FIXED: Academic year options that match your database format
  const academicYearOptions = [
    "2023-2024",
    "2024-2025", 
    "2025-2026",
    "2026-2027"
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-slate-700">Loading schedule...</p>
        </div>
      </div>
    );
  }

  // Calculate total classes for display
  const totalClasses = scheduleData ? 
    Object.values(scheduleData).reduce((total, daySchedule) => total + (daySchedule?.length || 0), 0) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <BackButton to="/teacher/teacher-dashboard" />

        {/* Header */}
        <div className="mt-6">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">My Teaching Schedule</h2>
          <p className="mt-2 text-slate-600 flex items-center gap-2">
            <FaCalendarWeek className="text-purple-600" />
            View your weekly teaching schedule
          </p>
        </div>

        {/* Academic Year Filter - UPDATED */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-slate-700">Academic Year:</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="rounded-xl border-2 border-slate-200 bg-white p-2 font-medium focus:border-purple-600 focus:outline-none"
              >
                {academicYearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={loadMySchedule}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Refresh Schedule
            </button>
            
            {teacher && (
              <div className="ml-auto text-sm text-slate-600">
                <span className="font-medium">Teacher:</span> {teacher.name} ({teacher.teacherID})
              </div>
            )}
          </div>
        </div>

        {/* Teacher Info */}
        {teacher && (
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-2xl font-bold">{teacher.name}</h3>
                <p className="text-purple-100 font-medium">{teacher.teacherID}</p>
                <p className="text-purple-100">Teaching Schedule • {academicYear}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
                  <FaChalkboardTeacher className="h-6 w-6" />
                  <div>
                    <p className="text-xs text-purple-100">Weekly Classes</p>
                    <p className="font-bold text-lg">{totalClasses}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
                  <FaCalendarWeek className="h-6 w-6" />
                  <div>
                    <p className="text-xs text-purple-100">Academic Year</p>
                    <p className="font-bold">{academicYear}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Table */}
        {scheduleData && totalClasses > 0 ? (
          <div className="mt-8 rounded-2xl bg-white shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-purple-50">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FaClock className="text-purple-600" />
                  Weekly Teaching Schedule
                </h3>
                <div className="text-sm text-slate-600 bg-white px-3 py-1 rounded-full border">
                  {totalClasses} classes across {Object.keys(scheduleData).filter(day => scheduleData[day]?.length > 0).length} days
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700 min-w-[120px]">
                      Day
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">
                      Classes & Periods
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => {
                    const daySchedule = scheduleData[day] || [];
                    const hasClasses = daySchedule.length > 0;

                    return (
                      <tr key={day} className={`border-b border-slate-100 ${hasClasses ? 'hover:bg-slate-50' : ''}`}>
                        <td className="p-4 font-bold text-slate-900 bg-slate-50 align-top">
                          <div className="flex items-center gap-2">
                            <span>{day}</span>
                            {hasClasses && (
                              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-purple-600 rounded-full">
                                {daySchedule.length}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {hasClasses ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {daySchedule.map((period, idx) => (
                                <div
                                  key={idx}
                                  className="rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 p-4 border border-purple-200 hover:shadow-md transition-shadow group"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <FaUsers className="h-4 w-4 text-purple-600" />
                                    <p className="font-bold text-purple-900 group-hover:text-purple-700">
                                      {period.className} - {period.section}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <FaBook className="h-3 w-3 text-purple-600" />
                                    <p className="text-sm text-purple-700 font-medium">{period.subject}</p>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-purple-600">
                                    <FaClock className="h-3 w-3" />
                                    <span className="font-medium">Period {period.periodNumber}</span>
                                    <span>•</span>
                                    <span>
                                      {period.startTime} - {period.endTime}
                                    </span>
                                  </div>
                                  {period.role && (
                                    <div className="mt-2">
                                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                        period.role === 'Class Teacher' 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-blue-100 text-blue-800'
                                      }`}>
                                        {period.role}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-slate-400">
                              <FaCalendarWeek className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>No classes scheduled</p>
                              <p className="text-xs mt-1">Enjoy your free time!</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-12 text-center py-16 rounded-2xl bg-white shadow-lg border border-slate-100">
            <FaCalendarWeek className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-xl font-semibold text-slate-600">No schedule available</p>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              {teacher 
                ? `No teaching schedule found for ${teacher.name} in academic year ${academicYear}. Please contact administration.`
                : 'Your teaching schedule has not been created yet'
              }
            </p>
            <button 
              onClick={loadMySchedule}
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}