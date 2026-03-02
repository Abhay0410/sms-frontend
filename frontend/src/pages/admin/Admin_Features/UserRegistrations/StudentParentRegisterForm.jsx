// pages/admin/Admin_Features/UserRegistrations/StudentParentRegisterForm.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import { FaUserGraduate, FaUserTie, FaCheck, FaSpinner, FaCopy } from "react-icons/fa";
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

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      {...props}
      className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
    />
  </div>
);

export default function StudentParentRegisterForm() {
  const [loading, setLoading] = useState(false);

  const [studentForm, setStudentForm] = useState({
    studentName: "",
    studentEmail: "",
    dateOfBirth:null,
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
        dateOfBirth: studentForm.dateOfBirth
    ? studentForm.dateOfBirth.toISOString()
    : undefined,
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
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
            <FaUserGraduate className="text-indigo-600" /> Student & Parent Enrollment
          </h1>
          <p className="text-slate-500 font-medium mt-2">Complete registration for both student and parent in a single form</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-1 bg-indigo-600"></div>
          <form onSubmit={onSubmit} className="p-10 space-y-10">
            
            {/* Basic Information */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Basic Information</h3>
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
                  <label className="text-sm font-medium text-gray-700">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={studentForm.bloodGroup}
                    onChange={onStudentChange}
                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  <label className="text-sm font-medium text-gray-700">
                    Religion
                  </label>
                  <select
                    name="religion"
                    value={studentForm.religion}
                    onChange={onStudentChange}
                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  <label className="text-sm font-medium text-gray-700">
                    Caste/Category
                  </label>
                  <select
                    name="caste"
                    value={studentForm.caste}
                    onChange={onStudentChange}
                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <Input
                    label="Nationality"
                    type="text"
                    name="nationality"
                    value={studentForm.nationality}
                    onChange={onStudentChange}
                    placeholder="Indian"
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
                />
              </div>
            </div>

            {/* Address */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Residential Information</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Input
                    label="Street Address *"
                    type="text"
                    name="street"
                    value={studentForm.street}
                    onChange={onStudentChange}
                    placeholder="Enter street address"
                    required
                  />
                </div>

                <Input
                    label="City *"
                    type="text"
                    name="city"
                    value={studentForm.city}
                    onChange={onStudentChange}
                    placeholder="Enter city"
                    required
                />

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="state"
                    value={studentForm.state}
                    onChange={onStudentChange}
                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

                <Input
                    label="Pincode *"
                    type="text"
                    name="pincode"
                    value={studentForm.pincode}
                    onChange={onStudentChange}
                    pattern="[0-9]{6}"
                    maxLength="6"
                    placeholder="6-digit pincode"
                    required
                />

                <Input
                    label="Country"
                    type="text"
                    name="country"
                    value={studentForm.country}
                    onChange={onStudentChange}
                    placeholder="India"
                />
              </div>
            </div>

            {/* Father's Details */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Father's Details</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input
                    label="Father's Name *"
                    type="text"
                    name="fatherName"
                    value={studentForm.fatherName}
                    onChange={onStudentChange}
                    placeholder="Enter father's name"
                    required
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
                />

                <Input
                    label="Father's Email"
                    type="email"
                    name="fatherEmail"
                    value={studentForm.fatherEmail}
                    onChange={onStudentChange}
                    placeholder="father@example.com"
                />

                <Input
                    label="Father's Occupation"
                    type="text"
                    name="fatherOccupation"
                    value={studentForm.fatherOccupation}
                    onChange={onStudentChange}
                    placeholder="Enter occupation"
                />
              </div>
            </div>

            {/* Mother's Details */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Mother's Details (Optional)</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input
                    label="Mother's Name"
                    type="text"
                    name="motherName"
                    value={studentForm.motherName}
                    onChange={onStudentChange}
                    placeholder="Enter mother's name"
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
                />

                <Input
                    label="Mother's Email"
                    type="email"
                    name="motherEmail"
                    value={studentForm.motherEmail}
                    onChange={onStudentChange}
                    placeholder="mother@example.com"
                />

                <Input
                    label="Mother's Occupation"
                    type="text"
                    name="motherOccupation"
                    value={studentForm.motherOccupation}
                    onChange={onStudentChange}
                    placeholder="Enter occupation"
                />
              </div>
            </div>

            {/* Guardian Details (Optional) */}
            <div className="bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Guardian Details (Parent Account)</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input
                    label="Guardian's Name *"
                    type="text"
                    name="guardianName"
                    value={studentForm.guardianName}
                    onChange={onStudentChange}
                    placeholder="Name of the guardian"
                    required
                />

                <Input
                    label="Guardian's Email *"
                    type="email"
                    name="guardianEmail"
                    value={studentForm.guardianEmail}
                    onChange={onStudentChange}
                    placeholder="guardian@example.com"
                    required
                />

                <Input
                    label="Guardian's Phone *"
                    type="tel"
                    name="guardianPhone"
                    value={studentForm.guardianPhone}
                    onChange={onStudentChange}
                    pattern="[0-9]{10}"
                    maxLength="10"
                    placeholder="10-digit phone"
                    required
                />

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Relation with Student{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="guardianRelation"
                    value={studentForm.guardianRelation}
                    onChange={onStudentChange}
                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

                <Input
                    label="Occupation"
                    type="text"
                    name="guardianOccupation"
                    value={studentForm.guardianOccupation}
                    onChange={onStudentChange}
                    placeholder="Guardian's occupation"
                />

                <Input
                    label="Annual Income"
                    type="number"
                    name="guardianIncome"
                    value={studentForm.guardianIncome}
                    onChange={onStudentChange}
                    placeholder="Annual income"
                />
              </div>
            </div>

            {/* ✅ UPDATED Academic Information - NO SECTION */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Academic Information</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Class Dropdown */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="className"
                    value={studentForm.className}
                    onChange={onStudentChange}
                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  <label className="text-sm font-medium text-gray-700">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="academicYear"
                    value={studentForm.academicYear}
                    onChange={onStudentChange}
                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  <Input
                    label="Previous School (Optional)"
                    type="text"
                    name="previousSchool"
                    value={studentForm.previousSchool}
                    onChange={onStudentChange}
                    placeholder="Name of previous school (if any)"
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Medical Information (Optional)</h3>
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
                />

                <Input
                    label="Emergency Contact Name"
                    type="text"
                    name="emergencyContactName"
                    value={studentForm.emergencyContactName}
                    onChange={onStudentChange}
                    placeholder="Emergency contact person"
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
                />

                <Input
                    label="Emergency Contact Relation"
                    type="text"
                    name="emergencyContactRelation"
                    value={studentForm.emergencyContactRelation}
                    onChange={onStudentChange}
                    placeholder="Relation with student"
                />
              </div>
            </div>

            {/* Transport & Hostel */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Transport & Hostel (Optional)</h3>
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
                      />

                      <Input
                          label="Pickup Point"
                          type="text"
                          name="pickupPoint"
                          value={studentForm.pickupPoint}
                          onChange={onStudentChange}
                          placeholder="Pickup location"
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
                      />

                      <Input
                          label="Room Number"
                          type="text"
                          name="roomNumber"
                          value={studentForm.roomNumber}
                          onChange={onStudentChange}
                          placeholder="Room number"
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
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <>
                    <FaCheck className="h-4 w-4" />
                    Initialize Accounts
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
