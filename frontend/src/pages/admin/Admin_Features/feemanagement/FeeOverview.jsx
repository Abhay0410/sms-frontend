// // components/admin/fee/FeeOverview.jsx
// import { useEffect, useState, useCallback } from "react";
// import { toast } from "react-toastify";
// import api from "../../../../services/api";
// import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
// import {
//   FaDollarSign,
//   FaCheckCircle,
//   FaExclamationCircle,
//   FaClock,
//   FaUsers,
// } from "react-icons/fa";

// export default function FeeOverview({ academicYear }) {
//   const [statistics, setStatistics] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const loadStatistics = useCallback(async () => {
//   try {
//     setLoading(true);

//     const response = await api.get(API_ENDPOINTS.ADMIN.FEE.STATISTICS, {
//       params: { academicYear },
//     });

//     console.log("RAW RESPONSE (intercepted):", response); // ab response.data

//     const stats = response?.data || {}; // ← yahi sahi hai

//     const statisticsData = {
//       totalStudents: Number(stats.totalStudents || 0),
//       totalExpected: Number(stats.totalExpected || 0),
//       totalCollected: Number(stats.totalCollected || 0),
//       totalPending: Number(stats.totalPending || 0),
//       collectionPercentage: Number(stats.collectionPercentage || 0),
//       paymentStatus: {
//         completed: Number(stats.paymentStatus?.completed || 0),
//         partial: Number(stats.paymentStatus?.partial || 0),
//         pending: Number(stats.paymentStatus?.pending || 0),
//         overdue: Number(stats.paymentStatus?.overdue || 0),
//       },
//     };

//     console.log("STATISTICS FROM API:", statisticsData);
//     setStatistics(statisticsData);
//   } catch (error) {
//     console.error("❌ Statistics error:", error);
//     setStatistics({
//       totalStudents: 0,
//       totalExpected: 0,
//       totalCollected: 0,
//       totalPending: 0,
//       collectionPercentage: 0,
//       paymentStatus: {
//         completed: 0,
//         partial: 0,
//         pending: 0,
//         overdue: 0,
//       },
//     });
//     toast.error("Statistics temporarily unavailable");
//   } finally {
//     setLoading(false);
//   }
// }, [academicYear]);

//   useEffect(() => {
//     loadStatistics();
//   }, [loadStatistics]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-20">
//         <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600" />
//       </div>
//     );
//   }

//   if (!statistics) {
//     return (
//       <div className="text-center py-20">
//         <p className="text-slate-600">
//           No data available for {academicYear}
//         </p>
//       </div>
//     );
//   }

//   const collectionPercentage = Number(statistics.collectionPercentage || 0);

//   return (
//     <div className="space-y-8">
//       {/* Top cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
//           <div className="flex items-center gap-3 mb-2">
//             <FaUsers className="h-8 w-8 text-purple-600" />
//             <p className="text-sm text-slate-600">Total Students</p>
//           </div>
//           <p className="text-3xl font-bold text-slate-900">
//             {statistics.totalStudents}
//           </p>
//         </div>

//         <div className="rounded-2xl bg-blue-50 p-6 shadow-lg border border-blue-200">
//           <div className="flex items-center gap-3 mb-2">
//             <FaDollarSign className="h-8 w-8 text-blue-600" />
//             <p className="text-sm text-blue-700">Total Expected</p>
//           </div>
//           <p className="text-3xl font-bold text-blue-900">
//             ₹{Number(statistics.totalExpected || 0).toLocaleString("en-IN")}
//           </p>
//         </div>

//         <div className="rounded-2xl bg-green-50 p-6 shadow-lg border border-green-200">
//           <div className="flex items-center gap-3 mb-2">
//             <FaCheckCircle className="h-8 w-8 text-green-600" />
//             <p className="text-sm text-green-700">Total Collected</p>
//           </div>
//           <p className="text-3xl font-bold text-green-900">
//             ₹{Number(statistics.totalCollected || 0).toLocaleString("en-IN")}
//           </p>
//         </div>

