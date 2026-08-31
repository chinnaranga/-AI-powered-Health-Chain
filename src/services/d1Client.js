/**
 * HealthChain Cloudflare D1 SQL Database Client
 * Replaces Firestore client SDKs with secure Cloudflare Worker D1 API calls.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getAuthHeaders() {
    const token = localStorage.getItem('hc_cf_jwt');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`
    };
}

export const d1Client = {
    /**
     * Query records from Cloudflare D1 database
     */
    getRecords: async ({ patientId, hospitalId, category } = {}) => {
        try {
            const params = new URLSearchParams();
            if (patientId) params.append('patientId', patientId);
            if (hospitalId) params.append('hospitalId', hospitalId);
            if (category) params.append('category', category);

            const res = await fetch(`${API_BASE}/d1/records?${params.toString()}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await res.json();
            return data.records || [];
        } catch (err) {
            console.warn('[Cloudflare D1 notice]', err.message);
            return [];
        }
    },

    /**
     * Insert a new record into Cloudflare D1 SQL
     */
    insertRecord: async (recordData) => {
        const res = await fetch(`${API_BASE}/d1/records`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(recordData)
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.message || 'Failed to save record to Cloudflare D1 SQL.');
        }

        return data.record;
    },

    /**
     * Fetch Audit Logs from Cloudflare D1 SQL
     */
    getAuditLogs: async (hospitalId = 'all') => {
        try {
            const res = await fetch(`${API_BASE}/d1/audit-logs?hospitalId=${hospitalId}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await res.json();
            return data.auditLogs || [];
        } catch (err) {
            console.warn('[Cloudflare D1 Audit notice]', err.message);
            return [];
        }
    }
};

export default d1Client;
