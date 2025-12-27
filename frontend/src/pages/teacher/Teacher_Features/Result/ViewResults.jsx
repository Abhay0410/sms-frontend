import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // ✅ UNCOMMENT THIS
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../../services/api";
import BackButton from "../../../../components/BackButton";
import { FaEye, FaDownload, FaPrint, FaSpinner, FaFilter, FaSearch, FaCheckCircle, FaTimesCircle, FaTimes, FaEdit } from "react-icons/fa"; // ✅ ADD FaEdit

export default function ViewResults() {
  const navigate = useNavigate(); // ✅ UNCOMMENT THIS
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({ examType: "", search: "" });

  useEffect(() => { loadResults(); }, []);

  const applyFilters = useCallback(() => {
  let filtered = [...results];
  if (filters.examType) {
    filtered = filtered.filter(r => r.examType === filters.examType);
  }
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(r => 
      r.studentName?.toLowerCase().includes(search) || 
      r.studentID?.toLowerCase().includes(search) || 
      r.rollNumber?.toString().includes(search) ||
      // Also check student object if studentName is not directly on result
      r.student?.name?.toLowerCase().includes(search) ||
      r.student?.studentID?.toLowerCase().includes(search)
    );
  }
  setFilteredResults(filtered);
}, [filters, results]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

 const loadResults = async () => {
  try {
    setLoading(true);
    console.log("🔍 Loading results from:", API_ENDPOINTS.TEACHER.RESULT.MY_RESULTS);
    const resp = await api.get(API_ENDPOINTS.TEACHER.RESULT.MY_RESULTS);
    console.log("📊 API Response:", resp);
    console.log("📋 Results data:", resp?.data?.results || []);
    
    // ✅ FIX: Access resp.data.results instead of resp.results
    setResults(resp?.data?.results || []);
  } catch (error) {
    console.error("❌ Error loading results:", error);
    toast.error("Failed to load results");
  } finally {
    setLoading(false);
  }
};

  const handleViewDetails = async (result) => {
    setSelectedResult(result);
    setShowDetailModal(true);
  };

  const handleDownloadResult = async (resultId) => {
    try {
      toast.info("Generating PDF...");
      const response = await api.get(`/api/teacher/result/${resultId}/download`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `result_${resultId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Result downloaded!");
    } catch {
      toast.error("Failed to download result");
    }
  };

  // ✅ ADD EDIT HANDLER
  const handleEditResult = (resultId) => {
    navigate(`/teacher/edit-result/${resultId}`);
  };

  const getStatusBadge = (status) => {
    const badges = { PASS: "bg-green-100 text-green-800", FAIL: "bg-red-100 text-red-800", PASS_BY_GRACE: "bg-yellow-100 text-yellow-800", ABSENT: "bg-gray-100 text-gray-800" };
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status] || badges.FAIL}`}>{status === 'PASS_BY_GRACE' ? 'PASS*' : status}</span>;
  };

  const getGradeBadge = (grade) => {
    const colors = { 'A+': 'bg-purple-100 text-purple-800', 'A': 'bg-blue-100 text-blue-800', 'B+': 'bg-cyan-100 text-cyan-800', 'B': 'bg-teal-100 text-teal-800', 'C+': 'bg-green-100 text-green-800', 'C': 'bg-lime-100 text-lime-800', 'D': 'bg-yellow-100 text-yellow-800', 'E': 'bg-orange-100 text-orange-800', 'F': 'bg-red-100 text-red-800' };
    return <span className={`px-3 py-1 rounded-full text-sm font-bold ${colors[grade] || 'bg-gray-100 text-gray-800'}`}>{grade}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <BackButton to="/teacher/teacher-dashboard" />
        <div className="mt-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-900">View Results</h1>
          <p className="text-slate-600 mt-1">All created examination results</p>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2"><FaFilter className="inline mr-2" />Filter by Exam Type</label>
              <select value={filters.examType} onChange={(e) => setFilters({ ...filters, examType: e.target.value })} className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-purple-500 outline-none">
                <option value="">All Exams</option>
                <option value="FINAL">Final Exam</option>
                <option value="HALF_YEARLY">Half Yearly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="UNIT_TEST">Unit Test</option>
                <option value="MID_TERM">Mid Term</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2"><FaSearch className="inline mr-2" />Search Student</label>
              <input type="text" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-purple-500 outline-none" placeholder="Name, ID, or Roll Number" />
            </div>
          </div>
        </div>
        
        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Class</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Exam</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">Marks</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">%</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">Grade</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">Result</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredResults.length === 0 ? (
                  <tr><td colSpan="9" className="px-6 py-12 text-center text-slate-500">No results found</td></tr>
                ) : (
                  filteredResults.map((result) => (
                    <tr key={result._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{result.studentName}</p>
                          <p className="text-sm text-slate-600">{result.studentID} | Roll: {result.rollNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{result.className}</p>
                        <p className="text-sm text-slate-600">Section {result.section}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{result.examType}</p>
                        <p className="text-sm text-slate-600">{result.examYear}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="font-bold text-slate-900">{result.totalObtainedMarks + result.totalGraceMarks}/{result.totalMaxMarks}</p>
                        {result.totalGraceMarks > 0 && (
                          <p className="text-xs text-red-600 flex items-center justify-center gap-1 font-bold">
                            *{result.totalGraceMarks} grace
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center"><p className="text-lg font-bold text-purple-600">{result.overallPercentage}%</p></td>
                      <td className="px-6 py-4 text-center">{getGradeBadge(result.overallGrade)}</td>
                      <td className="px-6 py-4 text-center">{getStatusBadge(result.result)}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-2">
                            {result.isApproved ? (
                              <FaCheckCircle className="text-green-500" title="Approved" />
                            ) : (
                              <FaTimesCircle className="text-gray-400" title="Draft - Can Edit" />
                            )}
                            {result.isPublished && (
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Published</span>
                            )}
                          </div>
                          {!result.isApproved && (
                            <span className="text-xs text-orange-600 font-semibold">DRAFT</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <button 
                            onClick={() => handleViewDetails(result)} 
                            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all" 
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          
                          <button 
                            onClick={() => handleDownloadResult(result._id)} 
                            className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all" 
                            title="Download PDF"
                          >
                            <FaDownload />
                          </button>
                          
                          {/* ✅ EDIT BUTTON - Only show for draft (not approved) results */}
                          {!result.isApproved && (
                            <button 
                              onClick={() => handleEditResult(result._id)} 
                              className="p-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all" 
                              title="Edit Result (Draft Only)"
                            >
                              <FaEdit />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {showDetailModal && selectedResult && <ResultDetailModal result={selectedResult} onClose={() => setShowDetailModal(false)} />}
      </div>
    </div>
  );
}

function ResultDetailModal({ result, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl my-8">
        <div className="border-b border-slate-200 p-6 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Result Details</h3>
              <p className="text-sm text-slate-600 mt-1">{result.studentName} - {result.examType}</p>
              {/* ✅ Show Draft/Approved Badge */}
              {!result.isApproved && (
                <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full">
                  DRAFT - Can be edited
                </span>
              )}
              {result.isApproved && (
                <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                  APPROVED
                </span>
              )}
            </div>
            <button onClick={onClose} className="rounded-xl bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-100">
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
            <div><p className="text-sm text-slate-600">Student Name</p><p className="font-semibold text-slate-900">{result.studentName}</p></div>
            <div><p className="text-sm text-slate-600">Father's Name</p><p className="font-semibold text-slate-900">{result.fatherName}</p></div>
            <div><p className="text-sm text-slate-600">Class & Section</p><p className="font-semibold text-slate-900">{result.className} - {result.section}</p></div>
            <div><p className="text-sm text-slate-600">Roll Number</p><p className="font-semibold text-slate-900">{result.rollNumber}</p></div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-3">Subject-wise Marks</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="border p-3 text-left">Subject</th>
                    <th className="border p-3 text-center">Theory</th>
                    <th className="border p-3 text-center">Practical</th>
                    <th className="border p-3 text-center">IA</th>
                    <th className="border p-3 text-center">Total</th>
                    <th className="border p-3 text-center">%</th>
                    <th className="border p-3 text-center">Grade</th>
                    <th className="border p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.subjects?.map((subject, index) => (
                    <tr key={index} className={subject.isAbsent ? "bg-red-50" : ""}>
                      <td className="border p-3 font-medium">{subject.subjectName}</td>
                      <td className="border p-3 text-center">{subject.theoryMaxMarks > 0 ? `${subject.theoryObtainedMarks}/${subject.theoryMaxMarks}` : "N/A"}</td>
                      <td className="border p-3 text-center">{subject.practicalMaxMarks > 0 ? `${subject.practicalObtainedMarks}/${subject.practicalMaxMarks}` : "N/A"}</td>
                      <td className="border p-3 text-center">{subject.iaMaxMarks > 0 ? `${subject.iaObtainedMarks}/${subject.iaMaxMarks}` : "N/A"}</td>
                      <td className="border p-3 text-center font-bold">
                        <div className="flex flex-col items-center">
                          <span>{subject.totalObtainedMarks}/{subject.totalMaxMarks}</span>
                          {subject.graceMarks > 0 && <span className="text-red-500 font-bold text-xs mt-1">*{subject.graceMarks}</span>}
                        </div>
                      </td>
                      <td className="border p-3 text-center font-bold text-purple-600">{subject.percentage}%</td>
                      <td className="border p-3 text-center"><span className="px-2 py-1 rounded bg-purple-100 text-purple-800 font-bold">{subject.grade}</span></td>
                      <td className="border p-3 text-center">
                        {subject.isAbsent ? <span className="text-gray-600 font-semibold">ABSENT</span> : subject.status === "PASS_BY_GRACE" ? <span className="text-yellow-600 font-semibold">PASS*</span> : subject.status === "PASS" ? <span className="text-green-600 font-semibold">PASS</span> : <span className="text-red-600 font-semibold">FAIL</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-purple-100">
                  <tr>
                    <td colSpan="4" className="border p-3 text-right font-bold">TOTAL:</td>
                    <td className="border p-3 text-center font-bold">
                      <div className="flex flex-col items-center">
                        <span>{result.totalObtainedMarks}/{result.totalMaxMarks}</span>
                        {result.totalGraceMarks > 0 && <span className="text-red-500 font-bold text-xs mt-1">*{result.totalGraceMarks}</span>}
                      </div>
                    </td>
                    <td className="border p-3 text-center font-bold text-purple-600 text-lg">{result.overallPercentage}%</td>
                    <td className="border p-3 text-center font-bold text-lg">{result.overallGrade}</td>
                    <td className="border p-3 text-center">
                      <span className={`px-3 py-1 rounded-full font-bold ${result.result === 'PASS' ? 'bg-green-100 text-green-800' : result.result === 'PASS_BY_GRACE' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {result.result === 'PASS_BY_GRACE' ? 'PASS*' : result.result}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg"><p className="text-sm text-slate-600">Division</p><p className="text-xl font-bold text-blue-600">{result.division}</p></div>
            <div className="p-4 bg-green-50 rounded-lg"><p className="text-sm text-slate-600">Attendance</p><p className="text-xl font-bold text-green-600">{result.daysPresent}/{result.totalWorkingDays} ({result.attendancePercentage}%)</p></div>
          </div>
          
          {result.remarks && (
            <div className="p-4 bg-amber-50 rounded-lg"><p className="text-sm font-semibold text-slate-700 mb-1">Remarks:</p><p className="text-slate-900">{result.remarks}</p></div>
          )}
        </div>
        
        <div className="border-t p-6 flex gap-4">
          <button onClick={onClose} className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-300 font-semibold hover:bg-slate-50">Close</button>
          <button onClick={() => window.print()} className="flex-1 px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 flex items-center justify-center gap-2"><FaPrint />Print</button>
        </div>
      </div>
    </div>
  );
}
