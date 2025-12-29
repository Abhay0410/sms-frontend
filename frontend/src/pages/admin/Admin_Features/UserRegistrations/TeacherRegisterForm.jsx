// // pages/admin/Admin_Features/UserRegistrations/TeacherRegisterForm.jsx
// import { useState } from "react";
// import { toast } from "react-toastify";
// import api from "../../../../services/api";
// import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
// import BackButton from "../../../../components/BackButton";
// import { FaCheck, FaSpinner, FaCopy } from "react-icons/fa";

// export default function TeacherRegisterForm() {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     address: "",
//     gender: "",
//     dateOfBirth: "",
//     qualification: "",
//     subjects: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [createdTeacher, setCreatedTeacher] = useState(null);

//   const onChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//    const onSubmit = async (e) => {
//     e.preventDefault();

//     if (!form.name || !form.email || !form.phone) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     try {
//       setLoading(true);

//       const payload = {
//         name: form.name,
//         email: form.email,
//         phone: form.phone,
//         address: form.address,
//         gender: form.gender,
//         dateOfBirth: form.dateOfBirth,
//         qualification: form.qualification,
//         subjects: form.subjects.split(",").map((s) => s.trim()).filter(Boolean),
//         isActive: true,
//       };

//       console.log("📤 Creating teacher:", payload);

//       const resp = await api.post(API_ENDPOINTS.ADMIN.TEACHER.CREATE, payload);
//       console.log("📥 Raw API Response:", resp);

//       // ✅ FIX: Normalize the data structure
//       // 1. Check if 'teacher' is a top-level property
//       // 2. Check if 'data' is the wrapper (common in axios/api helpers)
//       // 3. Fallback to the response itself
//       let teacherData = resp.teacher || resp.data || resp;

//       // Handle nested data scenario (e.g., { data: { teacher: {...} } })
//       if (teacherData.teacher) {
//         teacherData = teacherData.teacher;
//       }

//       // Ensure credentials exist (sometimes they are at the root of the response)
//       if (!teacherData.credentials && (resp.credentials || resp.data?.credentials)) {
//         teacherData.credentials = resp.credentials || resp.data?.credentials;
//       }

//       console.log("👤 Final Teacher Object:", teacherData);

//       setCreatedTeacher(teacherData);
//       toast.success("Teacher registered successfully!");

//       // Reset form
//       setForm({
//         name: "",
//         email: "",
//         phone: "",
//         address: "",
//         gender: "",
//         dateOfBirth: "",
//         qualification: "",
//         subjects: "",
//       });
//     } catch (err) {
//       console.error("❌ Registration error:", err);
//       const msg = err?.message || "Failed to register teacher";
//       toast.error(msg);
//     } finally {
//       setLoading(false);
//     }
//   };


//   // ✅ Copy to clipboard function
//   const copyToClipboard = (text, label) => {
//     navigator.clipboard.writeText(text).then(() => {
//       toast.success(`${label} copied to clipboard!`);
//     }).catch(() => {
//       toast.error("Failed to copy");
//     });
//   };

//   // ✅ Copy all credentialsF
//   const copyAllCredentials = () => {
//     const credentials = `Teacher Credentials
// ━━━━━━━━━━━━━━━━━━━━
// Name: ${createdTeacher?.name}
// Teacher ID: ${createdTeacher?.teacherID}
// Email: ${createdTeacher?.email}
// Password: ${createdTeacher?.credentials?.defaultPassword || 'Teacher@2025'}
// ━━━━━━━━━━━━━━━━━━━━
// Login URL: ${window.location.origin}/signin`;

//     navigator.clipboard.writeText(credentials).then(() => {
//       toast.success("All credentials copied to clipboard!");
//     }).catch(() => {
//       toast.error("Failed to copy credentials");
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
//       <div className="mx-auto max-w-4xl">
//         <BackButton to="/admin/admin-dashboard" />

//         <div className="mt-6">
//           <h2 className="text-3xl font-bold text-gray-900">Register Teacher</h2>
//           <p className="mt-2 text-sm text-gray-600">Add a new teacher to the system</p>
//         </div>

