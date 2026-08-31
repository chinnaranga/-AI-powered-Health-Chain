import express from 'express';
import crypto from 'crypto';
import { adminDb } from '../config/firebaseAdmin.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createPresignedUploadUrl, createPresignedDownloadUrl, deleteR2Object } from '../services/r2Service.js';
import { checkStorageQuota, recordStorageUsage, getMonthlyStorageUsage } from '../services/quotaService.js';

const router = express.Router();

// Supported Healthcare File Categories
const ALLOWED_CATEGORIES = [
    'lab_report',
    'mri',
    'ct_scan',
    'xray',
    'prescription',
    'insurance',
    'certificate',
    'profile_image',
    'medical_pdf',
    'other_attachment'
];

// Max file size limit: 100MB
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

/**
 * Audit Logger Helper function for Firestore
 */
async function logFileAudit({ action, fileId, fileName, fileType, patientId, hospitalId, departmentId, req, status = 'SUCCESS', details = {} }) {
    const auditId = `audit_r2_${crypto.randomBytes(8).toString('hex')}`;
    const auditData = {
        auditId,
        action,
        fileId: fileId || '',
        fileName: fileName || '',
        fileType: fileType || '',
        requestedBy: req.user.uid,
        userEmail: req.user.email || 'authenticated.user@healthchain.org',
        role: req.role || 'patient',
        patientId: patientId || req.user.uid,
        hospitalId: hospitalId || req.hospitalId || 'default_hospital',
        departmentId: departmentId || req.user.departmentId || 'general',
        storageProvider: 'cloudflare-r2',
        timestamp: new Date().toISOString(),
        status,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'HealthChain Client',
        details
    };

    try {
        await adminDb.collection('auditLogs').doc(auditId).set(auditData);
    } catch (e) {
        console.warn('[R2 Audit Log Warning] Failed to write Firestore audit log:', e.message);
    }

    return auditId;
}

/**
 * Helper to check RBAC permissions on a file metadata record
 */
function checkFilePermission(user, role, userHospitalId, fileMeta) {
    // Admin access within hospital tenant
    if (role === 'hospital_admin' || role === 'admin') {
        return fileMeta.hospitalId === userHospitalId || userHospitalId === 'all';
    }

    // Patient access to their own files
    if (role === 'patient') {
        return fileMeta.patientId === user.uid || fileMeta.uploadedFor === user.uid || fileMeta.uploadedBy === user.uid;
    }

    // Doctor access
    if (role === 'doctor') {
        const isSameTenant = fileMeta.hospitalId === userHospitalId || userHospitalId === 'default_hospital';
        const isConsentApproved = fileMeta.consentStatus === 'approved';
        const isAssignedDoctor = fileMeta.doctorId === user.uid || fileMeta.uploadedBy === user.uid;
        return (isSameTenant && isConsentApproved) || isAssignedDoctor;
    }

    // Clinical staff access
    if (role === 'clinical_staff' || role === 'clinical') {
        const isSameTenant = fileMeta.hospitalId === userHospitalId;
        const isSameDept = fileMeta.departmentId === (user.departmentId || 'general');
        return isSameTenant && (isSameDept || fileMeta.visibilityScope !== 'patient_only');
    }

    // Default: Check explicit ownership
    return fileMeta.uploadedBy === user.uid || fileMeta.patientId === user.uid;
}

/**
 * 1. POST /api/r2/presigned-upload-url
 * Request a presigned URL to upload a heavy/sensitive file directly to Cloudflare R2
 * Includes strict Server-Side Monthly Storage & Request Quota Check
 */
