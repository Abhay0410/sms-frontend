/* eslint-disable no-unused-vars */
// import { useEffect, useState } from "react";
// import { toast } from "react-toastify";
// import api, { API_ENDPOINTS } from "../../../../services/api";
// import BackButton from "../../../../components/BackButton";

// export default function MarkAttendance() {
//   const [assignments, setAssignments] = useState({
//     classes: [],
//     teachingSubjects: [],
//     canMarkAttendance: false
//   });

//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");
//   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
//   const [attendance, setAttendance] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [bulkAction, setBulkAction] = useState("");

//   useEffect(() => {
//     loadTeacherAssignments();
//   }, []);

// const loadTeacherAssignments = async () => {
//   try {
//     setLoading(true);

//     const resp = await api.get(API_ENDPOINTS.TEACHER.ATTENDANCE.CLASSES);

//     const outer = resp?.data || resp;
//     const payload = outer.data || outer; // <-- important

//     setAssignments({
//       classes: payload.classes || [],
//       teachingSubjects: payload.teachingSubjects || [],
//       canMarkAttendance: !!payload.canMarkAttendance,
//       roles: payload.roles || {
//         isClassTeacher:
//           Array.isArray(payload.classes) && payload.classes.length > 0,
//         isSubjectTeacher:
//           Array.isArray(payload.teachingSubjects) &&
//           payload.teachingSubjects.length > 0,
//       },
//       teacher: payload.teacher || {},
//     });

//     const noClasses = !payload.classes || payload.classes.length === 0;
//     const noSubjects =
//       !payload.teachingSubjects || payload.teachingSubjects.length === 0;

//     if (noClasses && noSubjects) {
//       toast.info("You are not assigned to any classes or subjects");
//     } else if (noClasses && !noSubjects) {
//       toast.info(
//         "You are a subject teacher. Only class teachers can mark attendance."
//       );
//     }
//   } catch (error) {
//     toast.error(error.message || "Failed to load your assignments");
//   } finally {
//     setLoading(false);
//   }
// };

//   const loadAttendance = async () => {
//     if (!selectedClass || !selectedSection || !date) {
//       toast.warning("Please select class, section and date");
//       return;
//     }

//     try {
//       setLoading(true);

// const selectedClassData = assignments.classes.find(
//   (c) => c.classId === selectedClass
// );

// // 1) Try to get existing attendance (already marked)
// const attendanceResp = await api.get(
//   API_ENDPOINTS.TEACHER.ATTENDANCE.BY_CLASS,
//   {
//     params: {
//       classId: selectedClass,
//       sectionId: selectedSection,
//       date,
//       academicYear: "2025-2026",
//     },
//   }
// );

// let attendanceData = [];

// const raw = Array.isArray(attendanceResp)
//   ? attendanceResp
//   : attendanceResp.data || attendanceResp.attendance || [];

// if (Array.isArray(raw) && raw.length > 0 && raw.records) {
//   // Attendance docs → records
//   const records = raw.records;

//   attendanceData = records.map((r) => ({
//     studentId:
//       r.student?._id?.toString?.() ||
//       r.studentId ||
//       r.student ||
//       r._id,
//     studentID: r.student?.studentID || "",
//     name: r.student?.name || "",
//     rollNumber: r.student?.rollNumber || r.rollNumber || "",
//     status: r.status || "PRESENT",
//     remarks: r.remarks || "",
//   }));
// }

// // 2) If no attendance found, load fresh students list
// // 2) If no attendance found, load fresh students list
// if (attendanceData.length === 0) {
//   const studentsResp = await api.get(
//     API_ENDPOINTS.TEACHER.ATTENDANCE.STUDENTS,
//     {
//       params: {
//         classId: selectedClass,
//         sectionId: selectedSection,
//         academicYear: "2025-2026",
//       },
//     }
//   );

//   const outer = studentsResp?.data || studentsResp;
//   const payload = outer.data || outer;

//   const studentsRaw = payload.students || [];

