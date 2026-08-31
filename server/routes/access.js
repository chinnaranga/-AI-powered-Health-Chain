import express from 'express';
// Note: verify verifyAccess import from above controller edit
import { setAccessCode, verifyAccess, logAccess, getAccessLogs } from '../controllers/accessController.js';

const router = express.Router();

// Defined paths based on original server.js usage
router.post('/access-code', setAccessCode);
router.post('/verify-access', verifyAccess);
// New audit routes
router.post('/log', logAccess);
router.get('/history', getAccessLogs);

export default router;
