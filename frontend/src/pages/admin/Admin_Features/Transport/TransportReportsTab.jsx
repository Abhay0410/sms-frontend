import React, { useState, useEffect } from 'react';
import { FaChartBar, FaBus, FaGasPump, FaRoute, FaSpinner, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" }, { value: 4, label: "April" },
  { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" },
  { value: 9, label: "September" }, { value: 10, label: "October" },
  { value: 11, label: "November" }, { value: 12, label: "December" }
];
const YEARS = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);

const TransportReportsTab = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchReport = async (isClear = false) => {
    try {
      setLoading(true);
      const queryParams = isClear ? "" : `?month=${selectedMonth}&year=${selectedYear}`;
      
      const response = await api.get(`${API_ENDPOINTS.ADMIN.TRANSPORT.REPORT}${queryParams}`);
      const fetchedData = response?.data?.data || response?.data || response;
      
      if (Array.isArray(fetchedData)) {
        const totalVehicles = fetchedData.length;
        const monthlyFuelCost = fetchedData.reduce((sum, v) => sum + (v.totalFuelCost || 0), 0);
        const totalDistance = fetchedData.reduce((sum, v) => sum + (v.totalDistanceKm || 0), 0);
        const totalFuel = fetchedData.reduce((sum, v) => sum + (v.totalFuelLiters || 0), 0);
        const avgEfficiency = totalFuel > 0 ? (totalDistance / totalFuel) : 0;
        
        setReportData({
          totalVehicles, monthlyFuelCost, totalDistance, avgEfficiency, vehicleStats: fetchedData
        });
      } else {
        setReportData(fetchedData || {});
      }
      setCurrentPage(1);
    } catch (error) {
      toast.error(error.message || "Failed to load transport analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleClearFilters = () => {
    setSelectedMonth(new Date().getMonth() + 1);
    setSelectedYear(new Date().getFullYear());
    fetchReport(true);
  };

  const statsArray = reportData?.vehicleStats || [];
  const totalPages = Math.ceil(statsArray.length / itemsPerPage);
  const paginatedStats = statsArray.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  if (loading) {
    return (
      <div className="p-12 text-center">
        <FaSpinner className="animate-spin text-indigo-600 text-3xl mx-auto mb-4" />
        <p className="text-slate-500 font-medium">Analyzing transport data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FaChartBar size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Transport Analytics</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Analyze fleet efficiency and costs</p>
          </div>
        </div>
      </div>

      {/* Report Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-300 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <FaFilter className="text-slate-400" />
            <span className="text-sm font-bold text-slate-600 hidden sm:inline">Report Month:</span>
          </div>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer">
            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer">
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            onClick={() => fetchReport(false)}
            className="px-5 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-all shadow-sm"
          >
            Update Report
          </button>
          <button
            onClick={handleClearFilters}
            className="px-5 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold text-sm transition-all"
          >
            All Time
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl">
            <FaBus />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Vehicles</p>
            <p className="text-2xl font-bold text-slate-800">{reportData?.totalVehicles || 0}</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xl">
            <FaGasPump />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Monthly Fuel Cost</p>
            <p className="text-2xl font-bold text-slate-800">₹{reportData?.monthlyFuelCost?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xl">
            <FaRoute />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Distance Logged</p>
            <p className="text-2xl font-bold text-slate-800">{reportData?.totalDistance || 0} Km</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xl">
            <FaChartBar />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Avg Fleet Efficiency</p>
            <p className="text-2xl font-bold text-slate-800">{reportData?.avgEfficiency?.toFixed(1) || 0} Km/L</p>
          </div>
        </div>
      </div>

      {/* Aggregated Table View */}
      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800">Vehicle Efficiency Breakdown</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-white border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Trips</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fuel Consumed</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Distance Covered</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mileage (Km/L)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedStats.map((stat, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-800">{stat.registrationNumber}</td>
                <td className="p-4 text-slate-600 font-medium">{stat.totalTrips || 0}</td>
                <td className="p-4 text-slate-600 font-medium">{stat.totalFuelLiters || 0} L</td>
                <td className="p-4 text-slate-600 font-medium">{stat.totalDistanceKm || 0} Km</td>
                <td className="p-4 font-bold text-indigo-600">{stat.efficiencyKmPerLiter?.toFixed(1) || '0.0'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600 font-medium">
              Showing page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm transition-all duration-300"
              >
                ← Previous
              </button>
              <div className="flex items-center gap-1 sm:flex">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                  if (pageNum > totalPages || pageNum < 1) return null;
                  return (
                    <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-all duration-300 border ${currentPage === pageNum ? "bg-amber-500 text-white border-amber-500 shadow-sm" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"}`}>
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm transition-all duration-300"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportReportsTab;