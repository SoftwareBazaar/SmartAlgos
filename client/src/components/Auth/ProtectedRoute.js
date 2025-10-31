import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getToken, getUser, isValidTokenFormat } from '../../utils/authStorage';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isCheckingCache, setIsCheckingCache] = useState(true);

  // Check localStorage cache on mount before redirecting
  useEffect(() => {
    const checkCache = () => {
      const cachedToken = getToken(requireAdmin ? 'admin' : 'user');
      const cachedUser = getUser();
      
      // If we have a valid cached token/user, wait a bit longer for auth context to hydrate
      if (cachedToken && cachedUser && isValidTokenFormat(cachedToken)) {
        // Give auth context time to hydrate (max 2 seconds)
        setTimeout(() => setIsCheckingCache(false), 2000);
      } else {
        // No cache, can check immediately
        setIsCheckingCache(false);
      }
    };

    checkCache();
  }, [requireAdmin]);

  // Show loading spinner while checking authentication OR while checking cache
  if (loading || isCheckingCache) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Only redirect if we've confirmed no user AND no cached token
  const cachedToken = getToken(requireAdmin ? 'admin' : 'user');
  const cachedUser = getUser();
  
  if (!user && (!cachedToken || !cachedUser || !isValidTokenFormat(cachedToken))) {
    if (requireAdmin) {
      return <Navigate to="/auth/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check admin requirement
  if (requireAdmin && user && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // For admin routes, ensure it's an admin session
  if (requireAdmin && user && !user.isAdminSession) {
    return <Navigate to="/auth/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;