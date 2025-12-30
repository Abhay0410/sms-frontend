import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import BackButton from "../../../../components/BackButton";
import { API_ENDPOINTS } from "../../../.././/constants/apiEndpoints";
import { FaPlus, FaEdit, FaUsers, FaChalkboard, FaTimes, FaUserGraduate, FaCheckCircle, FaArrowRight, FaCopy, FaSync, FaTrash, FaExclamationTriangle, FaChartLine, FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeClassName, setActiveClassName] = useState("");
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("tabs"); // "tabs" or "grid"
  
  // Horizontal scroll refs
  const scrollContainerRef = useRef(null);
  
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

  const loadClasses = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`${API_ENDPOINTS.ADMIN.CLASS.LIST}?academicYear=${academicYear}`);
      
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
      
      setClasses(classList);
      
      if (classList.length > 0 && !activeClassName) {
        setActiveClassName(classList[0].className);
      }
    } catch (error) {
      console.error("❌ Load classes error:", error);
      setError(error.message);
      
      if (retryCount < 2) {
        setTimeout(() => loadClasses(retryCount + 1), 2000);
      } else {
        toast.error("Failed to load classes after multiple attempts");
      }
    } finally {
      setLoading(false);
    }
  }, [academicYear, activeClassName]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // FIX: Improved scroll behavior - Active class ko center mein rakhega reset kiye bina
  useEffect(() => {
    if (scrollContainerRef.current && activeClassName) {
      const activeBtn = scrollContainerRef.current.querySelector('.active-tab');
      if (activeBtn) {
        activeBtn.scrollIntoView({ 
          behavior: 'smooth', 
          inline: 'center', 
          block: 'nearest' 
        });
      }
    }
  }, [activeClassName]);

  const currentActiveClassData = useMemo(() => {
    return classes.find(c => c.className === activeClassName);
  }, [classes, activeClassName]);

  const totalStats = useMemo(() => {
    const totalSections = classes.reduce((sum, cls) => sum + (cls.sections?.length || 0), 0);
    const totalStudents = classes.reduce(
      (sum, cls) => sum + (cls.sections?.reduce((s, sec) => s + sec.currentStrength, 0) || 0),
      0
    );
    const totalCapacity = classes.reduce(
      (sum, cls) => sum + (cls.sections?.reduce((s, sec) => s + sec.capacity, 0) || 0),
      0
    );
    
    return { totalSections, totalStudents, totalCapacity };
  }, [classes]);

  // Scroll navigation functions - improved with hover visibility
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ 
        left: scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  if (error && classes.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-8">
        <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md text-center">
          <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Failed to Load Data</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => loadClasses()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  if (loading && classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-indigo-200"></div>
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-indigo-600 font-semibold animate-pulse">Loading academic structure...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        {/* Back Button and Header */}
        <div className="flex flex-col gap-4">
          <BackButton to="/admin/admin-dashboard" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Structure</h1>
              <p className="text-slate-600 font-medium mt-2">Manage classes and sections for {academicYear}</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowCopyModal(true)}
                className="flex items-center gap-2 rounded-2xl bg-white border-2 border-slate-200 px-6 py-3 font-bold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95 shadow-sm"
              >
                <FaSync /> Sync Session
              </button>
              
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="rounded-2xl border-2 border-slate-100 bg-white px-5 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              >
                {academicYears.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 font-bold text-white shadow-lg hover:shadow-xl hover:opacity-90 transition-all"
              >
                <FaPlus /> New Class
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {classes.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-indigo-500 to-blue-500 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Total Classes</p>
                  <p className="text-4xl font-black mt-2">{classes.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <FaChalkboard size={24} />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Total Sections</p>
                  <p className="text-4xl font-black mt-2">{totalStats.totalSections}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <FaUsers size={24} />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Total Students</p>
                  <p className="text-4xl font-black mt-2">{totalStats.totalStudents}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <FaUserGraduate size={24} />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Capacity Used</p>
                  <p className="text-4xl font-black mt-2">
                    {totalStats.totalCapacity > 0 
                      ? `${((totalStats.totalStudents / totalStats.totalCapacity) * 100).toFixed(1)}%`
                      : "0%"}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <FaChartLine size={24} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HORIZONTAL CLASS TABS - OPTIMIZED SINGLE LINE SCROLLER */}
        {classes.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">Active Classes</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 font-medium">View:</span>
                <button
                  onClick={() => setViewMode("tabs")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    viewMode === "tabs" 
                      ? "bg-indigo-600 text-white" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Tabs
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    viewMode === "grid" 
                      ? "bg-indigo-600 text-white" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
            
            {viewMode === "tabs" ? (
              <div className="relative group">
                {/* Scroll buttons with hover effect */}
                <button
                  onClick={() => scroll('left')}
                  className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-white shadow-lg rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <FaChevronLeft />
                </button>
                
                <button
                  onClick={() => scroll('right')}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-white shadow-lg rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <FaChevronRight />
                </button>
                
                {/* Horizontal scroll container */}
                <div 
                  ref={scrollContainerRef}
                  className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar py-4 px-2"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {classes.map((cls, index) => {
                    const colorSchemes = [
                      "from-indigo-500 to-blue-500",
                      "from-purple-500 to-pink-500",
                      "from-emerald-500 to-green-500",
                      "from-amber-500 to-orange-500",
                      "from-red-500 to-rose-500",
                      "from-blue-500 to-cyan-500",
                      "from-teal-500 to-emerald-500",
                      "from-yellow-500 to-amber-500",
                      "from-lime-500 to-green-500",
                      "from-cyan-500 to-indigo-500",
                      "from-pink-500 to-rose-500",
                      "from-orange-500 to-red-500"
                    ];
                    
                    const colorScheme = colorSchemes[index % colorSchemes.length];
                    const totalStudents = cls.sections?.reduce((sum, s) => sum + s.currentStrength, 0) || 0;
                    const totalCapacity = cls.sections?.reduce((sum, s) => sum + s.capacity, 0) || 0;
                    
                    return (
                      <button
                        key={cls._id}
                        onClick={() => setActiveClassName(cls.className)}
                        className={`relative overflow-hidden rounded-2xl p-6 text-left transition-all transform hover:-translate-y-1 hover:shadow-2xl flex-shrink-0 ${
                          activeClassName === cls.className
                            ? `active-tab bg-gradient-to-br ${colorScheme} text-white shadow-xl scale-105 border-0`
                            : "bg-white text-slate-700 border border-slate-200 hover:border-transparent"
                        }`}
                        style={{ width: "280px" }}
                      >
                        <div className={`absolute top-0 right-0 h-24 w-24 rounded-full -mr-12 -mt-12 ${
                          activeClassName === cls.className 
                            ? "bg-white/20" 
                            : "bg-slate-100"
                        }`}></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl font-black ${
                              activeClassName === cls.className 
                                ? "bg-white/20" 
                                : `bg-gradient-to-br ${colorScheme} text-white`
                            }`}>
                              {cls.className}
                            </div>
                            {activeClassName === cls.className && (
                              <FaCheckCircle className="text-white/80" />
                            )}
                          </div>
                          
                          <h3 className="text-2xl font-black mb-2">
                            {cls.className.toLowerCase().includes('class') ? cls.className : `Class ${cls.className}`}
                          </h3>
                          
                          <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center gap-2">
                              <FaUsers className={activeClassName === cls.className ? "text-white/80" : "text-slate-400"} />
                              <span className="text-sm font-bold">
                                {cls.sections?.length || 0} Sections
                              </span>
                            </div>
                            <div className="h-4 w-px bg-current opacity-30"></div>
                            <div className="flex items-center gap-2">
                              <FaUserGraduate className={activeClassName === cls.className ? "text-white/80" : "text-slate-400"} />
                              <span className="text-sm font-bold">
                                {totalStudents}/{totalCapacity}
                              </span>
                            </div>
                          </div>
                          
                          {activeClassName !== cls.className && (
                            <div className="mt-4">
                              <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-1 rounded-full bg-gradient-to-r ${colorScheme}`}
                                  style={{ width: `${totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls, index) => {
                  const colorSchemes = [
                    "from-indigo-500 to-blue-500",
                    "from-purple-500 to-pink-500",
                    "from-emerald-500 to-green-500",
                    "from-amber-500 to-orange-500"
                  ];
                  
                  const colorScheme = colorSchemes[index % colorSchemes.length];
                  const totalStudents = cls.sections?.reduce((sum, s) => sum + s.currentStrength, 0) || 0;
                  const totalCapacity = cls.sections?.reduce((sum, s) => sum + s.capacity, 0) || 0;
                  const utilization = totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0;
                  
                  return (
                    <div
                      key={cls._id}
                      onClick={() => setActiveClassName(cls.className)}
                      className={`bg-white rounded-3xl p-6 border-2 cursor-pointer transition-all transform hover:-translate-y-2 hover:shadow-2xl ${
                        activeClassName === cls.className
                          ? "border-indigo-500 shadow-xl"
                          : "border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900">
                            {cls.className.toLowerCase().includes('class') ? cls.className : `Class ${cls.className}`}
                          </h3>
                          <p className="text-slate-500 text-sm">{cls.academicYear}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClass(cls);
                          }}
                          className="h-10 w-10 rounded-xl bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 flex items-center justify-center transition-all"
                        >
                          <FaEdit size={16} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-6 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                            <FaUsers className="text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Sections</p>
                            <p className="text-lg font-bold text-slate-900">{cls.sections?.length || 0}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
                            <FaUserGraduate className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Students</p>
                            <p className="text-lg font-bold text-slate-900">{totalStudents}/{totalCapacity}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-600">Capacity Utilization</span>
                          <span className="font-bold text-indigo-600">{utilization.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              utilization >= 90
                                ? "bg-gradient-to-r from-red-500 to-orange-500"
                                : utilization >= 70
                                ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                                : `bg-gradient-to-r ${colorScheme}`
                            }`}
                            style={{ width: `${utilization}%` }}
                          />
                        </div>
                      </div>
                      
                      {cls.sections?.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-slate-100">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Sections</p>
                          <div className="flex flex-wrap gap-2">
                            {cls.sections.map((section) => (
                              <span
                                key={section._id}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-slate-50 to-white border border-slate-200 text-sm font-semibold text-slate-700"
                              >
                                {section.sectionName}
                                <span className="ml-2 text-xs text-slate-500">
                                  ({section.currentStrength}/{section.capacity})
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SECTIONS DISPLAY BELOW TABS */}
        {currentActiveClassData ? (
          <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-900">
                  Sections in <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    Class {currentActiveClassData.className}
                  </span>
                </h2>
                <p className="text-slate-500 mt-1">Manage sections and student enrollment</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedClass(currentActiveClassData)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-lg"
                >
                  <FaEdit /> Manage All
                </button>
              </div>
            </div>

            {currentActiveClassData.sections?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentActiveClassData.sections?.map((section, index) => {
                  const sectionColors = [
                    "from-indigo-500 to-blue-500",
                    "from-purple-500 to-pink-500",
                    "from-emerald-500 to-green-500",
                    "from-amber-500 to-orange-500",
                    "from-red-500 to-rose-500",
                    "from-blue-500 to-cyan-500"
                  ];
                  
                  const colorScheme = sectionColors[index % sectionColors.length];
                  const fillPercentage = (section.currentStrength / section.capacity) * 100;
                  
                  return (
                    <div key={section._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${colorScheme} flex items-center justify-center text-white text-xl font-black shadow-md`}>
                            {section.sectionName}
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-slate-900">Section {section.sectionName}</h3>
                            <p className="text-slate-400 text-sm">Class {currentActiveClassData.className}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          fillPercentage >= 90 
                            ? "bg-red-100 text-red-600" 
                            : fillPercentage >= 70 
                            ? "bg-amber-100 text-amber-600" 
                            : "bg-emerald-100 text-emerald-600"
                        }`}>
                          {fillPercentage.toFixed(0)}% full
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                              <FaUserGraduate className="text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-500">Enrolled Students</p>
                              <p className="text-2xl font-bold text-slate-900">{section.currentStrength}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-500">Capacity</p>
                            <p className="text-2xl font-bold text-slate-900">{section.capacity}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-600">Enrollment Progress</span>
                            <span className="font-bold text-indigo-600">
                              {section.currentStrength}/{section.capacity}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                fillPercentage >= 90 
                                  ? "bg-gradient-to-r from-red-500 to-orange-500" 
                                  : fillPercentage >= 70 
                                  ? "bg-gradient-to-r from-amber-500 to-yellow-500" 
                                  : "bg-gradient-to-r from-emerald-500 to-green-500"
                              }`}
                              style={{ width: `${fillPercentage}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600">Available Seats</span>
                            <span className="text-xl font-bold text-emerald-600">{section.capacity - section.currentStrength}</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setSelectedClass(currentActiveClassData)}
                          className="w-full mt-4 py-3 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                        >
                          Manage Students →
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {/* Add New Section Card */}
                <div 
                  onClick={() => setSelectedClass(currentActiveClassData)}
                  className="border-3 border-dashed border-slate-300 rounded-3xl p-8 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition-all bg-gradient-to-b from-slate-50 to-white cursor-pointer group"
                >
                  <div className="h-16 w-16 rounded-full border-4 border-dashed border-current flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-indigo-400 transition-all">
                    <FaPlus size={28} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-wider mb-2">Add New Section</h3>
                  <p className="text-sm text-center text-slate-500">Click to create a new section for this class</p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-b from-slate-50 to-white rounded-3xl p-12 text-center border border-slate-200">
                <div className="h-20 w-20 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FaUsers className="h-10 w-10 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-400 mb-3">No Sections Created</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  Class {currentActiveClassData.className} doesn't have any sections yet. Create sections to start enrolling students.
                </p>
                <button
                  onClick={() => setSelectedClass(currentActiveClassData)}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:opacity-90 transition-all"
                >
                  <FaPlus /> Create First Section
                </button>
              </div>
            )}
          </div>
        ) : classes.length > 0 ? (
          <div className="mt-12 text-center py-16 bg-gradient-to-b from-slate-50 to-white rounded-3xl border border-slate-200">
            <div className="h-24 w-24 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FaChalkboard className="h-12 w-12 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-400 mb-3">Select a Class</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Choose a class from above to view and manage its sections
            </p>
          </div>
        ) : (
          <div className="mt-12 text-center py-20 bg-gradient-to-b from-slate-50 to-white rounded-3xl border border-slate-200">
            <div className="h-32 w-32 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <FaChalkboard className="h-16 w-16 text-indigo-300" />
            </div>
            <h3 className="text-3xl font-black text-slate-400 mb-4">No Classes Found</h3>
            <p className="text-slate-500 mb-8 text-lg max-w-lg mx-auto">
              Create your first class or sync from a previous academic session to get started
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowCopyModal(true)}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <FaSync /> Sync Previous Session
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <FaPlus /> Create New Class
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showCopyModal && (
        <CopySessionModal 
          academicYears={academicYears} 
          currentYear={academicYear} 
          onClose={() => setShowCopyModal(false)}
          onSuccess={() => { setShowCopyModal(false); loadClasses(); }}
        />
      )}

      {showCreateModal && (
        <CreateClassModal 
          academicYear={academicYear} 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); loadClasses(); }}
        />
      )}

      {selectedClass && (
        <ClassDetailsModal 
          classData={selectedClass} 
          onClose={() => setSelectedClass(null)}
          onReload={loadClasses}
        />
      )}
    </div>
  );
}

// SYNC SESSION MODAL
function CopySessionModal({ academicYears, currentYear, onClose, onSuccess }) {
  const [sourceYear, setSourceYear] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    if (!sourceYear) return toast.error("Please select a source year");
    if (sourceYear === currentYear) return toast.error("Source and Target cannot be same");

    try {
      setLoading(true);
      await api.post(API_ENDPOINTS.ADMIN.CLASS.COPY_ACADEMIC_YEAR, {
        sourceYear,
        targetYear: currentYear
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
              <p className="text-indigo-200 text-sm mt-1">Copy structure from previous year</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleCopy} className="p-8 space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-amber-800 text-sm">
                This will copy all Classes, Sections, and Subjects. Student and Teacher data will not be moved.
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Copy From (Source Session)</label>
            <select
              required
              className="w-full p-4 bg-gradient-to-b from-slate-50 to-white rounded-xl border-2 border-slate-200 font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              value={sourceYear}
              onChange={e => setSourceYear(e.target.value)}
            >
              <option value="">Select Academic Year</option>
              {academicYears
                .filter(y => y !== currentYear)
                .map(y => (
                  <option key={y} value={y}>{y}</option>
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
              ) : "Confirm Sync"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// CREATE CLASS MODAL - UPDATED WITH CORRECT PAYLOAD
function CreateClassModal({ academicYear, onClose, onSuccess }) {
  const [form, setForm] = useState({ className: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.className) return toast.error("Class name is required");
    try {
      setLoading(true);
      
      // Correct payload structure
      const payload = {
        className: form.className, // e.g. "11 Science"
        academicYear: academicYear, // State se uthayein
        sections: [] // Initial empty
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
              <p className="text-indigo-200 text-sm mt-1">Active Session: {academicYear}</p>
            </div>
            <button 
              onClick={onClose} 
              className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center hover:rotate-90 transition-all hover:bg-white/20"
            >
              <FaTimes size={18} className="text-white"/>
            </button>
          </div>
        </div>
        
        <form onSubmit={onSubmit} className="p-8 space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Class Grade</label>
            <select
              required
              value={form.className}
              onChange={(e) => setForm({ ...form, className: e.target.value })}
              className="w-full p-5 bg-gradient-to-b from-slate-50 to-white rounded-2xl border-2 border-slate-200 font-bold text-slate-900 text-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            >
              <option value="">Select Class</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                <option key={num} value={String(num)}>Class {num}</option>
              ))}
            </select>
            <p className="text-sm text-slate-500 mt-3">Select the class grade you want to create for {academicYear}</p>
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

// CLASS DETAILS MODAL
function ClassDetailsModal({ classData, onClose, onReload }) {
  const [activeTab, setActiveTab] = useState("sections");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-6xl h-[85vh] bg-white rounded-[2.5rem] shadow-2xl flex overflow-hidden">
        <div className="w-72 bg-gradient-to-b from-slate-50 to-white border-r border-slate-100 p-8 flex flex-col justify-between">
          <div>
            <div className="mb-10">
              <h3 className="text-2xl font-black text-slate-900">Class {classData.className}</h3>
              <p className="text-slate-500 text-sm mt-1">{classData.academicYear}</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="px-3 py-1 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600 rounded-lg text-xs font-bold">
                  {classData.sections?.length || 0} Sections
                </div>
                <div className="px-3 py-1 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 rounded-lg text-xs font-bold">
                  {classData.sections?.reduce((sum, s) => sum + s.currentStrength, 0) || 0} Students
                </div>
              </div>
            </div>
            
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("sections")}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === "sections"
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <FaUsers />
                Sections
              </button>
              
              <button
                onClick={() => setActiveTab("students")}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === "students"
                    ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <FaUserGraduate />
                Enrollment
              </button>
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
              {activeTab === "sections" ? "Manage Sections" : "Student Enrollment"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">Class {classData.className} • {classData.academicYear}</p>
          </header>
          
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === "sections" && <SectionsTab classData={classData} onReload={onReload} />}
            {activeTab === "students" && <AssignStudentsTab classData={classData} onReload={onReload} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// SECTIONS TAB
function SectionsTab({ classData, onReload }) {
  const [showAddSection, setShowAddSection] = useState(false);
  const [sectionForm, setSectionForm] = useState({ sectionName: "", capacity: "40" });
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
        <form onSubmit={addSection} className="p-6 rounded-2xl bg-gradient-to-b from-slate-50 to-white border-2 border-dashed border-slate-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Section Code</label>
              <input
                required
                maxLength={2}
                placeholder="A, B, C..."
                className="w-full p-3 bg-white rounded-xl border-2 border-slate-200 font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                value={sectionForm.sectionName}
                onChange={(e) => setSectionForm({ ...sectionForm, sectionName: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Maximum Capacity</label>
              <input
                type="number"
                min="1"
                max="100"
                required
                placeholder="40"
                className="w-full p-3 bg-white rounded-xl border-2 border-slate-200 font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                value={sectionForm.capacity}
                onChange={(e) => setSectionForm({ ...sectionForm, capacity: e.target.value })}
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
            const fillPercentage = (section.currentStrength / section.capacity) * 100;
            
            return (
              <div key={section._id} className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center font-bold">
                      {section.sectionName}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Section {section.sectionName}</h4>
                      <p className="text-sm text-slate-500">{section.currentStrength}/{section.capacity} students</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    fillPercentage >= 90 
                      ? "bg-red-100 text-red-600" 
                      : fillPercentage >= 70 
                      ? "bg-amber-100 text-amber-600" 
                      : "bg-emerald-100 text-emerald-600"
                  }`}>
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
                    <span>{section.capacity - section.currentStrength} seats available</span>
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
          <h4 className="text-lg font-bold text-slate-400 mb-2">No Sections Yet</h4>
          <p className="text-slate-400 mb-6">Add your first section to start managing students</p>
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

// ASSIGN STUDENTS TAB
function AssignStudentsTab({ classData, onReload }) {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);
      const url = `${API_ENDPOINTS.ADMIN.STUDENT.LIST}?className=${classData.className}&academicYear=${classData.academicYear}`;
      const response = await api.get(url);
      
      let studentList = [];
      
      if (Array.isArray(response)) {
        studentList = response;
      } else if (response?.students && Array.isArray(response.students)) {
        studentList = response.students;
      } else if (response?.data?.students && Array.isArray(response.data.students)) {
        studentList = response.data.students;
      } else if (response?.data && Array.isArray(response.data)) {
        studentList = response.data;
      }
      
      const unassignedStudents = studentList.filter(student => 
        !student.section || student.section === "" || student.status === "REGISTERED"
      );
      
      setStudents(unassignedStudents);
      
      if (unassignedStudents.length === 0) {
        toast.info(`No unassigned students found for Class ${classData.className}`);
      }
    } catch (error) {
      console.error("❌ Load students error:", error);
      toast.error(error.message || "Failed to load students");
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [classData.className, classData.academicYear]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const assignStudents = async () => {
    if (!selectedSection) {
      toast.error("Please select a section");
      return;
    }

    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    try {
      setLoading(true);
      await api.put(
        API_ENDPOINTS.ADMIN.CLASS.ASSIGN_STUDENTS(classData._id, selectedSection),
        { studentIds: selectedStudents }
      );
      
      toast.success(`${selectedStudents.length} students assigned to Section ${selectedSection}!`);
      setSelectedStudents([]);
      loadStudents();
      onReload();
    } catch (error) {
      toast.error(error.message || "Failed to assign students");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.studentID?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-b from-slate-50 to-white p-6 rounded-2xl border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Select Section</label>
            <select 
              value={selectedSection} 
              onChange={(e) => setSelectedSection(e.target.value)} 
              className="w-full p-3 rounded-xl border-2 border-slate-200 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            >
              <option value="">Choose Section</option>
              {classData.sections?.map(s => (
                <option key={s._id} value={s.sectionName}>
                  Section {s.sectionName} ({s.capacity - s.currentStrength} seats)
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Search Students</label>
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={assignStudents} 
              disabled={loading || !selectedStudents.length || !selectedSection} 
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? "Processing..." : `Enroll ${selectedStudents.length} Students`}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {loadingStudents ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-indigo-600 font-semibold">Loading students...</p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-slate-600">
                <span className="font-bold">{selectedStudents.length}</span> of {filteredStudents.length} students selected
              </div>
              <button
                onClick={() => setSelectedStudents(filteredStudents.map(s => s._id))}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Select All
              </button>
            </div>
            
            {filteredStudents.map(s => (
              <div 
                key={s._id} 
                onClick={() => setSelectedStudents(prev => 
                  prev.includes(s._id) 
                    ? prev.filter(id => id !== s._id) 
                    : [...prev, s._id]
                )} 
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedStudents.includes(s._id) 
                    ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50" 
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-5 w-5 rounded border flex items-center justify-center ${
                    selectedStudents.includes(s._id) 
                      ? "bg-emerald-600 border-emerald-600" 
                      : "border-slate-300"
                  }`}>
                    {selectedStudents.includes(s._id) && (
                      <FaCheckCircle className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {s.studentID}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="text-center py-12 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200">
            <div className="h-16 w-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaUserGraduate className="h-8 w-8 text-slate-300" />
            </div>
            <h4 className="text-lg font-bold text-slate-400 mb-2">No Unassigned Students</h4>
            <p className="text-slate-400">All students in Class {classData.className} are already assigned to sections</p>
          </div>
        )}
      </div>
    </div>
  );
}