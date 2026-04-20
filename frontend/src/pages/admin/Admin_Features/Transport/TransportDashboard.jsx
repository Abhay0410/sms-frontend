import React, { useState } from 'react';

import VehicleManagementTab from './VehicleManagementTab';
import StaffManagementTab from './StaffManagementTab';
import FuelLogsTab from './FuelLogsTab';
import TripLogsTab from './TripLogsTab';
import TransportReportsTab from './TransportReportsTab';

const TransportDashboard = () => {
  const [activeTab, setActiveTab] = useState('vehicles');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vehicles':
        return <VehicleManagementTab />;
      case 'staff':
        return <StaffManagementTab />;
      case 'fuel':
        return <FuelLogsTab />;
      case 'trips':
        return <TripLogsTab />;
      case 'reports':
        return <TransportReportsTab />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'staff', label: 'Transport Staff' },
    { id: 'fuel', label: 'Fuel Logs' },
    { id: 'trips', label: 'Trip Logs' },
    { id: 'reports', label: 'Reports' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transport Management</h1>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-6 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Rendering Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default TransportDashboard;