//         <div className="rounded-2xl bg-red-50 p-6 shadow-lg border border-red-200">
//           <div className="flex items-center gap-3 mb-2">
//             <FaExclamationCircle className="h-8 w-8 text-red-600" />
//             <p className="text-sm text-red-700">Total Pending</p>
//           </div>
//           <p className="text-3xl font-bold text-red-900">
//             ₹{Number(statistics.totalPending || 0).toLocaleString("en-IN")}
//           </p>
//         </div>
//       </div>

//       {/* Collection progress */}
//       <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-bold text-slate-900">
//             Fee Collection Progress
//           </h3>
//           <span className="text-3xl font-bold text-purple-600">
//             {collectionPercentage}%
//           </span>
//         </div>
//         <div className="w-full bg-slate-200 rounded-full h-6 overflow-hidden">
//           <div
//             className="bg-gradient-to-r from-purple-600 to-blue-600 h-6 rounded-full transition-all duration-500"
//             style={{ width: `${Math.min(collectionPercentage, 100)}%` }}
//           />
//         </div>
//       </div>

//       {/* Status breakdown */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
//           <div className="flex items-center gap-3 mb-2">
//             <FaCheckCircle className="h-8 w-8 text-green-600" />
//             <p className="text-sm text-slate-600">Completed</p>
//           </div>
//           <p className="text-3xl font-bold text-green-900">
//             {statistics.paymentStatus.completed}
//           </p>
//           <p className="text-sm text-slate-500 mt-1">
//             Students fully paid
//           </p>
//         </div>

//         <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
//           <div className="flex items-center gap-3 mb-2">
//             <FaClock className="h-8 w-8 text-yellow-600" />
//             <p className="text-sm text-slate-600">Partial</p>
//           </div>
//           <p className="text-3xl font-bold text-yellow-900">
//             {statistics.paymentStatus.partial}
//           </p>
//           <p className="text-sm text-slate-500 mt-1">
//             Students with some dues
//           </p>
//         </div>

//         <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
//           <div className="flex items-center gap-3 mb-2">
//             <FaExclamationCircle className="h-8 w-8 text-orange-600" />
//             <p className="text-sm text-slate-600">Pending</p>
//           </div>
//           <p className="text-3xl font-bold text-orange-900">
//             {statistics.paymentStatus.pending}
//           </p>
//           <p className="text-sm text-slate-500 mt-1">
//             Students yet to start
//           </p>
//         </div>

//         <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
//           <div className="flex items-center gap-3 mb-2">
//             <FaExclamationCircle className="h-8 w-8 text-red-600" />
//             <p className="text-sm text-slate-600">Overdue</p>
//           </div>
//           <p className="text-3xl font-bold text-red-900">
//             {statistics.paymentStatus.overdue}
//           </p>
//           <p className="text-sm text-slate-500 mt-1">
//             Students past due date
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// // components/admin/fee/FeeOverview.jsx
// import { useEffect, useState, useCallback } from "react";
// import { toast } from "react-toastify";
// import api from "../../../../services/api";
// import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
// import { FaCheckCircle, FaExclamationCircle, FaUsers, FaDollarSign } from "react-icons/fa";

// export default function FeeOverview({ academicYear }) {
//   const [statistics, setStatistics] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedList, setSelectedList] = useState(null); // 'paid' or 'unpaid'
//   const [studentList, setStudentList] = useState([]);

//   const loadStatistics = useCallback(async () => {
//     try {
//       setLoading(true);
//       const response = await api.get(API_ENDPOINTS.ADMIN.FEE.STATISTICS, {
//         params: { academicYear },
//       });

//       const stats = response?.data || {};

//       const statisticsData = {
//         totalStudents: Number(stats.totalStudents || 0),
//         totalExpected: Number(stats.totalExpected || 0),
//         totalCollected: Number(stats.totalCollected || 0),
//         totalPending: Number(stats.totalPending || 0),
//         collectionPercentage: Number(stats.collectionPercentage || 0),
//         paymentStatus: {
//           paid: Number(stats.paymentStatus?.completed || 0) + Number(stats.paymentStatus?.partial || 0),
//           unpaid: Number(stats.paymentStatus?.pending || 0) + Number(stats.paymentStatus?.overdue || 0),
//         },
//       };

