import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';

const VehicleModal = ({ isOpen, onClose, onSuccess, editData = null }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      reset({
        registrationNumber: editData.registrationNumber || editData.regNo || '',
        type: editData.type || 'Bus',
        capacity: editData.capacity || '',
        make: editData.make || '',
        model: editData.model || '',
        year: editData.year || '',
        status: editData.status || 'Active'
      });
    } else {
      reset({
        registrationNumber: '',
        type: 'Bus',
        capacity: '',
        make: '',
        model: '',
        year: '',
        status: 'Active'
      });
    }
  }, [editData, isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (editData) {
        await api.put(API_ENDPOINTS.ADMIN.TRANSPORT.VEHICLE_BY_ID(editData._id), data);
        toast.success("Vehicle updated successfully!");
      } else {
        await api.post(API_ENDPOINTS.ADMIN.TRANSPORT.VEHICLES, data);
        toast.success("Vehicle added successfully!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to save vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">
            {editData ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration No.</label>
            <input 
              type="text" 
              {...register('registrationNumber', { required: 'Required' })}
              placeholder="e.g. ABC-1234"
              className={`w-full px-4 py-2 border ${errors.registrationNumber ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`}
            />
            {errors.registrationNumber && <p className="text-red-500 text-xs mt-1">{errors.registrationNumber.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <select {...register('type', { required: 'Type is required' })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="Bus">Bus</option>
                <option value="Van">Van</option>
                <option value="Car">Car</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Seats)</label>
              <input type="number" min="1" {...register('capacity', { required: 'Required' })} className={`w-full px-4 py-2 border ${errors.capacity ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`} />
              {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <input type="text" {...register('make')} placeholder="e.g. Toyota" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input type="text" {...register('model')} placeholder="e.g. Coaster" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input type="number" {...register('year')} placeholder="e.g. 2018" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select {...register('status')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="Active">Active</option>
              <option value="Maintenance">Under Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2">
              {loading ? <FaSpinner className="animate-spin" /> : null} {editData ? 'Update Vehicle' : 'Save Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleModal;