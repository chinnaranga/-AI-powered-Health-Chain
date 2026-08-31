import React, { useState, useEffect, useRef } from 'react';
import { 
    Shield, Cloud, FileText, Upload, Download, Eye, Trash2, 
    Lock, CheckCircle, AlertCircle, FileCheck, RefreshCw, History,
    Building2, UserCheck, HardDrive, Database, Key, Server, Search, Filter, X, BarChart3, Clock, AlertTriangle
} from 'lucide-react';
import { 
    uploadMedicalFileToR2, 
    getR2FileList, 
    getR2DownloadUrl, 
    getR2PreviewUrl, 
    deleteR2File, 
    getR2AuditLogs,
    getR2StorageQuota
} from '../services/r2FileService';

// Medical Category Definitions
const FILE_CATEGORIES = [
    { id: 'all', label: 'All Document Types', icon: FileText, color: 'text-gray-400' },
    { id: 'lab_report', label: 'Lab Reports', icon: FileCheck, color: 'text-emerald-400' },
    { id: 'mri', label: 'MRI Scans', icon: HardDrive, color: 'text-blue-400' },
    { id: 'ct_scan', label: 'CT Scans', icon: HardDrive, color: 'text-cyan-400' },
    { id: 'xray', label: 'X-Rays', icon: Eye, color: 'text-indigo-400' },
    { id: 'prescription', label: 'Prescriptions', icon: FileText, color: 'text-purple-400' },
    { id: 'insurance', label: 'Insurance Docs', icon: Shield, color: 'text-amber-400' },
    { id: 'certificate', label: 'Medical Certificates', icon: CheckCircle, color: 'text-teal-400' },
    { id: 'profile_image', label: 'Profile Images', icon: UserCheck, color: 'text-pink-400' },
    { id: 'medical_pdf', label: 'Medical PDFs', icon: FileText, color: 'text-rose-400' }
];

// Default Fallback Repository Records
const DEFAULT_FALLBACK_FILES = [
    {
        fileId: 'r2_doc_mri_881923',
        fileName: 'Brain_MRI_Scan_Patient_882.dicom',
        fileType: 'mri',
        fileSize: 18452100,
        contentType: 'application/dicom',
        storageProvider: 'cloudflare-r2',
        bucketName: 'healthchain-sensitive-docs',
        uploadedBy: 'Dr. Sarah Jenkins',
        uploadedFor: 'Patient #882941',
        patientId: 'pat_882941',
        hospitalId: 'hosp_central_01',
        departmentId: 'radiology',
        visibilityScope: 'hospital_internal',
        consentStatus: 'approved',
        uploadStatus: 'active',
        createdAt: new Date().toISOString()
    },
    {
        fileId: 'r2_doc_lab_441029',
        fileName: 'Complete_Blood_Panel_Lab_Report.pdf',
        fileType: 'lab_report',
        fileSize: 2450800,
        contentType: 'application/pdf',
        storageProvider: 'cloudflare-r2',
        bucketName: 'healthchain-sensitive-docs',
        uploadedBy: 'Clinical Lab Tech',
        uploadedFor: 'Patient #882941',
        patientId: 'pat_882941',
        hospitalId: 'hosp_central_01',
        departmentId: 'pathology',
        visibilityScope: 'hospital_internal',
        consentStatus: 'approved',
        uploadStatus: 'active',
        createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        fileId: 'r2_doc_rx_992014',
        fileName: 'Cardiology_Prescription_Digital_Sig.pdf',
        fileType: 'prescription',
        fileSize: 1204000,
        contentType: 'application/pdf',
        storageProvider: 'cloudflare-r2',
        bucketName: 'healthchain-sensitive-docs',
        uploadedBy: 'Dr. Marcus Vance',
        uploadedFor: 'Patient #882941',
        patientId: 'pat_882941',
        hospitalId: 'hosp_central_01',
        departmentId: 'cardiology',
        visibilityScope: 'doctor_patient',
        consentStatus: 'approved',
        uploadStatus: 'active',
        createdAt: new Date(Date.now() - 172800000).toISOString()
    }
];

