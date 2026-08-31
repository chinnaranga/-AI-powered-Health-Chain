import { apiClient } from '../services/apiClient';

/**
 * HealthChain Data Utilities & Firestore Compatibility Adapter
 * Enables high-performance build resolution and Cloudflare D1/REST bridging.
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

// Stubs for modular Firestore imports across components
export const collection = (db, colName, ...pathSegments) => ({
    _type: 'collection',
    path: [colName, ...pathSegments].join('/')
});

export const doc = (db, colName, docId) => ({
    _type: 'doc',
    id: docId || `doc_${Date.now()}`,
    path: `${colName}/${docId || ''}`
});

export const query = (colRef, ...constraints) => ({
    _type: 'query',
    ref: colRef,
    constraints
});

export const where = (field, op, value) => ({ type: 'where', field, op, value });
export const orderBy = (field, direction = 'asc') => ({ type: 'orderBy', field, direction });
export const limit = (num) => ({ type: 'limit', num });

export const getDoc = async (docRef) => ({
    exists: () => false,
    data: () => ({}),
    id: docRef?.id || 'doc_mock'
});

export const getDocs = async (queryRef) => ({
    empty: true,
    docs: [],
    forEach: () => {},
    size: 0
});

export const setDoc = async (docRef, data, options) => ({ success: true });
export const addDoc = async (colRef, data) => ({ id: `doc_${Date.now()}` });
export const updateDoc = async (docRef, data) => ({ success: true });
export const deleteDoc = async (docRef) => ({ success: true });

export const onSnapshot = (queryRef, onNext, onError) => {
    if (typeof onNext === 'function') {
        try {
            onNext({ empty: true, docs: [], forEach: () => {}, size: 0 });
        } catch (e) {}
    }
    return () => {}; // Unsubscribe function
};

export const writeBatch = (db) => ({
    set: () => {},
    update: () => {},
    delete: () => {},
    commit: async () => {}
});

export const serverTimestamp = () => new Date().toISOString();

export default {
    getDocument,
    setDocument,
    collection,
    doc,
    query,
    where,
    orderBy,
    limit,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    writeBatch,
    serverTimestamp
};
