// // import { useEffect, useMemo, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { toast } from "react-toastify";
// // import api from "../../../../services/api";
// // import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";

// // export default function AdminStudentsListPage() {
// //   const navigate = useNavigate();

// //   const [loading, setLoading] = useState(true);
// //   const [students, setStudents] = useState([]);
// //   const [search, setSearch] = useState("");
// //   const [page, setPage] = useState(1);
// //   const [limit] = useState(10);
// //   const [total, setTotal] = useState(0);

// //   const fetchStudents = async () => {
// //     try {
// //       setLoading(true);

// //       const params = new URLSearchParams();
// //       params.append("page", page);
// //       params.append("limit", limit);
// //       if (search.trim()) params.append("search", search.trim());

// //       const res = await api.get(
// //         `${API_ENDPOINTS.ADMIN.STUDENT.ALL}?${params.toString()}`
// //       );

// //       const data = res?.data?.data || res?.data?.students || res?.students || [];
// //       const meta = res?.data || res || {};

// //       setStudents(Array.isArray(data) ? data : []);
// //       setTotal(meta?.total || meta?.pagination?.total || 0);
// //     } catch (e) {
// //       toast.error(e?.response?.data?.message || e.message || "Failed to load students");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchStudents();
// //   }, [page]);

// //   const filteredStudents = useMemo(() => {
// //     return students;
// //   }, [students]);

// //   const totalPages = Math.max(1, Math.ceil(total / limit));

// //   const onSearch = (e) => {
// //     e.preventDefault();
// //     setPage(1);
// //     fetchStudents();
// //   };

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-slate-50">
// //         <div className="text-slate-600 font-medium">Loading students...</div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-slate-50 p-6">
// //       <div className="mx-auto max-w-7xl">
// //         <div className="flex items-center justify-between mb-6">
// //           <div>
// //             <h1 className="text-3xl font-bold text-slate-900">Students</h1>
// //             <p className="text-slate-500 mt-1">Manage student profiles from admin dashboard</p>
// //           </div>
// //           <button
// //             onClick={() => navigate("/admin/students/create")}
// //             className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
// //           >
// //             + Add Student
// //           </button>
// //         </div>

// //         <div className="bg-white rounded-2xl shadow p-4 mb-5">
// //           <form onSubmit={onSearch} className="flex flex-col md:flex-row gap-3">
// //             <input
// //               type="text"
// //               value={search}
// //               onChange={(e) => setSearch(e.target.value)}
// //               placeholder="Search student name, ID, email..."
// //               className="flex-1 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-200"
// //             />
// //             <button
// //               type="submit"
// //               className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold"
// //             >
// //               Search
// //             </button>
// //             <button
// //               type="button"
// //               onClick={() => {
// //                 setSearch("");
// //                 setPage(1);
// //                 setTimeout(fetchStudents, 0);
// //               }}
// //               className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold"
// //             >
// //               Reset
// //             </button>
// //           </form>
// //         </div>

// //         <div className="bg-white rounded-2xl shadow overflow-hidden">
// //           <div className="overflow-x-auto">
// //             <table className="min-w-full text-left">
// //               <thead className="bg-slate-100 border-b">
// //                 <tr>
// //                   <th className="px-4 py-3 text-sm font-semibold text-slate-700">Student</th>
// //                   <th className="px-4 py-3 text-sm font-semibold text-slate-700">Student ID</th>
// //                   <th className="px-4 py-3 text-sm font-semibold text-slate-700">Class / Section</th>
// //                   <th className="px-4 py-3 text-sm font-semibold text-slate-700">Roll No.</th>
// //                   <th className="px-4 py-3 text-sm font-semibold text-slate-700">Status</th>
// //                   <th className="px-4 py-3 text-sm font-semibold text-slate-700">Actions</th>
// //                 </tr>
// //               </thead>

