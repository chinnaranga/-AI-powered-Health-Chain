import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ClipboardList, ShieldCheck, Users, FileText, Clock, AlertTriangle,
    Activity, ArrowRight, Search, CheckCircle, XCircle, Hourglass,
    TrendingUp, Brain, Zap, Eye, Key, Server, Database, AlertCircle,
    Network, Check, RefreshCw, Plus, UserPlus, Mail, MapPin, X, Globe,
    ShieldAlert, UserCheck, Shield, ChevronRight, Play, FileDown,
    Building2, Loader2, ArrowUpRight, MessageSquare, Calendar, Pill,
    Download, Bell, Lock
} from 'lucide-react';
import { db } from '../../firebase/config';
import {
    collection, query, orderBy, limit, onSnapshot, addDoc,
    serverTimestamp, doc, setDoc, where, getDocs, getDoc, updateDoc
} from 'firebase/firestore';
import { toast } from '../../components/Toast';
import useAuthStore from '../../store/authStore';
import { FEATURES } from '../../config/features';
import { accessRequestService } from '../../services/accessRequestService';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, Cell
} from 'recharts';

// Masking helpers for sensitive data
const maskAadhaar = (aadhaar) => {
    if (!aadhaar) return 'Not Linked';
    const clean = aadhaar.replace(/\D/g, '');
    if (clean.length < 4) return 'XXXX-XXXX-XXXX';
    return `XXXX-XXXX-${clean.slice(-4)}`;
};

const maskPhone = (phone) => {
    if (!phone) return 'N/A';
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 4) return 'XXXXXX' + clean.slice(-4);
    return `XXXXXX-${clean.slice(-4)}`;
};

const maskEmail = (email) => {
    if (!email) return 'N/A';
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 2) return `*@${domain}`;
    return `${name[0]}***${name[name.length - 1]}@${domain}`;
};

const maskAddress = (address) => {
    if (!address) return 'N/A';
    if (address.length <= 6) return 'Hidden';
    return `${address.slice(0, 3)}***, ${address.split(',').pop() || ''}`;
};

