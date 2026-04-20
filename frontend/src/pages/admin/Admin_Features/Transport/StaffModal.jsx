import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';

const StaffModal = ({ isOpen, onClose, onSuccess, editData = null }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchVehicles();
      if (editData) {
        reset({
          name: editData.name || '',
          type: editData.type || 'Driver',
          phone: editData.phone || '',
          licenseNumber: editData.licenseNumber || '',
          licenseExpiry: editData.licenseExpiry ? new Date(editData.licenseExpiry).toISOString().split('T')[0] : '',
          assignedVehicle: editData.assignedVehicle?._id || editData.assignedVehicle || '',
          address: editData.address || ''
        });
      } else {
        reset({
          name: '',
          type: 'Driver',
          phone: '',
          licenseNumber: '',
          licenseExpiry: '',
          assignedVehicle: '',
          address: ''
        });
      }
    }
  }, [editData, isOpen, reset]);

  const fetchVehicles = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN.TRANSPORT.VEHICLES);
      const fetchedData = response?.data?.vehicles || response?.vehicles || response?.data || response;
      setVehicles(Array.isArray(fetchedData) ? fetchedData : []);
    } catch {
      toast.error("Failed to load vehicles for assignment");
    }
  };

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (editData) {
        await api.put(API_ENDPOINTS.ADMIN.TRANSPORT.STAFF_BY_ID(editData._id), data);
        toast.success("Staff member updated successfully!");
      } else {
        await api.post(API_ENDPOINTS.ADMIN.TRANSPORT.STAFF, data);
        toast.success("Staff member added successfully!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to save staff member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">
            {editData ? 'Edit Staff Member' : 'Add Staff Member'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text"
              {...register('name', { required: 'Name is required' })}
              placeholder="e.g. John Doe"
              className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff Type</label>
              <select {...register('type', { required: 'Type is required' })} className={`w-full px-4 py-2 border ${errors.type ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`}>
                <option value="Driver">Driver</option>
                <option value="Helper">Helper</option>
              </select>
              {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input 
                type="text" 
                {...register('phone', { required: 'Phone is required' })} 
                placeholder="e.g. 9876543210" 
                className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`} 
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License No. (If Driver)</label>
              <input type="text" {...register('licenseNumber')} placeholder="DL-XXXX" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry</label>
              <input type="date" {...register('licenseExpiry')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Vehicle</label>
              <select {...register('assignedVehicle')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="">Unassigned</option>
                {vehicles.map(v => (
                  <option key={v._id} value={v._id}>{v.registrationNumber || v.regNo}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" {...register('address')} placeholder="Full address..." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2">
              {loading ? <FaSpinner className="animate-spin" /> : null} {editData ? 'Update Staff' : 'Save Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default StaffModal;