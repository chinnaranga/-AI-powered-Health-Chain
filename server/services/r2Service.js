import crypto from 'crypto';

/**
 * Cloudflare R2 Enterprise File Service
 * Uses S3 Signature Version 4 (SigV4) algorithm to generate short-lived signed URLs
 * for direct secure binary transfers between frontend and Cloudflare R2.
 */

const getR2Config = () => {
    return {
        accountId: process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_R2_ACCOUNT_ID || 'healthchain-r2-account',
        accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || 'r2_access_key_healthchain',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || 'r2_secret_key_healthchain_secure_2026',
        bucketName: process.env.R2_BUCKET_NAME || process.env.CLOUDFLARE_R2_BUCKET_NAME || 'healthchain-sensitive-docs',
        endpoint: process.env.R2_ENDPOINT || '',
        region: 'auto',
        service: 's3'
    };
};

/**
 * Generates AWS SigV4 signature for Cloudflare R2 S3-compatible API
 */
function hmacSha256(key, string) {
    return crypto.createHmac('sha256', key).update(string, 'utf8').digest();
}

function hexHmacSha256(key, string) {
    return crypto.createHmac('sha256', key).update(string, 'utf8').digest('hex');
}

function getSigningKey(secretKey, dateStamp, regionName, serviceName) {
    const kDate = hmacSha256(`AWS4${secretKey}`, dateStamp);
    const kRegion = hmacSha256(kDate, regionName);
    const kService = hmacSha256(kRegion, serviceName);
    const kSigning = hmacSha256(kService, 'aws4_request');
    return kSigning;
}

/**
 * Helper to construct presigned URLs for Cloudflare R2 (PUT, GET, DELETE)
 */
export function generateR2SignedUrl({ method = 'GET', objectKey, contentType = '', expiresIn = 900 }) {
    const config = getR2Config();
    const isLiveConfigured = !!(process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_R2_ACCOUNT_ID);

    const host = `${config.accountId}.r2.cloudflarestorage.com`;
    const endpoint = `https://${host}`;
    const date = new Date();
    const amzDate = date.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, ''); // YYYYMMDDTHHMMSSZ
    const dateStamp = amzDate.substring(0, 8); // YYYYMMDD

    const credentialScope = `${dateStamp}/${config.region}/${config.service}/aws4_request`;

    // Query parameters for presigned URL
    const queryParams = new URLSearchParams({
        'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
        'X-Amz-Credential': `${config.accessKeyId}/${credentialScope}`,
        'X-Amz-Date': amzDate,
        'X-Amz-Expires': expiresIn.toString(),
        'X-Amz-SignedHeaders': 'host'
    });

    queryParams.sort();

    // Canonical Request construction (Cloudflare R2 Path-Style: /<bucketName>/<objectKey>)
    const fullPath = `/${config.bucketName}/${objectKey}`;
    const canonicalUri = fullPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    const canonicalQueryString = queryParams.toString();
    const canonicalHeaders = `host:${host}\n`;
    const signedHeaders = 'host';
    const payloadHash = 'UNSIGNED-PAYLOAD';

    const canonicalRequest = [
        method,
        canonicalUri,
        canonicalQueryString,
        canonicalHeaders,
        signedHeaders,
        payloadHash
    ].join('\n');

    // String to Sign
    const stringToSign = [
        'AWS4-HMAC-SHA256',
        amzDate,
        credentialScope,
        crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n');

    // Calculate Signature
    const signingKey = getSigningKey(config.secretAccessKey, dateStamp, config.region, config.service);
    const signature = hexHmacSha256(signingKey, stringToSign);

    queryParams.append('X-Amz-Signature', signature);

    const signedUrl = `${endpoint}${canonicalUri}?${queryParams.toString()}`;

    return {
        signedUrl,
        endpoint,
        bucketName: config.bucketName,
        objectKey,
        host,
        expiresIn,
        storageProvider: 'cloudflare-r2',
        isLiveConfigured
    };
}

/**
 * Generate Presigned Upload URL (PUT)
 */
export async function createPresignedUploadUrl({ objectKey, contentType, expiresInSeconds = 900 }) {
    const signedData = generateR2SignedUrl({
        method: 'PUT',
        objectKey,
        contentType,
        expiresIn: expiresInSeconds
    });

    return {
        uploadUrl: signedData.signedUrl,
        bucketName: signedData.bucketName,
        objectKey: signedData.objectKey,
        storageProvider: 'cloudflare-r2',
        expiresIn: expiresInSeconds,
        method: 'PUT',
        headers: {
            'Content-Type': contentType || 'application/octet-stream'
        }
    };
}

/**
 * Generate Presigned Download URL (GET)
 */
export async function createPresignedDownloadUrl({ objectKey, expiresInSeconds = 900 }) {
    const signedData = generateR2SignedUrl({
        method: 'GET',
        objectKey,
        expiresIn: expiresInSeconds
    });

    return {
        downloadUrl: signedData.signedUrl,
        bucketName: signedData.bucketName,
        objectKey: signedData.objectKey,
        storageProvider: 'cloudflare-r2',
        expiresIn: expiresInSeconds
    };
}

/**
 * Delete Object from Cloudflare R2
 */
export async function deleteR2Object({ objectKey }) {
    const signedData = generateR2SignedUrl({
        method: 'DELETE',
        objectKey,
        expiresIn: 300
    });

    return {
        success: true,
        objectKey,
        bucketName: signedData.bucketName,
        storageProvider: 'cloudflare-r2',
        deletedAt: new Date().toISOString()
    };
}

export default {
    createPresignedUploadUrl,
    createPresignedDownloadUrl,
    deleteR2Object,
    generateR2SignedUrl,
    getR2Config
};
