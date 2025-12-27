import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../../services/api'; 
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { format } from 'date-fns';
import { FaPaperPlane, FaInbox, FaSpinner, FaChevronRight, FaChalkboardTeacher } from "react-icons/fa";
import BackButton from '../../../components/BackButton';
import { toast } from 'react-hot-toast';

const StudentMessaging = () => {
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const scrollRef = useRef();

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(API_ENDPOINTS.STUDENT.MESSAGING.GET_THREADS);
      // ✅ res.data contains processedThreads with 'displayTitle'
      setThreads(response.data || []); 
    } catch (error) {
      console.error("Error fetching threads:", error);
      toast.error("Failed to load inbox");
    } finally {
      setLoading(false);
    }
  }, []);

  const selectThread = async (id) => {
    try {
      const response = await api.get(API_ENDPOINTS.STUDENT.MESSAGING.GET_THREAD_BY_ID(id));
      setActiveThread(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to open chat");
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeThread) return;
    try {
      await api.post(API_ENDPOINTS.STUDENT.MESSAGING.REPLY(activeThread._id), { 
        message: replyMessage 
      });
      setReplyMessage('');
      await selectThread(activeThread._id);
      fetchThreads(); 
    } catch (error) {
      console.error(error);
      toast.error("Reply failed");
    }
  };

  useEffect(() => { fetchThreads(); }, [fetchThreads]);
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeThread]);

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <div className="mb-4 flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <BackButton />
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <FaInbox className="text-indigo-600" /> Communications
          </h2>
        </div>
      </div>

      <div className="flex h-[82vh] bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl m-2">
        {/* Sidebar */}
        <div className="w-80 border-r flex flex-col bg-slate-50/50">
          <div className="p-6 border-b bg-white">
            <h3 className="text-lg font-bold text-indigo-700">Student Inbox</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Chat List</p>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-10 text-center"><FaSpinner className="animate-spin mx-auto text-indigo-600" size={24} /></div>
            ) : threads.length > 0 ? (
              threads.map(t => (
                <div 
                  key={t._id} 
                  onClick={() => selectThread(t._id)} 
                  className={`p-5 border-b cursor-pointer transition-all hover:bg-white ${
                    activeThread?._id === t._id ? 'bg-white border-l-4 border-indigo-600 shadow-md' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    {/* ✅ Partner Name (Teacher) */}
                    <h4 className="font-bold text-slate-700 text-sm truncate">{t.displayTitle}</h4>
                    <span className="text-[10px] text-slate-400">{t.lastMessageAt && format(new Date(t.lastMessageAt), 'p')}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${t.context?.sectionName ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                      {t.context?.sectionName ? `Class ${t.context.sectionName}` : 'Personal'}
                    </span>
                    <FaChevronRight size={10} className="text-slate-300" />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-slate-400 italic">No conversations yet</div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-slate-100/30">
          {activeThread ? (
            <>
              {/* ✅ HEADER: Shows Teacher Name clearly */}
              <div className="p-5 bg-white border-b flex items-center gap-4 shadow-sm">
                <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-100 uppercase">
                  {(activeThread.displayTitle || 'T').charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 leading-tight">
                    {activeThread.displayTitle}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Teacher Chat</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {activeThread.messages?.map((msg, i) => {
                  const isMe = msg.senderType === 'student';
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-4 rounded-2xl max-w-[70%] shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                        {!isMe && <p className="text-[10px] font-black text-indigo-500 mb-1.5 uppercase tracking-tighter">TEACHER</p>}
                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                        <span className="text-[9px] block text-right opacity-60 mt-2">{format(new Date(msg.createdAt), 'p')}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>

              <form onSubmit={handleReply} className="p-6 bg-white border-t flex gap-4 items-center">
                <input value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} className="flex-1 bg-slate-100 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-indigo-500/20 text-sm" placeholder="Type a message..." />
                <button type="submit" className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95"><FaPaperPlane /></button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 space-y-4">
              <div className="h-24 w-24 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center bg-white shadow-inner"><FaInbox size={32} /></div>
              <p className="font-bold text-slate-400">Select a message to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentMessaging;