// pages/admin/Admin_Features/UserRegistrations/StudentParentRegisterForm.jsx
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaUserGraduate,
  FaUserTie,
  FaCheck,
  FaSpinner,
  FaCopy,
} from "react-icons/fa";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
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

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const RELIGION_OPTIONS = [
  "Hinduism",
  "Islam",
  "Christianity",
  "Sikhism",
  "Buddhism",
  "Jainism",
  "Other",
];
const CASTE_OPTIONS = ["General", "OBC", "SC", "ST", "Other"];
const RELATION_OPTIONS = [
  "Father",
  "Mother",
  "Grandparent",
  "Uncle",
  "Aunt",
  "Other",
];
const CLASS_OPTIONS = [
  // Pre-primary classes
  { value: "Nursery", label: "Nursery" },
  { value: "LKG", label: "LKG" },
  { value: "UKG", label: "UKG" },
  // Classes 1-12
  { value: "1", label: "Class 1" },
  { value: "2", label: "Class 2" },
  { value: "3", label: "Class 3" },
  { value: "4", label: "Class 4" },
  { value: "5", label: "Class 5" },
  { value: "6", label: "Class 6" },
  { value: "7", label: "Class 7" },
  { value: "8", label: "Class 8" },
  { value: "9", label: "Class 9" },
  { value: "10", label: "Class 10" },
  { value: "11", label: "Class 11" },
  { value: "12", label: "Class 12" },
];
const ACADEMIC_YEAR_OPTIONS = [
  "2023-2024",
  "2024-2025",
  "2025-2026",
  "2026-2027",
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
    {error && (
      <span className="text-[11px] font-bold text-rose-600 animate-pulse">
        {error}
      </span>
    )}
  </div>
);

const Select = ({ label, error, required, options, ...props }) => (
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
      {options.map((opt) => (
        <option key={opt.value || opt} value={opt.value || opt}>
          {opt.label || opt}
        </option>
      ))}
    </select>
    {error && (
      <span className="text-[11px] font-bold text-rose-600">{error}</span>
    )}
  </div>
);