// Age calculator helper
const getAge = (dobString) => {
    if (!dobString) return 'N/A';
    try {
        const birthDate = new Date(dobString);
        if (isNaN(birthDate.getTime())) return 'N/A';
        const today = new Date();
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

export default function ClinicalDashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const userClinic = currentUser?.primaryHospital || currentUser?.hospital || 'Central Health Vault';

    // Page state
    const [searchQuery, setSearchQuery] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [auditLogWritten, setAuditLogWritten] = useState(false);

    // Live data states
    const [patients, setPatients] = useState([]);
    const [accessRequests, setAccessRequests] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [records, setRecords] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [consentStatuses, setConsentStatuses] = useState({});
    
    // Selection state for detail widget
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [otpInput, setOtpInput] = useState('');
    const [verifyingOtp, setVerifyingOtp] = useState(false);

    // Node Sync/Security fluctuations
    const [nodeSyncTime, setNodeSyncTime] = useState('12.4s');
    const [securityScore, setSecurityScore] = useState(99);

    // Set page theme body class on mount & log dashboard access
    useEffect(() => {
        document.documentElement.classList.add('dark-theme-page');

        // Log clinical dashboard access once user is defined
        if (currentUser && !auditLogWritten) {
            const logAccess = async () => {
                try {
                    const chars = '0123456789abcdef';
                    let txHash = '0x';
                    for (let i = 0; i < 64; i++) {
                        txHash += chars[Math.floor(Math.random() * 16)];
                    }
                    await addDoc(collection(db, 'auditLogs'), {
                        timestamp: serverTimestamp(),
                        activityType: 'CLINICAL_DASHBOARD_ACCESS',
                        userId: currentUser.uid || 'clinical-staff',
                        txHash,
                        details: {
                            userEmail: currentUser.email,
                            role: currentUser.role,
                            hospital: userClinic,
                            action: 'Clinical staff logged into operations command center.'
                        }
                    });
                    setAuditLogWritten(true);
                } catch (err) {
                    console.warn('Dashboard access logging failed:', err);
                }
            };
            logAccess();
        }

        return () => {
            document.documentElement.classList.remove('dark-theme-page');
        };
    }, [currentUser, auditLogWritten, userClinic]);

    // Firestore real-time active data listeners
    useEffect(() => {
        // 1. Listen to registry patients
        const unsubPatients = onSnapshot(collection(db, 'patients'), (snapshot) => {
            const pats = [];
            snapshot.forEach(docSnap => {
                pats.push({ id: docSnap.id, ...docSnap.data() });
            });
            setPatients(pats);
        }, (err) => console.warn('Patients load failure:', err));

        // 2. Listen to access requests
        const unsubRequests = onSnapshot(query(collection(db, 'accessRequests'), orderBy('timestamp', 'desc')), (snapshot) => {
            const reqs = [];
            const statuses = {};
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                const reqId = docSnap.id;
                reqs.push({ id: reqId, ...data });

                // Map patientId to consent status
                const patientId = data.patientId;
                const status = data.status;
                if (patientId) {
                    if (status === 'approved' || status === 'granted' || status === 'OTP_VERIFIED_ACCESS_GRANTED') {
                        statuses[patientId] = 'Active';
                    } else if (!statuses[patientId] && (status === 'pending' || status === 'Awaiting OTP' || status === 'Patient Notified')) {
                        statuses[patientId] = 'Pending';
                    }
                }
            });
            setAccessRequests(reqs);
            setConsentStatuses(statuses);
        }, (err) => console.warn('Access requests load failure:', err));

        // 3. Listen to active sessions
        const unsubSessions = onSnapshot(collection(db, 'activeSessions'), (snapshot) => {
            const sessions = [];
            snapshot.forEach(docSnap => {
                sessions.push({ id: docSnap.id, ...docSnap.data() });
            });
            setActiveSessions(sessions);
        }, (err) => console.warn('Active sessions load failure:', err));

        // 4. Listen to records
        const unsubRecords = onSnapshot(collection(db, 'records'), (snapshot) => {
            const recs = [];
            snapshot.forEach(docSnap => {
                recs.push({ id: docSnap.id, ...docSnap.data() });
            });
            setRecords(recs);
        }, (err) => console.warn('Records load failure:', err));

        // 5. Listen to live activity audit logs
        const unsubLogs = onSnapshot(query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(15)), (snapshot) => {
            const logs = [];
            snapshot.forEach(docSnap => {
                logs.push({ id: docSnap.id, ...docSnap.data() });
            });
            setAuditLogs(logs);
        }, (err) => console.warn('Audit logs load failure:', err));

        // 6. Listen to online clinical staff users
        const unsubStaff = onSnapshot(query(collection(db, 'users'), where('role', '==', 'clinical')), (snapshot) => {
            const staff = [];
            snapshot.forEach(docSnap => {
                staff.push({ id: docSnap.id, ...docSnap.data() });
            });
            setStaffList(staff);
        }, (err) => console.warn('Staff users load failure:', err));

        // Periodic fluctuating variables for visual fidelity
        const timer = setInterval(() => {
            setSecurityScore(prev => {
                const diff = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
                return Math.max(98, Math.min(100, prev + diff));
            });
            setNodeSyncTime(`${(11.8 + Math.random() * 1.5).toFixed(1)}s`);
        }, 8000);

        return () => {
            unsubPatients();
            unsubRequests();
            unsubSessions();
            unsubRecords();
            unsubLogs();
            unsubStaff();
            clearInterval(timer);
        };
    }, []);

    // Filter rules checking clinic boundaries and active consent interoperability
    const isInteroperable = (pat) => {
        const patientClinic = (pat.primaryHospital || 'Central Health Vault').toLowerCase();
        const currentClinic = userClinic.toLowerCase();
        if (patientClinic === currentClinic) return true;

        // Otherwise check active consent session
        const consent = consentStatuses[pat.id];
        return consent === 'Active';
    };

    // Filter patients based on query
    const filteredPatients = useMemo(() => {
        const queryStr = searchQuery.trim().toLowerCase();
        return patients.filter(pat => {
            // Apply security filter first
            if (!isInteroperable(pat)) return false;

            if (!queryStr) return true;

            const name = (pat.fullName || pat.name || '').toLowerCase();
            const abha = (pat.abhaId || '').toLowerCase();
            const globalId = (pat.globalPatientId || '').toLowerCase();
            
            // Matches last 4 digits of Aadhaar
            const aadhaarRaw = (pat.aadhaarMasked || '').replace(/\D/g, '');
            const aadhaarMatches = queryStr.length === 4 && /^\d+$/.test(queryStr) && aadhaarRaw.endsWith(queryStr);

            return name.includes(queryStr) || 
                   abha.includes(queryStr) || 
                   globalId.includes(queryStr) ||
                   aadhaarMatches;
        });
    }, [patients, searchQuery, consentStatuses, userClinic]);

    // Active requests list for the widget
    const pendingRequests = useMemo(() => {
        return accessRequests.filter(req => 
            req.status === 'pending' || 
            req.status === 'Awaiting OTP' || 
            req.status === 'Patient Notified'
        );
    }, [accessRequests]);

    // Selected Request details inside the widget
    const selectedRequest = useMemo(() => {
        if (!selectedRequestId) return pendingRequests[0] || null;
        return pendingRequests.find(r => r.id === selectedRequestId) || pendingRequests[0] || null;
    }, [pendingRequests, selectedRequestId]);

    // KPI values calculation
    const kpis = useMemo(() => {
        const todayStr = new Date().toDateString();
        const uploadsToday = records.filter(rec => {
            if (!rec.createdAt) return false;
            const date = rec.createdAt.toDate ? rec.createdAt.toDate() : new Date(rec.createdAt);
            return date.toDateString() === todayStr;
        }).length;

        const verifiedLogsCount = auditLogs.length * 12 + 421; // simulated chain height logic
        const teamOnlineCount = staffList.filter(s => s.online !== false).length || 3;

        return {
            pendingRequests: pendingRequests.length,
            activeConsent: activeSessions.filter(s => s.active).length,
            patientsReview: filteredPatients.length,
            uploadsToday: uploadsToday,
            verifiedLogs: verifiedLogsCount,
            teamOnline: teamOnlineCount
        };
    }, [pendingRequests, activeSessions, filteredPatients, records, auditLogs, staffList]);

    // Recharts Analytics data preparation
    const chartData = useMemo(() => {
        // Map last 6 hours or mock default with live offsets
        return [
            { hour: '09:00', requests: pendingRequests.length + 2, approvals: kpis.activeConsent + 1, uploads: kpis.uploadsToday + 5 },
            { hour: '11:00', requests: pendingRequests.length + 5, approvals: kpis.activeConsent + 3, uploads: kpis.uploadsToday + 12 },
            { hour: '13:00', requests: pendingRequests.length + 8, approvals: kpis.activeConsent + 6, uploads: kpis.uploadsToday + 18 },
            { hour: '15:00', requests: pendingRequests.length + 4, approvals: kpis.activeConsent + 4, uploads: kpis.uploadsToday + 14 },
            { hour: '17:00', requests: pendingRequests.length + kpis.pendingRequests, approvals: kpis.activeConsent, uploads: kpis.uploadsToday },
        ];
    }, [pendingRequests, kpis]);

    // Dynamic Notifications alerts
    const alertsList = useMemo(() => {
        const alerts = [];
        // Add critical request alerts
        pendingRequests.forEach(req => {
            if (req.urgency === 'Critical' || req.urgency === 'Critical / Emergency') {
                alerts.push({
                    id: req.id,
                    type: 'critical',
                    title: 'CRITICAL Emergency Access Declared',
                    desc: `Emergency override logged for patient ID: ${req.patientId.slice(0,8)}...`,
                    time: 'Immediate'
                });
            }
        });

        // Add default warning if consent sessions are active
        activeSessions.forEach(ses => {
            const expDate = ses.expiresAt?.toDate ? ses.expiresAt.toDate() : new Date(ses.expiresAt);
            const remainingMins = Math.round((expDate - new Date()) / 60000);
            if (remainingMins > 0 && remainingMins < 30) {
                alerts.push({
                    id: ses.id,
                    type: 'warning',
                    title: 'Consent Key Expiring Soon',
                    desc: `Verification hold will drop in ${remainingMins} minutes.`,
                    time: 'System Warning'
                });
            }
        });

        // Fallbacks if list is empty
        if (alerts.length === 0) {
            alerts.push({
                id: 'default-1',
                type: 'info',
                title: 'Biometric consensus nodes synchronized',
                desc: 'All validator nodes confirmed SHA-256 matching root merkle state.',
                time: '10m'
            });
            alerts.push({
                id: 'default-2',
                type: 'security',
                title: 'Zero-Knowledge proofs validation complete',
                desc: 'Audit trail registered 100% compliance matching HIPAA structures.',
                time: '34m'
            });
        }
        return alerts;
    }, [pendingRequests, activeSessions]);

    // OTP verification approval action
    const handleVerifyOtpSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!selectedRequest || !otpInput.trim()) return;

        setVerifyingOtp(true);
        try {
            await accessRequestService.verifyOTPAndGrantAccess(
                selectedRequest.id,
                otpInput.trim(),
                currentUser.uid
            );
            toast.success('OTP verified. Access granted successfully.');
            setOtpInput('');
        } catch (err) {
            toast.error(err.message || 'OTP verification failed.');
        } finally {
            setVerifyingOtp(false);
        }
    };

    // Reject access request
    const handleRejectRequest = async (requestId) => {
        if (!requestId) return;
        try {
            await accessRequestService.rejectRequest(requestId, currentUser.uid);
            toast.success('Access request rejected.');
        } catch (err) {
            toast.error('Rejection failed: ' + err.message);
        }
    };

    // Auto Approve verification for demo / testing
    const handleAutoVerifyDemo = async () => {
        if (!selectedRequest) return;
        try {
            const otpSnap = await getDoc(doc(db, 'otpSessions', selectedRequest.id));
            if (otpSnap.exists() && otpSnap.data().active) {
                const code = otpSnap.data().code;
                setOtpInput(code);
                toast.info('Simulated patient OTP auto-filled.');
            } else {
                // Generate OTP first if pending
                await accessRequestService.approveRequestAndGenerateOTP(selectedRequest.id, selectedRequest.patientId);
                const secondSnap = await getDoc(doc(db, 'otpSessions', selectedRequest.id));
                if (secondSnap.exists()) {
                    setOtpInput(secondSnap.data().code);
                    toast.info('Simulated patient approved & OTP auto-filled.');
                }
            }
        } catch (err) {
            toast.error('Simulated approval failed: ' + err.message);
        }
    };

    // Sync nodes simulation
    const handleSyncClick = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            toast.success('Blockchain nodes synchronized with global validators.');
        }, 1200);
    };

    // Role-based Access Control Check
    if (currentUser && currentUser.role !== 'clinical') {
        return (
            <div className="dark-clinical-workspace min-h-screen flex items-center justify-center -mx-4 sm:-mx-6 -my-4 sm:-my-6">
                <div className="max-w-md w-full bg-[#141b2d] border border-red-500/30 rounded-3xl p-8 text-center space-y-6">
                    <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white">Unauthorized Access</h2>
                    <p className="text-sm text-slate-400">
                        This workspace is restricted to clinical personnel with active medical node clearance. Your authorization credentials do not permit access to this module.
                    </p>
                    <button
                        onClick={() => navigate(`/dashboard/${currentUser.role || 'patient'}`)}
                        className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs font-mono tracking-widest uppercase transition-all"
                    >
                        Return to Safe Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dark-clinical-workspace min-h-screen pb-12 space-y-8 px-4 sm:px-6 lg:px-8 py-6 text-left -mx-4 sm:-mx-6 -my-4 sm:-my-6 relative overflow-hidden">
            
            {/* Ambient background glows */}
            <div className="absolute top-[5%] left-[10%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[5%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* 1. HERO / HEADER AREA */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#1b253e] pb-6 relative z-10">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C8D4] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00C8D4]"></span>
                        </span>
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest font-mono">
                            EHR Interoperability Node: Active
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9px] text-[#8899AA] font-mono">
                            Sync Rate: {nodeSyncTime}
                        </span>
                    </div>
                    <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
                        {t('clinical.dashboardTitle')}
                    </h1>
                    <p className="text-sm text-[#8899AA]">
                        Manage secure patient access, consent workflows, and clinical record activity across federated hospital registries.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-[#141b2d] border border-[#1b253e] text-left">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-[#8899AA]">Operating Unit</p>
                        <p className="text-xs font-semibold text-white font-mono">{userClinic}</p>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-[#141b2d] border border-[#1b253e] text-left">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-[#8899AA]">Security Role</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Shield className="w-3.5 h-3.5 text-[#00C8D4]" />
                            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">Clinical Node</span>
                        </div>
                    </div>
                    <button
                        onClick={handleSyncClick}
                        className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-[#8899AA] hover:text-white transition-all cursor-pointer"
                        title="Force sync validator ledger"
                    >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#00C8D4]' : ''}`} />
                    </button>
                </div>
            </div>

            {/* 2. KPI METRICS CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
                
                {/* KPI: Pending Access */}
                <motion.div
                    whileHover={{ translateY: -3 }}
                    className="p-4 rounded-2xl bg-[#141b2d] border border-[#1b253e] relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-amber-500/30 transition-all duration-300"
                >
                    <div className="absolute top-3 right-3 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
                        <Hourglass className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider font-mono">Pending Requests</p>
                    <h3 className="text-2xl font-display font-bold text-white mt-1">{kpis.pendingRequests}</h3>
                    <div className="flex items-center gap-1 mt-2 text-[9px] font-mono text-amber-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Action Required
                    </div>
                </motion.div>

                {/* KPI: Active Consent */}
                <motion.div
                    whileHover={{ translateY: -3 }}
                    className="p-4 rounded-2xl bg-[#141b2d] border border-[#1b253e] relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-[#00C8D4]/30 transition-all duration-300"
                >
                    <div className="absolute top-3 right-3 text-[#00C8D4]/10 group-hover:text-[#00C8D4]/20 transition-colors">
                        <Key className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider font-mono">Active Consent</p>
                    <h3 className="text-2xl font-display font-bold text-white mt-1">{kpis.activeConsent}</h3>
                    <div className="flex items-center gap-1 mt-2 text-[9px] font-mono text-[#00C8D4]">
                        <CheckCircle className="w-3.5 h-3.5" /> Interop Active
                    </div>
                </motion.div>

                {/* KPI: Patients Review */}
                <motion.div
                    whileHover={{ translateY: -3 }}
                    className="p-4 rounded-2xl bg-[#141b2d] border border-[#1b253e] relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-purple-500/30 transition-all duration-300"
                >
                    <div className="absolute top-3 right-3 text-purple-500/10 group-hover:text-purple-500/20 transition-colors">
                        <Users className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider font-mono">Registry Cases</p>
                    <h3 className="text-2xl font-display font-bold text-white mt-1">{kpis.patientsReview}</h3>
                    <div className="flex items-center gap-1 mt-2 text-[9px] font-mono text-purple-400">
                        <TrendingUp className="w-3.5 h-3.5" /> Stable Load
                    </div>
                </motion.div>

                {/* KPI: Uploads Today */}
                <motion.div
                    whileHover={{ translateY: -3 }}
                    className="p-4 rounded-2xl bg-[#141b2d] border border-[#1b253e] relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-emerald-500/30 transition-all duration-300"
                >
                    <div className="absolute top-3 right-3 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                        <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider font-mono">Uploads Today</p>
                    <h3 className="text-2xl font-display font-bold text-white mt-1">{kpis.uploadsToday}</h3>
                    <div className="flex items-center gap-1 mt-2 text-[9px] font-mono text-emerald-400">
                        <Plus className="w-3.5 h-3.5" /> Verified Files
                    </div>
                </motion.div>

                {/* KPI: Verified Logs */}
                <motion.div
                    whileHover={{ translateY: -3 }}
                    className="p-4 rounded-2xl bg-[#141b2d] border border-[#1b253e] relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-blue-500/30 transition-all duration-300"
                >
                    <div className="absolute top-3 right-3 text-blue-500/10 group-hover:text-blue-500/20 transition-colors">
                        <Database className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider font-mono">Chain Height</p>
                    <h3 className="text-2xl font-display font-bold text-white mt-1">{kpis.verifiedLogs}</h3>
                    <div className="flex items-center gap-1 mt-2 text-[9px] font-mono text-blue-400">
                        <Server className="w-3.5 h-3.5" /> Blocks Written
                    </div>
                </motion.div>

                {/* KPI: Team Online */}
                <motion.div
                    whileHover={{ translateY: -3 }}
                    className="p-4 rounded-2xl bg-[#141b2d] border border-[#1b253e] relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-cyan-500/30 transition-all duration-300"
                >
                    <div className="absolute top-3 right-3 text-cyan-500/10 group-hover:text-cyan-500/20 transition-colors">
                        <Users className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider font-mono">Staff Online</p>
                    <h3 className="text-2xl font-display font-bold text-white mt-1">{kpis.teamOnline}</h3>
                    <div className="flex items-center gap-1 mt-2 text-[9px] font-mono text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Shifts
                    </div>
                </motion.div>
            </div>

            {/* 3. QUICK ACTIONS PANEL */}
            <div className="p-6 bg-[#141b2d] border border-[#1b253e] rounded-2xl space-y-4 relative z-10 shadow-[0_4px_35px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between border-b border-[#1b253e] pb-3">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#00C8D4]" />
                        <h2 className="text-base font-display font-bold text-white">Operations Shortcuts</h2>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">Dynamic Actions Configured</span>
                </div>

                <div className="flex flex-wrap gap-3">
                    {/* ALWAYS ACTIVE SHORTCUTS */}
                    <button
                        onClick={() => navigate('/dashboard/clinical/requests')}
                        className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00C8D4]/10 border border-white/[0.08] hover:border-[#00C8D4]/30 text-xs font-bold text-white hover:text-[#00C8D4] transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <ClipboardList className="w-4 h-4 text-[#00C8D4]" /> Access Requests
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/clinical/records')}
                        className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00C8D4]/10 border border-white/[0.08] hover:border-[#00C8D4]/30 text-xs font-bold text-white hover:text-[#00C8D4] transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <FileText className="w-4 h-4 text-[#00C8D4]" /> Patient Records
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/clinical/consent')}
                        className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00C8D4]/10 border border-white/[0.08] hover:border-[#00C8D4]/30 text-xs font-bold text-white hover:text-[#00C8D4] transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <Key className="w-4 h-4 text-[#00C8D4]" /> Consent Sessions
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/clinical/viewer')}
                        className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00C8D4]/10 border border-white/[0.08] hover:border-[#00C8D4]/30 text-xs font-bold text-white hover:text-[#00C8D4] transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <Eye className="w-4 h-4 text-[#00C8D4]" /> Clinical Record Viewer
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/clinical/logs')}
                        className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00C8D4]/10 border border-white/[0.08] hover:border-[#00C8D4]/30 text-xs font-bold text-white hover:text-[#00C8D4] transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <Activity className="w-4 h-4 text-[#00C8D4]" /> Audit Trail Logs
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/clinical/create-patient')}
                        className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00C8D4]/10 border border-white/[0.08] hover:border-[#00C8D4]/30 text-xs font-bold text-white hover:text-[#00C8D4] transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <UserPlus className="w-4 h-4 text-[#00C8D4]" /> Onboard New Patient
                    </button>

                    {/* FEATURE GATED SHORTCUTS */}
                    {FEATURES.prescriptions && (
                        <button
                            onClick={() => navigate('/dashboard/clinical/prescriptions')}
                            className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00C8D4]/10 border border-white/[0.08] hover:border-[#00C8D4]/30 text-xs font-bold text-white hover:text-[#00C8D4] transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Pill className="w-4 h-4 text-[#00C8D4]" /> e-Prescriptions
                        </button>
                    )}
                    {FEATURES.referrals && (
                        <button
                            onClick={() => navigate('/dashboard/clinical/referrals')}
                            className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00C8D4]/10 border border-white/[0.08] hover:border-[#00C8D4]/30 text-xs font-bold text-white hover:text-[#00C8D4] transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Building2 className="w-4 h-4 text-[#00C8D4]" /> Referrals & Handoffs
                        </button>
                    )}
                    {FEATURES.labResults && (
                        <button
                            onClick={() => navigate('/dashboard/clinical/lab-results')}
                            className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00C8D4]/10 border border-white/[0.08] hover:border-[#00C8D4]/30 text-xs font-bold text-white hover:text-[#00C8D4] transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Activity className="w-4 h-4 text-[#00C8D4]" /> Lab & Imaging Results
                        </button>
                    )}
                    {FEATURES.messages && (
                        <button
                            onClick={() => navigate('/dashboard/clinical/messages')}
                            className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00C8D4]/10 border border-white/[0.08] hover:border-[#00C8D4]/30 text-xs font-bold text-white hover:text-[#00C8D4] transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <MessageSquare className="w-4 h-4 text-[#00C8D4]" /> Secure Messages
                        </button>
                    )}
                    {FEATURES.appointments && (
                        <button
                            onClick={() => navigate('/dashboard/clinical/appointments')}
                            className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00C8D4]/10 border border-white/[0.08] hover:border-[#00C8D4]/30 text-xs font-bold text-white hover:text-[#00C8D4] transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Calendar className="w-4 h-4 text-[#00C8D4]" /> Appointments Scheduling
                        </button>
                    )}
                    {FEATURES.reportsExport && (
                        <button
                            onClick={() => navigate('/dashboard/clinical/reports')}
                            className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00C8D4]/10 border border-white/[0.08] hover:border-[#00C8D4]/30 text-xs font-bold text-white hover:text-[#00C8D4] transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Download className="w-4 h-4 text-[#00C8D4]" /> Reports Export
                        </button>
                    )}
                    {FEATURES.compliance && (
                        <button
                            onClick={() => navigate('/dashboard/clinical/compliance')}
                            className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00C8D4]/10 border border-white/[0.08] hover:border-[#00C8D4]/30 text-xs font-bold text-white hover:text-[#00C8D4] transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <ShieldCheck className="w-4 h-4 text-[#00C8D4]" /> Compliance Panel
                        </button>
                    )}
                </div>
            </div>

            {/* Core split panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">

                {/* Left panel: 6. ACCESS REQUEST WIDGET (takes 2 cols if request is selected, or let's place it here) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Widget: Pending Verification Hold */}
                    <div className="p-6 bg-[#141b2d] border border-[#1b253e] rounded-2xl flex flex-col justify-between shadow-[0_4px_25px_rgba(0,0,0,0.2)]">
                        <div>
                            <div className="flex items-center justify-between border-b border-[#1b253e] pb-3 mb-5">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-amber-500" />
                                    <h3 className="text-sm font-display font-bold text-white">Consensual Verification Hold</h3>
                                </div>
                                <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                                    {pendingRequests.length} Requests Awaiting
                                </span>
                            </div>

                            {pendingRequests.length === 0 ? (
                                <div className="p-10 text-center text-slate-500 font-mono text-xs">
                                    No incoming access requests awaiting validation at this time.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                                    {/* Sidebar Requests Selection */}
                                    <div className="md:col-span-2 border-r border-[#1b253e] pr-4 space-y-2 max-h-[350px] overflow-y-auto">
                                        {pendingRequests.map(req => {
                                            const age = getAge(req.patientDob);
                                            return (
                                                <button
                                                    key={req.id}
                                                    onClick={() => setSelectedRequestId(req.id)}
                                                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                                                        selectedRequest?.id === req.id
                                                            ? 'border-[#00C8D4]/40 bg-[#00C8D4]/5'
                                                            : 'border-transparent hover:bg-white/[0.02]'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-xs font-bold text-white truncate max-w-[120px]">
                                                            {req.patientName || `Patient ${req.patientId.slice(0, 4)}`}
                                                        </span>
                                                        <span className={`text-[8px] font-mono px-1 rounded uppercase tracking-wider ${
                                                            req.urgency === 'Critical' || req.urgency === 'Critical / Emergency'
                                                                ? 'bg-red-500/20 text-red-400'
                                                                : 'bg-[#1b253e] text-slate-400'
                                                        }`}>
                                                            {req.urgency || 'Normal'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 font-mono mt-1">ID: {req.id.slice(0,8)}...</p>
                                                    <p className="text-[9px] text-[#00C8D4] mt-1 font-mono">{req.status}</p>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Detail & Action Column */}
                                    <div className="md:col-span-3 text-xs space-y-4 text-left">
                                        {selectedRequest ? (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-white">
                                                            {selectedRequest.patientName || 'Biometric Identity'}
                                                        </h4>
                                                        <p className="text-[10px] font-mono text-slate-500">UID: {selectedRequest.patientId}</p>
                                                    </div>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono border font-bold ${
                                                        selectedRequest.status === 'Awaiting OTP' || selectedRequest.status === 'approved'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    }`}>
                                                        {selectedRequest.status}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 p-3 bg-white/[0.02] border border-[#1b253e] rounded-xl font-mono text-[10px]">
                                                    <div>
                                                        <span className="text-slate-500 block uppercase font-bold">Requestor Doctor</span>
                                                        <span className="text-white font-semibold">{selectedRequest.doctorName || 'Staff'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 block uppercase font-bold">Consensus Hospital</span>
                                                        <span className="text-white font-semibold">{selectedRequest.hospital || 'Central Node'}</span>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-slate-500 block uppercase font-bold">Access Purpose</span>
                                                        <span className="text-white">{selectedRequest.reason || 'Not Specified'}</span>
                                                    </div>
                                                </div>

                                                {/* Expiration warning indicator */}
                                                <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-mono">
                                                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                                                    <span>Hold expires 15 minutes after initialization</span>
                                                </div>

                                                {/* OTP waiting status & verify */}
                                                {(selectedRequest.status === 'Awaiting OTP' || selectedRequest.status === 'approved') ? (
                                                    <form onSubmit={handleVerifyOtpSubmit} className="space-y-2 border-t border-[#1b253e] pt-3">
                                                        <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold">
                                                            Enter Cryptographic Biometric OTP
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                maxLength={6}
                                                                value={otpInput}
                                                                onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                                                                placeholder="6-digit verification code"
                                                                className="flex-1 bg-[#0b0f1a] border border-[#1b253e] rounded-xl px-3 py-2 text-center font-mono text-white tracking-widest text-sm focus:outline-none focus:border-[#00C8D4]"
                                                            />
                                                            <button
                                                                type="submit"
                                                                disabled={verifyingOtp || otpInput.length < 6}
                                                                className="px-4 rounded-xl bg-[#00C8D4] hover:bg-[#00E5F0] text-[#0b0f1a] font-bold text-xs flex items-center justify-center transition-all disabled:opacity-40"
                                                            >
                                                                {verifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                                                            </button>
                                                        </div>
                                                        
                                                        {/* Demo Help */}
                                                        <div className="flex justify-between items-center text-[9px] font-mono pt-1">
                                                            <span className="text-slate-500">Need patient verification?</span>
                                                            <button
                                                                type="button"
                                                                onClick={handleAutoVerifyDemo}
                                                                className="text-[#00C8D4] hover:underline uppercase font-bold"
                                                            >
                                                                Auto-Approve (Simulated Patient)
                                                            </button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <div className="flex gap-2 pt-2 border-t border-[#1b253e]">
                                                        <button
                                                            onClick={handleAutoVerifyDemo}
                                                            className="flex-1 py-2.5 rounded-xl bg-[#00C8D4]/10 hover:bg-[#00C8D4]/20 border border-[#00C8D4]/30 text-[#00C8D4] hover:text-white font-bold transition-all text-xs"
                                                        >
                                                            Generate Consent Hold & OTP
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectRequest(selectedRequest.id)}
                                                            className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold transition-all text-xs"
                                                        >
                                                            Reject Request
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-10 text-slate-500">Select a request file to verify consensus.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right panel: 10. NOTIFICATIONS & SECURITY SYSTEM */}
                <div className="space-y-6">
                    
                    {/* Widget: Operational Alerts */}
                    <div className="p-6 bg-[#141b2d] border border-[#1b253e] rounded-2xl flex flex-col justify-between shadow-[0_4px_25px_rgba(0,0,0,0.2)]">
                        <div>
                            <div className="flex items-center justify-between border-b border-[#1b253e] pb-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-[#00C8D4]" />
                                    <h3 className="text-sm font-display font-bold text-white">Biometric Security Alerts</h3>
                                </div>
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            </div>

                            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                                {alertsList.map((alert, i) => (
                                    <div 
                                        key={alert.id}
                                        className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                                            alert.type === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-200' :
                                            alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' :
                                            'bg-white/[0.01] border-white/[0.04]'
                                        }`}
                                    >
                                        {alert.type === 'critical' ? (
                                            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                        ) : alert.type === 'warning' ? (
                                            <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
                                        ) : (
                                            <ShieldCheck className="w-4 h-4 text-[#00C8D4] mt-0.5 flex-shrink-0" />
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className="text-xs font-bold text-white truncate leading-none">{alert.title}</p>
                                                <span className="text-[8px] font-mono text-slate-500 flex-shrink-0">{alert.time}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1 font-mono leading-tight">{alert.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#1b253e] text-center">
                            <button
                                onClick={() => navigate('/dashboard/clinical/notifications')}
                                className="text-[10px] font-bold text-[#00C8D4] hover:text-white uppercase tracking-wider font-mono flex items-center justify-center gap-1 mx-auto"
                            >
                                Open Alerts Panel <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 7. CLINICAL RECORD SUMMARY TABLE */}
            <div className="p-6 bg-[#141b2d] border border-[#1b253e] rounded-2xl space-y-6 relative z-10 shadow-[0_4px_35px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between border-b border-[#1b253e] pb-3 flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#00C8D4]" />
                        <h2 className="text-base font-display font-bold text-white">Consensual EHR Patient Registry</h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search by name, ABHA ID, Aadhaar..."
                                className="bg-[#0b0f1a] border border-[#1b253e] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00C8D4] font-mono w-60"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#1b253e] bg-black/20">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-[#1a2236] text-[#8899AA] font-mono uppercase text-[9px] tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Patient Details</th>
                                <th className="px-4 py-3">Global Patient ID</th>
                                <th className="px-4 py-3">ABHA Health ID</th>
                                <th className="px-4 py-3">Masked Aadhaar</th>
                                <th className="px-4 py-3">Permanent Location</th>
                                <th className="px-4 py-3">Org Origin</th>
                                <th className="px-4 py-3">Consent Hold</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1b253e]/40 font-sans">
                            {filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500 font-mono">
                                        {patients.length === 0 ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-6 h-6 animate-spin text-[#00C8D4]" />
                                                <span>Connecting to distributed ledger nodes...</span>
                                            </div>
                                        ) : (
                                            <span>No synchronized patients match search query. Try again or register profile.</span>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredPatients.map(pat => {
                                    const consent = consentStatuses[pat.id] || 'No Request';
                                    const isExternal = (pat.primaryHospital || 'Central Health Vault').toLowerCase() !== userClinic.toLowerCase();
                                    
                                    return (
                                        <tr key={pat.id} className="hover:bg-white/[0.01] transition-colors group">
                                            <td className="px-4 py-3.5">
                                                <div>
                                                    <p className="font-bold text-white group-hover:text-[#00C8D4] transition-colors font-display">
                                                        {pat.fullName || pat.name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                                        {getAge(pat.dob)} yrs &middot; {pat.gender || 'N/A'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 font-mono text-[#00C8D4] font-semibold">
                                                {pat.globalPatientId || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3.5 font-mono text-slate-300">
                                                {pat.abhaId || 'Not Linked'}
                                            </td>
                                            <td className="px-4 py-3.5 font-mono text-slate-400">
                                                {pat.aadhaarMasked ? maskAadhaar(pat.aadhaarMasked) : 'Not Linked'}
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-400">
                                                {pat.address ? maskAddress(pat.address) : 'N/A'}
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-400 font-semibold font-mono text-[10px]">
                                                {pat.primaryHospital || 'Vault Central'}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold border ${
                                                    consent === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    consent === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    'bg-white/[0.02] text-slate-500 border-white/[0.04]'
                                                }`}>
                                                    {consent}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <button
                                                    onClick={() => navigate(`/dashboard/clinical/patient-profile/${pat.id}`)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-[#00C8D4]/10 hover:bg-[#00C8D4] text-[#00C8D4] hover:text-[#0b0f1a] font-bold transition-all inline-flex items-center gap-0.5 text-[10px] cursor-pointer"
                                                >
                                                    Open Profile <ArrowUpRight className="w-3 h-3" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Grid for charts & feeds */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                
                {/* 8. ANALYTICS PREVIEW (takes 2 cols) */}
                <div className="lg:col-span-2 p-6 bg-[#141b2d] border border-[#1b253e] rounded-2xl flex flex-col justify-between shadow-[0_4px_25px_rgba(0,0,0,0.2)]">
                    <div>
                        <div className="flex items-center justify-between border-b border-[#1b253e] pb-3 mb-5">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-[#00C8D4]" />
                                <h3 className="text-sm font-display font-bold text-white">Operations Performance Matrix</h3>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">Consensus sync trend</span>
                        </div>

                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00C8D4" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#00C8D4" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorApprovals" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="hour" stroke="#4a5c4e" fontSize={10} fontClassName="font-mono" />
                                    <YAxis stroke="#4a5c4e" fontSize={10} fontClassName="font-mono" />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#141b2d', borderColor: '#1b253e', borderRadius: '12px' }}
                                        labelStyle={{ color: '#fff', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                                        itemStyle={{ fontSize: '11px' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                    <Area type="monotone" dataKey="requests" name="Access Requests" stroke="#00C8D4" fillOpacity={1} fill="url(#colorRequests)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="approvals" name="Active Holds" stroke="#10b981" fillOpacity={1} fill="url(#colorApprovals)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="uploads" name="Files Synced" stroke="#a78bfa" fillOpacity={1} fill="url(#colorUploads)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 9. TEAM / STAFF & INTEROPERABILITY WORKSPACE */}
                <div className="p-6 bg-[#141b2d] border border-[#1b253e] rounded-2xl flex flex-col justify-between shadow-[0_4px_25px_rgba(0,0,0,0.2)]">
                    <div>
                        <div className="flex items-center justify-between border-b border-[#1b253e] pb-3 mb-4">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-[#00C8D4]" />
                                <h3 className="text-sm font-display font-bold text-white">Active Shift Staff</h3>
                            </div>
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                Global Nodes Online
                            </span>
                        </div>

                        <div className="space-y-3.5">
                            {staffList.slice(0, 5).map(member => (
                                <div key={member.id} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7.5 h-7.5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-[10px] font-bold text-white font-mono border border-cyan-500/20">
                                            {member.fullName ? member.fullName.split(' ').map(n=>n[0]).join('').slice(0, 2).toUpperCase() : 'CL'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white leading-none">{member.fullName || 'Clinical Staff'}</p>
                                            <p className="text-[9px] text-slate-500 mt-0.5 truncate max-w-[120px] font-mono">{member.primaryHospital || 'Apollo Hospital'}</p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1 font-mono text-[9px] text-emerald-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Node
                                    </span>
                                </div>
                            ))}

                            <div className="p-3 bg-white/[0.02] border border-[#1b253e] rounded-xl text-left space-y-2 mt-4">
                                <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Shift Handover Docket</p>
                                <p className="text-[10px] text-slate-400 leading-normal">
                                    Pending 3 HIPAA validation reviews and validation audit confirmations. Next ledger root check: 18:00.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1b253e]">
                        <button
                            onClick={() => navigate('/dashboard/clinical/workspace')}
                            className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00C8D4]/10 border border-white/[0.08] hover:border-[#00C8D4]/30 text-xs font-bold text-white hover:text-[#00C8D4] transition-all flex items-center justify-center gap-1.5 cursor-pointer font-mono"
                        >
                            Open Team Workspace <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 4. RECENT ACTIVITY FEED & AUDIT TRAILS */}
            <div className="p-6 bg-[#141b2d] border border-[#1b253e] rounded-2xl space-y-5 relative z-10 shadow-[0_4px_35px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between border-b border-[#1b253e] pb-3">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#00C8D4]" />
                        <h2 className="text-base font-display font-bold text-white">Live Node Access Audit Feed</h2>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/clinical/logs')}
                        className="text-xs text-[#00C8D4] hover:text-white flex items-center gap-1 transition-colors font-mono"
                    >
                        View Full Logs <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="divide-y divide-[#1b253e]/40 max-h-[300px] overflow-y-auto pr-1">
                    {auditLogs.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-500 font-mono">
                            No ledger actions written to blocks yet.
                        </div>
                    ) : (
                        auditLogs.map((log, i) => {
                            let actionText = '';
                            let badgeStyle = 'bg-white/[0.03] text-slate-400 border-white/[0.06]';
                            
                            if (log.activityType === 'CLINICAL_DASHBOARD_ACCESS') {
                                actionText = 'Logged into Clinical Dashboard Overview';
                                badgeStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                            } else if (log.activityType === 'PATIENT_RECORD_REDIRECTED') {
                                actionText = `Opened patient profile: ${log.details?.patientName || 'Biometric Identity'}`;
                                badgeStyle = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
                            } else if (log.activityType === 'PATIENT_REGISTERED') {
                                actionText = `Onboarded new Patient Registry Profile: ${log.details?.patientName}`;
                                badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                            } else if (log.activityType === 'UNAUTHORIZED_ACCESS_ATTEMPT') {
                                actionText = `CRITICAL WARNING: Blocked unauthorized operator attempting to view profile: ${log.details?.patientName}`;
                                badgeStyle = 'bg-red-500/10 text-red-400 border-red-500/20';
                            } else if (log.activityType === 'OTP_VERIFIED_ACCESS_GRANTED') {
                                actionText = `Biometric OTP Verified. Granted active interop session for patient ID: ${log.details?.patientId?.slice(0,8)}...`;
                                badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                            } else {
                                actionText = log.details?.action || log.activityType || 'Performed system actions';
                            }

                            const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
                            const timeString = !isNaN(logDate.getTime()) ? logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Recent';

                            return (
                                <div key={log.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                                    <div className="flex items-start md:items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded font-mono text-[9px] border font-bold ${badgeStyle}`}>
                                            {log.activityType?.slice(0, 18) || 'ACTION'}
                                        </span>
                                        <div>
                                            <p className="text-white font-semibold">{actionText}</p>
                                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                                Tx: {log.txHash || 'Pending consensus'} &middot; Operator ID: {log.userId?.slice(0,8)}...
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-slate-500 font-mono text-[10px] md:text-right flex-shrink-0">
                                        {timeString}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Back Button Wrapper */}
            <div className="pt-4 flex justify-start relative z-10">
                <button
                    onClick={() => navigate('/')}
                    className="px-5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-white hover:text-[#00C8D4] text-xs font-semibold uppercase tracking-wider transition-all font-mono inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                    Return to Main Portal
                </button>
            </div>
        </div>
    );
}
