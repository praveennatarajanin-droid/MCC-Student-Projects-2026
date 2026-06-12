import axios from 'axios';

// Use relative URL so Next.js proxy rewrites forward to the backend.
// This avoids CORS issues entirely in the browser.
// Server-side calls (SSR/RSC) can use NEXT_PUBLIC_API_URL directly.
const API_BASE =
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129'
    : ''; // relative → proxied by Next.js rewrites

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mcc_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
