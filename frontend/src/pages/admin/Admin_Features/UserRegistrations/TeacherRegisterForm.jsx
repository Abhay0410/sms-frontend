// pages/admin/Admin_Features/UserRegistrations/TeacherRegisterForm.jsx
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";

import { FaCheck, FaSpinner, FaCopy } from "react-icons/fa";
import Select from "react-select";
import Swal from "sweetalert2";

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
    department: "",
  });

  const DEPARTMENT_OPTIONS = [
    "Mathematics",
    "Science",
    "Languages",
    "Social Science",
    "Computer Science",
    "Environmental Studies",
    "Physical Education",
    "Arts & Craft",
    "Music",
    "Library",
    "Primary Education",
  ];

  // const SUBJECT_OPTIONS = [
  //   "Math",
  //   "Physics",
  //   "Chemistry",
  //   "Biology",
  //   "English",
  //   "Hindi",
  //   "History",
  //   "Geography",
  //   "Computer Science",
  //   "Economics",
  // ];

  const [loading, setLoading] = useState(false);

  const [allSubjects, setAllSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setSubjectsLoading(true);

        const resp = await api.get(API_ENDPOINTS.ADMIN.SUBJECT_MANAGEMENT.ALL);

        const subjectsData = resp.data?.subjects || resp.subjects || [];

        // ✅ make subjects unique
        const uniqueSubjects = [
          ...new Set(subjectsData.map((s) => s.subjectName)),
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
        department: form.department,
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

      Swal.fire({
        icon: "success",
        title: "Teacher Registered Successfully 🎉",
        html: `
    <div style="text-align:left; font-size:14px">

      <p><b>Teacher ID:</b>
        <span style="color:#2563eb; font-weight:600">
          ${teacherData.teacherID || "N/A"}
        </span>
      </p>


      <hr style="margin:12px 0"/>

      <p style="font-weight:600">Password</p>

      <div style="
        background:#eef2ff;
        padding:10px;
        border-radius:8px;
        margin-top:6px;
        text-align:center;
        color:#4338ca;
        font-size:14px
      ">
        ${
          teacherData.credentials?.password ||
          teacherData.credentials?.defaultPassword ||
          "Teacher@123"
        }
      </div>

      <p style="font-size:12px;color:#b91c1c;margin-top:8px">
        ⚠️ Please save these credentials. They will not be shown again.
      </p>

    </div>
  `,
        confirmButtonText: "Done",
        confirmButtonColor: "#4f46e5",
      });

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
        department: "",
      });
    } catch (err) {
      console.error("❌ Registration error:", err);
      const msg = err?.message || "Failed to register teacher";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
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
              {/* Department + Subjects */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>

                    <select
                      name="department"
                      value={form.department}
                      onChange={onChange}
                      required
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    >
                      <option value="" className="text-gray-600">
                        Select Department
                      </option>
                      {DEPARTMENT_OPTIONS.map((dept, index) => (
                        <option key={index} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subjects */}
                  <div>
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
                          .filter((option) =>
                            form.subjects.includes(option.value)
                          )}
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
                </div>
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
      </div>
    </div>
  );
}
