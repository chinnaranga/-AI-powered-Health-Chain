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

        const requesterId = req.user?.uid || req.user?.userId;
        const requesterRole = req.user?.role || req.role || 'patient';

        if (!requesterId) {
            return res.status(401).json({
                success: false,
                code: 'AUTHENTICATION_REQUIRED',
                error: 'Authenticated user is required to create a medical record.'
            });
        }

        // Resolve the authenticated user from Neon. Never trust client-supplied
        // patientId/hospitalId for ownership or tenant assignment.
        const requester = await getDb(
            `SELECT id, role, status, hospital_id
             FROM users
             WHERE id = ?
             LIMIT 1`,
            [requesterId]
        );

        if (!requester) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                error: 'Authenticated user account was not found.'
            });
        }

        if (requester.status !== 'active') {
            return res.status(403).json({
                success: false,
                code: 'ACCOUNT_NOT_ACTIVE',
                error: 'Your account is not active and cannot create medical records.'
            });
        }

        let effectivePatientId = null;
        let effectiveHospitalId = null;
        let effectiveDoctorId = null;

        if (requester.role === 'patient') {
            const patient = await getDb(
                `SELECT id, hospital_id
                 FROM patients
                 WHERE user_id = ?
                 LIMIT 1`,
                [requester.id]
            );

            if (!patient) {
                return res.status(403).json({
                    success: false,
                    code: 'PATIENT_PROFILE_REQUIRED',
                    error: 'A registered patient profile is required to create a medical record.'
                });
            }

            // Patients can only create records for themselves.
            effectivePatientId = patient.id;
            effectiveHospitalId = patient.hospital_id || null;
        } else if (requester.role === 'doctor') {
            const doctor = await getDb(
                `SELECT id, hospital_id
                 FROM doctors
                 WHERE user_id = ?
                 LIMIT 1`,
                [requester.id]
            );

            if (!doctor) {
                return res.status(403).json({
                    success: false,
                    code: 'DOCTOR_PROFILE_REQUIRED',
                    error: 'A registered doctor profile is required to create medical records.'
                });
            }

            const targetPatient = await getDb(
                `SELECT id, hospital_id
                 FROM patients
                 WHERE id::text = ?
                    OR user_id::text = ?
                 LIMIT 1`,
                [patientId || '', patientId || '']
            );

            if (!targetPatient) {
                return res.status(400).json({
                    success: false,
                    code: 'PATIENT_REQUIRED',
                    error: 'A valid patient must be selected when creating a record as a doctor.'
                });
            }

            // A doctor may create a record only after the patient has granted
            // an active access session.
            const activeSession = await getDb(
                `SELECT id
                 FROM active_access_sessions
                 WHERE doctor_id = ?
                   AND patient_id = ?
                   AND revoked_at IS NULL
                   AND expires_at > CURRENT_TIMESTAMP
                 LIMIT 1`,
                [doctor.id, targetPatient.id]
            );

            if (!activeSession) {
                return res.status(403).json({
                    success: false,
                    code: 'PATIENT_ACCESS_REQUIRED',
                    error: 'Active patient access approval is required to create a medical record.'
                });
            }

            effectivePatientId = targetPatient.id;
            effectiveDoctorId = doctor.id;
            effectiveHospitalId = doctor.hospital_id || targetPatient.hospital_id || null;
        } else if (['clinical', 'hospital_admin', 'admin'].includes(requester.role)) {
            return res.status(403).json({
                success: false,
                code: 'RECORD_CREATION_NOT_PERMITTED',
                error: `Role '${requester.role}' is not permitted to create medical records through this endpoint.`
            });
        } else {
            return res.status(403).json({
                success: false,
                code: 'ROLE_NOT_PERMITTED',
                error: 'Your role is not permitted to create medical records.'
            });
        }

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
                const doctorUserId = requesterId;

                const doctor = await getDb(
                    `SELECT id
                     FROM doctors
                     WHERE user_id = ?
                     LIMIT 1`,
                    [doctorUserId]
                );

                if (!doctor) {
                    return res.status(403).json({
                        success: false,
                        code: 'DOCTOR_PROFILE_REQUIRED',
                        error: 'A registered doctor profile is required to access patient records.'
                    });
                }

                const targetPatientRow = await getDb(
                    `SELECT id
                     FROM patients
                     WHERE id::text = ?
                        OR user_id::text = ?
                     LIMIT 1`,
                    [targetPatient, targetPatient]
                );

                if (!targetPatientRow) {
                    return res.status(404).json({
                        success: false,
                        error: 'Patient not found.'
                    });
                }

                const activeSession = await getDb(
                    `SELECT id
                     FROM active_access_sessions
                     WHERE doctor_id = ?
                       AND patient_id = ?
                       AND revoked_at IS NULL
                       AND expires_at > CURRENT_TIMESTAMP
                     LIMIT 1`,
                    [doctor.id, targetPatientRow.id]
                );

                if (!activeSession) {
                    return res.status(403).json({
                        success: false,
                        code: 'PATIENT_ACCESS_REQUIRED',
                        error: 'Active patient access approval is required to view these medical records.'
                    });
                }

                querySql += ` AND patient_id = ?`;
                params.push(targetPatientRow.id);
            } else {
                querySql += ` AND doctor_id = ?`;
                params.push(requesterId);
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
 * DELETE /api/records/:id - Delete a clinical record
 */
export const deleteRecord = async (req, res) => {
    try {
        const recordId = req.params.id;
        const requesterId = req.user?.uid || req.user?.userId;
        const requesterRole = req.user?.role || 'patient';

        if (!recordId) {
            return res.status(400).json({
                success: false,
                error: 'Record ID is required'
            });
        }

        if (!requesterId) {
            return res.status(401).json({
                success: false,
                error: 'Authenticated user is required'
            });
        }

        const rows = await queryDb(
            `SELECT id, patient_id, doctor_id, hospital_id, title, category, r2_file_id, created_by
             FROM medical_records
             WHERE id = ?
             LIMIT 1`,
            [recordId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Medical record not found'
            });
        }

        const record = rows[0];

        const isOwner = String(record.patient_id) === String(requesterId);
        const isCreator = String(record.created_by || '') === String(requesterId);
        const isDoctorOwner =
            requesterRole === 'doctor' &&
            String(record.doctor_id || '') === String(requesterId);

        const isAdmin =
            requesterRole === 'hospital_admin' ||
            requesterRole === 'admin' ||
            requesterRole === 'admin';

        if (!isOwner && !isCreator && !isDoctorOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'You are not authorized to delete this medical record'
            });
        }

        await runDb(
            `DELETE FROM medical_records WHERE id = ?`,
            [recordId]
        );

        await writeAuditEvent({
            userId: requesterId,
            role: requesterRole,
            hospitalId: record.hospital_id || 'default_hospital',
            action: 'CLINICAL_RECORD_DELETE',
            resourceType: 'medical_record',
            resourceId: recordId,
            details: {
                patientId: record.patient_id,
                title: record.title,
                category: record.category,
                r2FileId: record.r2_file_id || null
            },
            status: 'SUCCESS'
        });

        realtimeService.emitToChannel(
            `patient:${record.patient_id}`,
            'RECORD_DELETED',
            {
                id: recordId,
                patientId: record.patient_id
            }
        );

        if (record.hospital_id) {
            realtimeService.emitToHospital(
                record.hospital_id,
                'RECORD_DELETED',
                {
                    id: recordId,
                    patientId: record.patient_id
                }
            );
        }

        return res.json({
            success: true,
            id: recordId,
            message: 'Medical record deleted successfully'
        });
    } catch (err) {
        console.error('[Delete Record Error]:', err);
        return res.status(500).json({
            success: false,
            error: err.message || 'Failed to delete medical record'
        });
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
    deleteRecord,
    proxyFile
};