//   if (Array.isArray(studentsRaw)) {
//     attendanceData = studentsRaw.map((s) => ({
//       studentId: s.studentId || s._id || s.id,
//       studentID: s.studentID,
//       name: s.name,
//       rollNumber: s.rollNumber,
//       status: s.status || "PRESENT",
//       remarks: s.remarks || "",
//     }));
//   }
// }

// setAttendance(attendanceData);

// if (attendanceData.length === 0) {
//   toast.error(
//     `No students found in ${selectedClassData?.className}-${selectedClassData?.section}`
//   );
// } else {
//   toast.success(`Loaded ${attendanceData.length} students`);
// }

//     } catch (error) {
//       if (error.response?.status === 403) {
//         toast.error("You are not authorized to mark attendance for this class");
//       } else if (error.response?.status === 404) {
//         toast.error("Class or section not found");
//       } else {
//         toast.error(error.message || "Failed to load attendance");
//       }
//       setAttendance([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStatusChange = (studentId, status) => {
//     setAttendance(prev =>
//       prev.map(item =>
//         item.studentId === studentId
//           ? { ...item, status, remarks: status === "ABSENT" ? "" : item.remarks }
//           : item
//       )
//     );
//   };

//   const handleRemarksChange = (studentId, remarks) => {
//     setAttendance(prev =>
//       prev.map(item =>
//         item.studentId === studentId ? { ...item, remarks } : item
//       )
//     );
//   };

//   // NEW: Bulk action handler
//   const handleBulkAction = (action) => {
//     if (!action) return;

//     setAttendance(prev =>
//       prev.map(item => ({ ...item, status: action }))
//     );

//     toast.success(`Marked all students as ${action.toLowerCase()}`);
//     setBulkAction("");
//   };

//   const submitAttendance = async () => {
//     if (!selectedClass || !selectedSection || !date) {
//       toast.warning("Please select class, section and date");
//       return;
//     }

//     if (attendance.length === 0) {
//       toast.warning("No students to mark attendance for");
//       return;
//     }

//     try {
//       setSubmitting(true);

//       const selectedClassData = assignments.classes.find(c => c.classId === selectedClass);
//       const academicYear = selectedClassData?.academicYear || "2025-2026";

//       const payload = {
//         classId: selectedClass,
//         sectionId: selectedSection,
//         date,
//         academicYear: academicYear,
//         attendance: attendance.map(student => {
//           let status = student.status.toUpperCase();

//           if (status === "HALF-DAY") {
//             status = "HALF_DAY";
//           }

//           return {
//             studentId: student.studentId || student._id || student.id,
//             status: status,
//             remarks: student.remarks || ""
//           };
//         })
//       };

//       await api.post(API_ENDPOINTS.TEACHER.ATTENDANCE.MARK, payload, {
//         timeout: 60000
//       });

//       toast.success(`Attendance marked successfully for ${selectedClassData?.className}-${selectedClassData?.section}`);

//       await loadAttendance();

//     } catch (error) {
//       if (error.response?.status === 400) {
//         const errorData = error.response.data;
//         if (errorData.message?.includes("status") || errorData.message?.includes("enum")) {
//           toast.error(`Status value error: Make sure status is PRESENT, ABSENT, LATE, HALF_DAY, or EXCUSED`);
//         } else {
//           toast.error(`Validation Error: ${errorData.message}`);
//         }
//       } else {
//         toast.error(error.message || "Failed to mark attendance");
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const selectedClassData = assignments.classes.find(c => c.classId === selectedClass);
//   const sections = selectedClassData ? [{
//     sectionId: selectedClassData.sectionId,
//     sectionName: selectedClassData.section
//   }] : [];

//   // NEW: Calculate attendance statistics
//   const stats = attendance.reduce((acc, student) => {
//     const status = student.status || "PRESENT";
//     acc[status] = (acc[status] || 0) + 1;
//     return acc;
//   }, {});

//   const getStatusColor = (status) => {
//     const colors = {
//       PRESENT: "bg-green-100 text-green-800 border-green-300",
//       ABSENT: "bg-red-100 text-red-800 border-red-300",
//       LATE: "bg-yellow-100 text-yellow-800 border-yellow-300",
//       HALF_DAY: "bg-blue-100 text-blue-800 border-blue-300",
//       EXCUSED: "bg-purple-100 text-purple-800 border-purple-300"
//     };
//     return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
//   };