// //               <tbody>
// //                 {filteredStudents.length === 0 ? (
// //                   <tr>
// //                     <td colSpan="6" className="px-4 py-10 text-center text-slate-500">
// //                       No students found
// //                     </td>
// //                   </tr>
// //                 ) : (
// //                   filteredStudents.map((s) => (
// //                     <tr key={s.id || s._id} className="border-b hover:bg-slate-50">
// //                       <td className="px-4 py-4">
// //                         <div className="flex items-center gap-3">
// //                           <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
// //                             {(s.name || "S").charAt(0).toUpperCase()}
// //                           </div>
// //                           <div>
// //                             <p className="font-semibold text-slate-900">{s.name}</p>
// //                             <p className="text-sm text-slate-500">{s.email || "-"}</p>
// //                           </div>
// //                         </div>
// //                       </td>
// //                       <td className="px-4 py-4 text-slate-700">{s.studentID || "-"}</td>
// //                       <td className="px-4 py-4 text-slate-700">
// //                         {s.className || s.class?.className || "-"}
// //                         {s.section ? ` / ${s.section}` : ""}
// //                       </td>
// //                       <td className="px-4 py-4 text-slate-700">{s.rollNumber || "-"}</td>
// //                       <td className="px-4 py-4">
// //                         <span
// //                           className={`px-3 py-1 rounded-full text-xs font-semibold ${
// //                             s.status === "ACTIVE"
// //                               ? "bg-green-100 text-green-700"
// //                               : s.status === "ADMITTED"
// //                               ? "bg-yellow-100 text-yellow-700"
// //                               : "bg-slate-100 text-slate-700"
// //                           }`}
// //                         >
// //                           {s.status || "-"}
// //                         </span>
// //                       </td>
// //                       <td className="px-4 py-4">
// //                         <div className="flex gap-2">
// //                           <button
// //                             onClick={() => navigate(`/admin/students/${s.id || s._id}`)}
// //                             className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
// //                           >
// //                             View
// //                           </button>
// //                           <button
// //                             onClick={() => navigate(`/admin/students/${s.id || s._id}/edit`)}
// //                             className="px-3 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
// //                           >
// //                             Edit
// //                           </button>
// //                         </div>
// //                       </td>
// //                     </tr>
// //                   ))
// //                 )}
// //               </tbody>
// //             </table>
// //           </div>

// //           <div className="flex items-center justify-between px-4 py-4 border-t bg-slate-50">
// //             <p className="text-sm text-slate-600">
// //               Page {page} of {totalPages} • Total {total} students
// //             </p>

// //             <div className="flex gap-2">
// //               <button
// //                 onClick={() => setPage((p) => Math.max(1, p - 1))}
// //                 disabled={page === 1}
// //                 className="px-4 py-2 rounded-lg bg-white border disabled:opacity-50"
// //               >
// //                 Previous
// //               </button>
// //               <button
// //                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
// //                 disabled={page === totalPages}
// //                 className="px-4 py-2 rounded-lg bg-white border disabled:opacity-50"
// //               >
// //                 Next
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// // import { useEffect, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { toast } from "react-toastify";
// // import api from "../../../../services/api";
// // import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";

// // export default function AdminStudentsListPage() {
// //   const navigate = useNavigate();

// //   const [loading, setLoading] = useState(true);
// //   const [students, setStudents] = useState([]);
// //   const [search, setSearch] = useState("");
// //   const [page, setPage] = useState(1);
// //   const [limit] = useState(10);
// //   const [total, setTotal] = useState(0);

// // //   const fetchStudents = async () => {
// // //     try {
// // //       setLoading(true);

// // //       const params = new URLSearchParams();
// // //       params.append("page", page);
// // //       params.append("limit", limit);
// // //       if (search.trim()) params.append("search", search.trim());

// // //       const res = await api.get(
// // //         `${API_ENDPOINTS.ADMIN.STUDENT.ALL}?${params.toString()}`
// // //       );

// // //       console.log("API response:", res?.data);
// // // console.log("total:", res?.data?.total, res?.data?.pagination?.total, res?.data?.data?.total);

// // //       const payload = res?.data || {};
// // // setStudents(Array.isArray(payload?.data) ? payload.data : []);
// // // setTotal(Number(payload?.pagination?.total || 0));
// // //     } catch (e) {
// // //       toast.error(e?.response?.data?.message || e.message || "Failed to load students");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // const fetchStudents = async () => {
// //   try {
// //     setLoading(true);

// //     const params = new URLSearchParams();
// //     params.append("page", String(page));
// //     params.append("limit", String(limit));
// //     if (search.trim()) params.append("search", search.trim());

