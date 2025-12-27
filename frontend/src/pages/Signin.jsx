// src/pages/Signin.jsx
import { useState, useEffect } from "react";
import { FaChalkboardTeacher, FaUserGraduate, FaUsers, FaUserShield, FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { Link } from "react-router-dom";

const Signin = ({ setIsLoggedIn, setUserRole }) => {
  const [school, setSchool] = useState(null);
  const navigate = useNavigate();
  
  // State for form
  const [role, setRole] = useState("admin");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. LOAD SCHOOL ON MOUNT
  useEffect(() => {
    const stored = localStorage.getItem("selectedSchool");
    if (!stored) {
      toast.error("Please select a school first");
      navigate("/"); // Redirect back if no school selected
      return;
    }
    try {
      setSchool(JSON.parse(stored));
    } catch  {
      localStorage.removeItem("selectedSchool");
      navigate("/");
    }
  }, [navigate]);

   

  // Roles Config
  const roleConfig = {
    admin: { name: "Admin", prefix: "ADM", icon: FaUserShield },
    teacher: { name: "Teacher", prefix: "TCHR", icon: FaChalkboardTeacher },
    student: { name: "Student", prefix: "STU", icon: FaUserGraduate },
    parent: { name: "Parent", prefix: "PAR", icon: FaUsers },
  };

  const currentRole = roleConfig[role];
  const Icon = currentRole.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Endpoint logic
      const roleUpper = role.toUpperCase();
      // Safety check for endpoint
      const endpoint = API_ENDPOINTS[roleUpper]?.AUTH?.LOGIN;
      
      if (!endpoint) throw new Error("Login endpoint not defined");
      
      // ✅ FIX: Trim whitespace from inputs
      const cleanUserId = userId.trim();
      const cleanPassword = password.trim();

      const payload = {
        [`${role}ID`]: cleanUserId, // e.g., adminID: "..."
        password:cleanPassword,
        schoolId: school._id // ✅ SEND SCHOOL ID
      };

      const res = await api.post(endpoint, payload);
      
      // Handle success
      const token = res.token || res.data?.token;
      if (token) {
        api.setToken(token);
        localStorage.setItem("userRole", role);
        setIsLoggedIn(true);
        setUserRole(role);
        toast.success(`Welcome back!`);
        navigate(`/${role}/${role}-dashboard`);
      }

    } catch (error) {
      console.error(error);
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ PREVENT RENDER IF NO SCHOOL (Fixes the white screen)
  if (!school) return null; 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-indigo-600 p-6 text-center relative">
          <button 
            onClick={() => {
              localStorage.removeItem("selectedSchool");
              navigate("/");
            }}
            className="absolute left-4 top-4 text-white/80 hover:text-white flex items-center gap-1 text-sm"
          >
            <FaArrowLeft /> Switch School
          </button>
          
          {/* ✅ SAFE RENDERING */}
          <h2 className="text-2xl font-bold text-white mt-4">
            {school.schoolName || "School Login"}
          </h2>
          <p className="text-indigo-100 text-sm">
            {school.address?.city}, {school.address?.state}
          </p>
        </div>

        {/* FORM */}
        <div className="p-8">
           <div className="flex justify-center mb-6">
             <div className="bg-indigo-50 p-4 rounded-full">
               <Icon className="text-indigo-600 text-3xl" />
             </div>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">

             <div>
               <label className="block text-sm font-medium text-gray-700">Role</label>
               <select 
                 value={role} 
                 onChange={(e) => setRole(e.target.value)}
                 className="w-full mt-1 p-2 border rounded-md"
               >
                 {Object.entries(roleConfig).map(([key, val]) => (
                   <option key={key} value={key}>{val.name}</option>
                 ))}
               </select>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700">User ID</label>
               <input 
                 type="text" 
                 value={userId}
                 onChange={(e) => setUserId(e.target.value)}
                 className="w-full mt-1 p-2 border rounded-md"
                 placeholder={`${currentRole.prefix}...`}
                 required
               />
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md pr-10"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400"
                  >
                    {showPassword ? <FaEyeSlash/> : <FaEye/>}
                  </button>
                </div>
             </div>

             <button 
               type="submit" 
               disabled={loading}
               className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
             >
               {loading ? "Logging in..." : "Login"}
             </button>
           </form>
           
           {/* Test Credentials Helper */}
           <div className="mt-6 p-3 bg-gray-50 text-xs text-gray-500 rounded border">
             <p className="font-bold mb-1">Demo Credentials:</p>
             <p>Admin ID: ADMO11</p>
             <p>Pass: Admin@123</p><br/>

             <p>Teacher ID: TCHR250001</p>
             <p>Pass: Teacher@2025</p><br/>

             <p>Student ID: STU250001</p>
             <p>Pass: Student@0001</p><br/>

             <p>Parent ID: PAR250001</p>
             <p>Pass: Parent@0001</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
