import React, { useState, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import { toast } from "react-toastify";
import { 
  FaPaperPlane, 
  FaHistory, 
  FaCalendarAlt,
  FaFileAlt,
  FaClock,
  FaUserMd,
  FaUmbrellaBeach,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
} from "react-icons/fa";

// Import react-datepicker CSS
import "react-datepicker/dist/react-datepicker.css";

export default function ApplyLeave() {
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({ 
    leaveType: "SICK", 
    startDate: null, 
    endDate: null, 
    reason: "",
    emergencyContact: "",
    handoverPerson: ""
  });
  const [loading, setLoading] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState({
    sick: 12,
    casual: 15,
    unpaid: 0,
    earned: 5
  });
  const [showPreview, setShowPreview] = useState(false);

  const leaveTypes = [
    { value: "SICK", label: "Sick Leave", icon: FaUserMd, color: "bg-red-100 text-red-700 border-red-300" },
    { value: "CASUAL", label: "Casual Leave", icon: FaUmbrellaBeach, color: "bg-blue-100 text-blue-700 border-blue-300" },
    { value: "UNPAID", label: "Unpaid Leave", icon: FaFileAlt, color: "bg-slate-100 text-slate-700 border-slate-300" },
    { value: "EARNED", label: "Earned Leave", icon: FaClock, color: "bg-green-100 text-green-700 border-green-300" }
  ];

  const fetchHistory = useCallback(async () => {
    try {
      // Use the corrected constant
      const response = await api.get(API_ENDPOINTS.TEACHER.MY_HR.MY_LEAVES);
      
      // API returns { success: true, data: [...] } or just [...] depending on interceptor
      const leaveData = response.data || response;
      setHistory(Array.isArray(leaveData) ? leaveData : []);
    } catch (error) { 
      console.error("Error fetching leave history:", error);
      // ✅ FIX: Only show toast if it's NOT a 404 (meaning route exists but data might be empty)
      if (error.response?.status !== 404) {
        toast.error("Network error while loading history");
      }
    }
  }, []);

  const fetchLeaveBalance = useCallback(async () => {
    try {
      // Since this endpoint doesn't exist in your backend, let's calculate from history
      const response = await api.get('/api/teacher/hr/leaves/my');
      const leaves = response.data || [];
      
      // Calculate leave balance from history (mock calculation)
      const sickUsed = leaves.filter(l => l.leaveType === 'SICK' && l.status === 'APPROVED').length;
      const casualUsed = leaves.filter(l => l.leaveType === 'CASUAL' && l.status === 'APPROVED').length;
      
      setLeaveBalance({
        sick: Math.max(0, 12 - sickUsed),
        casual: Math.max(0, 15 - casualUsed),
        unpaid: 0,
        earned: 5
      });
    } catch (error) {
      console.error("Error fetching leave balance:", error);
      // Don't show error to user for balance - use default values
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    fetchLeaveBalance();
  }, [fetchHistory, fetchLeaveBalance]);

  // Format date to YYYY-MM-DD for backend
  const formatDateForBackend = (date) => {
    if (!date) return "";
    return format(date, 'yyyy-MM-dd');
  };

  // Format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (date) => {
    if (!date) return "";
    return format(date, 'dd/MM/yyyy');
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    try {
      const diffTime = Math.abs(formData.endDate - formData.startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    } catch (error) {
      console.error("Error calculating days:", error);
      return 0;
    }
  };

  // Custom date picker input component
  const CustomDateInput = React.forwardRef(({ value, onClick, onChange, placeholder }, ref) => (
    <div className="relative">
      <input
        type="text"
        value={value}
        onClick={onClick}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none cursor-pointer"
        ref={ref}
      />
      <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  ));

  CustomDateInput.displayName = 'CustomDateInput';

  const validateForm = () => {
    const errors = [];
    
    if (!formData.startDate) errors.push("Start date is required");
    if (!formData.endDate) errors.push("End date is required");
    if (!formData.reason.trim()) errors.push("Reason is required");
    
    if (formData.startDate && formData.endDate) {
      if (formData.endDate < formData.startDate) {
        errors.push("End date cannot be before start date");
      }
      
      // Check if start date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (formData.startDate < today) {
        errors.push("Start date cannot be in the past");
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      setLoading(true);
      const days = calculateDays();
      
      // Prepare data for backend - convert dates to YYYY-MM-DD format
      const leaveData = {
        leaveType: formData.leaveType,
        startDate: formatDateForBackend(formData.startDate),
        endDate: formatDateForBackend(formData.endDate),
        reason: formData.reason,
        emergencyContact: formData.emergencyContact,
        handoverPerson: formData.handoverPerson,
        totalDays: days,
      };

      // Use the correct API endpoint
      await api.post(API_ENDPOINTS.TEACHER.MY_HR.APPLY_LEAVE || '/api/teacher/hr/leaves/apply', leaveData);
      
      toast.success("Leave application submitted successfully!", {
        icon: <FaCheckCircle className="text-green-500" />
      });
      
      // Reset form
      setFormData({ 
        leaveType: "SICK", 
        startDate: null, 
        endDate: null, 
        reason: "",
        emergencyContact: "",
        handoverPerson: ""
      });
      
      // Refresh data
      fetchHistory();
      fetchLeaveBalance();
    } catch (error) {
      console.error("Leave application error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to submit leave application. Please check the dates and try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setShowPreview(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toUpperCase()) {
      case 'APPROVED': return <FaCheckCircle className="text-green-500" />;
      case 'REJECTED': return <FaTimesCircle className="text-red-500" />;
      case 'PENDING': return <FaHourglassHalf className="text-amber-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'APPROVED': return "bg-green-100 text-green-700 border-green-300";
      case 'REJECTED': return "bg-red-100 text-red-700 border-red-300";
      case 'PENDING': return "bg-amber-100 text-amber-700 border-amber-300";
      default: return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  // Format date in history table (DD/MM/YYYY)
  const formatHistoryDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return format(date, 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  // Format date with day name (e.g., Monday, 25/12/2024)
  const formatDateWithDay = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return format(date, 'EEEE, dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  // Helper function to calculate days from dates in history
  const calculateDaysFromDates = (startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) return 0;
    
    try {
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 0;
      }
      
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } catch {
      return 0;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leave Application</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <FaCalendarAlt className="text-teal-600" />
            Apply for leave and track your applications
          </p>
        </div>
        
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 border-2 border-teal-300 text-teal-700 rounded-xl hover:bg-teal-50 transition-all"
        >
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Balance Cards */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Leave Balance</h3>
          {leaveTypes.map((type) => {
            const Icon = type.icon;
            const balance = leaveBalance[type.value.toLowerCase()] || 0;
            
            return (
              <div key={type.value} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${type.color.split(' ')[0]}`}>
                      <Icon className="text-lg" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{type.label}</p>
                      <p className="text-sm text-slate-500">Balance: {balance} days</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">{balance}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Leave Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <FaPaperPlane className="text-teal-600" />
              Apply for Leave
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Leave Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Leave Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {leaveTypes.map((type) => {
                    const Icon = type.icon;
                    const selected = formData.leaveType === type.value;
                    
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({...formData, leaveType: type.value})}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                          selected 
                            ? `${type.color} border-current` 
                            : 'border-slate-200 hover:border-teal-400 hover:bg-teal-50'
                        }`}
                      >
                        <Icon className="text-xl" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Range with react-datepicker */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date *
                  </label>
                  <DatePicker
                    selected={formData.startDate}
                    onChange={(date) => setFormData({...formData, startDate: date})}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select start date"
                    minDate={new Date()}
                    customInput={<CustomDateInput placeholder="DD/MM/YYYY" />}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                    showPopperArrow={false}
                    calendarClassName="rounded-xl shadow-lg border border-slate-200"
                    dayClassName={(date) => 
                      date.getDate() === formData.startDate?.getDate() ? 
                      "bg-teal-500 text-white rounded-lg" : 
                      "hover:bg-slate-100 rounded-lg"
                    }
                    wrapperClassName="w-full"
                  />
                  {formData.startDate && (
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDateWithDay(formData.startDate)}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date *
                  </label>
                  <DatePicker
                    selected={formData.endDate}
                    onChange={(date) => setFormData({...formData, endDate: date})}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select end date"
                    minDate={formData.startDate || new Date()}
                    customInput={<CustomDateInput placeholder="DD/MM/YYYY" />}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                    showPopperArrow={false}
                    calendarClassName="rounded-xl shadow-lg border border-slate-200"
                    dayClassName={(date) => 
                      date.getDate() === formData.endDate?.getDate() ? 
                      "bg-teal-500 text-white rounded-lg" : 
                      "hover:bg-slate-100 rounded-lg"
                    }
                    wrapperClassName="w-full"
                  />
                  {formData.endDate && (
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDateWithDay(formData.endDate)}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Total Days
                  </label>
                  <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
                    <p className="text-center text-xl font-bold text-slate-900">
                      {calculateDays() || 0}
                    </p>
                    <p className="text-xs text-center text-slate-500 mt-1">
                      (inclusive of both dates)
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    placeholder="Emergency contact number"
                    value={formData.emergencyContact}
                    onChange={e => setFormData({...formData, emergencyContact: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Handover To (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Colleague name for handover"
                    value={formData.handoverPerson}
                    onChange={e => setFormData({...formData, handoverPerson: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for Leave *
                </label>
                <textarea
                  required
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  rows="4"
                  placeholder="Please provide details for your leave request..."
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  For sick leave, please mention if medical certificate is attached
                </p>
              </div>

              {/* Preview Modal */}
              {showPreview && (
                <div className="p-4 bg-slate-50 border-2 border-slate-300 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-3">Application Preview</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Leave Type:</strong> {leaveTypes.find(t => t.value === formData.leaveType)?.label}</p>
                    <p><strong>Start Date:</strong> {formData.startDate ? formatDateForDisplay(formData.startDate) : "Not selected"}</p>
                    <p><strong>End Date:</strong> {formData.endDate ? formatDateForDisplay(formData.endDate) : "Not selected"}</p>
                    <p><strong>Total Days:</strong> {calculateDays()}</p>
                    <p><strong>Reason:</strong> {formData.reason || "Not provided"}</p>
                    <p><strong>Emergency Contact:</strong> {formData.emergencyContact || "Not provided"}</p>
                    <p><strong>Handover To:</strong> {formData.handoverPerson || "Not specified"}</p>
                  </div>
                </div>
              )}

              {/* Policy Warning */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Important Information</p>
                    <p className="text-xs text-amber-700 mt-1">
                      • Apply at least 3 days in advance for casual leaves
                      • Sick leaves require medical certificate (mention in reason if attached)
                      • Unpaid leaves affect salary calculation
                      • Dates are in DD/MM/YYYY format
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Submit Leave Application
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Leave History */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FaHistory className="text-slate-400" />
            Leave History
          </h3>
          <button 
            onClick={fetchHistory}
            disabled={loading}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaFileAlt className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500">No leave applications found.</p>
            <p className="text-sm text-slate-400 mt-1">Apply for your first leave above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-slate-700">Leave Type</th>
                  <th className="text-left p-3 text-sm font-medium text-slate-700">Dates</th>
                  <th className="text-left p-3 text-sm font-medium text-slate-700">Days</th>
                  <th className="text-left p-3 text-sm font-medium text-slate-700">Applied On</th>
                  <th className="text-left p-3 text-sm font-medium text-slate-700">Status</th>
                  <th className="text-left p-3 text-sm font-medium text-slate-700">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className="font-medium text-slate-900">
                          {item.leaveType}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-slate-900">
                        {formatHistoryDate(item.startDate)}
                      </p>
                      <p className="text-xs text-slate-500">
                        to {formatHistoryDate(item.endDate)}
                      </p>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900">
                        {item.totalDays || calculateDaysFromDates(item.startDate, item.endDate)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-slate-600">
                        {formatHistoryDate(item.createdAt || item.appliedDate)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-slate-600 truncate max-w-xs block">
                        {item.adminRemarks || item.remarks || "No remarks"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}