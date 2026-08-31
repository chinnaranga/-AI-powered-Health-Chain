import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import publicRoutes from './publicRoutes';
import patientRoutes from './patientRoutes';
import doctorRoutes from './doctorRoutes';
import clinicalRoutes from './clinicalRoutes';
import hospitalRoutes from './hospitalRoutes';
import adminRoutes from './adminRoutes';
import aiRoutes from './aiRoutes';

/**
 * HealthChain Enterprise Route Registry
 * Aggregates modular domain routes into a single high-performance router.
 */

export const AppRoutes = () => {
    return (
        <Routes>
            {publicRoutes}
            {patientRoutes}
            {doctorRoutes}
            {clinicalRoutes}
            {hospitalRoutes}
            {adminRoutes}
            {aiRoutes}
            {/* Wildcard Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
