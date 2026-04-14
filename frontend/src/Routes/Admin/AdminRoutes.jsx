// src/Routes/Admin/AdminRoutes.jsx - UPDATED
import { useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  FaHome,
  FaUsers,
  FaBook,
  FaMoneyBill,
  FaFileAlt,
  FaBullhorn,
  FaUserCog,
  FaWallet,
  FaBookReader,
} from "react-icons/fa";
import AdminDashboardPage from "../../pages/admin/AdminDashboardPage.jsx";
import TeacherRegisterForm from "../../pages/admin/Admin_Features/UserRegistrations/TeacherRegisterForm.jsx";
import AdminProfileManage from "../../pages/admin/AdminProfileManage.jsx";
import StudentParentRegisterForm from "../../pages/admin/Admin_Features/UserRegistrations/StudentParentRegisterForm.jsx";
import TeacherManagement from "../../pages/admin/Admin_Features/AcademicManagement/TeacherManagement.jsx";
import ClassManagement from "../../pages/admin/Admin_Features/AcademicManagement/ClassManagement.jsx";
import StudentManagement from "../../pages/admin/Admin_Features/AcademicManagement/StudentManagement.jsx";
import SubjectManagement from "../../pages/admin/Admin_Features/AcademicManagement/SubjectManagement.jsx";
import TimetableManagement from "../../pages/admin/Admin_Features/AcademicManagement/TimetableManagement.jsx";
import FeeOverview from "../../pages/admin/Admin_Features/feemanagement/FeeOverview.jsx";
import SetClassFees from "../../pages/admin/Admin_Features/feemanagement/SetClassFees.jsx";
import RecordPayment from "../../pages/admin/Admin_Features/feemanagement/RecordPayment.jsx";
import PaymentHistory from "../../pages/admin/Admin_Features/feemanagement/PaymentHistory.jsx";
import AdminResultManagement from "../../pages/admin/Admin_Features/ResultManagement/AdminResultManagement.jsx";
import AdminAnnouncementPage from "../../pages/admin/Admin_Features/Communication/announcement.jsx";
import AdminRegister from "../../pages/admin/Admin_Features/UserRegistrations/AdminRegisterForm.jsx";
import StaffAttendance from "../../pages/admin/Admin_Features/HRManagement/StaffAttendance.jsx";
import LeaveRequests from "../../pages/admin/Admin_Features/HRManagement/LeaveRequests.jsx";
import StaffAttendanceGrid from "../../pages/admin/Admin_Features/HRManagement/StaffAttendanceGrid.jsx";
import AdminPayrollDashboard from "../../pages/admin/Admin_Features/Payroll/AdminPayrollDashboard.jsx";
import SalaryStructureSetup from "../../pages/admin/Admin_Features/Payroll/SalaryStructureSetup.jsx";
import MonthlyPayRun from "../../pages/admin/Admin_Features/Payroll/MonthlyPayRun.jsx";
import BookIssueReturn from "../../pages/admin/Admin_Features/Library/BookIssueReturn.jsx";
import LibraryInventory from "../../pages/admin/Admin_Features/Library/LibraryInventory.jsx";
import BulkImport from "../../pages/admin/Admin_Features/Settings/BulkImport.jsx";
import  {FaPhone} from "react-icons/fa";
import EnquiryPage from "../../pages/admin/Admin_Features/Enquiry/EnquiryPage.jsx";
const AdminRoutes = ({ school }) => {
  // ✅ Accept school prop
  // 1. Logged in user ki details lein
  const adminData = useMemo(() => {
    try {
      const data = localStorage.getItem("admin");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }, []);

  const designation = adminData?.designation || "";
  // Force boolean conversion to avoid string "false" issues
  const isSuperAdmin = adminData?.isSuperAdmin === true;

  // Define Sidebar Sections here
  const filteredSections = useMemo(() => {
    const allSections = [
      {
        title: "Dashboard",
        icon: <FaHome />,
        path: "admin-dashboard",
      },
      {
        title: "User Registration",
        icon: <FaUsers />,
        subTabs: [
          { title: "Teacher Register", path: "register-teacher" },
          { title: "Student Register", path: "register-student" },
          { title: "Admin Register", path: "admin-register" },
          
        ],
        visibleTo: ["Principal", "Administrator"],
      },
      {title:"Bulk Imports",
        icon:<FaFileAlt size={20}/>,
        subTabs:[{ title: "Academic Import", path: "bulk-import-academic" },
              { title: "Teacher Import", path: "bulk-import-teacher" },
              { title: "Student Import", path: "bulk-import-student" },
              { title: "Fee Head Import", path: "bulk-import-fee" },
              { title: "Fee Payment Import", path: "bulk-import-payment" },
            ],
        visibleTo: ["Principal", "Administrator"],
      },
      {
        title: "Academic Management",
        icon: <FaBook />,
        subTabs: [
          { title: "Class Management", path: "class-management" },
          { title: "Teacher Management", path: "teacher-management" },
          { title: "Student Management", path: "student-management" },
          { title: "Subject Management", path: "subject-management" },
          { title: "Timetable Management", path: "timetable-management" },
        ],
        visibleTo: ["Principal", "Administrator", "Vice Principal"],
      },
      {
        title: "Fee Management",
        icon: <FaMoneyBill />,
        subTabs: [
          { title: "Overview", path: "fee-overview" },
          { title: "Record Payment", path: "fee-record-payment" },
          { title: "Payment History", path: "fee-history" },
          { title: "Set Class Fees", path: "fee-structure" },
        ],
        visibleTo: ["Principal", "Accountant"],
      },
      {
        title: "Result Management",
        icon: <FaFileAlt />,
        subTabs: [{ title: "Manage Results", path: "result-management" }],
        visibleTo: ["Principal", "Administrator", "Vice Principal"],
      },
      {
        title: "Staff HR",
        icon: <FaUsers />,
        subTabs: [
          { title: "Staff Attendance", path: "staff-attendance" },
          { title: "Leave Requests", path: "leave-requests" },
          { title: "Attendance Grid", path: "staff-attandance-grid" },
        ],
        visibleTo: ["Principal", "Administrator", "HR Manager"],
      },
      {
        title: "Payroll & Salary",
        icon: <FaWallet />,
        subTabs: [
          { title: "Payroll Dashboard", path: "payroll-dashboard" },
          { title: "Salary Setup", path: "salary-setup" },
          { title: "Monthly Pay-Run", path: "monthly-payrun" },
        ],
        visibleTo: ["Principal", "Accountant", "HR Manager"],
      },
      {
        title: "Library",
        icon: <FaBookReader />,
        subTabs: [
          { title: "Book Circulation", path: "library-circulation" },
          { title: "Inventory", path: "library-inventory" },
        ],
        visibleTo: ["Principal", "Librarian"],
      },

      {
  title: "Enquiry",
  icon: <FaPhone />,
  subTabs: [
    { title: "New Enquiry", path: "enquiry#new" },
    { title: "Enquiry Details", path: "enquiry#details" },
    { title: "Enquiry Details - II", path: "enquiry#details2" },
    { title: "Done Followup", path: "enquiry#done" },
    { title: "Pending Followup", path: "enquiry#pending" },
    { title: "Enquiry Search", path: "enquiry#search" },
    { title: "Enquiry Status", path: "enquiry#status" }
  ]
},
      {
        title: "Communication",
        icon: <FaBullhorn />,
        path: "announcements",
      },
      {
        title: "Profile",
        icon: <FaUserCog />,
        path: "profile",
      },
    ];

    // FILTER LOGIC: Super Admin sees all, others see their 'visibleTo' matches
    return allSections.filter((section) => {
      // Principal ya SuperAdmin ko sab dikhao
      if (isSuperAdmin || designation === "Principal") return true;

      // Agar section ki visibility restricted nahi hai, toh sabko dikhao (Profile/Comm)
      if (!section.visibleTo) return true;

      // Check if user's designation is in the allowed list
      return section.visibleTo.includes(designation);
    });
  }, [designation, isSuperAdmin]);

  return (
    <Routes>
      {/* All routes inside this Route will share the Sidebar and Layout */}
      <Route
        element={
          <Layout
            sections={filteredSections}
            title={`${school?.schoolName || "Admin"} Panel`}
            role="admin"
          />
        }
      >
        {/* ✅ index means exactly /school/:slug/admin/ */}
        <Route index element={<Navigate to="admin-dashboard" replace />} />

        {/* ✅ These paths are RELATIVE to /school/:slug/admin/ */}
        <Route
          path="admin-dashboard"
          element={<AdminDashboardPage school={school} />}
        />

        {/* User Registration Routes */}
        {(isSuperAdmin ||
          ["Principal", "Administrator"].includes(designation)) && (
          <>
            <Route
              path="register-teacher"
              element={<TeacherRegisterForm school={school} />}
            />
            <Route
              path="register-student"
              element={<StudentParentRegisterForm school={school} />}
            />
            <Route
              path="admin-register"
              element={<AdminRegister school={school} />}
            />

            <Route
              path="bulk-import-academic"
              element={<BulkImport type="academic" school={school} />}
            />
            <Route
              path="bulk-import-teacher"
              element={<BulkImport type="teacher" school={school} />}
            />
            <Route
              path="bulk-import-student"
              element={<BulkImport type="student" school={school} />}
            />
            <Route
              path="bulk-import-fee"
              element={<BulkImport type="fee" school={school} />}
            />
            <Route
            path="bulk-import-payment"
            element={<BulkImport type="payment" school={school} />}
            />
          </>
        )}

        {/* Academic Management Routes */}
        <Route
          path="class-management"
          element={<ClassManagement school={school} />}
        />
        <Route
          path="teacher-management"
          element={<TeacherManagement school={school} />}
        />
        <Route
          path="student-management"
          element={<StudentManagement school={school} />}
        />
        <Route
          path="subject-management"
          element={<SubjectManagement school={school} />}
        />
        <Route
          path="timetable-management"
          element={<TimetableManagement school={school} />}
        />

        {/* HR Management Routes */}
        <Route path="staff-attendance" element={<StaffAttendance />} />
        <Route path="leave-requests" element={<LeaveRequests />} />
        <Route path="staff-attandance-grid" element={<StaffAttendanceGrid />} />
        {/* <Route path="teacher-payroll-history/:teacherId" element={<TeacherPayrollHistory />} /> */}

        <Route
          path="payroll-dashboard"
          element={<AdminPayrollDashboard school={school} />}
        />
        <Route
          path="salary-setup"
          element={<SalaryStructureSetup school={school} />}
        />
        <Route
          path="monthly-payrun"
          element={<MonthlyPayRun school={school} />}
        />

        {/* Library Management */}
        <Route path="library-circulation" element={<BookIssueReturn />} />
        <Route path="library-inventory" element={<LibraryInventory />} />

        {/* Fee Management */}
        <Route path="fee-overview" element={<FeeOverview school={school} />} />
        <Route
          path="fee-record-payment"
          element={<RecordPayment school={school} />}
        />
        <Route
          path="fee-history"
          element={<PaymentHistory school={school} />}
        />
        <Route
          path="fee-structure"
          element={<SetClassFees school={school} />}
        />

        {/* Result Management Routes */}
        <Route
          path="result-management"
          element={<AdminResultManagement school={school} />}
        />
        {/* <Route path="results/:id/view" element={<AdminViewResult school={school} />} /> */}

        {/* Enquiry */}
        <Route path="enquiry" element={<EnquiryPage />} />

        {/* Communication */}
        <Route
          path="announcements"
          element={<AdminAnnouncementPage school={school} />}
        />

        {/* Profile */}
        <Route
          path="profile"
          element={<AdminProfileManage school={school} />}
        />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
