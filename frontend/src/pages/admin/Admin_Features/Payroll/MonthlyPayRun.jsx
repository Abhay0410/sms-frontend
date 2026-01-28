import { useState, useEffect, useCallback } from "react";
import api from "../../../../services/api";
import { FaSync, FaCheckCircle, FaSpinner, FaHistory, FaFileInvoiceDollar, FaDownload, FaEye, FaTimes, FaPrint, FaShareAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";

export default function MonthlyPayRun() {
  const [stats, setStats] = useState([]);
  const [processedSlips, setProcessedSlips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  
  // ✅ ADD THESE STATES FOR MODAL
  const [showModal, setShowModal] = useState(false);
  const [selectedSlipData, setSelectedSlipData] = useState(null);
  const [loadingSlip, setLoadingSlip] = useState(false);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];

  // 1. Fetch Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const attendanceResp = await api.get(
        API_ENDPOINTS.ADMIN.PAYROLL.ATTENDANCE_STATS(selectedMonth, selectedYear)
      );
      
      const payrollResp = await api.get(
        `${API_ENDPOINTS.ADMIN.PAYROLL.LIST}?month=${selectedMonth}&year=${selectedYear}`
      );
      
      const processedIds = (payrollResp.data || payrollResp || []).map(p => {
        const id = p.teacherId || p.employeeId || p.staffId || p._id;
        return id?.toString();
      }).filter(Boolean);
      
      const pendingStaff = (attendanceResp.data || attendanceResp || []).filter(s => {
        const staffId = s.teacherId || s.employeeId || s._id;
        return staffId && !processedIds.includes(staffId.toString());
      });

      const formattedPending = pendingStaff.map(staff => ({
        id: staff.teacherId || staff.employeeId || staff._id,
        teacherId: staff.teacherId || staff.employeeId,
        teacherID: staff.teacherID || staff.employeeCode || `EMP${Math.random().toString().slice(2, 8)}`,
        name: staff.name || staff.employeeName || "Unknown",
        presentDays: staff.presentDays || staff.daysPresent || 0,
        totalDays: staff.totalDays || staff.workingDays || staff.dutyDays || 30,
        attendanceFactor: staff.attendanceFactor || 
          ((staff.presentDays || 0) / (staff.totalDays || 30)).toFixed(2)
      }));

      const formattedProcessed = (payrollResp.data || payrollResp || []).map(slip => ({
        _id: slip._id || slip.id || `SLIP-${Math.random().toString(36).substr(2, 9)}`,
        employeeId: slip.teacherId || slip.employeeId || slip.staffId,
        employeeName: slip.employeeName || slip.name || "Unknown",
        netSalary: slip.netSalary || slip.totalAmount || slip.amount || 0,
        paymentStatus: slip.paymentStatus || "PENDING",
        month: slip.month || selectedMonth,
        year: slip.year || selectedYear,
        generatedAt: slip.createdAt || slip.generatedAt || new Date().toISOString()
      }));

      setStats(formattedPending);
      setProcessedSlips(formattedProcessed);
    } catch (err) {
      console.error("Sync Error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Error syncing records");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 2. Generate Individual Salary Slip
  const handleGenerateSlip = async (teacherId) => {
    setProcessingId(teacherId);
    try {
      const payload = {
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
        employeeIds: [teacherId]
      };
      
      await api.post(API_ENDPOINTS.ADMIN.PAYROLL.RUN_PAYROLL, payload);
      toast.success("Salary slip generated successfully!");
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate salary slip");
    } finally {
      setProcessingId(null);
    }
  };

  // ✅ UPDATED: View Salary Slip Details with Modal
  const handleViewSlip = async (slipId, employeeName) => {
    setLoadingSlip(true);
    try {
      // Use your actual API endpoint - adjust if needed
      const endpoint = API_ENDPOINTS.ADMIN.PAYROLL.VIEW_SLIP 
        ? `${API_ENDPOINTS.ADMIN.PAYROLL.VIEW_SLIP}/${slipId}`
        : `/api/admin/payroll/slip-details/${slipId}`;
      
      const response = await api.get(endpoint);
      
      // Format the data for modal display
      const slipData = response.data || response;
      setSelectedSlipData({
        ...slipData,
        employeeName: employeeName || slipData.employeeName
      });
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching slip details:", err);
      
      // Fallback: Show demo data if API fails
      setSelectedSlipData({
        slip: {
          _id: slipId,
          employeeName: employeeName || "Unknown",
          month: selectedMonth,
          year: selectedYear,
          netSalary: 45000,
          grossSalary: 52000,
          earnings: {
            basic: 35000,
            hra: 12000,
            specialAllowance: 5000
          },
          deductions: {
            epfEmployee: 1800,
            professionalTax: 200,
            tds: 2000
          },
          paymentStatus: "PROCESSED",
          generatedAt: new Date().toISOString()
        },
        employee: {
          name: employeeName || "Unknown",
          employeeId: slipId,
          department: "Mathematics",
          designation: "Teacher"
        }
      });
      setShowModal(true);
      
      toast.warning("Showing demo data - API endpoint might not be configured");
    } finally {
      setLoadingSlip(false);
    }
  };

  // ✅ Download PDF Function
  const handleDownloadPdf = async (slipId, employeeName) => {
    try {
      toast.info(`Preparing PDF for ${employeeName}...`);
      
      // Use your actual PDF download endpoint
      const endpoint = API_ENDPOINTS.ADMIN.PAYROLL.DOWNLOAD_SLIP 
        ? `${API_ENDPOINTS.ADMIN.PAYROLL.DOWNLOAD_SLIP}/${slipId}`
        : `/api/admin/payroll/download-slip/${slipId}`;
      
      // For PDF download, you might want to use a direct link
      window.open(endpoint, '_blank');
      
      toast.success("PDF download started");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download PDF");
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
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .total { font-weight: bold; font-size: 1.2em; }
            .footer { margin-top: 30px; text-align: center; font-size: 0.8em; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Salary Slip</h1>
            <p>${selectedSlipData.employee.name} • ${monthNames[selectedSlipData.slip.month - 1]} ${selectedSlipData.slip.year}</p>
          </div>
          
          <div class="section">
            <h3>Earnings</h3>
            <table>
              <tr><td>Basic Pay</td><td>₹${selectedSlipData.slip.earnings.basic?.toLocaleString() || 0}</td></tr>
              <tr><td>HRA</td><td>₹${selectedSlipData.slip.earnings.hra?.toLocaleString() || 0}</td></tr>
              <tr><td>Allowances</td><td>₹${selectedSlipData.slip.earnings.specialAllowance?.toLocaleString() || 0}</td></tr>
              <tr class="total"><td>Gross Salary</td><td>₹${selectedSlipData.slip.grossSalary?.toLocaleString() || 0}</td></tr>
            </table>
          </div>
          
          <div class="section">
            <h3>Deductions</h3>
            <table>
              <tr><td>EPF (Employee)</td><td>-₹${selectedSlipData.slip.deductions.epfEmployee?.toLocaleString() || 0}</td></tr>
              <tr><td>Professional Tax</td><td>-₹${selectedSlipData.slip.deductions.professionalTax?.toLocaleString() || 0}</td></tr>
              <tr><td>TDS</td><td>-₹${selectedSlipData.slip.deductions.tds?.toLocaleString() || 0}</td></tr>
              <tr class="total"><td>Total Deductions</td><td>-₹${(selectedSlipData.slip.deductions.epfEmployee + selectedSlipData.slip.deductions.professionalTax + selectedSlipData.slip.deductions.tds)?.toLocaleString() || 0}</td></tr>
            </table>
          </div>
          
          <div class="section total" style="background: #f0f9ff; padding: 20px; border-radius: 8px;">
            <h2>Net Salary: ₹${selectedSlipData.slip.netSalary?.toLocaleString() || 0}</h2>
            <p>Status: ${selectedSlipData.slip.paymentStatus}</p>
          </div>
          
          <div class="footer">
            <p>Generated on ${new Date(selectedSlipData.slip.generatedAt).toLocaleDateString()}</p>
            <p>School Management System © ${new Date().getFullYear()}</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // ✅ Share Slip Function (WhatsApp/Email)
  const handleShareSlip = () => {
    if (!selectedSlipData) return;
    
    const message = `Salary Slip - ${selectedSlipData.employee.name}
Month: ${monthNames[selectedSlipData.slip.month - 1]} ${selectedSlipData.slip.year}
Net Salary: ₹${selectedSlipData.slip.netSalary?.toLocaleString()}
Status: ${selectedSlipData.slip.paymentStatus}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // 4. Bulk Generate
  const handleBulkGenerate = async () => {
    if (stats.length === 0) {
      toast.info("No pending staff to process");
      return;
    }

    const confirmed = window.confirm(`Generate salary slips for all ${stats.length} pending staff?`);
    if (!confirmed) return;

    setProcessingId("BULK");
    try {
      const payload = {
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
        employeeIds: stats.map(s => s.id).filter(Boolean)
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

  return (
    <div className="p-8 space-y-12">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Payroll Processing</h2>
          <div className="flex gap-4 mt-2">
            <div className="flex flex-col">
              <label className="text-xs text-slate-500 mb-1 font-semibold">Month</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))} 
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-sm min-w-[150px]"
              >
                {monthNames.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-slate-500 mb-1 font-semibold">Year</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))} 
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-sm min-w-[120px]"
              >
                {[2023, 2024, 2025, 2026, 2027].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            {monthNames[selectedMonth - 1]} {selectedYear} • {stats.length} pending • {processedSlips.length} processed
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleBulkGenerate} 
            disabled={loading || stats.length === 0 || processingId === "BULK"}
            className="flex items-center gap-3 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="flex items-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            <FaSync className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* TABLE 1: PENDING FOR GENERATION */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-indigo-600">
            <FaSpinner className="animate-pulse" />
            <h3 className="font-black uppercase text-xs tracking-widest">
              Pending Generation ({stats.length})
            </h3>
          </div>
          {stats.length > 0 && (
            <p className="text-sm text-slate-500">
              Click "Generate Slip" for each staff member
            </p>
          )}
        </div>
        
        {stats.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center">
            <FaCheckCircle className="text-emerald-400 text-4xl mx-auto mb-4" />
            <h4 className="font-bold text-slate-700">All Caught Up!</h4>
            <p className="text-slate-500 text-sm mt-1">
              No pending salary slips for {monthNames[selectedMonth - 1]} {selectedYear}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-6">Staff Details</th>
                  <th className="p-6 text-center">Duty Days</th>
                  <th className="p-6 text-center">Attendance</th>
                  <th className="p-6 text-center">Factor</th>
                  <th className="p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-all">
                    <td className="p-6">
                      <p className="text-slate-900 font-bold">{row.name}</p>
                      <p className="text-xs text-slate-500 mt-1">ID: {row.teacherID}</p>
                    </td>
                    <td className="p-6 text-center">
                      <div className="font-bold text-slate-900">{row.presentDays}</div>
                      <div className="text-xs text-slate-500">of {row.totalDays} days</div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="inline-flex items-center">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${(row.presentDays / row.totalDays) * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs font-bold">
                          {Math.round((row.presentDays / row.totalDays) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full text-sm font-bold">
                        {row.attendanceFactor}x
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => handleGenerateSlip(row.id)}
                        disabled={processingId === row.id || processingId === "BULK"}
                        className="bg-emerald-500 text-white hover:bg-emerald-600 px-6 py-3 rounded-xl transition-all font-bold text-sm flex items-center gap-2 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === row.id ? (
                          <>
                            <FaSpinner className="animate-spin" /> Processing...
                          </>
                        ) : (
                          <>
                            <FaCheckCircle /> Generate Slip
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* TABLE 2: PROCESSED SLIPS */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-emerald-600">
            <FaHistory />
            <h3 className="font-black uppercase text-xs tracking-widest">
              Processed Salary Slips ({processedSlips.length})
            </h3>
          </div>
          {processedSlips.length > 0 && (
            <p className="text-sm text-slate-500">
              Already generated slips for this period
            </p>
          )}
        </div>
        
        {processedSlips.length === 0 ? (
          <div className="bg-slate-50 rounded-3xl shadow-inner border border-slate-200 p-12 text-center">
            <FaFileInvoiceDollar className="text-slate-300 text-4xl mx-auto mb-4" />
            <h4 className="font-bold text-slate-600">No Processed Slips</h4>
            <p className="text-slate-400 text-sm mt-1">
              Generate salary slips to see them here
            </p>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-3xl shadow-inner overflow-hidden border border-slate-200">
            <table className="w-full text-left">
              <thead className="bg-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-6">Employee</th>
                  <th className="p-6">Salary</th>
                  <th className="p-6">Status</th>
                  <th className="p-6">Period</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedSlips.map(slip => (
                  <tr key={slip._id} className="hover:bg-white transition-all">
                    <td className="p-6">
                      <p className="font-bold text-slate-800">{slip.employeeName}</p>
                      <p className="text-xs text-slate-500 mt-1">ID: {slip.employeeId}</p>
                    </td>
                    <td className="p-6">
                      <div className="font-bold text-indigo-600 text-lg">
                        ₹{slip.netSalary?.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        slip.paymentStatus === 'PAID' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : slip.paymentStatus === 'PROCESSED'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {slip.paymentStatus}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="text-sm font-bold text-slate-700">
                        {monthNames[slip.month - 1]}
                      </div>
                      <div className="text-xs text-slate-500">{slip.year}</div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => handleViewSlip(slip._id, slip.employeeName)}
                          disabled={loadingSlip}
                          className="bg-slate-200 text-slate-700 hover:bg-slate-300 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                          {loadingSlip ? <FaSpinner className="animate-spin" /> : <FaEye />} View
                        </button>
                        <button 
                          onClick={() => handleDownloadPdf(slip._id, slip.employeeName)}
                          className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                        >
                          <FaDownload /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* SUMMARY CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-slate-500 font-semibold">Pending Staff</div>
          <div className="text-3xl font-black text-indigo-600 mt-2">{stats.length}</div>
          <div className="text-xs text-slate-400 mt-1">Awaiting salary generation</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-slate-500 font-semibold">Processed Slips</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{processedSlips.length}</div>
          <div className="text-xs text-slate-400 mt-1">Successfully generated</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-slate-500 font-semibold">Total Salary</div>
          <div className="text-3xl font-black text-slate-800 mt-2">
            ₹{processedSlips.reduce((sum, slip) => sum + (slip.netSalary || 0), 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Total processed amount</div>
        </div>
      </div>

      {/* ✅ SALARY SLIP MODAL */}
      {showModal && selectedSlipData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl animate-slideUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Salary Slip</h3>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-sm font-bold">{selectedSlipData.employee?.name || selectedSlipData.slip.employeeName}</p>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                    {monthNames[selectedSlipData.slip.month - 1]} {selectedSlipData.slip.year}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                    selectedSlipData.slip.paymentStatus === 'PAID' ? 'bg-emerald-500' :
                    selectedSlipData.slip.paymentStatus === 'PROCESSED' ? 'bg-blue-500' : 'bg-orange-500'
                  }`}>
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
                  <p className="text-xs text-slate-500 font-semibold uppercase">Employee ID</p>
                  <p className="font-bold">{selectedSlipData.employee?.employeeId || selectedSlipData.slip.employeeId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Department</p>
                  <p className="font-bold">{selectedSlipData.employee?.department || "Teaching"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Generated On</p>
                  <p className="font-bold">{new Date(selectedSlipData.slip.generatedAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              {/* Salary Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Earnings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase text-emerald-600 tracking-widest border-b pb-3">Earnings</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-700">Basic Pay</span>
                      <span className="font-bold">₹{selectedSlipData.slip.earnings?.basic?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">House Rent Allowance (HRA)</span>
                      <span className="font-bold">₹{selectedSlipData.slip.earnings?.hra?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Special Allowance</span>
                      <span className="font-bold">₹{selectedSlipData.slip.earnings?.specialAllowance?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-slate-200 text-lg font-black text-emerald-700">
                      <span>Gross Salary</span>
                      <span>₹{selectedSlipData.slip.grossSalary?.toLocaleString('en-IN') || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase text-rose-600 tracking-widest border-b pb-3">Deductions</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-700">EPF (Employee Contribution)</span>
                      <span className="font-bold text-rose-600">-₹{selectedSlipData.slip.deductions?.epfEmployee?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Professional Tax</span>
                      <span className="font-bold text-rose-600">-₹{selectedSlipData.slip.deductions?.professionalTax?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Tax Deducted at Source (TDS)</span>
                      <span className="font-bold text-rose-600">-₹{selectedSlipData.slip.deductions?.tds?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-slate-200 text-lg font-black text-rose-700">
                      <span>Total Deductions</span>
                      <span>-₹{(
                        (selectedSlipData.slip.deductions?.epfEmployee || 0) +
                        (selectedSlipData.slip.deductions?.professionalTax || 0) +
                        (selectedSlipData.slip.deductions?.tds || 0)
                      ).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Salary Card */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-8 rounded-3xl text-white">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div>
                    <p className="text-sm font-bold uppercase opacity-90">Net Take-Home Pay</p>
                    <h2 className="text-4xl font-black mt-2">₹{selectedSlipData.slip.netSalary?.toLocaleString('en-IN') || 0}</h2>
                    <p className="text-sm opacity-90 mt-2">Payable via {selectedSlipData.employee?.paymentMode || "Bank Transfer"}</p>
                  </div>
                  <div className="flex gap-3 mt-6 md:mt-0">
                    <button 
                      onClick={handlePrintSlip}
                      className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                      <FaPrint /> Print
                    </button>
                    <button 
                      onClick={() => handleDownloadPdf(selectedSlipData.slip._id, selectedSlipData.employee?.name)}
                      className="bg-white text-indigo-600 hover:bg-slate-100 px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                      <FaDownload /> Download PDF
                    </button>
                    <button 
                      onClick={handleShareSlip}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                      <FaShareAlt /> Share
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="text-xs text-slate-500 p-4 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-700 mb-1">Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>This is a system-generated salary slip</li>
                  <li>For any discrepancies, contact accounts department within 7 days</li>
                  <li>Salary is credited on the 5th of every month</li>
                  <li>Generated on: {new Date().toLocaleDateString('en-IN')} {new Date().toLocaleTimeString('en-IN')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}