import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaUserTie } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';
import StaffModal from './StaffModal';

const StaffManagementTab = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.ADMIN.TRANSPORT.STAFF);
      const fetchedData = response?.data?.data || response?.data || response;
      setStaffList(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (error) {
      toast.error(error.message || "Failed to load transport staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this staff member?")) return;
    try {
      await api.delete(API_ENDPOINTS.ADMIN.TRANSPORT.STAFF_BY_ID(id));
      toast.success("Staff member removed successfully");
      fetchStaff();
    } catch (error) {
      toast.error(error.message || "Failed to remove staff member");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FaUserTie size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Transport Staff</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Manage drivers and helpers</p>
          </div>
        </div>
        <button 
          onClick={() => { setSelectedStaff(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-md hover:shadow-lg"
        >
          <FaPlus /> Add Staff
        </button>
      </div>

      {/* Table Area */}
      <div className="mb-6">
        {loading ? (
          <div className="p-12 text-center bg-slate-50 rounded-xl border border-slate-200">
            <FaSpinner className="animate-spin text-indigo-600 text-3xl mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Loading staff data...</p>
          </div>
        ) : staffList.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left bg-white border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name / Role</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">License No.</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">License Expiry</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Vehicle</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map((staff) => (
                  <tr key={staff._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                          {staff.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{staff.name}</p>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{staff.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{staff.licenseNumber || 'N/A'}</td>
                    <td className="p-4 text-slate-600 font-medium">
                      {staff.licenseExpiry ? new Date(staff.licenseExpiry).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      {staff.assignedVehicle ? (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold border border-blue-100">
                          {staff.assignedVehicle.registrationNumber || staff.assignedVehicle.regNo}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedStaff(staff); setIsModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button onClick={() => handleDelete(staff._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
              <FaUserTie className="text-2xl text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No Staff Found</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">You haven't added any drivers or helpers yet.</p>
            <button 
               onClick={() => { setSelectedStaff(null); setIsModalOpen(true); }}
               className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm"
            >
              <FaPlus /> Add First Staff Member
            </button>
          </div>
        )}
      </div>

      <StaffModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedStaff(null); }} 
        onSuccess={fetchStaff} 
        editData={selectedStaff} 
      />
    </div>
  );
};

export default StaffManagementTab;