import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import BackButton from "../../../../components/BackButton";
import { API_ENDPOINTS } from "../../../.././/constants/apiEndpoints";
import {
  FaBook, FaPlus, FaTimes, FaTrash, FaLayerGroup,
  FaChalkboard, FaChevronLeft, FaChevronRight,
  FaCheckCircle, FaSync, FaArrowRight, FaExclamationTriangle
} from "react-icons/fa";

const noScrollStyle = `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`;

export default function SubjectManagement() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [subjectData, setSubjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [selectedSubjectsSet, setSelectedSubjectsSet] = useState(new Set());
  const [selectedSection, setSelectedSection] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState(null);

  const scrollContainerRef = useRef(null);

  function getCurrentAcademicYear() {
    const now = new Date();
    return now.getMonth() >= 3 ? `${now.getFullYear()}-${now.getFullYear() + 1}` : `${now.getFullYear() - 1}-${now.getFullYear()}`;
  }

  const academicYears = useMemo(() => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = -1; i < 4; i++) years.push(`${currentYear + i}-${currentYear + i + 1}`);
    return years;
  }, []);

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`${API_ENDPOINTS.ADMIN.CLASS.STATISTICS}?academicYear=${academicYear}`);
      const classList = response?.data || response || [];
      setClasses(classList);
      if (classList.length > 0 && !selectedClass) setSelectedClass(classList[0]);
    } catch (err) { 
      console.error("❌ Load classes error:", err);
      setError(err.message);
      toast.error("Failed to load grade structure"); 
    } finally { 
      setLoading(false); 
    }
  }, [academicYear, selectedClass]);

  const loadSubjects = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const resp = await api.get(API_ENDPOINTS.ADMIN.SUBJECT_MANAGEMENT.CLASS(selectedClass._id));
      setSubjectData(resp?.data || resp);
      setSelectedSubjectsSet(new Set());
      setSelectedSection("");
    } catch (e) { 
      console.error("Load Error", e);
      toast.error("Failed to load subjects");
    }
  }, [selectedClass]);

  useEffect(() => { loadClasses(); }, [loadClasses]);
  useEffect(() => { if (selectedClass) loadSubjects(); }, [selectedClass, loadSubjects]);

  const toggleSubjectSelection = (name) => {
    setSelectedSubjectsSet(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const handleAssign = async () => {
    if (!selectedSection) return toast.error("Select a section first");
    if (selectedSubjectsSet.size === 0) return toast.warning("Select subjects from Master Pool");
    try {
      setAssignLoading(true);
      for (const name of Array.from(selectedSubjectsSet)) {
        await api.post(API_ENDPOINTS.ADMIN.SUBJECT_MANAGEMENT.ADD_TO_SECTIONS, {
          classId: selectedClass._id,
          sectionNames: [selectedSection],
          subject: { subjectName: name, hoursPerWeek: 5 }
        });
      }
      toast.success(`Assigned ${selectedSubjectsSet.size} subjects to section ${selectedSection}`);
      loadSubjects();
    } catch (e) { 
      toast.error(e.message || "Assignment failed"); 
    } finally { 
      setAssignLoading(false); 
    }
  };

  // const handleQuickAssign = async (sectionName) => {
  //   if (selectedSubjectsSet.size === 0) return toast.warning("Select subjects from Master Pool");
  //   try {
  //     setAssignLoading(true);
  //     for (const name of Array.from(selectedSubjectsSet)) {
  //       await api.post(API_ENDPOINTS.ADMIN.SUBJECT_MANAGEMENT.ADD_TO_SECTIONS, {
  //         classId: selectedClass._id,
  //         sectionNames: [sectionName],
  //         subject: { subjectName: name, hoursPerWeek: 5 }
  //       });
  //     }
  //     toast.success(`Section ${sectionName} Curriculum Updated`);
  //     loadSubjects();
  //   } catch (e) { 
  //     toast.error(e.message || "Assignment failed"); 
  //   } finally { 
  //     setAssignLoading(false); 
  //   }
  // };

  const handleRemoveFromMaster = async (e, subjectName) => {
    e.stopPropagation(); // Prevent toggling selection when clicking delete
    if (!window.confirm(`Permanently delete "${subjectName}" from the Class Master Pool? This will remove it from all sections too.`)) return;
    
    try {
      await api.delete(API_ENDPOINTS.ADMIN.SUBJECT_MANAGEMENT.REMOVE_FROM_POOL, {
        data: { 
          classId: selectedClass._id, 
          subjectName: subjectName 
        }
      });
      toast.success("Removed from Class Master Pool");
      loadSubjects(); // Refresh UI
    } catch (err) {
      toast.error(err.message || "Failed to remove master subject");
    }
  };

  const scrollTabs = (direction) => {
    if (scrollContainerRef.current) {
      const amt = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: amt, behavior: 'smooth' });
    }
  };

  // Stats calculation
  // const totalStats = useMemo(() => {
  //   const totalAvailable = subjectData?.availableSubjects?.length || 0;
  //   const totalAssigned = subjectData?.sections?.reduce((sum, section) => 
  //     sum + (section.subjects?.length || 0), 0) || 0;
  //   const totalSections = subjectData?.sections?.length || 0;
    
  //   return { totalAvailable, totalAssigned, totalSections };
  // }, [subjectData]);

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
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all"
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
          <div className="h-16 w-16 rounded-full border-4 border-orange-200"></div>
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-orange-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-orange-600 font-semibold animate-pulse">Loading academic structure...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <style>{noScrollStyle}</style>
      <div className="mx-auto max-w-7xl">
        <BackButton to="/admin/admin-dashboard" />

        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between mt-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Curriculum Planner</h1>
            <p className="text-slate-500 font-medium italic">Configure master curriculum for {academicYear}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setShowAddModal(true)} 
              disabled={!selectedClass}
              className="bg-orange-600 px-8 py-4 font-black text-white rounded-[1.5rem] shadow-xl shadow-orange-100 hover:bg-orange-700 active:scale-95 transition-all flex items-center gap-2 text-xs tracking-widest uppercase"
            >
              <FaPlus /> New Master Subject
            </button>
            <select 
              value={academicYear} 
              onChange={(e) => setAcademicYear(e.target.value)} 
              className="rounded-2xl border-2 border-slate-100 bg-white px-6 py-3 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-orange-50"
            >
              {academicYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        {/* {subjectData && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 flex items-center justify-center font-bold text-lg shadow-inner">
                {totalStats.totalAvailable}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Pool</p>
                <p className="text-xl font-black text-slate-900">Available Subjects</p>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shadow-inner">
                {totalStats.totalAssigned}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned</p>
                <p className="text-xl font-black text-slate-900">Active Subjects</p>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg shadow-inner">
                {totalStats.totalSections}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sections</p>
                <p className="text-xl font-black text-slate-900">Active</p>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 border-b-4 border-b-orange-500 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg shadow-inner">
                {selectedClass?.sections?.reduce((sum, s) => sum + (s.currentStrength || 0), 0) || 0}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Students</p>
                <p className="text-xl font-black text-slate-900">Total Enrolled</p>
              </div>
            </div>
          </div>
        )} */}

        {/* Grade Scroller */}
        <div className="mt-12 relative group">
          <button 
            onClick={() => scrollTabs('left')} 
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-white shadow-lg rounded-full flex items-center justify-center text-slate-400 hover:text-orange-600 opacity-0 group-hover:opacity-100 border border-slate-100 transition-all hover:shadow-xl"
          >
            <FaChevronLeft />
          </button>
          
          <div 
            ref={scrollContainerRef} 
            className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1"
          >
            {classes.map((cls) => (
              <button
                key={cls._id}
                onClick={() => setSelectedClass(cls)}
                className={`flex-shrink-0 min-w-[170px] rounded-[1.8rem] py-5 px-6 font-black text-xs uppercase tracking-widest transition-all duration-500 border-2 ${
                  selectedClass?._id === cls._id
                    ? "bg-gradient-to-r from-orange-600 to-red-600 border-orange-600 text-white shadow-2xl scale-105"
                    : "bg-white border-slate-100 text-slate-500 hover:border-orange-200 hover:shadow-md"
                }`}
              >
                {cls.className}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => scrollTabs('right')} 
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-white shadow-lg rounded-full flex items-center justify-center text-slate-400 hover:text-orange-600 opacity-0 group-hover:opacity-100 border border-slate-100 transition-all hover:shadow-xl"
          >
            <FaChevronRight />
          </button>
        </div>

        {/* Workspace area */}
        {selectedClass && subjectData && (
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sidebar Pool */}
            <div className="lg:col-span-4">
              <div className="rounded-[3rem] bg-white p-10 shadow-sm border border-slate-100 sticky top-10 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <FaLayerGroup className="text-orange-600"/> Master Pool
                  </h3>
                  <span className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center text-xs font-black text-orange-600">
                    {subjectData.availableSubjects?.length || 0}
                  </span>
                </div>
                
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full rounded-2xl border-2 border-slate-100 p-5 mb-6 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-orange-50 bg-slate-50"
                >
                  <option value="">Select Target Section</option>
                  {subjectData.sections?.map(s => (
                    <option key={s.sectionName} value={s.sectionName}>Section {s.sectionName}</option>
                  ))}
                </select>
                
                {/* 🔥 SCROLLABLE MASTER POOL CONTAINER */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto no-scrollbar mb-8 pr-2">
                  {subjectData.availableSubjects?.length > 0 ? 
                    subjectData.availableSubjects.map((sub) => (
                      <div
                        key={sub.subjectName}
                        onClick={() => toggleSubjectSelection(sub.subjectName)}
                        className={`group/master flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all cursor-pointer ${
                          selectedSubjectsSet.has(sub.subjectName)
                            ? "border-orange-500 bg-gradient-to-r from-orange-50/50 to-red-50/50 shadow-md"
                            : "border-transparent bg-slate-50 hover:bg-white hover:border-orange-100"
                        }`}
                      >
                        <div className={`h-6 w-6 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          selectedSubjectsSet.has(sub.subjectName)
                            ? "bg-gradient-to-r from-orange-500 to-red-500 border-orange-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}>
                          {selectedSubjectsSet.has(sub.subjectName) && <FaCheckCircle size={12}/>}
                        </div>
                        
                        <div className="flex-1 truncate">
                          <span className="font-black text-slate-700 text-sm uppercase tracking-tight block truncate">
                            {sub.subjectName}
                          </span>
                        </div>

                        {/* 🔥 MASTER DELETE BUTTON */}
                        <button
                          onClick={(e) => handleRemoveFromMaster(e, sub.subjectName)}
                          className="opacity-0 group-hover/master:opacity-100 p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete from Master Pool"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    )) : 
                    <div className="py-20 text-center opacity-30 italic">Pool Empty</div>
                  }
                </div>
                
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-[2rem] text-white text-center shadow-lg">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Ready to Allot</span>
                  <span className="text-3xl font-black">{selectedSubjectsSet.size}</span>
                </div>
                
                <button
                  disabled={!selectedSection || selectedSubjectsSet.size === 0 || assignLoading}
                  onClick={handleAssign}
                  className="w-full mt-6 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 py-5 text-white font-black uppercase text-xs tracking-widest hover:opacity-90 disabled:opacity-30 transition-all shadow-xl active:scale-95"
                >
                  {assignLoading ? "Processing..." : `Assign to Section ${selectedSection}`}
                </button>
              </div>
            </div>

            {/* Sections Content Areas */}
            <div className="lg:col-span-8 space-y-10">
              {subjectData.sections?.length > 0 ? 
                subjectData.sections.map((section) => (
                  <div key={section.sectionName} className="rounded-[3.5rem] bg-white p-12 shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 group">
                    <div className="flex items-center justify-between mb-10 pb-8 border-b border-slate-50">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 text-orange-600 flex items-center justify-center text-xl font-black shadow-inner">
                          {section.sectionName}
                        </div>
                        <div>
                          <h4 className="text-3xl font-black text-slate-900 tracking-tight">Section {section.sectionName}</h4>
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">
                            {section.subjects?.length || 0} Curriculum Items
                          </p>
                        </div>
                      </div>
                      {/* <button 
                        disabled={assignLoading || selectedSubjectsSet.size === 0} 
                        onClick={() => handleQuickAssign(section.sectionName)} 
                        className="px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gradient-to-r hover:from-orange-600 hover:to-red-600 disabled:opacity-20 transition-all shadow-xl"
                      >
                        {assignLoading ? "Deploying..." : "Assign Buffer Here"}
                      </button> */}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {section.subjects?.map((sub) => (
                        <div key={sub._id} className="flex items-center justify-between p-6 rounded-[2rem] bg-gradient-to-br from-slate-50 to-white border-2 border-transparent hover:border-orange-200 hover:bg-white transition-all shadow-sm group-hover/item">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl shadow-sm flex items-center justify-center">
                              <FaBook />
                            </div>
                            <div>
                              <p className="font-black text-slate-800 text-sm uppercase">
                                {sub.subjectName}
                              </p>
                              <div className="flex items-center gap-2">
                                {sub.subjectCode && (
                                  <span className="text-xs text-slate-400 font-medium">
                                    {sub.subjectCode}
                                  </span>
                                )}
                                <span className="text-xs text-slate-400 font-bold uppercase">
                                  {sub.hoursPerWeek || 5}h / Week
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              if (!window.confirm(`Remove ${sub.subjectName} from Section ${section.sectionName}?`)) return;
                              try {
                                await api.delete(API_ENDPOINTS.ADMIN.SUBJECT_MANAGEMENT.REMOVE_FROM_SECTIONS, {
                                  data: { 
                                    classId: selectedClass._id, 
                                    sectionNames: [section.sectionName], 
                                    subjectName: sub.subjectName 
                                  }
                                });
                                toast.success("Subject removed successfully");
                                loadSubjects();
                              } catch {
                                toast.error("Failed to remove subject");
                              }
                            }}
                            className="p-2 text-slate-300 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          >
                            <FaTrash size={14}/>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )) : 
                <div className="py-32 text-center bg-gradient-to-b from-white to-slate-50 rounded-[4rem] border-4 border-dashed border-slate-200">
                  <FaChalkboard size={64} className="mx-auto mb-4 text-slate-300" />
                  <p className="font-black uppercase tracking-[0.2em] text-xs text-slate-400">
                    Provision sections in Class Manager first
                  </p>
                </div>
              }
            </div>
          </div>
        )}

        {/* Empty states for when no class is selected */}
        {!selectedClass && classes.length > 0 && (
          <div className="mt-12 text-center py-16 bg-gradient-to-b from-slate-50 to-white rounded-3xl border border-slate-200">
            <div className="h-24 w-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FaChalkboard className="h-12 w-12 text-orange-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-400 mb-3">Select a Grade</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Choose a grade from above to view and manage its curriculum
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddSubjectModal
          classId={selectedClass?._id}
          className={selectedClass?.className}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); loadSubjects(); }}
        />
      )}
    </div>
  );
}

function AddSubjectModal({ classId, className, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    subjectName: "",
    subjectCode: "",
    isCore: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Updated backend logic
      await api.post(API_ENDPOINTS.ADMIN.SUBJECT_MANAGEMENT.ADD, {
        classId,
        sectionName: "A", 
        subject: {
          subjectName: form.subjectName,
          subjectCode: form.subjectCode || "",
          isCore: form.isCore
        }
      });
      toast.success("Added to Master Pool");
      onSuccess();
    } catch (error) { 
      toast.error(error.message || "Conflict Error"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-[3.5rem] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-10 text-white flex justify-between items-center">
          <div>
            <h3 className="text-3xl font-black uppercase tracking-tight">Provision Subject</h3>
            <p className="text-orange-400 text-xs font-bold uppercase mt-1">Registry for {className}</p>
          </div>
          <FaBook size={30} className="text-white opacity-20" />
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">
              Formal Label
            </label>
            <input 
              name="subjectName" 
              value={form.subjectName}
              onChange={(e) => setForm({...form, subjectName: e.target.value})}
              required 
              autoFocus 
              placeholder="e.g. Physics, History" 
              className="w-full p-6 bg-slate-50 rounded-[1.8rem] border-2 border-slate-200 font-black text-xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all text-slate-900 shadow-inner" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">
              Subject Code (Optional)
            </label>
            <input 
              name="subjectCode" 
              value={form.subjectCode}
              onChange={(e) => setForm({...form, subjectCode: e.target.value})}
              placeholder="e.g. PHY-101, HIS-201" 
              className="w-full p-6 bg-slate-50 rounded-[1.8rem] border-2 border-slate-200 font-black text-lg outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all text-slate-900 shadow-inner" 
              maxLength={20}
            />
          </div>
          
          <label className="flex items-center gap-5 p-6 bg-slate-50 rounded-[1.8rem] cursor-pointer hover:bg-slate-100 transition-all shadow-sm group">
            <input 
              name="isCore" 
              type="checkbox" 
              checked={form.isCore}
              onChange={(e) => setForm({...form, isCore: e.target.checked})}
              className="h-6 w-6 accent-orange-600 group-hover:scale-110 transition-transform" 
            />
            <span className="text-xs font-black uppercase text-slate-600 tracking-widest">
              Mandatory core curriculum
            </span>
          </label>
          
          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-5 font-black text-slate-400 uppercase text-xs tracking-widest hover:text-slate-900 transition-colors"
            >
              Discard
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-[2] py-5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-[1.5rem] font-black uppercase text-xs shadow-xl active:scale-95 transition-all hover:opacity-90 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Validating...
                </>
              ) : (
                <>
                  Confirm Provision <FaArrowRight />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}