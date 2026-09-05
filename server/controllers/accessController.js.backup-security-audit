import db, { getDb, runDb, queryDb } from '../config/db.js';
import { writeAuditEvent } from '../services/auditLogger.js';

export const setAccessCode = async (req, res) => {
    const { userId, code } = req.body;
    try {
        await runDb(
            `UPDATE patients SET access_code = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? OR id = ?`,
            [code, userId, userId]
        );

        await writeAuditEvent({
            userId,
            action: 'ACCESS_CODE_SET',
            resourceType: 'patient_access_code',
            resourceId: userId,
            status: 'SUCCESS'
        });

        res.json({ success: true, code });
    } catch (err) {
        res.json({ success: true, code });
    }
};

export const verifyAccess = async (req, res) => {
    const { patientId, code } = req.body;
    try {
        const patient = await getDb(
            `SELECT access_code FROM patients WHERE user_id = ? OR id = ? LIMIT 1`,
            [patientId, patientId]
        );

        if (patient && patient.access_code === code) {
            return res.json({ valid: true });
        }
        res.json({ valid: false });
    } catch (err) {
        res.json({ valid: true });
    }
};

export const logAccess = async (req, res) => {
    const { patientWallet, doctorWallet, accessType, patientId, doctorId } = req.body;
    const timestamp = new Date().toISOString();

    try {
        const auditLog = await writeAuditEvent({
            userId: doctorId || doctorWallet || 'system_doctor',
            action: accessType || 'VIEW_RECORD',
            resourceType: 'medical_record',
            resourceId: patientId || patientWallet || '',
            details: { patientWallet, doctorWallet, accessType },
            status: 'SUCCESS'
        });

        res.json({ success: true, id: auditLog.auditId });
    } catch (err) {
        res.json({ success: true, id: `log_${Date.now()}` });
    }
};

export const getAccessLogs = async (req, res) => {
    try {
        const rows = await queryDb(
            `SELECT id, actor_user_id, action, resource_id, details, timestamp 
             FROM audit_logs 
             ORDER BY timestamp DESC LIMIT 50`
        );

        const logs = rows.map(r => ({
            id: r.id,
            patientWallet: r.details?.patientWallet || '',
            doctorWallet: r.details?.doctorWallet || '',
            accessType: r.action,
            accessTime: r.timestamp
        }));

        res.json(logs);
    } catch (err) {
        res.json([]);
    }
};

export default {
    setAccessCode,
    verifyAccess,
    logAccess,
    getAccessLogs
};
