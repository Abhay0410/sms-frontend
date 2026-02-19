// pages/student/MyClasses.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api, { API_ENDPOINTS } from "../../services/api";
import BackButton from "../../components/BackButton";
import { 
  FaChalkboard, 
  FaUserGraduate, 
  FaCalendarAlt, 
  FaCheckCircle,
  FaInfoCircle,
  FaBook,
  FaClock
} from "react-icons/fa";

export default function MyClasses() {
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadStudentInfo();
  }, []);

  const loadStudentInfo = async () => {
    try {
      const resp = await api.get(API_ENDPOINTS.STUDENT.AUTH.PROFILE);
      console.log("📥 MyClasses API Response:", resp); // Debug log

      // 1. Extract the main student object
      let student = resp.student || resp.data?.student || resp.data || {};

      // 2. Flatten the data for easier access in JSX
      // We create a new object with safely extracted properties
      const processedStudent = {
        ...student,
        // Safely extract className: Check if it's an object (populated) or string
        className: student.class?.className || student.class || "Not Assigned",
        
        // Safely extract section: Check if it's an object (populated) or string
        section: student.section?.name || student.section || "Not Assigned",
        
        // Ensure roll number exists
        rollNumber: student.rollNumber || "N/A",
        
        // Ensure academic year exists
        academicYear: student.academicYear || "Current",
        
        // Ensure ID exists
        studentID: student.studentID || "N/A",
        
        // Ensure status exists
        status: student.status || "REGISTERED"
      };

      console.log("👤 Processed Student Data:", processedStudent); // Debug log
      setStudentInfo(processedStudent);

    } catch (error) {
      console.error("❌ Load Class Info Error:", error);
      toast.error(error.message || "Failed to load class information");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!studentInfo) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <BackButton to="/student/student-dashboard" />
        <div className="text-center py-12">
          <p className="text-gray-600">Unable to load class information</p>
        </div>
      </div>
    );
  }

  

  const isEnrolled = studentInfo.status === "ENROLLED";
  const isRegistered = studentInfo.status === "REGISTERED";

  const viewTimetable = () => {
  navigate('../timetable');
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <BackButton to="/student/student-dashboard" />

        <div className="mt-6">
          <h2 className="text-3xl font-bold text-gray-900">My Classes</h2>
          <p className="mt-2 text-gray-600">Your academic class and section details</p>
        </div>

        {/* Student Status Banner */}
        <div className={`mt-6 rounded-2xl p-6 shadow-lg ${
          isEnrolled 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
            : 'bg-gradient-to-r from-yellow-500 to-orange-500'
        }`}>
          <div className="flex items-center gap-4">
            {isEnrolled ? (
              <FaCheckCircle className="h-12 w-12 text-white" />
            ) : (
              <FaInfoCircle className="h-12 w-12 text-white" />
            )}
            <div className="text-white">
              <h3 className="text-2xl font-bold">
                {isEnrolled ? 'Enrolled Student' : 'Registration Pending'}
              </h3>
              <p className="text-white/90">
                {isEnrolled 
                  ? 'You are successfully enrolled in your class'
                  : 'Waiting for section assignment by administrator'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Main Class Information */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Class Details Card */}
          <div className="lg:col-span-2 rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-blue-100 p-3">
                <FaChalkboard className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Class Information</h3>
            </div>

            <div className="space-y-6">
              {/* Class & Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 border border-blue-100">
                  <p className="text-sm font-medium text-gray-600 mb-2">Class</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {studentInfo.className}
                  </p>
                </div>

                <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-6 border border-purple-100">
                  <p className="text-sm font-medium text-gray-600 mb-2">Section</p>
                  <p className="text-4xl font-bold text-purple-600">
                    {studentInfo.section || 'Not Assigned'}
                  </p>
                </div>
              </div>

              {/* Roll Number */}
              {isEnrolled && studentInfo.rollNumber && (
                <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Roll Number</p>
                      <p className="text-3xl font-bold text-green-600">
                        {studentInfo.rollNumber}
                      </p>
                    </div>
                    <FaUserGraduate className="h-12 w-12 text-green-400" />
                  </div>
                </div>
              )}

              {/* Academic Year */}
              <div className="rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 p-6 border border-orange-100">
                <div className="flex items-center gap-4">
                  <FaCalendarAlt className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Academic Year</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {studentInfo.academicYear}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Quick Info Card */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Enrollment Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isEnrolled 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    {studentInfo.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Student ID</span>
                  <span className="font-mono font-bold text-gray-900">
                    {studentInfo.studentID}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {isEnrolled && (
              <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 shadow-lg text-white">
                <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
                <div className="space-y-3">
                  <button className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-white/20 hover:bg-white/30 transition">
                    <FaBook className="h-5 w-5" />
                    <span className="font-medium">View Subjects</span>
                  </button>
                  <button  onClick={viewTimetable}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-white/20 hover:bg-white/30 transition">
                    <FaClock className="h-5 w-5" />
                    <span className="font-medium">View Timetable</span>
                  </button>
                </div>
              </div>
            )}

            {/* Waiting Message for Registered Students */}
            {isRegistered && (
              <div className="rounded-2xl bg-yellow-50 p-6 border-2 border-yellow-200">
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-2">
                      Section Assignment Pending
                    </h4>
                    <p className="text-sm text-yellow-800">
                      Your class section and roll number will be assigned by the administrator soon. 
                      You'll be notified once the assignment is complete.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Parent Information (if available) */}
        {studentInfo.parentId && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Parent/Guardian</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">{studentInfo.parentId.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{studentInfo.parentId.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">{studentInfo.parentId.phone}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
