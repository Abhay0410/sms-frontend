// src/Routes/Admin/AdminRoutes.jsx - UPDATED WITH CODE SPLITTING
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { FaHome, FaUsers, FaBook, FaChartBar, FaMoneyBill, FaFileAlt, FaBullhorn, FaUserCog ,FaWallet,FaBookReader } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";

// Lazy load heavy components
const AdminDashboardPage = lazy(() => import("../../pages/admin/AdminDashboardPage.jsx"));
const TeacherRegisterForm = lazy(() => import("../../pages/admin/Admin_Features/UserRegistrations/TeacherRegisterForm.jsx"));
const AdminProfileManage = lazy(() => import("../../pages/admin/AdminProfileManage.jsx"));
const StudentParentRegisterForm = lazy(() => import("../../pages/admin/Admin_Features/UserRegistrations/StudentParentRegisterForm.jsx"));
const TeacherManagement = lazy(() => import("../../pages/admin/Admin_Features/AcademicManagement/TeacherManagement.jsx"));
const ClassManagement = lazy(() => import("../../pages/admin/Admin_Features/AcademicManagement/ClassManagement.jsx"));
const StudentManagement = lazy(() => import("../../pages/admin/Admin_Features/AcademicManagement/StudentManagement.jsx"));
const SubjectManagement = lazy(() => import("../../pages/admin/Admin_Features/AcademicManagement/SubjectManagement.jsx"));
const TimetableManagement = lazy(() => import("../../pages/admin/Admin_Features/AcademicManagement/TimetableManagement.jsx"));
const FeeOverview = lazy(() => import("../../pages/admin/Admin_Features/feemanagement/FeeOverview.jsx"));
const SetClassFees = lazy(() => import("../../pages/admin/Admin_Features/feemanagement/SetClassFees.jsx"));
const RecordPayment = lazy(() => import("../../pages/admin/Admin_Features/feemanagement/RecordPayment.jsx"));
const PaymentHistory = lazy(() => import("../../pages/admin/Admin_Features/feemanagement/PaymentHistory.jsx"));
const AdminResultManagement = lazy(() => import("../../pages/admin/Admin_Features/ResultManagement/AdminResultManagement.jsx"));
const AdminAnnouncementPage = lazy(() => import("../../pages/admin/Admin_Features/Communication/annoucment.jsx"));
const AdminRegister = lazy(() => import("../../pages/admin/Admin_Features/UserRegistrations/AdminRegisterForm.jsx"));
const StaffAttendance = lazy(() => import("../../pages/admin/Admin_Features/HRManagement/StaffAttendance.jsx"));
const LeaveRequests = lazy(() => import("../../pages/admin/Admin_Features/HRManagement/LeaveRequests.jsx"));
const StaffAttendanceGrid = lazy(() => import("../../pages/admin/Admin_Features/HRManagement/StaffAttendanceGrid.jsx"));
const AdminPayrollDashboard = lazy(() => import("../../pages/admin/Admin_Features/Payroll/AdminPayrollDashboard.jsx"));
const SalaryStructureSetup = lazy(() => import("../../pages/admin/Admin_Features/Payroll/SalaryStructureSetup.jsx"));
const MonthlyPayRun = lazy(() => import("../../pages/admin/Admin_Features/Payroll/MonthlyPayRun.jsx"));
const LibraryInventory = lazy(() => import("../../pages/admin/Admin_Features/Library/LibraryInventory.jsx"));
const BookIssueReturn = lazy(() => import("../../pages/admin/Admin_Features/Library/BookIssueReturn.jsx"));