router.post('/r2/presigned-upload-url', authMiddleware, async (req, res) => {
    try {
        const {
            fileName,
            fileType = 'medical_pdf',
            fileSize,
            contentType = 'application/pdf',
            patientId,
            doctorId,
            hospitalId,
            departmentId = 'radiology',
            visibilityScope = 'hospital_internal',
            consentStatus = 'approved'
        } = req.body;

        if (!fileName) {
            return res.status(400).json({ success: false, message: 'fileName is required.' });
        }

        const bytesToUpload = Number(fileSize) || 0;
        if (bytesToUpload > MAX_FILE_SIZE_BYTES) {
            return res.status(400).json({ success: false, message: 'File size exceeds maximum permitted limit of 100MB.' });
        }

        const category = ALLOWED_CATEGORIES.includes(fileType) ? fileType : 'medical_pdf';
        const targetTenant = hospitalId || req.hospitalId || 'default_hospital';
        const targetPatient = patientId || (req.role === 'patient' ? req.user.uid : 'pat_gen_' + req.user.uid.slice(0, 6));
        const targetDoctor = doctorId || (req.role === 'doctor' ? req.user.uid : 'doc_gen_system');

        // SERVER-SIDE QUOTA CHECK
        const quotaCheck = await checkStorageQuota({
            hospitalId: targetTenant,
            requestedBytes: bytesToUpload,
            operationType: 'upload'
        });

        if (!quotaCheck.isAllowed) {
            await logFileAudit({
                action: 'FILE_UPLOAD_BLOCKED_QUOTA',
                fileName,
                fileType: category,
                patientId: targetPatient,
                hospitalId: targetTenant,
                departmentId,
                req,
                status: 'BLOCKED',
                details: { reason: quotaCheck.reason, warningLevel: quotaCheck.warningLevel }
            });

            return res.status(429).json({
                success: false,
                isQuotaExceeded: true,
                warningLevel: quotaCheck.warningLevel,
                message: 'Monthly storage limit reached. Please upgrade your storage plan or wait until the next reset cycle.',
                reason: quotaCheck.reason,
                resetAt: quotaCheck.resetAt
            });
        }

        // Generate unique R2 file ID and Object Key
        const fileId = `r2_doc_${crypto.randomBytes(8).toString('hex')}`;
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const objectKey = `hospitals/${targetTenant}/patients/${targetPatient}/${category}/${new Date().getFullYear()}/${fileId}_${sanitizedFileName}`;

        // Generate S3-compatible Presigned Upload URL for Cloudflare R2
        const presignedData = await createPresignedUploadUrl({
            objectKey,
            contentType,
            expiresInSeconds: 900 // 15 minutes
        });

        // Initial Audit Log
        const auditId = await logFileAudit({
            action: 'FILE_UPLOAD_INITIATED',
            fileId,
            fileName: sanitizedFileName,
            fileType: category,
            patientId: targetPatient,
            hospitalId: targetTenant,
            departmentId,
            req,
            status: 'PENDING',
            details: { objectKey, fileSize: bytesToUpload, contentType, warningLevel: quotaCheck.warningLevel }
        });

        // Pre-register Metadata in Firestore (DO NOT store binary content in Firestore)
        const fileMetadata = {
            fileId,
            fileName: sanitizedFileName,
            fileType: category,
            fileSize: bytesToUpload,
            contentType,
            storageProvider: 'cloudflare-r2',
            bucketName: presignedData.bucketName,
            objectKey,
            uploadedBy: req.user.uid,
            uploadedFor: targetPatient,
            patientId: targetPatient,
            doctorId: targetDoctor,
            hospitalId: targetTenant,
            departmentId,
            visibilityScope,
            consentStatus,
            uploadStatus: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            auditId
        };

        await adminDb.collection('r2FileMetadata').doc(fileId).set(fileMetadata);

        res.status(201).json({
            success: true,
            fileId,
            uploadUrl: presignedData.uploadUrl,
            expiresIn: presignedData.expiresIn,
            warningLevel: quotaCheck.warningLevel,
            metadata: fileMetadata
        });
    } catch (err) {
        console.error('[R2 Upload Presign Error]', err);
        res.status(500).json({ success: false, message: 'Failed to generate presigned upload URL: ' + err.message });
    }
});

/**
 * 2. POST /api/r2/confirm-upload
 * Confirms binary upload completion to Cloudflare R2 & updates monthly quota counters
 */
