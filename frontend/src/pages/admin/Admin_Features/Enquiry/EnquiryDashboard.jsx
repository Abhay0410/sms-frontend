import React, { useState } from "react";
import { FaChartPie, FaList, FaTasks, FaPlus, FaPhoneAlt } from "react-icons/fa";
import EnquiryAnalyticsTab from "./EnquiryAnalyticsTab";
import EnquiryMasterTab from "./EnquiryMasterTab";
import ActionCenterTab from "./ActionCenterTab";
import NewEnquiryTab from "./NewEnquiryTab";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EnquiryDashboard() {
  const [activeTab, setActiveTab] = useState("analytics");

  const tabs = [
    { id: "analytics", label: "Analytics & Pipeline", icon: FaChartPie },
    { id: "all", label: "All Enquiries", icon: FaList },
    { id: "action", label: "Action Center", icon: FaTasks },
    { id: "new", label: "Add New", icon: FaPlus },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "analytics": return <EnquiryAnalyticsTab />;
      case "all": return <EnquiryMasterTab />;
      case "action": return <ActionCenterTab />;
      case "new": return <NewEnquiryTab />;
      default: return <EnquiryAnalyticsTab />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm border border-indigo-200">
            <FaPhoneAlt size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Enquiry & Lead Management
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-1">
              Track intent, manage follow-ups, and convert prospective admissions.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-2 ">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${isActive ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"}`}>
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <div className="mt-2">{renderTabContent()}</div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
}