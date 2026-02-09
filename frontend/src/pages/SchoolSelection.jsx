// src/pages/SchoolSelection.jsx
import { useState, useEffect } from "react";
import { FaSchool, FaSearch, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { toast } from "react-toastify";
import api from "../services/api";

const SchoolSelection = ({ setSchool }) => {
  const [schools, setSchools] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const navigate = useNavigate();

  // Auto-redirect if school is already selected
  useEffect(() => {
    const storedSchool = localStorage.getItem("selectedSchool");
    if (storedSchool) {
      try {
        const school = JSON.parse(storedSchool);
        const schoolSlug = school.slug || 
                          school.schoolName?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 
                          'default';
        
        if (setSchool) setSchool(school);
        navigate(`/school/${schoolSlug}/login`, { replace: true });
      } catch (e) {
        console.error("Error parsing stored school:", e);
        localStorage.removeItem("selectedSchool");
      }
    }
  }, [navigate, setSchool]);

  // Intro timer - 2 seconds only
  useEffect(() => {
    if (showIntro) {
      const timer = setTimeout(() => {
        setShowIntro(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  // Fetch schools
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.SCHOOL.LIST);
        setSchools(response.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load schools");
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, []);

  const handleSelectSchool = (school) => {
    localStorage.setItem("selectedSchool", JSON.stringify(school));
    
    const schoolSlug = school.slug || 
                      school.schoolName?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 
                      'default';
    
    navigate(`/school/${schoolSlug}/login`);
    
    if (setSchool) {
      setSchool(school);
    }
  };

  const filteredSchools = schools.filter((s) =>
    s.schoolName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Quick Intro Splash
  if (showIntro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="text-center animate-fadeIn">
          <div className="mb-8">
            <div className="w-40 h-40 mx-auto bg-white/10 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center border-4 border-white/20 shadow-2xl">
              <svg width="80" height="80" viewBox="0 0 24 24" className="text-white drop-shadow-lg">
                <path fill="currentColor" d="M12 3l7 6v12h-4V13H9v8H5V9l7-6z" />
                <rect x="8" y="11" width="8" height="6" rx="1" fill="currentColor" opacity="0.8" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-6xl font-black text-white mb-4 tracking-tight drop-shadow-md">
            SchoolPortal
          </h1>
          <p className="text-2xl text-blue-100 font-medium tracking-wide">
            Your Digital Campus
          </p>
          
          <div className="mt-12">
            <div className="inline-block w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white animate-progress"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main School Selection Screen
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo Left */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-xl shadow-lg">
                <svg width="32" height="32" viewBox="0 0 24 24" className="text-white">
                  <path fill="currentColor" d="M12 3l7 6v12h-4V13H9v8H5V9l7-6z" />
                  <rect x="8" y="11" width="8" height="6" rx="1" fill="currentColor" opacity="0.8" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-none">
                  SchoolPortal
                </h1>
                <p className="text-sm text-gray-600 font-medium leading-none">
                  by ZAGER DIGITAL SERVICES
                </p>
              </div>
            </div>
            
            {/* Right info */}
            <div className="text-sm text-gray-500">
              {schools.length} schools available
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="relative max-w-lg mx-auto">
          <FaSearch className="absolute left-4 top-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by school name, city or state..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 pb-12">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Loading schools...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchools.map((school, index) => (
              <div
                key={school._id}
                onClick={() => handleSelectSchool(school)}
                className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <FaSchool className="text-white text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition">
                        {school.schoolName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        📍 {school.address?.city}, {school.address?.state}
                      </p>
                    </div>
                    <FaArrowRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all mt-1" />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                    <span>🏫 {school.affiliation || "CBSE"}</span>
                    <span>👥 {school.studentCount || "500+"} Students</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredSchools.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <FaSearch className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No schools found</h3>
            <p className="text-gray-500">Try searching with different keywords</p>
            <button 
              onClick={() => setSearchTerm("")}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolSelection;