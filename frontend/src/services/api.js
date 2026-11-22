import axios from 'axios';

/**
 * Centralised Axios instance.
 * All requests are prefixed with /api — Vite proxy forwards to :5000.
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach stored token on each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('es_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Normalise error messages for toast display
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.response?.data?.errors?.[0]?.msg ||
      err.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