//         <form onSubmit={onSubmit} className="mt-6">
//           <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
//             <h3 className="mb-6 text-xl font-semibold text-gray-900">Teacher Information</h3>

//             <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//               {/* Full Name */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Full Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={form.name}
//                   onChange={onChange}
//                   className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//                   placeholder="Enter teacher's full name"
//                   required
//                 />
//               </div>

//               {/* Email */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={form.email}
//                   onChange={onChange}
//                   className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//                   placeholder="teacher@example.com"
//                   required
//                 />
//               </div>

//               {/* Phone */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Phone Number <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="tel"
//                   name="phone"
//                   pattern="[0-9]{10}"
//                   value={form.phone}
//                   onChange={onChange}
//                   className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//                   placeholder="10-digit phone number"
//                   required
//                 />
//               </div>

//               {/* Gender */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Gender <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="gender"
//                   value={form.gender}
//                   onChange={onChange}
//                   className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//                   required
//                 >
//                   <option value="">Select Gender</option>
//                   <option value="Male">Male</option>
//                   <option value="Female">Female</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>

//               {/* Date of Birth */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Date of Birth <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="dateOfBirth"
//                   value={form.dateOfBirth}
//                   onChange={onChange}
//                   className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//                   required
//                 />
//               </div>

//               {/* Qualification */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Qualification
//                 </label>
//                 <input
//                   type="text"
//                   name="qualification"
//                   value={form.qualification}
//                   onChange={onChange}
//                   className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//                   placeholder="B.Ed, M.Ed, etc."
//                 />
//               </div>

//               {/* Subjects */}
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Subjects (comma-separated)
//                 </label>
//                 <input
//                   type="text"
//                   name="subjects"
//                   value={form.subjects}
//                   onChange={onChange}
//                   className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//                   placeholder="Math, Physics, Chemistry"
//                 />
//               </div>

//               {/* Address */}
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Address <span className="text-red-500">*</span>
//                 </label>
//                 <textarea
//                   name="address"
//                   value={form.address}
//                   onChange={onChange}
//                   className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//                   placeholder="Enter full address"
//                   rows="3"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="mt-8 flex justify-end">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className={`flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-3 font-medium text-white transition hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 ${
//                   loading ? "opacity-60 cursor-not-allowed" : ""
//                 }`}
//               >
//                 {loading ? (
//                   <>
//                     <FaSpinner className="h-4 w-4 animate-spin" />
//                     Registering...
//                   </>
//                 ) : (
//                   <>
//                     <FaCheck className="h-4 w-4" />
//                     Register Teacher
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </form>

//         {/* ✅ SUCCESS MESSAGE WITH COPY BUTTONS */}
//         {createdTeacher && (
//           <div className="mt-6 rounded-lg border-l-4 border-green-500 bg-green-50 p-6 shadow-md">
//             <div className="flex items-start">
//               <FaCheck className="h-6 w-6 text-green-400 flex-shrink-0" />
//               <div className="ml-4 flex-1">
//                 <h3 className="text-lg font-semibold text-green-800 mb-2">
//                   Registration Successful! 🎉
//                 </h3>

//                 <div className="mt-4 rounded-lg bg-white p-5 shadow-sm border border-green-200">
//                   <div className="flex justify-between items-center mb-3">
//                     <h4 className="font-semibold text-gray-900">Teacher Credentials</h4>
//                     <button
//                       onClick={copyAllCredentials}
//                       className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
//                     >
//                       <FaCopy className="h-3 w-3" />
//                       Copy All
//                     </button>
//                   </div>

//                   <div className="space-y-3">
//                     {/* Name */}
//                     <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
//                       <div>
//                         <p className="text-xs text-gray-600">Name</p>
//                         <p className="font-medium text-gray-900">{createdTeacher?.name}</p>
//                       </div>
//                       <button
//                         onClick={() => copyToClipboard(createdTeacher?.name, "Name")}
//                         className="p-2 hover:bg-gray-200 rounded transition"
//                         title="Copy name"
//                       >
//                         <FaCopy className="h-3 w-3 text-gray-600" />
//                       </button>
//                     </div>

