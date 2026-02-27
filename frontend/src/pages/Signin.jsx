// src/pages/Signin.jsx - FIXED VERSION
import { useState, useEffect } from "react";
import { FaChalkboardTeacher, FaUserGraduate, FaUsers, FaUserShield, FaArrowLeft, FaEye, FaEyeSlash, FaSchool } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const Signin = ({ setIsLoggedIn, setUserRole, setSchool }) => {
  const [school, setLocalSchool] = useState(null);
  const { schoolSlug } = useParams();
  const navigate = useNavigate();
  
  // State for form
  const [role, setRole] = useState("admin");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingSchool, setFetchingSchool] = useState(true);

  // 1. FETCH SCHOOL BY SLUG FROM URL OR LOCAL STORAGE
  useEffect(() => {
    const fetchSchoolBySlug = async () => {
      try {
        setFetchingSchool(true);
        
        // Try to get school from localStorage first (from SchoolSelection)
        const storedSchool = localStorage.getItem("selectedSchool");
        if (storedSchool) {
          try {
            const parsedSchool = JSON.parse(storedSchool);
            // Check if school slug matches
            const expectedSlug = parsedSchool.slug || 
                                parsedSchool.schoolName?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 
                                '';
            
            if (expectedSlug === schoolSlug) {
              setLocalSchool(parsedSchool);
              if (setSchool) setSchool(parsedSchool);
              setFetchingSchool(false);
              return;
            }
          } catch (e) {
            console.log("Could not parse stored school:", e);
          }
        }
        
        // If not in localStorage or slug mismatch, fetch from API
        const response = await api.get(`/api/schools/slug/${schoolSlug}`);
        if (response.data?.data) {
          const schoolData = response.data.data;
          setLocalSchool(schoolData);
          if (setSchool) setSchool(schoolData);
          localStorage.setItem("selectedSchool", JSON.stringify(schoolData));
        } else {
          toast.error("School not found");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching school:", error);
        
        // Try to get school from list API as fallback
        try {
          const schoolsResponse = await api.get(API_ENDPOINTS.SCHOOL.LIST);
          const schools = schoolsResponse.data?.data || [];
          const foundSchool = schools.find(s => {
            const schoolSlugFromName = s.schoolName?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return schoolSlugFromName === schoolSlug || s._id === schoolSlug;
          });
          
          if (foundSchool) {
            setLocalSchool(foundSchool);
            if (setSchool) setSchool(foundSchool);
            localStorage.setItem("selectedSchool", JSON.stringify(foundSchool));
          } else {
            toast.error("School not found. Please select a valid school.");
            navigate("/");
          }
        } catch {
          toast.error("Failed to load school information");
          navigate("/");
        }
      } finally {
        setFetchingSchool(false);
      }
    };

    if (schoolSlug) {
      fetchSchoolBySlug();
    } else {
      // If no slug in URL, redirect to school selection
      navigate("/");
    }
  }, [schoolSlug, navigate, setSchool]);

  // Roles Config
  const roleConfig = {
    admin: { name: "Admin", prefix: "ADM", icon: FaUserShield, color: "bg-purple-100 text-purple-600" },
    teacher: { name: "Teacher", prefix: "TCHR", icon: FaChalkboardTeacher, color: "bg-blue-100 text-blue-600" },
    student: { name: "Student", prefix: "STU", icon: FaUserGraduate, color: "bg-green-100 text-green-600" },
    parent: { name: "Parent", prefix: "PAR", icon: FaUsers, color: "bg-orange-100 text-orange-600" },
  };

  const currentRole = roleConfig[role];
  const Icon = currentRole.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!school) {
      toast.error("Please select a school first");
      return;
    }
    
    setLoading(true);

    try {
      // Endpoint logic
      const roleUpper = role.toUpperCase();
      const endpoint = API_ENDPOINTS[roleUpper]?.AUTH?.LOGIN;
      
      if (!endpoint) throw new Error("Login endpoint not defined");
      
      // ✅ Trim and validate inputs
      const cleanUserId = userId.trim();
      const cleanPassword = password.trim();

      if (!cleanUserId || !cleanPassword) {
        throw new Error("Please enter both User ID and Password");
      }

      const payload = {
        [`${role}ID`]: cleanUserId,
        password: cleanPassword,
        schoolId: school._id // ✅ CRITICAL: Send schoolId for multi-tenant auth
      };

      const res = await api.post(endpoint, payload);
      
      // Handle success
      const token = res.token || res.data?.token;
      const userData = res.data?.admin || res.data?.teacher || res.data?.student || res.data?.parent;
      
      if (token && userData) {
        // Save auth data
        api.setToken(token);
        localStorage.setItem("token", token);
        localStorage.setItem("userRole", role);
        localStorage.setItem("selectedSchool", JSON.stringify(school));
        
        // ✅ FIX: Admin data ko hamesha 'admin' key mein save karein 
        // taaki AdminRoutes.jsx isse access kar sake
        if (role === "admin") {
          localStorage.setItem("admin", JSON.stringify(userData));
        } else {
          localStorage.setItem(role, JSON.stringify(userData));
        }
        
        // Update state
        setIsLoggedIn(true);
        setUserRole(role);
        if (setSchool) setSchool(school);
        
        // ✅ Generate school slug for URL
        const schoolSlugForUrl = school.slug || 
                                school.schoolName?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 
                                'default';
        
        toast.success(`Welcome to ${school.schoolName}!`);
        
        // ✅ Redirect to school-specific dashboard
        navigate(`/school/${schoolSlugForUrl}/${role}/${role}-dashboard`);
      } else {
        throw new Error("Invalid response from server");
      }

    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Login failed. Please check credentials.";
      toast.error(errorMessage);
      
      // Specific handling for multi-tenant errors
      if (error.response?.data?.message?.includes("institution") || 
          error.response?.data?.message?.includes("school")) {
        toast.info("Make sure you're logging into the correct school");
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading while fetching school
  if (fetchingSchool) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading school information...</p>
          <p className="text-sm text-gray-500 mt-2">School slug: {schoolSlug}</p>
        </div>
      </div>
    );
  }

  // Show error if no school
  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-8 text-center">
          <FaSchool className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">School Not Found</h2>
          <p className="text-gray-600 mb-4">URL: /school/{schoolSlug}</p>
          <p className="text-gray-600 mb-6">The school you're trying to access doesn't exist or the URL is incorrect.</p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            ← Back to School Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        
        {/* HEADER WITH SCHOOL INFO */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center relative">
          {/* School Switcher */}
          <button 
            onClick={() => {
              localStorage.removeItem("selectedSchool");
              navigate("/");
            }}
            className="absolute left-6 top-6 text-white/90 hover:text-white flex items-center gap-2 text-sm font-medium bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full transition"
          >
            <FaArrowLeft /> Change School
          </button>
          
          {/* School Logo/Icon */}
          <div className="mt-8 mb-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto border-4 border-white/30">
              {school.logo ? (
                <img 
                  src={school.logo} 
                  alt={school.schoolName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <FaSchool className="text-4xl text-white" />
              )}
            </div>
          </div>
          
          {/* School Details */}
          <h1 className="text-3xl font-bold text-white mb-2">
            {school.schoolName || "School Login"}
          </h1>
          <div className="text-indigo-100 text-sm space-y-1">
            <p>{school.address?.street}, {school.address?.city}</p>
            <p>{school.address?.state}, {school.address?.pincode}</p>
          </div>
        </div>

        {/* LOGIN FORM */}
        <div className="p-8">
          {/* Role Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Select Your Role</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(roleConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRole(key)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      role === key 
                        ? `${config.color} border-current shadow-lg scale-105` 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="text-2xl mb-2" />
                    <span className="text-sm font-medium">{config.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User ID Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {currentRole.name} ID
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder={`Enter your ${currentRole.prefix} ID`}
                  required
                />
                <div className="absolute right-3 top-3 bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-600">
                  {currentRole.prefix}
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition"
                >
                  {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              disabled={loading || !school}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                loading || !school
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              } text-white`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in to {school.schoolName}...
                </span>
              ) : (
                `Login as ${currentRole.name}`
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
            <p className="font-bold text-indigo-700 mb-2 text-sm">Demo Credentials:</p>
            <div className="text-xs text-indigo-600 space-y-1">
              <p><span className="font-medium">Admin:</span> ADM001 / Admin@123</p>
              <p><span className="font-medium">Teacher:</span> TCHR250001 / Teacher@123</p>
              <p><span className="font-medium">Student:</span> STU250001 / Student@123</p>
              <p><span className="font-medium">Parent:</span> PAR250001 / Parent@123</p>
            </div>
            <p className="text-xs text-indigo-500 mt-2">
              ⚠️ These work only for <span className="font-bold">{school.schoolName}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;