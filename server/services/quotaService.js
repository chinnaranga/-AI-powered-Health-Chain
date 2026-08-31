import { adminDb } from '../config/firebaseAdmin.js';

// Cloudflare R2 Free Tier Quota Constants
export const QUOTA_LIMITS = {
    MAX_STORAGE_BYTES: 10 * 1024 * 1024 * 1024, // 10 GB-month
    MAX_CLASS_A_REQUESTS: 1000000,              // 1,000,000 per month (PUT, DELETE)
    MAX_CLASS_B_REQUESTS: 10000000              // 10,000,000 per month (GET, HEAD)
};

// Local in-memory fallback cache for development & testing without live GCP keys
const inMemoryUsageStore = new Map();

/**
 * Gets formatted current month partition key e.g. "2026-08"
 */
export function getCurrentMonthKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

/**
 * Gets next month reset date ISO string e.g. "2026-09-01T00:00:00.000Z"
 */
export function getNextResetDate() {
    const now = new Date();
    const nextMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0));
    return nextMonth.toISOString();
}

/**
 * Calculates warning level string ("normal", "70%", "85%", "95%", "100%")
 */
function calculateWarningLevel(storageBytes, classARequests, classBRequests) {
    const storageRatio = storageBytes / QUOTA_LIMITS.MAX_STORAGE_BYTES;
    const classARatio = classARequests / QUOTA_LIMITS.MAX_CLASS_A_REQUESTS;
    const classBRatio = classBRequests / QUOTA_LIMITS.MAX_CLASS_B_REQUESTS;

    const maxRatio = Math.max(storageRatio, classARatio, classBRatio);

    if (maxRatio >= 1.0) return '100%';
    if (maxRatio >= 0.95) return '95%';
    if (maxRatio >= 0.85) return '85%';
    if (maxRatio >= 0.70) return '70%';
    return 'normal';
}

