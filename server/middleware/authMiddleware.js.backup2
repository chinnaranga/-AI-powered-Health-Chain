import { adminAuth } from '../config/firebaseAdmin.js';

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.hc_token) {
        token = req.cookies.hc_token;
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. JWT session token missing.'
        });
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        req.user = decodedToken;
        req.tenantId = decodedToken.tenantId || decodedToken.hospitalId || 'default_tenant';
        req.hospitalId = decodedToken.hospitalId || 'default_hospital';
        req.role = decodedToken.role || 'patient';
        next();
    } catch (error) {
        console.warn('[Auth] Invalid or expired token:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired authentication token.'
        });
    }
};

export const authenticateJwt = authMiddleware;
export default authMiddleware;
