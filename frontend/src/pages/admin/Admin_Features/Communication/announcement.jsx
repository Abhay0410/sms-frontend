//announcement.jsx
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../../services/api";
import {
  FaPlus, FaTimes, FaCheck, FaTrash, FaBell,
  FaGraduationCap, FaUsers, FaSpinner, FaPaperclip, FaSearch,
  FaChevronDown, FaChevronUp, FaFile, FaFilePdf, FaFileImage,
  FaCalendarAlt, FaFilter, FaEye, FaEyeSlash, FaStar, FaRegStar,
  FaExclamationTriangle, FaInfoCircle, FaBullhorn
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
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null); // New state for modal

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
      toast.success("Announcement created successfully!");
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

  // Updated: Just sets the ID to show modal
  const handleDelete = (id) => {
    setDeleteConfirmationId(id);
  };

  // New: Actual delete function called by modal
  const confirmDelete = async () => {
    if (!deleteConfirmationId) return;
    setDeleting(deleteConfirmationId);
    try {
      await api.delete(API_ENDPOINTS.ADMIN.ANNOUNCEMENT.DELETE(deleteConfirmationId));
      setAllAnnouncements(prev => prev.filter(a => a._id !== deleteConfirmationId));
      toast.success("Announcement deleted successfully");
    } catch (err) { 
      console.error("Delete error:", err);
      toast.error("Failed to delete announcement"); 
    } finally { 
      setDeleting(null); 
      setDeleteConfirmationId(null);
    }
  };

  // Updated: Send only { isPinned } to fix update issue
  const togglePinAnnouncement = async (announcement) => {
    try {
      // Send only the field to update to avoid validation errors with full object
      await api.put(API_ENDPOINTS.ADMIN.ANNOUNCEMENT.UPDATE(announcement._id), { 
        isPinned: !announcement.isPinned 
      });
      
      setAllAnnouncements(prev => 
        prev.map(a => a._id === announcement._id ? { ...a, isPinned: !a.isPinned } : a)
      );
      toast.success(announcement.isPinned ? "Announcement unpinned" : "Announcement pinned");
    } catch (err) {
      console.error("Pin error:", err);
      toast.error("Failed to update announcement");
    }
  };

  const priorityColor = (p) => {
    if (p === "HIGH") return "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-l-4 border-red-500";
    if (p === "MEDIUM") return "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-l-4 border-amber-500";
    return "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-l-4 border-blue-500";
  };

  const typeColor = (t) => {
    switch(t) {
      case "GENERAL": return "bg-indigo-100 text-indigo-700";
      case "ACADEMIC": return "bg-emerald-100 text-emerald-700";
      case "EVENT": return "bg-purple-100 text-purple-700";
      case "URGENT": return "bg-rose-100 text-rose-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  // Format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Announcement Management
          </h1>
          <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
            <FaBullhorn className="text-orange-500" />
            Create and manage announcements for students, teachers, and parents
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl">
                <FaBullhorn className="text-white text-xl" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Announcements</p>
                <p className="text-2xl font-bold text-slate-900">{allAnnouncements.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-xl">
                <FaStar className="text-white text-xl" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Pinned</p>
                <p className="text-2xl font-bold text-slate-900">
                  {allAnnouncements.filter(a => a.isPinned).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl">
                <FaExclamationTriangle className="text-white text-xl" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">High Priority</p>
                <p className="text-2xl font-bold text-slate-900">
                  {allAnnouncements.filter(a => a.priority === "HIGH").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl">
                <FaCalendarAlt className="text-white text-xl" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Today's</p>
                <p className="text-2xl font-bold text-slate-900">
                  {allAnnouncements.filter(a => {
                    const today = new Date();
                    const announcementDate = new Date(a.createdAt);
                    return announcementDate.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-slate-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-3.5 text-slate-400" />
                  <input 
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                    placeholder="Search announcements by title or content..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-5 py-3 rounded-xl border flex items-center gap-2 transition-all ${
                    showFilters 
                      ? 'bg-orange-50 border-orange-300 text-orange-700' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FaFilter /> Filters
                </button>
                
                <button 
                  onClick={handleSearch}
                  className="px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Search
                </button>
                
                <button 
                  onClick={() => setIsCreating(true)}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  <FaPlus /> New Announcement
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-orange-50 rounded-xl border border-slate-200 animate-slideDown">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                    <select 
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-orange-500"
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                    >
                      <option value="">All Types</option>
                      <option value="GENERAL">General</option>
                      <option value="ACADEMIC">Academic</option>
                      <option value="EVENT">Event</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                    <select 
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-orange-500"
                      value={filters.priority}
                      onChange={(e) => setFilters({...filters, priority: e.target.value})}
                    >
                      <option value="">All Priorities</option>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                    <select 
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-orange-500"
                      value={filters.isActive}
                      onChange={(e) => setFilters({...filters, isActive: e.target.value})}
                    >
                      <option value="">All Status</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button 
                      onClick={handleReset}
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Create Announcement Form */}
          {isCreating ? (
            <div className="p-8 animate-fadeIn">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Create New Announcement</h2>
                  <p className="text-slate-500 text-sm font-medium">Fill in the details below to create an announcement</p>
                </div>
                <button 
                  onClick={() => setIsCreating(false)}
                  className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-all"
                >
                  <FaTimes className="text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-8">
                {/* Title & Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Announcement Title</label>
                      <input 
                        name="title" 
                        placeholder="Enter announcement title..."
                        className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl font-semibold outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                        required 
                        onChange={handleCreateChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
                      <textarea 
                        name="content" 
                        placeholder="Enter announcement details..."
                        className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl h-48 resize-none outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                        required 
                        onChange={handleCreateChange}
                      />
                    </div>
                  </div>

                  {/* Settings Panel */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                      <select 
                        name="type"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-orange-500"
                        onChange={handleCreateChange}
                      >
                        <option value="GENERAL">General Announcement</option>
                        <option value="ACADEMIC">Academic Update</option>
                        <option value="EVENT">Event Notice</option>
                        <option value="URGENT">Urgent Notice</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["LOW", "MEDIUM", "HIGH"].map(level => (
                          <label 
                            key={level} 
                            className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
                              createForm.priority === level 
                                ? 'bg-orange-50 border-orange-500 text-orange-700 font-semibold' 
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <input 
                              type="radio" 
                              name="priority" 
                              value={level} 
                              checked={createForm.priority === level}
                              onChange={handleCreateChange}
                              className="hidden"
                            />
                            {level}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-slate-50 to-orange-50 p-4 rounded-xl border border-slate-200">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="isPinned" 
                          checked={createForm.isPinned}
                          onChange={handleCreateChange}
                          className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm font-medium text-slate-700">Pin to top</span>
                      </label>
                      <p className="text-xs text-slate-500 mt-2">Pinned announcements appear first</p>
                    </div>
                  </div>
                </div>

                {/* Audience Selection */}
                <div className="bg-gradient-to-r from-slate-50 to-orange-50 p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FaUsers className="text-orange-600" /> Target Audience
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">User Groups</h4>
                      <div className="space-y-3">
                        {['students', 'teachers', 'parents'].map(role => (
                          <label key={role} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 hover:border-orange-300 transition-all">
                            <input 
                              type="checkbox" 
                              name={`targetAudience.${role}`} 
                              checked={createForm.targetAudience[role]} 
                              onChange={handleCreateChange}
                              className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                            /> 
                            <span className="capitalize font-medium text-slate-700">{role}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <FaGraduationCap className="text-orange-600" /> Specific Classes
                      </h4>
                      <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 bg-white p-4 rounded-xl">
                        {classes.map(cls => (
                          <div key={cls.id} className="pb-2 last:pb-0">
                            <label className="flex gap-3 items-center text-sm font-medium cursor-pointer p-2 rounded hover:bg-slate-50">
                              <input 
                                type="checkbox" 
                                onChange={(e) => handleClassChange(cls, { target: { value: "ALL_SECTIONS", checked: e.target.checked }})}
                                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                              />
                              <span className="text-slate-700">{cls.className}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="border-2 border-dashed border-slate-300 p-8 rounded-2xl text-center hover:border-orange-400 hover:bg-orange-50 transition-all">
                  <label className="cursor-pointer">
                    <FaPaperclip className="text-4xl text-slate-400 mx-auto mb-3 group-hover:text-orange-500" />
                    <p className="text-slate-600 font-medium mb-1">Drop files here or click to upload</p>
                    <p className="text-sm text-slate-500">Supports PDF, Images, Documents</p>
                    <input 
                      type="file" 
                      multiple 
                      hidden 
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  
                  {previewFiles.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-3 justify-center">
                      {previewFiles.map((f, i) => (
                        <div key={i} className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-3 shadow-md">
                          <FaFile className="text-orange-300" />
                          <span className="text-sm font-medium truncate max-w-[150px]">{f.name}</span>
                          <FaTimes 
                            className="text-slate-300 hover:text-red-300 cursor-pointer transition-colors" 
                            onClick={() => removeFile(i)} 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
                  <button 
                    type="button" 
                    onClick={() => setIsCreating(false)}
                    className="px-8 py-3 font-medium text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <FaSpinner className="animate-spin" /> Publishing...
                      </span>
                    ) : (
                      "Publish Announcement"
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Announcements List */
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-16 text-center">
                  <FaSpinner className="animate-spin inline text-3xl text-orange-600 mb-4" />
                  <p className="text-slate-600 font-medium">Loading announcements...</p>
                </div>
              ) : allAnnouncements.length === 0 ? (
                <div className="p-16 text-center">
                  <FaBell className="text-5xl text-slate-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-700 mb-2">No announcements found</h3>
                  <p className="text-slate-500">Create your first announcement to get started</p>
                </div>
              ) : (
                allAnnouncements.map((ann) => (
                  <div 
                    key={ann._id} 
                    className={`p-6 hover:bg-slate-50 transition-all group ${ann.isPinned ? 'bg-gradient-to-r from-orange-50 to-yellow-50' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <button 
                            onClick={() => togglePinAnnouncement(ann)}
                            className="text-orange-400 hover:text-orange-600 transition-colors"
                          >
                            {ann.isPinned ? <FaStar className="text-xl" /> : <FaRegStar className="text-xl" />}
                          </button>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-700 transition-colors">
                              {ann.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={`${priorityColor(ann.priority)} px-3 py-1 rounded-lg text-xs font-bold uppercase`}>
                                {ann.priority}
                              </span>
                              <span className={`${typeColor(ann.type)} px-3 py-1 rounded-lg text-xs font-medium`}>
                                {ann.type}
                              </span>
                              <span className="text-slate-400 text-xs flex items-center gap-1">
                                <FaCalendarAlt /> {formatDate(ann.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className={`text-slate-600 mb-4 ${expandedAnnouncement === ann._id ? '' : 'line-clamp-2'}`}>
                          {ann.content}
                        </p>

                        {/* Audience Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {ann.targetAudience?.students && (
                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                              Students
                            </span>
                          )}
                          {ann.targetAudience?.teachers && (
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                              Teachers
                            </span>
                          )}
                          {ann.targetAudience?.parents && (
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                              Parents
                            </span>
                          )}
                        </div>

                        {/* Attachments */}
                        {expandedAnnouncement === ann._id && ann.attachments?.length > 0 && (
                          <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm animate-fadeIn">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <FaPaperclip /> Attachments ({ann.attachments.length})
                            </h4>
                            <div className="flex flex-wrap gap-3">
                              {ann.attachments.map((file, idx) => {
                                const fileUrl = file?.fileUrl || "";
                                const fileLink = fileUrl.startsWith('http') 
                                  ? fileUrl 
                                  : `${BACKEND_URL}${fileUrl}`;
                                
                                return (
                                  <a 
                                    key={idx}
                                    href={fileLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all group/item"
                                  >
                                    <div className={`p-2 rounded-lg ${
                                      file.fileType === 'image' 
                                        ? 'bg-rose-100 text-rose-600' 
                                        : 'bg-blue-100 text-blue-600'
                                    }`}>
                                      {file.fileType === 'image' ? <FaFileImage /> : <FaFilePdf />}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-slate-700 group-hover/item:text-orange-700">
                                        {file.fileName}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : ''}
                                      </p>
                                    </div>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => setExpandedAnnouncement(expandedAnnouncement === ann._id ? null : ann._id)} 
                          className={`p-3 rounded-xl transition-all ${
                            expandedAnnouncement === ann._id 
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                              : 'bg-slate-100 text-slate-500 hover:bg-orange-50 hover:text-orange-600'
                          }`}
                          title={expandedAnnouncement === ann._id ? "Collapse" : "Expand"}
                        >
                          {expandedAnnouncement === ann._id ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                        
                        <button 
                          onClick={() => handleDelete(ann._id)} 
                          disabled={deleting === ann._id} 
                          className="p-3 bg-gradient-to-r from-red-50 to-rose-50 text-red-500 rounded-xl hover:bg-red-100 hover:text-red-700 transition-all disabled:opacity-50"
                          title="Delete announcement"
                        >
                          {deleting === ann._id ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaTrash />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pagination */}
          {!isCreating && totalPages > 1 && (
            <div className="border-t border-slate-100 p-6">
              <div className="flex justify-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentPage(i + 1)} 
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      currentPage === i + 1 
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmationId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 transform transition-all scale-100">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTrash className="text-2xl text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Announcement?</h3>
                <p className="text-slate-500">
                  Are you sure you want to delete this announcement? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmationId(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting === deleteConfirmationId}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  {deleting === deleteConfirmationId ? (
                    <>
                      <FaSpinner className="animate-spin" /> Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