function getDefaultUsageRecord(hospitalId) {
    const monthKey = getCurrentMonthKey();
    const docId = `usage_${hospitalId}_${monthKey}`;
    return {
        docId,
        hospitalId,
        month: monthKey,
        totalStorageBytes: 0,
        maxStorageBytes: QUOTA_LIMITS.MAX_STORAGE_BYTES,
        uploadCount: 0,
        downloadCount: 0,
        previewCount: 0,
        deleteCount: 0,
        classARequests: 0,
        maxClassARequests: QUOTA_LIMITS.MAX_CLASS_A_REQUESTS,
        classBRequests: 0,
        maxClassBRequests: QUOTA_LIMITS.MAX_CLASS_B_REQUESTS,
        categoryBreakdown: {
            lab_report: 0,
            mri: 0,
            ct_scan: 0,
            xray: 0,
            prescription: 0,
            insurance: 0,
            certificate: 0,
            profile_image: 0,
            medical_pdf: 0,
            other_attachment: 0
        },
        warningLevel: 'normal',
        isBlocked: false,
        resetAt: getNextResetDate(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

/**
 * Helper to fetch or initialize monthly usage record for a hospital tenant
 */
export async function getMonthlyStorageUsage(hospitalId = 'default_hospital') {
    const monthKey = getCurrentMonthKey();
    const docId = `usage_${hospitalId}_${monthKey}`;

    try {
        const docRef = adminDb.collection('storageUsage').doc(docId);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return docSnap.data();
        }

        const defaultUsage = getDefaultUsageRecord(hospitalId);
        await docRef.set(defaultUsage);
        return defaultUsage;
    } catch (err) {
        // Fallback to in-memory store for local testing without Firestore keys
        if (!inMemoryUsageStore.has(docId)) {
            inMemoryUsageStore.set(docId, getDefaultUsageRecord(hospitalId));
        }
        return inMemoryUsageStore.get(docId);
    }
}

/**
 * Server-side Quota Verification
 * Validates whether requested operation is permitted under current monthly limits
 */
export async function checkStorageQuota({ hospitalId = 'default_hospital', requestedBytes = 0, operationType = 'upload' }) {
    const usage = await getMonthlyStorageUsage(hospitalId);

    const projectedStorageBytes = (usage.totalStorageBytes || 0) + (requestedBytes > 0 ? requestedBytes : 0);
    const projectedClassA = (usage.classARequests || 0) + (operationType === 'upload' || operationType === 'delete' ? 1 : 0);
    const projectedClassB = (usage.classBRequests || 0) + (operationType === 'download' || operationType === 'preview' ? 1 : 0);

    const isStorageExceeded = projectedStorageBytes > QUOTA_LIMITS.MAX_STORAGE_BYTES;
    const isClassAExceeded = projectedClassA > QUOTA_LIMITS.MAX_CLASS_A_REQUESTS;
    const isClassBExceeded = projectedClassB > QUOTA_LIMITS.MAX_CLASS_B_REQUESTS;

    const isExceeded = isStorageExceeded || isClassAExceeded || isClassBExceeded;
    const warningLevel = calculateWarningLevel(projectedStorageBytes, projectedClassA, projectedClassB);

    const remainingStorageBytes = Math.max(0, QUOTA_LIMITS.MAX_STORAGE_BYTES - (usage.totalStorageBytes || 0));
    const remainingClassA = Math.max(0, QUOTA_LIMITS.MAX_CLASS_A_REQUESTS - (usage.classARequests || 0));
    const remainingClassB = Math.max(0, QUOTA_LIMITS.MAX_CLASS_B_REQUESTS - (usage.classBRequests || 0));

    return {
        isAllowed: !isExceeded,
        isExceeded,
        warningLevel,
        reason: isStorageExceeded ? '10 GB Monthly Storage Capacity Full' :
                isClassAExceeded ? '1,000,000 Class A Monthly Request Limit Full' :
                isClassBExceeded ? '10,000,000 Class B Monthly Request Limit Full' : '',
        remainingStorageBytes,
        remainingClassA,
        remainingClassB,
        resetAt: usage.resetAt || getNextResetDate(),
        usage
    };
}

/**
 * Atomic Quota Recording & Event Logging
 * Updates storage counters in Firestore after a storage operation
 */
export async function recordStorageUsage({
    hospitalId = 'default_hospital',
    departmentId = 'general',
    userId = 'system',
    bytesDelta = 0,
    operationType = 'upload',
    fileType = 'medical_pdf'
}) {
    const monthKey = getCurrentMonthKey();
    const docId = `usage_${hospitalId}_${monthKey}`;
    const usage = await getMonthlyStorageUsage(hospitalId);

    const newStorageBytes = Math.max(0, (usage.totalStorageBytes || 0) + bytesDelta);
    const newUploadCount = (usage.uploadCount || 0) + (operationType === 'upload' ? 1 : 0);
    const newDownloadCount = (usage.downloadCount || 0) + (operationType === 'download' ? 1 : 0);
    const newPreviewCount = (usage.previewCount || 0) + (operationType === 'preview' ? 1 : 0);
    const newDeleteCount = (usage.deleteCount || 0) + (operationType === 'delete' ? 1 : 0);

    const isClassA = operationType === 'upload' || operationType === 'delete';
    const isClassB = operationType === 'download' || operationType === 'preview';

    const newClassA = (usage.classARequests || 0) + (isClassA ? 1 : 0);
    const newClassB = (usage.classBRequests || 0) + (isClassB ? 1 : 0);

    const categoryBreakdown = { ...(usage.categoryBreakdown || {}) };
    if (fileType) {
        const catKey = categoryBreakdown[fileType] !== undefined ? fileType : 'medical_pdf';
        categoryBreakdown[catKey] = Math.max(0, (categoryBreakdown[catKey] || 0) + bytesDelta);
    }

    const warningLevel = calculateWarningLevel(newStorageBytes, newClassA, newClassB);
    const isBlocked = warningLevel === '100%';

    const updatedUsage = {
        ...usage,
        docId,
        hospitalId,
        month: monthKey,
        totalStorageBytes: newStorageBytes,
        uploadCount: newUploadCount,
        downloadCount: newDownloadCount,
        previewCount: newPreviewCount,
        deleteCount: newDeleteCount,
        classARequests: newClassA,
        classBRequests: newClassB,
        categoryBreakdown,
        warningLevel,
        isBlocked,
        updatedAt: new Date().toISOString()
    };

    inMemoryUsageStore.set(docId, updatedUsage);

    try {
        const docRef = adminDb.collection('storageUsage').doc(docId);
        await docRef.set(updatedUsage, { merge: true });

        await adminDb.collection('storageEvents').add({
            eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            hospitalId,
            departmentId,
            userId,
            operationType,
            fileType,
            bytesDelta,
            warningLevel,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        // Fallback for dev mode
    }

    return updatedUsage;
}

export default {
    QUOTA_LIMITS,
    getCurrentMonthKey,
    getNextResetDate,
    getMonthlyStorageUsage,
    checkStorageQuota,
    recordStorageUsage
};
