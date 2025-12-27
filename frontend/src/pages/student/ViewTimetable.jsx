// pages/student/ViewTimetable.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../services/api";
import BackButton from "../../components/BackButton";
import {
  FaClock,
  FaCalendarWeek,
  FaChalkboardTeacher,
  FaUtensils,
  FaCoffee,
} from "react-icons/fa";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ViewTimetable() {
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const resp = await api.get(API_ENDPOINTS.STUDENT.TIMETABLE.MY_TIMETABLE);
      const raw = resp?.data || resp;
      const data = raw.data || raw;

      console.log("✅ Student timetable data:", data);

      setTimetableData({
        classTeacher: data.classTeacher,
        subjects: data.subjects || [],
        timetable: data.timetable || [],
      });
    } catch (error) {
      console.error("❌ Timetable load error:", error);
      toast.error(error.message || "Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-slate-700">
            Loading timetable...
          </p>
        </div>
      </div>
    );
  }

  // Calculate maximum periods count across all days
  const getMaxPeriodsCount = () => {
    if (!timetableData?.timetable) return 8; // Default fallback
    const counts = timetableData.timetable.map(day => day.periods?.length || 0);
    return Math.max(...counts, 8); // At least 8 periods
  };

  // Get periods for a specific day
  const getPeriodsForDay = (day) => {
    const dayEntry = timetableData?.timetable?.find((t) => t.day === day);
    return (dayEntry?.periods || [])
      .slice()
      .sort((a, b) => a.periodNumber - b.periodNumber);
  };

  const maxPeriodsCount = getMaxPeriodsCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <BackButton to="/student/student-dashboard" />

        {/* Header */}
        <div className="mt-6">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
            My Timetable
          </h2>
          <p className="mt-2 text-slate-600 flex items-center gap-2">
            <FaCalendarWeek className="text-blue-600" />
            View your weekly class schedule
          </p>
        </div>

        {/* Timetable */}
        {timetableData?.timetable && timetableData.timetable.length > 0 ? (
          <div className="mt-8 rounded-2xl bg-white shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FaClock className="text-blue-600" />
                Weekly Schedule
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {DAYS.map((day) => {
                const periods = getPeriodsForDay(day);

                return (
                  <div
                    key={day}
                    className="flex flex-col md:flex-row hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Day label */}
                    <div className="md:w-32 bg-slate-50 md:border-r border-slate-100 flex items-center justify-center px-4 py-4 md:py-0">
                      <span className="font-semibold text-slate-900 text-sm md:text-base">
                        {day}
                      </span>
                    </div>

                    {/* Periods row - Fixed width for consistent layout */}
                    <div className="flex-1 px-4 py-4">
                      {periods.length === 0 ? (
                        <div className="h-20 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-sm text-slate-400">
                          No periods scheduled
                        </div>
                      ) : (
                        <div 
                          className="grid gap-2"
                          style={{
                            gridTemplateColumns: `repeat(${maxPeriodsCount}, minmax(85px, 1fr))`
                          }}
                        >
                          {periods.map((period, idx) => {
                            // Check if it's a break period
                            if (period.isBreak || 
                                period.breakType || 
                                period.subject?.toLowerCase().includes('lunch') ||
                                period.subject?.toLowerCase().includes('break') ||
                                period.subject?.toLowerCase().includes('recess')) {
                              
                              const isLunch = period.subject?.toLowerCase().includes('lunch') || 
                                              period.breakType?.toLowerCase().includes('lunch');
                              const breakLabel = period.subject || period.breakType || "Break";
                              
                              return (
                                <div
                                  key={idx}
                                  className="rounded-lg bg-amber-50 border border-amber-300 flex flex-col items-center justify-center p-2 text-[10px] text-amber-800 min-h-[90px]"
                                >
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    {isLunch ? (
                                      <FaUtensils className="h-3 w-3" />
                                    ) : (
                                      <FaCoffee className="h-3 w-3" />
                                    )}
                                  </div>
                                  <span className="font-bold text-xs text-center leading-tight">
                                    {breakLabel}
                                  </span>
                                  <span className="mt-1 text-[9px] text-center leading-tight">
                                    {period.startTime} - {period.endTime}
                                  </span>
                                </div>
                              );
                            }

                            // Regular class period
                            const subject = timetableData.subjects?.find(
                              (s) => s.subjectName === period.subject
                            );
                            const teacherName =
                              period.teacher?.name ||
                              subject?.teacher?.name ||
                              "Not Allotted";

                            const showNA =
                              !subject?.subjectName ||
                              subject.subjectName === "N/A" ||
                              period.subject === "N/A";

                            return (
                              <div
                                key={idx}
                                className="rounded-lg bg-cyan-50 border border-cyan-200 flex flex-col items-center justify-center p-2 text-[10px] text-slate-700 min-h-[90px] hover:bg-cyan-100/50 transition-colors"
                              >
                                <div className="text-center">
                                  <div className="text-[9px] font-medium text-slate-500 mb-1">
                                    Period {period.periodNumber}
                                  </div>
                                  <span className="font-semibold text-xs leading-tight">
                                    {showNA ? "N/A" : (subject?.subjectName || period.subject)}
                                  </span>
                                </div>
                                <span className="mt-1 text-[9px] text-slate-500 text-center flex items-center gap-1 flex-wrap justify-center">
                                  <FaChalkboardTeacher className="h-2.5 w-2.5 flex-shrink-0" />
                                  <span className="truncate max-w-[70px]">{teacherName}</span>
                                </span>
                                <span className="mt-1 text-[9px] text-slate-500">
                                  {period.startTime} - {period.endTime}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-12 text-center py-16 rounded-2xl bg-white shadow-lg border border-slate-100">
            <FaCalendarWeek className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-xl font-semibold text-slate-600">
              No timetable available
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Your class timetable has not been created yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}