//       setStatistics(statisticsData);
//     } catch (error) {
//       console.error("❌ Statistics error:", error);
//       setStatistics({
//         totalStudents: 0,
//         totalExpected: 0,
//         totalCollected: 0,
//         totalPending: 0,
//         collectionPercentage: 0,
//         paymentStatus: { paid: 0, unpaid: 0 },
//       });
//       toast.error("Statistics temporarily unavailable");
//     } finally {
//       setLoading(false);
//     }
//   }, [academicYear]);

//   const loadStudentList = async (type) => {
//     try {
//       setLoading(true);
//       const response = await api.get(API_ENDPOINTS.ADMIN.FEE.STUDENTS, {
//         params: { academicYear, status: type }, // 'paid' or 'unpaid'
//       });
//       setStudentList(response?.data || []);
//       setSelectedList(type);
//     } catch (error) {
//       console.error("❌ Student list error:", error);
//       toast.error("Failed to load student list");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadStatistics();
//   }, [loadStatistics]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-20">
//         <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600" />
//       </div>
//     );
//   }

//   if (!statistics) {
//     return (
//       <div className="text-center py-20">
//         <p className="text-slate-600">
//           No data available for {academicYear}
//         </p>
//       </div>
//     );
//   }

//   const collectionPercentage = Number(statistics.collectionPercentage || 0);

//   return (
//     <div className="space-y-8">
//       {/* Top cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
//           <div className="flex items-center gap-3 mb-2">
//             <FaUsers className="h-8 w-8 text-purple-600" />
//             <p className="text-sm text-slate-600">Total Students</p>
//           </div>
//           <p className="text-3xl font-bold text-slate-900">{statistics.totalStudents}</p>
//         </div>

//         <div className="rounded-2xl bg-blue-50 p-6 shadow-lg border border-blue-200">
//           <div className="flex items-center gap-3 mb-2">
//             <FaDollarSign className="h-8 w-8 text-blue-600" />
//             <p className="text-sm text-blue-700">Total Expected</p>
//           </div>
//           <p className="text-3xl font-bold text-blue-900">
//             ₹{Number(statistics.totalExpected || 0).toLocaleString("en-IN")}
//           </p>
//         </div>

//         <div className="rounded-2xl bg-green-50 p-6 shadow-lg border border-green-200">
//           <div className="flex items-center gap-3 mb-2">
//             <FaCheckCircle className="h-8 w-8 text-green-600" />
//             <p className="text-sm text-green-700">Total Collected</p>
//           </div>
//           <p className="text-3xl font-bold text-green-900">
//             ₹{Number(statistics.totalCollected || 0).toLocaleString("en-IN")}
//           </p>
//         </div>

//         <div className="rounded-2xl bg-red-50 p-6 shadow-lg border border-red-200">
//           <div className="flex items-center gap-3 mb-2">
//             <FaExclamationCircle className="h-8 w-8 text-red-600" />
//             <p className="text-sm text-red-700">Total Pending</p>
//           </div>
//           <p className="text-3xl font-bold text-red-900">
//             ₹{Number(statistics.totalPending || 0).toLocaleString("en-IN")}
//           </p>
//         </div>
//       </div>

//       {/* Collection progress */}
//       <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-bold text-slate-900">Fee Collection Progress</h3>
//           <span className="text-3xl font-bold text-purple-600">{collectionPercentage}%</span>
//         </div>
//         <div className="w-full bg-slate-200 rounded-full h-6 overflow-hidden">
//           <div
//             className="bg-gradient-to-r from-purple-600 to-blue-600 h-6 rounded-full transition-all duration-500"
//             style={{ width: `${Math.min(collectionPercentage, 100)}%` }}
//           />
//         </div>
//       </div>

//       {/* Paid / Unpaid cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div
//           className="cursor-pointer rounded-2xl bg-green-50 p-6 shadow-lg border border-green-200 hover:bg-green-100 transition"
//           onClick={() => loadStudentList("paid")}
//         >
//           <div className="flex items-center gap-3 mb-2">
//             <FaCheckCircle className="h-8 w-8 text-green-600" />
//             <p className="text-sm text-green-700">Paid</p>
//           </div>
//           <p className="text-3xl font-bold text-green-900">{statistics.paymentStatus.paid}</p>
//           <p className="text-sm text-slate-500 mt-1">Students with fees paid</p>
//         </div>

