import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import BackButton from "../../../../components/BackButton";
import { API_ENDPOINTS } from "../../../.././/constants/apiEndpoints";
import {
  FaBook,
  FaPlus,
  FaTimes,
  FaTrash,
  FaLayerGroup,
  FaChalkboard,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaSync,
  FaArrowRight,
  FaExclamationTriangle,
} from "react-icons/fa";

const noScrollStyle = `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`;

export default function SubjectManagement() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [subjectData, setSubjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [selectedSubjectsSet, setSelectedSubjectsSet] = useState(new Set());
  const [selectedSection, setSelectedSection] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState(null);

  const scrollContainerRef = useRef(null);

  function getCurrentAcademicYear() {
    const now = new Date();
    return now.getMonth() >= 3
      ? `${now.getFullYear()}-${now.getFullYear() + 1}`
      : `${now.getFullYear() - 1}-${now.getFullYear()}`;
  }

  const academicYears = useMemo(() => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = -1; i < 4; i++)
      years.push(`${currentYear + i}-${currentYear + i + 1}`);
    return years;
  }, []);

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(
        `${API_ENDPOINTS.ADMIN.CLASS.STATISTICS}?academicYear=${academicYear}`,
      );
      const classList = response?.data || response || [];

      
      const sortedClasses = [...classList].sort((a, b) => {
  const parseClass = (name) => {
    // "Class 11 Science" → [11, "Science"]
    const match = name.match(/Class\s+(\d+)\s*(.*)/i);
    return {
      grade: match ? parseInt(match[1], 10) : 0,
      stream: match ? match[2].trim() : "",
    };
  };

  const A = parseClass(a.className);
  const B = parseClass(b.className);

  // 1️⃣ Numeric class order
  if (A.grade !== B.grade) return A.grade - B.grade;

  // 2️⃣ Stream order (Arts → Commerce → Science)
  const streamOrder = ["Arts", "Commerce", "Science"];
  return (
    streamOrder.indexOf(A.stream) -
    streamOrder.indexOf(B.stream)
  );
});

setClasses(sortedClasses);

