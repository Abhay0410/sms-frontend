// pages/teacher/TeacherProfileManage.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../services/api";
import BackButton from "../../components/BackButton";
import OptimizedImage from "../../components/OptimizedImage";

export default function TeacherProfileManage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // ✅ PROD-READY: Get URL from environment variables
  const API_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    gender: "",
    dob: "",
    department: "",
    subjects: "",
  });
  const [teacherInfo, setTeacherInfo] = useState({});
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const resp = await api.get(API_ENDPOINTS.TEACHER.AUTH.PROFILE);
      console.log("📥 Teacher Profile Response:", resp); 

      // ✅ ROBUST DATA EXTRACTION
      let teacherData = resp.teacher || resp.data?.teacher || resp.data || resp;

      // Handle nested teacher object
      if (teacherData.teacher) {
        teacherData = teacherData.teacher;
      }

      console.log("👤 Extracted Teacher Data:", teacherData);

      setTeacherInfo(teacherData);
      
      // ✅ MAP FIELDS CORRECTLY
      setForm({
        name: teacherData.name || "",
        phone: teacherData.phone || "",
        // address: teacherData.address || "",
          address: teacherData.address
    ? [
        teacherData.address.line1,
        teacherData.address.line2,
        teacherData.address.city,
        teacherData.address.state,
        teacherData.address.pincode,
      ]
        .filter(Boolean)
        .join(", ")
    : "",
        gender: teacherData.gender || "",
        dob: teacherData.dateOfBirth ? teacherData.dateOfBirth.split("T")[0] : "", 
        department: teacherData.department || "",
        subjects: Array.isArray(teacherData.subjects) ? teacherData.subjects.join(", ") : (teacherData.subjects || ""),
      });
    } catch (error) {
      console.error("❌ Load profile error:", error);
      toast.error(error.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        e.target.value = ""; 
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      uploadPhoto(file);
    }
  };

  const uploadPhoto = async (file) => {
    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append("profilePicture", file);

      await api.uploadPut(API_ENDPOINTS.TEACHER.UPDATE_PROFILE, formData);
      
      toast.success("Profile photo updated successfully");
      await loadProfile(); 
      setPhotoPreview("");
    } catch (error) {
      toast.error(error.message || "Failed to upload photo");
      setPhotoPreview("");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const onSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      const addressParts = form.address.split(",");
      // ✅ Explicitly append all fields to ensure they are sent
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      // formData.append("address", form.address);
      formData.append("address[line1]", addressParts[0]?.trim() || "");
      formData.append("address[line2]", addressParts[1]?.trim() || "");
      formData.append("address[city]", addressParts[2]?.trim() || "");
      formData.append("address[state]", addressParts[3]?.trim() || "");
      formData.append("address[pincode]", addressParts[4]?.trim() || "");
      formData.append("gender", form.gender);
      formData.append("dateOfBirth", form.dob); 
      formData.append("department", form.department); 
      formData.append("subjects", form.subjects);

      await api.uploadPut(API_ENDPOINTS.TEACHER.UPDATE_PROFILE, formData);
      
      toast.success("Profile updated successfully");
      await loadProfile();
    } catch (error) {
      toast.error(error.message || "Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const onChangePw = (e) => setPw((s) => ({ ...s, [e.target.name]: e.target.value }));

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
      setChangingPassword(true);
      await api.put(API_ENDPOINTS.TEACHER.AUTH.CHANGE_PASSWORD, {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      toast.success("Password changed successfully");
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (error) {
      toast.error(error.message || "Change password failed");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  //IMAGE 
  // const displayPhoto = photoPreview || 
  // (teacherInfo.profilePicture 
  //   ? `${API_URL}/uploads/teachers/${teacherInfo.profilePicture}`
  //   : `/assets/default-teacher-avatar.png`);
const displayPhoto =
  photoPreview ||
  (teacherInfo.profilePicture
    ? teacherInfo.profilePicture.startsWith("http")
      ? teacherInfo.profilePicture
      : `${API_URL}/uploads/${teacherInfo.schoolId}/teachers/${teacherInfo.profilePicture}`
    : "/assets/default-teacher-avatar.png");




  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <BackButton to="/teacher/teacher-dashboard" />

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and account settings</p>
        </div>

        {/* Profile Overview Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 shadow-xl mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="relative h-32 w-32 rounded-full shadow-2xl overflow-hidden bg-gray-200 flex items-center justify-center">
                <img
                  src={displayPhoto}
                  alt="Profile"
                  className="h-full w-full object-cover  object-center"
                  width={128}
                  height={128}
                  onError={(e) => {
                    e.target.src = '/assets/default-teacher-avatar.png';
                  }}
                />
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-white text-center md:text-left flex-1">
              <h2 className="text-3xl font-bold mb-2">{teacherInfo.name}</h2>
              <div className="space-y-1">
                <p className="text-indigo-100 flex items-center justify-center md:justify-start gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  {teacherInfo.teacherID}
                </p>
                <p className="text-indigo-100 flex items-center justify-center md:justify-start gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {teacherInfo.email}
                </p>
                <p className="text-indigo-100 flex items-center justify-center md:justify-start gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {teacherInfo.department ? `Dept: ${teacherInfo.department}` : "No Department Assigned"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Photo & Password */}
          <div className="lg:col-span-1 space-y-6">
            {/* Photo Upload Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Profile Photo
              </h3>
              
              <div className="text-center mb-4">
                <div className="relative h-32 w-32 rounded-full border-2 border-gray-100  overflow-hidden bg-gray-200 flex items-center justify-center">
                  <img
                    src={displayPhoto}
                    alt="Profile preview"
                    className="h-full w-full  object-cover object-center"
                    width={128}
                    height={128}
                    onError={(e) => {
                      e.target.src = '/assets/default-teacher-avatar.png';
                    }}
                  />
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">JPG, PNG, max 2MB</p>
                {uploadingPhoto && (
                  <p className="text-xs text-indigo-600 mt-1">Uploading...</p>
                )}
              </div>

              <label className="block w-full cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPhotoChange}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
                <div className="w-full text-center py-2 px-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors text-sm font-semibold bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
                  {uploadingPhoto ? "Uploading..." : "Choose New Photo"}
                </div>
              </label>
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Change Password
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                    type="password"
                    name="currentPassword"
                    value={pw.currentPassword}
                    onChange={onChangePw}
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                    type="password"
                    name="newPassword"
                    value={pw.newPassword}
                    onChange={onChangePw}
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                    type="password"
                    name="confirm"
                    value={pw.confirm}
                    onChange={onChangePw}
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  onClick={changePassword}
                  disabled={changingPassword}
                  className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {changingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Personal Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                    name="department"
                    value={form.department}
                    onChange={onChange}
                    placeholder="Enter department"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                    name="gender"
                    value={form.gender}
                    onChange={onChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={onChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subjects
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                    name="subjects"
                    value={form.subjects}
                    onChange={onChange}
                    placeholder="Math, Physics, Chemistry"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  rows="3"
                  placeholder="Enter your complete address"
                />
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="bg-indigo-600 text-white py-3 px-8 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors font-medium flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
