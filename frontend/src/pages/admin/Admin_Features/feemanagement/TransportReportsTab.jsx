import React, { useState, useEffect } from 'react';
import { FaChartBar, FaBus, FaGasPump, FaRoute, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';

const TransportReportsTab = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.ADMIN.TRANSPORT.REPORT);
      setReportData(response?.data?.report || response?.report || response || {});
    } catch (error) {
      toast.error(error.message || "Failed to load transport analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <FaSpinner className="animate-spin text-indigo-600 text-3xl mx-auto mb-4" />
        <p className="text-slate-500 font-medium">Analyzing transport data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6 pt-6 pb-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Transport Analytics</h2>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
            {(reportData?.vehicleStats || []).map((stat, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-800">{stat.registrationNumber}</td>
                <td className="p-4 text-slate-600 font-medium">{stat.tripCount || 0}</td>
                <td className="p-4 text-slate-600 font-medium">{stat.fuelVolume || 0} L</td>
                <td className="p-4 text-slate-600 font-medium">{stat.distance || 0} Km</td>
                <td className="p-4 font-bold text-indigo-600">{stat.mileage?.toFixed(1) || '0.0'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransportReportsTab;