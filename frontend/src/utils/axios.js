// utils/axios.js
import axios from "axios";

// Use relative path in production (same origin), localhost in development
const baseURL = import.meta.env.PROD ? "/api" : "http://localhost:5001/api";

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