//         <div
//           className="cursor-pointer rounded-2xl bg-red-50 p-6 shadow-lg border border-red-200 hover:bg-red-100 transition"
//           onClick={() => loadStudentList("unpaid")}
//         >
//           <div className="flex items-center gap-3 mb-2">
//             <FaExclamationCircle className="h-8 w-8 text-red-600" />
//             <p className="text-sm text-red-700">Unpaid</p>
//           </div>
//           <p className="text-3xl font-bold text-red-900">{statistics.paymentStatus.unpaid}</p>
//           <p className="text-sm text-slate-500 mt-1">Students with pending fees</p>
//         </div>
//       </div>

//       {/* Student list */}
//       {selectedList && (
//   <div className="bg-white p-6 shadow-lg rounded-2xl border border-slate-100 mt-4">
//     <h3 className="text-lg font-bold text-slate-900 mb-4">
//       {selectedList === "paid" ? "Paid Students" : "Unpaid Students"}
//     </h3>

//     <ul className="space-y-2 max-h-64 overflow-y-auto">
//       {(selectedList === "paid"
//         ? studentList.filter(s => s.feePaid >= s.totalFee)
//         : studentList.filter(s => s.feePaid < s.totalFee)
//       ).map((student) => (
//         <li key={student.id} className="p-2 border-b border-slate-200">
//           {student.name} — ₹{student.feePaid} / ₹{student.totalFee}
//         </li>
//       ))}
//     </ul>
//   </div>
// )}

//     </div>
//   );
// }

// // components/admin/fee/FeeOverview.jsx
// import { useEffect, useState, useCallback } from "react";
// import { toast } from "react-toastify";
// import api from "../../../../services/api";
// import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
// import {
//   FaCheckCircle,
//   FaExclamationCircle,
//   FaUsers,
//   FaDollarSign,
// } from "react-icons/fa";

// export default function FeeOverview({ academicYear }) {
//   const [statistics, setStatistics] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedList, setSelectedList] = useState(null); // paid | unpaid
//   const [studentList, setStudentList] = useState([]);

//   const [statsLoading, setStatsLoading] = useState(true);
// const [studentsLoading, setStudentsLoading] = useState(false);

//   /* ===================== LOAD STATISTICS ===================== */
//  const loadStatistics = useCallback(async () => {
//   try {
//     setStatsLoading(true);

//     const { data } = await api.get(API_ENDPOINTS.ADMIN.FEE.STATISTICS, {
//       params: { academicYear },
//     });

//     setStatistics({
//       totalStudents: Number(data?.totalStudents || 0),
//       totalExpected: Number(data?.totalExpected || 0),
//       totalCollected: Number(data?.totalCollected || 0),
//       totalPending: Number(data?.totalPending || 0),
//       collectionPercentage: Number(data?.collectionPercentage || 0),
//       paymentStatus: {
//         paid:
//           Number(data?.paymentStatus?.completed || 0) +
//           Number(data?.paymentStatus?.partial || 0),
//         unpaid:
//           Number(data?.paymentStatus?.pending || 0) +
//           Number(data?.paymentStatus?.overdue || 0),
//       },
//     });
//   } catch (err) {
//     toast.error( err+"Statistics not available");
//   } finally {
//     setStatsLoading(false);
//   }
// }, [academicYear]);

//   /* ===================== LOAD STUDENT LIST ===================== */
// const loadStudentList = async (status) => {
//   try {
//     setStudentsLoading(true);
//     setSelectedList(status);

//     const res = await api.get(
//       API_ENDPOINTS.ADMIN.FEE.STUDENTS_WITH_FEES,
//       { params: { academicYear, status } }
//     );

//     setStudentList(res?.data?.students || []);
//   } catch (err) {
//     toast.error( err+"Failed to load student list");
//   } finally {
//     setStudentsLoading(false);
//   }
// };

