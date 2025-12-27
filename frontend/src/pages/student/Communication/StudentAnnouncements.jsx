import { useState, useEffect, useCallback } from "react";
import api, { API_ENDPOINTS } from "../../../services/api";
import { 
  FaBell, FaChevronDown, FaChevronUp, FaFilePdf, FaFileImage, 
  FaCalendarAlt, FaBullhorn, FaInfoCircle, FaFileAlt, FaSpinner 
} from "react-icons/fa";

const BACKEND_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get current user ID (assuming it's stored in local storage or context)
  // Replace this with your actual auth logic
  const studentId = localStorage.getItem("userId"); 

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(API_ENDPOINTS.STUDENT.ANNOUNCEMENT.ALL);
      setAnnouncements(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to load notices", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markRead = async (id, isRead) => {
    if (isRead) return; // Don't call API if already read
    try {
      await api.put(API_ENDPOINTS.STUDENT.ANNOUNCEMENT.MARK_READ(id));
      // Locally update to avoid a full reload
      setAnnouncements(prev => prev.map(ann => 
        ann._id === id ? { ...ann, readBy: [...(ann.readBy || []), { user: studentId }] } : ann
      ));
    } catch (err) {
      console.error("Error marking as read", err);
    }
  };

  useEffect(() => { loadData(); }, [loadData]);

  const toggleExpand = (id, readStatus) => {
    setExpandedId(expandedId === id ? null : id);
    if (expandedId !== id) markRead(id, readStatus);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <FaSpinner className="animate-spin text-4xl mb-4 text-indigo-500" />
        <p className="font-medium animate-pulse">Syncing notice board...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen bg-slate-50/50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
              <FaBullhorn size={20} />
            </div>
            Notice Board
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Latest updates from your school administration</p>
        </div>
        
        <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-widest">
           <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
           {announcements.length} Total Notices
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-20 text-center">
          <FaBell className="mx-auto text-slate-200 text-6xl mb-4" />
          <h3 className="text-xl font-bold text-slate-800">Everything caught up!</h3>
          <p className="text-slate-500">There are no active announcements on your board right now.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((ann) => {
            const isRead = ann.readBy?.some(r => r.user === studentId);
            const isHighPriority = ann.priority === 'HIGH';

            return (
              <div 
                key={ann._id} 
                className={`group transition-all duration-300 rounded-3xl border bg-white overflow-hidden hover:shadow-xl hover:shadow-indigo-100/50 ${
                  expandedId === ann._id ? 'ring-2 ring-indigo-500 border-transparent shadow-xl' : 'border-slate-200 shadow-sm'
                }`}
              >
                <div 
                  onClick={() => toggleExpand(ann._id, isRead)}
                  className="p-5 md:p-6 cursor-pointer flex items-start gap-4"
                >
                  {/* Status Icon */}
                  <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                    isRead ? 'bg-slate-100 text-slate-400' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {isRead ? <FaCheckCircle size={18} /> : <FaBell className="animate-bounce" size={18} />}
                  </div>

                  {/* Content Header */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className={`text-lg font-bold truncate tracking-tight transition-colors ${
                        isRead ? 'text-slate-600' : 'text-slate-900 group-hover:text-indigo-600'
                      }`}>
                        {ann.title}
                      </h3>
                      
                      {isHighPriority && (
                        <span className="bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg animate-pulse border border-rose-200">
                          Urgent
                        </span>
                      )}

                      {!isRead && (
                        <span className="bg-indigo-600 w-2 h-2 rounded-full shadow-lg shadow-indigo-400"></span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <FaCalendarAlt size={12} className="text-slate-300" />
                        {new Date(ann.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FaInfoCircle size={12} className="text-slate-300" />
                        {ann.type || 'General'}
                      </span>
                    </div>
                  </div>

                  <button className={`p-2 rounded-xl transition-all ${
                    expandedId === ann._id ? 'bg-indigo-500 text-white rotate-180' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}>
                    <FaChevronDown />
                  </button>
                </div>

                {/* Expanded Content */}
                {expandedId === ann._id && (
                  <div className="px-5 md:px-6 pb-6 pt-2 border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {ann.content}
                    </p>

                    {/* Attachments */}
                    {ann.attachments?.length > 0 && (
                      <div className="mt-6 flex flex-col gap-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Attachments</p>
                        <div className="flex flex-wrap gap-2">
                          {ann.attachments.map((file, i) => (
                            <a 
                              key={i} 
                              href={`${BACKEND_URL}${file.fileUrl}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-3 px-4 py-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-2xl transition-all text-xs font-bold text-slate-700 hover:text-indigo-600"
                            >
                              <div className={file.fileType === 'image' ? 'text-emerald-500' : 'text-rose-500'}>
                                {file.fileType === 'image' ? <FaFileImage size={16} /> : <FaFilePdf size={16} />}
                              </div>
                              {file.fileName}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}