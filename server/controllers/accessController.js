import db, { getDb, runDb, queryDb } from '../config/db.js';
import { writeAuditEvent } from '../services/auditLogger.js';

export const setAccessCode = async (req, res) => {
    const { code } = req.body;
    const requesterId = req.user?.uid || req.user?.userId || req.user?.id;

    try {
        if (!requesterId) {
            return res.status(401).json({
                success: false,
                code: 'AUTHENTICATION_REQUIRED',
                message: 'Authenticated patient is required.'
            });
        }

        if (typeof code !== 'string' || code.length < 6 || code.length > 128) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_ACCESS_CODE',
                message: 'Access code must contain between 6 and 128 characters.'
            });
        }

        const patient = await getDb(
            `SELECT id, user_id
             FROM patients
             WHERE user_id = ?
             LIMIT 1`,
            [requesterId]
        );

        if (!patient) {
            return res.status(403).json({
                success: false,
                code: 'PATIENT_PROFILE_REQUIRED',
                message: 'A registered patient profile is required.'
            });
        }

        await runDb(
            `UPDATE patients
             SET access_code = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [code, patient.id]
        );

        await writeAuditEvent({
            userId: requesterId,
            action: 'ACCESS_CODE_SET',
            resourceType: 'patient_access_code',
            resourceId: patient.id,
            status: 'SUCCESS'
        });

        return res.json({ success: true });
    } catch (err) {
        console.error('[Set Access Code Error]:', err);
        return res.status(500).json({
            success: false,
            message: 'Unable to update access code.'
        });
    }
};

export const verifyAccess = async (req, res) => {
    const { patientId, code } = req.body;
    const requesterId = req.user?.uid || req.user?.userId || req.user?.id;

    try {
        if (!requesterId) {
            return res.status(401).json({
                success: false,
                code: 'AUTHENTICATION_REQUIRED',
                message: 'Authentication is required.'
            });
        }

        if (typeof patientId !== 'string' || typeof code !== 'string') {
            return res.status(400).json({
                success: false,
                code: 'INVALID_ACCESS_REQUEST',
                message: 'Patient ID and access code are required.'
            });
        }

        const requester = await getDb(
            `SELECT id, role
             FROM users
             WHERE id = ?
             LIMIT 1`,
            [requesterId]
        );

        if (!requester) {
            return res.status(401).json({
                success: false,
                message: 'Authenticated user not found.'
            });
        }

        const patient = await getDb(
            `SELECT id, user_id, access_code
             FROM patients
             WHERE id::text = ? OR user_id::text = ?
             LIMIT 1`,
            [patientId, patientId]
        );

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found.'
            });
        }

        const isPatientOwner = patient.user_id === requester.id;
        const isPrivilegedRole = ['doctor', 'clinical', 'hospital_admin', 'admin', 'super_admin'].includes(requester.role);

        if (!isPatientOwner && !isPrivilegedRole) {
            return res.status(403).json({
                success: false,
                code: 'ACCESS_VERIFICATION_DENIED',
                message: 'You are not authorized to verify access for this patient.'
            });
        }

        if (!patient.access_code || patient.access_code !== code) {
            return res.json({ valid: false });
        }

        return res.json({ valid: true });
    } catch (err) {
        console.error('[Verify Access Error]:', err);
        return res.status(500).json({
            success: false,
            code: 'ACCESS_VERIFICATION_FAILED',
            message: 'Unable to verify access.'
        });
    }
};

export const logAccess = async (req, res) => {
    const { patientId, accessType } = req.body;
    const requesterId = req.user?.uid || req.user?.userId || req.user?.id;
    const requesterRole = req.user?.role || req.role;

    try {
        if (!requesterId) {
            return res.status(401).json({
                success: false,
                code: 'AUTHENTICATION_REQUIRED',
                message: 'Authentication is required.'
            });
        }

        if (!['doctor', 'clinical', 'hospital_admin', 'admin', 'super_admin'].includes(requesterRole)) {
            return res.status(403).json({
                success: false,
                code: 'ACCESS_LOGGING_DENIED',
                message: 'Only authorized clinical or administrative users may log patient access.'
            });
        }

        if (typeof patientId !== 'string' || !patientId.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Patient ID is required.'
            });
        }

        const patient = await getDb(
            `SELECT id
             FROM patients
             WHERE id::text = ? OR user_id::text = ?
             LIMIT 1`,
            [patientId, patientId]
        );

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found.'
            });
        }

        const auditLog = await writeAuditEvent({
            userId: requesterId,
            action: accessType || 'VIEW_RECORD',
            resourceType: 'medical_record',
            resourceId: patient.id,
            details: { patientId: patient.id, accessType: accessType || 'VIEW_RECORD' },
            status: 'SUCCESS'
        });

        return res.json({ success: true, id: auditLog.auditId });
    } catch (err) {
        console.error('[Log Access Error]:', err);
        return res.status(500).json({
            success: false,
            code: 'ACCESS_LOG_FAILED',
            message: 'Unable to record access event.'
        });
    }
};

export const getAccessLogs = async (req, res) => {
    const requesterId = req.user?.uid || req.user?.userId || req.user?.id;
    const requesterRole = req.user?.role || req.role;

    try {
        if (!requesterId) {
            return res.status(401).json({
                success: false,
                code: 'AUTHENTICATION_REQUIRED',
                message: 'Authentication is required.'
            });
        }

        if (!['hospital_admin', 'admin', 'super_admin'].includes(requesterRole)) {
            return res.status(403).json({
                success: false,
                code: 'AUDIT_LOG_ACCESS_DENIED',
                message: 'Only authorized administrators may access global access logs.'
            });
        }

        const rows = await queryDb(
            `SELECT id, actor_user_id, action, resource_id, details, timestamp
             FROM audit_logs
             ORDER BY timestamp DESC
             LIMIT 50`
        );

        const logs = rows.map(r => ({
            id: r.id,
            patientWallet: r.details?.patientWallet || r.details?.patientId || '',
            doctorWallet: r.details?.doctorWallet || r.actor_user_id || '',
            accessType: r.action,
            accessTime: r.timestamp
        }));

        return res.json(logs);
    } catch (err) {
        console.error('[Get Access Logs Error]:', err);
        return res.status(500).json({
            success: false,
            code: 'ACCESS_LOG_HISTORY_FAILED',
            message: 'Unable to retrieve access history.'
        });
    }
};

export default {
    setAccessCode,
    verifyAccess,
    logAccess,
    getAccessLogs
};
