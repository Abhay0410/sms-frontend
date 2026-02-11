// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";

// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import { FaCopy } from "react-icons/fa";
// import api from "../../../../services/api";
// import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
// import Swal from "sweetalert2";

// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

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

//     console.log("🟢 AdminRegisterForm component rendered"); // 🔥 test
//   const navigate = useNavigate();

//   const [school, setSchool] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [previewImage, setPreviewImage] = useState("");

//   // const [profileData, setProfileData] = useState(null);

//   const { id } = useParams();

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     dateOfBirth: null,
//     gender: "",
//     designation: "",
//     department: "",
//     joiningDate: null,
//     isSuperAdmin: true,
//     profilePictureFile: null,
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

 

//   // 🔥 FETCH ADMIN FOR EDIT
//   useEffect(() => {
//     if (!id) return; // 👈 agar register hai toh skip

//     const fetchAdmin = async () => {
//       try {
//         const res = await api.get(
//           API_ENDPOINTS.ADMIN.GET_BY_ID(id) // e.g. /admins/:id
//         );

//         const admin = res.data;

//         setForm({
//           name: admin.name || "",
//           email: admin.email || "",
//           phone: admin.phone || "",
//           gender: admin.gender || "",
//           designation: admin.designation || "",
//           department: admin.department || "",
//           isSuperAdmin: admin.isSuperAdmin || false,

//           // ✅ DOB
//           dateOfBirth: admin.dateOfBirth ? new Date(admin.dateOfBirth) : null,

//           // ✅ JOINING DATE
//           joiningDate: admin.joiningDate ? new Date(admin.joiningDate) : null,

//           // ✅ ADDRESS
//           address: {
//             street: admin.address?.street || "",
//             city: admin.address?.city || "",
//             state: admin.address?.state || "",
//             pincode: admin.address?.pincode || "",
//             country: admin.address?.country || "India",
//           },

//           profilePictureFile: null, // ❌ file nahi hoti DB me
//         });

//         // ✅ IMAGE URL (DB wali)
//         setPreviewImage(admin.profilePicture || "");
//       } catch (error) {
//         toast.error(error + "Failed to load admin data");
//       }
//     };

//     fetchAdmin();
//   }, [id]);

//   const handleChange = (e) => {
//     let { name, value, type, checked } = e.target;

//     setForm({
//       ...form,
//       [name]: type === "checkbox" ? checked : value,
//     });
//   };

//   const handleAddressChange = (e) => {
//     const { name, value } = e.target;
//     setForm({
//       ...form,
//       address: { ...form.address, [name]: value },
//     });
//   };

//   //  const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   setLoading(true);

//   //   try {
//   //     // const payload = {
//   //     //   name: form.name.trim(),
//   //     //   email: form.email.trim().toLowerCase(),
//   //     //   phone: form.phone.trim(),
//   //     //   schoolId: school._id,
//   //     //   dateOfBirth: form.dateOfBirth || null,
//   //     //   gender: form.gender || null,
//   //     //   designation: form.designation.trim() || "",
//   //     //   department: form.department.trim() || "",
//   //     //   joiningDate: form.joiningDate || null,
//   //     //   address: {
//   //     //     street: form.address.street.trim() || "",
//   //     //     city: form.address.city.trim() || "",
//   //     //     state: form.address.state.trim() || "",
//   //     //     pincode: form.address.pincode.trim() || "",
//   //     //     country: "India",
//   //     //   },
//   //     //   permissions: [],
//   //     //   isSuperAdmin: form.isSuperAdmin,
//   //     //   role: "admin",
//   //     //   profilePicture: form.profilePicture.trim() || "",
//   //     //   isActive: true,
//   //     // };

//   //     const formData = new FormData();
//   // // append all other fields...
//   // if (form.profilePictureFile) {
//   //   formData.append("profilePicture", form.profilePictureFile);
//   // }

//   //     const res = await api.post(API_ENDPOINTS.ADMIN.AUTH.REGISTER, payload);

//   //     if (res.success === true) {
//   //       const { adminID, password } = res.data;

//   //      Swal.fire({
//   //   icon: "success",
//   //   title: "Admin Registered",
//   //   width: 420,
//   //   html: `
//   //     <div style="text-align:left; font-size:13px; line-height:1.4">

