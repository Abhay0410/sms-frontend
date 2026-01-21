import { useEffect, useState, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import {
  FaFileDownload,
  FaFilter,
  FaEye,
  FaSearch,
  FaSpinner,
  FaDownload,
  FaCheckCircle,
  FaUsers,
  FaCalendarAlt,
  FaRocket
} from "react-icons/fa";

export default function PaymentHistory({ academicYear }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    className: "",
  });
  const [filterLoading, setFilterLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  
  // Use ref to track if component is mounted
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Separate function for loading payments without useCallback dependencies
  const loadPayments = async (status = filters.status, className = filters.className) => {
    if (!isMounted.current) return;
    
    try {
      setLoading(true);
      
      const response = await api.get(API_ENDPOINTS.ADMIN.FEE.ALL, {
        params: {
          academicYear,
          status: status || undefined,
          className: className || undefined,
        },
        timeout: 10000,
      });

      let apiData = [];
      if (Array.isArray(response?.data?.payments)) {
        apiData = response.data.payments;
      } else if (Array.isArray(response?.payments)) {
        apiData = response.payments;
      }

      const paymentsData = apiData.map((p, idx) => ({
        _id: p._id || `payment-${idx}`,
        receiptNumber: p.receiptNumber || `RCPT${1000 + idx}`,
        studentName: p.student?.name || p.studentName || "Unknown Student",
        studentID: p.student?.studentID || p.studentID || "N/A",
        className: p.className || "N/A",
        section: p.section || "",
        amountPaid: Number(p.amountPaid || p.amount || 0),
        paymentMethod: p.paymentMethod || p.paymentMode || "CASH",
        paymentDate: p.paymentDate || new Date().toISOString(),
        status: p.status || "PAID",
      }));

      setPayments(paymentsData);
      setLastRefresh(new Date());
      
    } catch (error) {
      console.error("Error loading payments:", error);
      toast.error("Failed to load payment history");
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setFilterLoading(false);
      }
    }
  };

  // Update filter with proper handling
  const updateFilter = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    
    // For class and status filters, trigger API call
    if (field === 'className' || field === 'status') {
      setFilterLoading(true);
      // Debounce the API call
      const timeoutId = setTimeout(() => {
        loadPayments(
          field === 'status' ? value : filters.status,
          field === 'className' ? value : filters.className
        );
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      className: "",
    });
    // Reload all data when clearing filters
    loadPayments("", "");
  };

  // Filter payments locally with search
  const filteredPayments = useMemo(() => {
    let result = payments;
    
    // Apply search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p => 
        p.studentName?.toLowerCase().includes(q) ||
        p.studentID?.toLowerCase().includes(q) ||
        p.receiptNumber?.toLowerCase().includes(q) ||
        p.className?.toLowerCase().includes(q)
      );
    }
    
    // Apply status filter (already done via API, but double-check locally)
    if (filters.status) {
      result = result.filter(p => p.status === filters.status);
    }
    
    // Apply class filter (already done via API, but double-check locally)
    if (filters.className) {
      result = result.filter(p => 
        p.className.toLowerCase().includes(filters.className.toLowerCase())
      );
    }
    
    return result;
  }, [payments, filters]);

  // Load payments on mount and when academic year changes
  useEffect(() => {
    if (academicYear) {
      loadPayments(filters.status, filters.className);
    }
  }, [academicYear]);

  // Download receipt
  const downloadReceipt = async (payment) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.ADMIN.FEE.DOWNLOAD_RECEIPT(payment._id),
        { responseType: "blob" }
      );
      
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${payment.studentName.replace(/\s+/g, "_")}_${payment.receiptNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("Receipt downloaded");
    } catch {
      toast.error("Download failed");
    }
  };

  // Refresh data
  const refreshData = () => {
    loadPayments(filters.status, filters.className);
  };

  // Format time since last refresh
  const getTimeSinceRefresh = () => {
    if (!lastRefresh) return "Never";
    const seconds = Math.floor((new Date() - lastRefresh) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto" />
          <p className="text-slate-600 font-medium">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-2xl p-6 shadow border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Payment History</h2>
            <p className="text-slate-500">
              Total: {payments.length} payments • Filtered: {filteredPayments.length}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              disabled={loading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <FaSpinner className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <div className="text-xs text-slate-400">
              Updated {getTimeSinceRefresh()}
            </div>
          </div>
        </div>
      </div>

      {/* Essential Filters */}
      <div className="bg-white rounded-2xl p-6 shadow border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <FaFilter className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Quick Filters</h3>
            <p className="text-sm text-slate-500">
              Search filters locally • Status/Class filters via API
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search - Local Filter */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Search (Instant)
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-3.5 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Name, ID, receipt..."
                value={filters.search}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, search: e.target.value }));
                  setFilterLoading(true);
                  setTimeout(() => setFilterLoading(false), 100);
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>

          {/* Status - API Filter */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white transition-all"
            >
              <option value="">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PARTIALLY_PAID">Partial</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          {/* Class - API Filter */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Class
            </label>
            <input
              type="text"
              placeholder="Class name"
              value={filters.className}
              onChange={(e) => updateFilter("className", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
        </div>

        {/* Active Filters */}
        {Object.values(filters).some(f => f) && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700">Active filters:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                  🔍 {filters.search}
                </span>
              )}
              {filters.status && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  📊 {filters.status}
                </span>
              )}
              {filters.className && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                  🏫 {filters.className}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-full transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Table */}
      <div className="bg-white rounded-2xl shadow border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">
              Payments ({filteredPayments.length})
            </h3>
            {filterLoading && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <FaSpinner className="animate-spin" />
                Applying filters...
              </div>
            )}
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <FaFileDownload className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h4 className="text-lg font-semibold text-slate-900 mb-2">No payments found</h4>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {["Receipt", "Student", "Class", "Amount", "Method", "Date", "Status", "Actions"].map((header) => (
                    <th key={header} className="p-4 text-left text-sm font-semibold text-slate-700">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-semibold text-slate-900">
                        {payment.receiptNumber}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-slate-900">{payment.studentName}</div>
                        <div className="text-sm text-slate-500">{payment.studentID}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-700 font-medium">
                        {payment.className}
                        {payment.section && ` (${payment.section})`}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-lg font-bold text-green-700">
                        ₹{payment.amountPaid.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4">
                      {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        payment.status === 'PAID' ? 'bg-green-100 text-green-700' :
                        payment.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadReceipt(payment)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}