// // pages/admin/Admin_Features/AcademicManagement/TeacherManagement.jsx
// import { useEffect, useState, useCallback } from "react";
// import { toast } from "react-toastify";
// import api, { API_ENDPOINTS } from "../../../../services/api";

// import {
//   FaUserTie,
//   FaChalkboardTeacher,
//   FaBook,
//   FaClock,
//   FaPlus,
//   FaTimes,
//   FaEdit,
//   FaTrash,
//   FaChartBar,
//   FaExclamationTriangle,
//   FaFilter,
//   FaSearch,
//   FaSync,
//   FaCalendarAlt,
//   FaEye
// } from "react-icons/fa";

// const DEPARTMENTS = [
//   "All",
//   "Mathematics",
//   "Science",
//   "Languages",
//   "Social Science",
//   "Computer Science",
//   "Environmental Studies",
//   "Physical Education",
//   "Arts & Craft",
//   "Music",
//   "Library",
//   "Primary Education",
// ];

// export default function TeacherManagement() {
//   const [teachers, setTeachers] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [academicYear, setAcademicYear] = useState("2025-2026");
//   const [selectedTeacher, setSelectedTeacher] = useState(null);
//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [assignmentType, setAssignmentType] = useState(null);
//   const [selectedDepartment, setSelectedDepartment] = useState("All");
//   const [searchQuery, setSearchQuery] = useState("");

//   // ✅ Define loadData FIRST, before any useEffect that uses it
//   const loadData = useCallback(async () => {
//     try {
//       setLoading(true);

//       console.log("🚀 STARTING DATA LOAD for academic year:", academicYear);

//       const teachersUrl =
//         API_ENDPOINTS.ADMIN.TEACHER_MANAGEMENT.LIST +
//         `?academicYear=${academicYear}`;
//       const classesUrl =
//         API_ENDPOINTS.ADMIN.CLASS.LIST + `?academicYear=${academicYear}`;

//       console.log("🔗 API Endpoints:");
//       console.log("  - Teachers:", teachersUrl);
//       console.log("  - Classes:", classesUrl);

//       let teachersResp = null;
//       let classesResp = null;

//       // Test Teachers API with individual try-catch
//       try {
//         console.log("📞 Calling Teachers API...");
//         teachersResp = await api.get(teachersUrl);
//         console.log("✅ TEACHERS API SUCCESS - Full Response:", teachersResp);
//       } catch (teacherError) {
//         console.error("❌ TEACHERS API FAILED:", teacherError);
//       }

//       // Test Classes API with individual try-catch
//       try {
//         console.log("📞 Calling Classes API...");
//         classesResp = await api.get(classesUrl);
//         console.log("✅ CLASSES API SUCCESS - Full Response:", classesResp);
//       } catch (classError) {
//         console.error("❌ CLASSES API FAILED:", classError);
//       }

//       // Extract data from successful responses
//       let teacherList = [];
//       let classList = [];

//       // Extract teachers data
//       if (teachersResp) {
//         teacherList =
//           teachersResp.data?.teachers || teachersResp.teachers || [];
//       }

//       // Extract classes data
//       if (classesResp) {
//         classList =
//           classesResp.data || classesResp.classes || classesResp || [];
//       }

//       console.log("🎯 FINAL DATA EXTRACTION:");
//       console.log("  - Teachers found:", teacherList.length);
//       console.log("  - Classes found:", classList.length);

//       setTeachers(teacherList);
//       setClasses(classList);
//     } catch (error) {
//       console.error("💥 UNEXPECTED ERROR in loadData:", error);
//       toast.error("Failed to load data");
//       setTeachers([]);
//       setClasses([]);
//     } finally {
//       setLoading(false);
//       console.log("🏁 DATA LOADING COMPLETED");
//     }
//   }, [academicYear]);

//   // ✅ Now useEffects can safely use loadData
//   useEffect(() => {
//     loadData();
//   }, [loadData]);

//   const openAssignModal = (teacher, type) => {
//     setSelectedTeacher(teacher);
//     setAssignmentType(type);
//     setShowAssignModal(true);
//   };

//   // Filter teachers based on department and search
//   const filteredTeachers = teachers
//     .filter(teacher => 
//       selectedDepartment === "All" || teacher.department === selectedDepartment
//     )
//     .filter(teacher =>
//       searchQuery === "" ||
//       teacher.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       teacher.teacherID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       teacher.email?.toLowerCase().includes(searchQuery.toLowerCase())
//     );

