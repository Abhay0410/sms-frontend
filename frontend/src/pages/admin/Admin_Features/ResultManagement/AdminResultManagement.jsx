import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // ✅ Add this
import api, { API_ENDPOINTS } from "../../../../services/api";
import BackButton from "../../../../components/BackButton";
import {
  FaEye,
  FaDownload,
  FaCheckCircle,
  FaTimesCircle,
  FaGlobe,
  FaEyeSlash,
  FaSpinner,
  FaFilter,
  FaSearch,
  FaSort,
} from "react-icons/fa";

export default function AdminResultManagement() {
  const navigate = useNavigate(); // ✅ Add this
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);
  const [filters, setFilters] = useState({
    examType: "",
    className: "",
    section: "",
    status: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [stats, setStats] = useState({});

  const loadResults = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load statistics
      const statsRes = await api.get(API_ENDPOINTS.ADMIN.RESULT.STATISTICS);
      setStats(statsRes);

      // Load results with filters
      const params = { page: 1, limit: 50, ...filters };
      const res = await api.get(API_ENDPOINTS.ADMIN.RESULT.ALL, { params });
      
      let resultsData;
      if (Array.isArray(res)) {
        resultsData = res;
      } else if (Array.isArray(res.data)) {
        resultsData = res.data;
      } else {
        resultsData = [];
      }
      
      setResults(resultsData);
      setFilteredResults(resultsData);
      
    } catch  {
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  // Filter and search
  useEffect(() => {
    let filtered = [...results];
    
    if (filters.examType) {
      filtered = filtered.filter(r => r.examType === filters.examType);
    }
    if (filters.className) {
      filtered = filtered.filter(r => r.className?.includes(filters.className));
    }
    if (filters.section) {
      filtered = filtered.filter(r => r.section === filters.section);
    }
    if (filters.status) {
      filtered = filtered.filter(r => r.result === filters.status);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.studentName?.toLowerCase().includes(search) ||
        r.studentID?.toLowerCase().includes(search) ||
        r.rollNumber?.toString().includes(search)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[filters.sortBy] || '';
      const bVal = b[filters.sortBy] || '';
      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    setFilteredResults(filtered);
  }, [results, filters]);

 // In AdminResultManagement.jsx
const handleView = (resultId) => {
  // ✅ Now use the correct absolute path
  navigate(`/admin/results/${resultId}/view`);
};

  const handleDownload = async (resultId) => {
    try {
      toast.info("Generating PDF...");
      const response = await api.get(
        API_ENDPOINTS.ADMIN.RESULT.DOWNLOAD(resultId),
        { responseType: 'blob' }
      );
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
    } catch  {
      toast.error("Failed to download result");
    }
  };

  const handleApprove = async (resultId) => {
    try {
      await api.put(API_ENDPOINTS.ADMIN.RESULT.APPROVE(resultId));
      toast.success("Result approved!");
      loadResults();
    } catch  {
      toast.error("Failed to approve");
    }
  };

  const handleUnapprove = async (resultId) => {
    try {
      await api.put(API_ENDPOINTS.ADMIN.RESULT.UNAPPROVE(resultId));
      toast.success("Result moved to draft!");
      loadResults();
    } catch {
      toast.error("Failed to unapprove");
    }
  };

  const handlePublish = async (resultId) => {
    try {
      await api.put(API_ENDPOINTS.ADMIN.RESULT.PUBLISH(resultId));
      toast.success("Result published!");
      loadResults();
    } catch {
      toast.error("Failed to publish");
    }
  };

  const handleUnpublish = async (resultId) => {
    try {
      await api.put(API_ENDPOINTS.ADMIN.RESULT.UNPUBLISH(resultId));
      toast.success("Result unpublished!");
      loadResults();
    } catch {
      toast.error("Failed to unpublish");
    }
  };

  const handleBulkApprove = async () => {
    if (selectedResults.length === 0) {
      toast.warn("Select results to approve");
      return;
    }
    try {
      await api.put(API_ENDPOINTS.ADMIN.RESULT.BULK_APPROVE, { resultIds: selectedResults });
      toast.success(`${selectedResults.length} results approved!`);
      setSelectedResults([]);
      loadResults();
    } catch  {
      toast.error("Failed to bulk approve");
    }
  };

  const handleBulkPublish = async () => {
    if (selectedResults.length === 0) {
      toast.warn("Select results to publish");
      return;
    }
    try {
      await api.put(API_ENDPOINTS.ADMIN.RESULT.BULK_PUBLISH, { resultIds: selectedResults });
      toast.success(`${selectedResults.length} results published!`);
      setSelectedResults([]);
      loadResults();
    } catch {
      toast.error("Failed to bulk publish");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PASS: "bg-green-100 text-green-800",
      FAIL: "bg-red-100 text-red-800",
      PASS_BY_GRACE: "bg-yellow-100 text-yellow-800",
      ABSENT: "bg-gray-100 text-gray-800"
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {status === 'PASS_BY_GRACE' ? 'PASS*' : status}
      </span>
    );
  };

  const getApprovalBadge = (isApproved, isPublished) => {
    if (isPublished) {
      return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">PUBLISHED</span>;
    }
    if (isApproved) {
      return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">APPROVED</span>;
    }
    return <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full">DRAFT</span>;
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
        <BackButton to="/admin/admin-dashboard" />
        
        <div className="mt-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Result Management</h1>
          <p className="text-slate-600 mt-1">Manage, approve, publish, and download examination results</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Total Results</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalResults || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaEye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Draft</p>
                <p className="text-3xl font-bold text-orange-600">{stats.draftCount || 0}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <FaEyeSlash className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approvedCount || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Published</p>
                <p className="text-3xl font-bold text-blue-600">{stats.publishedCount || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaGlobe className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Bulk Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
                <input
                  type="checkbox"
                  checked={selectedResults.length === filteredResults.length && filteredResults.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedResults(filteredResults.map(r => r._id));
                    } else {
                      setSelectedResults([]);
                    }
                  }}
                />
                <span className="font-medium text-slate-700">
                  {selectedResults.length} of {filteredResults.length} selected
                </span>
              </div>

              {selectedResults.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleBulkApprove}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all flex items-center gap-2"
                  >
                    <FaCheckCircle /> Bulk Approve
                  </button>
                  <button
                    onClick={handleBulkPublish}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2"
                  >
                    <FaGlobe /> Bulk Publish
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 max-w-2xl">
              <div>
                <label className="flex items-center gap-1 text-sm font-semibold text-slate-700 mb-1">
                  <FaSearch /> Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-purple-500 outline-none"
                  placeholder="Student name, ID, roll number"
                />
              </div>
              <select
                value={filters.examType}
                onChange={(e) => setFilters({ ...filters, examType: e.target.value })}
                className="rounded-lg border-2 border-slate-200 p-3 focus:border-purple-500 outline-none"
              >
                <option value="">All Exam Types</option>
                <option value="FINAL">Final Exam</option>
                <option value="HALF_YEARLY">Half Yearly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="UNIT_TEST">Unit Test</option>
                <option value="MID_TERM">Mid Term</option>
              </select>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="rounded-lg border-2 border-slate-200 p-3 focus:border-purple-500 outline-none"
              >
                <option value="">All Results</option>
                <option value="PASS">PASS</option>
                <option value="FAIL">FAIL</option>
                <option value="PASS_BY_GRACE">PASS BY GRACE</option>
                <option value="ABSENT">ABSENT</option>
              </select>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadResults()}
                  className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2 font-medium flex-1"
                >
                  <FaFilter /> Filter
                </button>
                <button
                  onClick={() => setFilters({
                    examType: "",
                    className: "",
                    section: "",
                    status: "",
                    search: "",
                    sortBy: "createdAt",
                    sortOrder: "desc",
                  })}
                  className="px-4 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all flex-1"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xl font-bold text-slate-900">
              All Results ({filteredResults.length})
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              Sort by: 
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setFilters({ ...filters, sortBy, sortOrder });
                }}
                className="rounded border-2 border-slate-200 p-1 text-xs focus:border-purple-500 outline-none"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="studentName-asc">Student Name (A-Z)</option>
                <option value="className-asc">Class Name</option>
                <option value="overallPercentage-desc">Percentage (High-Low)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 w-12">
                    <input type="checkbox" />
                  </th>
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
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center text-slate-500">
                      No results found
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((result) => (
                    <tr key={result._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedResults.includes(result._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedResults([...selectedResults, result._id]);
                            } else {
                              setSelectedResults(selectedResults.filter(id => id !== result._id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{result.studentName}</p>
                          <p className="text-sm text-slate-600">
                            {result.studentID} | Roll: {result.rollNumber}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{result.className}</p>
                        <p className="text-sm text-slate-600">Sec {result.section}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{result.examType}</p>
                        <p className="text-sm text-slate-600">{result.examYear}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="font-bold">
                          {result.totalObtainedMarks}/{result.totalMaxMarks}
                        </p>
                        {result.totalGraceMarks > 0 && (
                          <p className="text-xs text-red-600">*{result.totalGraceMarks} grace</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-lg font-bold text-purple-600">
                          {result.overallPercentage}%
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-sm">
                          {result.overallGrade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(result.result)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getApprovalBadge(result.isApproved, result.isPublished)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleView(result._id)}
                            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleDownload(result._id)}
                            className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
                            title="Download PDF"
                          >
                            <FaDownload />
                          </button>
                          
                          {/* Conditional Action Buttons */}
                          {!result.isApproved ? (
                            <button
                              onClick={() => handleApprove(result._id)}
                              className="p-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                              title="Approve Result"
                            >
                              <FaCheckCircle />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnapprove(result._id)}
                              className="p-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600"
                              title="Move to Draft"
                            >
                              <FaTimesCircle />
                            </button>
                          )}
                          
                          {result.isApproved && !result.isPublished ? (
                            <button
                              onClick={() => handlePublish(result._id)}
                              className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                              title="Publish Result"
                            >
                              <FaGlobe />
                            </button>
                          ) : result.isPublished ? (
                            <button
                              onClick={() => handleUnpublish(result._id)}
                              className="p-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600"
                              title="Unpublish Result"
                            >
                              <FaEyeSlash />
                            </button>
                          ) : null}
                        </div>
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