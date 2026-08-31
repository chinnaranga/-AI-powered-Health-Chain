import AuditLog from '../models/AuditLog.js';

export const auditMiddleware = (actionType) => {
    return async (req, res, next) => {
        const originalSend = res.send;
        res.send = function (data) {
            res.send = originalSend;
            const resBody = data;
            
            // Async log entry creation (never blocks response)
            if (req.user) {
                try {
                    AuditLog.create({
                        userId: req.user.id,
                        role: req.user.role,
                        action: actionType || `${req.method} ${req.originalUrl}`,
                        ipAddress: req.ip || req.connection?.remoteAddress,
                        userAgent: req.headers['user-agent'],
                        status: res.statusCode < 400 ? 'SUCCESS' : 'FAILED',
                        hospitalId: req.user.hospitalId || null,
                        tenantId: req.tenantId || 'default'
                    }).catch(err => console.warn('[AuditLog] Async write warning:', err.message));
                } catch (e) {}
            }

            return res.send(data);
        };
        next();
    };
};
