// // import React, { useState } from "react";
// // import api from "../../../../services/api";
// // import { toast } from "react-toastify";
// // import { FaMoneyBillWave, FaCog, FaCheckCircle } from "react-icons/fa";

// // export default function PayrollManager() {
// //   const [loading, setLoading] = useState(false);
// //   const [params, setParams] = useState({
// //     month: new Date().getMonth() + 1,
// //     year: new Date().getFullYear()
// //   });

// //   const handleGeneratePayroll = async () => {
// //     try {
// //       setLoading(true);
// //       // Backend: generateMonthlyPayroll logic
// //       await api.post('/api/admin/payroll/payroll/generate', params);
// //       toast.success("Payroll drafted successfully for all active staff!");
// //     } catch (error) {
// //       toast.error(error.message || "Failed to generate payroll");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="space-y-8 animate-in fade-in duration-700">
// //       <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
// //         <div className="flex items-center gap-6">
// //           <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner">
// //             <FaMoneyBillWave />
// //           </div>
// //           <div>
// //             <h2 className="text-4xl font-black text-slate-900 tracking-tight">Payroll Engine</h2>
// //             <p className="text-slate-500 font-medium italic">Calculate salaries, deductions, and pension funds.</p>
// //           </div>
// //         </div>

// //         <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-[2rem] border border-slate-100">
// //           <select 
// //             value={params.month} 
// //             onChange={e => setParams({...params, month: e.target.value})}
// //             className="bg-transparent font-bold text-slate-700 outline-none px-4"
// //           >
// //             {Array.from({length: 12}, (_, i) => (
// //               <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', {month: 'long'})}</option>
// //             ))}
// //           </select>
// //           <button 
// //             onClick={handleGeneratePayroll}
// //             disabled={loading}
// //             className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-50"
// //           >
// //             {loading ? "Calculating..." : "Run Payroll"}
// //           </button>
// //         </div>
// //       </div>

// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-5">
// //            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><FaCog/></div>
// //            <div>
// //               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuration</p>
// //               <p className="font-bold text-slate-700 text-sm">Pension: 10% (Fixed)</p>
// //            </div>
// //         </div>
// //         {/* Yaha aap payroll list show kar sakte hain payment mark karne ke liye */}
// //       </div>
// //     </div>
// //   );
// // }


// import React, { useEffect, useState } from "react";
// import api from "../../../../services/api";
// import { toast } from "react-toastify";
// import {
//   FaMoneyBillWave,
//   FaSave,
//   FaCheckCircle,
//   FaTrash
// } from "react-icons/fa";

// export default function PayrollManager() {
//   const [loading, setLoading] = useState(false);
//   const [payrolls, setPayrolls] = useState([]);
//   const [params, setParams] = useState({
//     month: new Date().getMonth() + 1,
//     year: new Date().getFullYear(),
//   });

//   /* =========================
//      FETCH PAYROLL LIST
//   ========================== */
//   const fetchPayrolls = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get("/api/admin/payroll/payroll", {
//         params,
//       });
//       console.log("Payrolls:", res.data);
//       setPayrolls(res.data || []);
//     } catch (err) {
//       toast.error(err+"Failed to fetch payrolls");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPayrolls();
//   }, [params.month, params.year]);

//   /* =========================
//      GENERATE PAYROLL
//   ========================== */
//   const generatePayroll = async () => {
//     try {
//       setLoading(true);
//       await api.post("/api/admin/payroll/payroll/generate", params);
//       toast.success("Payroll generated successfully");
//       fetchPayrolls();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Payroll generation failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* =========================
//      HANDLE INPUT CHANGE
//   ========================== */
//   const handleChange = (id, field, value) => {
//     setPayrolls((prev) =>
//       prev.map((p) =>
//         p._id === id ? { ...p, [field]: Number(value) } : p
//       )
//     );
//   };

//   /* =========================
//      SAVE PAYROLL
//   ========================== */
//   const savePayroll = async (p) => {
//     try {
//       await api.patch(`/api/admin/payroll/update/${p._id}`, {
//         unpaidLeaveDeduction: p.unpaidLeaveDeduction,
//         taxDeduction: p.taxDeduction,
//       });
//       toast.success("Payroll updated");
//       fetchPayrolls();
//     } catch (err) {
//       toast.error(err+"Failed to update payroll");
//     }
//   };

