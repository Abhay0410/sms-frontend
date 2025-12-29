// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import { FaCopy } from "react-icons/fa";
// import api from "../../../../services/api";
// import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
// import BackButton from "../../../../components/BackButton";

// const Input = ({ label, ...props }) => (
//   <div>
//     <label className="text-sm font-medium text-gray-700">{label}</label>
//     <input
//       {...props}
//       className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//     />
//   </div>
// );

// const AdminRegisterForm = () => {
//   const navigate = useNavigate();
//   const [school, setSchool] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [credentials, setCredentials] = useState(null);

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     dateOfBirth: "",
//     gender: "",
//     designation: "",
//     department: "",
//     joiningDate: "",
//     isSuperAdmin: true,
//     address: {
//       street: "",
//       city: "",
//       state: "",
//       pincode: "",
//       country: "India",
//     },
//   });

//   // Load selected school
//   useEffect(() => {
//     const stored = localStorage.getItem("selectedSchool");
//     if (!stored) {
//       toast.error("Please select a school first");
//       navigate("/");
//       return;
//     }
//     setSchool(JSON.parse(stored));
//   }, [navigate]);

//   const copyToClipboard = (text, message) => {
//     navigator.clipboard.writeText(text);
//     toast.success(message);
//   };

//   const copyBothCredentials = () => {
//     if (!credentials) return;
//     const text = `Admin ID: ${credentials.adminID}\nPassword: ${credentials.password}`;
//     copyToClipboard(text, "All credentials copied!");
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setForm({ ...form, [name]: type === "checkbox" ? checked : value });
//   };

