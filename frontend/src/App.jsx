// src/App.jsx - UPDATED VERSION
import { useEffect, useState, Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import api from "./services/api.js";
import DebugRouter from "./components/DebugRouter.jsx"; // ✅ Add this import

/* ──────────────────────────────────────────────────────────────
 * 🔄 Loading Component
 * ────────────────────────────────────────────────────────────── */
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
      <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────────
 * ⚡ Lazy Load Components
 * ────────────────────────────────────────────────────────────── */
const SchoolSelection = lazy(() => import("./pages/SchoolSelection.jsx"));
const Signin = lazy(() => import("./pages/Signin.jsx"));

// Routes
const AdminRoutes = lazy(() => import("./Routes/Admin/AdminRoutes.jsx"));
const TeacherRoutes = lazy(() => import("./Routes/Teacher/TeacherRoutes.jsx"));
const StudentRoutes = lazy(() => import("./Routes/Student/StudentRoutes.jsx"));
const ParentRoutes = lazy(() => import("./Routes/Parent/ParentRoutes.jsx"));

/* ──────────────────────────────────────────────────────────────
 * 🔐 Auth State Hook
 * ────────────────────────────────────────────────────────────── */
function useAuthState() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [school, setSchool] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("userRole");
      const storedSchool = localStorage.getItem("selectedSchool");

      if (token && role && storedSchool) {
        try {
          const schoolData = JSON.parse(storedSchool);
          api.setToken(token);
          setIsLoggedIn(true);
          setUserRole(role);
          setSchool(schoolData);
        } catch (error) {
          console.error("Error parsing school data:", error);
          localStorage.clear();
        }
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      console.log("🔒 Unauthorized - clearing auth");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      api.clearToken();
      setIsLoggedIn(false);
      setUserRole(null);
      navigate("/", { replace: true });
    };

    const onLogout = () => {
      console.log("🚪 Logout event received");
      setIsLoggedIn(false);
      setUserRole(null);
      setSchool(null);
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      api.clearToken();
      navigate("/", { replace: true });
    };

    window.addEventListener("api:unauthorized", onUnauthorized);
    window.addEventListener("user:logout", onLogout);

    return () => {
      window.removeEventListener("api:unauthorized", onUnauthorized);
      window.removeEventListener("user:logout", onLogout);
    };
  }, [navigate]);

  return { isLoggedIn, userRole, school, setIsLoggedIn, setUserRole, setSchool, authChecked };
}

/* ──────────────────────────────────────────────────────────────
 * 🛡️ Private Route Component (Multi-tenant version)
 * ────────────────────────────────────────────────────────────── */
function PrivateRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");
  const storedSchool = localStorage.getItem("selectedSchool");

  // Check authentication
  if (!token || !role) {
    return <Navigate to="/" replace />;
  }
  
  // Check school selection
  if (!storedSchool) {
    return <Navigate to="/" replace />;
  }
  
  // Check role permissions
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Get school data for redirect
    try {
      const schoolData = JSON.parse(storedSchool);
      const schoolSlug = schoolData.slug || 
                        schoolData.schoolName?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 
                        'default';
      return <Navigate to={`/school/${schoolSlug}/${role}/${role}-dashboard`} replace />;
    } catch {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}

/* ──────────────────────────────────────────────────────────────
 * 🚀 Main App Component
 * ────────────────────────────────────────────────────────────── */
export default function App() {
  const { isLoggedIn, userRole, school, setIsLoggedIn, setUserRole, setSchool, authChecked } = useAuthState();

  const getDashboardPath = () => {
    if (!userRole || !school) return "/";
    const slug = school.slug || school.schoolName?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'default';
    return `/school/${slug}/${userRole}/${userRole}-dashboard`;
  };

  // Wait for auth check before rendering routes
  if (!authChecked) {
    return <PageLoader />;
  }

  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* ✅ Add DebugRouter here - outside Suspense for always visible logs */}
      <DebugRouter />
      
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ✅ 1. School Selection (Homepage) */}
          <Route 
            path="/" 
            element={
              isLoggedIn && school ? (
                <Navigate to={getDashboardPath()} replace />
              ) : (
                <SchoolSelection setSchool={setSchool} />
              )
            } 
          />

          {/* ✅ 2. School-Specific Login Page */}
          <Route path="/school/:schoolSlug/login" 
            element={
              isLoggedIn && school ? (
                <Navigate to={getDashboardPath()} replace />
              ) : (
                <Signin setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} setSchool={setSchool} />
              )
            }
          />

          {/* ✅ 3. Generic Login (Redirects to school selection) */}
          <Route
            path="/login"
            element={<Navigate to="/" replace />}
          />

          {/* ✅ 4. Legacy Redirect */}
          <Route path="/signin" element={<Navigate to="/" replace />} />

          {/* ✅ 5. Protected Routes using RoleRouteHandler */}
          <Route path="/school/:schoolSlug/:role/*" element={<PrivateRoute allowedRoles={["admin", "teacher", "student", "parent"]} />}>
            <Route path="*" element={<RoleRouteHandler isLoggedIn={isLoggedIn} userRole={userRole} school={school} />} />
          </Route>

          {/* ✅ 6. Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

// Helper to decide which route set to load based on the URL role
function RoleRouteHandler({ isLoggedIn, userRole, school }) {
  const { role } = useParams();
  
  if (role === 'admin') return <AdminRoutes isLoggedIn={isLoggedIn} userRole={userRole} school={school} />;
  if (role === 'teacher') return <TeacherRoutes isLoggedIn={isLoggedIn} userRole={userRole} school={school} />;
  if (role === 'student') return <StudentRoutes isLoggedIn={isLoggedIn} userRole={userRole} school={school} />;
  if (role === 'parent') return <ParentRoutes isLoggedIn={isLoggedIn} userRole={userRole} school={school} />;
  
  return <Navigate to="/" replace />;
}