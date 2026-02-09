// import { useEffect, useState, useMemo, useRef, useCallback } from "react";
// import { toast } from "react-toastify";
// import api from "../../../../services/api";
// import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
// import {
//   FaFileDownload,
//   FaFilter,
//   FaEye,
//   FaSearch,
//   FaSpinner,
//   FaDownload,
//   FaSync,
// } from "react-icons/fa";

// export default function PaymentHistory() {
//   const academicYears = useMemo(() => {
//     const currentYear = new Date().getFullYear();
//     const years = [];
//     for (let i = -1; i < 6; i++) {
//       const year = currentYear + i;
//       years.push(`${year}-${year + 1}`);
//     }
//     return years;
//   }, []);

//   const [academicYear, setAcademicYear] = useState(() => {
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = now.getMonth();
//     return month >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
//   });

//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({
//     search: "",
//     status: "",
//     className: "",
//   });
//   const [filterLoading, setFilterLoading] = useState(false);

//   // Use ref to track if component is mounted
//   const isMounted = useRef(true);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       isMounted.current = false;
//     };
//   }, []);

//   // Separate function for loading payments without useCallback dependencies
//   const loadPayments = useCallback(async (year, status) => {
//     if (!isMounted.current) return;

//     try {
//       // setLoading(true);
//       if (!payments.length) {
//         setLoading(true); // only first load
//       } else {
//         setFilterLoading(true); // filters
//       }

//       console.log("🔥 loadPayments called", year, status);

//       const response = await api.get(API_ENDPOINTS.ADMIN.FEE.ALL, {
//         params: {
//           academicYear: year,
//           status: status || undefined,
//         },
//         timeout: 10000,
//       });

//       console.log("✅ API RESPONSE", response.data);

//       // let apiData = [];
//       // if (Array.isArray(response?.data?.payments)) {
//       //   apiData = response.data.payments;
//       // } else if (Array.isArray(response?.payments)) {
//       //   apiData = response.payments;
//       // }

//       const apiData = Array.isArray(response?.data?.data?.payments)
//         ? response.data.data.payments
//         : [];

//       console.log("📦 payments length", apiData.length);

//       const paymentsData = apiData.map((p, idx) => ({
//         _id: p._id || `payment-${idx}`,
//         receiptNumber: p.receiptNumber || `RCPT${1000 + idx}`,
//         studentName: p.student?.name || p.studentName || "Unknown Student",
//         studentID: p.student?.studentID || p.studentID || "N/A",
//         className: p.className || "N/A",
//         section: p.section || "",
//         amountPaid: Number(p.amountPaid || p.amount || 0),
//         paymentMethod: p.paymentMethod || p.paymentMode || "CASH",
//         paymentDate: p.paymentDate || new Date().toISOString(),
//         status: p.status || "PAID",
//       }));

//       setPayments(paymentsData);
//     } catch (error) {
//       console.error("Error loading payments:", error);
//       toast.error("Failed to load payment history");
//     } finally {
//       if (isMounted.current) {
//         setLoading(false);
//         setFilterLoading(false);
//       }
//     }
//   }, []);

//   // Update filter with proper handling
//   const updateFilter = (field, value) => {
//     setFilters((prev) => ({ ...prev, [field]: value }));

//     // For class and status filters, trigger API call
//     if (field === "status") {
//       setFilterLoading(true);
//     }
//   };

//   // Clear all filters
//   const clearFilters = () => {
//     setFilters({
//       search: "",
//       status: "",
//       className: "",
//     });
//   };

//   // Filter payments locally with search
//   const filteredPayments = useMemo(() => {
//     let result = payments;

//     // Apply search filter
//     if (filters.search) {
//       const q = filters.search.toLowerCase();
//       result = result.filter(
//         (p) =>
//           p.studentName?.toLowerCase().includes(q) ||
//           p.studentID?.toLowerCase().includes(q) ||
//           p.receiptNumber?.toLowerCase().includes(q) ||
//           p.className?.toLowerCase().includes(q),
//       );
//     }

//     // Apply status filter (already done via API, but double-check locally)
//     // if (filters.status) {
//     //   result = result.filter(p => p.status === filters.status);
//     // }

//     // Apply class filter (already done via API, but double-check locally)
//     if (filters.className) {
//       result = result.filter((p) =>
//         p.className.toLowerCase().includes(filters.className.toLowerCase()),
//       );
//     }

//     return result;
//   }, [payments, filters]);

//   // Load payments on mount and when academic year or filters change (Debounced)
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (academicYear) {
//         loadPayments(academicYear, filters.status);
//       }
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [academicYear, filters.status, loadPayments]);

