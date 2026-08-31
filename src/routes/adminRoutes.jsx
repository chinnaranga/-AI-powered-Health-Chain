import React, { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';

const AdminLogin = lazy(() => import('../pages/AdminLogin'));
const UserManagementPage = lazy(() => import('../pages/admin/UserManagementPage'));
const SystemHealthPage = lazy(() => import('../pages/admin/SystemHealthPage'));
const AuditExplorerPage = lazy(() => import('../pages/admin/AuditExplorerPage'));

export const adminRoutes = [
    <Route key="admin-login" path="/admin/login" element={<AdminLogin />} />,
    <Route key="admin-root" path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<UserManagementPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="system-health" element={<SystemHealthPage />} />
        <Route path="health" element={<SystemHealthPage />} />
        <Route path="audit-logs" element={<AuditExplorerPage />} />
        <Route path="audit" element={<AuditExplorerPage />} />
    </Route>,
    // Legacy Admin Route Redirect
    <Route key="legacy-admin" path="/dashboard/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
];

export default adminRoutes;
