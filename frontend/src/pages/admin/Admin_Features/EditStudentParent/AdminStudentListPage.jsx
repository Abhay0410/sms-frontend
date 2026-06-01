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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600 font-medium">
          Loading students...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <FaUserGraduate className="text-indigo-500 text-3xl rounded-xl  bg-slate-50 border-indigo-500" />
              Students
            </h1>

            <p className="text-slate-500 text-sm font-semibold mt-1">
              Manage student profiles from admin dashboard
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow p-4 mb-5">
          <form
            onSubmit={onSearch}
            className="flex flex-col md:flex-row gap-3"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search student name, ID, email..."
              className="flex-1 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-200"
            />

            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold"
            >
              Search
            </button>

            <button
              type="button"
              onClick={onReset}
              className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold"
            >
              Reset
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">

              <thead className="bg-slate-800 border-b">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-white">
                    Student
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-white">
                    Student ID
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-white">
                    Class
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-white">
                    Gender
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      No students found
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr
                      key={student._id}
                      className="border-b hover:bg-slate-50"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">

                          {/* <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                            {(student.name || "S")
                              .charAt(0)
                              .toUpperCase()}
                          </div> */}
                          <div className="h-10 w-10 rounded-full overflow-hidden border">
                            <img
                              src={
                                student.profilePicture ||
                                "/assets/default-student-avatar.png"
                              }
                              alt={student.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.src = "/assets/default-student-avatar.png";
                              }}
                            />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {student.name}
                            </p>

                            <p className="text-sm text-slate-500">
                              {student.email || "-"}
                            </p>
                          </div>

                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {student.studentID || "-"}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {student.className || "-"}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {student.gender || "-"}
                      </td>

                      <td className="px-4 py-4">
                        <button
                          onClick={() => {
                            console.log(
                              "CLICKED STUDENT:",
                              student
                            );

                            navigate(`${student._id}`);
                          }}
                          className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t bg-slate-50">
            <p className="text-sm text-slate-600">
              Page {page} of {totalPages} • Total {total} students
            </p>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPage((p) => Math.max(1, p - 1))
                }
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-white border disabled:opacity-50"
              >
                Previous
              </button>

              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(totalPages, p + 1)
                  )
                }
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-white border disabled:opacity-50"
              >
                Next
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}