// //     const res = await api.get(`${API_ENDPOINTS.ADMIN.STUDENT.ALL}?${params.toString()}`);

// //     console.log("API response:", res?.data);

// //     const payload = res?.data || {};
// //     const list = Array.isArray(payload) ? payload : (payload?.data || payload?.students || []);

// //     setStudents([...list]);
// //     setTotal(Number(payload?.pagination?.total ?? payload?.total ?? 0));
// //   } catch (e) {
// //     toast.error(e?.response?.data?.message || e.message || "Failed to load students");
// //     setStudents([]);
// //     setTotal(0);
// //   } finally {
// //     setLoading(false);
// //   }
// // };

// //   useEffect(() => {
// //     fetchStudents();
// //   }, [page]);

// //   const onSearch = (e) => {
// //     e.preventDefault();
// //     setPage(1);
// //     fetchStudents();
// //   };

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-slate-50">
// //         <div className="text-slate-600 font-medium">Loading students...</div>
// //       </div>
// //     );
// //   }



// // const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

// //   return (
// //     <div className="min-h-screen bg-slate-50 p-6">
// //       <div className="mx-auto max-w-7xl">
// //         <div className="flex items-center justify-between mb-6">
// //           <div>
// //             <h1 className="text-3xl font-bold text-slate-900">Students</h1>
// //             <p className="text-slate-500 mt-1">Manage student profiles from admin dashboard</p>
// //           </div>
// //           <button
// //             onClick={() => navigate("/admin/students/create")}
// //             className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
// //           >
// //             + Add Student
// //           </button>
// //         </div>

// //         <div className="bg-white rounded-2xl shadow p-4 mb-5">
// //           <form onSubmit={onSearch} className="flex flex-col md:flex-row gap-3">
// //             <input
// //               type="text"
// //               value={search}
// //               onChange={(e) => setSearch(e.target.value)}
// //               placeholder="Search student name, ID, email..."
// //               className="flex-1 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-200"
// //             />
// //             <button
// //               type="submit"
// //               className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold"
// //             >
// //               Search
// //             </button>
// //             <button
// //               type="button"
// //               onClick={() => {
// //                 setSearch("");
// //                 setPage(1);
// //                 setTimeout(fetchStudents, 0);
// //               }}
// //               className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold"
// //             >
// //               Reset
// //             </button>
// //           </form>
// //         </div>

// //         <div className="bg-white rounded-2xl shadow overflow-hidden">
// //           <div className="overflow-x-auto">
// //             <table className="min-w-full text-left">
// //               <thead className="bg-slate-100 border-b">
// //                 <tr>
// //                   <th className="px-4 py-3 text-sm font-semibold text-slate-700">Student</th>
// //                   <th className="px-4 py-3 text-sm font-semibold text-slate-700">Student ID</th>
// //                   <th className="px-4 py-3 text-sm font-semibold text-slate-700">Class / Section</th>

// //                   <th className="px-4 py-3 text-sm font-semibold text-slate-700">Status</th>
// //                   <th className="px-4 py-3 text-sm font-semibold text-slate-700">Actions</th>
// //                 </tr>
// //               </thead>

// //               <tbody>
// //                 {students.length === 0 ? (
// //                   <tr>
// //                     <td colSpan="6" className="px-4 py-10 text-center text-slate-500">
// //                       No students found
// //                     </td>
// //                   </tr>
// //                 ) : (
// //                   students.map((s) => (
// //                     <tr key={ s._id} className="border-b hover:bg-slate-50">
// //                       <td className="px-4 py-4">
// //                         <div className="flex items-center gap-3">
// //                           <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
// //                             {(s.name || "S").charAt(0).toUpperCase()}
// //                           </div>
// //                           <div>
// //                             <p className="font-semibold text-slate-900">{s.name}</p>
// //                             <p className="text-sm text-slate-500">{s.email || "-"}</p>
// //                           </div>
// //                         </div>
// //                       </td>
// //                       <td className="px-4 py-4 text-slate-700">{s.studentID || "-"}</td>
// //                       <td className="px-4 py-4 text-slate-700">
// //                         {s.className || s.class?.className || "-"}
// //                         {s.section ? ` / ${s.section}` : ""}
// //                       </td>

