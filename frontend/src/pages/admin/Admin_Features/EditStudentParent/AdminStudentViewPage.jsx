


import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";


import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";

export default function AdminStudentViewPage() {

  const [pw, setPw] = useState({
    newPassword: "",
    confirm: "",
  });

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bloodGroup: "",
    nationality: "",
    address: "",
    gender: "",
    rollNumber: "",
    enrollmentNumber: "",
    scholarNumber: "",
    aadharNumber: "",
    academicYear: "",
    className: "",
    section: "",
    status: "",
    dateOfBirth: "",
    medicalHistory: "",
    allergies: "",
  });

  useEffect(() => {
    loadStudent();
  }, [studentId]);

  const loadStudent = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        API_ENDPOINTS.ADMIN.STUDENT.GET_BY_ID(studentId)
      );

      const s =
        res?.data?.data ||
        res?.data?.student ||
        res?.student ||
        res?.data ||
        res;

      setStudent(s);

      setForm({
        name: s.name || "",
        email: s.email || "",
        phone: s.phone || s.mobileNumber || "",
        bloodGroup: s.bloodGroup || "",
        nationality: s.nationality || "",
        address: formatAddress(s.address),
        gender: s.gender || "",
        rollNumber: s.rollNumber || "",
        enrollmentNumber: s.enrollmentNumber || "",
        scholarNumber: s.scholarNumber || "",
        aadharNumber: s.aadharNumber || "",
        academicYear: s.academicYear || s.registrationYear || "",
        className: s.className || s.class?.className || "",
        section: s.section || "",
        status: s.status || "",
        dateOfBirth: s.dateOfBirth
          ? String(s.dateOfBirth).slice(0, 10)
          : "",
        medicalHistory: s.medicalHistory || "",
        allergies: Array.isArray(s.allergies)
          ? s.allergies.join(", ")
          : s.allergies || "",
      });
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
        e.message ||
        "Failed to load student"
      );
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const onSave = async () => {
    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      if (photoFile) {
        formData.append("profilePicture", photoFile);
      }

      await api.uploadPut(
        API_ENDPOINTS.ADMIN.STUDENT.UPDATE(studentId),
        formData
      );

      toast.success("Student updated successfully");

      setIsEditing(false);
      setPhotoFile(null);
      setPhotoPreview("");

      await loadStudent();
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
        e.message ||
        "Update failed"
      );
    }
  };

  const changePassword = async () => {
    if (pw.newPassword !== pw.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    if (pw.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await api.put(
        API_ENDPOINTS.ADMIN.STUDENT.CHANGE_PASSWORD(studentId),
        {
          newPassword: pw.newPassword,
        }
      );

      toast.success("Password updated successfully");

      setPw({
        newPassword: "",
        confirm: "",
      });
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
        e.message ||
        "Failed to change password"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading student...
      </div>
    );
  }

  const photoUrl =
    photoPreview ||
    (student?.profilePicture
      ? student.profilePicture.startsWith("http")
        ? student.profilePicture
        : student.profilePicture
      : "/assets/default-student-avatar.png");

  
    // <div className="min-h-screen ">
    //   <div className="max-w-6xl mx-auto">

    //     {/* HEADER */}
       

    //     <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-2xl">
    //       <div className="flex flex-col md:flex-row gap-8 items-center">

    //         {/* PHOTO */}
    //         <div className="relative">
    //           <div className="h-32 w-32 rounded-2xl overflow-hidden border-4 border-white bg-white">
    //             <img
    //               src={photoUrl}
    //               alt="Student"
    //               className="h-full w-full object-cover"
    //             />
    //           </div>
    //         </div>

    //         {/* INFO */}
    //         <div className="flex-1">
    //           <h1 className="text-3xl font-bold">{student?.name}</h1>

    //           <div className="mt-3 space-y-1 text-slate-200">
    //             <p>Student ID : {student?.studentID}</p>
    //             <p>Email : {student?.email}</p>
    //             <p>Class : {student?.className} {student?.section}</p>
    //           </div>
    //         </div>

    //         {/* ACTIONS */}
    //         <div className="flex gap-3">
    //           {!isEditing ? (
    //             <button
    //               onClick={() => setIsEditing(true)}
    //               className="bg-indigo-600 px-6 py-2 rounded-xl hover:bg-indigo-700"
    //             >
    //               Edit Profile
    //             </button>
    //           ) : (
    //             <>
    //               <button
    //                 onClick={() => setIsEditing(false)}
    //                 className="bg-gray-200 text-black px-5 py-2 rounded-xl"
    //               >
    //                 Cancel
    //               </button>

    //               <button
    //                 onClick={onSave}
    //                 className="bg-green-600 px-5 py-2 rounded-xl"
    //               >
    //                 Save
    //               </button>
    //             </>
    //           )}
    //         </div>

    //       </div>
    //     </div>

    //     {/* PHOTO */}
    //     <div className="bg-white rounded-3xl p-6 shadow mt-8">
    //       <h2 className="text-xl font-bold mb-5">Profile Photo</h2>

    //       <div className="flex items-center gap-6">
    //         <img
    //           src={photoUrl}
    //           className="h-24 w-24 rounded-full object-cover border"
    //         />

    //         <input
    //           type="file"
    //           accept="image/*"
    //           onChange={onPhotoChange}
    //           disabled={!isEditing}
    //           className="disabled:opacity-50"
    //         />
    //       </div>
    //     </div>

    //     {/* FORM GRID */}
    //     <div className="mt-6 grid grid-cols-2 gap-4 bg-white p-6 rounded-2xl">

    //       {Object.keys(form).map((key) => (
    //         <div key={key}>
    //           <label className="text-sm font-semibold">
    //             {formatLabel(key)}
    //           </label>

    //           <input
    //             name={key}
    //             value={form[key]}
    //             onChange={onChange}
    //             disabled={!isEditing}
    //             className="w-full border p-2 rounded-lg"
    //           />
    //         </div>
    //       ))}
    //     </div>

    //     {/* PASSWORD SECTION */}
    //     {/* PASSWORD SECTION */}
    //     <div className={`mt-6 p-6 rounded-2xl transition ${isEditing ? "bg-slate-800 text-white" : "bg-slate-800 opacity-80"
    //       }`}>
    //       <h2 className="text-xl font-bold mb-4">
    //         Change Password
    //       </h2>

    //       {!isEditing && (
    //         <p className="text-sm text-gray-500 mb-4">
    //           Enable edit mode to change password
    //         </p>
    //       )}

    //       <div className="space-y-4">

    //         {/* NEW PASSWORD */}
    //         <div className="relative">
    //           <input
    //             type={showNew ? "text" : "password"}
    //             value={pw.newPassword}
    //             disabled={!isEditing}
    //             onChange={(e) =>
    //               setPw((prev) => ({
    //                 ...prev,
    //                 newPassword: e.target.value,
    //               }))
    //             }
    //             placeholder="New Password"
    //             className="w-full border text-white p-3 rounded-xl pr-10 disabled:bg-gray-200"
    //           />

    //           <button
    //             type="button"
    //             disabled={!isEditing}
    //             onClick={() => setShowNew(!showNew)}
    //             className="absolute right-3 top-1/2 -translate-y-1/2"
    //           >
    //             {showNew ? <FaEyeSlash /> : <FaEye />}
    //           </button>
    //         </div>

    //         {/* CONFIRM PASSWORD */}
    //         <div className="relative">
    //           <input
    //             type={showConfirm ? "text" : "password"}
    //             value={pw.confirm}
    //             disabled={!isEditing}
    //             onChange={(e) =>
    //               setPw((prev) => ({
    //                 ...prev,
    //                 confirm: e.target.value,
    //               }))
    //             }
    //             placeholder="Confirm Password"
    //             className="w-full border p-3 rounded-xl pr-10 disabled:bg-gray-200"
    //           />

    //           <button
    //             type="button"
    //             disabled={!isEditing}
    //             onClick={() => setShowConfirm(!showConfirm)}
    //             className="absolute right-3 top-1/2 -translate-y-1/2"
    //           >
    //             {showConfirm ? <FaEyeSlash /> : <FaEye />}
    //           </button>
    //         </div>

    //         {/* BUTTON */}
    //         <button
    //           onClick={changePassword}
    //           disabled={!isEditing}
    //           className={`w-full py-3 rounded-xl font-semibold transition ${isEditing
    //             ? "bg-blue-800 text-white hover:bg-slate-800"
    //             : "bg-gray-400 text-white cursor-not-allowed"
    //             }`}
    //         >
    //           Update Password
    //         </button>
    //       </div>
    //     </div>
    //   </div>
    // </div>

    return (
  <div className="min-h-screen bg-slate-100 p-4 md:p-6">
    <div className="max-w-7xl mx-auto">

      {/* HEADER */}

      <div className="relative overflow-hidden rounded-3xl bg-slate-800 shadow-2xl">

        <div className="absolute inset-0 bg-black/10"></div>

        <div className="relative p-6 md:p-10">

          <div className="flex flex-col lg:flex-row items-center gap-8">

            <div className="relative">

              <img
                src={photoUrl}
                alt="Student"
                className="h-36 w-36 rounded-3xl border-4 border-white object-cover shadow-2xl"
              />

              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-green-500 border-4 border-white"></div>

            </div>

            <div className="flex-1 text-center lg:text-left">

              <h1 className="text-4xl font-bold text-white">
                {student?.name}
              </h1>

              <p className="text-indigo-100 mt-2">
                Student Dashboard
              </p>

              <div className="flex flex-wrap gap-3 mt-5 justify-center lg:justify-start">

                <span className="px-4 py-2 rounded-full bg-white/20 text-white">
                  ID : {student?.studentID}
                </span>

                <span className="px-4 py-2 rounded-full bg-white/20 text-white">
                  {student?.className} {student?.section}
                </span>

                <span className="px-4 py-2 rounded-full bg-green-500/20 border border-green-300 text-white">
                  {student?.status || "Active"}
                </span>

              </div>

            </div>

            <div className="flex gap-3">

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl text-white font-semibold"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-white text-slate-700 px-5 py-3 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={onSave}
                    className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl text-white font-semibold"
                  >
                    Save
                  </button>
                </>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

        <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">
          <p className="text-slate-500 text-sm">
            Student ID
          </p>

          <h3 className="text-2xl font-bold text-indigo-600 mt-2">
            {student?.studentID}
          </h3>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">
          <p className="text-slate-500 text-sm">
            Class
          </p>

          <h3 className="text-xl font-bold mt-2">
            {student?.className}
          </h3>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">
          <p className="text-slate-500 text-sm">
            Email
          </p>

          <h3 className="font-semibold mt-2 truncate">
            {student?.email}
          </h3>
        </div>

      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">

        {/* LEFT */}

        <div className="xl:col-span-8 space-y-6">

          

          {/* STUDENT INFO */}

          <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">

            <h2 className="text-2xl font-bold mb-6">
              Student Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {Object.keys(form).map((key) => (
                <div key={key}>

                  <label className="block mb-2 text-sm font-semibold text-slate-600">
                    {formatLabel(key)}
                  </label>

                  <input
                    name={key}
                    value={form[key]}
                    onChange={onChange}
                    disabled={!isEditing}
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50"
                  />

                </div>
              ))}

            </div>

          </div>

          {/* PHOTO */}

          <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">

            <h2 className="text-xl font-bold mb-5">
              Profile Photo
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-6">

              <img
                src={photoUrl}
                alt="Student"
                className="h-28 w-28 rounded-full object-cover border-4 border-indigo-100"
              />

              <input
                type="file"
                accept="image/*"
                onChange={onPhotoChange}
                disabled={!isEditing}
                className="w-full"
              />

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="xl:col-span-4 space-y-6">

          {/* SUMMARY */}

          <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">

            <h2 className="text-xl font-bold mb-5">
              Student Summary
            </h2>

            <div className="space-y-4">

              <div className="p-4 rounded-2xl bg-slate-50 border">
                <p className="text-sm text-slate-500">
                  Roll Number
                </p>

                <p className="font-semibold">
                  {student?.rollNumber || "-"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border">
                <p className="text-sm text-slate-500">
                  Class
                </p>

                <p className="font-semibold">
                  {student?.className} {student?.section}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border">
                <p className="text-sm text-slate-500">
                  Email
                </p>

                <p className="font-semibold break-all">
                  {student?.email}
                </p>
              </div>

            </div>

          </div>

          {/* PASSWORD */}

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-slate-700 p-6 shadow-xl text-white">

            <h2 className="text-xl font-bold mb-5">
              Change Password
            </h2>

            <div className="space-y-4">
               {!isEditing && (
            <p className="text-sm text-gray-500 mb-4">
              Enable edit mode to change password
            </p>
          )}

          <div className="space-y-4">

            {/* NEW PASSWORD */}
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={pw.newPassword}
                disabled={!isEditing}
                onChange={(e) =>
                  setPw((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                placeholder="New Password"
                className="w-full border text-white p-3 rounded-xl pr-10"
              />

              <button
                type="button"
                disabled={!isEditing}
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={pw.confirm}
                disabled={!isEditing}
                onChange={(e) =>
                  setPw((prev) => ({
                    ...prev,
                    confirm: e.target.value,
                  }))
                }
                placeholder="Confirm Password"
                className="w-full border p-3 rounded-xl pr-10 "
              />

              <button
                type="button"
                disabled={!isEditing}
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* BUTTON */}
            <button
              onClick={changePassword}
              disabled={!isEditing}
              className={`w-full py-3 rounded-xl font-semibold transition ${isEditing
                ? "bg-blue-800 text-white hover:bg-slate-800"
                : "bg-gray-400 text-white cursor-not-allowed"
                }`}
            >
              Update Password
            </button>
          </div>
             

            </div>

          </div>

        </div>

      </div>

    </div>
  </div>
);
    
  
}

/* helpers */
function formatAddress(address) {
  if (!address) return "";
  if (typeof address === "string") return address;
  return [
    address.street,
    address.city,
    address.state,
    address.pincode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

const formatLabel = (key) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};