//   const handleAddressChange = (e) => {
//     const { name, value } = e.target;
//     setForm({
//       ...form,
//       address: { ...form.address, [name]: value },
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const payload = {
//         name: form.name.trim(),
//         email: form.email.trim().toLowerCase(),
//         phone: form.phone.trim(),
//         schoolId: school._id,
//         dateOfBirth: form.dateOfBirth || null,
//         gender: form.gender || null,
//         designation: form.designation.trim() || "",
//         department: form.department.trim() || "",
//         joiningDate: form.joiningDate || null,
//         address: {
//           street: form.address.street.trim() || "",
//           city: form.address.city.trim() || "",
//           state: form.address.state.trim() || "",
//           pincode: form.address.pincode.trim() || "",
//           country: "India",
//         },
//         permissions: [],
//         isSuperAdmin: form.isSuperAdmin,
//         role: "admin",
//         profilePicture: "",
//         isActive: true,
//       };

//       const res = await api.post(API_ENDPOINTS.ADMIN.AUTH.REGISTER, payload);

//       if (res.success === true) {
//         setCredentials({
//           adminID: res.data.adminID,
//           password: res.data.password,
//         });

//         toast.success("Admin registered successfully!");
//         // Reset form after successful registration
//         setForm({
//           name: "",
//           email: "",
//           phone: "",
//           dateOfBirth: "",
//           gender: "",
//           designation: "",
//           department: "",
//           joiningDate: "",
//           isSuperAdmin: true,
//           address: {
//             street: "",
//             city: "",
//             state: "",
//             pincode: "",
//             country: "India",
//           },
//         });
//         return;
//       }

//       toast.error(res.message || "Admin registration failed");
//     } catch (err) {
//       console.error("❌ Registration Error:", err);
//       toast.error(err.response?.data?.message || err.message || "Admin registration failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!school) return null;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6">
      
//       {/* ===== HEADER ===== */}
//       <div className="max-w-6xl mx-auto mb-6">
//         <BackButton to="/admin/admin-dashboard" />

//         <div className="flex flex-col md:flex-row md:items-center md:gap-3 mt-2">
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
//             Register Admin
//           </h1>
//           <p className="text-gray-500">
//             Add a new admin to the system
//           </p>
//         </div>
//       </div>

//       {/* ===== MAIN CARD ===== */}
//       <div className="max-w-6xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">

//           <h2 className="text-lg font-semibold text-gray-700 mb-4">
//             Admin Information
//           </h2>

//           {/* ===== SCHOOL INFO ===== */}
//           <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
//             <p className="text-xs uppercase tracking-wide text-gray-500">
//               School
//             </p>
//             <p className="text-lg font-semibold text-indigo-700">
//               {school.schoolName}
//             </p>
//             <p className="text-sm text-gray-600">
//               {school.address?.city}, {school.address?.state}
//             </p>
//           </div>

//           {/* ===== FORM ===== */}
//           <form
//             onSubmit={handleSubmit}
//             className="grid grid-cols-1 md:grid-cols-2 gap-5"
//           >
//             <Input label="Full Name *" name="name" value={form.name} onChange={handleChange} required />
//             <Input label="Email *" name="email" type="email" value={form.email} onChange={handleChange} required />
//             <Input label="Phone *" name="phone" value={form.phone} onChange={handleChange} required />
//             <Input label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />

//             {/* Gender */}
//             <div className="flex flex-col">
//               <label className="text-sm font-medium text-gray-700">
//                 Gender
//               </label>
//               <select
//                 name="gender"
//                 value={form.gender}
//                 onChange={handleChange}
//                 className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 
//                 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               >
//                 <option value="">Select</option>
//                 <option value="Male">Male</option>
//                 <option value="Female">Female</option>
//                 <option value="Other">Other</option>
//               </select>
//             </div>

//             <Input label="Designation" name="designation" value={form.designation} onChange={handleChange} />
//             <Input label="Department" name="department" value={form.department} onChange={handleChange} />
//             <Input label="Joining Date" name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} />

//             <Input label="Street" name="street" value={form.address.street} onChange={handleAddressChange} />
//             <Input label="City" name="city" value={form.address.city} onChange={handleAddressChange} />
//             <Input label="State" name="state" value={form.address.state} onChange={handleAddressChange} />
//             <Input label="Pincode" name="pincode" value={form.address.pincode} onChange={handleAddressChange} />

//             {/* Super Admin Checkbox */}
//             <div className="md:col-span-2 flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 name="isSuperAdmin"
//                 id="isSuperAdmin"
//                 checked={form.isSuperAdmin}
//                 onChange={handleChange}
//                 className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
//               />
//               <label htmlFor="isSuperAdmin" className="text-sm font-medium text-gray-700">
//                 Grant Super Admin Privileges
//               </label>
//             </div>

//             {/* ===== SUBMIT BUTTON ===== */}
//             <div className="md:col-span-2 flex justify-center md:justify-end mt-6">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full md:w-auto bg-indigo-600 text-white px-8 py-2.5 
//                 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? "Registering..." : "Register Admin"}
//               </button>
//             </div>
//           </form>

//           {/* ===== CREDENTIALS DISPLAY ===== */}
//           {credentials && (
//             <div className="mt-8 rounded-xl border-l-4 border-green-500 bg-green-50 p-6 shadow animate-fade-in">
//               <div className="flex items-center justify-between mb-6">
//                 <h3 className="text-lg font-semibold text-green-800">
//                   Admin Login Credentials
//                 </h3>
//                 <button
//                   type="button"
//                   onClick={copyBothCredentials}
//                   className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-200 flex items-center gap-2 transition"
//                 >
//                   <FaCopy /> <span className="text-sm font-medium">Copy Both</span>
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 {/* Admin ID Row */}
//                 <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-100">
//                   <div>
//                     <p className="text-xs text-gray-500 uppercase font-bold">Admin ID</p>
//                     <p className="font-mono text-lg text-gray-800">{credentials.adminID}</p>
//                   </div>
//                   <button 
//                     onClick={() => copyToClipboard(credentials.adminID, "Admin ID copied!")}
//                     className="p-2 text-gray-400 hover:text-indigo-600 transition"
//                     title="Copy ID"
//                   >
//                     <FaCopy />
//                   </button>
//                 </div>

//                 {/* Password Row */}
//                 <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-100">
//                   <div>
//                     <p className="text-xs text-red-500 uppercase font-bold">Temporary Password</p>
//                     <p className="font-mono text-lg text-red-700">{credentials.password}</p>
//                   </div>
//                   <button 
//                     onClick={() => copyToClipboard(credentials.password, "Password copied!")}
//                     className="p-2 text-red-400 hover:text-red-600 transition"
//                     title="Copy Password"
//                   >
//                     <FaCopy />
//                   </button>
//                 </div>
//               </div>

//               <p className="text-xs text-red-500 mt-4 italic">
//                 ⚠️ Share these credentials securely. For security reasons, the password will not be displayed again.
//               </p>

//               <div className="mt-6 flex gap-3">
//                 <button
//                   onClick={() => navigate("/signin")}
//                   className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 shadow-md transition"
//                 >
//                   Go to Login
//                 </button>
//                 <button
//                   onClick={() => setCredentials(null)}
//                   className="flex-1 bg-white text-gray-600 border border-gray-300 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
//                 >
//                   Register Another
//                 </button>
//               </div>
//             </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminRegisterForm;
import { useEffect, useState , useRef} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCopy } from "react-icons/fa";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import BackButton from "../../../../components/BackButton";

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
  const [credentials, setCredentials] = useState(null);
  const credentialsRef = useRef(null);


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

  const copyToClipboard = (text, message) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const copyBothCredentials = () => {
    if (!credentials) return;
    const text = `Admin ID: ${credentials.adminID}\nPassword: ${credentials.password}`;
    copyToClipboard(text, "All credentials copied!");
  };

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
        setCredentials({
          adminID: res.data.adminID,
          password: res.data.password,
        });

        toast.success("Admin registered successfully!");
        // Reset form after successful registration
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
            country: "India",
          },
        });
        return;
      }

      toast.error(res.message || "Admin registration failed");
    } catch (err) {
      console.error("❌ Registration Error:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Admin registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
  if (credentials && credentialsRef.current) {
    credentialsRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}, [credentials]);

  if (!school) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6">
      {/* ===== HEADER ===== */}
      <div className="max-w-6xl mx-auto mb-6">
        <BackButton to="/admin/admin-dashboard" />

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
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
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
           
           <div>
              <label className="block text-sm font-medium mb-1">
                Date of Birth
              </label>

              <DatePicker
                selected={
                  form.dateOfBirth
                    ? new Date(
                        form.dateOfBirth.split("/").reverse().join("-")
                      )
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
                className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            

            {/* Gender */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Designation
              </label>

              <select
                name="designation"
                value={form.designation}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" className="text-gray-600">Select Designation</option>

                {/* Teaching Staff */}
                <option value="Principal">Principal</option>
                <option value="Vice Principal">Vice Principal</option>
                <option value="Head Teacher">Head Teacher</option>
                <option value="PGT">PGT (Post Graduate Teacher)</option>
                <option value="TGT">TGT (Trained Graduate Teacher)</option>
                <option value="PRT">PRT (Primary Teacher)</option>
                <option value="Assistant Teacher">Assistant Teacher</option>
                <option value="Special Educator">Special Educator</option>
                <option value="Librarian">Librarian</option>
                <option value="Sports Teacher">Sports Teacher</option>

                {/* Administration */}
                <option value="Administrator">Administrator</option>
                <option value="Office Superintendent">
                  Office Superintendent
                </option>
                <option value="Clerk">Clerk</option>
                <option value="Accountant">Accountant</option>
                <option value="Receptionist">Receptionist</option>

                {/* Support Staff */}
                <option value="Lab Assistant">Lab Assistant</option>
                <option value="IT Coordinator">IT Coordinator</option>
                <option value="Transport Incharge">Transport Incharge</option>
                <option value="Hostel Warden">Hostel Warden</option>
                <option value="Nurse">Nurse</option>
                <option value="Counsellor">Counsellor</option>
                <option value="Security Supervisor">Security Supervisor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Department
              </label>

              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" className="text-gray-600">Select Department</option>
                <option value="Administration">Administration</option>
                <option value="Accounts">Accounts</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Teaching">Teaching</option>
                <option value="Examination">Examination</option>
                <option value="Library">Library</option>
                <option value="IT Support">IT Support</option>
                <option value="Transport">Transport</option>
                <option value="Hostel">Hostel</option>
                <option value="Sports">Sports</option>
                <option value="Medical">Medical</option>
                <option value="Security">Security</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Date of Joining
              </label>

              <DatePicker
                selected={
                  form.dateOfJoining
                    ? new Date(
                        form.dateOfJoining.split("/").reverse().join("-")
                      )
                    : null
                }
                onChange={(date) => {
                  const formatted = date
                    ? `${String(date.getDate()).padStart(2, "0")}/${String(
                        date.getMonth() + 1
                      ).padStart(2, "0")}/${date.getFullYear()}`
                    : "";

                  setForm({ ...form, dateOfJoining: formatted });
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <Input
              label="Street"
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

            {/* Super Admin Checkbox */}
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                name="isSuperAdmin"
                id="isSuperAdmin"
                checked={form.isSuperAdmin}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <label
                htmlFor="isSuperAdmin"
                className="text-sm font-medium text-gray-700"
              >
                Grant Super Admin Privileges
              </label>
            </div>

            {/* ===== SUBMIT BUTTON ===== */}
            <div className="md:col-span-2 flex justify-center md:justify-end mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-indigo-600 text-white px-8 py-2.5 
                rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Registering..." : "Register Admin"}
              </button>
            </div>
          </form>

          {/* ===== CREDENTIALS DISPLAY ===== */}
          {credentials && (
            
            <div className="mt-8 rounded-xl border-l-4 border-green-500 bg-green-50 p-6 shadow animate-fade-in"  ref={credentialsRef}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-green-800">
                  Admin Login Credentials
                </h3>
                <button
                  type="button"
                  onClick={copyBothCredentials}
                  className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-200 flex items-center gap-2 transition"
                >
                  <FaCopy />{" "}
                  <span className="text-sm font-medium">Copy Both</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Admin ID Row */}
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-100">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">
                      Admin ID
                    </p>
                    <p className="font-mono text-lg text-gray-800">
                      {credentials.adminID}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(credentials.adminID, "Admin ID copied!")
                    }
                    className="p-2 text-gray-400 hover:text-indigo-600 transition"
                    title="Copy ID"
                  >
                    <FaCopy />
                  </button>
                </div>

                {/* Password Row */}
                <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-100">
                  <div>
                    <p className="text-xs text-red-500 uppercase font-bold">
                      Temporary Password
                    </p>
                    <p className="font-mono text-lg text-red-700">
                      {credentials.password}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(credentials.password, "Password copied!")
                    }
                    className="p-2 text-red-400 hover:text-red-600 transition"
                    title="Copy Password"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>

              <p className="text-xs text-red-500 mt-4 italic">
                ⚠️ Share these credentials securely. For security reasons, the
                password will not be displayed again.
              </p>

              
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRegisterForm;