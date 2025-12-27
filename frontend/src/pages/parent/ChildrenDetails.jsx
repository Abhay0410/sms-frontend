// pages/parent/ChildrenDetails.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../services/api";
import BackButton from "../../components/BackButton";
import OptimizedImage from "../../components/OptimizedImage";
import { 
  FaUserGraduate, 
  FaChalkboard, 
  FaCheckCircle,
  FaCalendarAlt,
  FaDollarSign,
  FaInfoCircle,
  FaExclamationTriangle,
  FaPhone,
  FaEnvelope,
  FaBook,
  FaClock,
  FaChartLine,
  FaGraduationCap,
  FaHashtag,
  FaChartBar // ✅ NEW: Added for Results
} from "react-icons/fa";

export default function ChildrenDetails() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [subjectsCount, setSubjectsCount] = useState(0);

  const loadChildren = useCallback(async () => {
  try {
    const resp = await api.get(API_ENDPOINTS.PARENT.AUTH.PROFILE);
    console.log("👪 Parent PROFILE raw resp (ChildrenDetails):", resp);

    // Axios interceptor: resp = { success, message, data: { parent } }
    const parent = resp?.data?.parent || resp?.parent || {};
    const childrenData = Array.isArray(parent.children) ? parent.children : [];

    console.log("Resolved childrenData:", childrenData);

    setChildren(childrenData);

    if (childrenData.length > 0) {
      setSelectedChild(childrenData[0]);
    } else {
      setSelectedChild(null);
    }
  } catch (error) {
    console.error("Load error:", error);
    toast.error(error.message || "Failed to load children information");
    setChildren([]);
    setSelectedChild(null);
  } finally {
    setLoading(false);
  }
}, []);

  const loadAttendanceData = useCallback(async () => {
    if (!selectedChild) return;
    
    try {
      const resp = await api.get(API_ENDPOINTS.PARENT.ATTENDANCE.CHILD(selectedChild._id));
      setAttendanceData(resp?.data || resp);
    } catch (error) {
      console.error("Attendance load error:", error);
      setAttendanceData(null);
    }
  }, [selectedChild]);

  const loadSubjectsData = useCallback(async () => {
    if (!selectedChild) return;
    
    try {
      const resp = await api.get(API_ENDPOINTS.PARENT.TIMETABLE.CHILD(selectedChild._id));
      const timetableData = resp?.timetable || resp?.data?.timetable || {};
      const subjects = new Set();
      
      Object.values(timetableData).forEach(day => {
        day.periods?.forEach(period => {
          if (period.subject) subjects.add(period.subject);
        });
      });
      
      setSubjectsCount(subjects.size);
    } catch (error) {
      console.error("Subjects load error:", error);
      setSubjectsCount(0);
    }
  }, [selectedChild]);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  useEffect(() => {
    if (selectedChild) {
      loadAttendanceData();
      loadSubjectsData();
    }
  }, [selectedChild, loadAttendanceData, loadSubjectsData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-slate-700">Loading children...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <BackButton to="/parent/parent-dashboard" />

        <div className="mt-6">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">My Children</h2>
          <p className="mt-2 text-slate-600 flex items-center gap-2">
            <FaUserGraduate className="text-green-600" />
            Academic details and class information for your children
          </p>
        </div>

        {children.length === 0 ? (
          <div className="mt-12 text-center py-16 rounded-2xl bg-white shadow-lg border border-slate-100">
            <div className="mx-auto w-fit rounded-full bg-green-50 p-6">
              <FaUserGraduate className="h-16 w-16 text-green-400" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-900">No Children Found</h3>
            <p className="mt-2 text-slate-600">No student records are linked to your account</p>
          </div>
        ) : (
          <>
            {children.length > 1 && (
              <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
                {children.map((child) => (
                  <button
                    key={child._id}
                    onClick={() => setSelectedChild(child)}
                    className={`flex-shrink-0 rounded-xl px-6 py-3 font-semibold transition-all ${
                      selectedChild?._id === child._id
                        ? "bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg scale-105"
                        : "bg-white text-slate-700 border-2 border-slate-200 hover:border-green-300"
                    }`}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            )}

            {selectedChild && (
              <ChildDetailView 
                child={selectedChild}
                navigate={navigate}
                attendanceData={attendanceData}
                subjectsCount={subjectsCount}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ChildDetailView({ child, navigate, attendanceData, subjectsCount }) {
  const isEnrolled = child.status === "ENROLLED";
  const isRegistered = child.status === "REGISTERED";
  const hasFeesDue = child.feeDetails && child.feeDetails.pendingAmount > 0;

  const photoUrl = child.photo ? `/uploads/Student/${child.photo}` : `/assets/default-student-avatar.png`;

  const attendancePercentage = attendanceData?.attendancePercentage || 
    (attendanceData?.totalPresent && attendanceData?.totalDays 
      ? ((attendanceData.totalPresent / attendanceData.totalDays) * 100).toFixed(1)
      : '--');

  return (
    <div className="mt-8 space-y-6">
      {/* Header Card */}
      <div className={`rounded-2xl shadow-lg overflow-hidden ${
        isEnrolled 
          ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
          : 'bg-gradient-to-r from-yellow-500 to-orange-500'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100">
                <OptimizedImage
                  src={photoUrl}
                  alt={child.name}
                  className="h-full w-full object-cover"
                  width={96}
                  height={96}
                />
              </div>
              
              <div className="text-white">
                <h3 className="text-3xl font-bold">{child.name}</h3>
                <p className="text-white/90 font-medium text-lg">{child.studentID}</p>
                <p className="text-white/90">{child.email}</p>
                
                {child.className && (
                  <div className="flex items-center gap-2 mt-1">
                    <FaGraduationCap className="h-4 w-4 text-white/80" />
                    <span className="text-white/90 text-sm">
                      Class {child.className} {child.section && `- ${child.section}`}
                    </span>
                  </div>
                )}
                {child.rollNumber && (
                  <div className="flex items-center gap-2 mt-1">
                    <FaHashtag className="h-3 w-3 text-white/80" />
                    <span className="text-white/90 text-sm">Roll No: {child.rollNumber}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isEnrolled ? (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <FaCheckCircle className="h-6 w-6 text-white" />
                  <span className="text-white font-bold text-lg">ENROLLED</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <FaInfoCircle className="h-6 w-6 text-white" />
                  <span className="text-white font-bold text-lg">{child.status}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats - Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate(`/parent/attendance?childId=${child._id}`)}
          className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 border border-blue-200 hover:shadow-lg transition-all group text-left"
        >
          <div className="flex items-center gap-3">
            <FaClock className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs text-blue-700 font-medium">Attendance</p>
              <p className="text-2xl font-bold text-blue-900">{attendancePercentage}%</p>
            </div>
          </div>
        </button>

        {/* ✅ NEW RESULTS BUTTON */}
        <button
          onClick={() => navigate(`/parent/child-results?childId=${child._id}`)}
          className="rounded-xl bg-gradient-to-br from-purple-50 to-indigo-100 p-6 border border-purple-200 hover:shadow-lg transition-all group text-left"
        >
          <div className="flex items-center gap-3">
            <FaChartBar className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs text-purple-700 font-medium">Results</p>
              <p className="text-2xl font-bold text-purple-900">View Grades</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate(`/parent/timetable?childId=${child._id}`)}
          className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100 p-6 border border-emerald-200 hover:shadow-lg transition-all group text-left"
        >
          <div className="flex items-center gap-3">
            <FaBook className="h-8 w-8 text-emerald-600 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs text-emerald-700 font-medium">Subjects</p>
              <p className="text-2xl font-bold text-emerald-900">{subjectsCount || '--'}</p>
            </div>
          </div>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Class Information */}
          <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FaChalkboard className="text-green-600" />
              Class Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-4 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <FaChalkboard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">Class</p>
                    <p className="text-2xl font-bold text-blue-600">{child.className}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-4 border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <FaUserGraduate className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">Section</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {child.section || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {isEnrolled && child.rollNumber && (
                <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-4 border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-100 p-2">
                      <FaCheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600">Roll No</p>
                      <p className="text-2xl font-bold text-green-600">{child.rollNumber}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 p-4 border border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-100 p-2">
                    <FaCalendarAlt className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">Academic Year</p>
                    <p className="text-lg font-bold text-orange-600">{child.academicYear}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FaPhone className="text-green-600" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <FaEnvelope className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-600">Email</p>
                  <p className="text-sm font-medium text-slate-900">{child.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <FaPhone className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-600">Phone</p>
                  <p className="text-sm font-medium text-slate-900">{child.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Fee Information */}
          {child.feeDetails && (
            <div className={`rounded-2xl p-6 shadow-lg border-2 ${
              hasFeesDue 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FaDollarSign className={hasFeesDue ? 'text-red-600' : 'text-green-600'} />
                Fee Status
              </h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-white rounded-xl">
                  <p className="text-sm text-slate-600">Total Fee</p>
                  <p className="text-3xl font-bold text-slate-900">
                    ₹{child.feeDetails.totalFee?.toLocaleString() || 0}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-xs text-slate-600">Paid</p>
                    <p className="text-xl font-bold text-green-600">
                      ₹{child.feeDetails.paidAmount?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-xs text-slate-600">Pending</p>
                    <p className={`text-xl font-bold ${hasFeesDue ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{child.feeDetails.pendingAmount?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>

                {hasFeesDue && (
                  <div className="mt-3 flex items-center gap-2 p-3 bg-red-100 rounded-lg">
                    <FaExclamationTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm font-semibold text-red-800">Fee payment pending</p>
                  </div>
                )}

                <button 
                  onClick={() => navigate('/parent/fee-details')}
                  className="w-full rounded-lg bg-gradient-to-r from-green-600 to-teal-600 px-4 py-3 font-semibold text-white hover:shadow-lg transition-all"
                >
                  Pay Now
                </button>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {isRegistered && (
            <div className="rounded-2xl bg-yellow-50 p-6 border-2 border-yellow-200">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-yellow-900 mb-2">Section Assignment Pending</h4>
                  <p className="text-sm text-yellow-800">
                    Your child's section and roll number will be assigned by the administrator soon.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={() => navigate(`/parent/timetable?childId=${child._id}`)}
                className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border-2 border-transparent transition-all flex items-center gap-3 group"
              >
                <FaClock className="text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-slate-700 group-hover:text-blue-600">View Timetable</span>
              </button>
              
              <button 
                onClick={() => navigate(`/parent/attendance?childId=${child._id}`)}
                className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-green-50 hover:border-green-200 border-2 border-transparent transition-all flex items-center gap-3 group"
              >
                <FaCalendarAlt className="text-green-600 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-slate-700 group-hover:text-green-600">Attendance Report</span>
              </button>
              
              {/* ✅ NEW: Results Quick Link */}
              <button 
                onClick={() => navigate(`/parent/child-results?childId=${child._id}`)}
                className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border-2 border-transparent transition-all flex items-center gap-3 group"
              >
                <FaChartBar className="text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-slate-700 group-hover:text-purple-600">View Results</span>
              </button>
              
              <button 
                onClick={() => navigate('/parent/fee-details')}
                className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-orange-50 hover:border-orange-200 border-2 border-transparent transition-all flex items-center gap-3 group"
              >
                <FaDollarSign className="text-orange-600 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-slate-700 group-hover:text-orange-600">Pay Fees</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}