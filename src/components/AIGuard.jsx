import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import LoadingOverlay from './LoadingOverlay';

export default function AIGuard({ allowedRoles, children }) {
  const { isAuthenticated, isLoading, role } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      setChecking(false);
      return;
    }

    if (role && allowedRoles.includes(role)) {
      setAuthorized(true);
    }
    setChecking(false);
  }, [isLoading, isAuthenticated, role, allowedRoles]);

  if (isLoading || checking) {
    return <LoadingOverlay message="Verifying secure copilot credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-white text-[#111111] flex flex-col items-center justify-center p-6 text-center">
        <div className="p-6 bg-red-50 border border-red-100 rounded-[12px] max-w-md space-y-3">
          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-sm font-bold">
            ⚠
          </div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#111111]">Access Denied</h4>
          <p className="text-xs text-[#666666] leading-relaxed">
            Access Denied. You do not have permission to perform this action.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
