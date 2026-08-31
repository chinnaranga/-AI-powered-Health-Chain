import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CloudUpload, FileText, CheckCircle, Loader2, User, Search, ShieldCheck } from 'lucide-react';
import NeonButton from './NeonButton';
import { recordService } from '../services/recordService';
import { userService } from '../services/userService';
import useAuthStore from '../store/authStore';
import { auth } from '../firebase/config';
import { toast } from './Toast';

const RECORD_CATEGORIES = [
    'Prescriptions', 'Lab Reports', 'MRI', 'X-Ray', 'CT Scan', 'ECG', 'Vaccination', 'Surgery', 'Insurance'
];

const MEDICAL_DEPARTMENTS = [
    'Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Emergency Care',
    'Orthopedics', 'General Medicine', 'Radiology', 'Pathology', 'Gynecology',
    'Dermatology', 'Psychiatry', 'Anesthesiology', 'Urology'
];

export default function UploadModal({ isOpen, onClose }) {
    const { user: currentUser, role } = useAuthStore();
    const isDoctorOrClinical = role === 'doctor' || role === 'clinical';

    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [category, setCategory] = useState(RECORD_CATEGORIES[0]);
    const [recordDepartment, setRecordDepartment] = useState(MEDICAL_DEPARTMENTS[0]);

    // Update default department to match uploader's active department
    useEffect(() => {
        if (currentUser?.department) {
            setRecordDepartment(currentUser.department);
        }
    }, [currentUser]);

    // Doctor/Clinical Role specific states
    const [patientSearch, setPatientSearch] = useState('');
    const [allPatients, setAllPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showPatientDropdown, setShowPatientDropdown] = useState(false);

    // Fetch patients list if doctor or clinical staff is logged in
    useEffect(() => {
        if (!isOpen || !isDoctorOrClinical) return;
        const fetchPatients = async () => {
            try {
                const users = await userService.getUsers();
                // Filter only patients
                const filtered = users.filter(u => u.role === 'patient' || !u.role);
                setAllPatients(filtered);
            } catch (err) {
                console.error('Failed to load patient index', err);
            }
        };
        fetchPatients();
    }, [isOpen, isDoctorOrClinical]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer?.files[0] || e.target?.files?.[0];
        if (file) setSelectedFile(file);
    }, []);

    const handleUpload = async () => {
        if (!selectedFile) return;

        // Target patient determination
        const targetPatientId = isDoctorOrClinical ? selectedPatient?.id : (currentUser?.uid || currentUser?.id || auth.currentUser?.uid);
        if (!targetPatientId) {
            toast.error('Select a target patient first');
            return;
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);

            const uploaderInfo = {
                uid: currentUser?.uid || currentUser?.id || auth.currentUser?.uid,
                role,
                name: currentUser?.name || currentUser?.displayName || currentUser?.email || auth.currentUser?.displayName || auth.currentUser?.email || 'Attending Staff',
                hospital: isDoctorOrClinical ? (currentUser?.hospital || 'Central Hospital') : 'Personal Vault'
            };

            await recordService.uploadMedicalRecord(
                selectedFile,
                targetPatientId,
                uploaderInfo,
                category,
                (progress) => {
                    setUploadProgress(Math.round(progress));
                },
                recordDepartment
            );

            setUploadProgress(100);
            setUploadComplete(true);
            toast.success('Record client-side encrypted & uploaded successfully!');

            setTimeout(() => {
                reset();
                onClose();
            }, 2200);
        } catch (err) {
            toast.error(err.message || 'Cryptographic upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const reset = () => {
        setSelectedFile(null);
        setUploadComplete(false);
        setUploadProgress(0);
        setSelectedPatient(null);
        setPatientSearch('');
        setCategory(RECORD_CATEGORIES[0]);
    };

    const filteredPatients = allPatients.filter(p =>
        (p.name && p.name.toLowerCase().includes(patientSearch.toLowerCase())) ||
        (p.email && p.email.toLowerCase().includes(patientSearch.toLowerCase())) ||
        (p.id && p.id.toLowerCase().includes(patientSearch.toLowerCase()))
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-[#0B0F19]/85 backdrop-blur-md" onClick={onClose} />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-[#111827] border border-[#1E2D4580] rounded-2xl shadow-2xl overflow-visible z-10 my-8"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-[#1E2D4580] flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-[#00C8D4]" />
                                    Zero-Knowledge Record Upload
                                </h3>
                                <p className="text-xs text-[#8899AA] mt-0.5">Files are AES-GCM encrypted locally before transit.</p>
                            </div>
                            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-[#8899AA] hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <AnimatePresence mode="wait">
                                {uploadComplete ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="py-10 text-center"
                                    >
                                        <motion.div
                                            animate={{ scale: [1, 1.15, 1] }}
                                            transition={{ duration: 0.6 }}
                                            className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4"
                                        >
                                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                                        </motion.div>
                                        <h4 className="text-xl font-display font-bold text-white">Record Secured</h4>
                                        <p className="text-sm text-[#8899AA] mt-2 max-w-xs mx-auto">Local cryptographic envelope locked. File safely broadcasted to Firebase & blockchain registers.</p>
                                    </motion.div>
                                ) : (
                                    <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                        
                                        {/* Doctor Patient Selector */}
                                        {isDoctorOrClinical && (
                                            <div className="relative">
                                                <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Target Patient</label>
                                                {selectedPatient ? (
                                                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#00C8D4]/5 border border-[#00C8D4]/30">
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4 text-[#00C8D4]" />
                                                            <span className="text-sm text-white font-semibold">{selectedPatient.name || selectedPatient.email}</span>
                                                        </div>
                                                        <button onClick={() => setSelectedPatient(null)} className="p-1 text-[#8899AA] hover:text-red-400 transition-colors">
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]" />
                                                        <input
                                                            value={patientSearch}
                                                            onChange={e => {
                                                                setPatientSearch(e.target.value);
                                                                setShowPatientDropdown(true);
                                                            }}
                                                            onFocus={() => setShowPatientDropdown(true)}
                                                            placeholder="Type patient name or ID..."
                                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00C8D4]/50 transition-all"
                                                        />
                                                        {showPatientDropdown && patientSearch.length > 0 && (
                                                            <div className="absolute left-0 right-0 mt-1.5 max-h-48 overflow-y-auto bg-[#1A2236] border border-[#1E2D4580] rounded-xl z-20 shadow-2xl divide-y divide-[#1E2D4580]">
                                                                {filteredPatients.length === 0 ? (
                                                                    <div className="p-3 text-xs text-[#8899AA] text-center">No patients matching search</div>
                                                                ) : (
                                                                    filteredPatients.map(p => (
                                                                        <div
                                                                            key={p.id}
                                                                            onClick={() => {
                                                                                setSelectedPatient(p);
                                                                                setShowPatientDropdown(false);
                                                                            }}
                                                                            className="p-3 hover:bg-[#00C8D4]/10 cursor-pointer transition-colors text-left"
                                                                        >
                                                                            <p className="text-sm font-semibold text-white">{p.name || p.email}</p>
                                                                            <p className="text-[10px] text-[#8899AA] uppercase font-mono tracking-wider">ID: {p.id.slice(0, 8)}</p>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Category & Department Pickers */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Category</label>
                                                <select
                                                    value={category}
                                                    onChange={e => setCategory(e.target.value)}
                                                    className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00C8D4]/50 appearance-none"
                                                >
                                                    {RECORD_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Unit / Department</label>
                                                <select
                                                    value={recordDepartment}
                                                    onChange={e => setRecordDepartment(e.target.value)}
                                                    className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00C8D4]/50 appearance-none"
                                                >
                                                    {MEDICAL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Drop zone */}
                                        <div
                                            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                                            onDragLeave={() => setDragActive(false)}
                                            onDrop={handleDrop}
                                            onClick={() => document.getElementById('modal-file-upload')?.click()}
                                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${dragActive
                                                ? 'border-[#00C8D4]/50 bg-[#00C8D4]/5'
                                                : 'border-[#1E2D4580] hover:border-[#00C8D4]/30 hover:bg-white/[0.01]'
                                                }`}
                                        >
                                            <input type="file" id="modal-file-upload" className="hidden" onChange={handleDrop} />
                                            <CloudUpload className={`w-10 h-10 mx-auto mb-2.5 ${dragActive ? 'text-[#00C8D4]' : 'text-[#8899AA]'}`} />
                                            <p className="text-sm text-slate-300 font-medium">Drag & drop your file here</p>
                                            <p className="text-xs text-[#8899AA] mt-1">PDF, DICOM, PNG, JPG up to 50MB</p>
                                        </div>

                                        {/* File preview */}
                                        <AnimatePresence>
                                            {selectedFile && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-2"
                                                >
                                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1A2236]/50 border border-[#1E2D4580]">
                                                        <div className="w-10 h-10 rounded-lg bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center flex-shrink-0">
                                                            <FileText className="w-5 h-5 text-[#00C8D4]" />
                                                        </div>
                                                        <div className="flex-1 min-w-0 text-left">
                                                            <p className="text-sm text-white font-medium truncate">{selectedFile.name}</p>
                                                            <p className="text-xs text-[#8899AA]">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                        </div>
                                                        <button onClick={reset} className="text-[#8899AA] hover:text-red-400 transition-colors">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    {/* Progress */}
                                                    {isUploading && (
                                                        <div className="mt-3">
                                                            <div className="flex justify-between text-xs text-[#8899AA] mb-1.5 font-mono">
                                                                <span className="flex items-center gap-1.5">
                                                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00C8D4]" /> local crypto & upload...
                                                                </span>
                                                                <span className="text-[#00C8D4]">{uploadProgress}%</span>
                                                            </div>
                                                            <div className="h-2 rounded-full bg-[#0B0F1A] overflow-hidden border border-[#1E2D4580]">
                                                                <motion.div
                                                                    className="h-full rounded-full bg-gradient-to-r from-[#00C8D4] to-blue-500"
                                                                    animate={{ width: `${uploadProgress}%` }}
                                                                    transition={{ duration: 0.3 }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        {!uploadComplete && (
                            <div className="px-6 py-4 border-t border-[#1E2D4580] bg-[#1A2236]/30 flex items-center justify-end gap-3 rounded-b-2xl">
                                <NeonButton variant="ghost" onClick={onClose}>Cancel</NeonButton>
                                <NeonButton
                                    variant="solid"
                                    onClick={handleUpload}
                                    disabled={!selectedFile || isUploading || (isDoctorOrClinical && !selectedPatient)}
                                    loading={isUploading}
                                    icon={CloudUpload}
                                >
                                    Encrypt & Upload
                                </NeonButton>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
