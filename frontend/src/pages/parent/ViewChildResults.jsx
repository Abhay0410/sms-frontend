// pages/parent/ViewChildResults.jsx
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../services/api";
import BackButton from "../../components/BackButton";
import { FaDownload, FaSpinner, FaSearch, FaGraduationCap, FaAward, FaFilePdf, FaClipboardList, FaCalendarAlt } from "react-icons/fa";

export default function ViewChildResults() {
  const [searchParams] = useSearchParams();
  const childId = searchParams.get('childId');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [childInfo, setChildInfo] = useState(null);
  const [filters, setFilters] = useState({ search: "" });

  const loadData = useCallback(async () => {
    if (!childId) return navigate('/parent/children');
    try {
      setLoading(true);
      const res = await api.get(API_ENDPOINTS.PARENT.RESULT.CHILD(childId));
      
      // ✅ Correct extraction based on successResponse wrapper
      const resultsData = res?.data?.results || res?.results || [];
      const infoData = res?.data?.childInfo || res?.childInfo || null;

      setResults(Array.isArray(resultsData) ? resultsData : []);
      setFilteredResults(Array.isArray(resultsData) ? resultsData : []);
      setChildInfo(infoData);
    } catch {
      toast.error("Results currently unavailable");
    } finally {
      setLoading(false);
    }
  }, [childId, navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    let filtered = Array.isArray(results) ? [...results] : [];
    if (filters.search) {
      filtered = filtered.filter(r => (r.examName || "").toLowerCase().includes(filters.search.toLowerCase()));
    }
    setFilteredResults(filtered);
  }, [results, filters]);

  const handleDownload = async (id) => {
    try {
      toast.info("Generating secure PDF...");
      const response = await api.get(API_ENDPOINTS.PARENT.RESULT.DOWNLOAD(id), { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `Academic_Record_${id}.pdf`;
      link.click();
      toast.success("Download started");
    } catch { toast.error("Download failure"); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><FaSpinner className="animate-spin text-slate-900" size={32}/></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-bold uppercase text-xs tracking-tight">
      <div className="max-w-6xl mx-auto">
        <BackButton to={`/parent/children`} />
        <div className="mt-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">OFFICIAL TRANSCRIPT</h1>
            <p className="text-slate-500 mt-2 tracking-normal capitalize flex items-center gap-2">
              <FaGraduationCap className="text-indigo-600" />
              {childInfo?.name} • CLASS {childInfo?.className} {childInfo?.section}
            </p>
          </div>
          <input 
            placeholder="search exams..."
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm outline-none focus:ring-2 focus:ring-indigo-200 lowercase"
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
          <div className="bg-slate-900 px-8 py-5 flex items-center justify-between text-white tracking-[0.3em] text-[10px]">
             <h3>PUBLISHED RECORDS</h3>
             <FaAward className="text-amber-400" />
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 border-b border-slate-100">
                <th className="px-8 py-6 tracking-widest uppercase font-black">Exam Category</th>
                <th className="px-8 py-6 text-center tracking-widest uppercase font-black">Efficiency</th>
                <th className="px-8 py-6 text-center tracking-widest uppercase font-black">Grade</th>
                <th className="px-8 py-6 text-right tracking-widest uppercase font-black">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-black">
              {filteredResults.length === 0 ? (
                <tr><td colSpan="4" className="py-20 text-center text-slate-300">No published records found</td></tr>
              ) : (
                filteredResults.map((result) => (
                  <tr key={result._id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-6">
                       <p className="text-slate-800 text-lg leading-none tracking-tighter">{result.examName || result.examType}</p>
                       <p className="text-[10px] text-slate-400 mt-2 tracking-widest uppercase flex items-center gap-2"><FaCalendarAlt /> SESSION {result.academicYear}</p>
                    </td>
                    <td className="px-8 py-6 text-center text-indigo-600 text-2xl tracking-tighter">{result.overallPercentage}%</td>
                    <td className="px-8 py-6 text-center">
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-lg shadow-sm">{result.overallGrade}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => handleDownload(result._id)} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-md group-hover:rotate-3"><FaFilePdf size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}