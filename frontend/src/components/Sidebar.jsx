// src/components/layout/Sidebar.jsx - UPDATED WITH SCHOOL SLUG
import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FaBars, FaHome, FaSignOutAlt, FaChevronDown, FaChevronRight } from "react-icons/fa";
import useLogout from "../hooks/useLogout";

const Sidebar = ({ 
  isOpen, 
  setIsOpen, 
  sections, 
  title, 
  role 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { schoolSlug } = useParams(); // ✅ GET SCHOOL SLUG FROM URL
  const logout = useLogout();
  const [expandedSections, setExpandedSections] = useState([]);

  // ✅ Generate school-specific path
  const getSchoolPath = (path) => {
    if (!path) return '';
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    // Make sure it includes both schoolSlug and the specific role
    return `/school/${schoolSlug}/${role}/${cleanPath}`;
  };

  const toggleSection = (sectionTitle) => {
    setExpandedSections((prev) =>
      prev.includes(sectionTitle)
        ? prev.filter((s) => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const handleMenuClick = (item) => {
    if (item.subTabs) {
      toggleSection(item.title);
    } else {
      // ✅ Navigate to school-specific path
      const targetPath = getSchoolPath(item.path);
      navigate(targetPath);
      if (window.innerWidth < 768) setIsOpen(false);
    }
  };

  // ✅ Check if current path matches (for active styling)
  const isActive = (path) => {
    const schoolPath = getSchoolPath(path);
    return location.pathname === schoolPath;
  };

  // ✅ Check if any subTab is active
  const isSubTabActive = (subTabs) => {
    return subTabs?.some(subTab => {
      const subPath = getSchoolPath(subTab.path);
      return location.pathname === subPath;
    });
  };

  // Fallback for long titles to ensure layout consistency
  const displayTitle = title && title.length > 20 ? `${role} Panel` : title;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-slate-900 shadow-2xl transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-lg text-white">
            <FaHome size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white uppercase italic truncate">
              {displayTitle}
            </h2>
          </div>
        </div>
        <button className="md:hidden text-slate-400" onClick={() => setIsOpen(false)}>
          <FaBars size={24} />
        </button>
      </div>

      <nav className="mt-6 px-4 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)] no-scrollbar">
        {sections.map((s) => {
          const hasActiveSubTab = s.subTabs && isSubTabActive(s.subTabs);
          
          return (
            <div key={s.title}>
              <button
                onClick={() => handleMenuClick(s)}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  (isActive(s.path) || hasActiveSubTab)
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  {s.icon && React.cloneElement(s.icon, { size: 18 })}
                  <span>{s.title}</span>
                </div>
                {s.subTabs && (expandedSections.includes(s.title) ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />)}
              </button>

              {s.subTabs && expandedSections.includes(s.title) && (
                <div className="ml-6 mt-2 space-y-1 border-l border-slate-700 pl-2">
                  {s.subTabs.map((sub) => (
                    <button
                      key={sub.title}
                      onClick={() => {
                        const targetPath = getSchoolPath(sub.path);
                        navigate(targetPath);
                        if (window.innerWidth < 768) setIsOpen(false);
                      }}
                      className={`w-full text-left rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                        isActive(sub.path) 
                          ? "bg-slate-800 text-indigo-400" 
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {sub.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="absolute bottom-6 w-full px-4">
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-rose-600/10 py-4 text-sm font-black text-rose-500 transition-all hover:bg-rose-600 hover:text-white"
        >
          <FaSignOutAlt /> LOGOUT
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;