// // // import { useEffect, useState } from "react";
// // // // import api from "../../../../services/api";
// // // import { toast } from "react-toastify";
// // // import api, { API_ENDPOINTS } from "../../../../services/api";
// // // import { useNavigate } from "react-router-dom";

// // // export default function SalarySetup() {
// // //   const [teachers, setTeachers] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const navigate = useNavigate();

// // //   const fetchTeachers = async () => {
// // //     setLoading(true);
// // //     try {
// // //       const res = await api.get(API_ENDPOINTS.ADMIN.TEACHER.LIST);
// // //       console.log("👨‍🏫 Teachers:", res.data);
// // //       //  setTeachers(res.data?.data || []);
// // //       const teacherList = res.data || [];

// // //       setTeachers(
// // //         teacherList.map((t) => ({
// // //           ...t,
// // //           salary: {
// // //             basic: t.salary?.basic || 0,
// // //             allowances: t.salary?.allowances || 0,
// // //           },
// // //         })),
// // //       );
// // //     } catch (err) {
// // //       console.error(err);
// // //       toast.error("Failed to load teachers");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const handleChange = (id, field, value) => {
// // //     setTeachers((prev) =>
// // //       prev.map((t) =>
// // //         t._id === id
// // //           ? {
// // //               ...t,
// // //               salary: {
// // //                 ...t.salary,
// // //                 [field]: value,
// // //               },
// // //             }
// // //           : t,
// // //       ),
// // //     );
// // //   };

// // //   useEffect(() => {
// // //     fetchTeachers();
// // //   }, []);

// // //   const updateSalary = async (id) => {
// // //     const teacher = teachers.find((t) => t._id === id);

// // //     try {
// // //       await api.patch(API_ENDPOINTS.ADMIN.PAYROLL.SALARY_UPDATE(id), {
// // //         salary: teacher.salary,
// // //       });

// // //       toast.success("Salary updated successfully");
// // //     } catch (err) {
// // //       toast.error(err + "Failed to update salary");
// // //     }
// // //   };

// // //   return (
// // //     <div className="space-y-6">
// // //       <h2 className="text-2xl font-black text-slate-800">Staff Salary Setup</h2>

// // //       <p className="text-red-600 font-bold">
// // //         Teachers Count: {teachers.length}
// // //       </p>

// // //       <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
// // //         <table className="w-full text-sm">
// // //           <thead className="bg-slate-100">
// // //             <tr>
// // //               <th className="p-4 text-left">Teacher</th>
// // //               <th>Basic</th>
// // //               <th>Allowances</th>
// // //               <th>Total</th>
// // //               <th>Save</th>
// // //             </tr>
// // //           </thead>

// // //           <tbody>
// // //             {loading ? (
// // //               <tr>
// // //                 <td colSpan="5" className="p-6 text-center">
// // //                   Loading...
// // //                 </td>
// // //               </tr>
// // //             ) : teachers.length === 0 ? (
// // //               <tr>
// // //                 <td colSpan="5" className="p-6 text-center text-red-500">
// // //                   No teachers found
// // //                 </td>
// // //               </tr>
// // //             ) : (
// // //               teachers.map((t) => {
// // //                 return (
// // //                   <tr key={t._id} className="border-t">
// // //                     <td className="p-4 font-bold">{t.name}</td>

// // //                     <td>
// // //                       <input
// // //                         type="number"
// // //                         value={t.salary.basic}
// // //                         onChange={(e) =>
// // //                           handleChange(t._id, "basic", Number(e.target.value))
// // //                         }
// // //                         onBlur={() => updateSalary(t._id, t.salary)}
// // //                         className="border rounded-lg px-3 py-1 w-28"
// // //                       />
// // //                     </td>

// // //                     {/*
// // //                       <td>
// // //                         <input
// // //                           type="number"
// // //                           value={t.salary.basic}
// // //                           onChange={(e) =>
// // //                             handleChange(t._id, "basic", Number(e.target.value))
// // //                           }
// // //                           className="border rounded-lg px-3 py-1 w-28"
// // //                         />
// // //                       </td> */}

