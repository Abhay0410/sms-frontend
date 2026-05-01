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
    // <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 backdrop-blur-sm">
    //   <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
    //     <div className="flex justify-between items-center p-6 border-b border-gray-100">
    //       <h3 className="text-lg font-bold text-gray-800">
    //         {editData ? 'Edit Vehicle' : 'Add New Vehicle'}
    //       </h3>
    //       <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
    //         <FaTimes />
    //       </button>
    //     </div>
        
    //     <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-1">Registration No.</label>
    //         <input 
    //           type="text" 
    //           {...register('registrationNumber', { required: 'Required' })}
    //           placeholder="e.g. ABC-1234"
    //           className={`w-full px-4 py-2 border ${errors.registrationNumber ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`}
    //         />
    //         {errors.registrationNumber && <p className="text-red-500 text-xs mt-1">{errors.registrationNumber.message}</p>}
    //       </div>
          
    //       <div className="grid grid-cols-2 gap-4">
    //         <div>
    //           <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
    //           <select {...register('type', { required: 'Type is required' })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
    //             <option value="Bus">Bus</option>
    //             <option value="Van">Van</option>
    //             <option value="Car">Car</option>
    //           </select>
    //         </div>
    //         <div>
    //           <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Seats)</label>
    //           <input type="number" min="1" {...register('capacity', { required: 'Required' })} className={`w-full px-4 py-2 border ${errors.capacity ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`} />
    //           {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
    //         </div>
    //       </div>
          
    //       <div className="grid grid-cols-3 gap-4">
    //         <div>
    //           <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
    //           <input type="text" {...register('make')} placeholder="e.g. Toyota" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
    //         </div>
    //         <div>
    //           <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
    //           <input type="text" {...register('model')} placeholder="e.g. Coaster" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
    //         </div>
    //         <div>
    //           <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
    //           <input type="number" {...register('year')} placeholder="e.g. 2018" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
    //         </div>
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
    //         <select {...register('status')} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
    //           <option value="Active">Active</option>
    //           <option value="Maintenance">Under Maintenance</option>
    //           <option value="Retired">Retired</option>
    //         </select>
    //       </div>

    //       <div className="pt-4 flex justify-end gap-3">
    //         <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Cancel</button>
    //         <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2">
    //           {loading ? <FaSpinner className="animate-spin" /> : null} {editData ? 'Update Vehicle' : 'Save Vehicle'}
    //         </button>
    //       </div>
    //     </form>
    //   </div>
    // </div>

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
  <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">

    {/* Header */}
    <div className="flex items-center justify-between px-6 py-5 bg-slate-800 text-white">
      <div>
        <h3 className="text-xl font-semibold">
          {editData ? "Edit Vehicle" : "Add New Vehicle"}
        </h3>
        <p className="text-sm text-slate-300 mt-1">
          Transport & Vehicle Management
        </p>
      </div>

      <button
        onClick={onClose}
        className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
      >
        <FaTimes />
      </button>
    </div>

    {/* Form */}
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 space-y-6 bg-white"
    >
      {/* Registration */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Registration Number
        </label>

        <input
          type="text"
          {...register("registrationNumber", {
            required: "Required",
          })}
          placeholder="e.g. ABC-1234"
          className={`w-full px-4 py-3 border rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all ${
            errors.registrationNumber
              ? "border-red-400"
              : "border-slate-300"
          }`}
        />

        {errors.registrationNumber && (
          <p className="text-red-500 text-xs mt-2">
            {errors.registrationNumber.message}
          </p>
        )}
      </div>

      {/* Type + Capacity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Vehicle Type
          </label>

          <select
            {...register("type", {
              required: "Type is required",
            })}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
          >
            <option value="Bus">Bus</option>
            <option value="Van">Van</option>
            <option value="Car">Car</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Capacity
          </label>

          <input
            type="number"
            min="1"
            {...register("capacity", {
              required: "Required",
            })}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 ${
              errors.capacity
                ? "border-red-400"
                : "border-slate-300"
            }`}
          />

          {errors.capacity && (
            <p className="text-red-500 text-xs mt-2">
              {errors.capacity.message}
            </p>
          )}
        </div>
      </div>

      {/* Make Model Year */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Make
          </label>

          <input
            type="text"
            {...register("make")}
            placeholder="Toyota"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Model
          </label>

          <input
            type="text"
            {...register("model")}
            placeholder="Coaster"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Year
          </label>

          <input
            type="number"
            {...register("year")}
            placeholder="2024"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Status
        </label>

        <select
          {...register("status")}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
        >
          <option value="Active">Active</option>
          <option value="Maintenance">Under Maintenance</option>
          <option value="Retired">Retired</option>
        </select>
      </div>

      {/* Footer */}
      <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all font-medium"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-medium flex items-center gap-2 shadow-sm"
        >
          {loading && (
            <FaSpinner className="animate-spin" />
          )}

          {editData
            ? "Update Vehicle"
            : "Save Vehicle"}
        </button>
      </div>
    </form>
  </div>
</div>
  );
};

export default VehicleModal;