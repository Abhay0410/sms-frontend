import React, { useEffect, useState, useCallback } from "react";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import { toast } from "react-toastify";
import { 
  FaEdit, 
  FaSync, 
  FaFilter, 
  FaCheck, 
  FaTimes, 
  FaClock,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaCalendarAlt,
  FaSearch,
  FaEye,
  FaArrowRight
} from "react-icons/fa";

export default function StaffAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const statusOptions = [
    { value: "PRESENT", label: "Present", color: "bg-emerald-100 text-emerald-700 border-emerald-300", icon: FaUserCheck },
    { value: "ABSENT", label: "Absent", color: "bg-rose-100 text-rose-700 border-rose-300", icon: FaUserTimes },
    { value: "LATE", label: "Late", color: "bg-amber-100 text-amber-700 border-amber-300", icon: FaUserClock },
    { value: "HALF_DAY", label: "Half Day", color: "bg-blue-100 text-blue-700 border-blue-300", icon: FaClock },
    { value: "LEAVE", label: "Leave", color: "bg-purple-100 text-purple-700 border-purple-300", icon: FaCalendarAlt }
  ];

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`${API_ENDPOINTS.ADMIN.HR.ATTENDANCE_LIST}?date=${date}`);
      setAttendance(response.data || []);
    } catch (error) { 
      toast.error("Failed to load attendance logs");
      console.error("Attendance fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { 
    fetchAttendance(); 
  }, [fetchAttendance]);

  const filteredAttendance = attendance.filter(record => {
    const matchesStatus = filterStatus === "ALL" || record.status === filterStatus;
    const matchesSearch = searchQuery === "" || 
      record.teacherId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.teacherId?.teacherID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.teacherId?.department?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const openUpdateModal = (record) => {
    setSelectedRecord(record);
    setShowUpdateModal(true);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedRecord || !newStatus) return;
    
    try {
      setUpdateLoading(true);
      await api.put(API_ENDPOINTS.ADMIN.HR.UPDATE_ATTENDANCE(selectedRecord._id), { 
        status: newStatus.toUpperCase() 
      });
      
      toast.success(`Attendance updated to ${newStatus}`);
      fetchAttendance();
      setShowUpdateModal(false);
      setSelectedRecord(null);
    } catch (error) {
      toast.error("Failed to update attendance");
      console.error("Update error:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusCount = (status) => {
    return attendance.filter(record => record.status === status).length;
  };

  const getTotalWorkingHours = (record) => {
    if (!record.checkIn || !record.checkOut) return "N/A";
    
    const [inHour, inMin] = record.checkIn.split(':').map(Number);
    const [outHour, outMin] = record.checkOut.split(':').map(Number);
    
    const totalMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Staff Attendance Management</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2 font-medium text-sm">
            <FaCalendarAlt className="text-teal-600" />
            Monitoring attendance for {new Date(date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none w-full md:w-64"
            />
          </div>
          
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
          />
          
          <button 
            onClick={fetchAttendance}
            disabled={loading}
            className="px-4 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {statusOptions.map((status) => (
          <div key={status.value} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{status.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{getStatusCount(status.value)}</p>
              </div>
              <div className={`p-3 rounded-lg ${status.color.split(' ')[0]}`}>
                <status.icon className="text-lg" />
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {((getStatusCount(status.value) / attendance.length) * 100 || 0).toFixed(1)}% of total
            </div>
          </div>
        ))}
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-medium text-slate-700 flex items-center gap-2">
            <FaFilter className="text-slate-400" />
            Filter by Status:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === "ALL" ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              All ({attendance.length})
            </button>
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => setFilterStatus(status.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filterStatus === status.value ? `${status.color} border-2` : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                <status.icon className="text-sm" />
                {status.label} ({getStatusCount(status.value)})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 font-semibold text-slate-700">Staff Member</th>
                <th className="text-left p-4 font-semibold text-slate-700">Department</th>
                <th className="text-left p-4 font-semibold text-slate-700">Time Log</th>
                <th className="text-left p-4 font-semibold text-slate-700">Working Hours</th>
                <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                <th className="text-left p-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-200 border-t-teal-600"></div>
                      <p className="mt-4 text-slate-600">Loading attendance data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <FaUserTimes className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">No attendance records found</h3>
                      <p className="text-slate-600 mt-1">
                        {searchQuery ? "Try a different search term" : "No records for the selected date/filter"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((record) => {
                  const statusConfig = statusOptions.find(s => s.value === record.status) || statusOptions[0];
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center font-bold text-teal-700">
                            {record.teacherId?.name?.charAt(0) || "S"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{record.teacherId?.name || "Unknown"}</p>
                            <p className="text-sm text-slate-500">ID: {record.teacherId?.teacherID || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                          {record.teacherId?.department || "General"}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                            <span className="text-sm font-medium text-slate-900">Check In:</span>
                            <span className="text-sm text-slate-700">{record.checkIn || "Not recorded"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                            <span className="text-sm font-medium text-slate-900">Check Out:</span>
                            <span className="text-sm text-slate-700">{record.checkOut || "Not recorded"}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FaClock className="text-slate-400" />
                          <span className="font-medium text-slate-900">{getTotalWorkingHours(record)}</span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.color}`}>
                          <StatusIcon className="text-sm" />
                          {record.status}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openUpdateModal(record)}
                            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                          >
                            <FaEdit className="text-sm" />
                            Update
                          </button>
                          <button
                            onClick={() => {
                              // View details action
                              toast.info("View details feature coming soon");
                            }}
                            className="px-4 py-2 border-2 border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2"
                          >
                            <FaEye className="text-sm" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Summary Footer */}
        {filteredAttendance.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing <span className="font-semibold">{filteredAttendance.length}</span> of <span className="font-semibold">{attendance.length}</span> records
              </div>
              <div className="text-sm text-slate-600">
                Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {showUpdateModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Update Attendance Status</h3>
              <p className="text-slate-600 mt-1">
                Update status for <span className="font-semibold">{selectedRecord.teacherId?.name}</span>
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm font-medium text-slate-700">Current Status:</p>
                  <div className="mt-2">
                    {(() => {
                      const currentStatus = statusOptions.find(s => s.value === selectedRecord.status);
                      const Icon = currentStatus?.icon;
                      return (
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${currentStatus?.color || 'bg-slate-100 text-slate-700'}`}>
                          {Icon && <Icon />}
                          {selectedRecord.status}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-3">Select New Status:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions.map((status) => {
                      const Icon = status.icon;
                      return (
                        <button
                          key={status.value}
                          onClick={() => handleUpdateStatus(status.value)}
                          disabled={updateLoading || selectedRecord.status === status.value}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                            selectedRecord.status === status.value
                              ? `${status.color} border-current`
                              : 'border-slate-200 hover:border-teal-400 hover:bg-teal-50'
                          } ${updateLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Icon className="text-xl" />
                          <span className="text-sm font-medium">{status.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedRecord(null);
                  }}
                  className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const newStatus = window.prompt("Or enter custom status:", selectedRecord.status);
                    if (newStatus && newStatus.trim()) {
                      handleUpdateStatus(newStatus.trim());
                    }
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Custom Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}