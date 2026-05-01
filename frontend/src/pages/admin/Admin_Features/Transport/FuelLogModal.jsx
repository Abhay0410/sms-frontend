import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';

const FuelLogModal = ({ isOpen, onClose, onSuccess }) => {
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vehicle: '',
    volume: '',
    totalCost: '',
    odometer: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchVehicles();
      setFormData({
        date: new Date().toISOString().split('T')[0],
        vehicle: '',
        quantityLiters: '',
        totalCost: '',
        odometerReading: '',
        receiptNumber: ''
      });
    }
  }, [isOpen]);

  const fetchVehicles = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN.TRANSPORT.VEHICLES);
      const fetchedData = response?.data?.vehicles || response?.vehicles || response?.data || response;
      setVehicles(Array.isArray(fetchedData) ? fetchedData : []);
    } catch  {
      toast.error("Failed to load vehicles");
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.ADMIN.TRANSPORT.FUEL, formData);
      toast.success("Fuel log added successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to save fuel log");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b bg-slate-800 border-gray-100">
          <h3 className="text-lg font-bold text-white">Log Fuel Entry</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" required name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
              <select required name="vehicle" value={formData.vehicle} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="">Select Vehicle</option>
                {vehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber || v.regNo}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Liters)</label>
              <input type="number" required step="0.01" name="quantityLiters" value={formData.quantityLiters} onChange={handleChange} placeholder="0.00" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost (₹)</label>
              <input type="number" required step="0.01" name="totalCost" value={formData.totalCost} onChange={handleChange} placeholder="0.00" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Odometer (Km)</label>
              <input type="number" required name="odometerReading" value={formData.odometerReading} onChange={handleChange} placeholder="e.g. 45000" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt No.</label>
              <input type="text" name="receiptNumber" value={formData.receiptNumber} onChange={handleChange} placeholder="e.g. REC-1234" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 font-medium transition-colors flex items-center gap-2">
              {loading ? <FaSpinner className="animate-spin" /> : null} Save Fuel Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default FuelLogModal;