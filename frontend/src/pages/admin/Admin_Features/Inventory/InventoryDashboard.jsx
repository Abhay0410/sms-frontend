import React, { useState } from 'react';
import { FaBoxOpen, FaExchangeAlt, FaChartBar , FaBoxes} from 'react-icons/fa';
import ItemMasterTab from './ItemMasterTab';
import AllocationsTab from './AllocationsTab';
import InventoryReportsTab from './InventoryReportsTab';

const InventoryDashboard = () => {
  const [activeTab, setActiveTab] = useState('master');

  const tabs = [
    { id: 'master', label: 'Item Master', icon: FaBoxOpen },
    { id: 'allocations', label: 'Allocations & Issues', icon: FaExchangeAlt },
    { id: 'reports', label: 'Reports', icon: FaChartBar },
  ];

  return (
  <div className="min-h-screen ">
    <div className="mx-auto max-w-7xl">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">

        <div className="flex items-center gap-4">

          <div className="h-14 w-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <FaBoxes className="text-indigo-600 text-2xl" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Inventory & Assets
            </h1>

            <div className="flex items-center gap-2 mt-1">
              <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full"></span>

              <p className="text-sm text-slate-500 font-medium">
                Asset Tracking & Inventory Management
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Main Container */}
      <div className="bg-slate-800 text-white  rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="flex flex-wrap border-b  border-slate-200 bg-slate-700">

          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all  ${
                activeTab === tab.id
                  ? "text-black  bg-white"
                  : "text-white border-transparent "
              }`}
            >
              <tab.icon className="text-base" />

              {tab.label}
            </button>
          ))}

        </div>

        {/* Content */}
        <div className="p-6  text-white">

          {activeTab === "master" && (
            <ItemMasterTab />
          )}

          {activeTab === "allocations" && (
            <AllocationsTab />
          )}

          {activeTab === "reports" && (
            <InventoryReportsTab />
          )}

        </div>

      </div>
    </div>
  </div>
);
};

export default InventoryDashboard;