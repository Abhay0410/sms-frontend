// pages/admin/Admin_Features/EditStudentParent/AdminParentViewPage.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";

import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_URL =
  import.meta.env.VITE_REACT_APP_API_BASE_URL ||
  "http://localhost:5000";

export default function AdminParentViewPage() {
  const { parentId } = useParams();

  const [loading, setLoading] = useState(true);

  const [parentInfo, setParentInfo] = useState({});
  const [children, setChildren] = useState([]);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    occupation: "",
    qualification: "",
    address: "",
    email: "",
  });

  const [pw, setPw] = useState({
    newPassword: "",
    confirm: "",
  });

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [parentId]);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const resp = await api.get(
        API_ENDPOINTS.ADMIN.PARENT.PROFILE(parentId)
      );

      console.log("PROFILE RESPONSE:", resp.data);

      // ✅ FIXED
      const parent =
        resp?.data?.parent || {};

      setParentInfo(parent);

      setChildren(parent.children || []);

      setForm({
        name: parent.name || "",
        phone: parent.phone || "",
        occupation: parent.occupation || "",
        qualification:
          parent.qualification || "",
        address:
          parent.address?.street ||
          parent.address ||
          "",
        email: parent.email || "",
      });

    } catch (e) {
      console.error(e);

      toast.error(
        e?.response?.data?.message ||
        e.message ||
        "Failed to load parent profile"
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
      toast.error(
        "File size must be less than 5MB"
      );
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(
      URL.createObjectURL(file)
    );
  };

  const onSave = async () => {
    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("phone", form.phone);
      formData.append(
        "occupation",
        form.occupation
      );
      formData.append(
        "qualification",
        form.qualification
      );
      formData.append("address", form.address);
      formData.append("email", form.email);

      if (photoFile) {
        formData.append("photo", photoFile);
      }

      await api.uploadPut(
        API_ENDPOINTS.ADMIN.PARENT.UPDATE(
          parentId
        ),
        formData
      );

      toast.success(
        "Parent profile updated"
      );

      setIsEditing(false);

      await loadProfile();

      setPhotoFile(null);
      setPhotoPreview("");
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
        e.message ||
        "Update failed"
      );
    }
  };

  const changePassword = async () => {
    if (
      pw.newPassword !== pw.confirm
    ) {
      toast.error(
        "Passwords do not match"
      );
      return;
    }

    if (pw.newPassword.length < 6) {
      toast.error(
        "Password must be at least 6 characters"
      );
      return;
    }

    try {
      await api.put(
        API_ENDPOINTS.ADMIN.PARENT.CHANGE_PASSWORD(
          parentId
        ),
        {
          newPassword: pw.newPassword,
        }
      );

      toast.success(
        "Password changed successfully"
      );

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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
      <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
    </div>
  </div>
    );
  }

  const photoUrl =
    photoPreview ||
    (parentInfo.profilePicture
      ? parentInfo.profilePicture.startsWith(
        "http"
      )
        ? parentInfo.profilePicture
        : `${API_URL}/uploads/${parentInfo.schoolId}/parents/${parentInfo.profilePicture}`
      : "/assets/default-parent-avatar.png");

  return (
    

    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="relative overflow-hidden rounded-3xl bg-slate-800  shadow-2xl">

          <div className="absolute inset-0 bg-black/10"></div>

          <div className="relative p-6 md:p-10">

            <div className="flex flex-col lg:flex-row items-center gap-8">

              <div className="relative">

                <img
                  src={photoUrl}
                  alt="Parent"
                  className="h-36 w-36 rounded-3xl border-4 border-white object-cover shadow-2xl"
                />

                <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-green-500 border-4 border-white"></div>

              </div>

              <div className="flex-1 text-center lg:text-left">

                <h1 className="text-4xl font-bold text-white">
                  {parentInfo.name}
                </h1>

                <p className="text-indigo-100 mt-2">
                  Parent Dashboard
                </p>

                <div className="flex flex-wrap gap-3 mt-5 justify-center lg:justify-start">

                  <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur text-white">
                    ID : {parentInfo.parentID}
                  </span>

                  <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur text-white">
                    {parentInfo.relation}
                  </span>

                  <span className="px-4 py-2 rounded-full bg-green-500/20 border border-green-300 text-white">
                    Active
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

          <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">
            <p className="text-slate-500 text-sm">
              Total Children
            </p>

            <h3 className="text-3xl font-bold text-indigo-600 mt-2">
              {children.length}
            </h3>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">
            <p className="text-slate-500 text-sm">
              Relation
            </p>

            <h3 className="text-xl font-bold mt-2">
              {parentInfo.relation}
            </h3>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">
            <p className="text-slate-500 text-sm">
              Email
            </p>

            <h3 className="font-semibold mt-2 truncate">
              {parentInfo.email}
            </h3>
          </div>

        </div>

        {/* MAIN GRID */}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">

          {/* LEFT */}

          <div className="xl:col-span-8 space-y-6">

            {/* PARENT INFO */}

            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">

              <div className="flex justify-between items-center mb-6">

                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Parent Information
                  </h2>

                  <p className="text-slate-500">
                    Manage parent details
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  disabled={!isEditing}
                  placeholder="Name"
                  className="w-full rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50"
                />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  disabled={!isEditing}
                  placeholder="Email"
                  className="w-full rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50"
                />

                <input
                  type="tel"
                  value={form.phone}
                  disabled={!isEditing}
                  placeholder="Phone"
                  onChange={(e) => {
                    const value =
                      e.target.value.replace(/\D/g, "");

                    if (value.length <= 10) {
                      setForm((prev) => ({
                        ...prev,
                        phone: value,
                      }));
                    }
                  }}
                  className="w-full rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50"
                />

                <input
                  type="text"
                  name="occupation"
                  value={form.occupation}
                  onChange={onChange}
                  disabled={!isEditing}
                  placeholder="Occupation"
                  className="w-full rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50"
                />

                <input
                  type="text"
                  name="qualification"
                  value={form.qualification}
                  onChange={onChange}
                  disabled={!isEditing}
                  placeholder="Qualification"
                  className="w-full rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 md:col-span-2"
                />

                <textarea
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Address"
                  className="w-full rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 md:col-span-2"
                />

              </div>

              {!isEditing ? (
                <button
                  onClick={() =>
                    setIsEditing(true)
                  }
                  className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-semibold transition-all"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 mt-6">

                  <button
                    onClick={() =>
                      setIsEditing(false)
                    }
                    className="flex-1 bg-slate-200 hover:bg-slate-300 rounded-xl py-3 font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={onSave}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-semibold"
                  >
                    Save Changes
                  </button>

                </div>
              )}

            </div>

            {/* PHOTO */}

            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">

              <h2 className="text-xl font-bold mb-4">
                Profile Photo
              </h2>

              <input
                type="file"
                accept="image/*"
                onChange={onPhotoChange}
                disabled={!isEditing}
                className="w-full"
              />

            </div>



          </div>

          {/* RIGHT */}

          <div className="xl:col-span-4 space-y-6">

            {/* CHILDREN */}

            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">

              <h2 className="text-xl font-bold mb-5">
                Children
              </h2>

              <div className="space-y-4">

                {children.map((child) => {
                  const childPhoto =
                    child.profilePicture
                      ? child.profilePicture.startsWith("http")
                        ? child.profilePicture
                        : `${API_URL}/uploads/${parentInfo.schoolId}/students/${child.profilePicture}`
                      : "/assets/default-student-avatar.png";

                  return (
                    <div
                      key={child._id}
                      className="group rounded-2xl border border-slate-200 p-4 hover:border-indigo-400 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-4">

                        <img
                          src={childPhoto}
                          alt={child.name}
                          className="h-16 w-16 rounded-2xl object-cover"
                        />

                        <div>

                          <h3 className="font-bold">
                            {child.name}
                          </h3>

                          <p className="text-sm text-slate-500">
                            {child.studentID}
                          </p>

                          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium">
                            {child.className}
                            {child.section &&
                              ` - ${child.section}`}
                          </span>

                        </div>

                      </div>
                    </div>
                  );
                })}

              </div>

            </div>

            {/* PASSWORD */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl  border-white p-6 shadow-xl text-white">

              <h2 className="text-xl font-bold mb-5">
                Change Password
              </h2>

              <div className="space-y-4">

                <div className="relative">

                  <input
                    type={showNew ? "text" : "password"}
                    value={pw.newPassword}
                    onChange={(e) =>
                      setPw((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    placeholder="New Password"
                    className="   w-full
      rounded-xl
      border
      border-slate-500
      bg-slate-800/40
      p-3
      pr-10
      text-white
      placeholder:text-slate-400
      focus:border-blue-500
      focus:ring-2
      focus:ring-blue-500/30
      outline-none
      transition-all"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNew(!showNew)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
                  >
                    {showNew ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>

                </div>

                <div className="relative border-white ">

                  <input
                    type={
                      showConfirm
                        ? "text"
                        : "password"
                    }
                    value={pw.confirm}
                    onChange={(e) =>
                      setPw((prev) => ({
                        ...prev,
                        confirm: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    placeholder="Confirm Password"
                    className="   w-full
      rounded-xl
      border
      border-slate-500
      bg-slate-800/40
      p-3
      pr-10
      text-white
      placeholder:text-slate-400
      focus:border-blue-500
      focus:ring-2
      focus:ring-blue-500/30
      outline-none
      transition-all"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirm(!showConfirm)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
                  >
                    {showConfirm ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>

                </div>

                <button
                  onClick={changePassword}
                  disabled={!isEditing}
                  className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl py-3 font-semibold disabled:bg-slate-500"
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