//   // Calculate statistics
//   const totalTeachers = teachers.length;
//   // const classTeachersCount = teachers.filter(t => t.assignments?.classTeacher?.length > 0).length;
//   // const subjectTeachersCount = teachers.filter(t => t.assignments?.subjects?.length > 0).length;

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-white">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600 mx-auto"></div>
//           <p className="mt-6 text-lg font-medium text-slate-700">
//             Loading teachers...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
//       {/* ================= HEADER ================= */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-slate-900">Teacher Management</h1>
//           <p className="text-slate-600 mt-1 flex items-center gap-2">
//             <FaChalkboardTeacher className="text-teal-600" />
//             Assign class teachers and subject teachers
//           </p>
//           <p className="mt-1 text-sm text-slate-500">
//             Found {totalTeachers} teachers and {classes.length} classes
//           </p>
//         </div>

//         <div className="flex items-center gap-3">
//           <div className="relative">
//             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
//             <input
//               type="text"
//               placeholder="Search teachers..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none w-full md:w-64"
//             />
//           </div>

//           <select
//             value={academicYear}
//             onChange={(e) => setAcademicYear(e.target.value)}
//             className="px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
//           >
//             <option value="2023-2024">2023-2024</option>
//             <option value="2024-2025">2024-2025</option>
//             <option value="2025-2026">2025-2026</option>
//           </select>

//           <button
//             onClick={loadData}
//             disabled={loading}
//             className="px-4 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-all flex items-center gap-2"
//           >
//             <FaSync className={loading ? "animate-spin" : ""} />
//             {loading ? "Refreshing..." : "Refresh"}
//           </button>
//         </div>
//       </div>

//       {/* ================= STATS CARDS ================= */}
//       {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-slate-600">Total Teachers</p>
//               <p className="text-2xl font-bold text-slate-900 mt-1">{totalTeachers}</p>
//             </div>
//             <div className="p-3 rounded-lg bg-teal-100">
//               <FaUserTie className="text-lg text-teal-600" />
//             </div>
//           </div>
//           <div className="mt-2 text-xs text-slate-500">
//             {selectedDepartment === "All" ? "All departments" : selectedDepartment}
//           </div>
//         </div>

//         <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-slate-600">Class Teachers</p>
//               <p className="text-2xl font-bold text-slate-900 mt-1">{classTeachersCount}</p>
//             </div>
//             <div className="p-3 rounded-lg bg-blue-100">
//               <FaChalkboardTeacher className="text-lg text-blue-600" />
//             </div>
//           </div>
//           <div className="mt-2 text-xs text-slate-500">
//             {((classTeachersCount / totalTeachers) * 100 || 0).toFixed(1)}% of total
//           </div>
//         </div>

//         <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-slate-600">Subject Teachers</p>
//               <p className="text-2xl font-bold text-slate-900 mt-1">{subjectTeachersCount}</p>
//             </div>
//             <div className="p-3 rounded-lg bg-emerald-100">
//               <FaBook className="text-lg text-emerald-600" />
//             </div>
//           </div>
//           <div className="mt-2 text-xs text-slate-500">
//             {((subjectTeachersCount / totalTeachers) * 100 || 0).toFixed(1)}% of total
//           </div>
//         </div>
//       </div> */}

//       {/* ================= DEPARTMENT FILTERS ================= */}
//       <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
//         <div className="flex flex-wrap items-center gap-4">
//           <span className="font-medium text-slate-700 flex items-center gap-2">
//             <FaFilter className="text-slate-400" />
//             Filter by Department:
//           </span>
//           <div className="flex flex-wrap gap-2">
//             {DEPARTMENTS.map((dept) => (
//               <button
//                 key={dept}
//                 onClick={() => setSelectedDepartment(dept)}
//                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
//                   selectedDepartment === dept
//                     ? 'bg-teal-600 text-white'
//                     : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
//                 }`}
//               >
//                 {dept}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ================= TEACHER GRID ================= */}
//       {filteredTeachers.length === 0 ? (
//         <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-16 text-center">
//           <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
//             <FaUserTie className="h-10 w-10 text-slate-400" />
//           </div>
//           <h3 className="text-xl font-semibold text-slate-900 mb-2">
//             No Teachers Found
//           </h3>
//           <p className="text-slate-600 mb-6">
//             {searchQuery
//               ? "No teachers match your search criteria"
//               : `No teachers found in ${selectedDepartment} department`}
//           </p>
//           <button
//             onClick={() => {
//               setSearchQuery("");
//               setSelectedDepartment("All");
//             }}
//             className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all"
//           >
//             Clear Filters
//           </button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
//           {filteredTeachers.map((teacher) => (
//             <TeacherCard
//               key={teacher._id}
//               teacher={teacher}
//               onAssignClassTeacher={() => openAssignModal(teacher, "classTeacher")}
//               onAssignSubject={() => openAssignModal(teacher, "subject")}
//             />
//           ))}
//         </div>
//       )}

