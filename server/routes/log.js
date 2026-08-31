import express from 'express';
import { adminDb } from '../config/firebaseAdmin.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Write audit log entry to Firestore
router.post('/log', authMiddleware, async (req, res) => {
    try {
        const { action, targetId, details, accessType } = req.body;
        const tenantId = req.hospitalId || 'default_tenant';

        const logEntry = {
            userId: req.user.uid,
            role: req.role || 'user',
            action: action || accessType || 'ACCESS_LOG',
            targetId: targetId || null,
            details: details || {},
            hospitalId: tenantId,
            tenantId,
            timestamp: new Date().toISOString(),
            status: 'SUCCESS'
        };

        await adminDb.collection('auditLogs').add(logEntry);
        res.json({ success: true, log: logEntry });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET audit log history for tenant
router.get('/log/history', authMiddleware, async (req, res) => {
    try {
        const tenantId = req.hospitalId || 'default_tenant';
        let queryRef = adminDb.collection('auditLogs');

        if (req.role !== 'super_admin') {
            queryRef = queryRef.where('hospitalId', '==', tenantId);
        }

        const snapshot = await queryRef.limit(50).get();
        if (snapshot.empty) {
            return res.json({ success: true, logs: [] });
        }

        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ success: true, logs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, logs: [] });
    }
});

export default router;
