import React, { useState, useEffect } from 'react';
import { FaPlus, FaGasPump, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';

const FuelLogsTab = () => {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFuelLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.ADMIN.TRANSPORT.FUEL);
      setFuelLogs(response?.data?.logs || response?.logs || response || []);
    } catch (error) {
      toast.error(error.message || "Failed to load fuel logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex justify-between items-center px-6 pt-6">
        <h2 className="text-xl font-bold text-slate-800">Fuel Logs</h2>
        <button 
          onClick={() => { toast.info("Add Fuel Log Modal coming soon!"); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm"
        >
          <FaPlus /> Add Fuel Log
        </button>
      </div>

      {/* Table Area */}
      <div className="mx-6 mb-6">
        {loading ? (
          <div className="p-12 text-center bg-slate-50 rounded-xl border border-slate-200">
            <FaSpinner className="animate-spin text-indigo-600 text-3xl mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Loading fuel records...</p>
          </div>
        ) : fuelLogs.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left bg-white border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Volume (Liters)</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Cost</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Current Odometer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fuelLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-700 font-medium">
                      {new Date(log.date || log.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {log.vehicle?.registrationNumber || log.vehicle?.regNo || 'N/A'}
                    </td>
                    <td className="p-4 text-emerald-600 font-bold">{log.liters || log.volume} L</td>
                    <td className="p-4 text-slate-700 font-medium">₹{log.totalCost?.toFixed(2) || '0.00'}</td>
                    <td className="p-4 text-slate-600 font-medium">{log.odometer || 'N/A'} Km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center bg-slate-50 rounded-xl border border-slate-200">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
              <FaGasPump className="text-2xl text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No Fuel Logs Found</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">Track diesel entries and fuel costs by adding your first log.</p>
            <button 
               onClick={() => { toast.info("Add Fuel Log Modal coming soon!"); }}
               className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm"
            >
              <FaPlus /> Add First Fuel Log
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuelLogsTab;
