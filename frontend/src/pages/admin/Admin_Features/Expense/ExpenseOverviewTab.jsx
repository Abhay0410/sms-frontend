import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaSpinner, FaMoneyBillWave } from 'react-icons/fa';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#3B82F6'];

const ExpenseOverviewTab = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [timeframe, setTimeframe] = useState('ALL_TIME');

  useEffect(() => {
    fetchSummary();
  }, [dateRange.startDate, dateRange.endDate]);

  const handleTimeframeChange = (e) => {
    const value = e.target.value;
    setTimeframe(value);

    const today = new Date();
    let start = '';
    let end = '';

    if (value === 'TODAY') {
      start = today.toISOString().split('T')[0];
      end = today.toISOString().split('T')[0];
    } else if (value === 'LAST_7_DAYS') {
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 6);
      start = lastWeek.toISOString().split('T')[0];
      end = today.toISOString().split('T')[0];
    } else if (value === 'THIS_MONTH') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      start = firstDay.toISOString().split('T')[0];
      end = today.toISOString().split('T')[0];
    } else if (value === 'THIS_YEAR') {
      const firstDay = new Date(today.getFullYear(), 0, 1);
      start = firstDay.toISOString().split('T')[0];
      end = today.toISOString().split('T')[0];
    }

    if (value !== 'CUSTOM') {
      setDateRange({ startDate: start, endDate: end });
    }
  };

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await api.get(`${API_ENDPOINTS.ADMIN.EXPENSE.SUMMARY}${queryString}`);
      setSummary(res.data?.data || res.data || []);
    } catch (error) {
      if (error?.response?.status !== 404) {
        toast.error('Failed to fetch financial summary');
      }
      setSummary([]);
    } finally {
      setLoading(false);
    }
  };

  // Keep rendering UI during subsequent re-fetches (just show small spinner)
  if (loading && !summary) {
    return (
      <div className="flex justify-center p-12">
        <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
      </div>
    );
  }

  let rawData = [];
  let totalExpenditure = 0;

  if (Array.isArray(summary)) {
    rawData = summary;
  } else if (summary && typeof summary === 'object') {
    // Extract new backend field
    totalExpenditure = summary.totalExpenditure ?? summary.totalExpense ?? 0;

    // Check for common array keys in the summary object
    const arrayData = summary.byCategory || summary.categories || summary.expenses || summary.data || summary.distribution;
    if (Array.isArray(arrayData)) {
      rawData = arrayData;
    } else {
      // Fallback: Map numeric properties as the distribution, ignoring total sums
      rawData = Object.keys(summary)
        .filter(key => typeof summary[key] === 'number' && !key.toLowerCase().includes('total'))
        .map(key => ({ name: key, value: summary[key] }));
    }
  }

  // Ensure formatted properties 'name' and 'value' exist for Recharts
  const chartData = rawData.map(item => {
    const name = item.name || item.category?.name || item.categoryName || item._id?.name || item._id || item.source || 'Unknown';
    const value = item.value ?? item.total ?? item.amount ?? item.totalAmount ?? 0;
    return { name: String(name), value: Number(value) };
  }).filter(item => item.value > 0);

  // Calculate fallback if backend hasn't calculated the root field
  if (!totalExpenditure) {
    totalExpenditure = chartData.reduce((sum, item) => sum + item.value, 0);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Date Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white tracking-tight">Financial Overview</h3>
          {loading && summary && <FaSpinner className="animate-spin text-indigo-600" />}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <select 
            value={timeframe} 
            onChange={handleTimeframeChange}
            className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm font-medium text-gray-700 cursor-pointer"
          >
            <option value="ALL_TIME">All Time</option>
            <option value="TODAY">Today</option>
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="THIS_YEAR">This Year</option>
            <option value="CUSTOM">Custom Date Range</option>
          </select>

          {timeframe === 'CUSTOM' && (
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto animate-fade-in">
              <input 
                type="date" 
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm font-medium text-gray-600 cursor-pointer"
              />
              <span className="text-gray-400 text-sm font-medium hidden sm:block">to</span>
              <input 
                type="date" 
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm font-medium text-gray-600 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI Highlight Card */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Total Expenditure</p>
          <h3 className="text-4xl font-bold text-rose-600 mt-2">
            ₹ {totalExpenditure.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Total recorded across all categories</p>
        </div>
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-full shadow-sm">
          <FaMoneyBillWave className="text-rose-500 text-3xl" />
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="grid grid-cols-1 gap-6">
        {/* Pie Chart (Distribution) */}
        <div className="bg-white p-8 border border-slate-200 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Expenses Distribution</h3>
          {chartData.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 h-80 flex items-center justify-center text-center text-gray-500">No distribution data available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseOverviewTab;