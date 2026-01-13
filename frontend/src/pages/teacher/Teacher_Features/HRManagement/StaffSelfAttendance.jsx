import React, { useState, useEffect, useCallback } from "react";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints"; 
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
  FaCheckCircle,
  FaSync,
  
} from "react-icons/fa";

export default function StaffSelfAttendance() {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentHistory, setRecentHistory] = useState([]);
  const [location, setLocation] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [stats, setStats] = useState({
    presentDays: 0,
    lateDays: 0,
    attendanceRate: 0,
    avgHours: 0,
    totalWorkingDays: 0
  });

  // Helper: Calculate hours between two HH:mm:ss strings
  const getDiff = (start, end) => {
    if (!start || !end) return "--";
    const [h1, m1, s1] = start.split(':').map(Number);
    const [h2, m2, s2] = end.split(':').map(Number);
    const totalSec = (h2 * 3600 + m2 * 60 + s2) - (h1 * 3600 + m1 * 60 + s1);
    if (totalSec < 0) return "--";
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    return `${h}h ${m}m`;
  };

const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const [todayRes, historyRes, statsRes] = await Promise.all([
            api.get(API_ENDPOINTS.TEACHER.MY_HR.TODAY_STATUS),
            api.get(API_ENDPOINTS.TEACHER.MY_HR.RECENT_HISTORY),
            api.get(API_ENDPOINTS.TEACHER.MY_HR.My_Status)
        ]);
        
        setAttendance(todayRes.data || null);
        setRecentHistory(historyRes.data || []);
        
        // ✅ FIX: Match the backend response exactly
        if (statsRes.data) {
            setStats({
                presentDays: statsRes.data.presentDays || 0,
                lateDays: statsRes.data.lateDays || 0,
                attendanceRate: statsRes.data.attendanceRate || 0,
                avgHours: statsRes.data.avgHours || 0,
                totalWorkingDays: statsRes.data.totalWorkingDays || 26
            });
        }
    } catch (error) {
        console.error("Error fetching attendance data:", error);
        if (error.response?.status !== 404) {
            toast.error("Failed to load attendance dashboard");
        }
    } finally {
        setLoading(false);
    }
}, []);

  // Get device and location info
  useEffect(() => {
    setDeviceInfo({
      browser: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      userAgent: navigator.userAgent
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        () => {
          toast.warning("Location access denied. Attendance may require verification.");
        }
      );
    }

    fetchData();
  }, [fetchData]);

  const handleAttendance = async (type) => {
    if (type === 'out' && !attendance?.checkIn) {
      toast.error("Please check in first!");
      return;
    }

    try {
      setLoading(true);
      
      const attendanceData = {
        type,
        location: location || { lat: null, lng: null },
        device: deviceInfo,
        timestamp: new Date().toISOString()
      };

      const endpoint = type === 'in' 
        ? API_ENDPOINTS.TEACHER.MY_HR.MARK_IN 
        : API_ENDPOINTS.TEACHER.MY_HR.MARK_OUT;
      
      const response = await api.post(endpoint, attendanceData);
      setAttendance(response.data);
      
      const message = type === 'in' 
        ? `Checked in successfully at ${response.data.checkIn}`
        : `Checked out successfully at ${response.data.checkOut}`;
      
      toast.success(message, {
        icon: <FaCheckCircle className="text-green-500" />
      });
      
      // Refresh all data
      await fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || `Failed to mark check-${type}`;
      toast.error(errorMsg);
      console.error("Attendance error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'PRESENT': return 'bg-emerald-100 text-emerald-700 border border-emerald-300';
      case 'LATE': return 'bg-amber-100 text-amber-700 border border-amber-300';
      case 'ABSENT': return 'bg-rose-100 text-rose-700 border border-rose-300';
      case 'HALF_DAY': return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'ON_LEAVE': return 'bg-purple-100 text-purple-700 border border-purple-300';
      default: return 'bg-slate-100 text-slate-700 border border-slate-300';
    }
  };

  const calculateWorkingHours = () => {
    if (!attendance?.checkIn || !attendance?.checkOut) return null;
    return getDiff(attendance.checkIn, attendance.checkOut);
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
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={() => toast.info("QR code scanning feature coming soon")}
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
                  Current status: <span className={`font-semibold px-2 py-0.5 rounded-full ${getStatusColor(attendance?.status)}`}>
                    {attendance?.status || 'NOT MARKED'}
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
                    ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300 cursor-default' 
                    : 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                } ${(loading || attendance?.checkIn) ? 'opacity-90 cursor-not-allowed' : ''}`}
              >
                <FaSignInAlt />
                {attendance?.checkIn ? `Checked In: ${attendance.checkIn}` : "Check In Now"}
              </button>

              <button 
                onClick={() => handleAttendance('out')}
                disabled={!attendance?.checkIn || attendance?.checkOut || loading}
                className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 ${
                  (!attendance?.checkIn || attendance?.checkOut)
                    ? 'bg-slate-100 text-slate-400 border-2 border-slate-300 cursor-default' 
                    : 'bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                } ${loading ? 'opacity-90 cursor-not-allowed' : ''}`}
              >
                <FaSignOutAlt />
                {attendance?.checkOut ? `Checked Out: ${attendance.checkOut}` : "Check Out Now"}
              </button>
            </div>
          </div>

          {/* Attendance Details */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <FaSignInAlt className="text-emerald-500" /> Check In Time
              </p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {attendance?.checkIn || '--:--'}
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <FaSignOutAlt className="text-rose-500" /> Check Out Time
              </p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {attendance?.checkOut || '--:--'}
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <FaClock className="text-teal-500" /> Working Hours
              </p>
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
                    Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    {location.accuracy && ` (Accuracy: ${Math.round(location.accuracy)}m)`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Statistics */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FaUserCheck className="text-teal-600" />
              This Month's Summary
            </h3>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
              Current Month
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
              <span className="text-slate-600">Days Present</span>
              <span className="font-bold text-slate-900">{stats.presentDays} / {stats.totalWorkingDays}</span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
              <span className="text-slate-600">Days Late</span>
              <span className="font-bold text-amber-600">{stats.lateDays}</span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
              <span className="text-slate-600">Attendance Rate</span>
              <span className="font-bold text-emerald-600">{stats.attendanceRate}%</span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
              <span className="text-slate-600">Avg. Hours/Day</span>
              <span className="font-bold text-slate-900">{stats.avgHours}h</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">Attendance Policy</p>
                <p className="text-xs text-amber-700 mt-1">
                  • Check-in before 9:30 AM<br/>
                  • Minimum 8 working hours required<br/>
                  • Late arrivals marked after 9:30 AM<br/>
                  • Location verification enabled
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
            onClick={fetchData}
            disabled={loading}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 disabled:opacity-50"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {recentHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaHistory className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500">No attendance records found</p>
            <p className="text-sm text-slate-400 mt-1">Your attendance history will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 text-xs font-bold uppercase text-slate-400">Date</th>
                  <th className="text-left p-3 text-xs font-bold uppercase text-slate-400">In / Out</th>
                  <th className="text-left p-3 text-xs font-bold uppercase text-slate-400">Status</th>
                  <th className="text-left p-3 text-xs font-bold uppercase text-slate-400">Worked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentHistory.map((record, index) => (
                  <tr key={index} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{new Date(record.date).toLocaleDateString()}</p>
                      <p className="text-[10px] text-slate-400 uppercase">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col text-xs">
                         <span className="text-emerald-600 font-bold">IN: {record.checkIn || '--:--'}</span>
                         <span className="text-rose-400 font-medium">OUT: {record.checkOut || '--:--'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-700 text-sm">
                      {getDiff(record.checkIn, record.checkOut)}
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