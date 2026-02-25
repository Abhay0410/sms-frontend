import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { 
  FaCloudUploadAlt, FaFileCsv, FaInfoCircle, 
  FaCheckCircle, FaSpinner, FaDownload, FaUniversity,
  FaUserTie, FaUserGraduate
} from "react-icons/fa";

export default function BulkImport() {
  const [file, setFile] = useState(null);
  const [importType, setImportType] = useState("academic"); // Default changed to Academic first
  const [loading, setLoading] = useState(false);
  const [academicYear, setAcademicYear] = useState("2025-2026");

  // Instruction Data Map
  const instructions = {
    academic: {
      icon: <FaUniversity className="text-blue-500" />,
      title: "Academic Structure Setup",
      steps: [
        "Use headers: ClassName, ClassNumeric, SectionName, Subjects, Capacity",
        "Separate multiple subjects with commas (e.g., Math, Science, English)",
        "This creates Classes and Sections in one go."
      ]
    },
    teacher: {
      icon: <FaUserTie className="text-emerald-500" />,
      title: "Staff Onboarding",
      steps: [
        "Use headers: Name, TeacherID, Email, Phone, Designation, Department",
        "Ensure Email and TeacherID are unique.",
        "Default password 'Teacher@123' will be assigned."
      ]
    },
    student: {
      icon: <FaUserGraduate className="text-purple-500" />,
      title: "Student & Parent Enrollment",
      steps: [
        "Headers: Name, AdmissionID, Email, ClassName, Section, ParentName, ParentPhone, Gender",
        "Classes must exist before importing students.",
        "Parents and Fee Roadmaps are auto-generated."
      ]
    }
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
    if (importType === "academic") endpoint = "/api/admin/onboarding/import-academics";
    else if (importType === "teacher") endpoint = "/api/admin/onboarding/import-teachers";
    else endpoint = "/api/admin/onboarding/import-students";

    setLoading(true);
    try {
      const res = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success(res.message || `Imported ${res.data?.success || res.data?.created || 0} records.`);
      setFile(null);
    } catch (err) {
      toast.error(err?.message || "Import failed. Check CSV format and Class availability.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="h-20 w-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
          <FaCloudUploadAlt size={40} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Onboarding Engine</h1>
        <p className="text-slate-500 font-medium max-w-lg mx-auto">
          Universal CSV importer to set up entire school infrastructure in minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Dynamic Instructions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-3 bg-slate-50 rounded-2xl">{instructions[importType].icon}</div>
               <h3 className="text-lg font-black text-slate-800">{instructions[importType].title}</h3>
            </div>
            
            <ul className="space-y-4">
              {instructions[importType].steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm font-medium text-slate-500">
                  <FaCheckCircle className="text-indigo-400 mt-1 flex-shrink-0" />
                  {step}
                </li>
              ))}
            </ul>
            
            <div className="mt-8 pt-8 border-t border-slate-100">
               <button className="w-full py-4 px-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all">
                 <FaDownload /> Download Sample CSV
               </button>
            </div>
          </div>
        </div>

        {/* Right: Upload Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
            <form onSubmit={handleUpload} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Execution Phase</label>
                  <select 
                    value={importType} 
                    onChange={(e) => {setImportType(e.target.value); setFile(null);}}
                    className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold text-slate-700 outline-none focus:ring-2 ring-indigo-500/20"
                  >
                    <option value="academic">Step 1: Academic Structure (Classes/Subjects)</option>
                    <option value="teacher">Step 2: Staff Onboarding (Teachers)</option>
                    <option value="student">Step 3: Student Enrollment (With Fees/Parents)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Target Academic Session</label>
                  <select 
                    value={academicYear} 
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold text-slate-700 outline-none focus:ring-2 ring-indigo-500/20"
                  >
                    <option>2024-2025</option>
                    <option>2025-2026</option>
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
                <div className={`
                  border-4 border-dashed rounded-[3rem] p-20 text-center transition-all
                  ${file ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-200 group-hover:border-indigo-400 group-hover:bg-white'}
                `}>
                  {file ? (
                    <div className="space-y-4 animate-in zoom-in-95 duration-200">
                      <FaFileCsv size={70} className="text-indigo-600 mx-auto" />
                      <div>
                         <p className="font-black text-indigo-900 text-lg">{file.name}</p>
                         <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Ready to Inject Data</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <FaCloudUploadAlt size={70} className="text-slate-200 mx-auto group-hover:text-indigo-200 transition-colors" />
                      <div>
                        <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Select CSV Manifest</p>
                        <p className="text-[10px] text-slate-300 italic mt-1 font-medium">Click to browse or drop file here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button 
                disabled={loading || !file}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:bg-slate-300"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <><FaCheckCircle size={20} /> Execute Migration</>}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-center gap-4 max-w-3xl mx-auto">
         <FaInfoCircle className="text-amber-500" />
         <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            Warning: Performing an import will add new records to the database. Ensure no overlapping IDs exist in your CSV.
         </p>
      </div>
    </div>
  );
}