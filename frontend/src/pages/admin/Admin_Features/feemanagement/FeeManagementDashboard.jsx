// pages/admin/FeeManagementDashboard.jsx
import { useState } from "react";

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
} from "react-icons/fa";
import { usePersistedState } from "../../../../hooks/usePersistedState";

export default function FeeManagementDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [academicYear, setAcademicYear] = usePersistedState("selectedAcademicYear", "2024-2025");

  const tabs = [
    { id: "overview", label: "Overview", icon: <FaChartLine />, component: FeeOverview },
    { id: "set-fees", label: "Set Class Fees", icon: <FaEdit />, component: SetClassFees },
    { id: "record", label: "Record Payment", icon: <FaPlus />, component: RecordPayment },
    { id: "history", label: "Payment History", icon: <FaEye />, component: PaymentHistory },
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

          {/* Academic Year Selector */}
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="rounded-xl border-2 border-slate-200 bg-white px-6 py-3 font-semibold focus:border-purple-500 focus:outline-none"
          >
            <option value="2024-2025">2024-25</option>
            <option value="2025-2026">2025-26</option>
            <option value="2023-2024">2023-24</option>
          </select>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
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