// //                       <td className="px-4 py-4">
// //                         <span
// //                           className={`px-3 py-1 rounded-full text-xs font-semibold ${
// //                             s.status === "ACTIVE"
// //                               ? "bg-green-100 text-green-700"
// //                               : s.status === "ADMITTED"
// //                               ? "bg-yellow-100 text-yellow-700"
// //                               : "bg-slate-100 text-slate-700"
// //                           }`}
// //                         >
// //                           {s.status || "-"}
// //                         </span>
// //                       </td>
// //                       <td className="px-4 py-4">
// //                         <div className="flex gap-2">
// //                           <button
// //                             onClick={() => navigate(`${s.id || s._id}`)}
// //                             className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
// //                           >
// //                             View
// //                           </button>
// //                           <button
// //                             onClick={() => navigate(`${s.id || s._id}/edit`)}
// //                             className="px-3 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
// //                           >
// //                             Edit
// //                           </button>
// //                         </div>
// //                       </td>
// //                     </tr>
// //                   ))
// //                 )}
// //               </tbody>
// //             </table>
// //           </div>

// //           <div className="flex items-center justify-between px-4 py-4 border-t bg-slate-50">
// //             <p className="text-sm text-slate-600">
// //               Page {page} of {totalPages} • Total {total} student profiles
// //             </p>

// //             <div className="flex gap-2">
// //               <button
// //                 onClick={() => setPage((p) => Math.max(1, p - 1))}
// //                 disabled={page === 1}
// //                 className="px-4 py-2 rounded-lg bg-white border disabled:opacity-50"
// //               >
// //                 Previous
// //               </button>
// //               <button
// //                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
// //                 disabled={page === totalPages}
// //                 className="px-4 py-2 rounded-lg bg-white border disabled:opacity-50"
// //               >
// //                 Next
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import api from "../../../../services/api";
// import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";

// export default function AdminStudentsListPage() {
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(true);
//   const [students, setStudents] = useState([]);
//   const [searchInput, setSearchInput] = useState("");
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [limit] = useState(10);
//   const [total, setTotal] = useState(0);

//   const fetchStudents = async () => {
//     try {
//       setLoading(true);

//       const params = new URLSearchParams();
//       params.append("page", String(page));
//       params.append("limit", String(limit));
//       if (search.trim()) params.append("search", search.trim());

//       const res = await api.get(
//         `${API_ENDPOINTS.ADMIN.STUDENT.ALL}?${params.toString()}`
//       );

//       console.log("API response:", res?.data);

//       const payload = res?.data || {};
//       const list = Array.isArray(payload) ? payload : (payload?.data || payload?.students || []);
//       const totalCount = Number(payload?.pagination?.total ?? payload?.total ?? 0);

//       setStudents([...list]);
//       setTotal(totalCount);
//     } catch (e) {
//       toast.error(e?.response?.data?.message || e.message || "Failed to load students");
//       setStudents([]);
//       setTotal(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStudents();
//   }, [page, search]);

//   const onSearch = (e) => {
//     e.preventDefault();
//     setPage(1);
//     setSearch(searchInput);
//   };

//   const onReset = () => {
//     setSearchInput("");
//     setSearch("");
//     setPage(1);
//   };

//   const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50">
//         <div className="text-slate-600 font-medium">Loading students...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 p-6">
//       <div className="mx-auto max-w-7xl">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-3xl font-bold text-slate-900">Students</h1>
//             <p className="text-slate-500 mt-1">Manage student profiles from admin dashboard</p>
//           </div>

//         </div>

//         <div className="bg-white rounded-2xl shadow p-4 mb-5">
//           <form onSubmit={onSearch} className="flex flex-col md:flex-row gap-3">
//             <input
//               type="text"
//               value={searchInput}
//               onChange={(e) => setSearchInput(e.target.value)}
//               placeholder="Search student name, ID, email..."
//               className="flex-1 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-200"
//             />
//             <button
//               type="submit"
//               className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold"
//             >
//               Search
//             </button>
//             <button
//               type="button"
//               onClick={onReset}
//               className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold"
//             >
//               Reset
//             </button>
//           </form>
//         </div>

