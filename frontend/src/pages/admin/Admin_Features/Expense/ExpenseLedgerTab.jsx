import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaSpinner, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';
import ManualExpenseModal from './ManualExpenseModal';

const ExpenseLedgerTab = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [timeframe, setTimeframe] = useState('ALL_TIME');

  useEffect(() => {
    fetchExpenses();
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

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await api.get(`${API_ENDPOINTS.ADMIN.EXPENSE.BASE}${queryString}`);
      setExpenses(res.data?.data || res.data || []);
      setCurrentPage(1); // Reset page on new data
    } catch (error) {
      if (error?.response?.status !== 404) {
        toast.error('Failed to fetch ledger details');
      }
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense entry?')) return;
    try {
      await api.delete(API_ENDPOINTS.ADMIN.EXPENSE.DELETE(id));
      toast.success('Expense deleted successfully');
      fetchExpenses();
    } catch {
      toast.error('Failed to delete expense');
    }
  };

  const getSourceBadge = (source) => {
    switch(source) {
      case 'MANUAL': return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'PAYROLL': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'TRANSPORT_FUEL': return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'INVENTORY_PURCHASE': return 'bg-green-100 text-green-700 border border-green-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredExpenses = expenses.filter(expense => 
    (expense.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (expense.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (expense.source || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <h3 className="text-xl font-bold text-slate-800 shrink-0 tracking-tight">Master Ledger</h3>
        
        <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto flex-wrap justify-end">
          <div className="relative w-full md:w-64 shrink-0">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search expenses, source, category..." 
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm"
            />
          </div>

          <select 
            value={timeframe} 
            onChange={handleTimeframeChange}
            className="w-full md:w-auto px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm font-medium text-gray-700 cursor-pointer shrink-0"
          >
            <option value="ALL_TIME">All Time</option>
            <option value="TODAY">Today</option>
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="THIS_YEAR">This Year</option>
            <option value="CUSTOM">Custom Date Range</option>
          </select>

          {timeframe === 'CUSTOM' && (
            <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto animate-fade-in shrink-0">
              <input 
                type="date" 
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full md:w-auto px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm font-medium text-gray-600 cursor-pointer"
              />
              <span className="text-gray-400 text-sm font-medium hidden md:block">to</span>
              <input 
                type="date" 
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full md:w-auto px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm font-medium text-gray-600 cursor-pointer"
              />
            </div>
          )}

          <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md text-sm font-bold w-full md:w-auto shrink-0">
            <FaPlus /> Add Manual Expense
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><FaSpinner className="animate-spin text-indigo-600 text-2xl" /></div>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description / Detail</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedExpenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                     <p className="text-sm font-bold text-gray-800">{expense.description || '-'}</p>
                     <p className="text-xs text-gray-500 mt-1">Via: {expense.paymentMode || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{expense.category?.name || 'Uncategorized'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap ${getSourceBadge(expense.source)}`}>
                      {expense.source?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-red-600 whitespace-nowrap">₹ {expense.amount?.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    {expense.source === 'MANUAL' ? (
                      <button onClick={() => handleDelete(expense._id)} className="text-red-500 hover:text-red-700 transition-colors p-2" title="Delete Entry">
                        <FaTrash />
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs italic" title="System generated expenses cannot be manually deleted">Auto</span>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedExpenses.length === 0 && !loading && (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No expenses match your search.</td></tr>
              )}
            </tbody>
          </table>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <span className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} entries
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm font-medium text-gray-700 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ManualExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchExpenses}
      />
    </div>
  );
};
export default ExpenseLedgerTab;