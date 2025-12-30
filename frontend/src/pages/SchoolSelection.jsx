// src/pages/SchoolSelection.jsx
import { useState, useEffect } from "react";
import { FaSchool, FaSearch, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { toast } from "react-toastify";
import api from "../services/api";

const SchoolSelection = () => {
  const [schools, setSchools] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Fetch all registered schools
useEffect(() => {
    const fetchSchools = async () => {
      try {
        // api.get now returns the response body directly
        const response = await api.get(API_ENDPOINTS.SCHOOL.LIST);
        
        console.log("📥 Response:", response); 

        // Since api.js returns response.data, we just access .data from it
        // The structure is: { success: true, message: "...", data: [...] }
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

  // 2. Select School & Navigate to Login
  const handleSelectSchool = (school) => {
    localStorage.setItem("selectedSchool", JSON.stringify(school));
    navigate("/login");
  };

  // ✅ FIX 1: Use 'schoolName' (not 'name') and handle missing data safely
  const filteredSchools = schools.filter((s) =>
    s.schoolName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Select Your School
        </h1>
        <p className="text-center text-gray-500 mb-8 ">
          Choose your institution to login
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-8">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search school name..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* School Grid */}
        {loading ? (
          <div className="text-center py-10">Loading schools...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSchools.map((school) => (
              <div
                key={school._id}
                onClick={() => handleSelectSchool(school)}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all border border-transparent hover:border-indigo-500 group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-100 p-3 rounded-lg group-hover:bg-indigo-600 transition-colors">
                    <FaSchool className="text-indigo-600 group-hover:text-white text-xl" />
                  </div>
                  <div className="flex-1">
                    {/* ✅ FIX 2: Use 'schoolName' (CamelCase) */}
                    <h3 className="font-semibold text-lg text-gray-800">
                      {school.schoolName} 
                    </h3>
                    
                    {/* ✅ FIX 3: Render specific address fields, not the object */}
                    <p className="text-sm text-gray-500">
                      {school.address?.city || "Unknown City"}, {school.address?.state || ""}
                    </p>
                  </div>
                  <FaArrowRight className="text-gray-300 group-hover:text-indigo-600" />
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredSchools.length === 0 && !loading && (
          <p className="text-center text-gray-500 mt-8">No schools found.</p>
        )}
      </div>
    </div>
  );
};

export default SchoolSelection;
