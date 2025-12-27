// src/hooks/useLogout.js
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";

export default function useLogout() {
  const navigate = useNavigate();

  const logout = () => {
    console.log("🚪 Logging out...");
    
    // Clear storage
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    // NOTE: We DO NOT remove "selectedSchool" so they can easily log back in
    
    // Clear API token
    api.clearToken();
    
    // Dispatch custom event to notify App.jsx
    window.dispatchEvent(new Event("user:logout"));
    
    toast.info("Logged out successfully");

    // ✅ Navigate to Home (School Selection) or Login
    navigate("/", { replace: true });
  };

  return logout;
}
