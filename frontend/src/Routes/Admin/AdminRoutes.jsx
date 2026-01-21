// src/Routes/Admin/AdminRoutes.jsx - UPDATED
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { FaHome, FaUsers, FaBook, FaChartBar, FaMoneyBill, FaFileAlt, FaBullhorn, FaUserCog } from "react-icons/fa";
import AdminDashboardPage from "../../pages/admin/AdminDashboardPage.jsx";
import TeacherRegisterForm from "../../pages/admin/Admin_Features/UserRegistrations/TeacherRegisterForm.jsx";
import AdminProfileManage from "../../pages/admin/AdminProfileManage.jsx";
import StudentParentRegisterForm from "../../pages/admin/Admin_Features/UserRegistrations/StudentParentRegisterForm.jsx";
import TeacherManagement from "../../pages/admin/Admin_Features/AcademicManagement/TeacherManagement.jsx";
import ClassManagement from "../../pages/admin/Admin_Features/AcademicManagement/ClassManagement.jsx";
import StudentManagement from "../../pages/admin/Admin_Features/AcademicManagement/StudentManagement.jsx";
import SubjectManagement from "../../pages/admin/Admin_Features/AcademicManagement/SubjectManagement.jsx";
import TimetableManagement from "../../pages/admin/Admin_Features/AcademicManagement/TimetableManagement.jsx";
import FeeManagementDashboard from "../../pages/admin/Admin_Features/feemanagement/FeeManagementDashboard.jsx";
import AdminResultManagement from "../../pages/admin/Admin_Features/ResultManagement/AdminResultManagement.jsx";
import AdminViewResult from "../../pages/admin/Admin_Features/ResultManagement/AdminViewResult.jsx";
import AdminAnnouncementPage from "../../pages/admin/Admin_Features/Communication/annoucment.jsx";
import AdminRegister from "../../pages/admin/Admin_Features/UserRegistrations/AdminRegisterForm.jsx";
import StaffAttendance from "../../pages/admin/Admin_Features/HRManagement/StaffAttendance.jsx";
import LeaveRequests from "../../pages/admin/Admin_Features/HRManagement/LeaveRequests.jsx";

const AdminRoutes = ({ school }) => { // ✅ Accept school prop
  // Define Sidebar Sections here
  const sections = [
    { 
      title: "Dashboard", 
      icon: <FaHome />, 
      path: "admin-dashboard" 
    },
    { 
      title: "User Registration", 
      icon: <FaUsers />,
      subTabs: [
        { title: "Teacher Register", path: "register-teacher" },
        { title: "Student Register", path: "register-student" },
        { title: "Admin Register", path: "admin-register" }
      ]
    },
    {
      title: "Academic Management",
      icon: <FaBook />,
      subTabs: [
        { title: "Class Management", path: "class-management" },
        { title: "Teacher Management", path: "teacher-management" },
        { title: "Student Management", path: "student-management" },
        { title: "Subject Management", path: "subject-management" },
        { title: "Timetable Management", path: "timetable-management" }
      ]
    },
    {
      title: "Fee Management",
      icon: <FaMoneyBill />,
      path: "fee-management"
    },
    {
      title: "Result Management",
      icon: <FaFileAlt />,
      subTabs: [
        { title: "Manage Results", path: "result-management" },
        { title: "View Results", path: "results/:id/view" }
      ]
    },
    {
      title: "Staff HR",
      icon: <FaUsers />,
      subTabs: [
        { title: "Staff Attendance", path: "staff-attendance" },
        { title: "Leave Requests", path: "leave-requests" }
      ]
    },
    {
      title: "Communication",
      icon: <FaBullhorn />,
      path: "announcements"
    },
    {
      title: "Profile",
      icon: <FaUserCog />,
      path: "profile"
    }
  ];

  return (
    <Routes>
      {/* All routes inside this Route will share the Sidebar and Layout */}
      <Route element={<Layout sections={sections} title={`${school?.schoolName || 'Admin'} Panel`} role="admin" />}>
        {/* ✅ index means exactly /school/:slug/admin/ */}
        <Route index element={<Navigate to="admin-dashboard" replace />} />
        
        {/* ✅ These paths are RELATIVE to /school/:slug/admin/ */}
        <Route path="admin-dashboard" element={<AdminDashboardPage school={school} />} />  
        
        {/* User Registration Routes */}
        <Route path="register-teacher" element={<TeacherRegisterForm school={school} />} />
        <Route path="register-student" element={<StudentParentRegisterForm school={school} />} />
        <Route path="admin-register" element={<AdminRegister school={school} />} />
        
        {/* Academic Management Routes */}
        <Route path="class-management" element={<ClassManagement school={school} />} />
        <Route path="teacher-management" element={<TeacherManagement school={school} />} />
        <Route path="student-management" element={<StudentManagement school={school} />} />
        <Route path="subject-management" element={<SubjectManagement school={school} />} />
        <Route path="timetable-management" element={<TimetableManagement school={school} />} />
        
        {/* HR Management Routes */}
        <Route path="staff-attendance" element={<StaffAttendance school={school} />} />
        <Route path="leave-requests" element={<LeaveRequests school={school} />} />

        {/* Fee Management */}
        <Route path="fee-management" element={<FeeManagementDashboard school={school} />} />
        
        {/* Result Management Routes */}
        <Route path="result-management" element={<AdminResultManagement school={school} />} />
        <Route path="results/:id/view" element={<AdminViewResult school={school} />} />
        
        {/* Communication */}
        <Route path="announcements" element={<AdminAnnouncementPage school={school} />} />
        
        {/* Profile */}
        <Route path="profile" element={<AdminProfileManage school={school} />} />
        
        {/* ❌ REMOVED: The catch-all here was also forcing reloads */}
      </Route>
    </Routes>
  );
};

export default AdminRoutes;