//   useEffect(() => {
//     loadStatistics();
//   }, [loadStatistics]);

//   const collectionPercentage = Number(
//   statistics?.collectionPercentage || 0
// );

//   if (loading) {
//     return (
//       <div className="flex justify-center py-20">
//         <div className="h-14 w-14 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
//       </div>
//     );
//   }

//   if (!statistics) return null;

//   /* ===================== UI ===================== */
//   return (
//     <div className="space-y-8">
//       {/* ===================== TOP CARDS ===================== */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <StatCard
//           icon={<FaUsers className="text-purple-600" />}
//           label="Total Students"
//           value={statistics.totalStudents}
//         />

//         <StatCard
//           icon={<FaDollarSign className="text-blue-600" />}
//           label="Total Expected"
//           value={`₹${statistics.totalExpected.toLocaleString("en-IN")}`}
//           bg="bg-blue-50"
//         />

//         <StatCard
//           icon={<FaCheckCircle className="text-green-600" />}
//           label="Total Collected"
//           value={`₹${statistics.totalCollected.toLocaleString("en-IN")}`}
//           bg="bg-green-50"
//         />

//         <StatCard
//           icon={<FaExclamationCircle className="text-red-600" />}
//           label="Total Pending"
//           value={`₹${statistics.totalPending.toLocaleString("en-IN")}`}
//           bg="bg-red-50"
//         />
//       </div>

//       {/* ===================== COLLECTION PROGRESS (BEECH WALA DIV SAME) ===================== */}
//       <div className="rounded-2xl bg-white p-6 shadow-lg border">
//   <div className="flex justify-between mb-4">
//     <h3 className="text-xl font-bold text-slate-900">
//       Fee Collection Progress
//     </h3>
//     <span className="text-3xl font-bold text-purple-600">
//       {collectionPercentage}%
//     </span>
//   </div>

//   <div className="w-full bg-slate-200 rounded-full h-6 overflow-hidden">
//     <div
//       className="bg-gradient-to-r from-purple-600 to-blue-600 h-6 rounded-full transition-all duration-500"
//       style={{
//         width: `${Math.min(collectionPercentage, 100)}%`,
//       }}
//     />
//   </div>
// </div>

//       {/* ===================== PAID / UNPAID CLICKABLE ===================== */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <ClickableCard
//           title="Paid Students"
//           count={statistics.paymentStatus.paid}
//           icon={<FaCheckCircle />}
//           color="green"
//           onClick={() => loadStudentList("paid")}
//         />

//         <ClickableCard
//           title="Unpaid Students"
//           count={statistics.paymentStatus.unpaid}
//           icon={<FaExclamationCircle />}
//           color="red"
//           onClick={() => loadStudentList("unpaid")}
//         />
//       </div>

//       {/* ===================== STUDENT LIST ===================== */}
//       {selectedList && (
//   <div className="bg-white p-6 rounded-2xl shadow border">
//     <h3 className="text-lg font-bold mb-4">
//       {selectedList === "paid"
//         ? "Paid Students"
//         : "Unpaid Students"}
//     </h3>

//     {/* 🔄 LOADING STATE */}
//     {loading && (
//       <p className="text-center text-slate-500">
//         Loading students...
//       </p>
//     )}

//     {/* 📭 EMPTY STATE */}
//     {!loading && studentList.length === 0 && (
//       <p className="text-slate-500 text-center">
//         No students found
//       </p>
//     )}

//     {/* 📋 STUDENT LIST */}
//     {!loading && studentList.length > 0 && (
//       <ul className="space-y-2 max-h-72 overflow-y-auto">
//         {studentList.map((student) => (
//           <li
//             key={student._id}
//             className="flex justify-between p-3 border rounded-lg"
//           >
//             <div>
//               <p className="font-semibold">{student.name}</p>
//               <p className="text-sm text-slate-500">
//                  {student.className}
//               </p>
//             </div>

//             <div className="text-right">
//               <p className="font-semibold">
//                 ₹{student.feeDetails.paidAmount} / ₹
//                 {student.feeDetails.totalFee}
//               </p>
//               <p className="text-sm text-slate-500">
//                 {student.feeDetails.status}
//               </p>
//             </div>
//           </li>
//         ))}
//       </ul>
//     )}
//   </div>
// )}

