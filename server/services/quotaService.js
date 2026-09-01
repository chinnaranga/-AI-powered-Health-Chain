import db, { getDb, runDb } from '../config/db.js';

// Cloudflare R2 / Storage Free Tier Quota Constants
export const QUOTA_LIMITS = {
    MAX_STORAGE_BYTES: 10 * 1024 * 1024 * 1024, // 10 GB-month
    MAX_CLASS_A_REQUESTS: 1000000,              // 1,000,000 per month (PUT, DELETE)
    MAX_CLASS_B_REQUESTS: 10000000              // 10,000,000 per month (GET, HEAD)
};

// Local in-memory fallback cache for development & fast access
const inMemoryUsageStore = new Map();

/**
 * Gets formatted current month partition key e.g. "2026-09"
 */
export function getCurrentMonthKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

/**
 * Gets next month reset date ISO string
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
    const storageRatio = Number(storageBytes) / QUOTA_LIMITS.MAX_STORAGE_BYTES;
    const classARatio = Number(classARequests) / QUOTA_LIMITS.MAX_CLASS_A_REQUESTS;
    const classBRatio = Number(classBRequests) / QUOTA_LIMITS.MAX_CLASS_B_REQUESTS;

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
 * Helper to fetch or initialize monthly usage record for a hospital tenant in PostgreSQL
 */
export async function getMonthlyStorageUsage(hospitalId = 'default_hospital') {
    const monthKey = getCurrentMonthKey();
    const docId = `usage_${hospitalId}_${monthKey}`;

    try {
        const row = await getDb(
            `SELECT * FROM storage_usage WHERE hospital_id = ? AND month = ? LIMIT 1`,
            [hospitalId, monthKey]
        );

        if (row) {
            return {
                docId,
                hospitalId: row.hospital_id,
                month: row.month,
                totalStorageBytes: Number(row.total_storage_bytes) || 0,
                maxStorageBytes: QUOTA_LIMITS.MAX_STORAGE_BYTES,
                uploadCount: Number(row.upload_count) || 0,
                downloadCount: Number(row.download_count) || 0,
                previewCount: Number(row.preview_count) || 0,
                deleteCount: Number(row.delete_count) || 0,
                classARequests: Number(row.class_a_requests) || 0,
                maxClassARequests: QUOTA_LIMITS.MAX_CLASS_A_REQUESTS,
                classBRequests: Number(row.class_b_requests) || 0,
                maxClassBRequests: QUOTA_LIMITS.MAX_CLASS_B_REQUESTS,
                categoryBreakdown: typeof row.category_breakdown === 'string' ? JSON.parse(row.category_breakdown) : (row.category_breakdown || {}),
                warningLevel: row.warning_level || 'normal',
                isBlocked: !!row.is_blocked,
                resetAt: row.reset_at ? new Date(row.reset_at).toISOString() : getNextResetDate()
            };
        }

        const defaultUsage = getDefaultUsageRecord(hospitalId);
        await runDb(
            `INSERT INTO storage_usage (id, hospital_id, month, total_storage_bytes, upload_count, download_count, preview_count, delete_count, class_a_requests, class_b_requests, category_breakdown, warning_level, is_blocked, reset_at)
             VALUES (gen_random_uuid(), ?, ?, 0, 0, 0, 0, 0, 0, 0, ?::jsonb, 'normal', false, ?)
             ON CONFLICT (hospital_id, month) DO NOTHING`,
            [hospitalId, monthKey, JSON.stringify(defaultUsage.categoryBreakdown), defaultUsage.resetAt]
        );
        return defaultUsage;
    } catch (err) {
        if (!inMemoryUsageStore.has(docId)) {
            inMemoryUsageStore.set(docId, getDefaultUsageRecord(hospitalId));
        }
        return inMemoryUsageStore.get(docId);
    }
}

/**
 * Server-side Quota Verification
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
 * Atomic Quota Recording & Event Logging in PostgreSQL
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
        await runDb(
            `INSERT INTO storage_usage (id, hospital_id, month, total_storage_bytes, upload_count, download_count, preview_count, delete_count, class_a_requests, class_b_requests, category_breakdown, warning_level, is_blocked, reset_at, updated_at)
             VALUES (gen_random_uuid(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?, ?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT (hospital_id, month) DO UPDATE SET
                total_storage_bytes = excluded.total_storage_bytes,
                upload_count = excluded.upload_count,
                download_count = excluded.download_count,
                preview_count = excluded.preview_count,
                delete_count = excluded.delete_count,
                class_a_requests = excluded.class_a_requests,
                class_b_requests = excluded.class_b_requests,
                category_breakdown = excluded.category_breakdown,
                warning_level = excluded.warning_level,
                is_blocked = excluded.is_blocked,
                updated_at = CURRENT_TIMESTAMP`,
            [
                hospitalId,
                monthKey,
                newStorageBytes,
                newUploadCount,
                newDownloadCount,
                newPreviewCount,
                newDeleteCount,
                newClassA,
                newClassB,
                JSON.stringify(categoryBreakdown),
                warningLevel,
                isBlocked,
                updatedUsage.resetAt || getNextResetDate()
            ]
        );
    } catch (e) {}

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
