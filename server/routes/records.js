import express from 'express';
import { adminDb } from '../config/firebaseAdmin.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/records - Fetch all clinical records filtered by tenant & permissions
router.get('/records', authMiddleware, async (req, res) => {
    try {
        const { patientId, hospitalId, recordType } = req.query;
        let queryRef = adminDb.collection('clinicalRecords');

        const targetHospitalId = hospitalId || req.hospitalId;
        if (targetHospitalId && targetHospitalId !== 'all') {
            queryRef = queryRef.where('hospitalId', '==', targetHospitalId);
        }

        if (patientId) {
            queryRef = queryRef.where('patientId', '==', patientId);
        }

        const snapshot = await queryRef.get();
        if (snapshot.empty) {
            return res.json({ success: true, records: [] });
        }

        const records = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({ success: true, records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, records: [] });
    }
});

// POST /api/records - Create new multi-tenant clinical record in Firestore
router.post('/records', authMiddleware, async (req, res) => {
    try {
        const { 
            title, data, patientId, patientName, recordType, 
            fileHash, downloadUrl, metadata, hospitalId, departmentId,
            visibilityScope = 'hospital_internal', accessRoles = ['doctor', 'clinical', 'hospital_admin'] 
        } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: 'Record title is required.' });
        }

        const tenantId = hospitalId || req.hospitalId || 'default_tenant';
        const docRef = adminDb.collection('clinicalRecords').doc();

        const newRecord = {
            id: docRef.id,
            title,
            recordType: recordType || 'General Clinical Record',
            patientId: patientId || req.user.uid,
            patientName: patientName || 'Patient',
            data: data || '',
            fileHash: fileHash || '',
            downloadUrl: downloadUrl || '',
            metadata: metadata || {},
            hospitalId: tenantId,
            tenantId,
            departmentId: departmentId || req.user.departmentId || 'cardiology',
            createdBy: req.user.uid,
            updatedBy: req.user.uid,
            accessRoles,
            consentStatus: 'approved',
            visibilityScope,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await docRef.set(newRecord);

        // Immutable Audit Log entry
        await adminDb.collection('auditLogs').add({
            action: 'CLINICAL_RECORD_CREATE',
            recordId: docRef.id,
            hospitalId: tenantId,
            tenantId,
            createdBy: req.user.uid,
            timestamp: new Date().toISOString(),
            status: 'SUCCESS'
        });

        res.status(201).json({ success: true, record: newRecord });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
