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
  FaHistory,
  FaQrcode,
  FaSearch,
  FaClock,
  FaBookOpen,
  FaTimes,
  FaArrowRight,
  FaUserCircle,
  FaBook,
  FaChalkboardTeacher,
} from "react-icons/fa";

export default function BookIssueReturn() {
  const [activeTab, setActiveTab] = useState("ISSUE");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalIssued: 0,
    totalReturned: 0,
    overdue: 0,
  });
  const [userType, setUserType] = useState("student");

  const [issueData, setIssueData] = useState({
    userId: "",
    serialCode: "",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });
  const [returnData, setReturnData] = useState({ serialCode: "" });

  const scanInputRef = useRef(null);
  const studentInputRef = useRef(null);

  // Focus on input when tab changes
  useEffect(() => {
    if (activeTab === "ISSUE") {
      studentInputRef.current?.focus();
    } else {
      scanInputRef.current?.focus();
    }
  }, [activeTab]);

  // Fetch stats and recent transactions
  useEffect(() => {
    fetchLibraryStats();
    fetchRecentTransactions();
  }, []);

  const fetchLibraryStats = async () => {
    try {
      const response = await api.get(
        API_ENDPOINTS.ADMIN.LIBRARY?.STATS || "/api/admin/library/stats",
      );
      setStats(
        response.data || { totalIssued: 0, totalReturned: 0, overdue: 0 },
      );
    } catch (error) {
      console.warn(
        "Failed to fetch library stats (Backend endpoint missing):",
        error,
      );
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await api.get(
        API_ENDPOINTS.ADMIN.LIBRARY?.RECENT_TRANSACTIONS ||
          "/api/admin/library/recent",
      );
      setRecentTransactions(response.data || []);
    } catch (error) {
      console.warn(
        "Failed to fetch recent transactions (Backend endpoint missing):",
        error,
      );
    }
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint =
        API_ENDPOINTS.ADMIN.LIBRARY?.ISSUE_BOOK || "/api/admin/library/issue";

      const payload = {
        ...issueData,
        userType, // Backend requires userType
      };

      const response = await api.post(endpoint, payload);
      toast.success(response.data?.message || "Book issued successfully!");
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
      const endpoint =
        API_ENDPOINTS.ADMIN.LIBRARY?.RETURN_BOOK || "/api/admin/library/return";
      const response = await api.post(endpoint, returnData);
      toast.success(response.data?.message || "Book returned successfully!");
      setReturnData({ serialCode: "" });
      fetchLibraryStats();
      fetchRecentTransactions();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to return book");
    } finally {
      setLoading(false);
    }
  };

  const simulateBarcodeScan = (type) => {
    setScanning(true);
    toast.info(`Point camera at ${type} barcode...`);

    // Simulate scan delay
    setTimeout(() => {
      const mockCode =
        type === "student"
          ? `STU-${Math.floor(Math.random() * 10000)
              .toString()
              .padStart(4, "0")}`
          : `BK-${Math.floor(Math.random() * 1000)
              .toString()
              .padStart(3, "0")}`;

      if (activeTab === "ISSUE") {
        if (type === "student") {
          setIssueData((prev) => ({ ...prev, userId: mockCode }));
          toast.success(`Student scanned: ${mockCode}`);
        } else {
          setIssueData((prev) => ({ ...prev, serialCode: mockCode }));
          toast.success(`Book scanned: ${mockCode}`);
        }
      } else {
        setReturnData((prev) => ({ ...prev, serialCode: mockCode }));
        toast.success(`Book scanned: ${mockCode}`);
      }
      setScanning(false);
    }, 1500);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Book Circulation
          </h1>
          <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
            <FaBookReader className="text-orange-500" />
            Issue and return books with barcode scanning
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-xl">
                <FaBook className="text-white text-xl" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Issued Today
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.totalIssued}
                </p>
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
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Issue/Return Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="flex border-b border-slate-100">
                <button
                  onClick={() => setActiveTab("ISSUE")}
                  className={`flex-1 py-4 text-center font-semibold transition-all ${
                    activeTab === "ISSUE"
                      ? "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FaExchangeAlt /> Issue Book
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("RETURN")}
                  className={`flex-1 py-4 text-center font-semibold transition-all ${
                    activeTab === "RETURN"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FaCheckCircle /> Return Book
                  </div>
                </button>
              </div>

              {/* Forms */}
              <div className="p-8">
                {activeTab === "ISSUE" ? (
                  <div className="animate-fadeIn">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <FaExchangeAlt className="text-orange-600" /> Issue Book
                    </h3>
                    <form onSubmit={handleIssue} className="space-y-8">
                      {/* User Type Toggle */}
                      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                        <button
                          type="button"
                          onClick={() => setUserType("student")}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                            userType === "student"
                              ? "bg-white text-orange-600 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          <FaUserGraduate /> Student
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserType("teacher")}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                            userType === "teacher"
                              ? "bg-white text-orange-600 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          <FaChalkboardTeacher /> Teacher
                        </button>
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          {userType === "student"
                            ? "Student ID / Admission No."
                            : "Teacher ID / Employee No."}
                        </label>
                        <div className="relative group">
                          {userType === "student" ? (
                            <FaUserGraduate className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-orange-500" />
                          ) : (
                            <FaChalkboardTeacher className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-orange-500" />
                          )}
                          <input
                            ref={studentInputRef}
                            required
                            value={issueData.userId}
                            onChange={(e) =>
                              setIssueData({
                                ...issueData,
                                userId: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-32 py-3.5 border-2 border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                            placeholder={`Enter ${userType} ID or scan barcode`}
                          />
                          <button
                            type="button"
                            onClick={() => simulateBarcodeScan("student")}
                            disabled={scanning}
                            className="absolute right-2 top-2 px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all disabled:opacity-50"
                          >
                            {scanning ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <>
                                <FaQrcode className="inline mr-2" /> Scan
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Due Date
                        </label>
                        <div className="relative group">
                          <FaClock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-orange-500" />
                          <input
                            type="date"
                            required
                            value={issueData.dueDate}
                            onChange={(e) =>
                              setIssueData({
                                ...issueData,
                                dueDate: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Book Serial Code
                        </label>
                        <div className="relative group">
                          <FaBarcode className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-orange-500" />
                          <input
                            ref={scanInputRef}
                            required
                            value={issueData.serialCode}
                            onChange={(e) =>
                              setIssueData({
                                ...issueData,
                                serialCode: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-32 py-3.5 border-2 border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                            placeholder="Enter book serial or scan barcode"
                          />
                          <button
                            type="button"
                            onClick={() => simulateBarcodeScan("book")}
                            disabled={scanning}
                            className="absolute right-2 top-2 px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all disabled:opacity-50"
                          >
                            {scanning ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <>
                                <FaQrcode className="inline mr-2" /> Scan
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || scanning}
                        className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <FaSpinner className="animate-spin" /> Processing
                            Issue...
                          </span>
                        ) : (
                          "Confirm Book Issue"
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="animate-fadeIn">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <FaCheckCircle className="text-emerald-600" /> Return Book
                    </h3>
                    <form onSubmit={handleReturn} className="space-y-8">
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Book Serial Code
                        </label>
                        <div className="relative group">
                          <FaBarcode className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500" />
                          <input
                            ref={scanInputRef}
                            required
                            value={returnData.serialCode}
                            onChange={(e) =>
                              setReturnData({ serialCode: e.target.value })
                            }
                            className="w-full pl-12 pr-32 py-3.5 border-2 border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                            placeholder="Scan or enter book serial code"
                          />
                          <button
                            type="button"
                            onClick={() => simulateBarcodeScan("book")}
                            disabled={scanning}
                            className="absolute right-2 top-2 px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all disabled:opacity-50"
                          >
                            {scanning ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <>
                                <FaQrcode className="inline mr-2" /> Scan
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || scanning}
                        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <FaSpinner className="animate-spin" /> Processing
                            Return...
                          </span>
                        ) : (
                          "Confirm Book Return"
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-slate-50 to-orange-50 p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-4">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab("ISSUE")}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 group-hover:text-orange-700">
                        Bulk Issue
                      </p>
                      <p className="text-xs text-slate-500">
                        Issue multiple books
                      </p>
                    </div>
                    <FaArrowRight className="text-slate-300 group-hover:text-orange-500" />
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("RETURN")}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 group-hover:text-emerald-700">
                        Overdue List
                      </p>
                      <p className="text-xs text-slate-500">
                        View overdue books
                      </p>
                    </div>
                    <FaArrowRight className="text-slate-300 group-hover:text-emerald-500" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Recent Transactions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <FaHistory /> Recent Transactions
                  </h3>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                    Today
                  </span>
                </div>
              </div>

              <div className="p-4 max-h-[500px] overflow-y-auto">
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <FaBookOpen className="text-4xl text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">
                      No recent transactions
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      Issued/returned books will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTransactions.map((transaction, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border transition-all ${
                          transaction.type === "ISSUE"
                            ? "bg-gradient-to-r from-orange-50 to-orange-100/30 border-orange-200"
                            : "bg-gradient-to-r from-emerald-50 to-emerald-100/30 border-emerald-200"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                transaction.type === "ISSUE"
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-emerald-100 text-emerald-600"
                              }`}
                            >
                              {transaction.type === "ISSUE" ? (
                                <FaExchangeAlt />
                              ) : (
                                <FaCheckCircle />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {transaction.bookTitle || "Unknown Book"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {transaction.bookCode}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-full ${
                              transaction.type === "ISSUE"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {/* <FaUserCircle className="text-slate-400" /> */}
                            <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                              {transaction.studentName?.charAt(0).toUpperCase()}
                            </div>

                            <span className="font-medium text-slate-700">
                              {transaction.studentName}
                            </span>
                          </div>
                          <span className="text-slate-500">
                            {formatDate(transaction.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-gradient-to-r from-slate-50 to-orange-50 p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-4">Status Legend</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Book Issue
                    </p>
                    <p className="text-xs text-slate-500">
                      Student borrows a book
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Book Return
                    </p>
                    <p className="text-xs text-slate-500">
                      Student returns a book
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Overdue
                    </p>
                    <p className="text-xs text-slate-500">
                      Book not returned on time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