//       {/* Summary Footer */}
//       {filteredTeachers.length > 0 && (
//         <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
//           <div className="flex items-center justify-between">
//             <div className="text-sm text-slate-600">
//               Showing <span className="font-semibold">{filteredTeachers.length}</span> of <span className="font-semibold">{totalTeachers}</span> teachers
//             </div>
//             <div className="text-sm text-slate-600">
//               Department: <span className="font-semibold">{selectedDepartment}</span>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ================= MODAL ================= */}
//       {showAssignModal && (
//         <AssignmentModal
//           teacher={selectedTeacher}
//           classes={classes}
//           type={assignmentType}
//           academicYear={academicYear}
//           onClose={() => {
//             setShowAssignModal(false);
//             setSelectedTeacher(null);
//             setAssignmentType(null);
//           }}
//           onSuccess={() => {
//             setShowAssignModal(false);
//             loadData();
//           }}
//         />
//       )}
//     </div>
//   );
// }

// // Teacher Card Component
// function TeacherCard({ teacher, onAssignClassTeacher, onAssignSubject }) {
//   const workload = teacher.totalWorkload || 0;
//   const maxWorkload = 30;
//   const workloadPercentage = (workload / maxWorkload) * 100;
//   const isOverloaded = workload > maxWorkload;
//   const isHighLoad = workload > maxWorkload * 0.8;

//   return (
//     <div className="bg-white rounded-xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 p-5">
//       {/* Header */}
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex items-center gap-3">
//           <div className="h-12 w-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center font-bold text-teal-700">
//             {teacher.name?.charAt(0) || "T"}
//           </div>
//           <div>
//             <h3 className="font-semibold text-slate-900">{teacher.name}</h3>
//             <p className="text-sm text-slate-500">ID: {teacher.teacherID}</p>
//           </div>
//         </div>
//         {isOverloaded && (
//           <span className="px-2 py-1 text-xs rounded-full bg-rose-100 text-rose-700 border border-rose-300">
//             Overloaded
//           </span>
//         )}
//       </div>

//       {/* Info */}
//       <div className="space-y-2 mb-4">
//         <p className="text-sm text-slate-600 truncate">📧 {teacher.email}</p>
//         <p className="text-sm text-slate-600">📞 {teacher.phone || "N/A"}</p>
//         {teacher.department && (
//           <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
//             {teacher.department}
//           </span>
//         )}
//       </div>

//       {/* Assignments */}
//       {teacher.assignedClasses?.length > 0 && (
//         <div className="mb-4">
//           <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
//             Assignments
//           </p>
//           <div className="space-y-1">
//             {teacher.assignedClasses.slice(0, 3).map((ac, idx) => (
//               <div key={idx} className="text-xs text-slate-700 flex items-center gap-2">
//                 <span className="flex-1 truncate">
//                   {ac.class?.className}-{ac.section} • {ac.subject}
//                 </span>
//                 {ac.isClassTeacher && (
//                   <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
//                     Class Teacher
//                   </span>
//                 )}
//               </div>
//             ))}
//             {teacher.assignedClasses.length > 3 && (
//               <p className="text-xs text-slate-500">
//                 +{teacher.assignedClasses.length - 3} more assignments
//               </p>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Workload */}
//       <div className="mb-4">
//         <div className="flex justify-between text-xs text-slate-500 mb-1">
//           <span className="flex items-center gap-1">
//             <FaClock className="h-3 w-3 text-teal-500" />
//             Weekly Workload
//           </span>
//           <span className={`font-semibold ${
//             isOverloaded ? "text-rose-600" : 
//             isHighLoad ? "text-amber-600" : 
//             "text-emerald-600"
//           }`}>
//             {workload}h / {maxWorkload}h
//           </span>
//         </div>
//         <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
//           <div
//             className={`h-2 rounded-full transition-all duration-500 ${
//               isOverloaded ? "bg-gradient-to-r from-rose-500 to-pink-500" :
//               isHighLoad ? "bg-gradient-to-r from-amber-400 to-orange-500" :
//               "bg-gradient-to-r from-emerald-400 to-teal-500"
//             }`}
//             style={{ width: `${Math.min(workloadPercentage, 100)}%` }}
//           />
//         </div>
//       </div>

//       {/* Actions */}
//       <div className="flex gap-2">
//         <button
//           onClick={onAssignClassTeacher}
//           className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm py-2 font-semibold hover:shadow-lg transition-all"
//         >
//           + Class Teacher
//         </button>
//         <button
//           onClick={onAssignSubject}
//           className="flex-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm py-2 font-semibold hover:shadow-lg transition-all"
//         >
//           + Subject
//         </button>
//       </div>
//     </div>
//   );
// }

// // Assignment Modal Component
// function AssignmentModal({ teacher, classes, type, onClose, onSuccess }) {
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");
//   const [selectedSubject, setSelectedSubject] = useState("");
//   const [hoursPerWeek, setHoursPerWeek] = useState("5");
//   const [loading, setLoading] = useState(false);
//   const [availableSubjects, setAvailableSubjects] = useState([]);
//   const [loadingSubjects, setLoadingSubjects] = useState(false);

//   const classData = classes.find((c) => c._id === selectedClass);
//   const availableSections = classData?.sections || [];

//   // ✅ Fetch available subjects when section is selected
//   useEffect(() => {
//     const fetchAvailableSubjects = async () => {
//       if (!selectedClass || !selectedSection || type !== "subject") {
//         setAvailableSubjects([]);
//         return;
//       }

//       try {
//         setLoadingSubjects(true);
//         const response = await api.get(
//           `${API_ENDPOINTS.ADMIN.TEACHER_MANAGEMENT.AVAILABLE_SUBJECTS}?classId=${selectedClass}&sectionName=${selectedSection}`
//         );

//         const subjects =
//           response?.data?.availableSubjects ||
//           response?.availableSubjects ||
//           [];
//         setAvailableSubjects(subjects);

//         if (subjects.length === 0) {
//           toast.info("No subjects available without teachers in this section");
//         }
//       } catch (error) {
//         console.error("Error fetching subjects:", error);
//         toast.error("Failed to load available subjects");
//         setAvailableSubjects([]);
//       } finally {
//         setLoadingSubjects(false);
//       }
//     };

//     fetchAvailableSubjects();
//   }, [selectedClass, selectedSection, type]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!selectedClass || !selectedSection) {
//       toast.error("Please select class and section");
//       return;
//     }

//     if (type === "subject" && !selectedSubject) {
//       toast.error("Please select a subject");
//       return;
//     }

//     try {
//       setLoading(true);

//       const endpoint =
//         type === "classTeacher"
//           ? API_ENDPOINTS.ADMIN.TEACHER_MANAGEMENT.ASSIGN_CLASS_TEACHER
//           : API_ENDPOINTS.ADMIN.TEACHER_MANAGEMENT.ASSIGN_SUBJECT_TEACHER;

//       const payload =
//         type === "classTeacher"
//           ? {
//               classId: selectedClass,
//               sectionName: selectedSection,
//               teacherId: teacher._id,
//             }
//           : {
//               classId: selectedClass,
//               sectionName: selectedSection,
//               subjectName: selectedSubject,
//               teacherId: teacher._id,
//               hoursPerWeek: parseInt(hoursPerWeek),
//             };

//       await api.put(endpoint, payload);

//       toast.success(
//         type === "classTeacher"
//           ? "Class teacher assigned successfully"
//           : "Subject teacher assigned successfully"
//       );

//       onSuccess();
//     } catch (error) {
//       toast.error(error.message || "Failed to assign teacher");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
//         {/* Header */}
//         <div className="p-6 border-b border-slate-200">
//           <div className="flex items-start justify-between">
//             <div>
//               <h3 className="text-xl font-bold text-slate-900">
//                 {type === "classTeacher"
//                   ? "Assign Class Teacher"
//                   : "Assign Subject Teacher"}
//               </h3>
//               <p className="text-slate-600 mt-1">
//                 Teacher:{" "}
//                 <span className="font-semibold text-teal-600">
//                   {teacher.name}
//                 </span>
//               </p>
//             </div>
//             <button
//               onClick={onClose}
//               className="rounded-xl bg-slate-100 p-2 text-slate-600 transition-all hover:bg-slate-200"
//             >
//               <FaTimes className="h-5 w-5" />
//             </button>
//           </div>
//         </div>

