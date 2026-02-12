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
  FaExclamationTriangle,
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
  const [showOverwriteModal, setShowOverwriteModal] = useState(false);
  const [pendingTemplateData, setPendingTemplateData] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState({ day: "", periodId: "" });

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

  // Execute template creation after confirmation
  const executeTemplateCreation = async (templateData, overwrite) => {
    try {
      // Helper: Convert time string to minutes
      const t2m = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };

      // Helper: Convert minutes back to time string
      const m2t = (m) => {
        const hh = Math.floor(m / 60).toString().padStart(2, '0');
        const mm = (m % 60).toString().padStart(2, '0');
        return `${hh}:${mm}`;
      };

      const calculatePeriods = (total, start, duration, lunchAfter, lunchDuration) => {
        let periods = [];
        let currentMin = t2m(start);
        const dur = parseInt(duration);
        const lDur = parseInt(lunchDuration);

        for (let i = 1; i <= parseInt(total); i++) {
          periods.push({
            periodNumber: i,
            subject: "N/A",
            teacher: null,
            startTime: m2t(currentMin),
            endTime: m2t(currentMin + dur),
            isBreak: false,
          });
          currentMin += dur;

          if (i === parseInt(lunchAfter)) {
            periods.push({
              periodNumber: i + 0.5, // Sort marker
              subject: "Lunch Break",
              teacher: null,
              startTime: m2t(currentMin),
              endTime: m2t(currentMin + lDur),
              isBreak: true,
            });
            currentMin += lDur;
          }
        }
        return periods;
      };

      const schedule = [];
      // Mon-Fri Generation
      const weekdayPeriods = calculatePeriods(
        templateData.periodsPerDay,
        templateData.startTime,
        templateData.periodDuration,
        templateData.lunchAfter,
        templateData.lunchDuration
      );
      DAYS.slice(0, 5).forEach(day => schedule.push({ day, periods: JSON.parse(JSON.stringify(weekdayPeriods)) }));

      // Saturday Generation (Specific rules)
      const saturdayPeriods = calculatePeriods(
        templateData.periodsSat,
        templateData.startTime,
        templateData.periodDuration,
        templateData.lunchAfterSat,
        templateData.lunchDuration
      );
      schedule.push({ day: "Saturday", periods: saturdayPeriods });

      const resp = await api.post(API_ENDPOINTS.ADMIN.TIMETABLE.CREATE, {
        classId: selectedClass._id,
        section: selectedSection,
        academicYear,
        schedule,
        overwrite
      });

      setTimetableData(resp?.data || resp);
      toast.success(overwrite ? "Template Overwritten Successfully" : "Curriculum Template Generated");
      setShowTemplateModal(false);
      loadTimetable();
    } catch (err) {
      toast.error(err.message || "Failed to generate schedule");
    }
  };

  // Handle overwrite confirmation
  const handleOverwriteConfirm = () => {
    if (pendingTemplateData) {
      executeTemplateCreation(pendingTemplateData, true);
    }
    setShowOverwriteModal(false);
    setPendingTemplateData(null);
  };

  const handleOverwriteCancel = () => {
    setShowOverwriteModal(false);
    setPendingTemplateData(null);
  };

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
    try {
      await api.put(API_ENDPOINTS.ADMIN.TIMETABLE.PUBLISH(timetableData._id));
      toast.success("Timetable published successfully");
      setShowPublishModal(false);
      loadTimetable();
    } catch (err) {
      toast.error(err.message || "Failed to publish timetable");
      console.error(err);
    }
  };

  const unpublishTimetable = async () => {
    try {
      await api.put(API_ENDPOINTS.ADMIN.TIMETABLE.UNPUBLISH(timetableData._id));
      toast.success("Timetable moved to draft");
      setShowUnpublishModal(false);
      loadTimetable();
    } catch (err) {
      toast.error(err.message || "Failed to move timetable to draft");
      console.error(err);
    }
  };

  const handleDeletePeriod = async () => {
    try {
      await api.delete(
        API_ENDPOINTS.ADMIN.TIMETABLE.DELETE_PERIOD(timetableData._id, pendingDelete.day, pendingDelete.periodId)
      );
      toast.success("Period deleted successfully");
      setShowDeleteModal(false);
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

  // FIXED: Helper function to generate table headers dynamically
  const generateTableHeaders = () => {
    if (!timetableData) return [];

    // Find the day with the maximum number of periods (Monday for weekdays)
    const weekdayEntry = timetableData.schedule?.find(s => s.day === "Monday");
    
    if (!weekdayEntry?.periods) return [];

    // Count only REGULAR periods (not breaks)
    const regularPeriods = weekdayEntry.periods.filter(p => !p.isBreak);
    const maxRegularPeriod = Math.max(...regularPeriods.map(p => p.periodNumber), 0);
    
    // Find lunch position
    const lunchBreak = weekdayEntry.periods.find(p => p.isBreak);
    const lunchPosition = lunchBreak ? Math.floor(lunchBreak.periodNumber) : -1;

    const headers = [];
    
    // Generate headers based on regular periods only
    for (let i = 1; i <= maxRegularPeriod; i++) {
      headers.push(
        <th
          key={`period-${i}`}
          className="border border-slate-200 p-3 text-center font-semibold text-slate-700 min-w-[120px]"
        >
          Period {i}
        </th>
      );
      
      // Add lunch break header if this period has lunch after it
      if (i === lunchPosition) {
        headers.push(
          <th
            key={`lunch-after-${i}`}
            className="border border-slate-200 p-3 text-center font-semibold text-amber-700 bg-amber-50 min-w-[120px]"
          >
            Lunch
          </th>
        );
      }
    }
    
    return headers;
  };

  // FIXED: Helper function to position periods in correct columns
  const getPositionedPeriodsForDay = (day) => {
    const dayEntry = timetableData.schedule?.find(s => s.day === day);
    let periods = dayEntry?.periods || [];
    
    // Sort periods by periodNumber
    periods = [...periods].sort((a, b) => a.periodNumber - b.periodNumber);
    
    // Find lunch position from Monday (to ensure consistent column placement)
    const weekdayEntry = timetableData.schedule?.find(s => s.day === "Monday");
    const lunchBreak = weekdayEntry?.periods?.find(p => p.isBreak);
    const lunchPosition = lunchBreak ? Math.floor(lunchBreak.periodNumber) : -1;
    
    // Count only REGULAR periods (not breaks) to determine total columns
    const regularPeriods = periods.filter(p => !p.isBreak);
    const maxRegularPeriod = Math.max(...regularPeriods.map(p => p.periodNumber), 0);
    
    // Create array for all columns (regular periods + lunch)
    const totalColumns = maxRegularPeriod + (lunchPosition > -1 ? 1 : 0);
    const positionedPeriods = Array(totalColumns).fill(null);
    
    // Place periods in correct columns
    periods.forEach(period => {
      if (period.isBreak) {
        // Lunch goes in column after the specified period
        const lunchColumnIndex = lunchPosition; // Lunch goes in column after period X
        if (lunchColumnIndex < positionedPeriods.length) {
          positionedPeriods[lunchColumnIndex] = period;
        }
      } else {
        // Regular periods: adjust for lunch column
        let columnIndex = period.periodNumber - 1;
        if (lunchPosition > -1 && period.periodNumber > lunchPosition) {
          columnIndex = period.periodNumber; // Shift right for periods after lunch
        }
        if (columnIndex < positionedPeriods.length) {
          positionedPeriods[columnIndex] = period;
        }
      }
    });
    
    return positionedPeriods;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 px-4 md:px-6 pb-6 ">
      <div className="mx-auto max-w-7xl">
       

        {/* Header */}
        <div className=" flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Timetable Management
            </h2>
            <p className="text-base text-slate-500 font-medium flex items-center gap-2 text-sm">
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
                    onClick={() => setShowPublishModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    <FaCheck className="h-4 w-4" />
                    Publish
                  </button>
                ) : (
                  <button
                    onClick={() => setShowUnpublishModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
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
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
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
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all"
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
                    className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <FaPlus />
                    Add Period
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-200 p-3 text-left font-semibold text-slate-700 sticky left-0 bg-slate-50 z-10">
                        Day
                      </th>
                      {generateTableHeaders()}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day) => {
                      const positionedPeriods = getPositionedPeriodsForDay(day);
                      
                      return (
                        <tr key={day} className="hover:bg-slate-50">
                          <td className="border border-slate-200 p-3 font-semibold text-slate-700 sticky left-0 bg-white z-10">
                            {day}
                          </td>
                          {positionedPeriods.map((period, index) => (
                            <td key={index} className="border border-slate-200 p-2 text-center min-w-[120px]">
                              {period ? (
                                <PeriodCell
                                  period={period}
                                  isEditable={timetableData.status === "draft"}
                                  onEdit={() => openEditPeriod(day, period)}
                                  onDelete={() => {
                                    setPendingDelete({ day, periodId: period._id });
                                    setShowDeleteModal(true);
                                  }}
                                />
                              ) : (
                                timetableData.status === "draft" && (
                                  <button
                                    onClick={() => {
                                      // Calculate period number based on column index
                                      const weekdayEntry = timetableData.schedule?.find(s => s.day === "Monday");
                                      const lunchBreak = weekdayEntry?.periods?.find(p => p.isBreak);
                                      const lunchPosition = lunchBreak ? Math.floor(lunchBreak.periodNumber) : -1;
                                      
                                      let periodNumber;
                                      if (lunchPosition > -1 && index === lunchPosition) {
                                        // This is the lunch column
                                        periodNumber = lunchPosition + 0.5;
                                      } else if (lunchPosition > -1 && index > lunchPosition) {
                                        // After lunch column
                                        periodNumber = index;
                                      } else {
                                        // Before lunch column
                                        periodNumber = index + 1;
                                      }
                                      
                                      setEditingPeriod({ day, periodNumber });
                                      setShowPeriodModal(true);
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
            onSuccess={(templateData) => {
              if (timetableData) {
                setPendingTemplateData(templateData);
                setShowOverwriteModal(true);
              } else {
                executeTemplateCreation(templateData, false);
              }
            }}
          />
        )}

        {/* Modals */}
{showTemplateModal && selectedClass && selectedSection && (
  <GenerateTemplateModal
    sectionName={selectedSection}
    className={selectedClass.className}
    onClose={() => setShowTemplateModal(false)}
    onSuccess={(templateData) => {
      if (timetableData) {
        setPendingTemplateData(templateData);
        setShowOverwriteModal(true);
      } else {
        executeTemplateCreation(templateData, false);
      }
    }}
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

{/* Overwrite Confirmation Modal */}
{showOverwriteModal && (
  <OverwriteConfirmationModal
    onConfirm={handleOverwriteConfirm}
    onCancel={handleOverwriteCancel}
    className={selectedClass?.className}
    sectionName={selectedSection}
  />
)}

{/* Publish Confirmation Modal */}
{showPublishModal && (
  <ConfirmationModal
    title="Publish Timetable"
    message={`Are you sure you want to publish the timetable for ${selectedClass?.className} - Section ${selectedSection}? This will make it visible to students and teachers.`}
    confirmText="Publish"
    confirmColor="from-green-600 to-emerald-600"
    onConfirm={publishTimetable}
    onCancel={() => setShowPublishModal(false)}
  />
)}

{/* Unpublish Confirmation Modal */}
{showUnpublishModal && (
  <ConfirmationModal
    title="Move to Draft"
    message={`Are you sure you want to move the timetable for ${selectedClass?.className} - Section ${selectedSection} to draft? This will hide it from students and teachers.`}
    confirmText="Move to Draft"
    confirmColor="from-orange-600 to-red-600"
    onConfirm={unpublishTimetable}
    onCancel={() => setShowUnpublishModal(false)}
  />
)}

{/* Delete Period Confirmation Modal */}
{showDeleteModal && (
  <ConfirmationModal
    title="Delete Period"
    message="Are you sure you want to delete this period? This action cannot be undone."
    confirmText="Delete"
    confirmColor="from-red-600 to-pink-600"
    onConfirm={handleDeletePeriod}
    onCancel={() => {
      setShowDeleteModal(false);
      setPendingDelete({ day: "", periodId: "" });
    }}
  />
)}
      </div>
    </div>
  );
}

// PeriodCell Component
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

// NEW: Reusable Confirmation Modal Component
function ConfirmationModal({ title, message, confirmText, confirmColor, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl">
        <div className={`bg-gradient-to-r ${confirmColor} p-6 text-white`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <FaExclamationTriangle className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{title}</h3>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-700">{message}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3.5 rounded-xl border-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 py-3.5 rounded-xl bg-gradient-to-r ${confirmColor} font-semibold text-white shadow-lg hover:shadow-xl`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// UPDATED: GenerateTemplateModal Component with new design
function GenerateTemplateModal({ sectionName, className, onClose, onSuccess }) {
  const [form, setForm] = useState({
    startTime: "08:00",
    periodDuration: "45",
    periodsPerDay: "8",
    lunchAfter: "4",
    periodsSat: "5",
    lunchAfterSat: "3",
    lunchDuration: "30",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
          <div><h3 className="text-2xl font-black uppercase tracking-tight">Smart Timetable</h3><p className="text-slate-400 text-xs mt-1 uppercase tracking-widest">{className} - {sectionName}</p></div>
          <FaMagic className="text-red-500 text-2xl" />
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSuccess(form); }} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Day Start Time</label>
            <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Period Len (Min)</label>
            <input type="number" value={form.periodDuration} onChange={e => setForm({...form, periodDuration: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900" /></div>
          </div>

          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
             <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">Weekdays (Mon-Fri)</span>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Total Periods</label>
                <input type="number" value={form.periodsPerDay} onChange={e => setForm({...form, periodsPerDay: e.target.value})} className="w-full p-3 bg-white rounded-xl border-none font-bold shadow-sm" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Lunch After Per.</label>
                <input type="number" value={form.lunchAfter} onChange={e => setForm({...form, lunchAfter: e.target.value})} className="w-full p-3 bg-white rounded-xl border-none font-bold shadow-sm" /></div>
             </div>
          </div>

          <div className="p-6 bg-orange-50/50 rounded-[2rem] border border-orange-100 space-y-4">
             <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Saturday Schedule</span>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Total Periods</label>
                <input type="number" value={form.periodsSat} onChange={e => setForm({...form, periodsSat: e.target.value})} className="w-full p-3 bg-white rounded-xl border-none font-bold shadow-sm" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Lunch After Per.</label>
                <input type="number" value={form.lunchAfterSat} onChange={e => setForm({...form, lunchAfterSat: e.target.value})} className="w-full p-3 bg-white rounded-xl border-none font-bold shadow-sm" /></div>
             </div>
          </div>

          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Lunch duration (minutes)</label>
          <input type="number" value={form.lunchDuration} onChange={e => setForm({...form, lunchDuration: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900" /></div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-slate-400 uppercase text-xs tracking-widest hover:text-slate-600 transition-all">Discard</button>
            <button type="submit" className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-red-200 hover:shadow-2xl hover:bg-red-700 active:scale-95 transition-all">Generate & Sync Template</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// NEW: Overwrite Confirmation Modal Component
function OverwriteConfirmationModal({ onConfirm, onCancel, className, sectionName }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <FaExclamationTriangle className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Overwrite Existing Timetable</h3>
              <p className="text-sm opacity-90 mt-1">{className} - Section {sectionName}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <FaExclamationTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900">Important Warning</h4>
                <p className="text-sm text-amber-700 mt-1">
                  A timetable already exists for this class. Re-generating the template will:
                </p>
                <ul className="text-sm text-amber-700 mt-2 space-y-1 ml-4 list-disc">
                  <li>Erase all current period assignments</li>
                  <li>Remove all teacher allocations</li>
                  <li>Reset subjects to "N/A"</li>
                  <li>Apply the new schedule template structure</li>
                </ul>
              </div>
            </div>

            {/* <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-700">
                Are you sure you want to proceed? This action cannot be undone.
              </p>
            </div> */}
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3.5 rounded-xl border-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 font-semibold text-white shadow-lg hover:shadow-xl"
            >
              Overwrite Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// PeriodModal Component (unchanged, kept for reference)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 ">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto ">
        <div className="border-b border-slate-100 p-6 bg-gradient-to-r from-teal-50 to-cyan-50 sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{editingPeriod?._id ? "Edit Period" : "Add Period"}</h3>
              <p className="text-sm text-slate-600 mt-1">{form.day}</p>
            </div>
            <button onClick={onClose} className="rounded-xl bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-100 transition-all">
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
    <label className="block text-sm font-semibold text-slate-700 mb-2">Period Number</label>
    <input
      type="number"
      step="0.5"
      min="1"
      max="8.5"
      value={form.periodNumber}
      onChange={e => setForm({ ...form, periodNumber: e.target.value })}
      className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-teal-600 focus:outline-none"
      required
    />
    <p className="text-xs text-slate-500 mt-1">
      {form.isBreak 
        ? "Break periods use decimals (e.g., 4.5 for lunch after period 4)"
        : "Use whole numbers for regular periods"}
    </p>
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
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-teal-600 focus:outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">End Time</label>
              <input
                type="time"
                value={form.endTime}
                onChange={e => setForm({ ...form, endTime: e.target.value })}
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-teal-600 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Loading state */}
          {fetchLoading && (
            <div className="text-center py-4">
              <div className=" rounded-full h-6 w-6 border-2 border-teal-600 border-t-transparent mx-auto"></div>
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
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-teal-600 focus:outline-none transition-all"
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
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-teal-600 focus:outline-none transition-all"
                placeholder="e.g., Lunch Break, Recess"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || fetchLoading}
              className="flex-1 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
            >
              {loading ? "Saving..." : editingPeriod?._id ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}