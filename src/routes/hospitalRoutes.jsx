import React, { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const HospitalLanding = lazy(() => import('../pages/hospital/HospitalLanding'));
const HospitalDashboard = lazy(() => import('../pages/hospital/HospitalDashboard'));
const HospitalOnboarding = lazy(() => import('../pages/hospital/HospitalOnboarding'));
const HospitalAuth = lazy(() => import('../pages/hospital/HospitalAuth'));

export const hospitalRoutes = [
    <Route key="hospital-root" path="/hospital" element={<><Navbar /><HospitalLanding /></>} />,
    <Route key="hospital-login" path="/hospital/login" element={<HospitalAuth mode="login" />} />,
    <Route key="hospital-register" path="/hospital/register" element={<HospitalAuth mode="register" />} />,
    <Route key="hospital-onboarding" path="/hospital/onboarding" element={<HospitalOnboarding />} />,
    <Route key="hospital-dashboard" path="/hospital/dashboard" element={<HospitalDashboard />} />,
    // Legacy Hospital Route Redirect
    <Route key="legacy-hospital" path="/dashboard/hospital/*" element={<Navigate to="/hospital/dashboard" replace />} />
];

export default hospitalRoutes;
