// src/routes/ProtectedRoute.jsx
// Wraps any route that requires authentication.
// Redirects unauthenticated users to /login, preserving intended destination.

import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Pass the current path so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