//   //       <div style="margin-bottom:12px">
//   //         <div style="font-weight:600; margin-bottom:4px">Admin ID</div>
//   //         <div style="display:flex; justify-content:space-between; align-items:center; gap:8px">
//   //           <code style="font-size:12px; padding:4px 6px">${adminID}</code>
//   //           <button id="copyId"
//   //             style="font-size:11px; padding:4px 8px; cursor:pointer">
//   //             Copy
//   //           </button>
//   //         </div>
//   //       </div>

//   //       <div>
//   //         <div style="font-weight:600; margin-bottom:4px">Temporary Password</div>
//   //         <div style="display:flex; justify-content:space-between; align-items:center; gap:8px">
//   //           <code style="font-size:12px; padding:4px 6px">${password}</code>
//   //           <button id="copyPass"
//   //             style="font-size:11px; padding:4px 8px; cursor:pointer">
//   //             Copy
//   //           </button>
//   //         </div>
//   //       </div>

//   //       <div style="margin-top:10px; font-size:11px; color:#b91c1c">
//   //         ⚠ Save these credentials. They will not be shown again.
//   //       </div>

//   //     </div>
//   //   `,
//   //   confirmButtonText: "Done",
//   //   confirmButtonColor: "#4f46e5",
//   //   didOpen: () => {
//   //     document.getElementById("copyId").onclick = () => {
//   //       navigator.clipboard.writeText(adminID);
//   //       Swal.showValidationMessage("Admin ID copied");
//   //     };

//   //     document.getElementById("copyPass").onclick = () => {
//   //       navigator.clipboard.writeText(password);
//   //       Swal.showValidationMessage("Password copied");
//   //     };
//   //   },
//   // });

//   //       // Reset form
//   //       setForm({
//   //         name: "",
//   //         email: "",
//   //         phone: "",
//   //         dateOfBirth: "",
//   //         gender: "",
//   //         designation: "",
//   //         department: "",
//   //         joiningDate: "",
//   //         isSuperAdmin: true,
//   //         address: {
//   //           street: "",
//   //           city: "",
//   //           state: "",
//   //           pincode: "",
//   //           country: "",
//   //         },
//   //       });
//   //     } else {
//   //       toast.error(res.message || "Admin registration failed");
//   //     }
//   //   } catch (err) {
//   //     Swal.fire({
//   //       icon: "error",
//   //       title: "Registration Failed",
//   //       text:
//   //         err.response?.data?.message ||
//   //         err.message ||
//   //         "Admin registration failed",
//   //     });
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   setLoading(true);

//   //   try {
//   //     const formData = new FormData();

//   //     formData.append("name", form.name.trim());
//   //     formData.append("email", form.email.trim().toLowerCase());
//   //     formData.append("phone", form.phone.trim());
//   //     formData.append("schoolId", school._id);

//   //     if (form.dateOfBirth) {
//   //       formData.append("dateOfBirth", form.dateOfBirth.toISOString());
//   //     }
//   //     if (form.joiningDate) {
//   //       formData.append("joiningDate", form.joiningDate.toISOString());
//   //     }

//   //     formData.append("gender", form.gender || "");
//   //     formData.append("designation", form.designation || "");
//   //     formData.append("department", form.department || "");
//   //     formData.append("role", "admin");
//   //     formData.append("isSuperAdmin", String(form.isSuperAdmin));
//   //     formData.append("isActive", true);

//   //     // address
//   //     formData.append(
//   //       "address",
//   //       JSON.stringify({
//   //         street: form.address.street || "",
//   //         city: form.address.city || "",
//   //         state: form.address.state || "",
//   //         pincode: form.address.pincode || "",
//   //         country: "India",
//   //       })
//   //     );

//   //     // formData.append("address[street]", form.address.street || "");
//   //     // formData.append("address[city]", form.address.city || "");
//   //     // formData.append("address[state]", form.address.state || "");
//   //     // formData.append("address[pincode]", form.address.pincode || "");
//   //     // formData.append("address[country]", "India");

//   //     // ✅ PROFILE PICTURE
//   //     if (form.profilePictureFile) {
//   //       formData.append("profilePicture", form.profilePictureFile);
//   //     }

//   //     const res = await api.post(API_ENDPOINTS.ADMIN.AUTH.REGISTER, formData, {
//   //       headers: { "Content-Type": "multipart/form-data" },
//   //     });

//   //     if (res.success === true) {
//   //       const { adminID, password } = res.data;

