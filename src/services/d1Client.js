import { apiClient } from './apiClient';

/**
 * HealthChain Database Client Adapter
 * Routes calls to Neon PostgreSQL backend API.
 */

export const d1Client = {
    /**
     * Query records from Neon PostgreSQL database
     */
    getRecords: async ({ patientId, hospitalId, category } = {}) => {
        try {
            const params = new URLSearchParams();
            if (patientId) params.append('patientId', patientId);
            if (hospitalId) params.append('hospitalId', hospitalId);
            if (category) params.append('category', category);

            const res = await apiClient.get(`/records?${params.toString()}`);
            return Array.isArray(res) ? res : (res.records || []);
        } catch (err) {
            console.warn('[Database notice]', err.message);
            return [];
        }
    },

    /**
     * Insert a new record into Neon PostgreSQL
     */
    insertRecord: async (recordData) => {
        const data = await apiClient.post('/records', recordData);
        if (!data.success && !data.id) {
            throw new Error(data.message || 'Failed to save record to Neon PostgreSQL.');
        }
        return data.record || data;
    },

    /**
     * Fetch Audit Logs from Neon PostgreSQL
     */
    getAuditLogs: async (hospitalId = 'all') => {
        try {
            const data = await apiClient.get(`/log/history?hospitalId=${hospitalId}`);
            return data.logs || data.auditLogs || [];
        } catch (err) {
            console.warn('[Audit notice]', err.message);
            return [];
        }
    }
};

export default d1Client;
