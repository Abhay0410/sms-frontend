import React, { useState } from 'react';
import { FaChartPie, FaList, FaTags, FaWallet } from 'react-icons/fa';
import ExpenseOverviewTab from './ExpenseOverviewTab';
import ExpenseCategoriesTab from './ExpenseCategoriesTab';
import ExpenseLedgerTab from './ExpenseLedgerTab';

const ExpenseDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartPie },
    { id: 'ledger', label: 'Ledger', icon: FaList },
    { id: 'categories', label: 'Categories', icon: FaTags },
  ];

  return (
    <div className="  space-y-8 0 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-indigo-200">
            <FaWallet size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Financial Ledger</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Manage school expenses and automatically track payroll, transport, and inventory flows.</p>
          </div>
        </div>
      </div>

      <div className="bg-white    rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-black border-indigo-600 bg-white font-bold'
                  : 'text-white'
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <ExpenseOverviewTab />}
          {activeTab === 'ledger' && <ExpenseLedgerTab />}
          {activeTab === 'categories' && <ExpenseCategoriesTab />}
        </div>
      </div>
    </div>
  );
};

export default ExpenseDashboard;