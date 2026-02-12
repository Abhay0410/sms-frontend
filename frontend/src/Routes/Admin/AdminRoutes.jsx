// src/Routes/Admin/AdminRoutes.jsx - FINAL FIXED
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../../components/Layout";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

// ✅ React Icons
import { 
  FaHome, FaUsers, FaBook, FaMoneyBill, FaFileAlt, 
  FaBullhorn, FaUserCog, FaWallet, FaBookReader 
} from "react-icons/fa";

// ✅ SINGLE PAGE IMPORTS
const AdminDashboardPage = lazy(() => import("../../pages/admin/AdminDashboardPage.jsx"));
const AdminProfileManage = lazy(() => import("../../pages/admin/AdminProfileManage.jsx"));

// ✅ IMPORTANT - YAHAN DEKHO - AdminAnnouncements, AdminAnnouncementPage NAHI
const AdminAnnouncements = lazy(() => import("../../pages/admin/Admin_Features/Communication/announcement.jsx"));

// ✅ ACADEMIC MANAGEMENT
const ClassManagement = lazy(() => import("../../pages/admin/Admin_Features/AcademicManagement/academic.index.js").then(module => ({ default: module.ClassManagement })));
const TeacherManagement = lazy(() => import("../../pages/admin/Admin_Features/AcademicManagement/academic.index.js").then(module => ({ default: module.TeacherManagement })));
const SubjectManagement = lazy(() => import("../../pages/admin/Admin_Features/AcademicManagement/academic.index.js").then(module => ({ default: module.SubjectManagement })));
const TimetableManagement = lazy(() => import("../../pages/admin/Admin_Features/AcademicManagement/academic.index.js").then(module => ({ default: module.TimetableManagement })));

// ✅ FEE MANAGEMENT
const FeeOverview = lazy(() => import("../../pages/admin/Admin_Features/feemanagement/fee.index.js").then(module => ({ default: module.FeeOverview })));
const RecordPayment = lazy(() => import("../../pages/admin/Admin_Features/feemanagement/fee.index.js").then(module => ({ default: module.RecordPayment })));
const PaymentHistory = lazy(() => import("../../pages/admin/Admin_Features/feemanagement/fee.index.js").then(module => ({ default: module.PaymentHistory })));
const SetClassFees = lazy(() => import("../../pages/admin/Admin_Features/feemanagement/fee.index.js").then(module => ({ default: module.SetClassFees })));

// ✅ HR MANAGEMENT
const StaffAttendance = lazy(() => import("../../pages/admin/Admin_Features/HRManagement/hr.index.js").then(module => ({ default: module.StaffAttendance })));
const StaffAttendanceGrid = lazy(() => import("../../pages/admin/Admin_Features/HRManagement/hr.index.js").then(module => ({ default: module.StaffAttendanceGrid })));
const LeaveRequests = lazy(() => import("../../pages/admin/Admin_Features/HRManagement/hr.index.js").then(module => ({ default: module.LeaveRequests })));

// ✅ PAYROLL
const AdminPayrollDashboard = lazy(() => import("../../pages/admin/Admin_Features/Payroll/payroll.index.js").then(module => ({ default: module.AdminPayrollDashboard })));
const SalaryStructureSetup = lazy(() => import("../../pages/admin/Admin_Features/Payroll/payroll.index.js").then(module => ({ default: module.SalaryStructureSetup })));
const MonthlyPayRun = lazy(() => import("../../pages/admin/Admin_Features/Payroll/payroll.index.js").then(module => ({ default: module.MonthlyPayRun })));

// ✅ LIBRARY
const LibraryInventory = lazy(() => import("../../pages/admin/Admin_Features/Library/library.index.js").then(module => ({ default: module.LibraryInventory })));
const BookIssueReturn = lazy(() => import("../../pages/admin/Admin_Features/Library/library.index.js").then(module => ({ default: module.BookIssueReturn })));

// ✅ REGISTRATIONS
const TeacherRegisterForm = lazy(() => import("../../pages/admin/Admin_Features/UserRegistrations/registration.index.js").then(module => ({ default: module.TeacherRegisterForm })));
const StudentParentRegisterForm = lazy(() => import("../../pages/admin/Admin_Features/UserRegistrations/registration.index.js").then(module => ({ default: module.StudentParentRegisterForm })));
const AdminRegister = lazy(() => import("../../pages/admin/Admin_Features/UserRegistrations/registration.index.js").then(module => ({ default: module.AdminRegister })));

// ✅ RESULT MANAGEMENT
const AdminResultManagement = lazy(() => import("../../pages/admin/Admin_Features/ResultManagement/result.index.js").then(module => ({ default: module.AdminResultManagement })));

const AdminRoutes = ({ school }) => {
  const sections = [
    { title: "Dashboard", icon: <FaHome />, path: "admin-dashboard" },
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
      subTabs: [{ title: "Manage Results", path: "result-management" }]
    },
    {
      title: "Staff HR",
      icon: <FaUsers />,
      subTabs: [
        { title: "Staff Attendance", path: "staff-attendance" },
        { title: "Attendance Report", path: "attendance-matrix" },
        { title: "Leave Requests", path: "leave-requests" }
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
        { title: "Issue & Return", path: "library-issue-return" }
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
        
        {/* DASHBOARD */}
        <Route path="admin-dashboard" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AdminDashboardPage school={school} />
          </Suspense>
        } />
        
        {/* REGISTRATIONS */}
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
        
        {/* ACADEMIC */}
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
        
        {/* LIBRARY */}
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
        
        {/* HR */}
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
        
        {/* PAYROLL */}
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
        
        {/* FEE */}
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
        
        {/* RESULT */}
        <Route path="result-management" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AdminResultManagement school={school} />
          </Suspense>
        } />
        
        {/* ✅ COMMUNICATION - FIXED: AdminAnnouncements component */}
        <Route path="announcements" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AdminAnnouncements school={school} />  {/* AdminAnnouncements, Page nahi */}
          </Suspense>
        } />
        
        {/* PROFILE */}
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