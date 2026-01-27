// src/components/DebugRouter.jsx
import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";

const DebugRouter = () => {
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    console.log("🔍 ROUTER DEBUG:");
    console.log("  Location:", location.pathname);
    console.log("  Params:", params);
    console.log("  School Slug:", params.schoolSlug);
    console.log("  Role:", params['*']?.split('/')[0]);
    console.log("  LocalStorage Token:", localStorage.getItem("token"));
    console.log("  LocalStorage School:", localStorage.getItem("selectedSchool"));
    
    // Check if we're on wrong path
    if (params.schoolSlug && location.pathname.includes('/admin/') && !location.pathname.includes(`/school/${params.schoolSlug}/`)) {
      console.error("❌ WRONG PATH! Should include school slug");
    }
  }, [location, params]);

  return null;
};

export default DebugRouter;

// Add to your App.jsx
<DebugRouter />