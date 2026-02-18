// pages/student/StudentProfileManage.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import BackButton from "../../components/BackButton";
import OptimizedImage from "../../components/OptimizedImage";


export default function StudentProfileManage() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    phone: "",
    email: "",
    bloodGroup: "",
    nationality: "Indian",
    medicalHistory: "",
    allergies: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    transportRequired: false,
    busRoute: "",
    pickupPoint: "",
  });
  const [studentInfo, setStudentInfo] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  
  // ✅ PROD-READY: Get URL from environment variables
  const API_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    loadProfile();
  }, []);

    const loadProfile = async () => {
    try {
      const resp = await api.get(API_ENDPOINTS.STUDENT.AUTH.PROFILE);
      console.log("📥 Profile API Response:", resp); // Debugging

      // ✅ ROBUST DATA EXTRACTION
      // 1. Check if it's directly in 'student' (e.g., { student: {...} })
      // 2. Check if it's in 'data' (e.g., { data: {...} })
      // 3. Check if it's 'data.student' (e.g., { data: { student: {...} } })
      // 4. Fallback to 'resp' itself if it IS the object
      
      let studentData = resp.student || resp.data || resp;
      
      // Handle case where student data is nested one level deeper inside 'data'
      if (studentData.student) {
        studentData = studentData.student;
      }

      console.log("👤 Extracted Student Data:", studentData); // Debugging

      setStudentInfo(studentData);

      setForm({
        phone: studentData.phone || "",
        email: studentData.email || "",
        bloodGroup: studentData.bloodGroup || "",
        nationality: studentData.nationality || "Indian",
        medicalHistory: studentData.medicalHistory || "",
        allergies: Array.isArray(studentData.allergies) ? studentData.allergies.join(", ") : (studentData.allergies || ""),
        
        // Handle nested objects safely
        emergencyContactName: studentData.emergencyContact?.name || "",
        emergencyContactPhone: studentData.emergencyContact?.phone || "",
        emergencyContactRelation: studentData.emergencyContact?.relation || "",
        
        transportRequired: studentData.transportRequired || false,
        busRoute: studentData.busRoute || "",
        pickupPoint: studentData.pickupPoint || "",
      });
      
    } catch (e) {
      console.error("❌ Load profile error:", e);
      toast.error(e.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };


  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ 
      ...f, 
      [name]: type === "checkbox" ? checked : value 
    }));
  };

  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const onSave = async () => {
    try {
      console.log("🔄 Starting profile update...");
      
      const formData = new FormData();
      
      // Add all form fields
      formData.append("phone", form.phone);
      formData.append("email", form.email);
      formData.append("bloodGroup", form.bloodGroup);
      formData.append("nationality", form.nationality);
      formData.append("medicalHistory", form.medicalHistory);
      formData.append("allergies", form.allergies);
      formData.append("emergencyContactName", form.emergencyContactName);
      formData.append("emergencyContactPhone", form.emergencyContactPhone);
      formData.append("emergencyContactRelation", form.emergencyContactRelation);
      formData.append("transportRequired", form.transportRequired);
      formData.append("busRoute", form.busRoute);
      formData.append("pickupPoint", form.pickupPoint);

      // Add photo if selected
      if (photoFile) {
        formData.append("profilePicture", photoFile);
      }

      const response = await api.put(API_ENDPOINTS.STUDENT.AUTH.PROFILE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("✅ Update successful:", response);
     
      toast.success("Profile updated successfully");
     await loadProfile();
      setPhotoFile(null);
      setPhotoPreview("");
    } catch (e) {
      console.error("❌ Update failed:", e);
      toast.error(e.message || "Update failed");
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
      await api.put(API_ENDPOINTS.STUDENT.AUTH.CHANGE_PASSWORD, {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      toast.success("Password changed successfully");
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (e) {
      console.error("❌ Change password error:", e);
      toast.error(e.message || "Change password failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  console.log("School ID:", studentInfo.schoolId);
  
      console.log("Profile Pic Value:", studentInfo.profilePicture);
console.log("Base URL:", import.meta.env.VITE_REACT_APP_API_BASE_URL);
 const photoUrl =
  photoPreview ||
  (studentInfo.profilePicture
    ? `${API_URL}/uploads/${studentInfo.schoolId}/students/${studentInfo.profilePicture}`
    : `/assets/default-student-avatar.png`);
  // const photoUrl = photoPreview ||
  // (studentInfo.profilePicture
  //   ? `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/${studentInfo.profilePicture}`
  //   : `/assets/default-student-avatar.png`);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <BackButton to="/student/student-dashboard" />

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-600 mt-2">Manage your personal information and preferences</p>
        </div>

        {/* Status Banner for REGISTERED Students */}
        {studentInfo.status === 'REGISTERED' && (
          <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-yellow-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Registration Pending</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Your section has not been assigned yet. Please contact the school administration.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="h-32 w-32 rounded-2xl border-4 border-white shadow-2xl overflow-hidden">
                <OptimizedImage
                key={studentInfo.profilePicture}
                  src={photoUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  width={128}
                  height={128}
                />
              </div>
            </div>
            
            <div className="text-white text-center md:text-left flex-1">
              <h3 className="text-3xl font-bold mb-2">{studentInfo.name}</h3>
              <div className="space-y-1">
                <p className="text-blue-100">{studentInfo.studentID}</p>
                <p className="text-blue-100">{studentInfo.email}</p>
                <p className="text-blue-100">
                  Class: {studentInfo.className} {studentInfo.section && `- ${studentInfo.section}`}
                </p>
                {studentInfo.rollNumber && (
                  <p className="text-blue-100">Roll No: {studentInfo.rollNumber}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Academic Information */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Academic Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Academic Year</span>
                  <span className="font-semibold text-gray-900">{studentInfo.academicYear}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Nationality</span>
                  <span className="font-semibold text-gray-900">{studentInfo.nationality}</span>
                </div>
                {studentInfo.religion && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Religion</span>
                    <span className="font-semibold text-gray-900">{studentInfo.religion}</span>
                  </div>
                )}
                {studentInfo.caste && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Category</span>
                    <span className="font-semibold text-gray-900">{studentInfo.caste}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    studentInfo.status === 'ENROLLED' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    {studentInfo.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Update Photo
              </h3>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onPhotoChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer block">
                    <svg className="w-10 h-10 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-700">Click to upload</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  </label>
                </div>

                {photoFile && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">New photo selected</p>
                      <p className="text-xs text-green-600">{photoFile.name}</p>
                    </div>
                    <button
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview("");
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Change Password */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h3>
              <div className="space-y-4">
                <input
                  className="w-full rounded-xl border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  type="password"
                  name="currentPassword"
                  value={pw.currentPassword}
                  onChange={onChangePw}
                  placeholder="Current password"
                />
                <input
                  className="w-full rounded-xl border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  type="password"
                  name="newPassword"
                  value={pw.newPassword}
                  onChange={onChangePw}
                  placeholder="New password (min 6 characters)"
                />
                <input
                  className="w-full rounded-xl border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  type="password"
                  name="confirm"
                  value={pw.confirm}
                  onChange={onChangePw}
                  placeholder="Confirm new password"
                />
                <button
                  onClick={changePassword}
                  className="w-full rounded-xl bg-gray-900 px-6 py-3 text-white font-semibold hover:bg-gray-800 transition shadow-lg"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>

              {/* Contact Information */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Contact Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      className="w-full rounded-xl border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full rounded-xl border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      placeholder="Enter email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                    <select
                      className="w-full rounded-xl border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      name="bloodGroup"
                      value={form.bloodGroup}
                      onChange={onChange}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                    <input
                      className="w-full rounded-xl border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      name="nationality"
                      value={form.nationality}
                      onChange={onChange}
                      placeholder="Enter nationality"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Medical Information
                </h4>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
                    <textarea
                      className="w-full rounded-xl border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      name="medicalHistory"
                      value={form.medicalHistory}
                      onChange={onChange}
                      rows="2"
                      placeholder="Any medical conditions"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                    <input
                      className="w-full rounded-xl border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      name="allergies"
                      value={form.allergies}
                      onChange={onChange}
                      placeholder="Comma-separated (e.g., Peanuts, Dust)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name</label>
                      <input
                        className="w-full rounded-xl border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                        name="emergencyContactName"
                        value={form.emergencyContactName}
                        onChange={onChange}
                        placeholder="Contact person"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Phone</label>
                      <input
                        type="tel"
                        className="w-full rounded-xl border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                        name="emergencyContactPhone"
                        value={form.emergencyContactPhone}
                        onChange={onChange}
                        placeholder="Phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Relation</label>
                      <input
                        className="w-full rounded-xl border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                        name="emergencyContactRelation"
                        value={form.emergencyContactRelation}
                        onChange={onChange}
                        placeholder="Relation"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Transport Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Transport Information
                </h4>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="transportRequired"
                      checked={form.transportRequired}
                      onChange={onChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700">
                      Transport Required
                    </label>
                  </div>

                  {form.transportRequired && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bus Route</label>
                        <input
                          className="w-full rounded-xl border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                          name="busRoute"
                          value={form.busRoute}
                          onChange={onChange}
                          placeholder="Route number/name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Point</label>
                        <input
                          className="w-full rounded-xl border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                          name="pickupPoint"
                          value={form.pickupPoint}
                          onChange={onChange}
                          placeholder="Pickup location"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={onSave}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 text-white font-semibold hover:from-blue-700 hover:to-cyan-700 transition shadow-lg"
                >
                  Save All Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
