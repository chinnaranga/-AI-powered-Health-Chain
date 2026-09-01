import express from 'express';
import db, { queryDb } from '../config/db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { writeAuditEvent } from '../services/auditLogger.js';

const router = express.Router();

// 1. POST /api/log - Write compliance audit log entry to Neon PostgreSQL
router.post('/log', authMiddleware, async (req, res) => {
    try {
        const { action, targetId, details, accessType } = req.body;
        const tenantId = req.hospitalId || 'default_hospital';
        const userId = req.user?.uid || req.user?.userId || 'anonymous';
        const role = req.role || req.user?.role || 'user';

        const logResult = await writeAuditEvent({
            userId,
            role,
            hospitalId: tenantId !== 'default_hospital' ? tenantId : null,
            action: action || accessType || 'ACCESS_LOG',
            resourceType: 'audit_event',
            resourceId: targetId || null,
            details: details || {},
            ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'HealthChain Client',
            status: 'SUCCESS'
        });

        res.json({ success: true, log: logResult });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. GET /api/log/history - Fetch audit log history from Neon PostgreSQL
router.get('/log/history', authMiddleware, async (req, res) => {
    try {
        const tenantId = req.hospitalId;
        let querySql = `SELECT id, actor_user_id as "userId", action, resource_type as "resourceType", 
                               resource_id as "targetId", hospital_id as "hospitalId", status, 
                               details, timestamp 
                        FROM audit_logs WHERE 1=1`;
        const params = [];

        if (req.role !== 'super_admin' && req.role !== 'admin' && tenantId && tenantId !== 'default_hospital') {
            querySql += ` AND (hospital_id = ? OR hospital_id IS NULL)`;
            params.push(tenantId);
        }

        querySql += ` ORDER BY timestamp DESC LIMIT 50`;

        const rows = await queryDb(querySql, params);

        const logs = rows.map(r => ({
            id: r.id,
            userId: r.userId,
            action: r.action,
            targetId: r.targetId,
            details: typeof r.details === 'string' ? JSON.parse(r.details) : (r.details || {}),
            hospitalId: r.hospitalId,
            status: r.status,
            timestamp: r.timestamp
        }));

        res.json({ success: true, logs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, logs: [] });
    }
});

export default router;
