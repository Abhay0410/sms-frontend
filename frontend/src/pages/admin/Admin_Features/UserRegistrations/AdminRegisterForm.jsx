import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCheck, FaSpinner, FaUserShield } from "react-icons/fa";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

// ✅ Sync these with your Signin Page & Sidebar Filter Logic
const ADMIN_ROLES = [
  { designation: "Principal", department: "Administration", isSuper: true },
  { designation: "Administrator", department: "Administration", isSuper: true },
  { designation: "Vice Principal", department: "Administration", isSuper: false },
  { designation: "Librarian", department: "Library", isSuper: false },
  { designation: "Accountant", department: "Accounts", isSuper: false },
  { designation: "HR Manager", department: "HR", isSuper: false }
];

const FormInput = ({ label, error, required, ...props }) => (
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

const AdminRegisterForm = () => {
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    designation: "", // Role selection
    department: "",
    joiningDate: "",
    isSuperAdmin: false,
    address: { street: "", city: "", state: "", pincode: "", country: "India" },
    profilePictureFile: null,
  });

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
    const { name, value, type, checked } = e.target;
    
    // ✅ Special Handling for Role selection to auto-fill Department & SuperAdmin status
    if (name === "designation") {
      const selectedRole = ADMIN_ROLES.find(r => r.designation === value);
      setForm(prev => ({
        ...prev,
        designation: value,
        department: selectedRole?.department || "",
        isSuperAdmin: selectedRole?.isSuper || false
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.designation) return toast.error("Please select a valid role/designation");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("email", form.email.trim().toLowerCase());
      formData.append("phone", form.phone.trim());
      formData.append("schoolId", school._id);
      formData.append("dateOfBirth", form.dateOfBirth || "");
      formData.append("gender", form.gender || "");
      formData.append("designation", form.designation);
      formData.append("department", form.department);
      formData.append("joiningDate", form.joiningDate || "");
      formData.append("isSuperAdmin", form.isSuperAdmin);
      formData.append("role", "admin");
      
      // ✅ Explicit permissions for certain roles can be added here or in backend
      formData.append("permissions", JSON.stringify([])); 
      
      formData.append("address", JSON.stringify(form.address));

      if (form.profilePictureFile) {
        formData.append("profilePicture", form.profilePictureFile);
      }

      const res = await api.post(API_ENDPOINTS.ADMIN.AUTH.REGISTER, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.success) {
        const { adminID, password } = res.data;
        Swal.fire({
          icon: "success",
          title: "Account Created Successfully",
          html: `
            <div class="text-left p-4 bg-slate-50 rounded-2xl border border-slate-200">
               <p class="mb-2"><strong>Member ID:</strong> <code class="text-indigo-600">${adminID}</code></p>
               <p class="mb-4"><strong>Temp Password:</strong> <code class="text-indigo-600">${password}</code></p>
               <p class="text-[11px] text-rose-500 font-bold italic text-center">⚠️ Save these keys now. They won't be shown again.</p>
            </div>
          `,
          confirmButtonColor: "#4f46e5",
          confirmButtonText: "Copy & Done",
          preConfirm: () => {
            navigator.clipboard.writeText(`ID: ${adminID}, Pass: ${password}`);
            toast.success("Credentials copied");
          }
        });

        // Reset form and errors
        setForm({
          name: "",
          email: "",
          phone: "",
          dateOfBirth: "",
          gender: "",
          designation: "",
          department: "",
          joiningDate: "",
          isSuperAdmin: false,
          address: { street: "", city: "", state: "", pincode: "", country: "India" },
          profilePictureFile: null,
        });
        setErrors({});
      }
    } catch (err) {
      // --- THE ROBUST ERROR PARSER ---
      const serverData = err?.response?.data;
      let actualReason = "Account Creation Failed";

      // Priority 1: Check nested errors array from errorHandler.js
      if (serverData?.errors && Array.isArray(serverData.errors)) {
        actualReason = serverData.errors[0].message || serverData.errors[0];
      } else {
        actualReason = serverData?.message || err.message;
      }

      const cleanReason = actualReason.replace("ValidationError:", "").trim();
      const mappedErrors = { ...errors };
      const lowerMsg = cleanReason.toLowerCase();

      // Field Highlighting
      if (lowerMsg.includes("email")) mappedErrors.email = "Work email already in use.";
      if (lowerMsg.includes("phone")) mappedErrors.phone = "Phone number already exists.";
      if (lowerMsg.includes("designation")) mappedErrors.designation = "Please select a role.";

      setErrors(mappedErrors);

      Swal.fire({
        icon: "warning",
        title: "Registration Requirements",
        html: `
            <div style="text-align: left; background: #fff7ed; padding: 16px; border-radius: 12px; border: 1px solid #ffedd5;">
                <span style="color: #9a3412; font-weight: 800; font-size: 11px; text-transform: uppercase;">Detailed Reason:</span>
                <p style="color: #7c2d12; font-size: 14px; margin-top: 8px; line-height: 1.5; font-weight: 600;">
                    ${cleanReason}
                </p>
            </div>
        `,
        confirmButtonColor: "#4f46e5",
        confirmButtonText: "Check Field"
      });

      // Auto-scroll logic
      const firstField = Object.keys(mappedErrors).find(key => mappedErrors[key]);
      if (firstField) {
        const el = document.getElementsByName(firstField)[0] || document.querySelector(`[name="${firstField}"]`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!school) return null;

  return (
    <div className="min-h-screen bg-blue-50  ">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
            <FaUserShield className="text-indigo-600" /> Administrative Staff Enrollment  
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Create secure accounts for Principal, Librarian, or Accountants</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-1 bg-indigo-600"></div>
          <form onSubmit={handleSubmit} className="p-10 space-y-10">
            
            {/* Role Selection Section - HIGHLIGHTED */}
            <div className="bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4">Account Access Level</h3>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700">Designation / Access Role *</label>
                <select
                  required
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  className={`w-full mt-2 p-3.5 border-2 bg-white rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-bold text-indigo-900 ${errors.designation ? 'border-rose-500' : 'border-indigo-100'}`}
                >
                  <option value="">-- Choose Access Role --</option>
                  {ADMIN_ROLES.map(role => (
                    <option key={role.designation} value={role.designation}>{role.designation}</option>
                  ))}
                </select>
                {errors.designation && <span className="text-[11px] font-bold text-rose-600 animate-pulse mt-1">{errors.designation}</span>}
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700">Auto-Assigned Department</label>
                <input readOnly value={form.department} className="w-full mt-2 p-3.5 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-500 cursor-not-allowed" />
              </div>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput 
                label="Staff Member Full Name *" 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                required 
                placeholder="John Doe" 
                error={errors.name}
              />
              <FormInput 
                label="Work Email Address *" 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={handleChange} 
                required 
                placeholder="email@school.com" 
                error={errors.email}
              />
              <FormInput 
                label="Contact Number *" 
                name="phone" 
                value={form.phone} 
                onChange={handleChange} 
                required 
                placeholder="9876543210" 
                error={errors.phone}
              />
              
              <div>
                <label className="text-sm font-medium text-slate-700">Gender</label>
                <FormSelect name="gender" value={form.gender} onChange={handleChange} options={["Male", "Female", "Other"]} />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Date of Birth</label>
                <DatePicker
                  selected={form.dateOfBirth ? new Date(form.dateOfBirth.split("/").reverse().join("-")) : null}
                  onChange={(date) => setForm({...form, dateOfBirth: date?.toLocaleDateString('en-GB')})}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Joining Date</label>
                <DatePicker
                  selected={form.joiningDate ? new Date(form.joiningDate.split("/").reverse().join("-")) : null}
                  onChange={(date) => setForm({...form, joiningDate: date?.toLocaleDateString('en-GB')})}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 ring-indigo-500"
                />
              </div>
            </div>

            {/* Profile Pic */}
            <div className="border-t border-slate-100 pt-8">
              <label className="text-sm font-bold text-slate-700 block mb-3">Upload ID Profile Picture</label>
              <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, profilePictureFile: e.target.files[0] })} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
            </div>

            {/* Address */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Residential Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2"><FormInput label="Street Address" name="street" value={form.address.street} onChange={handleAddressChange} /></div>
                <FormInput label="City" name="city" value={form.address.city} onChange={handleAddressChange} />
                <div>
                  <label className="text-sm font-medium text-slate-700">State</label>
                  <FormSelect name="state" value={form.address.state} onChange={handleAddressChange} options={INDIAN_STATES} />
                </div>
                <FormInput label="Pincode" name="pincode" value={form.address.pincode} onChange={handleAddressChange} />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
               <div className="flex items-center gap-3">
                  <input type="checkbox" name="isSuperAdmin" checked={form.isSuperAdmin} onChange={handleChange} className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <div>
                    <label className="text-sm font-bold text-slate-800">Grant Super Admin Privileges</label>
                    <p className="text-[10px] text-slate-400">Enables full access to system settings and database logs.</p>
                  </div>
               </div>

               <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <><FaCheck /> Initialize Account</>}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminRegisterForm;
