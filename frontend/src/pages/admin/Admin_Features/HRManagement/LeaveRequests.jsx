import React, { useState, useEffect, useCallback } from "react";
import { 
  FaCalendarAlt, 
  FaCheck, 
  FaTimes, 
  FaSearch,
  FaFilter,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaEye,
  FaCalendarDay,
  FaSync,
  FaExclamationTriangle,
  FaUserClock,
  FaUserInjured,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";

export default function LeaveRequests() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState({ action: "", id: "", teacherName: "" });
  const [remarks, setRemarks] = useState("");

  const statusOptions = [
    { value: "ALL", label: "All Status", icon: FaFilter, color: "bg-slate-100 text-slate-700" },
    { value: "PENDING", label: "Pending", icon: FaHourglassHalf, color: "bg-amber-100 text-amber-700" },
    { value: "APPROVED", label: "Approved", icon: FaCheckCircle, color: "bg-emerald-100 text-emerald-700" },
    { value: "REJECTED", label: "Rejected", icon: FaTimesCircle, color: "bg-rose-100 text-rose-700" }
  ];

  const leaveTypeOptions = [
    { value: "ALL", label: "All Types", icon: FaFilter },
    { value: "SICK", label: "Sick Leave", icon: FaUserInjured, color: "bg-red-100 text-red-700" },
    { value: "CASUAL", label: "Casual Leave", icon: FaUserClock, color: "bg-blue-100 text-blue-700" },
    { value: "EARNED", label: "Earned Leave", icon: FaCalendarDay, color: "bg-green-100 text-green-700" },
    { value: "UNPAID", label: "Unpaid Leave", icon: FaClock, color: "bg-slate-100 text-slate-700" }
  ];

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.ADMIN.HR.LEAVE_REQUESTS); 
      const data = response.data || response;
      const requestsArray = Array.isArray(data) ? data : [];
      setRequests(requestsArray);
      setFilteredRequests(requestsArray);
    } catch (error) {
      console.error("Load Error:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to load leave requests");
      }
      setRequests([]);
      setFilteredRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Filter requests based on search and filters
  useEffect(() => {
    let filtered = [...requests];

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Apply leave type filter
    if (leaveTypeFilter !== "ALL") {
      filtered = filtered.filter(req => req.leaveType === leaveTypeFilter);
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(req => 
        req.teacherId?.name?.toLowerCase().includes(query) ||
        req.reason?.toLowerCase().includes(query) ||
        req.leaveType?.toLowerCase().includes(query) ||
        req.teacherId?.teacherID?.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  }, [requests, statusFilter, leaveTypeFilter, searchQuery]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'APPROVED': return <FaCheckCircle className="text-emerald-500" />;
      case 'REJECTED': return <FaTimesCircle className="text-rose-500" />;
      case 'PENDING': return <FaHourglassHalf className="text-amber-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case 'REJECTED': return "bg-rose-100 text-rose-700 border-rose-300";
      case 'PENDING': return "bg-amber-100 text-amber-700 border-amber-300";
      default: return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const getLeaveTypeColor = (type) => {
    const option = leaveTypeOptions.find(opt => opt.value === type);
    return option?.color || "bg-slate-100 text-slate-700";
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const openDetailModal = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const openConfirmationModal = (id, action, teacherName) => {
    setConfirmationData({ 
      id, 
      action, 
      teacherName,
      leaveType: requests.find(req => req._id === id)?.leaveType || "Leave"
    });
    setShowConfirmationModal(true);
  };

// Inside LeaveRequests.jsx

const handleAction = async (action) => {
  try {
    setProcessingId(confirmationData.id);
    
    // ✅ FIX: Use the PROCESS_LEAVE endpoint for BOTH actions
    const endpoint = API_ENDPOINTS.ADMIN.HR.PROCESS_LEAVE(confirmationData.id);
    
    // The backend expects { status, adminRemarks }
    await api.put(endpoint, { 
      status: action, // This will be 'APPROVED' or 'REJECTED'
      adminRemarks: remarks || `Leave ${action === 'APPROVED' ? 'approved' : 'rejected'} by admin` 
    });
    
    const actionText = action === 'APPROVED' ? 'approved' : 'rejected';
    toast.success(`Leave request ${actionText} successfully`);
    
    fetchRequests();
    closeAllModals();
  } catch (error) {
    console.error("Action error:", error);
    toast.error(error.response?.data?.message || `Failed to process leave request`);
  } finally {
    setProcessingId(null);
  }
};

  const closeAllModals = () => {
    setShowConfirmationModal(false);
    setShowDetailModal(false);
    setSelectedRequest(null);
    setConfirmationData({ action: "", id: "", teacherName: "" });
    setRemarks("");
  };

  const getStats = () => {
    const total = requests.length;
    const pending = requests.filter(req => req.status === 'PENDING').length;
    const approved = requests.filter(req => req.status === 'APPROVED').length;
    const rejected = requests.filter(req => req.status === 'REJECTED').length;
    
    return { total, pending, approved, rejected };
  };

  const stats = getStats();

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Staff Leave Management</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2 text-sm font-medium">
            <FaCalendarAlt className="text-teal-600" />
            Review and process staff leave applications
          </p>
        </div>
        
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <FaSync className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Requests</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              <FaCalendarAlt className="text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-amber-700 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <FaHourglassHalf className="text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Approved</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.approved}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <FaCheckCircle className="text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Rejected</p>
              <p className="text-2xl font-bold text-rose-700 mt-1">{stats.rejected}</p>
            </div>
            <div className="p-3 bg-rose-100 rounded-lg">
              <FaTimesCircle className="text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, reason, or leave type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 outline-none"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Leave Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Leave Type</label>
            <select
              value={leaveTypeFilter}
              onChange={(e) => setLeaveTypeFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 outline-none"
            >
              {leaveTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading leave requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCalendarAlt className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No leave requests found</h3>
            <p className="text-slate-600 mt-1">
              {requests.length === 0 
                ? "No leave requests have been submitted yet." 
                : "No requests match your current filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-700">Staff Member</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Leave Details</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Dates</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center font-bold text-indigo-700">
                          {req.teacherId?.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{req.teacherId?.name || "Unknown"}</p>
                          <p className="text-sm text-slate-500">
                            ID: {req.teacherId?.teacherID || "N/A"} • {req.teacherId?.department || "General"}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getLeaveTypeColor(req.leaveType)}`}>
                          {leaveTypeOptions.find(opt => opt.value === req.leaveType)?.icon && 
                            React.createElement(leaveTypeOptions.find(opt => opt.value === req.leaveType)?.icon)}
                          {req.leaveType}
                        </span>
                        <p className="text-sm text-slate-700 mt-2 line-clamp-2">
                          {req.reason}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {calculateDays(req.startDate, req.endDate)} days
                        </p>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-slate-400" />
                          <span className="font-medium text-slate-900">{formatDate(req.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-slate-400" />
                          <span className="font-medium text-slate-900">{formatDate(req.endDate)}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(req.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </div>
                      {req.adminRemarks && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          Remarks: {req.adminRemarks}
                        </p>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDetailModal(req)}
                          className="px-3 py-2 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                          <FaEye className="text-sm" />
                          View
                        </button>
                        
                        {req.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => openConfirmationModal(req._id, 'APPROVED', req.teacherId?.name)}
                              disabled={processingId === req._id}
                              className="px-3 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                              <FaCheck />
                              Approve
                            </button>
                            <button
                              onClick={() => openConfirmationModal(req._id, 'REJECTED', req.teacherId?.name)}
                              disabled={processingId === req._id}
                              className="px-3 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                              <FaTimes />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Summary Footer */}
        {filteredRequests.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing <span className="font-semibold">{filteredRequests.length}</span> of <span className="font-semibold">{requests.length}</span> requests
              </div>
              <div className="text-sm text-slate-600">
                {stats.pending > 0 && (
                  <span className="text-amber-600 font-semibold">{stats.pending} pending</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Leave Request Details</h3>
                  <p className="text-slate-600 mt-1">Request ID: {selectedRequest._id?.substring(0, 8)}...</p>
                </div>
                <button
                  onClick={closeAllModals}
                  className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Staff Info */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="h-16 w-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center font-bold text-2xl text-indigo-700">
                    {selectedRequest.teacherId?.name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{selectedRequest.teacherId?.name}</h4>
                    <p className="text-slate-600">
                      {selectedRequest.teacherId?.teacherID} • {selectedRequest.teacherId?.department || "General Department"}
                    </p>
                  </div>
                </div>

                {/* Leave Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm font-medium text-slate-700">Leave Type</p>
                    <p className={`mt-2 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 ${getLeaveTypeColor(selectedRequest.leaveType)}`}>
                      {leaveTypeOptions.find(opt => opt.value === selectedRequest.leaveType)?.icon && 
                        React.createElement(leaveTypeOptions.find(opt => opt.value === selectedRequest.leaveType)?.icon)}
                      {selectedRequest.leaveType}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm font-medium text-slate-700">Duration</p>
                    <p className="text-xl font-bold text-slate-900 mt-2">
                      {calculateDays(selectedRequest.startDate, selectedRequest.endDate)} days
                    </p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm font-medium text-blue-700">Start Date</p>
                    <p className="text-lg font-bold text-slate-900 mt-2">{formatDate(selectedRequest.startDate)}</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm font-medium text-blue-700">End Date</p>
                    <p className="text-lg font-bold text-slate-900 mt-2">{formatDate(selectedRequest.endDate)}</p>
                  </div>
                </div>

                {/* Reason */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
                    <FaExclamationTriangle />
                    Reason for Leave
                  </p>
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedRequest.reason}</p>
                </div>

                {/* Status */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-sm font-medium text-slate-700 mb-2">Current Status</p>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(selectedRequest.status)}
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                    {selectedRequest.adminRemarks && (
                      <p className="text-sm text-slate-600">
                        Remarks: {selectedRequest.adminRemarks}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {selectedRequest.status === 'PENDING' && (
                  <div className="pt-6 border-t border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-4">Process Request</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowDetailModal(false);
                          openConfirmationModal(selectedRequest._id, 'APPROVED', selectedRequest.teacherId?.name);
                        }}
                        disabled={processingId === selectedRequest._id}
                        className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      >
                        <FaCheck />
                        Approve Leave
                      </button>
                      <button
                        onClick={() => {
                          setShowDetailModal(false);
                          openConfirmationModal(selectedRequest._id, 'REJECTED', selectedRequest.teacherId?.name);
                        }}
                        disabled={processingId === selectedRequest._id}
                        className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      >
                        <FaTimes />
                        Reject Leave
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${confirmationData.action === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {confirmationData.action === 'APPROVED' ? <FaCheckCircle className="h-8 w-8" /> : <FaTimesCircle className="h-8 w-8" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {confirmationData.action === 'APPROVED' ? 'Approve Leave Request' : 'Reject Leave Request'}
                    </h3>
                    <p className="text-slate-600 mt-1">
                      For: {confirmationData.teacherName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeAllModals}
                  className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Confirm Action</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Are you sure you want to {confirmationData.action.toLowerCase()} this leave request? 
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Leave Type:</span>
                    <span className="font-medium text-slate-900">{confirmationData.leaveType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Staff Member:</span>
                    <span className="font-medium text-slate-900">{confirmationData.teacherName}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Add Remarks (Optional)
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows="3"
                    placeholder="Add remarks for the staff member..."
                    className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={closeAllModals}
                  className="flex-1 py-3.5 rounded-xl border-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction(confirmationData.action)}
                  disabled={processingId === confirmationData.id}
                  className={`flex-1 py-3.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
                    confirmationData.action === 'APPROVED' 
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'
                      : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700'
                  } ${processingId === confirmationData.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {processingId === confirmationData.id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {confirmationData.action === 'APPROVED' ? <FaCheck /> : <FaTimes />}
                      {confirmationData.action === 'APPROVED' ? 'Approve' : 'Reject'} Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}