import React, { useState, useEffect } from 'react';
import { FaExchangeAlt, FaPlus, FaSpinner, FaUndo, FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';
import IssueItemModal from './IssueItemModal';
import AssetReturnModal from './AssetReturnModal';
import AssetDamageModal from './AssetDamageModal';

const AllocationsTab = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [returnIssue, setReturnIssue] = useState(null);
  const [damageIssue, setDamageIssue] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [timeframe, setTimeframe] = useState('ALL_TIME');

  useEffect(() => {
    fetchIssues();
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

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await api.get(`${API_ENDPOINTS.ADMIN.INVENTORY.ISSUES}${queryString}`);
      setIssues(res.data?.data || res.data || []);
      setCurrentPage(1); // Reset page on new data
    } catch {
      toast.error('Failed to fetch allocations log');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ISSUED':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'CONSUMED':
        return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'RETURNED':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'DAMAGED':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredIssues = issues.filter(issue => 
    (issue.item?.itemName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (issue.issuedToRef || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
  const paginatedIssues = filteredIssues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <h3 className="text-xl font-bold text-slate-800 shrink-0 tracking-tight">Allocations & Issue Log</h3>
        
        <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto flex-wrap justify-end">
          <div className="relative w-full md:w-64 shrink-0">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search items, recipients, status..." 
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
            <FaPlus /> Issue Item
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-indigo-600 text-3xl" /></div>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Item Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Qty</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Issued To</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Notes</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedIssues.map((issue) => (
                <tr key={issue._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{new Date(issue.issueDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-gray-800 text-sm">{issue.item?.itemName || 'Unknown Item'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">{issue.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{issue.issuedToRef || 'N/A'}</td>
                  <td className="px-6 py-4 text-xs text-gray-500 font-medium">{issue.issuedToType}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusBadge(issue.status)}`}>
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 max-w-[200px] truncate" title={issue.allocationDetails?.serialNumbers?.join(', ')}>
                    {issue.item?.itemType === 'ASSET' && issue.allocationDetails?.serialNumbers ? `SN: ${issue.allocationDetails.serialNumbers.join(', ')}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {issue.status === 'ISSUED' && issue.item?.itemType === 'ASSET' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setReturnIssue(issue)} className="px-2.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border border-green-200" title="Mark as Returned">
                          <FaUndo size={12} /> Return
                        </button>
                        <button onClick={() => setDamageIssue(issue)} className="px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border border-red-200" title="Report Damaged">
                          <FaExclamationTriangle size={12} /> Damaged
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedIssues.length === 0 && !loading && (
                <tr><td colSpan="8" className="px-6 py-12 text-center text-gray-500">No allocations match your search criteria.</td></tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <span className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredIssues.length)} of {filteredIssues.length} entries
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
      <IssueItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchIssues} />
      <AssetReturnModal issue={returnIssue} onClose={() => setReturnIssue(null)} onSuccess={fetchIssues} />
      <AssetDamageModal issue={damageIssue} onClose={() => setDamageIssue(null)} onSuccess={fetchIssues} />
    </div>
  );
};
export default AllocationsTab;