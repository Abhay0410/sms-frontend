import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../../services/api";
import {
  FaCloudUploadAlt,
  FaFileCsv,
  FaInfoCircle,
  FaCheckCircle,
  FaSpinner,
  FaDownload,
  FaUniversity,
  FaUserTie,
  FaUserGraduate,
} from "react-icons/fa";

export default function BulkImport({ type = "academic" }) {
  const importType = type;
  const [file, setFile] = useState(null);
  // Default changed to Academic first
  const [loading, setLoading] = useState(false);
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [session, setSession] = useState([]);

  const sampleData = {
    academic:
      'ClassName,ClassNumeric,SectionName,Subjects,Capacity\n10,10,A,"Math,Science,English",40\n9,9,B,"Hindi,SST",35',
    teacher:
      "Name,TeacherID,Email,Phone,Designation,Department\nAbhay Singh,TCHR26001,abhay@school.com,9876543210,Senior Teacher,Science\nJohn Doe,TCHR26002,john@school.com,8877665544,Librarian,Library",
    student:
      "Name,AdmissionID,RollNumber,Email,ClassName,Section,ParentName,ParentPhone,Gender,ParentID,ParentEmail\nAarav Sharma,STU26051,1,aarav@mail.com,10,B,Rajesh Sharma,9812345670,Male,PAR250001,rajesh@parent.com",
  };

  // Instruction Data Map
  const instructions = {
    academic: {
      icon: <FaUniversity className="text-blue-500" />,
      title: "Academic Structure Setup",
      steps: [
        "Use headers: ClassName, ClassNumeric, SectionName, Subjects, Capacity",
        "Separate multiple subjects with commas (e.g., Math, Science, English)",
        "This creates Classes and Sections in one go.",
      ],
    },
    teacher: {
      icon: <FaUserTie className="text-emerald-500" />,
      title: "Staff Onboarding",
      steps: [
        "Use headers: Name, TeacherID, Email, Phone, Designation, Department",
        "Ensure Email and TeacherID are unique.",
        "Default password 'Teacher@123' will be assigned.",
      ],
    },
    student: {
      icon: <FaUserGraduate className="text-purple-500" />,
      title: "Student & Parent Enrollment",
      steps: [
        "Headers: Name, AdmissionID, Email, ClassName, Section, ParentName, ParentPhone, Gender",
        "Classes must exist before importing students.",
        "Parents and Fee Roadmaps are auto-generated.",
      ],
    },
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== "text/csv") {
      toast.error("Please upload only CSV files");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.warning("Please select a file first");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("academicYear", academicYear);

    // ✅ Switch Endpoint based on type
    let endpoint = "";
    if (importType === "academic")
      endpoint = "/api/admin/onboarding/import-academics";
    else if (importType === "teacher")
      endpoint = "/api/admin/onboarding/import-teachers";
    else endpoint = "/api/admin/onboarding/import-students";

    setLoading(true);
    try {
      const res = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(
        res.message ||
          `Imported ${res.data?.success || res.data?.created || 0} records.`,
      );
      setFile(null);
    } catch (err) {
      toast.error(
        err?.message ||
          "Import failed. Check CSV format and Class availability.",
      );
    } finally {
      setLoading(false);
    }
  };

  //  const fetchSessions = async () => {
  //   try {
  //     // const res = await api.get(API_ENDPOINTS.SESSION.GET_All_SESSION);
  //     const res = await api.get(API_ENDPOINTS.SESSION.GET_All_SESSION, {
  //   headers: {
  //     "Cache-Control": "no-cache",
  //   },
  // });
  //     console.log(API_ENDPOINTS.SESSION.GET_All_SESSION);

  //   const sessionData = res?.data || [];

  //     const currentYear = new Date().getFullYear();

  //     // ✅ filter: past 2 + present + next 3
  //     sessionData = sessionData.filter(
  //       (s) =>
  //         s.startYear >= currentYear - 2 &&
  //         s.startYear <= currentYear + 3
  //     );

  //     // ✅ sort
  //     sessionData.sort((a, b) => a.startYear - b.startYear);

  //     setSession(sessionData);

  //     // ✅ active select
  //     const active = sessionData.find((s) => s?.isActive);

  //     if (active) {
  //       setAcademicYear(`${active.startYear}-${active.endYear}`);
  //     } else if (sessionData.length > 0) {
  //       const latest = sessionData[sessionData.length - 1];
  //       setAcademicYear(`${latest.startYear}-${latest.endYear}`);
  //     }

  //   } catch (err) {
  //     console.error("Session fetch error", err);
  //   }
  // };

  // const fetchSessions = async () => {
  //   try {
  //     const res = await api.get(API_ENDPOINTS.SESSION.GET_All_SESSION);

  // console.log("FULL RES:", res);

  // // 🔥 handle both cases
  // const sessionData = Array.isArray(res) ? res : res?.data || [];

  // console.log("SESSION DATA:", sessionData);

  // setSession(sessionData);

  //     const active = sessionData.find((s) => s?.isActive);

  //     if (active) {
  //       setAcademicYear(`${active.startYear}-${active.endYear}`);
  //     }

  //   } catch (err) {
  //     console.error("Session fetch error", err);
  //   }
  // };

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
            (x) => x.startYear === s.startYear && x.endYear === s.endYear,
          ),
      );

      // ✅ Sort
      sessionData.sort((a, b) => a.startYear - b.startYear);

      console.log("FINAL SESSION DATA:", sessionData);

      setSession(sessionData);

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

  const phaseTitle = {
    academic: "Academic Setup",
    teacher: "Teacher Import",
    student: "Student Import",
  };

  const handleDownloadSample = () => {
    try {
      const data = sampleData[importType];
      const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sample_${importType}_onboarding.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Memory saaf karne ke liye
    } catch {
      toast.error("Failed to generate sample file");
    }
  };

  return (
    <div className=" max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center  shadow-lg">
          <FaCloudUploadAlt size={40} />
        </div>
        <div className="flex flex-col ">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Onboarding Engine
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Universal CSV importer to set up entire school infrastructure in
            minutes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Left: Dynamic Instructions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-slate-50 rounded-2xl">
                {instructions[importType].icon}
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                {instructions[importType].title}
              </h3>
            </div>

            <ul className="space-y-4">
              {instructions[importType].steps.map((step, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm font-medium text-slate-500"
                >
                  <FaCheckCircle className="text-indigo-400 mt-1 flex-shrink-0" />
                  {step}
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDownloadSample}
                className="w-full py-4 px-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg"
              >
                <FaDownload /> Download Sample {importType.toUpperCase()} CSV
              </button>
            </div>
          </div>
        </div>

        {/* Right: Upload Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-10 rounded-2xl shadow-2xl border border-slate-100">
            <form onSubmit={handleUpload} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[14px] font-semibold text-slate-400 uppercase tracking-widest ml-2">
                    {phaseTitle[importType]}
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 ">
                    Target Academic Session
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="px-4 py-2.5 bg-slate-100 border border-slate-600 rounded-xl text-sm font-medium text-black ml-2"
                  >
                    {session?.map((s) => (
                      <option key={s._id} value={`${s.startYear}-${s.endYear}`}>
                        {s.startYear}-{s.endYear}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upload Zone */}
              <div className="relative group">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept=".csv"
                />
                <div
                  className={`
                  border-4 border-dashed rounded-[3rem] p-20 text-center transition-all
                  ${file ? "bg-indigo-50/50 border-indigo-200" : "bg-slate-50 border-slate-200 group-hover:border-indigo-400 group-hover:bg-white"}
                `}
                >
                  {file ? (
                    <div className="space-y-4 animate-in zoom-in-95 duration-200">
                      <FaFileCsv
                        size={70}
                        className="text-indigo-600 mx-auto"
                      />
                      <div>
                        <p className="font-bold text-indigo-900 text-lg">
                          {file.name}
                        </p>
                        <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">
                          Ready to Inject Data
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <FaCloudUploadAlt
                        size={70}
                        className="text-slate-200 mx-auto group-hover:text-indigo-200 transition-colors"
                      />
                      <div>
                        <p className="font-bold text-slate-400 uppercase tracking-widest text-sm">
                          Select CSV Manifest
                        </p>
                        <p className="text-[10px] text-slate-300 italic mt-1 font-medium">
                          Click to browse or drop file here
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                disabled={loading || !file}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-[2.5rem] font-bold uppercase tracking-[0.3em] text-xs shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:bg-slate-300"
              >
                {loading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <>
                    <FaCheckCircle size={20} /> Execute Migration
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-center gap-4 max-w-3xl mx-auto">
        <FaInfoCircle className="text-amber-500" />
        <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
          Warning: Performing an import will add new records to the database.
          Ensure no overlapping IDs exist in your CSV.
        </p>
      </div>
    </div>
  );
}
