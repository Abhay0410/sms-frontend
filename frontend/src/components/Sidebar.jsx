// src/components/layout/Sidebar.jsx - UPDATED WITH SCHOOL SLUG, HOVER RAIL & TYPOGRAPHY
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  FaHome,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";
import useLogout from "../hooks/useLogout";

const Sidebar = ({ isOpen, setIsOpen, sections, title, role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { schoolSlug } = useParams(); // ✅ GET SCHOOL SLUG FROM URL
  const logout = useLogout();
  const [expandedSections, setExpandedSections] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Track screen size for layout mode (mobile vs desktop)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const expanded = isMobile ? true : isHovered;

  // ✅ Generate school-specific path
  const getSchoolPath = (path) => {
    if (!path) return "";
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    // Make sure it includes both schoolSlug and the specific role
    return `/school/${schoolSlug}/${role}/${cleanPath}`;
  };

  const toggleSection = (sectionTitle) => {
    setExpandedSections((prev) =>
      prev.includes(sectionTitle)
        ? prev.filter((s) => s !== sectionTitle)
        : [...prev, sectionTitle],
    );
  };

  const handleMenuClick = (item) => {
    if (item.subTabs) {
      toggleSection(item.title);
    } else {
      const [basePath, hash] = item.path.split("#");
      const targetPath = getSchoolPath(basePath);
      const finalPath = hash ? `${targetPath}#${hash}` : targetPath;

      // 👇 SAME HASH CLICK FIX
      if (window.location.hash === `#${hash}`) {
        window.location.hash = ""; // reset

        setTimeout(() => {
          navigate(finalPath);
        }, 50);
      } else {
        navigate(finalPath);
      }

      if (window.innerWidth < 768) setIsOpen(false);
    }
  };

  // ✅ Check if current path matches (for active styling)
  const isActive = (path) => {
    if (!path) return false;

    const [basePath, hash] = path.split("#");
    const schoolPath = getSchoolPath(basePath);
    const currentPath = location.pathname;
    const currentHash = location.hash.replace("#", "");

    // ✅ match both path + hash
    if (hash) {
      return currentPath === schoolPath && currentHash === hash;
    }

    return currentPath === schoolPath;
  };

  // ✅ Check if any subTab is active
  const isSubTabActive = (subTabs) => {
    return subTabs?.some((subTab) => {
      const subPath = getSchoolPath(subTab.path);
      return location.pathname === subPath;
    });
  };

  // Fallback for long titles to ensure layout consistency
  const displayTitle = title && title.length > 20 ? `${role} Panel` : title;

  const renderSubTabs = (tabs, level = 1) => {
    return tabs.map((tab) => {
      const isExpanded = expandedSections.includes(tab.title);
      const hasActiveChild = tab.subTabs && isSubTabActive(tab.subTabs);
      const active = isActive(tab.path) || hasActiveChild;

      return (
        <div key={tab.title}>
          <button
            onClick={() => handleMenuClick(tab)}
            className={`w-full flex items-center justify-between rounded-lg px-4 py-2 text-xs font-bold transition-all btn-micro-active ${
              active
                ? "bg-slate-800 text-indigo-400 font-bold"
                : "text-slate-500 hover:text-slate-300"
            }`}
            style={{ paddingLeft: `${level * 16}px` }} // 👈 indentation
          >
            <span>{tab.title}</span>
            {tab.subTabs &&
              (isExpanded ? (
                <FaChevronDown size={10} />
              ) : (
                <FaChevronRight size={10} />
              ))}
          </button>

          {/* 🔥 recursion */}
          {tab.subTabs && isExpanded && (
            <div className="space-y-1">
              {renderSubTabs(tab.subTabs, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed inset-y-0 left-0 z-40 transform bg-[#051224] shadow-2xl transition-all duration-300 ease-in-out md:static md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } ${expanded ? "w-72" : "w-72 md:w-20"} overflow-x-hidden overflow-y-auto no-scrollbar`}
    >
      {/* Sidebar Header */}
      <div className={`flex h-20 items-center border-b border-slate-800 ${
        expanded ? "justify-between px-6" : "justify-center px-2"
      }`}>
        <div className={`flex items-center ${expanded ? "gap-3" : "justify-center w-full"}`}>
          <div className="bg-indigo-500 p-2 rounded-lg text-white shrink-0">
            <FaHome size={20} />
          </div>
          {expanded && (
            <div className="animate-fade-in duration-200">
              <h2 className="text-sm font-black tracking-tight text-white uppercase italic truncate max-w-[180px]">
                {displayTitle}
              </h2>
            </div>
          )}
        </div>
        {expanded && (
          <button
            className="md:hidden text-slate-400"
            onClick={() => setIsOpen(false)}
          >
            <FaTimes size={24} />
          </button>
        )}
      </div>

      {/* Sidebar Menu Navigation */}
      <nav className="mt-6 px-4 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)] no-scrollbar">
        {sections.map((s) => {
          const hasActiveSubTab = s.subTabs && isSubTabActive(s.subTabs);
          const active = isActive(s.path) || hasActiveSubTab;

          return (
            <div key={s.title} className="relative group px-1">
              {/* Active Indicator Line */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full z-50" />
              )}
              
              <button
                onClick={() => handleMenuClick(s)}
                className={`w-full flex ${
                  expanded 
                    ? "flex-row items-center justify-between px-4 py-3" 
                    : "flex-col items-center justify-center py-3 px-1"
                } rounded-xl transition-all relative btn-micro-active ${
                  active
                    ? "bg-indigo-600 text-white shadow-lg font-bold"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white font-medium"
                }`}
              >
                {expanded ? (
                  <>
                    <div className="flex items-center gap-3">
                      {s.icon && React.cloneElement(s.icon, { 
                        size: 18, 
                        className: active ? "text-white shrink-0" : "text-slate-400 shrink-0" 
                      })}
                      <span className="text-xs font-semibold tracking-tight">{s.title}</span>
                    </div>
                    {s.subTabs && (
                      <div className={active ? "text-white" : "text-slate-400"}>
                        {expandedSections.includes(s.title) ? (
                          <FaChevronDown size={10} />
                        ) : (
                          <FaChevronRight size={10} />
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center w-full">
                    {s.icon && React.cloneElement(s.icon, { 
                      size: 20, 
                      className: active ? "text-white" : "text-slate-400" 
                    })}
                    <span className="text-[9px] font-semibold tracking-tight w-full truncate max-w-[68px] mt-1">
                      {s.title}
                    </span>
                  </div>
                )}
              </button>

              {/* Subtabs - only render if sidebar is expanded */}
              {s.subTabs && expandedSections.includes(s.title) && expanded && (
                <div className="ml-2 mt-2 space-y-1 border-l border-slate-700 pl-2">
                  {renderSubTabs(s.subTabs)}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout Container */}
      <div className="absolute bottom-6 w-full left-0 px-2">
        <button
          onClick={logout}
          className={`flex w-full items-center justify-center transition-all ${
            expanded
              ? "flex-row gap-3 rounded-xl bg-rose-600/10 py-3.5 text-xs font-bold text-rose-500 hover:bg-rose-600 hover:text-white"
              : "flex-col gap-1 rounded-xl bg-rose-600/10 py-3 px-1 text-rose-500 hover:bg-rose-600 hover:text-white"
          }`}
        >
          <FaSignOutAlt size={16} />
          {expanded ? (
            <span className="font-semibold text-xs uppercase tracking-wider">LOGOUT</span>
          ) : (
            <span className="text-[9px] font-semibold tracking-tight w-full truncate max-w-[68px] mt-1 text-center">
              LOGOUT
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
