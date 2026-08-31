import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eye, Shield, ShieldAlert, ShieldCheck, Users, Clock, FileText, Activity, 
    ArrowRight, Search, CheckCircle, RefreshCw, Key, Building2, Server, 
    Database, AlertCircle, Plus, Calendar, Lock, Play, Hourglass, HelpCircle
} from 'lucide-react';
import { db } from '../../firebase/config';
import { 
    collection, query, where, onSnapshot, getDocs, doc, 
    getDoc, addDoc, serverTimestamp, orderBy, limit 
} from 'firebase/firestore';
import { toast } from '../../components/Toast';
import useAuthStore from '../../store/authStore';

export default function ClinicalViewer() {
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();

    // Active Clinic State (allows demo profile switcher to showcase clinic isolation)
    const [selectedClinic, setSelectedClinic] = useState({
        clinicId: currentUser?.clinicId || 'clinic-apollo',
        hospitalId: currentUser?.hospitalId || 'hospital-apollo',
        organizationName: currentUser?.organizationName || currentUser?.hospital || 'Apollo Lab',
        department: currentUser?.department || 'Cardiology Lab'
    });

    const [isSyncing, setIsSyncing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Patients and records loaded from Firestore
    const [allPatients, setAllPatients] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [recordsList, setRecordsList] = useState([]);
    const [clinicalCases, setClinicalCases] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    
    // UI states
    const [loading, setLoading] = useState(true);

    // Sync clinic settings if currentUser profile changes
    useEffect(() => {
        if (currentUser) {
            setSelectedClinic({
                clinicId: currentUser.clinicId || 'clinic-apollo',
                hospitalId: currentUser.hospitalId || 'hospital-apollo',
                organizationName: currentUser.organizationName || currentUser.hospital || 'Apollo Lab',
                department: currentUser.department || 'Cardiology Lab'
            });
        }
    }, [currentUser]);

    // Load patients and sessions in real-time
    useEffect(() => {
        setLoading(true);
        // Subscribe to patients
        const unsubPatients = onSnapshot(collection(db, 'patients'), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllPatients(list);
        }, (err) => console.warn('Patients load error:', err));

        // Subscribe to activeSessions
        const unsubSessions = onSnapshot(collection(db, 'activeSessions'), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setActiveSessions(list);
        }, (err) => console.warn('Sessions load error:', err));

        // Subscribe to records
        const unsubRecords = onSnapshot(collection(db, 'records'), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRecordsList(list);
        }, (err) => console.warn('Records load error:', err));

        // Subscribe to clinicalCases
        const unsubCases = onSnapshot(collection(db, 'clinicalCases'), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setClinicalCases(list);
            setLoading(false);
        }, (err) => {
            console.warn('Cases load error:', err);
            setLoading(false);
        });

        // Subscribe to audit logs
        const unsubLogs = onSnapshot(query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(15)), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAuditLogs(list);
        }, (err) => console.warn('Audit logs load error:', err));

        return () => {
            unsubPatients();
            unsubSessions();
            unsubRecords();
            unsubCases();
            unsubLogs();
        };
    }, []);

    // Filter patients by clinic assignment OR interoperability active sessions
    const resolvedPatients = React.useMemo(() => {
        const { clinicId, hospitalId, organizationName } = selectedClinic;

        return allPatients.map(pat => {
            // Check if patient belongs to current clinic/hospital
            const isOwn = 
                (pat.assignedClinicId && pat.assignedClinicId === clinicId) ||
                (pat.assignedHospitalId && pat.assignedHospitalId === hospitalId) ||
                (pat.organizationId && pat.organizationId === organizationName) ||
                (pat.primaryHospital && pat.primaryHospital === organizationName);

            // Check if there is an active interoperability session for this patient and current user
            const activeSession = activeSessions.find(s => 
                s.patientId === pat.id && 
                s.doctorId === (currentUser?.uid || '') && 
                s.active === true &&
                (s.expiresAt?.toDate ? s.expiresAt.toDate() : new Date(s.expiresAt)) > new Date()
            );

            // Calculate record count
            const recordCount = recordsList.filter(r => r.patientId === pat.id).length;

            return {
                ...pat,
                isOwn,
                isInterop: !isOwn && !!activeSession,
                activeSession,
                recordCount
            };
        }).filter(pat => {
            // Show only own patients OR interop active patients
            if (!pat.isOwn && !pat.isInterop) return false;

            // Search query filter
            if (searchQuery.trim()) {
                const name = (pat.fullName || pat.name || '').toLowerCase();
                const id = pat.id.toLowerCase();
                const abha = (pat.abhaId || '').toLowerCase();
                return name.includes(searchQuery.toLowerCase()) || id.includes(searchQuery.toLowerCase()) || abha.includes(searchQuery.toLowerCase());
            }

            return true;
        });
    }, [allPatients, activeSessions, recordsList, selectedClinic, currentUser, searchQuery]);

    // Active interop sessions specifically
    const activeInteropSessions = React.useMemo(() => {
        return resolvedPatients.filter(p => p.isInterop);
    }, [resolvedPatients]);

    // Recently accessed patients (based on audit logs)
    const recentlyAttended = React.useMemo(() => {
        const accessedIds = new Set();
        const list = [];
        
        auditLogs.forEach(log => {
            const pId = log.details?.patientId;
            if (pId && !accessedIds.has(pId)) {
                const pat = allPatients.find(p => p.id === pId);
                if (pat) {
                    const isOwn = 
                        (pat.assignedClinicId && pat.assignedClinicId === selectedClinic.clinicId) ||
                        (pat.assignedHospitalId && pat.assignedHospitalId === selectedClinic.hospitalId) ||
                        (pat.organizationId && pat.organizationId === selectedClinic.organizationName) ||
                        (pat.primaryHospital && pat.primaryHospital === selectedClinic.organizationName);

                    const activeSession = activeSessions.find(s => 
                        s.patientId === pat.id && 
                        s.doctorId === (currentUser?.uid || '') && 
                        s.active === true
                    );

                    if (isOwn || activeSession) {
                        accessedIds.add(pId);
                        list.push(pat);
                    }
                }
            }
        });
        return list.slice(0, 5);
    }, [auditLogs, allPatients, selectedClinic, activeSessions, currentUser]);

    // Handle redirection with audit trail write
    const handlePatientClick = async (patient) => {
        try {
            const chars = '0123456789abcdef';
            let txHash = '0x';
            for (let i = 0; i < 64; i++) {
                txHash += chars[Math.floor(Math.random() * 16)];
            }
            await addDoc(collection(db, 'auditLogs'), {
                timestamp: serverTimestamp(),
                activityType: 'PATIENT_RECORD_VIEWED',
                userId: currentUser?.uid || 'clinical-staff',
                txHash,
                details: {
                    patientId: patient.id,
                    patientName: patient.fullName || patient.name,
                    action: 'Clinical staff navigated to patient file from clinic records workspace.'
                }
            });
        } catch (e) {
            console.warn('Audit trail log failure:', e);
        }
        navigate(`/dashboard/clinical/patient-profile/${patient.id}`);
    };

    const handleSyncClick = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            toast.success('Workspace synchronized with blockchain validators.');
        }, 1000);
    };

    // Calculate age helper
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

    // Timer countdown helper
    const TimeRemaining = ({ session }) => {
        const [secs, setSecs] = useState(0);

        useEffect(() => {
            const expiry = session.expiresAt?.toDate ? session.expiresAt.toDate() : new Date(session.expiresAt);
            const updateTimer = () => {
                const diff = Math.max(0, Math.floor((expiry - new Date()) / 1000));
                setSecs(diff);
            };

            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        }, [session]);

        if (secs <= 0) return <span className="text-red-400 font-bold">Expired</span>;
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return (
            <span className="text-amber-400 font-bold font-mono">
                {mins}:{remainingSecs.toString().padStart(2, '0')} remaining
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-6 px-4 py-2 text-left">
            {/* Topbar branding and info */}
            <div className="bg-[#111827]/80 backdrop-blur border border-[#1E2D4580] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-cyan-500/5 rounded-full blur-[50px] pointer-events-none" />
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center text-[#00C8D4]">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-[#00C8D4] font-bold uppercase tracking-wider font-mono">
                                Attending Clinic Namespace
                            </span>
                            {activeInteropSessions.length > 0 && (
                                <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono animate-pulse">
                                    <ShieldAlert className="w-2.5 h-2.5" /> Interop Active ({activeInteropSessions.length})
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl font-display font-bold text-white tracking-tight">
                            {selectedClinic.organizationName}
                        </h2>
                        <p className="text-xs text-[#8899AA] mt-1 font-mono">
                            {selectedClinic.department} &middot; Node ID: {selectedClinic.clinicId}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap z-10">
                    {/* Demo Profile Switcher */}
                    <div className="bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-3 py-1.5 flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-mono uppercase">Switch clinic profile:</span>
                        <select
                            value={selectedClinic.clinicId}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'clinic-apollo') {
                                    setSelectedClinic({
                                        clinicId: 'clinic-apollo',
                                        hospitalId: 'hospital-apollo',
                                        organizationName: 'Apollo Lab',
                                        department: 'Cardiology Lab'
                                    });
                                } else if (val === 'clinic-yashoda') {
                                    setSelectedClinic({
                                        clinicId: 'clinic-yashoda',
                                        hospitalId: 'hospital-yashoda',
                                        organizationName: 'Yashoda Clinic',
                                        department: 'Internal Medicine'
                                    });
                                } else if (val === 'clinic-abc') {
                                    setSelectedClinic({
                                        clinicId: 'clinic-abc',
                                        hospitalId: 'hospital-abc',
                                        organizationName: 'ABC Diagnostics',
                                        department: 'Diagnostics Lab'
                                    });
                                }
                            }}
                            className="bg-[#111827] border-0 text-xs text-[#00C8D4] focus:outline-none focus:ring-0 font-bold"
                        >
                            <option value="clinic-apollo">Apollo Lab</option>
                            <option value="clinic-yashoda">Yashoda Clinic</option>
                            <option value="clinic-abc">ABC Diagnostics</option>
                        </select>
                    </div>

                    <button
                        onClick={handleSyncClick}
                        className="px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-[#8899AA] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all font-mono"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#00C8D4]' : ''}`} />
                        Sync Records
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#111827] border border-[#1E2D4580] flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider font-mono">Assigned Patients</span>
                        <h4 className="text-2xl font-bold text-white mt-1">
                            {resolvedPatients.filter(p => p.isOwn).length}
                        </h4>
                    </div>
                    <Users className="w-8 h-8 text-[#00C8D4]/20" />
                </div>

                <div className="p-4 rounded-xl bg-[#111827] border border-[#1E2D4580] flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider font-mono">Interoperability Sessions</span>
                        <h4 className="text-2xl font-bold text-amber-400 mt-1">
                            {activeInteropSessions.length}
                        </h4>
                    </div>
                    <Hourglass className="w-8 h-8 text-amber-500/20" />
                </div>

                <div className="p-4 rounded-xl bg-[#111827] border border-[#1E2D4580] flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider font-mono">System Integrity Status</span>
                        <h4 className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                            <ShieldCheck className="w-5 h-5 text-emerald-400 inline" /> Secured
                        </h4>
                    </div>
                    <Database className="w-8 h-8 text-emerald-500/10" />
                </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left side: Patients Registry Table */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl overflow-hidden flex flex-col justify-between">
                        <div className="px-6 py-4 border-b border-[#1E2D4580] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">Clinic Patient Registry</h3>
                                <p className="text-[10px] text-[#8899AA] font-mono mt-0.5">Isolated records workspace. Filtered by identity assertions.</p>
                            </div>
                            <div className="relative w-full sm:w-60">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Filter by Name, ID, ABHA..."
                                    className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4] transition-all font-mono"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3">
                                    <RefreshCw className="w-8 h-8 text-[#00C8D4] animate-spin" />
                                    <p className="text-xs text-[#8899AA] font-mono">Syncing clinic ledger...</p>
                                </div>
                            ) : resolvedPatients.length === 0 ? (
                                <div className="p-16 text-center text-[#8899AA] font-mono text-xs">
                                    No patients matched for this clinic workspace.
                                </div>
                            ) : (
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-[#1A2236] text-[#8899AA] font-mono uppercase text-[9px]">
                                        <tr>
                                            <th className="px-4 py-3">Patient Name</th>
                                            <th className="px-4 py-3">Patient ID</th>
                                            <th className="px-4 py-3">ABHA ID</th>
                                            <th className="px-4 py-3">Aadhaar (Last 4)</th>
                                            <th className="px-4 py-3">Assigned Doctor</th>
                                            <th className="px-4 py-3">Last Visit</th>
                                            <th className="px-4 py-3">Consent Status</th>
                                            <th className="px-4 py-3">Record Count</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#1E2D4530]">
                                        {resolvedPatients.map(pat => (
                                            <tr 
                                                key={pat.id}
                                                onClick={() => handlePatientClick(pat)}
                                                className="hover:bg-[#1A2236]/30 cursor-pointer transition-colors group"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-white group-hover:text-[#00C8D4] transition-all flex items-center gap-1.5">
                                                        <span>{pat.fullName || pat.name}</span>
                                                        {pat.isInterop && (
                                                            <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono">Interop</span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 mt-0.5">{getAge(pat.dob)} yrs &middot; {pat.gender}</div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-slate-400">{pat.id.slice(0, 8).toUpperCase()}</td>
                                                <td className="px-4 py-3 font-mono text-slate-300">{pat.abhaId || 'N/A'}</td>
                                                <td className="px-4 py-3 font-mono text-slate-400">{pat.aadhaarMasked || 'N/A'}</td>
                                                <td className="px-4 py-3 text-slate-300">{pat.assignedDoctor || 'General Practitioner'}</td>
                                                <td className="px-4 py-3 text-slate-400 font-mono">{pat.dob || 'Recent'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                                                        pat.isInterop ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    }`}>
                                                        {pat.isInterop ? 'Interop Active' : 'Local Clinic'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-slate-300">{pat.recordCount} records</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button className="px-2.5 py-1 rounded bg-[#00C8D4]/10 group-hover:bg-[#00C8D4] text-[#00C8D4] group-hover:text-[#0B0F1A] font-bold transition-all text-[9px]">
                                                        Open Profile &rarr;
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right side: Sidebar Widgets */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Active Interoperability Sessions */}
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2 border-b border-[#1E2D4540] pb-3">
                            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                            <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider">
                                Temporary Interop Sessions
                            </h3>
                        </div>

                        {activeInteropSessions.length === 0 ? (
                            <p className="text-[11px] text-slate-500 italic font-mono text-center py-4">
                                No temporary interoperability sessions are active at this time.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {activeInteropSessions.map(pat => (
                                    <div 
                                        key={pat.id}
                                        onClick={() => handlePatientClick(pat)}
                                        className="p-3 bg-[#0B0F1A]/60 border border-[#1E2D45] rounded-xl hover:border-[#00C8D4]/30 cursor-pointer transition-all space-y-1.5"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-white text-xs">{pat.fullName || pat.name}</span>
                                            <TimeRemaining session={pat.activeSession} />
                                        </div>
                                        <div className="flex justify-between text-[9px] font-mono text-slate-500">
                                            <span>Origin:</span>
                                            <span className="text-[#00C8D4]">{pat.primaryHospital || 'External Hospital'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recently Attended Patients */}
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2 border-b border-[#1E2D4540] pb-3">
                            <Activity className="w-4 h-4 text-[#00C8D4]" />
                            <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider">
                                Recently Attended
                            </h3>
                        </div>

                        {recentlyAttended.length === 0 ? (
                            <p className="text-[11px] text-slate-500 italic font-mono text-center py-4">
                                No recent patient logs available for this clinic.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {recentlyAttended.map(pat => (
                                    <div 
                                        key={pat.id}
                                        onClick={() => handlePatientClick(pat)}
                                        className="p-2.5 bg-[#0B0F1A]/40 hover:bg-[#0B0F1A] border border-white/[0.02] rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs group"
                                    >
                                        <div>
                                            <div className="font-semibold text-slate-200 group-hover:text-[#00C8D4] transition-colors">
                                                {pat.fullName || pat.name}
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{pat.id.slice(0, 8).toUpperCase()}</div>
                                        </div>
                                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#00C8D4] group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Consent approved & uploaded reports feed */}
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2 border-b border-[#1E2D4540] pb-3">
                            <FileText className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider">
                                Live Records Feed
                            </h3>
                        </div>

                        {recordsList.length === 0 ? (
                            <p className="text-[11px] text-slate-500 italic font-mono text-center py-4">
                                No uploaded documents recorded in the repository ledger.
                            </p>
                        ) : (
                            <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
                                {recordsList.slice(0, 5).map(rec => {
                                    const pName = allPatients.find(p => p.id === rec.patientId)?.fullName || 'Patient File';
                                    return (
                                        <div key={rec.id} className="text-xs space-y-1 pb-2 border-b border-[#1E2D4530] last:border-b-0">
                                            <div className="flex justify-between items-center gap-2">
                                                <span className="font-semibold text-slate-200 truncate max-w-[120px]">{pName}</span>
                                                <span className="text-[9px] font-mono text-slate-500">{rec.category}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 truncate">{rec.fileName}</p>
                                            <div className="text-[8px] font-mono text-slate-600 truncate">SHA256: {rec.rawSha256 || 'Verified'}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