//   /* =========================
//      MARK AS PAID
//   ========================== */
//   const markPaid = async (id) => {
//     try {
//       await api.patch(`/api/admin/payroll/payroll/${id}/pay`);
//       toast.success("Salary marked as PAID");
//       fetchPayrolls();
//     } catch (err) {
//       toast.error(err+"Failed to mark as paid");
//     }
//   };

//   /* =========================
//      DELETE DRAFT
//   ========================== */
//   const deleteDraft = async (id) => {
//     try {
//       await api.delete(`/api/admin/payroll/delete/payroll/${id}`);
//       toast.success("Draft payroll deleted");
//       fetchPayrolls();
//     } catch (err) {
//       toast.error(err+"Delete failed");
//     }
//   };

//   /* =========================
//      UI
//   ========================== */
//   return (
//     <div className="space-y-6">
//       {/* HEADER */}
//       <div className="bg-white p-8 rounded-3xl flex justify-between items-center shadow">
//         <div className="flex items-center gap-4">
//           <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl">
//             <FaMoneyBillWave />
//           </div>
//           <div>
//             <h2 className="text-2xl font-black">Payroll Manager</h2>
//             <p className="text-sm text-gray-500">
//               Generate & manage monthly salaries
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-3">
//           <select
//             value={params.month}
//             onChange={(e) =>
//               setParams({ ...params, month: Number(e.target.value) })
//             }
//             className="border rounded-xl px-3 py-2"
//           >
//             {Array.from({ length: 12 }, (_, i) => (
//               <option key={i + 1} value={i + 1}>
//                 {new Date(0, i).toLocaleString("en", { month: "long" })}
//               </option>
//             ))}
//           </select>

//           <button
//             onClick={generatePayroll}
//             disabled={loading}
//             className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-emerald-600"
//           >
//             Run Payroll
//           </button>
//         </div>
//       </div>

//       {/* TABLE */}
//       <div className="bg-white rounded-3xl overflow-x-auto shadow">
//         <table className="w-full text-sm">
//           <thead className="bg-slate-100 text-left">
//             <tr>
//               <th className="p-4">Teacher</th>
//               <th>Basic</th>
//               <th>Allowances</th>
//               <th>Pension</th>
//               <th>Leave Deduction</th>
//               <th>Tax</th>
//               <th>Net Salary</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {payrolls.map((p) => (
//               <tr key={p._id} className="border-t">
//                 <td className="p-4 font-semibold">
//                   {p.teacherId?.name}
//                 </td>
//                 <td>₹{p.baseSalary}</td>
//                 <td>₹{p.allowances}</td>
//                 <td>₹{p.pensionContribution}</td>

//                 <td>
//                   <input
//                     type="number"
//                     value={p.unpaidLeaveDeduction}
//                     disabled={p.status === "PAID"}
//                     onChange={(e) =>
//                       handleChange(
//                         p._id,
//                         "unpaidLeaveDeduction",
//                         e.target.value
//                       )
//                     }
//                     className="border rounded-lg px-2 w-24"
//                   />
//                 </td>

//                 <td>
//                   <input
//                     type="number"
//                     value={p.taxDeduction}
//                     disabled={p.status === "PAID"}
//                     onChange={(e) =>
//                       handleChange(p._id, "taxDeduction", e.target.value)
//                     }
//                     className="border rounded-lg px-2 w-24"
//                   />
//                 </td>

//                 <td className="font-bold">₹{p.netSalary}</td>

//                 <td>
//                   <span
//                     className={`px-3 py-1 rounded-full text-xs font-bold ${
//                       p.status === "PAID"
//                         ? "bg-green-100 text-green-700"
//                         : "bg-yellow-100 text-yellow-700"
//                     }`}
//                   >
//                     {p.status}
//                   </span>
//                 </td>

//                 <td className="flex gap-2 py-2">
//                   {p.status === "DRAFT" && (
//                     <>
//                       <button
//                         onClick={() => savePayroll(p)}
//                         className="p-2 bg-blue-100 text-blue-600 rounded-lg"
//                       >
//                         <FaSave />
//                       </button>
//                       <button
//                         onClick={() => markPaid(p._id)}
//                         className="p-2 bg-green-100 text-green-600 rounded-lg"
//                       >
//                         <FaCheckCircle />
//                       </button>
//                       <button
//                         onClick={() => deleteDraft(p._id)}
//                         className="p-2 bg-red-100 text-red-600 rounded-lg"
//                       >
//                         <FaTrash />
//                       </button>
//                     </>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {payrolls.length === 0 && (
//           <p className="p-6 text-center text-gray-500">
//             No payroll records found
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import api from "../../../../services/api";
import { toast } from "react-toastify";
import {
  FaMoneyBillWave,
  FaSave,
  FaCheckCircle,
  FaTrash,
} from "react-icons/fa";

