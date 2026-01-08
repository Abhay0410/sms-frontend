import React, { useState } from "react";
import api from "../../../../services/api";
import { toast } from "react-toastify";
import { FaMoneyBillWave, FaCog, FaCheckCircle } from "react-icons/fa";

export default function PayrollManager() {
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const handleGeneratePayroll = async () => {
    try {
      setLoading(true);
      // Backend: generateMonthlyPayroll logic
      await api.post('/api/admin/hr/payroll/generate', params);
      toast.success("Payroll drafted successfully for all active staff!");
    } catch (error) {
      toast.error(error.message || "Failed to generate payroll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner">
            <FaMoneyBillWave />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Payroll Engine</h2>
            <p className="text-slate-500 font-medium italic">Calculate salaries, deductions, and pension funds.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-[2rem] border border-slate-100">
          <select 
            value={params.month} 
            onChange={e => setParams({...params, month: e.target.value})}
            className="bg-transparent font-bold text-slate-700 outline-none px-4"
          >
            {Array.from({length: 12}, (_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', {month: 'long'})}</option>
            ))}
          </select>
          <button 
            onClick={handleGeneratePayroll}
            disabled={loading}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-50"
          >
            {loading ? "Calculating..." : "Run Payroll"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-5">
           <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><FaCog/></div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuration</p>
              <p className="font-bold text-slate-700 text-sm">Pension: 10% (Fixed)</p>
           </div>
        </div>
        {/* Yaha aap payroll list show kar sakte hain payment mark karne ke liye */}
      </div>
    </div>
  );
}