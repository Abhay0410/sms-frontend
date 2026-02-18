// import { useEffect, useState } from "react";
// import api from "../../../../services/api";
// import { FaMoneyBillWave, FaUsers, FaExclamationCircle, FaArrowRight, FaCheckCircle, FaTools } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";

// export default function AdminPayrollDashboard() {
//   const [summary, setSummary] = useState({ paid: 0, pending: 0, totalStaff: 0, staffList: [], processedCount: 0 });
//   const navigate = useNavigate();

//   useEffect(() => {
//     const loadSummary = async () => {
//       try {
//         const resp = await api.get('/api/admin/payroll/summary');
//         setSummary(resp.data || { paid: 0, pending: 0, totalStaff: 0, staffList: [] });
//       } catch (err) {
//         console.error("Summary fetch error", err);
//       }
//     };
//     loadSummary();
//   }, []);

//   return (
//     <div className="p-8 space-y-10">
//       <div className="flex justify-between items-end">
//         <div>
//            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Payroll Command Center</h1>
//            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Real-time Financial Overview</p>
//         </div>
//         <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100">
//            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Processing Progress</p>
//            <div className="flex items-center gap-3 mt-1">
//               <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
//                  <div className="h-full bg-indigo-600" style={{ width: `${(summary.processedCount / summary.totalStaff) * 100}%` }}></div>
//               </div>
//               <span className="text-sm font-black text-indigo-700">{summary.processedCount}/{summary.totalStaff}</span>
//            </div>
//         </div>
//       </div>
      
//       {/* 📊 Top Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//         <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden group">
//           <div className="absolute -right-4 -top-4 bg-indigo-50 h-24 w-24 rounded-full group-hover:scale-150 transition-all duration-500"></div>
//           <FaMoneyBillWave className="text-indigo-600 text-3xl mb-6 relative z-10"/>
//           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Paid (Current Month)</p>
//           <h2 className="text-4xl font-black text-slate-900 mt-2">₹{summary.paid.toLocaleString()}</h2>
//         </div>

//         <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden group">
//           <div className="absolute -right-4 -top-4 bg-orange-50 h-24 w-24 rounded-full group-hover:scale-150 transition-all duration-500"></div>
//           <FaExclamationCircle className="text-orange-500 text-3xl mb-6 relative z-10"/>
//           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pending Disbursement</p>
//           <h2 className="text-4xl font-black text-slate-900 mt-2">₹{summary.pending.toLocaleString()}</h2>
//         </div>

//         <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden group">
//           <div className="absolute -right-4 -top-4 bg-emerald-50 h-24 w-24 rounded-full group-hover:scale-150 transition-all duration-500"></div>
//           <FaUsers className="text-emerald-500 text-3xl mb-6 relative z-10"/>
//           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Staff</p>
//           <h2 className="text-4xl font-black text-slate-900 mt-2">{summary.totalStaff}</h2>
//         </div>
//       </div>

//       {/* 📋 Staff Status Table */}
//       <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
//         <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
//           <div>
//             <h3 className="text-xl font-black text-slate-800">Staff Payroll Directory</h3>
//             <p className="text-slate-400 text-xs font-bold uppercase mt-1">Manage individual salary structures</p>
//           </div>
//           <button onClick={() => navigate('../salary-setup')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
//             Configure All
//           </button>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left">
//             <thead className="bg-white text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
//               <tr>
//                 <th className="p-8">Member</th>
//                 <th className="p-8">Structure</th>
//                 <th className="p-8">Current Status</th>
//                 <th className="p-8 text-right">Quick Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-50 font-bold">
//               {summary.staffList.map(staff => (
//                 <tr key={staff._id} className="hover:bg-slate-50/80 transition-all group">
//                   <td className="p-8">
//                     <p className="text-slate-900 uppercase text-sm">{staff.name}</p>
//                     <p className="text-[10px] text-slate-400 uppercase tracking-widest">{staff.department}</p>
//                   </td>
//                   <td className="p-8">
//                     {staff.hasStructure ? (
//                       <span className="text-indigo-600">₹{staff.monthlyGross.toLocaleString()}</span>
//                     ) : (
//                       <span className="text-slate-300 italic text-xs">Not Configured</span>
//                     )}
//                   </td>
//                   <td className="p-8">
//                     <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
//                       staff.payrollStatus === 'PAID' ? 'bg-emerald-100 text-emerald-600' :
//                       staff.payrollStatus === 'READY' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'
//                     }`}>
//                       {staff.payrollStatus}
//                     </span>
//                   </td>
//                   <td className="p-8 text-right">
//                     <button 
//                       onClick={() => navigate(staff.hasStructure ? `../salary-setup?id=${staff._id}` : '../salary-setup')}
//                       className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-900 transition-all"
//                     >
//                       {staff.hasStructure ? <FaTools /> : <FaArrowRight />}
//                       <span className="text-[10px] uppercase font-black tracking-widest">{staff.hasStructure ? 'Manage' : 'Setup'}</span>
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }



import { useEffect, useState } from "react";
import api from "../../../../services/api";
import { FaMoneyBillWave, FaUsers, FaExclamationCircle, FaArrowRight, FaCheckCircle, FaTools } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function AdminPayrollDashboard() {
  const [summary, setSummary] = useState({ paid: 0, pending: 0, totalStaff: 0, staffList: [], processedCount: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const resp = await api.get('/api/admin/payroll/summary');
        setSummary(resp.data || { paid: 0, pending: 0, totalStaff: 0, staffList: [] });
//         setSummary({
//   paid: resp.data?.paid || 0,
//   pending: resp.data?.pending || 0,
//   totalStaff: resp.data?.totalStaff || 0,
//   processedCount: resp.data?.processedCount || 0,
//   staffList: resp.data?.staffList || []   // 👈 IMPORTANT
// });

      } catch (err) {
        console.error("Summary fetch error", err);
      }
    };
    loadSummary();
  }, []);

  return (
    <div className=" space-y-10">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-4xl font-black text-slate-800 tracking-tight">Payroll Command Center</h1>
           <p className="text-slate-600 font-medium text-sm  mt-2">Real-time Financial Overview</p>
        </div>
        <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100">
           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Processing Progress</p>
           <div className="flex items-center gap-3 mt-1">
              <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-600" style={{ width: `${(summary.processedCount / summary.totalStaff) * 100}%` }}></div>
              </div>
              <span className="text-sm font-black text-indigo-700">{summary.processedCount}/{summary.totalStaff}</span>
           </div>
        </div>
      </div>
      
      {/* 📊 Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 bg-indigo-50 h-24 w-24 rounded-full group-hover:scale-150 transition-all duration-500"></div>
          <FaMoneyBillWave className="text-indigo-600 text-3xl mb-6 relative z-10"/>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Paid (Current Month)</p>
          <h2 className="text-4xl font-black text-slate-900 mt-2">₹{summary.paid.toLocaleString()}</h2>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 bg-orange-50 h-24 w-24 rounded-full group-hover:scale-150 transition-all duration-500"></div>
          <FaExclamationCircle className="text-orange-500 text-3xl mb-6 relative z-10"/>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pending Disbursement</p>
          <h2 className="text-4xl font-black text-slate-900 mt-2">₹{summary.pending.toLocaleString()}</h2>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 bg-emerald-50 h-24 w-24 rounded-full group-hover:scale-150 transition-all duration-500"></div>
          <FaUsers className="text-emerald-500 text-3xl mb-6 relative z-10"/>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Staff</p>
          <h2 className="text-4xl font-black text-slate-900 mt-2">{summary.totalStaff}</h2>
        </div>
      </div>

      {/* 📋 Staff Status Table */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800">Staff Payroll Directory</h3>
            <p className="text-slate-400 text-xs font-bold uppercase mt-1">Manage individual salary structures</p>
          </div>
          <button onClick={() => navigate('../salary-setup')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
            Configure All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
              <tr>
                <th className="p-8">Member</th>
                <th className="p-8">Structure</th>
                <th className="p-8">Current Status</th>
                <th className="p-8 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-bold">
              {summary.staffList.map(staff => (
                <tr key={staff._id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="p-8">
                    <p className="text-slate-900 uppercase text-sm">{staff.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{staff.department}</p>
                  </td>
                  <td className="p-8">
                    {staff.hasStructure ? (
                      <span className="text-indigo-600">₹{staff.monthlyGross.toLocaleString()}</span>
                    ) : (
                      <span className="text-slate-300 italic text-xs">Not Configured</span>
                    )}
                  </td>
                  <td className="p-8">
                    <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      staff.payrollStatus === 'PAID' ? 'bg-emerald-100 text-emerald-600' :
                      staff.payrollStatus === 'READY' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {staff.payrollStatus}
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    <button 
                      onClick={() => navigate(staff.hasStructure ? `../salary-setup?id=${staff._id}` : '../salary-setup')}
                      className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-900 transition-all"
                    >
                      {staff.hasStructure ? <FaTools /> : <FaArrowRight />}
                      <span className="text-[10px] uppercase font-black tracking-widest">{staff.hasStructure ? 'Manage' : 'Setup'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}