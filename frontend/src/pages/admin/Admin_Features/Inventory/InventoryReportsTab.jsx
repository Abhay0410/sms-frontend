import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaChartBar, FaSpinner } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';

const InventoryReportsTab = () => {
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [consumptionData, setConsumptionData] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Fetch master items to calculate low stock alerts
      const itemsRes = await api.get(API_ENDPOINTS.ADMIN.INVENTORY.ITEMS);
      const items = itemsRes.data?.data || itemsRes.data || [];
      
      const alerts = items.filter(
        (item) => item.inStorage <= (item.minimumStockLevel || 0)
      );
      setLowStockItems(alerts);

      // Fetch consumption analytics
      const consumptionRes = await api.get(API_ENDPOINTS.ADMIN.INVENTORY.CONSUMPTION_REPORT);
      const rawData = consumptionRes.data?.data || consumptionRes.data || [];
      
      // Format aggregation for Recharts (assuming backend groups by entity/ref and sums quantity)
      const formattedData = rawData.map(d => ({
        name: d._id || d.issuedToRef || 'Unknown Entity',
        consumed: d.totalConsumed || d.quantity || 0
      }));
      
      setConsumptionData(formattedData);
    } catch (error) {
      toast.error('Failed to load inventory reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-indigo-600 text-3xl" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Low Stock Alerts Panel */}
      <div className="bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-red-50 border-b border-red-200 px-6 py-4 flex items-center gap-3">
          <FaExclamationTriangle className="text-red-500 text-xl" />
          <h3 className="text-lg font-bold text-red-800">Low Stock Alerts</h3>
        </div>
        <div className="p-6">
          {lowStockItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.map(item => (
                <div key={item._id} className="p-4 rounded-lg border border-red-100 bg-red-50/50 flex justify-between items-center">
                  <div className="truncate mr-3">
                    <h4 className="font-bold text-gray-800 text-sm truncate" title={item.itemName}>{item.itemName}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-red-600">{item.inStorage}</p>
                    <p className="text-[10px] text-red-400 uppercase font-bold tracking-wider">Min: {item.minimumStockLevel || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-green-600 font-medium">All items are sufficiently stocked.</p>
          )}
        </div>
      </div>

      {/* Consumption Analytics Chart */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center gap-3">
          <FaChartBar className="text-indigo-500 text-xl" />
          <h3 className="text-lg font-bold text-gray-800">Consumption Analytics</h3>
        </div>
        <div className="p-6">
          {consumptionData.length > 0 ? (<div className="h-80 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={consumptionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} /><Legend /><Bar dataKey="consumed" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={50} name="Total Items Consumed" /></BarChart></ResponsiveContainer></div>) : (<div className="text-center py-12 text-gray-500">No consumption data available to generate chart.</div>)}
        </div>
      </div>

    </div>
  );
};

export default InventoryReportsTab;