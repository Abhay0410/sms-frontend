// src/services/api.js
import axios from "axios";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/* ──────────────────────────────────────────────────────────────
 * 🌐 Base URL Resolution
 * ────────────────────────────────────────────────────────────── */
function getBaseURL() {
  const env = import.meta.env.VITE_REACT_APP_ENV || "development";

  switch (env) {
    case "production":
      return import.meta.env.VITE_REACT_APP_API_PROD_URL;
    case "staging":
      return import.meta.env.VITE_REACT_APP_API_STAGE_URL;
    default:
      return import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";
  }
}

/* ──────────────────────────────────────────────────────────────
 * 🔐 Token Storage
 * ────────────────────────────────────────────────────────────── */
const TOKEN_KEY = import.meta.env.VITE_REACT_APP_AUTH_TOKEN_KEY || "token";

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

function writeToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    /* noop */
  }
}

/* ──────────────────────────────────────────────────────────────
 * ⚙️ Axios Instance
 * ────────────────────────────────────────────────────────────── */
const instance = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000,
  withCredentials: false, // Set to true if using cookies/sessions
});

console.log("🌐 API Base URL:", getBaseURL());

/* ──────────────────────────────────────────────────────────────
 * 📦 Request Interceptor
 * ────────────────────────────────────────────────────────────── */
instance.interceptors.request.use(
  (config) => {
    const token = readToken();
    
    // Only add token if it exists and header isn't already set
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Optional: Log only in development
    if (import.meta.env.DEV) {
      // console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

/* ──────────────────────────────────────────────────────────────
 * 🧨 Response Interceptor (CRITICAL FIX HERE)
 * ────────────────────────────────────────────────────────────── */
instance.interceptors.response.use(
  (response) => {
    // 1. Handle Blob/File downloads (Return raw response)
    if (response.config.responseType === 'blob') {
      return response;
    }

    // 2. Standardize Response Return
    // We want to return the whole data object { success: true, data: [...], message: "..." }
    // so the component can access .data, .message, etc.
    return response.data; 
  },
  async (error) => {
    const status = error?.response?.status ?? 0;
    const data = error?.response?.data;
    const message =
      data?.message ||
      error?.message ||
      "Something went wrong. Please try again.";

    // Debug Log
    if (import.meta.env.DEV) {
      console.error(`❌ API Error [${status}]:`, message);
    }

    // Handle 401 Unauthorized (Global Logout)
    if (status === 401) {
      window.dispatchEvent(new Event("api:unauthorized"));
    }

    return Promise.reject({
      status,
      message,
      data,
      raw: error,
    });
  }
);

/* ──────────────────────────────────────────────────────────────
 * 🛠️ API Helper Methods
 * ────────────────────────────────────────────────────────────── */

const api = {
  axios: instance,

  setToken: writeToken,
  clearToken: () => writeToken(null),

  setBaseURL: (url) => {
    instance.defaults.baseURL = url;
  },

  get: (url, config) => instance.get(url, config),
  delete: (url, config) => instance.delete(url, config),
  post: (url, body, config) => instance.post(url, body, config),
  put: (url, body, config) => instance.put(url, body, config),
  patch: (url, body, config) => instance.patch(url, body, config),

  // File Upload Helper
  upload: (url, formData, config = {}) =>
    instance.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      ...config,
    }),

  uploadPut: (url, formData, config = {}) =>
    instance.put(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      ...config,
    }),
};

export default api;
export { API_ENDPOINTS, getBaseURL };