export default function PayrollManager() {
  const [loading, setLoading] = useState(false);
  const [payrolls, setPayrolls] = useState([]);
  const [params, setParams] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  /* ================= FETCH ================= */
  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/payroll/payroll", { params });
      setPayrolls(res.data || []);
    } catch (err) {
      toast.error(err+"Failed to fetch payrolls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [params.month, params.year]);

  /* ================= ACTIONS ================= */
  const generatePayroll = async () => {
    try {
      setLoading(true);
      await api.post("/api/admin/payroll/payroll/generate", params);
      toast.success("Payroll generated");
      fetchPayrolls();
    } catch {
      toast.error("Payroll generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id, field, value) => {
    setPayrolls((prev) =>
      prev.map((p) =>
        p._id === id ? { ...p, [field]: Number(value) } : p
      )
    );
  };

  const savePayroll = async (p) => {
    try {
      await api.patch(`/api/admin/payroll/update/${p._id}`, {
        unpaidLeaveDeduction: p.unpaidLeaveDeduction,
        taxDeduction: p.taxDeduction,
      });
      toast.success("Payroll updated");
      fetchPayrolls();
    } catch {
      toast.error("Update failed");
    }
  };

  const markPaid = async (id) => {
    try {
      await api.patch(`/api/admin/payroll/payroll/${id}/pay`);
      toast.success("Marked as PAID");
      fetchPayrolls();
    } catch {
      toast.error("Failed");
    }
  };

  const deleteDraft = async (id) => {
    try {
      await api.delete(`/api/admin/payroll/delete/payroll/${id}`);
      toast.success("Draft deleted");
      fetchPayrolls();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white p-8 rounded-3xl shadow flex flex-col md:flex-row justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl">
            <FaMoneyBillWave />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800">
              Payroll Manager
            </h2>
            <p className="text-slate-500 text-sm">
              Generate & manage monthly salaries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
          <select
            value={params.month}
            onChange={(e) =>
              setParams({ ...params, month: Number(e.target.value) })
            }
            className="bg-transparent outline-none font-semibold"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("en", { month: "long" })}
              </option>
            ))}
          </select>

          <button
            onClick={generatePayroll}
            disabled={loading}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Run Payroll"}
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              {[
                "Teacher",
                "Basic",
                "Allowances",
                "Pension",
                "Leave",
                "Tax",
                "Net",
                "Status",
                "Actions",
              ].map((h) => (
                <th key={h} className="p-4 text-left font-bold text-slate-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {payrolls.map((p) => (
              <tr
                key={p._id}
                className={`border-t hover:bg-slate-50 transition ${
                  p.status === "PAID" && "opacity-70"
                }`}
              >
                <td className="p-4 font-semibold">
                  {p.teacherId?.name}
                </td>
                <td>₹{p.baseSalary}</td>
                <td>₹{p.allowances}</td>
                <td>₹{p.pensionContribution}</td>

                <td>
                  <input
                    type="number"
                    value={p.unpaidLeaveDeduction}
                    disabled={p.status === "PAID"}
                    onChange={(e) =>
                      handleChange(
                        p._id,
                        "unpaidLeaveDeduction",
                        e.target.value
                      )
                    }
                    className="border rounded-lg px-2 w-24 disabled:bg-gray-100"
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={p.taxDeduction}
                    disabled={p.status === "PAID"}
                    onChange={(e) =>
                      handleChange(p._id, "taxDeduction", e.target.value)
                    }
                    className="border rounded-lg px-2 w-24 disabled:bg-gray-100"
                  />
                </td>

                <td className="font-extrabold text-emerald-700">
                  ₹{p.netSalary}
                </td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      p.status === "PAID"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>

                <td className="flex gap-2 py-2">
                  {p.status === "DRAFT" && (
                    <>
                      <button
                        onClick={() => savePayroll(p)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:scale-110 transition"
                      >
                        <FaSave />
                      </button>
                      <button
                        onClick={() => markPaid(p._id)}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:scale-110 transition"
                      >
                        <FaCheckCircle />
                      </button>
                      <button
                        onClick={() => deleteDraft(p._id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:scale-110 transition"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {payrolls.length === 0 && (
          <p className="p-6 text-center text-slate-400">
            No payroll records found
          </p>
        )}
      </div>
    </div>
  );
}