//   if (loading && assignments.classes.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
//         <div className="relative">
//           <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
//           <div className="absolute inset-0 flex items-center justify-center">
//             <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//             </svg>
//           </div>
//         </div>
//         <p className="mt-6 text-lg text-gray-700 font-medium">Loading your assignments...</p>
//         <p className="mt-2 text-sm text-gray-500">Please wait a moment</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header Section */}
//         <div className="mb-6">
//           <BackButton to="/teacher/teacher-dashboard" />
//         </div>

//         <div className="text-center mb-10">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
//             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
//             </svg>
//           </div>
//           <h1 className="text-4xl font-bold text-gray-900 mb-2">Mark Attendance</h1>
//           <p className="text-gray-600 text-lg">Select class, section and date to track student attendance</p>
//         </div>

//         {!assignments.canMarkAttendance ? (
//           <div className="max-w-2xl mx-auto">
//             <div className="bg-white border border-amber-200 rounded-2xl p-8 text-center shadow-lg">
//               <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
//                 </svg>
//               </div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-3">Attendance Marking Not Available</h3>
//               <p className="text-gray-600 text-lg leading-relaxed">
//                 {assignments.roles?.isSubjectTeacher
//                   ? "You are currently assigned as a subject teacher. Only class teachers can mark daily attendance."
//                   : "You are not assigned as a class teacher for any classes at this time."}
//               </p>
//               <div className="mt-6 p-4 bg-blue-50 rounded-lg">
//                 <p className="text-sm text-blue-800">
//                   <strong>Need access?</strong> Please contact your administrator to update your class assignments.
//                 </p>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <>
//             {/* Selection Card - Enhanced */}
//             <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900 mb-1">Quick Selection</h2>
//                   <p className="text-gray-600">Choose your class and date to begin marking</p>
//                 </div>
//                 <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-3 rounded-xl shadow-md">
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                   </svg>
//                   <div>
//                     <div className="text-xs opacity-90">Classes Assigned</div>
//                     <div className="text-lg font-bold">{assignments.classes.length}</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                 {/* Class Selection */}
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-3">
//                     <span className="flex items-center gap-2">
//                       <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                       </svg>
//                       Class *
//                     </span>
//                   </label>
//                   <select
//                     value={selectedClass}
//                     onChange={(e) => {
//                       setSelectedClass(e.target.value);
//                       setSelectedSection("");
//                       setAttendance([]);
//                     }}
//                     className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-gray-700 font-medium bg-white hover:border-indigo-400"
//                   >
//                     <option value="">Select a class</option>
//                     {assignments.classes.map(cls => (
//                       <option key={cls.classId} value={cls.classId}>
//                         Class {cls.className} - Section {cls.section}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Section Selection */}
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-3">
//                     <span className="flex items-center gap-2">
//                       <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
//                       </svg>
//                       Section *
//                     </span>
//                   </label>
//                   <select
//                     value={selectedSection}
//                     onChange={(e) => {
//                       setSelectedSection(e.target.value);
//                       setAttendance([]);
//                     }}
//                     className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-gray-700 font-medium bg-white hover:border-indigo-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
//                     disabled={!selectedClass}
//                   >
//                     <option value="">Select section</option>
//                     {sections.map(sec => (
//                       <option key={sec.sectionId} value={sec.sectionId}>
//                         Section {sec.sectionName}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Date Selection */}
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-3">
//                     <span className="flex items-center gap-2">
//                       <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                       </svg>
//                       Date *
//                     </span>
//                   </label>
//                   <input
//                     type="date"
//                     value={date}
//                     onChange={(e) => setDate(e.target.value)}
//                     className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-gray-700 font-medium bg-white hover:border-indigo-400"
//                   />
//                 </div>

//                 {/* Load Button */}
//                 <div className="flex items-end">
//                   <button
//                     onClick={loadAttendance}
//                     disabled={!selectedClass || !selectedSection || !date || loading}
//                     className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
//                   >
//                     {loading ? (
//                       <>
//                         <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
//                         Loading...
//                       </>
//                     ) : (
//                       <>
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                         </svg>
//                         Load Students
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>

