import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../../services/api";

import {
  FaSpinner,
  FaDownload,
  FaPrint,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaGlobe,
  FaUserGraduate,
  FaBook,
  FaChartLine,
  FaTrophy,
  FaCalendarAlt,
  FaIdCard,
  FaSchool,
  FaUser,
  FaUsers,
  FaStar,
  FaThList // Replacing the non-existent FaLayout with FaThList
} from "react-icons/fa";

export default function AdminViewResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to check token info
  const checkToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔑 JWT Payload:', payload);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  };

  // Wrapped in useCallback to prevent unnecessary recreations
  const loadResult = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.ADMIN.RESULT.GET_BY_ID(id));
      
      if (response && response.data) {
        setResult(response.data);
      } else {
        setResult(response);
      }
    } catch (error) {
      console.error("❌ Error loading result:", error);
      toast.error(error.response?.data?.message || "Failed to load result");
      navigate("/admin/result-management"); 
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    checkToken();
    loadResult();
  }, [id, loadResult]);

  const handleDownloadPDF = async () => {
    try {
      toast.info("Generating PDF...");
      const response = await api.get(
        API_ENDPOINTS.ADMIN.RESULT.DOWNLOAD(id),
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Result_${result?.studentName}_${result?.examType}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Result downloaded successfully!");
    } catch {
      toast.error("Failed to download result");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    const badges = {
      PASS: "bg-green-100 text-green-800 border-green-300",
      FAIL: "bg-red-100 text-red-800 border-red-300",
      PASS_BY_GRACE: "bg-yellow-100 text-yellow-800 border-yellow-300",
      ABSENT: "bg-gray-100 text-gray-800 border-gray-300"
    };
    return (
      <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${badges[status] || 'bg-red-100 text-red-800'}`}>
        {status === 'PASS_BY_GRACE' ? 'PASS* (Grace)' : status}
      </span>
    );
  };

  const getGradeBadge = (grade) => {
    const colors = {
      'A+': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      'A': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      'B+': 'bg-gradient-to-r from-teal-500 to-green-500 text-white',
      'B': 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
      'C+': 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white',
      'C': 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
      'F': 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
    };
    return (
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colors[grade] || 'bg-gray-200 text-gray-800'} font-bold text-lg shadow-md`}>
        {grade}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <FaSpinner className="h-16 w-16 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/admin/result-management")}
              className="p-3 bg-white hover:bg-slate-100 rounded-xl shadow-sm border border-slate-200 transition-all text-slate-600 flex items-center gap-2 font-medium"
            >
              <FaArrowLeft /> Back to List
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Result Details</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDownloadPDF} className="p-3 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 flex items-center gap-2"><FaDownload /> PDF</button>
            <button onClick={handlePrint} className="p-3 bg-purple-600 text-white rounded-xl shadow-md hover:bg-purple-700 flex items-center gap-2"><FaPrint /> Print</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 relative">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-4xl font-black mx-auto mb-4 border-4 border-white shadow-lg">
                  {result.studentName?.charAt(0)}
                </div>
                <h2 className="text-2xl font-bold text-slate-800">{result.studentName}</h2>
                <p className="text-purple-600 font-medium">ID: {result.studentID}</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Class</span><span className="font-bold">{result.className} - {result.section}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Roll No</span><span className="font-bold">{result.rollNumber}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Exam</span><span className="font-bold text-amber-600">{result.examType}</span></div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl shadow-xl p-8 text-white">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><FaStar className="text-amber-400" /> Performance</h3>
              <div className="space-y-6 text-center">
                <div className="bg-white/5 rounded-2xl py-4">
                   <p className="text-4xl font-black">{result.overallPercentage}%</p>
                   <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">Percentage</p>
                </div>
                <div className="flex justify-around">
                  <div><p className="text-xl font-bold">{result.overallGrade}</p><p className="text-slate-500 text-[10px]">GRADE</p></div>
                  <div><p className="text-xl font-bold">{result.division}</p><p className="text-slate-500 text-[10px]">DIVISION</p></div>
                </div>
                <div className="pt-2">{getStatusBadge(result.result)}</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-6 bg-slate-50 border-b flex items-center gap-3">
                <FaBook className="text-purple-600" />
                <h3 className="font-bold text-slate-800">Subject-wise Marks Statement</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-slate-500 border-b">
                    <tr>
                      <th className="p-5 text-left font-bold uppercase">Subject</th>
                      <th className="p-5 text-center font-bold uppercase">Obtained / Max</th>
                      <th className="p-5 text-center font-bold uppercase">Grade</th>
                      <th className="p-5 text-center font-bold uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {result.subjects?.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-5">
                          <p className="font-bold text-slate-800">{sub.subjectName}</p>
                          <p className="text-[10px] text-slate-400">CODE: {sub.subjectCode || 'N/A'}</p>
                        </td>
                        <td className="p-5 text-center">
                           <span className="font-black text-slate-800">{sub.totalObtainedMarks}</span>
                           <span className="text-slate-400 mx-1">/</span>
                           <span className="text-slate-500">{sub.totalMaxMarks}</span>
                           {sub.graceMarks > 0 && <span className="block text-[10px] text-amber-600 font-bold">+{sub.graceMarks} Grace</span>}
                        </td>
                        <td className="p-5 flex justify-center items-center">
                           {getGradeBadge(sub.grade)} 
                        </td>
                        <td className="p-5 text-center">
                           <span className={`inline-flex items-center gap-1 font-bold ${sub.status === 'PASS' ? 'text-green-600' : 'text-red-500'}`}>
                             {sub.status === 'PASS' ? <FaCheckCircle size={12}/> : <FaTimesCircle size={12}/>} {sub.status}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white rounded-2xl p-6 border shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-bold uppercase">Attendance</p>
                  <p className="text-2xl font-black">{result.attendancePercentage}%</p>
                </div>
                <FaCalendarAlt size={30} className="text-amber-500 opacity-20" />
              </div>

              <div className="bg-white rounded-2xl p-6 border shadow-lg">
                <button 
                   onClick={() => navigate("/admin/result-management")}
                   className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                >
                  <FaThList /> Return to Management
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}