if (sortedClasses.length > 0 && !selectedClass)
  setSelectedClass(sortedClasses[0]);

      if (classList.length > 0 && !selectedClass)
        setSelectedClass(classList[0]);
    } catch (err) {
      console.error("❌ Load classes error:", err);
      setError(err.message);
      toast.error("Failed to load grade structure");
    } finally {
      setLoading(false);
    }
  }, [academicYear, selectedClass]);

  const loadSubjects = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const resp = await api.get(
        API_ENDPOINTS.ADMIN.SUBJECT_MANAGEMENT.CLASS(selectedClass._id),
      );
      setSubjectData(resp?.data || resp);
      setSelectedSubjectsSet(new Set());
      setSelectedSection("");
    } catch (e) {
      console.error("Load Error", e);
      toast.error("Failed to load subjects");
    }
  }, [selectedClass]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);
  useEffect(() => {
    if (selectedClass) loadSubjects();
  }, [selectedClass, loadSubjects]);

  const toggleSubjectSelection = (name) => {
    setSelectedSubjectsSet((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleAssign = async () => {
    if (!selectedSection) return toast.error("Select a section first");
    if (selectedSubjectsSet.size === 0)
      return toast.warning("Select subjects from Master Pool");
    try {
      setAssignLoading(true);
      for (const name of Array.from(selectedSubjectsSet)) {
        await api.post(API_ENDPOINTS.ADMIN.SUBJECT_MANAGEMENT.ADD_TO_SECTIONS, {
          classId: selectedClass._id,
          sectionNames: [selectedSection],
          subject: { subjectName: name, hoursPerWeek: 5 },
        });
      }
      toast.success(
        `Assigned ${selectedSubjectsSet.size} subjects to section ${selectedSection}`,
      );
      loadSubjects();
    } catch (e) {
      toast.error(e.message || "Assignment failed");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveFromMaster = async (e, subjectName) => {
    e.stopPropagation(); // Prevent toggling selection when clicking delete
    if (
      !window.confirm(
        `Permanently delete "${subjectName}" from the Class Master Pool? This will remove it from all sections too.`,
      )
    )
      return;

    try {
      await api.delete(
        API_ENDPOINTS.ADMIN.SUBJECT_MANAGEMENT.REMOVE_FROM_POOL,
        {
          data: {
            classId: selectedClass._id,
            subjectName: subjectName,
          },
        },
      );
      toast.success("Removed from Class Master Pool");
      loadSubjects(); // Refresh UI
    } catch (err) {
      toast.error(err.message || "Failed to remove master subject");
    }
  };

  const scrollTabs = (direction) => {
    if (scrollContainerRef.current) {
      const amt = direction === "left" ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: amt, behavior: "smooth" });
    }
  };

  if (error && classes.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-8">
        <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md text-center">
          <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Failed to Load Data
          </h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => loadClasses()}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

   const orderedSections = subjectData?.sections
    ? [
        ...subjectData.sections.filter(
          (s) => s.sectionName === selectedSection
        ),
        ...subjectData.sections.filter(
          (s) => s.sectionName !== selectedSection
        ),
      ]
    : [];

  if (loading && classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-orange-200"></div>
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-orange-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-orange-600 font-semibold animate-pulse">
          Loading academic structure...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 md:px-6 pb-6 ">
      <style>{noScrollStyle}</style>
      <div className="mx-auto max-w-7xl">
        <BackButton to="/admin/admin-dashboard" />

        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between  mt-1.5">
          <div>
            <h1 className="text-4xl  font-extrabold text-slate-900 tracking-tight">
              Curriculum Planner
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Configure master curriculum for {academicYear}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              disabled={!selectedClass}
              className="bg-orange-600 px-8 py-4 font-black text-white rounded-[1.5rem] shadow-xl shadow-orange-100 hover:bg-orange-700 active:scale-95 transition-all flex items-center gap-2 text-xs tracking-widest uppercase"
            >
              <FaPlus /> New Master Subject
            </button>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="rounded-2xl border-2 border-slate-100 bg-white px-6 py-3 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-orange-50"
            >
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ===== CLASS & SECTION SELECTOR CARDS ===== */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ===== CLASS CARD ===== */}
          <div
            className={`relative bg-white p-10 rounded-[3rem] border overflow-hidden transition-all
      ${
        selectedClass
          ? "border-orange-400 shadow-xl"
          : "border-dashed border-orange-200 bg-orange-50/30"
      }
    `}
          >
            <div className="absolute top-0 left-0 h-1 w-full rounded-t-[3rem] bg-gradient-to-r from-orange-500 to-red-400" />

            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center shadow-md">
                <FaChalkboard />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Academic Grade
                </p>
                <h3 className="text-xl font-black text-slate-900">
                  {selectedClass ? selectedClass.className : "Select Grade"}
                </h3>
              </div>
            </div>

            <select
              value={selectedClass?._id || ""}
              onChange={(e) => {
                const cls = classes.find((c) => c._id === e.target.value);
                setSelectedClass(cls);
              }}
              className="w-full rounded-2xl border-2 border-orange-200 p-5 font-black
      text-slate-800 focus:ring-4 focus:ring-orange-100 focus:border-orange-400"
            >
              <option value="" disabled>
                Select Class
              </option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className}
                </option>
              ))}
            </select>
          </div>

          {/* ===== SECTION CARD ===== */}
          <div
            className={`relative bg-white p-10 rounded-[3rem]  overflow-hidden border transition-all 
            ${
              selectedSection
                ? "border-indigo-500 shadow-lg"
                : "border border-indigo-300 bg-indigo-50/30"
            }
          `}
          >
            <div className="absolute top-0 left-0 h-1 w-full rounded-t-[2rem] bg-gradient-to-r from-indigo-500 to-blue-400"/>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center shadow-md">
                <FaLayerGroup />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Select Section
                </p>
                <h3 className="text-xl font-black text-slate-900">
                  {selectedSection
                    ? `Section ${selectedSection}`
                    : "Choose Section"}
                </h3>
              </div>
            </div>

            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!subjectData?.sections?.length}
              className="w-full rounded-2xl border-2 border-indigo-200 p-5 font-black
      text-slate-800 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400"
            >
              <option value="">Select Section</option>
              {subjectData?.sections?.map((sec) => (
                <option key={sec.sectionName} value={sec.sectionName}>
                  Section {sec.sectionName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grade Scroller */}
        {/* <div className="mt-12 relative group">
          <button 
            onClick={() => scrollTabs('left')} 
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-white shadow-lg rounded-full flex items-center justify-center text-slate-400 hover:text-orange-600 opacity-0 group-hover:opacity-100 border border-slate-100 transition-all hover:shadow-xl"
          >
            <FaChevronLeft />
          </button>
          
          <div 
            ref={scrollContainerRef} 
            className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1"
          >
            {classes.map((cls) => (
              <button
                key={cls._id}
                onClick={() => setSelectedClass(cls)}
                className={`flex-shrink-0 min-w-[170px] rounded-[1.8rem] py-5 px-6 font-black text-xs uppercase tracking-widest transition-all duration-500 border-2 ${
                  selectedClass?._id === cls._id
                    ? "bg-gradient-to-r from-orange-600 to-red-600 border-orange-600 text-white shadow-2xl scale-105"
                    : "bg-white border-slate-100 text-slate-500 hover:border-orange-200 hover:shadow-md"
                }`}
              >
                {cls.className}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => scrollTabs('right')} 
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-white shadow-lg rounded-full flex items-center justify-center text-slate-400 hover:text-orange-600 opacity-0 group-hover:opacity-100 border border-slate-100 transition-all hover:shadow-xl"
          >
            <FaChevronRight />
          </button>
        </div> */}

        {/* Workspace area */}
        {selectedClass && subjectData && (
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sidebar Pool */}
            <div className="lg:col-span-4">
              <div className="rounded-[3rem] bg-white p-10 shadow-sm border border-slate-100 sticky top-10 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <FaLayerGroup className="text-orange-600" /> Master Pool
                  </h3>
                  <span className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center text-xs font-black text-orange-600">
                    {subjectData.availableSubjects?.length || 0}
                  </span>
                </div>

                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full rounded-2xl border-2 border-slate-100 p-5 mb-6 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-orange-50 bg-slate-50"
                >
                  <option value="">Select Target Section</option>
                  {subjectData.sections?.map((s) => (
                    <option key={s.sectionName} value={s.sectionName}>
                      Section {s.sectionName}
                    </option>
                  ))}
                </select>

                {/* 🔥 SCROLLABLE MASTER POOL CONTAINER */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto no-scrollbar mb-8 pr-2">
                  {subjectData.availableSubjects?.length > 0 ? (
                    subjectData.availableSubjects.map((sub) => (
                      <div
                        key={sub.subjectName}
                        onClick={() => toggleSubjectSelection(sub.subjectName)}
                        className={`group/master flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all cursor-pointer ${
                          selectedSubjectsSet.has(sub.subjectName)
                            ? "border-orange-500 bg-gradient-to-r from-orange-50/50 to-red-50/50 shadow-md"
                            : "border-transparent bg-slate-50 hover:bg-white hover:border-orange-100"
                        }`}
                      >
                        <div
                          className={`h-6 w-6 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                            selectedSubjectsSet.has(sub.subjectName)
                              ? "bg-gradient-to-r from-orange-500 to-red-500 border-orange-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {selectedSubjectsSet.has(sub.subjectName) && (
                            <FaCheckCircle size={12} />
                          )}
                        </div>

                        <div className="flex-1 truncate">
                          <span className="font-black text-slate-700 text-sm uppercase tracking-tight block truncate">
                            {sub.subjectName}
                          </span>
                        </div>

                        {/* 🔥 MASTER DELETE BUTTON */}
                        <button
                          onClick={(e) =>
                            handleRemoveFromMaster(e, sub.subjectName)
                          }
                          className="opacity-0 group-hover/master:opacity-100 p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete from Master Pool"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center opacity-30 italic">
                      Pool Empty
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-[2rem] text-white text-center shadow-lg">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Ready to Allot
                  </span>
                  <span className="text-3xl font-black">
                    {selectedSubjectsSet.size}
                  </span>
                </div>

                <button
                  disabled={
                    !selectedSection ||
                    selectedSubjectsSet.size === 0 ||
                    assignLoading
                  }
                  onClick={handleAssign}
                  className="w-full mt-6 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 py-5 text-white font-black uppercase text-xs tracking-widest hover:opacity-90 disabled:opacity-30 transition-all shadow-xl active:scale-95"
                >
                  {assignLoading
                    ? "Processing..."
                    : `Assign to Section ${selectedSection}`}
                </button>
              </div>
            </div>

            {/* Sections Content Areas */}
            <div className="lg:col-span-8 space-y-10">
              {subjectData.sections?.length > 0 ? (
               orderedSections.map((section) => (

                  <div
                    key={section.sectionName}
                    className="rounded-[3.5rem] bg-white p-12 shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 group"
                  >
                    <div className="flex items-center justify-between mb-10 pb-8 border-b border-slate-50">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 text-orange-600 flex items-center justify-center text-xl font-black shadow-inner">
                          {section.sectionName}
                        </div>
                        <div>
                          <h4 className="text-3xl font-black text-slate-900 tracking-tight">
                            Section {section.sectionName}
                          </h4>
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">
                            {section.subjects?.length || 0} Curriculum Items
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {section.subjects?.map((sub) => (
                        <div
                          key={sub._id}
                          className="flex items-center justify-between p-6 rounded-[2rem] bg-gradient-to-br from-slate-50 to-white border-2 border-transparent hover:border-orange-200 hover:bg-white transition-all shadow-sm group-hover/item"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl shadow-sm flex items-center justify-center">
                              <FaBook />
                            </div>
                            <div>
                              <p className="font-black text-slate-800 text-sm uppercase">
                                {sub.subjectName}
                              </p>
                              <div className="flex items-center gap-2">
                                {sub.subjectCode && (
                                  <span className="text-xs text-slate-400 font-medium">
                                    {sub.subjectCode}
                                  </span>
                                )}
                                <span className="text-xs text-slate-400 font-bold uppercase">
                                  {sub.hoursPerWeek || 5}h / Week
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  `Remove ${sub.subjectName} from Section ${section.sectionName}?`,
                                )
                              )
                                return;
                              try {
                                await api.delete(
                                  API_ENDPOINTS.ADMIN.SUBJECT_MANAGEMENT
                                    .REMOVE_FROM_SECTIONS,
                                  {
                                    data: {
                                      classId: selectedClass._id,
                                      sectionNames: [section.sectionName],
                                      subjectName: sub.subjectName,
                                    },
                                  },
                                );
                                toast.success("Subject removed successfully");
                                loadSubjects();
                              } catch {
                                toast.error("Failed to remove subject");
                              }
                            }}
                            className="p-2 text-slate-300 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-32 text-center bg-gradient-to-b from-white to-slate-50 rounded-[4rem] border-4 border-dashed border-slate-200">
                  <FaChalkboard
                    size={64}
                    className="mx-auto mb-4 text-slate-300"
                  />
                  <p className="font-black uppercase tracking-[0.2em] text-xs text-slate-400">
                    Provision sections in Class Manager first
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty states for when no class is selected */}
        {!selectedClass && classes.length > 0 && (
          <div className="mt-12 text-center py-16 bg-gradient-to-b from-slate-50 to-white rounded-3xl border border-slate-200">
            <div className="h-24 w-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FaChalkboard className="h-12 w-12 text-orange-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-400 mb-3">
              Select a Grade
            </h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Choose a grade from above to view and manage its curriculum
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddSubjectModal
          classId={selectedClass?._id}
          className={selectedClass?.className}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadSubjects();
          }}
        />
      )}
    </div>
  );
}

function AddSubjectModal({ classId, className, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    subjectName: "",
    subjectCode: "",
    isCore: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Updated backend logic
      await api.post(API_ENDPOINTS.ADMIN.SUBJECT_MANAGEMENT.ADD, {
        classId,
        sectionName: "A",
        subject: {
          subjectName: form.subjectName,
          subjectCode: form.subjectCode || "",
          isCore: form.isCore,
        },
      });
      toast.success("Added to Master Pool");
      onSuccess();
    } catch (error) {
      toast.error(error.message || "Conflict Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-[3.5rem] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-10 text-white flex justify-between items-center">
          <div>
            <h3 className="text-3xl font-black uppercase tracking-tight">
              Provision Subject
            </h3>
            <p className="text-orange-400 text-xs font-bold uppercase mt-1">
              Registry for {className}
            </p>
          </div>
          <FaBook size={30} className="text-white opacity-20" />
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">
              Formal Label
            </label>
            <input
              name="subjectName"
              value={form.subjectName}
              onChange={(e) =>
                setForm({ ...form, subjectName: e.target.value })
              }
              required
              autoFocus
              placeholder="e.g. Physics, History"
              className="w-full p-6 bg-slate-50 rounded-[1.8rem] border-2 border-slate-200 font-black text-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all text-slate-900 shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">
              Subject Code (Optional)
            </label>
            <input
              name="subjectCode"
              value={form.subjectCode}
              onChange={(e) =>
                setForm({ ...form, subjectCode: e.target.value })
              }
              placeholder="e.g. PHY-101, HIS-201"
              className="w-full p-6 bg-slate-50 rounded-[1.8rem] border-2 border-slate-200 font-black text-lg outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all text-slate-900 shadow-inner"
              maxLength={20}
            />
          </div>

          <label className="flex items-center gap-5 p-6 bg-slate-50 rounded-[1.8rem] cursor-pointer hover:bg-slate-100 transition-all shadow-sm group">
            <input
              name="isCore"
              type="checkbox"
              checked={form.isCore}
              onChange={(e) => setForm({ ...form, isCore: e.target.checked })}
              className="h-6 w-6 accent-orange-600 group-hover:scale-110 transition-transform"
            />
            <span className="text-xs font-black uppercase text-slate-600 tracking-widest">
              Mandatory core curriculum
            </span>
          </label>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-5 font-black text-slate-400 uppercase text-xs tracking-widest hover:text-slate-900 transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-[1.5rem] font-black uppercase text-xs shadow-xl active:scale-95 transition-all hover:opacity-90 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Validating...
                </>
              ) : (
                <>
                  Confirm Provision <FaArrowRight />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