//               {/* Current Selection Banner */}
//               {selectedClass && selectedSection && attendance.length > 0 && (
//                 <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
//                   <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                     <div>
//                       <h4 className="font-bold text-blue-900 text-lg mb-1">Ready to Mark Attendance</h4>
//                       <p className="text-blue-700 flex items-center gap-2 flex-wrap">
//                         <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm font-medium">
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                           </svg>
//                           {selectedClassData?.className}-{selectedClassData?.section}
//                         </span>
//                         <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm font-medium">
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                           </svg>
//                           {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
//                         </span>
//                       </p>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-green-200">
//                         <div className="text-3xl font-bold text-green-600">{attendance.length}</div>
//                         <div className="text-xs text-gray-600 font-medium">Student{attendance.length !== 1 ? 's' : ''} Loaded</div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Attendance Statistics Cards - NEW */}
//             {attendance.length > 0 && (
//               <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
//                 <div className="bg-white rounded-xl shadow-md border-l-4 border-gray-400 p-5">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-gray-600 text-sm font-medium">Total</p>
//                       <p className="text-3xl font-bold text-gray-900">{attendance.length}</p>
//                     </div>
//                     <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                     </svg>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-md border-l-4 border-green-500 p-5">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-gray-600 text-sm font-medium">Present</p>
//                       <p className="text-3xl font-bold text-green-600">{stats.PRESENT || 0}</p>
//                     </div>
//                     <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-md border-l-4 border-red-500 p-5">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-gray-600 text-sm font-medium">Absent</p>
//                       <p className="text-3xl font-bold text-red-600">{stats.ABSENT || 0}</p>
//                     </div>
//                     <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-md border-l-4 border-yellow-500 p-5">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-gray-600 text-sm font-medium">Late</p>
//                       <p className="text-3xl font-bold text-yellow-600">{stats.LATE || 0}</p>
//                     </div>
//                     <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-md border-l-4 border-blue-500 p-5">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-gray-600 text-sm font-medium">Half Day</p>
//                       <p className="text-3xl font-bold text-blue-600">{stats.HALF_DAY || 0}</p>
//                     </div>
//                     <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Attendance Table - Enhanced */}
//             {attendance.length > 0 && (
//               <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
//                 <div className="px-8 py-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
//                   <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                     <div>
//                       <h3 className="text-2xl font-bold text-gray-900 mb-1">
//                         Student Attendance
//                       </h3>
//                       <p className="text-gray-600 flex items-center gap-2">
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                         </svg>
//                         {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//                       </p>
//                     </div>

