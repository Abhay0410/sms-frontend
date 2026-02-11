import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../../../services/api";
import { 
  FaSync, FaCircle, FaChevronLeft, FaChevronRight, 
  FaSearch, FaFilter, FaEye, FaPrint, FaDownload,
  FaUserCircle, FaCalendarAlt, FaUsers
} from "react-icons/fa";
import { toast } from "react-toastify";

export default function StaffAttendanceGrid() {
  const [data, setData] = useState({ matrix: [], daysInMonth: 30, summary: {} });
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Fetch attendance matrix
  const fetchMatrix = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/payroll/matrix?month=${month}&year=${year}`);
      const result = res.data || res;
      setData({
        matrix: result.matrix || [],
        daysInMonth: result.daysInMonth || 30,
        summary: result.summary || {}
      });
    } catch (err) {
      console.error("Matrix Load Error:", err);
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix]);

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return 'bg-gradient-to-br from-emerald-500 to-green-600 text-white';
      case 'ABSENT': return 'bg-gradient-to-br from-rose-500 to-red-600 text-white';
      case 'HALF_DAY': return 'bg-gradient-to-br from-orange-500 to-amber-600 text-white';
      case 'LATE': return 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white';
      case 'LEAVE': return 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white';
      case 'HOLIDAY': return 'bg-gradient-to-br from-purple-500 to-pink-600 text-white';
      default: return 'bg-slate-100 text-slate-400';
    }
  };

  // Filter and paginate data
  const filteredData = useMemo(() => {
    return data.matrix.filter(employee => {
      const matchesSearch = employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.displayID?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || 
                           (employee.attendance && Object.values(employee.attendance).includes(statusFilter));
      return matchesSearch && matchesStatus;
    });
  }, [data.matrix, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // View employee details
  const viewEmployeeDetails = (employee) => {
    setSelectedEmployee(employee);
  };

  // Export functions
  const exportToCSV = () => {
    toast.info("Export feature coming soon!");
  };

  const printReport = () => {
    window.print();
  };

  // Get attendance summary for employee
  const getEmployeeSummary = (employee) => {
    const attendance = employee.attendance || {};
    const values = Object.values(attendance);
    return {
      present: values.filter(v => v === 'PRESENT').length,
      absent: values.filter(v => v === 'ABSENT').length,
      halfDay: values.filter(v => v === 'HALF_DAY').length,
      late: values.filter(v => v === 'LATE').length,
      leave: values.filter(v => v === 'LEAVE').length,
      total: values.length
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Staff Attendance Matrix
          </h1>
          <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
            <FaCalendarAlt className="text-orange-500" />
            Monthly overview for {monthNames[month-1]} {year}
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-3 rounded-xl">
                <FaUsers className="text-white text-xl" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Staff</p>
                <p className="text-2xl font-bold text-slate-900">{data.matrix.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl">
                <FaCalendarAlt className="text-white text-xl" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Working Days</p>
                <p className="text-2xl font-bold text-slate-900">{data.daysInMonth}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-3 rounded-xl">
                <FaUserCircle className="text-white text-xl" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Present Today</p>
                <p className="text-2xl font-bold text-slate-900">
                  {data.matrix.filter(e => e.attendance?.[new Date().getDate()] === 'PRESENT').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-rose-500 to-red-500 p-3 rounded-xl">
                <FaUserCircle className="text-white text-xl" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Absent Today</p>
                <p className="text-2xl font-bold text-slate-900">
                  {data.matrix.filter(e => e.attendance?.[new Date().getDate()] === 'ABSENT').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search and Filters */}
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search staff by name or ID..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-5 py-3 rounded-xl border flex items-center gap-2 transition-all ${
                    showFilters
                      ? 'bg-orange-50 border-orange-300 text-orange-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FaFilter /> Filters
                </button>

                <button
                  onClick={exportToCSV}
                  className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-all"
                >
                  <FaDownload /> Export
                </button>

                <button
                  onClick={printReport}
                  className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-all"
                >
                  <FaPrint /> Print
                </button>

                <div className="flex items-center gap-3">
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  >
                    {monthNames.map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>

                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  >
                    {[2023, 2024, 2025, 2026, 2027].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>

                  <button
                    onClick={fetchMatrix}
                    disabled={loading}
                    className="p-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    <FaSync className={loading ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-orange-50 rounded-xl border border-slate-200 animate-slideDown">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status Filter</label>
                    <select
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-orange-500"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="ALL">All Status</option>
                      <option value="PRESENT">Present Only</option>
                      <option value="ABSENT">Absent Only</option>
                      <option value="HALF_DAY">Half Day Only</option>
                      <option value="LATE">Late Only</option>
                      <option value="LEAVE">Leave Only</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setStatusFilter("ALL");
                        setSearchTerm("");
                        setCurrentPage(1);
                      }}
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Matrix Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                  <th className="p-5 sticky left-0 bg-slate-900 z-20 min-w-[220px] font-bold uppercase tracking-widest text-sm">
                    Staff Member
                  </th>
                  {[...Array(data.daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const isToday = day === new Date().getDate() && 
                                    month === new Date().getMonth() + 1 && 
                                    year === new Date().getFullYear();
                    return (
                      <th 
                        key={i} 
                        className={`p-2 text-center border-l border-slate-700 text-xs font-bold min-w-[40px] ${
                          isToday ? 'bg-orange-500/20' : ''
                        }`}
                        title={isToday ? "Today" : ""}
                      >
                        <div className="flex flex-col items-center">
                          <span>{day}</span>
                          <span className="text-[9px] text-slate-300">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(year, month-1, day).getDay()]}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                  <th className="p-2 text-center border-l border-slate-700 text-xs font-bold min-w-[80px]">
                    Summary
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={data.daysInMonth + 2} className="p-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mb-4"></div>
                        <p className="text-slate-600 font-medium">Loading attendance data...</p>
                        <p className="text-sm text-slate-400 mt-1">Fetching records for {monthNames[month-1]} {year}</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={data.daysInMonth + 2} className="p-16 text-center">
                      <FaUserCircle className="text-5xl text-slate-200 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-700 mb-2">No staff members found</h3>
                      <p className="text-slate-500">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row) => {
                    const summary = getEmployeeSummary(row);
                    return (
                      <tr key={row._id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="p-4 sticky left-0 bg-white z-10 shadow-[4px_0_8px_rgba(0,0,0,0.03)] border-r border-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                              {row.name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{row.name}</p>
                              <p className="text-xs text-slate-500 font-medium">{row.designation}</p>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">{row.displayID}</p>
                            </div>
                            <button
                              onClick={() => viewEmployeeDetails(row)}
                              className="ml-auto text-slate-400 hover:text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                          </div>
                        </td>
                        
                        {[...Array(data.daysInMonth)].map((_, i) => {
                          const day = i + 1;
                          const status = row.attendance?.[day];
                          const isToday = day === new Date().getDate() && 
                                          month === new Date().getMonth() + 1 && 
                                          year === new Date().getFullYear();
                          return (
                            <td 
                              key={i} 
                              className={`p-2 text-center border-l border-slate-50 h-12 ${isToday ? 'bg-orange-50' : ''}`}
                            >
                              {status ? (
                                <div className="relative">
                                  <div 
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all ${getStatusColor(status)} font-bold text-xs`}
                                    title={`${status} - ${day} ${monthNames[month-1]}`}
                                  >
                                    {status.charAt(0)}
                                  </div>
                                  {isToday && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-200">-</span>
                              )}
                            </td>
                          );
                        })}
                        
                        <td className="p-2 text-center border-l border-slate-50">
                          <div className="flex flex-col gap-1 items-center">
                            <span className="text-xs font-bold text-emerald-600">{summary.present}</span>
                            <span className="text-xs font-bold text-rose-600">{summary.absent}</span>
                            <span className="text-xs text-slate-500">
                              {summary.total}/{data.daysInMonth}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && filteredData.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-slate-500 font-medium">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} staff members
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <FaChevronLeft />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === i + 1
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-orange-50 rounded-2xl border border-slate-200">
          <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <FaCircle className="text-slate-400" /> Legend
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600"></div>
              <div>
                <p className="text-sm font-medium text-slate-700">Present (P)</p>
                <p className="text-xs text-slate-500">Full day attendance</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-500 to-red-600"></div>
              <div>
                <p className="text-sm font-medium text-slate-700">Absent (A)</p>
                <p className="text-xs text-slate-500">No attendance</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-600"></div>
              <div>
                <p className="text-sm font-medium text-slate-700">Half Day (H)</p>
                <p className="text-xs text-slate-500">Partial attendance</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600"></div>
              <div>
                <p className="text-sm font-medium text-slate-700">Late (L)</p>
                <p className="text-xs text-slate-500">Late arrival</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600"></div>
              <div>
                <p className="text-sm font-medium text-slate-700">Leave (V)</p>
                <p className="text-xs text-slate-500">Approved leave</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
              <div className="w-3 h-3 rounded-full bg-slate-200"></div>
              <div>
                <p className="text-sm font-medium text-slate-700">No Record (-)</p>
                <p className="text-xs text-slate-500">Not marked</p>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Employee Details Modal */}
        {selectedEmployee && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl">
              <div className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white flex justify-between items-center rounded-t-2xl">
                <div>
                  <h3 className="text-xl font-bold">Attendance Details</h3>
                  <p className="text-slate-300 text-sm">{selectedEmployee.name}</p>
                </div>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20"
                >
                  <FaCircle className="text-white text-lg" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500">Designation</p>
                    <p className="font-semibold text-slate-800">{selectedEmployee.designation || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500">Employee ID</p>
                    <p className="font-semibold text-slate-800">{selectedEmployee.displayID}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-700">Monthly Summary</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(getEmployeeSummary(selectedEmployee)).map(([key, value]) => (
                      <div key={key} className="text-center p-3 bg-white border border-slate-100 rounded-lg">
                        <p className="text-2xl font-bold text-slate-800">{value}</p>
                        <p className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}