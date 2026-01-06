
// pages/admin/Admin_Features/UserRegistrations/StudentParentRegisterForm.jsx
import { useState} from "react";
import { toast } from "react-toastify";
import { FaUser, FaUserTie, FaCheck, FaSpinner, FaCopy } from "react-icons/fa";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import Swal from "sweetalert2";


import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function StudentParentRegisterForm() {
  const [activeTab, setActiveTab] = useState("student");
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

    // Guardian Details (optional)
    guardianName: "",
    guardianPhone: "",
    guardianRelation: "",

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

  const [parentForm, setParentForm] = useState({
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    parentRelation: "",
    parentOccupation: "",
    parentQualification: "",
    parentIncome: "",
  });

  const onStudentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStudentForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onParentChange = (e) => {
    const { name, value } = e.target;
    setParentForm((prev) => ({ ...prev, [name]: value }));
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

    // Parent validation
    if (!parentForm.parentName.trim()) {
      toast.error("Parent name is required");
      return false;
    }
    if (!parentForm.parentEmail.trim()) {
      toast.error("Parent email is required");
      return false;
    }
    if (!parentForm.parentPhone.trim()) {
      toast.error("Parent phone is required");
      return false;
    }
    if (!parentForm.parentRelation) {
      toast.error("Parent relationship is required");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (parentForm.parentEmail && !emailRegex.test(parentForm.parentEmail)) {
      toast.error("Please enter a valid parent email address");
      return false;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (
      parentForm.parentPhone &&
      !phoneRegex.test(parentForm.parentPhone.replace(/\D/g, ""))
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
      ...parentForm,
      parentPhone: parentForm.parentPhone.replace(/\D/g, ""),
      parentIncome: parentForm.parentIncome
        ? Number(parentForm.parentIncome)
        : undefined,
    };

    const resp = await api.post(
      API_ENDPOINTS.ADMIN.STUDENT.CREATE_WITH_PARENT,
      payload
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
      </div>

      <div style="margin-bottom:16px">
        <b style="color:#111827">Parent ID:</b>
        <span style="margin-left:6px; color:#2563eb">${parentID}</span>
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
          <code style="
            display:block;
            background:#eef2ff;
            padding:6px;
            border-radius:6px;
            color:#4338ca;
            font-size:13px
          ">
            ${studentPassword || "Sent via email"}
          </code>
        </div>

        <div>
          <small style="color:#6b7280">Parent Password</small><br/>
          <code style="
            display:block;
            background:#eef2ff;
            padding:6px;
            border-radius:6px;
            color:#4338ca;
            font-size:13px
          ">
            ${parentPassword || "Sent via email"}
          </code>
        </div>
      </div>

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
});

    
    setStudentForm((p) => ({ ...p, studentName: "", className: "" }));
    setParentForm({
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      parentRelation: "",
    });
    setActiveTab("student");
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
          <h2 className="text-3xl font-bold text-gray-900">
            Register Student & Parent
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Complete registration for both student and parent in a single form
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("student")}
            className={`flex items-center gap-2 rounded-t-lg px-6 py-3 text-sm font-medium transition-all ${
              activeTab === "student"
                ? "border-b-2 border-indigo-600 bg-white text-indigo-700 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <FaUser className="h-4 w-4" />
            Student Details
          </button>
          <button
            onClick={() => setActiveTab("parent")}
            className={`flex items-center gap-2 rounded-t-lg px-6 py-3 text-sm font-medium transition-all ${
              activeTab === "parent"
                ? "border-b-2 border-indigo-600 bg-white text-indigo-700 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <FaUserTie className="h-4 w-4" />
            Parent Details
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6">
          {/* STUDENT FORM */}
          {activeTab === "student" && (
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={studentForm.dateOfBirth}
                      onChange={onStudentChange}
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
                    <input
                      type="text"
                      name="state"
                      value={studentForm.state}
                      onChange={onStudentChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                      placeholder="Enter state"
                      required
                    />
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
                  Guardian Details (Optional)
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guardian's Name
                    </label>
                    <input
                      type="text"
                      name="guardianName"
                      value={studentForm.guardianName}
                      onChange={onStudentChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                      placeholder="If different from parents"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guardian's Phone
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
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relation with Student
                    </label>
                    <input
                      type="text"
                      name="guardianRelation"
                      value={studentForm.guardianRelation}
                      onChange={onStudentChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                      placeholder="Uncle, Aunt, etc."
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

              {/* Navigation Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab("parent")}
                  className="rounded-lg bg-indigo-600 px-8 py-3 font-medium text-white transition hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200"
                >
                  Next: Parent Details →
                </button>
              </div>
            </div>
          )}

          {/* PARENT FORM */}
          {activeTab === "parent" && (
            <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
              <h3 className="mb-6 text-xl font-semibold text-gray-900">
                Parent/Guardian Information
              </h3>
              <div className="mb-6 rounded-lg bg-blue-50 p-4 border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>💡 Note:</strong> If a parent with the same name and
                  email already exists, the student will be added as an
                  additional child to that parent account.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="parentName"
                    value={parentForm.parentName}
                    onChange={onParentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="Enter parent's full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="parentEmail"
                    value={parentForm.parentEmail}
                    onChange={onParentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="parent@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="parentPhone"
                    pattern="[0-9]{10}"
                    maxLength="10"
                    value={parentForm.parentPhone}
                    onChange={onParentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="10-digit phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship with Student{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="parentRelation"
                    value={parentForm.parentRelation}
                    onChange={onParentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    required
                  >
                    <option value="">Select Relationship</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="parentOccupation"
                    value={parentForm.parentOccupation}
                    onChange={onParentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="Enter occupation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualification
                  </label>
                  <input
                    type="text"
                    name="parentQualification"
                    value={parentForm.parentQualification}
                    onChange={onParentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="Educational qualification"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Income (Optional)
                  </label>
                  <input
                    type="number"
                    name="parentIncome"
                    value={parentForm.parentIncome}
                    onChange={onParentChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    placeholder="Annual income in rupees"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab("student")}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50 focus:ring-4 focus:ring-gray-200"
                >
                  ← Back to Student Details
                </button>

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
          )}
        </form>

       
      </div>
    </div>
  );
}