//         {/* Body */}
//         <form onSubmit={handleSubmit} className="p-6 space-y-4">
//           <div>
//             <label className="block text-sm font-semibold text-slate-700 mb-2">
//               Select Class <span className="text-rose-500">*</span>
//             </label>
//             <select
//               value={selectedClass}
//               onChange={(e) => {
//                 setSelectedClass(e.target.value);
//                 setSelectedSection("");
//                 setSelectedSubject("");
//                 setAvailableSubjects([]);
//               }}
//               className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
//               required
//             >
//               <option value="">Choose a class</option>
//               {classes.map((cls) => (
//                 <option key={cls._id} value={cls._id}>
//                   Class {cls.className} ({cls.academicYear})
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-semibold text-slate-700 mb-2">
//               Select Section <span className="text-rose-500">*</span>
//             </label>
//             <select
//               value={selectedSection}
//               onChange={(e) => {
//                 setSelectedSection(e.target.value);
//                 setSelectedSubject("");
//               }}
//               className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
//               required
//               disabled={!selectedClass}
//             >
//               <option value="">Choose a section</option>
//               {availableSections.map((section) => (
//                 <option key={section._id} value={section.sectionName}>
//                   Section {section.sectionName}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {type === "subject" && (
//             <>
//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                   Select Subject <span className="text-rose-500">*</span>
//                 </label>
//                 <select
//                   value={selectedSubject}
//                   onChange={(e) => {
//                     setSelectedSubject(e.target.value);
//                     const subject = availableSubjects.find(
//                       (s) => s.subjectName === e.target.value
//                     );
//                     if (subject && subject.hoursPerWeek) {
//                       setHoursPerWeek(subject.hoursPerWeek.toString());
//                     }
//                   }}
//                   className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
//                   required
//                   disabled={!selectedSection || loadingSubjects}
//                 >
//                   <option value="">
//                     {loadingSubjects
//                       ? "Loading subjects..."
//                       : !selectedSection
//                       ? "Select a section first"
//                       : availableSubjects.length === 0
//                       ? "No subjects available"
//                       : "Choose a subject"}
//                   </option>
//                   {availableSubjects.map((subject) => (
//                     <option key={subject._id} value={subject.subjectName}>
//                       {subject.subjectName}{" "}
//                       {subject.subjectCode ? `(${subject.subjectCode})` : ""}
//                     </option>
//                   ))}
//                 </select>
//                 {selectedSection &&
//                   !loadingSubjects &&
//                   availableSubjects.length === 0 && (
//                     <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
//                       <FaExclamationTriangle className="h-3 w-3" />
//                       All subjects in this section already have teachers assigned
//                     </p>
//                   )}
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                   Hours Per Week
//                 </label>
//                 <input
//                   type="number"
//                   value={hoursPerWeek}
//                   onChange={(e) => setHoursPerWeek(e.target.value)}
//                   className="w-full rounded-xl border-2 border-slate-200 p-3 transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
//                   min="1"
//                   max="10"
//                 />
//               </div>
//             </>
//           )}

//           <div className="flex gap-3 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={
//                 loading ||
//                 (type === "subject" && availableSubjects.length === 0)
//               }
//               className="flex-1 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? "Assigning..." : "Assign Teacher"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


// pages/admin/Admin_Features/AcademicManagement/TeacherManagement.jsx
import { useEffect, useState, useCallback } from "react";
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
  FaFilter,
  FaSearch,
  FaSync,
  FaCalendarAlt,
  FaEye
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

  // ✅ Define loadData FIRST, before any useEffect that uses it
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      console.log("🚀 STARTING DATA LOAD for academic year:", academicYear);

      const teachersUrl =
        API_ENDPOINTS.ADMIN.TEACHER_MANAGEMENT.LIST +
        `?academicYear=${academicYear}`;
      const classesUrl =
        API_ENDPOINTS.ADMIN.CLASS.LIST + `?academicYear=${academicYear}`;

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
      }

      // Test Classes API with individual try-catch
      try {
        console.log("📞 Calling Classes API...");
        classesResp = await api.get(classesUrl);
        console.log("✅ CLASSES API SUCCESS - Full Response:", classesResp);
      } catch (classError) {
        console.error("❌ CLASSES API FAILED:", classError);
      }

      // Extract data from successful responses
      let teacherList = [];
      let classList = [];

      // Extract teachers data
      if (teachersResp) {
        teacherList =
          teachersResp.data?.teachers || teachersResp.teachers || [];
      }

      // Extract classes data
      if (classesResp) {
        classList =
          classesResp.data || classesResp.classes || classesResp || [];
      }

      console.log("🎯 FINAL DATA EXTRACTION:");
      console.log("  - Teachers found:", teacherList.length);
      console.log("  - Classes found:", classList.length);

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
    loadData();
  }, [loadData]);

  const openAssignModal = (teacher, type) => {
    setSelectedTeacher(teacher);
    setAssignmentType(type);
    setShowAssignModal(true);
  };

  // Filter teachers based on department and search
  const filteredTeachers = teachers
    .filter(teacher => 
      selectedDepartment === "All" || teacher.department === selectedDepartment
    )
    .filter(teacher =>
      searchQuery === "" ||
      teacher.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.teacherID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Calculate statistics
  const totalTeachers = teachers.length;
  const classTeachersCount = teachers.filter(t => t.assignments?.classTeacher?.length > 0).length;
  const subjectTeachersCount = teachers.filter(t => t.assignments?.subjects?.length > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600 mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-slate-700">
            Loading teachers...
          </p>
        </div>
      </div>
    );
  }

  return (
   <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-slate-100 to-white min-h-screen">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Teacher Management</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm font-medium">
            <FaChalkboardTeacher className="text-indigo-600" />
            Assign class teachers and subject teachers
          </p>
          <p className="mt-1 text-sm text-slate-500 ">
            Found {totalTeachers} teachers and {classes.length} classes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none w-full md:w-64"
            />
          </div>

          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
          >
            <option value="2023-2024">2023-2024</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2025-2026">2025-2026</option>
          </select>

          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"

          >
            <FaSync className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* ================= STATS CARDS ================= */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Teachers</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalTeachers}</p>
            </div>
            <div className="p-3 rounded-lg bg-teal-100">
              <FaUserTie className="text-lg text-teal-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {selectedDepartment === "All" ? "All departments" : selectedDepartment}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Class Teachers</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{classTeachersCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <FaChalkboardTeacher className="text-lg text-blue-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {((classTeachersCount / totalTeachers) * 100 || 0).toFixed(1)}% of total
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Subject Teachers</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{subjectTeachersCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-100">
              <FaBook className="text-lg text-emerald-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {((subjectTeachersCount / totalTeachers) * 100 || 0).toFixed(1)}% of total
          </div>
        </div>
      </div> */}

      {/* ================= DEPARTMENT FILTERS ================= */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-medium text-slate-700 flex items-center gap-2">
            <FaFilter className="text-slate-400" />
            Filter by Department:
          </span>
          <div className="flex flex-wrap gap-2">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedDepartment === dept
                    ? 'bg-slate-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================= TEACHER GRID ================= */}
      {filteredTeachers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-16 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaUserTie className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No Teachers Found
          </h3>
          <p className="text-slate-600 mb-6">
            {searchQuery
              ? "No teachers match your search criteria"
              : `No teachers found in ${selectedDepartment} department`}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedDepartment("All");
            }}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredTeachers.map((teacher) => (
            <TeacherCard
              key={teacher._id}
              teacher={teacher}
              onAssignClassTeacher={() => openAssignModal(teacher, "classTeacher")}
              onAssignSubject={() => openAssignModal(teacher, "subject")}
            />
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {filteredTeachers.length > 0 && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing <span className="font-semibold">{filteredTeachers.length}</span> of <span className="font-semibold">{totalTeachers}</span> teachers
            </div>
            <div className="text-sm text-slate-600">
              Department: <span className="font-semibold">{selectedDepartment}</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL ================= */}
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
  );
}

// Teacher Card Component
function TeacherCard({ teacher, onAssignClassTeacher, onAssignSubject }) {
  const workload = teacher.totalWorkload || 0;
  const maxWorkload = 30;
  const workloadPercentage = (workload / maxWorkload) * 100;
  const isOverloaded = workload > maxWorkload;
  const isHighLoad = workload > maxWorkload * 0.8;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 p-5 flex flex-col h-full">

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center">
  {teacher.profilePic ? (
    <img
      src={teacher.profilePic}
      alt={teacher.name}
      className="h-full w-full object-cover"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = "/images/default-teacher.png";
      }}
    />
  ) : (
    <span className="font-bold text-slate-600">
      {teacher.name?.charAt(0) || "T"}
    </span>
  )}
