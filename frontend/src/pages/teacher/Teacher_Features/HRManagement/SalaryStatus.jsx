import React, { useEffect, useState } from "react";
import api, { getBaseURL } from "../../../../services/api";
import { FaMoneyCheckAlt, FaDownload, FaHistory, FaEye, FaPrint, FaFilePdf, FaCalendarAlt, FaRupeeSign, FaChartLine, FaFilter } from "react-icons/fa";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import { toast } from "react-toastify";

export default function SalaryStatus() {
  const [salaries, setSalaries] = useState([]);
  const [filteredSalaries, setFilteredSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);

  // Month names for professional display
  const monthNames = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUNE",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];

  useEffect(() => {
    const fetchSalary = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.TEACHER.MY_HR.MY_PAYROLL);
        const salaryData = response.data || [];
        setSalaries(salaryData);
        setFilteredSalaries(salaryData);
        
        // Calculate statistics
        calculateStatistics(salaryData);
      } catch  {
        toast.error("Failed to load earnings history");
      } finally {
        setLoading(false);
      }
    };
    fetchSalary();
  }, []);

  // Filter salaries based on selected year and status
  useEffect(() => {
    let filtered = salaries.filter(item => item.year === selectedYear);
    
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(item => item.paymentStatus === statusFilter);
    }
    
    setFilteredSalaries(filtered);
  }, [selectedYear, statusFilter, salaries]);

  const [stats, setStats] = useState({
    totalEarned: 0,
    averageSalary: 0,
    paidCount: 0,
    pendingCount: 0
  });

  const calculateStatistics = (data) => {
    const totalEarned = data.reduce((sum, item) => sum + (item.netSalary || 0), 0);
    const averageSalary = data.length > 0 ? totalEarned / data.length : 0;
    const paidCount = data.filter(item => item.paymentStatus === 'PAID').length;
    const pendingCount = data.filter(item => item.paymentStatus === 'PENDING' || item.paymentStatus === 'PROCESSED').length;
    
    setStats({
      totalEarned,
      averageSalary,
      paidCount,
      pendingCount
    });
  };

  const handleDownload = async (slipId, event) => {
    if (event) event.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const baseURL = getBaseURL();
      const downloadUrl = `${baseURL}${API_ENDPOINTS.ADMIN.PAYROLL.DOWNLOAD_SLIP(slipId)}?token=${token}`;
      
      toast.info("Downloading salary slip...");
      window.open(downloadUrl, '_blank');
    } catch (error) { // eslint-disable-line no-unused-vars
      toast.error("Failed to download slip");
    }
  };

  const handleViewDetails = (slip) => {
    setSelectedSlip(slip);
    setShowDetails(true);
  };

  const handlePrint = () => { // Removed unused slipId
    const printWindow = window.open('', '_blank');
    const content = `
      <html>
        <head>
          <title>Salary Slip - ${selectedSlip?.month || 'N/A'}/${selectedSlip?.year || 'N/A'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; }
            .header { text-align: center; border-bottom: 3px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            .total { font-weight: bold; font-size: 1.2em; background: #f8fafc; }
            .footer { margin-top: 40px; text-align: center; font-size: 0.9em; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Salary Slip</h1>
            <p>${monthNames[selectedSlip?.month - 1] || ''} ${selectedSlip?.year || ''}</p>
          </div>
          <div class="section">
            <p><strong>Net Salary:</strong> ₹${selectedSlip?.netSalary?.toLocaleString('en-IN') || 0}</p>
            <p><strong>Status:</strong> ${selectedSlip?.paymentStatus || 'PENDING'}</p>
          </div>
          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PAID': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PROCESSED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-slate-200 rounded-3xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-24 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
          {[1,2,3].map(i => (
            <div key={i} className="h-40 bg-slate-200 rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-black mb-2">My Earnings</h1>
                <p className="text-indigo-200 text-lg">Track your salary history and downloads</p>
              </div>
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <FaMoneyCheckAlt className="text-3xl" />
                <div>
                  <p className="text-sm opacity-90">Total Earned</p>
                  <p className="text-2xl font-black">₹{Math.round(stats.totalEarned).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10">
            <FaMoneyCheckAlt size={180} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <FaRupeeSign className="text-emerald-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Average Salary</p>
                <p className="text-2xl font-black text-slate-800">₹{Math.round(stats.averageSalary).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <FaCalendarAlt className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Slips</p>
                <p className="text-2xl font-black text-slate-800">{salaries.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <FaChartLine className="text-emerald-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Paid</p>
                <p className="text-2xl font-black text-slate-800">{stats.paidCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-xl">
                <FaFilter className="text-amber-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Pending</p>
                <p className="text-2xl font-black text-slate-800">{stats.pendingCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <FaFilter className="text-slate-400" />
              <h3 className="font-bold text-slate-700">Filter Records</h3>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600 font-medium">Year:</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 font-medium text-slate-700"
                >
                  {[...new Set(salaries.map(s => s.year))].sort((a,b) => b-a).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                  {salaries.length === 0 && <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600 font-medium">Status:</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 font-medium text-slate-700"
                >
                  <option value="ALL">All Status</option>
                  <option value="PAID">Paid</option>
                  <option value="PROCESSED">Processed</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Slips List */}
        <div className="space-y-6">
          {filteredSalaries.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200 shadow-sm">
              <FaHistory className="mx-auto text-slate-300 text-5xl mb-6" />
              <h3 className="text-2xl font-bold text-slate-400 mb-2">No Records Found</h3>
              <p className="text-slate-400">No salary slips available for the selected filters</p>
            </div>
          ) : (
            filteredSalaries.map((item) => ( // Removed unused index
              <div 
                key={item._id} 
                className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => handleViewDetails(item)}
              >
                <div className="p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    {/* Date Section */}
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-indigo-50 text-indigo-600 rounded-2xl p-5 text-center min-w-[100px] border border-indigo-100">
                          <span className="text-xs font-black uppercase block mb-1">{monthNames[item.month - 1]?.slice(0, 3) || '---'}</span>
                          <span className="text-3xl font-black block leading-tight">{item.year}</span>
                        </div>
                      </div>
                      <div>
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3 border ${getStatusColor(item.paymentStatus)}`}>
                          <div className={`w-2 h-2 rounded-full ${
                            item.paymentStatus === 'PAID' ? 'bg-emerald-500' :
                            item.paymentStatus === 'PROCESSED' ? 'bg-blue-500' : 'bg-amber-500'
                          }`}></div>
                          <span className="text-xs font-bold uppercase tracking-widest">{item.paymentStatus}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">₹{Math.round(item.netSalary || 0).toLocaleString('en-IN')}</h3>
                        <p className="text-sm text-slate-500 mt-1">Net take-home salary</p>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                      <div className="text-center">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Gross Salary</p>
                        <p className="font-bold text-slate-700">₹{Math.round(item.grossSalary || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Deductions</p>
                        <p className="font-bold text-rose-600">-₹{Math.round(
                          (item.deductions?.epfEmployee || 0) + 
                          (item.deductions?.professionalTax || 0) + 
                          (item.deductions?.tds || 0)
                        ).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Paid Date</p>
                        <p className="font-bold text-slate-700">
                          {item.paymentDate ? new Date(item.paymentDate).toLocaleDateString('en-IN') : '--/--/----'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item._id, e);
                        }}
                        className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
                      >
                        <FaDownload /> PDF
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSlip(item);
                          setShowDetails(true);
                        }}
                        className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
                      >
                        <FaEye /> Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {filteredSalaries.length > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl text-white">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h3 className="text-xl font-bold mb-2">Period Summary</h3>
                <p className="text-slate-300">{filteredSalaries.length} salary slips • {monthNames[selectedSlip?.month - 1] || 'Selected Period'} {selectedYear}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-300 text-sm">Total for period</p>
                <p className="text-3xl font-black">₹{filteredSalaries.reduce((sum, item) => sum + (item.netSalary || 0), 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedSlip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">Salary Slip Details</h3>
                <p className="text-indigo-200">{monthNames[selectedSlip.month - 1]} {selectedSlip.year}</p>
              </div>
              <button 
                onClick={() => setShowDetails(false)}
                className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-sm text-slate-500 font-medium mb-1">Net Salary</p>
                  <p className="text-2xl font-bold text-indigo-600">₹{Math.round(selectedSlip.netSalary || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-sm text-slate-500 font-medium mb-1">Status</p>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(selectedSlip.paymentStatus)}`}>
                    {selectedSlip.paymentStatus}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700 border-b pb-2">Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Gross Salary</span>
                    <span className="font-bold">₹{Math.round(selectedSlip.grossSalary || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Total Deductions</span>
                    <span className="font-bold">-₹{Math.round(
                      (selectedSlip.deductions?.epfEmployee || 0) + 
                      (selectedSlip.deductions?.professionalTax || 0) + 
                      (selectedSlip.deductions?.tds || 0)
                    ).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={(e) => handleDownload(selectedSlip._id, e)}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <FaFilePdf /> Download PDF
                </button>
                <button 
                  onClick={() => handlePrint(selectedSlip._id)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <FaPrint /> Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
