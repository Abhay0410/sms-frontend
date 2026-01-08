import React, { useEffect, useState } from "react";
import api from "../../../../services/api";
import { FaMoneyCheckAlt, FaDownload, FaReceipt } from "react-icons/fa";

export default function SalaryStatus() {
  const [salaries, setSalaries] = useState([]);

  useEffect(() => {
    const fetchSalary = async () => {
      const response = await api.get('/api/teacher/hr/payroll/my');
      setSalaries(response.data);
    };
    fetchSalary();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex justify-between items-center shadow-2xl">
        <div>
          <h2 className="text-4xl font-black tracking-tight">Earnings Hub</h2>
          <p className="text-slate-400 font-medium mt-1">View and download your monthly pay-slips.</p>
        </div>
        <FaMoneyCheckAlt size={50} className="text-emerald-500 opacity-50" />
      </div>

      <div className="grid gap-6">
        {salaries.map((item) => (
          <div key={item._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group hover:shadow-xl transition-all">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-2xl font-black">
                {item.month}/{item.year.toString().slice(-2)}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Payable</p>
                <h3 className="text-3xl font-black text-slate-900">₹{item.netSalary}</h3>
              </div>
            </div>

            <div className="flex gap-10 text-sm">
              <div className="text-center">
                <p className="text-slate-400 font-bold uppercase text-[10px]">Deductions</p>
                <p className="font-black text-rose-500">-₹{item.totalDeductions || (item.pensionContribution + item.unpaidLeaveDeduction)}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 font-bold uppercase text-[10px]">Status</p>
                <span className="px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full font-black text-[10px]">{item.status}</span>
              </div>
            </div>

            <button className="p-5 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
              <FaDownload />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SalarySlipModal({ payroll, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-[3rem] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight">Pay Advice</h3>
            <p className="text-emerald-500 text-xs font-bold uppercase mt-1">Month: {payroll.month}/{payroll.year}</p>
          </div>
          <FaReceipt size={30} className="opacity-20" />
        </div>

        <div className="p-10 space-y-8">
          {/* Earnings vs Deductions Grid */}
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b pb-2">Earnings</h4>
              <div className="flex justify-between text-sm"><span className="text-slate-600 font-medium">Basic Salary</span><span className="font-black text-slate-900">₹{payroll.baseSalary}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600 font-medium">Allowances</span><span className="font-black text-slate-900">₹{payroll.allowances}</span></div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b pb-2">Deductions</h4>
              <div className="flex justify-between text-sm"><span className="text-slate-600 font-medium">Pension Fund (10%)</span><span className="font-black text-rose-500">-₹{payroll.pensionContribution}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600 font-medium">Unpaid Leaves</span><span className="font-black text-rose-500">-₹{payroll.unpaidLeaveDeduction}</span></div>
            </div>
          </div>

          {/* Final Calculation */}
          <div className="bg-slate-50 p-8 rounded-[2rem] flex justify-between items-center border border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Net Amount Credited</p>
              <h2 className="text-4xl font-black text-slate-900 mt-1">₹{payroll.netSalary}</h2>
            </div>
            <div className="text-right">
               <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full uppercase tracking-tighter">{payroll.status}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 py-4 font-black text-slate-400 uppercase text-xs">Close</button>
            <button className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all">
              <FaDownload /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}