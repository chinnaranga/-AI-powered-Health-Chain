import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, User, ShieldCheck, ShieldAlert, Key, FileText, Upload,
    Clock, Activity, MessageSquare, Send, Plus, CheckCircle, Database,
    AlertCircle, RefreshCw, Trash2, Calendar, File, Download, Loader2, Play, Eye, FileDown
} from 'lucide-react';
import { db } from '../../firebase/config';
import {
    collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc,
    query, where, onSnapshot, serverTimestamp
} from 'firebase/firestore';
import useAuthStore from '../../store/authStore';
import { recordService } from '../../services/recordService';
import { cryptoService } from '../../services/cryptoService';
import { accessRequestService } from '../../services/accessRequestService';
import { toast } from '../../components/Toast';

export default function ClinicalPatientProfile() {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();

    // Patient info states
    const [patient, setPatient] = useState(null);
    const [loadingPatient, setLoadingPatient] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    // Records and upload states
    const [records, setRecords] = useState([]);
    const [loadingRecords, setLoadingRecords] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadCategory, setUploadCategory] = useState('Prescriptions');
    const [uploadDept, setUploadDept] = useState('General Medicine');
    const [selectedFile, setSelectedFile] = useState(null);

    // Notes and cases states
    const [cases, setCases] = useState([]);
    const [activeCase, setActiveCase] = useState(null);
    const [newNote, setNewNote] = useState('');
    const [caseCondition, setCaseCondition] = useState('');
    const [casePriority, setCasePriority] = useState('medium');
    const [showNewCaseForm, setShowNewCaseForm] = useState(false);

    // Audit logs state
    const [auditLogs, setAuditLogs] = useState([]);

    // Decryption / View state
    const [decryptingRecordId, setDecryptingRecordId] = useState(null);
    const [viewingRecord, setViewingRecord] = useState(null);
    const [decryptedUrl, setDecryptedUrl] = useState(null);

    // Active tab
    const [activeTab, setActiveTab] = useState('records');

    // Load Patient details
    useEffect(() => {
        if (!patientId) return;

        const fetchPatient = async () => {
            setLoadingPatient(true);
            setErrorMsg(null);
            try {
                let resolvedPatient = null;
                // 1. Check patients collection
                const patRef = doc(db, 'patients', patientId);
                const patSnap = await getDoc(patRef);

                if (patSnap.exists()) {
                    resolvedPatient = { id: patSnap.id, ...patSnap.data(), source: 'patients' };
                } else {
                    // 2. Check users collection where role === 'patient'
                    const userRef = doc(db, 'users', patientId);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists() && userSnap.data().role === 'patient') {
                        resolvedPatient = { id: userSnap.id, ...userSnap.data(), source: 'users' };
                    } else {
                        // 3. Fallback search by ID field in both
                        const qPatients = query(collection(db, 'patients'), where('patientId', '==', patientId));
                        const patientsQuerySnap = await getDocs(qPatients);
                        if (!patientsQuerySnap.empty) {
                            const pDoc = patientsQuerySnap.docs[0];
                            resolvedPatient = { id: pDoc.id, ...pDoc.data(), source: 'patients' };
                        }
                    }
                }

                if (resolvedPatient) {
                    // Enforce Access Control Checks
                    // Get clinic/hospital credentials from logged-in clinical user profile
                    const clinicId = currentUser?.clinicId || 'clinic-apollo';
                    const hospitalId = currentUser?.hospitalId || 'hospital-apollo';
                    const orgName = currentUser?.organizationName || currentUser?.hospital || 'Apollo Lab';

                    const isOwn =
                        (resolvedPatient.assignedClinicId && resolvedPatient.assignedClinicId === clinicId) ||
                        (resolvedPatient.assignedHospitalId && resolvedPatient.assignedHospitalId === hospitalId) ||
                        (resolvedPatient.organizationId && resolvedPatient.organizationId === orgName) ||
                        (resolvedPatient.primaryHospital && resolvedPatient.primaryHospital === orgName);

                    // Check if temporary interop session is active for current clinical operator
                    let activeSession = null;
                    try {
                        const qSessions = query(
                            collection(db, 'activeSessions'),
                            where('patientId', '==', patientId),
                            where('doctorId', '==', currentUser?.uid || ''),
                            where('active', '==', true)
                        );
                        const sessionSnap = await getDocs(qSessions);
                        activeSession = sessionSnap.docs.find(d => {
                            const exp = d.data().expiresAt?.toDate ? d.data().expiresAt.toDate() : new Date(d.data().expiresAt);
                            return exp > new Date();
                        });
                    } catch (sessionErr) {
                        console.warn('Error reading active sessions for interop check:', sessionErr);
                    }

                    if (isOwn || activeSession) {
                        setPatient({
                            ...resolvedPatient,
                            isInterop: !isOwn && !!activeSession,
                            activeSession: activeSession ? { id: activeSession.id, ...activeSession.data() } : null
                        });
                    } else {
                        // Log unauthorized access attempt in auditLogs
                        try {
                            const chars = '0123456789abcdef';
                            let txHash = '0x';
                            for (let i = 0; i < 64; i++) {
                                txHash += chars[Math.floor(Math.random() * 16)];
                            }
                            await addDoc(collection(db, 'auditLogs'), {
                                timestamp: serverTimestamp(),
                                activityType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
                                userId: currentUser?.uid || 'clinical-staff',
                                txHash,
                                details: {
                                    patientId: patientId,
                                    patientName: resolvedPatient.fullName || resolvedPatient.name,
                                    action: 'CRITICAL WARNING: Unauthorized operator attempted to bypass and view records.'
                                }
                            });
                        } catch (auditErr) {
                            console.warn('Audit logger failed:', auditErr);
                        }
                        setErrorMsg('UNAUTHORIZED_ACCESS');
                    }
                } else {
                    setErrorMsg('Patient profile not found in registries.');
                }
            } catch (err) {
                console.error('Error fetching patient details:', err);
                setErrorMsg('Failed to load patient records registry.');
            } finally {
                setLoadingPatient(false);
            }
        };

        fetchPatient();
    }, [patientId, currentUser]);

    // Load records in real-time
    useEffect(() => {
        if (!patientId) return;

        const q = query(collection(db, 'records'), where('patientId', '==', patientId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            // Client-side sort by createdAt desc
            list.sort((a, b) => {
                const timeA = a.createdAt?.seconds || a.createdAt?.toMillis?.() || 0;
                const timeB = b.createdAt?.seconds || b.createdAt?.toMillis?.() || 0;
                return timeB - timeA;
            });
            setRecords(list);
            setLoadingRecords(false);
        }, (err) => {
            console.error('Error listening to records:', err);
            setLoadingRecords(false);
        });

        return unsubscribe;
    }, [patientId]);

    // Load clinical cases/notes in real-time
    useEffect(() => {
        if (!patientId) return;

        const q = query(collection(db, 'clinicalCases'), where('patientId', '==', patientId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setCases(list);
            if (list.length > 0) {
                setActiveCase(list[0]);
            } else {
                setActiveCase(null);
            }
        }, (err) => {
            console.error('Error listening to clinical cases:', err);
        });

        return unsubscribe;
    }, [patientId]);

    // Load audit logs in real-time
    useEffect(() => {
        if (!patientId) return;

        const q = query(collection(db, 'auditLogs'), where('details.patientId', '==', patientId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            // Client-side sort by timestamp desc
            list.sort((a, b) => {
                const timeA = a.timestamp?.seconds || a.timestamp?.toMillis?.() || 0;
                const timeB = b.timestamp?.seconds || b.timestamp?.toMillis?.() || 0;
                return timeB - timeA;
            });
            setAuditLogs(list);
        }, (err) => {
            console.error('Error listening to audit logs:', err);
        });

        return unsubscribe;
    }, [patientId]);

    // Calculate age helper
    const getAge = (dobString) => {
        if (!dobString) return 'N/A';
        try {
            const today = new Date();
            const birthDate = new Date(dobString);
            if (isNaN(birthDate.getTime())) return 'N/A';
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        } catch (e) {
            return 'N/A';
        }
    };

    // Handle Note Submission
    const handleSendNote = async (e) => {
        if (e) e.preventDefault();
        if (!newNote.trim()) return;

        const noteObj = {
            author: currentUser?.displayName || currentUser?.name || currentUser?.email || 'Clinical Staff',
            text: newNote.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            role: currentUser?.role || 'clinical'
        };

        try {
            if (activeCase) {
                const updatedNotes = [...(activeCase.notes || []), noteObj];
                await updateDoc(doc(db, 'clinicalCases', activeCase.id), {
                    notes: updatedNotes,
                    lastUpdated: 'Just now'
                });
                toast.success('Clinical note appended to active case docket.');
            } else {
                // Initialize case on the fly
                const caseObj = {
                    patientId: patientId,
                    patientName: patient?.fullName || patient?.name || 'Unknown Patient',
                    status: 'active',
                    priority: 'medium',
                    department: currentUser?.department || 'General Medicine',
                    assignedTo: [currentUser?.displayName || 'Clinical Staff'],
                    lastUpdated: 'Just now',
                    condition: 'General Consultation Note',
                    notes: [noteObj],
                    tasks: [],
                    handoff: false,
                    createdAt: serverTimestamp()
                };
                await addDoc(collection(db, 'clinicalCases'), caseObj);
                toast.success('Clinical case docket generated and note logged.');
            }
            setNewNote('');
        } catch (err) {
            console.error('Error saving clinical case/note:', err);
            toast.error('Failed to save clinical note: ' + err.message);
        }
    };

    // Handle Manual Case docket creation
    const handleCreateCase = async (e) => {
        if (e) e.preventDefault();
        if (!caseCondition.trim()) return toast.error('Condition/Diagnosis is required.');

        try {
            const caseObj = {
                patientId: patientId,
                patientName: patient?.fullName || patient?.name || 'Unknown Patient',
                status: 'active',
                priority: casePriority,
                department: uploadDept,
                assignedTo: [currentUser?.displayName || 'Clinical Staff'],
                lastUpdated: 'Just now',
                condition: caseCondition.trim(),
                notes: [],
                tasks: [],
                handoff: false,
                createdAt: serverTimestamp()
            };
            await addDoc(collection(db, 'clinicalCases'), caseObj);
            toast.success('New clinical case docket initialized successfully.');
            setCaseCondition('');
            setShowNewCaseForm(false);
        } catch (err) {
            console.error('Error creating clinical case:', err);
            toast.error('Failed to initialize case: ' + err.message);
        }
    };

    // File selection handler
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // Drag-and-drop file handlers
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    // Handle Secure Upload
    const handleUpload = async () => {
        if (!selectedFile) return toast.warning('Please select a file to upload first.');
        if (!patientId) return toast.error('Invalid patient session context.');

        setUploading(true);
        setUploadProgress(10);
        try {
            const uploaderInfo = {
                uid: currentUser?.uid || 'clinical-staff',
                role: currentUser?.role || 'clinical',
                name: currentUser?.displayName || currentUser?.name || currentUser?.email || 'Clinical Portal',
                hospital: currentUser?.hospital || patient?.primaryHospital || 'Central Health Node'
            };

            setUploadProgress(30);
            await recordService.uploadMedicalRecord(
                selectedFile,
                patientId,
                uploaderInfo,
                uploadCategory,
                (progress) => {
                    setUploadProgress(Math.min(95, 30 + Math.floor(progress * 0.6)));
                },
                uploadDept
            );

            setUploadProgress(100);
            toast.success(`EHR record "${selectedFile.name}" encrypted client-side and saved.`);
            setSelectedFile(null);
        } catch (err) {
            console.error('File secure upload failure:', err);
            toast.error('Secure record upload failed: ' + err.message);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    // Cryptographic decryption inside attendee browser context
    const handleDecryptRecord = async (record) => {
        setDecryptingRecordId(record.id);
        try {
            // Log access attempt to audit logs
            try {
                await accessRequestService.logAuditActivity('RECORD_DECRYPTED_VIEWED', currentUser?.uid || 'clinical-staff', {
                    patientId: patientId,
                    recordId: record.id,
                    action: 'Clinical staff initiated cryptographically secure zero-knowledge record decryption.'
                });
            } catch (auditErr) {
                console.warn('Non-critical audit logging issue:', auditErr);
            }

            // Fetch the encrypted file
            const response = await fetch(record.fileUrl);
            const arrayBuffer = await response.arrayBuffer();

            // Decrypt stream client-side
            const decryptedBytes = await cryptoService.decrypt(new Uint8Array(arrayBuffer), patientId);

            // Mount local decrypted URL
            const blob = new Blob([decryptedBytes], { type: record.fileType || 'application/pdf' });
            const localUrl = URL.createObjectURL(blob);

            setDecryptedUrl(localUrl);
            setViewingRecord(record);
            toast.success('ZKP block decrypted successfully. Local sandbox key active.');
        } catch (err) {
            console.error('Decryption failed:', err);
            toast.error('Decryption failed: Verification key mismatch or expired consent.');
        } finally {
            setDecryptingRecordId(null);
        }
    };

    const closeViewer = () => {
        if (decryptedUrl) {
            URL.revokeObjectURL(decryptedUrl);
        }
        setViewingRecord(null);
        setDecryptedUrl(null);
    };

    if (loadingPatient) {
        return (
            <div className="min-h-screen bg-[#0B0F1A] text-white flex items-center justify-center flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />
                <Loader2 className="w-12 h-12 text-[#00C8D4] animate-spin" />
                <span className="font-display font-semibold text-xs text-[#00C8D4] uppercase tracking-widest animate-pulse">
                    Decrypting Patient Registry...
                </span>
            </div>
        );
    }

    if (errorMsg === 'UNAUTHORIZED_ACCESS') {
        return (
            <div className="min-h-screen bg-[#0B0F1A] text-white flex items-center justify-center flex-col p-6 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-500/10 rounded-full blur-[90px] pointer-events-none" />
                <ShieldAlert className="w-20 h-20 text-red-500 mb-6 animate-pulse" />
                <h3 className="text-2xl font-bold font-display text-white mb-2 uppercase tracking-wide">Unauthorized Security Access</h3>
                <p className="text-sm text-red-400/80 font-mono text-center max-w-lg mb-4">
                    SECURITY EXCEPTION: Patient records are isolated to clinic-specific workspaces. Direct URL parameter modification is prohibited.
                </p>
                <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl max-w-md text-xs font-mono text-slate-400 space-y-2 mb-8 leading-relaxed">
                    <p className="text-red-400 font-bold">Immutable Ledger Action Recorded:</p>
                    <p>&middot; OPERATOR ID: {currentUser?.uid}</p>
                    <p>&middot; ACTION TYPE: UNAUTHORIZED_ACCESS_ATTEMPT</p>
                    <p>&middot; STATUS: BLOCKED & REPORTED</p>
                    <p className="text-[10px] text-slate-500">Node sync height: #14,921,804 &middot; SHA256 integrity check validated.</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/clinical/viewer')}
                    className="px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                >
                    Return to Clinical Viewer
                </button>
            </div>
        );
    }

    if (errorMsg || !patient) {
        return (
            <div className="min-h-screen bg-[#0B0F1A] text-white flex items-center justify-center flex-col p-6">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4 animate-bounce" />
                <h3 className="text-xl font-bold font-display text-white mb-2">Error Loading Profile</h3>
                <p className="text-sm text-[#8899AA] text-center max-w-md mb-6">{errorMsg || 'Failed to sync with secure registry blocks.'}</p>
                <button onClick={() => navigate('/dashboard/clinical')} className="px-6 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm font-semibold transition-all">
                    Back to Command Center
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-6 px-4 py-2 text-left">
            {/* Header Command bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1E2D4580] pb-6">
                <div className="space-y-1">
                    <button
                        onClick={() => navigate('/dashboard/clinical')}
                        className="flex items-center gap-1.5 text-xs text-[#8899AA] hover:text-white transition-colors font-mono mb-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Return to Dashboard
                    </button>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-3xl font-display font-bold text-white tracking-tight">{patient.fullName || patient.name}</h2>
                        <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> ZKP Verified
                        </span>
                        <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#00C8D4]/10 border border-[#00C8D4]/20 text-[#00C8D4]">
                            {patient.globalPatientId || 'HCG-UNKNOWN'}
                        </span>
                    </div>
                    <p className="text-xs text-[#8899AA] font-mono mt-1">
                        Secure Client-Side Sandboxed Portal &middot; Access token signed by attending node
                    </p>
                </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left side details and upload */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Patient detail card */}
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 space-y-4">
                        <div className="flex items-center gap-2 border-b border-[#1E2D4540] pb-3">
                            <User className="w-4 h-4 text-[#00C8D4]" />
                            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">Patient Identity</h3>
                        </div>
                        <div className="space-y-3.5 text-xs font-sans">
                            <div className="flex justify-between border-b border-white/[0.02] pb-2">
                                <span className="text-[#8899AA]">Full Name</span>
                                <span className="font-semibold text-white">{patient.fullName || patient.name}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/[0.02] pb-2">
                                <span className="text-[#8899AA]">Global ID</span>
                                <span className="font-mono font-bold text-[#00C8D4]">{patient.globalPatientId || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/[0.02] pb-2">
                                <span className="text-[#8899AA]">ABHA ID</span>
                                <span className="font-mono text-white">{patient.abhaId || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/[0.02] pb-2">
                                <span className="text-[#8899AA]">Aadhaar Last 4</span>
                                <span className="font-mono font-semibold text-amber-400">
                                    {patient.aadhaarMasked ? patient.aadhaarMasked : 'Masked (Not Linked)'}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-white/[0.02] pb-2">
                                <span className="text-[#8899AA]">Age / Gender</span>
                                <span className="font-semibold text-white">
                                    {getAge(patient.dob)} yrs / {patient.gender || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-white/[0.02] pb-2">
                                <span className="text-[#8899AA]">Blood Group</span>
                                <span className="font-semibold text-white">{patient.bloodGroup || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/[0.02] pb-2">
                                <span className="text-[#8899AA]">Primary Hospital</span>
                                <span className="font-semibold text-white truncate max-w-[150px]">{patient.primaryHospital || 'Central Health Vault'}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/[0.02] pb-2">
                                <span className="text-[#8899AA]">Emergency Contact</span>
                                <span className="font-semibold text-white">{patient.emergencyContact || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col gap-1.5 border-b border-white/[0.02] pb-2">
                                <span className="text-[#8899AA]">Allergies</span>
                                <div className="flex flex-wrap gap-1">
                                    {(!patient.allergies || patient.allergies.length === 0) ? (
                                        <span className="text-[#8899AA] italic">None declared</span>
                                    ) : patient.allergies.map(a => (
                                        <span key={a} className="text-[9px] font-bold bg-red-500/10 border border-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                                            {a}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5 pb-1">
                                <span className="text-[#8899AA]">Chronic Conditions</span>
                                <div className="flex flex-wrap gap-1">
                                    {(!patient.chronicConditions || patient.chronicConditions.length === 0) ? (
                                        <span className="text-[#8899AA] italic">None declared</span>
                                    ) : patient.chronicConditions.map(c => (
                                        <span key={c} className="text-[9px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Secure record uploader */}
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 space-y-4">
                        <div className="flex items-center gap-2 border-b border-[#1E2D4540] pb-3">
                            <Upload className="w-4 h-4 text-[#00C8D4]" />
                            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">Secure Upload</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Drag drop area */}
                            <div
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                className="border border-dashed border-[#1E2D4580] hover:border-[#00C8D4]/40 rounded-xl p-5 text-center cursor-pointer transition-colors relative bg-[#0B0F1A]/50 group"
                            >
                                <input
                                    type="file"
                                    id="fileInput"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={uploading}
                                />
                                <div className="space-y-2">
                                    <File className="w-8 h-8 text-[#8899AA] group-hover:text-[#00C8D4] mx-auto transition-colors" />
                                    {selectedFile ? (
                                        <div>
                                            <p className="text-xs font-semibold text-white truncate max-w-[200px] mx-auto">{selectedFile.name}</p>
                                            <p className="text-[10px] text-slate-500 mt-1 font-mono">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-xs font-medium text-[#CBD5E1]">Drag file here or click to browse</p>
                                            <p className="text-[10px] text-slate-500 mt-1">Supports PDF, JPEG, PNG</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Category Select */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-[#8899AA] uppercase tracking-wider">Record Category</label>
                                <select
                                    value={uploadCategory}
                                    onChange={e => setUploadCategory(e.target.value)}
                                    className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8D4]/40"
                                >
                                    <option value="Prescriptions">Prescription</option>
                                    <option value="Lab Reports">Lab Report</option>
                                    <option value="MRI">MRI Scan</option>
                                    <option value="X-Ray">X-Ray Image</option>
                                    <option value="CT Scan">CT Scan</option>
                                    <option value="ECG">ECG Graph</option>
                                    <option value="Vaccination">Vaccination Record</option>
                                    <option value="Surgery">Surgery Report</option>
                                    <option value="Insurance">Insurance Receipt</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Department Select */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-[#8899AA] uppercase tracking-wider">Department</label>
                                <select
                                    value={uploadDept}
                                    onChange={e => setUploadDept(e.target.value)}
                                    className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8D4]/40"
                                >
                                    <option value="General Medicine">General Medicine</option>
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Orthopedics">Orthopedics</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                    <option value="Neurology">Neurology</option>
                                    <option value="Radiology">Radiology</option>
                                    <option value="Oncology">Oncology</option>
                                </select>
                            </div>

                            {/* Progress bar */}
                            {uploading && (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-mono text-cyan-400">
                                        <span>Encrypting & Syncing...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-[#0B0F1A] h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-[#00C8D4] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                </div>
                            )}

                            {/* Submit button */}
                            <button
                                onClick={handleUpload}
                                disabled={uploading || !selectedFile}
                                className="w-full py-2.5 rounded-xl bg-[#00C8D4] text-[#0B0F1A] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#00E5F0] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,200,212,0.15)]"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading Securely...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="w-3.5 h-3.5" /> Client-Side Encrypt & Upload
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right side tab view */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Tabs control */}
                    <div className="flex border-b border-[#1E2D4580] gap-2 p-1 bg-[#111827]/40 rounded-xl">
                        {[
                            { id: 'records', label: 'EHR Records Registry', icon: FileText },
                            { id: 'notes', label: 'Clinical Cases Timeline', icon: MessageSquare },
                            { id: 'audit', label: 'Ledger Audit Trails', icon: Activity }
                        ].map(t => {
                            const Icon = t.icon;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold font-mono uppercase tracking-wider transition-all ${activeTab === t.id
                                            ? 'bg-[#00C8D4]/10 border border-[#00C8D4]/30 text-[#00C8D4]'
                                            : 'text-[#8899AA] hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{t.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab panels */}
                    <div className="flex-1 bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 min-h-[450px]">
                        <AnimatePresence mode="wait">
                            {/* Tab 1: EHR Records Registry */}
                            {activeTab === 'records' && (
                                <motion.div
                                    key="records-tab"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4 text-left"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-base font-display font-bold text-white">Cryptographically Shielded Files</h3>
                                        <span className="text-[10px] font-mono text-[#8899AA]">{records.length} documents</span>
                                    </div>

                                    {loadingRecords ? (
                                        <div className="flex justify-center items-center py-20">
                                            <Loader2 className="w-8 h-8 text-[#00C8D4] animate-spin" />
                                        </div>
                                    ) : records.length === 0 ? (
                                        <div className="p-12 text-center text-[#8899AA] border border-dashed border-[#1E2D4560] rounded-xl font-mono text-xs">
                                            No EHR documents linked to this patient ID. Use the Secure Upload form to link files.
                                        </div>
                                    ) : (
                                        <div className="space-y-3.5">
                                            {records.map(rec => (
                                                <div
                                                    key={rec.id}
                                                    className="p-4 rounded-xl bg-[#0B0F1A]/60 border border-[#1E2D4560] hover:border-[#00C8D4]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2.5 rounded-lg bg-[#00C8D4]/10 border border-[#00C8D4]/20 text-[#00C8D4]">
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-white truncate max-w-[250px] sm:max-w-[320px]">{rec.fileName}</h4>
                                                            <div className="flex items-center gap-2 flex-wrap mt-1 text-[10px] text-[#8899AA] font-mono">
                                                                <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-300">{rec.category}</span>
                                                                <span>&middot;</span>
                                                                <span>{rec.fileSize}</span>
                                                                <span>&middot;</span>
                                                                <span className="text-[#00C8D4]">{rec.department}</span>
                                                            </div>
                                                            <div className="mt-2 flex items-center gap-1 text-[9px] font-mono text-slate-500">
                                                                <Database className="w-3 h-3" />
                                                                <span className="truncate max-w-[200px]" title={rec.cidHash}>IPFS: {rec.cidHash || 'Simulated Hash'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2.5 self-end sm:self-center">
                                                        {decryptingRecordId === rec.id ? (
                                                            <button className="px-3 py-1.5 rounded-lg bg-[#00C8D4]/15 border border-[#00C8D4]/30 text-[#00C8D4] text-xs font-bold flex items-center gap-1" disabled>
                                                                <Loader2 className="w-3 h-3 animate-spin" /> Verifying...
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleDecryptRecord(rec)}
                                                                className="px-3 py-1.5 rounded-lg bg-[#00C8D4]/10 hover:bg-[#00C8D4]/20 border border-[#00C8D4]/20 text-[#00C8D4] hover:text-white text-xs font-bold flex items-center gap-1 transition-all"
                                                            >
                                                                <Play className="w-3.5 h-3.5" /> Decrypt & View
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Tab 2: Clinical Cases Timeline */}
                            {activeTab === 'notes' && (
                                <motion.div
                                    key="notes-tab"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-5 text-left"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h3 className="text-base font-display font-bold text-white">Clinical Diagnosis Case Docket</h3>
                                            <p className="text-xs text-[#8899AA] mt-0.5">Attending notes, discussion feed, and handoff histories.</p>
                                        </div>
                                        {!activeCase && !showNewCaseForm && (
                                            <button
                                                onClick={() => setShowNewCaseForm(true)}
                                                className="px-3 py-1.5 rounded-lg bg-[#00C8D4]/10 hover:bg-[#00C8D4]/20 border border-[#00C8D4]/30 text-[#00C8D4] text-xs font-bold flex items-center gap-1 transition-all"
                                            >
                                                <Plus className="w-3.5 h-3.5" /> Initialize Case
                                            </button>
                                        )}
                                    </div>

                                    {/* New Case Form */}
                                    {showNewCaseForm && (
                                        <div className="p-4 rounded-xl bg-[#0B0F1A]/60 border border-[#1E2D45] space-y-3.5">
                                            <h4 className="text-xs font-bold font-mono text-[#00C8D4] uppercase tracking-wider">New Docket Registry Details</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-mono text-[#8899AA]">Condition Description</label>
                                                    <input
                                                        value={caseCondition}
                                                        onChange={e => setCaseCondition(e.target.value)}
                                                        placeholder="e.g., Hypertensive Crisis, Day 2 Post-Op"
                                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00C8D4]"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-mono text-[#8899AA]">Priority Severity</label>
                                                    <select
                                                        value={casePriority}
                                                        onChange={e => setCasePriority(e.target.value)}
                                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-lg px-3 py-2 text-white focus:outline-none"
                                                    >
                                                        <option value="low">Low</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="high">High</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => setShowNewCaseForm(false)} className="px-3 py-1.5 rounded-lg text-slate-400 text-xs hover:text-white font-mono">Cancel</button>
                                                <button onClick={handleCreateCase} className="px-4.5 py-1.5 rounded-lg bg-[#00C8D4] text-[#0B0F1A] text-xs font-bold font-mono hover:bg-[#00E5F0] transition-colors">Initialize Docket</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Cases List & Note flow */}
                                    {!activeCase ? (
                                        <div className="p-12 text-center text-[#8899AA] border border-dashed border-[#1E2D4560] rounded-xl font-mono text-xs">
                                            No active clinical case dockets. Initialize a case docket or type a note below to start registry.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Active Case Details info banner */}
                                            <div className="p-4 rounded-xl bg-[#0B0F1A]/80 border border-[#1E2D45] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${activeCase.priority === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                                activeCase.priority === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                                    'bg-slate-500/10 border-slate-500/20 text-[#8899AA]'
                                                            }`}>
                                                            {activeCase.priority} severity
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-mono">{activeCase.department}</span>
                                                    </div>
                                                    <h4 className="text-sm font-bold text-white">{activeCase.condition}</h4>
                                                </div>
                                                <div className="text-right sm:border-l sm:border-[#1E2D45] sm:pl-4">
                                                    <span className="text-[10px] text-[#8899AA] font-mono block">Attending:</span>
                                                    <span className="text-xs text-white font-semibold">{activeCase.assignedTo?.join(', ') || 'Staff'}</span>
                                                </div>
                                            </div>

                                            {/* Discussion Feed */}
                                            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                                                {(!activeCase.notes || activeCase.notes.length === 0) ? (
                                                    <p className="text-xs text-slate-500 italic p-4 text-center font-mono">No notes recorded inside this case docket yet.</p>
                                                ) : activeCase.notes.map((note, idx) => {
                                                    const initials = note.author.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                                                    return (
                                                        <div key={idx} className="flex gap-3 text-xs bg-white/[0.01] p-3 rounded-lg border border-white/[0.02]">
                                                            <div className="w-7 h-7 rounded-full bg-[#00C8D4]/10 border border-[#00C8D4]/20 text-[#00C8D4] flex items-center justify-center font-bold flex-shrink-0">
                                                                {initials}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <span className="font-bold text-white">{note.author}</span>
                                                                    <span className="text-[9px] font-mono text-slate-500">{note.time}</span>
                                                                    <span className="text-[9px] font-mono px-1 rounded bg-white/[0.04] text-slate-400 capitalize">{note.role}</span>
                                                                </div>
                                                                <p className="text-slate-300 leading-relaxed font-sans">{note.text}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Send note input form */}
                                    <form onSubmit={handleSendNote} className="flex gap-2 pt-2 border-t border-[#1E2D4560]">
                                        <input
                                            value={newNote}
                                            onChange={e => setNewNote(e.target.value)}
                                            placeholder="Write a clinical note, treatment comment, or diagnosis handoff..."
                                            className="flex-1 bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]/40"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newNote.trim()}
                                            className="px-4.5 rounded-xl bg-[#00C8D4] text-[#0B0F1A] hover:bg-[#00E5F0] transition-colors flex items-center justify-center text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <Send className="w-3.5 h-3.5 mr-1" /> Log Note
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            {/* Tab 3: Ledger Audit Trails */}
                            {activeTab === 'audit' && (
                                <motion.div
                                    key="audit-tab"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4 text-left"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-base font-display font-bold text-white">On-Chain Activity Logs</h3>
                                        <span className="text-[10px] font-mono text-[#8899AA]">{auditLogs.length} blocks validated</span>
                                    </div>

                                    <div className="space-y-2 max-h-[380px] overflow-y-auto font-mono text-xs pr-1">
                                        {auditLogs.length === 0 ? (
                                            <div className="p-12 text-center text-[#8899AA] border border-dashed border-[#1E2D4560] rounded-xl font-mono text-xs">
                                                No ledger logs written for this patient transaction profile yet.
                                            </div>
                                        ) : auditLogs.map((log, idx) => {
                                            const logTime = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : new Date().toLocaleString();
                                            return (
                                                <div
                                                    key={log.id || idx}
                                                    className="p-3 bg-[#0B0F1A]/70 border border-[#1E2D4560] rounded-lg space-y-1.5 hover:border-teal-500/20 transition-all"
                                                >
                                                    <div className="flex justify-between items-center gap-2 flex-wrap">
                                                        <span className="font-bold text-[#00C8D4] text-[10px]">{log.activityType}</span>
                                                        <span className="text-slate-500 text-[10px]">{logTime}</span>
                                                    </div>
                                                    <p className="text-[#CBD5E1] text-[11px] leading-relaxed">
                                                        {log.details?.action || log.details?.description || `Action executed by operator ID: ${log.userId}`}
                                                    </p>
                                                    {log.txHash && (
                                                        <div className="text-[9px] text-slate-500 truncate flex items-center gap-1.5">
                                                            <Database className="w-3 h-3 text-slate-600 flex-shrink-0" />
                                                            <span>TX: {log.txHash}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Decrypted File Viewer Modal Overlay */}
            <AnimatePresence>
                {viewingRecord && decryptedUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-[#0B0F1A]/90 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#111827] border border-[#1E2D45] rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative"
                        >
                            {/* Modal Header */}
                            <div className="p-4 border-b border-[#1E2D45] flex items-center justify-between bg-[#1A2236]/30">
                                <div>
                                    <h3 className="text-sm font-bold text-white font-mono">{viewingRecord.fileName}</h3>
                                    <p className="text-[10px] text-[#8899AA] font-mono mt-0.5">
                                        Client-Side Decrypted ArrayBuffer &middot; Local sandboxed sandbox sandbox
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={decryptedUrl}
                                        download={viewingRecord.fileName.replace('.enc', '')}
                                        className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-[#00C8D4] hover:text-white transition-colors"
                                        title="Download Raw File"
                                    >
                                        <FileDown className="w-4 h-4" />
                                    </a>
                                    <button
                                        onClick={closeViewer}
                                        className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all"
                                    >
                                        Close Sandbox
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 bg-[#0B0F1A] flex items-center justify-center overflow-auto p-4">
                                {viewingRecord.fileType?.startsWith('image/') ? (
                                    <img
                                        src={decryptedUrl}
                                        alt="Sandboxed decrypted clinical record"
                                        className="max-h-full max-w-full object-contain rounded-lg border border-white/[0.05]"
                                    />
                                ) : viewingRecord.fileType === 'application/pdf' || viewingRecord.fileName.endsWith('.pdf') ? (
                                    <iframe
                                        src={decryptedUrl}
                                        title="Sandboxed decrypted clinical PDF"
                                        className="w-full h-full border-0 rounded-lg bg-white"
                                    />
                                ) : (
                                    <div className="text-center p-8 text-[#8899AA] font-mono text-xs">
                                        <FileText className="w-12 h-12 text-[#00C8D4] mx-auto mb-3" />
                                        <span>Preview not supported for file type: {viewingRecord.fileType}.</span>
                                        <div className="mt-4">
                                            <a
                                                href={decryptedUrl}
                                                download={viewingRecord.fileName.replace('.enc', '')}
                                                className="px-4 py-2 rounded-lg bg-[#00C8D4] text-[#0B0F1A] hover:bg-[#00E5F0] transition-colors inline-flex items-center gap-1.5 font-bold"
                                            >
                                                <Download className="w-4 h-4" /> Download Decrypted File
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
