import db, { queryDb, getDb, runDb } from '../config/db.js';
import { writeAuditEvent } from '../services/auditLogger.js';

/**
 * Helper: Authoritative Admin Check against Neon PostgreSQL
 */
async function verifyAdminUser(req) {
    const adminId = req.user?.uid || req.user?.userId;
    const adminEmail = req.user?.email;

    if (!adminId && !adminEmail) {
        return null;
    }

    // Determine admin identity from authenticated JWT and database
    let admin = null;
    if (adminId) {
        admin = await getDb(`SELECT * FROM users WHERE id = ? LIMIT 1`, [adminId]);
    }
    if (!admin && adminEmail) {
        admin = await getDb(`SELECT * FROM users WHERE email = ? LIMIT 1`, [adminEmail]);
    }

    if (!admin || !['admin'].includes(admin.role)) {
        return null;
    }

    return admin;
}

/**
 * 1. GET /api/admin/doctor-requests - List doctor verification and approval requests
 */

/**
 * GET /api/admin/overview
 * Authoritative system statistics from Neon PostgreSQL.
 */
export const getAdminOverview = async (req, res) => {
    try {
        const admin = await verifyAdminUser(req);
        if (!admin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. System Administrator authorization required.'
            });
        }

        const [
            usersResult,
            recordsResult,
            auditResult,
            uploadsResult
        ] = await Promise.all([
            queryDb(`
                SELECT
                    COUNT(*)::int AS "totalUsers",
                    COUNT(*) FILTER (WHERE role = 'patient')::int AS "patients",
                    COUNT(*) FILTER (WHERE role = 'doctor')::int AS "doctors",
                    COUNT(*) FILTER (WHERE role = 'clinical')::int AS "clinicalStaff",
                    COUNT(*) FILTER (WHERE role = 'admin')::int AS "admins",
                    COUNT(*) FILTER (WHERE status = 'active')::int AS "activeUsers",
                    COUNT(*) FILTER (WHERE status = 'pending')::int AS "pendingUsers"
                FROM users
            `),
            queryDb(`
                SELECT COUNT(*)::int AS "totalRecords"
                FROM medical_records
            `),
            queryDb(`
                SELECT COUNT(*)::int AS "totalAuditEvents"
                FROM audit_logs
            `),
            queryDb(`
                SELECT
                    COALESCE(SUM(upload_count), 0)::int AS "uploadCount",
                    COALESCE(SUM(total_storage_bytes), 0)::bigint AS "storageBytes"
                FROM storage_usage
            `)
        ]);

        const users = usersResult?.[0] || {};
        const records = recordsResult?.[0] || {};
        const audit = auditResult?.[0] || {};
        const uploads = uploadsResult?.[0] || {};

        const recentActivity = await queryDb(`
            SELECT
                a.id,
                a.action,
                a.resource_type AS "resourceType",
                a.resource_id AS "resourceId",
                a.status,
                a.timestamp,
                u.name AS "actorName",
                u.email AS "actorEmail",
                u.role AS "actorRole"
            FROM audit_logs a
            LEFT JOIN users u ON u.id = a.actor_user_id
            ORDER BY a.timestamp DESC
            LIMIT 20
        `);

        const uploadsByDay = await queryDb(`
            SELECT
                TO_CHAR(DATE(created_at), 'Dy') AS day,
                DATE(created_at) AS date,
                COUNT(*)::int AS count
            FROM medical_records
            WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
            GROUP BY DATE(created_at), TO_CHAR(DATE(created_at), 'Dy')
            ORDER BY DATE(created_at)
        `);

        res.json({
            success: true,
            stats: {
                totalUsers: Number(users.totalUsers || 0),
                totalRecords: Number(records.totalRecords || 0),
                transactions: Number(audit.totalAuditEvents || 0),
                activeNodes: Number(users.activeUsers || 0),
                patients: Number(users.patients || 0),
                doctors: Number(users.doctors || 0),
                clinicalStaff: Number(users.clinicalStaff || 0),
                admins: Number(users.admins || 0),
                activeUsers: Number(users.activeUsers || 0),
                pendingUsers: Number(users.pendingUsers || 0),
                uploadCount: Number(uploads.uploadCount || 0),
                storageBytes: Number(uploads.storageBytes || 0)
            },
            uploadsByDay: uploadsByDay || [],
            recentActivity: recentActivity || [],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[Admin getAdminOverview Error]:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getDoctorRequests = async (req, res) => {
    try {
        const admin = await verifyAdminUser(req);
        if (!admin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. System Administrator authorization required.'
            });
        }

        const sql = `
            SELECT 
                u.id as "userId",
                u.name,
                u.email,
                u.phone,
                u.status,
                u.created_at as "createdAt",
                u.updated_at as "updatedAt",
                u.approved_at as "approvedAt",
                u.rejected_at as "rejectedAt",
                d.id as "doctorId",
                d.specialty,
                d.license_number as "licenseNumber",
                d.hospital_id as "hospitalId",
                COALESCE(h.name, 'Central General Hospital') as "hospitalName"
            FROM users u
            LEFT JOIN doctors d ON d.user_id = u.id
            LEFT JOIN hospitals h ON h.id = d.hospital_id
            WHERE u.role = 'doctor'
            ORDER BY u.created_at DESC
        `;

        const rows = await queryDb(sql);

        res.json({
            success: true,
            requests: rows || [],
            count: rows?.length || 0
        });
    } catch (error) {
        console.error('[Admin getDoctorRequests Error]:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 2. POST /api/admin/doctor-requests/:id/approve - Approve a doctor registration
 */
export const approveDoctorRequest = async (req, res) => {
    try {
        const admin = await verifyAdminUser(req);
        if (!admin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. System Administrator authorization required.'
            });
        }

        const targetId = req.params.id;
        if (!targetId) {
            return res.status(400).json({ success: false, message: 'Doctor or User ID is required.' });
        }

        // Find doctor user by user ID or doctor profile ID
        const targetUser = await getDb(
            `SELECT u.*, d.id as doctor_id 
             FROM users u 
             LEFT JOIN doctors d ON d.user_id = u.id 
             WHERE (u.id = ? OR d.id = ?) AND u.role = 'doctor' 
             LIMIT 1`,
            [targetId, targetId]
        );

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'Doctor account not found.'
            });
        }

        // Update doctor status in Neon PostgreSQL to active
        const updateResult = await runDb(
            `UPDATE users 
             SET status = 'active', 
                 approved_by = ?, 
                 approved_at = CURRENT_TIMESTAMP, 
                 rejected_by = NULL,
                 rejected_at = NULL,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = ? 
             RETURNING id, email, name, role, status, approved_at`,
            [admin.id, targetUser.id]
        );

        const updatedDoc = updateResult.rows?.[0] || { id: targetUser.id, status: 'active' };

        // Write immutable compliance audit log
        await writeAuditEvent({
            userId: admin.id,
            role: 'admin',
            hospitalId: targetUser.hospital_id || admin.hospital_id,
            action: 'DOCTOR_APPROVED',
            resourceType: 'doctor',
            resourceId: targetUser.id,
            details: {
                doctorUserId: targetUser.id,
                doctorId: targetUser.doctor_id,
                doctorEmail: targetUser.email,
                doctorName: targetUser.name,
                approvedBy: admin.id,
                approvedByEmail: admin.email
            },
            ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'HealthChain Admin Client',
            status: 'SUCCESS'
        });

        res.json({
            success: true,
            message: `Doctor ${targetUser.name} (${targetUser.email}) approved successfully.`,
            doctor: updatedDoc
        });
    } catch (error) {
        console.error('[Admin approveDoctorRequest Error]:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 3. POST /api/admin/doctor-requests/:id/reject - Reject a doctor registration
 */
export const rejectDoctorRequest = async (req, res) => {
    try {
        const admin = await verifyAdminUser(req);
        if (!admin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. System Administrator authorization required.'
            });
        }

        const targetId = req.params.id;
        const { reason = 'Credentials or license verification declined' } = req.body || {};

        if (!targetId) {
            return res.status(400).json({ success: false, message: 'Doctor or User ID is required.' });
        }

        // Find doctor user
        const targetUser = await getDb(
            `SELECT u.*, d.id as doctor_id 
             FROM users u 
             LEFT JOIN doctors d ON d.user_id = u.id 
             WHERE (u.id = ? OR d.id = ?) AND u.role = 'doctor' 
             LIMIT 1`,
            [targetId, targetId]
        );

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'Doctor account not found.'
            });
        }

        // Update doctor status in Neon PostgreSQL to rejected
        const updateResult = await runDb(
            `UPDATE users 
             SET status = 'rejected', 
                 rejected_by = ?, 
                 rejected_at = CURRENT_TIMESTAMP, 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = ? 
             RETURNING id, email, name, role, status, rejected_at`,
            [admin.id, targetUser.id]
        );

        const updatedDoc = updateResult.rows?.[0] || { id: targetUser.id, status: 'rejected' };

        // Write immutable compliance audit log
        await writeAuditEvent({
            userId: admin.id,
            role: 'admin',
            hospitalId: targetUser.hospital_id || admin.hospital_id,
            action: 'DOCTOR_REJECTED',
            resourceType: 'doctor',
            resourceId: targetUser.id,
            details: {
                doctorUserId: targetUser.id,
                doctorId: targetUser.doctor_id,
                doctorEmail: targetUser.email,
                doctorName: targetUser.name,
                rejectedBy: admin.id,
                rejectedByEmail: admin.email,
                reason
            },
            ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'HealthChain Admin Client',
            status: 'SUCCESS'
        });

        res.json({
            success: true,
            message: `Doctor ${targetUser.name} registration has been rejected.`,
            doctor: updatedDoc
        });
    } catch (error) {
        console.error('[Admin rejectDoctorRequest Error]:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
