import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../../services/api";
import BackButton from "../../../../components/BackButton";
import {
  FaSpinner,
  FaSave,
  FaToggleOn,
  FaToggleOff,
  FaTimes,
} from "react-icons/fa";

export default function EditResult() {
  const { resultId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [isEditable, setIsEditable] = useState(false);

  const [formData, setFormData] = useState({
    examType: "",
    examName: "",
    examMonth: "",
    examYear: new Date().getFullYear(),
    studentId: "",
    remarks: "",
  });

  const [subjectMarks, setSubjectMarks] = useState([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

     const res = await api.get(
  API_ENDPOINTS.TEACHER.RESULT.GET_BY_ID(resultId)
);

// successResponse unwrap
const outer = res?.data || res;
const r = outer.data || outer;

if (!r || !r._id) {
  toast.error("Result not found");
  navigate("/teacher/view-results");
  return;
}

setResult(r);


      if (r.isApproved) {
        setIsEditable(false);
        toast.warn(
          "This result is approved. Ask admin to revert to draft to edit."
        );
      } else {
        setIsEditable(true);
      }

      setFormData({
        examType: r.examType || "FINAL",
        examName: r.examName || "",
        examMonth: r.examMonth || "",
        examYear: r.examYear || new Date().getFullYear(),
        studentId: r.student?._id || r.student || "",
        remarks: r.remarks || "",
      });

      const mappedSubjects = (r.subjects || []).map((sub) => ({
        subjectName: sub.subjectName,
        subjectCode: sub.subjectCode || "",
        hasPractical: sub.practicalMaxMarks > 0,
        theoryMaxMarks: sub.theoryMaxMarks || 0,
        theoryObtainedMarks:
          sub.theoryObtainedMarks === 0 ? 0 : sub.theoryObtainedMarks ?? "",
        practicalMaxMarks: sub.practicalMaxMarks || 0,
        practicalObtainedMarks:
          sub.practicalObtainedMarks === 0
            ? 0
            : sub.practicalObtainedMarks ?? "",
        iaMaxMarks: sub.iaMaxMarks || 0,
        iaObtainedMarks:
          sub.iaObtainedMarks === 0 ? 0 : sub.iaObtainedMarks ?? "",
        graceMarks: sub.graceMarks || 0,
        grade: sub.grade || "",
        status: sub.status || "FAIL",
        isAbsent: sub.isAbsent || false,
        totalMaxMarks: sub.totalMaxMarks || 0,
        totalObtainedMarks: sub.totalObtainedMarks || 0,
        percentage: sub.percentage || 0,
      }));

      setSubjectMarks(mappedSubjects);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to load result details"
      );
      navigate("/teacher/view-results");
    } finally {
      setLoading(false);
    }
  }, [resultId, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const calculateGrade = (percentage) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C+";
    if (percentage >= 40) return "C";
    if (percentage >= 33) return "D";
    if (percentage >= 25) return "E";
    return "F";
  };

  const handleSubjectMarkChange = (index, field, value) => {
    if (!isEditable) return;

    const updated = [...subjectMarks];

    if (field === "graceMarks") {
      updated[index][field] = Number(value) || 0;
    } else {
      updated[index][field] = value;
    }

    const subject = updated[index];

    const totalMax =
      Number(subject.theoryMaxMarks || 0) +
      Number(subject.practicalMaxMarks || 0) +
      Number(subject.iaMaxMarks || 0);

    const totalObtained =
      Number(subject.theoryObtainedMarks || 0) +
      Number(subject.practicalObtainedMarks || 0) +
      Number(subject.iaObtainedMarks || 0);

    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    updated[index].percentage = percentage;
    updated[index].grade = calculateGrade(percentage);

    setSubjectMarks(updated);
  };

  const handlePracticalToggle = (index) => {
    if (!isEditable) return;

    const updated = [...subjectMarks];
    updated[index].hasPractical = !updated[index].hasPractical;

    if (!updated[index].hasPractical) {
      updated[index].practicalMaxMarks = 0;
      updated[index].practicalObtainedMarks = 0;
    } else {
      if (!updated[index].practicalMaxMarks)
        updated[index].practicalMaxMarks = 50;
      if (updated[index].practicalObtainedMarks === 0)
        updated[index].practicalObtainedMarks = "";
    }

    const totalMax =
      Number(updated[index].theoryMaxMarks || 0) +
      Number(updated[index].practicalMaxMarks || 0) +
      Number(updated[index].iaMaxMarks || 0);
    const totalObtained =
      Number(updated[index].theoryObtainedMarks || 0) +
      Number(updated[index].practicalObtainedMarks || 0) +
      Number(updated[index].iaObtainedMarks || 0);
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    updated[index].percentage = percentage;
    updated[index].grade = calculateGrade(percentage);

    setSubjectMarks(updated);
  };

  const handleAbsentToggle = (index) => {
    if (!isEditable) return;

    const updated = [...subjectMarks];
    updated[index].isAbsent = !updated[index].isAbsent;
    if (updated[index].isAbsent) {
      updated[index].theoryObtainedMarks = "";
      updated[index].practicalObtainedMarks = "";
      updated[index].iaObtainedMarks = "";
      updated[index].graceMarks = 0;
      updated[index].grade = "-";
      updated[index].status = "ABSENT";
      updated[index].percentage = 0;
    } else {
      updated[index].status = "FAIL";
    }
    setSubjectMarks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditable) {
      toast.warn(
        "Result is approved. Ask admin to revert to draft before editing."
      );
      return;
    }
    if (!formData.studentId) {
      toast.error("Student not found");
      return;
    }
    if (subjectMarks.length === 0) {
      toast.error("No subjects found");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        subjects: subjectMarks.map((sub) => ({
          ...sub,
          theoryObtainedMarks: Number(sub.theoryObtainedMarks) || 0,
          practicalObtainedMarks: Number(sub.practicalObtainedMarks) || 0,
          iaObtainedMarks: Number(sub.iaObtainedMarks) || 0,
          theoryMaxMarks: Number(sub.theoryMaxMarks) || 0,
          practicalMaxMarks: Number(sub.practicalMaxMarks) || 0,
          iaMaxMarks: Number(sub.iaMaxMarks) || 0,
          graceMarks: Number(sub.graceMarks) || 0,
        })),
        remarks: formData.remarks,
        examName: formData.examName,
        examMonth: formData.examMonth,
      };

      await api.put(API_ENDPOINTS.TEACHER.RESULT.UPDATE(resultId), payload);
      toast.success("Result updated successfully");
      navigate("/teacher/view-results");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update result");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <BackButton to="/teacher/view-results" />
        <div className="mt-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Edit Result</h1>
          <p className="text-slate-600 mt-1">
            Update marks for {result.studentName} ({result.studentID}) -{" "}
            {result.className} {result.section}
          </p>
          {!isEditable && (
            <p className="mt-2 text-sm font-semibold text-red-600">
              This result is approved. Ask admin to revert it to draft to allow
              editing.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exam & student (readonly) */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Exam & Student Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Exam Type
                </label>
                <input
                  type="text"
                  value={formData.examType}
                  readOnly
                  className="w-full rounded-lg border-2 border-slate-200 p-3 bg-slate-100 text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Exam Name
                </label>
                <input
                  type="text"
                  value={formData.examName}
                  onChange={(e) =>
                    setFormData({ ...formData, examName: e.target.value })
                  }
                  disabled={!isEditable}
                  className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-purple-500 outline-none disabled:bg-slate-100 disabled:text-slate-600"
                  placeholder="e.g., Final Exam 2024-25"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Exam Year
                </label>
                <input
                  type="number"
                  value={formData.examYear}
                  readOnly
                  className="w-full rounded-lg border-2 border-slate-200 p-3 bg-slate-100 text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Class & Section
                </label>
                <input
                  type="text"
                  value={`${result.className} - ${result.section}`}
                  readOnly
                  className="w-full rounded-lg border-2 border-slate-200 p-3 bg-slate-100 text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Student
                </label>
                <input
                  type="text"
                  value={`${result.rollNumber} - ${result.studentName} (${result.studentID})`}
                  readOnly
                  className="w-full rounded-lg border-2 border-slate-200 p-3 bg-slate-100 text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Marks table */}
          {subjectMarks.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Edit Marks
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-purple-50">
                      <th className="border p-3 text-left font-semibold">
                        Subject
                      </th>
                      <th className="border p-3 text-center font-semibold">
                        Theory
                        <br />
                        (Max/Obt)
                      </th>
                      <th className="border p-3 text-center font-semibold">
                        Practical
                        <br />
                        (Max/Obt)
                      </th>
                      <th className="border p-3 text-center font-semibold">
                        Toggle
                        <br />
                        Practical
                      </th>
                      <th className="border p-3 text-center font-semibold">
                        IA
                        <br />
                        (Max/Obt)
                      </th>
                      <th className="border p-3 text-center font-semibold">
                        Grace
                      </th>
                      <th className="border p-3 text-center font-semibold">
                        Grade
                      </th>
                      <th className="border p-3 text-center font-semibold">
                        Status
                      </th>
                      <th className="border p-3 text-center font-semibold">
                        Absent
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectMarks.map((subject, index) => (
                      <tr
                        key={index}
                        className={subject.isAbsent ? "bg-red-50" : ""}
                      >
                        <td className="border p-3 font-medium">
                          {subject.subjectName}
                        </td>

                        {/* Theory */}
                        <td className="border p-3">
                          <div className="flex flex-col gap-2">
                            <input
                              type="number"
                              value={subject.theoryMaxMarks}
                              onChange={(e) =>
                                handleSubjectMarkChange(
                                  index,
                                  "theoryMaxMarks",
                                  e.target.value
                                )
                              }
                              disabled={!isEditable || subject.isAbsent}
                              className="w-full rounded border-2 border-slate-200 p-2 text-center text-sm focus:border-purple-500 outline-none disabled:bg-slate-100"
                              placeholder="Max"
                            />
                            <input
                              type="number"
                              value={subject.theoryObtainedMarks}
                              onChange={(e) =>
                                handleSubjectMarkChange(
                                  index,
                                  "theoryObtainedMarks",
                                  e.target.value
                                )
                              }
                              max={subject.theoryMaxMarks}
                              disabled={!isEditable || subject.isAbsent}
                              className="w-full rounded border-2 border-slate-200 p-2 text-center text-sm focus:border-purple-500 outline-none disabled:bg-slate-100"
                              placeholder="Obt"
                            />
                          </div>
                        </td>

                        {/* Practical */}
                        <td className="border p-3">
                          {subject.hasPractical ? (
                            <div className="flex flex-col gap-2">
                              <input
                                type="number"
                                value={subject.practicalMaxMarks}
                                onChange={(e) =>
                                  handleSubjectMarkChange(
                                    index,
                                    "practicalMaxMarks",
                                    e.target.value
                                  )
                                }
                                disabled={!isEditable || subject.isAbsent}
                                className="w-full rounded border-2 border-slate-200 p-2 text-center text-sm focus:border-purple-500 outline-none disabled:bg-slate-100"
                                placeholder="Max"
                              />
                              <input
                                type="number"
                                value={subject.practicalObtainedMarks}
                                onChange={(e) =>
                                  handleSubjectMarkChange(
                                    index,
                                    "practicalObtainedMarks",
                                    e.target.value
                                  )
                                }
                                max={subject.practicalMaxMarks}
                                disabled={!isEditable || subject.isAbsent}
                                className="w-full rounded border-2 border-slate-200 p-2 text-center text-sm focus:border-purple-500 outline-none disabled:bg-slate-100"
                                placeholder="Obt"
                              />
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">
                              No Practical
                            </span>
                          )}
                        </td>

                        {/* Practical toggle */}
                        <td className="border p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handlePracticalToggle(index)}
                            disabled={!isEditable || subject.isAbsent}
                            className={`px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2 mx-auto ${
                              subject.hasPractical
                                ? "bg-green-500 text-white hover:bg-green-600"
                                : "bg-slate-300 text-slate-600 hover:bg-slate-400"
                            } disabled:opacity-50`}
                            title={
                              subject.hasPractical
                                ? "Disable Practical"
                                : "Enable Practical"
                            }
                          >
                            {subject.hasPractical ? (
                              <>
                                <FaToggleOn className="text-lg" />
                                ON
                              </>
                            ) : (
                              <>
                                <FaToggleOff className="text-lg" />
                                OFF
                              </>
                            )}
                          </button>
                        </td>

                        {/* IA */}
                        <td className="border p-3">
                          <div className="flex flex-col gap-2">
                            <input
                              type="number"
                              value={subject.iaMaxMarks}
                              onChange={(e) =>
                                handleSubjectMarkChange(
                                  index,
                                  "iaMaxMarks",
                                  e.target.value
                                )
                              }
                              disabled={!isEditable || subject.isAbsent}
                              className="w-full rounded border-2 border-slate-200 p-2 text-center text-sm focus:border-purple-500 outline-none disabled:bg-slate-100"
                              placeholder="Max"
                            />
                            <input
                              type="number"
                              value={subject.iaObtainedMarks}
                              onChange={(e) =>
                                handleSubjectMarkChange(
                                  index,
                                  "iaObtainedMarks",
                                  e.target.value
                                )
                              }
                              max={subject.iaMaxMarks}
                              disabled={!isEditable || subject.isAbsent}
                              className="w-full rounded border-2 border-slate-200 p-2 text-center text-sm focus:border-purple-500 outline-none disabled:bg-slate-100"
                              placeholder="Obt"
                            />
                          </div>
                        </td>

                        {/* Grace */}
                        <td className="border p-3 text-center">
                          <input
                            type="number"
                            value={subject.graceMarks}
                            onChange={(e) =>
                              handleSubjectMarkChange(
                                index,
                                "graceMarks",
                                e.target.value
                              )
                            }
                            max={5}
                            min={0}
                            disabled={!isEditable || subject.isAbsent}
                            className="w-16 rounded border-2 border-slate-200 p-2 text-center focus:border-purple-500 outline-none disabled:bg-slate-100"
                          />
                        </td>

                        {/* Grade */}
                        <td className="border p-3 text-center">
                          <span className="px-3 py-1 rounded-full font-bold text-sm bg-purple-100 text-purple-800">
                            {subject.grade || "-"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="border p-3 text-center">
                          <select
                            value={subject.status}
                            onChange={(e) =>
                              handleSubjectMarkChange(
                                index,
                                "status",
                                e.target.value
                              )
                            }
                            disabled={!isEditable || subject.isAbsent}
                            className="w-full rounded border-2 border-slate-200 p-2 text-sm focus:border-purple-500 outline-none disabled:bg-slate-100"
                          >
                            <option value="PASS">PASS</option>
                            <option value="FAIL">FAIL</option>
                            <option value="PASS_BY_GRACE">PASS BY GRACE</option>
                            <option value="ABSENT">ABSENT</option>
                          </select>
                        </td>

                        {/* Absent */}
                        <td className="border p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleAbsentToggle(index)}
                            disabled={!isEditable}
                            className={`p-2 rounded-lg transition-all ${
                              subject.isAbsent
                                ? "bg-red-500 text-white"
                                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                            } disabled:opacity-50`}
                          >
                            {subject.isAbsent ? <FaTimes /> : "Mark"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Remarks only */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Remarks</h2>
            <textarea
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              disabled={!isEditable}
              className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-purple-500 outline-none resize-none disabled:bg-slate-100"
              rows="3"
              placeholder="Optional remarks about student performance"
            />
          </div>

          {isEditable && (
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:shadow-xl disabled:opacity-50 transition-all"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Update Result
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