// // //                     <td>
// // //                       <input
// // //                         type="number"
// // //                         value={t.salary.allowances}
// // //                         onChange={(e) =>
// // //                           handleChange(
// // //                             t._id,
// // //                             "allowances",
// // //                             Number(e.target.value),
// // //                           )
// // //                         }
// // //                         className="border rounded-lg px-3 py-1 w-28"
// // //                       />
// // //                     </td>

// // //                     <td className="font-black text-emerald-600">
// // //                       ₹{t.salary.basic + t.salary.allowances}
// // //                     </td>

// // //                     <td>
// // //                       <button
// // //                         onClick={() => updateSalary(t._id)}
// // //                         className="bg-emerald-600 text-white px-4 py-1 rounded-lg text-sm"
// // //                       >
// // //                         Save
// // //                       </button>
// // //                     </td>

// // //                     <td>
// // //                       <button
// // //                         onClick={() =>
// // //                           navigate(
// // //                             `/admin/teacher-payroll-history/${t._id}`,
// // //                           )
// // //                         }
// // //                       >
// // //                         View Payroll
// // //                       </button>
// // //                     </td>
// // //                   </tr>
// // //                 );
// // //               })
// // //             )}
// // //           </tbody>
// // //         </table>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // import { useEffect, useState } from "react";
// // import { toast } from "react-toastify";
// // import api, { API_ENDPOINTS } from "../../../../services/api";
// // import { useNavigate } from "react-router-dom";

// // export default function SalarySetup() {
// //   const [teachers, setTeachers] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const today = new Date();

// //   const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1-12
// //   const [selectedYear, setSelectedYear] = useState(today.getFullYear());

// //   const navigate = useNavigate();

// //   // Fetch teachers
// //   const fetchTeachers = async () => {
// //     setLoading(true);
// //     try {
// //       const res = await api.get(API_ENDPOINTS.ADMIN.TEACHER.LIST);
// //       const teacherList = res.data || [];

// //       setTeachers(
// //         teacherList.map((t) => {
// //           const basic = t.salary?.basic || 0;
// //           const allowances = t.salary?.allowances || 0;
// //           const pensionContribution = basic * 0.1; // 10% PF
// //           const unpaidLeaveDeduction = 0; // calculated during payroll generation
// //           const taxDeduction = 0; // optional
// //           const totalDeductions =
// //             pensionContribution + unpaidLeaveDeduction + taxDeduction;
// //           const netSalary = basic + allowances - totalDeductions;

// //           return {
// //             ...t,
// //             salary: {
// //               basic,
// //               allowances,
// //               pensionContribution,
// //               unpaidLeaveDeduction,
// //               taxDeduction,
// //               totalDeductions,
// //               netSalary,
// //             },
// //           };
// //         }),
// //       );
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Failed to load teachers");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchTeachers();
// //   }, []);

// //   const handleChange = (id, field, value) => {
// //     setTeachers((prev) =>
// //       prev.map((t) => {
// //         if (t._id !== id) return t;

// //         const newSalary = {
// //           ...t.salary,
// //           [field]: value,
// //         };
// //         // Recalculate PF and net salary on change
// //         newSalary.pensionContribution = newSalary.basic * 0.1;
// //         newSalary.totalDeductions =
// //           newSalary.pensionContribution +
// //           newSalary.unpaidLeaveDeduction +
// //           newSalary.taxDeduction;
// //         newSalary.netSalary =
// //           newSalary.basic + newSalary.allowances - newSalary.totalDeductions;

// //         return { ...t, salary: newSalary };
// //       }),
// //     );
// //   };

// //   // const updateSalary = async (id) => {
// //   //   const teacher = teachers.find((t) => t._id === id);

// //   //   try {
// //   //     await api.patch(API_ENDPOINTS.ADMIN.PAYROLL.SALARY_UPDATE(id), {
// //   //       salary: {
// //   //         basic: teacher.salary.basic,
// //   //         allowances: teacher.salary.allowances,
// //   //       },
// //   //     });

