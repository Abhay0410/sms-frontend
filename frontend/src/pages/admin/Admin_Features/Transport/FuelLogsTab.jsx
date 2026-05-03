import React, { useState, useEffect } from 'react';
import { FaPlus, FaGasPump, FaSpinner, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';
import FuelLogModal from './FuelLogModal';

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" }, { value: 4, label: "April" },
  { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" },
  { value: 9, label: "September" }, { value: 10, label: "October" },
  { value: 11, label: "November" }, { value: 12, label: "December" }
];
const YEARS = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);

const FuelLogsTab = () => {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters & Pagination State
  const [filterMode, setFilterMode] = useState('month'); // 'date' or 'month'
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchFuelLogs = async (isClear = false) => {
    try {
      setLoading(true);
      let queryParams = "";

      if (!isClear) {
        let startDate = "";
        let endDate = "";
        if (filterMode === 'date' && selectedDate) {
          const dateObj = new Date(selectedDate);
          startDate = new Date(dateObj.setHours(0, 0, 0, 0)).toISOString();
          endDate = new Date(dateObj.setHours(23, 59, 59, 999)).toISOString();
        } else if (filterMode === 'month' && selectedMonth && selectedYear) {
          startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString();
          endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999).toISOString();
        }
        if (startDate && endDate) {
          queryParams = `?startDate=${startDate}&endDate=${endDate}`;
        }
      }

      const response = await api.get(`${API_ENDPOINTS.ADMIN.TRANSPORT.FUEL}${queryParams}`);
      const fetchedData = response?.data?.data || response?.data || response;
      setFuelLogs(Array.isArray(fetchedData) ? fetchedData : []);
      setCurrentPage(1);
    } catch (error) {
      toast.error(error.message || "Failed to load fuel logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelLogs();
  }, []);

  const handleClearFilters = () => {
    setFilterMode('month');
    setSelectedDate('');
    setSelectedMonth(new Date().getMonth() + 1);
    setSelectedYear(new Date().getFullYear());
    fetchFuelLogs(true);
  };

  const totalPages = Math.ceil(fuelLogs.length / itemsPerPage);
  const paginatedLogs = fuelLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FaGasPump size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fuel Logs</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Track diesel entries and fuel costs</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-md hover:shadow-lg"
        >
          <FaPlus /> Add Fuel Log
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-300 mb-6 transition-all duration-300 hover:shadow-md">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <FaFilter className="text-slate-400" />
              <span className="text-sm font-bold text-slate-600 hidden sm:inline">Filter By:</span>
            </div>

            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="month">Month & Year</option>
              <option value="date">Specific Date</option>
            </select>

            {filterMode === 'date' ? (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              />
            ) : (
              <>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer">
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer">
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </>
            )}

            <button
              onClick={() => fetchFuelLogs(false)}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-sm"
            >
              Apply Filter
            </button>
            <button
              onClick={handleClearFilters}
              className="px-5 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold text-sm transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="mb-6">
        {loading ? (
          <div className="p-12 text-center bg-slate-50 rounded-xl border border-slate-200">
            <FaSpinner className="animate-spin text-indigo-600 text-3xl mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Loading fuel records...</p>
          </div>
        ) : fuelLogs.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left bg-white border-collapse">
              <thead className="bg-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-white uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-bold text-white uppercase tracking-wider">Vehicle</th>
                  <th className="p-4 text-xs font-bold text-white uppercase tracking-wider">Volume (Liters)</th>
                  <th className="p-4 text-xs font-bold text-white uppercase tracking-wider">Total Cost</th>
                  <th className="p-4 text-xs font-bold text-white uppercase tracking-wider">Current Odometer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-700 font-medium">
                      {new Date(log.date || log.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {log.vehicle?.registrationNumber || log.vehicle?.regNo || 'N/A'}
                    </td>
                    <td className="p-4 text-emerald-600 font-bold">{log.quantityLiters || log.liters || log.volume} L</td>
                    <td className="p-4 text-slate-700 font-medium">₹{log.totalCost?.toFixed(2) || '0.00'}</td>
                    <td className="p-4 text-slate-600 font-medium">{log.odometerReading || log.odometer || 'N/A'} Km</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-5 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-600 font-medium">
                  Showing page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm transition-all duration-300"
                  >
                    ← Previous
                  </button>
                  <div className="flex items-center gap-1 hidden sm:flex">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                      if (pageNum > totalPages || pageNum < 1) return null;
                      return (
                        <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-all duration-300 ${currentPage === pageNum ? "bg-indigo-700 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm transition-all duration-300"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-16 text-center bg-slate-50 rounded-xl border border-slate-200">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
              <FaGasPump className="text-2xl text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No Fuel Logs Found</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">Track diesel entries and fuel costs by adding your first log.</p>
            <button 
               onClick={() => setIsModalOpen(true)}
               className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm"
            >
              <FaPlus /> Add First Fuel Log
            </button>
          </div>
        )}
      </div>

      <FuelLogModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchFuelLogs} 
      />
    </div>
  );
};

export default FuelLogsTab;