import { useState, useMemo } from "react";

import FeeOverview from "./FeeOverview";
import SetClassFees from "./SetClassFees";
import RecordPayment from "./RecordPayment";
import PaymentHistory from "./PaymentHistory";
import {
  FaDollarSign,
  FaChartLine,
  FaEdit,
  FaPlus,
  FaEye,
  FaCalendarAlt,
} from "react-icons/fa";

export default function FeeManagementDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // ClassManagement वाले जैसा academic years array
  const academicYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -1; i < 6; i++) {
      const year = currentYear + i;
      years.push(`${year}-${year + 1}`);
    }
    return years;
  }, []);

  // Get current academic year (ClassManagement वाले function जैसा)
  function getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return month >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  }

  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());

  const tabs = [
    { id: "overview", label: "Overview", icon: <FaChartLine />, component: FeeOverview },
    { id: "record", label: "Record Payment", icon: <FaPlus />, component: RecordPayment },
    { id: "history", label: "Payment History", icon: <FaEye />, component: PaymentHistory },
    { id: "set-fees", label: "Set Class Fees", icon: <FaEdit />, component: SetClassFees },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Fee Management</h2>
            <p className="mt-2 text-slate-600 flex items-center gap-2">
              <FaDollarSign className="text-purple-600" />
              Manage class fees, payments, and receipts
            </p>
          </div>

          {/* Academic Year Selector - UPDATED (ClassManagement वाले जैसा) */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <FaCalendarAlt className="text-purple-600" />
              <span className="text-sm font-bold text-slate-600">Academic Year</span>
            </div>
            
            <div className="relative">
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="
                  rounded-2xl 
                  border-2 
                  border-slate-100 
                  bg-white 
                  pl-5 
                  pr-10 
                  py-3 
                  font-bold 
                  text-slate-700 
                  outline-none 
                  focus:ring-2 
                  focus:ring-purple-500/20 
                  focus:border-purple-500
                  hover:border-slate-300
                  transition-all
                  shadow-sm
                  appearance-none
                  cursor-pointer
                  min-w-[180px]
                "
              >
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              {/* Custom dropdown arrow */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg 
                  className="w-5 h-5 text-slate-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Selected year indicator */}
            <div className="mt-2 text-xs text-slate-500">
              <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-md">
                Selected: {academicYear}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                  : "bg-white text-slate-700 border-2 border-slate-200 hover:border-purple-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Tab Content */}
        <div className="mt-8">
          {ActiveComponent && <ActiveComponent academicYear={academicYear} />}
        </div>
      </div>
    </div>
  );
}