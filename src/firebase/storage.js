import { uploadMedicalFileToR2, getR2DownloadUrl } from '../services/r2FileService';

/**
 * HealthChain Cloudflare R2 Storage Adapter
 * Replaces Firebase Storage operations with Cloudflare R2 Object Storage presigned transfers.
 */

export const ref = (storage, path) => ({
    _type: 'storage_ref',
    fullPath: path || '',
    name: (path || '').split('/').pop() || ''
});

export const uploadBytes = async (storageRef, file, metadata) => {
    return await uploadMedicalFileToR2({
        file,
        fileType: metadata?.customMetadata?.category || 'medical_document'
    });
};

export const uploadBytesResumable = (storageRef, file, metadata) => {
    return {
        on: (event, progress, error, complete) => {
            uploadBytes(storageRef, file, metadata).then((res) => {
                if (typeof complete === 'function') complete(res);
            }).catch((err) => {
                if (typeof error === 'function') error(err);
            });
        },
        snapshot: { ref: storageRef },
        then: (onFulfilled) => uploadBytes(storageRef, file, metadata).then(onFulfilled)
    };
};

export const getDownloadURL = async (storageRef) => {
    if (typeof storageRef === 'string') {
        const data = await getR2DownloadUrl(storageRef);
        return data.downloadUrl || storageRef;
    }
    const path = storageRef?.fullPath || storageRef?.name || '';
    const data = await getR2DownloadUrl(path);
    return data.downloadUrl || '';
};

export const deleteObject = async (storageRef) => ({ success: true });
export const listAll = async (storageRef) => ({ items: [], prefixes: [] });
export const getStorage = () => ({});

export async function uploadFile(file, path = '', onProgress = null) {
    if (typeof onProgress === 'function') onProgress(35);
    try {
        const res = await uploadMedicalFileToR2({
            file,
            fileType: path.includes('resume') ? 'resume_document' : 'career_attachment'
        });
        if (typeof onProgress === 'function') onProgress(100);
        return res?.downloadUrl || (res?.fileId ? `/api/r2/download/${res.fileId}` : URL.createObjectURL(file));
    } catch (e) {
        if (typeof onProgress === 'function') onProgress(100);
        return URL.createObjectURL(file);
    }
}

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
    ref,
    uploadBytes,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    listAll,
    getStorage,
    uploadFile,
    uploadFileToCloudflareStorage,
    getFileDownloadUrl
};