//                     {/* Teacher ID */}
//                     <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
//                       <div>
//                         <p className="text-xs text-gray-600">Teacher ID</p>
//                         <p className="font-mono font-medium text-indigo-700">{createdTeacher?.teacherID || createdTeacher?.teacher?.teacherID || "N/A"}</p>
//                       </div>
//                       <button
//                         onClick={() => copyToClipboard(createdTeacher?.teacherID || createdTeacher?.teacher?.teacherID, "Teacher ID")}
//                         className="p-2 hover:bg-gray-200 rounded transition"
//                         title="Copy Teacher ID"
//                       >
//                         <FaCopy className="h-3 w-3 text-gray-600" />
//                       </button>
//                     </div>

//                     {/* Email */}
//                     <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
//                       <div>
//                         <p className="text-xs text-gray-600">Email</p>
//                         <p className="text-gray-900">{createdTeacher?.email}</p>
//                       </div>
//                       <button
//                         onClick={() => copyToClipboard(createdTeacher?.email, "Email")}
//                         className="p-2 hover:bg-gray-200 rounded transition"
//                         title="Copy email"
//                       >
//                         <FaCopy className="h-3 w-3 text-gray-600" />
//                       </button>
//                     </div>

//                     {/* Password */}
//                     <div className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-200">
//                       <div>
//                         <p className="text-xs text-red-600 font-medium">Default Password</p>
//                         <p className="font-mono font-bold text-red-700">
//                           {createdTeacher?.credentials?.defaultPassword || 'Teacher@2025'}
//                         </p>
//                       </div>
//                       <button
//                         onClick={() => copyToClipboard(
//                           createdTeacher?.credentials?.defaultPassword || 'Teacher@2025',
//                           "Password"
//                         )}
//                         className="p-2 hover:bg-red-100 rounded transition"
//                         title="Copy password"
//                       >
//                         <FaCopy className="h-3 w-3 text-red-600" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                   <p className="text-xs text-yellow-800 flex items-start gap-2">
//                     <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                     </svg>
//                     <span>
//                       <strong>Important:</strong> Share these credentials with the teacher and advise them to change the password after first login.
//                     </span>
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
// pages/admin/Admin_Features/UserRegistrations/TeacherRegisterForm.jsx
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import BackButton from "../../../../components/BackButton";
import { FaCheck, FaSpinner, FaCopy } from "react-icons/fa";
import Select from "react-select";

