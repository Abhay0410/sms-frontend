// pages/admin/Admin_Features/UserRegistrations/StudentParentRegisterForm.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import { FaUser, FaUserTie, FaCheck, FaSpinner, FaCopy } from "react-icons/fa";
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

export default function StudentParentRegisterForm() {
  const [loading, setLoading] = useState(false);

  const [studentForm, setStudentForm] = useState({
    studentName: "",
    studentEmail: "",
    dateOfBirth: "",
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
  };

  const getCurrentAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return month >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };

  const validateForm = () => {
    // Student validation - ✅ UPDATED: No section required
    if (!studentForm.studentName.trim()) {
      toast.error("Student name is required");
      return false;
    }
    if (!studentForm.fatherName.trim()) {
      toast.error("Father's name is required");
      return false;
    }
    if (!studentForm.className) {
      toast.error("Class is required");
      return false;
    }
    if (!studentForm.academicYear) {
      toast.error("Academic year is required");
      return false;
    }

    // Guardian/Parent validation
    if (!studentForm.guardianName.trim()) {
      toast.error("Guardian Name is required for Parent Account");
      return false;
    }
    if (!studentForm.guardianEmail.trim()) {
      toast.error("Guardian Email is required for Parent Account");
      return false;
    }
    if (!studentForm.guardianPhone.trim()) {
      toast.error("Guardian Phone is required");
      return false;
    }
    if (!studentForm.guardianRelation) {
      toast.error("Guardian Relation is required");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      studentForm.guardianEmail &&
      !emailRegex.test(studentForm.guardianEmail)
    ) {
      toast.error("Please enter a valid guardian email address");
      return false;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (
      studentForm.guardianPhone &&
      !phoneRegex.test(studentForm.guardianPhone.replace(/\D/g, ""))
    ) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }

    return true;
  };

  // In your StudentParentRegisterForm.jsx - update the onSubmit function
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        ...studentForm,
        // Map guardian fields to parent fields
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

      console.log("RESP DATA 👉", resp.data);

      // ✅ CORRECT EXTRACTION (FIX)
      const studentID = resp?.data?.student?.studentID;
      const studentPassword = resp?.data?.student?.credentials?.password;

      const parentID = resp?.data?.parent?.credentials?.parentID;
      const parentPassword = resp?.data?.parent?.credentials?.password;

      //     Swal.fire({
      //   icon: "success",
      //   title: "Registration Successful",
      //   html: `
      //     <b>Student ID:</b> ${studentID}<br/>
      //     <b>Parent ID:</b> ${parentID}<br/><br/>
      //     <b> Passwords:</b><br/>
      //     <code style="font-size:12px;color:#4f46e5">${studentPassword}</code><br/>
      //     <code style="font-size:12px;color:#4f46e5">${parentPassword}</code><br/><br/>
      //     <p style="font-size:12px;color:#b91c1c">
      //       Credentials have been sent to the registered email / phone.
      //     </p>
      //   `,
      //   confirmButtonText: "Done",
      // });

      // reset
      Swal.fire({
        icon: "success",
        title: "Registration Successful 🎉",
        html: `
    <div style="text-align:left; padding:10px 5px">

      <div style="margin-bottom:12px">
        <b style="color:#111827">Student ID:</b>
        <span style="margin-left:6px; color:#2563eb">${studentID}</span>
        <button id="copyStudentId" style="margin-left:10px; padding:2px 8px; font-size:12px; cursor:pointer; border:1px solid #ccc; border-radius:4px;">Copy</button>
      </div>

      <div style="margin-bottom:16px">
        <b style="color:#111827">Parent ID:</b>
        <span style="margin-left:6px; color:#2563eb">${parentID}</span>
        <button id="copyParentId" style="margin-left:10px; padding:2px 8px; font-size:12px; cursor:pointer; border:1px solid #ccc; border-radius:4px;">Copy</button>
      </div>

      <hr style="margin:12px 0"/>

      <b style="color:#111827">Login Credentials</b>

      <div style="
        background:#f9fafb;
        border:1px solid #e5e7eb;
        border-radius:8px;
        padding:10px;
        margin-top:8px;
      ">
        <div style="margin-bottom:8px">
          <small style="color:#6b7280">Student Password</small><br/>
          <div style="display:flex; align-items:center; justify-content:space-between; background:#eef2ff; padding:6px; border-radius:6px;">
            <code style="color:#4338ca; font-size:13px">
              ${studentPassword || "Sent via email"}
            </code>
            <button id="copyStudentPass" style="padding:2px 8px; font-size:11px; cursor:pointer; border:1px solid #ccc; border-radius:4px;">Copy</button>
          </div>
        </div>

        <div>
          <small style="color:#6b7280">Parent Password</small><br/>
          <div style="display:flex; align-items:center; justify-content:space-between; background:#eef2ff; padding:6px; border-radius:6px;">
            <code style="color:#4338ca; font-size:13px">
              ${parentPassword || "Sent via email"}
            </code>
            <button id="copyParentPass" style="padding:2px 8px; font-size:11px; cursor:pointer; border:1px solid #ccc; border-radius:4px;">Copy</button>
          </div>
        </div>
      </div>

      <button id="copyAllCredentials" style="
        margin-top: 12px;
        width: 100%;
        padding: 8px;
        background-color: #eef2ff;
        color: #4338ca;
        border: 1px solid #c7d2fe;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
      ">
        Copy All Credentials
      </button>

      <p style="
        font-size:12px;
        color:#b91c1c;
        margin-top:10px
      ">
       ⚠️ Please save these credentials. They will not be shown again.
      </p>

    </div>
  `,
        confirmButtonText: "Done",
        confirmButtonColor: "#2563eb",
        didOpen: () => {
          const copyToClipboard = (text, label) => {
            navigator.clipboard.writeText(text).then(() => {
              Swal.showValidationMessage(`${label} copied`);
            });
          };

          const allCredentials = `Student ID: ${studentID}
Parent ID: ${parentID}

Student Password: ${studentPassword || "Sent via email"}
Parent Password: ${parentPassword || "Sent via email"}`;

          document
            .getElementById("copyAllCredentials")
            ?.addEventListener("click", () => {
              navigator.clipboard.writeText(allCredentials).then(() => {
                Swal.showValidationMessage("Credentials copied to clipboard!");
              });
            });

          document
            .getElementById("copyStudentId")
            ?.addEventListener("click", () =>
              copyToClipboard(studentID, "Student ID"),
            );
          document
            .getElementById("copyParentId")
            ?.addEventListener("click", () =>
              copyToClipboard(parentID, "Parent ID"),
            );
          document
            .getElementById("copyStudentPass")
            ?.addEventListener("click", () =>
              copyToClipboard(studentPassword, "Student Password"),
            );
          document
            .getElementById("copyParentPass")
            ?.addEventListener("click", () =>
              copyToClipboard(parentPassword, "Parent Password"),
            );
        },
      });

      setStudentForm((p) => ({
        ...p,
        studentName: "",
        className: "",
        guardianName: "",
        guardianEmail: "",
        guardianPhone: "",
        guardianRelation: "",
        guardianOccupation: "",
        guardianQualification: "",
        guardianIncome: "",
      }));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text:
          err?.response?.data?.message ||
          "Failed to register student and parent",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mt-6">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Register Student & Parent
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Complete registration for both student and parent in a single form
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-6">
          {/* STUDENT FORM */}
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
              <h3 className="mb-6 text-xl font-semibold text-gray-900">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={studentForm.studentName}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="Enter student's full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="studentEmail"
                    value={studentForm.studentEmail}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="student@example.com"
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={(() => {
                      if (!studentForm.dateOfBirth) return null;
                      const [day, month, year] =
                        studentForm.dateOfBirth.split("/");
                      if (!day || !month || !year) return null;
                      const date = new Date(year, month - 1, day);
                      return isNaN(date.getTime()) ? null : date;
                    })()}
                    // onChange={(date) => {
                    //   const formatted = date ? `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}` : "";
                    //   setStudentForm(prev => ({...prev, dateOfBirth: formatted}));
                    // }}

                    onChange={(date) => {
                      setStudentForm((prev) => ({
                        ...prev,
                        dateOfBirth: date, // ✅ store Date object
                      }));
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    required
                  />
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>

                  <DatePicker
                    selected={studentForm.dateOfBirth} // ✅ direct Date
                    onChange={(date) =>
                      setStudentForm((prev) => ({
                        ...prev,
                        dateOfBirth: date, // ✅ Date object
                      }))
                    }
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    maxDate={new Date()} // ✅ future DOB block
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={studentForm.gender}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={studentForm.bloodGroup}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Religion
                  </label>
                  <select
                    name="religion"
                    value={studentForm.religion}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                  >
                    <option value="">Select Religion</option>
                    <option value="Hinduism">Hinduism</option>
                    <option value="Islam">Islam</option>
                    <option value="Christianity">Christianity</option>
                    <option value="Sikhism">Sikhism</option>
                    <option value="Buddhism">Buddhism</option>
                    <option value="Jainism">Jainism</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Caste/Category
                  </label>
                  <select
                    name="caste"
                    value={studentForm.caste}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                  >
                    <option value="">Select Category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={studentForm.nationality}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="Indian"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aadhar Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={studentForm.aadharNumber}
                    onChange={onStudentChange}
                    pattern="[0-9]{12}"
                    maxLength="12"
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="12-digit Aadhar"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
              <h3 className="mb-6 text-xl font-semibold text-gray-900">
                Address Details
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={studentForm.street}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="Enter street address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={studentForm.city}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="Enter city"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="state"
                    value={studentForm.state}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    required
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={studentForm.pincode}
                    onChange={onStudentChange}
                    pattern="[0-9]{6}"
                    maxLength="6"
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="6-digit pincode"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={studentForm.country}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="India"
                  />
                </div>
              </div>
            </div>

            {/* Father's Details */}
            <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
              <h3 className="mb-6 text-xl font-semibold text-gray-900">
                Father's Details
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Father's Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={studentForm.fatherName}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="Enter father's name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Father's Phone
                  </label>
                  <input
                    type="tel"
                    name="fatherPhone"
                    value={studentForm.fatherPhone}
                    onChange={onStudentChange}
                    pattern="[0-9]{10}"
                    maxLength="10"
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="10-digit phone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Father's Email
                  </label>
                  <input
                    type="email"
                    name="fatherEmail"
                    value={studentForm.fatherEmail}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="father@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Father's Occupation
                  </label>
                  <input
                    type="text"
                    name="fatherOccupation"
                    value={studentForm.fatherOccupation}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="Enter occupation"
                  />
                </div>
              </div>
            </div>

            {/* Mother's Details */}
            <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
              <h3 className="mb-6 text-xl font-semibold text-gray-900">
                Mother's Details (Optional)
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    value={studentForm.motherName}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="Enter mother's name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mother's Phone
                  </label>
                  <input
                    type="tel"
                    name="motherPhone"
                    value={studentForm.motherPhone}
                    onChange={onStudentChange}
                    pattern="[0-9]{10}"
                    maxLength="10"
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="10-digit phone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mother's Email
                  </label>
                  <input
                    type="email"
                    name="motherEmail"
                    value={studentForm.motherEmail}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="mother@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mother's Occupation
                  </label>
                  <input
                    type="text"
                    name="motherOccupation"
                    value={studentForm.motherOccupation}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="Enter occupation"
                  />
                </div>
              </div>
            </div>

            {/* Guardian Details (Optional) */}
            <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
              <h3 className="mb-6 text-xl font-semibold text-gray-900">
                Guardian Details (Parent Account)
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guardian's Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="guardianName"
                    value={studentForm.guardianName}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="Name of the guardian"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guardian's Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="guardianEmail"
                    value={studentForm.guardianEmail}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="guardian@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guardian's Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="guardianPhone"
                    value={studentForm.guardianPhone}
                    onChange={onStudentChange}
                    pattern="[0-9]{10}"
                    maxLength="10"
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="10-digit phone"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relation with Student{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="guardianRelation"
                    value={studentForm.guardianRelation}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    required
                  >
                    <option value="">Select Relation</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Aunt">Aunt</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="guardianOccupation"
                    value={studentForm.guardianOccupation}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="Guardian's occupation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Income
                  </label>
                  <input
                    type="number"
                    name="guardianIncome"
                    value={studentForm.guardianIncome}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="Annual income"
                  />
                </div>
              </div>
            </div>

            {/* ✅ UPDATED Academic Information - NO SECTION */}
            <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
              <h3 className="mb-6 text-xl font-semibold text-gray-900">
                Academic Information
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Class Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="className"
                    value={studentForm.className}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    required
                  >
                    <option value="">Select Class</option>
                    <option value="Nursery">Nursery</option>
                    <option value="LKG">LKG</option>
                    <option value="UKG">UKG</option>
                    <option value="1">Class 1</option>
                    <option value="2">Class 2</option>
                    <option value="3">Class 3</option>
                    <option value="4">Class 4</option>
                    <option value="5">Class 5</option>
                    <option value="6">Class 6</option>
                    <option value="7">Class 7</option>
                    <option value="8">Class 8</option>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    💡 Section will be assigned later in Class Management
                  </p>
                </div>

                {/* Academic Year Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="academicYear"
                    value={studentForm.academicYear}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="2023-2024">2023-2024</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Current: {getCurrentAcademicYear()}
                  </p>
                </div>

                {/* Previous School */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previous School (Optional)
                  </label>
                  <input
                    type="text"
                    name="previousSchool"
                    value={studentForm.previousSchool}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="Name of previous school (if any)"
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
              <h3 className="mb-6 text-xl font-semibold text-gray-900">
                Medical Information (Optional)
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical History
                  </label>
                  <textarea
                    name="medicalHistory"
                    value={studentForm.medicalHistory}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="Any known medical conditions"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergies
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    value={studentForm.allergies}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="Comma-separated (e.g., Peanuts, Dust)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={studentForm.emergencyContactName}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="Emergency contact person"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={studentForm.emergencyContactPhone}
                    onChange={onStudentChange}
                    pattern="[0-9]{10}"
                    maxLength="10"
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="10-digit phone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Relation
                  </label>
                  <input
                    type="text"
                    name="emergencyContactRelation"
                    value={studentForm.emergencyContactRelation}
                    onChange={onStudentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="Relation with student"
                  />
                </div>
              </div>
            </div>

            {/* Transport & Hostel */}
            <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
              <h3 className="mb-6 text-xl font-semibold text-gray-900">
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bus Route
                        </label>
                        <input
                          type="text"
                          name="busRoute"
                          value={studentForm.busRoute}
                          onChange={onStudentChange}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                          placeholder="Route number/name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pickup Point
                        </label>
                        <input
                          type="text"
                          name="pickupPoint"
                          value={studentForm.pickupPoint}
                          onChange={onStudentChange}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                          placeholder="Pickup location"
                        />
                      </div>
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hostel Block
                        </label>
                        <input
                          type="text"
                          name="hostelBlock"
                          value={studentForm.hostelBlock}
                          onChange={onStudentChange}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                          placeholder="Block A, Block B, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Room Number
                        </label>
                        <input
                          type="text"
                          name="roomNumber"
                          value={studentForm.roomNumber}
                          onChange={onStudentChange}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                          placeholder="Room number"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 rounded-lg bg-green-600 px-8 py-3 font-medium text-white transition hover:bg-green-700 focus:ring-4 focus:ring-green-200 ${
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
                    Complete Registration
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
