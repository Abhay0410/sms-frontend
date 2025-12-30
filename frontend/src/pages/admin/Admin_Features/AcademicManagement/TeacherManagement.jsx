// pages/admin/Admin_Features/AcademicManagement/TeacherManagement.jsx
import { useEffect,useState, useCallback } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../../services/api";

import {
  FaUserTie,
  FaChalkboardTeacher,
  FaBook,
  FaClock,
  FaPlus,
  FaTimes,
  FaEdit,
  FaTrash,
  FaChartBar,
  FaExclamationTriangle,
} from "react-icons/fa";


export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentType, setAssignmentType] = useState(null);

  // ✅ Define loadData FIRST, before any useEffect that uses it
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log("🚀 STARTING DATA LOAD for academic year:", academicYear);

      // Debug: Check the exact URLs being called
      const teachersUrl = API_ENDPOINTS.ADMIN.TEACHER_MANAGEMENT.LIST + `?academicYear=${academicYear}`;
      const classesUrl = API_ENDPOINTS.ADMIN.CLASS.LIST + `?academicYear=${academicYear}`;
      
      console.log("🔗 API Endpoints:");
      console.log("  - Teachers:", teachersUrl);
      console.log("  - Classes:", classesUrl);

      let teachersResp = null;
      let classesResp = null;

      // Test Teachers API with individual try-catch
      try {
        console.log("📞 Calling Teachers API...");
        teachersResp = await api.get(teachersUrl);
        console.log("✅ TEACHERS API SUCCESS - Full Response:", teachersResp);
      } catch (teacherError) {
        console.error("❌ TEACHERS API FAILED:", teacherError);
        console.log("  - Error status:", teacherError.status);
        console.log("  - Error message:", teacherError.message);
        console.log("  - Error data:", teacherError.data);
      }

      // Test Classes API with individual try-catch
      try {
        console.log("📞 Calling Classes API...");
        classesResp = await api.get(classesUrl);
        console.log("✅ CLASSES API SUCCESS - Full Response:", classesResp);
      } catch (classError) {
        console.error("❌ CLASSES API FAILED:", classError);
        console.log("  - Error status:", classError.status);
        console.log("  - Error message:", classError.message);
        console.log("  - Error data:", classError.data);
      }

      // Extract data from successful responses
      let teacherList = [];
      let classList = [];

      // Extract teachers data
      if (teachersResp) {
        console.log("🔍 Teachers Response Analysis:");
        console.log("  - Has 'data':", !!teachersResp.data);
        console.log("  - Has 'data.teachers':", !!teachersResp.data?.teachers);
        console.log("  - Has 'teachers':", !!teachersResp.teachers);
        
        teacherList = teachersResp.data?.teachers || teachersResp.teachers || [];
      }

      // Extract classes data
      if (classesResp) {
        console.log("🔍 Classes Response Analysis:");
        console.log("  - Has 'data':", !!classesResp.data);
        console.log("  - Has 'classes':", !!classesResp.classes);
        console.log("  - Is Array:", Array.isArray(classesResp.data));
        
        classList = classesResp.data || classesResp.classes || classesResp || [];
      }

      console.log("🎯 FINAL DATA EXTRACTION:");
      console.log("  - Teachers found:", teacherList.length);
      console.log("  - Classes found:", classList.length);
      console.log("  - Teachers:", teacherList);
      console.log("  - Classes:", classList);

      setTeachers(teacherList);
      setClasses(classList);
      
    } catch (error) {
      console.error("💥 UNEXPECTED ERROR in loadData:", error);
      toast.error("Failed to load data");
      setTeachers([]);
      setClasses([]);
    } finally {
      setLoading(false);
      console.log("🏁 DATA LOADING COMPLETED");
    }
  }, [academicYear]);

  // ✅ Now useEffects can safely use loadData
  useEffect(() => {
    console.log("🔍 Current localStorage tokens:");
    console.log("  - adminToken:", localStorage.getItem('adminToken'));
    console.log("  - token:", localStorage.getItem('token'));
    console.log("  - userRole:", localStorage.getItem('userRole'));
  }, []);

  // ✅ Load data when component mounts or academicYear changes
  useEffect(() => {
    console.log("🔄 useEffect triggered - loading data");
    loadData();
  }, [loadData]);

  const openAssignModal = (teacher, type) => {
    setSelectedTeacher(teacher);
    setAssignmentType(type);
    setShowAssignModal(true);
  };

  // Debug: Check what's being rendered
  console.log("🎯 Current Teachers State:", teachers);
  console.log("🎯 Current Classes State:", classes);

  // ... rest of your component (the return statement and other code remains the same)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-slate-700">Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
       

        {/* Header */}
        <div className="mt-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
                Teacher Management
              </h2>
              <p className="text-base text-slate-600 flex items-center gap-2">
                <FaChalkboardTeacher className="text-purple-600" />
                Assign class teachers and subject teachers
              </p>
              {/* Debug Info */}
              <div className="text-xs text-gray-500">
                Found {teachers.length} teachers and {classes.length} classes
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="rounded-xl border-2 border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 shadow-sm transition-all hover:border-purple-400 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-none"
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          {teachers.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-purple-100 p-3">
                    <FaUserTie className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Teachers</p>
                    <p className="text-3xl font-bold text-slate-900">{teachers.length}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-blue-100 p-3">
                    <FaChalkboardTeacher className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Class Teachers</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {teachers.filter((t) => t.assignments?.classTeacher?.length > 0).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-green-100 p-3">
                    <FaBook className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Subject Teachers</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {teachers.filter((t) => t.assignments?.subjects?.length > 0).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Teachers Grid */}
        {teachers.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-white p-16 text-center shadow-lg border border-slate-100">
            <div className="mx-auto w-fit rounded-full bg-purple-50 p-6">
              <FaUserTie className="h-16 w-16 text-purple-400" />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-slate-900">No Teachers Found</h3>
            <p className="mt-3 text-base text-slate-600">
              No teachers found for academic year {academicYear}. 
              <br />
              Check if teachers are registered or try a different academic year.
            </p>
            <button 
              onClick={loadData}
              className="mt-4 rounded-lg bg-purple-600 px-6 py-3 text-white font-semibold hover:bg-purple-700"
            >
              Retry Loading
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {teachers.map((teacher) => (
              <TeacherCard
                key={teacher._id}
                teacher={teacher}
                onAssignClassTeacher={() => openAssignModal(teacher, "classTeacher")}
                onAssignSubject={() => openAssignModal(teacher, "subject")}
              />
            ))}
          </div>
        )}

        {/* Assignment Modal */}
        {showAssignModal && (
          <AssignmentModal
            teacher={selectedTeacher}
            classes={classes}
            type={assignmentType}
            academicYear={academicYear}
            onClose={() => {
              setShowAssignModal(false);
              setSelectedTeacher(null);
              setAssignmentType(null);
            }}
            onSuccess={() => {
              setShowAssignModal(false);
              loadData();
            }}
          />
        )}
      </div>
    </div>
  );
}


