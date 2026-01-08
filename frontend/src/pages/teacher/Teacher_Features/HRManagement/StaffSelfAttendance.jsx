import React, { useState, useEffect } from "react";
import api from "../../../../services/api";
import { toast } from "react-toastify";
import { 
  FaSignInAlt, 
  FaSignOutAlt, 
  FaClock, 
  FaCalendarAlt,
  FaHistory,
  FaUserCheck,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaQrcode,
  FaExclamationTriangle,
  FaCheckCircle
} from "react-icons/fa";

export default function StaffSelfAttendance() {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentHistory, setRecentHistory] = useState([]);
  const [location, setLocation] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);

  useEffect(() => {
    // Get device and location info
    setDeviceInfo({
      browser: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          toast.warning("Location access denied. Attendance may require verification.");
        }
      );
    }

    fetchTodayStatus();
    fetchRecentHistory();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await api.get('/api/teacher/hr/attendance/today');
      setAttendance(response.data);
    } catch {
      console.log("No record for today yet");
      setAttendance(null);
    }
  };

  const fetchRecentHistory = async () => {
    try {
      const response = await api.get('/api/teacher/hr/attendance/recent');
      setRecentHistory(response.data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleAttendance = async (type) => {
    try {
      setLoading(true);
      
      const attendanceData = {
        type,
        location: location || { lat: null, lng: null },
        device: deviceInfo,
        timestamp: new Date().toISOString()
      };

      const endpoint = type === 'in' 
        ? '/api/teacher/hr/attendance/in' 
        : '/api/teacher/hr/attendance/out';
      
      const response = await api.post(endpoint, attendanceData);
      setAttendance(response.data);
      
      const message = type === 'in' 
        ? `Checked in successfully at ${response.data.checkIn}`
        : `Checked out successfully at ${response.data.checkOut}`;
      
      toast.success(message, {
        icon: <FaCheckCircle className="text-green-500" />
      });
      
      fetchRecentHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to mark check-${type}`);
      console.error("Attendance error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'PRESENT': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'LATE': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'ABSENT': return 'bg-rose-100 text-rose-700 border-rose-300';
      case 'HALF_DAY': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const calculateWorkingHours = () => {
    if (!attendance?.checkIn || !attendance?.checkOut) return null;
    
    const [inHour, inMin] = attendance.checkIn.split(':').map(Number);
    const [outHour, outMin] = attendance.checkOut.split(':').map(Number);
    
    const totalMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Daily Attendance</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <FaCalendarAlt className="text-teal-600" />
            Mark your presence for {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-600">
            <FaMobileAlt />
            <span>{deviceInfo?.platform || 'Device'}</span>
          </div>
          <button
            onClick={() => {
              // QR code scanning option
              toast.info("QR code scanning feature coming soon");
            }}
            className="px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <FaQrcode />
            Scan QR
          </button>
        </div>
      </div>

      {/* Main Attendance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center">
                <FaClock className="h-8 w-8 text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Today's Attendance</h2>
                <p className="text-slate-600 text-sm">
                  Current status: <span className={`font-semibold ${getStatusColor(attendance?.status)} px-2 py-0.5 rounded-full`}>
                    {attendance?.status || 'PENDING'}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button 
                onClick={() => handleAttendance('in')}
                disabled={attendance?.checkIn || loading}
                className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 ${
                  attendance?.checkIn 
                    ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' 
                    : 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-lg hover:scale-105'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaSignInAlt />
                {attendance?.checkIn ? `Checked In: ${attendance.checkIn}` : "Check In Now"}
              </button>

              <button 
                onClick={() => handleAttendance('out')}
                disabled={!attendance?.checkIn || attendance?.checkOut || loading}
                className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 ${
                  (!attendance?.checkIn || attendance?.checkOut)
                    ? 'bg-slate-100 text-slate-400 border-2 border-slate-300' 
                    : 'bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:shadow-lg hover:scale-105'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaSignOutAlt />
                {attendance?.checkOut ? `Checked Out: ${attendance.checkOut}` : "Check Out Now"}
              </button>
            </div>
          </div>

          {/* Attendance Details */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-sm font-medium text-slate-600">Check In Time</p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {attendance?.checkIn || '--:--'}
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-sm font-medium text-slate-600">Check Out Time</p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {attendance?.checkOut || '--:--'}
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-sm font-medium text-slate-600">Working Hours</p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {calculateWorkingHours() || '--:--'}
              </p>
            </div>
          </div>

          {/* Location Info */}
          {location && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Location Verified</p>
                  <p className="text-xs text-blue-600">
                    Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FaUserCheck className="text-teal-600" />
            This Month's Summary
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Days Present</span>
              <span className="font-bold text-slate-900">--</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Days Late</span>
              <span className="font-bold text-slate-900">--</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Attendance Rate</span>
              <span className="font-bold text-slate-900">--%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Avg. Hours/Day</span>
              <span className="font-bold text-slate-900">--h</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Attendance Policy</p>
                <p className="text-xs text-amber-700 mt-1">
                  Check-in before 9:30 AM, minimum 8 working hours required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent History */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FaHistory className="text-slate-400" />
            Recent Attendance History
          </h3>
          <button 
            onClick={fetchRecentHistory}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            Refresh
          </button>
        </div>

        {recentHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No recent attendance records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-slate-700">Date</th>
                  <th className="text-left p-3 text-sm font-medium text-slate-700">Check In</th>
                  <th className="text-left p-3 text-sm font-medium text-slate-700">Check Out</th>
                  <th className="text-left p-3 text-sm font-medium text-slate-700">Status</th>
                  <th className="text-left p-3 text-sm font-medium text-slate-700">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentHistory.map((record, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="p-3">
                      <p className="font-medium text-slate-900">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-emerald-600">
                        {record.checkIn || '--:--'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-rose-600">
                        {record.checkOut || '--:--'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-slate-900">
                        {record.workingHours || '--'}
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