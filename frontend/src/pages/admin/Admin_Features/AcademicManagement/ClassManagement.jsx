// pages/admin/Admin_Features/AcademicManagement/ClassManagement.jsx
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import BackButton from "../../../../components/BackButton";
import { API_ENDPOINTS } from "../../../.././/constants/apiEndpoints";
import { FaPlus, FaEdit, FaUsers, FaChalkboard, FaTimes, FaUserGraduate, FaChartLine, FaCheckCircle } from "react-icons/fa";

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`${API_ENDPOINTS.ADMIN.CLASS.LIST}?academicYear=${academicYear}`);
      
      console.log("📥 API Response:", response);
      
      let classList = [];
      
      if (Array.isArray(response)) {
        classList = response;
      } else if (response?.classes) {
        classList = response.classes;
      } else if (response?.data?.classes) {
        classList = response.data.classes;
      } else if (response?.data && Array.isArray(response.data)) {
        classList = response.data;
      }
      
      console.log("✅ Parsed classes:", classList);
      setClasses(classList);
    } catch (error) {
      console.error("❌ Load classes error:", error);
      toast.error(error.message || "Failed to load classes");
    } finally {
      setLoading(false);
    }
  }, [academicYear]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  function getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return month >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-cyan-100 animate-pulse mx-auto"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-slate-700">Loading classes...</p>
          <p className="mt-2 text-sm text-slate-500">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <BackButton to="/admin/admin-dashboard" />

        {/* Enhanced Header with Stats */}
        <div className="mt-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
                Class Management
              </h2>
              <p className="text-base text-slate-600 flex items-center gap-2">
                <FaChartLine className="text-blue-600" />
                Manage classes, sections, and student assignments
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="rounded-xl border-2 border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 shadow-sm transition-all hover:border-blue-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none"
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
              </select>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95"
              >
                <FaPlus className="h-4 w-4" />
                Create Class
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {classes.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-blue-100 p-3">
                    <FaChalkboard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Classes</p>
                    <p className="text-3xl font-bold text-slate-900">{classes.length}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-cyan-100 p-3">
                    <FaUsers className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Sections</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {classes.reduce((sum, cls) => sum + (cls.sections?.length || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-teal-100 p-3">
                    <FaUserGraduate className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Students</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {classes.reduce(
                        (sum, cls) =>
                          sum + (cls.sections?.reduce((s, sec) => s + sec.currentStrength, 0) || 0),
                        0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-white p-16 text-center shadow-lg border border-slate-100">
            <div className="mx-auto w-fit rounded-full bg-blue-50 p-6">
              <FaChalkboard className="h-16 w-16 text-blue-400" />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-slate-900">No Classes Found</h3>
            <p className="mt-3 text-base text-slate-600 max-w-md mx-auto">
              Create your first class to get started with academic management for{" "}
              <span className="font-semibold text-blue-600">{academicYear}</span>
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-8 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
            >
              Create Your First Class
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {classes.map((cls) => (
              <ClassCard
                key={cls._id}
                classData={cls}
                onEdit={() => setSelectedClass(cls)}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        {showCreateModal && (
          <CreateClassModal
            academicYear={academicYear}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadClasses();
            }}
          />
        )}

        {selectedClass && (
          <ClassDetailsModal
            classData={selectedClass}
            onClose={() => setSelectedClass(null)}
            onReload={loadClasses}
          />
        )}
      </div>
    </div>
  );
}

// Enhanced Class Card Component
function ClassCard({ classData, onEdit }) {
  const totalSections = classData.sections?.length || 0;
  const totalStudents = classData.sections?.reduce((sum, s) => sum + s.currentStrength, 0) || 0;
  const totalCapacity = classData.sections?.reduce((sum, s) => sum + s.capacity, 0) || 0;
  const fillPercentage = totalCapacity ? (totalStudents / totalCapacity) * 100 : 0;

  return (
    <div className="group rounded-2xl border-2 border-slate-100 bg-white p-6 shadow-md transition-all hover:shadow-2xl hover:scale-105 hover:border-blue-200 cursor-pointer">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 p-3 shadow-md">
              <FaChalkboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                Class {classData.className}
              </h3>
              <p className="text-sm font-medium text-slate-500">{classData.academicYear}</p>
            </div>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="rounded-xl bg-blue-50 p-3 text-blue-600 transition-all hover:bg-blue-100 hover:scale-110 active:scale-95"
        >
          <FaEdit className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-cyan-100 p-2">
              <FaUsers className="h-4 w-4 text-cyan-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">Sections</span>
          </div>
          <span className="text-xl font-bold text-slate-900">{totalSections}</span>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-100 p-2">
              <FaUserGraduate className="h-4 w-4 text-teal-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">Students</span>
          </div>
          <span className="text-xl font-bold text-slate-900">
            {totalStudents} / {totalCapacity}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 p-4 border border-blue-100">
          <span className="text-sm font-medium text-slate-700">Total Fee</span>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            ₹{classData.feeStructure?.totalFee?.toLocaleString() || 0}
          </span>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-600">Capacity Utilization</span>
          <span className="text-xs font-bold text-blue-600">{fillPercentage.toFixed(0)}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              fillPercentage >= 90
                ? "bg-gradient-to-r from-red-500 to-orange-500"
                : fillPercentage >= 70
                ? "bg-gradient-to-r from-amber-500 to-orange-500"
                : "bg-gradient-to-r from-blue-600 to-cyan-600"
            }`}
            style={{ width: `${fillPercentage}%` }}
          />
        </div>
      </div>

      {/* Sections List */}
      {totalSections > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Sections
          </p>
          <div className="flex flex-wrap gap-2">
            {classData.sections.map((section) => (
              <span
                key={section._id}
                className="group/section relative rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                {section.sectionName}
                <span className="ml-2 text-xs text-slate-500">
                  ({section.currentStrength}/{section.capacity})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Create Class Modal
function CreateClassModal({ academicYear, onClose, onSuccess }) {
  const [form, setForm] = useState({
    className: "",
    sections: [],
    tuitionFee: "",
    admissionFee: "",
    examFee: "",
    libraryFee: "",      
    sportsFee: "",       
    labFee: "",          
    transportFee: "",
    otherFees: "",
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const totalFee =
    Number(form.tuitionFee || 0) +
    Number(form.admissionFee || 0) +
    Number(form.examFee || 0) +
    Number(form.libraryFee || 0) +    // ✅ ADD
    Number(form.sportsFee || 0) +     // ✅ ADD
    Number(form.labFee || 0) +        // ✅ ADD
    Number(form.transportFee || 0) +  // ✅ ADD
    Number(form.otherFees || 0);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.className) {
      toast.error("Please select a class");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        className: form.className,
        academicYear,
        sections: [],
        feeStructure: {
          tuitionFee: parseFloat(form.tuitionFee) || 0,
          admissionFee: parseFloat(form.admissionFee) || 0,
          examFee: parseFloat(form.examFee) || 0,
          libraryFee: parseFloat(form.libraryFee) || 0,      // ✅ ADD
          sportsFee: parseFloat(form.sportsFee) || 0,        // ✅ ADD
          labFee: parseFloat(form.labFee) || 0,              // ✅ ADD
          transportFee: parseFloat(form.transportFee) || 0,  // ✅ ADD
          otherFees: parseFloat(form.otherFees) || 0,
          
          totalFee,
        },
      };

      await api.post(API_ENDPOINTS.ADMIN.CLASS.CREATE, payload);
      toast.success("Class created successfully");
      onSuccess();
    } catch (error) {
      toast.error(error.message || "Failed to create class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl animate-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="border-b border-slate-100 p-6 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Create New Class</h3>
              <p className="mt-2 text-sm text-slate-600">
                Academic Year:{" "}
                <span className="font-semibold text-blue-600">{academicYear}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl bg-white p-2 text-slate-600 shadow-sm transition-all hover:bg-slate-100 hover:rotate-90"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={onSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Select Class <span className="text-red-500">*</span>
            </label>
            <select
              name="className"
              value={form.className}
              onChange={onChange}
              className="w-full rounded-xl border-2 border-slate-200 bg-white p-4 font-medium text-slate-900 transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none"
              required
            >
              <option value="">Choose a class</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                <option key={num} value={String(num)}>
                  Class {num}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700 mb-4">Fee Structure</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Tuition Fee (₹)
                </label>
                <input
                  type="number"
                  name="tuitionFee"
                  value={form.tuitionFee}
                  onChange={onChange}
                  className="w-full rounded-xl border-2 border-slate-200 p-3 transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Admission Fee (₹)
                </label>
                <input
                  type="number"
                  name="admissionFee"
                  value={form.admissionFee}
                  onChange={onChange}
                  className="w-full rounded-xl border-2 border-slate-200 p-3 transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Exam Fee (₹)
                </label>
                <input
                  type="number"
                  name="examFee"
                  value={form.examFee}
                  onChange={onChange}
                  className="w-full rounded-xl border-2 border-slate-200 p-3 transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                  placeholder="0"
                />
              </div>
                           {/* ✅ Library Fee */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Library Fee (₹)
                </label>
                <input
                  type="number"
                  name="libraryFee"
                  value={form.libraryFee}
                  onChange={onChange}
                  className="w-full rounded-xl border-2 border-slate-200 p-3 transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                  placeholder="0"
                />
              </div>

              {/* ✅ Sports Fee */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Sports Fee (₹)
                </label>
                <input
                  type="number"
                  name="sportsFee"
                  value={form.sportsFee}
                  onChange={onChange}
                  className="w-full rounded-xl border-2 border-slate-200 p-3 transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                  placeholder="0"
                />
              </div>

              {/* ✅ Lab Fee */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Lab Fee (₹)
                </label>
                <input
                  type="number"
                  name="labFee"
                  value={form.labFee}
                  onChange={onChange}
                  className="w-full rounded-xl border-2 border-slate-200 p-3 transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                  placeholder="0"
                />
              </div>

              {/* ✅ Transport Fee */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Transport Fee (₹)
                </label>
                <input
                  type="number"
                  name="transportFee"
                  value={form.transportFee}
                  onChange={onChange}
                  className="w-full rounded-xl border-2 border-slate-200 p-3 transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Other Fees (₹)
                </label>
                <input
                  type="number"
                  name="otherFees"
                  value={form.otherFees}
                  onChange={onChange}
                  className="w-full rounded-xl border-2 border-slate-200 p-3 transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Total Annual Fee</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                ₹{totalFee.toLocaleString()}
              </span>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 p-6 bg-slate-50 rounded-b-2xl">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border-2 border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-400"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Creating...
                </span>
              ) : (
                "Create Class"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Class Details Modal
function ClassDetailsModal({ classData, onClose, onReload }) {
  const [activeTab, setActiveTab] = useState("sections");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-6xl rounded-2xl bg-white shadow-2xl my-8 animate-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="border-b border-slate-100 p-6 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 p-4 shadow-lg">
                <FaChalkboard className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-900">
                  Class {classData.className}
                </h3>
                <p className="text-sm font-medium text-slate-600 mt-1">
                  {classData.academicYear}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl bg-white p-3 text-slate-600 shadow-md transition-all hover:bg-slate-100 hover:rotate-90 hover:shadow-lg"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="border-b border-slate-200 bg-white px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("sections")}
              className={`relative px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === "sections"
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaUsers className="inline-block mr-2" />
              Sections
              {activeTab === "sections" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`relative px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === "students"
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaUserGraduate className="inline-block mr-2" />
              Assign Students
              {activeTab === "students" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-t-full"></div>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === "sections" && (
            <SectionsTab classData={classData} onReload={onReload} />
          )}
          {activeTab === "students" && (
            <AssignStudentsTab classData={classData} onReload={onReload} />
          )}
        </div>
      </div>
    </div>
  );
}

// Enhanced Sections Tab
function SectionsTab({ classData, onReload }) {
  const [showAddSection, setShowAddSection] = useState(false);
  const [sectionForm, setSectionForm] = useState({ sectionName: "", capacity: "40" });
  const [loading, setLoading] = useState(false);

  const addSection = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(API_ENDPOINTS.ADMIN.CLASS.ADD_SECTION(classData._id), {
        sectionName: sectionForm.sectionName,
        capacity: parseInt(sectionForm.capacity),
      });
      toast.success("Section added successfully");
      setSectionForm({ sectionName: "", capacity: "40" });
      setShowAddSection(false);
      onReload();
    } catch (error) {
      toast.error(error.message || "Failed to add section");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xl font-bold text-slate-900">
          Sections ({classData.sections?.length || 0})
        </h4>
        <button
          onClick={() => setShowAddSection(!showAddSection)}
          className={`rounded-xl px-5 py-3 font-semibold transition-all shadow-md hover:shadow-lg ${
            showAddSection
              ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
              : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:scale-105"
          }`}
        >
          {showAddSection ? "Cancel" : "+ Add Section"}
        </button>
      </div>

      {showAddSection && (
        <form onSubmit={addSection} className="mb-6 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-2 border-blue-200 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Section Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={sectionForm.sectionName}
                onChange={(e) =>
                  setSectionForm({ ...sectionForm, sectionName: e.target.value.toUpperCase() })
                }
                className="w-full rounded-xl border-2 border-slate-200 p-3 font-medium transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                placeholder="A, B, C..."
                maxLength={1}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={sectionForm.capacity}
                onChange={(e) => setSectionForm({ ...sectionForm, capacity: e.target.value })}
                className="w-full rounded-xl border-2 border-slate-200 p-3 font-medium transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                min="1"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? "Adding..." : "Add Section"}
          </button>
        </form>
      )}

      {/* Enhanced Sections List */}
      <div className="space-y-4">
        {classData.sections?.map((section, index) => (
          <div
            key={section._id}
            className="group rounded-2xl border-2 border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-blue-200 animate-in fade-in slide-in-from-left duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 p-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {section.sectionName}
                  </span>
                </div>
                <div>
                  <h5 className="text-lg font-bold text-slate-900">
                    Section {section.sectionName}
                  </h5>
                  <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                    <FaUserGraduate className="text-blue-600" />
                    {section.currentStrength} / {section.capacity} students
                  </p>
                </div>
              </div>
              <div className="text-right rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500 uppercase">Class Teacher</p>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {section.classTeacher?.name || "Not Assigned"}
                </p>
              </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="mt-4">
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-500"
                  style={{
                    width: `${(section.currentStrength / section.capacity) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        {(!classData.sections || classData.sections.length === 0) && (
          <div className="text-center py-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300">
            <div className="mx-auto w-fit rounded-full bg-slate-100 p-6">
              <FaUsers className="h-12 w-12 text-slate-400" />
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-600">No sections yet</p>
            <p className="mt-2 text-sm text-slate-500">Add your first section to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Assign Students Tab
function AssignStudentsTab({ classData, onReload }) {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);
      
      // ✅ FIX: Try multiple status filters and class name formats
      const url = `${API_ENDPOINTS.ADMIN.STUDENT.LIST}?className=${classData.className}&academicYear=${classData.academicYear}`;
      console.log("📥 Loading ALL students from:", url);
      
      const response = await api.get(url);
      
      console.log("=== STUDENT LIST DEBUG ===");
      console.log("📦 Raw Response:", response);
      console.log("📦 Type:", typeof response);
      console.log("📦 Is Array:", Array.isArray(response));
      console.log("==========================");
      
      let studentList = [];
      
      if (Array.isArray(response)) {
        studentList = response;
      } else if (response?.students && Array.isArray(response.students)) {
        studentList = response.students;
      } else if (response?.data?.students && Array.isArray(response.data.students)) {
        studentList = response.data.students;
      } else if (response?.data && Array.isArray(response.data)) {
        studentList = response.data;
      }
      
      console.log("✅ All students found:", studentList.length);
      
      // ✅ FIX: Filter for unassigned students (no section or not enrolled)
      const unassignedStudents = studentList.filter(student => 
        !student.section || student.section === "" || student.status === "REGISTERED"
      );
      
      console.log("✅ Unassigned students:", unassignedStudents.length);
      console.log("✅ Unassigned students details:", unassignedStudents);
      
      setStudents(unassignedStudents);
      
      if (unassignedStudents.length === 0) {
        toast.info(`No unassigned students found for Class ${classData.className}`);
      }
    } catch (error) {
      console.error("❌ Load students error:", error);
      toast.error(error.message || "Failed to load students");
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [classData.className, classData.academicYear]);

  // ... rest of the component remains the same

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const toggleStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const assignStudents = async () => {
    if (!selectedSection) {
      toast.error("Please select a section");
      return;
    }

    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    try {
      setLoading(true);
      await api.put(
        API_ENDPOINTS.ADMIN.CLASS.ASSIGN_STUDENTS(classData._id, selectedSection),
        { studentIds: selectedStudents }
      );
      
      toast.success(`${selectedStudents.length} students assigned successfully`);
      setSelectedStudents([]);
      loadStudents();
      onReload();
    } catch (error) {
      toast.error(error.message || "Failed to assign students");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.studentID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Selection Controls */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-2 border-blue-200">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 font-medium transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none"
            >
              <option value="">Choose section</option>
              {classData.sections?.map((section) => (
                <option key={section._id} value={section.sectionName}>
                  Section {section.sectionName} ({section.capacity - section.currentStrength}{" "}
                  seats available)
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Selected Students
            </label>
            <div className="rounded-xl border-2 border-slate-200 bg-white p-3 font-bold text-blue-600 text-center">
              {selectedStudents.length} student{selectedStudents.length !== 1 ? "s" : ""} selected
            </div>
          </div>

          <div className="lg:col-span-1 flex items-end">
            <button
              onClick={assignStudents}
              disabled={loading || selectedStudents.length === 0}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Assigning...
                </span>
              ) : (
                `Assign ${selectedStudents.length} Student${selectedStudents.length !== 1 ? "s" : ""}`
              )}
            </button>
          </div>
        </div>
      </div>

      {/* DEBUG Panel */}
      {import.meta.env.DEV && (
        <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-sm">
          <p className="font-bold text-yellow-900 mb-2">🔧 Debug Info:</p>
          <div className="space-y-1 text-yellow-800">
            <p><strong>Class:</strong> {classData.className}</p>
            <p><strong>Status Filter:</strong> REGISTERED</p>
            <p><strong>Academic Year:</strong> {classData.academicYear}</p>
            <p><strong>Students Found:</strong> {students.length}</p>
            <p><strong>Loading:</strong> {loadingStudents ? "Yes" : "No"}</p>
          </div>
          <button
            onClick={loadStudents}
            className="mt-2 px-3 py-1 bg-yellow-200 hover:bg-yellow-300 rounded text-yellow-900 text-xs font-semibold"
          >
            🔄 Reload Students
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, ID, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border-2 border-slate-200 p-4 font-medium transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none"
        />
      </div>

      {/* Student List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-slate-900">
            {loadingStudents ? (
              "Loading students..."
            ) : (
              `Registered Students (${filteredStudents.length})`
            )}
          </h4>
          {selectedStudents.length > 0 && (
            <button
              onClick={() => setSelectedStudents([])}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Clear Selection
            </button>
          )}
        </div>

        {loadingStudents ? (
          <div className="text-center py-16 rounded-2xl bg-slate-50 border-2 border-slate-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300">
            <div className="mx-auto w-fit rounded-full bg-slate-100 p-6">
              <FaUserGraduate className="h-12 w-12 text-slate-400" />
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-600">
              {searchTerm ? "No students found matching your search" : "No registered students found"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {searchTerm
                ? "Try adjusting your search terms"
                : `No REGISTERED students found for Class ${classData.className} (${classData.academicYear})`}
            </p>
            
            <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl max-w-xl mx-auto text-left">
              <p className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                <FaCheckCircle className="text-blue-600" />
                Possible reasons & solutions:
              </p>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span><strong>No students registered yet:</strong> Register students for Class {classData.className}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span><strong>Wrong class number:</strong> Verify className is exactly "{classData.className}"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span><strong>Already enrolled:</strong> Only "REGISTERED" students appear here</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span><strong>Different academic year:</strong> Check students are for {classData.academicYear}</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-3">
            {/* ✅ Fix: Use underscore prefix for unused index */}
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                className={`flex items-center gap-4 rounded-xl border-2 p-4 transition-all cursor-pointer hover:shadow-md ${
                  selectedStudents.includes(student._id)
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-blue-300"
                }`}
                onClick={() => toggleStudent(student._id)}
              >
                <div className="flex items-center justify-center flex-shrink-0">
                  <div
                    className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      selectedStudents.includes(student._id)
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {selectedStudents.includes(student._id) && (
                      <FaCheckCircle className="h-4 w-4 text-white" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{student.name}</p>
                  <p className="text-sm text-slate-600 truncate">
                    {student.studentID} • {student.email}
                  </p>
                </div>

                <span className="rounded-full bg-amber-100 px-4 py-2 text-xs font-bold text-amber-800 border border-amber-200 flex-shrink-0">
                  {student.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
