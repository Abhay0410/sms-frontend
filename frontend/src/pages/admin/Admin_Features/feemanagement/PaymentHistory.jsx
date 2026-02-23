import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../../services/api";
import { 
  FaReceipt, 
  FaDownload, 
  FaEye, 
  FaFilter, 
  FaSearch, 
  FaCalendarAlt, 
  FaSync,
  FaFilePdf,
  FaRupeeSign,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHistory,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import { format } from "date-fns";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    academicYear: "",
    status: "",
    className: "",
    search: "",
    month: "",
  });
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [receiptModal, setReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(null);
  
  // ✅ CHANGE ITEMS PER PAGE HERE:
  const itemsPerPage = 7;
  
  // Simple pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [allPayments, setAllPayments] = useState([]); // Store all fetched payments
  const [totalPayments, setTotalPayments] = useState(0); // Store total count

  // Fetch payment history
  const fetchPayments = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.academicYear) params.append("academicYear", filters.academicYear);
      if (filters.status) params.append("status", filters.status);
      if (filters.className) params.append("className", filters.className);
      if (filters.search) params.append("search", filters.search);
      if (filters.month) params.append("month", filters.month);

      console.log("Fetching payments with filters:", Object.fromEntries(params));
      
      const response = await api.get(`${API_ENDPOINTS.ADMIN.FEE.ALL}?${params.toString()}`);
      
      console.log("API Response:", response);
      
      if (response && response.success) {
        const fetchedPayments = response.data.payments || [];
        setAllPayments(fetchedPayments);
        setTotalPayments(fetchedPayments.length);
        
        // Client-side pagination - Now shows 10 items per page
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedPayments = fetchedPayments.slice(startIndex, endIndex);
        
        setPayments(paginatedPayments);
        setHasMore(endIndex < fetchedPayments.length);
        setCurrentPage(page);
        
        console.log(`Page ${page}: Showing ${paginatedPayments.length} of ${fetchedPayments.length} payments (${itemsPerPage} per page)`);
      } else {
        setPayments([]);
        setAllPayments([]);
        setTotalPayments(0);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err.message || "Failed to fetch payment history");
      setPayments([]);
      setAllPayments([]);
      setTotalPayments(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [filters, itemsPerPage]);

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const classResponse = await api.get(API_ENDPOINTS.ADMIN.CLASS.ALL);
      if (classResponse && classResponse.success) {
        const years = [...new Set(classResponse.data.classes?.map(c => c.academicYear) || [])];
        setAcademicYears(years.sort().reverse());
        
        const uniqueClasses = [...new Set(classResponse.data.classes?.map(c => c.className) || [])];
        setClasses(uniqueClasses.sort());
      }
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  // Download receipt
  const downloadReceipt = async (paymentId, receiptNumber) => {
    try {
      setDownloadLoading(paymentId);
      
      console.log("Downloading receipt ID:", paymentId, "Receipt:", receiptNumber);
      
      // Try both possible endpoints
      let response;
      try {
        response = await api.axios.get(
          `/api/admin/fees/receipt/${paymentId}/download`,
          { 
            responseType: 'blob',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
      } catch {
        console.log("First endpoint failed, trying alternative...");
        response = await api.axios.get(
          `${API_ENDPOINTS.ADMIN.FEE.DOWNLOAD_RECEIPT(paymentId)}`,
          { 
            responseType: 'blob',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
      }

      console.log("PDF Response received");

      // Create blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Try to open in new tab
      const newWindow = window.open(url, '_blank');
      
      // Fallback to download if pop-up blocked
      if (!newWindow) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `Receipt_${receiptNumber}_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Receipt downloaded!");
      } else {
        toast.success("Receipt opened in new tab!");
      }
      
      // Clean up URL after use
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
      
    } catch (err) {
      console.error("Error downloading receipt:", err);
      toast.error(`Failed to download receipt. Please check if receipt exists.`);
    } finally {
      setDownloadLoading(null);
    }
  };

  // View receipt details
  const viewReceiptDetails = (payment) => {
    setSelectedReceipt(payment);
    setReceiptModal(true);
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      academicYear: "",
      status: "",
      className: "",
      search: "",
      month: "",
    });
    setCurrentPage(1);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM yyyy, hh:mm a");
    } catch {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "bg-emerald-100 text-emerald-700";
      case "PARTIAL":
        return "bg-amber-100 text-amber-700";
      case "PENDING":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Get payment method color
  const getPaymentMethodColor = (method) => {
    switch (method?.toUpperCase()) {
      case "CASH":
        return "border-l-4 border-emerald-500";
      case "CARD":
        return "border-l-4 border-blue-500";
      case "UPI":
        return "border-l-4 border-purple-500";
      case "CHEQUE":
        return "border-l-4 border-amber-500";
      case "BANK_TRANSFER":
      case "NEFT":
      case "IMPS":
        return "border-l-4 border-indigo-500";
      default:
        return "border-l-4 border-slate-500";
    }
  };

  // Calculate totals for current page
  // const totalAmount = payments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);
  const paidCount = payments.filter(p => p.status === "PAID").length;
  // const pendingCount = payments.filter(p => p.status === "PENDING").length;

  // Month options for filter
  const monthOptions = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];

  // Pagination handlers
  const goToNextPage = () => {
    if (hasMore) {
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedPayments = allPayments.slice(startIndex, endIndex);
      
      setPayments(paginatedPayments);
      setHasMore(endIndex < allPayments.length);
      setCurrentPage(nextPage);
      
      // Scroll to top of table
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      const startIndex = (prevPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedPayments = allPayments.slice(startIndex, endIndex);
      
      setPayments(paginatedPayments);
      setHasMore(endIndex < allPayments.length);
      setCurrentPage(prevPage);
      
      // Scroll to top of table
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Apply filters handler
  const applyFilters = () => {
    setCurrentPage(1);
    fetchPayments(1);
  };

  // Initial load
  useEffect(() => {
    fetchFilterOptions();
    fetchPayments(1);
  }, [fetchPayments]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-4">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl">
            <FaReceipt />
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Payment History</h2>
            <p className="text-slate-600 font-medium text-sm">View and manage all fee payment receipts</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchPayments(currentPage)}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
          >
            <FaSync className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-slate-500 font-semibold">Total Records</div>
          <div className="text-3xl font-black text-indigo-600 mt-2">{totalPayments}</div>
          <div className="text-xs text-slate-400 mt-1">All payment records</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-slate-500 font-semibold">Current Page</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{payments.length}</div>
          <div className="text-xs text-slate-400 mt-1">Showing {itemsPerPage} per page</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-slate-500 font-semibold">Page {currentPage}</div>
          <div className="text-3xl font-black text-purple-600 mt-2">
            {((currentPage - 1) * itemsPerPage + 1)} - {Math.min(currentPage * itemsPerPage, totalPayments)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Records range</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-slate-500 font-semibold">Paid</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{paidCount}</div>
          <div className="text-xs text-slate-400 mt-1">Completed payments</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <FaFilter className="text-indigo-600" />
          <h3 className="text-lg font-bold">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, ID, receipt..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Academic Year */}
          <select
            value={filters.academicYear}
            onChange={(e) => handleFilterChange("academicYear", e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold"
          >
            <option value="">All Academic Years</option>
            {academicYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {/* Class */}
          <select
            value={filters.className}
            onChange={(e) => handleFilterChange("className", e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold"
          >
            <option value="">All Classes</option>
            {classes.map((className) => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold"
          >
            <option value="">All Status</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        {/* Month Filter and Action Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl w-full md:w-auto">
            <FaCalendarAlt className="text-slate-400" />
            <select
              value={filters.month}
              onChange={(e) => handleFilterChange("month", e.target.value)}
              className="bg-transparent border-none focus:outline-none font-bold"
            >
              <option value="">All Months</option>
              {monthOptions.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={applyFilters}
              className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="flex-1 md:flex-none border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-2xl flex items-center gap-3">
          <FaExclamationTriangle />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-rose-500 hover:text-rose-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FaHistory className="text-indigo-600" />
            Payment Records
          </h3>
          <div className="text-sm text-slate-500">
            Showing <span className="font-bold text-indigo-600">{payments.length}</span> of{" "}
            <span className="font-bold">{totalPayments}</span> records
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-slate-500">Loading payment history...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-20 w-20 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-3xl mb-4">
              <FaReceipt />
            </div>
            <h4 className="text-lg font-bold text-slate-700">No payment records found</h4>
            <p className="text-slate-500 mt-2">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-bold">
                  <tr>
                    <th className="p-4 text-left">Receipt Details</th>
                    <th className="p-4 text-left">Student</th>
                    <th className="p-4 text-left">Class</th>
                    <th className="p-4 text-left">Amount</th>
                    <th className="p-4 text-left">Payment Method</th>
                    <th className="p-4 text-left">Date & Time</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment, index) => (
                    <tr key={payment._id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Receipt Details */}
                      <td className="p-4">
                        <div className={`${getPaymentMethodColor(payment.paymentMethod)} pl-4`}>
                          <p className="font-bold text-slate-900">{payment.receiptNumber}</p>
                          <p className="text-xs text-slate-400">
                            #{(currentPage - 1) * itemsPerPage + index + 1}
                          </p>
                          {payment.remarks && (
                            <p className="text-xs text-slate-500 mt-1 italic max-w-xs truncate">
                              {payment.remarks}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Student Info */}
                      <td className="p-4">
                        <p className="font-bold text-slate-900">
                          {payment.student?.name || "N/A"}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          ID: {payment.student?.studentID || "N/A"}
                        </p>
                      </td>

                      {/* Class Info */}
                      <td className="p-4">
                        <p className="font-bold">
                          {payment.className || "N/A"}
                          {payment.section && (
                            <span className="text-slate-500 ml-1">- {payment.section}</span>
                          )}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <FaRupeeSign className="text-emerald-600" />
                          <span className="font-bold text-emerald-600 text-lg">
                            {formatCurrency(payment.amountPaid).replace("₹", "")}
                          </span>
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                          {payment.paymentMethod || "N/A"}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="p-4">
                        <p className="font-bold text-sm">{formatDate(payment.paymentDate)}</p>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(payment.status)}`}>
                          {payment.status || "N/A"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewReceiptDetails(payment)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 p-2.5 rounded-xl transition-all"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => downloadReceipt(payment._id, payment.receiptNumber)}
                            disabled={downloadLoading === payment._id}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-2.5 rounded-xl transition-all disabled:opacity-50"
                            title="Download Receipt"
                          >
                            {downloadLoading === payment._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                            ) : (
                              <FaDownload />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Simple Pagination - Only Next/Prev Buttons */}
            <div className="p-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-slate-500 text-sm">
                Page <span className="font-bold">{currentPage}</span> • 
                Showing <span className="font-bold">{((currentPage - 1) * itemsPerPage + 1)} - {Math.min(currentPage * itemsPerPage, totalPayments)}</span> of{" "}
                <span className="font-bold">{totalPayments}</span> records
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronLeft /> Previous
                </button>
                
                <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold">
                  Page {currentPage}
                </span>
                
                <button
                  onClick={goToNextPage}
                  disabled={!hasMore}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <FaChevronRight />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Receipt Details Modal */}
      {receiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
             style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl" 
               style={{ animation: 'slideUp 0.4s ease-out' }}>
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Receipt Details</h3>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-sm font-bold">{selectedReceipt.student?.name || "N/A"}</p>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                    {selectedReceipt.receiptNumber}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedReceipt.status).replace("bg-", "bg-").replace("text-", "text-")}`}>
                    {selectedReceipt.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setReceiptModal(false)}
                className="h-12 w-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all font-bold text-xl"
              >
                ×
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* Student Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Student Name</p>
                  <p className="font-bold text-lg">{selectedReceipt.student?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Student ID</p>
                  <p className="font-bold">{selectedReceipt.student?.studentID || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Class & Section</p>
                  <p className="font-bold">
                    {selectedReceipt.className || "N/A"}
                    {selectedReceipt.section && ` - ${selectedReceipt.section}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Payment Date</p>
                  <p className="font-bold text-indigo-600">
                    {formatDate(selectedReceipt.paymentDate)}
                  </p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-6">
                <h4 className="text-sm font-black uppercase text-slate-700 tracking-widest border-b pb-3">
                  Payment Information
                </h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl">
                      <div>
                        <p className="text-sm text-slate-600">Amount Paid</p>
                        <div className="flex items-center gap-2 mt-1">
                          <FaRupeeSign className="text-emerald-600" />
                          <span className="text-3xl font-black text-emerald-600">
                            {formatCurrency(selectedReceipt.amountPaid).replace("₹", "")}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-xl">
                        <span className="text-xs font-bold text-slate-700 uppercase">
                          {selectedReceipt.paymentMethod}
                        </span>
                      </div>
                    </div>

                    {selectedReceipt.remarks && (
                      <div className="p-4 bg-amber-50 rounded-2xl">
                        <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Remarks</p>
                        <p className="text-slate-700 italic">{selectedReceipt.remarks}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 rounded-2xl">
                      <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Receipt Information</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Receipt Number</span>
                          <span className="font-bold">{selectedReceipt.receiptNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Transaction ID</span>
                          <span className="font-bold">{selectedReceipt._id?.slice(-8)?.toUpperCase() || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Generated</span>
                          <span className="font-bold">{formatDate(selectedReceipt.paymentDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Status Details</p>
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${selectedReceipt.status === "PAID" ? "bg-emerald-500" : selectedReceipt.status === "PARTIAL" ? "bg-amber-500" : "bg-rose-500"}`}></div>
                        <span className="font-bold">{selectedReceipt.status} Payment</span>
                        {selectedReceipt.status === "PAID" && (
                          <FaCheckCircle className="text-emerald-500 ml-auto" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-8 rounded-3xl text-white">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div>
                    <p className="text-sm font-bold uppercase opacity-90">Receipt Actions</p>
                    <h2 className="text-3xl font-black mt-2">Payment Confirmed</h2>
                    <p className="text-sm opacity-90 mt-2">
                      Download official receipt for records
                    </p>
                  </div>
                  <div className="flex gap-3 mt-6 md:mt-0">
                    <button
                      onClick={() => {
                        downloadReceipt(selectedReceipt._id, selectedReceipt.receiptNumber);
                        setReceiptModal(false);
                      }}
                      disabled={downloadLoading === selectedReceipt._id}
                      className="bg-white text-indigo-600 hover:bg-slate-100 px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <FaFilePdf /> Download PDF
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                      Print Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inline styles for animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}