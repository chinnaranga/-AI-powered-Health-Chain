import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import LoadingOverlay from './LoadingOverlay';

export default function AIDispatcher() {
  const { isAuthenticated, isLoading, role } = useAuthStore();
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      setRedirectTo('/login');
      return;
    }

    if (role === 'patient') setRedirectTo('/patient/ai');
    else if (role === 'doctor') setRedirectTo('/doctor/ai');
    else if (role === 'clinical') setRedirectTo('/clinical/ai');
    else if (role === 'hospital_admin' || role === 'admin') setRedirectTo('/hospital/ai');
    else setRedirectTo('/login');
  }, [isLoading, isAuthenticated, role]);

  if (isLoading || !redirectTo) {
    return <LoadingOverlay message="Resolving copilot workspace context..." />;
  }

  return <Navigate to={redirectTo} replace />;
}
