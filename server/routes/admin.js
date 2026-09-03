import express from 'express';
import {
    getDoctorRequests,
    getAdminOverview,
    approveDoctorRequest,
    rejectDoctorRequest
} from '../controllers/adminController.js';
import { authenticateJwt } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin/overview', authenticateJwt, getAdminOverview);

// Doctor Admin Approval Endpoints
router.get('/admin/doctor-requests', authenticateJwt, getDoctorRequests);
router.post('/admin/doctor-requests/:id/approve', authenticateJwt, approveDoctorRequest);
router.post('/admin/doctor-requests/:id/reject', authenticateJwt, rejectDoctorRequest);

export default router;