router.post('/r2/confirm-upload', authMiddleware, async (req, res) => {
    try {
        const { fileId } = req.body;
        if (!fileId) {
            return res.status(400).json({ success: false, message: 'fileId is required.' });
        }

        const docRef = adminDb.collection('r2FileMetadata').doc(fileId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ success: false, message: 'File metadata not found in Firestore.' });
        }

        const metadata = docSnap.data();

        // Audit log confirmation
        const auditId = await logFileAudit({
            action: 'FILE_UPLOAD_CONFIRMED',
            fileId,
            fileName: metadata.fileName,
            fileType: metadata.fileType,
            patientId: metadata.patientId,
            hospitalId: metadata.hospitalId,
            departmentId: metadata.departmentId,
            req,
            status: 'SUCCESS',
            details: { objectKey: metadata.objectKey }
        });

        // ATOMICALLY RECORD STORAGE & CLASS A REQUEST USAGE IN FIRESTORE
        const updatedQuota = await recordStorageUsage({
            hospitalId: metadata.hospitalId,
            departmentId: metadata.departmentId,
            userId: req.user.uid,
            bytesDelta: Number(metadata.fileSize) || 0,
            operationType: 'upload',
            fileType: metadata.fileType
        });

        const updatedMetadata = {
            ...metadata,
            uploadStatus: 'active',
            updatedAt: new Date().toISOString(),
            auditId
        };

        await docRef.update({
            uploadStatus: 'active',
            updatedAt: new Date().toISOString(),
            auditId
        });

        res.json({
            success: true,
            message: 'Cloudflare R2 file upload confirmed and metadata activated in Firestore.',
            metadata: updatedMetadata,
            quota: updatedQuota
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * 3. POST /api/r2/presigned-download-url
 * Generate short-lived presigned GET URL for Cloudflare R2 download with strict RBAC & Class B request quota check
 */
router.post('/r2/presigned-download-url', authMiddleware, async (req, res) => {
    try {
        const { fileId } = req.body;
        if (!fileId) {
            return res.status(400).json({ success: false, message: 'fileId is required.' });
        }

        const docSnap = await adminDb.collection('r2FileMetadata').doc(fileId).get();
        if (!docSnap.exists) {
            return res.status(404).json({ success: false, message: 'File record not found.' });
        }

        const meta = docSnap.data();

        // RBAC Check
        const hasAccess = checkFilePermission(req.user, req.role, req.hospitalId, meta);
        if (!hasAccess) {
            await logFileAudit({
                action: 'FILE_DOWNLOAD_DENIED',
                fileId,
                fileName: meta.fileName,
                fileType: meta.fileType,
                patientId: meta.patientId,
                hospitalId: meta.hospitalId,
                departmentId: meta.departmentId,
                req,
                status: 'DENIED',
                details: { reason: 'Unauthorized role/tenant access attempt' }
            });
            return res.status(403).json({ success: false, message: 'Access Denied: Insufficient authorization or consent for this medical document.' });
        }

        // QUOTA CHECK FOR CLASS B DOWNLOAD REQUEST
        const quotaCheck = await checkStorageQuota({
            hospitalId: meta.hospitalId,
            operationType: 'download'
        });

        if (!quotaCheck.isAllowed) {
            return res.status(429).json({
                success: false,
                isQuotaExceeded: true,
                message: 'Monthly download request limit reached. Please upgrade your storage plan or wait until the next reset cycle.',
                reason: quotaCheck.reason,
                resetAt: quotaCheck.resetAt
            });
        }

        // Generate Cloudflare R2 presigned GET URL
        const presignedData = await createPresignedDownloadUrl({
            objectKey: meta.objectKey,
            expiresInSeconds: 900 // 15 minutes
        });

        // Audit Log entry
        const auditId = await logFileAudit({
            action: 'FILE_DOWNLOAD',
            fileId,
            fileName: meta.fileName,
            fileType: meta.fileType,
            patientId: meta.patientId,
            hospitalId: meta.hospitalId,
            departmentId: meta.departmentId,
            req,
            status: 'SUCCESS',
            details: { objectKey: meta.objectKey, storageProvider: 'cloudflare-r2' }
        });

        // Record Class B Request Usage
        await recordStorageUsage({
            hospitalId: meta.hospitalId,
            departmentId: meta.departmentId,
            userId: req.user.uid,
            operationType: 'download',
            fileType: meta.fileType
        });

        res.json({
            success: true,
            downloadUrl: presignedData.downloadUrl,
            expiresIn: presignedData.expiresIn,
            fileName: meta.fileName,
            contentType: meta.contentType,
            auditId,
            metadata: meta
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * 4. POST /api/r2/presigned-preview-url
 * Generate short-lived presigned GET URL for inline preview in browser with Class B quota tracking
 */
router.post('/r2/presigned-preview-url', authMiddleware, async (req, res) => {
    try {
        const { fileId } = req.body;
        if (!fileId) {
            return res.status(400).json({ success: false, message: 'fileId is required.' });
        }

        const docSnap = await adminDb.collection('r2FileMetadata').doc(fileId).get();
        if (!docSnap.exists) {
            return res.status(404).json({ success: false, message: 'File record not found.' });
        }

        const meta = docSnap.data();

        // RBAC Check
        const hasAccess = checkFilePermission(req.user, req.role, req.hospitalId, meta);
        if (!hasAccess) {
            await logFileAudit({
                action: 'FILE_PREVIEW_DENIED',
                fileId,
                fileName: meta.fileName,
                fileType: meta.fileType,
                patientId: meta.patientId,
                hospitalId: meta.hospitalId,
                departmentId: meta.departmentId,
                req,
                status: 'DENIED',
                details: { reason: 'Unauthorized role/tenant preview attempt' }
            });
            return res.status(403).json({ success: false, message: 'Access Denied for document preview.' });
        }

        // QUOTA CHECK FOR CLASS B PREVIEW REQUEST
        const quotaCheck = await checkStorageQuota({
            hospitalId: meta.hospitalId,
            operationType: 'preview'
        });

        if (!quotaCheck.isAllowed) {
            return res.status(429).json({
                success: false,
                isQuotaExceeded: true,
                message: 'Monthly request limit reached. Preview unavailable.',
                reason: quotaCheck.reason,
                resetAt: quotaCheck.resetAt
            });
        }

        const presignedData = await createPresignedDownloadUrl({
            objectKey: meta.objectKey,
            expiresInSeconds: 600 // 10 minutes
        });

        const auditId = await logFileAudit({
            action: 'FILE_PREVIEW',
            fileId,
            fileName: meta.fileName,
            fileType: meta.fileType,
            patientId: meta.patientId,
            hospitalId: meta.hospitalId,
            departmentId: meta.departmentId,
            req,
            status: 'SUCCESS',
            details: { objectKey: meta.objectKey }
        });

        // Record Class B Preview Request
        await recordStorageUsage({
            hospitalId: meta.hospitalId,
            departmentId: meta.departmentId,
            userId: req.user.uid,
            operationType: 'preview',
            fileType: meta.fileType
        });

        res.json({
            success: true,
            previewUrl: presignedData.downloadUrl,
            expiresIn: presignedData.expiresIn,
            fileName: meta.fileName,
            contentType: meta.contentType,
            auditId,
            metadata: meta
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * 5. GET /api/r2/files
 * Fetch file metadata list filtered by hospital tenant & user role
 */
router.get('/r2/files', authMiddleware, async (req, res) => {
    try {
        const { patientId, hospitalId, category } = req.query;
        let queryRef = adminDb.collection('r2FileMetadata');

        const targetHospital = hospitalId || req.hospitalId;
        if (targetHospital && targetHospital !== 'all') {
            queryRef = queryRef.where('hospitalId', '==', targetHospital);
        }

        if (req.role === 'patient') {
            queryRef = queryRef.where('patientId', '==', req.user.uid);
        } else if (patientId) {
            queryRef = queryRef.where('patientId', '==', patientId);
        }

        if (category && category !== 'all') {
            queryRef = queryRef.where('fileType', '==', category);
        }

        const snapshot = await queryRef.get();
        if (snapshot.empty) {
            return res.json({ success: true, files: [] });
        }

        let files = snapshot.docs.map(doc => ({
            fileId: doc.id,
            ...doc.data()
        }));

        files = files.filter(f => f.uploadStatus !== 'deleted');

        res.json({
            success: true,
            totalFiles: files.length,
            files
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, files: [] });
    }
});

/**
 * 6. DELETE /api/r2/file/:fileId
 * Securely deletes file from Cloudflare R2 and updates Firestore metadata & quota counters
 */
router.delete('/r2/file/:fileId', authMiddleware, async (req, res) => {
    try {
        const { fileId } = req.params;
        const docRef = adminDb.collection('r2FileMetadata').doc(fileId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ success: false, message: 'File record not found.' });
        }

        const meta = docSnap.data();

        // RBAC Check for Delete
        const canDelete = req.role === 'hospital_admin' || req.role === 'admin' || meta.uploadedBy === req.user.uid;
        if (!canDelete) {
            await logFileAudit({
                action: 'FILE_DELETE_DENIED',
                fileId,
                fileName: meta.fileName,
                fileType: meta.fileType,
                patientId: meta.patientId,
                hospitalId: meta.hospitalId,
                departmentId: meta.departmentId,
                req,
                status: 'DENIED',
                details: { reason: 'User lacks permission to delete this file' }
            });
            return res.status(403).json({ success: false, message: 'Delete Denied: Only original uploader or Hospital Admin can delete file records.' });
        }

        // Delete object from Cloudflare R2
        await deleteR2Object({ objectKey: meta.objectKey });

        // Audit Log
        const auditId = await logFileAudit({
            action: 'FILE_DELETE',
            fileId,
            fileName: meta.fileName,
            fileType: meta.fileType,
            patientId: meta.patientId,
            hospitalId: meta.hospitalId,
            departmentId: meta.departmentId,
            req,
            status: 'SUCCESS',
            details: { objectKey: meta.objectKey }
        });

        // RECORD DELETE IN QUOTA (Deduct Storage Bytes & Increment Class A Request)
        await recordStorageUsage({
            hospitalId: meta.hospitalId,
            departmentId: meta.departmentId,
            userId: req.user.uid,
            bytesDelta: -Number(meta.fileSize) || 0,
            operationType: 'delete',
            fileType: meta.fileType
        });

        // Mark Firestore record as deleted
        await docRef.update({
            uploadStatus: 'deleted',
            deletedAt: new Date().toISOString(),
            deletedBy: req.user.uid,
            auditId
        });

        res.json({
            success: true,
            message: 'File successfully deleted from Cloudflare R2 and archived in Firestore.',
            fileId,
            auditId
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * 7. GET /api/r2/audit-logs
 * Retrieve audit trail for hospital compliance
 */
router.get('/r2/audit-logs', authMiddleware, async (req, res) => {
    try {
        const { hospitalId, limit = 50 } = req.query;
        let queryRef = adminDb.collection('auditLogs');

        const targetHospital = hospitalId || req.hospitalId;
        if (targetHospital && targetHospital !== 'all') {
            queryRef = queryRef.where('hospitalId', '==', targetHospital);
        }

        const snapshot = await queryRef.limit(Number(limit)).get();
        const auditLogs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({
            success: true,
            totalLogs: auditLogs.length,
            auditLogs
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, auditLogs: [] });
    }
});

/**
 * 8. GET /api/r2/storage-quota
 * Retrieve Cloudflare R2 Monthly Storage & Request Quota Metrics for Admin View
 */
router.get('/r2/storage-quota', authMiddleware, async (req, res) => {
    try {
        const targetHospital = req.query.hospitalId || req.hospitalId || 'default_hospital';
        const quotaInfo = await checkStorageQuota({ hospitalId: targetHospital });
        const usage = quotaInfo.usage;

        res.json({
            success: true,
            hospitalId: targetHospital,
            month: usage.month,
            totalStorageBytes: usage.totalStorageBytes || 0,
            maxStorageBytes: usage.maxStorageBytes || 10737418240,
            storagePercentage: Number(((usage.totalStorageBytes / usage.maxStorageBytes) * 100).toFixed(2)),
            uploadCount: usage.uploadCount || 0,
            downloadCount: usage.downloadCount || 0,
            previewCount: usage.previewCount || 0,
            deleteCount: usage.deleteCount || 0,
            classARequests: usage.classARequests || 0,
            maxClassARequests: usage.maxClassARequests || 1000000,
            classAPercentage: Number(((usage.classARequests / usage.maxClassARequests) * 100).toFixed(2)),
            classBRequests: usage.classBRequests || 0,
            maxClassBRequests: usage.maxClassBRequests || 10000000,
            classBPercentage: Number(((usage.classBRequests / usage.maxClassBRequests) * 100).toFixed(2)),
            warningLevel: usage.warningLevel || 'normal',
            isBlocked: usage.isBlocked || false,
            resetAt: usage.resetAt,
            categoryBreakdown: usage.categoryBreakdown || {}
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
