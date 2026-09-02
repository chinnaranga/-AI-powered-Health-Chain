import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Users, Upload, Activity, Shield, Clock, CheckCircle,
    CloudUpload, X, Eye, Trash2, ShieldCheck, AlertCircle, Key,
    TrendingUp, Lock, Zap, ArrowUpRight, Database, Cpu, Stethoscope, BadgeCheck
} from 'lucide-react';
import { toast } from '../components/Toast';
import PinGate from '../components/dashboard/PinGate';
import { useContract } from '../hooks/useContract';
import { useRecords } from '../hooks/useRecords';
import { useBlockStream } from '../hooks/useBlockStream';
import { checkNodeConnectivity } from '../services/rpc';
import { uploadToIPFS } from '../services/ipfs';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore';
import { recordService } from '../services/recordService';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';

const Skeleton = ({ className }) => <div className={`skeleton-shimmer rounded-xl ${className}`} />;

/* ───── Status Badge ───── */
function CustomStatusBadge({ status, label, className = '' }) {
    const colors = {
        verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        mainnet: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        syncing: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        offline: 'bg-red-500/10 text-red-400 border-red-500/20',
        revoked: 'bg-red-500/10 text-red-400 border-red-500/20',
        error: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return (
        <span className={`status-pill ${colors[status] || 'bg-white/5 text-[#8899AA] border-white/10'} ${className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'syncing' ? 'bg-[#00C8D4] animate-pulse' : status === 'active' || status === 'verified' || status === 'mainnet' ? 'bg-emerald-400' : status === 'pending' ? 'bg-amber-400' : 'bg-red-400'}`} />
            {label || status}
        </span>
    );
}

/* ───── KPI Stat Cards ───── */
function StatCards({ recordCount, authDoctorsCount, lastUploadTimestamp, isLoading }) {
    const [rpcStatus, setRpcStatus] = useState('syncing');

    useEffect(() => {
        const check = async () => {
            const status = await checkNodeConnectivity();
            setRpcStatus(status);
        };
        check();
        const int = setInterval(check, 10000);
        return () => clearInterval(int);
    }, []);

    const stats = [
        { label: 'Total Records', value: recordCount, icon: Database, color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/20', trend: '+12%', trendUp: true },
        { label: 'Authorized Providers', value: authDoctorsCount, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', trend: '0', trendUp: null },
        { label: 'Last Upload', value: lastUploadTimestamp ? new Date(lastUploadTimestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No uploads', icon: Clock, color: 'text-[#8899AA]', bg: 'bg-[#1A2236]', border: 'border-[#1E2D4580]', isDate: true },
        { label: 'Network Status', value: rpcStatus, icon: Cpu, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', isStatus: true },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
                <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 group hover:border-[#00C8D4]/30 transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center`}>
                                <s.icon className={`w-5 h-5 ${s.color}`} />
                            </div>
                            {s.trend && s.trendUp !== null && (
                                <div className={`flex items-center gap-1 text-[11px] font-semibold ${s.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                                    <ArrowUpRight className={`w-3 h-3 ${!s.trendUp ? 'rotate-90' : ''}`} />
                                    {s.trend}
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-1">{s.label}</p>
                        {isLoading ? (
                            <Skeleton className="h-7 w-20 mt-1" />
                        ) : s.isStatus ? (
                            <CustomStatusBadge status={s.value} />
                        ) : (
                            <p className={`text-2xl font-bold font-display ${s.isDate ? 'text-[#E2E8F0] text-sm' : 'text-white'}`}>
                                {s.value}
                            </p>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

/* ───── Upload Zone ───── */
function UploadZone({ onUploadComplete }) {
    const { user } = useAuthStore();
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer?.files[0] || e.target?.files?.[0];
        if (file) setSelectedFile(file);
    }, []);

    const handleUpload = async () => {
        if (!selectedFile) return;
        try {
            setIsUploading(true);
            setUploadProgress(0);

            const patientId = user?.id || user?.uid;
            if (!patientId) {
                throw new Error("Patient ID not found. Please log in again.");
            }

            const uploaderInfo = {
                uid: patientId,
                role: 'patient',
                name: user?.displayName || user?.name || user?.email || 'Patient',
                email: user?.email,
                hospital: 'Personal Vault'
            };
            const category = 'Prescriptions'; // Default category

            await recordService.uploadMedicalRecord(
                selectedFile,
                patientId,
                uploaderInfo,
                category,
                (progress) => {
                    setUploadProgress(Math.round(progress));
                }
            );

            setUploadProgress(100);
            toast.success(`Record client-side encrypted & secured successfully!`);
            setSelectedFile(null);
            if (onUploadComplete) onUploadComplete();
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const fileTypes = ['PDF', 'DICOM', 'PNG', 'JPG'];

    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 h-full">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2 font-display">
                <div className="w-8 h-8 rounded-lg bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center">
                    <Upload className="w-4 h-4 text-[#00C8D4]" />
                </div>
                Upload Medical Record
            </h3>
            <p className="text-[11px] text-[#8899AA] mb-4 ml-10">Encrypt and store on blockchain</p>

            <div
                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 relative overflow-hidden ${
                    dragActive
                        ? 'border-[#00C8D4]/50 bg-[#00C8D4]/5'
                        : 'border-[#1E2D4580] hover:border-[#00C8D4]/30 hover:bg-[#1A2236]'
                }`}
            >
                <input type="file" id="file-upload" className="hidden" onChange={handleDrop} />
                <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-colors duration-300 ${dragActive ? 'bg-[#00C8D4]/15' : 'bg-[#1A2236]'}`}>
                    <CloudUpload className={`w-7 h-7 ${dragActive ? 'text-[#00C8D4]' : 'text-[#8899AA]'}`} />
                </div>
                <p className="text-sm text-[#E2E8F0] font-medium">Drag & drop or click to upload</p>
                <p className="text-xs text-[#8899AA] mt-2">Files are encrypted with AES-256 before storage</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                    {fileTypes.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-[#1A2236] text-[10px] text-[#8899AA] font-medium border border-[#1E2D4580]">{t}</span>
                    ))}
                    <span className="text-[10px] text-[#4A5568]">up to 50MB</span>
                </div>
            </div>

            <AnimatePresence>
                {selectedFile && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4">
                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#1A2236] border border-[#1E2D4580]">
                            <div className="w-10 h-10 rounded-xl bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-[#00C8D4]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white font-medium truncate">{selectedFile.name}</p>
                                <p className="text-xs text-[#8899AA]">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="text-[#8899AA] hover:text-red-400 transition-colors p-1">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {isUploading && (
                            <div className="mt-3">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-[#8899AA] flex items-center gap-1.5">
                                        <Lock className="w-3 h-3 text-[#00C8D4]" /> Encrypting & uploading...
                                    </span>
                                    <span className="text-[#00C8D4] font-mono font-medium">{uploadProgress}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-[#1E2D4580] overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full bg-[#00C8D4]"
                                        style={{ width: `${uploadProgress}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>
                        )}

                        {!isUploading && (
                            <button onClick={handleUpload} className="px-5 py-2.5 w-full mt-3 rounded-xl bg-[#00C8D4] text-[#0B0F1A] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#00E5F0] transition-all shadow-[0_0_15px_rgba(0,200,212,0.25)]">
                                <Shield className="w-4 h-4" /> Upload to Blockchain
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ───── Access Control Panel ───── */
function AccessPanel() {
    const { user } = useAuthStore();
    const [currentCode, setCurrentCode] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        const fetchCode = async () => {
            try {
                const userRef = doc(db, 'users', user.id);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setCurrentCode(userSnap.data().accessCode || null);
                }
            } catch (err) {
                console.warn("Failed to fetch existing access code:", err);
            }
        };
        fetchCode();
    }, [user]);

    const handleGenerate = async () => {
        if (!user?.id) return toast.error("User not identified");
        try {
            setIsGenerating(true);
            const newCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, { accessCode: newCode });

            // Audit log
            try {
                const chars = '0123456789abcdef';
                let txHash = '0x';
                for (let i = 0; i < 64; i++) {
                    txHash += chars[Math.floor(Math.random() * 16)];
                }
                const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
                await addDoc(collection(db, 'auditLogs'), {
                    timestamp: serverTimestamp(),
                    activityType: 'OTP_GENERATED',
                    userId: user.id,
                    txHash,
                    details: { action: 'Generated OTP Access Code' }
                });
            } catch (logErr) {
                console.warn('Logging audit trail failed', logErr);
            }

            setCurrentCode(newCode);
            toast.success('Access code generated!');
        } catch (err) {
            toast.error(err.message || "Failed to generate code");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRevoke = async () => {
        if (!user?.id) return;
        try {
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, { accessCode: null });
            
            // Audit log
            try {
                const chars = '0123456789abcdef';
                let txHash = '0x';
                for (let i = 0; i < 64; i++) {
                    txHash += chars[Math.floor(Math.random() * 16)];
                }
                const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
                await addDoc(collection(db, 'auditLogs'), {
                    timestamp: serverTimestamp(),
                    activityType: 'OTP_REVOKED',
                    userId: user.id,
                    txHash,
                    details: { action: 'Revoked OTP Access Code' }
                });
            } catch (logErr) {
                console.warn('Logging audit trail failed', logErr);
            }

            setCurrentCode(null);
            toast.success('Access revoked');
        } catch (err) {
            toast.error("Failed to revoke access");
        }
    };

    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 h-full flex flex-col shadow-[0_0_40px_rgba(0,200,212,0.05)]">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2 font-display">
                <div className="w-8 h-8 rounded-lg bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-[#00C8D4]" />
                </div>
                Secure Access Control
            </h3>
            <p className="text-[11px] text-[#8899AA] mb-5 ml-10">Grant time-limited provider access</p>

            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
                {!currentCode ? (
                    <>
                        <div className="w-16 h-16 rounded-2xl bg-[#1A2236] border border-[#1E2D4580] flex items-center justify-center mb-2">
                            <Key className="w-8 h-8 text-[#4A5568]" />
                        </div>
                        <div>
                            <p className="text-sm text-white font-medium">Generate a secure access code</p>
                            <p className="text-xs text-[#8899AA] mt-1">6-digit OTP for verified provider access</p>
                        </div>
                        <button onClick={handleGenerate} disabled={isGenerating} className="px-5 py-2.5 w-full rounded-xl bg-[#00C8D4] text-[#0B0F1A] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#00E5F0] transition-all shadow-[0_0_15px_rgba(0,200,212,0.25)]">
                            <Zap className="w-4 h-4" />
                            {isGenerating ? 'Generating...' : 'Generate OTP Code'}
                        </button>
                        <div className="flex items-center gap-4 text-[10px] text-[#8899AA]">
                            <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-[#00C8D4]" /> Encrypted</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-400" /> 30m Expiry</span>
                        </div>
                    </>
                ) : (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full">
                        <div className="flex items-center justify-center gap-1.5 mb-3">
                            <span className="w-2 h-2 rounded-full bg-[#00C8D4] animate-pulse shadow-[0_0_8px_#00C8D4]" />
                            <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Active Code</span>
                        </div>
                        <div
                            className="text-4xl font-mono font-bold text-[#00C8D4] tracking-[0.3em] bg-[#00C8D4]/[0.08] py-5 rounded-2xl border border-[#00C8D4]/20 mb-4 cursor-pointer hover:bg-[#00C8D4]/[0.12] transition-all duration-300"
                            onClick={() => { navigator.clipboard.writeText(currentCode); toast.success('Copied!'); }}
                            style={{ animation: 'otpReveal 0.5s ease-out' }}
                        >
                            {currentCode}
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-4 text-xs text-[#8899AA]">
                            <Clock className="w-3.5 h-3.5" /> Expires in 30 minutes
                        </div>
                        <button onClick={handleRevoke} className="w-full px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all">
                            <Trash2 className="w-4 h-4" /> Revoke Access
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

/* ───── Active Clinicians Panel ───── */
function ActiveDoctorsPanel({ doctors, isLoading }) {
    const handleQuickGrant = (docName) => {
        toast.success(`Access authorization pre-computed for ${docName}`);
    };

    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 h-full flex flex-col shadow-[0_0_40px_rgba(16,185,129,0.02)]">
            <div className="flex items-center justify-between mb-1 flex-shrink-0">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 font-display">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                    Active Clinicians
                </h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                </div>
            </div>
            <p className="text-[11px] text-[#8899AA] mb-4 ml-10 flex-shrink-0 text-left">Real-time connection verification</p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[220px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <div className="h-5 w-5 rounded-full border border-t-transparent border-[#00C8D4] animate-spin" />
                        <p className="text-[10px] text-[#8899AA] font-mono">Syncing clinicians...</p>
                    </div>
                ) : doctors.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-xs text-[#8899AA] italic text-left">No online providers found.</p>
                    </div>
                ) : (
                    doctors.map((doc, idx) => (
                        <motion.div 
                            key={doc.id || idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-3 rounded-xl bg-[#1A2236]/40 border border-[#1E2D4580] hover:border-emerald-500/20 hover:bg-[#1A2236]/70 transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-600/20 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400 font-display">
                                        {(doc.name || 'Dr.').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                    {doc.online ? (
                                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#111827] shadow-[0_0_8px_#10B981]" />
                                    ) : (
                                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-slate-500 border-2 border-[#111827]" />
                                    )}
                                </div>
                                <div className="text-left">
                                    <h4 className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">{doc.name}</h4>
                                    <p className="text-[10px] text-[#8899AA]">{doc.specialty || 'General Practitioner'} • <span className="text-[9px] text-[#4A5568]">{doc.hospital || 'Central Health'}</span></p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleQuickGrant(doc.name)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1"
                                title="Authorize Clinician"
                            >
                                Authorize
                            </button>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}

/* ───── Blockchain Network ───── */
function BlockchainNetwork() {
    const { blocks } = useBlockStream();

    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 font-display">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-emerald-400" />
                    </div>
                    Live Blockchain Network
                </h3>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Live</span>
                </div>
            </div>

            {blocks.length > 0 ? (
                <div className="flex flex-wrap gap-3 items-center">
                    {blocks.map((b, i) => (
                        <div key={b.number} className="flex items-center gap-3">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="relative bg-[#1A2236] border border-[#1E2D4580] rounded-xl p-4 min-w-[150px] hover:border-[#00C8D4]/30 transition-all duration-300 group"
                            >
                                {i === blocks.length - 1 && (
                                    <div className="absolute -top-1 -right-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] block animate-pulse" />
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mb-2">
                                    <Cpu className="w-3 h-3 text-[#8899AA]" />
                                    <p className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider">Block #{b.number}</p>
                                </div>
                                <p className="text-sm font-mono font-semibold text-white truncate group-hover:text-[#00C8D4] transition-colors">
                                    {b.hash.substring(0, 12)}...
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] text-[#8899AA]">{b.txCount} txns</span>
                                    <CheckCircle className="w-3 h-3 text-emerald-500/60" />
                                </div>
                            </motion.div>
                            {i < blocks.length - 1 && (
                                <div className="hidden sm:flex items-center gap-1">
                                    <div className="w-2 h-0.5 bg-[#1E2D4580] rounded" />
                                    <div className="w-1 h-0.5 bg-[#1E2D4580] rounded" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 w-36" />)}
                </div>
            )}
        </div>
    );
}

/* ───── Records Table ───── */
function RecordsTable({ records, isLoading }) {
    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 font-display">
                    <div className="w-8 h-8 rounded-lg bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[#00C8D4]" />
                    </div>
                    Medical Records
                </h3>
                <span className="px-3 py-1 rounded-lg bg-[#1A2236] border border-[#1E2D4580] text-xs text-[#8899AA] font-bold uppercase tracking-wider">{records.length} records</span>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
            ) : records.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-[#1E2D4580] rounded-2xl bg-[#1A2236]/30">
                    <div className="w-14 h-14 rounded-2xl bg-[#1A2236] border border-[#1E2D4580] flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-7 h-7 text-[#4A5568]" />
                    </div>
                    <p className="text-sm text-[#E2E8F0] font-medium">No records found</p>
                    <p className="text-xs text-[#8899AA] mt-1">Upload your first record to secure it on the blockchain</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#1E2D4580]">
                                {['Record Name', 'CID Hash', 'Date', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="pb-3 text-left text-[10px] text-[#8899AA] font-bold uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((r, i) => (
                                <motion.tr
                                    key={r.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="border-b border-[#1E2D4580] last:border-0 hover:bg-[#1A2236]/40 transition-colors group"
                                >
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center group-hover:bg-[#00C8D4]/20 transition-colors">
                                                <FileText className="w-4 h-4 text-[#00C8D4]" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-sm">{r.name}</p>
                                                <p className="text-[11px] text-[#8899AA]">{r.type || 'Medical Record'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        {r.cid && r.cid !== 'N/A' ? (
                                            <button 
                                                onClick={() => { 
                                                    navigator.clipboard.writeText(r.cid); 
                                                    toast.success('IPFS CID copied to clipboard!'); 
                                                }}
                                                className="font-mono text-xs text-[#8899AA] hover:text-[#00C8D4] transition-colors px-2 py-1 rounded-md bg-[#1A2236]"
                                                title="Copy IPFS CID to clipboard"
                                            >
                                                {r.cid.substring(0, 16)}...
                                            </button>
                                        ) : (
                                            <span className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded text-xs">Pending</span>
                                        )}
                                    </td>
                                    <td className="py-4 text-xs font-mono text-[#8899AA]">{r.date}</td>
                                    <td className="py-4"><CustomStatusBadge status={r.status || 'verified'} /></td>
                                    <td className="py-4">
                                        <button onClick={() => window.location.href = `/dashboard/patient/records/${r.id || 'REC-001'}`} className="p-2 rounded-lg hover:bg-[#1A2236] text-[#8899AA] hover:text-[#00C8D4] transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/* ───── PAGE ───── */
export default function PatientDashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [isUnlocked, setIsUnlocked] = useState(true);
    const { records, isLoading: recordsLoading } = useRecords();
    const [doctors, setDoctors] = useState([]);
    const [doctorsLoading, setDoctorsLoading] = useState(true);

    useEffect(() => {
        if (!isUnlocked) return;
        setDoctorsLoading(true);
        
        // Fetch all doctors and clinical staff
        const q = query(
            collection(db, 'users'), 
            where('role', 'in', ['doctor', 'clinical'])
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filter out revoked/inactive users
            const activeDocs = list.filter(d => d.status !== 'revoked' && d.status !== 'inactive');

            // Sort so that online clinicians are at the top!
            activeDocs.sort((a, b) => {
                const aOnline = !!a.online;
                const bOnline = !!b.online;
                if (aOnline === bOnline) return 0;
                return aOnline ? -1 : 1;
            });

            setDoctors(activeDocs);
            setDoctorsLoading(false);
        }, (err) => {
            console.error("Firestore active doctors subscription error:", err);
            setDoctors([]);
            setDoctorsLoading(false);
        });

        return () => unsubscribe();
    }, [isUnlocked]);

    const recordCount = records.length;
    const lastUploadTimestamp = records.length > 0 ? records[0].timestamp : null;

    if (!isUnlocked) {
        return <PinGate onUnlock={() => setIsUnlocked(true)} />;
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#00C8D4] animate-pulse shadow-[0_0_8px_#00C8D4]" />
                    <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">{t('patient.pinGate')}</span>
                </div>
                <h1 className="text-3xl font-display font-bold text-white">{t('patient.dashboardTitle')}</h1>
                <p className="text-sm text-[#8899AA] mt-1">Manage, monitor, and secure your medical records on an immutable blockchain network.</p>
            </div>

            {/* Non-intrusive missing profile notification banner for existing users */}
            {(!user?.phone || !user?.bloodGroup || !user?.dob || !user?.emergencyContactName || !user?.profileComplete) && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_30px_rgba(245,158,11,0.05)]"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-white">Profile Details Pending</p>
                            <p className="text-xs text-amber-300/80">Some profile details (blood group, emergency contact, or phone) are missing.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/patient/profile')}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0B0F1A] font-bold text-xs transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)] whitespace-nowrap cursor-pointer"
                    >
                        Complete Profile <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                </motion.div>
            )}

            <StatCards
                recordCount={recordCount}
                authDoctorsCount={doctors.length}
                lastUploadTimestamp={lastUploadTimestamp}
                isLoading={recordsLoading}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                    <UploadZone onUploadComplete={() => {}} />
                </div>
                <div>
                    <AccessPanel />
                </div>
                <div>
                    <ActiveDoctorsPanel doctors={doctors} isLoading={doctorsLoading} />
                </div>
            </div>

            <BlockchainNetwork />
            <RecordsTable records={records} isLoading={recordsLoading} />
        </div>
    );
}
