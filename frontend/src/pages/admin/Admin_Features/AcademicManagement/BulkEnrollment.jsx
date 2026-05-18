import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import {
  FaUserGraduate,
  FaBuilding,
  FaCheckCircle,
  FaArrowRight,
  FaSearch,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaFilter,
  FaEdit,
  FaTimes,
} from "react-icons/fa";
import StudentParentRegisterForm from "../UserRegistrations/StudentParentRegisterForm";

export default function BulkEnrollment() {
  const [sessions, setSessions] = useState([]);
  const [academicYear, setAcademicYear] = useState("");
  
  // Left Pane State (Admissions Pool)
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [targetClassFilter, setTargetClassFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Right Pane State (Academic Destination)
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // For editing student profile
  const [editingStudent, setEditingStudent] = useState(null);

  // Initialize Session
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.SESSION.GET_All_SESSION);
        let sessionData = Array.isArray(res) ? res : res?.data || [];
        
        // Remove duplicates and sort
        sessionData = sessionData.filter((s, index, self) =>
            index === self.findIndex((x) => x.startYear === s.startYear && x.endYear === s.endYear)
        );
        sessionData.sort((a, b) => a.startYear - b.startYear);
        setSessions(sessionData);

        const savedSession = localStorage.getItem("academicYear");
        const active = sessionData.find((s) => s?.isActive);
        setAcademicYear(savedSession || (active ? `${active.startYear}-${active.endYear}` : ""));
      } catch (err) {
        console.error("Session fetch error", err);
        toast.error("Failed to load academic sessions");
      }
    };
    fetchSessions();
  }, []);

  // Load Data based on Academic Year
  const loadClasses = useCallback(async () => {
    if (!academicYear) return;
    try {
      setLoadingClasses(true);
      // Use LIST endpoint instead of STATISTICS to guarantee master list structure
      const response = await api.get(
        `${API_ENDPOINTS.ADMIN.CLASS.LIST}?academicYear=${academicYear}`
      );

      let classList = [];
      if (Array.isArray(response?.data?.classes)) classList = response.data.classes;
      else if (Array.isArray(response?.data?.data)) classList = response.data.data;
      else if (Array.isArray(response?.data)) classList = response.data;
      else if (Array.isArray(response?.classes)) classList = response.classes;
      else if (Array.isArray(response)) classList = response;
      
      setClasses(classList);
    } catch (err) {
      console.error("Failed to load classes:", err);
      toast.error("Failed to load academic classes");
    } finally {
      setLoadingClasses(false);
    }
  }, [academicYear]);

  const loadUnassignedAdmissions = useCallback(async () => {
    if (!academicYear) return;
    try {
      setLoadingStudents(true);
      // Wait for the new backend route to handle this query
      const response = await api.get(
        `${API_ENDPOINTS.ADMIN.ENROLLMENT.UNASSIGNED}?academicYear=${academicYear}`
      );
      
      // 🐞 DEBUGGING: Log the raw response to the browser console (Press F12 to view)
      console.log("Raw API Response from backend:", response);

      let studentsData = [];
      const d = response?.data;
      
      // ✅ Ultimate fallback extraction
      if (Array.isArray(response)) studentsData = response;
      else if (Array.isArray(d)) studentsData = d;
      else if (Array.isArray(d?.students)) studentsData = d.students;
      else if (Array.isArray(d?.data)) studentsData = d.data;
      else if (Array.isArray(d?.data?.students)) studentsData = d.data.students;
      else if (Array.isArray(response?.students)) studentsData = response.students;

      console.log("Extracted Students Array:", studentsData);

      setUnassignedStudents(studentsData);
      setSelectedStudentIds([]); // clear selections on reload
    } catch (err) {
      console.error("Failed to load unassigned students:", err);
      toast.error("Failed to load admissions pool");
    } finally {
      setLoadingStudents(false);
    }
  }, [academicYear]);

  useEffect(() => {
    if (academicYear) {
      loadClasses();
      loadUnassignedAdmissions();
      // Reset selections when year changes
      setSelectedClassId("");
      setSelectedSectionId("");
    }
  }, [academicYear, loadClasses, loadUnassignedAdmissions]);

  // Derived State (Right Pane)
  const selectedClassData = useMemo(() => 
    classes.find(c => c._id === selectedClassId), 
  [classes, selectedClassId]);

  const selectedSectionData = useMemo(() => 
    selectedClassData?.sections?.find(s => s._id === selectedSectionId), 
  [selectedClassData, selectedSectionId]);

  const availableSeats = selectedSectionData 
    ? selectedSectionData.capacity - selectedSectionData.currentStrength 
    : 0;

  // Helper to extract display class name safely (combats different data shapes from CRM)
  const getClassName = useCallback((student) => {
    let clsName = "Unspecified";
    
    if (student.targetClassDetails?.[0]?.className) clsName = student.targetClassDetails[0].className;
    else if (Array.isArray(student.targetClass) && student.targetClass[0]?.className) clsName = student.targetClass[0].className;
    else if (typeof student.targetClass === 'object' && student.targetClass !== null) clsName = student.targetClass.className || "Unspecified";
    else if (typeof student.targetClass === 'string') {
       if (/^[0-9a-fA-F]{24}$/.test(student.targetClass)) clsName = "Unspecified"; // Handle raw MongoDB ObjectIDs safely
       else clsName = student.targetClass;
    }
    else if (student.className) clsName = typeof student.className === 'object' ? student.className.className : student.className;
    else if (student.targetGrade) clsName = student.targetGrade;
    
    return clsName?.replace(/^Class\s/i, '') || "Unspecified";
  }, []);

  // Derived State (Left Pane Filters)
  const uniqueTargetClasses = useMemo(() => {
    const classes = new Set(unassignedStudents.map(getClassName).filter(c => c !== "Unspecified"));
    return Array.from(classes).sort();
  }, [unassignedStudents, getClassName]);

  const filteredStudents = useMemo(() => {
    return unassignedStudents.filter(student => {
      const studentClass = getClassName(student);
      const matchesClass = targetClassFilter ? studentClass === targetClassFilter : true;
      
      // ✅ Safely handle Enquiry vs Student naming conventions
      const searchName = student.name || student.studentName || "";
      const searchId = student.studentID || "";

      const matchesSearch = searchTerm 
        ? searchName.toLowerCase().includes(searchTerm.toLowerCase()) || 
          searchId.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchesClass && matchesSearch;
    });
  }, [unassignedStudents, targetClassFilter, searchTerm, getClassName]);

  // Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudentIds(filteredStudents.map((s) => s._id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const toggleStudent = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (!selectedClassId || !selectedSectionData) {
      return toast.warning("Please select a destination class and section.");
    }
    if (selectedStudentIds.length === 0) {
      return toast.warning("Please select at least one student to enroll.");
    }
    if (selectedStudentIds.length > availableSeats) {
      return toast.error(`Cannot assign ${selectedStudentIds.length} students. Only ${availableSeats} seats available.`);
    }

    try {
      setSubmitting(true);
      const payload = {
        studentIds: selectedStudentIds,
        classId: selectedClassId,
        sectionName: selectedSectionData.sectionName,
        academicYear: academicYear,
      };

      await api.post(API_ENDPOINTS.ADMIN.ENROLLMENT.BULK_ENROLL, payload);
      
      toast.success(`Successfully enrolled ${selectedStudentIds.length} students!`);
      
      // Reload data to reflect changes
      loadUnassignedAdmissions();
      loadClasses();
    } catch (err) {
      console.error("Bulk enroll error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to complete enrollment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-indigo-100 rounded-xl flex items-center justify-center">
              <FaUserGraduate className="text-indigo-600 text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Pending Enrollments
              </h1>
              <p className="text-slate-500 text-sm font-medium mt-1">
                Assign admitted students to active academic sections
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">
              Academic Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => {
                setAcademicYear(e.target.value);
                localStorage.setItem("academicYear", e.target.value);
              }}
              className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100 outline-none"
            >
              <option value="" disabled>Select Year</option>
              {sessions.map((s) => (
                <option key={s._id} value={`${s.startYear}-${s.endYear}`}>
                  {s.startYear}-{s.endYear} {s.isActive ? "(Current)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Split Screen Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANE: Admissions Pool */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[700px]">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  Admissions Pool
                  <span className="bg-indigo-100 text-indigo-700 text-xs py-0.5 px-2.5 rounded-full">
                    {unassignedStudents.length} Waiting
                  </span>
                </h2>
              </div>
              
              {/* Filters */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
                <select
                  value={targetClassFilter}
                  onChange={(e) => setTargetClassFilter(e.target.value)}
                  className="w-48 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:border-indigo-500 outline-none"
                >
                  <option value="">All Target Classes</option>
                  {uniqueTargetClasses.map(cls => (
                    <option key={cls} value={cls}>Class {cls}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-y-auto bg-white p-2">
              {loadingStudents ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-sm font-medium">Fetching admitted students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                  <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <FaFilter size={24} className="text-slate-300" />
                  </div>
                  <p className="text-slate-600 font-bold text-lg">No students found</p>
                  <p className="text-sm mt-1">There are no approved admissions waiting for a section in this year/grade.</p>
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {/* Select All Row */}
                  <div className="flex items-center px-4 py-2 bg-slate-50 rounded-lg mb-4">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="ml-3 text-sm font-bold text-slate-600 uppercase tracking-wider">
                      Select All ({filteredStudents.length})
                    </span>
                  </div>

                  {/* Rows */}
                  {filteredStudents.map(student => {
                    const isSelected = selectedStudentIds.includes(student._id);
                    return (
                      <div 
                        key={student._id}
                        onClick={() => toggleStudent(student._id)}
                        className={`flex items-center p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-50 border-indigo-300 shadow-sm' 
                            : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        />
                        <div className="ml-4 flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900">{student.name || student.studentName}</h4>
                          <p className="text-xs text-slate-500 font-medium">ID: {student.studentID || 'Pending'} | App Date: {new Date(student.createdAt || student.enquiryDate || Date.now()).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold uppercase tracking-wider">
                            Class {getClassName(student)}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingStudent(student._id); }}
                            className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors"
                            title="Edit Student Profile"
                          >
                            <FaEdit size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANE: Academic Destination */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Destination Selector Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <FaBuilding className="text-lg" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Target Classroom</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Assign to Class/Grade</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => {
                      setSelectedClassId(e.target.value);
                      setSelectedSectionId(""); // reset section when class changes
                    }}
                    disabled={loadingClasses}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-700 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none disabled:opacity-60"
                  >
                    <option value="" disabled>Choose a class...</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>{cls.className}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Assign to Section</label>
                  <select
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                    disabled={!selectedClassId || loadingClasses}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-700 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none disabled:opacity-60"
                  >
                    <option value="" disabled>Choose a section...</option>
                    {selectedClassData?.sections?.map((sec) => (
                      <option key={sec._id} value={sec._id}>Section {sec.sectionName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Capacity Analytics */}
              {selectedSectionData && (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Section Capacity</p>
                      <p className="text-2xl font-black text-slate-900">
                        {selectedSectionData.currentStrength} <span className="text-sm font-medium text-slate-500">/ {selectedSectionData.capacity}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        availableSeats > 5 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {availableSeats} Seats Left
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        availableSeats === 0 ? 'bg-rose-500' : availableSeats <= 5 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min((selectedSectionData.currentStrength / selectedSectionData.capacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Card */}
            <div className={`bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-lg p-6 text-white transition-all duration-300 ${selectedStudentIds.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2 pointer-events-none'}`}>
              <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                <FaCheckCircle className="text-emerald-400" /> Ready to Enroll
              </h3>
              <p className="text-indigo-200 text-sm mb-6">
                You are about to assign <strong className="text-white bg-white/20 px-2 py-0.5 rounded">{selectedStudentIds.length}</strong> students to <strong>{selectedClassData?.className} - Section {selectedSectionData?.sectionName}</strong>. This will generate their official roll numbers and activate their profiles in the main roster.
              </p>
              
              {selectedStudentIds.length > availableSeats && selectedSectionData && (
                <div className="mb-4 bg-rose-500/20 border border-rose-500/50 rounded-xl p-3 flex items-start gap-3">
                  <FaExclamationTriangle className="text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-200 font-medium leading-snug">
                    Warning: You have selected more students than the available seats in this section. Please unselect some students or choose a different section.
                  </p>
                </div>
              )}

              <button
                onClick={handleAssign}
                disabled={submitting || selectedStudentIds.length > availableSeats || !selectedSectionData}
                className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Assign & Generate Roll Numbers <FaArrowRight />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Dynamic Edit Modal using the robust Registration Form */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] overflow-y-auto p-4 flex justify-center items-start pt-10">
          <div className="bg-white rounded-[2rem] w-full max-w-6xl relative shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <button
              onClick={() => setEditingStudent(null)}
              className="absolute top-4 right-4 h-12 w-12 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full flex items-center justify-center transition-colors z-10"
            >
              <FaTimes size={18} />
            </button>
            <div className="p-4 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <StudentParentRegisterForm
                studentId={editingStudent}
                onFormSubmit={() => {
                  setEditingStudent(null);
                  loadUnassignedAdmissions();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}