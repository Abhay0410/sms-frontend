import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../../services/api";
import { 
  FaPlus, FaTrash, FaBell, FaUsers, FaSpinner, 
  FaPaperclip, FaChevronDown, FaChevronUp, FaFilePdf, FaFileImage, FaGraduationCap 
} from "react-icons/fa";
import BackButton from "../../../../components/BackButton";

const BACKEND_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

export default function TeacherAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [mySections, setMySections] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "GENERAL",
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
    try {
      await api.post(API_ENDPOINTS.TEACHER.ANNOUNCEMENT.CREATE, formData);
      toast.success("Announcement Created!");
      setIsCreating(false);
      loadData();
    } catch (err) { 
      console.error("Submit Error:", err);
      toast.error(err.response?.data?.message || "Error creating announcement"); 
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
<BackButton/>
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

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-2 text-slate-400 font-bold hover:text-slate-600 transition-colors">Cancel</button>
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
            <div key={ann._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-all group">
              <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-xl text-slate-900 group-hover:text-indigo-600 transition-colors">{ann.title}</h3>
                    <div className="flex gap-3 mt-1 items-center">
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-indigo-100">{ann.type}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <button 
                    onClick={() => setExpandedId(expandedId === ann._id ? null : ann._id)}
                    className={`p-2.5 rounded-xl transition-all ${expandedId === ann._id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  {expandedId === ann._id ? <FaChevronUp /> : <FaChevronDown />}
                </button>
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