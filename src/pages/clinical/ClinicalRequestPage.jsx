import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, User, Send, Clock, CheckCircle, XCircle, ShieldCheck,
    AlertTriangle, ChevronRight, RotateCcw, Clipboard, FileText,
    Hourglass, Lock, Zap, Key, Filter, History
} from 'lucide-react';

import useAuthStore from '../../store/authStore';
import { userService } from '../../services/userService';
import { accessRequestService } from '../../services/accessRequestService';
import { toast } from '../../components/Toast';
import { db } from '../../firebase/config';
import { collection, getDocs, query as fsQuery, where, onSnapshot } from 'firebase/firestore';

const recordTypes = ['Lab Results', 'Imaging / Radiology', 'Prescriptions', 'Clinical Notes', 'Surgical History', 'Full Patient Chart'];
const urgencyLevels = ['Routine', 'Urgent', 'Critical / Emergency'];
const durations = ['30 Minutes', '1 Hour', '4 Hours', '24 Hours'];

export default function ClinicalRequestPage() {
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const docId = currentUser?.uid || currentUser?.id || currentUser?.user?.uid;
    
    const [step, setStep] = useState(0);
    const [query, setQuery] = useState('');
    const [patients, setPatients] = useState([]);
    const [isLoadingPatients, setIsLoadingPatients] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);
    
    // Advanced Filters
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [filterName, setFilterName] = useState('');
    const [filterAadhaar, setFilterAadhaar] = useState('');
    const [filterAbha, setFilterAbha] = useState('');
    const [filterGlobalId, setFilterGlobalId] = useState('');
    const [filterHospital, setFilterHospital] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Sidebar Lists
    const [historicalRequests, setHistoricalRequests] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);

    // Request Form
    const [recordType, setRecordType] = useState(recordTypes[0]);
    const [urgency, setUrgency] = useState(urgencyLevels[0]);
    const [duration, setDuration] = useState(durations[0]);
    const [reason, setReason] = useState('');
    const [isEmergencyMode, setIsEmergencyMode] = useState(false);
    
    // Request Tracking
    const [activeRequestId, setActiveRequestId] = useState(null);
    const [requestStatus, setRequestStatus] = useState(null); // 'pending', 'approved', 'rejected'
    const [emergencyConfirmText, setEmergencyConfirmText] = useState('');
    
    // OTP Verification
    const [otpCode, setOtpCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    
    // Session
    const [activeSessionId, setActiveSessionId] = useState(null);

    // 1. Fetch Patients from both users and patients collections
    useEffect(() => {
        const fetchPatients = async () => {
            setIsLoadingPatients(true);
            try {
                // Fetch users
                const allUsers = await userService.getUsers();
                const patientUsers = allUsers.filter(u => u.role === 'patient' || !u.role);

                // Fetch patients
                const patientsRef = collection(db, 'patients');
                const patientsSnap = await getDocs(patientsRef);
                const patientsList = [];
                patientsSnap.forEach(docSnap => {
                    patientsList.push({ id: docSnap.id, ...docSnap.data() });
                });

                // Merge (prevent duplicates)
                const merged = [...patientsList];
                patientUsers.forEach(u => {
                    const exists = merged.some(p => p.id === u.id || p.patientId === u.id);
                    if (!exists) {
                        merged.push(u);
                    }
                });

                // Normalize name and details
                const normalized = merged.map(p => ({
                    ...p,
                    name: p.fullName || p.name || p.displayName || p.email || 'Unknown Patient',
                    dob: p.dob || '',
                    gender: p.gender || 'N/A',
                    abhaId: p.abhaId || '',
                    aadhaarMasked: p.aadhaarMasked || '',
                    globalPatientId: p.globalPatientId || `GB-${p.id.slice(0, 5).toUpperCase()}`,
                    primaryHospital: p.primaryHospital || 'Central Hospital'
                }));

                setPatients(normalized);
            } catch (error) {
                console.error("Failed to load patients", error);
            } finally {
                setIsLoadingPatients(false);
            }
        };
        fetchPatients();
    }, []);

    // Listen to historical requests by this doctor
    useEffect(() => {
        if (!docId) return;
        const q = fsQuery(collection(db, 'accessRequests'), where('doctorId', '==', docId));
        const unsub = onSnapshot(q, (snapshot) => {
            const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            reqs.sort((a, b) => {
                const tA = a.timestamp?.toDate() || 0;
                const tB = b.timestamp?.toDate() || 0;
                return tB - tA;
            });
            setHistoricalRequests(reqs);
        }, (error) => {
            console.error("Failed to sync historical requests:", error);
        });
        return () => unsub();
    }, [docId]);

    // Listen to active sessions where doctorId matches
    useEffect(() => {
        if (!docId) return;
        const q = fsQuery(collection(db, 'activeSessions'), where('doctorId', '==', docId));
        const unsub = onSnapshot(q, (snapshot) => {
            const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setActiveSessions(sessions);
        }, (error) => {
            console.error("Failed to sync active sessions:", error);
        });
        return () => unsub();
    }, [docId]);

    // Listen to audit logs where actor matches this doctor
    useEffect(() => {
        if (!docId) return;
        const q = fsQuery(collection(db, 'auditLogs'), where('userId', '==', docId));
        const unsub = onSnapshot(q, (snapshot) => {
            const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            logs.sort((a, b) => {
                const tA = a.timestamp?.toDate() || 0;
                const tB = b.timestamp?.toDate() || 0;
                return tB - tA;
            });
            setAuditLogs(logs);
        }, (error) => {
            console.error("Failed to sync audit logs:", error);
        });
        return () => unsub();
    }, [docId]);

    const getPatientRequestStatus = (patientId) => {
        const hasSession = activeSessions.some(s => s.patientId === patientId && s.active && s.expiresAt?.toDate() > new Date());
        if (hasSession) return 'Access Active';

        const latestReq = historicalRequests.find(r => r.patientId === patientId);
        if (latestReq) {
            if (latestReq.status === 'pending') return 'Pending Approval';
            if (latestReq.status === 'approved') return 'Awaiting OTP';
            if (latestReq.status === 'rejected') return 'Rejected';
            if (latestReq.status === 'used') return 'Used / Expired';
        }
        return 'No Access';
    };

    const calculateAge = (dobString) => {
        if (!dobString) return 'N/A';
        const today = new Date();
        const birthDate = new Date(dobString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const filteredPatients = patients.filter(p => {
        // 1. Search Query filter (main search bar)
        const matchesQuery = !query.trim() || (() => {
            const qLower = query.toLowerCase().trim();
            // If the query is exactly 4 digits, match only masked Aadhaar records ending with it
            if (/^\d{4}$/.test(qLower)) {
                return p.aadhaarMasked?.endsWith(qLower);
            }
            return (
                p.name?.toLowerCase().includes(qLower) ||
                p.email?.toLowerCase().includes(qLower) ||
                p.abhaId?.toLowerCase().includes(qLower) ||
                p.globalPatientId?.toLowerCase().includes(qLower) ||
                p.id?.toLowerCase().includes(qLower)
            );
        })();

        // 2. Specific advanced field filters
        const matchesName = !filterName.trim() || p.name?.toLowerCase().includes(filterName.toLowerCase().trim());
        const matchesAadhaar = !filterAadhaar.trim() || (() => {
            const digits = filterAadhaar.replace(/\D/g, '');
            if (digits.length === 4) {
                return p.aadhaarMasked?.endsWith(digits);
            }
            return p.aadhaarMasked?.includes(digits);
        })();
        const matchesAbha = !filterAbha.trim() || p.abhaId?.toLowerCase().includes(filterAbha.toLowerCase().trim());
        const matchesGlobalId = !filterGlobalId.trim() || p.globalPatientId?.toLowerCase().includes(filterGlobalId.toLowerCase().trim());
        const matchesHospital = !filterHospital.trim() || p.primaryHospital?.toLowerCase().includes(filterHospital.toLowerCase().trim());
        
        const matchesStatus = filterStatus === 'All' || (() => {
            const status = getPatientRequestStatus(p.id);
            return status.toLowerCase() === filterStatus.toLowerCase();
        })();

        return matchesQuery && matchesName && matchesAadhaar && matchesAbha && matchesGlobalId && matchesHospital && matchesStatus;
    });

    // 2. Listen to request status
    useEffect(() => {
        if (!activeRequestId) return;
        const unsub = accessRequestService.listenToDoctorRequest(activeRequestId, (req) => {
            setRequestStatus(req.status);
        });
        return () => unsub();
    }, [activeRequestId]);

    // Actions
    const handleSendRequest = async () => {
        if (!currentUser || !selectedPatient) return;
        try {
            const reqId = await accessRequestService.createRequest(currentUser, selectedPatient.id, {
                hospital: 'Central Hospital', // In a real app, pull from provider profile
                department: 'General',
                reason,
                duration,
                urgency
            });
            setActiveRequestId(reqId);
            setRequestStatus('pending');
            setStep(2); // Jump to Waiting
        } catch (error) {
            toast.error("Failed to send request: " + error.message);
        }
    };

    const handleVerifyOTP = async () => {
        if (otpCode.length < 6) return toast.error('Enter 6-digit OTP');
        setIsVerifying(true);
        try {
            const sessionId = await accessRequestService.verifyOTPAndGrantAccess(
                activeRequestId, 
                otpCode, 
                currentUser.uid || currentUser.id || currentUser.user?.uid
            );
            setActiveSessionId(sessionId);
            toast.success('Access Granted Successfully');
            setStep(3); // Access Confirmed
        } catch (error) {
            toast.error(error.message || 'OTP Verification Failed');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleEmergencyOverride = async () => {
        if (emergencyConfirmText !== 'I CONFIRM') return;
        setIsEmergencyMode(true);
        
        try {
            // Log emergency access directly via service
            await accessRequestService.logAuditActivity(
                'EMERGENCY_OVERRIDE_GRANTED', 
                currentUser.uid || currentUser.id || currentUser.user?.uid, 
                {
                patientId: selectedPatient.id,
                reason
            });
            toast.warning('Emergency access override engaged. Action logged.');
            setStep(3);
        } catch (error) {
            toast.error('Failed to engage emergency mode');
        }
    };

    const currentSteps = ['Find Patient', 'Build Request', 'Authorization', 'Access Granted'];

    return (
        <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Interactive Wizard (col-span-2) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-1">
                            <Lock className="w-4 h-4 text-[#00C8D4]" />
                            <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Consent-First Workflow</span>
                        </div>
                        <h2 className="text-3xl font-display font-bold text-white">Patient Access Request</h2>
                        <p className="text-sm text-[#8899AA] mt-1">Record access is only granted after the patient approves via OTP on their dashboard.</p>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center gap-0 mb-10">
                        {currentSteps.map((s, i) => (
                            <React.Fragment key={s}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                                        i < step ? 'bg-emerald-500 border-emerald-500 text-white' :
                                        i === step ? 'bg-[#00C8D4]/15 border-[#00C8D4] text-[#00C8D4]' :
                                        'bg-[#111827] border-[#1E2D4580] text-[#4A5568]'
                                    }`}>
                                        {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                                    </div>
                                    <span className={`text-[10px] mt-1.5 font-semibold whitespace-nowrap ${
                                        i === step ? 'text-[#00C8D4]' : i < step ? 'text-emerald-400' : 'text-[#4A5568]'
                                    }`}>{s}</span>
                                </div>
                                {i < currentSteps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 mt-[-14px] ${i < step ? 'bg-emerald-500' : 'bg-[#1E2D4580]'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {/* STEP 0: Find Patient */}
                        {step === 0 && (
                            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="rounded-2xl bg-[#111827] border border-[#1E2D4580] p-6">
                                <h3 className="text-lg font-display font-bold text-white mb-5">Search Patient</h3>
                                
                                {isLoadingPatients ? (
                                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                        <Hourglass className="w-8 h-8 text-[#00C8D4] animate-spin" />
                                        <p className="text-sm text-[#8899AA]">Loading patient registry...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative mb-3">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]" />
                                            <input
                                                value={query} onChange={e => { setQuery(e.target.value); if(selectedPatient) setSelectedPatient(null); }} autoFocus
                                                placeholder="Search name, ABHA ID, Patient Global ID, or last 4 digits of Aadhaar..."
                                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00C8D4]/50 transition-all"
                                            />
                                        </div>

                                        {/* Search Suggestions */}
                                        {query.trim().length > 0 && filteredPatients.length > 1 && (
                                            <div className="bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl mt-1 mb-3 p-2 space-y-1 max-h-48 overflow-y-auto z-20 text-left">
                                                <p className="text-[10px] text-[#8899AA] font-bold px-3 py-1 uppercase tracking-wider">Search Suggestions</p>
                                                {filteredPatients.map(p => (
                                                    <button key={p.id} onClick={() => { setSelectedPatient(p); setQuery(''); }}
                                                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#1A2236] text-left text-xs transition-colors">
                                                        <span className="font-semibold text-white">{p.name}</span>
                                                        <div className="flex gap-2 text-[#8899AA] font-mono text-[10px]">
                                                            {p.aadhaarMasked && <span>Aadhaar: {p.aadhaarMasked}</span>}
                                                            {p.abhaId && <span>ABHA: {p.abhaId}</span>}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Advanced Filters Button */}
                                        <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                            className="flex items-center gap-1.5 text-xs text-[#8899AA] hover:text-[#00C8D4] transition-colors mt-2 mb-4">
                                            <Filter className="w-3.5 h-3.5" />
                                            {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
                                            <ChevronRight className={`w-3 h-3 transition-transform ${showAdvancedFilters ? 'rotate-90' : ''}`} />
                                        </button>

                                        {/* Advanced Filters Panel */}
                                        {showAdvancedFilters && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl mb-4 text-left">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-[#8899AA] uppercase tracking-wider mb-1">Patient Name</label>
                                                    <input type="text" value={filterName} onChange={e => { setFilterName(e.target.value); if(selectedPatient) setSelectedPatient(null); }}
                                                        placeholder="e.g. John Doe"
                                                        className="w-full bg-[#111827] border border-[#1E2D4580] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00C8D4]/50" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-[#8899AA] uppercase tracking-wider mb-1">Aadhaar Last 4</label>
                                                    <input type="text" maxLength={4} value={filterAadhaar} 
                                                        onChange={e => { setFilterAadhaar(e.target.value.replace(/\D/g, '')); if(selectedPatient) setSelectedPatient(null); }}
                                                        placeholder="e.g. 1234"
                                                        className="w-full bg-[#111827] border border-[#1E2D4580] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00C8D4]/50" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-[#8899AA] uppercase tracking-wider mb-1">ABHA ID</label>
                                                    <input type="text" value={filterAbha} onChange={e => { setFilterAbha(e.target.value); if(selectedPatient) setSelectedPatient(null); }}
                                                        placeholder="e.g. patient@sbx"
                                                        className="w-full bg-[#111827] border border-[#1E2D4580] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00C8D4]/50" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-[#8899AA] uppercase tracking-wider mb-1">Global Patient ID</label>
                                                    <input type="text" value={filterGlobalId} onChange={e => { setFilterGlobalId(e.target.value); if(selectedPatient) setSelectedPatient(null); }}
                                                        placeholder="e.g. GB-12345"
                                                        className="w-full bg-[#111827] border border-[#1E2D4580] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00C8D4]/50" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-[#8899AA] uppercase tracking-wider mb-1">Hospital Name</label>
                                                    <input type="text" value={filterHospital} onChange={e => { setFilterHospital(e.target.value); if(selectedPatient) setSelectedPatient(null); }}
                                                        placeholder="e.g. Central Hospital"
                                                        className="w-full bg-[#111827] border border-[#1E2D4580] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00C8D4]/50" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-[#8899AA] uppercase tracking-wider mb-1">Consent Status</label>
                                                    <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); if(selectedPatient) setSelectedPatient(null); }}
                                                        className="w-full bg-[#111827] border border-[#1E2D4580] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00C8D4]/50">
                                                        <option value="All">All Statuses</option>
                                                        <option value="Access Active">Access Active</option>
                                                        <option value="Pending Approval">Pending Approval</option>
                                                        <option value="Awaiting OTP">Awaiting OTP</option>
                                                        <option value="Rejected">Rejected</option>
                                                        <option value="No Access">No Access</option>
                                                    </select>
                                                </div>
                                                <div className="sm:col-span-2 md:col-span-3 flex justify-end">
                                                    <button onClick={() => {
                                                        setFilterName(''); setFilterAadhaar(''); setFilterAbha(''); setFilterGlobalId(''); setFilterHospital(''); setFilterStatus('All');
                                                    }} className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider mt-1">
                                                        <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                            {filteredPatients.length === 0 ? (
                                                <div className="text-center py-8 text-[#8899AA] text-sm">No patients found.</div>
                                            ) : (
                                                filteredPatients.map(p => (
                                                    <button key={p.id} onClick={() => setSelectedPatient(p)}
                                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                                                            selectedPatient?.id === p.id
                                                                ? 'border-[#00C8D4]/50 bg-[#00C8D4]/5'
                                                                : 'border-[#1E2D4580] hover:border-[#00C8D4]/30 hover:bg-[#1A2236]/50'
                                                        }`}>
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00C8D4]/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                            <User className="w-5 h-5 text-[#00C8D4]" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                                                                <span className="text-[8px] bg-[#1A2236] px-1.5 py-0.5 rounded text-[#8899AA] font-mono">{calculateAge(p.dob)} yrs</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[#8899AA] font-mono mt-0.5">
                                                                <span>Aadhaar: {p.aadhaarMasked || 'XXXX-XXXX-XXXX'}</span>
                                                                {p.abhaId && <span>ABHA: {p.abhaId}</span>}
                                                                <span>Global ID: {p.globalPatientId}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                                                                getPatientRequestStatus(p.id) === 'Access Active'
                                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                    : getPatientRequestStatus(p.id) === 'Pending Approval'
                                                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                                    : getPatientRequestStatus(p.id) === 'Awaiting OTP'
                                                                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                                                    : getPatientRequestStatus(p.id) === 'Rejected'
                                                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                                    : 'bg-[#1E2D4580] text-[#8899AA] border-[#1E2D4580]'
                                                            }`}>
                                                                {getPatientRequestStatus(p.id)}
                                                            </span>
                                                        </div>
                                                        {selectedPatient?.id === p.id && <CheckCircle className="w-5 h-5 text-[#00C8D4]" />}
                                                    </button>
                                                ))
                                            )}
                                        </div>

                                        {/* Cryptographic Patient Identity Card */}
                                        {selectedPatient && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-[#1E2D45]/30 to-[#0B0F1A] border border-[#00C8D4]/20 relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
                                                
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C8D4]/10 rounded-full blur-2xl pointer-events-none" />
                                                
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00C8D4]/20 to-blue-500/20 flex items-center justify-center border border-[#00C8D4]/30 shadow-[0_0_15px_rgba(0,200,212,0.15)]">
                                                            <User className="w-6 h-6 text-[#00C8D4]" />
                                                        </div>
                                                        <div className="text-left">
                                                            <span className="text-[9px] font-bold text-[#00C8D4] uppercase tracking-widest bg-[#00C8D4]/10 px-2.5 py-0.5 rounded-full border border-[#00C8D4]/20">Verifiable Identity</span>
                                                            <h4 className="text-xl font-bold text-white mt-1">{selectedPatient.name}</h4>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="text-right">
                                                        <p className="text-[9px] text-[#8899AA] font-bold uppercase tracking-wider mb-1">Consent Status</p>
                                                        <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-lg border ${
                                                            getPatientRequestStatus(selectedPatient.id) === 'Access Active'
                                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                : getPatientRequestStatus(selectedPatient.id) === 'Pending Approval'
                                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                                : getPatientRequestStatus(selectedPatient.id) === 'Awaiting OTP'
                                                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                                                : getPatientRequestStatus(selectedPatient.id) === 'Rejected'
                                                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                                : 'bg-[#1E2D4580] text-[#8899AA] border-[#1E2D4580]'
                                                        }`}>
                                                            {getPatientRequestStatus(selectedPatient.id)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-left border-t border-[#1E2D4580] pt-4">
                                                    <div>
                                                        <p className="text-[10px] text-[#8899AA] uppercase tracking-wider font-bold">Age / Gender</p>
                                                        <p className="text-sm font-semibold text-white mt-0.5">{calculateAge(selectedPatient.dob)} yrs / {selectedPatient.gender}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-[#8899AA] uppercase tracking-wider font-bold">Masked Aadhaar</p>
                                                        <p className="text-sm font-mono font-semibold text-white mt-0.5">{selectedPatient.aadhaarMasked || 'XXXX-XXXX-XXXX'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-[#8899AA] uppercase tracking-wider font-bold">ABHA ID</p>
                                                        <p className="text-sm font-mono font-semibold text-[#00C8D4] mt-0.5">{selectedPatient.abhaId || 'Not Linked'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-[#8899AA] uppercase tracking-wider font-bold">Global ID</p>
                                                        <p className="text-sm font-mono text-white mt-0.5">{selectedPatient.globalPatientId}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-[#8899AA] uppercase tracking-wider font-bold">Primary Hospital</p>
                                                        <p className="text-sm text-white mt-0.5">{selectedPatient.primaryHospital}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-[#8899AA] uppercase tracking-wider font-bold">Phone Number</p>
                                                        <p className="text-sm font-mono text-white mt-0.5">{selectedPatient.phone || 'N/A'}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-6 flex justify-end gap-3 border-t border-[#1E2D4580] pt-4">
                                                    <button onClick={() => setSelectedPatient(null)}
                                                        className="px-4 py-2 text-xs font-bold text-[#8899AA] hover:text-white transition-colors">
                                                        Clear
                                                    </button>
                                                    {getPatientRequestStatus(selectedPatient.id) === 'Access Active' ? (
                                                        <button onClick={() => navigate('/dashboard/clinical/records')}
                                                            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-1.5 transition-all">
                                                            <FileText className="w-3.5 h-3.5" /> View Active Records
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => setStep(1)}
                                                            className="px-5 py-2.5 rounded-xl bg-[#00C8D4] hover:bg-[#00E5F0] text-[#0B0F1A] font-bold text-xs flex items-center gap-1.5 transition-all animate-pulse">
                                                            Continue <ChevronRight className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}

                                        {!selectedPatient && (
                                            <button disabled={!selectedPatient} onClick={() => setStep(1)}
                                                className="mt-6 w-full py-3.5 rounded-xl bg-[#00C8D4] text-[#0B0F1A] font-bold flex items-center justify-center gap-2 hover:bg-[#00E5F0] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                                Continue <ChevronRight className="w-4 h-4" />
                                            </button>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        )}

                        {/* STEP 1: Build Request */}
                        {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="rounded-2xl bg-[#111827] border border-[#1E2D4580] p-6 space-y-5">
                                <div>
                                    <h3 className="text-lg font-display font-bold text-white mb-1">Build Access Request</h3>
                                    <div className="flex items-center gap-2 p-3 rounded-xl bg-[#00C8D4]/5 border border-[#00C8D4]/20">
                                        <User className="w-4 h-4 text-[#00C8D4]" />
                                        <span className="text-sm font-semibold text-[#00C8D4]">{selectedPatient?.name || selectedPatient?.email}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Record Type</label>
                                        <select value={recordType} onChange={e => setRecordType(e.target.value)}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00C8D4]/50 appearance-none">
                                            {recordTypes.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Urgency</label>
                                        <select value={urgency} onChange={e => setUrgency(e.target.value)}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00C8D4]/50 appearance-none">
                                            {urgencyLevels.map(u => <option key={u}>{u}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Access Duration</label>
                                        <select value={duration} onChange={e => setDuration(e.target.value)}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00C8D4]/50 appearance-none">
                                            {durations.map(d => <option key={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Clinical Justification</label>
                                    <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                                        placeholder="Reason for accessing these records..."
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00C8D4]/50 resize-none" />
                                </div>
                                {urgency === 'Critical / Emergency' && (
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <Zap className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-red-300">Emergency access will bypass standard OTP wait time and trigger an immediate patient notification. This action is logged with full audit trail.</p>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(0)} className="px-5 py-3 rounded-xl border border-[#1E2D4580] text-[#8899AA] hover:text-white text-sm font-semibold transition-all">Back</button>
                                    {urgency === 'Critical / Emergency' ? (
                                        <button onClick={() => setStep(2)} disabled={!reason}
                                            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-red-400 transition-all disabled:opacity-40">
                                            <AlertTriangle className="w-4 h-4" /> Declare Emergency Access (Break Glass)
                                        </button>
                                    ) : (
                                        <button onClick={handleSendRequest} disabled={!reason}
                                            className="flex-1 py-3 rounded-xl bg-[#00C8D4] text-[#0B0F1A] font-bold flex items-center justify-center gap-2 hover:bg-[#00E5F0] transition-all disabled:opacity-40">
                                            <Send className="w-4 h-4" /> Send Request to Patient
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Waiting / OTP Verification / Emergency */}
                        {step === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className={`rounded-2xl bg-[#111827] border p-8 ${urgency === 'Critical / Emergency' ? 'border-red-500/30' : 'border-[#1E2D4580]'}`}>
                                
                                {urgency === 'Critical / Emergency' ? (
                                    <div className="text-center space-y-6">
                                        <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center mx-auto">
                                            <AlertTriangle className="w-10 h-10 text-red-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-display font-bold text-red-400">Confirm Emergency Override</h3>
                                            <p className="text-sm text-[#8899AA] mt-2 max-w-md mx-auto">You are about to bypass patient consent. This action triggers an immediate alert to the patient and hospital compliance officers, and logs an immutable record to the blockchain.</p>
                                        </div>
                                        
                                        <div className="bg-[#0B0F1A] border border-red-500/30 p-4 rounded-xl text-left max-w-sm mx-auto">
                                            <label className="block text-[10px] text-red-400 font-bold uppercase tracking-wider mb-2">Type "I CONFIRM" to proceed</label>
                                            <input 
                                                type="text" 
                                                value={emergencyConfirmText}
                                                onChange={e => setEmergencyConfirmText(e.target.value.toUpperCase())}
                                                placeholder="I CONFIRM"
                                                className="w-full bg-[#111827] border border-red-500/50 rounded-lg px-4 py-3 text-sm text-white placeholder-red-500/30 focus:outline-none focus:border-red-400 transition-all font-mono"
                                            />
                                        </div>

                                        <div className="flex gap-3 justify-center mt-6">
                                            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl border border-[#1E2D4580] text-[#8899AA] hover:text-white text-sm font-semibold transition-all">Cancel</button>
                                            <button 
                                                onClick={handleEmergencyOverride}
                                                disabled={emergencyConfirmText !== 'I CONFIRM'}
                                                className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold flex items-center gap-2 transition-all disabled:opacity-40">
                                                <Zap className="w-4 h-4" /> Override & Grant Access
                                            </button>
                                        </div>
                                    </div>
                                ) : requestStatus === 'approved' ? (
                                    <div className="text-center space-y-6">
                                        <div className="w-16 h-16 rounded-full bg-[#00C8D4]/10 border border-[#00C8D4]/30 flex items-center justify-center mx-auto">
                                            <Key className="w-8 h-8 text-[#00C8D4]" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-display font-bold text-white">Patient Approved</h3>
                                            <p className="text-sm text-[#8899AA] mt-2">The patient has approved your request. Enter the OTP provided by the patient to unlock the records.</p>
                                        </div>
                                        <div className="max-w-xs mx-auto">
                                            <input 
                                                type="text"
                                                maxLength={6}
                                                value={otpCode}
                                                onChange={e => setOtpCode(e.target.value)}
                                                placeholder="••••••"
                                                className="w-full bg-[#0B0F1A] border border-[#00C8D4]/30 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] text-white font-mono focus:outline-none focus:border-[#00C8D4] transition-all"
                                            />
                                        </div>
                                        <button 
                                            onClick={handleVerifyOTP}
                                            disabled={isVerifying || otpCode.length < 6}
                                            className="w-full max-w-xs mx-auto py-3.5 rounded-xl bg-[#00C8D4] hover:bg-[#00E5F0] text-[#0B0F1A] font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                                            {isVerifying ? <Hourglass className="w-5 h-5 animate-spin" /> : 'Unlock Records'}
                                        </button>
                                    </div>
                                ) : requestStatus === 'rejected' ? (
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center mx-auto">
                                            <XCircle className="w-8 h-8 text-red-400" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-display font-bold text-red-400">Request Denied</p>
                                            <p className="text-sm text-[#8899AA]">The patient has declined your access request.</p>
                                        </div>
                                        <button onClick={() => setStep(0)}
                                            className="w-full max-w-xs mx-auto py-3.5 rounded-xl border border-[#1E2D4580] hover:border-white text-white font-bold transition-all mt-4">
                                            Start New Search
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-lg font-display font-bold text-white mb-6 text-center">Awaiting Patient Approval</h3>
                                        <div className="space-y-0 mb-8 max-w-sm mx-auto">
                                            {[
                                                { label: 'Request Sent', desc: 'Submitted to patient portal', done: true },
                                                { label: 'Patient Notified', desc: 'Awaiting patient interaction...', done: false, active: true },
                                                { label: 'OTP Generation', desc: 'Pending approval', done: false },
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-start gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                            item.done ? 'bg-emerald-500 text-white' :
                                                            item.active ? 'bg-amber-500/15 border-2 border-amber-400' :
                                                            'bg-[#1A2236] border border-[#1E2D4580]'
                                                        }`}>
                                                            {item.done ? <CheckCircle className="w-4 h-4" /> :
                                                            item.active ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}><Hourglass className="w-4 h-4 text-amber-400" /></motion.div> :
                                                            <div className="w-2 h-2 rounded-full bg-[#4A5568]" />}
                                                        </div>
                                                        {i < 2 && <div className={`w-0.5 h-6 mt-1 ${item.done ? 'bg-emerald-500' : 'bg-[#1E2D4580]'}`} />}
                                                    </div>
                                                    <div className="pb-6">
                                                        <p className={`text-sm font-semibold ${item.done ? 'text-emerald-400' : item.active ? 'text-amber-400' : 'text-[#4A5568]'}`}>{item.label}</p>
                                                        <p className="text-xs text-[#8899AA] mt-0.5">{item.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-3 justify-center">
                                            <button onClick={() => setStep(0)} className="px-5 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm transition-all">
                                                Cancel Request
                                            </button>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {/* STEP 3: Access Confirmed */}
                        {step === 3 && (
                            <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className={`rounded-2xl bg-[#111827] border p-8 text-center space-y-6 ${isEmergencyMode ? 'border-red-500/30' : 'border-emerald-500/30'}`}>
                                
                                <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto ${isEmergencyMode ? 'bg-red-500/10 border-red-500' : 'bg-emerald-500/10 border-emerald-500'}`}>
                                    {isEmergencyMode ? <AlertTriangle className="w-10 h-10 text-red-400" /> : <ShieldCheck className="w-10 h-10 text-emerald-400" />}
                                </div>
                                
                                <div>
                                    {isEmergencyMode ? (
                                        <>
                                            <h3 className="text-2xl font-display font-bold text-red-400 flex justify-center items-center gap-2"><Zap className="w-5 h-5"/> Emergency Access Granted</h3>
                                            <p className="text-[#8899AA] mt-2">Bypass authorized. Patient notified.</p>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-2xl font-display font-bold text-white">Authorized Access Active</h3>
                                            <p className="text-[#8899AA] mt-2">Session bound to <span className="text-white font-semibold">{selectedPatient?.name || selectedPatient?.email}</span></p>
                                        </>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-center max-w-sm mx-auto">
                                    {[
                                        { label: 'Duration', value: duration },
                                        { label: 'Session ID', value: activeSessionId ? activeSessionId.slice(0, 8) : 'EMERGENCY' },
                                    ].map(item => (
                                        <div key={item.label} className={`p-3 rounded-xl bg-[#0B0F1A] border ${isEmergencyMode ? 'border-red-500/20' : 'border-[#1E2D4580]'}`}>
                                            <p className="text-[10px] text-[#8899AA] uppercase tracking-wider font-bold mb-1">{item.label}</p>
                                            <p className={`text-xs font-mono ${isEmergencyMode ? 'text-red-300' : 'text-white'}`}>{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => navigate('/dashboard/clinical/records')}
                                    className={`w-full max-w-xs mx-auto py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isEmergencyMode ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-[#00C8D4] text-[#0B0F1A] hover:bg-[#00E5F0]'}`}
                                >
                                    <FileText className="w-4 h-4" /> View Patient Records
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Column: Dashboard Sidebar Widgets */}
                <div className="space-y-6">
                    {/* Panel 1: Active Sessions */}
                    <div className="rounded-2xl bg-[#111827] border border-[#1E2D4580] p-5 text-left">
                        <div className="flex items-center gap-2 mb-4 border-b border-[#1E2D4580] pb-3">
                            <Zap className="w-4 h-4 text-emerald-400" />
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Active Sessions</h4>
                        </div>
                        <div className="space-y-3">
                            {activeSessions.filter(s => s.active && s.expiresAt?.toDate() > new Date()).length === 0 ? (
                                <p className="text-xs text-[#8899AA] py-4 text-center">No active consent sessions.</p>
                            ) : (
                                activeSessions.filter(s => s.active && s.expiresAt?.toDate() > new Date()).map(session => {
                                    const p = patients.find(pat => pat.id === session.patientId);
                                    return (
                                        <div key={session.id} className="p-3 rounded-xl bg-[#0B0F1A] border border-emerald-500/20 flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-semibold text-white">{p?.name || 'Unknown Patient'}</p>
                                                <p className="text-[10px] text-[#8899AA] mt-0.5">Expires: {new Date(session.expiresAt?.toDate()).toLocaleTimeString()}</p>
                                            </div>
                                            <button onClick={() => navigate('/dashboard/clinical/records')}
                                                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold transition-all">
                                                View Records
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Panel 2: Historic Request Log */}
                    <div className="rounded-2xl bg-[#111827] border border-[#1E2D4580] p-5 text-left">
                        <div className="flex items-center gap-2 mb-4 border-b border-[#1E2D4580] pb-3">
                            <History className="w-4 h-4 text-[#00C8D4]" />
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Request Log</h4>
                        </div>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                            {historicalRequests.length === 0 ? (
                                <p className="text-xs text-[#8899AA] py-4 text-center">No historic requests.</p>
                            ) : (
                                historicalRequests.map(req => {
                                    const p = patients.find(pat => pat.id === req.patientId);
                                    return (
                                        <div key={req.id} className="p-3 rounded-xl bg-[#0B0F1A] border border-[#1E2D4580] flex justify-between items-center">
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-xs font-semibold text-white">{p?.name || 'Unknown Patient'}</p>
                                                    <span className="text-[8px] text-[#8899AA] font-mono">({req.urgency})</span>
                                                </div>
                                                <p className="text-[10px] text-[#8899AA] mt-0.5">{req.recordType || req.department} • {req.timestamp?.toDate() ? new Date(req.timestamp.toDate()).toLocaleDateString() : 'Pending...'}</p>
                                            </div>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                                                req.status === 'approved' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                                                req.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                req.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                'bg-[#1E2D4580] text-[#8899AA] border-[#1E2D4580]'
                                            }`}>
                                                {req.status}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Panel 3: Audit Trail & Blockchain Logs */}
                    <div className="rounded-2xl bg-[#111827] border border-[#1E2D4580] p-5 text-left">
                        <div className="flex items-center gap-2 mb-4 border-b border-[#1E2D4580] pb-3">
                            <ShieldCheck className="w-4 h-4 text-amber-400" />
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Blockchain Audit Trail</h4>
                        </div>
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                            {auditLogs.length === 0 ? (
                                <p className="text-xs text-[#8899AA] py-4 text-center">No recent logs.</p>
                            ) : (
                                auditLogs.map(log => (
                                    <div key={log.id} className={`p-3 rounded-xl bg-[#0B0F1A] border text-left ${
                                        log.activityType?.includes('EMERGENCY') ? 'border-red-500/30' : 'border-[#1E2D4580]'
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                log.activityType?.includes('EMERGENCY') ? 'bg-red-500/10 text-red-400' :
                                                log.activityType?.includes('APPROVED') ? 'bg-emerald-500/10 text-emerald-400' :
                                                'bg-blue-500/10 text-blue-400'
                                            }`}>
                                                {log.activityType?.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-[8px] text-[#8899AA] font-mono">{log.timestamp?.toDate() ? new Date(log.timestamp.toDate()).toLocaleTimeString() : ''}</span>
                                        </div>
                                        <p className="text-[10px] text-[#E2E8F0] mt-1.5">
                                            {log.details?.patientId ? `Patient: ${patients.find(pat => pat.id === log.details.patientId)?.name || log.details.patientId.slice(0, 8)}` : ''}
                                            {log.details?.reason ? ` • Reason: ${log.details.reason}` : ''}
                                        </p>
                                        {log.txHash && (
                                            <div className="flex items-center justify-between text-[8px] font-mono text-[#8899AA] mt-1 bg-black/30 px-1.5 py-0.5 rounded">
                                                <span className="truncate">Tx: {log.txHash}</span>
                                                <Clipboard className="w-2.5 h-2.5 ml-1 cursor-pointer hover:text-white" onClick={() => {
                                                    navigator.clipboard.writeText(log.txHash);
                                                    toast.success('Tx Hash Copied');
                                                }} />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
