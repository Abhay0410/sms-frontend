import React, { useState } from 'react';
import { FaBoxOpen, FaExchangeAlt, FaChartBar } from 'react-icons/fa';
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventory & Assets</h1>
          <p className="text-sm text-gray-500 mt-1">Manage school assets, consumables, and track stock allocations.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'master' && <ItemMasterTab />}
          {activeTab === 'allocations' && <AllocationsTab />}
          {activeTab === 'reports' && <InventoryReportsTab />}
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;