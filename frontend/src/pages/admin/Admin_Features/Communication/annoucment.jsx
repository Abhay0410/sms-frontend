import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../../services/api";
import BackButton from "../../../../components/BackButton";
import {
  FaPlus, FaTimes, FaCheck, FaTrash, FaBell,
  FaGraduationCap, FaUsers, FaSpinner, FaPaperclip, FaSearch,
  FaChevronDown, FaChevronUp, FaFile, FaFilePdf, FaFileImage
} from "react-icons/fa";

// Constants
const BACKEND_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

export default function AdminAnnouncements() {
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [allAnnouncements, setAllAnnouncements] = useState([]);
  const [classes, setClasses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState(null);

  const [filters, setFilters] = useState({
    type: "",
    priority: "",
    isActive: "",
    search: "",
  });

  const [createForm, setCreateForm] = useState({
    title: "",
    content: "",
    type: "GENERAL",
    priority: "MEDIUM",
    isPinned: false,
    targetAudience: {
      students: false,
      teachers: false,
      parents: false,
      specificClasses: [],
    },
  });

  const [files, setFiles] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);

  // Data Loading
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const activeFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] !== "") activeFilters[key] = filters[key];
      });

      const params = { page: currentPage, limit: 10, ...activeFilters };
      const res = await api.get(API_ENDPOINTS.ADMIN.ANNOUNCEMENT.ALL, { params });
      
      const responseBody = res.data;

      if (Array.isArray(responseBody)) {
        setAllAnnouncements(responseBody);
        setTotalPages(1);
      } else if (responseBody?.data && Array.isArray(responseBody.data)) {
        setAllAnnouncements(responseBody.data);
        setTotalPages(responseBody.meta?.pagination?.totalPages || 1);
      } else {
        setAllAnnouncements([]);
      }
    } catch (err) {
      console.error("Load error:", err);
      setAllAnnouncements([]);
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  const loadClasses = useCallback(async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN.ANNOUNCEMENT.CLASSES);
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) setClasses(data);
    } catch (err) { 
      console.error("Class load error:", err);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadClasses(); }, [loadClasses]);

  const handleSearch = () => setCurrentPage(1);
  const handleReset = () => {
    setFilters({ type: "", priority: "", isActive: "", search: "" });
    setCurrentPage(1);
  };

  const handleCreateChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("targetAudience.")) {
      const field = name.split(".")[1];
      setCreateForm(prev => ({
        ...prev,
        targetAudience: { ...prev.targetAudience, [field]: type === "checkbox" ? checked : value },
      }));
    } else {
      setCreateForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleClassChange = (classItem, e) => {
    const { value: selection, checked } = e.target;
    setCreateForm(prev => {
      let specClasses = [...prev.targetAudience.specificClasses];
      const existingIndex = specClasses.findIndex(sc => sc.class === classItem.id);

      if (checked) {
        if (selection === "ALL_SECTIONS") {
          const newEntry = { class: classItem.id, allSections: true, sections: [] };
          if (existingIndex === -1) specClasses.push(newEntry);
          else specClasses[existingIndex] = newEntry;
        }
      } else {
        specClasses = specClasses.filter(sc => sc.class !== classItem.id);
      }
      return { ...prev, targetAudience: { ...prev.targetAudience, specificClasses: specClasses } };
    });
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviewFiles([]); 
    selected.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setPreviewFiles(prev => [...prev, { src: reader.result, name: file.name }]);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviewFiles(previewFiles.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    formData.append("title", createForm.title);
    formData.append("content", createForm.content);
    formData.append("type", createForm.type);
    formData.append("priority", createForm.priority);
    formData.append("targetAudience", JSON.stringify(createForm.targetAudience));
    formData.append("isPinned", createForm.isPinned);
    files.forEach(file => formData.append("attachments", file));

    try {
      await api.post(API_ENDPOINTS.ADMIN.ANNOUNCEMENT.CREATE, formData);
      toast.success("Announcement Created!");
      setIsCreating(false);
      setFiles([]);
      setPreviewFiles([]);
      loadData();
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Error creating announcement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    setDeleting(id);
    try {
      await api.delete(API_ENDPOINTS.ADMIN.ANNOUNCEMENT.DELETE(id));
      setAllAnnouncements(prev => prev.filter(a => a._id !== id));
      toast.success("Deleted");
    } catch (err) { 
      console.error("Delete error:", err);
      toast.error("Failed"); 
    } finally { 
      setDeleting(null); 
    }
  };

  const priorityColor = (p) => {
    if (p === "HIGH") return "bg-red-100 text-red-700";
    if (p === "MEDIUM") return "bg-amber-100 text-amber-700";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        <BackButton to="/admin/admin-dashboard" />
        
        <div className="flex justify-between items-center my-6">
          <h1 className="text-3xl font-bold text-slate-800">School Announcements</h1>
          <button onClick={() => setIsCreating(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all">
            <FaPlus /> New Announcement
          </button>
        </div>

        {!isCreating && (
          <div className="bg-white p-4 rounded-xl border mb-6 flex flex-wrap gap-4 items-center shadow-sm">
            <div className="flex-1 relative min-w-[200px]">
              <FaSearch className="absolute left-3 top-3.5 text-slate-400" />
              <input 
                className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="Search announcements..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            <button onClick={handleSearch} className="bg-slate-800 text-white px-6 py-2 rounded-lg">Search</button>
            <button onClick={handleReset} className="bg-slate-100 text-slate-600 px-6 py-2 rounded-lg">Reset</button>
          </div>
        )}

        {isCreating ? (
          <div className="bg-white p-8 rounded-2xl border animate-in slide-in-from-bottom-2 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-indigo-900">Compose Message</h2>
              <button onClick={() => setIsCreating(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><FaTimes/></button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <input name="title" placeholder="Heading" className="w-full border p-3 rounded-xl font-semibold outline-none focus:border-indigo-500" required onChange={handleCreateChange} />
              <textarea name="content" placeholder="Details..." className="w-full border p-4 rounded-xl h-40 resize-none outline-none focus:border-indigo-500" required onChange={handleCreateChange} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div>
                  <h4 className="font-bold mb-4 flex items-center gap-2"><FaUsers className="text-indigo-600"/> Roles</h4>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {['students', 'teachers', 'parents'].map(role => (
                      <label key={role} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border cursor-pointer hover:border-indigo-400 transition-all shadow-sm">
                        <input type="checkbox" name={`targetAudience.${role}`} checked={createForm.targetAudience[role]} onChange={handleCreateChange}/> <span className="capitalize">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-4 flex items-center gap-2"><FaGraduationCap className="text-indigo-600"/> Target Classes</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2 border p-3 bg-white rounded-xl shadow-inner">
                    {classes.map(cls => (
                      <div key={cls.id} className="border-b pb-2 last:border-0">
                        <label className="flex gap-2 text-sm font-medium items-center cursor-pointer">
                          <input type="checkbox" onChange={(e) => handleClassChange(cls, { target: { value: "ALL_SECTIONS", checked: e.target.checked }})} />
                          {cls.className}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-200 p-6 rounded-2xl text-center hover:bg-indigo-50 transition-all group">
                <label className="cursor-pointer">
                  <FaPaperclip className="text-3xl text-slate-300 mx-auto mb-2 group-hover:text-indigo-400" />
                  <p className="text-slate-500 font-medium">Attach files</p>
                  <input type="file" multiple hidden onChange={handleFileChange} />
                </label>
                {previewFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {previewFiles.map((f, i) => (
                      <div key={i} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 shadow-sm">
                        <FaFile size={10}/> {f.name} <FaTimes className="hover:text-red-300 cursor-pointer" onClick={() => removeFile(i)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-2.5 font-semibold text-slate-500 hover:text-slate-700">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white px-10 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg disabled:opacity-50" disabled={saving}>
                  {saving ? <><FaSpinner className="animate-spin inline mr-2"/> Posting...</> : "Publish Now"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden divide-y divide-slate-100">
            {loading ? (
              <div className="p-24 text-center">
                <FaSpinner className="animate-spin inline text-3xl text-indigo-600 mb-2" />
                <p className="text-slate-500">Loading broadcasts...</p>
              </div>
            ) : allAnnouncements.length === 0 ? (
              <div className="p-24 text-center">
                <FaBell className="text-5xl text-slate-100 mx-auto mb-3"/>
                <h3 className="text-xl font-bold text-slate-800">No Announcements Found</h3>
              </div>
            ) : (
              allAnnouncements.map(ann => (
                <div key={ann._id} className="p-6 hover:bg-slate-50 transition-all group">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{ann.title}</h3>
                        <span className={`${priorityColor(ann.priority)} text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-tight`}>{ann.priority}</span>
                        {ann.isPinned && <FaCheck className="text-orange-500" title="Pinned"/>}
                      </div>
                      
                      <p className={`text-slate-600 text-sm leading-relaxed ${expandedAnnouncement === ann._id ? '' : 'line-clamp-2'}`}>
                        {ann.content}
                      </p>

                      {/* --- ATTACHMENTS DISPLAY (FIXED PATHS) --- */}
                      {expandedAnnouncement === ann._id && ann.attachments?.length > 0 && (
                        <div className="mt-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm animate-in fade-in">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <FaPaperclip /> Documents ({ann.attachments.length})
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {ann.attachments.map((file, idx) => {
                              // Ensure the path is correct by checking if it starts with http
                              const fileLink = file.fileUrl.startsWith('http') 
                                ? file.fileUrl 
                                : `${BACKEND_URL}${file.fileUrl}`;
                              
                              return (
                                <a 
                                  key={idx}
                                  href={fileLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-2 p-2 px-3 border rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm"
                                >
                                  {file.fileType === 'image' ? <FaFileImage /> : <FaFilePdf />}
                                  <span className="truncate max-w-[150px]">{file.fileName}</span>
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span className="text-indigo-500">
                          Target: {ann.targetAudience?.students ? 'Students ' : ''}
                          {ann.targetAudience?.teachers ? 'Teachers ' : ''}
                          {ann.targetAudience?.parents ? 'Parents ' : ''}
                        </span>
                        <span>•</span>
                        <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => setExpandedAnnouncement(expandedAnnouncement === ann._id ? null : ann._id)} 
                        className={`p-2.5 rounded-xl transition-all ${expandedAnnouncement === ann._id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-indigo-50'}`}
                      >
                        {expandedAnnouncement === ann._id ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                      <button 
                        onClick={() => handleDelete(ann._id)} 
                        disabled={deleting === ann._id} 
                        className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 hover:text-red-600 transition-colors"
                      >
                        {deleting === ann._id ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!isCreating && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentPage(i + 1)} 
                className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-400 border hover:bg-slate-50'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}