//                     {/* NEW: Bulk Actions */}
//                     <div className="flex items-center gap-3">
//                       <label className="text-sm font-medium text-gray-700">Quick Action:</label>
//                       <select
//                         value={bulkAction}
//                         onChange={(e) => handleBulkAction(e.target.value)}
//                         className="rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-sm font-medium"
//                       >
//                         <option value="">Mark all as...</option>
//                         <option value="PRESENT">All Present</option>
//                         <option value="ABSENT">All Absent</option>
//                         <option value="LATE">All Late</option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
//                           Roll No
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
//                           Student ID
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
//                           Student Name
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
//                           Attendance Status
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
//                           Remarks
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-100">
//                       {attendance.map((student, index) => (
//                         <tr key={student.studentId} className="hover:bg-gray-50 transition-colors group">
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center gap-3">
//                               <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
//                                 {student.rollNumber || index + 1}
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className="text-sm font-medium text-gray-700">{student.studentID}</span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center gap-3">
//                               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm shadow-md">
//                                 {student.name.charAt(0).toUpperCase()}
//                               </div>
//                               <span className="text-sm font-semibold text-gray-900">{student.name}</span>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <select
//                               value={student.status}
//                               onChange={(e) => handleStatusChange(student.studentId, e.target.value)}
//                               className={`rounded-xl border-2 py-2.5 px-4 text-sm font-semibold focus:ring-4 transition-all w-40 ${getStatusColor(student.status)} hover:shadow-md`}
//                             >
//                               <option value="PRESENT">✓ Present</option>
//                               <option value="ABSENT">✗ Absent</option>
//                               <option value="LATE">⏰ Late</option>
//                               <option value="HALF_DAY">◑ Half Day</option>
//                               <option value="EXCUSED">⚠ Excused</option>
//                             </select>
//                           </td>
//                           <td className="px-6 py-4">
//                             <input
//                               type="text"
//                               value={student.remarks}
//                               onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
//                               placeholder={student.status === "ABSENT" ? "Add remarks..." : "Optional"}
//                               className="rounded-lg border-2 border-gray-300 py-2 px-4 text-sm w-full focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:bg-gray-50 disabled:text-gray-400"
//                               disabled={student.status !== "ABSENT"}
//                             />
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Footer with Submit Button */}
//                 <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
//                   <div className="flex flex-col md:flex-row items-center justify-between gap-4">
//                     <div className="text-sm text-gray-600 flex items-center gap-2">
//                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                       Reviewing attendance for <strong>{attendance.length}</strong> student{attendance.length !== 1 ? 's' : ''}
//                     </div>
//                     <button
//                       onClick={submitAttendance}
//                       disabled={submitting}
//                       className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 px-10 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 font-bold transition-all flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
//                     >
//                       {submitting ? (
//                         <>
//                           <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
//                           Submitting...
//                         </>
//                       ) : (
//                         <>
//                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                           </svg>
//                           Submit Attendance ({attendance.length} Students)
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Empty State - NEW */}
//             {!loading && attendance.length === 0 && selectedClass && selectedSection && (
//               <div className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300 p-12 text-center">
//                 <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                   <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                   </svg>
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-900 mb-2">No Students Found</h3>
//                 <p className="text-gray-600 mb-6">Click "Load Students" button above to fetch the student list for this class.</p>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../../services/api";
import BackButton from "../../../../components/BackButton";

