import React, { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';

const AdminLogin = lazy(() => import('../pages/AdminLogin'));
const AdminOverview = lazy(() => import('../pages/admin/Overview.jsx'));
const UserManagementPage = lazy(() => import('../pages/admin/UserManagementPage'));
const SystemHealthPage = lazy(() => import('../pages/admin/SystemHealthPage'));
const NetworkStats = lazy(() => import('../pages/admin/NetworkStats'));
const AccessControl = lazy(() => import('../pages/admin/AccessControl'));
const Records = lazy(() => import('../pages/admin/Records'));
const ApiLogs = lazy(() => import('../pages/admin/ApiLogs'));
const AuditExplorerPage = lazy(() => import('../pages/admin/AuditExplorerPage'));
const IncidentManagementPage = lazy(() => import('../pages/admin/IncidentManagementPage'));
const IntegrationsCenterPage = lazy(() => import('../pages/admin/IntegrationsCenterPage'));
const Transactions = lazy(() => import('../pages/admin/Transactions'));
const CareersAdmin = lazy(() => import('../pages/admin/CareersAdmin'));

export const adminRoutes = [
    <Route key="admin-login" path="/admin/login" element={<AdminLogin />} />,

    <Route key="admin-root" path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />

        {/* System Control */}
        <Route path="dashboard" element={<AdminOverview />} />
        <Route path="doctor-requests" element={<UserManagementPage defaultTab="doctor-requests" />} />
        <Route path="user-management" element={<UserManagementPage defaultTab="users" />} />
        <Route path="users" element={<UserManagementPage defaultTab="users" />} />
        <Route path="health" element={<SystemHealthPage />} />
        <Route path="system-health" element={<SystemHealthPage />} />

        {/* Blockchain & Security */}
        <Route path="network" element={<NetworkStats />} />
        <Route path="access" element={<AccessControl />} />
        <Route path="records" element={<Records />} />
        <Route path="logs" element={<ApiLogs />} />
        <Route path="audit-explorer" element={<AuditExplorerPage />} />
        <Route path="audit-logs" element={<AuditExplorerPage />} />
        <Route path="audit" element={<AuditExplorerPage />} />

        {/* Operations & Compliance */}
        <Route path="incidents" element={<IncidentManagementPage />} />
        <Route path="integrations" element={<IntegrationsCenterPage />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="jobs" element={<CareersAdmin />} />

        {/* Sections without dedicated pages yet */}
        <Route path="compliance" element={<AuditExplorerPage />} />
        <Route path="analytics" element={<AdminOverview />} />
        <Route path="settings" element={<SystemHealthPage />} />
    </Route>,

    // Legacy Admin Route Redirect
    <Route
        key="legacy-admin"
        path="/dashboard/admin/*"
        element={<Navigate to="/admin/dashboard" replace />}
    />
];

export default adminRoutes;
