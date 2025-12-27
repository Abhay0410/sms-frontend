import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../../services/api";
import BackButton from "../../../../components/BackButton";
import {
  FaBook,
  FaPlus,
  FaTimes,
  FaTrash,
  FaLayerGroup,
  FaChalkboard,
} from "react-icons/fa";

export default function SubjectManagement() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [subjectData, setSubjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [selectedSubjectsSet, setSelectedSubjectsSet] = useState(new Set());
  const [selectedSection, setSelectedSection] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  function getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return month >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  }

const loadClasses = useCallback(async () => {
  try {
    setLoading(true);
    const resp = await api.get(
      `${API_ENDPOINTS.ADMIN.CLASS.LIST}?academicYear=${academicYear}`
    );
    console.log("Class list response:", resp);

    // Axios interceptor: resp = { success, message, data: [...] }
    const classList = Array.isArray(resp?.data)
      ? resp.data
      : Array.isArray(resp)
      ? resp
      : [];

    console.log("Resolved classList:", classList);

    setClasses(classList);
    if (classList.length > 0 && !selectedClass) {
      setSelectedClass(classList[0]);
    }
  } catch (error) {
    console.error("Load classes error:", error);
    toast.error(error.message || "Failed to load classes");
    setClasses([]);
  } finally {
    setLoading(false);
  }
}, [academicYear, selectedClass]);

const loadSubjects = useCallback(async () => {
  if (!selectedClass) return;
  try {
    const resp = await api.get(API_ENDPOINTS.ADMIN.SUBJECT_MANAGEMENT.CLASS(selectedClass._id));
    console.log("Subject class raw response:", resp);

    const data = resp?.data || resp; // interceptor ke baad resp.data hi actual payload hai
    console.log("Subject class extracted data:", data);

    setSubjectData(data);
    setSelectedSubjectsSet(new Set());
    setSelectedSection("");
  } catch (error) {
    console.error("❌ Error loading subjects:", error);
    toast.error(error.message || "Failed to load subjects");
  }
}, [selectedClass]);


  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

