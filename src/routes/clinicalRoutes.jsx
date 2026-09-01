import React, { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

const ClinicalDashboard = lazy(() => import('../pages/clinical/ClinicalDashboard'));
const ClinicalRequestPage = lazy(() => import('../pages/clinical/ClinicalRequestPage'));
const ClinicalViewer = lazy(() => import('../pages/clinical/ClinicalViewer'));
const ClinicalPatientProfile = lazy(() => import('../pages/clinical/ClinicalPatientProfile'));
const CreatePatient = lazy(() => import('../pages/clinical/CreatePatient'));
const ClinicalSettingsPage = lazy(() => import('../pages/clinical/ClinicalSettingsPage'));
const ClinicalLogsPage = lazy(() => import('../pages/clinical/ClinicalLogsPage'));
const ClinicalAnalyticsPage = lazy(() => import('../pages/clinical/ClinicalAnalyticsPage'));
const AIChat = lazy(() => import('../pages/ai/AIChat'));
const AIMedicalSummaryPage = lazy(() => import('../pages/subpages/AIMedicalSummaryPage'));

export const clinicalRoutes = [
    // Canonical Clinical Staff Route Group
    <Route key="clinical-root" path="/clinical" element={<DashboardLayout basePath="/clinical" />}>
        <Route index element={<Navigate to="/clinical/dashboard" replace />} />
        <Route path="dashboard" element={<ClinicalDashboard />} />
        <Route path="ai" element={<AIChat />} />
        <Route path="ai-assistant" element={<AIChat />} />
        <Route path="ai-summary" element={<AIMedicalSummaryPage />} />
        <Route path="requests" element={<ClinicalRequestPage />} />
        <Route path="viewer" element={<ClinicalViewer />} />
        <Route path="records" element={<ClinicalViewer />} />
        <Route path="patients" element={<ClinicalPatientProfile />} />
        <Route path="patients/create" element={<CreatePatient />} />
        <Route path="create-patient" element={<CreatePatient />} />
        <Route path="settings" element={<ClinicalSettingsPage />} />
        <Route path="logs" element={<ClinicalLogsPage />} />
        <Route path="analytics" element={<ClinicalAnalyticsPage />} />
    </Route>,
    // Legacy Clinical Route Redirect
    <Route key="legacy-clinical" path="/dashboard/clinical/*" element={<Navigate to="/clinical/dashboard" replace />} />
];

export default clinicalRoutes;
