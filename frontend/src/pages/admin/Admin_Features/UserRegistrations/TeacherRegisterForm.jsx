// pages/admin/Admin_Features/UserRegistrations/TeacherRegisterForm.jsx
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";

import {
  FaCheck,
  FaSpinner,
  FaCopy,
  FaUniversity,
  FaWallet,
  FaChalkboardTeacher,
} from "react-icons/fa";
import Select from "react-select";
import Swal from "sweetalert2";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const Input = ({ label, error, required, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold text-slate-700">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      {...props}
      className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
        error 
          ? "border-rose-500 bg-rose-50/30 focus:ring-2 focus:ring-rose-200" 
          : "border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      }`}
    />
    {error && <span className="text-[11px] font-bold text-rose-600 animate-pulse">{error}</span>}
  </div>
);

const FormSelect = ({ label, error, required, options, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold text-slate-700">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <select
      {...props}
      className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
        error 
          ? "border-rose-500 bg-rose-50/30 focus:ring-2 focus:ring-rose-200" 
          : "border-gray-300 focus:ring-2 focus:ring-indigo-500"
      }`}
    >
      <option value="">Select {label}</option>
      {options.map(opt => (
        <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
      ))}
    </select>
    {error && <span className="text-[11px] font-bold text-rose-600">{error}</span>}
  </div>
);

export default function TeacherRegisterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
    },
    gender: "",
    dateOfBirth: "",
    qualification: [""],
    subjects: [],
    department: "",
    joiningDate: "",
    panNumber: "",
    salary: {
      paymentMode: "BANK",
      bankDetails: {
        accountNumber: "",
        ifscCode: "",
        bankName: "",
        branchName: "",
        accountHolderName: "",
      },
      uanNumber: "",
      pfAccountNumber: "",
      esiNumber: "",
    },
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
  const [errors, setErrors] = useState({});

  const [allSubjects, setAllSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

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

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    if (["street", "city", "state", "country", "pincode"].includes(name)) {
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
    } else if (
      [
        "accountNumber",
        "ifscCode",
        "bankName",
        "branchName",
        "accountHolderName",
      ].includes(name)
    ) {
      setForm((prev) => ({
        ...prev,
        salary: {
          ...prev.salary,
          bankDetails: {
            ...prev.salary.bankDetails,
            [name]: value,
          },
        },
      }));
    } else if (
      ["paymentMode", "uanNumber", "pfAccountNumber", "esiNumber"].includes(
        name,
      )
    ) {
      setForm((prev) => ({
        ...prev,
        salary: { ...prev.salary, [name]: value },
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

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
    const pincodeRegex = /^[0-9]{6}$/;

    if (!form.name.trim()) newErrors.name = "Full Name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(form.phone)) {
      newErrors.phone = "Must be 10 digits";
    }
    if (form.panNumber && !panRegex.test(form.panNumber)) {
        newErrors.panNumber = "Invalid PAN format (e.g., ABCDE1234F)";
    }
    if (!form.gender) newErrors.gender = "Gender is required";
    if (!form.dateOfBirth) newErrors.dateOfBirth = "Date of Birth is required";
    if (!form.joiningDate) newErrors.joiningDate = "Joining Date is required";
    if (!form.department) newErrors.department = "Department is required";
    if (!form.address.street.trim()) newErrors.street = "Street Address is required";
    if (!form.address.city.trim()) newErrors.city = "City is required";
    if (!form.address.state) newErrors.state = "State is required";
    if (!form.address.pincode.trim()) {
        newErrors.pincode = "Pincode is required";
    } else if (!pincodeRegex.test(form.address.pincode)) {
        newErrors.pincode = "Pincode must be 6 digits";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
        toast.error("Please fix the highlighted errors.");
        return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const formatDateForBackend = (dateStr) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split("/");
        return `${year}-${month}-${day}`;
      };

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("gender", form.gender);
      formData.append("department", form.department);
      formData.append("panNumber", form.panNumber);
      formData.append("isActive", true);
      formData.append("dateOfBirth", formatDateForBackend(form.dateOfBirth));
      formData.append("joiningDate", formatDateForBackend(form.joiningDate));
      formData.append("qualification", JSON.stringify(form.qualification.filter(Boolean)));
      formData.append("subjects", JSON.stringify(form.subjects));
      formData.append("address", JSON.stringify(form.address));
      formData.append("salary", JSON.stringify(form.salary));

      if (profilePicture) formData.append("profilePicture", profilePicture);

      const resp = await api.post(
        API_ENDPOINTS.ADMIN.TEACHER.CREATE,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      // --- SUCCESS BLOCK ---
      const teacherData = resp?.data?.teacher || resp?.data || resp;
      const tID = teacherData.teacherID;
      const tPass = teacherData.credentials?.password || "Teacher@123";

      Swal.fire({
        icon: "success",
        title: "Teacher Registered Successfully 🎉",
        html: `
          <div style="text-align: left; padding: 10px;">
            <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
              <p style="margin: 0; color: #166534;"><b>Teacher ID:</b> ${tID}</p>
            </div>
            <div style="background: #fffbeb; padding: 12px; border-radius: 8px;">
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #92400e;"><b>TEMPORARY PASSWORD:</b></p>
              <code style="display: block; background: white; padding: 8px; border-radius: 4px; color: #4338ca;">${tPass}</code>
            </div>
            <p style="font-size: 11px; color: #b91c1c; margin-top: 15px; font-weight: 600;">⚠️ Please save these credentials now.</p>
          </div>
        `,
        confirmButtonText: "Copy & Close",
        confirmButtonColor: "#4f46e5",
        preConfirm: () => {
          navigator.clipboard.writeText(`Teacher ID: ${tID} | Pass: ${tPass}`);
          toast.success("Copied to clipboard");
        },
      });

      // Reset form on success
      setForm({
        name: "",
        email: "",
        phone: "",
        address: {
          street: "",
          city: "",
          state: "",
          country: "India",
          pincode: "",
        },
        gender: "",
        dateOfBirth: "",
        qualification: [""],
        subjects: [],
        department: "",
        joiningDate: "",
        panNumber: "",
        salary: {
          paymentMode: "BANK",
          bankDetails: {
            accountNumber: "",
            ifscCode: "",
            bankName: "",
            branchName: "",
            accountHolderName: "",
          },
          uanNumber: "",
          pfAccountNumber: "",
          esiNumber: "",
        },
      });
      setErrors({});
      setProfilePicture(null);

    } catch (err) {
      // --- THE ROBUST ERROR PARSER ---
      const serverData = err?.response?.data;
      let actualReason = "Teacher Registration Failed";

      // Logic: Extract from errors array (backend fix) or direct message
      if (serverData?.errors && Array.isArray(serverData.errors)) {
        actualReason = serverData.errors[0].message || serverData.errors[0];
      } else {
        actualReason = serverData?.message || err.message;
      }

      const cleanReason = actualReason.replace("ValidationError:", "").trim();
      const mappedErrors = { ...errors };
      const lowerMsg = cleanReason.toLowerCase();

      // Mapping conflicts to specific teacher fields
      if (lowerMsg.includes("email")) mappedErrors.email = "Email already registered.";
      if (lowerMsg.includes("phone")) mappedErrors.phone = "Phone number already exists.";
      if (lowerMsg.includes("pan")) mappedErrors.panNumber = "PAN card already registered.";
      if (lowerMsg.includes("department")) mappedErrors.department = "Select a valid department.";

      setErrors(mappedErrors);

      Swal.fire({
        icon: "warning",
        title: "Conflict Detected",
        html: `
            <div style="text-align: left; background: #fff7ed; padding: 16px; border-radius: 12px; border: 1px solid #ffedd5;">
                <span style="color: #9a3412; font-weight: 800; font-size: 11px; text-transform: uppercase;">Detailed Reason:</span>
                <p style="color: #7c2d12; font-size: 14px; margin-top: 8px; line-height: 1.5; font-weight: 600;">
                    ${cleanReason}
                </p>
            </div>
        `,
        confirmButtonColor: "#4f46e5",
        confirmButtonText: "Review Details"
      });

      // Auto-scroll logic
      const firstError = Object.keys(mappedErrors).find(key => mappedErrors[key]);
      if (firstError) {
        const el = document.getElementsByName(firstError)[0] || document.querySelector(`[name="${firstError}"]`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => el?.focus(), 500);
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 ">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
            <FaChalkboardTeacher className="text-indigo-600" /> Teacher
            Enrollment
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Add a new teacher to the system
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-1 bg-indigo-600"></div>
          <form onSubmit={onSubmit} className="p-10 space-y-10">
            {/* Personal Details */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Full Name */}
              <Input
                label="Full Name"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Enter teacher's full name"
                required
                error={errors.name}
              />

              {/* Email */}
              <Input
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="teacher@example.com"
                required
                error={errors.email}
              />

              {/* Phone */}
              <Input
                label="Phone Number"
                type="tel"
                name="phone"
                pattern="[0-9]{10}"
                maxLength="10"
                value={form.phone}
                onChange={onChange}
                placeholder="10-digit phone number"
                required
                error={errors.phone}
              />

              {/* PAN Number */}
              {/* <Input
                  label="PAN Number"
                  type="text"
                  name="panNumber"
                  value={form.panNumber}
                  onChange={onChange}
                  placeholder="Enter PAN Number"
              /> */}
              <Input
                label="PAN Number"
                type="text"
                name="panNumber"
                value={form.panNumber}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // auto uppercase
                  if (value.length <= 10) {
                    setForm((prev) => ({ ...prev, panNumber: value }));
                  }
                }}
                placeholder="ABCDE1234F"
                maxLength={10}
                error={errors.panNumber}
              />

              {/* Gender */}
              <FormSelect
                label="Gender"
                name="gender"
                value={form.gender}
                onChange={onChange}
                options={["Male", "Female", "Other"]}
                required
                error={errors.gender}
              />

              {/* Date of Birth */}
              <div>
                <label className={`text-sm font-semibold ${errors.dateOfBirth ? 'text-rose-500' : 'text-slate-700'}`}>
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={(() => {
                    if (!form.dateOfBirth) return null;
                    const [day, month, year] = form.dateOfBirth.split("/");
                    if (!day || !month || !year) return null;
                    const date = new Date(year, month - 1, day);
                    return isNaN(date.getTime()) ? null : date;
                  })()}
                  onChange={(date) => {
                    const formatted = date
                      ? `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`
                      : "";
                    setForm((prev) => ({ ...prev, dateOfBirth: formatted }));
                    if (errors.dateOfBirth) setErrors(prev => ({ ...prev, dateOfBirth: null }));
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  className={`w-full mt-1 p-2.5 border rounded-lg outline-none transition-all ${
                    errors.dateOfBirth 
                      ? "border-rose-500 bg-rose-50/30 focus:ring-2 focus:ring-rose-200" 
                      : "border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  }`}
                  required
                />
                {errors.dateOfBirth && <span className="text-[11px] font-bold text-rose-600">{errors.dateOfBirth}</span>}
              </div>

              {/* Joining Date */}
              <div>
                <label className={`text-sm font-semibold ${errors.joiningDate ? 'text-rose-500' : 'text-slate-700'}`}>
                  Joining Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={(() => {
                    if (!form.joiningDate) return null;
                    const [day, month, year] = form.joiningDate.split("/");
                    if (!day || !month || !year) return null;
                    const date = new Date(year, month - 1, day);
                    return isNaN(date.getTime()) ? null : date;
                  })()}
                  onChange={(date) => {
                    const formatted = date
                      ? `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`
                      : "";
                    setForm((prev) => ({ ...prev, joiningDate: formatted }));
                    if (errors.joiningDate) setErrors(prev => ({ ...prev, joiningDate: null }));
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  className={`w-full mt-1 p-2.5 border rounded-lg outline-none transition-all ${
                    errors.joiningDate 
                      ? "border-rose-500 bg-rose-50/30 focus:ring-2 focus:ring-rose-200" 
                      : "border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  }`}
                  required
                />
                {errors.joiningDate && <span className="text-[11px] font-bold text-rose-600">{errors.joiningDate}</span>}
              </div>

              {/* Profile Picture */}
              <div className="md:col-span-2">
                <label className="text-sm font-bold text-slate-700 block mb-3">
                  Upload Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePicture(e.target.files[0])}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              {/* Qualification */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
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
                        className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    <FormSelect
                      label="Department"
                      name="department"
                      value={form.department}
                      onChange={onChange}
                      required
                      options={DEPARTMENT_OPTIONS}
                      error={errors.department}
                    />
                  </div>

                  {/* Subjects */}
                  <div>
                    <label className={`text-sm font-semibold ${errors.subjects ? 'text-rose-500' : 'text-slate-700'}`}>
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
                            form.subjects.includes(option.value),
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
                        className={`basic-multi-select mt-1 ${errors.subjects ? 'react-select-error' : ''}`}
                        classNamePrefix="mt-1 select"
                      />
                    ) : (
                      <p>No subjects available</p>
                    )}
                    {errors.subjects && <span className="text-[11px] font-bold text-rose-600">{errors.subjects}</span>}
                  </div>
                </div>
              </div>

              {/* Address */}
              {/* Address Section */}
              <div className="md:col-span-2 bg-slate-50 p-8 rounded-3xl border border-slate-100">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                  Residential Information
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* City */}
                  <div className="md:col-span-2">
                    <Input
                      label="Street Address"
                      type="text"
                      name="street"
                      value={form.address.street}
                      onChange={onChange}
                      placeholder="Enter street address"
                      required
                      error={errors.street}
                    />
                  </div>

                  <Input
                    label="City"
                    type="text"
                    name="city"
                    value={form.address.city}
                    onChange={onChange}
                    placeholder="Enter city"
                    required
                    error={errors.city}
                  />

                  {/* State */}
                  <FormSelect
                    label="State"
                    name="state"
                    value={form.address.state}
                    onChange={onChange}
                    options={INDIAN_STATES}
                    required
                    error={errors.state}
                  />

                  {/* Country */}
                  <Input
                    label="Country"
                    type="text"
                    name="country"
                    value={form.address.country}
                    onChange={onChange}
                    required
                    error={errors.country}
                  />

                  {/* Pincode */}
                  <Input
                    label="Pincode"
                    type="text"
                    name="pincode"
                    pattern="[0-9]{6}"
                    maxLength="6"
                    value={form.address.pincode}
                    onChange={onChange}
                    placeholder="Enter pincode"
                    required
                    error={errors.pincode}
                  />
                </div>
              </div>

              {/* 2. Payroll Statutory (2026 Logic) */}
              <div className="md:col-span-2 bg-slate-900 p-8 rounded-3xl text-white shadow-xl">
                <h3 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <FaWallet /> Statutory Compliance (PF/ESI)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-500">
                      Universal Account No (UAN)
                    </label>
                    {/* <input
                      name="uanNumber"
                      onChange={onChange}
                      value={form.salary.uanNumber}
                      className="w-full bg-slate-800 border-none p-4 rounded-xl text-white focus:ring-2 focus:ring-orange-500 transition-all"
                    /> */}
                    <input
                      type="tel"
                      name="uanNumber"
                      value={form.salary.uanNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ""); // only digits
                        if (value.length <= 18) {
                          setForm((prev) => ({
                            ...prev,
                            salary: {
                              ...prev.salary,
                              uanNumber: value,
                            },
                          }));
                        }
                      }}
                      maxLength={18}
                      inputMode="numeric"
                      placeholder="Enter 12 digit UAN"
                      className="w-full bg-slate-800 border-none p-4 rounded-xl text-white focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-500">
                      PF Member ID
                    </label>
                    <input
                      name="pfAccountNumber"
                      onChange={onChange}
                      value={form.salary.pfAccountNumber}
                      className="w-full bg-slate-800 border-none p-4 rounded-xl text-white focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-500">
                      Payment Mode
                    </label>
                    <select
                      name="paymentMode"
                      onChange={onChange}
                      value={form.salary.paymentMode}
                      className="w-full bg-slate-800 border-none p-4 rounded-xl text-white focus:ring-2 focus:ring-orange-500 transition-all"
                    >
                      <option value="BANK">Bank Transfer</option>
                      <option value="CASH">Cash</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Bank Details */}
              <div className="md:col-span-2 bg-slate-50 p-8 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <FaUniversity /> Banking Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                      Account Holder Name
                    </label>
                    <input
                      name="accountHolderName"
                      onChange={onChange}
                      value={form.salary.bankDetails.accountHolderName}
                      className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                      Bank Name
                    </label>
                    <input
                      name="bankName"
                      onChange={onChange}
                      value={form.salary.bankDetails.bankName}
                      className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                  {/* <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                      Account Number
                    </label>
                    <input
                      name="accountNumber"
                      onChange={onChange}
                      value={form.salary.bankDetails.accountNumber}
                      className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div> */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                      Account Number
                    </label>

                    <input
                      type="tel"
                      name="accountNumber"
                      value={form.salary.bankDetails.accountNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ""); // only digits
                        if (value.length <= 18) {
                          setForm((prev) => ({
                            ...prev,
                            salary: {
                              ...prev.salary,
                              bankDetails: {
                                ...prev.salary.bankDetails,
                                accountNumber: value,
                              },
                            },
                          }));
                        }
                      }}
                      maxLength={18}
                      inputMode="numeric"
                      placeholder="Enter account number"
                      className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                  {/* <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                      IFSC Code
                    </label>
                    <input
                      name="ifscCode"
                      onChange={onChange}
                      value={form.salary.bankDetails.ifscCode}
                      className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div> */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                      IFSC Code
                    </label>

                    <input
                      type="text"
                      name="ifscCode"
                      value={form.salary.bankDetails.ifscCode}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase(); // auto uppercase
                        if (value.length <= 11) {
                          setForm((prev) => ({
                            ...prev,
                            salary: {
                              ...prev.salary,
                              bankDetails: {
                                ...prev.salary.bankDetails,
                                ifscCode: value,
                              },
                            },
                          }));
                        }
                      }}
                      maxLength={11}
                      placeholder="e.g. SBIN0001234"
                      className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                      Branch Name
                    </label>
                    <input
                      name="branchName"
                      onChange={onChange}
                      value={form.salary.bankDetails.branchName}
                      className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <>
                    <FaCheck className="h-4 w-4" />
                    Initialize Account
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