//   //       Swal.fire({
//   //         icon: "success",
//   //         title: "Admin Registered",
//   //         width: 420,
//   //         html: `
//   //   <div style="text-align:left; font-size:13px; line-height:1.4">

//   //     <div style="margin-bottom:12px">
//   //       <div style="font-weight:600; margin-bottom:4px">Admin ID</div>
//   //       <div style="display:flex; justify-content:space-between; align-items:center; gap:8px">
//   //         <code style="font-size:12px; padding:4px 6px">${adminID}</code>
//   //         <button id="copyId"
//   //           style="font-size:11px; padding:4px 8px; cursor:pointer">
//   //           Copy
//   //         </button>
//   //       </div>
//   //     </div>

//   //     <div>
//   //       <div style="font-weight:600; margin-bottom:4px">Temporary Password</div>
//   //       <div style="display:flex; justify-content:space-between; align-items:center; gap:8px">
//   //         <code style="font-size:12px; padding:4px 6px">${password}</code>
//   //         <button id="copyPass"
//   //           style="font-size:11px; padding:4px 8px; cursor:pointer">
//   //           Copy
//   //         </button>
//   //       </div>
//   //     </div>

//   //     <div style="margin-top:10px; font-size:11px; color:#b91c1c">
//   //       ⚠ Save these credentials. They will not be shown again.
//   //     </div>

//   //   </div>
//   // `,
//   //         confirmButtonText: "Done",
//   //         confirmButtonColor: "#4f46e5",
//   //         didOpen: () => {
//   //           document.getElementById("copyId").onclick = () => {
//   //             navigator.clipboard.writeText(adminID);
//   //             Swal.showValidationMessage("Admin ID copied");
//   //           };

//   //           document.getElementById("copyPass").onclick = () => {
//   //             navigator.clipboard.writeText(password);
//   //             Swal.showValidationMessage("Password copied");
//   //           };
//   //         },
//   //       });
//   //     }
//   //   } catch (err) {
//   //     Swal.fire({
//   //       icon: "error",
//   //       title: "Registration Failed",
//   //       text: err.response?.data?.message || err.message,
//   //     });
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleSubmit = async (e) => {
//   e.preventDefault();
//   setLoading(true);

//   try {
//     const formData = new FormData();

//     formData.append("name", form.name);
//     formData.append("email", form.email);
//     formData.append("phone", form.phone);
//     formData.append("gender", form.gender);
//     formData.append("designation", form.designation);
//     formData.append("department", form.department);
//     formData.append("isSuperAdmin", form.isSuperAdmin);

//     if (form.dateOfBirth) {
//       formData.append("dateOfBirth", form.dateOfBirth.toISOString());
//     }

//     if (form.joiningDate) {
//       formData.append("joiningDate", form.joiningDate.toISOString());
//     }

//     formData.append(
//       "address",
//       JSON.stringify(form.address)
//     );

//     if (form.profilePictureFile) {
//       formData.append("profilePicture", form.profilePictureFile);
//     }

//     let res;

   
    

//     if (id) {
//       // ✅ UPDATE MODE
//        console.log("🧪 adminId 👉", id);
//   console.log("🧪 UPDATE FN 👉", API_ENDPOINTS.ADMIN?.UPDATE);
//   console.log("🧪 FINAL URL 👉", API_ENDPOINTS.ADMIN?.UPDATE?.(id));
      
//       res = await api.put(
//         API_ENDPOINTS.ADMIN.UPDATE(id),
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );
//     } else {
//       // ✅ REGISTER MODE
//       formData.append("schoolId", school._id);

//       res = await api.post(
//         API_ENDPOINTS.ADMIN.AUTH.REGISTER,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       if (res.data?.success) {
//   toast.success("Admin saved successfully");
// }
//     }

//     toast.success(id ? "Profile updated successfully" : "Admin registered");
//   } catch (err) {
//     toast.error(err.response?.data?.message || err.message);
//   } finally {
//     setLoading(false);
//   }
// };

//  console.log("🧪 adminId 👉", id);
//   console.log("🧪 UPDATE FN 👉", API_ENDPOINTS.ADMIN?.UPDATE);
//   console.log("🧪 FINAL URL 👉", API_ENDPOINTS.ADMIN?.UPDATE?.(id));


//   console.log("DOB 👉", form.dateOfBirth);
// console.log("ADDRESS 👉", form.address);
// console.log("IMAGE 👉", previewImage);