//   // Download receipt
//   const downloadReceipt = async (payment) => {
//     try {
//       const response = await api.get(
//         API_ENDPOINTS.ADMIN.FEE.DOWNLOAD_RECEIPT(payment._id),
//         { responseType: "blob" },
//       );

//       const blob = new Blob([response.data], { type: "application/pdf" });
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `${payment.studentName.replace(/\s+/g, "_")}_${payment.receiptNumber}.pdf`;
//       link.click();
//       window.URL.revokeObjectURL(url);

//       toast.success("Receipt downloaded");
//     } catch {
//       toast.error("Download failed");
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {loading && (
//         <div className="flex items-center justify-center min-h-[400px]">
//           <div className="text-center space-y-4">
//             <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto" />
//             <p className="text-slate-600 font-medium">
//               Loading payment history...
//             </p>
//           </div>
//         </div>
//       )}

//       {!loading && (
//         <div className="space-y-6">
//           {/* Header Section */}
//           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
//             <div>
//               <h1 className="text-3xl font-black text-slate-900">
//                 Payment History
//               </h1>
//               <p className="text-sm text-slate-600 mt-2">
//                 View and manage past transactions
//               </p>
//             </div>

//             <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
//               <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">
//                 Session:
//               </span>
//               <select
//                 value={academicYear}
//                 onChange={(e) => setAcademicYear(e.target.value)}
//                 className="bg-slate-50 border-none text-slate-900 text-sm font-bold rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-purple-500 cursor-pointer outline-none"
//               >
//                 {academicYears.map((year) => (
//                   <option key={year} value={year}>
//                     {year}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Essential Filters */}
//           <div className="bg-white rounded-2xl p-6 shadow border border-slate-100">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
//                 <FaFilter className="text-purple-600" />
//               </div>
//               <div>
//                 <h3 className="font-bold text-slate-900">Quick Filters</h3>
//                 <p className="text-sm text-slate-500">
//                   Search filters locally • Status/Class filters via API
//                 </p>
//               </div>
//               <div className="ml-auto">
//                 <button
//                   onClick={() => loadPayments(academicYear, filters.status)}
//                   className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
//                   title="Refresh Data"
//                 >
//                   <FaSync className={loading ? "animate-spin" : ""} />
//                 </button>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {/* Search - Local Filter */}
//               <div>
//                 <label className="text-sm font-medium text-slate-700 mb-2 block">
//                   Search (Instant)
//                 </label>
//                 <div className="relative">
//                   <FaSearch className="absolute left-3 top-3.5 text-slate-400 text-sm" />
//                   <input
//                     type="text"
//                     placeholder="Name, ID, receipt..."
//                     value={filters.search}
//                     onChange={(e) => {
//                       setFilters((prev) => ({
//                         ...prev,
//                         search: e.target.value,
//                       }));
//                       setFilterLoading(true);
//                       setTimeout(() => setFilterLoading(false), 100);
//                     }}
//                     className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
//                   />
//                 </div>
//               </div>

//               {/* Status - API Filter */}
//               <div>
//                 <label className="text-sm font-medium text-slate-700 mb-2 block">
//                   Status
//                 </label>
//                 <select
//                   value={filters.status}
//                   onChange={(e) => updateFilter("status", e.target.value)}
//                   className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white transition-all"
//                 >
//                   <option value="">All Status</option>
//                   <option value="PAID">Paid</option>
//                   <option value="PARTIAL">Partial</option>
//                   <option value="PENDING">Pending</option>
//                 </select>
//               </div>

//               {/* Class - API Filter */}
//               <div>
//                 <label className="text-sm font-medium text-slate-700 mb-2 block">
//                   Class
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Class name"
//                   value={filters.className}
//                   onChange={(e) => updateFilter("className", e.target.value)}
//                   className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
//                 />
//               </div>
//             </div>

//             {/* Active Filters */}
//             {Object.values(filters).some((f) => f) && (
//               <div className="mt-6 pt-6 border-t border-slate-100">
//                 <div className="flex items-center gap-3 mb-3">
//                   <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
//                   <span className="text-sm font-medium text-slate-700">
//                     Active filters:
//                   </span>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {filters.search && (
//                     <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
//                       🔍 {filters.search}
//                     </span>
//                   )}
//                   {filters.status && (
//                     <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
//                       📊 {filters.status}
//                     </span>
//                   )}
//                   {filters.className && (
//                     <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
//                       🏫 {filters.className}
//                     </span>
//                   )}
//                   <button
//                     onClick={clearFilters}
//                     className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-full transition-colors"
//                   >
//                     Clear all
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Payment Table */}
//           <div className="bg-white rounded-2xl shadow border border-slate-100 overflow-hidden">
//             <div className="p-6 border-b border-slate-100">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-xl font-bold text-slate-900">
//                   Payments ({filteredPayments.length})
//                 </h3>
//                 {filterLoading && (
//                   <div className="flex items-center gap-2 text-sm text-slate-500">
//                     <FaSpinner className="animate-spin" />
//                     Applying filters...
//                   </div>
//                 )}
//               </div>
//             </div>

//             {filteredPayments.length === 0 ? (
//               <div className="p-12 text-center">
//                 <FaFileDownload className="mx-auto h-12 w-12 text-slate-300 mb-4" />
//                 <h4 className="text-lg font-semibold text-slate-900 mb-2">
//                   No payments found
//                 </h4>
//                 <p className="text-slate-500">
//                   Try adjusting your search or filters
//                 </p>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead className="bg-slate-50">
//                     <tr>
//                       {[
//                         "Receipt",
//                         "Student",
//                         "Class",
//                         "Amount",
//                         "Method",
//                         "Date",
//                         "Status",
//                         "Actions",
//                       ].map((header) => (
//                         <th
//                           key={header}
//                           className="p-4 text-left text-sm font-semibold text-slate-700"
//                         >
//                           {header}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-100">
//                     {filteredPayments.map((payment) => (
//                       <tr
//                         key={payment._id}
//                         className="hover:bg-slate-50 transition-colors"
//                       >
//                         <td className="p-4">
//                           <div className="font-mono font-semibold text-slate-900">
//                             {payment.receiptNumber}
//                           </div>
//                         </td>
//                         <td className="p-4">
//                           <div>
//                             <div className="font-semibold text-slate-900">
//                               {payment.studentName}
//                             </div>
//                             <div className="text-sm text-slate-500">
//                               {payment.studentID}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="p-4">
//                           <div className="text-slate-700 font-medium">
//                             {payment.className}
//                             {payment.section && ` (${payment.section})`}
//                           </div>
//                         </td>
//                         <td className="p-4">
//                           <div className="text-lg font-bold text-green-700">
//                             ₹{payment.amountPaid.toLocaleString("en-IN")}
//                           </div>
//                         </td>
//                         <td className="p-4">
//                           <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
//                             {payment.paymentMethod}
//                           </span>
//                         </td>
//                         <td className="p-4">
//                           {new Date(payment.paymentDate).toLocaleDateString(
//                             "en-IN",
//                             {
//                               day: "2-digit",
//                               month: "short",
//                               year: "numeric",
//                             },
//                           )}
//                         </td>
//                         <td className="p-4">
//                           <span
//                             className={`px-3 py-1 rounded-full text-sm font-medium ${
//                               payment.status === "PAID"
//                                 ? "bg-green-100 text-green-700"
//                                 : payment.status === "PARTIAL"
//                                   ? "bg-yellow-100 text-yellow-700"
//                                   : "bg-orange-100 text-orange-700"
//                             }`}
//                           >
//                             {payment.status}
//                           </span>
//                         </td>
//                         <td className="p-4">
//                           <div className="flex items-center gap-2">
//                             <button
//                               onClick={() => downloadReceipt(payment)}
//                               className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
//                               title="Download"
//                             >
//                               <FaDownload />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



import { useEffect, useState, useMemo, useRef, useCallback } from "react";
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
  FaSync
} from "react-icons/fa";

export default function PaymentHistory() {
  const academicYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -1; i < 6; i++) {
      const year = currentYear + i;
      years.push(`${year}-${year + 1}`);
    }
    return years;
  }, []);

  const [academicYear, setAcademicYear] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return month >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  });

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    className: "",
  });
  const [filterLoading, setFilterLoading] = useState(false);
  
  const isMounted = useRef(true);
  const lastRequestKey = useRef("");

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ✅ FIXED: Stable loadPayments function
  const loadPayments = useCallback(async (year, status, className) => {
    if (!isMounted.current) return;
    
    try {
      setLoading(true);
      
      const params = {
        academicYear: year,
        ...(status && { status }),
        ...(className && { className })
      };

      console.log("Fetching payments with params:", params);
      
      // ✅ Use the correct endpoint from API_ENDPOINTS
      const response = await api.get(API_ENDPOINTS.ADMIN.FEE.ALL, {
        params,
        timeout: 10000,
      });

      console.log("API Response:", response);

      // Backend ka getAllPayments { success, message, data: { payments: [] } } format mein return karta hai
      const apiData = response?.data?.payments || response?.payments || [];
      
      console.log("Processed data:", apiData);

      const paymentsData = Array.isArray(apiData) ? apiData.map((p, idx) => ({
        _id: p._id || p.feePaymentId || `payment-${idx}`,
        receiptNumber: p.receiptNumber || `RCPT${1000 + idx}`,
        studentName: p.student?.name || p.studentName || "Unknown Student",
        studentID: p.student?.studentID || p.studentID || "N/A",
        className: p.className || "N/A",
        section: p.section || "",
        amountPaid: Number(p.amountPaid || p.amount || 0),
        paymentMethod: p.paymentMethod || p.paymentMode || "CASH",
        paymentDate: p.paymentDate || new Date().toISOString(),
        status: p.status || "PAID",
      })) : [];

      if (isMounted.current) {
        setPayments(paymentsData);
        setFilterLoading(false);
        console.log("Payments set:", paymentsData.length);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      if (isMounted.current) {
        setPayments([]);
        toast.error("Failed to load payments");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        console.log("Loading finished");
      }
    }
  }, []);

  // ✅ FIXED: Correct useEffect with all dependencies
  useEffect(() => {
    console.log("useEffect triggered:", { academicYear, filters });
    
    const requestKey = `${academicYear}-${filters.status}-${filters.className}`;
    
    // Skip if same request is already in progress
    if (lastRequestKey.current === requestKey) {
      console.log("Skipping duplicate request");
      return;
    }
    
    lastRequestKey.current = requestKey;
    
    const timer = setTimeout(() => {
      console.log("Calling loadPayments");
      loadPayments(academicYear, filters.status, filters.className);
    }, 400);

    return () => {
      console.log("Cleaning up timer");
      clearTimeout(timer);
    };
  }, [academicYear, filters, loadPayments]); // ✅ Added filters and loadPayments

  // ✅ FIXED: Use useCallback for filter functions
  const updateFilter = useCallback((field, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [field]: value };
      
      if (field === 'status' || field === 'className') {
        setFilterLoading(true);
      }
      
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      status: "",
      className: "",
    });
    setFilterLoading(true);
  }, []);

  // ✅ FIXED: Local filtering with all dependencies
  const filteredPayments = useMemo(() => {
    console.log("Filtering payments:", payments.length, filters);
    
    if (!payments.length) return [];
    
    let result = [...payments];
    
    // Apply search filter
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(p => 
        p.studentName?.toLowerCase().includes(q) ||
        p.studentID?.toLowerCase().includes(q) ||
        p.receiptNumber?.toLowerCase().includes(q) ||
        p.className?.toLowerCase().includes(q)
      );
    }
    
    // Apply status filter locally (already filtered by API)
    if (filters.status) {
      result = result.filter(p => p.status === filters.status);
    }
    
    // Apply class filter locally (already filtered by API)
    if (filters.className) {
      result = result.filter(p => 
        p.className.toLowerCase().includes(filters.className.toLowerCase())
      );
    }
    
    console.log("Filtered result:", result.length);
    return result;
  }, [payments, filters]); // ✅ Added filters dependency

  // ✅ FIXED: Download receipt function
  const downloadReceipt = async (payment) => {
    try {
      // Use API_ENDPOINTS constant
      const endpoint = API_ENDPOINTS.ADMIN.FEE.DOWNLOAD_RECEIPT(payment._id);
      console.log("Downloading receipt from:", endpoint);
      
      const response = await api.get(endpoint, { 
        responseType: "blob" 
      });
      
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${payment.studentName.replace(/\s+/g, "_")}_${payment.receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Receipt downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download receipt");
    }
  };

  // Refresh button handler
  const handleRefresh = () => {
    setFilterLoading(true);
    loadPayments(academicYear, filters.status, filters.className);
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
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Payment History</h1>
          <p className="text-sm font-medium text-slate-600 mt-2">View and manage past transactions</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Session:</span>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="bg-slate-50 border-none text-slate-900 text-sm font-bold rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-purple-500 cursor-pointer outline-none"
          >
            {academicYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Essential Filters */}
      <div className="bg-white rounded-2xl p-6 shadow border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <FaFilter className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Filters</h3>
            <p className="text-sm text-slate-500">
              Search locally • Status/Class filter via API
            </p>
          </div>
          <div className="ml-auto">
            <button
              onClick={handleRefresh}
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
              title="Refresh Data"
              disabled={loading}
            >
              <FaSync className={loading ? "animate-spin" : ""} />
            </button>
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
                onChange={(e) => updateFilter("search", e.target.value)}
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
              <option value="PARTIAL">Partial</option>
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
        {(filters.search || filters.status || filters.className) && (
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
            {(filterLoading || loading) && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <FaSpinner className="animate-spin" />
                {filterLoading ? "Applying filters..." : "Loading..."}
              </div>
            )}
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <FaFileDownload className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h4 className="text-lg font-semibold text-slate-900 mb-2">
              {payments.length === 0 ? "No payments found" : "No matching payments"}
            </h4>
            <p className="text-slate-500">
              {payments.length === 0 
                ? "No payment records for the selected filters" 
                : "Try adjusting your search"}
            </p>
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
                        payment.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' :
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
                          title="Download Receipt"
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