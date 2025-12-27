// pages/teacher/Teacher_Features/Results/CreateResult.jsx - UPDATED
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../../services/api";
import BackButton from "../../../../components/BackButton";
import { FaSpinner, FaSave, FaStar, FaTimes, FaToggleOn, FaToggleOff } from "react-icons/fa";

export default function CreateResult() {
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    examType: "FINAL",
    examYear: new Date().getFullYear(),
    studentId: "",
    remarks: "",
  });
  const [subjectMarks, setSubjectMarks] = useState([]);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
  try {
    setLoading(true);
    const resp = await api.get(API_ENDPOINTS.TEACHER.RESULT.SECTIONS);

    // successResponse unwrap
    const outer = resp?.data || resp;
    const payload = outer.data || outer;

    setSections(payload.sections || []);
  } catch (err) {
    toast.error("Failed to load sections");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const handleSectionChange = async (sectionInfo) => {
    if (!sectionInfo) return;
    const [classId, sectionName] = sectionInfo.split("|");
    const section = sections.find(s => s.classId === classId && s.sectionName === sectionName);
    setSelectedSection(section);
    setSubjects(section.subjects || []);
    const initialMarks = section.subjects.map(sub => ({
      subjectName: sub.subjectName,
      subjectCode: sub.subjectCode || "",
      hasPractical: sub.hasPractical || false,
      theoryMaxMarks: 100,
      theoryObtainedMarks: "",
      practicalMaxMarks: sub.hasPractical ? 50 : 0,
      practicalObtainedMarks: sub.hasPractical ? "" : 0,
      iaMaxMarks: 20,
      iaObtainedMarks: "",
      graceMarks: 0,
      grade: "",
      status: "FAIL",
      isAbsent: false,
    }));
    setSubjectMarks(initialMarks);
    try {
  const resp = await api.get(API_ENDPOINTS.TEACHER.RESULT.STUDENTS, {
    params: {
      classId,
      section: sectionName,   // ya sectionId, neeche point 2 dekho
    },
  });

  const outer = resp?.data || resp;
  const payload = outer.data || outer;

  const studentsRaw = payload.students || payload.data || [];

  setStudents(Array.isArray(studentsRaw) ? studentsRaw : []);
} catch (err) {
  console.error("Result students load error:", err);
  toast.error("Failed to load students");
  setStudents([]);
}

  };

  const handleStudentChange = async (studentId) => {
    if (!studentId) return;
    const student = students.find(s => s.id === studentId);
    setSelectedStudent(student);
    setFormData({ ...formData, studentId });
  };

  const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 33) return 'D';
    if (percentage >= 25) return 'E';
    return 'F';
  };

  const handleSubjectMarkChange = (index, field, value) => {
    const updated = [...subjectMarks];
    
    // Allow only numbers for marks fields
    if (field.includes('Marks')) {
      // Remove non-numeric characters
      const numericValue = value.replace(/[^0-9]/g, '');
      updated[index][field] = numericValue;
    } else if (field === 'graceMarks') {
      updated[index][field] = Number(value) || 0;
    } else {
      updated[index][field] = value;
    }
    
    const subject = updated[index];
    
    const totalMax = Number(subject.theoryMaxMarks || 0) + 
                     Number(subject.practicalMaxMarks || 0) + 
                     Number(subject.iaMaxMarks || 0);
                     
    const totalObtained = Number(subject.theoryObtainedMarks || 0) + 
                          Number(subject.practicalObtainedMarks || 0) + 
                          Number(subject.iaObtainedMarks || 0);
                          
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    updated[index].grade = calculateGrade(percentage);
    
    setSubjectMarks(updated);
  };

  // ✅ NEW: Toggle practical exam
  const handlePracticalToggle = (index) => {
    const updated = [...subjectMarks];
    updated[index].hasPractical = !updated[index].hasPractical;
    
    if (!updated[index].hasPractical) {
      // Disable practical
      updated[index].practicalMaxMarks = 0;
      updated[index].practicalObtainedMarks = 0;
    } else {
      // Enable practical with default
      updated[index].practicalMaxMarks = 50;
      updated[index].practicalObtainedMarks = "";
    }
    
    // Recalculate grade
    const totalMax = Number(updated[index].theoryMaxMarks || 0) + 
                     Number(updated[index].practicalMaxMarks || 0) + 
                     Number(updated[index].iaMaxMarks || 0);
    const totalObtained = Number(updated[index].theoryObtainedMarks || 0) + 
                          Number(updated[index].practicalObtainedMarks || 0) + 
                          Number(updated[index].iaObtainedMarks || 0);
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    updated[index].grade = calculateGrade(percentage);
    
    setSubjectMarks(updated);
  };

  const handleAbsentToggle = (index) => {
    const updated = [...subjectMarks];
    updated[index].isAbsent = !updated[index].isAbsent;
    if (updated[index].isAbsent) {
      updated[index].theoryObtainedMarks = "";
      updated[index].practicalObtainedMarks = "";
      updated[index].iaObtainedMarks = "";
      updated[index].graceMarks = 0;
      updated[index].grade = "-";
      updated[index].status = "ABSENT";
    } else {
      updated[index].status = "FAIL";
    }
    setSubjectMarks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId) {
      toast.error("Please select a student");
      return;
    }
    if (subjectMarks.length === 0) {
      toast.error("No subjects found");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        ...formData,
        classId: selectedSection.classId,
        className: selectedSection.className,
        section: selectedSection.sectionName,
        subjects: subjectMarks.map(sub => ({
          ...sub,
          theoryObtainedMarks: Number(sub.theoryObtainedMarks) || 0,
          practicalObtainedMarks: Number(sub.practicalObtainedMarks) || 0,
          iaObtainedMarks: Number(sub.iaObtainedMarks) || 0,
          theoryMaxMarks: Number(sub.theoryMaxMarks) || 0,
          practicalMaxMarks: Number(sub.practicalMaxMarks) || 0,
          iaMaxMarks: Number(sub.iaMaxMarks) || 0,
          graceMarks: Number(sub.graceMarks) || 0,
        })),
      };
      await api.post(API_ENDPOINTS.TEACHER.RESULT.CREATE, payload);
      toast.success("Result created successfully!");
      setFormData({ ...formData, studentId: "", remarks: "" });
      setSelectedStudent(null);
      setSubjectMarks(subjects.map(sub => ({
        subjectName: sub.subjectName,
        subjectCode: sub.subjectCode || "",
        hasPractical: sub.hasPractical || false,
        theoryMaxMarks: 100,
        theoryObtainedMarks: "",
        practicalMaxMarks: sub.hasPractical ? 50 : 0,
        practicalObtainedMarks: sub.hasPractical ? "" : 0,
        iaMaxMarks: 20,
        iaObtainedMarks: "",
        graceMarks: 0,
        grade: "",
        status: "FAIL",
        isAbsent: false,
      })));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create result");
    } finally {
      setLoading(false);
    }
  };

  if (loading && sections.length === 0) {
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
          <h1 className="text-3xl font-bold text-slate-900">Create Result</h1>
          <p className="text-slate-600 mt-1">Enter marks for student examination</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exam Details Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Exam Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Exam Type <span className="text-red-500">*</span></label>
                <select value={formData.examType} onChange={(e) => setFormData({ ...formData, examType: e.target.value })} className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-purple-500 outline-none" required>
                  <option value="FINAL">Final Exam</option>
                  <option value="HALF_YEARLY">Half Yearly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="UNIT_TEST">Unit Test</option>
                  <option value="MID_TERM">Mid Term</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Exam Year <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.examYear} 
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({ ...formData, examYear: value });
                  }} 
                  className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-purple-500 outline-none" 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Class & Section Selection */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Select Class & Section</h2>
            <select onChange={(e) => handleSectionChange(e.target.value)} className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-purple-500 outline-none" required>
              <option value="">Choose a section</option>
              {sections.map((section) => (
                <option key={`${section.classId}-${section.sectionName}`} value={`${section.classId}|${section.sectionName}`}>
                  {section.className} - {section.sectionName} ({section.totalStudents} students)
                </option>
              ))}
            </select>
          </div>

          {/* Student Selection */}
          {students.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Select Student</h2>
              <select value={formData.studentId} onChange={(e) => handleStudentChange(e.target.value)} className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-purple-500 outline-none" required>
                <option value="">Choose a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>{student.rollNumber} - {student.name} ({student.studentID})</option>
                ))}
              </select>
              {selectedStudent && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-slate-700"><span className="font-semibold">Father's Name:</span> {selectedStudent.fatherName || "Not available"}</p>
                  <p className="text-sm text-slate-700 mt-1"><span className="font-semibold">Attendance:</span> Auto-fetched from database</p>
                </div>
              )}
            </div>
          )}

          {/* Marks Entry Table */}
          {subjectMarks.length > 0 && formData.studentId && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Enter Marks</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-purple-50">
                      <th className="border p-3 text-left font-semibold">Subject</th>
                      <th className="border p-3 text-center font-semibold">Theory<br/>(Max/Obtained)</th>
                      <th className="border p-3 text-center font-semibold">Practical<br/>(Max/Obtained)</th>
                      <th className="border p-3 text-center font-semibold">Toggle<br/>Practical</th>
                      <th className="border p-3 text-center font-semibold">IA<br/>(Max/Obtained)</th>
                      <th className="border p-3 text-center font-semibold">Grace</th>
                      <th className="border p-3 text-center font-semibold">Grade</th>
                      <th className="border p-3 text-center font-semibold">Status</th>
                      <th className="border p-3 text-center font-semibold">Absent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectMarks.map((subject, index) => (
                      <tr key={index} className={subject.isAbsent ? "bg-red-50" : ""}>
                        <td className="border p-3 font-medium">{subject.subjectName}</td>
                        
                        {/* Theory Marks */}
                        <td className="border p-3">
                          <div className="flex flex-col gap-2">
                            <input 
                              type="text" 
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={subject.theoryMaxMarks} 
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                handleSubjectMarkChange(index, 'theoryMaxMarks', value);
                              }} 
                              disabled={subject.isAbsent} 
                              className="w-full rounded border-2 border-slate-200 p-2 text-center focus:border-purple-500 outline-none text-sm" 
                              placeholder="Max" 
                            />
                            <input 
                              type="text" 
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={subject.theoryObtainedMarks} 
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                handleSubjectMarkChange(index, 'theoryObtainedMarks', value);
                              }} 
                              max={subject.theoryMaxMarks} 
                              disabled={subject.isAbsent} 
                              className="w-full rounded border-2 border-slate-200 p-2 text-center focus:border-purple-500 outline-none text-sm" 
                              placeholder="Obtained" 
                            />
                          </div>
                        </td>
                        
                        {/* Practical Marks */}
                        <td className="border p-3">
                          {subject.hasPractical ? (
                            <div className="flex flex-col gap-2">
                              <input 
                                type="text" 
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={subject.practicalMaxMarks} 
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9]/g, '');
                                  handleSubjectMarkChange(index, 'practicalMaxMarks', value);
                                }} 
                                disabled={subject.isAbsent} 
                                className="w-full rounded border-2 border-slate-200 p-2 text-center focus:border-purple-500 outline-none text-sm" 
                                placeholder="Max" 
                              />
                              <input 
                                type="text" 
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={subject.practicalObtainedMarks} 
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9]/g, '');
                                  handleSubjectMarkChange(index, 'practicalObtainedMarks', value);
                                }} 
                                max={subject.practicalMaxMarks} 
                                disabled={subject.isAbsent} 
                                className="w-full rounded border-2 border-slate-200 p-2 text-center focus:border-purple-500 outline-none text-sm" 
                                placeholder="Obtained" 
                              />
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">No Practical</span>
                          )}
                        </td>
                        
                        {/* ✅ Practical Toggle Button */}
                        <td className="border p-3 text-center">
                          <button 
                            type="button" 
                            onClick={() => handlePracticalToggle(index)} 
                            disabled={subject.isAbsent}
                            className={`px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2 mx-auto ${
                              subject.hasPractical 
                                ? "bg-green-500 text-white hover:bg-green-600" 
                                : "bg-slate-300 text-slate-600 hover:bg-slate-400"
                            } disabled:opacity-50`}
                            title={subject.hasPractical ? "Disable Practical" : "Enable Practical"}
                          >
                            {subject.hasPractical ? <><FaToggleOn className="text-lg" />ON</> : <><FaToggleOff className="text-lg" />OFF</>}
                          </button>
                        </td>
                        
                        {/* IA Marks */}
                        <td className="border p-3">
                          <div className="flex flex-col gap-2">
                            <input 
                              type="text" 
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={subject.iaMaxMarks} 
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                handleSubjectMarkChange(index, 'iaMaxMarks', value);
                              }} 
                              disabled={subject.isAbsent} 
                              className="w-full rounded border-2 border-slate-200 p-2 text-center focus:border-purple-500 outline-none text-sm" 
                              placeholder="Max" 
                            />
                            <input 
                              type="text" 
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={subject.iaObtainedMarks} 
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                handleSubjectMarkChange(index, 'iaObtainedMarks', value);
                              }} 
                              max={subject.iaMaxMarks} 
                              disabled={subject.isAbsent} 
                              className="w-full rounded border-2 border-slate-200 p-2 text-center focus:border-purple-500 outline-none text-sm" 
                              placeholder="Obtained" 
                            />
                          </div>
                        </td>
                        
                        {/* Grace Marks */}
                        <td className="border p-3">
                          <div className="flex items-center gap-2 justify-center">
                            <input 
                              type="text" 
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={subject.graceMarks} 
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                handleSubjectMarkChange(index, 'graceMarks', value);
                              }} 
                              max={5} 
                              min={0} 
                              disabled={subject.isAbsent} 
                              className="w-16 rounded border-2 border-slate-200 p-2 text-center focus:border-purple-500 outline-none" 
                            />
                            {subject.graceMarks > 0 && <FaStar className="text-yellow-500" title="Grace Marks" />}
                          </div>
                        </td>
                        
                        {/* Grade */}
                        <td className="border p-3 text-center">
                          <span className={`px-3 py-1 rounded-full font-bold text-sm ${subject.grade === 'A+' || subject.grade === 'A' ? 'bg-green-100 text-green-800' : subject.grade === 'B+' || subject.grade === 'B' ? 'bg-blue-100 text-blue-800' : subject.grade === 'C+' || subject.grade === 'C' ? 'bg-yellow-100 text-yellow-800' : subject.grade === 'F' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                            {subject.grade || '-'}
                          </span>
                        </td>
                        
                        {/* Status */}
                        <td className="border p-3">
                          <select value={subject.status} onChange={(e) => handleSubjectMarkChange(index, 'status', e.target.value)} disabled={subject.isAbsent} className="w-full rounded border-2 border-slate-200 p-2 text-sm focus:border-purple-500 outline-none">
                            <option value="PASS">PASS</option>
                            <option value="FAIL">FAIL</option>
                            <option value="PASS_BY_GRACE">PASS BY GRACE</option>
                          </select>
                        </td>
                        
                        {/* Absent Toggle */}
                        <td className="border p-3 text-center">
                          <button type="button" onClick={() => handleAbsentToggle(index)} className={`p-2 rounded-lg transition-all ${subject.isAbsent ? "bg-red-500 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>
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

          {/* Remarks */}
          {formData.studentId && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Remarks</h2>
              <textarea value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-purple-500 outline-none resize-none" rows="3" placeholder="Optional remarks about student performance" />
            </div>
          )}

          {/* Submit Button */}
          {formData.studentId && (
            <div className="flex gap-4">
              <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:shadow-xl disabled:opacity-50 transition-all">
                {loading ? (<><FaSpinner className="animate-spin" />Creating...</>) : (<><FaSave />Create Result</>)}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}