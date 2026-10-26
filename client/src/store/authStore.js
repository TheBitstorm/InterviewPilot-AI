// src/store/authStore.js
// Zustand global auth state.
// Persists token and user to localStorage so auth survives page refresh.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const TOKEN_KEY = 'interviewpilot_token';
const USER_KEY = 'interviewpilot_user';

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        try {
          localStorage.setItem(TOKEN_KEY, token);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch { /* ignore */ }
        set({ token, user, isAuthenticated: true });
      },

      clearAuth: () => {
        try {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        } catch { /* ignore */ }
        set({ token: null, user: null, isAuthenticated: false });
      },

      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),
    }),
    {
      name: 'interviewpilot-auth',
      // Only persist these keys to localStorage
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
