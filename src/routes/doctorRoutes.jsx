import React, { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

const DoctorDashboard = lazy(() => import('../pages/DoctorDashboard'));
const DoctorRecordsPage = lazy(() => import('../pages/subpages/DoctorRecordsPage'));
const ClinicalRecordViewer = lazy(() => import('../pages/subpages/ClinicalRecordViewer'));
const DoctorAccessControlPage = lazy(() => import('../pages/subpages/DoctorAccessControlPage'));
const DoctorPatientAccessPage = lazy(() => import('../pages/subpages/DoctorPatientAccessPage'));
const DoctorLogsPage = lazy(() => import('../pages/subpages/DoctorLogsPage'));
const DoctorAnalyticsPage = lazy(() => import('../pages/subpages/DoctorAnalyticsPage'));
const DoctorSettingsPage = lazy(() => import('../pages/subpages/DoctorSettingsPage'));
const DoctorOnboarding = lazy(() => import('../pages/DoctorOnboarding'));
const ProfileIdentityPage = lazy(() => import('../pages/subpages/ProfileIdentityPage'));
const SecuritySettingsPage = lazy(() => import('../pages/subpages/SecuritySettingsPage'));

export const doctorRoutes = [
    // Canonical Doctor Route Group
    <Route key="doctor-root" path="/doctor" element={<DashboardLayout basePath="/doctor" />}>
        <Route index element={<Navigate to="/doctor/dashboard" replace />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="profile" element={<ProfileIdentityPage />} />
        <Route path="patient-records" element={<DoctorRecordsPage />} />
        <Route path="records" element={<DoctorRecordsPage />} />
        <Route path="record-viewer" element={<ClinicalRecordViewer />} />
        <Route path="record-viewer/:id" element={<ClinicalRecordViewer />} />
        <Route path="viewer" element={<ClinicalRecordViewer />} />
        <Route path="viewer/:id" element={<ClinicalRecordViewer />} />
        <Route path="onboarding" element={<DoctorOnboarding />} />
        <Route path="security" element={<SecuritySettingsPage />} />
        <Route path="access-requests" element={<DoctorAccessControlPage />} />
        <Route path="access" element={<DoctorAccessControlPage />} />
        <Route path="secure-access" element={<DoctorPatientAccessPage />} />
        <Route path="patient-access" element={<DoctorPatientAccessPage />} />
        <Route path="audit-trail" element={<DoctorLogsPage />} />
        <Route path="logs" element={<DoctorLogsPage />} />
        <Route path="analytics" element={<DoctorAnalyticsPage />} />
        <Route path="settings" element={<DoctorSettingsPage />} />
    </Route>,
    // Legacy Doctor Route Redirect
    <Route key="legacy-doctor" path="/dashboard/doctor/*" element={<Navigate to="/doctor/dashboard" replace />} />
];

export default doctorRoutes;
