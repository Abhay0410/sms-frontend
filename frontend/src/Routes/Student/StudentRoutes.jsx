// Routes/Student/StudentRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { FaHome, FaBook, FaChartLine, FaCalendarAlt, FaWallet, FaBell, FaUserCircle, FaEnvelope } from "react-icons/fa";
import StudentDashboardPage from "../../pages/student/StudentDashboardPage.jsx";
import StudentProfileManage from "../../pages/student/StudentProfileManage.jsx";
import MyClasses from "../../pages/student/MyClasses";
import ViewAttendance from "../../pages/student/ViewAttendance";
import ViewTimetable from "../../pages/student/ViewTimetable";
import ViewFeeDetails from "../../pages/student/ViewFeeDetails";
import StudentResults from "../../pages/student/StudentResults";
import StudentAnnouncements from "../../pages/student/Communication/StudentAnnouncements.jsx"; 
import StudentMessages from "../../pages/student/Communication/StudentMessages.jsx"; 

const StudentRoutes = () => {
  const sections = [
    { 
      title: "Dashboard", 
      icon: <FaHome />, 
      path: "student-dashboard" 
    },
    {
      title: "Academic",
      icon: <FaBook />,
      subTabs: [
        { title: "My Classes", path: "my-classes" },
        { title: "Exam Results", path: "results" },
        { title: "Timetable", path: "timetable" }
      ]
    },
    { 
      title: "Attendance", 
      icon: <FaCalendarAlt />, 
      path: "attendance" 
    },
    { 
      title: "Fees", 
      icon: <FaWallet />, 
      path: "fee-details" 
    },
    {
      title: "Communication",
      icon: <FaEnvelope />,
      subTabs: [
        { title: "Announcements", path: "notifications" },
        { title: "Messages", path: "messages" }
      ]
    },
    { 
      title: "Profile", 
      icon: <FaUserCircle />, 
      path: "profile" 
    }
  ];

  return (
    <Routes>
      <Route element={<Layout sections={sections} title="Student Hub" role="student" />}>
        {/* Default redirect to dashboard */}
        <Route index element={<Navigate to="student-dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="student-dashboard" element={<StudentDashboardPage />} />
        
        {/* Profile */}
        <Route path="profile" element={<StudentProfileManage />} />
        
        {/* Academic */}
        <Route path="my-classes" element={<MyClasses />} />
        <Route path="timetable" element={<ViewTimetable />} />  
        <Route path="results" element={<StudentResults />} />
        
        {/* Attendance */}
        <Route path="attendance" element={<ViewAttendance />} />
        
        {/* Fees */}
        <Route path="fee-details" element={<ViewFeeDetails />} />
        
        {/* Communication */}
        <Route path="notifications" element={<StudentAnnouncements />} />
        <Route path="messages" element={<StudentMessages />} />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="student-dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default StudentRoutes;