import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import BackButton from "../../../../components/BackButton";
import { API_ENDPOINTS } from "../../../.././/constants/apiEndpoints";
import { FaPlus, FaEdit, FaUsers, FaChalkboard, FaTimes, FaUserGraduate, FaCheckCircle, FaArrowRight, FaCopy, FaSync, FaTrash, FaExclamationTriangle, FaChartLine, FaFilter, FaChevronLeft, FaChevronRight, FaLayerGroup } from "react-icons/fa";

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeClassName, setActiveClassName] = useState("");
  const [error, setError] = useState(null);
  
  
  // Horizontal scroll refs
  const scrollContainerRef = useRef(null);
  const sectionsAreaRef = useRef(null); // Ref for auto-scroll

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

  // Tab click handler with scroll logic
  const handleTabClick = (className) => {
    setActiveClassName(className);
    // Smooth scroll to sections area
    setTimeout(() => {
      sectionsAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Improved scroll position logic for horizontal tabs
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

  // Real-time Capacity Calculation
  const totalStats = useMemo(() => {
    const totalSections = classes.reduce((sum, cls) => sum + (cls.sections?.length || 0), 0);
    const totalStudents = classes.reduce((sum, cls) => sum + (cls.sections?.reduce((s, sec) => s + sec.currentStrength, 0) || 0), 0);
    const totalCapacity = classes.reduce((sum, cls) => sum + (cls.sections?.reduce((s, sec) => s + sec.capacity, 0) || 0), 0);
    const capacityPercentage = totalCapacity > 0 ? ((totalStudents / totalCapacity) * 100).toFixed(1) : "0.0";
    return { totalSections, totalStudents, totalCapacity, capacityPercentage };
  }, [classes]);

  const scrollTabs = (direction) => {
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
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <BackButton to="/admin/admin-dashboard" />

        <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between mt-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Structure</h1>
            <p className="text-slate-500 font-medium">Session Control & Enrollment Monitoring</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setShowCopyModal(true)} className="flex items-center gap-2 rounded-2xl bg-white border-2 border-slate-100 px-6 py-3 font-bold text-slate-600 hover:border-red-600 hover:text-red-600 transition-all active:scale-95 shadow-sm"><FaSync /> Sync Session</button>
            <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="rounded-2xl border-2 border-slate-100 bg-white px-5 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-500 shadow-sm">
              {academicYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-2xl bg-red-600 px-8 py-3 font-bold text-white shadow-lg hover:bg-red-700 transition-all active:scale-95"><FaPlus /> New Class</button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg">{classes.length}</div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grades</p><p className="text-xl font-black text-slate-900">Total Classes</p></div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">{classes.reduce((sum, cls) => sum + (cls.sections?.length || 0), 0)}</div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sections</p><p className="text-xl font-black text-slate-900">Total Sections</p></div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">{totalStats.totalStudents}</div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled</p><p className="text-xl font-black text-slate-900">Students</p></div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 border-b-4 border-b-red-500">
              <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg">{totalStats.capacityPercentage}%</div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usage</p><p className="text-xl font-black text-slate-900">Capacity Used</p></div>
            </div>
        </div>

        {/* IMAGE-STYLE HORIZONTAL SCROLLER */}
        <div className="mt-10 relative group">
          <button onClick={() => scrollTabs('left')} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-white shadow-lg rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all border border-slate-100"><FaChevronLeft /></button>
          <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth">
            {classes.map((cls) => (
              <button
                key={cls._id}
                onClick={() => handleTabClick(cls.className)}
                className={`flex-shrink-0 min-w-[160px] rounded-2xl py-4 px-6 font-bold text-base transition-all duration-300 border-2 ${
                  activeClassName === cls.className
                    ? "active-tab-indicator bg-red-600 border-red-600 text-white shadow-xl shadow-red-100 scale-105"
                    : "bg-white border-slate-100 text-slate-500 hover:border-red-200"
                }`}
              >
                {cls.className.toLowerCase().includes('class') ? cls.className : `Class ${cls.className}`}
              </button>
            ))}
          </div>
          <button onClick={() => scrollTabs('right')} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-white shadow-lg rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all border border-slate-100"><FaChevronRight /></button>
        </div>

        {/* WORKSPACE AREA */}
        <div ref={sectionsAreaRef} className="mt-10 pb-20">
          {currentActiveClassData ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-6">
                     <div className="h-20 w-20 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner"><FaChalkboard /></div>
                     <div><h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">{currentActiveClassData.className}</h2><p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Grade Level Management</p></div>
                  </div>
                  <button onClick={() => setSelectedClass(currentActiveClassData)} className="flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl active:scale-95"><FaEdit /> Manage All</button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentActiveClassData.sections?.map((section) => (
                    <div key={section._id} className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 h-32 w-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-40 group-hover:bg-red-600 transition-colors duration-500"></div>
                      <div className="relative z-10">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Section</span>
                        <h4 className="text-6xl font-black text-slate-900 mt-2">{section.sectionName}</h4>
                        <div className="mt-12 flex items-center justify-between border-t border-slate-50 pt-6">
                           <div className="flex items-center gap-2 font-black text-slate-900 text-xl"><FaUserGraduate className="text-red-600"/>{section.currentStrength} / {section.capacity}</div>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment Status</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setSelectedClass(currentActiveClassData)} className="border-4 border-dashed border-slate-200 rounded-[3rem] p-10 flex flex-col items-center justify-center text-slate-300 hover:text-red-600 hover:border-red-400 transition-all bg-white shadow-inner group">
                    <div className="h-16 w-16 rounded-full border-4 border-dashed border-current flex items-center justify-center mb-4 group-hover:scale-110 transition-all"><FaPlus size={24} /></div>
                    <span className="font-black uppercase tracking-[0.2em] text-xs">Provision Section</span>
                  </button>
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 opacity-40"><FaLayerGroup size={80} className="text-slate-200 mb-6" /><h3 className="text-2xl font-black uppercase tracking-[0.3em] text-slate-300">Grade Not Found</h3></div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showCopyModal && <CopySessionModal academicYears={academicYears} currentYear={academicYear} onClose={() => setShowCopyModal(false)} onSuccess={() => { setShowCopyModal(false); loadClasses(); }} />}
      {showCreateModal && <CreateClassModal academicYear={academicYear} onClose={() => setShowCreateModal(false)} onSuccess={() => { setShowCreateModal(false); loadClasses(); }} />}
      {selectedClass && <ClassDetailsModal classData={selectedClass} onClose={() => setSelectedClass(null)} onReload={loadClasses} />}
    </div>
  );
}

// SYNC SESSION MODAL
function CopySessionModal({ academicYears, currentYear, onClose, onSuccess }) {
  const [sourceYear, setSourceYear] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    if (!sourceYear) return toast.error("Select source year");
    try {
      setLoading(true);
      await api.post(API_ENDPOINTS.ADMIN.CLASS.COPY_ACADEMIC_YEAR, { sourceYear, targetYear: currentYear });
      toast.success(`Structure copied successfully from ${sourceYear}!`);
      onSuccess();
    } catch (err) { toast.error(err.message || "Target session may already have data."); } 
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
          <div><h3 className="text-2xl font-black uppercase tracking-tight">Sync Session</h3><p className="text-slate-400 text-xs mt-1 uppercase">Target Year: {currentYear}</p></div>
          <FaCopy size={30} className="text-red-500 opacity-50" />
        </div>
        <form onSubmit={handleCopy} className="p-8 space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm font-bold uppercase text-center">Structure Only. No Student Data.</div>
          <div><label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Source Session</label>
          <select required className="w-full p-5 bg-slate-50 rounded-2xl font-black border-none text-slate-900 outline-none focus:ring-4 focus:ring-red-100" value={sourceYear} onChange={e => setSourceYear(e.target.value)}>
            <option value="">Choose Year</option>
            {academicYears.filter(y => y !== currentYear).map(y => <option key={y} value={y}>{y}</option>)}
          </select></div>
          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-slate-400 uppercase text-xs">Discard</button>
            <button type="submit" disabled={loading} className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl">{loading ? "Syncing..." : "Confirm Sync"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// CREATE CLASS MODAL - UPDATED WITH CORRECT PAYLOAD
function CreateClassModal({ academicYear, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(API_ENDPOINTS.ADMIN.CLASS.CREATE, { className: e.target.className.value, academicYear, sections: [] });
      toast.success("Grade added!");
      onSuccess();
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-[3.5rem] overflow-hidden shadow-2xl">
        <div className="bg-red-600 p-10 text-white flex justify-between items-center">
          <div><h3 className="text-3xl font-black tracking-tight uppercase">New Grade</h3><p className="text-red-200 text-xs font-bold uppercase mt-1">Session {academicYear}</p></div>
          <FaPlus size={30} className="text-white opacity-40" />
        </div>
        <form onSubmit={onSubmit} className="p-10 space-y-8">
          <div><label className="block text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Class Designation</label>
          <input name="className" required autoFocus placeholder="e.g. 10, Nursery, Science" className="w-full p-6 bg-slate-50 rounded-3xl border-none font-black text-xl outline-none focus:ring-4 focus:ring-red-100 transition-all text-slate-900" /></div>
          <div className="flex gap-4 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-5 font-black text-slate-400 uppercase text-xs">Discard</button>
            <button type="submit" disabled={loading} className="flex-[2] py-5 bg-red-600 text-white rounded-[1.5rem] font-black uppercase text-xs shadow-xl shadow-red-200">Finalize Setup</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// CLASS DETAILS MODAL
function ClassDetailsModal({ classData, onClose, onReload }) {
  const [activeTab, setActiveTab] = useState("sections");
  const menuItems = [
    { id: "sections", label: "Sections", icon: <FaUsers /> },
    { id: "students", label: "Enrollment", icon: <FaUserGraduate /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-6xl h-[85vh] bg-white rounded-[3.5rem] shadow-2xl flex overflow-hidden">
        <div className="w-72 bg-slate-50 border-r border-slate-100 p-10 flex flex-col justify-between">
          <div>
            <div className="mb-12"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Class Control</span><h3 className="text-3xl font-black text-slate-900 mt-2">Class {classData.className}</h3></div>
            <nav className="space-y-3">
              {menuItems.map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-5 px-6 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === item.id ? "bg-white text-red-600 shadow-xl border-l-4 border-red-600" : "text-slate-400 hover:text-slate-600"}`}>
                  {item.icon} {item.label}
                </button>
              ))}
            </nav>
          </div>
          <button onClick={onClose} className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase hover:bg-red-600 transition-all">Close Manager</button>
        </div>
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <header className="px-12 py-10 border-b border-slate-50 flex justify-between items-center"><h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">{activeTab.toUpperCase()}</h2><span className="bg-red-50 text-red-600 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest">{classData.academicYear}</span></header>
          <div className="flex-1 overflow-y-auto px-12 py-10 no-scrollbar">
            {activeTab === "sections" ? <SectionsTab classData={classData} onReload={onReload} /> : <AssignStudentsTab classData={classData} onReload={onReload} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// SECTIONS TAB
function SectionsTab({ classData, onReload }) {
  const [loading, setLoading] = useState(false);
  const addSection = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(API_ENDPOINTS.ADMIN.CLASS.ADD_SECTION(classData._id), { sectionName: e.target.sectionName.value.toUpperCase(), capacity: parseInt(e.target.capacity.value) });
      toast.success("Section Provisioned!"); onReload();
    } catch (error) { toast.error(error.message); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center"><h4 className="text-xl font-black text-slate-800 uppercase tracking-widest">Active Sections</h4></div>
      <form onSubmit={addSection} className="p-10 rounded-[3rem] bg-slate-50 border-4 border-dashed border-slate-200">
        <div className="grid grid-cols-2 gap-8">
          <div><label className="text-[10px] font-black uppercase text-slate-400 mb-3 block">ID (A, B, C)</label><input name="sectionName" required maxLength={1} className="w-full p-5 rounded-2xl font-black text-slate-900 border-none shadow-sm" /></div>
          <div><label className="text-[10px] font-black uppercase text-slate-400 mb-3 block">Capacity</label><input name="capacity" type="number" defaultValue={40} className="w-full p-5 rounded-2xl font-black text-slate-900 border-none shadow-sm" /></div>
        </div>
        <button disabled={loading} className="mt-8 px-12 py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-red-100">{loading ? "Saving..." : "Add Section"}</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classData.sections?.map(section => (
          <div key={section._id} className="p-8 rounded-[2.5rem] border-2 border-slate-50 bg-slate-50/20 flex items-center justify-between group hover:bg-white hover:border-red-100 transition-all">
             <div className="flex items-center gap-6"><div className="h-16 w-16 rounded-[1.5rem] bg-white text-red-600 flex items-center justify-center text-2xl font-black shadow-sm group-hover:bg-red-600 group-hover:text-white transition-all">{section.sectionName}</div>
             <div><p className="font-black text-slate-900 text-lg uppercase">Section {section.sectionName}</p><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{section.currentStrength} / {section.capacity} Enrolled</p></div></div>
             <button className="h-10 w-10 rounded-xl bg-slate-100 text-slate-400 hover:text-red-600 transition-all flex items-center justify-center"><FaTimes size={14}/></button>
          </div>
        ))}
      </div>
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