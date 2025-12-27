// Routes/Parent/ParentRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ParentDashboardPage from "../../pages/parent/ParentDashboardPage.jsx";
import ParentProfileManage from "../../pages/parent/ParentProfileManage.jsx";
import ChildrenDetails from "../../pages/parent/ChildrenDetails";
import ViewAttendance from "../../pages/parent/ViewChildAttendance.jsx";
import ViewChildTimetable from "../../pages/parent/ViewChildTimetable";
import ViewChildFee from "../../pages/parent/ViewChildFee";
import ViewChildResults from "../../pages/parent/ViewChildResults.jsx";
import ParentAnnouncements from "../../pages/parent/Communication/ParentAnnouncements.jsx";
import ParentMessages from "../../pages/parent/Communication/ParentMessages.jsx";

const ParentRoutes = () =>{
  
  return (
    <Routes>
      <Route path="parent-dashboard" element={<ParentDashboardPage />} />
      <Route path="profile" element={<ParentProfileManage />} />
      <Route path="children" element={<ChildrenDetails />} />
     <Route path="timetable" element={<ViewChildTimetable />} />
     <Route path="fee-details" element={<ViewChildFee />} />
      <Route path="attendance" element={<ViewAttendance />} />
     <Route path="child-results" element={<ViewChildResults />} />
     <Route path="notifications" element={<ParentAnnouncements />} />
     
     <Route path="messages" element={<ParentMessages />} />
      <Route path="*" element={<Navigate to="/parent/parent-dashboard" replace />} />
    </Routes>
  );
};

export default ParentRoutes;
