import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
