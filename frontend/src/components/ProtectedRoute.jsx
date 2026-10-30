import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getMe } from '../api/client';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const user = await getMe();
        localStorage.setItem('userId', user.user_id);
        setIsAuthenticated(true);
        setIsOnboarded(user.profile.onboarded === true || user.profile.onboarded === 'True');
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    fetchUser();
  }, []);

  if (isAuthenticated === null) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (isAuthenticated && isOnboarded === false && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;
