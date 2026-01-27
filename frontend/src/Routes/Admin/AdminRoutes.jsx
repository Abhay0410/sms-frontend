// src/Routes/Admin/AdminRoutes.jsx
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
import SalarySetup from "../../pages/admin/Admin_Features/HRManagement/SalarySetup.jsx";
import TeacherPayrollHistory from "../../pages/admin/Admin_Features/HRManagement/TeacherPayrollHistory.jsx";
import PayrollManager from "../../pages/admin/Admin_Features/HRManagement/PayrollManager.jsx";
import PayrollList from "../../pages/admin/Admin_Features/HRManagement/PayrollList.jsx";

const AdminRoutes = () => { 
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
      icon: <FaUsers />, // Ya koi HR specific icon
      subTabs: [
        { title: "Staff Attendance", path: "staff-attendance" },
        { title: "Leave Requests", path: "leave-requests" },
        { title: "Salary Setup", path: "salary-setup" },
        { title: "Payroll Manager", path: "payroll-manager" },
        { title: "Payroll List", path: "payroll-list" }   

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
      <Route element={<Layout sections={sections} title="Admin Panel" role="admin" />}>
        {/* Default to Admin Dashboard */}
        <Route index element={<Navigate to="admin-dashboard" replace />} />
        <Route path="admin-dashboard" element={<AdminDashboardPage />} />  
        
        {/* User Registration Routes */}
        <Route path="register-teacher" element={<TeacherRegisterForm />} />
        <Route path="register-student" element={<StudentParentRegisterForm />} />
        <Route path="admin-register" element={<AdminRegister />} />
        
        {/* Academic Management Routes */}
        <Route path="class-management" element={<ClassManagement />} />
        <Route path="teacher-management" element={<TeacherManagement />} />
        <Route path="student-management" element={<StudentManagement />} />
        <Route path="subject-management" element={<SubjectManagement />} />
        <Route path="timetable-management" element={<TimetableManagement />} />
        
        {/* HR Management Routes */}
        <Route path="staff-attendance" element={<StaffAttendance />} />
        <Route path="leave-requests" element={<LeaveRequests />} />
        <Route path="teacher-payroll-history/:teacherId" element={<TeacherPayrollHistory />} />
        <Route path="salary-setup" element={<SalarySetup />} />
        <Route path="payroll-manager" element={<PayrollManager />} />
        <Route path="payroll-list" element={<PayrollList />} />

        

        {/* Fee Management */}
        <Route path="fee-management" element={<FeeManagementDashboard />} />
        
        {/* Result Management Routes */}
        <Route path="result-management" element={<AdminResultManagement />} />
        <Route path="results/:id/view" element={<AdminViewResult />} />
        
        {/* Communication */}
        <Route path="announcements" element={<AdminAnnouncementPage />} />
        
        {/* Profile */}
        <Route path="profile" element={<AdminProfileManage />} />
        
        {/* Catch-all route - redirect to dashboard */}
        <Route path="*" element={<Navigate to="admin-dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;