// //   //     toast.success("Salary updated successfully");
// //   //   } catch (err) {
// //   //     toast.error(err+"Failed to update salary");
// //   //   }
// //   // };
// //   const updateSalary = async (id) => {
// //     const teacher = teachers.find((t) => t._id === id);

// //     try {
// //       // 1️⃣ Update Teacher salary
// //       await api.patch(API_ENDPOINTS.ADMIN.PAYROLL.SALARY_UPDATE(id), {
// //         salary: {
// //           basic: teacher.salary.basic,
// //           allowances: teacher.salary.allowances,
// //         },
// //       });

// //       const pensionContribution = teacher.salary.basic * 0.1; // 10% PF
// //       const unpaidLeaveDeduction = 0; // calculated during actual payroll generation
// //       const taxDeduction = 0; // optional
// //       const totalDeductions =
// //         pensionContribution + unpaidLeaveDeduction + taxDeduction;
// //       const netSalary =
// //         teacher.salary.basic + teacher.salary.allowances - totalDeductions;

// //       await api.post(API_ENDPOINTS.ADMIN.PAYROLL.GENERATE, {
// //         schoolId: teacher.schoolId,
// //         teacherId: teacher._id,
// //         month: selectedMonth,
// //         year: selectedYear,

// //         baseSalary: teacher.salary.basic,
// //         allowances: teacher.salary.allowances,
// //         pensionContribution,
// //         unpaidLeaveDeduction,
// //         taxDeduction,
// //         totalDeductions,
// //         netSalary,
// //         status: "DRAFT",
// //       });

// //       toast.success("Salary updated & payroll saved successfully");
// //     } catch (err) {
// //       console.error("Salary/Payroll update error:", err);
// //       toast.error("Failed to update salary & payroll");
// //     }
// //   };

// //   return (
// //     <div className="space-y-6">
// //       <h2 className="text-2xl font-black text-slate-800">Staff Salary Setup</h2>

// //       <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm">
// //         <div>
// //           <label className="block text-sm font-semibold">Month</label>
// //           <select
// //             value={selectedMonth}
// //             onChange={(e) => setSelectedMonth(Number(e.target.value))}
// //             className="border rounded-lg px-3 py-2"
// //           >
// //             {[...Array(12)].map((_, i) => (
// //               <option key={i + 1} value={i + 1}>
// //                 {new Date(0, i).toLocaleString("default", { month: "long" })}
// //               </option>
// //             ))}
// //           </select>
// //         </div>

// //         <div>
// //           <label className="block text-sm font-semibold">Year</label>
// //           <select
// //             value={selectedYear}
// //             onChange={(e) => setSelectedYear(Number(e.target.value))}
// //             className="border rounded-lg px-3 py-2"
// //           >
// //             {[selectedYear - 1, selectedYear, selectedYear + 1].map((y) => (
// //               <option key={y} value={y}>
// //                 {y}
// //               </option>
// //             ))}
// //           </select>
// //         </div>

// //         <div className="text-lg font-bold text-emerald-600 mt-5">
// //           Salary for{" "}
// //           {new Date(selectedYear, selectedMonth - 1).toLocaleString("default", {
// //             month: "long",
// //             year: "numeric",
// //           })}
// //         </div>
// //       </div>

// //       <p className="text-red-600 font-bold">
// //         Teachers Count: {teachers.length}
// //       </p>

// //       <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
// //         <table className="w-full text-sm">
// //           <thead className="bg-slate-100">
// //             <tr>
// //               <th className="p-4 text-left">Teacher</th>
// //               <th>Basic</th>
// //               <th>Allowances</th>
// //               <th>PF (10%)</th>
// //               <th>Leave Deduction</th>
// //               <th>Tax</th>
// //               <th>Total Deductions</th>
// //               <th>Net Salary</th>
// //               <th>Save</th>
// //               <th>Payroll</th>
// //             </tr>
// //           </thead>

