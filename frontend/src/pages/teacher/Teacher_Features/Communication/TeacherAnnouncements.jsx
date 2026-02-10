import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../../services/api";
import { 
  FaPlus, FaTrash, FaBell, FaUsers, FaSpinner, 
  FaPaperclip, FaChevronDown, FaChevronUp, FaFilePdf, FaFileImage, FaGraduationCap,
  FaStar, FaRegStar, FaFile, FaTimes
} from "react-icons/fa";


const BACKEND_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";
export default function TeacherAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [mySections, setMySections] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [files, setFiles] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "GENERAL",
    isPinned: false,
    targetAudience: { students: true, parents: false, specificClasses: [] }
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // FIXED: Ensure API_ENDPOINTS.TEACHER.ANNOUNCEMENT.ALL is '/api/teacher/announcements'
      const res = await api.get(API_ENDPOINTS.TEACHER.ANNOUNCEMENT.ALL);
      setAnnouncements(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Fetch Error:", err); 
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSections = useCallback(async () => {
    try {
      const res = await api.get(API_ENDPOINTS.TEACHER.ANNOUNCEMENT.MY_SECTIONS);
      const data = res.data?.data?.sections || res.data?.sections || [];
      setMySections(data);
    } catch (err) { 
      console.error("Sections Load Error:", err); 
    }
  }, []);

  useEffect(() => { 
    loadData(); 
    loadSections(); 
  }, [loadData, loadSections]);

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

  const handleClassToggle = (sec) => {
    setFormData(prev => {
      const current = [...prev.targetAudience.specificClasses];
      const index = current.findIndex(c => c.class === sec.classId);
      
      if (index > -1) {
        return {
          ...prev,
          targetAudience: { ...prev.targetAudience, specificClasses: current.filter(c => c.class !== sec.classId) }
        };
      } else {
        return {
          ...prev,
          targetAudience: { 
            ...prev.targetAudience, 
            specificClasses: [...current, { class: sec.classId, allSections: false, sections: [sec.section] }] 
          }
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.targetAudience.specificClasses.length === 0) {
        return toast.warning("Please select at least one class");
    }
    
    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("content", formData.content);
    submitData.append("type", formData.type);
    submitData.append("targetAudience", JSON.stringify(formData.targetAudience));
    submitData.append("isPinned", formData.isPinned);
    
    files.forEach(file => submitData.append("attachments", file));

    try {
      await api.post(API_ENDPOINTS.TEACHER.ANNOUNCEMENT.CREATE, submitData);
      toast.success("Announcement Created!");
      setIsCreating(false);
      setFiles([]);
      setPreviewFiles([]);
      setFormData({
        title: "",
        content: "",
        type: "GENERAL",
        isPinned: false,
        targetAudience: { students: true, parents: false, specificClasses: [] }
      });
      loadData();
    } catch (err) { 
      console.error("Submit Error:", err);
      toast.error(err.response?.data?.message || "Error creating announcement"); 
    }
  };

  const togglePinAnnouncement = async (announcement) => {
    try {
      // Updated to use PATCH and correct endpoint from constants
      await api.patch(API_ENDPOINTS.TEACHER.ANNOUNCEMENT.TOGGLE_PIN(announcement._id));
      
      setAnnouncements(prev => 
        prev.map(a => a._id === announcement._id ? { ...a, isPinned: !a.isPinned } : a)
      );
      toast.success(announcement.isPinned ? "Announcement unpinned" : "Announcement pinned");
    } catch (err) {
      console.error("Pin error:", err);
      toast.error("Failed to update announcement");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    setDeleting(id);
    try {
      await api.delete(API_ENDPOINTS.TEACHER.ANNOUNCEMENT.DELETE(id));
      setAnnouncements(prev => prev.filter(a => a._id !== id));
      toast.success("Announcement deleted");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete announcement");
    } finally {
      setDeleting(null);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "URGENT": return "bg-rose-100 text-rose-700 border-rose-200";
      case "EVENT": return "bg-amber-100 text-amber-700 border-amber-200";
      case "ACADEMIC": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-indigo-50 text-indigo-600 border-indigo-100";
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Class Announcements</h1>
        <button onClick={() => setIsCreating(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md font-bold">
          <FaPlus /> New Broadcast
        </button>
      </div>
{/* <BackButton/> */}
      {isCreating ? (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 mb-6 animate-in fade-in slide-in-from-top-5">
          <input className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Announcement Title" required onChange={e => setFormData({...formData, title: e.target.value})} />
          <textarea className="w-full border border-slate-200 p-3 rounded-xl h-32 resize-none outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Write your message..." required onChange={e => setFormData({...formData, content: e.target.value})} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><FaUsers/> Audience Roles</h4>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-600"><input type="checkbox" checked={formData.targetAudience.students} onChange={e => setFormData({...formData, targetAudience: {...formData.targetAudience, students: e.target.checked}})} /> Students</label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-600"><input type="checkbox" checked={formData.targetAudience.parents} onChange={e => setFormData({...formData, targetAudience: {...formData.targetAudience, parents: e.target.checked}})} /> Parents</label>
                </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><FaGraduationCap/> Target My Classes</h4>
                <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
                    {/* FIXED: mySections is now mapped here */}
                    {mySections.map((sec, idx) => (
                        <label key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
                            <span className="font-bold text-slate-700">{sec.className} - {sec.section}</span>
                            <input 
                                type="checkbox" 
                                className="rounded text-indigo-600"
                                onChange={() => handleClassToggle(sec)}
                                checked={formData.targetAudience.specificClasses.some(c => c.class === sec.classId)}
                            /> 
                        </label>
                    ))}
                </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer bg-orange-50 px-4 py-2 rounded-lg border border-orange-100">
              <input type="checkbox" checked={formData.isPinned} onChange={e => setFormData({...formData, isPinned: e.target.checked})} className="rounded text-orange-600 focus:ring-orange-500" />
              <span className="text-sm font-bold text-orange-700 flex items-center gap-2"><FaStar/> Pin to Top</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
              <FaPaperclip className="text-slate-500"/>
              <span className="text-sm font-bold text-slate-600">Attach Files</span>
              <input type="file" multiple hidden onChange={handleFileChange} />
            </label>
          </div>

          {previewFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
              {previewFiles.map((f, i) => (
                <div key={i} className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2 shadow-sm">
                  <FaFile className="text-indigo-400 text-xs" />
                  <span className="text-xs font-medium text-slate-700 truncate max-w-[150px]">{f.name}</span>
                  <FaTimes 
                    className="text-slate-400 hover:text-red-500 cursor-pointer text-xs" 
                    onClick={() => removeFile(i)} 
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => { setIsCreating(false); setFiles([]); setPreviewFiles([]); }} className="px-6 py-2 text-slate-400 font-bold hover:text-slate-600 transition-colors">Cancel</button>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-indigo-100">Post Now</button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center py-20 text-slate-300">
                <FaSpinner className="animate-spin text-4xl mb-2" />
                <p className="font-medium">Loading notices...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-white p-20 rounded-2xl text-center border-2 border-dashed border-slate-200">
                <FaBell className="mx-auto text-4xl text-slate-200 mb-4" />
                <p className="text-slate-500 font-bold">No announcements found for your classes.</p>
            </div>
          ) : announcements.map(ann => (
            <div key={ann._id} className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-all group ${ann.isPinned ? 'bg-gradient-to-r from-orange-50/50 to-yellow-50/50 border-orange-100' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {ann.isPinned && <FaStar className="text-orange-400 text-sm" />}
                      <h3 className="font-bold text-xl text-slate-900 group-hover:text-indigo-600 transition-colors">{ann.title}</h3>
                    </div>
                    <div className="flex gap-3 mt-1 items-center">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border ${getTypeColor(ann.type)}`}>{ann.type}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => togglePinAnnouncement(ann)}
                    className={`p-2.5 rounded-xl transition-all ${ann.isPinned ? 'text-orange-500 bg-orange-50 hover:bg-orange-100' : 'text-slate-300 hover:text-orange-400 hover:bg-slate-50'}`}
                  >
                    {ann.isPinned ? <FaStar /> : <FaRegStar />}
                  </button>
                  <button 
                    onClick={() => handleDelete(ann._id)}
                    disabled={deleting === ann._id}
                    className="p-2.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                  >
                    {deleting === ann._id ? <FaSpinner className="animate-spin"/> : <FaTrash />}
                  </button>
                  <button 
                      onClick={() => setExpandedId(expandedId === ann._id ? null : ann._id)}
                      className={`p-2.5 rounded-xl transition-all ${expandedId === ann._id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    {expandedId === ann._id ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
              </div>
              
              <p className={`text-slate-500 mt-4 text-sm leading-relaxed ${expandedId === ann._id ? '' : 'line-clamp-2'}`}>{ann.content}</p>
              
              {expandedId === ann._id && (
                <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in zoom-in-95">
                    {ann.attachments?.length > 0 && (
                        <div className="flex flex-wrap gap-3 mb-6">
                        {ann.attachments.map((file, i) => (
                            <a key={i} href={`${BACKEND_URL}${file.fileUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-bold hover:bg-white hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm">
                            {file.fileType === 'image' ? <FaFileImage size={14} className="text-emerald-500"/> : <FaFilePdf size={14} className="text-rose-500"/>} {file.fileName}
                            </a>
                        ))}
                        </div>
                    )}
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                        <span>ID: {ann._id.slice(-6)}</span>
                        <span>Post by: {ann.createdByName || "System"}</span>
                    </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}