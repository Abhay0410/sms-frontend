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
      <div className="min-h-screen flex items-center justify-center">
        Loading...
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
    <div className="min-h-screen ">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row gap-8 items-center">

            <div className="relative">
              <div className="h-32 w-32 rounded-2xl overflow-hidden border-4 border-white bg-white">

                <img
                  src={photoUrl}
                  alt="Parent"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold">
                {parentInfo.name}
              </h1>

              <div className="mt-3 space-y-1 text-slate-200">
                <p>
                  Parent ID :{" "}
                  {parentInfo.parentID}
                </p>

                <p>
                  Email :{" "}
                  {parentInfo.email}
                </p>

                <p>
                  Relation :{" "}
                  {parentInfo.relation}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

          {/* LEFT */}

          <div className="lg:col-span-2 space-y-6">

            {/* CHILDREN */}

            <div className="bg-white rounded-3xl p-6 shadow">
              <h2 className="text-xl font-bold mb-5">
                Children
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {children.map((child) => {
                  const childPhoto =
                    child.profilePicture
                      ? child.profilePicture.startsWith(
                          "http"
                        )
                        ? child.profilePicture
                        : `${API_URL}/uploads/${parentInfo.schoolId}/students/${child.profilePicture}`
                      : "/assets/default-student-avatar.png";

                  return (
                    <div
                      key={child._id}
                      className="border rounded-2xl p-4"
                    >
                      <div className="flex gap-4 items-center">

                        <img
                          src={childPhoto}
                          alt={child.name}
                          className="h-16 w-16 rounded-full object-cover"
                        />

                        <div>
                          <h3 className="font-bold">
                            {child.name}
                          </h3>

                          <p className="text-sm text-slate-500">
                            {
                              child.studentID
                            }
                          </p>

                          <p className="text-sm text-slate-500">
                            {
                              child.className
                            }{" "}
                            {child.section &&
                              `- ${child.section}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PHOTO */}

            <div className="bg-white rounded-3xl p-6 shadow">
              <h2 className="text-xl font-bold mb-5">
                Profile Photo
              </h2>

              <input
                type="file"
                accept="image/*"
                onChange={onPhotoChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* RIGHT */}

          <div className="space-y-6">

            {/* CONTACT */}

            <div className="bg-white rounded-3xl p-6 shadow">

              <h2 className="text-xl font-bold mb-5">
                Parent Information
              </h2>

              <div className="space-y-4">

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  disabled={!isEditing}
                  placeholder="Name"
                  className="w-full border rounded-xl p-3"
                />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  disabled={!isEditing}
                  placeholder="Email"
                  className="w-full border rounded-xl p-3"
                />

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={(e) => {
                    const value =
                      e.target.value.replace(
                        /\D/g,
                        ""
                      );

                    if (
                      value.length <= 10
                    ) {
                      setForm((prev) => ({
                        ...prev,
                        phone: value,
                      }));
                    }
                  }}
                  disabled={!isEditing}
                  placeholder="Phone"
                  className="w-full border rounded-xl p-3"
                />

                <input
                  type="text"
                  name="occupation"
                  value={form.occupation}
                  onChange={onChange}
                  disabled={!isEditing}
                  placeholder="Occupation"
                  className="w-full border rounded-xl p-3"
                />

                <input
                  type="text"
                  name="qualification"
                  value={form.qualification}
                  onChange={onChange}
                  disabled={!isEditing}
                  placeholder="Qualification"
                  className="w-full border rounded-xl p-3"
                />

                <textarea
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  disabled={!isEditing}
                  placeholder="Address"
                  rows={4}
                  className="w-full border rounded-xl p-3"
                />

              </div>

              {!isEditing ? (
                <button
                  onClick={() =>
                    setIsEditing(true)
                  }
                  className="mt-6 w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3 mt-6">

                  <button
                    onClick={() =>
                      setIsEditing(false)
                    }
                    className="flex-1 bg-slate-200 rounded-xl py-3 font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={onSave}
                    className="flex-1 bg-green-600 text-white rounded-xl py-3 font-semibold"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* PASSWORD */}

            <div className="bg-slate-800 text-white rounded-3xl p-6 shadow">

              <h2 className="text-xl font-bold mb-5">
                Change Password
              </h2>

              <div className="space-y-4">

                <div className="relative">
                  <input
                    type={
                      showNew
                        ? "text"
                        : "password"
                    }
                    value={pw.newPassword}
                    onChange={(e) =>
                      setPw((prev) => ({
                        ...prev,
                        newPassword:
                          e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    placeholder="New Password"
                    className="w-full border rounded-xl p-3 pr-10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNew(
                        !showNew
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showNew ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>

                <div className="relative">
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
                        confirm:
                          e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    placeholder="Confirm Password"
                    className="w-full border rounded-xl p-3 pr-10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirm(
                        !showConfirm
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2"
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
                  className="w-full bg-blue-800 text-white rounded-xl py-3 font-semibold disabled:bg-slate-400"
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