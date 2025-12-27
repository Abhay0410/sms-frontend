// src/Routes/Admin/AdminRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
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
const AdminRoutes = () => { 
  return (
    <Routes>
      <Route path="admin-register" element ={<AdminRegister/>}/>
      <Route path="admin-dashboard" element={<AdminDashboardPage />} />  
      <Route path="register-teacher" element={<TeacherRegisterForm />} />
      <Route path="profile" element={<AdminProfileManage />} />
      <Route path="register-student" element={<StudentParentRegisterForm />} />
      <Route path="class-management" element={<ClassManagement />} />
      <Route path="teacher-management" element={<TeacherManagement />} />
      <Route path="student-management" element={<StudentManagement />} />
      <Route path="subject-management" element={<SubjectManagement />} />
      <Route path="timetable-management" element={<TimetableManagement />} />
      <Route path="fee-management" element={<FeeManagementDashboard />} />
      <Route path="result-management" element={<AdminResultManagement />} />
      <Route path="results/:id/view" element={<AdminViewResult />} />
      <Route path="announcements" element={<AdminAnnouncementPage />} />
      {/* Default Redirect */}
      <Route path="*" element={<Navigate to="admin-dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;