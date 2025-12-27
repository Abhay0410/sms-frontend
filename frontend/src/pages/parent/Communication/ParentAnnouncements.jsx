import { useState, useEffect, useCallback } from "react";
import api, { API_ENDPOINTS } from "../../../services/api";
import { FaUserCircle, FaPaperclip, FaFilePdf, FaFileImage } from "react-icons/fa";
import BackButton from "../../../components/BackButton.jsx";
const BACKEND_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

export default function ParentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("ALL");

  useEffect(() => {
    const fetchChildren = async () => {
      const res = await api.get(API_ENDPOINTS.PARENT.AUTH.CHILDREN);
      setChildren(res.data?.data || []);
    };
    fetchChildren();
  }, []);

  const loadAnnouncements = useCallback(async () => {
    const url = selectedChild === "ALL" 
      ? API_ENDPOINTS.PARENT.ANNOUNCEMENT.ALL 
      : API_ENDPOINTS.PARENT.ANNOUNCEMENT.BY_CHILD(selectedChild);
    const res = await api.get(url);
    setAnnouncements(res.data?.data || res.data || []);
  }, [selectedChild]);

  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Parent Notifications</h1>
        <select value={selectedChild} onChange={e => setSelectedChild(e.target.value)} className="p-2 border rounded-lg bg-white shadow-sm outline-none ring-indigo-500 focus:ring-2">
          <option value="ALL">All Children</option>
          {children.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>
      <BackButton/>
      <div className="grid gap-4">
        {announcements.map(ann => (
          <div key={ann._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${ann.type === 'EMERGENCY' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {ann.type}
              </span>
              <span className="text-xs text-slate-400 font-medium">{new Date(ann.createdAt).toLocaleDateString()}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">{ann.title}</h2>
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">{ann.content}</p>
            
            {ann.attachments?.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-50">
                {ann.attachments.map((file, i) => (
                  <a key={i} href={`${BACKEND_URL}${file.fileUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-semibold text-indigo-500 hover:underline">
                    <FaPaperclip /> {file.fileName}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}