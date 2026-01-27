// src/pages/SchoolSelection.jsx
import { useState, useEffect } from "react";
import { FaSchool, FaSearch, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { toast } from "react-toastify";
import api from "../services/api";

// Intro animation data
const introSlides = [
  {
    title: "Welcome to School Management System",
    subtitle: "Digital learning, simplified",
    image: "/images/intro-1.jpg", 
    bgClass: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
  },
  {
    title: "Your Complete School Portal",
    subtitle: "Admin • Teacher • Student • Parent",
    image: "/images/intro-2.jpg",
    bgClass: "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500"
  },
  {
    title: "Select Your School",
    subtitle: "Choose your institution to continue",
    image: "/images/intro-3.jpg",
    bgClass: "bg-gradient-to-br from-rose-500 via-orange-500 to-yellow-500"
  }
];

const SchoolSelection = ({ setSchool }) => {
  const [schools, setSchools] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Intro animation timer (2.5 seconds total)
  useEffect(() => {
    if (showIntro) {
      const timer = setTimeout(() => {
        setCurrentSlide(1);
      }, 2000);

      const nextTimer = setTimeout(() => {
        setCurrentSlide(2);
      }, 4000);

      const finalTimer = setTimeout(() => {
        setShowIntro(false);
      }, 5000);

      return () => {
        clearTimeout(timer);
        clearTimeout(nextTimer);
        clearTimeout(finalTimer);
      };
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
    // Store school in localStorage
    localStorage.setItem("selectedSchool", JSON.stringify(school));
    
    // ✅ Generate school slug
    const schoolSlug = school.slug || 
                      school.schoolName?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 
                      'default';
    
    // ✅ Redirect to school-specific login page
    navigate(`/school/${schoolSlug}/login`);
    
    // ✅ Optional: Update parent state if needed
    if (setSchool) {
      setSchool(school);
    }
  };

  const filteredSchools = schools.filter((s) =>
    s.schoolName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Intro Splash Screen
  if (showIntro) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 overflow-hidden relative">
        {/* Animated Background */}
        <div className={`absolute inset-0 ${introSlides[currentSlide].bgClass} opacity-90`}></div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/20 rounded-full animate-bounce delay-100"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-white/15 rounded-full animate-bounce delay-500"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center max-w-2xl mx-auto animate-fadeIn">
          {/* Image */}
          <div className="mb-8 mx-auto w-64 h-64 md:w-80 md:h-80 rounded-3xl shadow-2xl overflow-hidden bg-white/20 backdrop-blur-sm">
            <img 
              src={introSlides[currentSlide].image} 
              alt="School Management"
              className="w-full h-full object-cover animate-zoomIn"
            />
          </div>

          {/* Text */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-2xl animate-slideUp">
              {introSlides[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium drop-shadow-lg animate-slideUp delay-200">
              {introSlides[currentSlide].subtitle}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-12">
            <div className="w-64 h-2 bg-white/30 rounded-full mx-auto overflow-hidden">
              <div 
                className="h-full bg-white/70 rounded-full transition-all duration-700"
                style={{ width: `${(currentSlide + 1) * 33.33}%` }}
              ></div>
            </div>
          </div>

          {/* CTA */}
          <p className="mt-8 text-white/80 font-medium animate-pulse">
            Loading your schools... ✨
          </p>
        </div>
      </div>
    );
  }

  // Main School Selection Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-8">
      {/* Header with subtle intro reference */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent text-4xl font-black mb-4">
          📚 School Portal
        </div>
        <p className="text-lg text-slate-600">Select your institution to continue</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-8">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search school name..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* School Grid */}
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-slate-700">Loading schools...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchools.map((school) => (
              <div
                key={school._id}
                onClick={() => handleSelectSchool(school)}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-indigo-500 cursor-pointer hover:bg-gradient-to-br hover:from-indigo-50"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <FaSchool className="text-white text-2xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl text-gray-900 truncate mb-1 group-hover:text-indigo-700">
                      {school.schoolName}
                    </h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      📍 {school.address?.city}, {school.address?.state}
                    </p>
                  </div>
                  <FaArrowRight className="text-gray-400 group-hover:text-indigo-600 text-xl group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredSchools.length === 0 && !loading && (
          <div className="text-center py-16">
            <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-500 mb-2">No schools found</p>
            <p className="text-gray-400">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolSelection;