export default function MarkAttendance() {
  const [assignments, setAssignments] = useState({
    classes: [],
    teachingSubjects: [],
    canMarkAttendance: false,
  });

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bulkAction, setBulkAction] = useState("");

  useEffect(() => {
    loadTeacherAssignments();
  }, []);

  const loadTeacherAssignments = async () => {
    try {
      setLoading(true);

      const resp = await api.get(API_ENDPOINTS.TEACHER.ATTENDANCE.CLASSES);

      const outer = resp?.data || resp;
      const payload = outer.data || outer; // <-- important

      setAssignments({
        classes: payload.classes || [],
        teachingSubjects: payload.teachingSubjects || [],
        canMarkAttendance: !!payload.canMarkAttendance,
        roles: payload.roles || {
          isClassTeacher:
            Array.isArray(payload.classes) && payload.classes.length > 0,
          isSubjectTeacher:
            Array.isArray(payload.teachingSubjects) &&
            payload.teachingSubjects.length > 0,
        },
        teacher: payload.teacher || {},
      });

      const noClasses = !payload.classes || payload.classes.length === 0;
      const noSubjects =
        !payload.teachingSubjects || payload.teachingSubjects.length === 0;

      if (noClasses && noSubjects) {
        toast.info("You are not assigned to any classes or subjects");
      } else if (noClasses && !noSubjects) {
        toast.info(
          "You are a subject teacher. Only class teachers can mark attendance.",
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to load your assignments");
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    if (!selectedClass || !selectedSection || !date) {
      toast.warning("Please select class, section and date");
      return;
    }

    try {
      setLoading(true);

      const selectedClassData = assignments.classes.find(
        (c) => c.classId === selectedClass,
      );

      // 1) Try to get existing attendance (already marked)
      const attendanceResp = await api.get(
        API_ENDPOINTS.TEACHER.ATTENDANCE.BY_CLASS,
        {
          params: {
            classId: selectedClass,
            sectionId: selectedSection,
            date,
            academicYear: "2025-2026",
          },
        },
      );

      let attendanceData = [];

      const raw = Array.isArray(attendanceResp)
        ? attendanceResp
        : attendanceResp.data || attendanceResp.attendance || [];

      if (Array.isArray(raw) && raw.length > 0 && raw.records) {
        // Attendance docs → records
        const records = raw.records;

        attendanceData = records.map((r) => ({
          studentId:
            r.student?._id?.toString?.() || r.studentId || r.student || r._id,
          studentID: r.student?.studentID || "",
          name: r.student?.name || "",
          rollNumber: r.student?.rollNumber || r.rollNumber || "",
          status: r.status || "PRESENT",
          remarks: r.remarks || "",
        }));
      }

      // 2) If no attendance found, load fresh students list
      // 2) If no attendance found, load fresh students list
      if (attendanceData.length === 0) {
        const studentsResp = await api.get(
          API_ENDPOINTS.TEACHER.ATTENDANCE.STUDENTS,
          {
            params: {
              classId: selectedClass,
              sectionId: selectedSection,
              academicYear: "2025-2026",
            },
          },
        );

        const outer = studentsResp?.data || studentsResp;
        const payload = outer.data || outer;

        const studentsRaw = payload.students || [];

        if (Array.isArray(studentsRaw)) {
          attendanceData = studentsRaw.map((s) => ({
            studentId: s.studentId || s._id || s.id,
            studentID: s.studentID,
            name: s.name,
            rollNumber: s.rollNumber,
            status: s.status || "PRESENT",
            remarks: s.remarks || "",
          }));
        }
      }

      setAttendance(attendanceData);

      if (attendanceData.length === 0) {
        toast.error(
          `No students found in ${selectedClassData?.className}-${selectedClassData?.section}`,
        );
      } else {
        toast.success(`Loaded ${attendanceData.length} students`);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("You are not authorized to mark attendance for this class");
      } else if (error.response?.status === 404) {
        toast.error("Class or section not found");
      } else {
        toast.error(error.message || "Failed to load attendance");
      }
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) =>
      prev.map((item) =>
        item.studentId === studentId
          ? {
              ...item,
              status,
              remarks: status === "ABSENT" ? "" : item.remarks,
            }
          : item,
      ),
    );
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendance((prev) =>
      prev.map((item) =>
        item.studentId === studentId ? { ...item, remarks } : item,
      ),
    );
  };

  // NEW: Bulk action handler
  const handleBulkAction = (action) => {
    if (!action) return;

    setAttendance((prev) => prev.map((item) => ({ ...item, status: action })));

    toast.success(`Marked all students as ${action.toLowerCase()}`);
    setBulkAction("");
  };

  const submitAttendance = async () => {
    if (!selectedClass || !selectedSection || !date) {
      toast.warning("Please select class, section and date");
      return;
    }

    if (attendance.length === 0) {
      toast.warning("No students to mark attendance for");
      return;
    }

    try {
      setSubmitting(true);

      const selectedClassData = assignments.classes.find(
        (c) => c.classId === selectedClass,
      );
      const academicYear = selectedClassData?.academicYear || "2025-2026";

      const payload = {
        classId: selectedClass,
        sectionId: selectedSection,
        date,
        academicYear: academicYear,
        attendance: attendance.map((student) => {
          let status = student.status.toUpperCase();

          if (status === "HALF-DAY") {
            status = "HALF_DAY";
          }

          return {
            studentId: student.studentId || student._id || student.id,
            status: status,
            remarks: student.remarks || "",
          };
        }),
      };

      await api.post(API_ENDPOINTS.TEACHER.ATTENDANCE.MARK, payload, {
        timeout: 60000,
      });

      toast.success(
        `Attendance marked successfully for ${selectedClassData?.className}-${selectedClassData?.section}`,
      );

      await loadAttendance();
    } catch (error) {
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (
          errorData.message?.includes("status") ||
          errorData.message?.includes("enum")
        ) {
          toast.error(
            `Status value error: Make sure status is PRESENT, ABSENT, LATE, HALF_DAY, or EXCUSED`,
          );
        } else {
          toast.error(`Validation Error: ${errorData.message}`);
        }
      } else {
        toast.error(error.message || "Failed to mark attendance");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedClassData = assignments.classes.find(
    (c) => c.classId === selectedClass,
  );
  const sections = selectedClassData
    ? [
        {
          sectionId: selectedClassData.sectionId,
          sectionName: selectedClassData.section,
        },
      ]
    : [];

  // NEW: Calculate attendance statistics
  const stats = attendance.reduce((acc, student) => {
    const status = student.status || "PRESENT";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const getStatusColor = (status) => {
    const colors = {
      PRESENT: "bg-green-100 text-green-800 border-green-300",
      ABSENT: "bg-red-100 text-red-800 border-red-300",
      LATE: "bg-yellow-100 text-yellow-800 border-yellow-300",
      HALF_DAY: "bg-blue-100 text-blue-800 border-blue-300",
      EXCUSED: "bg-purple-100 text-purple-800 border-purple-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  if (loading && assignments.classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        </div>
        <p className="mt-6 text-lg text-gray-700 font-medium">
          Loading your assignments...
        </p>
        <p className="mt-2 text-sm text-gray-500">Please wait a moment</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <BackButton to="/teacher/teacher-dashboard" />
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Mark Attendance
          </h1>
          <p className="text-gray-600 text-lg">
            Select class, section and date to track student attendance
          </p>
        </div>

        {!assignments.canMarkAttendance ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-amber-200 rounded-2xl p-8 text-center shadow-lg">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Attendance Marking Not Available
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {assignments.roles?.isSubjectTeacher
                  ? "You are currently assigned as a subject teacher. Only class teachers can mark daily attendance."
                  : "You are not assigned as a class teacher for any classes at this time."}
              </p>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Need access?</strong> Please contact your
                  administrator to update your class assignments.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Selection Card - Enhanced */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Quick Selection
                  </h2>
                  <p className="text-gray-600">
                    Choose your class and date to begin marking
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-3 rounded-xl shadow-md">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <div>
                    <div className="text-xs opacity-90">Classes Assigned</div>
                    <div className="text-lg font-bold">
                      {assignments.classes.length}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Class Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      Class *
                    </span>
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setSelectedSection("");
                      setAttendance([]);
                    }}
                    className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-gray-700 font-medium bg-white hover:border-indigo-400"
                  >
                    <option value="">Select a class</option>
                    {assignments.classes.map((cls) => (
                      <option key={cls.classId} value={cls.classId}>
                        Class {cls.className} - Section {cls.section}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>
                      Section *
                    </span>
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => {
                      setSelectedSection(e.target.value);
                      setAttendance([]);
                    }}
                    className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-gray-700 font-medium bg-white hover:border-indigo-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!selectedClass}
                  >
                    <option value="">Select section</option>
                    {sections.map((sec) => (
                      <option key={sec.sectionId} value={sec.sectionId}>
                        Section {sec.sectionName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Date *
                    </span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-gray-700 font-medium bg-white hover:border-indigo-400"
                  />
                </div>

                {/* Load Button */}
                <div className="flex items-end">
                  <button
                    onClick={loadAttendance}
                    disabled={
                      !selectedClass || !selectedSection || !date || loading
                    }
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Load Students
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Current Selection Banner */}
              {selectedClass && selectedSection && attendance.length > 0 && (
                <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-blue-900 text-lg mb-1">
                        Ready to Mark Attendance
                      </h4>
                      <p className="text-blue-700 flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm font-medium">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          {selectedClassData?.className}-
                          {selectedClassData?.section}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm font-medium">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {new Date(date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-green-200">
                        <div className="text-3xl font-bold text-green-600">
                          {attendance.length}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">
                          Student{attendance.length !== 1 ? "s" : ""} Loaded
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Attendance Statistics Cards - NEW */}
            {attendance.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-md border-l-4 border-gray-400 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {attendance.length}
                      </p>
                    </div>
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border-l-4 border-green-500 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">
                        Present
                      </p>
                      <p className="text-3xl font-bold text-green-600">
                        {stats.PRESENT || 0}
                      </p>
                    </div>
                    <svg
                      className="w-10 h-10 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border-l-4 border-red-500 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">
                        Absent
                      </p>
                      <p className="text-3xl font-bold text-red-600">
                        {stats.ABSENT || 0}
                      </p>
                    </div>
                    <svg
                      className="w-10 h-10 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border-l-4 border-yellow-500 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Late</p>
                      <p className="text-3xl font-bold text-yellow-600">
                        {stats.LATE || 0}
                      </p>
                    </div>
                    <svg
                      className="w-10 h-10 text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border-l-4 border-blue-500 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">
                        Half Day
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {stats.HALF_DAY || 0}
                      </p>
                    </div>
                    <svg
                      className="w-10 h-10 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Table - Enhanced */}
            {attendance.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        Student Attendance
                      </h3>
                      <p className="text-gray-600 flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {new Date(date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* NEW: Bulk Actions */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700">
                        Quick Action:
                      </label>
                      <select
                        value={bulkAction}
                        onChange={(e) => handleBulkAction(e.target.value)}
                        className="rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-sm font-medium"
                      >
                        <option value="">Mark all as...</option>
                        <option value="PRESENT">All Present</option>
                        <option value="ABSENT">All Absent</option>
                        <option value="LATE">All Late</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Roll No
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Student ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Attendance Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {attendance.map((student, index) => (
                        <tr
                          key={student.studentId}
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                {student.rollNumber || index + 1}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-700">
                              {student.studentID}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-semibold text-gray-900">
                                {student.name}
                              </span>
                            </div>
                          </td>
                          {/* <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={student.status}
                              onChange={(e) => handleStatusChange(student.studentId, e.target.value)}
                              className={`rounded-xl border-2 py-2.5 px-4 text-sm font-semibold focus:ring-4 transition-all w-40 ${getStatusColor(student.status)} hover:shadow-md`}
                            >
                              <option value="PRESENT">✓ Present</option>
                              <option value="ABSENT">✗ Absent</option>
                              <option value="LATE">⏰ Late</option>
                              <option value="HALF_DAY">◑ Half Day</option>
                              <option value="EXCUSED">⚠ Excused</option>
                            </select>
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-3">
                              {[
                                {
                                  label: "Present",
                                  value: "PRESENT",
                                  color: "text-green-600",
                                },
                                {
                                  label: "Absent",
                                  value: "ABSENT",
                                  color: "text-red-600",
                                },
                                {
                                  label: "Late",
                                  value: "LATE",
                                  color: "text-yellow-600",
                                },
                                {
                                  label: "Half Day",
                                  value: "HALF_DAY",
                                  color: "text-blue-600",
                                },
                                {
                                  label: "Excused",
                                  value: "EXCUSED",
                                  color: "text-orange-600",
                                },
                              ].map((status) => (
                                <label
                                  key={status.value}
                                  className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 
                                  ${
                                    student.status === status.value
                                      ? "border-purple-600 bg-purple-50"
                                      : "border-gray-300"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`attendance-${student.studentId}`}
                                    value={status.value}
                                    checked={student.status === status.value}
                                    onChange={() =>
                                      handleStatusChange(
                                        student.studentId,
                                        status.value,
                                      )
                                    }
                                    className="accent-purple-600"
                                  />
                                  <span
                                    className={`text-sm font-medium ${status.color}`}
                                  >
                                    {status.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={student.remarks}
                              onChange={(e) =>
                                handleRemarksChange(
                                  student.studentId,
                                  e.target.value,
                                )
                              }
                              placeholder={
                                student.status === "ABSENT"
                                  ? "Add remarks..."
                                  : "Optional"
                              }
                              className="rounded-lg border-2 border-gray-300 py-2 px-4 text-sm w-full focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:bg-gray-50 disabled:text-gray-400"
                              disabled={student.status !== "ABSENT"}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer with Submit Button */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Reviewing attendance for{" "}
                      <strong>{attendance.length}</strong> student
                      {attendance.length !== 1 ? "s" : ""}
                    </div>
                    <button
                      onClick={submitAttendance}
                      disabled={submitting}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 px-10 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 font-bold transition-all flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Submit Attendance ({attendance.length} Students)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State - NEW */}
            {!loading &&
              attendance.length === 0 &&
              selectedClass &&
              selectedSection && (
                <div className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300 p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No Students Found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Click "Load Students" button above to fetch the student list
                    for this class.
                  </p>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}
