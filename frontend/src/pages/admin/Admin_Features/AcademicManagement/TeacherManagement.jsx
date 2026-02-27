// pages/admin/Admin_Features/AcademicManagement/TeacherManagement.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../../services/api";
import {
  FaUserTie,
  FaChalkboardTeacher,
  FaBook,
  FaTimes,
  FaFilter,
  FaSearch,
  FaSync,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

const DEPARTMENTS = [
  "All",
  "Mathematics",
  "Science",
  "Languages",
  "Social Science",
  "Computer Science",
  "Environmental Studies",
  "Physical Education",
  "Arts & Craft",
  "Music",
  "Library",
  "Primary Education",
];

const API_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentType, setAssignmentType] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      const teachersUrl = `${API_ENDPOINTS.ADMIN.TEACHER_MANAGEMENT.LIST}?academicYear=${academicYear}`;
      const classesUrl = `${API_ENDPOINTS.ADMIN.CLASS.LIST}?academicYear=${academicYear}`;

      const [teachersResp, classesResp] = await Promise.allSettled([
        api.get(teachersUrl),
        api.get(classesUrl)
      ]);

      let teacherList = [];
      let classList = [];

      if (teachersResp.status === 'fulfilled') {
        teacherList = teachersResp.value.data?.teachers || teachersResp.value.teachers || [];
      }

      if (classesResp.status === 'fulfilled') {
        classList = classesResp.value.data || classesResp.value.classes || classesResp.value || [];
      }

      setTeachers(teacherList);
      setClasses(classList);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [academicYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAssignModal = (teacher, type) => {
    setSelectedTeacher(teacher);
    setAssignmentType(type);
    setShowAssignModal(true);
  };

  // Filter teachers based on department and search
  const filteredTeachers = useMemo(() => {
    return teachers
      .filter((teacher) =>
        selectedDepartment === "All" || teacher.department === selectedDepartment
      )
      .filter((teacher) =>
        searchQuery === "" ||
        teacher.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.teacherID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [teachers, selectedDepartment, searchQuery]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = teachers.length;
    const withClassTeacher = teachers.filter(t => 
      t.assignedClasses?.some(ac => ac.isClassTeacher)
    ).length;
    const withSubject = teachers.filter(t => 
      t.assignedClasses?.length > 0
    ).length;
    const unassigned = teachers.filter(t => 
      !t.assignedClasses || t.assignedClasses.length === 0
    ).length;
    
    const departmentCounts = {};
    teachers.forEach(t => {
      if (t.department) {
        departmentCounts[t.department] = (departmentCounts[t.department] || 0) + 1;
      }
    });

    return { total, withClassTeacher, withSubject, unassigned, departmentCounts };
  }, [teachers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-indigo-100"></div>
            <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-slate-700">Loading teachers...</p>
          <p className="text-sm text-slate-500 mt-2">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 md:px-8 pb-10 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="pt-10 pb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 transform -rotate-2 hover:rotate-0 transition-all duration-300">
                <FaChalkboardTeacher className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Teacher Management
                </h1>
                <p className="text-gray-500 text-sm font-medium mt-1">
                  Manage faculty members and their academic assignments
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="px-4 py-2 bg-gray-50 border-transparent rounded-lg text-sm font-medium text-gray-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all cursor-pointer hover:bg-gray-100"
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
              </select>

              <button
                onClick={loadData}
                disabled={loading}
                className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all disabled:opacity-50"
                title="Refresh Data"
              >
                <FaSync className={loading ? "animate-spin" : ""} size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div className="absolute right-0 top-0 h-24 w-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaUserTie size={18} />
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  +{filteredTeachers.length} active
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Teachers</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div className="absolute right-0 top-0 h-24 w-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaChalkboardTeacher size={18} />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Class Teachers</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.withClassTeacher}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 font-medium">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(statistics.withClassTeacher / statistics.total) * 100 || 0}%` }}></div>
              </div>
              <span>{Math.round((statistics.withClassTeacher / statistics.total) * 100 || 0)}%</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div className="absolute right-0 top-0 h-24 w-24 bg-violet-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaBook size={18} />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Subject Teachers</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.withSubject}</p>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 font-medium">
              {statistics.withSubject - statistics.withClassTeacher} subject-only assignments
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div className="absolute right-0 top-0 h-24 w-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl ${statistics.unassigned > 0 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {statistics.unassigned > 0 ? <FaExclamationCircle size={18} /> : <FaCheckCircle size={18} />}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Unassigned</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.unassigned}</p>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 font-medium">
              {statistics.unassigned > 0 ? 'Teachers need assignment' : 'All teachers assigned'}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-2xl p-5 mb-8 border border-gray-100 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Left side - Search and Filters */}
            <div className="flex-1 flex items-center gap-3 w-full">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by name, ID, email, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all focus:bg-white"
                />
              </div>
              
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer hover:bg-white transition-all"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "grid" 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "list" 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Active filters display */}
          {(selectedDepartment !== "All" || searchQuery) && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-gray-500 font-medium">Active filters:</span>
              {selectedDepartment !== "All" && (
                <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full flex items-center gap-1 border border-indigo-100">
                  <FaFilter size={10} /> {selectedDepartment}
                </span>
              )}
              {searchQuery && (
                <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full flex items-center gap-1 border border-blue-100">
                  <FaSearch size={10} /> "{searchQuery}"
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedDepartment("All");
                  setSearchQuery("");
                }}
                className="text-gray-400 hover:text-gray-600 hover:underline transition-colors ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Teachers Grid/List */}
        {filteredTeachers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
            <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaUserTie className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Teachers Found</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {searchQuery
                ? "No teachers match your search criteria"
                : `No teachers found in ${selectedDepartment} department`}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedDepartment("All");
              }}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-medium"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredTeachers.map((teacher) => (
              viewMode === "grid" ? (
                <TeacherCard
                  key={teacher._id}
                  teacher={teacher}
                  onAssignClassTeacher={() => openAssignModal(teacher, "classTeacher")}
                  onAssignSubject={() => openAssignModal(teacher, "subject")}
                />
              ) : (
                <TeacherListItem
                  key={teacher._id}
                  teacher={teacher}
                  onAssignClassTeacher={() => openAssignModal(teacher, "classTeacher")}
                  onAssignSubject={() => openAssignModal(teacher, "subject")}
                />
              )
            ))}
          </div>
        )}

        {/* Summary Footer */}
        {filteredTeachers.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 font-medium">
                Showing <span className="font-semibold text-indigo-700">{filteredTeachers.length}</span> of{" "}
                <span className="font-semibold">{statistics.total}</span> teachers
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">
                  Department: <span className="font-semibold text-indigo-700">{selectedDepartment}</span>
                </span>
                <span className="text-gray-600 hidden sm:inline">
                  <span className="font-semibold text-emerald-600">{statistics.withClassTeacher}</span> Class Teachers •{" "}
                  <span className="font-semibold text-blue-600">{statistics.withSubject}</span> Subject Teachers
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedTeacher && (
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
  );
}

// Teacher Card Component (Grid View)
function TeacherCard({ teacher, onAssignClassTeacher, onAssignSubject }) {
  const displayPhoto = teacher.profilePicture
    ? teacher.profilePicture.startsWith("http")
      ? teacher.profilePicture
      : `${API_URL}/uploads/${teacher.schoolId}/teachers/${teacher.profilePicture}`
    : null;

  const assignmentCount = teacher.assignedClasses?.length || 0;
  const classTeacherAssignments = teacher.assignedClasses?.filter(ac => ac.isClassTeacher) || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Header with gradient */}
      <div className="h-24 bg-gradient-to-r from-indigo-600 to-violet-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 opacity-30 pattern-grid-lg"></div>
        <div className="absolute top-3 right-3">
           <span className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/10 text-white text-xs font-semibold tracking-wide">
             {teacher.teacherID}
           </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 relative flex-1 flex flex-col">
        {/* Avatar & Badge */}
        <div className="-mt-12 mb-3 flex justify-between items-end">
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl overflow-hidden bg-white border-4 border-white shadow-md">
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt={teacher.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/default-teacher-avatar.png";
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50">
                  <span className="text-2xl font-bold text-indigo-600">
                    {teacher.name?.charAt(0) || "T"}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {classTeacherAssignments.length > 0 && (
            <div className="mb-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-100 shadow-sm">
              <FaCheckCircle size={10} /> Class Teacher: {classTeacherAssignments.map(ac => `${ac.class?.className}-${ac.section}`).join(", ")}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 line-clamp-1" title={teacher.name}>{teacher.name}</h3>
          <p className="text-sm font-medium text-indigo-600">{teacher.department || "General Department"}</p>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <div className="w-6 flex justify-center"><FaEnvelope className="text-gray-400" size={14} /></div>
            <span className="truncate">{teacher.email}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <div className="w-6 flex justify-center"><FaPhone className="text-gray-400" size={14} /></div>
            <span>{teacher.phone || "N/A"}</span>
          </div>
        </div>

        {/* Assignments */}
        {assignmentCount > 0 && (
          <div className="mb-5 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assignments</span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{assignmentCount}</span>
            </div>
            <div className="space-y-2 max-h-20 overflow-y-auto pr-1 custom-scrollbar">
              {teacher.assignedClasses?.slice(0, 3).map((ac, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700 font-medium truncate max-w-[70%]">
                    <span className="text-indigo-600 font-bold">{ac.class?.className}-{ac.section}</span> • {ac.subject}
                  </span>
                  {ac.isClassTeacher && (
                    <FaCheckCircle className="text-emerald-500" title="Class Teacher" />
                  )}
                </div>
              ))}
              {assignmentCount > 3 && (
                <p className="text-xs text-indigo-500 font-medium text-center pt-1">+{assignmentCount - 3} more</p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pb-5 pt-2 flex gap-3">
          <button
            onClick={onAssignClassTeacher}
            className="flex-1 py-2.5 bg-white border border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-50 transition-all text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
          >
            <FaChalkboardTeacher size={14} />
            Class Teacher
          </button>
          <button
            onClick={onAssignSubject}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
          >
            <FaBook size={14} />
            Subject
          </button>
        </div>
      </div>
    </div>
  );
}

// Teacher List Item Component (List View)
function TeacherListItem({ teacher, onAssignClassTeacher, onAssignSubject }) {
  const displayPhoto = teacher.profilePicture
    ? teacher.profilePicture.startsWith("http")
      ? teacher.profilePicture
      : `${API_URL}/uploads/${teacher.schoolId}/teachers/${teacher.profilePicture}`
    : null;

  const assignmentCount = teacher.assignedClasses?.length || 0;
  const classTeacherAssignments = teacher.assignedClasses?.filter(ac => ac.isClassTeacher) || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all p-4 group">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="h-14 w-14 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-50 to-violet-50 flex-shrink-0 border border-gray-100">
          {displayPhoto ? (
            <img
              src={displayPhoto}
              alt={teacher.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-xl font-bold text-indigo-600">
                {teacher.name?.charAt(0) || "T"}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="font-bold text-gray-900 text-lg">{teacher.name}</h4>
            <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{teacher.teacherID}</span>
            {teacher.department && (
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-medium border border-indigo-100">
                {teacher.department}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <FaEnvelope className="text-gray-400" size={12} />
              {teacher.email}
            </span>
            <span className="flex items-center gap-1">
              <FaPhone className="text-gray-400" size={12} />
              {teacher.phone || "N/A"}
            </span>
            <span className="flex items-center gap-1">
              <FaBook className="text-indigo-400" size={12} />
              <span className="font-medium text-gray-900">{assignmentCount}</span> assignments
            </span>
            {classTeacherAssignments.length > 0 && (
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                <FaCheckCircle size={10} /> Class Teacher: {classTeacherAssignments.map(ac => `${ac.class?.className}-${ac.section}`).join(", ")}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onAssignClassTeacher}
            className="px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-all text-sm font-medium"
          >
            + Class Teacher
          </button>
          <button
            onClick={onAssignSubject}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-medium shadow-sm"
          >
            + Subject
          </button>
        </div>
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

  useEffect(() => {
    const fetchAvailableSubjects = async () => {
      if (!selectedClass || !selectedSection || type !== "subject") {
        setAvailableSubjects([]);
        return;
      }

      try {
        setLoadingSubjects(true);
        const response = await api.get(
          `${API_ENDPOINTS.ADMIN.TEACHER_MANAGEMENT.AVAILABLE_SUBJECTS}?classId=${selectedClass}&sectionName=${selectedSection}`,
        );

        const subjects = response?.data?.availableSubjects || response?.availableSubjects || [];
        setAvailableSubjects(subjects);
      } catch (error) {
        console.error("Error fetching subjects:", error);
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

      const endpoint = type === "classTeacher"
        ? API_ENDPOINTS.ADMIN.TEACHER_MANAGEMENT.ASSIGN_CLASS_TEACHER
        : API_ENDPOINTS.ADMIN.TEACHER_MANAGEMENT.ASSIGN_SUBJECT_TEACHER;

      const payload = type === "classTeacher"
        ? { classId: selectedClass, sectionName: selectedSection, teacherId: teacher._id }
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
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all scale-100">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-t-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <h3 className="text-xl font-bold">
                {type === "classTeacher" ? "Assign Class Teacher" : "Assign Subject Teacher"}
              </h3>
              <p className="text-indigo-100 text-sm mt-1 flex items-center gap-2">
                <FaUserTie size={12} />
                <span className="font-medium">{teacher.name}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all text-white"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Select Class <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection("");
                setSelectedSubject("");
              }}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
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
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Select Section <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedSubject("");
              }}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
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
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Select Subject <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                  required
                  disabled={!selectedSection || loadingSubjects}
                >
                  <option value="">
                    {loadingSubjects ? "Loading..." : !selectedSection ? "Select section first" : "Choose a subject"}
                  </option>
                  {availableSubjects.map((subject) => (
                    <option key={subject._id} value={subject.subjectName}>
                      {subject.subjectName} {subject.subjectCode ? `(${subject.subjectCode})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Hours Per Week
                </label>
                <input
                  type="number"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                  min="1"
                  max="10"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (type === "subject" && availableSubjects.length === 0)}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
            >
              {loading ? "Assigning..." : "Assign Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}