export default function TeacherRegisterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      city: "",
      state: "",
      country: "",
      pincode: "",
    },
    gender: "",
    dateOfBirth: "",
    qualification: [""],
    subjects: [],
  });

  const SUBJECT_OPTIONS = [
    "Math",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Hindi",
    "History",
    "Geography",
    "Computer Science",
    "Economics",
  ];

  const [loading, setLoading] = useState(false);
  const [createdTeacher, setCreatedTeacher] = useState(null);
  const [allSubjects, setAllSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  const credentialsRef = useRef(null);

 useEffect(() => {
  const fetchSubjects = async () => {
    try {
      setSubjectsLoading(true);

      const resp = await api.get(
        API_ENDPOINTS.ADMIN.SUBJECT_MANAGEMENT.ALL
      );

      const subjectsData = resp.data?.subjects || resp.subjects || [];

      // ✅ make subjects unique
      const uniqueSubjects = [
        ...new Set(subjectsData.map((s) => s.subjectName))
      ];

      setAllSubjects(uniqueSubjects);

    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      toast.error("Could not load subjects");
    } finally {
      setSubjectsLoading(false);
    }
  };

  fetchSubjects();
}, []);


  const onChange = (e) => {
    const { name, value } = e.target;

    if (["line1", "city", "state", "country", "pincode"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else if (name === "subjects") {
      setForm((prev) => ({
        ...prev,
        subjects: value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Qualification handlers
  const handleQualificationChange = (index, value) => {
    const updated = [...form.qualification];
    updated[index] = value;
    setForm((prev) => ({ ...prev, qualification: updated }));
  };

  const addQualification = () => {
    setForm((prev) => ({
      ...prev,
      qualification: [...prev.qualification, ""],
    }));
  };

  const removeQualification = (index) => {
    const updated = form.qualification.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, qualification: updated }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        qualification: form.qualification.filter(Boolean),

        subjects: form.subjects, // ✅ array
        isActive: true,
      };

      console.log("📤 Creating teacher:", payload);

      const resp = await api.post(API_ENDPOINTS.ADMIN.TEACHER.CREATE, payload);
      console.log("📥 Raw API Response:", resp);

      // ✅ FIX: Normalize the data structure
      // 1. Check if 'teacher' is a top-level property
      // 2. Check if 'data' is the wrapper (common in axios/api helpers)
      // 3. Fallback to the response itself
      let teacherData = resp.teacher || resp.data || resp;

      // Handle nested data scenario (e.g., { data: { teacher: {...} } })
      if (teacherData.teacher) {
        teacherData = teacherData.teacher;
      }

      // Ensure credentials exist (sometimes they are at the root of the response)
      if (
        !teacherData.credentials &&
        (resp.credentials || resp.data?.credentials)
      ) {
        teacherData.credentials = resp.credentials || resp.data?.credentials;
      }

      console.log("👤 Final Teacher Object:", teacherData);

      setCreatedTeacher(teacherData);
      toast.success("Teacher registered successfully!");

      // Reset form
      setForm({
        name: "",
        email: "",
        phone: "",
        address: {
          city: "",
          state: "",
          country: "",
          pincode: "",
        },
        gender: "",
        dateOfBirth: "",
        qualification: [""],
        subjects: [],
      });
    } catch (err) {
      console.error("❌ Registration error:", err);
      const msg = err?.message || "Failed to register teacher";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Copy to clipboard function
  const copyToClipboard = (text, label) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(`${label} copied to clipboard!`);
      })
      .catch(() => {
        toast.error("Failed to copy");
      });
  };

  // ✅ Copy all credentialsF
  const copyAllCredentials = () => {
    const credentials = `Teacher Credentials
━━━━━━━━━━━━━━━━━━━━
Name: ${createdTeacher?.name}
Teacher ID: ${createdTeacher?.teacherID}
Email: ${createdTeacher?.email}
Password: ${createdTeacher?.credentials?.defaultPassword || "Teacher@2025"}
━━━━━━━━━━━━━━━━━━━━
Login URL: ${window.location.origin}/signin`;

    navigator.clipboard
      .writeText(credentials)
      .then(() => {
        toast.success("All credentials copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy credentials");
      });
  };

  useEffect(() => {
    if (createdTeacher && credentialsRef.current) {
      credentialsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [createdTeacher]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <BackButton to="/admin/admin-dashboard" />

        <div className="mt-6">
          <h2 className="text-3xl font-bold text-gray-900">Register Teacher</h2>
          <p className="mt-2 text-sm text-gray-600">
            Add a new teacher to the system
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-6">
          <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
            <h3 className="mb-6 text-xl font-semibold text-gray-900">
              Teacher Information
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Enter teacher's full name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="teacher@example.com"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  pattern="[0-9]{10}"
                  value={form.phone}
                  onChange={onChange}
                  className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="10-digit phone number"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={onChange}
                  className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={onChange}
                  className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              {/* Qualification */}
              {/* Qualification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification
                </label>

                <div className="space-y-3">
                  {form.qualification.map((q, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={q}
                        onChange={(e) =>
                          handleQualificationChange(index, e.target.value)
                        }
                        className="flex-1 rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        placeholder="e.g. B.Ed, M.Ed"
                      />

                      {/* + Button (only last input) */}
                      {index === form.qualification.length - 1 && (
                        <button
                          type="button"
                          onClick={addQualification}
                          className="rounded-lg bg-indigo-600 px-4 text-white hover:bg-indigo-700"
                        >
                          +
                        </button>
                      )}

                      {/* Remove button (if more than one) */}
                      {form.qualification.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQualification(index)}
                          className="rounded-lg bg-red-500 px-4 text-white hover:bg-red-600"
                        >
                          −
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Subjects */}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjects
                </label>

                {subjectsLoading ? (
                  <p>Loading subjects...</p>
                ) : allSubjects.length > 0 ? (
                  <Select
                    isMulti
                    options={allSubjects.map((sub) => ({
                      value: sub,
                      label: sub,
                    }))}
                    value={allSubjects
                      .map((sub) => ({ value: sub, label: sub }))
                      .filter((option) => form.subjects.includes(option.value))}
                    onChange={(selectedOptions) => {
                      setForm((prev) => ({
                        ...prev,
                        subjects: selectedOptions
                          ? selectedOptions.map((option) => option.value)
                          : [],
                      }));
                    }}
                    placeholder="Select subjects"
                    className="basic-multi-select"
                    classNamePrefix="select"
                  />
                ) : (
                  <p>No subjects available</p>
                )}
              </div>

              {/* Address */}
              {/* Address Section */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.address.city}
                      onChange={onChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      placeholder="Enter city"
                      required
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={form.address.state}
                      onChange={onChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      placeholder="Enter state"
                      required
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={form.address.country}
                      onChange={onChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      placeholder="Enter country"
                      required
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={form.address.pincode}
                      onChange={onChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      placeholder="Enter pincode"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-3 font-medium text-white transition hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 ${
                  loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <FaCheck className="h-4 w-4" />
                    Register Teacher
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* ✅ SUCCESS MESSAGE WITH COPY BUTTONS */}
        {createdTeacher && (
          <div
            className="mt-6 rounded-lg border-l-4 border-green-500 bg-green-50 p-6 shadow-md"
            ref={credentialsRef}
          >
            <div className="flex items-start">
              <FaCheck className="h-6 w-6 text-green-400 flex-shrink-0" />
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Registration Successful! 🎉
                </h3>

                <div className="mt-4 rounded-lg bg-white p-5 shadow-sm border border-green-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-900">
                      Teacher Credentials
                    </h4>
                    <button
                      onClick={copyAllCredentials}
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                    >
                      <FaCopy className="h-3 w-3" />
                      Copy All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Name */}
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-xs text-gray-600">Name</p>
                        <p className="font-medium text-gray-900">
                          {createdTeacher?.name}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(createdTeacher?.name, "Name")
                        }
                        className="p-2 hover:bg-gray-200 rounded transition"
                        title="Copy name"
                      >
                        <FaCopy className="h-3 w-3 text-gray-600" />
                      </button>
                    </div>

                    {/* Teacher ID */}
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-xs text-gray-600">Teacher ID</p>
                        <p className="font-mono font-medium text-indigo-700">
                          {createdTeacher?.teacherID ||
                            createdTeacher?.teacher?.teacherID ||
                            "N/A"}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            createdTeacher?.teacherID ||
                              createdTeacher?.teacher?.teacherID,
                            "Teacher ID"
                          )
                        }
                        className="p-2 hover:bg-gray-200 rounded transition"
                        title="Copy Teacher ID"
                      >
                        <FaCopy className="h-3 w-3 text-gray-600" />
                      </button>
                    </div>

                    {/* Email */}
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <p className="text-gray-900">{createdTeacher?.email}</p>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(createdTeacher?.email, "Email")
                        }
                        className="p-2 hover:bg-gray-200 rounded transition"
                        title="Copy email"
                      >
                        <FaCopy className="h-3 w-3 text-gray-600" />
                      </button>
                    </div>

                    {/* Password */}
                    <div className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-200">
                      <div>
                        <p className="text-xs text-red-600 font-medium">
                          Default Password
                        </p>
                        <p className="font-mono font-bold text-red-700">
                          {createdTeacher?.credentials?.defaultPassword ||
                            "Teacher@2025"}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            createdTeacher?.credentials?.defaultPassword ||
                              "Teacher@2025",
                            "Password"
                          )
                        }
                        className="p-2 hover:bg-red-100 rounded transition"
                        title="Copy password"
                      >
                        <FaCopy className="h-3 w-3 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800 flex items-start gap-2">
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      <strong>Important:</strong> Share these credentials with
                      the teacher and advise them to change the password after
                      first login.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}