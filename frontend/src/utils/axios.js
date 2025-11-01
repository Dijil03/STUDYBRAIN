// utils/axios.js
import axios from "axios";

// Use environment variable for API URL, fallback to relative path or localhost
const getApiUrl = () => {
  // If VITE_API_URL is set, use it (for production with separate backend)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.endsWith('/api') 
      ? import.meta.env.VITE_API_URL 
      : `${import.meta.env.VITE_API_URL}/api`;
  }
  // In production without VITE_API_URL, use relative path (same origin)
  if (import.meta.env.PROD) {
    return "/api";
  }
  // Development: use localhost
  return "http://localhost:5001/api";
};

const baseURL = getApiUrl();

const api = axios.create({
  baseURL,
  withCredentials: true, // if you're using cookies/auth
});

// Add request interceptor for logging
api.interceptors.request.use(
  async (config) => {
    console.log('Making API request to:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;