// src/App.jsx
import { useEffect, useMemo, useState, Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate, } from "react-router-dom"; // ✅ Added useLocation
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import api from "./services/api.js";

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
  const [authChecked, setAuthChecked] = useState(false); // ✅ Fix flashing content
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("userRole");
      const school = localStorage.getItem("selectedSchool");

      if (token && role && school) {
        api.setToken(token);
        setIsLoggedIn(true);
        setUserRole(role);
      }
      setAuthChecked(true); // ✅ Ready to render routes
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      console.log("🔒 Unauthorized - clearing auth");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("selectedSchool"); 
      api.clearToken();
      setIsLoggedIn(false);
      setUserRole(null);
      navigate("/login", { replace: true });
    };

    const onLogout = () => {
      console.log("🚪 Logout event received");
      setIsLoggedIn(false);
      setUserRole(null);
      // Don't clear selected school on regular logout so they can login again easily
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

  return { isLoggedIn, userRole, setIsLoggedIn, setUserRole, authChecked };
}

/* ──────────────────────────────────────────────────────────────
 * 🛡️ Private Route Component
 * ────────────────────────────────────────────────────────────── */
function PrivateRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");
  const school = localStorage.getItem("selectedSchool"); 

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }
  
  // If no school selected, go back to selection
  if (!school) {
     return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={`/${role}/${role}-dashboard`} replace />;
  }

  return <Outlet />;
}

/* ──────────────────────────────────────────────────────────────
 * 🚀 Main App Component
 * ────────────────────────────────────────────────────────────── */
export default function App() {
  const { isLoggedIn, userRole, setIsLoggedIn, setUserRole, authChecked } = useAuthState();

  const dashboardPath = useMemo(() => {
    if (!userRole) return "/login";
    return `/${userRole}/${userRole}-dashboard`;
  }, [userRole]);

  // ✅ Wait for auth check before rendering routes to prevent redirects
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
      
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ✅ 1. School Selection (Homepage) */}
          <Route 
            path="/" 
            element={
              isLoggedIn ? (
                <Navigate to={dashboardPath} replace />
              ) : (
                <SchoolSelection />
              )
            } 
          />

          {/* ✅ 2. Login Page */}
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to={dashboardPath} replace />
              ) : (
                <Signin setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />
              )
            }
          />

          {/* ✅ 3. Legacy Redirect */}
          <Route path="/signin" element={<Navigate to="/login" replace />} />

          {/* ✅ 4. Protected Routes */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route
              path="/admin/*"
              element={<AdminRoutes isLoggedIn={isLoggedIn} userRole={userRole} />}
            />
          </Route>

          <Route element={<PrivateRoute allowedRoles={["teacher"]} />}>
            <Route
              path="/teacher/*"
              element={<TeacherRoutes isLoggedIn={isLoggedIn} userRole={userRole} />}
            />
          </Route>

          <Route element={<PrivateRoute allowedRoles={["student"]} />}>
            <Route
              path="/student/*"
              element={<StudentRoutes isLoggedIn={isLoggedIn} userRole={userRole} />}
            />
          </Route>

          <Route element={<PrivateRoute allowedRoles={["parent"]} />}>
            <Route
              path="/parent/*"
              element={<ParentRoutes isLoggedIn={isLoggedIn} userRole={userRole} />}
            />
          </Route>

          {/* ✅ 5. Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
