import db, { queryDb, getDb, runDb } from '../config/db.js';
import { encrypt, decrypt } from '../services/encryptionService.js';
import { writeAuditEvent } from '../services/auditLogger.js';
import { realtimeService } from '../services/realtimeService.js';
import https from 'https';
import { URL } from 'url';

/**
 * 1. POST /api/records - Add an encrypted clinical record to Neon PostgreSQL
 */
export const addRecord = async (req, res) => {
    try {
        const { 
            id, title, data, hash, previousHash, timestamp, 
            patientId, patientName, recordType, category, fileHash, rawSha256,
            cidHash, blockchainHash, downloadUrl, r2FileId, fileName, fileSize,
            fileType, departmentId, hospitalId, visibilityScope = 'hospital_internal',
            consentStatus = 'approved', accessRoles = ['doctor', 'clinical', 'hospital_admin']
        } = req.body;

        const effectivePatientId = patientId || req.user?.uid || 'pat_gen_' + Date.now();
        const effectiveHospitalId = hospitalId || req.hospitalId || 'default_hospital';
        const effectiveDoctorId = req.user?.role === 'doctor' ? req.user.uid : null;
        const recordTitle = title || (category ? `${category.toUpperCase()} Clinical Record` : 'Medical Clinical Record');

        // Encrypt the data payload before storing
        const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data || '');
        let encryptedPayload = '';
        try {
            const encryptedObj = encrypt(dataString);
            encryptedPayload = JSON.stringify(encryptedObj);
        } catch (e) {
            encryptedPayload = dataString;
        }

        const insertResult = await runDb(
            `INSERT INTO medical_records (
                id, patient_id, doctor_id, hospital_id, department_id, title, 
                record_type, category, clinical_notes, clinical_data, encrypted_payload, 
                file_hash, raw_sha256, cid_hash, blockchain_hash, download_url, 
                r2_file_id, file_name, file_size, file_type, visibility_scope, 
                consent_status, access_roles, created_by, updated_by, created_at, updated_at
            ) VALUES (
                gen_random_uuid(), ?, ?, ?, ?, ?, 
                ?, ?, ?, ?::jsonb, ?, 
                ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, 
                ?, ?::jsonb, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) RETURNING id, title, category, created_at`,
            [
                effectivePatientId,
                effectiveDoctorId,
                effectiveHospitalId !== 'default_hospital' ? effectiveHospitalId : null,
                departmentId || null,
                recordTitle,
                recordType || 'General Clinical Record',
                category || 'medical_pdf',
                dataString.slice(0, 500),
                typeof data === 'object' ? JSON.stringify(data) : '{}',
                encryptedPayload,
                fileHash || hash || '',
                rawSha256 || '',
                cidHash || '',
                blockchainHash || '',
                downloadUrl || '',
                r2FileId || '',
                fileName || 'record.pdf',
                fileSize || '1.0 MB',
                fileType || 'application/pdf',
                visibilityScope,
                consentStatus,
                JSON.stringify(accessRoles),
                req.user?.uid || null,
                req.user?.uid || null
            ]
        );

        const recordId = insertResult.rows?.[0]?.id || id || `rec_${Date.now()}`;

        // Audit Log entry in Neon PostgreSQL
        await writeAuditEvent({
            userId: req.user?.uid || effectivePatientId,
            role: req.user?.role || 'patient',
            hospitalId: effectiveHospitalId,
            action: 'CLINICAL_RECORD_CREATE',
            resourceType: 'medical_record',
            resourceId: recordId,
            details: { patientId: effectivePatientId, title: recordTitle, category, blockchainHash },
            status: 'SUCCESS'
        });

        // Real-time Push to Patient & Hospital Dashboard
        realtimeService.emitToChannel(`patient:${effectivePatientId}`, 'RECORD_ADDED', {
            id: recordId,
            title: recordTitle,
            category: category || 'medical_pdf',
            patientId: effectivePatientId,
            createdAt: new Date().toISOString()
        });

        realtimeService.emitToHospital(effectiveHospitalId, 'RECORD_ADDED', {
            id: recordId,
            title: recordTitle,
            patientId: effectivePatientId
        });

        res.status(201).json({
            success: true,
            id: recordId,
            record: {
                id: recordId,
                title: recordTitle,
                patientId: effectivePatientId,
                category: category || 'medical_pdf',
                createdAt: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error('[Add Record Error]:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * 2. GET /api/records - Retrieve and decrypt clinical records from Neon PostgreSQL
 */
export const getRecords = async (req, res) => {
    try {
        const { role, userId, patientIdForDoctor, patientId, hospitalId, category } = req.query;
        const requesterRole = req.user?.role || role || 'patient';
        const requesterId = req.user?.uid || req.user?.userId || userId;

        let querySql = `SELECT * FROM medical_records WHERE 1=1`;
        const params = [];

        if (requesterRole === 'patient') {
            querySql += ` AND (patient_id = ? OR created_by = ?)`;
            params.push(requesterId, requesterId);
        } else if (requesterRole === 'doctor' || requesterRole === 'clinical') {
            const targetPatient = patientIdForDoctor || patientId;
            if (targetPatient) {
                querySql += ` AND patient_id = ?`;
                params.push(targetPatient);
            }
        }

        if (hospitalId && hospitalId !== 'all') {
            querySql += ` AND hospital_id = ?`;
            params.push(hospitalId);
        }

        if (category && category !== 'all') {
            querySql += ` AND category = ?`;
            params.push(category);
        }

        querySql += ` ORDER BY created_at DESC LIMIT 100`;

        const rows = await queryDb(querySql, params);

        // Decrypt record payload
        const records = rows.map(r => {
            let decryptedData = null;
            try {
                if (r.encrypted_payload) {
                    const encrypted = JSON.parse(r.encrypted_payload);
                    if (encrypted.iv && encrypted.content) {
                        const plain = decrypt(encrypted);
                        decryptedData = JSON.parse(plain);
                    } else {
                        decryptedData = encrypted;
                    }
                } else if (r.clinical_data) {
                    decryptedData = typeof r.clinical_data === 'string' ? JSON.parse(r.clinical_data) : r.clinical_data;
                }
            } catch (e) {
                decryptedData = r.clinical_data || null;
            }

            return {
                id: r.id,
                title: r.title,
                recordType: r.record_type,
                category: r.category,
                patientId: r.patient_id,
                doctorId: r.doctor_id,
                hospitalId: r.hospital_id,
                data: decryptedData,
                fileHash: r.file_hash,
                rawSha256: r.raw_sha256,
                cidHash: r.cid_hash,
                blockchainHash: r.blockchain_hash,
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
            };
        });

        res.json(records);
    } catch (err) {
        console.error('[Get Records Error]:', err);
        res.status(500).json({ success: false, error: err.message, records: [] });
    }
};

/**
 * 3. GET /api/proxy-file - Secure storage proxy
 */
export const proxyFile = async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        const parsedUrl = new URL(url);
        const isAllowedHost = 
            parsedUrl.hostname === 'firebasestorage.googleapis.com' ||
            parsedUrl.hostname.includes('r2.cloudflarestorage.com') ||
            parsedUrl.hostname === 'ipfs.io' ||
            parsedUrl.hostname === 'localhost' ||
            parsedUrl.hostname === '127.0.0.1';

        if (!isAllowedHost) {
            return res.status(400).json({ error: 'Only authorized storage hosts can be proxied' });
        }

        if (globalThis.fetch) {
            const response = await fetch(url);
            if (!response.ok) {
                return res.status(response.status).json({ error: `Failed to fetch file: ${response.statusText}` });
            }

            const contentType = response.headers.get('content-type');
            if (contentType) res.setHeader('Content-Type', contentType);

            const arrayBuffer = await response.arrayBuffer();
            return res.send(Buffer.from(arrayBuffer));
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export default {
    addRecord,
    getRecords,
    proxyFile
};
