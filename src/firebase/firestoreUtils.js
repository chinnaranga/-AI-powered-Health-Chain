import { apiClient } from '../services/apiClient';

/**
 * HealthChain Data Utilities & Real-Time Reactive Store Adapter
 * Provides local persistent document storage with instant reactive onSnapshot subscriptions.
 */

const STORAGE_PREFIX = 'hc_db_';
const DB_CHANGE_EVENT = 'hc_firestore_reactive_update';

// Helper to get collection documents from persistent localStorage
function getCollectionDocs(colPath) {
    if (!colPath) return [];
    const cleanPath = String(colPath).replace(/^\/+|\/+$/g, '').split('/')[0];
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + cleanPath);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (e) {}
    return [];
}

// Helper to save collection documents to persistent localStorage and notify listeners
function saveCollectionDocs(colPath, docs) {
    if (!colPath) return;
    const cleanPath = String(colPath).replace(/^\/+|\/+$/g, '').split('/')[0];
    try {
        localStorage.setItem(STORAGE_PREFIX + cleanPath, JSON.stringify(docs));
    } catch (e) {}
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(DB_CHANGE_EVENT, { detail: { collection: cleanPath } }));
    }
}

export async function getDocument(collectionName, docId) {
    const docs = getCollectionDocs(collectionName);
    const found = docs.find(d => d.id === docId);
    if (found) return found;
    try {
        const data = await apiClient.get(`/d1/data/${collectionName}/${docId}`);
        return data.record || null;
    } catch (e) {
        return null;
    }
}

export async function setDocument(collectionName, docId, data) {
    const docs = getCollectionDocs(collectionName);
    const index = docs.findIndex(d => d.id === docId);
    const docData = { ...(index >= 0 ? docs[index] : {}), ...data, id: docId };
    if (index >= 0) {
        docs[index] = docData;
    } else {
        docs.push(docData);
    }
    saveCollectionDocs(collectionName, docs);
    try {
        return await apiClient.post(`/d1/data/${collectionName}/${docId}`, data);
    } catch (e) {
        return { success: true };
    }
}

// Modular Firestore Constructors
export const collection = (db, colName, ...pathSegments) => {
    const colPath = [colName, ...pathSegments].filter(Boolean).join('/');
    return {
        _type: 'collection',
        path: colPath,
        id: colName
    };
};

export const doc = (db, colName, docId) => {
    let colPath = colName;
    let targetId = docId;
    if (colName && typeof colName === 'object' && colName.path) {
        colPath = colName.path;
    }
    if (!targetId) {
        targetId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    }
    return {
        _type: 'doc',
        id: targetId,
        path: `${colPath}/${targetId}`
    };
};

export const query = (colRef, ...constraints) => {
    return {
        _type: 'query',
        path: colRef?.path || 'records',
        ref: colRef,
        constraints: constraints.filter(Boolean)
    };
};

export const where = (field, op, value) => ({ type: 'where', field, op, value });
export const orderBy = (field, direction = 'asc') => ({ type: 'orderBy', field, direction });
export const limit = (num) => ({ type: 'limit', num });
export const limitToLast = (num) => ({ type: 'limitToLast', num });
export const startAfter = (...values) => ({ type: 'startAfter', values });
export const startAt = (...values) => ({ type: 'startAt', values });
export const endAt = (...values) => ({ type: 'endAt', values });
export const endBefore = (...values) => ({ type: 'endBefore', values });

// Helper to filter documents according to Firestore constraints
function executeQueryInMemory(colPath, constraints = []) {
    let results = [...getCollectionDocs(colPath)];

    for (const c of constraints) {
        if (!c) continue;
        if (c.type === 'where') {
            results = results.filter(doc => {
                const docVal = doc[c.field];
                if (c.op === '==' || c.op === '===') {
                    return docVal === c.value || (!docVal && !c.value);
                }
                if (c.op === '!=') return docVal !== c.value;
                if (c.op === 'in') return Array.isArray(c.value) && c.value.includes(docVal);
                if (c.op === 'array-contains') return Array.isArray(docVal) && docVal.includes(c.value);
                if (c.op === '>') return docVal > c.value;
                if (c.op === '>=') return docVal >= c.value;
                if (c.op === '<') return docVal < c.value;
                if (c.op === '<=') return docVal <= c.value;
                return true;
            });
        } else if (c.type === 'orderBy') {
            results.sort((a, b) => {
                const valA = a[c.field] || 0;
                const valB = b[c.field] || 0;
                if (c.direction === 'desc') {
                    return valA < valB ? 1 : valA > valB ? -1 : 0;
                }
                return valA > valB ? 1 : valA < valB ? -1 : 0;
            });
        } else if (c.type === 'limit') {
            results = results.slice(0, c.num);
        }
    }

    return results;
}

