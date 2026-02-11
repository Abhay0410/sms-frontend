import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import { 
  FaPaperPlane, FaUsers, FaPlus, FaSearch, FaSpinner, 
  FaInbox, FaClock, FaTimes, FaUserGraduate, FaUserFriends, FaChevronRight,
  FaPaperclip, FaTrash, FaFile, FaFilePdf, FaFileImage, FaDownload
} from "react-icons/fa";
import { format } from 'date-fns';
// import BackButton from "../../../../components/BackButton";

const BACKEND_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

const TeacherMessaging = () => {
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyFiles, setReplyFiles] = useState([]);
  const [composeFiles, setComposeFiles] = useState([]);
  
  const [showCompose, setShowCompose] = useState(false);
  const [mySections, setMySections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', message: '', mode: 'section', 
    classId: '', sectionName: '', includeStudents: true, includeParents: true,
    studentIds: [], parentIds: []
  });

  const scrollRef = useRef();

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.TEACHER.MESSAGING.GET_THREADS);
      // ✅ res.data now contains processedThreads with 'displayTitle'
      setThreads(res.data || []);
    } catch { toast.error("Failed to load chats"); } 
    finally { setLoading(false); }
  }, []);

  const fetchMySections = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.TEACHER.MESSAGING.GET_MY_SECTIONS);
      if (res?.data) setMySections(res.data);
    } catch { console.error("Could not load sections"); }
  };

  const handleSearch = async (value) => {
    setSearchTerm(value);
    if (value.trim().length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await api.get(`${API_ENDPOINTS.TEACHER.MESSAGING.SEARCH_RECIPIENTS}?q=${value.trim()}`);
      if (res?.data) setSearchResults(res.data);
    } catch (err) { console.error("Search failed:", err); } 
    finally { setSearchLoading(false); }
  };

  const handleRecipientSelect = (user) => {
    const isStudent = user.type === 'student';
    setFormData(prev => ({
      ...prev,
      mode: 'single',
      studentIds: isStudent ? [user._id] : [],
      parentIds: !isStudent ? [user._id] : [],
      title: `Chat with ${user.name}`
    }));
    setSearchTerm(user.name);
    setSearchResults([]);
    toast.success(`Recipient selected: ${user.name}`);
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) return toast.error("Enter a message");
    if (formData.mode === 'section' && !formData.classId) return toast.error("Select a class");
    if (formData.mode === 'single' && formData.studentIds.length === 0 && formData.parentIds.length === 0) return toast.error("Select a recipient");

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("message", formData.message);
    submitData.append("mode", formData.mode);
    
    if (formData.mode === 'section') {
      submitData.append("classId", formData.classId);
      submitData.append("sectionName", formData.sectionName);
      submitData.append("includeStudents", formData.includeStudents);
      submitData.append("includeParents", formData.includeParents);
    } else {
      submitData.append("studentIds", JSON.stringify(formData.studentIds));
      submitData.append("parentIds", JSON.stringify(formData.parentIds));
    }

    composeFiles.forEach(file => submitData.append("attachments", file));

    try {
      await api.post(API_ENDPOINTS.TEACHER.MESSAGING.CREATE_THREAD, submitData);
      toast.success("Message sent");
      setShowCompose(false);
      resetForm();
      fetchThreads();
    } catch (err) { console.error(err); toast.error("Failed to send"); }
  };

  const resetForm = () => {
    setFormData({ title: '', message: '', mode: 'section', classId: '', sectionName: '', includeStudents: true, includeParents: true, studentIds: [], parentIds: [] });
    setSearchTerm(''); setComposeFiles([]);
    setSearchResults([]);
  };

  const selectThread = async (id) => {
    try {
      const res = await api.get(API_ENDPOINTS.TEACHER.MESSAGING.GET_THREAD_BY_ID(id));
      // ✅ Backend now returns { ...thread, displayTitle }
      if (res && res.data) {
        setActiveThread(res.data);
      }
    } catch (err) { 
      console.error("Fetch Thread Error:", err);
      toast.error("Chat load failed"); 
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!activeThread) return;

    if (!replyMessage.trim() && replyFiles.length === 0) {
      return toast.warning("Please enter a message or attach a file");
    }

    const threadId = activeThread._id;
    
    const submitData = new FormData();
    submitData.append("message", replyMessage.trim() || "Sent an attachment");
    replyFiles.forEach(file => submitData.append("attachments", file));

    try {
      await api.post(API_ENDPOINTS.TEACHER.MESSAGING.REPLY(threadId), submitData);
      setReplyMessage('');
      setReplyFiles([]);
      await selectThread(threadId);
      await fetchThreads();
    } catch {
      toast.error("Failed to send reply");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if(!window.confirm("Delete this message?")) return;
    try {
      await api.delete(API_ENDPOINTS.TEACHER.MESSAGING.DELETE_MESSAGE(activeThread._id, messageId));
      setActiveThread(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m._id !== messageId)
      }));
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete message");
    }
  };

  useEffect(() => { fetchThreads(); fetchMySections(); }, [fetchThreads]);
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeThread]);

  return (
    <div className="p-4 h-full bg-slate-50">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* <BackButton /> */}
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <FaInbox className="text-indigo-600" /> Communications
          </h2>
        </div>
        <button onClick={() => setShowCompose(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg transition-all">
          <FaPlus /> New Chat
        </button>
      </div>

      <div className="flex h-[80vh] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
        {/* Sidebar */}
        <div className="w-80 border-r flex flex-col bg-slate-50/50">
          <div className="p-5 border-b bg-white font-bold text-indigo-700">Conversations</div>
          <div className="overflow-y-auto flex-1">
            {loading ? <div className="p-10 text-center"><FaSpinner className="animate-spin mx-auto text-indigo-500" /></div> : 
              threads.map(t => (
                <div key={t._id} onClick={() => selectThread(t._id)} className={`p-4 border-b cursor-pointer transition-all hover:bg-white ${activeThread?._id === t._id ? 'bg-white border-l-4 border-indigo-600 shadow-inner' : ''}`}>
                  <div className="flex justify-between items-start mb-1">
                    {/* ✅ Using Dynamic displayTitle from backend */}
                    <span className="font-bold text-slate-700 text-sm truncate">{t.displayTitle}</span>
                    <span className="text-[10px] text-slate-400">{t.lastMessageAt && format(new Date(t.lastMessageAt), 'p')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-indigo-500 font-bold uppercase">{t.partnerRole || (t.context?.sectionName ? 'Broadcast' : 'Chat')}</p>
                    <FaChevronRight size={10} className="text-slate-300" />
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-slate-100/30">
          {activeThread ? (
            <>
              <div className="p-4 bg-white border-b flex items-center gap-3 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold uppercase">
                  {(activeThread.displayTitle || 'C').charAt(0)}
                </div>
                <div>
                  {/* ✅ Using Dynamic displayTitle for header */}
                  <h3 className="font-bold text-slate-800">{activeThread.displayTitle}</h3>
                  <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Online</p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeThread.messages?.map((msg, i) => (
                  <div key={i} className={`flex ${msg.senderType === 'teacher' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-4 rounded-2xl max-w-[70%] shadow-sm ${msg.senderType === 'teacher' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                      {msg.senderType !== 'teacher' && <p className="text-[9px] font-black text-indigo-500 mb-1 uppercase">{msg.senderType}</p>}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      
                      {/* Attachments Display */}
                      {msg.attachments?.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.attachments.map((att, idx) => {
                             const fileUrl = att.fileUrl?.startsWith('http') ? att.fileUrl : `${BACKEND_URL}${att.fileUrl}`;
                             return (
                              <a key={idx} href={fileUrl} target="_blank" rel="noreferrer" className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition-all ${msg.senderType === 'teacher' ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                                {att.fileType === 'image' ? <FaFileImage /> : <FaFilePdf />}
                                <span className="truncate max-w-[150px]">{att.fileName}</span>
                                <FaDownload className="ml-auto opacity-70" />
                              </a>
                             );
                          })}
                        </div>
                      )}

                      <span className="text-[9px] block text-right opacity-60 mt-2">{format(new Date(msg.createdAt), 'p')}</span>
                    </div>
                    {/* Delete Button for Teacher */}
                    {msg.senderType === 'teacher' && (
                      <button onClick={() => handleDeleteMessage(msg._id)} className="ml-2 text-slate-300 hover:text-red-500 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaTrash size={12} />
                      </button>
                    )}
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
              
              <form onSubmit={handleReply} className="p-4 bg-white border-t flex flex-col gap-3">
                {replyFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {replyFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
                        <FaFile className="text-indigo-500" /> {f.name}
                        <button type="button" onClick={() => setReplyFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500"><FaTimes /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-3 items-center">
                <label className="cursor-pointer p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                  <FaPaperclip />
                  <input type="file" multiple className="hidden" onChange={(e) => setReplyFiles([...replyFiles, ...Array.from(e.target.files)])} />
                </label>
                <input value={replyMessage} onChange={(e)=>setReplyMessage(e.target.value)} className="flex-1 bg-slate-100 border-none rounded-2xl px-6 py-3 outline-none focus:ring-2 ring-indigo-500/20 text-sm" placeholder="Write a message..." />
                <button className="bg-indigo-600 text-white p-3.5 rounded-2xl hover:bg-indigo-700 shadow-lg transition-transform active:scale-95">
                  <FaPaperPlane />
                </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 space-y-4 font-medium italic">
              <FaInbox size={48} />
              <p>Select a thread to view conversation</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Unchanged but ensure search results use correct styling */}
      {showCompose && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden border animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">New Message</h3>
              <button onClick={() => { setShowCompose(false); resetForm(); }} className="h-10 w-10 rounded-full hover:bg-white/10 flex items-center justify-center"><FaTimes /></button>
            </div>

            <div className="flex p-2 mx-6 mt-6 bg-slate-100 rounded-2xl">
                <button className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${formData.mode === 'section' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500'}`} onClick={() => setFormData({...formData, mode: 'section'})}>Broadcast</button>
                <button className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${formData.mode === 'single' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500'}`} onClick={() => setFormData({...formData, mode: 'single'})}>Individual</button>
            </div>

            <form onSubmit={handleCreateThread} className="p-8 space-y-6">
              {formData.mode === 'section' ? (
                <div className="space-y-4">
                    <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 ring-indigo-500/20" value={formData.classId} onChange={(e) => {
                        const selected = mySections.find(s => s.classId === e.target.value);
                        setFormData({...formData, classId: e.target.value, sectionName: selected?.sectionName || ''});
                    }}>
                      <option value="">Choose Class-Section</option>
                      {mySections.map((s, i) => <option key={i} value={s.classId}>{s.displayName}</option>)}
                    </select>
                </div>
              ) : (
                <div className="relative space-y-2">
                  <div className="relative group">
                    <FaSearch className="absolute left-4 top-4 text-slate-300" />
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-12 outline-none focus:ring-2 ring-indigo-500/20" placeholder="Find student or parent..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} />
                    {searchLoading && <FaSpinner className="absolute right-4 top-4 animate-spin text-indigo-500" />}
                  </div>
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 mt-2 max-h-52 overflow-y-auto">
                      {searchResults.map((user) => (
                        <div key={user._id} className="p-4 hover:bg-indigo-50 cursor-pointer flex justify-between items-center" onClick={() => handleRecipientSelect(user)}>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">{user.name}</span>
                            <span className="text-[10px] text-slate-400">{user.sub}</span>
                          </div>
                          <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${user.type === 'student' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>{user.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <textarea required className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 h-32 resize-none outline-none focus:ring-2 ring-indigo-500/20" placeholder="Type your message here..." value={formData.message} onChange={(e)=>setFormData({...formData, message: e.target.value})} />
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all">
                  <FaPaperclip className="text-indigo-500" /> Attach Files
                  <input type="file" multiple className="hidden" onChange={(e) => setComposeFiles([...composeFiles, ...Array.from(e.target.files)])} />
                </label>
                {composeFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {composeFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-lg text-xs font-bold text-indigo-700 border border-indigo-100">
                        {f.name} <button type="button" onClick={() => setComposeFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-indigo-400 hover:text-red-500"><FaTimes /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => { setShowCompose(false); resetForm(); }} className="flex-1 py-4 text-sm font-bold text-slate-400">Discard</button>
                <button type="submit" className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">Send Message</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherMessaging;