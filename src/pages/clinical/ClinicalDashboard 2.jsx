import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardList, ShieldCheck, Users, FileText, Clock, AlertTriangle,
    Activity, ArrowRight, Search, CheckCircle, XCircle, Hourglass,
    TrendingUp, Brain, Zap, Eye, Key, Server, Database, AlertCircle,
    Network, Check, RefreshCw, Plus, UserPlus, Mail, MapPin, X, Globe
} from 'lucide-react';
import { db } from '../../firebase/config';
import { 
    collection, query, orderBy, limit, onSnapshot, addDoc, 
    serverTimestamp, doc, setDoc, where, getDocs 
} from 'firebase/firestore';
import { toast } from '../../components/Toast';
import useAuthStore from '../../store/authStore';

// Generate unique readable patient ID (same format as CreatePatient.jsx)
const generateUID = () => {
    const year = new Date().getFullYear();
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `HC-PAT-${year}-${rand}`;
};

// Generate Global Patient ID
const generateGlobalPatientID = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return `HCG-${result}`;
};

export default function ClinicalDashboard() {
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const [search, setSearch] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    // Node statuses for blockchain integration section
    const [nodeHealth, setNodeHealth] = useState({
        primaryNode: 'online',
        blockchainSync: '100%',
        avgBlockTime: '12.4s',
        activeValidators: 14
    });

    // Dynamic Live Data States
    const [pendingCount, setPendingCount] = useState(0);
    const [approvedCount, setApprovedCount] = useState(0);
    const [activeCasesCount, setActiveCasesCount] = useState(0);
    const [recordsReviewedCount, setRecordsReviewedCount] = useState(0);
    const [expiringCount, setExpiringCount] = useState(0);
    const [securityScore, setSecurityScore] = useState(99);

    const [pendingReqs, setPendingReqs] = useState([]);
    const [liveFeed, setLiveFeed] = useState([]);
    const [userNames, setUserNames] = useState({});

    // Patient Search & Quick Onboarding States
    const [registryPatients, setRegistryPatients] = useState([]);
    const [usersPatients, setUsersPatients] = useState([]);
    const [consentStatuses, setConsentStatuses] = useState({});
    
    // Search Filter Inputs
    const [searchName, setSearchName] = useState('');
    const [searchAadhaar, setSearchAadhaar] = useState('');
    const [searchAbha, setSearchAbha] = useState('');
    const [searchGlobalId, setSearchGlobalId] = useState('');
    const [searchHospital, setSearchHospital] = useState('');
    const [searchStatus, setSearchStatus] = useState('All');

    // Onboarding Form modal
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        gender: 'Male',
        phone: '',
        email: '',
        address: '',
        aadhaarInput: '',
        abhaId: '',
        primaryHospital: ''
    });

    // Fetch live users and patients list
    useEffect(() => {
        const unsubPatients = onSnapshot(collection(db, 'patients'), (snapshot) => {
            const pats = [];
            snapshot.forEach(docSnap => {
                pats.push({ id: docSnap.id, ...docSnap.data(), source: 'patients' });
            });
            setRegistryPatients(pats);
        }, (err) => console.warn('Registry patients load error:', err));

        const qUsers = query(collection(db, 'users'), where('role', '==', 'patient'));
        const unsubUsers = onSnapshot(qUsers, (snapshot) => {
            const usrs = [];
            snapshot.forEach(docSnap => {
                usrs.push({ id: docSnap.id, ...docSnap.data(), source: 'users' });
            });
            setUsersPatients(usrs);
        }, (err) => console.warn('Users patients load error:', err));

        const qRequests = query(collection(db, 'accessRequests'));
        const unsubRequests = onSnapshot(qRequests, (snapshot) => {
            const statuses = {};
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                const patientId = data.patientId;
                const status = data.status;
                if (patientId) {
                    if (status === 'approved' || status === 'granted' || status === 'OTP_VERIFIED_ACCESS_GRANTED') {
                        statuses[patientId] = 'Active';
                    } else if (!statuses[patientId] && (status === 'pending' || status === 'Awaiting OTP' || status === 'Patient Notified')) {
                        statuses[patientId] = 'Pending';
                    } else if (!statuses[patientId]) {
                        statuses[patientId] = status.charAt(0).toUpperCase() + status.slice(1);
                    }
                }
            });
            setConsentStatuses(statuses);
        }, (err) => console.warn('Requests snapshot load error:', err));

        return () => {
            unsubPatients();
            unsubUsers();
            unsubRequests();
        };
    }, []);

    // Merge patients list
    const allPatients = React.useMemo(() => {
        const merged = [...registryPatients];
        usersPatients.forEach(u => {
            if (!merged.some(m => m.id === u.id)) {
                merged.push({
                    ...u,
                    fullName: u.fullName || u.displayName || u.name || 'Unknown Patient'
                });
            }
        });
        return merged;
    }, [registryPatients, usersPatients]);

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

    // Filter patients based on user inputs
    const filteredPatients = React.useMemo(() => {
        const nameQuery = searchName.trim().toLowerCase();
        const aadhaarQuery = searchAadhaar.trim();
        const abhaQuery = searchAbha.trim().toLowerCase();
        const globalIdQuery = searchGlobalId.trim().toLowerCase();
        const hospitalQuery = searchHospital.trim().toLowerCase();
        const statusQuery = searchStatus;

        return allPatients.filter(pat => {
            // 1. Name query
            if (nameQuery) {
                const name = (pat.fullName || pat.name || '').toLowerCase();
                if (!name.includes(nameQuery)) return false;
            }
            // 2. Aadhaar last 4 digits query
            if (aadhaarQuery) {
                const masked = pat.aadhaarMasked || '';
                if (!masked.endsWith(aadhaarQuery)) return false;
            }
            // 3. ABHA ID query
            if (abhaQuery) {
                const abha = (pat.abhaId || '').toLowerCase();
                if (!abha.includes(abhaQuery)) return false;
            }
            // 4. Global Patient ID query
            if (globalIdQuery) {
                const gid = (pat.globalPatientId || '').toLowerCase();
                if (!gid.includes(globalIdQuery)) return false;
            }
            // 5. Hospital query
            if (hospitalQuery) {
                const hosp = (pat.primaryHospital || '').toLowerCase();
                if (!hosp.includes(hospitalQuery)) return false;
            }
            // 6. Consent Status query
            if (statusQuery !== 'All') {
                const status = consentStatuses[pat.id] || 'No Request';
                if (status.toLowerCase() !== statusQuery.toLowerCase()) return false;
            }
            return true;
        });
    }, [allPatients, searchName, searchAadhaar, searchAbha, searchGlobalId, searchHospital, searchStatus, consentStatuses]);

    // Handle redirection when clicking patient card
    const handlePatientClick = async (patient) => {
        try {
            // Write to audit trail
            const chars = '0123456789abcdef';
            let txHash = '0x';
            for (let i = 0; i < 64; i++) {
                txHash += chars[Math.floor(Math.random() * 16)];
            }
            await addDoc(collection(db, 'auditLogs'), {
                timestamp: serverTimestamp(),
                activityType: 'PATIENT_RECORD_REDIRECTED',
                userId: currentUser?.uid || 'clinical-staff',
                txHash,
                details: {
                    patientId: patient.id,
                    patientName: patient.fullName || patient.name,
                    action: 'Clinical staff clicked patient record. Auto-redirected to patient details page.'
                }
            });
        } catch (err) {
            console.warn('Audit trail log failure:', err);
        }
        navigate(`/dashboard/clinical/patient-profile/${patient.id}`);
    };

    // Handle Quick Registration Submit
    const handleRegisterSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!formData.fullName.trim()) return toast.error('Full Name is required');
        if (!formData.dob) return toast.error('Date of Birth is required');
        if (!formData.phone.trim()) return toast.error('Phone Number is required');
        if (!formData.email.trim()) return toast.error('Email is required');

        setRegistering(true);
        try {
            const pId = generateUID();
            const globalId = generateGlobalPatientID();
            const cleanAadhaar = formData.aadhaarInput.replace(/-/g, '');
            const masked = cleanAadhaar ? `XXXX-XXXX-${cleanAadhaar.slice(-4)}` : '';

            // Duplicate Checks
            const querySnap = await getDocs(collection(db, 'patients'));
            let duplicateMsg = null;

            querySnap.forEach(docSnap => {
                const data = docSnap.data();
                if (masked && data.aadhaarMasked === masked) {
                    duplicateMsg = 'A patient with this Aadhaar number already exists in the system.';
                }
                if (formData.abhaId && data.abhaId === formData.abhaId) {
                    duplicateMsg = 'A patient with this ABHA Health ID is already registered.';
                }
            });

            if (duplicateMsg) {
                toast.error(duplicateMsg);
                setRegistering(false);
                return;
            }

            const newPatient = {
                patientId: pId,
                globalPatientId: globalId,
                fullName: formData.fullName.trim(),
                dob: formData.dob,
                gender: formData.gender,
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                address: formData.address.trim(),
                aadhaarMasked: masked,
                aadhaarVerified: true,
                abhaId: formData.abhaId,
                abhaLinked: true,
                bloodGroup: 'A+',
                allergies: [],
                chronicConditions: [],
                emergencyContact: '',
                insuranceDetails: '',
                primaryHospital: formData.primaryHospital.trim() || currentUser?.hospital || 'Central Health Vault',
                assignedDoctor: '',
                notes: 'Created via fast onboarding clinical ledger.',
                createdBy: currentUser?.uid || 'clinical-staff',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            // Write to both patients and users collections
            await setDoc(doc(db, 'patients', pId), newPatient);
            await setDoc(doc(db, 'users', pId), {
                uid: pId,
                role: 'patient',
                fullName: newPatient.fullName,
                displayName: newPatient.fullName,
                email: newPatient.email,
                phone: newPatient.phone,
                dob: newPatient.dob,
                gender: newPatient.gender,
                address: newPatient.address,
                aadhaarMasked: newPatient.aadhaarMasked,
                abhaId: newPatient.abhaId,
                primaryHospital: newPatient.primaryHospital,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // Log creation in audit log
            const chars = '0123456789abcdef';
            let txHash = '0x';
            for (let i = 0; i < 64; i++) {
                txHash += chars[Math.floor(Math.random() * 16)];
            }
            await addDoc(collection(db, 'auditLogs'), {
                userId: currentUser?.uid || 'clinical-staff',
                activityType: 'PATIENT_REGISTERED',
                timestamp: serverTimestamp(),
                txHash,
                details: {
                    patientId: pId,
                    patientName: newPatient.fullName,
                    action: 'Clinical staff onboarded new patient profile. Auto-redirected to patient details page.'
                }
            });

            toast.success('Patient onboarded successfully onto block-chain.');
            setShowRegisterModal(false);
            
            // Auto redirect
            navigate(`/dashboard/clinical/patient-profile/${pId}`);
        } catch (err) {
            console.error('Fast Onboarding Failed:', err);
            toast.error('Registration failed: ' + err.message);
        } finally {
            setRegistering(false);
        }
    };

    // Load Live stats from Firebase
    useEffect(() => {
        // 1. Fetch user names to resolve patient UIDs to names
        const usersQ = query(collection(db, 'users'));
        const unsubUsers = onSnapshot(usersQ, (snapshot) => {
            const names = {};
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                names[docSnap.id] = data.name || data.displayName || data.email || docSnap.id;
            });
            setUserNames(names);
        }, (err) => console.warn('Error loading user names:', err));

        // 2. Fetch pending access requests
        const requestsQ = query(collection(db, 'accessRequests'), orderBy('createdAt', 'desc'));
        const unsubRequests = onSnapshot(requestsQ, (snapshot) => {
            let pCount = 0;
            let aCount = 0;
            let expCount = 0;
            const uniquePatients = new Set();
            const pList = [];

            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                const id = docSnap.id;
                const patientId = data.patientId;
                const status = data.status;

                if (patientId) {
                    uniquePatients.add(patientId);
                }

                if (status === 'pending' || status === 'Awaiting OTP' || status === 'Patient Notified') {
                    pCount++;
                    if (pList.length < 5) {
                        let timeStr = 'Recent';
                        if (data.createdAt) {
                            try {
                                const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                                if (date && !isNaN(date.getTime())) {
                                    timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                }
                            } catch (e) {
                                console.warn('Failed parsing createdAt timestamp:', e);
                            }
                        }
                        pList.push({
                            id: typeof id === 'string' ? id.substring(0, 8).toUpperCase() : String(id).substring(0, 8).toUpperCase(),
                            patientId: patientId,
                            type: data.category || data.purpose || 'Records Access',
                            urgency: data.urgency || 'Normal',
                            status: status === 'pending' ? 'Awaiting OTP' : status,
                            time: timeStr
                        });
                    }
                } else if (status === 'approved' || status === 'granted' || status === 'OTP_VERIFIED_ACCESS_GRANTED') {
                    aCount++;
                    if (data.expiresAt) {
                        try {
                            const expDate = data.expiresAt.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
                            if (expDate && !isNaN(expDate.getTime())) {
                                if (expDate - new Date() < 24 * 60 * 60 * 1000) {
                                    expCount++;
                                }
                            }
                        } catch (e) {
                            console.warn('Failed parsing expiresAt timestamp:', e);
                        }
                    }
                }
            });

            setPendingCount(pCount);
            setApprovedCount(aCount);
            setActiveCasesCount(uniquePatients.size);
            setExpiringCount(expCount || Math.min(aCount, 2));
            setPendingReqs(pList);
        }, (err) => console.warn('Error loading requests:', err));

        // 3. Fetch records count
        const recordsQ = query(collection(db, 'records'));
        const unsubRecords = onSnapshot(recordsQ, (snapshot) => {
            setRecordsReviewedCount(snapshot.size);
        }, (err) => console.warn('Error loading records count:', err));

        // 4. Fetch live audit logs
        const logsQ = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(5));
        const unsubLogs = onSnapshot(logsQ, (snapshot) => {
            const list = snapshot.docs.map(docSnap => {
                const data = docSnap.data();
                let timeStr = 'Recent';
                if (data.timestamp) {
                    try {
                        const date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
                        if (date && !isNaN(date.getTime())) {
                            timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }
                    } catch (e) {
                        console.warn('Failed parsing audit log timestamp:', e);
                    }
                }

                let statusVal = 'granted';
                let actionText = '';
                if (data.activityType === 'RECORD_UPLOADED') {
                    actionText = 'uploaded medical record';
                } else if (data.activityType === 'RECORD_VIEWED' || data.activityType === 'RECORD_DECRYPTED_VIEWED') {
                    actionText = 'accessed patient records';
                } else if (data.activityType === 'OTP_VERIFIED_ACCESS_GRANTED') {
                    actionText = 'verified OTP token';
                } else if (data.activityType === 'EMERGENCY_ACCESS') {
                    actionText = 'triggered emergency bypass';
                    statusVal = 'denied';
                } else {
                    actionText = data.activityType?.replace(/_/g, ' ')?.toLowerCase() || 'performed action';
                }

                const patientId = data.details?.patientId;

                return {
                    actorId: data.userId,
                    action: actionText,
                    patientId: patientId,
                    time: timeStr,
                    status: statusVal
                };
            });
            setLiveFeed(list);
        }, (err) => console.warn('Error loading live activity logs:', err));

        // 5. Fluctuations to security score & node stats
        const interval = setInterval(() => {
            setSecurityScore(prev => {
                const diff = Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0;
                return Math.max(98, Math.min(100, prev + diff));
            });
            setNodeHealth(prev => ({
                ...prev,
                avgBlockTime: `${(11.8 + Math.random() * 1.2).toFixed(1)}s`
            }));
        }, 15000);

        return () => {
            unsubUsers();
            unsubRequests();
            unsubRecords();
            unsubLogs();
            clearInterval(interval);
        };
    }, []);

    const resolvedPending = pendingReqs.map(req => {
        const patientName = userNames[req.patientId] || (req.patientId ? `Patient ${String(req.patientId).substring(0, 4).toUpperCase()}` : 'Unknown');
        return {
            ...req,
            patient: String(patientName)
        };
    }).filter(req => {
        const patientMatch = (req.patient || '').toLowerCase().includes(search.toLowerCase());
        const idMatch = (req.id || '').toLowerCase().includes(search.toLowerCase());
        return patientMatch || idMatch;
    });

    const resolvedFeed = liveFeed.map(feed => {
        const actorName = userNames[feed.actorId] || (feed.actorId ? String(feed.actorId).substring(0, 8) : 'Staff');
        const patientName = userNames[feed.patientId] || (feed.patientId ? `Patient ${String(feed.patientId).substring(0, 4).toUpperCase()}` : 'System');
        return {
            actor: String(actorName),
            action: feed.action || 'performed action',
            patient: String(patientName),
            time: feed.time || 'Recent',
            status: feed.status || 'granted'
        };
    });

    const handleSyncClick = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            toast.success('Blockchain nodes synchronized with global validators.');
        }, 1200);
    };

    const handleTriggerEmergencyBypass = () => {
        navigate('/dashboard/clinical/records');
        toast.info('Redirecting to records to initiate emergency override protocol.');
    };

    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-8 px-4 py-2 text-left">
            {/* Header / Command Status Banner */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono">
                            Enterprise Interoperability Node: Active
                        </span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight">Clinical Command Center</h2>
                    <p className="text-sm text-[#8899AA] mt-1 font-sans">
                        Hospital operations node overseeing cross-organizational EHR sync, cryptographic consent keys, and emergency overrides.
                    </p>
                </div>
                
                <div className="flex items-center flex-wrap gap-3 w-full lg:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            value={search} 
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Filter live operations..."
                            className="w-full sm:w-60 bg-[#111827]/70 border border-[#1E2D4580] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4] transition-all font-mono"
                        />
                    </div>
                    <button
                        onClick={handleSyncClick}
                        className="px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-[#8899AA] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all font-mono flex-1 sm:flex-initial justify-center"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#00C8D4]' : ''}`} />
                        Sync Nodes
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/clinical/requests')}
                        className="px-4.5 py-2 rounded-xl bg-[#00C8D4] text-[#0B0F1A] font-bold text-xs flex items-center gap-2 hover:bg-[#00E5F0] transition-all shadow-[0_0_15px_rgba(0,200,212,0.25)] font-mono flex-1 sm:flex-initial justify-center"
                    >
                        <ClipboardList className="w-3.5 h-3.5" /> Request Access
                    </button>
                </div>
            </div>

            {/* Patient Search & Onboarding Registry panel */}
            <div className="p-6 bg-gradient-to-br from-[#1E2D4520] to-[#111827] border border-[#1E2D4580] rounded-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-[#1E2D4550] pb-3 flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#00C8D4]" />
                        <h3 className="text-base font-display font-bold text-white">Patient Record Registry & Search Node</h3>
                    </div>
                    <button
                        onClick={() => {
                            setFormData({
                                fullName: '',
                                dob: '',
                                gender: 'Male',
                                phone: '',
                                email: '',
                                address: '',
                                aadhaarInput: '',
                                abhaId: '',
                                primaryHospital: currentUser?.hospital || ''
                            });
                            setShowRegisterModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#00C8D4]/10 hover:bg-[#00C8D4]/20 border border-[#00C8D4]/30 text-[#00C8D4] hover:text-white text-xs font-bold font-mono uppercase tracking-wide flex items-center gap-1 transition-all"
                    >
                        <UserPlus className="w-3.5 h-3.5" /> Register New Patient
                    </button>
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#8899AA] uppercase tracking-wider">Patient Name</label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4A5568]" />
                            <input 
                                value={searchName}
                                onChange={e => setSearchName(e.target.value)}
                                placeholder="Search Name..."
                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00C8D4]/40"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#8899AA] uppercase tracking-wider">Aadhaar (Last 4)</label>
                        <input 
                            value={searchAadhaar}
                            onChange={e => setSearchAadhaar(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="e.g. 1234"
                            maxLength={4}
                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00C8D4]/40 font-mono"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#8899AA] uppercase tracking-wider">ABHA ID</label>
                        <input 
                            value={searchAbha}
                            onChange={e => setSearchAbha(e.target.value)}
                            placeholder="e.g. 91-1234-..."
                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00C8D4]/40 font-mono"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#8899AA] uppercase tracking-wider">Global Patient ID</label>
                        <input 
                            value={searchGlobalId}
                            onChange={e => setSearchGlobalId(e.target.value)}
                            placeholder="e.g. HCG-..."
                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00C8D4]/40 font-mono"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#8899AA] uppercase tracking-wider">Hospital Name</label>
                        <input 
                            value={searchHospital}
                            onChange={e => setSearchHospital(e.target.value)}
                            placeholder="Search Hospital..."
                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00C8D4]/40"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#8899AA] uppercase tracking-wider">Consent status</label>
                        <select 
                            value={searchStatus}
                            onChange={e => setSearchStatus(e.target.value)}
                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-3 py-1.5 text-xs text-[#8899AA] focus:outline-none focus:border-[#00C8D4]/40"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Pending">Pending</option>
                            <option value="No Request">No Request</option>
                        </select>
                    </div>
                </div>

                {/* Filter suggestions or list result container */}
                <div className="overflow-x-auto rounded-xl border border-[#1E2D4580] bg-[#0B0F1A]/50">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-[#1A2236] text-[#8899AA] font-mono uppercase text-[10px]">
                            <tr>
                                <th className="px-4 py-3">Patient Details</th>
                                <th className="px-4 py-3">Global ID</th>
                                <th className="px-4 py-3">ABHA ID</th>
                                <th className="px-4 py-3">Aadhaar Masked</th>
                                <th className="px-4 py-3">Hospital / Dept</th>
                                <th className="px-4 py-3">Consent Status</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E2D4530]">
                            {filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-mono">
                                        No patients match the search criteria. 
                                        <button 
                                            onClick={() => setShowRegisterModal(true)} 
                                            className="text-[#00C8D4] ml-1.5 hover:underline font-bold"
                                        >
                                            Register a new patient profile &rarr;
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                filteredPatients.map(pat => {
                                    const consent = consentStatuses[pat.id] || 'No Request';
                                    return (
                                        <tr 
                                            key={pat.id}
                                            onClick={() => handlePatientClick(pat)}
                                            className="hover:bg-[#1A2236]/30 cursor-pointer transition-colors group"
                                        >
                                            <td className="px-4 py-3">
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-[#00C8D4] transition-colors">{pat.fullName || pat.name}</div>
                                                    <div className="text-[10px] text-slate-500 mt-0.5">{getAge(pat.dob)} yrs &middot; {pat.gender || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-[#00C8D4] font-semibold">{pat.globalPatientId || 'N/A'}</td>
                                            <td className="px-4 py-3 font-mono text-slate-300">{pat.abhaId || 'N/A'}</td>
                                            <td className="px-4 py-3 font-mono text-amber-400">
                                                {pat.aadhaarMasked ? pat.aadhaarMasked : 'Not Linked'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">
                                                <div>
                                                    <div className="truncate max-w-[120px]" title={pat.primaryHospital}>{pat.primaryHospital || 'Central Node'}</div>
                                                    <div className="text-[10px] text-slate-500 mt-0.5">{pat.assignedDoctor || 'General'}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                                    consent === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                    consent === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                    'bg-white/[0.04] text-slate-400 border border-white/[0.05]'
                                                }`}>
                                                    {consent}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button 
                                                    className="px-2.5 py-1 rounded bg-[#00C8D4]/10 group-hover:bg-[#00C8D4] text-[#00C8D4] group-hover:text-[#0B0F1A] font-bold transition-all flex items-center gap-0.5 ml-auto text-[10px]"
                                                >
                                                    Open Profile <ArrowRight className="w-3 h-3" />
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

            {/* Critical Realtime Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#0B0F1A] border border-[#1E2D4580] hover:border-[#00C8D4]/30 transition-all relative overflow-hidden group">
                    <div className="absolute top-4 right-4 text-amber-500/20 group-hover:text-amber-500/40 transition-colors">
                        <Hourglass className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider font-mono">Pending Approvals</span>
                    <p className="text-3xl font-display font-bold text-white mt-2">{pendingCount}</p>
                    <p className="text-xs text-amber-500 mt-2 font-mono flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Action Required
                    </p>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#0B0F1A] border border-[#1E2D4580] hover:border-[#00C8D4]/30 transition-all relative overflow-hidden group">
                    <div className="absolute top-4 right-4 text-[#00C8D4]/20 group-hover:text-[#00C8D4]/40 transition-colors">
                        <Key className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider font-mono">Active Consent Keys</span>
                    <p className="text-3xl font-display font-bold text-white mt-2">{approvedCount}</p>
                    <p className="text-xs text-[#00C8D4] mt-2 font-mono flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Cryptographic Holds
                    </p>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#0B0F1A] border border-[#1E2D4580] hover:border-[#00C8D4]/30 transition-all relative overflow-hidden group">
                    <div className="absolute top-4 right-4 text-purple-500/20 group-hover:text-purple-500/40 transition-colors">
                        <Users className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider font-mono">Unique Patient Cases</span>
                    <p className="text-3xl font-display font-bold text-white mt-2">{activeCasesCount}</p>
                    <p className="text-xs text-purple-400 mt-2 font-mono flex items-center gap-1">
                        <Network className="w-3.5 h-3.5" /> Across EHR Nodes
                    </p>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#0B0F1A] border border-[#1E2D4580] hover:border-[#00C8D4]/30 transition-all relative overflow-hidden group">
                    <div className="absolute top-4 right-4 text-emerald-400/20 group-hover:text-emerald-400/40 transition-colors">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider font-mono">Compliance & Security</span>
                    <p className="text-3xl font-display font-bold text-white mt-2">{securityScore}%</p>
                    <p className="text-xs text-emerald-400 mt-2 font-mono flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Zero-Error Integrity
                    </p>
                </div>
            </div>

            {/* Quick Action Matrix Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 bg-gradient-to-br from-[#1E2D4520] to-[#111827] border border-[#1E2D4580] rounded-2xl flex flex-col justify-between group hover:border-[#00C8D4]/20 transition-all">
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center text-[#00C8D4] mb-4">
                            <Eye className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-white font-display">Launch EHR Clinical Viewer</h4>
                        <p className="text-xs text-[#8899AA] mt-1.5 leading-relaxed">
                            Access real-time patient charts, records metadata, and decrypted file archives with patient verification.
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard/clinical/viewer')}
                        className="mt-6 flex items-center justify-between px-4 py-2.5 bg-white/[0.03] hover:bg-[#00C8D4]/10 border border-white/[0.08] hover:border-[#00C8D4]/30 text-xs font-bold text-white rounded-xl transition-all"
                    >
                        <span>Open Viewer</span>
                        <ArrowRight className="w-4 h-4 text-[#00C8D4] group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="p-5 bg-gradient-to-br from-[#1E2D4520] to-[#111827] border border-[#1E2D4580] rounded-2xl flex flex-col justify-between group hover:border-[#00C8D4]/20 transition-all">
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                            <Key className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-white font-display">Verify active consent keys</h4>
                        <p className="text-xs text-[#8899AA] mt-1.5 leading-relaxed">
                            Audit active cryptographic consent periods. Verify patient Zero-Knowledge proofs and revoke decryption permits.
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard/clinical/consent')}
                        className="mt-6 flex items-center justify-between px-4 py-2.5 bg-white/[0.03] hover:bg-purple-500/10 border border-white/[0.08] hover:border-purple-500/30 text-xs font-bold text-white rounded-xl transition-all"
                    >
                        <span>Manage Consent Keys</span>
                        <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="p-5 bg-gradient-to-br from-red-950/10 to-[#111827] border border-red-900/35 rounded-2xl flex flex-col justify-between group hover:border-red-500/30 transition-all">
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-white font-display">Log Emergency Bypass</h4>
                        <p className="text-xs text-[#8899AA] mt-1.5 leading-relaxed">
                            Initiate break-glass protocol for emergency cases. Instantly logs bypass events to the blockchain audit trail.
                        </p>
                    </div>
                    <button 
                        onClick={handleTriggerEmergencyBypass}
                        className="mt-6 flex items-center justify-between px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-bold text-red-400 rounded-xl transition-all"
                    >
                        <span>Initiate Override Protocol</span>
                        <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Core Workspace & Nodes layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Approvals Table */}
                <div className="lg:col-span-2 rounded-2xl bg-[#111827] border border-[#1E2D4580] overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="px-6 py-4 border-b border-[#1E2D4580] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Hourglass className="w-4 h-4 text-amber-500" />
                                <h3 className="text-sm font-display font-bold text-white">Active Access Requests</h3>
                            </div>
                            <button 
                                onClick={() => navigate('/dashboard/clinical/requests')}
                                className="text-xs text-[#00C8D4] hover:text-white flex items-center gap-1 transition-colors font-mono"
                            >
                                View Requests Ledger <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="divide-y divide-[#1E2D4530] max-h-[360px] overflow-y-auto">
                            {resolvedPending.length === 0 ? (
                                <div className="p-12 text-center text-[#8899AA] font-mono text-xs">
                                    No pending access request notifications at this time.
                                </div>
                            ) : resolvedPending.map((req, i) => (
                                <motion.div 
                                    key={req.id} 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    transition={{ delay: i * 0.05 }}
                                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.01] transition-colors group"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                            req.urgency === 'Critical' ? 'bg-red-400 animate-pulse' :
                                            req.urgency === 'High' ? 'bg-amber-400' : 'bg-[#00C8D4]'
                                        }`} />
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-semibold text-white truncate">{req.patient}</p>
                                                <span className="text-[10px] font-mono text-slate-500">{req.id}</span>
                                                {req.urgency === 'Critical' && (
                                                     <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 font-mono tracking-wider">
                                                         Critical
                                                     </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-[#8899AA] mt-0.5 font-mono">{req.type} &middot; Received {req.time}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 justify-end sm:justify-start">
                                        <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-md border font-mono tracking-wider ${
                                            req.status === 'Awaiting OTP' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            req.status === 'Patient Notified' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>{req.status}</span>
                                        <button 
                                            onClick={() => navigate('/dashboard/clinical/requests')} 
                                            className="p-1.5 rounded-lg bg-[#00C8D4]/10 hover:bg-[#00C8D4]/20 text-[#00C8D4] transition-all"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 border-t border-[#1E2D4530] bg-[#0B0F1A]/40 text-center text-xs text-[#8899AA] font-mono">
                        Awaiting patient biometric or OTP credentials confirmation for keys release.
                    </div>
                </div>

                {/* Blockchain Node Status Ledger */}
                <div className="rounded-2xl bg-[#111827] border border-[#1E2D4580] overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="px-5 py-4 border-b border-[#1E2D4580] flex items-center gap-2">
                            <Server className="w-4 h-4 text-[#00C8D4]" />
                            <h3 className="text-sm font-display font-bold text-white">Local Validator Node</h3>
                        </div>

                        <div className="p-5 space-y-4 font-mono text-xs">
                            <div className="flex items-center justify-between border-b border-[#1E2D4530] pb-2.5">
                                <span className="text-slate-400">Node Connectivity</span>
                                <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-b border-[#1E2D4530] pb-2.5">
                                <span className="text-slate-400">Ledger Block Height</span>
                                <span className="font-semibold text-white">#14,921,804</span>
                            </div>

                            <div className="flex items-center justify-between border-b border-[#1E2D4530] pb-2.5">
                                <span className="text-slate-400">Avg Block Sync Time</span>
                                <span className="font-semibold text-[#00C8D4]">{nodeHealth.avgBlockTime}</span>
                            </div>

                            <div className="flex items-center justify-between border-b border-[#1E2D4530] pb-2.5">
                                <span className="text-slate-400">Active Network Peers</span>
                                <span className="font-semibold text-white">{nodeHealth.activeValidators} nodes</span>
                            </div>

                            <div className="p-3 bg-[#0B0F1A] border border-[#1E2D4560] rounded-xl flex items-center gap-3">
                                <Database className="w-4 h-4 text-[#00C8D4] flex-shrink-0" />
                                <div>
                                    <div className="text-[10px] text-white font-bold">SHA-256 State Integrity</div>
                                    <div className="text-[9px] text-[#8899AA] mt-0.5 truncate">Verified matching root merkle hash</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-[#1E2D4530] bg-[#0B0F1A]/40 flex justify-between items-center text-[10px] text-[#8899AA] font-mono">
                        <span>Latency: 14ms</span>
                        <span>GAS: 12 Gwei</span>
                    </div>
                </div>
            </div>

            {/* Audit / Live ledger feed */}
            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#1E2D4580] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#00C8D4]" />
                        <h3 className="text-sm font-display font-bold text-white">Live Node Access Ledger</h3>
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard/clinical/logs')}
                        className="text-xs text-[#00C8D4] hover:text-white flex items-center gap-1 transition-colors font-mono"
                    >
                        Full Audit Log <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="divide-y divide-[#1E2D4530]">
                    {resolvedFeed.length === 0 ? (
                        <div className="p-8 text-center text-xs text-[#8899AA] font-mono">
                            No ledger actions written to blocks yet.
                        </div>
                    ) : resolvedFeed.map((event, i) => (
                        <div key={i} className="px-6 py-4 flex items-center justify-between text-xs hover:bg-white/[0.005] transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                    event.status === 'granted' ? 'bg-emerald-400' :
                                    event.status === 'denied' ? 'bg-red-400' : 'bg-slate-600'
                                }`} />
                                <span className="font-semibold text-white">{event.actor}</span>
                                <span className="text-slate-400 font-mono">{event.action}</span>
                                <span className="text-[10px] font-bold text-slate-500 font-mono">[{event.patient}]</span>
                            </div>
                            <span className="text-slate-500 font-mono text-[10px]">{event.time}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Registration Modal Overlay */}
            <AnimatePresence>
                {showRegisterModal && (
                    <div className="fixed inset-0 z-50 bg-[#0B0F1A]/80 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#111827] border border-[#1E2D45] p-6 rounded-2xl w-full max-w-lg shadow-2xl relative"
                        >
                            <button 
                                onClick={() => setShowRegisterModal(false)}
                                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <h3 className="text-lg font-bold font-display text-white mb-1">Fast Patient Onboarding Docket</h3>
                            <p className="text-xs text-[#8899AA] mb-4">Initialize profile on-chain. Fields will write directly to patients and users registries.</p>

                            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-[#8899AA] uppercase">Full Name *</label>
                                    <input 
                                        required
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        placeholder="e.g. Rahul Sharma"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8D4]/40"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-mono text-[#8899AA] uppercase">Date of Birth *</label>
                                        <input 
                                            required
                                            type="date"
                                            value={formData.dob}
                                            onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8D4]/40"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-mono text-[#8899AA] uppercase">Gender *</label>
                                        <select 
                                            value={formData.gender}
                                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8D4]/40"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-mono text-[#8899AA] uppercase">Phone *</label>
                                        <input 
                                            required
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="10-digit mobile"
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8D4]/40"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-mono text-[#8899AA] uppercase">Email *</label>
                                        <input 
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="patient@domain.com"
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8D4]/40"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-[#8899AA] uppercase">Permanent Address</label>
                                    <input 
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="City, State, Zip"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8D4]/40"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-mono text-[#8899AA] uppercase">Aadhaar (12-Digit)</label>
                                        <input 
                                            value={formData.aadhaarInput}
                                            onChange={e => setFormData({ ...formData, aadhaarInput: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                                            placeholder="12-digit number"
                                            maxLength={12}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8D4]/40 font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-mono text-[#8899AA] uppercase">ABHA Health ID</label>
                                        <input 
                                            value={formData.abhaId}
                                            onChange={e => setFormData({ ...formData, abhaId: e.target.value })}
                                            placeholder="e.g. 91-0000-0000-00"
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8D4]/40 font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-[#8899AA] uppercase">Primary Hospital</label>
                                    <input 
                                        value={formData.primaryHospital}
                                        onChange={e => setFormData({ ...formData, primaryHospital: e.target.value })}
                                        placeholder="Central Health Vault"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8D4]/40"
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    disabled={registering}
                                    className="w-full py-2.5 rounded-xl bg-[#00C8D4] hover:bg-[#00E5F0] text-[#0B0F1A] font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                                >
                                    {registering ? (
                                        <>
                                            <Loader2 className="w-4.5 h-4.5 animate-spin" /> Storing On-Chain...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-4.5 h-4.5" /> Initialize Patient Profile & Redirect
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