useEffect(() => {
  console.log("Selected class:", selectedClass);
  if (selectedClass) loadSubjects();
}, [selectedClass, loadSubjects]);


  const toggleSubjectSelection = (subjectName) => {
    setSelectedSubjectsSet((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subjectName)) newSet.delete(subjectName);
      else newSet.add(subjectName);
      return newSet;
    });
  };

  const handleAssignSubjectsToSection = async () => {
    if (!selectedSection) {
      toast.error("Please select a section");
      return;
    }
    if (selectedSubjectsSet.size === 0) {
      toast.error("Please select at least one subject");
      return;
    }
    try {
      setAssignLoading(true);
      const sectionNames = [selectedSection];
      for (const subjectName of selectedSubjectsSet) {
        await api.post(API_ENDPOINTS.ADMIN.SUBJECT_MANAGEMENT.ADD_TO_SECTIONS, {
          classId: selectedClass._id,
          sectionNames,
          subject: { subjectName, hoursPerWeek: 5 },
        });
      }
      toast.success(`Assigned ${selectedSubjectsSet.size} subjects to section ${selectedSection}`);
      setSelectedSubjectsSet(new Set());
      setSelectedSection("");
      loadSubjects();
    } catch (error) {
      toast.error(error.message || "Failed to assign subjects");
    } finally {
      setAssignLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-slate-700">Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <BackButton to="/admin/admin-dashboard" />

        {/* Header */}
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Subject Management</h2>
            <p className="text-base text-slate-600 flex items-center gap-2">
              <FaBook className="text-orange-600" />
              Create and assign subjects to classes
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="rounded-xl border-2 border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 shadow-sm transition-all hover:border-orange-400 focus:border-orange-600 focus:ring-4 focus:ring-orange-100 focus:outline-none"
            >
              <option value="2023-2024">2023-2024</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
            </select>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={!selectedClass}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPlus className="h-4 w-4" />
              Add Subject
            </button>
          </div>
        </div>

        {/* Class Selector */}
        <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
          {classes.map((cls) => (
            <button
              key={cls._id}
              onClick={() => setSelectedClass(cls)}
              className={`flex-shrink-0 rounded-xl px-6 py-3 font-semibold transition-all ${
                selectedClass?._id === cls._id
                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg scale-105"
                  : "bg-white text-slate-700 border-2 border-slate-200 hover:border-orange-300"
              }`}
            >
              Class {cls.className}
            </button>
          ))}
        </div>

        {/* Main Content */}
        {selectedClass && subjectData && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Available Subjects with checkboxes */}
            <div className="lg:col-span-1 rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <FaLayerGroup className="text-orange-600" />
                Available Subjects ({subjectData.availableSubjects?.length || 0})
              </h3>

              {/* Section Selector */}
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-300 p-3 mb-4 focus:border-orange-600 focus:outline-none"
              >
                <option value="">Select Section</option>
                {subjectData.sections?.map((section) => (
                  <option key={section.sectionName} value={section.sectionName}>
                    {section.sectionName}
                  </option>
                ))}
              </select>

              <div className="space-y-2 max-h-96 overflow-y-auto border border-slate-300 rounded-lg p-4">
                {subjectData.availableSubjects && subjectData.availableSubjects.length > 0 ? (
                  subjectData.availableSubjects.map((subject) => (
                    <label key={subject._id} className="flex items-center gap-3 cursor-pointer hover:bg-orange-50 p-2 rounded transition">
                      <input
                        type="checkbox"
                        checked={selectedSubjectsSet.has(subject.subjectName)}
                        onChange={() => toggleSubjectSelection(subject.subjectName)}
                        className="w-4 h-4 text-orange-600"
                      />
                      <span className="text-sm">
                        {subject.subjectName} ({subject.subjectCode})
                      </span>
                    </label>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FaBook className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 text-sm">No available subjects</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-3 text-sm text-orange-600 font-semibold hover:text-orange-700"
                    >
                      Add your first subject
                    </button>
                  </div>
                )}
              </div>

              <button
                disabled={!selectedSection || selectedSubjectsSet.size === 0 || assignLoading}
                onClick={handleAssignSubjectsToSection}
                className="mt-4 w-full rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {assignLoading ? "Assigning..." : `Assign ${selectedSubjectsSet.size} Subject${selectedSubjectsSet.size !== 1 ? 's' : ''}`}
              </button>
            </div>

            {/* Section-wise Assigned Subjects */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <FaChalkboard className="text-orange-600" />
                Section-wise Subjects
              </h3>

              {subjectData.sections && subjectData.sections.length > 0 ? (
                subjectData.sections.map((section) => (
                  <SectionSubjectCard
                    key={section.sectionName}
                    section={section}
                    className={subjectData.className}
                    classId={selectedClass._id}
                    availableSubjects={subjectData.availableSubjects || []}
                    onReload={loadSubjects}
                  />
                ))
              ) : (
                <div className="rounded-2xl bg-white p-12 text-center shadow-md border border-slate-100">
                  <FaChalkboard className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No sections found for this class</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Subject Modal */}
        {showAddModal && (
          <AddSubjectModal
            classId={selectedClass._id}
            className={selectedClass.className}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              loadSubjects();
            }}
          />
        )}
      </div>
    </div>
  );
}

function SectionSubjectCard({ section, className, classId, availableSubjects, onReload }) {
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);

  const handleRemoveFromSection = async (subjectName) => {
    if (!window.confirm(`Remove ${subjectName} from section ${section.sectionName}?`)) return;

    try {
      await api.delete(API_ENDPOINTS.ADMIN.SUBJECT_MANAGEMENT.REMOVE_FROM_SECTIONS, {
        data: {
          classId,
          sectionNames: [section.sectionName],
          subjectName,
        },
      });
      toast.success("Subject removed from section");
      onReload();
    } catch (error) {
      toast.error(error.message || "Failed to remove subject");
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-bold text-slate-900">
            Class {className} - Section {section.sectionName}
          </h4>
          <p className="text-sm text-slate-600">
            {section.subjects?.length || 0} subject{section.subjects?.length !== 1 ? "s" : ""} assigned
          </p>
        </div>
        <button
          onClick={() => setShowAddSubjectModal(true)}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 flex items-center gap-2 transition"
        >
          <FaPlus className="h-3 w-3" />
          Add Subject
        </button>
      </div>

      <div className="space-y-2">
        {section.subjects && section.subjects.length > 0 ? (
          section.subjects.map((subject) => (
            <div
              key={subject._id}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 hover:shadow-md transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <FaBook className="text-orange-600" />
                  <div>
                    <p className="font-semibold text-slate-900">{subject.subjectName}</p>
                    <p className="text-xs text-slate-600">
                      {subject.hoursPerWeek}h/week
                      {subject.teacher && ` • ${subject.teacher.name}`}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemoveFromSection(subject.subjectName)}
                className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition-all"
                title="Remove subject"
              >
                <FaTrash className="h-4 w-4" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-500 py-4 text-sm">No subjects assigned</p>
        )}
      </div>

      {showAddSubjectModal && (
        <AddSubjectToSectionModal
          classId={classId}
          sectionName={section.sectionName}
          className={className}
          availableSubjects={availableSubjects}
          onClose={() => setShowAddSubjectModal(false)}
          onSuccess={() => {
            setShowAddSubjectModal(false);
            onReload();
          }}
        />
      )}
    </div>
  );
}

function AddSubjectModal({ classId, className, onClose, onSuccess }) {
  const [form, setForm] = useState({
    subjectName: "",
    subjectCode: "",
    isCore: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(API_ENDPOINTS.ADMIN.SUBJECT_MANAGEMENT.ADD, {
        classId,
        ...form,
      });
      toast.success("Subject added successfully");
      onSuccess();
    } catch (error) {
      toast.error(error.message || "Failed to add subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 p-6 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Add Subject</h3>
              <p className="mt-2 text-sm text-slate-600">
                Class: <span className="font-semibold text-orange-600">{className}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-100 hover:rotate-90 transition-all"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.subjectName}
              onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
              className="w-full rounded-xl border-2 border-slate-200 p-3 transition-all focus:border-orange-600 focus:ring-4 focus:ring-orange-100 focus:outline-none"
              placeholder="e.g., Mathematics, Physics"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Subject Code</label>
            <input
              type="text"
              value={form.subjectCode}
              onChange={(e) => setForm({ ...form, subjectCode: e.target.value })}
              className="w-full rounded-xl border-2 border-slate-200 p-3 transition-all focus:border-orange-600 focus:ring-4 focus:ring-orange-100 focus:outline-none"
              placeholder="e.g., MATH, PHY"
              maxLength={10}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isCore}
              onChange={(e) => setForm({ ...form, isCore: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300"
            />
            <label className="text-sm text-slate-700">This is a core subject (mandatory for all students)</label>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50 transition"
            >
              {loading ? "Adding..." : "Add Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddSubjectToSectionModal({ classId, sectionName, className, availableSubjects, onClose, onSuccess }) {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("5");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(API_ENDPOINTS.ADMIN.SUBJECT_MANAGEMENT.ADD_TO_SECTIONS, {
        classId,
        sectionNames: [sectionName],
        subject: { subjectName: selectedSubject, hoursPerWeek: parseInt(hoursPerWeek) },
      });
      toast.success("Subject assigned to section");
      onSuccess();
    } catch (error) {
      toast.error(error.message || "Failed to assign subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 p-6 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Add Subject to Section</h3>
              <p className="mt-2 text-sm text-slate-600">Class {className} - Section {sectionName}</p>
            </div>
            <button onClick={onClose} className="rounded-xl bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-100 transition">
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Subject <span className="text-red-500">*</span></label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-orange-600 focus:outline-none"
              required
            >
              <option value="">Choose a subject</option>
              {availableSubjects.map((subject) => (
                <option key={subject._id} value={subject.subjectName}>
                  {subject.subjectName} ({subject.subjectCode})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Hours Per Week</label>
            <input
              type="number"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-orange-600 focus:outline-none"
              min="1"
              max="10"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 font-semibold text-white shadow-lg disabled:opacity-50 transition">{loading ? "Assigning..." : "Assign"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
