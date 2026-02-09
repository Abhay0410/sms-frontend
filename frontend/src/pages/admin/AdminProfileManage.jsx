import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../services/api";
import BackButton from "../../components/BackButton";
import OptimizedImage from "../../components/OptimizedImage";

export default function AdminProfileManage() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    designation: "",
    address: "",
    gender: "",
    dob: "",
    department: "",
  });
  const [adminInfo, setAdminInfo] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const resp = await api.get(API_ENDPOINTS.ADMIN.AUTH.PROFILE);

      // ✅ ROBUST DATA EXTRACTION (Matches the pattern from Student/Teacher)
      let adminData = resp?.admin || resp?.data?.admin || resp?.data || resp;

      setAdminInfo(adminData);
      setForm({
        name: adminData.name || "",
        phone: adminData.phone || "",
        designation: adminData.designation || "",
        address: adminData.address
  ? `${adminData.address.street || ""}, ${adminData.address.city || ""}, ${adminData.address.state || ""}`
  : "",

        gender: adminData.gender || "",
        dob: adminData.dateOfBirth ? adminData.dateOfBirth.split("T")[0] : "",

        department: adminData.department || "",
      });
    } catch (e) {
      toast.error(e.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // const onSave = async () => {
  //   try {
  //     const formData = new FormData();
  //     Object.entries(form).forEach(([key, value]) => {
  //       if (value) formData.append(key, value);
  //     });

  //     if (photoFile) {
  //       formData.append("profilePicture", photoFile);
  //     }

  //        const updatedAdmin = await api.uploadPut(API_ENDPOINTS.ADMIN.UPDATE(adminInfo.adminID), formData);

  //        setAdminInfo(updatedAdmin);
  //     toast.success("Profile updated successfully");
  //     loadProfile();
  //     setPhotoFile(null);
  //     setPhotoPreview("");
  //   } catch (e) {
  //     toast.error(e.message || "Update failed");
  //   }
  // };

  const onSave = async () => {
    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      if (photoFile) {
        formData.append("profilePicture", photoFile);
      }

      const res = await api.uploadPut(
        API_ENDPOINTS.ADMIN.UPDATE(adminInfo.adminID),
        formData
      );

      // ✅ IMPORTANT: actual admin object
     const updatedAdmin =
  res?.data?.data ||
  res?.data?.admin ||
  res?.admin ||
  adminInfo; // fallback

setAdminInfo(updatedAdmin);


      if (updatedAdmin?.profilePicture) {
        setPhotoPreview(updatedAdmin.profilePicture);
      }

      toast.success("Profile updated successfully");

      setPhotoFile(null);
    } catch (e) {
      toast.error(e.message || "Update failed");
    }
  };

  const [pw, setPw] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const onChangePw = (e) =>
    setPw((s) => ({ ...s, [e.target.name]: e.target.value }));

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
      await api.put(API_ENDPOINTS.ADMIN.AUTH.CHANGE_PASSWORD, {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      toast.success("Password changed successfully");
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (e) {
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

  const photoUrl =
    photoPreview ||
    (adminInfo.profilePicture
      ? adminInfo.profilePicture
      : `/assets/default-admin-avatar.png`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <BackButton to="/admin/admin-dashboard" />

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mt-6 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent uppercase tracking-tight">
            Administrator Profile
          </h1>
          <p className="text-gray-600 mt-2 font-medium">
            Manage your system credentials and personal records
          </p>
        </div>

        {/* Profile Header Card */}
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <svg
              className="w-32 h-32 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="h-32 w-32 rounded-2xl border-4 border-slate-700 shadow-2xl overflow-hidden bg-slate-700">
              {/* <OptimizedImage
                src={photoUrl}
                alt="Profile"
                className="h-full w-full object-cover"
                width={128}
                height={128}
              /> */}
              <img
                src={photoUrl}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="text-white text-center md:text-left flex-1">
              <h3 className="text-3xl font-black mb-2 uppercase tracking-tight">
                {adminInfo.name}
              </h3>
              <div className="space-y-1 font-medium opacity-90">
                <p className="text-indigo-300">ID: {adminInfo.adminID}</p>
                <p>{adminInfo.email}</p>
                <p className="text-sm bg-indigo-600/30 inline-block px-3 py-1 rounded-lg border border-indigo-500/30">
                  {adminInfo.designation || "System Administrator"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Account Status */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <h3 className=" font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">
                Administrative Info
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Department</span>
                  <span className="font-bold text-gray-900">
                    {adminInfo.department || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Role</span>
                  <span className="font-bold text-indigo-600 uppercase">
                    Admin
                  </span>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <h3 className=" font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">
                Identity Photo
              </h3>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <p className="text-sm font-bold text-indigo-600">
                    Change Photo
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase">
                    JPG, PNG (Max 5MB)
                  </p>
                </label>
              </div>
            </div>

            {/* Change Password */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <h3 className=" font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">
                Security
              </h3>
              <div className="space-y-3">
                <input
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-indigo-200"
                  type="password"
                  name="currentPassword"
                  value={pw.currentPassword}
                  onChange={onChangePw}
                  placeholder="Current Password"
                />
                <input
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-indigo-200"
                  type="password"
                  name="newPassword"
                  value={pw.newPassword}
                  onChange={onChangePw}
                  placeholder="New Password"
                />
                <input
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-indigo-200"
                  type="password"
                  name="confirm"
                  value={pw.confirm}
                  onChange={onChangePw}
                  placeholder="Confirm Password"
                />
                <button
                  onClick={changePassword}
                  className="w-full rounded-xl bg-slate-900 py-3 text-white font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition shadow-lg"
                >
                  Update Key
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (Editable Fields) */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-tight">
                Personal Profile Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Full Name
                  </label>
                  <input
                    className="w-full rounded-xl border border-gray-200 p-4 font-bold text-gray-800 focus:border-indigo-500 transition shadow-sm"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Phone Number
                  </label>
                  <input
                    className="w-full rounded-xl border border-gray-200 p-4 font-bold text-gray-800 focus:border-indigo-500 transition shadow-sm"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Designation
                  </label>
                  <input
                    className="w-full rounded-xl border border-gray-200 p-4 font-bold text-gray-800 focus:border-indigo-500 transition shadow-sm"
                    name="designation"
                    value={form.designation}
                    onChange={onChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Department
                  </label>
                  <input
                    className="w-full rounded-xl border border-gray-200 p-4 font-bold text-gray-800 focus:border-indigo-500 transition shadow-sm"
                    name="department"
                    value={form.department}
                    onChange={onChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Gender
                  </label>
                  <select
                    className="w-full rounded-xl border border-gray-200 p-4 font-bold text-gray-800 focus:border-indigo-500 transition shadow-sm appearance-none"
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
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Date of Birth
                  </label>
                  <input
                    className="w-full rounded-xl border border-gray-200 p-4 font-bold text-gray-800 focus:border-indigo-500 transition shadow-sm"
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Residential Address
                </label>
                <textarea
                  className="w-full rounded-xl border border-gray-200 p-4 font-bold text-gray-800 focus:border-indigo-500 transition shadow-sm"
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  rows="3"
                />
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                <button
                  onClick={onSave}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-10 py-4 text-white font-black uppercase tracking-widest text-xs hover:from-indigo-700 hover:to-blue-700 transition shadow-xl transform active:scale-95"
                >
                  Save Profile Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