//     </div>
//   );
// }

// /* ===================== SMALL COMPONENTS ===================== */

// const StatCard = ({ icon, label, value, bg = "bg-white" }) => (
//   <div className={`p-6 rounded-2xl shadow border ${bg}`}>
//     <div className="flex items-center gap-3 mb-2">
//       {icon}
//       <p className="text-sm text-slate-600">{label}</p>
//     </div>
//     <p className="text-3xl font-bold">{value}</p>
//   </div>
// );

// const ClickableCard = ({ title, count, icon, color, onClick }) => (
//   <div
//     onClick={onClick}
//     className={`cursor-pointer rounded-2xl p-6 shadow border bg-${color}-50 hover:bg-${color}-100 transition`}
//   >
//     <div className="flex items-center gap-3 mb-2 text-${color}-600">
//       {icon}
//       <p className="text-sm">{title}</p>
//     </div>
//     <p className={`text-3xl font-bold text-${color}-700`}>{count}</p>
//   </div>
// );

// components/admin/fee/FeeOverview.jsx
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaUsers,
  FaDollarSign,
} from "react-icons/fa";

/* ===================== COLOR MAP (TAILWIND SAFE) ===================== */
const COLOR_MAP = {
  green: {
    bg: "bg-green-50 hover:bg-green-100",
    text: "text-green-600",
    value: "text-green-700",
  },
  red: {
    bg: "bg-red-50 hover:bg-red-100",
    text: "text-red-600",
    value: "text-red-700",
  },
};

