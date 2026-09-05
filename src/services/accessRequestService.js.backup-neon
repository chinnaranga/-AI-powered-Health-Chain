import { db } from '../firebase/config';
import { 
    collection, addDoc, updateDoc, doc, getDoc, getDocs, 
    query, where, onSnapshot, serverTimestamp, setDoc
} from 'firebase/firestore';

export const accessRequestService = {
    // DOCTOR: Create an access request
    async createRequest(doctorInfo, patientId, details) {
        try {
            // Strip any undefined values to prevent Firestore errors
            const sanitize = (obj) => Object.fromEntries(
                Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
            );

            const requestData = sanitize({
                doctorId: doctorInfo.uid || doctorInfo.id,
                doctorName: doctorInfo.displayName || doctorInfo.name || 'Dr. Attending Physician',
                doctorEmail: doctorInfo.email || '',
                patientId: patientId,
                globalPatientId: details.globalPatientId || (patientId?.startsWith('HCG-') ? patientId : null),
                patientEmail: details.patientEmail || (patientId?.includes('@') ? patientId : null),
                patientPhone: details.patientPhone || null,
                patientName: details.patientName || null,
                hospital: details.hospital || 'HealthChain Central',
                department: details.department || 'General Medicine',
                reason: details.reason || 'Medical Consultation',
                duration: details.duration || '1 hour',
                urgency: details.urgency || 'Normal',
                status: 'pending',
                timestamp: serverTimestamp(),
            });

            const docRef = await addDoc(collection(db, 'accessRequests'), requestData);
            
            // Log to audit
            await this.logAuditActivity('ACCESS_REQUEST_CREATED', doctorInfo.uid || doctorInfo.id, {
                requestId: docRef.id,
                patientId,
                patientEmail: details.patientEmail,
                patientPhone: details.patientPhone,
                urgency: details.urgency || 'Normal'
            });

            return docRef.id;
        } catch (error) {
            console.error('Error creating access request:', error);
            throw error;
        }
    },

    // DOCTOR: Listen to a specific request status
    listenToDoctorRequest(requestId, callback) {
        const docRef = doc(db, 'accessRequests', requestId);
        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                callback({ id: docSnap.id, ...docSnap.data() });
            }
        });
    },

    // PATIENT: Listen to incoming pending requests across all matching identifiers (Email, Phone, Name, Global ID, UID)
    listenToPatientRequests(patientIdentifiers, callback) {
        const idList = (Array.isArray(patientIdentifiers) ? patientIdentifiers : [patientIdentifiers])
            .filter(Boolean)
            .map(id => String(id).trim().toLowerCase());

        if (idList.length === 0) return () => {};

        const q = query(
            collection(db, 'accessRequests'), 
            where('status', 'in', ['pending', 'approved'])
        );
        return onSnapshot(q, (snapshot) => {
            const requests = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(r => {
                    const reqPatientId = (r.patientId || '').toLowerCase();
                    const reqGlobalId = (r.globalPatientId || '').toLowerCase();
                    const reqEmail = (r.patientEmail || '').toLowerCase();
                    const reqPhone = (r.patientPhone || '').replace(/[^0-9]/g, '');
                    const reqName = (r.patientName || '').toLowerCase();

                    return idList.some(id => {
                        const cleanId = id.replace(/[^0-9]/g, '');
                        return (
                            id === reqPatientId ||
                            id === reqGlobalId ||
                            id === reqEmail ||
                            (reqName && reqName.includes(id)) ||
                            (cleanId.length >= 8 && reqPhone.includes(cleanId.slice(-8)))
                        );
                    });
                });
            callback(requests);
        }, (err) => {
            console.warn('[accessRequestService] Realtime sync notice:', err.message);
        });
    },

    // PATIENT: Approve a request and generate OTP
    async approveRequestAndGenerateOTP(requestId, patientId) {
        try {
            // 1. Update request status
            const requestRef = doc(db, 'accessRequests', requestId);
            await updateDoc(requestRef, {
                status: 'approved',
                approvedAt: serverTimestamp()
            });

            // 2. Generate 6 digit OTP
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            // 3. Create OTP session
            const otpData = {
                requestId: requestId,
                patientId: patientId,
                code: otpCode,
                active: true,
                createdAt: serverTimestamp(),
                expiresAt: new Date(Date.now() + 15 * 60000), // 15 mins expiry
            };
            await setDoc(doc(db, 'otpSessions', requestId), otpData);

            // Log to audit
            await this.logAuditActivity('REQUEST_APPROVED_OTP_GENERATED', patientId, { requestId });

            return otpCode;
        } catch (error) {
            console.error('Error approving request:', error);
            throw error;
        }
    },

    // PATIENT: Reject a request
    async rejectRequest(requestId, patientId) {
        try {
            const requestRef = doc(db, 'accessRequests', requestId);
            await updateDoc(requestRef, {
                status: 'rejected',
                rejectedAt: serverTimestamp()
            });

            // Log to audit
            await this.logAuditActivity('REQUEST_REJECTED', patientId, { requestId });
        } catch (error) {
            console.error('Error rejecting request:', error);
            throw error;
        }
    },

    // DOCTOR: Verify OTP and grant access
    async verifyOTPAndGrantAccess(requestId, otpCode, doctorId) {
        try {
            // 1. Fetch the OTP session
            const otpRef = doc(db, 'otpSessions', requestId);
            const otpSnap = await getDoc(otpRef);

            if (!otpSnap.exists()) {
                throw new Error('OTP session not found or expired.');
            }

            const otpData = otpSnap.data();

            // 2. Validate OTP
            if (!otpData.active) {
                throw new Error('This OTP is no longer active.');
            }
            if (otpData.code !== otpCode) {
                throw new Error('Invalid OTP code.');
            }
            if (otpData.expiresAt.toDate() < new Date()) {
                await updateDoc(otpRef, { active: false });
                throw new Error('OTP has expired.');
            }

            // 3. Mark OTP as used
            await updateDoc(otpRef, { active: false });

            // Also update the original accessRequest status to 'used'
            try {
                const requestRef = doc(db, 'accessRequests', requestId);
                await updateDoc(requestRef, { status: 'used' });
            } catch (err) {
                console.warn('Failed to update access request status to used:', err);
            }

            // 4. Create active session
            const activeSessionData = {
                requestId: requestId,
                doctorId: doctorId,
                patientId: otpData.patientId,
                active: true,
                grantedAt: serverTimestamp(),
                // In MVP we use a default duration, can be pulled from request details
                expiresAt: new Date(Date.now() + 60 * 60000) // 1 hour access
            };
            const sessionRef = await addDoc(collection(db, 'activeSessions'), activeSessionData);

            // 5. Log to audit
            await this.logAuditActivity('OTP_VERIFIED_ACCESS_GRANTED', doctorId, {
                requestId,
                sessionId: sessionRef.id,
                patientId: otpData.patientId
            });

            return sessionRef.id;
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw error;
        }
    },

    // DOCTOR: Check if active session exists
    async checkActiveSession(doctorId, patientId) {
        const q = query(
            collection(db, 'activeSessions'),
            where('doctorId', '==', doctorId),
            where('patientId', '==', patientId),
            where('active', '==', true)
        );
        const snapshot = await getDocs(q);
        
        // Filter out expired sessions
        const validSessions = snapshot.docs.filter(doc => doc.data().expiresAt.toDate() > new Date());
        return validSessions.length > 0;
    },

    // PATIENT: Revoke an active session
    async revokeActiveSession(sessionId, patientId) {
        try {
            const sessionRef = doc(db, 'activeSessions', sessionId);
            await updateDoc(sessionRef, {
                active: false,
                revokedAt: serverTimestamp()
            });

            // Log to audit
            await this.logAuditActivity('SESSION_REVOKED', patientId, { sessionId });
        } catch (error) {
            console.error('Error revoking active session:', error);
            throw error;
        }
    },

    // PATIENT: Revoke/Clear general access code
    async revokeGeneralAccessCode(patientId) {
        try {
            const userRef = doc(db, 'users', patientId);
            await updateDoc(userRef, {
                accessCode: null
            });

            // Log to audit
            await this.logAuditActivity('GENERAL_ACCESS_CODE_REVOKED', patientId);
        } catch (error) {
            console.error('Error revoking general access code:', error);
            throw error;
        }
    },

    // Helper: Log to Audit/Blockchain
    async logAuditActivity(activityType, userId, details) {
        try {
            const chars = '0123456789abcdef';
            let txHash = '0x';
            for (let i = 0; i < 64; i++) {
                txHash += chars[Math.floor(Math.random() * 16)];
            }

            await addDoc(collection(db, 'auditLogs'), {
                timestamp: serverTimestamp(),
                activityType,
                userId,
                details: details || {},
                txHash
            });
        } catch (error) {
            console.error("Audit logging failed", error);
        }
    }
};