//   if (!school){
//     return <div>Loading...</div>;
//   } ;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6">
//       {/* ===== HEADER ===== */}
//       <div className="max-w-6xl mx-auto mb-6">
//         <div className="flex flex-col md:flex-row md:items-center md:gap-3 mt-2">
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
//             Register Admin
//           </h1>
//           <p className="text-gray-500">Add a new admin to the system</p>
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
//             className="grid grid-cols-1 md:grid-cols-2 gap-6"
//           >
//             {/* BASIC INFO */}
//             <Input
//               label="Full Name *"
//               name="name"
//               value={form.name}
//               onChange={handleChange}
//               required
//             />

//             <Input
//               label="Email *"
//               name="email"
//               type="email"
//               value={form.email}
//               onChange={handleChange}
//               required
//             />

//             <Input
//               label="Phone *"
//               name="phone"
//               value={form.phone}
//               onChange={handleChange}
//               required
//             />

//             {/* DOB */}
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Date of Birth
//               </label>
//               {/* <DatePicker
//                 selected={form.dateOfBirth}
//                 onChange={(date) => setForm({ ...form, dateOfBirth: date })}
//                 dateFormat="dd/MM/yyyy"
//                 placeholderText="DD/MM/YYYY"
//                 className="w-full rounded-lg border border-gray-300 p-2"
//               /> */}
//               <DatePicker
//                 selected={form.dateOfBirth}
//                 onChange={(date) => setForm({ ...form, dateOfBirth: date })}
//                 dateFormat="dd-MM-yyyy"
//                 placeholderText="dd-mm-yyyy"
//                 className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-indigo-200"
//               />
//             </div>

//             {/* GENDER */}
//             <div>
//               <label className="text-sm font-medium">Gender</label>
//               <select
//                 name="gender"
//                 value={form.gender}
//                 onChange={handleChange}
//                 className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:ring-2 focus:ring-indigo-500"
//               >
//                 <option value="">Select</option>
//                 <option>Male</option>
//                 <option>Female</option>
//                 <option>Other</option>
//               </select>
//             </div>

//             {/* DESIGNATION */}
//             <div>
//               <label className="text-sm font-medium">Designation</label>
//               <select
//                 name="designation"
//                 value={form.designation}
//                 onChange={handleChange}
//                 className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500"
//               >
//                 <option value="">Select Designation</option>
//                 <option>Principal</option>
//                 <option>Vice Principal</option>
//                 <option>Administrator</option>
//                 <option>Accountant</option>
//               </select>
//             </div>

//             {/* DEPARTMENT */}
//             <div>
//               <label className="text-sm font-medium">Department</label>
//               <select
//                 name="department"
//                 value={form.department}
//                 onChange={handleChange}
//                 className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500"
//               >
//                 <option value="">Select Department</option>
//                 <option>Administration</option>
//                 <option>Accounts</option>
//                 <option>HR</option>
//                 <option>IT</option>
//               </select>
//             </div>

//             {/* JOINING DATE */}
//             <div>
//               <label className="text-sm font-medium">Date of Joining</label>
//               <DatePicker
//                 selected={form.joiningDate ? new Date(form.joiningDate) : null}
//                 onChange={(date) => {
//                   setForm({ ...form, joiningDate: date }); // ✅ Date object
//                 }}
//                 dateFormat="dd/MM/yyyy"
//                 placeholderText="DD/MM/YYYY"
//                 className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500"
//               />
//             </div>

//             {/* <div>
//               <label className="text-sm font-medium">Profile Picture</label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => {
//                   const file = e.target.files[0];
//                   if (file) {
//                     setForm({ ...form, profilePictureFile: file });
//                   }
//                 }}
//                 className="mt-1 w-full border border-gray-300 p-2 rounded-lg"
//               />
//             </div> */}

//             <div>
//               <label className="text-sm font-medium">Profile Picture</label>

//               <div>
//                 <label className="text-sm font-medium">Profile Picture</label>

//                 {previewImage && (
//                   <img
//                     src={previewImage}
//                     alt="Profile"
//                     className="w-24 h-24 rounded-full object-cover mb-2 border"
//                   />
//                 )}

//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) => {
//                     const file = e.target.files[0];
//                     if (file) {
//                       setForm({ ...form, profilePictureFile: file });
//                       setPreviewImage(URL.createObjectURL(file));
//                     }
//                   }}
//                   className="mt-1 w-full border p-2 rounded-lg"
//                 />
//               </div>

             
//             </div>

