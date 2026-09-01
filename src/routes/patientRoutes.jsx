import React, { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

const PatientDashboard = lazy(() => import('../pages/PatientDashboard'));
const RecordsPage = lazy(() => import('../pages/subpages/RecordsPage'));
const PatientRecordViewer = lazy(() => import('../pages/subpages/PatientRecordViewer'));
const ProfileIdentityPage = lazy(() => import('../pages/subpages/ProfileIdentityPage'));
const AppointmentSchedulingPage = lazy(() => import('../pages/subpages/AppointmentSchedulingPage'));
const PrescriptionManagementPage = lazy(() => import('../pages/subpages/PrescriptionManagementPage'));
const LabImagingResultsPage = lazy(() => import('../pages/subpages/LabImagingResultsPage'));
const SettingsPage = lazy(() => import('../pages/subpages/SettingsPage'));
const SecuritySettingsPage = lazy(() => import('../pages/subpages/SecuritySettingsPage'));
const AccessControlPage = lazy(() => import('../pages/subpages/AccessControlPage'));
const EmergencyProfilePage = lazy(() => import('../pages/subpages/EmergencyProfilePage'));
const LogsPage = lazy(() => import('../pages/subpages/LogsPage'));
const SecureMessagingPage = lazy(() => import('../pages/subpages/SecureMessagingPage'));
const ReferralHandoffPage = lazy(() => import('../pages/subpages/ReferralHandoffPage'));
const CarePlanFollowUpPage = lazy(() => import('../pages/subpages/CarePlanFollowUpPage'));
const MedicationAdherencePage = lazy(() => import('../pages/subpages/MedicationAdherencePage'));
const VaccinationImmunizationPage = lazy(() => import('../pages/subpages/VaccinationImmunizationPage'));
const VitalSignsTrendsPage = lazy(() => import('../pages/subpages/VitalSignsTrendsPage'));
const WearablesMonitoringPage = lazy(() => import('../pages/subpages/WearablesMonitoringPage'));
const SupportHelpCenterPage = lazy(() => import('../pages/subpages/SupportHelpCenterPage'));
const AIChat = lazy(() => import('../pages/ai/AIChat'));
const AIMedicalSummaryPage = lazy(() => import('../pages/subpages/AIMedicalSummaryPage'));

export const patientRoutes = [
    // Canonical Patient Route Group
    <Route key="patient-root" path="/patient" element={<DashboardLayout basePath="/patient" />}>
        <Route index element={<Navigate to="/patient/dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="profile" element={<ProfileIdentityPage />} />
        <Route path="records" element={<RecordsPage />} />
        <Route path="medical-records" element={<RecordsPage />} />
        <Route path="records/:id" element={<PatientRecordViewer />} />
        <Route path="appointments" element={<AppointmentSchedulingPage />} />
        <Route path="prescriptions" element={<PrescriptionManagementPage />} />
        <Route path="lab-reports" element={<LabImagingResultsPage defaultTab="lab" />} />
        <Route path="lab-results" element={<LabImagingResultsPage defaultTab="lab" />} />
        <Route path="ai-assistant" element={<AIChat />} />
        <Route path="ai" element={<AIChat />} />
        <Route path="ai-chat" element={<AIChat />} />
        <Route path="ai-summary" element={<AIMedicalSummaryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="security" element={<SecuritySettingsPage />} />
        <Route path="access-control" element={<AccessControlPage />} />
        <Route path="emergency-access" element={<EmergencyProfilePage />} />
        <Route path="blockchain-logs" element={<LogsPage />} />
        <Route path="messages" element={<SecureMessagingPage />} />
        <Route path="referrals" element={<ReferralHandoffPage />} />
        <Route path="care-plans" element={<CarePlanFollowUpPage />} />
        <Route path="medication-adherence" element={<MedicationAdherencePage />} />
        <Route path="vaccinations" element={<VaccinationImmunizationPage />} />
        <Route path="vital-signs" element={<VitalSignsTrendsPage />} />
        <Route path="wearables" element={<WearablesMonitoringPage />} />
        <Route path="support" element={<SupportHelpCenterPage />} />
    </Route>,
    // Legacy Route Redirect
    <Route key="legacy-patient" path="/dashboard/patient/*" element={<Navigate to="/patient/dashboard" replace />} />
];

export default patientRoutes;