export default function StudentParentRegisterForm() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [session, setSession] = useState([]);
  const [academicYear, setAcademicYear] = useState("2025-2026");

  const [studentForm, setStudentForm] = useState({
    studentName: "",
    studentEmail: "",
    dateOfBirth: null,
    gender: "",
    bloodGroup: "",
    religion: "",
    caste: "",
    nationality: "Indian",
    aadharNumber: "",

    // Address
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",

    // Father Details
    fatherName: "",
    fatherPhone: "",
    fatherEmail: "",
    fatherOccupation: "",

    // Mother Details
    motherName: "",
    motherPhone: "",
    motherEmail: "",
    motherOccupation: "",

    // Guardian Details (Parent Account)
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianRelation: "",
    guardianOccupation: "",
    guardianQualification: "",
    guardianIncome: "",

    // Academic - ✅ UPDATED: className instead of classId, NO section
    className: "", // ✅ Store class as string
    academicYear: "",
    previousSchool: "",

    // Medical
    medicalHistory: "",
    allergies: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",

    // Transport
    transportRequired: false,
    busRoute: "",
    pickupPoint: "",

    // Hostel
    hostelResident: false,
    hostelBlock: "",
    roomNumber: "",
  });

  const onStudentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStudentForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear the error for this specific field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const getCurrentAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return month >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };

  const fetchSessions = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.SESSION.GET_All_SESSION);

      console.log("FULL RES:", res);

      // ✅ Always correct data
      let sessionData = Array.isArray(res) ? res : res?.data || [];

      // ✅ Remove duplicates (safe)
      sessionData = sessionData.filter(
        (s, index, self) =>
          index ===
          self.findIndex(
            (x) => x.startYear === s.startYear && x.endYear === s.endYear,
          ),
      );

      // ✅ Sort
      sessionData.sort((a, b) => a.startYear - b.startYear);

      console.log("FINAL SESSION DATA:", sessionData);

      setSession(sessionData);

      // ✅ Active session select
      const active = sessionData.find((s) => s?.isActive);

      if (active) {
        setAcademicYear(`${active.startYear}-${active.endYear}`);
      }
    } catch (err) {
      console.error("Session fetch error", err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const validateForm = () => {
    let tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    // Basic Info
    if (!studentForm.studentName.trim())
      tempErrors.studentName = "Student name is required";
    if (!studentForm.dateOfBirth)
      tempErrors.dateOfBirth = "Date of birth is required";
    if (!studentForm.gender) tempErrors.gender = "Gender is required";

    // Address
    if (!studentForm.street.trim())
      tempErrors.street = "Street address is required";
    if (!studentForm.city.trim()) tempErrors.city = "City is required";
    if (!studentForm.state) tempErrors.state = "State is required";
    if (!studentForm.pincode.trim()) tempErrors.pincode = "Pincode is required";

    // Parent/Guardian Info
    if (!studentForm.fatherName.trim())
      tempErrors.fatherName = "Father's name is required";
    if (!studentForm.guardianName.trim())
      tempErrors.guardianName = "Guardian name is required";

    if (!studentForm.guardianEmail.trim()) {
      tempErrors.guardianEmail = "Email is required";
    } else if (!emailRegex.test(studentForm.guardianEmail)) {
      tempErrors.guardianEmail = "Invalid email format";
    }

    if (!studentForm.guardianPhone.trim()) {
      tempErrors.guardianPhone = "Phone is required";
    } else if (!phoneRegex.test(studentForm.guardianPhone.replace(/\D/g, ""))) {
      tempErrors.guardianPhone = "Must be 10 digits";
    }

    if (!studentForm.guardianRelation)
      tempErrors.guardianRelation = "Relation is required";

    // Academic
    if (!studentForm.className) tempErrors.className = "Class is required";
    if (!studentForm.academicYear)
      tempErrors.academicYear = "Academic year is required";

    setErrors(tempErrors);

    // Scroll to the first error
    const firstError = Object.keys(tempErrors)[0];
    if (firstError) {
      // Try to find element by name attribute
      const element =
        document.getElementsByName(firstError)[0] ||
        document.querySelector(`[name="${firstError}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      } else if (firstError === "dateOfBirth") {
        // Fallback for DatePicker wrapper if needed
        const dateEl = document.querySelector(".react-datepicker-wrapper");
        if (dateEl)
          dateEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      toast.error("Please fix the highlighted errors");
      return false;
    }

    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        ...studentForm,
        dateOfBirth: studentForm.dateOfBirth
          ? studentForm.dateOfBirth.toISOString()
          : undefined,
        parentName: studentForm.guardianName,
        parentEmail: studentForm.guardianEmail,
        parentPhone: studentForm.guardianPhone.replace(/\D/g, ""),
        parentRelation: studentForm.guardianRelation,
        parentOccupation: studentForm.guardianOccupation,
        parentQualification: studentForm.guardianQualification,
        parentIncome: studentForm.guardianIncome
          ? Number(studentForm.guardianIncome)
          : undefined,
      };

      const resp = await api.post(
        API_ENDPOINTS.ADMIN.STUDENT.CREATE_WITH_PARENT,
        payload,
      );

      // --- SUCCESS BLOCK ---
      const { student, parent } = resp?.data?.data || resp?.data || {};
      const sID = student?.studentID;
      const sPass = student?.credentials?.password;
      const pID = parent?.credentials?.parentID;
      const pPass = parent?.credentials?.password;

      Swal.fire({
        icon: "success",
        title: "Enrollment Successful!",
        html: `
          <div style="text-align: left; font-family: sans-serif;">
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 12px; margin-bottom: 12px;">
               <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                 <span style="color: #166534; font-size: 14px;"><b>Student ID:</b> ${sID}</span>
                 <button id="copySID" style="font-size: 10px; padding: 2px 8px; background: white; border: 1px solid #bbf7d0; border-radius: 4px; cursor: pointer; color: #166534;">Copy</button>
               </div>
               <div style="display: flex; justify-content: space-between; align-items: center;">
                 <span style="color: #166534; font-size: 14px;"><b>Parent ID:</b> ${pID}</span>
                 <button id="copyPID" style="font-size: 10px; padding: 2px 8px; background: white; border: 1px solid #bbf7d0; border-radius: 4px; cursor: pointer; color: #166534;">Copy</button>
               </div>
            </div>
            <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 15px; border-radius: 12px;">
               <p style="margin: 0 0 8px 0; font-size: 11px; color: #92400e; font-weight: 800; text-transform: uppercase;">Generated Access Keys:</p>
               <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #e5e7eb;">
                 <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                   <span style="font-size: 13px;"><b>Student:</b> <code style="color: #4338ca;">${sPass}</code></span>
                   <button id="copySPass" style="font-size: 10px; padding: 2px 8px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 4px; cursor: pointer; color: #4338ca;">Copy</button>
                 </div>
                 <div style="display: flex; justify-content: space-between; align-items: center;">
                   <span style="font-size: 13px;"><b>Parent:</b> <code style="color: #4338ca;">${pPass}</code></span>
                   <button id="copyPPass" style="font-size: 10px; padding: 2px 8px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 4px; cursor: pointer; color: #4338ca;">Copy</button>
                 </div>
               </div>
            </div>
            <p style="color: #b91c1c; font-size: 11px; margin-top: 15px; font-weight: 600; text-align: center;">⚠️ Save these keys now. They are not stored in plain text.</p>
          </div>
        `,
        confirmButtonText: "Copy All & Close",
        confirmButtonColor: "#2563eb",
        didOpen: () => {
          const copy = (text, label) => {
            navigator.clipboard.writeText(text);
            toast.success(`${label} copied!`);
          };
          document.getElementById("copySID").onclick = () =>
            copy(sID, "Student ID");
          document.getElementById("copyPID").onclick = () =>
            copy(pID, "Parent ID");
          document.getElementById("copySPass").onclick = () =>
            copy(sPass, "Student Password");
          document.getElementById("copyPPass").onclick = () =>
            copy(pPass, "Parent Password");
        },
        preConfirm: () => {
          navigator.clipboard.writeText(
            `IDs: Student(${sID}), Parent(${pID}) | Keys: Student(${sPass}), Parent(${pPass})`,
          );
          toast.success("Credentials copied");
        },
      });

      // Clear state
      setStudentForm({
        studentName: "",
        studentEmail: "",
        dateOfBirth: null,
        gender: "",
        bloodGroup: "",
        religion: "",
        caste: "",
        nationality: "Indian",
        aadharNumber: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        fatherName: "",
        fatherPhone: "",
        fatherEmail: "",
        fatherOccupation: "",
        motherName: "",
        motherPhone: "",
        motherEmail: "",
        motherOccupation: "",
        guardianName: "",
        guardianPhone: "",
        guardianEmail: "",
        guardianRelation: "",
        guardianOccupation: "",
        guardianQualification: "",
        guardianIncome: "",
        className: "",
        academicYear: "",
        previousSchool: "",
        medicalHistory: "",
        allergies: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelation: "",
        transportRequired: false,
        busRoute: "",
        pickupPoint: "",
        hostelResident: false,
        hostelBlock: "",
        roomNumber: "",
      });
      setErrors({});
    } catch (err) {
      console.log("Full Error Object:", err); // Debugging ke liye

      // 1. EXACT TARGETING: Backend se message nikalne ka sabse robust tarika
      const serverMessage =
        err?.response?.data?.message || err?.message || "Registration Failed";

      // 2. Cleanup: "ValidationError:" prefix hatao agar backend bhej raha hai
      const displayMsg = serverMessage
        .replace(/^ValidationError:\s*/i, "")
        .trim();

      const mappedErrors = { ...errors };
      const lowerReason = displayMsg.toLowerCase();

      // 3. Field Highlighting (Inputs ko red karne ke liye)
      if (lowerReason.includes("student email")) {
        mappedErrors.studentEmail = "This email is already registered.";
      } else if (lowerReason.includes("aadhar")) {
        mappedErrors.aadharNumber = "Aadhar number already exists.";
      } else if (
        lowerReason.includes("parent email") ||
        lowerReason.includes("guardian email")
      ) {
        mappedErrors.guardianEmail = "This parent email is already in use.";
      } else if (
        lowerReason.includes("class") &&
        lowerReason.includes("not found")
      ) {
        mappedErrors.className = "Class configuration not found.";
      }

      setErrors(mappedErrors);

      // 4. THE POPUP: Ab ye pakka displayMsg (Reason) hi dikhayega
      Swal.fire({
        icon: "warning",
        title: "Conflict Detected",
        html: `
            <div style="text-align: left; background: #fff7ed; padding: 16px; border-radius: 12px; border: 1px solid #ffedd5;">
                <span style="color: #9a3412; font-weight: 800; font-size: 11px; text-transform: uppercase;">Reason:</span>
                <p style="color: #7c2d12; font-size: 14px; margin-top: 8px; line-height: 1.5; font-weight: 600;">
                    ${displayMsg}
                </p>
            </div>
        `,
        confirmButtonColor: "#4f46e5",
        confirmButtonText: "Review Details",
      });

      // 5. Scroll to error
      const firstError = Object.keys(mappedErrors).find(
        (key) => mappedErrors[key],
      );
      if (firstError) {
        const el =
          document.getElementsByName(firstError)[0] ||
          document.querySelector(`[name="${firstError}"]`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
            <FaUserGraduate className="text-indigo-600 size-8" /> Student & Parent
            Enrollment
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Complete registration for both student and parent in a single form
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-1 bg-indigo-600"></div>
          <form onSubmit={onSubmit} className="p-10 space-y-10">
            {/* Basic Information */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Input
                  label="Full Name"
                  name="studentName"
                  value={studentForm.studentName}
                  onChange={onStudentChange}
                  error={errors.studentName}
                  placeholder="Enter student's full name"
                  required
                />

                <Input
                  label="Email (Optional)"
                  type="email"
                  name="studentEmail"
                  value={studentForm.studentEmail}
                  onChange={onStudentChange}
                  error={errors.studentEmail}
                  placeholder="student@example.com"
                />

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={errors.dateOfBirth ? "date-error-wrapper" : ""}
                  >
                    <DatePicker
                      selected={studentForm.dateOfBirth}
                      onChange={(date) => {
                        setStudentForm((prev) => ({
                          ...prev,
                          dateOfBirth: date,
                        }));
                        setErrors((prev) => ({ ...prev, dateOfBirth: null }));
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="DD/MM/YYYY"
                      maxDate={new Date()}
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      className={`w-full rounded-lg border p-3 outline-none transition-all ${
                        errors.dateOfBirth
                          ? "border-rose-500 bg-rose-50/30"
                          : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      }`}
                      required
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <span className="text-[11px] font-bold text-rose-600">
                      {errors.dateOfBirth}
                    </span>
                  )}
                </div>

                <Select
                  label="Gender"
                  name="gender"
                  value={studentForm.gender}
                  onChange={onStudentChange}
                  options={GENDER_OPTIONS}
                  error={errors.gender}
                  required
                />

                <Select
                  label="Blood Group"
                  name="bloodGroup"
                  value={studentForm.bloodGroup}
                  onChange={onStudentChange}
                  options={BLOOD_GROUP_OPTIONS}
                  error={errors.bloodGroup}
                />

                <Select
                  label="Religion"
                  name="religion"
                  value={studentForm.religion}
                  onChange={onStudentChange}
                  options={RELIGION_OPTIONS}
                  error={errors.religion}
                />

                <Select
                  label="Caste/Category"
                  name="caste"
                  value={studentForm.caste}
                  onChange={onStudentChange}
                  options={CASTE_OPTIONS}
                  error={errors.caste}
                />

                <Input
                  label="Nationality"
                  type="text"
                  name="nationality"
                  value={studentForm.nationality}
                  onChange={onStudentChange}
                  placeholder="Indian"
                  error={errors.nationality}
                />

                <Input
                  label="Aadhar Number (Optional)"
                  type="text"
                  name="aadharNumber"
                  value={studentForm.aadharNumber}
                  onChange={onStudentChange}
                  pattern="[0-9]{12}"
                  maxLength="12"
                  placeholder="12-digit Aadhar"
                  error={errors.aadharNumber}
                />
              </div>
            </div>

            {/* Address */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                Residential Information
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Input
                    label="Street Address"
                    type="text"
                    name="street"
                    value={studentForm.street}
                    onChange={onStudentChange}
                    placeholder="Enter street address"
                    required
                    error={errors.street}
                  />
                </div>

                <Input
                  label="City"
                  type="text"
                  name="city"
                  value={studentForm.city}
                  onChange={onStudentChange}
                  placeholder="Enter city"
                  required
                  error={errors.city}
                />

                <Select
                  label="State"
                  name="state"
                  value={studentForm.state}
                  onChange={onStudentChange}
                  options={INDIAN_STATES}
                  error={errors.state}
                  required
                />

                <Input
                  label="Pincode"
                  type="text"
                  name="pincode"
                  value={studentForm.pincode}
                  onChange={onStudentChange}
                  pattern="[0-9]{6}"
                  maxLength="6"
                  placeholder="6-digit pincode"
                  required
                  error={errors.pincode}
                />

                <Input
                  label="Country"
                  type="text"
                  name="country"
                  value={studentForm.country}
                  onChange={onStudentChange}
                  placeholder="India"
                  error={errors.country}
                />
              </div>
            </div>

            {/* Father's Details */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                Father's Details
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input
                  label="Father's Name"
                  type="text"
                  name="fatherName"
                  value={studentForm.fatherName}
                  onChange={onStudentChange}
                  placeholder="Enter father's name"
                  required
                  error={errors.fatherName}
                />

                <Input
                  label="Father's Phone"
                  type="tel"
                  name="fatherPhone"
                  value={studentForm.fatherPhone}
                  onChange={onStudentChange}
                  pattern="[0-9]{10}"
                  maxLength="10"
                  placeholder="10-digit phone"
                  error={errors.fatherPhone}
                />

                <Input
                  label="Father's Email"
                  type="email"
                  name="fatherEmail"
                  value={studentForm.fatherEmail}
                  onChange={onStudentChange}
                  placeholder="father@example.com"
                  error={errors.fatherEmail}
                />

                <Input
                  label="Father's Occupation"
                  type="text"
                  name="fatherOccupation"
                  value={studentForm.fatherOccupation}
                  onChange={onStudentChange}
                  placeholder="Enter occupation"
                  error={errors.fatherOccupation}
                />
              </div>
            </div>

            {/* Mother's Details */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                Mother's Details (Optional)
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input
                  label="Mother's Name"
                  type="text"
                  name="motherName"
                  value={studentForm.motherName}
                  onChange={onStudentChange}
                  placeholder="Enter mother's name"
                  error={errors.motherName}
                />

                <Input
                  label="Mother's Phone"
                  type="tel"
                  name="motherPhone"
                  value={studentForm.motherPhone}
                  onChange={onStudentChange}
                  pattern="[0-9]{10}"
                  maxLength="10"
                  placeholder="10-digit phone"
                  error={errors.motherPhone}
                />

                <Input
                  label="Mother's Email"
                  type="email"
                  name="motherEmail"
                  value={studentForm.motherEmail}
                  onChange={onStudentChange}
                  placeholder="mother@example.com"
                  error={errors.motherEmail}
                />

                <Input
                  label="Mother's Occupation"
                  type="text"
                  name="motherOccupation"
                  value={studentForm.motherOccupation}
                  onChange={onStudentChange}
                  placeholder="Enter occupation"
                  error={errors.motherOccupation}
                />
              </div>
            </div>

            {/* Guardian Details (Optional) */}
            {/* Parent/Guardian Information */}
            <div className="bg-purple-50/30 p-8 rounded-2xl border border-purple-200">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                <h3 className="text-sm font-bold text-purple-800 uppercase tracking-wider">
                  Guardian Account Details
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="guardianName"
                      value={studentForm.guardianName}
                      onChange={onStudentChange}
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.guardianName ? "border-red-400 bg-red-50" : "border-gray-200"} focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition`}
                      placeholder="Parent's full name"
                    />
                    {errors.guardianName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.guardianName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="guardianEmail"
                      value={studentForm.guardianEmail}
                      onChange={onStudentChange}
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.guardianEmail ? "border-red-400 bg-red-50" : "border-gray-200"} focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition`}
                      placeholder="parent@example.com"
                    />
                    {errors.guardianEmail && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.guardianEmail}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="guardianPhone"
                      value={studentForm.guardianPhone}
                      onChange={onStudentChange}
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.guardianPhone ? "border-red-400 bg-red-50" : "border-gray-200"} focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition`}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                    />
                    {errors.guardianPhone && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.guardianPhone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Relationship *
                    </label>
                    <select
                      name="guardianRelation"
                      value={studentForm.guardianRelation}
                      onChange={onStudentChange}
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.guardianRelation ? "border-red-400 bg-red-50" : "border-gray-200"} focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition appearance-none bg-white`}
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 0.75rem center",
                        backgroundSize: "1.25rem",
                      }}
                    >
                      <option value="">Select relationship</option>
                      {RELATION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {errors.guardianRelation && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.guardianRelation}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Occupation
                    </label>
                    <input
                      type="text"
                      name="guardianOccupation"
                      value={studentForm.guardianOccupation}
                      onChange={onStudentChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition"
                      placeholder="e.g., Teacher, Business, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Annual Income (₹)
                    </label>
                    <input
                      type="number"
                      name="guardianIncome"
                      value={studentForm.guardianIncome}
                      onChange={onStudentChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition"
                      placeholder="e.g., 500000"
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-4 italic">
                * Required fields
              </p>
            </div>

            {/* ✅ UPDATED Academic Information - NO SECTION */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                Academic Information
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Select
                    label="Class"
                    name="className"
                    value={studentForm.className}
                    onChange={onStudentChange}
                    options={CLASS_OPTIONS}
                    error={errors.className}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    💡 Section will be assigned later in Class Management
                  </p>
                </div>

                {/* Academic Year Dropdown */}
                <div>
                  <Select
                    label="Academic Year"
                    name="academicYear"
                    value={studentForm.academicYear}
                    onChange={onStudentChange}
                    options={session.map((s) => ({
                      value: `${s.startYear}-${s.endYear}`,
                      label: `${s.startYear}-${s.endYear}`,
                    }))}
                    error={errors.academicYear}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Current: {getCurrentAcademicYear()}
                  </p>
                </div>

                {/* Previous School */}
                <div className="md:col-span-2">
                  <Input
                    label="Previous School (Optional)"
                    type="text"
                    name="previousSchool"
                    value={studentForm.previousSchool}
                    onChange={onStudentChange}
                    placeholder="Name of previous school (if any)"
                    error={errors.previousSchool}
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                Medical Information (Optional)
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Medical History
                  </label>
                  <textarea
                    name="medicalHistory"
                    value={studentForm.medicalHistory}
                    onChange={onStudentChange}
                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Any known medical conditions"
                    rows="2"
                  />
                </div>

                <Input
                  label="Allergies"
                  type="text"
                  name="allergies"
                  value={studentForm.allergies}
                  onChange={onStudentChange}
                  placeholder="Comma-separated (e.g., Peanuts, Dust)"
                  error={errors.allergies}
                />

                <Input
                  label="Emergency Contact Name"
                  type="text"
                  name="emergencyContactName"
                  value={studentForm.emergencyContactName}
                  onChange={onStudentChange}
                  placeholder="Emergency contact person"
                  error={errors.emergencyContactName}
                />

                <Input
                  label="Emergency Contact Phone"
                  type="tel"
                  name="emergencyContactPhone"
                  value={studentForm.emergencyContactPhone}
                  onChange={onStudentChange}
                  pattern="[0-9]{10}"
                  maxLength="10"
                  placeholder="10-digit phone"
                  error={errors.emergencyContactPhone}
                />

                <Input
                  label="Emergency Contact Relation"
                  type="text"
                  name="emergencyContactRelation"
                  value={studentForm.emergencyContactRelation}
                  onChange={onStudentChange}
                  placeholder="Relation with student"
                  error={errors.emergencyContactRelation}
                />
              </div>
            </div>

            {/* Transport & Hostel */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                Transport & Hostel (Optional)
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Transport */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="transportRequired"
                      checked={studentForm.transportRequired}
                      onChange={onStudentChange}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label className="ml-2 block text-sm font-medium text-gray-700">
                      Transport Required
                    </label>
                  </div>

                  {studentForm.transportRequired && (
                    <>
                      <Input
                        label="Bus Route"
                        type="text"
                        name="busRoute"
                        value={studentForm.busRoute}
                        onChange={onStudentChange}
                        placeholder="Route number/name"
                        error={errors.busRoute}
                      />

                      <Input
                        label="Pickup Point"
                        type="text"
                        name="pickupPoint"
                        value={studentForm.pickupPoint}
                        onChange={onStudentChange}
                        placeholder="Pickup location"
                        error={errors.pickupPoint}
                      />
                    </>
                  )}
                </div>

                {/* Hostel */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="hostelResident"
                      checked={studentForm.hostelResident}
                      onChange={onStudentChange}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label className="ml-2 block text-sm font-medium text-gray-700">
                      Hostel Resident
                    </label>
                  </div>

                  {studentForm.hostelResident && (
                    <>
                      <Input
                        label="Hostel Block"
                        type="text"
                        name="hostelBlock"
                        value={studentForm.hostelBlock}
                        onChange={onStudentChange}
                        placeholder="Block A, Block B, etc."
                        error={errors.hostelBlock}
                      />

                      <Input
                        label="Room Number"
                        type="text"
                        name="roomNumber"
                        value={studentForm.roomNumber}
                        onChange={onStudentChange}
                        placeholder="Room number"
                        error={errors.roomNumber}
                      />
                    </>
                  )}
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
                    Student Register
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
