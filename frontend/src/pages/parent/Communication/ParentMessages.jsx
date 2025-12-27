import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../../services/api';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { format } from 'date-fns';
import { FaPaperPlane, FaInbox, FaClock, FaSpinner, FaChevronRight, FaChild } from "react-icons/fa";
import BackButton from '../../../components/BackButton';
import { toast } from 'react-hot-toast';

const ParentMessaging = () => {
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const scrollRef = useRef();

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(API_ENDPOINTS.PARENT.MESSAGING.GET_THREADS);
      // ✅ Uses res.data containing 'displayTitle'
      setThreads(response.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load inbox");
    } finally {
      setLoading(false);
    }
  }, []);

  const selectThread = async (id) => {
    try {
      const response = await api.get(API_ENDPOINTS.PARENT.MESSAGING.GET_THREAD_BY_ID(id));
      setActiveThread(response.data);
    } catch (error) {
      console.error("Select thread error:", error);
      toast.error("Failed to load chat");
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeThread) return;
    try {
      await api.post(API_ENDPOINTS.PARENT.MESSAGING.REPLY(activeThread._id), { message: replyMessage });
      setReplyMessage('');
      await selectThread(activeThread._id);
      fetchThreads(); 
    } catch (error) {
      console.error("Reply error:", error);
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
          <div className="p-6 bg-emerald-700 text-white font-bold flex items-center gap-2 shadow-md">
            <FaInbox /> Parent Inbox
          </div>
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-10 text-center"><FaSpinner className="animate-spin mx-auto text-emerald-600" size={24} /></div>
            ) : threads.length > 0 ? (
              threads.map(t => (
                <div key={t._id} onClick={() => selectThread(t._id)} className={`p-5 border-b cursor-pointer transition-all hover:bg-white ${activeThread?._id === t._id ? 'bg-white border-l-4 border-emerald-600 shadow-md' : ''}`}>
                  {/* ✅ Shows Teacher Name */}
                  <h4 className="font-bold text-slate-700 text-sm truncate">{t.displayTitle}</h4>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-bold uppercase">
                      {t.context?.sectionName ? `Class ${t.context.sectionName}` : 'Personal'}
                    </span>
                    <span>{t.lastMessageAt && format(new Date(t.lastMessageAt), 'p')}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-slate-400 text-sm italic">No messages yet.</div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-100/30">
          {activeThread ? (
            <>
              {/* ✅ HEADER: Shows Teacher Name clearly for Parents */}
              <div className="p-5 bg-white border-b flex items-center gap-4 shadow-sm">
                <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-100 uppercase">
                  {(activeThread.displayTitle || 'T').charAt(0)}
                </div>
                <div>
                  {/* ✅ Dynamic Teacher Name */}
                  <h3 className="text-lg font-bold text-slate-800 leading-tight">
                    {activeThread.displayTitle}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">School Teacher</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {activeThread.messages?.map((msg, i) => {
                  const isMe = msg.senderType === 'parent';
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-4 rounded-2xl max-w-[70%] shadow-sm ${isMe ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                        {!isMe && <span className="text-[10px] font-black text-emerald-600 block mb-1 uppercase tracking-widest">TEACHER</span>}
                        <p className="text-sm leading-relaxed font-medium">{msg.content}</p>
                        <span className="text-[9px] block text-right opacity-60 mt-2">{format(new Date(msg.createdAt), 'p')}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>

              <form onSubmit={handleReply} className="p-6 bg-white border-t flex gap-4 items-center">
                <input className="flex-1 bg-slate-100 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-emerald-500/20 text-sm transition-all" placeholder="Type a message to the teacher..." value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} />
                <button type="submit" className="bg-emerald-600 text-white p-4 rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"><FaPaperPlane /></button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 space-y-4">
               <div className="h-24 w-24 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center bg-white shadow-inner"><FaInbox size={32} /></div>
               <p className="font-bold text-slate-400">Select a message from the teacher</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentMessaging;