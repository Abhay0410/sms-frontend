// src/components/Navbar.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function NavBar({ isLoggedIn, userRole, handleLogout }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  const roleConfig = useMemo(
    () => ({
      admin: {
        profileEndpoint: "/api/admin/auth/adminprofile",
        dashboardRoute: "/admin/admin-dashboard",
        profileRoute: "/admin/profile",
        nameKey: "name",
      },
      teacher: {
        profileEndpoint: "/api/teacher/auth/teacherprofile",
        dashboardRoute: "/teacher/teacher-dashboard",
        profileRoute: "/teacher/profile",
        nameKey: "name",
      },
      student: {
        profileEndpoint: "/api/student/auth/studentprofile",
        dashboardRoute: "/student/student-dashboard",
        profileRoute: "/student/profile",
        nameKey: "studentName",
      },
      parent: {
        profileEndpoint: "/api/parent/auth/parentprofile",
        dashboardRoute: "/parent/parent-dashboard",
        profileRoute: "/parent/profile",
        nameKey: "parentName",
      },
    }),
    []
  );

  useEffect(() => {
    const load = async () => {
      if (!isLoggedIn || !userRole || !roleConfig[userRole]) return setUser(null);
      try {
        const resp = await api.get(roleConfig[userRole].profileEndpoint);
        const data = resp?.[userRole] || resp?.data || resp || {};
        setUser({ ...data, displayName: data?.[roleConfig[userRole].nameKey] || "Profile" });
      } catch {
        setUser(null);
      }
    };
    load();
  }, [isLoggedIn, userRole, roleConfig]);

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    ["adminInfo", "teacherInfo", "studentInfo", "parentInfo"].forEach((k) =>
      localStorage.removeItem(k)
    );
    api.clearToken();
    window.dispatchEvent(new Event("api:unauthorized"));
    handleLogout?.();
    navigate("/signin", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">Zager</span>
          <span className="text-sm text-gray-500">Management System</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900">
            About
          </Link>
          <Link to="/contact-us" className="text-sm text-gray-600 hover:text-gray-900">
            Connect
          </Link>
          {isLoggedIn && roleConfig[userRole]?.dashboardRoute && (
            <Link to={roleConfig[userRole].dashboardRoute} className="text-sm text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!isLoggedIn ? (
            <button
              onClick={() => navigate("/signin")}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
            >
              Login
            </button>
          ) : (
            <>
              <button
                onClick={() =>
                  roleConfig[userRole]?.profileRoute
                    ? navigate(roleConfig[userRole].profileRoute)
                    : navigate("/signin")
                }
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
              >
                {userRole?.toUpperCase()}: {user?.displayName || "Profile"}
              </button>
              <button
                onClick={onLogout}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
              >
                Logout
              </button>
            </>
          )}
        </div>

        <button
          className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 md:hidden"
          onClick={() => setOpen((s) => !s)}
          aria-label="Toggle Menu"
        >
          <svg className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 6h14M3 10h14M3 14h14" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white p-3 md:hidden">
          <div className="flex flex-col gap-2">
            <Link to="/about" className="rounded px-3 py-2 text-sm hover:bg-gray-50">
              About
            </Link>
            <Link to="/contact-us" className="rounded px-3 py-2 text-sm hover:bg-gray-50">
              Connect
            </Link>
            {isLoggedIn && roleConfig[userRole]?.dashboardRoute && (
              <Link to={roleConfig[userRole].dashboardRoute} className="rounded px-3 py-2 text-sm hover:bg-gray-50">
                Dashboard
              </Link>
            )}

            {!isLoggedIn ? (
              <button
                onClick={() => navigate("/signin")}
                className="rounded border border-gray-300 px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                Login
              </button>
            ) : (
              <>
                <button
                  onClick={() =>
                    roleConfig[userRole]?.profileRoute
                      ? navigate(roleConfig[userRole].profileRoute)
                      : navigate("/signin")
                  }
                  className="rounded border border-gray-300 px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  {userRole?.toUpperCase()}: {user?.displayName || "Profile"}
                </button>
                <button
                  onClick={onLogout}
                  className="rounded bg-red-600 px-3 py-2 text-left text-sm text-white hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