// Teacher Card Component
function TeacherCard({ teacher, onAssignClassTeacher, onAssignSubject }) {
  const workload = teacher.totalWorkload || 0;
  const maxWorkload = 30; // Maximum hours per week
  const workloadPercentage = (workload / maxWorkload) * 100;

  const isOverloaded = workload > maxWorkload;
  const isHighLoad = workload > maxWorkload * 0.8;

  return (
    <div className="group rounded-2xl border-2 border-slate-100 bg-white p-6 shadow-md transition-all hover:shadow-xl hover:border-purple-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-3 shadow-md">
            <FaUserTie className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{teacher.name}</h3>
            <p className="text-sm text-slate-500">{teacher.teacherID}</p>
          </div>
        </div>
        {isOverloaded && (
          <div className="rounded-lg bg-red-100 p-2">
            <FaExclamationTriangle className="h-5 w-5 text-red-600" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mb-4 space-y-2 text-sm">
        <p className="text-slate-600">
          <strong>Email:</strong> {teacher.email}
        </p>
        <p className="text-slate-600">
          <strong>Phone:</strong> {teacher.phone || "N/A"}
        </p>
        {teacher.department && (
          <p className="text-slate-600">
            <strong>Department:</strong> {teacher.department}
          </p>
        )}
      </div>

      {/* Workload */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
            <FaClock className="h-3 w-3" />
            Weekly Workload
          </span>
          <span
            className={`text-xs font-bold ${
              isOverloaded ? "text-red-600" : isHighLoad ? "text-orange-600" : "text-green-600"
            }`}
          >
            {workload}h / {maxWorkload}h
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              isOverloaded
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : isHighLoad
                ? "bg-gradient-to-r from-orange-500 to-orange-600"
                : "bg-gradient-to-r from-green-500 to-green-600"
            }`}
            style={{ width: `${Math.min(workloadPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Assignments */}
      <div className="space-y-3 mb-4">
        {/* Class Teacher */}
        {teacher.assignments?.classTeacher && teacher.assignments.classTeacher.length > 0 && (
          <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <FaChalkboardTeacher className="h-3 w-3" />
              Class Teacher
            </p>
            <div className="space-y-1">
              {teacher.assignments.classTeacher.map((ct, idx) => (
                <p key={idx} className="text-xs text-blue-800">
                  Class {ct.className} - {ct.section}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Subject Teacher */}
        {teacher.assignments?.subjects && teacher.assignments.subjects.length > 0 && (
          <div className="rounded-lg bg-green-50 p-3 border border-green-200">
            <p className="text-xs font-semibold text-green-900 mb-2 flex items-center gap-2">
              <FaBook className="h-3 w-3" />
              Subject Teacher ({teacher.assignments.subjects.length})
            </p>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {teacher.assignments.subjects.map((sub, idx) => (
                <p key={idx} className="text-xs text-green-800">
                  {sub.subject} - Class {sub.className}{sub.section} ({sub.hoursPerWeek}h)
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onAssignClassTeacher}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 hover:scale-105 flex items-center justify-center gap-2"
        >
          <FaPlus className="h-3 w-3" />
          Class Teacher
        </button>
        <button
          onClick={onAssignSubject}
          className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-green-700 hover:scale-105 flex items-center justify-center gap-2"
        >
          <FaPlus className="h-3 w-3" />
          Subject
        </button>
      </div>
    </div>
  );
}

// Assignment Modal Component
function AssignmentModal({ teacher, classes, type, onClose, onSuccess }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("5");
  const [loading, setLoading] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const classData = classes.find((c) => c._id === selectedClass);
  const availableSections = classData?.sections || [];

  // ✅ Fetch available subjects when section is selected
  useEffect(() => {
    const fetchAvailableSubjects = async () => {
      if (!selectedClass || !selectedSection || type !== "subject") {
        setAvailableSubjects([]);
        return;
      }

      try {
        setLoadingSubjects(true);
        const response = await api.get(
          `${API_ENDPOINTS.ADMIN.TEACHER_MANAGEMENT.AVAILABLE_SUBJECTS}?classId=${selectedClass}&sectionName=${selectedSection}`
        );
        
        const subjects = response?.data?.availableSubjects || response?.availableSubjects || [];
        setAvailableSubjects(subjects);
        
        console.log('📚 Available Subjects:', subjects);
        
        if (subjects.length === 0) {
          toast.info("No subjects available without teachers in this section");
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
        toast.error("Failed to load available subjects");
        setAvailableSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchAvailableSubjects();
  }, [selectedClass, selectedSection, type]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedClass || !selectedSection) {
      toast.error("Please select class and section");
      return;
    }

    if (type === "subject" && !selectedSubject) {
      toast.error("Please select a subject");
      return;
    }

    try {
      setLoading(true);

      const endpoint =
        type === "classTeacher"
          ? API_ENDPOINTS.ADMIN.TEACHER_MANAGEMENT.ASSIGN_CLASS_TEACHER
          : API_ENDPOINTS.ADMIN.TEACHER_MANAGEMENT.ASSIGN_SUBJECT_TEACHER;

      const payload =
        type === "classTeacher"
          ? {
              classId: selectedClass,
              sectionName: selectedSection,
              teacherId: teacher._id,
            }
          : {
              classId: selectedClass,
              sectionName: selectedSection,
              subjectName: selectedSubject,
              teacherId: teacher._id,
              hoursPerWeek: parseInt(hoursPerWeek),
            };

      await api.put(endpoint, payload);

      toast.success(
        type === "classTeacher"
          ? "Class teacher assigned successfully"
          : "Subject teacher assigned successfully"
      );

      onSuccess();
    } catch (error) {
      toast.error(error.message || "Failed to assign teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 p-6 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {type === "classTeacher" ? "Assign Class Teacher" : "Assign Subject Teacher"}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Teacher: <span className="font-semibold text-purple-600">{teacher.name}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl bg-white p-2 text-slate-600 shadow-sm transition-all hover:bg-slate-100 hover:rotate-90"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select Class <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection("");
                setSelectedSubject("");
                setAvailableSubjects([]);
              }}
              className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 font-medium transition-all focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-none"
              required
            >
              <option value="">Choose a class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  Class {cls.className} ({cls.academicYear})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select Section <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedSubject("");
              }}
              className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 font-medium transition-all focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-none"
              required
              disabled={!selectedClass}
            >
              <option value="">Choose a section</option>
              {availableSections.map((section) => (
                <option key={section._id} value={section.sectionName}>
                  Section {section.sectionName}
                </option>
              ))}
            </select>
          </div>

          {type === "subject" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Subject <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    // Auto-fill hours per week if available
                    const subject = availableSubjects.find(s => s.subjectName === e.target.value);
                    if (subject && subject.hoursPerWeek) {
                      setHoursPerWeek(subject.hoursPerWeek.toString());
                    }
                  }}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 font-medium transition-all focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-none"
                  required
                  disabled={!selectedSection || loadingSubjects}
                >
                  <option value="">
                    {loadingSubjects 
                      ? "Loading subjects..." 
                      : !selectedSection 
                      ? "Select a section first" 
                      : availableSubjects.length === 0 
                      ? "No subjects available" 
                      : "Choose a subject"}
                  </option>
                  {availableSubjects.map((subject) => (
                    <option key={subject._id} value={subject.subjectName}>
                      {subject.subjectName} {subject.subjectCode ? `(${subject.subjectCode})` : ''}
                    </option>
                  ))}
                </select>
                {selectedSection && !loadingSubjects && availableSubjects.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                    <FaExclamationTriangle className="h-3 w-3" />
                    All subjects in this section already have teachers assigned
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Hours Per Week
                </label>
                <input
                  type="number"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 p-3 transition-all focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-none"
                  min="1"
                  max="10"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (type === "subject" && availableSubjects.length === 0)}
              className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Assigning..." : "Assign Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