//             {/* ===== ADDRESS SECTION ===== */}
//             <div className="md:col-span-2 mt-4">
//               <h3 className="text-lg font-semibold text-gray-700 mb-3">
//                 Address Details
//               </h3>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50 p-5 rounded-xl border">
//                 <Input
//                   label="Street Address"
//                   name="street"
//                   value={form.address?.street || ""}
//                   onChange={handleAddressChange}
//                 />

//                 <Input
//                   label="City"
//                   name="city"
//                   value={form.address?.city || ""}
//                   onChange={handleAddressChange}
//                 />

//                 <Input
//                   label="State"
//                   name="state"
//                   value={form.address?.state || ""}
//                   onChange={handleAddressChange}
//                 />

//                 <Input
//                   label="Pincode"
//                   name="pincode"
//                   value={form.address?.pincode || ""}
//                   onChange={handleAddressChange}
//                 />

//                 <Input
//                   label="Country"
//                   name="country"
//                   value={form.address?.country || "India"}
//                   onChange={handleAddressChange}
//                 />
//               </div>
//             </div>

//             {/* SUPER ADMIN */}
//             <div className="md:col-span-2 flex items-center gap-2 mt-4">
//               <input
//                 type="checkbox"
//                 name="isSuperAdmin"
//                 checked={form.isSuperAdmin}
//                 onChange={handleChange}
//                 className="h-4 w-4"
//               />
//               <label className="text-sm font-medium">
//                 Grant Super Admin Privileges
//               </label>
//             </div>

//             {/* SUBMIT */}
//             <div className="md:col-span-2 flex justify-end mt-6">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-indigo-700"
//               >
//                 {loading ? "Registering..." : "Register Admin"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };


// export default AdminRegisterForm;




import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCheck, FaSpinner } from "react-icons/fa";
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
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

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

//  const handleSubmit = async (e) => {
//   e.preventDefault();
//   setLoading(true);

//   try {
//     const payload = {
//       name: form.name.trim(),
//       email: form.email.trim().toLowerCase(),
//       phone: form.phone.trim(),
//       schoolId: school._id,
//       dateOfBirth: form.dateOfBirth || null,
//       gender: form.gender || null,
//       designation: form.designation.trim() || "",
//       department: form.department.trim() || "",
//       joiningDate: form.joiningDate || null,
//       address: JSON.stringify({
//         street: form.address.street.trim() || "",
//         city: form.address.city.trim() || "",
//         state: form.address.state.trim() || "",
//         pincode: form.address.pincode.trim() || "",
//         country: "India",
//       }),
//       permissions: [],
//       isSuperAdmin: form.isSuperAdmin,
//       role: "admin",
//       profilePicture: "",
//       isActive: true,
//     };

    
//     const res = await api.post(API_ENDPOINTS.ADMIN.AUTH.REGISTER, payload);

//     if (res.success === true) {
//       const { adminID, password } = res.data;

//      Swal.fire({
//   icon: "success",
//   title: "Admin Registered",
//   width: 420,
//   html: `
//     <div style="text-align:left; font-size:13px; line-height:1.4">

//       <div style="margin-bottom:12px">
//         <div style="font-weight:600; margin-bottom:4px">Admin ID</div>
//         <div style="display:flex; justify-content:space-between; align-items:center; gap:8px">
//           <code style="font-size:12px; padding:4px 6px">${adminID}</code>
//           <button id="copyId"
//             style="font-size:11px; padding:4px 8px; cursor:pointer">
//             Copy
//           </button>
//         </div>
//       </div>

//       <div>
//         <div style="font-weight:600; margin-bottom:4px">Temporary Password</div>
//         <div style="display:flex; justify-content:space-between; align-items:center; gap:8px">
//           <code style="font-size:12px; padding:4px 6px">${password}</code>
//           <button id="copyPass"
//             style="font-size:11px; padding:4px 8px; cursor:pointer">
//             Copy
//           </button>
//         </div>
//       </div>

//       <div style="margin-top:10px; font-size:11px; color:#b91c1c">
//         ⚠ Save these credentials. They will not be shown again.
//       </div>

