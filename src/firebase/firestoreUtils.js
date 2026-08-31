import { apiClient } from '../services/apiClient';

/**
 * HealthChain Cloudflare D1 Data Utilities Adapter
 * Replaces Firestore document operations with Cloudflare D1 relational queries.
 */

export async function getDocument(collectionName, docId) {
    try {
        const data = await apiClient.get(`/d1/data/${collectionName}/${docId}`);
        return data.record || null;
    } catch (e) {
        return null;
    }
}

export async function setDocument(collectionName, docId, data) {
    try {
        return await apiClient.post(`/d1/data/${collectionName}/${docId}`, data);
    } catch (e) {
        return { success: false, error: e.message };
    }
}

export default {
    getDocument,
    setDocument
};
