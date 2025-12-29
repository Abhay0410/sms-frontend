// Routes/Teacher/TeacherRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { FaChalkboardTeacher, FaClipboardList, FaCheckSquare, FaPlus, FaBell, FaUserAlt, FaCalendarAlt, FaMoneyCheckAlt, FaEnvelope } from "react-icons/fa";
import TeacherDashboardPage from "../../pages/teacher/TeacherDashboardPage.jsx";
import TeacherProfileManage from "../../pages/teacher/TeacherProfileManage.jsx";
import GetTeacherClassesAndSubjects from "../../pages/teacher/Teacher_Features/GetTeacherClassesAndSubjects.jsx";
import TeacherNotifications from "../../pages/teacher/Teacher_Features/TeacherNotifications.jsx";
import SalaryStatus from "../../pages/teacher/Teacher_Features/SalaryStatus.jsx";
import MarkAttendance from "../../pages/teacher/Teacher_Features/Attendance/MarkAttendance.jsx";
import ViewMySchedule from "../../pages/teacher/Teacher_Features/ViewMySchedule.jsx";
import CreateResult from "../../pages/teacher/Teacher_Features/Result/CreateResult.jsx";
import ViewResults from "../../pages/teacher/Teacher_Features/Result/ViewResults.jsx";
import EditResult from "../../pages/teacher/Teacher_Features/Result/EditResult.jsx";
import TeacherAnnouncements from "../../pages/teacher/Teacher_Features/Communication/TeacherAnnouncements.jsx";
import TeacherMessaging from "../../pages/teacher/Teacher_Features/Communication/TeacherMessaging.jsx";

const TeacherRoutes = () => {  
  const sections = [
    { 
      title: "Dashboard", 
      icon: <FaChalkboardTeacher />, 
      path: "teacher-dashboard" 
    },
    {
      title: "Class & Subjects",
      icon: <FaChalkboardTeacher />,
      subTabs: [
        { title: "My Classes", path: "my-class" },
        { title: "Schedule", path: "my-schedule" },
        { title: "Attendance", path: "mark-attendance" }
      ]
    },
    {
      title: "Results",
      icon: <FaClipboardList />,
      subTabs: [
        { title: "Record Marks", path: "create-result" },
        { title: "View Results", path: "view-results" }
      ]
    },
    {
      title: "Notifications",
      icon: <FaBell />,
      path: "notifications"
    },
    {
      title: "Salary Status",
      icon: <FaMoneyCheckAlt />,
      path: "salary-status"
    },
    {
      title: "Communication",
      icon: <FaEnvelope />,
      subTabs: [
        { title: "Announcements", path: "announcements" },
        { title: "Messages", path: "messages" }
      ]
    },
    { 
      title: "Profile", 
      icon: <FaUserAlt />, 
      path: "profile" 
    }
  ];

  return (
    <Routes>
      <Route element={<Layout sections={sections} title="Teacher Hub" role="teacher" />}>
        {/* Default redirect to dashboard */}
        <Route index element={<Navigate to="teacher-dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="teacher-dashboard" element={<TeacherDashboardPage />} />
        
        {/* Profile */}
        <Route path="profile" element={<TeacherProfileManage />} />
        
        {/* Class & Subjects */}
        <Route path="my-class" element={<GetTeacherClassesAndSubjects />} />
        <Route path="my-schedule" element={<ViewMySchedule />} />
        <Route path="mark-attendance" element={<MarkAttendance />} />
        
        {/* Results */}
        <Route path="create-result" element={<CreateResult />} />
        <Route path="view-results" element={<ViewResults />} />
        <Route path="edit-result/:resultId" element={<EditResult />} />
        
        {/* Notifications & Salary */}
        <Route path="notifications" element={<TeacherNotifications />} />
        <Route path="salary-status" element={<SalaryStatus />} />
        
        {/* Communication */}
        <Route path="announcements" element={<TeacherAnnouncements />} />
        <Route path="messages" element={<TeacherMessaging />} />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="teacher-dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default TeacherRoutes;