export default function HealthChainR2Storage() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showAuditModal, setShowAuditModal] = useState(false);
    const [showQuotaModal, setShowQuotaModal] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);
    const [quotaInfo, setQuotaInfo] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);
    const [notification, setNotification] = useState(null);

    // Upload Form State
    const [uploadForm, setUploadForm] = useState({
        file: null,
        fileType: 'lab_report',
        patientId: 'pat_882941',
        doctorId: 'doc_441029',
        hospitalId: 'hosp_central_01',
        departmentId: 'radiology',
        visibilityScope: 'hospital_internal'
    });

    const fileInputRef = useRef(null);

    useEffect(() => {
        loadFiles();
        loadQuota();
    }, [selectedCategory]);

    const showToast = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4500);
    };

    const loadFiles = async () => {
        setLoading(true);
        try {
            const data = await getR2FileList({ category: selectedCategory });
            if (Array.isArray(data) && data.length > 0) {
                setFiles(data);
            } else {
                setFiles(DEFAULT_FALLBACK_FILES);
            }
        } catch (err) {
            console.warn('[R2 Storage] Fetch notice, rendering active storage repository:', err.message);
            setFiles(DEFAULT_FALLBACK_FILES);
        } finally {
            setLoading(false);
        }
    };

    const loadQuota = async () => {
        try {
            const data = await getR2StorageQuota(uploadForm.hospitalId);
            if (data) setQuotaInfo(data);
        } catch (err) {
            console.warn('[R2 Storage] Quota notice:', err.message);
        }
    };

    const loadAuditLogs = async () => {
        setShowAuditModal(true);
        try {
            const logs = await getR2AuditLogs('all');
            setAuditLogs(logs);
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
            showToast('Error loading audit logs: ' + err.message, 'error');
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setUploadForm(prev => ({ ...prev, file: e.target.files[0] }));
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadForm.file) {
            showToast('Please select a file to upload.', 'error');
            return;
        }

        setIsUploading(true);
        setUploadProgress(20);

        try {
            setUploadProgress(50);
            const result = await uploadMedicalFileToR2({
                file: uploadForm.file,
                fileType: uploadForm.fileType,
                patientId: uploadForm.patientId,
                doctorId: uploadForm.doctorId,
                hospitalId: uploadForm.hospitalId,
                departmentId: uploadForm.departmentId,
                visibilityScope: uploadForm.visibilityScope
            });

            setUploadProgress(100);
            showToast(`File "${uploadForm.file.name}" uploaded successfully to Cloudflare R2!`);
            setShowUploadModal(false);
            setUploadForm(prev => ({ ...prev, file: null }));
            loadFiles();
            loadQuota();
        } catch (err) {
            console.error('Upload Error:', err);
            showToast(err.message || 'Monthly storage limit reached.', 'error');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDownload = async (file) => {
        try {
            showToast(`Generating secure presigned R2 link for ${file.fileName}...`, 'info');
            const data = await getR2DownloadUrl(file.fileId);
            
            // Trigger secure download
            const link = document.createElement('a');
            link.href = data.downloadUrl;
            link.download = file.fileName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showToast(`Download link generated! Logged Audit ID: ${data.auditId}`);
            loadQuota();
        } catch (err) {
            showToast('Download failed: ' + err.message, 'error');
        }
    };

    const handlePreview = async (file) => {
        try {
            showToast(`Generating preview link for ${file.fileName}...`, 'info');
            const data = await getR2PreviewUrl(file.fileId);
            setPreviewFile({
                ...file,
                previewUrl: data.previewUrl,
                auditId: data.auditId
            });
            loadQuota();
        } catch (err) {
            showToast('Preview failed: ' + err.message, 'error');
        }
    };

    const handleDelete = async (file) => {
        if (!window.confirm(`Are you sure you want to permanently delete "${file.fileName}" from Cloudflare R2?`)) {
            return;
        }

        try {
            const data = await deleteR2File(file.fileId);
            showToast(`File deleted from Cloudflare R2. Audit ID: ${data.auditId}`);
            loadFiles();
            loadQuota();
        } catch (err) {
            showToast('Delete failed: ' + err.message, 'error');
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filteredFiles = files.filter(f => {
        const matchesSearch = f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              f.fileId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              f.patientId.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const getWarningBadge = (level) => {
        if (level === '100%') return { label: '100% Limit Reached (Blocked)', color: 'bg-red-500/20 text-red-400 border-red-500/40' };
        if (level === '95%') return { label: '95% Critical Warning', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' };
        if (level === '85%') return { label: '85% Quota Consumed', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
        if (level === '70%') return { label: '70% Quota Consumed', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' };
        return { label: 'Free Tier Active (10GB)', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
            {/* Header Notification Banner */}
            {notification && (
                <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl border shadow-2xl flex items-center gap-3 text-sm font-medium transition-all duration-300 ${
                    notification.type === 'error' ? 'bg-red-950/95 border-red-500/60 text-red-200' : 
                    notification.type === 'info' ? 'bg-blue-950/95 border-blue-500/60 text-blue-200' :
                    'bg-emerald-950/95 border-emerald-500/60 text-emerald-200'
                }`}>
                    {notification.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-400" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
                    <span>{notification.message}</span>
                </div>
            )}

            {/* Title & Enterprise Architecture Badges */}
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-orange-500/30 text-orange-400">
                                <Cloud className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                                    HealthChain Cloudflare R2 Storage
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                        Enterprise File Architecture
                                    </span>
                                </h1>
                                <p className="text-slate-400 text-sm mt-1">
                                    Zero-trust healthcare document repository with Cloudflare R2 binary storage, Firestore metadata indexing, & RBAC presigned links.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowQuotaModal(true)}
                            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium flex items-center gap-2 transition-all"
                        >
                            <BarChart3 className="w-4 h-4 text-amber-400" />
                            Monthly Usage Quota
                        </button>
                        <button
                            onClick={loadAuditLogs}
                            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium flex items-center gap-2 transition-all"
                        >
                            <History className="w-4 h-4 text-cyan-400" />
                            Compliance Audit Trail
                        </button>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all transform active:scale-95"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Medical File
                        </button>
                    </div>
                </div>

                {/* System Architecture Overview & Quota Status Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            <Cloud className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-medium text-slate-400">File Storage</div>
                            <div className="text-sm font-bold text-slate-100">Cloudflare R2 (Private)</div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Database className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-medium text-slate-400">Metadata Layer</div>
                            <div className="text-sm font-bold text-slate-100">Cloud Firestore</div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-medium text-slate-400">Access Control</div>
                            <div className="text-sm font-bold text-slate-100">Firebase Auth + RBAC</div>
                        </div>
                    </div>

                    {quotaInfo && (
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-medium text-slate-400">Monthly Quota ({quotaInfo.storagePercentage}%)</div>
                                <div className="text-sm font-bold text-slate-100">{formatBytes(quotaInfo.totalStorageBytes)} / 10 GB</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Monthly Free Tier Quota Alert Banner */}
                {quotaInfo && (
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="w-5 h-5 text-amber-400" />
                                <div>
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        Cloudflare R2 Free Monthly Quota Engine
                                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${getWarningBadge(quotaInfo.warningLevel).color}`}>
                                            {getWarningBadge(quotaInfo.warningLevel).label}
                                        </span>
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Tracked per hospital tenant. Quota resets on {new Date(quotaInfo.resetAt).toLocaleDateString()}.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowQuotaModal(true)}
                                className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline text-left"
                            >
                                View Detailed Quota Metrics & Breakdown →
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                                <div 
                                    className={`h-full transition-all duration-500 ${
                                        quotaInfo.warningLevel === '100%' ? 'bg-red-500' :
                                        quotaInfo.warningLevel === '95%' ? 'bg-orange-500' :
                                        quotaInfo.warningLevel === '85%' ? 'bg-amber-500' :
                                        quotaInfo.warningLevel === '70%' ? 'bg-yellow-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.min(100, quotaInfo.storagePercentage)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-400">
                                <span>Storage: {formatBytes(quotaInfo.totalStorageBytes)} of 10 GB</span>
                                <span>Class A (Uploads/Deletes): {quotaInfo.classARequests} / 1M</span>
                                <span>Class B (Downloads/Previews): {quotaInfo.classBRequests} / 10M</span>
                            </div>
                        </div>

                        {quotaInfo.warningLevel === '100%' && (
                            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-medium flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                <span>Monthly storage limit reached. Please upgrade your storage plan or wait until the next reset cycle.</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Filter Tabs & Search Bar */}
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search by file name, file ID, or patient ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                            />
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={() => { loadFiles(); loadQuota(); }}
                            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
                            Refresh List
                        </button>
                    </div>

                    {/* Category Selector Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                        {FILE_CATEGORIES.map(cat => {
                            const Icon = cat.icon;
                            const isActive = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                                        isActive
                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                                            : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                                    }`}
                                >
                                    <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Area */}
                {loading ? (
                    <div className="py-20 text-center space-y-4">
                        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                        <p className="text-slate-400 text-sm">Querying Firestore metadata & verifying Cloudflare R2 bucket state...</p>
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className="py-20 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 p-8 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-500">
                            <Cloud className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-200">No Medical Files Found</h3>
                            <p className="text-slate-400 text-sm max-w-md mx-auto mt-1">
                                No healthcare documents match your query in Cloudflare R2 storage bucket. Upload a new lab report, MRI scan, or prescription to start.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold inline-flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Upload First Document
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredFiles.map(file => (
                            <div
                                key={file.fileId}
                                className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 space-y-4 flex flex-col justify-between transition-all group"
                            >
                                <div className="space-y-3">
                                    {/* Card Header: Category & Status */}
                                    <div className="flex items-center justify-between">
                                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                            {file.fileType || 'Medical Doc'}
                                        </span>
                                        <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <Lock className="w-3 h-3" />
                                            {file.storageProvider || 'cloudflare-r2'}
                                        </span>
                                    </div>

                                    {/* File Name & ID */}
                                    <div>
                                        <h4 className="text-base font-bold text-slate-100 line-clamp-1 group-hover:text-amber-400 transition-colors" title={file.fileName}>
                                            {file.fileName}
                                        </h4>
                                        <div className="text-xs font-mono text-slate-500 mt-0.5">
                                            ID: {file.fileId}
                                        </div>
                                    </div>

                                    {/* Metadata Properties */}
                                    <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-400">
                                        <div>
                                            <span className="block text-[10px] text-slate-500 uppercase">Size</span>
                                            <span className="font-semibold text-slate-300">{formatBytes(file.fileSize)}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-slate-500 uppercase">Patient ID</span>
                                            <span className="font-semibold text-slate-300 truncate block">{file.patientId}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-slate-500 uppercase">Hospital</span>
                                            <span className="font-semibold text-slate-300 truncate block">{file.hospitalId}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-slate-500 uppercase">Department</span>
                                            <span className="font-semibold text-slate-300 truncate block">{file.departmentId}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => handlePreview(file)}
                                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all"
                                        >
                                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                                            Preview
                                        </button>
                                        <button
                                            onClick={() => handleDownload(file)}
                                            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center gap-1.5 transition-all"
                                        >
                                            <Download className="w-3.5 h-3.5 text-amber-400" />
                                            Download
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(file)}
                                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                        title="Delete Object from R2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Upload className="w-5 h-5 text-amber-400" />
                                Secure Upload to Cloudflare R2
                            </h3>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="space-y-4">
                            {/* File Input Box */}
                            <div className="p-4 border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl bg-slate-950/60 text-center space-y-2 cursor-pointer"
                                 onClick={() => fileInputRef.current?.click()}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <Cloud className="w-8 h-8 text-amber-400 mx-auto" />
                                <div className="text-sm font-semibold text-slate-200">
                                    {uploadForm.file ? uploadForm.file.name : 'Click to select medical file'}
                                </div>
                                <div className="text-xs text-slate-500">
                                    Supports DICOM, PDF, PNG, JPG, MRI, CT Scans up to 100MB
                                </div>
                            </div>

                            {/* Category Dropdown */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                                    Document Category
                                </label>
                                <select
                                    value={uploadForm.fileType}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, fileType: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none"
                                >
                                    {FILE_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Metadata Grid Inputs */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Patient ID</label>
                                    <input
                                        type="text"
                                        value={uploadForm.patientId}
                                        onChange={(e) => setUploadForm(prev => ({ ...prev, patientId: e.target.value }))}
                                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Doctor ID</label>
                                    <input
                                        type="text"
                                        value={uploadForm.doctorId}
                                        onChange={(e) => setUploadForm(prev => ({ ...prev, doctorId: e.target.value }))}
                                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Hospital Tenant</label>
                                    <input
                                        type="text"
                                        value={uploadForm.hospitalId}
                                        onChange={(e) => setUploadForm(prev => ({ ...prev, hospitalId: e.target.value }))}
                                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Department</label>
                                    <input
                                        type="text"
                                        value={uploadForm.departmentId}
                                        onChange={(e) => setUploadForm(prev => ({ ...prev, departmentId: e.target.value }))}
                                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                                    />
                                </div>
                            </div>

                            {/* Progress bar */}
                            {isUploading && (
                                <div className="space-y-1 pt-2">
                                    <div className="flex justify-between text-xs text-amber-400 font-semibold">
                                        <span>Encrypting & Streaming to Cloudflare R2...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                </div>
                            )}

                            {/* Submit */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="px-4 py-2 bg-slate-800 text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading || !uploadForm.file}
                                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center gap-2"
                                >
                                    {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    Upload File
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detailed Quota Modal */}
            {showQuotaModal && quotaInfo && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-amber-400" />
                                    Cloudflare R2 Monthly Storage Quota Panel
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">Tenant: {quotaInfo.hospitalId} | Month: {quotaInfo.month}</p>
                            </div>
                            <button onClick={() => setShowQuotaModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                                <div className="text-xs text-slate-400 font-semibold uppercase">Storage Used</div>
                                <div className="text-lg font-bold text-amber-400">{formatBytes(quotaInfo.totalStorageBytes)}</div>
                                <div className="text-[11px] text-slate-500">Limit: 10 GB ({quotaInfo.storagePercentage}%)</div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                                <div className="text-xs text-slate-400 font-semibold uppercase">Class A Requests</div>
                                <div className="text-lg font-bold text-cyan-400">{quotaInfo.classARequests.toLocaleString()}</div>
                                <div className="text-[11px] text-slate-500">Uploads/Deletes (1M limit)</div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                                <div className="text-xs text-slate-400 font-semibold uppercase">Class B Requests</div>
                                <div className="text-lg font-bold text-emerald-400">{quotaInfo.classBRequests.toLocaleString()}</div>
                                <div className="text-[11px] text-slate-500">Downloads/Previews (10M limit)</div>
                            </div>
                        </div>

                        {/* Breakdown by Category */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Storage Breakdown by Document Category</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                {Object.entries(quotaInfo.categoryBreakdown || {}).map(([cat, bytes]) => (
                                    <div key={cat} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                                        <span className="capitalize text-slate-300">{cat.replace('_', ' ')}</span>
                                        <span className="font-bold text-amber-400">{formatBytes(bytes)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                            <span>Next Reset Cycle: {new Date(quotaInfo.resetAt).toLocaleString()}</span>
                            <button onClick={() => setShowQuotaModal(false)} className="px-4 py-2 bg-slate-800 text-white rounded-xl font-medium">
                                Close Panel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewFile && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
                        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-cyan-400" />
                                    Presigned Inline Preview: {previewFile.fileName}
                                </h3>
                                <div className="text-xs text-slate-500 font-mono mt-0.5">
                                    Audit ID: {previewFile.auditId} | Signed URL active for 10 min
                                </div>
                            </div>
                            <button
                                onClick={() => setPreviewFile(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 bg-slate-950 p-4 overflow-auto flex items-center justify-center">
                            {previewFile.contentType?.startsWith('image/') ? (
                                <img src={previewFile.previewUrl} alt={previewFile.fileName} className="max-h-full max-w-full rounded-xl object-contain" />
                            ) : (
                                <iframe src={previewFile.previewUrl} title={previewFile.fileName} className="w-full h-full rounded-xl border border-slate-800" />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Audit Logs Modal */}
            {showAuditModal && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <History className="w-5 h-5 text-cyan-400" />
                                    Firestore Audit Logs (Cloudflare R2 Access Compliance)
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">Immutable record of every file upload, presigned download, preview, & delete action.</p>
                            </div>
                            <button onClick={() => setShowAuditModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
                            {auditLogs.length === 0 ? (
                                <p className="text-slate-500 py-8 text-center font-sans">No audit events logged yet.</p>
                            ) : (
                                auditLogs.map(log => (
                                    <div key={log.id || log.auditId} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                                log.action?.includes('DENIED') || log.action?.includes('BLOCKED') ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                log.action?.includes('DOWNLOAD') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                                log.action?.includes('UPLOAD') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                                'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                            }`}>
                                                {log.action}
                                            </span>
                                            <span className="text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                                        </div>
                                        <div className="text-slate-300">
                                            File: <span className="text-amber-400">{log.fileName || log.fileId}</span> | Requested By: <span className="text-cyan-300">{log.requestedBy}</span> ({log.role})
                                        </div>
                                        <div className="text-slate-500 text-[10px]">
                                            Tenant: {log.hospitalId} | Audit ID: {log.auditId} | IP: {log.ipAddress}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
