import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaBus, FaShuttleVan, FaCar, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';
import VehicleModal from './VehicleModal';

const VehicleManagementTab = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.ADMIN.TRANSPORT.VEHICLES);
      const fetchedData = response?.data?.data || response?.data || response;
      setVehicles(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (error) {
      toast.error(error.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await api.delete(API_ENDPOINTS.ADMIN.TRANSPORT.VEHICLE_BY_ID(id));
      toast.success("Vehicle deleted successfully");
      fetchVehicles();
    } catch (error) {
      toast.error(error.message || "Failed to delete vehicle");
    }
  };

  const getVehicleIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'bus': return <FaBus className="text-indigo-500" />;
      case 'van': return <FaShuttleVan className="text-emerald-500" />;
      case 'car': return <FaCar className="text-blue-500" />;
      default: return <FaBus className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold uppercase">Active</span>;
      case 'maintenance': return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-bold uppercase">Maintenance</span>;
      case 'inactive': return <span className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-md text-xs font-bold uppercase">Inactive</span>;
      default: return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold uppercase">{status || 'Unknown'}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FaBus size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vehicle Fleet</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Manage your school's transport vehicles</p>
          </div>
        </div>
        <button 
          onClick={() => { setSelectedVehicle(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-md hover:shadow-lg"
        >
          <FaPlus /> Add Vehicle
        </button>
      </div>

      {/* Table Area */}
      <div className="mb-6">
        {loading ? (
          <div className="p-12 text-center bg-slate-50 rounded-xl border border-slate-200">
            <FaSpinner className="animate-spin text-indigo-600 text-3xl mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Loading fleet data...</p>
          </div>
        ) : vehicles.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left bg-white border-collapse">
              <thead className="bg-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-white uppercase tracking-wider">Registration No.</th>
                  <th className="p-4 text-xs font-bold text-white uppercase tracking-wider">Type</th>
                  <th className="p-4 text-xs font-bold text-white uppercase tracking-wider">Capacity</th>
                  <th className="p-4 text-xs font-bold text-white uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-white uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{vehicle.registrationNumber || vehicle.regNo}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getVehicleIcon(vehicle.type)}
                        <span className="font-medium text-slate-700 capitalize">{vehicle.type}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{vehicle.capacity} Seats</td>
                    <td className="p-4">{getStatusBadge(vehicle.status)}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedVehicle(vehicle); setIsModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center bg-slate-50 rounded-xl border border-slate-200">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
              <FaBus className="text-2xl text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No Vehicles Found</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">You haven't added any vehicles to your transport fleet yet.</p>
            <button 
               onClick={() => { setSelectedVehicle(null); setIsModalOpen(true); }}
               className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm"
            >
              <FaPlus /> Add First Vehicle
            </button>
          </div>
        )}
      </div>

      {/* Vehicle Form Modal */}
      <VehicleModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedVehicle(null); }} 
        onSuccess={fetchVehicles} 
        editData={selectedVehicle} 
      />
    </div>
  );
};

export default VehicleManagementTab;