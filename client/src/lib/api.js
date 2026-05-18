import axios from 'axios';

// In dev: VITE_API_URL is unset, so baseURL is just '/api' and the Vite proxy
// forwards it to the local backend. In production: VITE_API_URL is set at build
// time (e.g. https://collably-api.onrender.com) and we hit it directly.
const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

// attach token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('icp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// surface server errors with a useful message
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err.response?.data?.message || err.message;
    err.displayMessage = msg;
    return Promise.reject(err);
  }
);

export default api;
