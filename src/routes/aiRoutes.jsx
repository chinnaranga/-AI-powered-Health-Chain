import React, { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import AILayout from '../pages/ai/AILayout';

const AIChat = lazy(() => import('../pages/ai/AIChat'));
const AIMedicalSummaryPage = lazy(() => import('../pages/subpages/AIMedicalSummaryPage'));

export const aiRoutes = [
    <Route key="ai-root" path="/ai" element={<AILayout />}>
        <Route index element={<Navigate to="/ai/assistant" replace />} />
        <Route path="assistant" element={<AIChat />} />
        <Route path="chat" element={<AIChat />} />
        <Route path="medical-summary" element={<AIMedicalSummaryPage />} />
        <Route path="summary" element={<AIMedicalSummaryPage />} />
    </Route>
];

export default aiRoutes;
