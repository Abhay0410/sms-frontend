import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../services/api";
import BackButton from "../../components/BackButton";
import {
  FaEye,
  FaDownload,
  FaSpinner,
  FaFilter,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

export default function StudentResults() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [filters, setFilters] = useState({ examType: "", search: "" });

  const loadResults = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(API_ENDPOINTS.STUDENT.RESULT.MY_RESULTS);
      
      // ✅ Critical Fix: Correct data extraction from backend object
      let resultsData = [];
      if (res && res.results) {
        resultsData = res.results;
      } else if (res && res.data && res.data.results) {
        resultsData = res.data.results;
      }
      
      setResults(resultsData);
      setFilteredResults(resultsData);
    } catch (error) {
      console.error("Load Error:", error);
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  }, []);

  // Use empty dependency array [] to prevent infinite loops
  useEffect(() => {
    loadResults();
  }, [loadResults]);

  // Handle Filtering
  useEffect(() => {
    let filtered = [...results];
    if (filters.examType) {
      filtered = filtered.filter(r => r.examType === filters.examType);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.examName?.toLowerCase().includes(search) ||
        r.examType?.toLowerCase().includes(search)
      );
    }
    setFilteredResults(filtered);
  }, [results, filters]);

  const handleDownload = async (resultId) => {
    try {
      toast.info("Generating PDF...");
      const response = await api.get(
        API_ENDPOINTS.STUDENT.RESULT.DOWNLOAD(resultId),
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Result_${resultId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Download started!");
    } catch {
      toast.error("Failed to download");
    }
  };

  const getStatusBadge = (status) => {
    const badges = { 
      PASS: "bg-emerald-100 text-emerald-800 border-emerald-200", 
      FAIL: "bg-rose-100 text-rose-800 border-rose-200", 
      PASS_BY_GRACE: "bg-amber-100 text-amber-800 border-amber-200", 
      ABSENT: "bg-slate-100 text-slate-800 border-slate-200" 
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badges[status] || 'bg-gray-100'}`}>
        {status === 'PASS_BY_GRACE' ? 'PASS*' : status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <FaSpinner className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <BackButton to="/student/student-dashboard" />
        
        <div className="mt-8 mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Academic Statement</h1>
          <p className="text-slate-500 font-medium">Official examination records and performance history.</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Exam Category</label>
              <select 
                value={filters.examType} 
                onChange={(e) => setFilters({ ...filters, examType: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50"
              >
                <option value="">All Examinations</option>
                <option value="FINAL">Final Examination</option>
                <option value="HALF_YEARLY">Half Yearly</option>
                <option value="UNIT_TEST">Unit Test</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Quick Search</label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Exam title..."
                  className="w-full rounded-xl border border-slate-200 p-3 pl-11 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ examType: "", search: "" })}
                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 font-bold text-sm transition-colors w-full"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Records Found: {filteredResults.length}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest">Exam Details</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-center">Score</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-center">Efficiency</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-center">Grade</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-center">Final Result</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-slate-400 font-bold italic">
                      No matching records located in the database.
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((result) => (
                    <tr key={result._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="font-black text-slate-800 text-sm leading-none uppercase">{result.examName || result.examType}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-bold tracking-widest uppercase">Session {result.academicYear}</p>
                      </td>
                      <td className="px-6 py-5 text-center font-black text-slate-700">
                        {result.totalObtainedMarks} <span className="text-slate-300 text-xs font-normal">/ {result.totalMaxMarks}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-sm font-black text-indigo-600">{result.overallPercentage}%</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-block px-4 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs border border-indigo-100">
                          {result.overallGrade}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {getStatusBadge(result.result)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        {result.isPublished && (
                          <button
                            onClick={() => handleDownload(result._id)}
                            className="p-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-md group-hover:-translate-y-0.5 active:translate-y-0"
                            title="Download Official PDF"
                          >
                            <FaDownload size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}