// //           <tbody>
// //             {loading ? (
// //               <tr>
// //                 <td colSpan="10" className="p-6 text-center">
// //                   Loading...
// //                 </td>
// //               </tr>
// //             ) : teachers.length === 0 ? (
// //               <tr>
// //                 <td colSpan="10" className="p-6 text-center text-red-500">
// //                   No teachers found
// //                 </td>
// //               </tr>
// //             ) : (
// //               teachers.map((t) => (
// //                 <tr key={t._id} className="border-t">
// //                   <td className="p-4 font-bold">{t.name}</td>

// //                   <td>
// //                     <input
// //                       type="number"
// //                       value={t.salary.basic}
// //                       onChange={(e) =>
// //                         handleChange(t._id, "basic", Number(e.target.value))
// //                       }
// //                       className="border rounded-lg px-3 py-1 w-24"
// //                     />
// //                   </td>

// //                   <td>
// //                     <input
// //                       type="number"
// //                       value={t.salary.allowances}
// //                       onChange={(e) =>
// //                         handleChange(
// //                           t._id,
// //                           "allowances",
// //                           Number(e.target.value),
// //                         )
// //                       }
// //                       className="border rounded-lg px-3 py-1 w-24"
// //                     />
// //                   </td>

// //                   <td>₹{t.salary.pensionContribution}</td>
// //                   <td>
// //                     <input
// //                       type="number"
// //                       value={t.salary.unpaidLeaveDeduction}
// //                       onChange={(e) =>
// //                         handleChange(
// //                           t._id,
// //                           "unpaidLeaveDeduction",
// //                           Number(e.target.value),
// //                         )
// //                       }
// //                       className="border rounded-lg px-3 py-1 w-24"
// //                     />
// //                   </td>
// //                   <td>
// //                     <input
// //                       type="number"
// //                       value={t.salary.taxDeduction}
// //                       onChange={(e) =>
// //                         handleChange(
// //                           t._id,
// //                           "taxDeduction",
// //                           Number(e.target.value),
// //                         )
// //                       }
// //                       className="border rounded-lg px-3 py-1 w-24"
// //                     />
// //                   </td>

// //                   <td>₹{t.salary.totalDeductions}</td>
// //                   <td className="font-black text-emerald-600">
// //                     ₹{t.salary.netSalary}
// //                   </td>

// //                   <td>
// //                     <button
// //                       onClick={() => updateSalary(t._id)}
// //                       className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm"
// //                     >
// //                       Save
// //                     </button>
// //                   </td>

// //                   <td>
// //                     <button
// //                       onClick={() =>
// //                         navigate(`/admin/teacher-payroll-history/${t._id}`)
// //                       }
// //                       className="px-3 py-1 border rounded-lg text-sm"
// //                     >
// //                       View
// //                     </button>
// //                   </td>
// //                 </tr>
// //               ))
// //             )}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   );
// // }

// import { useEffect, useState } from "react";
// import { toast } from "react-toastify";
// import api, { API_ENDPOINTS } from "../../../../services/api";
// import { useNavigate } from "react-router-dom";

// export default function SalarySetup() {
//   const [teachers, setTeachers] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const today = new Date();
//   const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
//   const [selectedYear, setSelectedYear] = useState(today.getFullYear());

//   const navigate = useNavigate();

//   // ================= FETCH TEACHERS =================
//   // const fetchTeachers = async () => {
//   //   setLoading(true);
//   //   try {
//   //     const res = await api.get(API_ENDPOINTS.ADMIN.TEACHER.LIST);
//   //     const teacherList = res.data || [];

//   //     setTeachers(
//   //       teacherList.map((t) => {
//   //         const basic = t.salary?.basic || 0;
//   //         const allowances = t.salary?.allowances || 0;
//   //         const pensionContribution = basic * 0.1;
//   //         const taxDeduction = t.salary?.taxDeduction ??0;
//   //         const unpaidLeaveDeduction = t.salary?.unpaidLeaveDeduction ?? 0;
//   //         const totalDeductions =
//   //           pensionContribution + taxDeduction + unpaidLeaveDeduction;
//   //         const netSalary = basic + allowances - totalDeductions;

