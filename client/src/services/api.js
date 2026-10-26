// src/services/api.js
// Axios instance — the single HTTP client for the entire frontend.
// Automatically attaches JWT token to every request.
// Handles 401 responses by clearing auth and redirecting to login.

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s — AI question generation can take longer under peak load
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  let token = localStorage.getItem('interviewpilot_token');
  if (!token) {
    try {
      const persisted = JSON.parse(localStorage.getItem('interviewpilot-auth') || '{}');
      token = persisted?.state?.token;
    } catch {
      /* ignore parse error */
    }
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
// On 401: clear stored token and redirect to login, unless it's an auth endpoint
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isAuthRoute = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('interviewpilot_token');
      localStorage.removeItem('interviewpilot_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