//         <div className="bg-white rounded-2xl shadow overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full text-left">
//               <thead className="bg-slate-100 border-b">
//                 <tr>
//                   <th className="px-4 py-3 text-sm font-semibold text-slate-700">Student</th>
//                   <th className="px-4 py-3 text-sm font-semibold text-slate-700">Student ID</th>
//                   <th className="px-4 py-3 text-sm font-semibold text-slate-700">Class / Section</th>
//                   <th className="px-4 py-3 text-sm font-semibold text-slate-700">Status</th>
//                   <th className="px-4 py-3 text-sm font-semibold text-slate-700">Actions</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {students.length === 0 ? (
//                   <tr>
//                     <td colSpan="5" className="px-4 py-10 text-center text-slate-500">
//                       No students found
//                     </td>
//                   </tr>
//                 ) : (
//                   students.map((s) => (
//                     <tr key={s._id} className="border-b hover:bg-slate-50">
//                       <td className="px-4 py-4">
//                         <div className="flex items-center gap-3">
//                           <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
//                             {(s.name || "S").charAt(0).toUpperCase()}
//                           </div>
//                           <div>
//                             <p className="font-semibold text-slate-900">{s.name}</p>
//                             <p className="text-sm text-slate-500">{s.email || "-"}</p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-4 text-slate-700">{s.studentID || "-"}</td>
//                       <td className="px-4 py-4 text-slate-700">
//                         {s.className || s.class?.className || "-"}
//                         {s.section ? ` / ${s.section}` : ""}
//                       </td>
//                       <td className="px-4 py-4">
//                         <span
//                           className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                             s.status === "ACTIVE"
//                               ? "bg-green-100 text-green-700"
//                               : s.status === "ADMITTED"
//                               ? "bg-yellow-100 text-yellow-700"
//                               : "bg-slate-100 text-slate-700"
//                           }`}
//                         >
//                           {s.status || "-"}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4">
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => navigate(`${s._id}`)}
//                             className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
//                           >
//                             View
//                           </button>
//                           <button
//                             onClick={() => navigate(`${s._id}/edit`)}
//                             className="px-3 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
//                           >
//                             Edit
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex items-center justify-between px-4 py-4 border-t bg-slate-50">
//             <p className="text-sm text-slate-600">
//               Page {page} of {totalPages} • Total {total} students
//             </p>

//             <div className="flex gap-2">
//               <button
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 disabled={page === 1}
//                 className="px-4 py-2 rounded-lg bg-white border disabled:opacity-50"
//               >
//                 Previous
//               </button>
//               <button
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 disabled={page === totalPages}
//                 className="px-4 py-2 rounded-lg bg-white border disabled:opacity-50"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import { FaUserGraduate } from "react-icons/fa";