//   //         return {
//   //           ...t,
//   //           salary: {
//   //             basic,
//   //             allowances,
//   //             pensionContribution,
//   //             unpaidLeaveDeduction,
//   //             taxDeduction,
//   //             totalDeductions,
//   //             netSalary,
//   //           },
//   //         };
//   //       }),
//   //     );
//   //   } catch (err) {
//   //     toast.error(err + "Failed to load teachers");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
//   const fetchTeachers = async () => {
//   setLoading(true);
//   try {
//     const teacherRes = await api.get(API_ENDPOINTS.ADMIN.TEACHER.LIST);
//     const payrollRes = await api.get(API_ENDPOINTS.ADMIN.PAYROLL.LIST, {
//       params: { month: selectedMonth, year: selectedYear },
//     });

//     const teachers = teacherRes.data || [];
//     const payrolls = payrollRes.data || [];

//     setTeachers(
//       teachers.map((t) => {
//         const payroll = payrolls.find(
//           (p) =>
//             p.teacherId?._id === t._id ||
//             p.teacherId === t._id
//         );

//         const basic = t.salary?.basic || 0;
//         const allowances = t.salary?.allowances || 0;
//         const pensionContribution = basic * 0.1;
//         const unpaidLeaveDeduction = payroll?.unpaidLeaveDeduction || 0;
//         const taxDeduction = payroll?.taxDeduction || 0;

//         const totalDeductions =
//           pensionContribution + unpaidLeaveDeduction + taxDeduction;

//         const netSalary = basic + allowances - totalDeductions;

//         return {
//           ...t,
//           payrollId: payroll?._id,
//           salary: {
//             basic,
//             allowances,
//             pensionContribution,
//             unpaidLeaveDeduction,
//             taxDeduction,
//             totalDeductions,
//             netSalary,
//           },
//         };
//       })
//     );
//   } catch (err) {
//     toast.error(err+"Failed to load salary data");
//   } finally {
//     setLoading(false);
//   }
// };


//   useEffect(() => {
//     fetchTeachers();
//   }, []);

//   // ================= HANDLE SALARY CHANGE =================
//   const handleChange = (id, field, value) => {
//     setTeachers((prev) =>
//       prev.map((t) => {
//         if (t._id !== id) return t;

//         const salary = { ...t.salary, [field]: value };
//         salary.pensionContribution = salary.basic * 0.1;
//         salary.totalDeductions =
//           salary.pensionContribution +
//           salary.unpaidLeaveDeduction +
//           salary.taxDeduction;
//         salary.netSalary =
//           salary.basic + salary.allowances - salary.totalDeductions;

//         return { ...t, salary };
//       }),
//     );
//   };

//   // ================= SAVE SALARY (TEACHER ONLY) =================
//   // const updateSalary = async (id) => {
//   //   const teacher = teachers.find((t) => t._id === id);

//   //   try {
//   //     await api.patch(API_ENDPOINTS.ADMIN.PAYROLL.SALARY_UPDATE(id), {
//   //       salary: {
//   //         basic: teacher.salary.basic,
//   //         allowances: teacher.salary.allowances,
//   //           // taxDeduction: teacher.salary.taxDeduction,
//   //       },
//   //     });

//   //     toast.success("Salary updated successfully");
//   //   } catch (err) {
//   //     toast.error(err+"Failed to update salary");
//   //   }
//   // };

//   // const saveSalaryAndPayroll = async (id) => {
//   //   const teacher = teachers.find((t) => t._id === id);

//   //   // if (!teacher?.payrollGenerated) {
//   //   //   toast.error("Please generate payroll first");
//   //   //   return;
//   //   // }

//   //   try {
//   //     // 1️⃣ Update Teacher Salary
//   //     await api.patch(API_ENDPOINTS.ADMIN.PAYROLL.SALARY_UPDATE(id), {
//   //       salary: {
//   //         basic: teacher.salary.basic,
//   //         allowances: teacher.salary.allowances,
//   //       },
//   //     });

//   //     // 2️⃣ Update Payroll (current month)
//   //     await api.patch(API_ENDPOINTS.ADMIN.PAYROLL.UPDATE_PAYROLL, {
//   //       teacherId: teacher._id,
//   //       month: selectedMonth,
//   //       year: selectedYear,
//   //       unpaidLeaveDeduction: teacher.salary.unpaidLeaveDeduction,
//   //       taxDeduction: teacher.salary.taxDeduction,
//   //     });

