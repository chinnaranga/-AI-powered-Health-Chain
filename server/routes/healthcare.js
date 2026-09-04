import express from 'express';
import db, { queryDb, getDb, runDb } from '../config/db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { writeAuditEvent } from '../services/auditLogger.js';
import { realtimeService } from '../services/realtimeService.js';

const router = express.Router();

// ====================================================================
// APPOINTMENTS
// ====================================================================

// 1. GET /api/appointments - Fetch appointments for patient or doctor
router.get('/appointments', authMiddleware, async (req, res) => {
    try {
        const { patientId, doctorId, hospitalId, status } = req.query;
        const requesterRole = req.role || req.user?.role;
        const requesterId = req.user?.uid || req.user?.userId;

        let sql = `SELECT * FROM appointments WHERE 1=1`;
        const params = [];

        if (requesterRole === 'patient') {
            sql += ` AND patient_id = ?`;
            params.push(requesterId);
        } else if (requesterRole === 'doctor') {
            sql += ` AND doctor_id = ?`;
            params.push(doctorId || requesterId);
        } else if (patientId) {
            sql += ` AND patient_id = ?`;
            params.push(patientId);
        }

        if (hospitalId && hospitalId !== 'all') {
            sql += ` AND hospital_id = ?`;
            params.push(hospitalId);
        }

        if (status) {
            sql += ` AND status = ?`;
            params.push(status);
        }

        sql += ` ORDER BY scheduled_at ASC LIMIT 100`;

        const rows = await queryDb(sql, params);
        res.json({ success: true, appointments: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, appointments: [] });
    }
});

