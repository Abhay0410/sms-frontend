// Routes/Student/StudentRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
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
  
  return (
    <Routes>
      <Route path="student-dashboard" element={<StudentDashboardPage />} />
      <Route path="profile" element={<StudentProfileManage />} />
    <Route path="my-classes" element={<MyClasses />} />
    <Route path="timetable" element={<ViewTimetable />} />  
    <Route path="attendance" element={<ViewAttendance />} />
    <Route path="fee-details" element={<ViewFeeDetails />} />
    <Route path="results" element={<StudentResults />} />
    <Route path="notifications" element={<StudentAnnouncements />} />
    <Route path="messages" element={<StudentMessages />} />
    <Route path="*" element={<Navigate to="/student/student-dashboard" replace />} />
    </Routes>
  );
};

export default StudentRoutes;
