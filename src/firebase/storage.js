import { uploadMedicalFileToR2, getR2DownloadUrl } from '../services/r2FileService';

/**
 * HealthChain Cloudflare R2 Storage Adapter
 * Replaces Firebase Storage operations with Cloudflare R2 Object Storage presigned transfers.
 */

export async function uploadFileToCloudflareStorage(file, metadata = {}) {
    return await uploadMedicalFileToR2({
        file,
        fileType: metadata.category || 'medical_pdf',
        patientId: metadata.patientId,
        doctorId: metadata.doctorId,
        hospitalId: metadata.hospitalId,
        departmentId: metadata.departmentId
    });
}

export async function getFileDownloadUrl(fileId) {
    const data = await getR2DownloadUrl(fileId);
    return data.downloadUrl;
}

export default {
    uploadFileToCloudflareStorage,
    getFileDownloadUrl
};
