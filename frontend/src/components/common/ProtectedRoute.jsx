import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute — guards routes by authentication state and user role.
 * Redirects unauthenticated users to /login; wrong-role users to their dashboard.
 */
const ProtectedRoute = ({ roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullScreen />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard
    const dashboards = { admin: '/admin', exhibitor: '/exhibitor', attendee: '/attendee' };
    return <Navigate to={dashboards[user.role] || '/'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
