// pages/parent/ParentProfileManage.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import BackButton from "../../components/BackButton";
import OptimizedImage from "../../components/OptimizedImage";

export default function ParentProfileManage() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    phone: "",
    address: "",
    occupation: "",
  });
  const [parentInfo, setParentInfo] = useState({});
  const [children, setChildren] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // ✅ FIXED: Use API_ENDPOINTS constant
      const resp = await api.get(API_ENDPOINTS.PARENT.AUTH.PROFILE);
console.log("👪 Parent PROFILE raw resp:", resp);

const parent = resp?.data?.parent || resp?.parent || {};
setParentInfo(parent);
setChildren(parent.children || []);

setForm({
  phone: parent.phone || "",
  address: parent.address?.street || parent.address || "",
  occupation: parent.occupation || "",
});

    } catch (e) {
      console.error("Load profile error:", e);
      toast.error(e.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size
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
      const formData = new FormData();
      formData.append("phone", form.phone);
      formData.append("address", form.address);
      formData.append("occupation", form.occupation);

      if (photoFile) {
        formData.append("photo", photoFile);
      }

      // ✅ FIXED: Use API_ENDPOINTS constant
      await api.uploadPut(API_ENDPOINTS.PARENT.AUTH.PROFILE, formData);
      toast.success("Profile updated successfully");
      loadProfile();
      setPhotoFile(null);
      setPhotoPreview("");
    } catch (e) {
      console.error("Update error:", e);
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
      // ✅ FIXED: Use API_ENDPOINTS constant
      await api.put(API_ENDPOINTS.PARENT.AUTH.CHANGE_PASSWORD, {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      toast.success("Password changed successfully");
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (e) {
      console.error("Password change error:", e);
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

  // Photo URL logic
  const photoUrl = photoPreview || 
    (parentInfo.profilePicture ? `/uploads/parents/${parentInfo.profilePicture}` : `/assets/default-parent-avatar.png`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <BackButton to="/parent/parent-dashboard" />

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mt-6 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-600 mt-2">Manage your personal information and preferences</p>
        </div>

        {/* Profile Header Card */}
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-green-500 to-teal-600 p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="h-32 w-32 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-gray-100">
                <OptimizedImage
                  src={photoUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  width={128}
                  height={128}
                />
              </div>
            </div>
            
            <div className="text-white text-center md:text-left flex-1">
              <h3 className="text-3xl font-bold mb-2">{parentInfo.name}</h3>
              <div className="space-y-1">
                <p className="text-green-100 font-medium">{parentInfo.parentID}</p>
                <p className="text-green-100">{parentInfo.email}</p>
                <p className="text-green-100 font-medium">Relation: {parentInfo.relation}</p>
                {parentInfo.occupation && (
                  <p className="text-green-100">Occupation: {parentInfo.occupation}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Children Info & Photo Upload */}
          <div className="lg:col-span-2 space-y-6">
            {/* Children Information */}
            {children.length > 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-green-600">👨‍👧‍👦</span>
                  My Children
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {children.map((child) => {
                    const childPhotoUrl = child.profilePicture 
                      ? `/uploads/students/${child.profilePicture}` 
                      : `/assets/default-student-avatar.png`;
                    
                    return (
                      <div
                        key={child._id}
                        className="rounded-xl border border-gray-200 p-4 hover:border-green-300 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full border-2 border-green-200 overflow-hidden">
                            <OptimizedImage
                              src={childPhotoUrl}
                              alt={child.name}
                              className="h-full w-full object-cover"
                              width={64}
                              height={64}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{child.name}</h4>
                            <p className="text-sm text-gray-600">{child.studentID}</p>
                            <p className="text-sm text-gray-600">
                              Class: {child.className} {child.section && `- ${child.section}`}
                            </p>
                            <span
                              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                child.status === "ENROLLED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {child.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Photo Upload */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-green-600">🖼️</span>
                Update Profile Photo
              </h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors duration-300">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onPhotoChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer block">
                    <div className="text-gray-400 mb-3">
                      <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-green-600">Choose Photo</span>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                  </label>
                </div>
                {photoFile && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
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
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Contact Info & Password */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-green-600">📞</span>
                Contact Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    className="w-full rounded-xl border border-gray-300 p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                  <input
                    className="w-full rounded-xl border border-gray-300 p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                    name="occupation"
                    value={form.occupation}
                    onChange={onChange}
                    placeholder="Enter occupation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    className="w-full rounded-xl border border-gray-300 p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    rows="3"
                    placeholder="Enter full address"
                  />
                </div>
              </div>

              <button
                onClick={onSave}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-green-600 to-teal-600 px-6 py-3 text-white font-semibold hover:from-green-700 hover:to-teal-700 transition transform hover:scale-105 duration-200 shadow-lg"
              >
                Save All Changes
              </button>
            </div>

            {/* Change Password */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-green-600">🔒</span>
                Change Password
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    className="w-full rounded-xl border border-gray-300 p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
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
                    className="w-full rounded-xl border border-gray-300 p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                    type="password"
                    name="newPassword"
                    value={pw.newPassword}
                    onChange={onChangePw}
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    className="w-full rounded-xl border border-gray-300 p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                    type="password"
                    name="confirm"
                    value={pw.confirm}
                    onChange={onChangePw}
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  onClick={changePassword}
                  className="w-full rounded-xl bg-gray-900 px-6 py-3 text-white font-semibold hover:bg-gray-800 transition transform hover:scale-105 duration-200 shadow-lg"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