export default function FeeOverview({ academicYear }) {
  const [statistics, setStatistics] = useState(null);
  const [selectedList, setSelectedList] = useState(null); // paid | unpaid
  const [studentList, setStudentList] = useState([]);

  const [statsLoading, setStatsLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);

  /* ===================== LOAD STATISTICS ===================== */


  
  const loadStatistics = useCallback(async () => {
    try {
      setStatsLoading(true);

      const response = await api.get(API_ENDPOINTS.ADMIN.FEE.STATISTICS, {
        params: { academicYear },
      });

      const stats = response.data;
     
      setStatistics({
  totalStudents: Number(stats.totalStudents || 0),
  totalExpected: Number(stats.totalExpected || 0),
  totalCollected: Number(stats.totalCollected || 0),
  totalPending: Number(stats.totalPending || 0),
  collectionPercentage: Number(stats.collectionPercentage || 0),

 
  paymentStatus: {
    paid: Number(stats.paymentStatus?.paid || 0),
    unpaid: Number(stats.paymentStatus?.unpaid || 0),
    completed: Number(stats.paymentStatus?.completed || 0),
    partial: Number(stats.paymentStatus?.partial || 0),
    pending: Number(stats.paymentStatus?.pending || 0),
    overdue: Number(stats.paymentStatus?.overdue || 0),
  },
}); 

    

    } catch (err) {
      toast.error(err + "Statistics not available");
    } finally {
      setStatsLoading(false);
    }
  }, [academicYear]);

// const loadStatistics = useCallback(async () => {
//   try {
//     setStatsLoading(true);

//     const response = await api.get(API_ENDPOINTS.ADMIN.FEE.STATISTICS, {
//       params: { academicYear },
//     });

//     const stats = response.data?.data || response.data;

//     if (!stats) {
//       throw new Error("Statistics not available");
//     }

//     setStatistics({
//       totalStudents: Number(stats.totalStudents || 0),
//       totalExpected: Number(stats.totalExpected || 0),
//       totalCollected: Number(stats.totalCollected || 0),
//       totalPending: Number(stats.totalPending || 0),
//       collectionPercentage: Number(stats.collectionPercentage || 0),

//       paymentStatus: {
//         paid: Number(stats.paymentStatus?.paid || 0),
//         unpaid: Number(stats.paymentStatus?.unpaid || 0),
//         completed: Number(stats.paymentStatus?.completed || 0),
//         partial: Number(stats.paymentStatus?.partial || 0),
//         pending: Number(stats.paymentStatus?.pending || 0),
//         overdue: Number(stats.paymentStatus?.overdue || 0),
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     toast.error("Statistics not available");
//     setStatistics(null);
//   } finally {
//     setStatsLoading(false);
//   }
// }, [academicYear]);

  /* ===================== LOAD STUDENT LIST ===================== */
  const loadStudentList = async (status) => {
    try {
      setStudentsLoading(true);
      setSelectedList(status);

      const res = await api.get(API_ENDPOINTS.ADMIN.FEE.STUDENTS_WITH_FEES, {
        params: { academicYear, status },
      });

      setStudentList(res?.data?.students || []);
    } catch (err) {
      toast.error(err + "Failed to load student list");
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  if (statsLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
      </div>
    );
  }

  if (!statistics) return null;

  const collectionPercentage = statistics.collectionPercentage;



  /* ===================== UI ===================== */
  return (
    <div className="space-y-8">
      {/* ===================== TOP CARDS ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FaUsers className="text-purple-600" />}
          label="Total Students"
          value={statistics.totalStudents}
        />

        <StatCard
          icon={<FaDollarSign className="text-blue-600" />}
          label="Total Expected"
          value={`₹${statistics.totalExpected.toLocaleString("en-IN")}`}
          bg="bg-blue-50"
        />

        <StatCard
          icon={<FaCheckCircle className="text-green-600" />}
          label="Total Collected"
          value={`₹${statistics.totalCollected.toLocaleString("en-IN")}`}
          bg="bg-green-50"
        />

        <StatCard
          icon={<FaExclamationCircle className="text-red-600" />}
          label="Total Pending"
          value={`₹${statistics.totalPending.toLocaleString("en-IN")}`}
          bg="bg-red-50"
        />
      </div>

      {/* ===================== COLLECTION PROGRESS ===================== */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border">
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">
            Fee Collection Progress
          </h3>
          <span className="text-3xl font-bold text-purple-600">
            {collectionPercentage}%
          </span>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-6 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(collectionPercentage, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* ===================== PAID / UNPAID ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ClickableCard
          title="Paid Students"
          count={statistics.paymentStatus.paid}
          icon={<FaCheckCircle />}
          color="green"
          onClick={() => loadStudentList("paid")}
        />

        <ClickableCard
          title="Unpaid Students"
          count={statistics.paymentStatus.unpaid }
          icon={<FaExclamationCircle />}
          color="red"
          onClick={() => loadStudentList("unpaid")}
        />
      </div>

      {/* ===================== STUDENT LIST ===================== */}
      {selectedList && (
        <div className="bg-white p-6 rounded-2xl shadow border">
          <h3 className="text-lg font-bold mb-4">
            {selectedList === "paid" ? "Paid Students" : "Unpaid Students"}
          </h3>

          {studentsLoading && (
            <p className="text-center text-slate-500">Loading students...</p>
          )}

          {!studentsLoading && studentList.length === 0 && (
            <p className="text-center text-slate-500">No students found</p>
          )}

          {!studentsLoading && studentList.length > 0 && (
            <ul className="space-y-2 max-h-72 overflow-y-auto">
              {studentList.map((student) => (
                <li
                  key={student._id}
                  className="flex justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-slate-500">
                      {student.className}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{student.feeDetails.paidAmount} / ₹
                      {student.feeDetails.totalFee}
                    </p>
                    <p className="text-sm text-slate-500">
                      {student.feeDetails.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ===================== SMALL COMPONENTS ===================== */

const StatCard = ({ icon, label, value, bg = "bg-white" }) => (
  <div className={`p-6 rounded-2xl shadow border ${bg}`}>
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <p className="text-sm text-slate-600">{label}</p>
    </div>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const ClickableCard = ({ title, count, icon, color, onClick }) => {
  const styles = COLOR_MAP[color];

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl p-6 shadow border transition ${styles.bg}`}
    >
      <div className={`flex items-center gap-3 mb-2 ${styles.text}`}>
        {icon}
        <p className="text-sm">{title}</p>
      </div>
      <p className={`text-3xl font-bold ${styles.value}`}>{count}</p>
    </div>
  );
};
