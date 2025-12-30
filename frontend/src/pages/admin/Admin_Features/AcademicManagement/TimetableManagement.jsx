import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../../services/api";

import {
  FaClock,
  FaPlus,
  FaTimes,
  FaEdit,
  FaTrash,
  FaMagic,
  FaCheck,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetableManagement() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState("");
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);

  function getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return month >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  }

  // Load last selected class from localStorage
  useEffect(() => {
    const savedClass = localStorage.getItem('lastSelectedClass');
    const savedSection = localStorage.getItem('lastSelectedSection');
    if (savedClass && savedSection) {
      try {
        const parsedClass = JSON.parse(savedClass);
        setSelectedClass(parsedClass);
        setSelectedSection(savedSection);
      } catch (e) {
        console.error('Error parsing saved class:', e);
      }
    }
  }, []);

  // Save selected class and section to localStorage
  useEffect(() => {
    if (selectedClass && selectedSection) {
      localStorage.setItem('lastSelectedClass', JSON.stringify(selectedClass));
      localStorage.setItem('lastSelectedSection', selectedSection);
    }
  }, [selectedClass, selectedSection]);

  const loadTimetable = useCallback(async () => {
  if (!selectedClass || !selectedSection) {
    setTimetableData(null);
    return;
  }

  try {
    console.log("🔄 Loading timetable for:", {
      classId: selectedClass._id,
      section: selectedSection,
      academicYear,
    });

    const resp = await api.get(
      `${API_ENDPOINTS.ADMIN.TIMETABLE.BY_CLASS_SECTION}?classId=${selectedClass._id}&section=${selectedSection}&academicYear=${academicYear}`
    );

    console.log("📦 Timetable response:", resp);

    const data = resp?.data || resp;

    if (data?.className) {
      setTimetableData(data);
    } else {
      setTimetableData(null);
    }
  } catch (err) {
    if (err.status === 404 || err?.data?.message?.includes("Timetable not found")) {
      setTimetableData(null);
    } else {
      console.error("❌ Timetable load error:", err);
      toast.error(err.message || "Failed to load timetable");
      setTimetableData(null);
    }
  }
}, [selectedClass, selectedSection, academicYear]);

  const loadClasses = useCallback(async () => {
  try {
    setLoading(true);
    const resp = await api.get(
      `${API_ENDPOINTS.ADMIN.CLASS.LIST}?academicYear=${academicYear}`
    );

    console.log("Timetable - class list response:", resp);

    // Axios interceptor: resp = { success, message, data: [...] }
    const classList = Array.isArray(resp?.data)
      ? resp.data
      : Array.isArray(resp)
      ? resp
      : [];

    console.log("Timetable - resolved classList:", classList);

    setClasses(classList);

    // Only auto-select if no saved selection exists
    const savedClass = localStorage.getItem("lastSelectedClass");
    if (!savedClass && classList.length > 0 && !selectedClass) {
      setSelectedClass(classList[0]);
      if (classList[0].sections?.length > 0) {
        setSelectedSection(classList[0].sections[0].sectionName);
      } else {
        setSelectedSection("");
      }
    }
  } catch (err) {
    console.error("❌ Classes load error:", err);
    toast.error(err.message || "Failed to load classes");
  } finally {
    setLoading(false);
  }
}, [academicYear, selectedClass]);

  const createEmptyTimetable = useCallback(
    async (templateData) => {
      if (!selectedClass || !selectedSection) return;
      try {
        const createPeriods = (
          periodCount,
          startTime,
          duration,
          breakAfter,
          lunchStart,
          lunchDuration
        ) => {
          let periods = [];
          let currentTime = new Date(`1970-01-01T${startTime}:00`);
          
          for (let i = 1; i <= periodCount; i++) {
            periods.push({
              periodNumber: i,
              subject: "N/A",
              teacher: null,
              startTime: currentTime.toTimeString().slice(0, 5),
              endTime: new Date(
                currentTime.getTime() + duration * 60000
              ).toTimeString().slice(0, 5),
              isBreak: false,
              room: "",
            });
            currentTime = new Date(currentTime.getTime() + duration * 60000);
            
            // ✅ FIXED: Improved lunch break positioning
            if (breakAfter > 0 && breakAfter === i) {
              const lunchStartTime = new Date(`1970-01-01T${lunchStart}:00`);
              const lunchEndTime = new Date(
                lunchStartTime.getTime() + lunchDuration * 60000
              );
              
              // Use decimal period number for lunch break to maintain proper ordering
              periods.push({
                periodNumber: i + 0.5,
                subject: "Lunch Break",
                teacher: null,
                startTime: lunchStartTime.toTimeString().slice(0, 5),
                endTime: lunchEndTime.toTimeString().slice(0, 5),
                isBreak: true,
                room: "",
              });
              currentTime = lunchEndTime;
            }
          }
          return periods;
        };

        const schedule = [];

        // Monday to Friday schedule
        const monFriPeriods = createPeriods(
          parseInt(templateData.periodsPerDay, 10),
          templateData.weekdayStartTime,
          parseInt(templateData.periodDuration, 10),
          parseInt(templateData.breakAfterPeriod || 0),
          templateData.lunchStartMonFri,
          parseInt(templateData.lunchDurationMonFri, 10)
        );
        
        console.log('📅 Mon-Fri periods:', monFriPeriods);
        
        for (let day of DAYS.slice(0, 5)) {
          schedule.push({ 
            day, 
            periods: JSON.parse(JSON.stringify(monFriPeriods))
          });
        }

        // ✅ FIXED: Saturday schedule with proper lunch handling
        const satPeriods = createPeriods(
          parseInt(templateData.periodsSaturday, 10),
          templateData.saturdayStartTime,
          parseInt(templateData.periodDuration, 10),
          0, // No break after period for Saturday
          templateData.lunchStartSat,
          parseInt(templateData.lunchDurationSat, 10)
        );
        
        console.log('📅 Saturday periods:', satPeriods);
        
        schedule.push({ 
          day: "Saturday", 
          periods: satPeriods 
        });

        // Check if timetable exists and ask for confirmation
        let overwrite = false;
        if (timetableData) {
          const shouldOverwrite = window.confirm(
            "A timetable already exists for this class and section. Do you want to replace it with a new template?"
          );
          if (!shouldOverwrite) return;
          overwrite = true;
        }

        console.log('📤 Creating timetable with:', {
          classId: selectedClass._id,
          section: selectedSection,
          academicYear,
          scheduleLength: schedule.length,
          overwrite
        });

        const resp = await api.post(API_ENDPOINTS.ADMIN.TIMETABLE.CREATE, {
          classId: selectedClass._id,
          section: selectedSection,
          academicYear,
          schedule,
          overwrite
        });

        console.log('📦 Timetable creation response:', resp);
        
        const updatedTimetable = resp?.data || resp;
        setTimetableData(updatedTimetable);
        
        toast.success(
          overwrite 
            ? "Timetable template updated successfully" 
            : "Timetable template generated successfully"
        );
        setShowTemplateModal(false);
        
        // Reload timetable
        setTimeout(() => {
          loadTimetable();
        }, 500);
        
      } catch (err) {
        console.error('❌ Timetable creation error:', err);
        if (err.response?.data?.message?.includes('already exists')) {
          toast.error("Timetable already exists. Please use the overwrite option to replace it.");
        } else {
          toast.error(err.message || "Failed to generate timetable template");
        }
      }
    },
    [selectedClass, selectedSection, academicYear, timetableData, loadTimetable]
  );

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      loadTimetable();
    }
  }, [selectedClass, selectedSection, loadTimetable]);

  const handleClassChange = (classId) => {
    const cls = classes.find((c) => c._id === classId);
    setSelectedClass(cls);
    if (cls?.sections?.length > 0) {
      setSelectedSection(cls.sections[0].sectionName);
    } else {
      setSelectedSection("");
    }
    setTimetableData(null); // Reset timetable when class changes
  };

  const publishTimetable = async () => {
    if (!window.confirm("Publish this timetable?")) return;
    try {
      await api.put(API_ENDPOINTS.ADMIN.TIMETABLE.PUBLISH(timetableData._id));
      toast.success("Timetable published");
      loadTimetable();
    } catch (err) {
      toast.error(err.message || "Failed to publish timetable");
      console.error(err);
    }
  };

  const unpublishTimetable = async () => {
    if (!window.confirm("Move timetable to draft?")) return;
    try {
      await api.put(API_ENDPOINTS.ADMIN.TIMETABLE.UNPUBLISH(timetableData._id));
      toast.success("Timetable moved to draft");
      loadTimetable();
    } catch (err) {
      toast.error(err.message || "Failed to move timetable to draft");
      console.error(err);
    }
  };

  const handleDeletePeriod = async (day, periodId) => {
    if (!window.confirm("Delete this period?")) return;
    try {
      await api.delete(
        API_ENDPOINTS.ADMIN.TIMETABLE.DELETE_PERIOD(timetableData._id, day, periodId)
      );
      toast.success("Period deleted");
      loadTimetable();
    } catch (err) {
      toast.error(err.message || "Failed to delete period");
      console.error(err);
    }
  };

  const openEditPeriod = (day, period) => {
    if (!period?._id) {
      console.error("❌ Period has no ID, cannot edit:", period);
      toast.error("Cannot edit this period - missing ID");
      return;
    }
    
    setEditingPeriod({ day, ...period });
    setShowPeriodModal(true);
  };

  const openAddPeriod = (day, periodNumber) => {
    setEditingPeriod({ day, periodNumber });
    setShowPeriodModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600 mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-slate-700">Loading timetable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
       

        {/* Header */}
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
              Timetable Management
            </h2>
            <p className="text-base text-slate-600 flex items-center gap-2">
              <FaClock className="text-teal-600" />
              Create and manage class schedules
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="rounded-xl border-2 border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 shadow-sm transition-all hover:border-teal-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 focus:outline-none"
            >
              <option value="2023-2024">2023-2024</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
            </select>

            {timetableData && (
              <>
                {timetableData.status === "draft" ? (
                  <button
                    onClick={publishTimetable}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <FaCheck className="h-4 w-4" />
                    Publish
                  </button>
                ) : (
                  <button
                    onClick={unpublishTimetable}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <FaEdit className="h-4 w-4" />
                    Move to Draft
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => setShowTemplateModal(true)}
              disabled={!selectedClass || !selectedSection}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaMagic className="h-4 w-4" />
              Generate Template
            </button>
          </div>
        </div>

        {/* Class & Section Selector */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select Class
            </label>
            <select
              value={selectedClass?._id || ""}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 font-medium focus:border-teal-600 focus:outline-none"
            >
              <option value="">Choose a class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 font-medium focus:border-teal-600 focus:outline-none"
              disabled={!selectedClass}
            >
              <option value="">Choose a section</option>
              {selectedClass?.sections?.map((section) => (
                <option key={section._id} value={section.sectionName}>
                  Section {section.sectionName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timetable Display or Empty State */}
        {!timetableData ? (
          <div className="mt-8 text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-100">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                <FaClock className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                No Timetable Found
              </h3>
              <p className="text-slate-600 mb-6">
                {selectedClass && selectedSection 
                  ? `No timetable found for ${selectedClass.className} - Section ${selectedSection}. Generate a template to get started.`
                  : "Please select a class and section to view or create timetable."
                }
              </p>
              {selectedClass && selectedSection && (
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl"
                >
                  <FaMagic className="h-4 w-4" />
                  Generate Template
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900">
                  {timetableData.className} - Section {timetableData.section}
                </h3>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    timetableData.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {timetableData.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                  <button
                    onClick={() => {
                      setEditingPeriod(null);
                      setShowPeriodModal(true);
                    }}
                    disabled={timetableData.status === "published"}
                    className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaPlus />
                    Add Period
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-200 p-3 text-left font-semibold text-slate-700">
                        Day
                      </th>
                      {[...Array(9)].map((_, i) => (
                        <th
                          key={i}
                          className="border border-slate-200 p-3 text-center font-semibold text-slate-700"
                        >
                          {i < 4 ? `Period ${i + 1}` : i === 4 ? 'Lunch' : `Period ${i}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day) => {
                      const dayEntry = timetableData.schedule?.find((s) => s.day === day);
                      const periods = dayEntry?.periods || [];
                      
                      // Sort periods by periodNumber
                      const sortedPeriods = [...periods].sort((a, b) => a.periodNumber - b.periodNumber);
                      
                      // Create an array with proper positioning
                      const positionedPeriods = Array(9).fill(null);
                      
                      sortedPeriods.forEach(period => {
                        if (period.isBreak) {
                          // Lunch break always goes in position 4 (5th column)
                          positionedPeriods[4] = period;
                        } else {
                          // Regular periods
                          if (period.periodNumber <= 4) {
                            positionedPeriods[period.periodNumber - 1] = period;
                          } else if (period.periodNumber >= 5) {
                            positionedPeriods[period.periodNumber] = period;
                          }
                        }
                      });
                      
                      return (
                        <tr key={day} className="hover:bg-slate-50">
                          <td className="border border-slate-200 p-3 font-semibold text-slate-700">
                            {day}
                          </td>
                          {positionedPeriods.map((period, i) => (
                            <td key={i} className="border border-slate-200 p-2 text-center">
                              {period ? (
                                <PeriodCell
                                  period={period}
                                  isEditable={timetableData.status === "draft"}
                                  onEdit={() => openEditPeriod(day, period)}
                                  onDelete={() => handleDeletePeriod(day, period._id)}
                                />
                              ) : (
                                timetableData.status === "draft" && i !== 4 && (
                                  <button
                                    onClick={() => {
                                      let periodNumber;
                                      if (i < 4) {
                                        periodNumber = i + 1;
                                      } else {
                                        periodNumber = i;
                                      }
                                      openAddPeriod(day, periodNumber);
                                    }}
                                    className="w-full h-20 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-teal-400 hover:text-teal-600 transition-all"
                                  >
                                    <FaPlus className="mx-auto" />
                                  </button>
                                )
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {showTemplateModal && selectedClass && selectedSection && (
          <GenerateTemplateModal
            sectionName={selectedSection}
            className={selectedClass.className}
            onClose={() => setShowTemplateModal(false)}
            onSuccess={createEmptyTimetable}
          />
        )}

        {showPeriodModal && (
          <PeriodModal
            timetableId={timetableData?._id}
            sectionName={selectedSection}
            selectedClass={selectedClass}
            editingPeriod={editingPeriod}
            onClose={() => {
              setShowPeriodModal(false);
              setEditingPeriod(null);
            }}
            onSuccess={() => {
              setShowPeriodModal(false);
              setEditingPeriod(null);
              loadTimetable();
            }}
          />
        )}
      </div>
    </div>
  );
}

// PeriodCell Component - Shows "Not Alloted" when no teacher is assigned
// PeriodCell Component - FIXED: Shows "Not Allotted" when no teacher is assigned
function PeriodCell({ period, isEditable, onEdit, onDelete }) {
  const handleEditClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onEdit();
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete();
  };

  if (period.isBreak) {
    return (
      <div className="group relative h-20 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 p-2 flex flex-col justify-center items-center">
        <p className="text-sm font-bold text-amber-900">{period.subject || "Break"}</p>
        <p className="text-xs text-amber-700 mt-1">
          {period.startTime} - {period.endTime}
        </p>
        {isEditable && (
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity duration-200 z-50">
            <button 
              onClick={handleEditClick}
              type="button"
              className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-colors"
            >
              <FaEdit className="h-3 w-3" />
            </button>
            <button 
              onClick={handleDeleteClick}
              type="button"
              className="p-1 rounded bg-red-600 text-white hover:bg-red-700 shadow-md transition-colors"
            >
              <FaTrash className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group relative h-20 rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 p-2 hover:shadow-md transition-all">
      <div className="flex flex-col h-full">
        <p className="text-xs font-bold text-teal-900 truncate">{period.subject || "N/A"}</p>
        {/* ✅ FIXED: Show "Not Allotted" when no teacher is assigned */}
        <p className="text-xs text-slate-600 truncate mt-1">
          {period.teacher?.name || "Not Allotted"}
        </p>
        <p className="text-xs text-slate-500 mt-auto">
          {period.startTime} - {period.endTime}
        </p>
        {period.room && <p className="text-xs text-slate-400">Room: {period.room}</p>}
      </div>

      {isEditable && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity duration-200 z-50">
          <button 
            onClick={handleEditClick}
            type="button"
            className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-colors"
          >
            <FaEdit className="h-3 w-3" />
          </button>
          <button 
            onClick={handleDeleteClick}
            type="button"
            className="p-1 rounded bg-red-600 text-white hover:bg-red-700 shadow-md transition-colors"
          >
            <FaTrash className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// GenerateTemplateModal Component (unchanged)
function GenerateTemplateModal({ sectionName, className, onClose, onSuccess }) {
  const [form, setForm] = useState({
    periodsPerDay: "8",
    periodsSaturday: "5",
    weekdayStartTime: "08:00",
    saturdayStartTime: "08:00",
    periodDuration: "45",
    breakAfterPeriod: "4",
    lunchStartMonFri: "13:00",
    lunchDurationMonFri: "30",
    lunchStartSat: "12:00",
    lunchDurationSat: "30",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSuccess(form);
    } catch (err) {
      toast.error(err.message || "Failed to generate template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-slate-100 p-6 bg-gradient-to-r from-purple-50 to-pink-50 sticky top-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Generate Timetable</h3>
              <p className="mt-2 text-sm text-slate-600">
                {className} - Section {sectionName}
              </p>
            </div>
            <button onClick={onClose} className="rounded-xl bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-100">
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Form fields remain the same as before */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Periods Per Day (Mon-Fri)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={form.periodsPerDay}
              onChange={e => setForm({ ...form, periodsPerDay: e.target.value })}
              required
              className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-purple-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Periods on Saturday</label>
            <input
              type="number"
              min="1"
              max="10"
              value={form.periodsSaturday}
              onChange={e => setForm({ ...form, periodsSaturday: e.target.value })}
              required
              className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-purple-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Weekday Start Time</label>
              <input
                type="time"
                value={form.weekdayStartTime}
                onChange={e => setForm({ ...form, weekdayStartTime: e.target.value })}
                required
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-purple-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Saturday Start Time</label>
              <input
                type="time"
                value={form.saturdayStartTime}
                onChange={e => setForm({ ...form, saturdayStartTime: e.target.value })}
                required
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-purple-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Period Duration (minutes)</label>
            <input
              type="number"
              min="10"
              max="120"
              value={form.periodDuration}
              onChange={e => setForm({ ...form, periodDuration: e.target.value })}
              required
              className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-purple-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Break After Period (Mon-Fri)</label>
            <input
              type="number"
              min="0"
              max={form.periodsPerDay}
              value={form.breakAfterPeriod}
              onChange={e => setForm({ ...form, breakAfterPeriod: e.target.value })}
              placeholder="Optional"
              className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-purple-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Lunch Start (Mon-Fri)</label>
              <input
                type="time"
                value={form.lunchStartMonFri}
                onChange={e => setForm({ ...form, lunchStartMonFri: e.target.value })}
                required
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-purple-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Lunch Duration (minutes) Mon-Fri</label>
              <input
                type="number"
                min="5"
                max="120"
                value={form.lunchDurationMonFri}
                onChange={e => setForm({ ...form, lunchDurationMonFri: e.target.value })}
                required
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-purple-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Lunch Start (Saturday)</label>
              <input
                type="time"
                value={form.lunchStartSat}
                onChange={e => setForm({ ...form, lunchStartSat: e.target.value })}
                required
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-purple-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Lunch Duration (minutes) Saturday</label>
              <input
                type="number"
                min="5"
                max="120"
                value={form.lunchDurationSat}
                onChange={e => setForm({ ...form, lunchDurationSat: e.target.value })}
                required
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-purple-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// PeriodModal Component - CLEANED UP: Removed unnecessary elements
function PeriodModal({ timetableId, sectionName, selectedClass, editingPeriod, onClose, onSuccess }) {
  const [form, setForm] = useState({
    day: editingPeriod?.day || "Monday",
    periodNumber: editingPeriod?.periodNumber || 1,
    startTime: editingPeriod?.startTime || "08:00",
    endTime: editingPeriod?.endTime || "08:45",
    subject: editingPeriod?.subject || "",
    teacher: editingPeriod?.teacher?._id || "",
    isBreak: editingPeriod?.isBreak || false,
  });
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [subjectTeachers, setSubjectTeachers] = useState({});
  const [fetchLoading, setFetchLoading] = useState(true);

  // Load subjects with teacher information
  const loadSubjects = useCallback(async () => {
    if (!selectedClass?._id || !sectionName) {
      setSubjects([]);
      return;
    }

    try {
      const endpoint = API_ENDPOINTS.ADMIN.SUBJECT_MANAGEMENT.CLASS(selectedClass._id);
      const response = await api.get(endpoint);
      const responseData = response.data || response;

      let subjectsData = [];
      const teachersMap = {};

      // Get subjects from specific section with teacher data
      if (responseData?.sections && Array.isArray(responseData.sections)) {
        const currentSection = responseData.sections.find(
          section => section.sectionName === sectionName
        );
        
        if (currentSection?.subjects && Array.isArray(currentSection.subjects)) {
          subjectsData = currentSection.subjects;
          
          // Build teachers map
          subjectsData.forEach(subject => {
            if (subject.teacher && subject.teacher._id) {
              teachersMap[subject.subjectName] = {
                _id: subject.teacher._id,
                name: subject.teacher.name,
                teacherID: subject.teacher.teacherID
              };
            }
          });
        }
      }

      // Fallback to availableSubjects if no section subjects found
      if (subjectsData.length === 0 && responseData?.availableSubjects) {
        subjectsData = responseData.availableSubjects;
      }
      
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setSubjectTeachers(teachersMap);

      // Auto-set teacher if editing and subject has teacher
      if (editingPeriod?.subject && teachersMap[editingPeriod.subject]) {
        setForm(prev => ({
          ...prev,
          teacher: teachersMap[editingPeriod.subject]._id
        }));
      }
      
    } catch (error) {
      console.error("Failed to load subjects", error);
      setSubjects([]);
      setSubjectTeachers({});
    }
  }, [selectedClass, sectionName, editingPeriod]);

  const loadData = useCallback(async () => {
    try {
      setFetchLoading(true);
      await loadSubjects();
    } catch (error) {
      console.error("Failed to load modal data:", error);
    } finally {
      setFetchLoading(false);
    }
  }, [loadSubjects]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-assign teacher when subject changes
  useEffect(() => {
    if (form.subject && subjectTeachers[form.subject] && !form.isBreak) {
      setForm(prev => ({
        ...prev,
        teacher: subjectTeachers[form.subject]._id
      }));
    } else if (form.subject && !subjectTeachers[form.subject] && !form.isBreak) {
      setForm(prev => ({
        ...prev,
        teacher: ""
      }));
    }
  }, [form.subject, subjectTeachers, form.isBreak]);

  // When break period checkbox toggled for new period, auto set lunch break times and subject
  useEffect(() => {
    if (form.isBreak && !editingPeriod) {
      const isSaturday = form.day === "Saturday";
      setForm(prev => ({
        ...prev,
        startTime: isSaturday ? "12:00" : "13:00",
        endTime: isSaturday ? "12:30" : "13:30",
        subject: "Lunch Break",
        teacher: ""
      }));
    }
  }, [form.isBreak, form.day, editingPeriod]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.startTime || !form.endTime) {
      toast.error("Start time and end time are required");
      return;
    }
    
    if (!form.isBreak && !form.subject) {
      toast.error("Subject is required for non-break periods");
      return;
    }

    setLoading(true);

    try {
      const periodData = {
        day: form.day,
        periodNumber: parseInt(form.periodNumber),
        startTime: form.startTime,
        endTime: form.endTime,
        subject: form.subject,
        teacher: form.teacher || null,
        isBreak: form.isBreak,
      };

      if (editingPeriod?._id) {
        // Update existing period
        await api.put(
          API_ENDPOINTS.ADMIN.TIMETABLE.UPDATE_PERIOD(timetableId, form.day, editingPeriod._id),
          periodData
        );
        toast.success("Period updated successfully");
      } else {
        // Create new period (break or normal)
        if (form.isBreak) {
          await api.post(API_ENDPOINTS.ADMIN.TIMETABLE.ADD_BREAK(timetableId, form.day), {
            startTime: form.startTime,
            endTime: form.endTime,
            periodNumber: parseInt(form.periodNumber),
            breakType: form.subject || "Lunch Break",
          });
          toast.success("Break period added");
        } else {
          await api.post(API_ENDPOINTS.ADMIN.TIMETABLE.ADD_PERIOD(timetableId, form.day), periodData);
          toast.success("Period added successfully");
        }
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving period:", error);
      const errorMessage = error.response?.data?.message || error.message || "Operation failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-slate-100 p-6 bg-gradient-to-r from-teal-50 to-cyan-50 sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{editingPeriod?._id ? "Edit Period" : "Add Period"}</h3>
              <p className="text-sm text-slate-600 mt-1">{form.day}</p>
            </div>
            <button onClick={onClose} className="rounded-xl bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-100">
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Break Period Checkbox */}
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <input
              type="checkbox"
              checked={form.isBreak}
              onChange={e => setForm({ ...form, isBreak: e.target.checked })}
              className="h-4 w-4"
            />
            <label className="text-sm font-semibold text-slate-700">This is a break period (Lunch/Recess)</label>
          </div>

          {/* Day and Period Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Day</label>
              <select
                value={form.day}
                onChange={e => setForm({ ...form, day: e.target.value })}
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-teal-600 focus:outline-none"
                required
              >
                {DAYS.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Period</label>
              <input
                type="number"
                min="1"
                max="8"
                value={form.periodNumber}
                onChange={e => setForm({ ...form, periodNumber: e.target.value })}
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-teal-600 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Start and End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time</label>
              <input
                type="time"
                value={form.startTime}
                onChange={e => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-teal-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">End Time</label>
              <input
                type="time"
                value={form.endTime}
                onChange={e => setForm({ ...form, endTime: e.target.value })}
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-teal-600 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Loading state */}
          {fetchLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-teal-600 border-t-transparent mx-auto"></div>
              <p className="text-sm text-slate-600 mt-2">Loading subjects...</p>
            </div>
          )}

          {/* Subject Selection (only if not break) */}
          {!form.isBreak && !fetchLoading && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Subject *</label>
              <select
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-teal-600 focus:outline-none"
                required
              >
                <option value="">Choose subject</option>
                {subjects.length === 0 ? (
                  <option disabled>No subjects available</option>
                ) : (
                  subjects.map(sub => (
                    <option key={sub._id || sub.id || sub.subjectName} value={sub.subjectName || sub.name}>
                      {sub.subjectName || sub.name}
                    </option>
                  ))
                )}
              </select>
              {subjects.length === 0 && (
                <p className="text-xs text-red-600 mt-1">No subjects found for this class. Please add subjects first.</p>
              )}
              
              {/* Teacher assignment info */}
              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Teacher will be automatically assigned based on subject selection from Teacher Management.
                  {form.subject && !subjectTeachers[form.subject] && (
                    <span className="block mt-1 text-amber-700">
                      No teacher assigned for {form.subject}. It will show "Not Allotted" in timetable.
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {form.isBreak && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Break Type</label>
              <input
                type="text"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-teal-600 focus:outline-none"
                placeholder="e.g., Lunch Break, Recess"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || fetchLoading}
              className="flex-1 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-3 font-semibold text-white shadow-lg disabled:opacity-50"
            >
              {loading ? "Saving..." : editingPeriod?._id ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

