import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import {
  FaBookReader,
  FaExchangeAlt,
  FaUserGraduate,
  FaBarcode,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaBookOpen,
  FaTimes,
  FaArrowRight,
  FaBook,
  FaChalkboardTeacher,
  FaListUl,
} from "react-icons/fa";

export default function BookIssueReturn() {
  const [activeTab, setActiveTab] = useState("ISSUE");
  const [loading, setLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]); // List for the modal
  const [showIssuedModal, setShowIssuedModal] = useState(false);
  const [issuedModalFilter, setIssuedModalFilter] = useState("ALL"); // ALL or OVERDUE

  const [stats, setStats] = useState({
    totalIssued: 0,
    totalReturned: 0,
    overdue: 0,
  });
  const [userType, setUserType] = useState("student");

  const [issueData, setIssueData] = useState({
    userId: "",
    serialCode: "",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });
  const [returnData, setReturnData] = useState({ serialCode: "" });

  const scanInputRef = useRef(null);
  const studentInputRef = useRef(null);

  useEffect(() => {
    if (activeTab === "ISSUE") {
      studentInputRef.current?.focus();
    } else {
      scanInputRef.current?.focus();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchLibraryStats();
    fetchRecentTransactions();
  }, []);

  const fetchLibraryStats = async () => {
    // try {
    //   const response = await api.get(API_ENDPOINTS.ADMIN.LIBRARY?.STATS || "/api/admin/library/stats");
    //   setStats(response.data || { totalIssued: 0, totalReturned: 0, overdue: 0 });
    // } catch (error) {
    //   console.warn("Stats fetch failed", error);
    // }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN.LIBRARY.RECENT_TRANSACTIONS);
      // Direct assignment because formatted data is now an array
      const data = response.data || [];
      setRecentTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Live Feed fetch failed", error);
    }
  };

  const handleFetchIssuedList = async (filterType = "ALL") => {
    setLoading(true);
    try {
      // This calls the dedicated 'ACTIVE_ISSUES' endpoint we created
      const response = await api.get(API_ENDPOINTS.ADMIN.LIBRARY.ACTIVE_ISSUES);
      const data = response.data || [];
      
      setIssuedBooks(data); 
      setIssuedModalFilter(filterType);
      setShowIssuedModal(true);
    } catch  {
      toast.error("Failed to load list");
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...issueData, userType };
      const response = await api.post(API_ENDPOINTS.ADMIN.LIBRARY?.ISSUE_BOOK, payload);
      toast.success(response.data?.message || "Book issued!");
      setIssueData({
        userId: "",
        serialCode: "",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      });
      fetchLibraryStats();
      fetchRecentTransactions();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to issue book");
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post(API_ENDPOINTS.ADMIN.LIBRARY?.RETURN_BOOK, returnData);
      toast.success(response.data?.message || "Book returned!");
      setReturnData({ serialCode: "" });
      fetchLibraryStats();
      fetchRecentTransactions();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to return book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Book Circulation
          </h1>
          <p className="text-gray-500 text-sm font-medium flex items-center gap-2 mt-1">
            <FaBookReader className="text-orange-500" />
            Manage issues and returns
          </p>
        </div>

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-xl">
                <FaBook className="text-white text-xl" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{s.label}</p>
                <p className="text-3xl font-black text-slate-900">{s.val}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-3 rounded-xl">
                <FaCheckCircle className="text-white text-xl" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Returned Today
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.totalReturned}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl">
                <FaClock className="text-white text-xl" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Overdue</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.overdue}
                </p>
              </div>
            </div>
          </div>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-500 overflow-hidden">
              <div className="flex bg-slate-50 p-2 border-b border-slate-500">
                <button
                  onClick={() => setActiveTab("ISSUE")}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === "ISSUE"
                      ? "bg-white shadow-sm text-orange-600 border border-slate-500" : "text-slate-500"
                  }`}
                >
                  <FaExchangeAlt /> Issue Book
                </button>
                <button
                  onClick={() => setActiveTab("RETURN")}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === "RETURN"
                      ? "bg-white shadow-sm text-emerald-600 border border-slate-500" : "text-slate-500"
                  }`}
                >
                  <FaCheckCircle /> Return Book
                </button>
              </div>

              <div className="p-10">
                {activeTab === "ISSUE" ? (
                  <form onSubmit={handleIssue} className="space-y-6">
                    <div className="flex gap-2 p-1 bg-slate-50 border border-slate-500 rounded-2xl w-fit">
                      {['student', 'teacher'].map(type => (
                        <button key={type} type="button" onClick={() => setUserType(type)} className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${userType === type ? "bg-white text-orange-600 shadow-sm border border-slate-500" : "text-slate-500"}`}>
                          {type}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase ml-1">User ID</label>
                      <div className="relative mt-2">
                        <FaUserGraduate className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input ref={studentInputRef} required value={issueData.userId} onChange={e => setIssueData({...issueData, userId: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-white border border-slate-500 rounded-2xl focus:border-orange-500 outline-none transition-all font-bold" placeholder={`Scan or enter ${userType} ID`} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-black text-slate-500 uppercase ml-1">Due Date</label>
                        <input type="date" required value={issueData.dueDate} onChange={e => setIssueData({...issueData, dueDate: e.target.value})} className="w-full mt-2 p-4 bg-white border border-slate-500 rounded-2xl focus:border-orange-500 outline-none font-bold" />
                      </div>
                      <div>
                        <label className="text-xs font-black text-slate-500 uppercase ml-1">Book Serial</label>
                        <input required value={issueData.serialCode} onChange={e => setIssueData({...issueData, serialCode: e.target.value})} className="w-full mt-2 p-4 bg-white border border-slate-500 rounded-2xl focus:border-orange-500 outline-none font-bold" placeholder="BK-000" />
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-slate-200">
                      {loading ? <FaSpinner className="animate-spin mx-auto" /> : "Confirm Circulation"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleReturn} className="space-y-6 animate-in fade-in">
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase ml-1">Scan Book Barcode</label>
                      <div className="relative mt-2">
                        <FaBarcode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input ref={scanInputRef} required value={returnData.serialCode} onChange={e => setReturnData({serialCode: e.target.value})} className="w-full pl-12 pr-4 py-5 bg-white border border-slate-500 rounded-2xl focus:border-emerald-500 outline-none font-bold text-lg" placeholder="BK-X-000" />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                      Process Return
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleFetchIssuedList("ALL")}
                className="p-6 bg-white rounded-2xl border border-slate-500 shadow-sm hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <FaListUl />
                  </div>
                  <FaArrowRight className="text-slate-200" />
                </div>
                <h4 className="mt-4 font-black text-slate-800 tracking-tight">Issued Books List</h4>
                <p className="text-xs text-slate-400 font-medium">See who has which book</p>
              </button>

              <button 
                onClick={() => handleFetchIssuedList("OVERDUE")}
                className="p-6 bg-white rounded-2xl border border-slate-500 shadow-sm hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all">
                    <FaClock />
                  </div>
                  <FaArrowRight className="text-slate-200" />
                </div>
                <h4 className="mt-4 font-black text-slate-800 tracking-tight">Overdue List</h4>
                <p className="text-xs text-slate-400 font-medium">Identify late returns</p>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-500 overflow-hidden">
              <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
                <h3 className="font-black text-xs uppercase tracking-widest">Live Feed</h3>
                <div className="h-2 w-2 rounded-full bg-orange-500 animate-ping"></div>
              </div>
              <div className="p-4 space-y-3">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((t, i) => {
                    const actionType = t.type || t.action || t.transactionType;
                    return (
                      <div key={i} className={`p-4 rounded-2xl bg-white shadow-sm border border-slate-500`}>
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-slate-800 text-sm">{t.bookTitle || t.book?.title || "Unknown Book"}</p>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-2xl ${actionType === 'ISSUE' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {actionType}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{t.userName || t.studentName || t.user?.name || "Unknown User"}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-xs text-slate-400 font-medium py-4">No recent transactions</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showIssuedModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-8 border-b border-slate-500 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {issuedModalFilter === "OVERDUE" ? "Overdue Books Tracking" : "Currently Issued Books"}
                </h3>
                <p className="text-sm text-slate-400 font-medium">Real-time circulation data</p>
              </div>
              <button onClick={() => setShowIssuedModal(false)} className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all">
                <FaTimes className="text-slate-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-500">
                    <th className="pb-4 px-2">Book Info</th>
                    <th className="pb-4 px-2">Borrower</th>
                    <th className="pb-4 px-2">Due Date</th>
                    <th className="pb-4 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-500">
                  {issuedBooks
                    .filter(b => {
                      if (issuedModalFilter === "OVERDUE") {
                        return b.dueDate && new Date(b.dueDate) < new Date();
                      }
                      return true;
                    })
                    .map((book, idx) => (
                      <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-2">
                          <p className="font-bold text-slate-800">{book.bookTitle}</p>
                          <p className="text-[10px] font-mono text-orange-500 font-bold uppercase">{book.bookCode}</p>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-black uppercase ${book.userType === 'teacher' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'}`}>
                              {book.userType === 'teacher' ? 'T' : 'S'}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-700">{book.userName}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase">Borrower</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                           <p className={`text-xs font-bold ${new Date(book.dueDate) < new Date() ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
                             {book.dueDate ? new Date(book.dueDate).toLocaleDateString('en-GB') : "No Date"}
                           </p>
                        </td>
                        <td className="py-4 px-2 text-right">
                           <button 
                             onClick={() => {
                               setActiveTab("RETURN");
                               setReturnData({ serialCode: book.bookCode });
                               setShowIssuedModal(false);
                             }}
                             className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all"
                           >
                             Return Now
                           </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {issuedBooks.length === 0 && (
                <div className="text-center py-20">
                  <FaBookOpen className="text-5xl text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">No books currently issued</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
