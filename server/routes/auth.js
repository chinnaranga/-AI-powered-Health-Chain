import express from 'express';
import { googleLogin, registerUser, loginUser, refreshToken, getMe, logoutUser } from '../controllers/authController.js';
import { authenticateJwt } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/auth/google', googleLogin);
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.post('/auth/refresh', refreshToken);
router.get('/auth/me', authenticateJwt, getMe);
router.get('/auth/session', authenticateJwt, getMe);
router.post('/auth/logout', logoutUser);

export default router;
