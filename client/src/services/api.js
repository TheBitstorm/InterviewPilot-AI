// src/services/api.js
// Axios instance — the single HTTP client for the entire frontend.
// Automatically attaches JWT token to every request.
// Handles 401 responses by clearing auth and redirecting to login.

import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || '/api/v1';
const baseURL = rawBaseURL.replace(/\/+$/, '');

const api = axios.create({
  baseURL,
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
// 1. Auto-retry on 502/503/504 gateway timeout (e.g. Render free-tier cold spin-up timeout)
// 2. On 401: clear stored token and redirect to login, unless it's an auth endpoint
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const status = error.response?.status;

    // Retry once if gateway timeout/bad gateway occurs (Render cold start)
    if (config && (status === 502 || status === 503 || status === 504) && !config._retryCount) {
      config._retryCount = 1;
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return api(config);
    }

    const requestUrl = config?.url || '';
    const isAuthRoute = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
    if (status === 401 && !isAuthRoute) {
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
