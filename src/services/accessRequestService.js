import apiClient from './apiClient';

export const accessRequestService = {
    // DOCTOR: Create an access request in Neon
    async createRequest(doctorInfo, patientId, details = {}) {
        const response = await apiClient.post('/access-requests', {
            patientId,
            globalPatientId: details.globalPatientId || null,
            patientEmail: details.patientEmail || null,
            patientPhone: details.patientPhone || null,
            patientName: details.patientName || null,
            hospital: details.hospital || 'HealthChain Central',
            department: details.department || 'General Medicine',
            reason: details.reason || 'Medical Consultation',
            duration: details.duration || '1 hour',
            urgency: details.urgency || 'Normal'
        });

        if (!response?.success || !response?.requestId) {
            throw new Error(response?.message || 'Failed to create access request.');
        }

        return response.requestId;
    },

    // DOCTOR: Poll a specific request status
    async getRequest(requestId) {
        const response = await apiClient.get(`/access-requests/${encodeURIComponent(requestId)}`);
        return response?.request || null;
    },

    // DOCTOR: Compatibility method replacing the old Firestore listener
    listenToDoctorRequest(requestId, callback, options = {}) {
        let stopped = false;
        const intervalMs = options.intervalMs || 5000;

        const poll = async () => {
            if (stopped) return;

            try {
                const request = await this.getRequest(requestId);
                if (request && !stopped) {
                    callback({
                        id: request.id,
                        ...request,
                        approvedAt: request.responded_at,
                        timestamp: request.requested_at
                    });
                }
            } catch (error) {
                if (!stopped) {
                    console.warn('[accessRequestService] Request status polling:', error.message);
                }
            }
        };

        poll();
        const timer = window.setInterval(poll, intervalMs);

        return () => {
            stopped = true;
            window.clearInterval(timer);
        };
    },

    // PATIENT: Load incoming requests from Neon
    async getPatientRequests() {
        const response = await apiClient.get('/access-requests/patient');
        return response?.requests || [];
    },

    // PATIENT: Poll incoming requests
    listenToPatientRequests(patientIdentifiers, callback, options = {}) {
        let stopped = false;
        const intervalMs = options.intervalMs || 5000;

        const poll = async () => {
            if (stopped) return;

            try {
                const requests = await this.getPatientRequests();

                if (!stopped) {
                    callback(
                        requests.map(request => ({
                            id: request.id,
                            ...request,
                            doctorId: request.doctor_id,
                            doctorName: request.doctor_name,
                            doctorEmail: request.doctor_email,
                            doctorSpecialty: request.doctor_specialty,
                            patientId: request.patient_id,
                            globalPatientId: request.global_patient_id,
                            patientEmail: request.patient_email,
                            patientPhone: request.patient_phone,
                            patientName: request.patient_name,
                            hospitalId: request.hospital_id,
                            hospital: request.hospital,
                            requestedAt: request.requested_at,
                            respondedAt: request.responded_at,
                            expiresAt: request.expires_at,
                            createdAt: request.created_at,
                            updatedAt: request.updated_at
                        }))
                    );
                }
            } catch (error) {
                if (!stopped) {
                    console.warn('[accessRequestService] Patient request polling:', error.message);
                    callback([]);
                }
            }
        };

        poll();
        const timer = window.setInterval(poll, intervalMs);

        return () => {
            stopped = true;
            window.clearInterval(timer);
        };
    },

    // PATIENT: Approve request and receive one-time OTP
    async approveRequestAndGenerateOTP(requestId, patientId) {
        const response = await apiClient.post(
            `/access-requests/${encodeURIComponent(requestId)}/approve`,
            {}
        );

        if (!response?.success || !response?.otpCode) {
            throw new Error(response?.message || 'Failed to approve access request.');
        }

        return response.otpCode;
    },

    // PATIENT: Reject request
    async rejectRequest(requestId, patientId) {
        const response = await apiClient.post(
            `/access-requests/${encodeURIComponent(requestId)}/reject`,
            {}
        );

        if (!response?.success) {
            throw new Error(response?.message || 'Failed to reject access request.');
        }

        return response.request;
    },

    // DOCTOR: Verify OTP and grant access
    async verifyOTPAndGrantAccess(requestId, otpCode, doctorId) {
        const response = await apiClient.post(
            `/access-requests/${encodeURIComponent(requestId)}/verify-otp`,
            { otpCode }
        );

        if (!response?.success || !response?.sessionId) {
            throw new Error(response?.message || 'Failed to verify OTP.');
        }

        return response.sessionId;
    },

    // DOCTOR: Check active access session
    async checkActiveSession(doctorId, patientId) {
        const params = new URLSearchParams();

        if (patientId) {
            params.set('patientId', patientId);
        }

        const response = await apiClient.get(
            `/access-sessions/check?${params.toString()}`
        );

        return Boolean(response?.active);
    },

    // PATIENT: Revoke active access session
    async revokeActiveSession(sessionId, patientId) {
        const response = await apiClient.post(
            `/access-sessions/${encodeURIComponent(sessionId)}/revoke`,
            {}
        );

        if (!response?.success) {
            throw new Error(response?.message || 'Failed to revoke active access session.');
        }

        return response.session;
    },

    // PATIENT: Existing general access-code compatibility method
    async revokeGeneralAccessCode(patientId) {
        try {
            await apiClient.post('/access-code', {
                userId: patientId,
                code: null
            });
        } catch (error) {
            console.warn('[accessRequestService] General access-code revoke:', error.message);
        }
    },

    // Compatibility audit method
    async logAuditActivity(activityType, userId, details = {}) {
        try {
            await apiClient.post('/log', {
                patientId: details.patientId || userId,
                doctorId: details.doctorId || userId,
                accessType: activityType
            });
        } catch (error) {
            console.warn('[accessRequestService] Audit logging:', error.message);
        }
    }
};

export default accessRequestService;
