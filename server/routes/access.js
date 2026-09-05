import express from 'express';
import {
    setAccessCode,
    verifyAccess,
    logAccess,
    getAccessLogs
} from '../controllers/accessController.js';
import {
    createAccessRequest,
    getPatientAccessRequests,
    getAccessRequest,
    approveAccessRequest,
    rejectAccessRequest,
    verifyAccessRequestOTP,
    checkActiveAccessSession,
    revokeActiveAccessSession
} from '../controllers/accessRequestController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Existing access-code and audit routes
router.post('/access-code', authMiddleware, setAccessCode);
router.post('/verify-access', authMiddleware, verifyAccess);
router.post('/log', authMiddleware, logAccess);
router.get('/history', authMiddleware, getAccessLogs);

// Doctor → Patient access request workflow
router.post('/access-requests', authMiddleware, createAccessRequest);
router.get('/access-requests/patient', authMiddleware, getPatientAccessRequests);
router.get('/access-requests/:id', authMiddleware, getAccessRequest);
router.post('/access-requests/:id/approve', authMiddleware, approveAccessRequest);
router.post('/access-requests/:id/reject', authMiddleware, rejectAccessRequest);
router.post('/access-requests/:id/verify-otp', authMiddleware, verifyAccessRequestOTP);

// Active access sessions
router.get('/access-sessions/check', authMiddleware, checkActiveAccessSession);
router.post('/access-sessions/:id/revoke', authMiddleware, revokeActiveAccessSession);

export default router;
