
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCopy } from "react-icons/fa";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import Swal from "sweetalert2";


import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      {...props}
      className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
    />
  </div>
);

const AdminRegisterForm = () => {
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(false);



  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    designation: "",
    department: "",
    joiningDate: "",
    isSuperAdmin: true,
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
  });

  // Load selected school
  useEffect(() => {
    const stored = localStorage.getItem("selectedSchool");
    if (!stored) {
      toast.error("Please select a school first");
      navigate("/");
      return;
    }
    setSchool(JSON.parse(stored));
  }, [navigate]);

 
  

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      address: { ...form.address, [name]: value },
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      schoolId: school._id,
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender || null,
      designation: form.designation.trim() || "",
      department: form.department.trim() || "",
      joiningDate: form.joiningDate || null,
      address: {
        street: form.address.street.trim() || "",
        city: form.address.city.trim() || "",
        state: form.address.state.trim() || "",
        pincode: form.address.pincode.trim() || "",
        country: "India",
      },
      permissions: [],
      isSuperAdmin: form.isSuperAdmin,
      role: "admin",
      profilePicture: "",
      isActive: true,
    };

    const res = await api.post(API_ENDPOINTS.ADMIN.AUTH.REGISTER, payload);

    if (res.success === true) {
      const { adminID, password } = res.data;

     Swal.fire({
  icon: "success",
  title: "Admin Registered",
  width: 420,
  html: `
    <div style="text-align:left; font-size:13px; line-height:1.4">

      <div style="margin-bottom:12px">
        <div style="font-weight:600; margin-bottom:4px">Admin ID</div>
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px">
          <code style="font-size:12px; padding:4px 6px">${adminID}</code>
          <button id="copyId"
            style="font-size:11px; padding:4px 8px; cursor:pointer">
            Copy
          </button>
        </div>
      </div>

      <div>
        <div style="font-weight:600; margin-bottom:4px">Temporary Password</div>
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px">
          <code style="font-size:12px; padding:4px 6px">${password}</code>
          <button id="copyPass"
            style="font-size:11px; padding:4px 8px; cursor:pointer">
            Copy
          </button>
        </div>
      </div>

      <div style="margin-top:10px; font-size:11px; color:#b91c1c">
        ⚠ Save these credentials. They will not be shown again.
      </div>

    </div>
  `,
  confirmButtonText: "Done",
  confirmButtonColor: "#4f46e5",
  didOpen: () => {
    document.getElementById("copyId").onclick = () => {
      navigator.clipboard.writeText(adminID);
      Swal.showValidationMessage("Admin ID copied");
    };

    document.getElementById("copyPass").onclick = () => {
      navigator.clipboard.writeText(password);
      Swal.showValidationMessage("Password copied");
    };
  },
});


      // Reset form
      setForm({
        name: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        designation: "",
        department: "",
        joiningDate: "",
        isSuperAdmin: true,
        address: {
          street: "",
          city: "",
          state: "",
          pincode: "",
          country: "",
        },
      });
    } else {
      toast.error(res.message || "Admin registration failed");
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Registration Failed",
      text:
        err.response?.data?.message ||
        err.message ||
        "Admin registration failed",
    });
  } finally {
    setLoading(false);
  }
};

   
  if (!school) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6">
      {/* ===== HEADER ===== */}
      <div className="max-w-6xl mx-auto mb-6">
      

        <div className="flex flex-col md:flex-row md:items-center md:gap-3 mt-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Register Admin
          </h1>
          <p className="text-gray-500">Add a new admin to the system</p>
        </div>
      </div>

      {/* ===== MAIN CARD ===== */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Admin Information
          </h2>

          {/* ===== SCHOOL INFO ===== */}
          <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              School
            </p>
            <p className="text-lg font-semibold text-indigo-700">
              {school.schoolName}
            </p>
            <p className="text-sm text-gray-600">
              {school.address?.city}, {school.address?.state}
            </p>
          </div>

          {/* ===== FORM ===== */}
          <form
  onSubmit={handleSubmit}
  className="grid grid-cols-1 md:grid-cols-2 gap-6"
>
  {/* BASIC INFO */}
  <Input
    label="Full Name *"
    name="name"
    value={form.name}
    onChange={handleChange}
    required
  />

  <Input
    label="Email *"
    name="email"
    type="email"
    value={form.email}
    onChange={handleChange}
    required
  />

  <Input
    label="Phone *"
    name="phone"
    value={form.phone}
    onChange={handleChange}
    required
  />

  {/* DOB */}
  <div>
    <label className="block text-sm font-medium mb-1">Date of Birth</label>
    <DatePicker
      selected={
        form.dateOfBirth
          ? new Date(form.dateOfBirth.split("/").reverse().join("-"))
          : null
      }
      onChange={(date) => {
        const formatted = date
          ? `${String(date.getDate()).padStart(2, "0")}/${String(
              date.getMonth() + 1
            ).padStart(2, "0")}/${date.getFullYear()}`
          : "";
        setForm({ ...form, dateOfBirth: formatted });
      }}
      dateFormat="dd/MM/yyyy"
      placeholderText="DD/MM/YYYY"
      className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500"
    />
  </div>

  {/* GENDER */}
  <div>
    <label className="text-sm font-medium">Gender</label>
    <select
      name="gender"
      value={form.gender}
      onChange={handleChange}
      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">Select</option>
      <option>Male</option>
      <option>Female</option>
      <option>Other</option>
    </select>
  </div>

  {/* DESIGNATION */}
  <div>
    <label className="text-sm font-medium">Designation</label>
    <select
      name="designation"
      value={form.designation}
      onChange={handleChange}
      className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">Select Designation</option>
      <option>Principal</option>
      <option>Vice Principal</option>
      <option>Administrator</option>
      <option>Accountant</option>
    </select>
  </div>

  {/* DEPARTMENT */}
  <div>
    <label className="text-sm font-medium">Department</label>
    <select
      name="department"
      value={form.department}
      onChange={handleChange}
      className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">Select Department</option>
      <option>Administration</option>
      <option>Accounts</option>
      <option>HR</option>
      <option>IT</option>
    </select>
  </div>

  {/* JOINING DATE */}
  <div>
    <label className="text-sm font-medium">Date of Joining</label>
    <DatePicker
      selected={
        form.joiningDate
          ? new Date(form.joiningDate.split("/").reverse().join("-"))
          : null
      }
      onChange={(date) => {
        const formatted = date
          ? `${String(date.getDate()).padStart(2, "0")}/${String(
              date.getMonth() + 1
            ).padStart(2, "0")}/${date.getFullYear()}`
          : "";
        setForm({ ...form, joiningDate: formatted });
      }}
      dateFormat="dd/MM/yyyy"
      placeholderText="DD/MM/YYYY"
      className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500"
    />
  </div>

  {/* ===== ADDRESS SECTION ===== */}
  <div className="md:col-span-2 mt-4">
    <h3 className="text-lg font-semibold text-gray-700 mb-3">
      Address Details
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50 p-5 rounded-xl border">
      <Input
        label="Street Address"
        name="street"
        value={form.address.street}
        onChange={handleAddressChange}
      />

      <Input
        label="City"
        name="city"
        value={form.address.city}
        onChange={handleAddressChange}
      />

      <Input
        label="State"
        name="state"
        value={form.address.state}
        onChange={handleAddressChange}
      />

      <Input
        label="Pincode"
        name="pincode"
        value={form.address.pincode}
        onChange={handleAddressChange}
      />

      <Input
        label="Country"
        name="country"
        value={form.address.country}
        onChange={handleAddressChange}
      />
    </div>
  </div>

  {/* SUPER ADMIN */}
  <div className="md:col-span-2 flex items-center gap-2 mt-4">
    <input
      type="checkbox"
      name="isSuperAdmin"
      checked={form.isSuperAdmin}
      onChange={handleChange}
      className="h-4 w-4"
    />
    <label className="text-sm font-medium">
      Grant Super Admin Privileges
    </label>
  </div>

  {/* SUBMIT */}
  <div className="md:col-span-2 flex justify-end mt-6">
    <button
      type="submit"
      disabled={loading}
      className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-indigo-700"
    >
      {loading ? "Registering..." : "Register Admin"}
    </button>
  </div>
</form>


          
          
        </div>
      </div>
    </div>
  );
};

export default AdminRegisterForm;