//   //     toast.success("Salary & Payroll updated successfully ✅");
//   //   } catch (err) {
//   //     toast.error(
//   //       err?.response?.data?.message || "Failed to update salary / payroll",
//   //     );
//   //   }
//   // };

//   const saveSalaryAndPayroll = async (id) => {
//   const teacher = teachers.find((t) => t._id === id);

//   try {
//     // 1️⃣ Update teacher salary
//     await api.patch(API_ENDPOINTS.ADMIN.PAYROLL.SALARY_UPDATE(id), {
//       salary: {
//         basic: teacher.salary.basic,
//         allowances: teacher.salary.allowances,
//       },
//     });

//     // 2️⃣ Get payroll of selected month
//     const payrollRes = await api.get(API_ENDPOINTS.ADMIN.PAYROLL.LIST, {
//       params: {
//         month: selectedMonth,
//         year: selectedYear,
//       },
//     });

//     console.log("Payroll API raw:", payrollRes.data);

//     // const payroll = payrollRes.data.find(
//     //   (p) => p.teacherId === teacher._id
//     // );

//      const payrollList = payrollRes.data || [];
//      console.log("Payroll list:", payrollList);


//     const payroll = payrollList.find(
//       (p) =>
//         p.teacherId === teacher._id ||
//         p.teacherId?._id === teacher._id
//     );

//     if (!payroll) {
//       toast.error("Please generate payroll first");
//       return;
//     }

//     // 3️⃣ Update payroll
//     await api.patch(
//       API_ENDPOINTS.ADMIN.PAYROLL.UPDATE_PAYROLL(payroll._id),
//       {
//         unpaidLeaveDeduction: teacher.salary.unpaidLeaveDeduction,
//         taxDeduction: teacher.salary.taxDeduction,
//       }
//     );

//     toast.success("Salary & Payroll updated successfully ✅");
//   } catch (err) {
//     toast.error(err?.response?.data?.message || "Update failed");
//   }
// };


//   // ================= GENERATE PAYROLL (MONTH-WISE) =================
//   const generatePayroll = async () => {
//     try {
//       await api.post(API_ENDPOINTS.ADMIN.PAYROLL.GENERATE, {
//         month: selectedMonth,
//         year: selectedYear,
//       });

//       toast.success(
//         `Payroll generated for ${new Date(
//           selectedYear,
//           selectedMonth - 1,
//         ).toLocaleString("default", {
//           month: "long",
//           year: "numeric",
//         })}`,
//       );
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Payroll already generated");
//     }
//   };

//   // ================= UI =================
//   return (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-black text-slate-800">Staff Salary Setup</h2>

//       {/* Month / Year Selector */}
//       <div className="flex gap-4 items-end bg-white p-4 rounded-xl shadow-sm">
//         <div>
//           <label className="text-sm font-semibold">Month</label>
//           <select
//             value={selectedMonth}
//             onChange={(e) => setSelectedMonth(Number(e.target.value))}
//             className="border rounded-lg px-3 py-2"
//           >
//             {[...Array(12)].map((_, i) => (
//               <option key={i + 1} value={i + 1}>
//                 {new Date(0, i).toLocaleString("default", { month: "long" })}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="text-sm font-semibold">Year</label>
//           <select
//             value={selectedYear}
//             onChange={(e) => setSelectedYear(Number(e.target.value))}
//             className="border rounded-lg px-3 py-2"
//           >
//             {[selectedYear - 1, selectedYear, selectedYear + 1].map((y) => (
//               <option key={y} value={y}>
//                 {y}
//               </option>
//             ))}
//           </select>
//         </div>

