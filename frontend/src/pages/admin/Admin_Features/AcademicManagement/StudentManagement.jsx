// pages/admin/Admin_Features/AcademicManagement/StudentManagement.jsx
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../../services/api.js";

import {
  FaUserGraduate,
  FaFilter,
  FaCheckSquare,
  FaTrash,
  FaArrowUp,
  FaEdit,
  FaSearch,
  FaTimes,
  FaChartPie,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [academicYear, setAcademicYear] = useState("2025-2026");  
  const [filters, setFilters] = useState({
    status: "",
    className: "",
    section: "",
    academicYear: "",
    search: "",
  });
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 20,
    total: 0,
  });

  function getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return month >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  }

  const fetchSessions = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.SESSION.GET_All_SESSION);

    console.log("FULL RES:", res);

    // ✅ Always correct data
   let sessionData = Array.isArray(res) ? res : res?.data || [];

    // ✅ Remove duplicates (safe)
    sessionData = sessionData.filter(
      (s, index, self) =>
        index ===
        self.findIndex(
          (x) =>
            x.startYear === s.startYear &&
            x.endYear === s.endYear
        )
    );

    // ✅ Sort
    sessionData.sort((a, b) => a.startYear - b.startYear);

    console.log("FINAL SESSION DATA:", sessionData);

    setSessions(sessionData);

    // ✅ Active session select
    const active = sessionData.find((s) => s?.isActive);

    if (active) {
      setAcademicYear(`${active.startYear}-${active.endYear}`);
    }

  } catch (err) {
    console.error("Session fetch error", err);
  }
};

  useEffect(() => {
    fetchSessions();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append("page", pagination.currentPage);
      params.append("limit", pagination.perPage);

      const [studentsResp, statsResp] = await Promise.all([
        api.get(`${API_ENDPOINTS.ADMIN.STUDENT_MANAGEMENT.LIST}?${params}`),
        api.get(
          `${API_ENDPOINTS.ADMIN.STUDENT_MANAGEMENT.STATISTICS}?academicYear=${filters.academicYear}`,
        ),
      ]);

      const studentData =
        studentsResp?.students || studentsResp?.data?.students || [];
      const paginationData =
        studentsResp?.pagination || studentsResp?.data?.pagination || {};

      setStudents(studentData);
      setPagination(paginationData);
      setStatistics(statsResp?.data || statsResp);
    } catch (error) {
      console.error("Load error:", error);
      toast.error(error.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.perPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const toggleAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s._id));
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedStudents.length === 0) {
      toast.error("Please select students first");
      return;
    }

    if (
      !window.confirm(
        `Update status to ${status} for ${selectedStudents.length} students?`,
      )
    ) {
      return;
    }

    try {
      await api.put(API_ENDPOINTS.ADMIN.STUDENT_MANAGEMENT.BULK_UPDATE_STATUS, {
        studentIds: selectedStudents,
        status,
      });

      toast.success(`Status updated for ${selectedStudents.length} students`);
      setSelectedStudents([]);
      loadData();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select students first");
      return;
    }

    if (
      !window.confirm(
        `Delete ${selectedStudents.length} students? This cannot be undone!`,
      )
    ) {
      return;
    }

    try {
      await api.delete(API_ENDPOINTS.ADMIN.STUDENT_MANAGEMENT.BULK_DELETE, {
        data: { studentIds: selectedStudents },
      });

      toast.success(`${selectedStudents.length} students deleted`);
      setSelectedStudents([]);
      loadData();
    } catch (error) {
      toast.error(error.message || "Failed to delete students");
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-slate-700">
            Loading students...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 px-4 md:px-6 pb-6 ">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="rounded-2xl bg-white border border-slate-500 shadow-sm p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                Student Management
              </h2>
              <p className="font-medium text-gray-500  text-sm flex items-center gap-1 mt-1">
                <FaUserGraduate className="text-blue-600" />
                Manage all students, bulk operations, and promotions
              </p>
            </div>
          </div>

          {/* Statistics */}
          {/* {statistics && (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-2xl bg-white p-4 shadow-md border border-slate-100">
                <p className="text-sm text-slate-600">Total Students</p>
                <p className="text-3xl font-bold text-slate-900">{statistics.totalStudents}</p>
              </div>
              <div className="rounded-2xl bg-green-50 p-4 shadow-md border border-green-200">
                <p className="text-sm text-green-700">Enrolled</p>
                <p className="text-3xl font-bold text-green-900">{statistics.byStatus?.ENROLLED || 0}</p>
              </div>
              <div className="rounded-2xl bg-yellow-50 p-4 shadow-md border border-yellow-200">
                <p className="text-sm text-yellow-700">Registered</p>
                <p className="text-3xl font-bold text-yellow-900">{statistics.byStatus?.REGISTERED || 0}</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-4 shadow-md border border-blue-200">
                <p className="text-sm text-blue-700">Alumni</p>
                <p className="text-3xl font-bold text-blue-900">{statistics.byStatus?.ALUMNI || 0}</p>
              </div>
            </div>
          )} */}
        </div>

        {/* Filters */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-slate-500">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Academic Year
              </label>
              <select
                value={filters.academicYear}
                onChange={(e) =>
                  setFilters({ ...filters, academicYear: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              >
                <option value="">Select Session</option>

                {sessions.map((s) => (
                  <option key={s._id} value={`${s.startYear}-${s.endYear}`}>
                    {s.startYear}-{s.endYear} {s.isActive ? "(Current)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full rounded-lg border-2 border-slate-200 p-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="REGISTERED">Registered</option>
                <option value="ENROLLED">Enrolled</option>
                <option value="ALUMNI">Alumni</option>
                <option value="DROPOUT">Dropout</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Class
              </label>
              <select
                value={filters.className}
                onChange={(e) =>
                  setFilters({ ...filters, className: e.target.value })
                }
                className="w-full rounded-lg border-2 border-slate-200 p-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="">All Classes</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    Class {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="w-full rounded-lg border-2 border-slate-200 p-2 pl-10 focus:border-blue-500 focus:outline-none"
                  placeholder="Search by name, ID, or email..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedStudents.length > 0 && (
          <div className="mt-6 rounded-2xl bg-blue-50 p-4 border-1 border-slate-500 flex items-center justify-between">
            <p className="text-blue-900 font-semibold">
              {selectedStudents.length} student
              {selectedStudents.length !== 1 ? "s" : ""} selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPromoteModal(true)}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 flex items-center gap-2"
              >
                <FaArrowUp />
                Promote
              </button>
              <button
                onClick={() => handleBulkStatusUpdate("ENROLLED")}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Mark Enrolled
              </button>
              <button
                onClick={handleBulkDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 flex items-center gap-2"
              >
                <FaTrash />
                Delete
              </button>
              <button
                onClick={() => setSelectedStudents([])}
                className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Student Table */}
        <div className="mt-6 rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-800 text-white border-b border-slate-200">
                <tr>
                  <th className="p-4 w-16">
                    <div className="flex justify-center">
                      <label className="relative flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            students.length > 0 &&
                            selectedStudents.length === students.length
                          }
                          onChange={toggleAll}
                          className="peer hidden"
                        />
                        <div className="h-5 w-5 rounded-md border-2 border-slate-300 bg-white peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:after:absolute peer-checked:after:left-[6px] peer-checked:after:top-[2px] peer-checked:after:h-3 peer-checked:after:w-1.5 peer-checked:after:rotate-45 peer-checked:after:border-r-2 peer-checked:after:border-b-2 peer-checked:after:border-white transition-all"></div>
                      </label>
                    </div>
                  </th>
                  <th className="p-4 text-left font-semibold text-white uppercase tracking-wider text-xs">
                    Student
                  </th>
                  <th className="p-4 text-left font-semibold text-white uppercase tracking-wider text-xs">
                    Class
                  </th>
                  <th className="p-4 text-left font-semibold text-white uppercase tracking-wider text-xs">
                    Status
                  </th>
                  <th className="p-4 text-left font-semibold text-white uppercase tracking-wider text-xs">
                    Parent
                  </th>
                  <th className="p-4 text-left font-semibold text-white uppercase tracking-wider text-xs">
                    Final Result
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const isSelected = selectedStudents.includes(student._id);
                  return (
                    <tr
                      key={student._id}
                      className={`transition-all duration-200 ${
                        isSelected
                          ? "bg-indigo-50/50"
                          : "hover:bg-slate-50/80 hover:shadow-sm"
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex justify-center">
                          <label className="relative flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleStudent(student._id)}
                              className="peer hidden"
                            />
                            <div className="h-5 w-5 rounded-md border-2 border-slate-300 bg-white peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:after:absolute peer-checked:after:left-[6px] peer-checked:after:top-[2px] peer-checked:after:h-3 peer-checked:after:w-1.5 peer-checked:after:rotate-45 peer-checked:after:border-r-2 peer-checked:after:border-b-2 peer-checked:after:border-white transition-all"></div>
                          </label>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm ${
                              isSelected
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {student.name?.charAt(0)}
                          </div>

                          <div>
                            <p className="font-bold text-slate-900">
                              {student.name}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                              {student.studentID}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-700 font-medium">
                        {student.className}{" "}
                        {student.section && `- ${student.section}`}
                        {student.rollNumber && (
                          <span className="block text-xs text-slate-500 mt-0.5">
                            Roll: {student.rollNumber}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            student.status === "ENROLLED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : student.status === "REGISTERED"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {student.status === "ENROLLED" && (
                            <FaCheckCircle
                              size={10}
                              className="text-emerald-500"
                            />
                          )}
                          {student.status === "REGISTERED" && (
                            <FaClock size={10} className="text-amber-500" />
                          )}
                          {student.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-700 font-medium">
                        {student.parentId?.name || "N/A"}
                      </td>
                      <td className="p-4">
                        {student.finalResult ? (
                          <div className="flex flex-col gap-1">
                            <div
                              className={`px-3 py-1 rounded-md text-[10px] font-bold w-fit flex items-center gap-1.5 shadow-sm border ${
                                student.finalResult.result === "PASS"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {student.finalResult.result === "PASS" ? (
                                <FaCheckCircle
                                  size={10}
                                  className="text-emerald-500"
                                />
                              ) : (
                                <FaTimes size={10} className="text-rose-500" />
                              )}
                              {student.finalResult.result} (
                              {student.finalResult.overallPercentage}%)
                            </div>
                            {!student.finalResult.isPublished && (
                              <span className="text-[9px] text-amber-600 font-bold uppercase mt-1 px-1">
                                ⚠️ Draft
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            Pending
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 flex items-center justify-between border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Showing {(pagination.currentPage - 1) * pagination.perPage + 1}{" "}
                to{" "}
                {Math.min(
                  pagination.currentPage * pagination.perPage,
                  pagination.total,
                )}{" "}
                of {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      currentPage: pagination.currentPage - 1,
                    })
                  }
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-1.5 text-sm rounded-lg border border-slate-300 hover:bg-slate-100 transition disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      currentPage: pagination.currentPage + 1,
                    })
                  }
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-1.5 text-sm rounded-lg border border-slate-300 hover:bg-slate-100 transition disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Promote Modal */}
        {showPromoteModal && (
          <PromoteModal
            selectedCount={selectedStudents.length}
            onClose={() => setShowPromoteModal(false)}
            onSuccess={() => {
              setShowPromoteModal(false);
              setSelectedStudents([]);
              loadData();
            }}
            studentIds={selectedStudents}
            students={students}
            sessions={sessions}
          />
        )}
      </div>
    </div>
  );
}

// Promote Modal Component
function PromoteModal({
  selectedCount,
  onClose,
  onSuccess,
  studentIds,
  students,
  sessions,
}) {
  const [newClassName, setNewClassName] = useState("");
  const [newAcademicYear, setNewAcademicYear] = useState("");
  const [resetSection, setResetSection] = useState(true);
  const [loading, setLoading] = useState(false);

  const handlePromote = async (e) => {
    e.preventDefault();

    // 🛡️ Safety Filter
    const failStudents = students.filter(
      (s) =>
        studentIds.includes(s._id) &&
        (!s.finalResult || s.finalResult.result !== "PASS"),
    );

    if (failStudents.length > 0) {
      const confirmText = `Warning: ${failStudents.length} student(s) have not cleared their FINAL exams. Are you sure you want to promote them?`;
      if (!window.confirm(confirmText)) return;
    }

    // Actual API call starts here...
    try {
      setLoading(true);

      await api.put(API_ENDPOINTS.ADMIN.STUDENT_MANAGEMENT.PROMOTE, {
        studentIds,
        newClassName,
        newAcademicYear,
        resetSection,
      });

      toast.success(`${selectedCount} students promoted successfully`);
      onSuccess();
    } catch (error) {
      toast.error(error.message || "Failed to promote students");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 p-6 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                Promote Students
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Promoting {selectedCount} student
                {selectedCount !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-100"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handlePromote} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              New Class <span className="text-red-500">*</span>
            </label>
            <select
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="">Select Class</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  Class {i + 1}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Academic Year <span className="text-red-500">*</span>
            </label>
            <select
              value={newAcademicYear}
              onChange={(e) => setNewAcademicYear(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 p-3"
              required
            >
              <option value="">Select Year</option>

              {sessions.map((s) => (
                <option key={s._id} value={`${s.startYear}-${s.endYear}`}>
                  {s.startYear}-{s.endYear}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={resetSection}
              onChange={(e) => setResetSection(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <label className="text-sm text-slate-700">
              Reset section and roll number (students will need to be
              reassigned)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? "Promoting..." : "Promote Students"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
