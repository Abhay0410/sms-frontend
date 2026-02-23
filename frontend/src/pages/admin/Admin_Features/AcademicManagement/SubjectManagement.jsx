import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import {
  FaBook,
  FaPlus,
  FaTimes,
  FaTrash,
  FaLayerGroup,
  FaChalkboard,
  FaCheckCircle,
  FaArrowRight,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaDownload,
  FaPrint,
  FaStar,
  FaRegStar,
  FaClock,
  FaChevronDown,
  FaCheck,
  FaInfoCircle,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

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
          const match = name.match(/Class\s+(\d+)\s*(.*)/i);
          return {
            grade: match ? parseInt(match[1], 10) : 0,
            stream: match ? match[2].trim() : "",
          };
        };

        const A = parseClass(a.className);
        const B = parseClass(b.className);

        if (A.grade !== B.grade) return A.grade - B.grade;

        const streamOrder = ["Arts", "Commerce", "Science"];
        return streamOrder.indexOf(A.stream) - streamOrder.indexOf(B.stream);
      });

      setClasses(sortedClasses);

      if (sortedClasses.length > 0) {
        setSelectedClass((prev) => prev || sortedClasses[0]);
      }
    } catch (err) {
      console.error("❌ Load classes error:", err);
      setError(err.message);
      toast.error("Failed to load grade structure");
    } finally {
      setLoading(false);
    }
  }, [academicYear]);

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

  // Filter available subjects
  const filteredSubjects = useMemo(() => {
    if (!subjectData?.availableSubjects) return [];
    
    return subjectData.availableSubjects.filter(sub => {
      const matchesSearch = searchTerm === "" || 
        sub.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.subjectCode && sub.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = filterType === "all" || 
        (filterType === "core" && sub.isCore) ||
        (filterType === "elective" && !sub.isCore);
      
      return matchesSearch && matchesType;
    });
  }, [subjectData, searchTerm, filterType]);

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
      setSelectedSubjectsSet(new Set());
    } catch (e) {
      toast.error(e.message || "Assignment failed");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveFromMaster = async (e, subjectName) => {
    e.stopPropagation();
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
      loadSubjects();
    } catch (err) {
      toast.error(err.message || "Failed to remove master subject");
    }
  };

  const handleSelectAll = () => {
    const allSubjectNames = filteredSubjects.map(s => s.subjectName);
    setSelectedSubjectsSet(new Set(allSubjectNames));
  };

  const handleClearSelection = () => {
    setSelectedSubjectsSet(new Set());
  };

  if (error && classes.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center border border-slate-200">
          <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Failed to Load Data
          </h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => loadClasses()}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:opacity-90 transition-all font-medium"
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 space-y-4">
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
    <div className="min-h-screen bg-slate-50 px-4 md:px-8 pb-10">
      <style>{noScrollStyle}</style>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="pt-4 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                Curriculum Planner
              </h1>
              <p className="text-slate-500 text-sm font-medium mt-1">
                Configure master curriculum for {academicYear}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white"
              >
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowAddModal(true)}
                disabled={!selectedClass}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50"
              >
                <FaPlus size={14} />
                New Subject
              </button>
            </div>
          </div>
        </div>

        {/* Class & Section Selection Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Class Card */}
          <div className={`bg-white rounded-xl border p-5 transition-all ${
            selectedClass ? 'border-orange-300 shadow-md' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                selectedClass ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' : 'bg-orange-50 text-orange-600'
              }`}>
                <FaChalkboard size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Select Grade</h3>
                <p className="text-xs text-slate-500">Choose a class to manage</p>
              </div>
            </div>
            
            <div className="relative">
              <select
                value={selectedClass?._id || ""}
                onChange={(e) => {
                  const cls = classes.find((c) => c._id === e.target.value);
                  setSelectedClass(cls);
                }}
                className="w-full appearance-none bg-white border border-slate-200 text-slate-800 py-3 px-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              >
                <option value="" disabled>Select a class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.className} ({cls.sections?.length || 0} sections)
                  </option>
                ))}
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            </div>
          </div>

          {/* Section Card */}
          <div className={`bg-white rounded-xl border p-5 transition-all ${
            selectedSection ? 'border-orange-300 shadow-md' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                selectedSection ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' : 'bg-orange-50 text-orange-600'
              }`}>
                <FaLayerGroup size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Select Section</h3>
                <p className="text-xs text-slate-500">Choose a section to assign subjects</p>
              </div>
            </div>
            
            <div className="relative">
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!subjectData?.sections?.length}
                className="w-full appearance-none bg-white border border-slate-200 text-slate-800 py-3 px-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Select a section</option>
                {subjectData?.sections?.map((sec) => (
                  <option key={sec.sectionName} value={sec.sectionName}>
                    Section {sec.sectionName} • {sec.subjects?.length || 0} subjects
                  </option>
                ))}
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        {selectedClass && subjectData ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Master Pool Sidebar */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-6">
                {/* Header */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <FaLayerGroup className="text-orange-600" />
                      Master Subject Pool
                    </h3>
                    <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full font-medium">
                      {filteredSubjects.length} subjects
                    </span>
                  </div>
                  
                  {/* Search & Filters */}
                  <div className="space-y-3">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                      <input
                        type="text"
                        placeholder="Search subjects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white"
                      >
                        <option value="all">All Subjects</option>
                        <option value="core">Core Subjects</option>
                        <option value="elective">Electives</option>
                      </select>
                      
                      {filteredSubjects.length > 0 && (
                        <button
                          onClick={handleSelectAll}
                          className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50"
                        >
                          Select All
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subject List */}
                <div className="p-5">
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {filteredSubjects.length > 0 ? (
                      filteredSubjects.map((sub) => (
                        <div
                          key={sub.subjectName}
                          onClick={() => toggleSubjectSelection(sub.subjectName)}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                            selectedSubjectsSet.has(sub.subjectName)
                              ? "bg-orange-50 border-orange-200"
                              : "border-transparent hover:bg-slate-50 hover:border-slate-200"
                          }`}
                        >
                          <div className={`h-5 w-5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                            selectedSubjectsSet.has(sub.subjectName)
                              ? "bg-gradient-to-r from-orange-500 to-red-500 border-orange-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}>
                            {selectedSubjectsSet.has(sub.subjectName) && <FaCheck size={10} />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-slate-800 truncate">
                                {sub.subjectName}
                              </span>
                              {sub.isCore ? (
                                <FaStar className="text-amber-400 flex-shrink-0" size={10} />
                              ) : (
                                <FaRegStar className="text-slate-300 flex-shrink-0" size={10} />
                              )}
                            </div>
                            {sub.subjectCode && (
                              <p className="text-xs text-slate-500 font-mono">{sub.subjectCode}</p>
                            )}
                          </div>

                          <button
                            onClick={(e) => handleRemoveFromMaster(e, sub.subjectName)}
                            className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          >
                            <FaTrash size={10} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <FaBook className="text-3xl text-slate-200 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">No subjects found</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selection Summary */}
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
                  {selectedSubjectsSet.size > 0 && (
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-slate-600">
                        {selectedSubjectsSet.size} subject{selectedSubjectsSet.size > 1 ? 's' : ''} selected
                      </span>
                      <button
                        onClick={handleClearSelection}
                        className="text-xs text-slate-400 hover:text-slate-600 underline"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  <button
                    disabled={!selectedSection || selectedSubjectsSet.size === 0 || assignLoading}
                    onClick={handleAssign}
                    className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {assignLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Assigning...
                      </>
                    ) : (
                      <>
                        Assign to Section {selectedSection}
                        <FaArrowRight size={12} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Sections Content Area */}
            <div className="lg:col-span-8 space-y-4">
              {orderedSections.length > 0 ? (
                orderedSections.map((section) => (
                  <SectionCard
                    key={section.sectionName}
                    section={section}
                    classId={selectedClass._id}
                    onRemove={async (subjectName) => {
                      if (!window.confirm(`Remove ${subjectName} from Section ${section.sectionName}?`))
                        return;
                      try {
                        await api.delete(
                          API_ENDPOINTS.ADMIN.SUBJECT_MANAGEMENT.REMOVE_FROM_SECTIONS,
                          {
                            data: {
                              classId: selectedClass._id,
                              sectionNames: [section.sectionName],
                              subjectName: subjectName,
                            },
                          },
                        );
                        toast.success("Subject removed successfully");
                        loadSubjects();
                      } catch {
                        toast.error("Failed to remove subject");
                      }
                    }}
                    isActive={section.sectionName === selectedSection}
                  />
                ))
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaChalkboard className="text-3xl text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">No Sections Found</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Create sections in Class Management first to assign subjects
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaChalkboard className="text-4xl text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Grade Selected</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Please select a grade from the dropdown above to view and manage its curriculum
            </p>
          </div>
        )}
      </div>

      {/* Add Subject Modal */}
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

// Section Card Component
function SectionCard({ section, onRemove, isActive }) {
  return (
    <div className={`bg-white rounded-xl border transition-all ${
      isActive ? 'border-orange-300 shadow-md' : 'border-slate-200 hover:shadow-sm'
    }`}>
      {/* Header */}
      <div className={`px-5 py-4 border-b ${isActive ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              isActive ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              <span className="text-sm font-bold">{section.sectionName}</span>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800">Section {section.sectionName}</h4>
              <p className="text-xs text-slate-500">
                {section.subjects?.length || 0} subject{section.subjects?.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {isActive && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
              Active
            </span>
          )}
        </div>
      </div>

      {/* Subject List */}
      <div className="p-5">
        {section.subjects?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {section.subjects.map((sub) => (
              <div
                key={sub._id}
                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-orange-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <FaBook className="text-white text-xs" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-800">{sub.subjectName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {sub.subjectCode && (
                        <span className="text-xs text-slate-500 font-mono">{sub.subjectCode}</span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <FaClock size={10} />
                        {sub.hoursPerWeek || 5}h
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(sub.subjectName)}
                  className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <FaBook className="text-2xl text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No subjects assigned</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Add Subject Modal
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
      toast.error(error.message || "Failed to add subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Add New Subject</h3>
              <p className="text-slate-400 text-sm mt-1">to Master Pool • {className}</p>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.subjectName}
              onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
              placeholder="e.g. Physics, History"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Subject Code <span className="text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              value={form.subjectCode}
              onChange={(e) => setForm({ ...form, subjectCode: e.target.value })}
              placeholder="e.g. PHY-101"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <input
              type="checkbox"
              id="isCore"
              checked={form.isCore}
              onChange={(e) => setForm({ ...form, isCore: e.target.checked })}
              className="h-4 w-4 text-orange-600 rounded focus:ring-orange-200"
            />
            <label htmlFor="isCore" className="text-sm text-slate-700">
              Core Subject (mandatory for all sections)
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-all text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  Add Subject
                  <FaPlus size={12} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}