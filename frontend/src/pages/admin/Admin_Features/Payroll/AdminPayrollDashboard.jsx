import { useEffect, useState } from "react";
import api from "../../../../services/api";
import { FaMoneyBillWave, FaUsers, FaExclamationCircle } from "react-icons/fa";

export default function AdminPayrollDashboard() { // ✅ Removed unused school prop
  const [summary, setSummary] = useState({ paid: 0, pending: 0, totalStaff: 0 });

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const resp = await api.get('/api/admin/payroll/summary');
        setSummary(resp.data || { paid: 0, pending: 0, totalStaff: 0 });
      } catch (err) {
        console.error("Summary fetch error", err);
      }
    };
    loadSummary();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-black text-slate-800 tracking-tight">Payroll Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-l-8 border-indigo-600">
          <div className="flex items-center gap-4">
             <FaMoneyBillWave className="text-indigo-600 text-2xl"/>
             <p className="text-xs font-bold text-slate-400 uppercase">Paid this Month</p>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mt-4">₹{summary.paid.toLocaleString()}</h2>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-l-8 border-orange-500">
          <div className="flex items-center gap-4">
             <FaExclamationCircle className="text-orange-500 text-2xl"/>
             <p className="text-xs font-bold text-slate-400 uppercase">Pending Disbursement</p>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mt-4">₹{summary.pending.toLocaleString()}</h2>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-l-8 border-emerald-500">
          <div className="flex items-center gap-4">
             <FaUsers className="text-emerald-500 text-2xl"/>
             <p className="text-xs font-bold text-slate-400 uppercase">Total Employees</p>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mt-4">{summary.totalStaff}</h2>
        </div>
      </div>
    </div>
  );
}