const AdminRoutes = ({ school }) => {
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
        { title: "Subject Management", path: "subject-management" },
        { title: "Timetable Management", path: "timetable-management" }
      ]
    },
    {
      title: "Fee Management",
      icon: <FaMoneyBill />,
      subTabs: [
        { title: "Overview", path: "fee-overview" },
        { title: "Record Payment", path: "fee-record-payment" },
        { title: "Payment History", path: "fee-history" },
        { title: "Set Class Fees", path: "fee-structure" }
      ]
    },
    {
      title: "Result Management",
      icon: <FaFileAlt />,
      subTabs: [
        { title: "Manage Results", path: "result-management" },
      ]
    },
    {
      title: "Staff HR",
      icon: <FaUsers />,
      subTabs: [
        { title: "Staff Attendance", path: "staff-attendance" },
        { title: "Attendance Report", path: "attendance-matrix" },
        { title: "Leave Requests", path: "leave-requests" },  
      ]
    },
    {
      title: "Payroll & Salary",
      icon: <FaWallet />,
      subTabs: [
        { title: "Payroll Dashboard", path: "payroll-dashboard" },
        { title: "Salary Setup", path: "salary-setup" },
        { title: "Monthly Pay-Run", path: "monthly-payrun" }
      ]
    },
    {
      title: "Library Management", 
      icon: <FaBookReader />,
      subTabs: [
        { title: "Book Inventory", path: "library-inventory" },
        { title: "Issue & Return", path: "library-issue-return" },
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
      <Route element={
        <Suspense fallback={<LoadingSpinner />}>
          <Layout sections={sections} title={`${school?.schoolName || 'Admin'} Panel`} role="admin" />
        </Suspense>
      }>
        <Route index element={<Navigate to="admin-dashboard" replace />} />
        
        {/* Wrap each route in Suspense for individual loading */}
        <Route path="admin-dashboard" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AdminDashboardPage school={school} />
          </Suspense>
        } />
        
        <Route path="register-teacher" element={
          <Suspense fallback={<LoadingSpinner />}>
            <TeacherRegisterForm school={school} />
          </Suspense>
        } />
        
        <Route path="register-student" element={
          <Suspense fallback={<LoadingSpinner />}>
            <StudentParentRegisterForm school={school} />
          </Suspense>
        } />
        
        <Route path="admin-register" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AdminRegister school={school} />
          </Suspense>
        } />
        
        <Route path="class-management" element={
          <Suspense fallback={<LoadingSpinner />}>
            <ClassManagement school={school} />
          </Suspense>
        } />
        
        <Route path="teacher-management" element={
          <Suspense fallback={<LoadingSpinner />}>
            <TeacherManagement school={school} />
          </Suspense>
        } />
        
        <Route path="student-management" element={
          <Suspense fallback={<LoadingSpinner />}>
            <StudentManagement school={school} />
          </Suspense>
        } />
        
        <Route path="subject-management" element={
          <Suspense fallback={<LoadingSpinner />}>
            <SubjectManagement school={school} />
          </Suspense>
        } />
        
        <Route path="timetable-management" element={
          <Suspense fallback={<LoadingSpinner />}>
            <TimetableManagement school={school} />
          </Suspense>
        } />
        
        <Route path="library-inventory" element={
          <Suspense fallback={<LoadingSpinner />}>
            <LibraryInventory school={school} />
          </Suspense>
        } />
        
        <Route path="library-issue-return" element={
          <Suspense fallback={<LoadingSpinner />}>
            <BookIssueReturn school={school} />
          </Suspense>
        } />
        
        <Route path="staff-attendance" element={
          <Suspense fallback={<LoadingSpinner />}>
            <StaffAttendance />
          </Suspense>
        } />
        
        <Route path="attendance-matrix" element={
          <Suspense fallback={<LoadingSpinner />}>
            <StaffAttendanceGrid />
          </Suspense>
        } />
        
        <Route path="leave-requests" element={
          <Suspense fallback={<LoadingSpinner />}>
            <LeaveRequests />
          </Suspense>
        } />
        
        <Route path="payroll-dashboard" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AdminPayrollDashboard school={school} />
          </Suspense>
        } />
        
        <Route path="salary-setup" element={
          <Suspense fallback={<LoadingSpinner />}>
            <SalaryStructureSetup school={school} />
          </Suspense>
        } />
        
        <Route path="monthly-payrun" element={
          <Suspense fallback={<LoadingSpinner />}>
            <MonthlyPayRun school={school} />
          </Suspense>
        } />
        
        <Route path="fee-overview" element={
          <Suspense fallback={<LoadingSpinner />}>
            <FeeOverview school={school} />
          </Suspense>
        } />
        
        <Route path="fee-record-payment" element={
          <Suspense fallback={<LoadingSpinner />}>
            <RecordPayment school={school} />
          </Suspense>
        } />
        
        <Route path="fee-history" element={
          <Suspense fallback={<LoadingSpinner />}>
            <PaymentHistory school={school} />
          </Suspense>
        } />
        
        <Route path="fee-structure" element={
          <Suspense fallback={<LoadingSpinner />}>
            <SetClassFees school={school} />
          </Suspense>
        } />
        
        <Route path="result-management" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AdminResultManagement school={school} />
          </Suspense>
        } />
        
        <Route path="announcements" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AdminAnnouncementPage school={school} />
          </Suspense>
        } />
        
        <Route path="profile" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AdminProfileManage school={school} />
          </Suspense>
        } />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;