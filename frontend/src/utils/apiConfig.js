// API Configuration utility
// Centralized place for API base URL

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL;
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  if (import.meta.env.PROD) {
    return "/api";
  }
  return "http://localhost:5001/api";
};

export const getBackendUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL;
    return url.endsWith('/api') ? url.replace('/api', '') : url;
  }
  if (import.meta.env.PROD) {
    // If no VITE_API_URL in production, we can't determine backend URL
    console.warn('VITE_API_URL not set - API calls may fail');
    return '';
  }
  return "http://localhost:5001";
};

export const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  return getBackendUrl();
};

