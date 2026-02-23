import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import {
  FaPlus,
  FaEdit,
  FaUsers,
  
  FaTimes,
  FaUserGraduate,
  FaCheckCircle,
  FaArrowRight,
  FaSync,
  FaExclamationTriangle,
  FaChevronDown,
  FaCopy,
  FaExchangeAlt,
  FaChartBar,
  FaSchool,
  
  FaCalendarAlt,
  FaUserFriends,
  FaBuilding,

  FaSearch,
  FaSort,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";

const getClassPriority = (className) => {
  const name = className.toLowerCase();

  if (name.includes("nursery")) return { level: 0, order: 0 };
  if (name.includes("lkg")) return { level: 0, order: 1 };
  if (name.includes("ukg")) return { level: 0, order: 2 };

  const match = name.match(/(\d+)/);
  const classNumber = match ? parseInt(match[0], 10) : 999;

  let subjectOrder = 0;
  if (name.includes("arts")) subjectOrder = 1;
  else if (name.includes("commerce")) subjectOrder = 2;
  else if (name.includes("science")) subjectOrder = 3;
  else subjectOrder = 4;

  return {
    level: 1,
    order: classNumber * 10 + subjectOrder,
  };
};

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeClassName, setActiveClassName] = useState("");
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);
  const sectionsAreaRef = useRef(null);

  const [selectedSection, setSelectedSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterStatus, setFilterStatus] = useState("all");

  const currentActiveClassData = useMemo(() => {
    return classes.find((c) => c.className === activeClassName);
  }, [classes, activeClassName]);

  useEffect(() => {
    if (currentActiveClassData?.sections?.length > 0) {
      setSelectedSection(currentActiveClassData.sections[0]);
    } else {
      setSelectedSection(null);
    }
  }, [currentActiveClassData]);

  const [showAllClasses, setShowAllClasses] = useState(false);

  const academicYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -1; i < 6; i++) {
      const year = currentYear + i;
      years.push(`${year}-${year + 1}`);
    }
    return years;
  }, []);

  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());

  function getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return month >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  }

  const sortClassesSmartly = useCallback((classes) => {
    return [...classes].sort((a, b) => {
      const aP = getClassPriority(a.className);
      const bP = getClassPriority(b.className);
      if (aP.level !== bP.level) return aP.level - bP.level;
      return aP.order - bP.order;
    });
  }, []);

  const loadClasses = useCallback(
    async (retryCount = 0) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(
          `${API_ENDPOINTS.ADMIN.CLASS.STATISTICS}?academicYear=${academicYear}`,
        );

        let classList = [];

        if (Array.isArray(response)) {
          classList = response;
        } else if (response?.classes) {
          classList = response.classes;
        } else if (response?.data?.classes) {
          classList = response.data.classes;
        } else if (response?.data && Array.isArray(response.data)) {
          classList = response.data;
        }

        const sortedClasses = sortClassesSmartly(classList);

        setClasses(sortedClasses);

        if (sortedClasses.length > 0 && !activeClassName) {
          setActiveClassName(sortedClasses[0].className);
        }
      } catch (err) {
        console.error("❌ Load classes error:", err);
        setError(err.message);

        if (retryCount < 2) {
          setTimeout(() => loadClasses(retryCount + 1), 2000);
        } else {
          toast.error("Failed to load classes after multiple attempts");
        }
      } finally {
        setLoading(false);
      }
    },
    [academicYear, activeClassName, sortClassesSmartly],
  );

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    if (scrollContainerRef.current && activeClassName) {
      const activeBtn = scrollContainerRef.current.querySelector(
        ".active-tab-indicator",
      );
      if (activeBtn) {
        activeBtn.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [activeClassName]);

  // Filter and sort classes
  const filteredAndSortedClasses = useMemo(() => {
    let filtered = [...classes];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((cls) =>
        cls.className.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((cls) => {
        const totalSections = cls.sections?.length || 0;
        if (filterStatus === "active") return totalSections > 0;
        if (filterStatus === "inactive") return totalSections === 0;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const pA = getClassPriority(a.className);
      const pB = getClassPriority(b.className);

      if (pA.level !== pB.level) {
        return sortOrder === "asc" ? pA.level - pB.level : pB.level - pA.level;
      }

      return sortOrder === "asc" ? pA.order - pB.order : pB.order - pA.order;
    });

    return filtered;
  }, [classes, searchTerm, filterStatus, sortOrder]);

  // Real-time Capacity Calculation
  const totalStats = useMemo(() => {
    const totalSections = classes.reduce(
      (sum, cls) => sum + (cls.sections?.length || 0),
      0,
    );
    const totalStudents = classes.reduce(
      (sum, cls) => sum + (cls.totalEnrolled || 0),
      0,
    );
    const totalCapacity = classes.reduce(
      (sum, cls) =>
        sum + (cls.sections?.reduce((s, sec) => s + sec.capacity, 0) || 0),
      0,
    );
    const capacityPercentage =
      totalCapacity > 0
        ? ((totalStudents / totalCapacity) * 100).toFixed(1)
        : "0.0";
    return { totalSections, totalStudents, totalCapacity, capacityPercentage };
  }, [classes]);

  useEffect(() => {
    document.body.style.overflow = showAllClasses ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAllClasses]);

  const openManager = (cls, tab = "sections", sectionName = "") => {
    setSelectedClass({
      ...cls,
      _initialTab: tab,
      _initialSection: sectionName,
    });
  };

  if (error && classes.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md text-center border border-slate-100">
          <div className="h-20 w-20 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            Failed to Load Data
          </h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => loadClasses()}
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  if (loading && classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 space-y-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-indigo-100"></div>
          <div className="absolute top-0 left-0 h-20 w-20 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        </div>
        <div className="text-center">
          <p className="text-indigo-600 font-semibold text-lg animate-pulse">
            Loading academic structure...
          </p>
          <p className="text-slate-400 text-sm mt-2">
            Please wait while we prepare your dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-8 pb-10">
      <div className="mx-auto max-w-7xl">
        {/* Header Section - Professional Title */}
        <div className="pt-8 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <FaBuilding className="text-indigo-600 text-xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                Academic Structure
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full"></span>
                <p className="text-slate-500 text-sm font-medium">
                  Session Control & Enrollment Monitoring
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Using new color scheme */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FaSchool size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Total Classes
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-slate-900">
                    {classes.length}
                  </p>
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    +{filteredAndSortedClasses.length} active
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <FaUsers size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Total Sections
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {totalStats.totalSections}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FaUserGraduate size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Enrolled
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {totalStats.totalStudents}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-bl-full"></div>
            <div className="flex items-center gap-4 relative">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <FaChartBar size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Capacity Used
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {totalStats.capacityPercentage}%
                </p>
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                style={{ width: `${totalStats.capacityPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Action Bar - Search, Filters, Actions */}
        <div className="bg-white rounded-xl p-5 mb-8 border border-slate-100 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search and Filters */}
            <div className="flex-1 flex items-center gap-3 w-full">
              <div className="relative flex-1 max-w-md">
                <FaSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 bg-white"
              >
                <option value="all">All Classes</option>
                <option value="active">With Sections</option>
                <option value="inactive">Without Sections</option>
              </select>

              <button
                onClick={() =>
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                }
                className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <FaSort />
                <span className="text-sm">Sort</span>
                {sortOrder === "asc" ? (
                  <FaSortAmountDown />
                ) : (
                  <FaSortAmountUp />
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCopyModal(true)}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-indigo-300 transition-all flex items-center gap-2 text-sm font-medium"
              >
                <FaSync size={14} className="text-slate-500" />
                Sync Session
              </button>

              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="px-5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 bg-white"
              >
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm font-medium shadow-sm shadow-indigo-100"
              >
                <FaPlus size={14} />
                New Class
              </button>
            </div>
          </div>
        </div>

        {/* Class Grid - Compact Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <FaSchool className="text-indigo-500" />
              Available Classes
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                {filteredAndSortedClasses.length}
              </span>
            </h2>
            <button
              onClick={() => setShowAllClasses(true)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              View All <FaArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredAndSortedClasses.slice(0, 6).map((cls) => (
              <button
                key={cls._id}
                onClick={() => setActiveClassName(cls.className)}
                className={`p-4 rounded-xl border transition-all ${
                  activeClassName === cls.className
                    ? "bg-indigo-50 border-indigo-300 shadow-sm"
                    : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm"
                }`}
              >
                <div className="text-center">
                  <div
                    className={`text-sm font-semibold mb-1 ${
                      activeClassName === cls.className
                        ? "text-indigo-700"
                        : "text-slate-700"
                    }`}
                  >
                    {cls.className}
                  </div>
                  <div className="text-xs text-slate-500">
                    {cls.sections?.length || 0} sections
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Selection Area - Clean Dropdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Class Selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <FaSchool className="text-indigo-600 text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Select Class
                </h3>
                <p className="text-xs text-slate-500">
                  Choose a grade to manage
                </p>
              </div>
            </div>

            <div className="relative">
              <select
                value={activeClassName}
                onChange={(e) => setActiveClassName(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 text-slate-800 py-3 px-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              >
                <option value="" disabled>
                  Select a class...
                </option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls.className}>
                    {cls.className} ({cls.sections?.length || 0} sections)
                  </option>
                ))}
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            </div>

            {activeClassName && (
              <div className="mt-4 flex items-center gap-2">
                <span className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg">
                  Managing • {activeClassName}
                </span>
              </div>
            )}
          </div>

          {/* Section Selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <FaUsers className="text-blue-500 text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Select Section
                </h3>
                <p className="text-xs text-slate-500">
                  Choose a section to view details
                </p>
              </div>
            </div>

            <div className="relative">
              <select
                value={selectedSection?._id || ""}
                onChange={(e) => {
                  const section = currentActiveClassData?.sections?.find(
                    (s) => s._id === e.target.value,
                  );
                  setSelectedSection(section);
                }}
                disabled={!currentActiveClassData?.sections?.length}
                className="w-full appearance-none bg-white border border-slate-200 text-slate-800 py-3 px-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="" disabled>
                  Select a section...
                </option>
                {currentActiveClassData?.sections?.map((sec) => (
                  <option key={sec._id} value={sec._id}>
                    Section {sec.sectionName} — {sec.currentStrength}/
                    {sec.capacity} students
                  </option>
                ))}
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            </div>

            {selectedSection && (
              <div className="mt-4 flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
                  Active • Section {selectedSection.sectionName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Section Details View */}
        <div ref={sectionsAreaRef} className="mt-6">
          {selectedSection ? (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Section Header */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white rounded-xl border border-indigo-200 flex items-center justify-center">
                      <FaBuilding className="text-indigo-600 text-xl" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">
                        {activeClassName} - Section {selectedSection.sectionName}
                      </h2>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                        <FaCalendarAlt className="text-slate-400" size={12} />
                        {academicYear} • Active Session
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openManager(currentActiveClassData)}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-medium flex items-center gap-2"
                  >
                    <FaEdit size={14} />
                    Manage
                  </button>
                </div>
              </div>

              {/* Section Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                <div className="bg-slate-50 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Students
                    </p>
                    <FaUserGraduate className="text-indigo-400" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedSection.currentStrength}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    out of {selectedSection.capacity} capacity
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Available
                    </p>
                    <FaUserFriends className="text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {selectedSection.capacity - selectedSection.currentStrength}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">seats left</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Utilization
                    </p>
                    <FaChartBar className="text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {(
                      (selectedSection.currentStrength /
                        selectedSection.capacity) *
                      100
                    ).toFixed(0)}
                    %
                  </p>
                  <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                      style={{
                        width: `${(selectedSection.currentStrength / selectedSection.capacity) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-t border-slate-100 p-6 bg-slate-50/50">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">
                  Quick Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() =>
                      openManager(
                        currentActiveClassData,
                        "students",
                        selectedSection.sectionName,
                      )
                    }
                    className="px-5 py-2.5 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all text-sm font-medium text-slate-700 flex items-center gap-2"
                  >
                    <FaUserGraduate size={14} className="text-indigo-500" />
                    Manage Students
                  </button>
                  <button
                    onClick={() =>
                      openManager(currentActiveClassData, "sections")
                    }
                    className="px-5 py-2.5 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all text-sm font-medium text-slate-700 flex items-center gap-2"
                  >
                    <FaEdit size={14} className="text-indigo-500" />
                    Edit Section
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-slate-400 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                {currentActiveClassData?.sections?.length === 0
                  ? "No Sections Found"
                  : "No Section Selected"}
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                {currentActiveClassData?.sections?.length === 0
                  ? "This class has no sections yet. Create one to start enrolling students."
                  : "Please select a class and section from the dropdowns above to view detailed information"}
              </p>
              {activeClassName && (
                <button
                  onClick={() => openManager(currentActiveClassData)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 mx-auto"
                >
                  <FaEdit size={16} />
                  Manage Class & Sections
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCopyModal && (
        <CopySessionModal
          academicYears={academicYears}
          currentYear={academicYear}
          onClose={() => setShowCopyModal(false)}
          onSuccess={() => {
            setShowCopyModal(false);
            loadClasses();
          }}
        />
      )}

      {showCreateModal && (
        <CreateClassModal
          academicYear={academicYear}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadClasses();
          }}
        />
      )}

      {selectedClass && (
        <ClassDetailsModal
          classData={selectedClass}
          onClose={() => setSelectedClass(null)}
          onReload={loadClasses}
        />
      )}

      {/* All Classes Modal */}
      {showAllClasses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">All Classes</h3>
                <p className="text-indigo-100 text-sm">
                  {classes.length} total classes
                </p>
              </div>
              <button
                onClick={() => setShowAllClasses(false)}
                className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {classes.map((cls) => (
                  <div
                    key={cls._id}
                    onClick={() => {
                      setActiveClassName(cls.className);
                      setShowAllClasses(false);
                    }}
                    className="p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all"
                  >
                    <p className="font-semibold text-slate-800">
                      {cls.className}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {cls.sections?.length || 0} sections
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------- MODAL COMPONENTS -----------------

function ClassDetailsModal({ classData, onClose, onReload }) {
  const [activeTab, setActiveTab] = useState(
    classData._initialTab || "sections",
  );
  const [enrollSection, setEnrollSection] = useState(
    classData._initialSection || "",
  );

  const menuItems = [
    { id: "sections", label: "Sections", icon: <FaUsers /> },
    { id: "students", label: "Enrollment", icon: <FaUserGraduate /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-6xl h-[85vh] bg-white rounded-[2.5rem] shadow-2xl flex overflow-hidden">
        <div className="w-72 bg-gradient-to-b from-slate-50 to-white border-r border-slate-100 p-8 flex flex-col justify-between">
          <div>
            <div className="mb-10">
              <h3 className="text-2xl font-black text-slate-900">
                Class {classData.className}
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                {classData.academicYear}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="px-3 py-1 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600 rounded-lg text-xs font-bold">
                  {classData.sections?.length || 0} Sections
                </div>
                <div className="px-3 py-1 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 rounded-lg text-xs font-bold">
                  {classData.sections?.reduce(
                    (sum, s) => sum + s.currentStrength,
                    0,
                  ) || 0}{" "}
                  Students
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </nav>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 text-white font-bold text-sm hover:opacity-90 transition-all"
          >
            Close Manager
          </button>
        </div>

        <div className="flex-1 flex flex-col">
          <header className="px-10 py-8 border-b border-slate-100 bg-white">
            <h2 className="text-2xl font-black text-slate-800">
              {activeTab === "sections"
                ? "Manage Sections"
                : "Student Enrollment"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Class {classData.className} • {classData.academicYear}
            </p>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === "sections" && (
              <SectionsTab classData={classData} onReload={onReload} />
            )}
            {activeTab === "students" && (
              <AssignStudentsTab
                classData={classData}
                onReload={onReload}
                preSelectedSection={enrollSection}
                onSectionChange={setEnrollSection}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionsTab({ classData, onReload }) {
  const [showAddSection, setShowAddSection] = useState(false);
  const [sectionForm, setSectionForm] = useState({
    sectionName: "",
    capacity: "40",
  });
  const [loading, setLoading] = useState(false);

  const addSection = async (e) => {
    e.preventDefault();
    if (!sectionForm.sectionName) {
      toast.error("Please enter a section name");
      return;
    }

    try {
      setLoading(true);
      await api.post(API_ENDPOINTS.ADMIN.CLASS.ADD_SECTION(classData._id), {
        sectionName: sectionForm.sectionName.toUpperCase(),
        capacity: parseInt(sectionForm.capacity),
      });
      toast.success("New section added!");
      setSectionForm({ sectionName: "", capacity: "40" });
      setShowAddSection(false);
      onReload();
    } catch (error) {
      toast.error(error.message || "Failed to add section");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-slate-800">All Sections</h3>
        {!showAddSection && (
          <button
            onClick={() => setShowAddSection(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all"
          >
            <FaPlus /> New Section
          </button>
        )}
      </div>

      {showAddSection && (
        <form
          onSubmit={addSection}
          className="p-6 rounded-2xl bg-gradient-to-b from-slate-50 to-white border-2 border-dashed border-slate-300"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Section Code
              </label>
              <input
                required
                maxLength={2}
                placeholder="A, B, C..."
                className="w-full p-3 bg-white rounded-xl border-2 border-slate-200 font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                value={sectionForm.sectionName}
                onChange={(e) =>
                  setSectionForm({
                    ...sectionForm,
                    sectionName: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Maximum Capacity
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                placeholder="40"
                className="w-full p-3 bg-white rounded-xl border-2 border-slate-200 font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                value={sectionForm.capacity}
                onChange={(e) =>
                  setSectionForm({ ...sectionForm, capacity: e.target.value })
                }
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? "Adding..." : "Create Section"}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddSection(false)}
            className="mt-4 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
        </form>
      )}

      {classData.sections?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classData.sections?.map((section) => {
            const fillPercentage =
              (section.currentStrength / section.capacity) * 100;

            return (
              <div
                key={section._id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center font-bold">
                      {section.sectionName}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">
                        Section {section.sectionName}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {section.currentStrength}/{section.capacity} students
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      fillPercentage >= 90
                        ? "bg-red-100 text-red-600"
                        : fillPercentage >= 70
                          ? "bg-amber-100 text-amber-600"
                          : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {fillPercentage.toFixed(0)}%
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        fillPercentage >= 90
                          ? "bg-gradient-to-r from-red-500 to-orange-500"
                          : fillPercentage >= 70
                            ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                            : "bg-gradient-to-r from-emerald-500 to-green-500"
                      }`}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>
                      {section.capacity - section.currentStrength} seats
                      available
                    </span>
                    <span>{fillPercentage.toFixed(0)}% full</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200">
          <div className="h-16 w-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FaUsers className="h-8 w-8 text-slate-300" />
          </div>
          <h4 className="text-lg font-bold text-slate-400 mb-2">
            No Sections Yet
          </h4>
          <p className="text-slate-400 mb-6">
            Add your first section to start managing students
          </p>
          <button
            onClick={() => setShowAddSection(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all"
          >
            <FaPlus /> Create First Section
          </button>
        </div>
      )}
    </div>
  );
}

function AssignStudentsTab({
  classData,
  onReload,
  preSelectedSection,
  onSectionChange,
}) {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedSection, setSelectedSection] = useState(
    preSelectedSection || "",
  );
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [mode, setMode] = useState("enroll"); // "enroll" or "transfer"
  const [fromSection, setFromSection] = useState("");
  const [toSection, setToSection] = useState("");

  const loadStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);
      const url = `${API_ENDPOINTS.ADMIN.STUDENT.LIST}?className=${classData.className}&academicYear=${classData.academicYear}`;
      const response = await api.get(url);

      let studentList = [];
      if (response?.data?.students) {
        studentList = response.data.students;
      } else if (response?.students) {
        studentList = response.students;
      } else if (Array.isArray(response)) {
        studentList = response;
      } else if (response?.data && Array.isArray(response.data)) {
        studentList = response.data;
      }

      setStudents(studentList);

      if (studentList.length === 0) {
        toast.info(`No students found for Class ${classData.className}`);
      }
    } catch (err) {
      console.error("❌ Load students error:", err);
      toast.error("Failed to load student registry");
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [classData.className, classData.academicYear]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    if (preSelectedSection) {
      setSelectedSection(preSelectedSection);
    }
  }, [preSelectedSection]);

  // Filter students based on mode
  const getFilteredStudents = () => {
    if (mode === "enroll") {
      // Show unassigned students + students from other sections
      return students.filter(
        (s) => !s.section || s.section !== selectedSection,
      );
    } else {
      // Show only students from "fromSection" for transfer
      return students.filter((s) => s.section === fromSection);
    }
  };

  const filteredStudents = getFilteredStudents().filter(
    (student) =>
      student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.studentID?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAction = async () => {
    if (mode === "enroll") {
      if (!selectedSection) {
        toast.error("Please select a target section");
        return;
      }
    } else {
      if (!fromSection || !toSection) {
        toast.error("Please select both FROM and TO sections");
        return;
      }
      if (fromSection === toSection) {
        toast.error("Source and destination sections cannot be same");
        return;
      }
    }

    if (selectedStudents.length === 0) {
      toast.error("Please select students to process");
      return;
    }

    try {
      setLoading(true);

      // For both modes, use the same endpoint - backend handles both scenarios
      const targetSection = mode === "enroll" ? selectedSection : toSection;

      await api.put(
        API_ENDPOINTS.ADMIN.CLASS.ASSIGN_STUDENTS(classData._id, targetSection),
        { studentIds: selectedStudents },
      );

      if (mode === "enroll") {
        toast.success(
          `${selectedStudents.length} students enrolled to Section ${selectedSection}!`,
        );
      } else {
        toast.success(
          `${selectedStudents.length} students transferred from Section ${fromSection} to ${toSection}!`,
        );
      }

      setSelectedStudents([]);
      await loadStudents();
      onReload();
    } catch (err) {
      toast.error(err.message || "Failed to process students");
    } finally {
      setLoading(false);
    }
  };

  const sections = classData.sections || [];

  // Get available vacancies for each section
  const getVacancies = (sectionName) => {
    const section = sections.find((s) => s.sectionName === sectionName);
    return section ? section.capacity - section.currentStrength : 0;
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      {/* Mode Selection Tabs */}
      <div className="flex gap-4 border-b border-slate-100 pb-4">
        <button
          onClick={() => {
            setMode("enroll");
            setSelectedStudents([]);
            setFromSection("");
          }}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            mode === "enroll"
              ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <FaPlus className="inline mr-2" />
          Enroll Students
        </button>
        <button
          onClick={() => {
            setMode("transfer");
            setSelectedStudents([]);
            setSelectedSection("");
          }}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            mode === "transfer"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <FaExchangeAlt className="inline mr-2" />
          Transfer Between Sections
        </button>
      </div>

      {/* Control Panel */}
      <div className="bg-gradient-to-b from-slate-50 to-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        {mode === "enroll" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                Enroll to Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  if (onSectionChange) onSectionChange(e.target.value);
                }}
                className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              >
                <option value="">Select Target Section</option>
                {sections.map((s) => (
                  <option key={s._id} value={s.sectionName}>
                    Section {s.sectionName} ({getVacancies(s.sectionName)}{" "}
                    vacancies)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                Filter Registry
              </label>
              <input
                type="text"
                placeholder="Search name or ID..."
                className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleAction}
                disabled={
                  loading || !selectedStudents.length || !selectedSection
                }
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95"
              >
                {loading
                  ? "Processing..."
                  : `Enroll ${selectedStudents.length} Students`}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                From Section
              </label>
              <select
                value={fromSection}
                onChange={(e) => {
                  setFromSection(e.target.value);
                  setSelectedStudents([]); // Clear selection when source changes
                }}
                className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              >
                <option value="">Select Source Section</option>
                {sections.map((s) => (
                  <option key={s._id} value={s.sectionName}>
                    Section {s.sectionName} ({s.currentStrength} students)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                To Section
              </label>
              <select
                value={toSection}
                onChange={(e) => setToSection(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              >
                <option value="">Select Destination Section</option>
                {sections.map((s) => (
                  <option key={s._id} value={s.sectionName}>
                    Section {s.sectionName} ({getVacancies(s.sectionName)}{" "}
                    vacancies)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                Filter Students
              </label>
              <input
                type="text"
                placeholder="Search students..."
                className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleAction}
                disabled={
                  loading ||
                  !selectedStudents.length ||
                  !fromSection ||
                  !toSection
                }
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 hover:opacity-90 transition-all disabled:opacity-50 active:scale-95"
              >
                {loading
                  ? "Transferring..."
                  : `Transfer ${selectedStudents.length} Students`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Students List */}
      <div className="space-y-2">
        {loadingStudents ? (
          <div className="text-center py-20">
            <div className="h-10 w-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              Loading Student Registry...
            </p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <>
            <div className="flex justify-between items-center px-2 mb-4">
              <div>
                <span className="text-xs font-bold text-slate-500">
                  Showing {filteredStudents.length} students
                  {mode === "enroll" && selectedSection && (
                    <span className="text-indigo-600 ml-2">
                      • Section {selectedSection} has{" "}
                      {getVacancies(selectedSection)} vacancies
                    </span>
                  )}
                  {mode === "transfer" && fromSection && toSection && (
                    <span className="text-blue-600 ml-2">
                      • {fromSection} → {toSection} • {getVacancies(toSection)}{" "}
                      vacancies available
                    </span>
                  )}
                </span>
              </div>
              <div className="flex gap-2">
                {filteredStudents.length > 0 && (
                  <button
                    onClick={() =>
                      setSelectedStudents(filteredStudents.map((s) => s._id))
                    }
                    className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:underline hover:text-slate-900"
                  >
                    Select All
                  </button>
                )}
                {selectedStudents.length > 0 && (
                  <button
                    onClick={() => setSelectedStudents([])}
                    className="text-[10px] font-black text-rose-600 uppercase tracking-widest hover:underline"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {filteredStudents.map((s) => {
                const isSelected = selectedStudents.includes(s._id);
                const isEnrolled = !!s.section;

                return (
                  <div
                    key={s._id}
                    onClick={() =>
                      setSelectedStudents((prev) =>
                        prev.includes(s._id)
                          ? prev.filter((id) => id !== s._id)
                          : [...prev, s._id],
                      )
                    }
                    className={`p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all ${
                      isSelected
                        ? mode === "enroll"
                          ? "border-indigo-600 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-lg"
                          : "border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg"
                        : "border-slate-50 bg-white hover:border-slate-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? mode === "enroll"
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100"
                              : "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                            : "border-slate-200"
                        }`}
                      >
                        {isSelected && <FaCheckCircle size={14} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-black text-slate-900 text-lg uppercase tracking-tight">
                              {s.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {s.studentID}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {isEnrolled && (
                              <span
                                className={`text-xs font-bold px-3 py-1 rounded-full ${
                                  mode === "transfer" &&
                                  fromSection === s.section
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {mode === "transfer"
                                  ? "Transfer from "
                                  : "Currently in "}
                                Section {s.section}
                              </span>
                            )}
                            {!isEnrolled && mode === "enroll" && (
                              <span className="text-xs font-bold bg-amber-100 text-amber-600 px-3 py-1 rounded-full">
                                Unassigned
                              </span>
                            )}
                            {mode === "transfer" && (
                              <FaExchangeAlt
                                className={`${isSelected ? "text-blue-400" : "text-slate-300"}`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="py-24 text-center opacity-60 flex flex-col items-center">
            {mode === "enroll" ? (
              <>
                <FaUserGraduate size={64} className="mb-4 text-slate-300" />
                <p className="font-black uppercase tracking-[0.3em] text-xs text-slate-400 mb-2">
                  {selectedSection
                    ? `No students available for Section ${selectedSection}`
                    : "Select a target section to view available students"}
                </p>
                <p className="text-slate-500 text-sm max-w-md">
                  All students are either already enrolled in this section or
                  there are no unassigned students.
                </p>
              </>
            ) : (
              <>
                <FaExchangeAlt size={64} className="mb-4 text-slate-300" />
                <p className="font-black uppercase tracking-[0.3em] text-xs text-slate-400 mb-2">
                  {fromSection
                    ? `No students found in Section ${fromSection}`
                    : "Select a source section to view transferable students"}
                </p>
                <p className="text-slate-500 text-sm max-w-md">
                  The selected source section has no enrolled students to
                  transfer.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Quick Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
            Total Students
          </p>
          <p className="text-2xl font-black text-slate-900">
            {students.length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
            {mode === "enroll"
              ? "Selected for Enrollment"
              : "Selected for Transfer"}
          </p>
          <p className="text-2xl font-black text-slate-900">
            {selectedStudents.length}
          </p>
        </div>
        <div
          className={`p-4 rounded-2xl border ${
            mode === "enroll"
              ? "bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200"
              : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
          }`}
        >
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
            Current Mode
          </p>
          <p className="text-lg font-black text-slate-900">
            {mode === "enroll"
              ? "📥 Enroll Students"
              : "🔄 Transfer Between Sections"}
          </p>
        </div>
      </div>
    </div>
  );
}

function CopySessionModal({ academicYears, currentYear, onClose, onSuccess }) {
  const [sourceYear, setSourceYear] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    if (!sourceYear) return toast.error("Please select a source year");
    if (sourceYear === currentYear)
      return toast.error("Source and Target cannot be same");

    try {
      setLoading(true);
      await api.post(API_ENDPOINTS.ADMIN.CLASS.COPY_ACADEMIC_YEAR, {
        sourceYear,
        targetYear: currentYear,
      });
      toast.success(`Structure synced from ${sourceYear} to ${currentYear}!`);
      onSuccess();
    } catch (err) {
      toast.error(err.message || "Target year might already have classes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
              <FaCopy size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black">Sync Academic Session</h3>
              <p className="text-indigo-200 text-sm mt-1">
                Copy structure from previous year
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCopy} className="p-8 space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-amber-800 text-sm">
                This will copy all Classes, Sections, and Subjects. Student and
                Teacher data will not be moved.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Copy From (Source Session)
            </label>
            <select
              required
              className="w-full p-4 bg-gradient-to-b from-slate-50 to-white rounded-xl border-2 border-slate-200 font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              value={sourceYear}
              onChange={(e) => setSourceYear(e.target.value)}
            >
              <option value="">Select Academic Year</option>
              {academicYears
                .filter((y) => y !== currentYear)
                .map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2"></div>
                  Syncing...
                </>
              ) : (
                "Confirm Sync"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateClassModal({ academicYear, onClose, onSuccess }) {
  const [form, setForm] = useState({ className: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.className) return toast.error("Class name is required");
    try {
      setLoading(true);

      const payload = {
        className: form.className,
        academicYear: academicYear,
        sections: [],
      };

      await api.post(API_ENDPOINTS.ADMIN.CLASS.CREATE, payload);
      toast.success("Class added successfully!");
      onSuccess();
    } catch (err) {
      toast.error(err.message || "Failed to create class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
      <div className="w-full max-w-xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black">Add New Class</h3>
              <p className="text-indigo-200 text-sm mt-1">
                Active Session: {academicYear}
              </p>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center hover:rotate-90 transition-all hover:bg-white/20"
            >
              <FaTimes size={18} className="text-white" />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Class Grade
            </label>
            <select
              required
              value={form.className}
              onChange={(e) => setForm({ ...form, className: e.target.value })}
              className="w-full p-5 bg-gradient-to-b from-slate-50 to-white rounded-2xl border-2 border-slate-200 font-bold text-slate-900 text-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            >
              <option value="">Select Class</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                <option key={num} value={String(num)}>
                  Class {num}
                </option>
              ))}
            </select>
            <p className="text-sm text-slate-500 mt-3">
              Select the class grade you want to create for {academicYear}
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-bold uppercase text-sm shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 hover:opacity-90 transition-all"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  Create Class <FaArrowRight />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