export const getDoc = async (docRef) => {
    if (!docRef) return { exists: () => false, data: () => ({}), id: 'unknown' };
    const parts = (docRef.path || '').split('/');
    const colName = parts[0] || 'records';
    const docId = docRef.id || parts[1];
    
    const docs = getCollectionDocs(colName);
    const found = docs.find(d => d.id === docId);
    if (found) {
        return {
            exists: () => true,
            data: () => found,
            id: found.id
        };
    }
    return {
        exists: () => false,
        data: () => ({}),
        id: docId || 'doc_mock'
    };
};

export const getDocs = async (queryRef) => {
    const colPath = queryRef?.path || (queryRef?.ref?.path) || 'records';
    const constraints = queryRef?.constraints || [];
    const docs = executeQueryInMemory(colPath, constraints);
    
    return {
        empty: docs.length === 0,
        docs: docs.map(d => ({
            id: d.id,
            data: () => d,
            exists: () => true
        })),
        forEach: (fn) => docs.forEach(d => fn({ id: d.id, data: () => d, exists: () => true })),
        size: docs.length
    };
};

export const setDoc = async (docRef, data, options = {}) => {
    const parts = (docRef?.path || '').split('/');
    const colName = parts[0] || 'records';
    const docId = docRef?.id || parts[1] || `doc_${Date.now()}`;
    
    const docs = getCollectionDocs(colName);
    const index = docs.findIndex(d => d.id === docId);
    
    let updated;
    if (index >= 0) {
        updated = options.merge ? { ...docs[index], ...data, id: docId } : { ...data, id: docId };
        docs[index] = updated;
    } else {
        updated = { ...data, id: docId };
        docs.push(updated);
    }
    
    saveCollectionDocs(colName, docs);
    return { success: true, id: docId };
};

