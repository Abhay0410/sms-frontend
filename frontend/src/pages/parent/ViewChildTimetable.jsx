// pages/parent/ViewChildTimetable.jsx
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../services/api";
import BackButton from "../../components/BackButton";
import OptimizedImage from "../../components/OptimizedImage";
import {
  FaClock,
  FaBook,
  FaUserTie,
  FaCalendarWeek,
  FaChild,
  FaChalkboardTeacher,
  FaUtensils,
  FaCoffee,
} from "react-icons/fa";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ViewChildTimetable() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  // same shape as student: { classTeacher, subjects, timetable }
  const [timetableData, setTimetableData] = useState(null);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingTimetable, setLoadingTimetable] = useState(false);

  // ---------- LOAD CHILDREN ----------
  const loadChildren = async () => {
    try {
      setLoadingChildren(true);
      const resp = await api.get(API_ENDPOINTS.PARENT.AUTH.PROFILE);
      const parent = resp?.parent || resp?.data?.parent || {};
      const childrenData = parent.children || [];

      console.log("👨‍👦 Children data:", childrenData);

      setChildren(childrenData);
      if (childrenData.length > 0) {
        setSelectedChild(childrenData[0]);
      } else {
        setLoadingChildren(false);
      }
    } catch (error) {
      console.error("❌ Load children error:", error);
      toast.error(error.message || "Failed to load children");
      setLoadingChildren(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  // ---------- LOAD TIMETABLE FOR SELECTED CHILD ----------
  const loadChildTimetable = useCallback(async () => {
    if (!selectedChild) {
      setTimetableData(null);
      return;
    }

    try {
      setLoadingTimetable(true);
      const resp = await api.get(
        API_ENDPOINTS.PARENT.TIMETABLE.CHILD(selectedChild._id)
      );
      const raw = resp?.data || resp;
      const data = raw.data || raw;

      console.log("📅 Parent timetable data:", data);

      setTimetableData({
        classTeacher: data.classTeacher || null,
        subjects: data.subjects || [],
        timetable: data.timetable || [],
        child: data.child || {
          name: selectedChild.name,
          studentID: selectedChild.studentID,
          className: selectedChild.className,
          section: selectedChild.section,
          academicYear: selectedChild.academicYear,
        },
        source: data.source || "Timetable",
      });
    } catch (err) {
      console.error("❌ Parent timetable load error:", err);
      toast.error(err?.response?.data?.message || "Failed to load timetable");
      setTimetableData({
        classTeacher: null,
        subjects: [],
        timetable: [],
        child: {
          name: selectedChild.name,
          studentID: selectedChild.studentID,
          className: selectedChild.className,
          section: selectedChild.section,
          academicYear: selectedChild.academicYear,
        },
        source: "Error",
      });
    } finally {
      setLoadingTimetable(false);
    }
  }, [selectedChild]);

  useEffect(() => {
    if (selectedChild) {
      loadChildTimetable();
    }
  }, [selectedChild, loadChildTimetable]);

  // ---------- LOADING / NO CHILD STATES ----------
  if (loadingChildren && children.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto" />
          <p className="mt-6 text-lg font-medium text-slate-700">
            Loading children data...
          </p>
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
            <h3 className="text-2xl font-bold text-slate-900">
              No Children Found
            </h3>
            <p className="mt-3 text-slate-600">
              No student records are linked to your account
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentChild = selectedChild || children[0];
  const displayChild =
    timetableData?.child || {
      name: currentChild.name,
      studentID: currentChild.studentID,
      className: currentChild.className,
      section: currentChild.section,
    };

  // ---------- STUDENT-STYLE HELPERS ----------
  const getMaxPeriodsCount = () => {
    if (!timetableData?.timetable) return 8;
    const counts = timetableData.timetable.map(
      (day) => day.periods?.length || 0
    );
    return Math.max(...counts, 8);
  };

  const getPeriodsForDay = (day) => {
    const dayEntry = timetableData?.timetable?.find((t) => t.day === day);
    return (dayEntry?.periods || [])
      .slice()
      .sort((a, b) => a.periodNumber - b.periodNumber);
  };

  const maxPeriodsCount = getMaxPeriodsCount();

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <BackButton to="/parent/parent-dashboard" />

        {/* Header */}
        <div className="mt-6">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
            Child&apos;s Timetable
          </h2>
          <p className="mt-2 text-slate-600 flex items-center gap-2">
            <FaCalendarWeek className="text-green-600" />
            View your child&apos;s weekly class schedule
          </p>
        </div>

        {/* Child selector */}
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

        {/* Child info card */}
        {displayChild && (
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <OptimizedImage
                  src={
                    currentChild.photo
                      ? `/uploads/Student/${currentChild.photo}`
                      : `/assets/default-student-avatar.png`
                  }
                  alt={displayChild.name}
                  className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-xl"
                  width={80}
                  height={80}
                />
                <div>
                  <h3 className="text-2xl font-bold">{displayChild.name}</h3>
                  <p className="text-green-100 font-medium">
                    {displayChild.studentID}
                  </p>
                  <p className="text-green-100">
                    Class {displayChild.className || "N/A"} - Section{" "}
                    {displayChild.section || "N/A"}
                  </p>
                </div>
              </div>
              {timetableData?.classTeacher && (
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
                  <FaUserTie className="h-6 w-6" />
                  <div>
                    <p className="text-xs text-green-100">Class Teacher</p>
                    <p className="font-bold">
                      {timetableData.classTeacher.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subjects list (optional, like before) */}
        {timetableData?.subjects && timetableData.subjects.length > 0 && (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FaBook className="text-green-600" />
              Subjects ({timetableData.subjects.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timetableData.subjects.map((subject, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-gradient-to-br from-green-50 to-teal-50 p-4 border border-green-200"
                >
                  <p className="font-bold text-green-900">
                    {subject.subjectName}
                  </p>
                  <p className="text-sm text-green-700">
                    {subject.teacher?.name || "No teacher assigned"}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {subject.hoursPerWeek || 0} hours/week
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timetable – EXACT student layout */}
        {loadingTimetable ? (
          <div className="mt-12 text-center py-16 rounded-2xl bg-white shadow-lg border border-slate-100">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto" />
            <p className="mt-4 text-slate-600">Loading timetable...</p>
          </div>
        ) : timetableData?.timetable && timetableData.timetable.length > 0 ? (
          <div className="mt-8 rounded-2xl bg-white shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FaClock className="text-green-600" />
                Weekly Schedule
                <span className="text-sm font-normal text-slate-500 ml-2">
                  ({timetableData.source || "Timetable"})
                </span>
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

                    {/* Periods row */}
                    <div className="flex-1 px-4 py-4">
                      {periods.length === 0 ? (
                        <div className="h-20 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-sm text-slate-400">
                          No periods scheduled
                        </div>
                      ) : (
                        <div
                          className="grid gap-2"
                          style={{
                            gridTemplateColumns: `repeat(${maxPeriodsCount}, minmax(85px, 1fr))`,
                          }}
                        >
                          {periods.map((period, idx) => {
                            // Break / lunch cards (same logic)
                            if (
                              period.isBreak ||
                              period.breakType ||
                              period.subject
                                ?.toLowerCase()
                                .includes("lunch") ||
                              period.subject
                                ?.toLowerCase()
                                .includes("break") ||
                              period.subject
                                ?.toLowerCase()
                                .includes("recess")
                            ) {
                              const isLunch =
                                period.subject
                                  ?.toLowerCase()
                                  .includes("lunch") ||
                                period.breakType
                                  ?.toLowerCase()
                                  .includes("lunch");
                              const breakLabel =
                                period.subject ||
                                period.breakType ||
                                "Break";

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

                            // Regular period
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
                                    {showNA
                                      ? "N/A"
                                      : subject?.subjectName || period.subject}
                                  </span>
                                </div>
                                <span className="mt-1 text-[9px] text-slate-500 text-center flex items-center gap-1 flex-wrap justify-center">
                                  <FaChalkboardTeacher className="h-2.5 w-2.5 flex-shrink-0" />
                                  <span className="truncate max-w-[70px]">
                                    {teacherName}
                                  </span>
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
              {displayChild.name}&apos;s class timetable has not been created
              yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
