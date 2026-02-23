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

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      {...props}
      className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
          title: "Staff Account Created",
          html: `
            <div class="text-left p-4 bg-slate-50 rounded-xl border border-slate-200">
               <div class="mb-3 flex items-center justify-between">
                 <div>
                   <strong class="text-slate-700">Member ID:</strong> 
                   <code class="text-indigo-600 font-bold ml-2">${adminID}</code>
                 </div>
                 <button id="copyAdminId" class="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-all shadow-sm">Copy</button>
               </div>
               
               <div class="mb-4 flex items-center justify-between">
                 <div>
                   <strong class="text-slate-700">Password:</strong> 
                   <code class="text-indigo-600 font-bold ml-2">${password}</code>
                 </div>
                 <button id="copyPassword" class="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-all shadow-sm">Copy</button>
               </div>

               <button id="copyAll" class="w-full py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors border border-indigo-100 flex items-center justify-center gap-2">
                 Copy All Credentials
               </button>

               <p class="mt-4 text-[10px] text-rose-500 font-bold uppercase italic text-center">Please save these credentials for first login.</p>
            </div>
          `,
          confirmButtonColor: "#4f46e5",
          confirmButtonText: "Done",
          didOpen: () => {
            const copyToClipboard = (text, label) => {
              navigator.clipboard.writeText(text).then(() => {
                Swal.showValidationMessage(`${label} copied`);
              });
            };

            document.getElementById("copyAdminId")?.addEventListener("click", () => copyToClipboard(adminID, "Member ID"));
            document.getElementById("copyPassword")?.addEventListener("click", () => copyToClipboard(password, "Password"));
            document.getElementById("copyAll")?.addEventListener("click", () => {
              const allCreds = `Member ID: ${adminID}\nPassword: ${password}`;
              copyToClipboard(allCreds, "All credentials");
            });
          }
        });

        // Reset form
        setForm({
          name: "", email: "", phone: "", dateOfBirth: "", gender: "", designation: "", 
          department: "", joiningDate: "", isSuperAdmin: false,
          address: { street: "", city: "", state: "", pincode: "", country: "India" },
          profilePictureFile: null,
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!school) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
            <FaUserShield className="text-indigo-600" /> Administrative Staff Enrollment
          </h1>
          <p className="text-slate-500 font-medium mt-2">Create secure accounts for Principal, Librarian, or Accountants</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-1 bg-indigo-600"></div>
          <form onSubmit={handleSubmit} className="p-10 space-y-10">
            
            {/* Role Selection Section - HIGHLIGHTED */}
            <div className="bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Account Access Level</h3>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700">Designation / Access Role *</label>
                <select
                  required
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  className="w-full mt-2 p-3.5 border-2 border-indigo-100 bg-white rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-bold text-indigo-900"
                >
                  <option value="">-- Choose Access Role --</option>
                  {ADMIN_ROLES.map(role => (
                    <option key={role.designation} value={role.designation}>{role.designation}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700">Auto-Assigned Department</label>
                <input readOnly value={form.department} className="w-full mt-2 p-3.5 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-500 cursor-not-allowed" />
              </div>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Staff Member Full Name *" name="name" value={form.name} onChange={handleChange} required placeholder="John Doe" />
              <Input label="Work Email Address *" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="email@school.com" />
              <Input label="Contact Number *" name="phone" value={form.phone} onChange={handleChange} required placeholder="9876543210" />
              
              <div>
                <label className="text-sm font-medium text-slate-700">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg">
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
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
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Residential Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2"><Input label="Street Address" name="street" value={form.address.street} onChange={handleAddressChange} /></div>
                <Input label="City" name="city" value={form.address.city} onChange={handleAddressChange} />
                <div>
                  <label className="text-sm font-medium text-slate-700">State</label>
                  <select name="state" value={form.address.state} onChange={handleAddressChange} className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg">
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <Input label="Pincode" name="pincode" value={form.address.pincode} onChange={handleAddressChange} />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
               <div className="flex items-center gap-3">
                  <input type="checkbox" name="isSuperAdmin" checked={form.isSuperAdmin} onChange={handleChange} className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <div>
                    <label className="text-sm font-black text-slate-800">Grant Super Admin Privileges</label>
                    <p className="text-[10px] text-slate-400">Enables full access to system settings and database logs.</p>
                  </div>
               </div>

               <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
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
