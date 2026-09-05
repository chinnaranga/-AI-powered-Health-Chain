import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'healthchain-enterprise-jwt-secret-key-2026';

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
        const decodedToken = jwt.verify(token, JWT_SECRET);

        req.user = decodedToken;
        req.tenantId = decodedToken.tenantId || decodedToken.hospitalId || 'default_tenant';
        req.hospitalId = decodedToken.hospitalId || 'default_hospital';
        req.role = decodedToken.role || 'patient';

        next();
    } catch (error) {
        console.warn('[Auth] Invalid or expired JWT:', error.message);

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired authentication token.'
        });
    }
};

/**
 * Enforces that the authenticated user is an approved active doctor in Neon PostgreSQL
 */
export const requireApprovedDoctor = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    const userId = req.user.uid || req.user.userId;
    const userEmail = req.user.email;

    try {
        const { getDb } = await import('../config/db.js');
        const user = await getDb(
            `SELECT u.id, u.role, u.status, d.id as doctor_id 
             FROM users u 
             LEFT JOIN doctors d ON d.user_id = u.id 
             WHERE (u.id = ? OR u.email = ?) LIMIT 1`,
            [userId, userEmail]
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User account not found.'
            });
        }

        if (user.role !== 'doctor') {
            return res.status(403).json({
                success: false,
                code: 'ROLE_MISMATCH',
                message: `Access denied. Requires doctor role. Current role: ${user.role}`
            });
        }

        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                code: 'DOCTOR_APPROVAL_REQUIRED',
                status: user.status,
                message: user.status === 'pending'
                    ? 'Your doctor account is awaiting administrator approval.'
                    : 'Your doctor account registration has been rejected or suspended.'
            });
        }

        req.doctor = user;
        req.doctorId = user.doctor_id;
        next();
    } catch (err) {
        console.error('[requireApprovedDoctor error]:', err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const authenticateJwt = authMiddleware;
export default authMiddleware;