</div>

          <div>
            <h3 className="font-semibold text-slate-900">{teacher.name}</h3>
            <p className="text-sm text-slate-500">ID: {teacher.teacherID}</p>
          </div>
        </div>
        {isOverloaded && (
          <span className="px-2 py-1 text-xs rounded-full bg-rose-100 text-rose-700 border border-rose-300">
            Overloaded
          </span>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4">
        <p className="text-sm text-slate-600 truncate">📧 {teacher.email}</p>
        <p className="text-sm text-slate-600">📞 {teacher.phone || "N/A"}</p>
        {teacher.department && (
          <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100
 rounded-lg text-xs font-medium">
            {teacher.department}
          </span>
        )}
      </div>

      {/* Assignments */}
      {teacher.assignedClasses?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
            Assignments
          </p>
          <div className="space-y-1">
            {teacher.assignedClasses.slice(0, 3).map((ac, idx) => (
              <div key={idx} className="text-xs text-slate-700 flex items-center gap-2">
                <span className="flex-1 truncate">
                  {ac.class?.className}-{ac.section} • {ac.subject}
                </span>
                {ac.isClassTeacher && (
                  <span className="text-xs bg-indigo-100 text-indigo-700
 px-2 py-0.5 rounded">
                    Class Teacher
                  </span>
                )}
              </div>
            ))}
            {teacher.assignedClasses.length > 3 && (
              <p className="text-xs text-slate-500">
                +{teacher.assignedClasses.length - 3} more assignments
              </p>
            )}
          </div>
        </div>
      )}

      {/* Workload */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span className="flex items-center gap-1 mt-auto">
            <FaClock className="h-3 w-3 text-indigo-500" />
            Weekly Workload
          </span>
          <span className={`font-semibold ${
            isOverloaded ? "text-rose-600" : 
            isHighLoad ? "text-amber-600" : 
            "text-emerald-600"
          }`}>
            {workload}h / {maxWorkload}h
          </span>
        </div>
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              isOverloaded ? "bg-gradient-to-r from-rose-500 to-pink-500" :
              isHighLoad ? "bg-gradient-to-r from-amber-400 to-orange-500" :
              "bg-gradient-to-r from-emerald-400 to-teal-500"
            }`}
            style={{ width: `${Math.min(workloadPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-4">
        <button
          onClick={onAssignClassTeacher}
          className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-gray-700 text-white text-sm py-2 font-semibold hover:shadow-lg transition-all"
        >
          + Class Teacher
        </button>
        <button
          onClick={onAssignSubject}
          className="flex-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-sm py-2 font-semibold hover:shadow-lg transition-all"
        >
          + Subject
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

        const subjects =
          response?.data?.availableSubjects ||
          response?.availableSubjects ||
          [];
        setAvailableSubjects(subjects);

        if (subjects.length === 0) {
          toast.info("No subjects available without teachers in this section");
        }
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {type === "classTeacher"
                  ? "Assign Class Teacher"
                  : "Assign Subject Teacher"}
              </h3>
              <p className="text-slate-600 mt-1">
                Teacher:{" "}
                <span className="font-semibold text-indigo-600">
                  {teacher.name}
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-100 p-2 text-slate-600 transition-all hover:bg-indigo-50"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select Class <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection("");
                setSelectedSubject("");
                setAvailableSubjects([]);
              }}
              className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
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
              Select Section <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedSubject("");
              }}
              className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
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
                  Select Subject <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    const subject = availableSubjects.find(
                      (s) => s.subjectName === e.target.value
                    );
                    if (subject && subject.hoursPerWeek) {
                      setHoursPerWeek(subject.hoursPerWeek.toString());
                    }
                  }}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
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
                      {subject.subjectName}{" "}
                      {subject.subjectCode ? `(${subject.subjectCode})` : ""}
                    </option>
                  ))}
                </select>
                {selectedSection &&
                  !loadingSubjects &&
                  availableSubjects.length === 0 && (
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
                  className="w-full rounded-xl border-2 border-slate-200 p-3 transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
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
              disabled={
                loading ||
                (type === "subject" && availableSubjects.length === 0)
              }
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600
 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Assigning..." : "Assign Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}