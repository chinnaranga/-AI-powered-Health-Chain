import express from 'express';
import db, { queryDb, getDb, runDb } from '../config/db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { writeAuditEvent } from '../services/auditLogger.js';
import { realtimeService } from '../services/realtimeService.js';
import { addRecord, getRecords, deleteRecord } from '../controllers/recordController.js';

const router = express.Router();

// GET /api/records - Fetch all clinical records filtered by tenant & permissions
router.get('/records', authMiddleware, getRecords);

// POST /api/records - Create new multi-tenant clinical record in PostgreSQL
router.post('/records', authMiddleware, addRecord);

// DELETE /api/records/:id - Delete a clinical record
router.delete('/records/:id', authMiddleware, deleteRecord);

// GET /api/records/patient/:patientId - Direct patient records helper
router.get('/records/patient/:patientId', authMiddleware, async (req, res) => {
    try {
        const { patientId } = req.params;
        const rows = await queryDb(
            `SELECT * FROM medical_records 
             WHERE patient_id = ? OR created_by = ?
             ORDER BY created_at DESC LIMIT 50`,
            [patientId, patientId]
        );

        const records = rows.map(r => ({
            id: r.id,
            title: r.title,
            recordType: r.record_type,
            category: r.category,
            patientId: r.patient_id,
            doctorId: r.doctor_id,
            hospitalId: r.hospital_id,
            downloadUrl: r.download_url,
            fileUrl: r.download_url,
            r2FileId: r.r2_file_id,
            fileName: r.file_name,
            fileSize: r.file_size,
            fileType: r.file_type,
            visibilityScope: r.visibility_scope,
            consentStatus: r.consent_status,
            createdAt: r.created_at,
            updatedAt: r.updated_at
        }));

        res.json({ success: true, records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, records: [] });
    }
});

export default router;
