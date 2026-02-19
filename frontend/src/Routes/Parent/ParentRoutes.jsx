// Routes/Parent/ParentRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { FaHome, FaChild, FaBook,  FaMoneyCheckAlt,  FaUserAlt, FaEnvelope } from "react-icons/fa";
import ParentDashboardPage from "../../pages/parent/ParentDashboardPage.jsx";
import ParentProfileManage from "../../pages/parent/ParentProfileManage.jsx";
import ChildrenDetails from "../../pages/parent/ChildrenDetails";
import ViewAttendance from "../../pages/parent/ViewChildAttendance.jsx";
import ViewChildTimetable from "../../pages/parent/ViewChildTimetable";
import ViewChildFee from "../../pages/parent/ViewChildFee";
import ViewChildResults from "../../pages/parent/ViewChildResults.jsx";
import ParentAnnouncements from "../../pages/parent/Communication/ParentAnnouncements.jsx";
import ParentMessages from "../../pages/parent/Communication/ParentMessages.jsx";

const ParentRoutes = () => {
  const sections = [
    { 
      title: "Dashboard", 
      icon: <FaHome />, 
      path: "parent-dashboard" 
    },
    { 
      title: "My Children", 
      icon: <FaChild />, 
      path: "children" 
    },
    {
      title: "Academic Hub",
      icon: <FaBook />,
      subTabs: [
        { title: "Exam Results", path: "child-results" },
        { title: "Timetable", path: "timetable" },
        { title: "Attendance", path: "attendance" }
      ]
    },
    { 
      title: "Financials", 
      icon: <FaMoneyCheckAlt />, 
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
      title: "My Profile", 
      icon: <FaUserAlt />, 
      path: "profile" 
    }
  ];

  return (
    <Routes>
      <Route element={<Layout sections={sections} title="Parent Hub" role="parent" />}>
        {/* Default redirect to dashboard */}
        <Route index element={<Navigate to="parent-dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="parent-dashboard" element={<ParentDashboardPage />} />
        
        {/* Profile */}
        <Route path="profile" element={<ParentProfileManage />} />
        
        {/* Children */}
        <Route path="children" element={<ChildrenDetails />} />
        
        {/* Academic Hub */}
        <Route path="timetable" element={<ViewChildTimetable />} />
        <Route path="child-results" element={<ViewChildResults />} />
        <Route path="attendance" element={<ViewAttendance />} />
        
        {/* Financials */}
        <Route path="fee-details" element={<ViewChildFee />} />
        
        {/* Communication */}
        <Route path="notifications" element={<ParentAnnouncements />} />
        <Route path="messages" element={<ParentMessages />} />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="parent-dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default ParentRoutes;