// 2. POST /api/appointments - Schedule a new appointment
router.post('/appointments', authMiddleware, async (req, res) => {
    try {
        const { patientId, doctorId, hospitalId, scheduledAt, timeSlot, type, notes, patientName, doctorName } = req.body;

        const effectivePatientId = patientId || req.user?.uid;
        if (!effectivePatientId || !scheduledAt) {
            return res.status(400).json({ success: false, message: 'patientId and scheduledAt are required.' });
        }

        const insertRes = await runDb(
            `INSERT INTO appointments (
                id, patient_id, doctor_id, hospital_id, scheduled_at, time_slot, status, type, notes, patient_name, doctor_name, created_at, updated_at
            ) VALUES (
                gen_random_uuid(), ?, ?, ?, ?, ?, 'scheduled', ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) RETURNING *`,
            [
                effectivePatientId,
                doctorId || effectivePatientId,
                hospitalId || null,
                new Date(scheduledAt).toISOString(),
                timeSlot || '10:00 AM',
                type || 'General Consultation',
                notes || '',
                patientName || req.user?.name || 'Patient',
                doctorName || 'Doctor'
            ]
        );

        const appointment = insertRes.rows?.[0] || { id: `appt_${Date.now()}`, status: 'scheduled' };

        // Real-time Event Push
        realtimeService.emitToChannel(`patient:${effectivePatientId}`, 'APPOINTMENT_CREATED', appointment);
        if (doctorId) {
            realtimeService.emitToChannel(`doctor:${doctorId}`, 'APPOINTMENT_CREATED', appointment);
        }

        await writeAuditEvent({
            userId: req.user?.uid,
            action: 'APPOINTMENT_SCHEDULED',
            resourceType: 'appointment',
            resourceId: appointment.id,
            details: { patientId: effectivePatientId, scheduledAt, type },
            status: 'SUCCESS'
        });

        res.status(201).json({ success: true, appointment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ====================================================================
// CONSENTS
// ====================================================================

// 3. GET /api/consents - Get patient consents
router.get('/consents', authMiddleware, async (req, res) => {
    try {
        const patientId = req.query.patientId || req.user?.uid;
        const rows = await queryDb(
            `SELECT * FROM consents WHERE patient_id = ? ORDER BY created_at DESC`,
            [patientId]
        );
        res.json({ success: true, consents: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, consents: [] });
    }
});

// 4. POST /api/consents - Grant or update consent in Neon PostgreSQL
router.post('/consents', authMiddleware, async (req, res) => {
    try {
        const { patientId, grantedTo, purpose, scope = 'all_records', expiresAt } = req.body;
        const effectivePatientId = patientId || req.user?.uid;

        if (!effectivePatientId || !grantedTo || !purpose) {
            return res.status(400).json({ success: false, message: 'patientId, grantedTo, and purpose are required.' });
        }

        const insertRes = await runDb(
            `INSERT INTO consents (
                id, patient_id, granted_to, purpose, scope, status, granted_at, expires_at, created_at
            ) VALUES (
                gen_random_uuid(), ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP
            ) RETURNING *`,
            [
                effectivePatientId,
                grantedTo,
                purpose,
                scope,
                expiresAt ? new Date(expiresAt).toISOString() : null
            ]
        );

        const consent = insertRes.rows?.[0] || { id: `con_${Date.now()}`, status: 'active' };

        realtimeService.emitToChannel(`patient:${effectivePatientId}`, 'CONSENT_CHANGED', consent);
        realtimeService.emitToUser(grantedTo, 'CONSENT_GRANTED', consent);

        await writeAuditEvent({
            userId: req.user?.uid,
            action: 'CONSENT_GRANTED',
            resourceType: 'consent',
            resourceId: consent.id,
            details: { patientId: effectivePatientId, grantedTo, purpose, scope },
            status: 'SUCCESS'
        });

        res.status(201).json({ success: true, consent });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 5. POST /api/consents/:id/revoke - Revoke patient consent
router.post('/consents/:id/revoke', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await runDb(
            `UPDATE consents SET status = 'revoked', revoked_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [id]
        );

        await writeAuditEvent({
            userId: req.user?.uid,
            action: 'CONSENT_REVOKED',
            resourceType: 'consent',
            resourceId: id,
            status: 'SUCCESS'
        });

        res.json({ success: true, message: 'Consent revoked successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ====================================================================
// PRESCRIPTIONS & LAB ORDERS
// ====================================================================

// 6. GET /api/prescriptions
router.get('/prescriptions', authMiddleware, async (req, res) => {
    try {
        const patientId = req.query.patientId || (req.role === 'patient' ? req.user?.uid : null);
        let sql = `SELECT * FROM prescriptions WHERE 1=1`;
        const params = [];

        if (patientId) {
            sql += ` AND patient_id = ?`;
            params.push(patientId);
        }

        sql += ` ORDER BY created_at DESC LIMIT 50`;
        const rows = await queryDb(sql, params);
        res.json({ success: true, prescriptions: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, prescriptions: [] });
    }
});

// 7. GET /api/lab-results
router.get('/lab-results', authMiddleware, async (req, res) => {
    try {
        const patientId = req.query.patientId || (req.role === 'patient' ? req.user?.uid : null);
        let sql = `SELECT * FROM lab_results WHERE 1=1`;
        const params = [];

        if (patientId) {
            sql += ` AND patient_id = ?`;
            params.push(patientId);
        }

        sql += ` ORDER BY created_at DESC LIMIT 50`;
        const rows = await queryDb(sql, params);
        res.json({ success: true, labResults: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, labResults: [] });
    }
});

// ====================================================================
// USERS & PATIENTS PROFILE
// ====================================================================

// 8. GET /api/users - Admin user directory only
router.get('/users', authMiddleware, async (req, res) => {
    try {
        const requesterId = req.user?.uid || req.user?.userId || null;
        const requesterEmail = req.user?.email || null;

        const requester = await getDb(
            `SELECT id, role, status, hospital_id AS "hospitalId"
             FROM users
             WHERE (id = ? OR email = ?)
             LIMIT 1`,
            [requesterId, requesterEmail]
        );

        // User directory is a privileged administrative operation.
        // Never authorize this endpoint from the JWT role alone.
        const allowedDirectoryRoles = new Set(['admin', 'super_admin']);
        if (
            !requester ||
            requester.status !== 'active' ||
            !allowedDirectoryRoles.has(String(requester.role))
        ) {
            return res.status(403).json({
                success: false,
                code: 'ADMIN_REQUIRED',
                message: 'Administrator privileges are required to list users.'
            });
        }

        const { role } = req.query;
        let sql = `SELECT id, email, name, phone, role, status,
                          hospital_id AS "hospitalId",
                          created_at AS "createdAt"
                   FROM users
                   WHERE 1=1`;
        const params = [];

        if (role) {
            sql += ` AND role = ?`;
            params.push(role);
        }

        sql += ` ORDER BY created_at DESC LIMIT 100`;
        const users = await queryDb(sql, params);
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, users: [] });
    }
});

// 9. PUT /api/users/:id - Update user profile in PostgreSQL
router.put('/users/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, avatarUrl, status } = req.body;

        await runDb(
            `UPDATE users SET 
                name = COALESCE(?, name), 
                phone = COALESCE(?, phone), 
                avatar_url = COALESCE(?, avatar_url), 
                status = COALESCE(?, status), 
                updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [name || null, phone || null, avatarUrl || null, status || null, id]
        );

        res.json({ success: true, message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
