import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';

const TripLogModal = ({ isOpen, onClose, onSuccess }) => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vehicle: '',
    driver: '',
    startKm: '',
    endKm: '',
    route: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDependencies();
      setFormData({
        date: new Date().toISOString().split('T')[0],
        vehicle: '',
        driver: '',
        startOdometer: '',
        endOdometer: '',
        routeDescription: '',
        notes: ''
      });
    }
  }, [isOpen]);

  const fetchDependencies = async () => {
    try {
      const [vehRes, staffRes] = await Promise.all([
        api.get(API_ENDPOINTS.ADMIN.TRANSPORT.VEHICLES),
        api.get(API_ENDPOINTS.ADMIN.TRANSPORT.STAFF)
      ]);
      const fetchedVehicles = vehRes?.data?.vehicles || vehRes?.vehicles || vehRes?.data || vehRes;
      setVehicles(Array.isArray(fetchedVehicles) ? fetchedVehicles : []);
      
      const allStaff = staffRes?.data?.staff || staffRes?.staff || staffRes?.data || staffRes;
      // Only show drivers for the driver dropdown
      setDrivers(Array.isArray(allStaff) ? allStaff.filter(s => s.type?.toLowerCase() === 'driver' || s.role?.toLowerCase() === 'driver') : []);
    } catch {
      toast.error("Failed to load dependency data for trips");
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (Number(formData.endOdometer) <= Number(formData.startOdometer)) {
      return toast.error("End Odometer must be greater than Start Odometer");
    }
    
    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.ADMIN.TRANSPORT.TRIPS, formData);
      toast.success("Trip log added successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to save trip log");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b bg-slate-800 border-gray-100">
          <h3 className="text-lg font-bold text-white">Log Daily Trip</h3>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
            <select required name="driver" value={formData.driver} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Select Driver</option>
              {drivers.map(d => <option key={d._id} value={d._id}>{d.name} ({d.licenseNumber || 'No DL'})</option>)}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Odometer (Km)</label>
              <input type="number" required name="startOdometer" value={formData.startOdometer} onChange={handleChange} placeholder="e.g. 45000" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Odometer (Km)</label>
              <input type="number" required name="endOdometer" value={formData.endOdometer} onChange={handleChange} placeholder="e.g. 45120" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Route Info</label>
            <input type="text" required name="routeDescription" value={formData.routeDescription} onChange={handleChange} placeholder="e.g. Morning Pickup - Route A" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <input type="text" name="notes" value={formData.notes} onChange={handleChange} placeholder="Optional..." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-800 text-white rounded-lg hover:bg-indigo-900 font-medium transition-colors flex items-center gap-2">
              {loading ? <FaSpinner className="animate-spin" /> : null} Save Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default TripLogModal;