export const addDoc = async (colRef, data) => {
    const colName = colRef?.path || 'records';
    const docId = `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    
    const newDoc = {
        ...data,
        id: docId,
        createdAt: data.createdAt || { seconds: Math.floor(Date.now() / 1000) },
        timestamp: data.timestamp || Date.now()
    };
    
    const docs = getCollectionDocs(colName);
    docs.unshift(newDoc);
    saveCollectionDocs(colName, docs);
    
    return { id: docId };
};

export const updateDoc = async (docRef, data) => {
    const parts = (docRef?.path || '').split('/');
    const colName = parts[0] || 'records';
    const docId = docRef?.id || parts[1];
    
    const docs = getCollectionDocs(colName);
    const index = docs.findIndex(d => d.id === docId);
    if (index >= 0) {
        docs[index] = { ...docs[index], ...data, id: docId, updatedAt: new Date().toISOString() };
        saveCollectionDocs(colName, docs);
    }
    return { success: true };
};

export const deleteDoc = async (docRef) => {
    const parts = (docRef?.path || '').split('/');
    const colName = parts[0] || 'records';
    const docId = docRef?.id || parts[1];
    
    const docs = getCollectionDocs(colName);
    const filtered = docs.filter(d => d.id !== docId);
    saveCollectionDocs(colName, filtered);
    return { success: true };
};

export const handleFirebaseError = (err, context = 'Operation') => {
    console.error(`[Firestore Error - ${context}]:`, err);
    return err;
};

export const setDocSafe = async (docRef, data, options = {}, context = '') => {
    try {
        return await setDoc(docRef, data, options);
    } catch (err) {
        handleFirebaseError(err, context);
        throw err;
    }
};

export const getDocSafe = async (docRef, context = '') => {
    try {
        return await getDoc(docRef);
    } catch (err) {
        handleFirebaseError(err, context);
        throw err;
    }
};

export const updateDocSafe = async (docRef, data, context = '') => {
    try {
        return await updateDoc(docRef, data);
    } catch (err) {
        handleFirebaseError(err, context);
        throw err;
    }
};

export const deleteDocSafe = async (docRef, context = '') => {
    try {
        return await deleteDoc(docRef);
    } catch (err) {
        handleFirebaseError(err, context);
        throw err;
    }
};

export const addDocSafe = async (colRef, data, context = '') => {
    try {
        return await addDoc(colRef, data);
    } catch (err) {
        handleFirebaseError(err, context);
        throw err;
    }
};

export const getDocsSafe = async (queryRef, context = '') => {
    try {
        return await getDocs(queryRef);
    } catch (err) {
        handleFirebaseError(err, context);
        throw err;
    }
};

export const arrayUnion = (...elements) => ({ _methodName: 'arrayUnion', elements });
export const arrayRemove = (...elements) => ({ _methodName: 'arrayRemove', elements });
export const increment = (n) => ({ _methodName: 'increment', value: n });
export const deleteField = () => ({ _methodName: 'deleteField' });

export const Timestamp = {
    now: () => ({
        toMillis: () => Date.now(),
        toDate: () => new Date(),
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0
    }),
    fromDate: (d) => ({
        toMillis: () => (d instanceof Date ? d.getTime() : Date.now()),
        toDate: () => (d instanceof Date ? d : new Date(d)),
        seconds: Math.floor((d instanceof Date ? d.getTime() : Date.now()) / 1000),
        nanoseconds: 0
    }),
    fromMillis: (ms) => ({
        toMillis: () => ms,
        toDate: () => new Date(ms),
        seconds: Math.floor(ms / 1000),
        nanoseconds: 0
    })
};

export const runTransaction = async (db, updateFunction) => {
    return await updateFunction({
        get: async (ref) => await getDoc(ref),
        set: (ref, data) => setDoc(ref, data),
        update: (ref, data) => updateDoc(ref, data),
        delete: (ref) => deleteDoc(ref)
    });
};

export const getCountFromServer = async (queryRef) => {
    const snap = await getDocs(queryRef);
    return {
        data: () => ({ count: snap.size })
    };
};

// Real-Time Reactive onSnapshot listener with automatic UI push
export const onSnapshot = (queryRef, onNext, onError) => {
    const rawPath = queryRef?.path || (queryRef?.ref?.path) || 'records';
    const isDoc = queryRef?._type === 'doc' || rawPath.split('/').filter(Boolean).length % 2 === 0;
    const constraints = queryRef?.constraints || [];

    const emitSnapshot = () => {
        if (typeof onNext !== 'function') return;
        try {
            if (isDoc) {
                const parts = rawPath.split('/').filter(Boolean);
                const colName = parts[0];
                const docId = parts[1] || queryRef?.id;
                const docs = getCollectionDocs(colName);
                const docFound = docs.find(d => d.id === docId);
                const docSnapshot = {
                    id: docId,
                    exists: () => !!docFound,
                    data: () => docFound || null
                };
                onNext(docSnapshot);
            } else {
                const rawDocs = executeQueryInMemory(rawPath, constraints);
                const snapshot = {
                    empty: rawDocs.length === 0,
                    docs: rawDocs.map(d => ({
                        id: d.id,
                        data: () => d,
                        exists: () => true
                    })),
                    forEach: (fn) => rawDocs.forEach(d => fn({ id: d.id, data: () => d, exists: () => true })),
                    size: rawDocs.length
                };
                onNext(snapshot);
            }
        } catch (e) {
            if (typeof onError === 'function') onError(e);
        }
    };

    // 1. Initial snapshot trigger
    setTimeout(emitSnapshot, 0);

    // 2. Reactive event listener when documents are created / updated / deleted
    const handleDbChange = (e) => {
        const changedCol = e?.detail?.collection;
        const targetClean = String(rawPath).replace(/^\/+|\/+$/g, '').split('/')[0];
        if (!changedCol || changedCol === targetClean) {
            emitSnapshot();
        }
    };

    if (typeof window !== 'undefined') {
        window.addEventListener(DB_CHANGE_EVENT, handleDbChange);
    }

    // 3. Return Unsubscribe function
    return () => {
        if (typeof window !== 'undefined') {
            window.removeEventListener(DB_CHANGE_EVENT, handleDbChange);
        }
    };
};

export const writeBatch = (db) => {
    const operations = [];
    return {
        set: (docRef, data) => operations.push(() => setDoc(docRef, data)),
        update: (docRef, data) => operations.push(() => updateDoc(docRef, data)),
        delete: (docRef) => operations.push(() => deleteDoc(docRef)),
        commit: async () => {
            for (const op of operations) {
                await op();
            }
        }
    };
};

export const serverTimestamp = () => ({
    seconds: Math.floor(Date.now() / 1000),
    nanoseconds: 0,
    toDate: () => new Date()
});

export const getFirestore = () => ({});
export const setLogLevel = () => {};

export default {
    getDocument,
    setDocument,
    collection,
    doc,
    query,
    where,
    orderBy,
    limit,
    limitToLast,
    startAfter,
    startAt,
    endAt,
    endBefore,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    handleFirebaseError,
    setDocSafe,
    getDocSafe,
    updateDocSafe,
    deleteDocSafe,
    addDocSafe,
    getDocsSafe,
    arrayUnion,
    arrayRemove,
    increment,
    deleteField,
    Timestamp,
    runTransaction,
    getCountFromServer,
    onSnapshot,
    writeBatch,
    serverTimestamp,
    getFirestore,
    setLogLevel
};