//     </div>
//   `,
//   confirmButtonText: "Done",
//   confirmButtonColor: "#4f46e5",
//   didOpen: () => {
//     document.getElementById("copyId").onclick = () => {
//       navigator.clipboard.writeText(adminID);
//       Swal.showValidationMessage("Admin ID copied");
//     };

//     document.getElementById("copyPass").onclick = () => {
//       navigator.clipboard.writeText(password);
//       Swal.showValidationMessage("Password copied");
//     };
//   },
// });


//       // Reset form
//       setForm({
//         name: "",
//         email: "",
//         phone: "",
//         dateOfBirth: "",
//         gender: "",
//         designation: "",
//         department: "",
//         joiningDate: "",
//         isSuperAdmin: true,
//         address: {
//           street: "",
//           city: "",
//           state: "",
//           pincode: "",
//           country: "",
//         },
//       });
//     } else {
//       toast.error(res.message || "Admin registration failed");
//     }
//   } catch (err) {
//     Swal.fire({
//       icon: "error",
//       title: "Registration Failed",
//       text:
//         err.response?.data?.message ||
//         err.message ||
//         "Admin registration failed",
//     });
//   } finally {
//     setLoading(false);
//   }
// };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("email", form.email.trim().toLowerCase());
    formData.append("phone", form.phone.trim());
    formData.append("schoolId", school._id);
    formData.append("dateOfBirth", form.dateOfBirth || "");
    formData.append("gender", form.gender || "");
    formData.append("designation", form.designation || "");
    formData.append("department", form.department || "");
    formData.append("joiningDate", form.joiningDate || "");
    formData.append("isSuperAdmin", form.isSuperAdmin);
    formData.append("role", "admin");
    formData.append("isActive", true);
    formData.append("permissions", JSON.stringify([]));
    formData.append(
      "address",
      JSON.stringify({
        street: form.address.street,
        city: form.address.city,
        state: form.address.state,
        pincode: form.address.pincode,
        country: form.address.country,
      })
    );

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
        title: "Admin Registered",
        html: `<div>Admin ID: ${adminID}<br>Password: ${password}</div>`,
      });

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
        address: { street: "", city: "", state: "", pincode: "", country: "India" },
        profilePictureFile: null,
      });
    } else {
      toast.error(res.message || "Admin registration failed");
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Registration Failed",
      text: err.response?.data?.message || err.message || "Admin registration failed",
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
      

        <div className="mt-6">
          <h1 className="text-4xl  font-extrabold text-gray-900 tracking-tight">
            Register Admin
          </h1>
         
          <p className="text-slate-500 font-medium mt-2 text-sm">Add a new admin to the system</p>
        </div>
      </div>

      {/* ===== MAIN CARD ===== */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Admin Information
          </h2>

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
    <label className="text-sm font-medium text-gray-700">Date of Birth</label>
    <DatePicker
      selected={
        (() => {
          if (!form.dateOfBirth) return null;
          const [day, month, year] = form.dateOfBirth.split("/");
          if (!day || !month || !year) return null;
          const date = new Date(year, month - 1, day);
          return isNaN(date.getTime()) ? null : date;
        })()
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
      wrapperClassName="w-full"
      className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
    <label className="text-sm font-medium text-gray-700">Date of Joining</label>
    <DatePicker
      selected={
        (() => {
          if (!form.joiningDate) return null;
          const [day, month, year] = form.joiningDate.split("/");
          if (!day || !month || !year) return null;
          const date = new Date(year, month - 1, day);
          return isNaN(date.getTime()) ? null : date;
        })()
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
      wrapperClassName="w-full"
      className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
    />
  </div>

  <div className="md:col-span-2">
  <label className="text-sm font-medium mb-1">Profile Picture</label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => setForm({ ...form, profilePictureFile: e.target.files[0] })}
    className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500"
  />
</div>


  {/* ===== ADDRESS SECTION ===== */}
  <div className="md:col-span-2 mt-4">
    <h3 className="text-lg font-semibold text-gray-700 mb-3">
      Address Details
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50 p-5 rounded-xl ">
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

      <div>
        <label className="text-sm font-medium text-gray-700">State</label>
        <select
          name="state"
          value={form.address.state}
          onChange={handleAddressChange}
          className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Select State</option>
          {INDIAN_STATES.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </div>

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
          Register Admin
        </>
      )}
    </button>
  </div>
</form>


          
          
        </div>
      </div>
    </div>
  );
};

export default AdminRegisterForm;
