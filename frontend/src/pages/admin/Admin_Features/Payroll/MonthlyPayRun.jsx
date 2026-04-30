import { useState, useEffect, useCallback } from "react";
import api from "../../../../services/api";
import {
  FaSync,
  FaCheckCircle,
  FaSpinner,
  FaHistory,
  FaFileInvoiceDollar,
  FaDownload,
  FaEye,
  FaTimes,
  FaPrint,
  FaCogs,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";

export default function MonthlyPayRun() {
  const [stats, setStats] = useState([]);
  const [processedSlips, setProcessedSlips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedSlipData, setSelectedSlipData] = useState(null);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [session, setSession] = useState([]);

  // Pending Table Pagination
  const [pendingPage, setPendingPage] = useState(1);

  // Processed Table Pagination
  const [processedPage, setProcessedPage] = useState(1);

  const rowsPerPage = 5;

  // New state for extra earnings
  const [extraEarnings, setExtraEarnings] = useState({}); // Structure: { teacherId: { amount: 0, remark: "" } }

  // New state for manual override amounts
  const [manualAmounts, setManualAmounts] = useState({}); // { teacherId: 25000 }

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSlipId, setPaymentSlipId] = useState(null);
  const [paymentMode, setPaymentMode] = useState("NEFT");
  const [transactionId, setTransactionId] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  // 2. Input change handler
  const handleManualAmountChange = (id, value) => {
    setManualAmounts((prev) => ({ ...prev, [id]: value }));
  };

  // 1. Row Add karne ka function
  const handleAddExtraRow = (staffId) => {
    setExtraEarnings((prev) => ({
      ...prev,
      [staffId]: [...(prev[staffId] || []), { amount: "", remark: "" }],
    }));
  };

  // 2. Specific field update karne ka function
  const handleExtraFieldChange = (staffId, index, field, value) => {
    const updated = [...(extraEarnings[staffId] || [])];
    updated[index] = { ...updated[index], [field]: value };
    setExtraEarnings((prev) => ({ ...prev, [staffId]: updated }));
  };

  const monthNames = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ];

  // Format date safely
  const formatDateSafe = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-IN");
    } catch {
      return "N/A";
    }
  };

  // Format currency safely (convert decimals to proper amounts)
  // ✅ FIX: Simple rounding without weird multiplication
  const formatCurrency = (amount) => {
    return Math.round(Number(amount || 0));
  };

  // Format currency for display
  const displayCurrency = (amount) => {
    return formatCurrency(amount).toLocaleString("en-IN");
  };

  // 1. Fetch Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch attendance and payroll lists
      const [attResp, payResp] = await Promise.all([
        api.get(
          API_ENDPOINTS.ADMIN.PAYROLL.ATTENDANCE_STATS(
            selectedMonth,
            selectedYear,
          ),
        ),
        api.get(
          `${API_ENDPOINTS.ADMIN.PAYROLL.LIST}?month=${selectedMonth}&year=${selectedYear}`,
        ),
      ]);

      const processedData = payResp?.data || payResp || [];
      const attendanceData = attResp?.data || attResp || [];

      // 2. Identify who is already processed (Strict employeeId match)
      const processedIds = processedData
        .map((p) => {
          // ✅ STRICT FIX: Always use employeeId as per your Payroll Schema
          return p.employeeId?.toString();
        })
        .filter(Boolean);

      // 3. Filter pending staff
      const pendingStaff = attendanceData.filter((s) => {
        const staffId = s.teacherId?.toString() || s._id?.toString();
        return staffId && !processedIds.includes(staffId);
      });

      const formattedPending = pendingStaff.map((staff) => ({
        id: staff.teacherId || staff._id,
        teacherID: staff.teacherID,
        name: staff.name,
      }));

      setStats(formattedPending);

      setProcessedSlips(
        processedData.map((slip) => ({
          _id: slip._id,
          employeeId: slip.employeeId,
          employeeName: slip.employeeName || "Processing...",
          netSalary: Math.round(slip.netSalary || 0),
          paymentStatus: slip.paymentStatus,
          month: slip.month,
          year: slip.year,
          generatedAt: slip.createdAt,
        })),
      );

      setStats(formattedPending);
    } catch (err) {
      console.error("Sync Error:", err);
      toast.error("Sync Error: Could not fetch payroll data");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  const fetchSessions = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.SESSION.GET_All_SESSION);

      console.log("SESSION API RESPONSE:", res);

      // ✅ handle multiple possible structures
      const sessionData = res?.data?.sessions || res?.data || res || [];

      setSession(sessionData);

      // ✅ safe find
      const currentYear = new Date().getFullYear();

      const matchedSession = sessionData.find(
        (s) => Number(s.endYear) === currentYear,
      );

      if (matchedSession) {
        setAcademicYear(matchedSession.endYear);
      } else {
        setAcademicYear(currentYear);
      }
    } catch (err) {
      console.error("Session fetch error", err);
    }
  };

  useEffect(() => {
    loadData();
    fetchSessions();
  }, [loadData]);

  // 2. Generate Individual Salary Slip
  const handleGenerateSlip = async (teacherId) => {
    setProcessingId(teacherId);
    try {
      const payload = {
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
        employeeIds: [teacherId],
        // ✅ Pass extra earnings for this specific teacher
        extraEarnings: {
          [teacherId]: extraEarnings[teacherId] || [],
        },
        // ✅ CORRECTED: Map specific teacher's amount
        manualAmount: manualAmounts[teacherId]
          ? Number(manualAmounts[teacherId])
          : null,
      };

      const response = await api.post(
        API_ENDPOINTS.ADMIN.PAYROLL.RUN_PAYROLL,
        payload,
      );

      // 🚩 Logic: Check for partial failures even in 200 OK
      if (response.data?.data?.failed?.length > 0) {
        const errorMsg = response.data.data.failed[0].reason;
        toast.error(`Failed: ${errorMsg}`);
      } else {
        toast.success("Salary Slip Generated!");

        // Clear force amount after success
        setManualAmounts((prev) => {
          const newState = { ...prev };
          delete newState[teacherId];
          return newState;
        });

        // REFRESH BOTH TABLES
        await loadData();
      }
    } catch (err) {
      // 🚩 Yahan backend ka res.status(400) catch hoga
      const serverMsg =
        err?.response?.data?.message || "Salary structure not found!";
      toast.error(serverMsg, {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setProcessingId(null);
    }
  };

  // ✅ UPDATED: View Salary Slip Details with Modal (Fixed Logic)
  const handleViewSlip = async (slipId, employeeName) => {
    try {
      const endpoint = API_ENDPOINTS.ADMIN.PAYROLL.VIEW_SLIP(slipId);
      const response = await api.get(endpoint);

      // ✅ FIX: Extract 'slip' and 'staff' correctly from your backend response
      const { slip, staff } = response.data?.data || response.data || {};

      const processedData = {
        slip: {
          ...slip,
          earnings: slip.earnings || {},
          deductions: slip.deductions || {},
        },
        employee: {
          name: staff?.name || employeeName,
          employeeId: staff?.teacherID || staff?.adminID || slip.employeeId,
          department: staff?.department || "Teaching",
          paymentMode: staff?.salary?.paymentMode || "Bank Transfer",
        },
      };

      setSelectedSlipData(processedData);
      setShowModal(true);
    } catch {
      toast.error("Slip data loading failed");
    }
  };

  // ✅ Download PDF Function - Updated with Axios Blob
  const handleDownloadPDF = async (slipId) => {
    try {
      toast.info("Generating PDF, please wait...");

      // ✅ Use Axios with responseType 'blob'
      const response = await api.axios.get(
        API_ENDPOINTS.ADMIN.PAYROLL.DOWNLOAD_SLIP(slipId),
        { responseType: "blob" },
      );

      // ✅ Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Set filename
      link.setAttribute("download", `SalarySlip_${slipId}.pdf`);

      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Download started!");
    } catch (err) {
      console.error("Download Error:", err);
      toast.error("Failed to download PDF. Please try again.");
    }
  };

  // ✅ Print Slip Function
  const handlePrintSlip = () => {
    if (!selectedSlipData) return;

    const printContent = `
      <html>
        <head>
          <title>Salary Slip - ${selectedSlipData.employee.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .section { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .total { font-weight: bold; font-size: 1.2em; }
            .footer { margin-top: 30px; text-align: center; font-size: 0.8em; color: #666; }
            .earnings { color: #059669; }
            .deductions { color: #dc2626; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SALARY SLIP</h1>
            <p><strong>${
              isNaN(selectedSlipData.slip.month)
                ? selectedSlipData.slip.month
                : monthNames[parseInt(selectedSlipData.slip.month) - 1]
            } ${selectedSlipData.slip.year}</strong></p>
            <p>${selectedSlipData.employee.name} • ${selectedSlipData.slip.paymentStatus}</p>
          </div>
          
          <div class="section">
            <p><strong>Employee ID:</strong> ${selectedSlipData.employee.employeeId}</p>
            <p><strong>Department:</strong> ${selectedSlipData.employee.department}</p>
            <p><strong>Generated On:</strong> ${formatDateSafe(selectedSlipData.slip.generatedAt)}</p>
          </div>
          
          <div class="section">
            <h3 class="earnings">EARNINGS</h3>
            <table>
              <tr><td>Basic Pay</td><td>₹${displayCurrency(selectedSlipData.slip.earnings.basic)}</td></tr>
              <tr><td>House Rent Allowance (HRA)</td><td>₹${displayCurrency(selectedSlipData.slip.earnings.hra)}</td></tr>
              <tr><td>Special Allowance</td><td>₹${displayCurrency(selectedSlipData.slip.earnings.specialAllowance)}</td></tr>
              <tr class="total"><td>Gross Salary</td><td>₹${displayCurrency(selectedSlipData.slip.grossSalary)}</td></tr>
            </table>
          </div>
          
          <div class="section">
            <h3 class="deductions">DEDUCTIONS</h3>
            <table>
              <tr><td>EPF (Employee Contribution)</td><td>-₹${displayCurrency(selectedSlipData.slip.deductions.epfEmployee)}</td></tr>
              <tr><td>Professional Tax</td><td>-₹${displayCurrency(selectedSlipData.slip.deductions.professionalTax)}</td></tr>
              <tr><td>Tax Deducted at Source (TDS)</td><td>-₹${displayCurrency(selectedSlipData.slip.deductions.tds)}</td></tr>
              <tr class="total deductions"><td>Total Deductions</td><td>-₹${displayCurrency(
                (selectedSlipData.slip.deductions.epfEmployee || 0) +
                  (selectedSlipData.slip.deductions.professionalTax || 0) +
                  (selectedSlipData.slip.deductions.tds || 0),
              )}</td></tr>
            </table>
          </div>
          
          <div class="section total" style="background: #f0f9ff; padding: 30px; border-radius: 8px; text-align: center;">
            <h2 style="color: #4f46e5; margin: 0;">Net Take-Home Pay: ₹${displayCurrency(selectedSlipData.slip.netSalary)}</h2>
            <p>Payable via ${selectedSlipData.employee.paymentMode}</p>
          </div>
          
          <div class="footer">
            <p><strong>Notes:</strong></p>
            <p>• This is a system-generated salary slip</p>
            <p>• For any discrepancies, contact accounts department within 7 days</p>
            <p>• Salary is credited on the 5th of every month</p>
            <p>• Generated on: ${new Date().toLocaleDateString("en-IN")} ${new Date().toLocaleTimeString("en-IN")}</p>
            <p>School Management System © ${new Date().getFullYear()}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // 5. Mark as Paid Modal Opener
  const handleMarkPaid = (slipId) => {
    setPaymentSlipId(slipId);
    setPaymentMode("NEFT");
    setTransactionId("");
    setShowPaymentModal(true);
  };

  // 6. Submit Payment
  const submitPayment = async () => {
    let finalTxId = transactionId.trim();

    if (paymentMode === "NEFT") {
      if (!finalTxId || finalTxId.length < 5) {
        return toast.warning("Valid Transaction ID is required (min 5 chars) for Bank/NEFT payments.");
      }
    } else {
      // Auto-generate a dummy transaction ID for cash
      finalTxId = `CASH-${Date.now().toString().slice(-6)}`;
    }

    try {
      setPaymentLoading(true);
      // API endpoint call
      await api.put(API_ENDPOINTS.ADMIN.PAYROLL.MARK_PAID_V2(paymentSlipId), {
        transactionId: finalTxId,
        paymentMode: paymentMode,
      });

      toast.success(`Salary successfully marked as PAID via ${paymentMode}`);
      setShowPaymentModal(false);
      loadData(); // Refresh list
    } catch (err) {
      toast.error(err?.response?.data?.message || "Payment update failed");
    } finally {
      setPaymentLoading(false);
    }
  };

  // 4. Bulk Generate
  const handleBulkGenerate = async () => {
    if (stats.length === 0) {
      toast.info("No pending staff to process");
      return;
    }

    const confirmed = window.confirm(
      `Generate salary slips for all ${stats.length} pending staff?`,
    );
    if (!confirmed) return;

    setProcessingId("BULK");
    try {
      const payload = {
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
        employeeIds: stats.map((s) => s.id).filter(Boolean),
        // ✅ ADD THIS: Bulk data transfer
        extraEarnings: extraEarnings,
      };

      await api.post(API_ENDPOINTS.ADMIN.PAYROLL.RUN_PAYROLL, payload);
      toast.success(`Generated ${stats.length} salary slips!`);
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Bulk generation failed");
    } finally {
      setProcessingId(null);
    }
  };

  // Pending Staff Pagination
  const pendingStart = (pendingPage - 1) * rowsPerPage;
  const pendingEnd = pendingStart + rowsPerPage;
  const paginatedStats = stats.slice(pendingStart, pendingEnd);

  const pendingTotalPages = Math.ceil(stats.length / rowsPerPage);

  // Processed Slips Pagination
  const processedStart = (processedPage - 1) * rowsPerPage;
  const processedEnd = processedStart + rowsPerPage;
  const paginatedProcessedSlips = processedSlips.slice(
    processedStart,
    processedEnd,
  );

  const processedTotalPages = Math.ceil(processedSlips.length / rowsPerPage);

  const maxVisiblePages = 10;

  const pendingStartPage = Math.max(
    1,
    pendingPage - Math.floor(maxVisiblePages / 2),
  );

  const pendingEndPage = Math.min(
    pendingTotalPages,
    pendingStartPage + maxVisiblePages - 1,
  );

  const pendingPages = [];
  for (let i = pendingStartPage; i <= pendingEndPage; i++) {
    pendingPages.push(i);
  }

  return (
    <div className=" space-y-12">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        <div className="flex items-start gap-3">

  <div className="h-16 w-16 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center">
    <FaCogs size={32} />
  </div>

  <div>
    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
      Payroll Processing
    </h2>

    <p className="text-gray-500 font-medium text-sm mt-1">
      Process monthly salaries and generate payroll records
    </p>

    <div className="flex gap-4 mt-3">
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(Number(e.target.value))}
        className="bg-white border border-slate-400 rounded-xl px-4 py-2 font-bold text-sm outline-none focus:border-amber-500"
      >
        {monthNames.map((m, i) => (
          <option key={m} value={i + 1}>
            {m}
          </option>
        ))}
      </select>

      <select
        value={academicYear}
        onChange={(e) => setAcademicYear(e.target.value)}
        className="px-4 py-2.5 bg-slate-100 border border-slate-600 rounded-xl text-sm font-medium text-black"
      >
        {session?.map((s) => (
          <option key={s._id} value={s.endYear}>
            {s.endYear}
          </option>
        ))}
      </select>
    </div>
  </div>

</div>
        <div className="flex gap-3">
          <button
            onClick={handleBulkGenerate}
            disabled={loading || stats.length === 0 || processingId === "BULK"}
            className="flex items-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processingId === "BULK" ? (
              <>
                <FaSpinner className="animate-spin" /> Processing...
              </>
            ) : (
              <>
                <FaFileInvoiceDollar /> Generate All ({stats.length})
              </>
            )}
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            <FaSync className={loading ? "animate-spin" : ""} /> Refresh Records
          </button>
        </div>
      </div>

      {/* TABLE 1: PENDING FOR GENERATION */}
      <section>
        <h3 className="text-xs font-bold uppercase text-indigo-700 tracking-widest mb-4 flex items-center gap-2">
          <FaSpinner className="animate-pulse" /> Pending Generation (
          {stats.length})
        </h3>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-400">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white text-[10px] uppercase font-bold tracking-wider border-b border-slate-400">
              <tr>
                <th className="p-6">Staff Details</th>
                <th className="p-6 text-center">
                  Adjustment Gross (Optional)
                  <div className="text-[9px] text-slate-400 font-normal normal-case tracking-normal mt-1">
                    Leave blank to use standard salary
                  </div>
                </th>
                <th className="p-6 text-center w-[320px]">Extra Activities</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-400">
              {paginatedStats.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">
                        {row.name[0]}
                      </div>
                      <div>
                        <p className="font-bold">{row.name}</p>
                        <p className="text-xs text-slate-500">
                          {row.teacherID}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <input
                      type="number"
                      placeholder="Adjustment Gross"
                      className="w-full p-2.5 bg-white border border-slate-400 rounded-xl font-bold text-slate-800 outline-none focus:border-amber-500 text-center transition-all"
                      value={manualAmounts[row.id] || ""}
                      onChange={(e) =>
                        handleManualAmountChange(row.id, e.target.value)
                      }
                    />
                  </td>
                  {/* <td className="p-6">
                    <div className="space-y-2">
                      {(extraEarnings[row.id] || []).map((ex, i) => (
                        <div key={i} className="flex gap-2 flex-wrap">
                          <input
                            type="number"
                            placeholder="₹"
                            className="w-20 min-w-[80px] bg-white border border-slate-400 outline-none focus:border-amber-500 rounded-lg p-1 text-xs font-bold"
                            value={ex.amount}
                            onChange={(e) =>
                              handleExtraFieldChange(
                                row.id,
                                i,
                                "amount",
                                e.target.value,
                              )
                            }
                          />
                          <input
                            type="text"
                            placeholder="Reason"
                            className="w-full max-w-[180px] bg-white border border-slate-400 outline-none focus:border-amber-500 rounded-lg p-1 text-[10px] italic"
                            value={ex.remark}
                            onChange={(e) =>
                              handleExtraFieldChange(
                                row.id,
                                i,
                                "remark",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddExtraRow(row.id)}
                        className="text-[9px] font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-tighter transition-colors"
                      >
                        + Add Line Item
                      </button>
                    </div>
                  </td> */}

                  <td className="p-6 text-center">
                    <div className="space-y-2 flex flex-col items-center">
                      {(extraEarnings[row.id] || []).map((ex, i) => (
                        <div
                          key={i}
                          className="flex gap-2 flex-wrap justify-center"
                        >
                          <input
                            type="number"
                            placeholder="₹"
                            className="w-20 min-w-[80px] bg-white border border-slate-400 outline-none focus:border-amber-500 rounded-lg p-1 text-xs font-bold"
                            value={ex.amount}
                            onChange={(e) =>
                              handleExtraFieldChange(
                                row.id,
                                i,
                                "amount",
                                e.target.value,
                              )
                            }
                          />

                          <input
                            type="text"
                            placeholder="Reason"
                            className="w-full max-w-[180px] bg-white border border-slate-400 outline-none focus:border-amber-500 rounded-lg p-1 text-[10px] italic"
                            value={ex.remark}
                            onChange={(e) =>
                              handleExtraFieldChange(
                                row.id,
                                i,
                                "remark",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      ))}

                      <button
                        onClick={() => handleAddExtraRow(row.id)}
                        className="text-[9px] font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-tighter transition-colors"
                      >
                        + Add Line Item
                      </button>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button
                      onClick={() => handleGenerateSlip(row.id)}
                      disabled={processingId === row.id}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 ml-auto"
                    >
                      {processingId === row.id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <>
                          <FaCheckCircle /> Generate
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {stats.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="p-10 text-center text-slate-400 font-medium italic"
                  >
                    No pending staff for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-center gap-2 p-6">
            <button
              onClick={() => setPendingPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 border rounded-lg text-sm"
            >
              Prev
            </button>

            {pendingPages.map((page) => (
              <button
                key={page}
                onClick={() => setPendingPage(page)}
                className={`px-4 py-2 border rounded-lg text-sm ${
                  pendingPage === page ? "bg-indigo-600 text-white" : "bg-white"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                setPendingPage((prev) => Math.min(prev + 1, pendingTotalPages))
              }
              className="px-4 py-2 border rounded-lg text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* TABLE 2: PROCESSED SLIPS */}
      <section className="bg-white rounded-2xl border border-slate-400 p-8 shadow-sm">
        <h3 className="font-bold uppercase text-xs text-slate-500 mb-6 flex items-center gap-2 tracking-widest">
          <FaHistory className="text-slate-400" /> Processed Salary Slips (
          {processedSlips.length})
        </h3>
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-400 shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[9px] uppercase font-bold tracking-widest border-b border-slate-400">
              <tr>
                <th className="p-5">Employee</th>
                <th className="p-5 text-center">Net Payout</th>
                <th className="p-5 text-center">Month</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-400">
              {paginatedProcessedSlips.map((slip) => (
                <tr
                  key={slip._id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="p-5">
                    <p className="font-bold text-slate-800">
                      {slip.employeeName}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                      Ref: {slip._id.slice(-6)}
                    </p>
                  </td>
                  <td className="p-5 text-center text-indigo-600 font-bold text-base">
                    ₹{slip.netSalary.toLocaleString()}
                  </td>
                  <td className="p-5 text-center text-xs font-bold text-slate-500 uppercase">
                    {monthNames[slip.month - 1]} {slip.year}
                  </td>
                  <td className="p-5 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase ${slip.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}
                    >
                      {slip.paymentStatus}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      {slip.paymentStatus !== "PAID" && (
                        <button
                          onClick={() => handleMarkPaid(slip._id)}
                          className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 p-2.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                          title="Mark as Paid"
                        >
                          <FaCheckCircle /> Pay
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleViewSlip(slip._id, slip.employeeName)
                        }
                        className="bg-slate-100 hover:bg-slate-200 p-2.5 rounded-xl text-slate-600 transition-all"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(slip._id)}
                        className="bg-indigo-50 hover:bg-indigo-100 p-2.5 rounded-xl text-indigo-600 transition-all"
                      >
                        <FaDownload />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center gap-2 p-6">
            <button
              onClick={() => setProcessedPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 border rounded-lg text-sm"
            >
              Prev
            </button>

            {[...Array(processedTotalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setProcessedPage(index + 1)}
                className={`px-4 py-2 border rounded-lg text-sm ${
                  processedPage === index + 1
                    ? "bg-indigo-600 text-white"
                    : "bg-white"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setProcessedPage((prev) =>
                  Math.min(prev + 1, processedTotalPages),
                )
              }
              className="px-4 py-2 border rounded-lg text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* SUMMARY CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-400 p-6">
          <div className="text-sm text-slate-500 font-semibold">
            Pending Staff
          </div>
          <div className="text-3xl font-bold text-amber-700 mt-2">
            {stats.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Awaiting salary generation
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-400 p-6">
          <div className="text-sm text-slate-500 font-semibold">
            Processed Slips
          </div>
          <div className="text-3xl font-bold text-emerald-600 mt-2">
            {processedSlips.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Successfully generated
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-400 p-6">
          <div className="text-sm text-slate-500 font-semibold">
            Total Salary
          </div>
          <div className="text-3xl font-bold text-slate-800 mt-2">
            ₹
            {processedSlips
              .reduce((sum, slip) => sum + (slip.netSalary || 0), 0)
              .toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Total processed amount
          </div>
        </div>
      </div>

      {/* ✅ SALARY SLIP MODAL */}
      {showModal && selectedSlipData && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          style={{ animation: "fadeIn 0.3s ease-out" }}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-sm border border-slate-400"
            style={{ animation: "slideUp 0.4s ease-out" }}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold uppercase tracking-tight">
                  Salary Slip
                </h3>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-sm font-bold">
                    {selectedSlipData.employee.name}
                  </p>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                    {isNaN(selectedSlipData.slip.month)
                      ? selectedSlipData.slip.month
                      : monthNames[
                          parseInt(selectedSlipData.slip.month) - 1
                        ]}{" "}
                    {selectedSlipData.slip.year}
                  </span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold ${
                      selectedSlipData.slip.paymentStatus === "PAID"
                        ? "bg-emerald-500"
                        : selectedSlipData.slip.paymentStatus === "PROCESSED"
                          ? "bg-blue-500"
                          : "bg-orange-500"
                    }`}
                  >
                    {selectedSlipData.slip.paymentStatus}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="h-12 w-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all font-bold text-xl"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* Employee Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">
                    Employee ID
                  </p>
                  <p className="font-bold">
                    {selectedSlipData.employee.employeeId || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">
                    Department
                  </p>
                  <p className="font-bold">
                    {selectedSlipData.employee.department}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">
                    Generated On
                  </p>
                  <p className="font-bold text-indigo-600">
                    {selectedSlipData.slip.createdAt
                      ? new Date(
                          selectedSlipData.slip.createdAt,
                        ).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "Pending Generation"}
                  </p>
                </div>
              </div>

              {/* Salary Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Earnings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase text-emerald-600 tracking-widest border-b pb-3">
                    Earnings
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-700">Basic Pay</span>
                      <span className="font-bold">
                        ₹{displayCurrency(selectedSlipData.slip.earnings.basic)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">
                        House Rent Allowance (HRA)
                      </span>
                      <span className="font-bold">
                        ₹{displayCurrency(selectedSlipData.slip.earnings.hra)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Special Allowance</span>
                      <span className="font-bold">
                        ₹
                        {displayCurrency(
                          selectedSlipData.slip.earnings.specialAllowance,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-slate-400 text-lg font-bold text-emerald-700">
                      <span>Gross Salary</span>
                      <span>
                        ₹{displayCurrency(selectedSlipData.slip.grossSalary)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase text-rose-600 tracking-widest border-b pb-3">
                    Deductions
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-700">
                        EPF (Employee Contribution)
                      </span>
                      <span className="font-bold text-rose-600">
                        -₹
                        {displayCurrency(
                          selectedSlipData.slip.deductions.epfEmployee,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Professional Tax</span>
                      <span className="font-bold text-rose-600">
                        -₹
                        {displayCurrency(
                          selectedSlipData.slip.deductions.professionalTax,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">
                        Tax Deducted at Source (TDS)
                      </span>
                      <span className="font-bold text-rose-600">
                        -₹
                        {displayCurrency(selectedSlipData.slip.deductions.tds)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-slate-400 text-lg font-bold text-rose-700">
                      <span>Total Deductions</span>
                      <span>
                        -₹
                        {displayCurrency(
                          (selectedSlipData.slip.deductions.epfEmployee || 0) +
                            (selectedSlipData.slip.deductions.professionalTax ||
                              0) +
                            (selectedSlipData.slip.deductions.tds || 0),
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Salary Card */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-8 rounded-3xl text-white">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div>
                    <p className="text-sm font-bold uppercase opacity-90">
                      Net Take-Home Pay
                    </p>
                    <h2 className="text-4xl font-bold mt-2">
                      ₹{displayCurrency(selectedSlipData.slip.netSalary)}
                    </h2>
                    <p className="text-sm opacity-90 mt-2">
                      Payable via {selectedSlipData.employee.paymentMode}
                    </p>
                  </div>
                  <div className="flex gap-3 mt-6 md:mt-0">
                    <button
                      onClick={handlePrintSlip}
                      className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                      <FaPrint /> Print
                    </button>
                    <button
                      onClick={() =>
                        handleDownloadPDF(selectedSlipData.slip._id)
                      }
                      className="bg-white text-indigo-600 hover:bg-slate-100 px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                      <FaDownload /> Download PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="text-xs text-slate-500 p-4 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-700 mb-1">Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>This is a system-generated salary slip</li>
                  <li>
                    For any discrepancies, contact accounts department within 7
                    days
                  </li>
                  <li>Salary is credited on the 5th of every month</li>
                  <li>
                    Generated on: {new Date().toLocaleDateString("en-IN")}{" "}
                    {new Date().toLocaleTimeString("en-IN")}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ RECORD PAYMENT MODAL */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          style={{ animation: "fadeIn 0.2s ease-out" }}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-xl border border-slate-400"
            style={{ animation: "slideUp 0.3s ease-out" }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold uppercase tracking-tight">Record Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="h-8 w-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all font-bold"
              >
                <FaTimes />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Payment Mode</label>
                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="paymentMode" value="NEFT" checked={paymentMode === "NEFT"} onChange={(e) => setPaymentMode(e.target.value)} className="peer sr-only" />
                    <div className="text-center p-3 rounded-xl border-2 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 text-slate-500 font-bold transition-all">Bank / NEFT</div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="paymentMode" value="CASH" checked={paymentMode === "CASH"} onChange={(e) => setPaymentMode(e.target.value)} className="peer sr-only" />
                    <div className="text-center p-3 rounded-xl border-2 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 text-slate-500 font-bold transition-all">CASH</div>
                  </label>
                </div>
              </div>
              
              {paymentMode === "NEFT" ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Transaction ID / Ref No.</label>
                  <input 
                    type="text" 
                    value={transactionId} 
                    onChange={(e) => setTransactionId(e.target.value)} 
                    placeholder="e.g. UTR123456789" 
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-800" 
                  />
                  <p className="text-xs text-slate-400 mt-2">Minimum 5 characters required.</p>
                </div>
              ) : (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-sm font-medium flex items-center gap-2">
                  <FaCheckCircle className="text-orange-500" />
                  Cash payment will be recorded automatically without a transaction ID.
                </div>
              )}
              
              <div className="pt-4 flex justify-end gap-3">
                <button onClick={() => setShowPaymentModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">Cancel</button>
                <button onClick={submitPayment} disabled={paymentLoading} className="px-6 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2">
                  {paymentLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Confirm Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Add inline styles for animations */}
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