//         <button
//           onClick={generatePayroll}
//           className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold"
//         >
//           Generate Payroll
//         </button>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
//         <table className="w-full text-sm">
//           <thead className="bg-slate-100">
//             <tr>
//               <th className="p-4 text-left">Teacher</th>
//               <th>Basic</th>
//               <th>Allowances</th>
//               <th>PF (10%)</th>
//               <th>Leave Deduction</th>
//               <th>Tax</th>
//               <th>Total Deductions</th>
//               <th>Net Salary</th>
//               <th>Save</th>
//               <th>Payroll</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="7" className="p-6 text-center">
//                   Loading...
//                 </td>
//               </tr>
//             ) : (
//               teachers.map((t) => (
//                 <tr key={t._id} className="border-t">
//                   <td className="p-4 font-bold">{t.name}</td>

//                   <td>
//                     <input
//                       type="number"
//                       value={t.salary.basic}
//                       onChange={(e) =>
//                         handleChange(t._id, "basic", Number(e.target.value))
//                       }
//                       className="border px-2 py-1 w-24 rounded"
//                     />
//                   </td>

//                   <td>
//                     <input
//                       type="number"
//                       value={t.salary.allowances}
//                       onChange={(e) =>
//                         handleChange(
//                           t._id,
//                           "allowances",
//                           Number(e.target.value),
//                         )
//                       }
//                       className="border px-2 py-1 w-24 rounded"
//                     />
//                   </td>

//                   <td>₹{t.salary.pensionContribution}</td>
//                   <td>
//                     <input
//                       type="number"
//                       value={t.salary.unpaidLeaveDeduction}
//                       onChange={(e) =>
//                         handleChange(
//                           t._id,
//                           "unpaidLeaveDeduction",
//                           Number(e.target.value),
//                         )
//                       }
//                       className="border rounded-lg px-3 py-1 w-24"
//                     />
//                   </td>
//                   <td>
//                     <input
//                       type="number"
//                       value={t.salary.taxDeduction}
//                       onChange={(e) =>
//                         handleChange(
//                           t._id,
//                           "taxDeduction",
//                           Number(e.target.value),
//                         )
//                       }
//                       className="border rounded-lg px-3 py-1 w-24"
//                     />
//                   </td>

//                   <td>₹{t.salary.totalDeductions}</td>
//                   <td className="font-bold text-emerald-600">
//                     ₹{t.salary.netSalary}
//                   </td>

//                       <td>
//                   <button
//                     onClick={() => saveSalaryAndPayroll(t._id)}
//                     className="bg-emerald-600 text-white px-3 py-1 rounded"
//                   >
//                     Save
//                   </button>
//                   </td>

//                   <td>
//                     <button
//                       onClick={() =>
//                         navigate(`/admin/teacher-payroll-history/${t._id}`)
//                       }
//                       className="border px-3 py-1 rounded"
//                     >
//                       View
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../../services/api";
import { useNavigate } from "react-router-dom";
import { FaMoneyBillWave, FaSave, FaEye, FaCalendarAlt } from "react-icons/fa";

