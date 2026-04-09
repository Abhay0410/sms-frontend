// // src/components/ScrollToTop/ScrollToTop.jsx
// import { useEffect } from "react";
// import { useLocation } from "react-router-dom";

// export default function ScrollToTop() {
//   const { pathname, search, hash } = useLocation(); // listen to all changes

//   useEffect(() => {
//     // Only scroll if there is no hash (for anchor links)
//     if (!hash) {
//       window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
//     }
//   }, [pathname, search, hash]);

//   return null;
// }

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const container = document.getElementById("main-content");
    if (container) {
      container.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}