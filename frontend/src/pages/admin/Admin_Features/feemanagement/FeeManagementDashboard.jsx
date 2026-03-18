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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Fee Management</h2>
            <p className="mt-1 text-sm text-slate-500 flex items-center gap-2">
              <FaDollarSign className="text-purple-600" />
              Manage class fees, payments, and receipts
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-400 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Session:
            </span>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="bg-transparent border-none text-slate-900 text-sm font-bold focus:ring-0 cursor-pointer outline-none p-0 pr-4"
            >
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 border-b border-slate-400">
          <nav className="-mb-px flex gap-x-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 border-b-2 font-semibold text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-indigo-600 hover:border-slate-400"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Active Tab Content */}
        <div className="mt-6">
          {ActiveComponent && <ActiveComponent academicYear={academicYear} />}
        </div>
      </div>
    </div>
  );
}