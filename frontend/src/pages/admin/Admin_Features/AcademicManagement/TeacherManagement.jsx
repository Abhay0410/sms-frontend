// pages/admin/Admin_Features/AcademicManagement/TeacherManagement.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../../services/api";
import {
  FaChalkboardTeacher, FaEnvelope, FaPhone, FaSearch, FaSync, 
  FaThLarge, FaList, FaCheckCircle, FaUserTie, FaMusic, FaBook, 
  FaCalendarAlt, FaSpinner, FaGraduationCap, FaCheck, FaTimes, FaChevronLeft, FaChevronRight,
  FaEye, FaPlus
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [teacherSchedule, setTeacherSchedule] = useState({});
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentType, setAssignmentType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const DEPARTMENTS = ["All", "Science", "Mathematics", "Chemistry", "Physics", "English", "Hindi", "Social Studies", "Computer Science", "Physical Education"];

  // Load teachers and classes
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
      if (teacherList.length > 0 && !selectedTeacher) {
        setSelectedTeacher(teacherList[0]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [academicYear, selectedTeacher]);

  // ✅ FIXED: Schedule Fetching with correct API
  const fetchTeacherSchedule = useCallback(async (teacherId) => {
    try {
      setLoadingSchedule(true);
      // Using the exact API you mentioned
      const resp = await api.get(`${API_ENDPOINTS.ADMIN.TEACHER_MANAGEMENT.GET_SCHEDULE(teacherId)}&academicYear=${academicYear}`);
      
      // Extract schedule data from response
      const scheduleData = resp.data?.schedule || resp.schedule || {};
      
      // Ensure all days exist
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const formattedSchedule = {};
      days.forEach(day => {
        formattedSchedule[day] = scheduleData[day] || [];
      });
      
      setTeacherSchedule(formattedSchedule);
    } catch (error) {
      console.error("Schedule fetch failed:", error);
      // Create empty schedule structure
      const emptySchedule = {};
      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].forEach(day => {
        emptySchedule[day] = [];
      });
      setTeacherSchedule(emptySchedule);
    } finally {
      setLoadingSchedule(false);
    }
  }, [academicYear]);

  useEffect(() => { loadData(); }, [loadData]);
  
  useEffect(() => {
    if (selectedTeacher?._id) {
      fetchTeacherSchedule(selectedTeacher._id);
    }
  }, [selectedTeacher, academicYear, fetchTeacherSchedule]);

  const openAssignModal = (teacher, type) => {
    setSelectedTeacher(teacher);
    setAssignmentType(type);
    setShowAssignModal(true);
  };

  // Filter teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => 
      (selectedDepartment === "All" || t.department === selectedDepartment) &&
      (t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       t.teacherID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       t.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [teachers, selectedDepartment, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const paginatedTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTeachers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTeachers, currentPage, itemsPerPage]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDepartment, searchQuery]);

  // Profile Picture URL
  const getProfilePic = (t) => {
    if (!t?.profilePicture) return null;
    return t.profilePicture.startsWith("http") 
      ? t.profilePicture 
      : `${API_URL}/uploads/${t.schoolId}/teachers/${t.profilePicture}`;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-indigo-100"></div>
            <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-6 text-lg font-black text-slate-700">LOADING FACULTY...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-900">
      {/* Top Bar - Floating */}
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between gap-6 shadow-sm z-20 rounded-b-[2rem]">
        <div className="relative flex-1 max-w-2xl">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by name, ID, email, or department..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none cursor-pointer"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none cursor-pointer"
          >
            <option value="2023-2024">2023-2024</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2025-2026">2025-2026</option>
          </select>

          <button
            onClick={loadData}
            className="p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
          >
            <FaSync className={loading ? "animate-spin" : ""} size={16} />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">View:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`} 
                onClick={() => setViewMode('list')}
              >
                <FaList size={16} />
              </button>
              <button 
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`} 
                onClick={() => setViewMode('grid')}
              >
                <FaThLarge size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Fixed Width */}
        <div className={`bg-white border-r flex flex-col transition-all duration-300 ${viewMode === 'list' ? 'w-full' : 'w-[360px]'}`}>
          <div className={`flex-1 overflow-y-auto custom-scrollbar ${viewMode === 'list' ? 'p-6 space-y-2' : ''}`}>
          {paginatedTeachers.length === 0 ? (
            <div className="p-8 text-center mt-10">
              <FaUserTie className="text-4xl text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">No faculty members found</p>
            </div>
          ) : (
            paginatedTeachers.map(teacher => 
              viewMode === 'list' ? (
                // LIST VIEW ROW
                <div 
                  key={teacher._id}
                  className="group flex items-center px-6 h-20 border border-slate-100 rounded-2xl hover:bg-indigo-50/30 hover:shadow-sm transition-all cursor-pointer bg-white"
                  onClick={() => { setSelectedTeacher(teacher); setViewMode('grid'); }}
                >
                  {/* Col 1: Identity (30%) */}
                  <div className="w-[30%] flex items-center gap-4 px-2">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                      {teacher.profilePicture ? (
                        <img src={getProfilePic(teacher)} alt={teacher.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-black text-slate-400">{teacher.name?.charAt(0)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{teacher.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400">{teacher.teacherID}</p>
                    </div>
                  </div>

                  {/* Col 2: Department (20%) */}
                  <div className="w-[20%] px-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                    <span className="text-xs font-bold text-slate-600 truncate">{teacher.department || "General"}</span>
                  </div>

                  {/* Col 3: Contact (25%) */}
                  <div className="w-[25%] px-2 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 truncate">
                      <FaEnvelope size={10} className="text-slate-400 shrink-0" /> {teacher.email}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 truncate">
                      <FaPhone size={10} className="text-slate-400 shrink-0" /> {teacher.phone || "N/A"}
                    </div>
                  </div>

                  {/* Col 4: Assignments (15%) */}
                  <div className="w-[15%] px-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-indigo-100 hover:text-indigo-700 transition-colors">
                      <FaChalkboardTeacher size={10} />
                      {teacher.assignedClasses?.length || 0} Classes
                    </span>
                  </div>

                  {/* Col 5: Quick Actions (10%) */}
                  <div className="w-[10%] px-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openAssignModal(teacher, 'subject'); }}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Assign Subject"
                    >
                      <FaPlus size={12} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedTeacher(teacher); setViewMode('grid'); }}
                      className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                      title="View Profile"
                    >
                      <FaEye size={12} />
                    </button>
                  </div>
                </div>
              ) : (
              // GRID VIEW CARD (Existing)
              <div 
                key={teacher._id}
                onClick={() => setSelectedTeacher(teacher)}
                className={`p-5 flex items-center gap-4 cursor-pointer transition-all border-b relative ${
                  selectedTeacher?._id === teacher._id ? 'bg-indigo-50/40' : 'hover:bg-slate-50'
                }`}
              >
                {selectedTeacher?._id === teacher._id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600"></div>
                )}
                
                {/* Avatar with Status Dot */}
                <div className="relative">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center font-black text-indigo-600 text-xl border-2 border-white shadow-sm overflow-hidden">
                    {teacher.profilePicture ? (
                      <img src={getProfilePic(teacher)} alt={teacher.name} className="h-full w-full object-cover" />
                    ) : (
                      teacher.name?.charAt(0)
                    )}
                  </div>
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-purple-500 rounded-full border-2 border-white"></div>
                </div>

                {/* Teacher Info */}
                <div className="min-w-0 flex-1">
                  <h4 className="text-[15px] font-bold text-slate-900 truncate">{teacher.name}</h4>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    {teacher.department || "Faculty"}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">{teacher.teacherID}</p>
                </div>
              </div>
            ))
          )}
          </div>

          {/* Pagination Bar */}
          {filteredTeachers.length > 0 && (
            <div className="p-3 border-t bg-slate-50 flex items-center justify-between">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-slate-500 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
              >
                <FaChevronLeft size={12} />
              </button>
              <span className="text-xs font-black text-slate-400 tracking-widest">
                PAGE {currentPage} / {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg text-slate-500 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
              >
                <FaChevronRight size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Scrollable */}
        <div className={`flex-1 overflow-y-auto p-12 bg-white custom-scrollbar ${viewMode === 'list' ? 'hidden' : 'block'}`}>
          {selectedTeacher ? (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
              
              {/* Profile Header */}
              <div className="flex items-start justify-between">
                <div className="flex gap-8">
                  {/* Large Avatar */}
                  <div className="h-32 w-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center text-5xl font-black text-indigo-200 border-4 border-white shadow-xl overflow-hidden">
                    {selectedTeacher.profilePicture ? (
                      <img src={getProfilePic(selectedTeacher)} alt={selectedTeacher.name} className="h-full w-full object-cover" />
                    ) : (
                      selectedTeacher.name?.charAt(0)
                    )}
                  </div>

                  {/* Name & Contact */}
                  <div className="pt-2">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">{selectedTeacher.name}</h2>
                    <div className="flex flex-col gap-2 mt-3">
                      <span className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                        <FaEnvelope className="text-indigo-400" size={14} /> {selectedTeacher.email}
                      </span>
                      <div className="flex gap-8">
                        <span className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                          <FaPhone className="text-indigo-400" size={14} /> {selectedTeacher.phone || "N/A"}
                        </span>
                        {selectedTeacher.alternatePhone && (
                          <span className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                            <FaPhone className="text-slate-300" size={14} /> {selectedTeacher.alternatePhone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teacher ID Badge */}
                <div className="bg-slate-100 px-5 py-2 rounded-2xl font-black text-sm text-slate-500 tracking-widest border border-slate-200">
                  {selectedTeacher.teacherID}
                </div>
              </div>

              {/* Administrative Roles & Action Buttons */}
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                  Administrative Roles
                </h3>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500">Current Assignments:</span>
                    <div className="flex gap-2 flex-wrap">
                      {selectedTeacher.assignedClasses?.length > 0 ? (
                        selectedTeacher.assignedClasses.map((ac, idx) => (
                          <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-slate-200">
                            {ac.class?.className}-{ac.section}
                          </span>
                        ))
                      ) : <span className="text-xs text-slate-400 italic">No assignments</span>}
                      {selectedTeacher.department && (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">Subject Lead</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons - Added Back */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => openAssignModal(selectedTeacher, "classTeacher")}
                      className="px-5 py-2.5 bg-white border-2 border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-50 transition-all text-xs font-black flex items-center gap-2"
                    >
                      <FaChalkboardTeacher size={14} /> Assign Class Teacher
                    </button>
                    <button
                      onClick={() => openAssignModal(selectedTeacher, "subject")}
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-200"
                    >
                      <FaBook size={14} /> Assign Subject
                    </button>
                  </div>
                </div>
              </div>

              {/* Schedule Summary - Day vs Period */}
              <div className="w-full xl:w-[65%]">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                  Schedule Summary
                </h3>
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  {loadingSchedule ? (
                    <div className="p-8 text-center">
                      <FaSpinner className="animate-spin text-indigo-600 text-2xl mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Loading schedule...</p>
                    </div>
                  ) : (
                    <table className="w-full text-[9px] text-center border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="p-3 border-r border-slate-100 font-black text-slate-400">Day</th>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                            <th key={p} className="p-2 border-r border-slate-100 font-black text-slate-400 w-[10%]">P{p}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => {
                          const daySchedule = teacherSchedule[day] || [];
                          return (
                            <tr key={day} className="border-b border-slate-100 last:border-0 h-12">
                              <td className="p-2 border-r border-slate-100 font-black bg-slate-50/30 text-slate-500 uppercase tracking-widest text-[8px]">
                                {day.slice(0, 3)}
                              </td>
                              {[1, 2, 3, 4, 5, 6, 7, 8].map(p => {
                                const period = daySchedule.find(s => s.periodNumber === p);
                                return (
                                  <td key={p} className="border-r border-slate-100 last:border-0 p-1 align-middle">
                                    {period ? (
                                      <div className="bg-indigo-50/50 p-1 rounded-md h-full flex flex-col justify-center items-center">
                                        <div className="font-bold text-indigo-700 leading-none mb-0.5">
                                          {period.className?.slice(0, 3)}-{period.section}
                                        </div>
                                        <div className="text-[7px] text-slate-400 uppercase font-bold">
                                          {period.subject?.slice(0, 3)}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-slate-200 font-light">—</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Bottom Grid - Activity Feed & Professional Development */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4 border-t border-slate-100">
                
                {/* Activity Feed */}
                <div className="lg:col-span-5">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                    Activity Feed
                  </h3>
                  <div className="space-y-6 border-l-2 border-slate-100 ml-2 pl-6">
                    {[
                      { text: "Graded 20 assignments", color: "bg-indigo-500" },
                      { text: "Uploaded Science Syllabus", color: "bg-emerald-500" },
                      { text: "Marked attendance for Class 4-C", color: "bg-amber-500" },
                      { text: "Completed Training Certification", color: "bg-purple-500" },
                    ].map((act, idx) => (
                      <div key={idx} className="relative">
                        <div className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white ${act.color}`}></div>
                        <p className="text-xs text-slate-600 font-black tracking-tight leading-relaxed">
                          {act.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Professional Development */}
                <div className="lg:col-span-7">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                    Professional Development
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                          Completed Training Certification on Digital Management 2026
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FaUserTie className="text-6xl text-slate-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-400">Select a teacher to view details</p>
              </div>
            </div>
          )}
        </div>
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
            setAssignmentType(null);
          }}
          onSuccess={() => {
            setShowAssignModal(false);
            loadData();
          }}
        />
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e2e8f0;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #cbd5e1;
        }
      `}</style>
    </div>
  );
}

// Assignment Modal Component
function AssignmentModal({ teacher, classes, type, academicYear, onClose, onSuccess }) {
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
          `${API_ENDPOINTS.ADMIN.TEACHER_MANAGEMENT.AVAILABLE_SUBJECTS}?classId=${selectedClass}&sectionName=${selectedSection}&academicYear=${academicYear}`,
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
  }, [selectedClass, selectedSection, type, academicYear]);

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
        ? { 
            classId: selectedClass, 
            sectionName: selectedSection, 
            teacherId: teacher._id,
            academicYear 
          }
        : {
            classId: selectedClass,
            sectionName: selectedSection,
            subjectName: selectedSubject,
            teacherId: teacher._id,
            hoursPerWeek: parseInt(hoursPerWeek),
            academicYear
          };

      await api.put(endpoint, payload);

      toast.success(
        type === "classTeacher"
          ? "Class teacher assigned successfully"
          : "Subject teacher assigned successfully"
      );

      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to assign teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-t-2xl">
          <div className="flex items-start justify-between">
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
              onClick={onClose}
              className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
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
              {loading ? "Assigning..." : "Assign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}