export default function AdminStudentListPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      console.log("page:", page);
      console.log("limit:", limit);
      if (search.trim()) params.append("search", search.trim());

      const res = await api.get(
        `${API_ENDPOINTS.ADMIN.STUDENT.ALL}?${params.toString()}`
      );

      console.log("Students API Response:", res.data);

      const payload = res;

      const list = Array.isArray(payload) ? payload : (payload?.data || []);

      setStudents(list);
      setTotal(payload?.pagination?.total || payload?.length || 0);

      console.log("students:", students);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed to load students");
      setStudents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, search]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const onReset = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;
  console.log("totalPages:", totalPages);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
      <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
    </div>
  </div>
    );
  }

  // return ( 
  //   <div className="min-h-screen">
  //     <div className="mx-auto max-w-7xl">

  //       {/* Header */}
  //       <div className="flex items-center justify-between mb-6">
  //         <div>
  //           <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
  //             <FaUserGraduate className="text-indigo-500 text-3xl rounded-xl  bg-slate-50 border-indigo-500" />
  //             Students
  //           </h1>

  //           <p className="text-slate-500 text-sm font-semibold mt-1">
  //             Manage student profiles from admin dashboard
  //           </p>
  //         </div>
  //       </div>

  //       {/* Search */}
  //       <div className="bg-white rounded-2xl shadow p-4 mb-5">
  //         <form
  //           onSubmit={onSearch}
  //           className="flex flex-col md:flex-row gap-3"
  //         >
  //           <input
  //             type="text"
  //             value={searchInput}
  //             onChange={(e) => setSearchInput(e.target.value)}
  //             placeholder="Search student name, ID, email..."
  //             className="flex-1 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-200"
  //           />

  //           <button
  //             type="submit"
  //             className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold"
  //           >
  //             Search
  //           </button>

  //           <button
  //             type="button"
  //             onClick={onReset}
  //             className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold"
  //           >
  //             Reset
  //           </button>
  //         </form>
  //       </div>

  //       {/* Table */}
  //       <div className="bg-white rounded-2xl shadow overflow-hidden">
  //         <div className="overflow-x-auto">
  //           <table className="min-w-full text-left">

  //             <thead className="bg-slate-800 border-b">
  //               <tr>
  //                 <th className="px-4 py-3 text-sm font-semibold text-white">
  //                   Student
  //                 </th>

  //                 <th className="px-4 py-3 text-sm font-semibold text-white">
  //                   Student ID
  //                 </th>

  //                 <th className="px-4 py-3 text-sm font-semibold text-white">
  //                   Class
  //                 </th>

  //                 <th className="px-4 py-3 text-sm font-semibold text-white">
  //                   Gender
  //                 </th>

  //                 <th className="px-4 py-3 text-sm font-semibold text-white">
  //                   Actions
  //                 </th>
  //               </tr>
  //             </thead>

  //             <tbody>
  //               {students.length === 0 ? (
  //                 <tr>
  //                   <td
  //                     colSpan="5"
  //                     className="px-4 py-10 text-center text-slate-500"
  //                   >
  //                     No students found
  //                   </td>
  //                 </tr>
  //               ) : (
  //                 students.map((student) => (
  //                   <tr
  //                     key={student._id}
  //                     className="border-b hover:bg-slate-50"
  //                   >
  //                     <td className="px-4 py-4">
  //                       <div className="flex items-center gap-3">

  //                         {/* <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
  //                           {(student.name || "S")
  //                             .charAt(0)
  //                             .toUpperCase()}
  //                         </div> */}
  //                         <div className="h-10 w-10 rounded-full overflow-hidden border">
  //                           <img
  //                             src={
  //                               student.profilePicture ||
  //                               "/assets/default-student-avatar.png"
  //                             }
  //                             alt={student.name}
  //                             className="h-full w-full object-cover"
  //                             onError={(e) => {
  //                               e.target.src = "/assets/default-student-avatar.png";
  //                             }}
  //                           />
  //                         </div>

  //                         <div>
  //                           <p className="font-semibold text-slate-900">
  //                             {student.name}
  //                           </p>

  //                           <p className="text-sm text-slate-500">
  //                             {student.email || "-"}
  //                           </p>
  //                         </div>

  //                       </div>
  //                     </td>

  //                     <td className="px-4 py-4 text-slate-700">
  //                       {student.studentID || "-"}
  //                     </td>

  //                     <td className="px-4 py-4 text-slate-700">
  //                       {student.className || "-"}
  //                     </td>

  //                     <td className="px-4 py-4 text-slate-700">
  //                       {student.gender || "-"}
  //                     </td>

  //                     <td className="px-4 py-4">
  //                       <button
  //                         onClick={() => {
  //                           console.log(
  //                             "CLICKED STUDENT:",
  //                             student
  //                           );

  //                           navigate(`${student._id}`);
  //                         }}
  //                         className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
  //                       >
  //                         View
  //                       </button>
  //                     </td>
  //                   </tr>
  //                 ))
  //               )}
  //             </tbody>

  //           </table>
  //         </div>

  //         {/* Pagination */}
  //         <div className="flex items-center justify-between px-4 py-4 border-t bg-slate-50">
  //           <p className="text-sm text-slate-600">
  //             Page {page} of {totalPages} • Total {total} students
  //           </p>

  //           <div className="flex gap-2">
  //             <button
  //               onClick={() =>
  //                 setPage((p) => Math.max(1, p - 1))
  //               }
  //               disabled={page === 1}
  //               className="px-4 py-2 rounded-lg bg-white border disabled:opacity-50"
  //             >
  //               Previous
  //             </button>

  //             <button
  //               onClick={() =>
  //                 setPage((p) =>
  //                   Math.min(totalPages, p + 1)
  //                 )
  //               }
  //               disabled={page === totalPages}
  //               className="px-4 py-2 rounded-lg bg-white border disabled:opacity-50"
  //             >
  //               Next
  //             </button>
  //           </div>

  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="min-h-screen bg-slate-100  sm:p-4 ">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 text-white shadow-xl mb-6">

          <div className="flex items-center gap-2 sm:gap-4">

            <div className="bg-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
              <FaUserGraduate className="text-3xl sm:text-4xl" />
            </div>

            <div>
              <h1 className="text-3xl sm:text-3xl  font-bold">
                Students
              </h1>

              <p className="text-slate-300  font-medium  mt-1 sm:text-base">
                Manage Student Records
              </p>
            </div>

          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-3xl shadow-lg p-5 mb-7">
          <form
            onSubmit={onSearch}
            className="flex flex-col lg:flex-row gap-3"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search student name, email or ID..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm md:text-base focus:ring-2 focus:ring-slate-500 outline-none"
              />

              <svg
                className="absolute left-4 top-3.5 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 21l-5-5"></path>
                <circle cx="11" cy="11" r="7"></circle>
              </svg>
            </div>

            <button
              type="submit"
              className="w-full lg:w-auto bg-indigo-600 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Search
            </button>

            <button
              type="button"
              onClick={onReset}
              className="w-full lg:w-auto bg-slate-200 hover:bg-slate-300 px-6 py-3 rounded-xl font-semibold"
            >
              Reset
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[750px] w-full">

              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-4 text-left text-white">
                    Student
                  </th>

                  <th className="px-6 py-4 text-left text-white">
                    Student ID
                  </th>

                  <th className="px-6 py-4 text-left text-white">
                    Class
                  </th>

                  <th className="px-6 py-4 text-left text-white">
                    Gender
                  </th>

                  <th className="px-6 py-4 text-center text-white">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>

                {students.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-16 text-center text-slate-500"
                    >
                      No Students Found
                    </td>
                  </tr>
                ) : (
                  students.map((student, index) => (
                    <tr
                      key={student._id}
                      className={`border-b hover:bg-indigo-50 transition ${index % 2 === 0
                          ? "bg-white"
                          : "bg-slate-50"
                        }`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">

                          <img
                            src={
                              student.profilePicture ||
                              "/assets/default-student-avatar.png"
                            }
                            alt={student.name}
                            className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-4 border-slate-200"
                            onError={(e) => {
                              e.target.src =
                                "/assets/default-student-avatar.png";
                            }}
                          />

                          <div>
                            <h3 className="font-semibold uppercase text-sm md:text-base text-slate-800">
                              {student.name}
                            </h3>

                            <p className="text-xs md:text-sm text-slate-500 break-all">
                              {student.email}
                            </p>
                          </div>

                        </div>
                      </td>

                      <td className="px-6 py-5 font-medium">
                        {student.studentID}
                      </td>

                      <td className="px-6 py-5">
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {student.className}
                        </span>
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold
                        ${student.gender === "Male"
                              ? "bg-blue-100 text-blue-700"
                              : student.gender === "Female"
                                ? "bg-pink-100 text-pink-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                        >
                          {student.gender}
                        </span>

                      </td>

                      <td className="px-6 py-5 text-center">

                        <button
                          onClick={() => navigate(`${student._id}`)}
                          className="bg-slate-800 hover:bg-slate-900 text-white px-3 md:px-5 py-2 rounded-xl text-sm font-semibold transition"
                        >
                          View Profile
                        </button>

                      </td>
                    </tr>
                  ))
                )}

              </tbody>

            </table>
          </div>

          {/* Pagination */}

          <div className="bg-slate-50 border-t px-4 md:px-6 py-4 flex flex-col gap-4 md:flex-row justify-between items-center">

            <p className="text-center md:text-left text-sm text-slate-600 font-medium">
              Showing Page <span className="font-bold">{page}</span> of{" "}
              <span className="font-bold">{totalPages}</span>
              {" "}• {total} Students
            </p>

            <div className="flex w-full md:w-auto justify-center gap-3">

              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex-1 md:flex-none px-4 py-2 rounded-xl border bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                ← Previous
              </button>

              <button
                disabled={page === totalPages}
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white disabled:opacity-40"
              >
                Next →
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}