export default function SalarySetup() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const navigate = useNavigate();

  // ================= FETCH DATA =================
  const fetchData = async () => {
    setLoading(true);
    try {
      const [teacherRes, payrollRes] = await Promise.all([
        api.get(API_ENDPOINTS.ADMIN.TEACHER.LIST),
        api.get(API_ENDPOINTS.ADMIN.PAYROLL.LIST, {
          params: { month, year },
        }),
      ]);

      const payrolls = payrollRes.data || [];

      const mapped = (teacherRes.data || []).map((t) => {
        const payroll = payrolls.find(
          (p) => p.teacherId?._id === t._id || p.teacherId === t._id
        );

        const basic = t.salary?.basic || 0;
        const allowances = t.salary?.allowances || 0;
        const pf = Math.round(basic * 0.1);
        const unpaid = payroll?.unpaidLeaveDeduction || 0;
        const tax = payroll?.taxDeduction || 0;

        const totalDeductions = pf + unpaid + tax;
        const netSalary = basic + allowances - totalDeductions;

        return {
          ...t,
          payrollId: payroll?._id,
          status: payroll?.status || "DRAFT",
          salary: {
            basic,
            allowances,
            pf,
            unpaid,
            tax,
            totalDeductions,
            netSalary,
          },
        };
      });

      setTeachers(mapped);
    } catch (err) {
      toast.error(err+"Failed to load salary data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  // ================= HANDLE CHANGE =================
  const handleChange = (id, field, value) => {
    setTeachers((prev) =>
      prev.map((t) => {
        if (t._id !== id) return t;
        if (t.status === "PAID") return t;

        const salary = { ...t.salary, [field]: value };
        salary.pf = Math.round(salary.basic * 0.1);
        salary.totalDeductions = salary.pf + salary.unpaid + salary.tax;
        salary.netSalary = salary.basic + salary.allowances - salary.totalDeductions;

        return { ...t, salary };
      })
    );
  };

  // ================= SAVE =================
  const savePayroll = async (teacher) => {
    try {
      if (teacher.status === "PAID") {
        toast.error("Paid payroll cannot be edited");
        return;
      }

      await api.patch(API_ENDPOINTS.ADMIN.PAYROLL.SALARY_UPDATE(teacher._id), {
        salary: {
          basic: teacher.salary.basic,
          allowances: teacher.salary.allowances,
        },
      });

      if (!teacher.payrollId) {
        toast.error("Generate payroll first");
        return;
      }

      await api.patch(
        API_ENDPOINTS.ADMIN.PAYROLL.UPDATE_PAYROLL(teacher.payrollId),
        {
          unpaidLeaveDeduction: teacher.salary.unpaid,
          taxDeduction: teacher.salary.tax,
        }
      );

      toast.success("Salary updated successfully");
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  // ================= GENERATE PAYROLL =================
  const generatePayroll = async () => {
    try {
      await api.post(API_ENDPOINTS.ADMIN.PAYROLL.GENERATE, { month, year });
      toast.success("Payroll generated successfully");
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Payroll already generated");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl">
            <FaMoneyBillWave />
          </div>
          <div>
            <h2 className="text-3xl font-black">Staff Salary Setup</h2>
            <p className="text-slate-500">Configure & review monthly salaries</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
          <FaCalendarAlt className="text-slate-400" />
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={generatePayroll}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700"
          >
            Generate Payroll
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="p-4 text-left">Teacher</th>
              <th>Basic</th>
              <th>Allowances</th>
              <th>PF</th>
              <th>Leave</th>
              <th>Tax</th>
              <th>Net Salary</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" className="p-6 text-center">Loading...</td></tr>
            ) : (
              teachers.map((t) => (
                <tr key={t._id} className="border-t hover:bg-slate-50">
                  <td className="p-4 font-semibold">{t.name}</td>
                  <td><input type="number" value={t.salary.basic} disabled={t.status === "PAID"}
                    onChange={(e) => handleChange(t._id, "basic", Number(e.target.value))}
                    className="border rounded px-2 py-1 w-24" /></td>
                  <td><input type="number" value={t.salary.allowances} disabled={t.status === "PAID"}
                    onChange={(e) => handleChange(t._id, "allowances", Number(e.target.value))}
                    className="border rounded px-2 py-1 w-24" /></td>
                  <td>₹{t.salary.pf}</td>
                  <td><input type="number" value={t.salary.unpaid} disabled={t.status === "PAID"}
                    onChange={(e) => handleChange(t._id, "unpaid", Number(e.target.value))}
                    className="border rounded px-2 py-1 w-20" /></td>
                  <td><input type="number" value={t.salary.tax} disabled={t.status === "PAID"}
                    onChange={(e) => handleChange(t._id, "tax", Number(e.target.value))}
                    className="border rounded px-2 py-1 w-20" /></td>
                  <td className="font-bold text-emerald-600">₹{t.salary.netSalary}</td>
                  <td>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="flex gap-2 p-2">
                    <button onClick={() => savePayroll(t)}
                      className="bg-emerald-600 text-white px-3 py-1 rounded flex items-center gap-1">
                      <FaSave /> Save
                    </button>
                    <button onClick={() => navigate(`/admin/teacher-payroll-history/${t._id}`)}
                      className="border px-3 py-1 rounded flex items-center gap-1">
                      <FaEye /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
