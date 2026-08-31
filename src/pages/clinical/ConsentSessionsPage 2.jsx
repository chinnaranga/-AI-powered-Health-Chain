import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Key, ShieldCheck, ShieldAlert, Clock, AlertTriangle, 
    RefreshCw, Search, CheckCircle, XCircle, FileText, 
    Database, Eye, User, Calendar, ExternalLink, Activity
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { toast } from '../../components/Toast';
import { accessRequestService } from '../../services/accessRequestService';

// Simulated list of active consent sessions
const INITIAL_SESSIONS = [
    {
        id: 'CS-8891-A',
        patientName: 'Sarah Jenkins',
        patientId: 'PAT-9921',
        department: 'Cardiology',
        scope: 'Full Record Access',
        expiryTime: 42, // minutes left
        verified: true,
        proofHash: '0x7e8fa918b88dcd119c8deee2b8109923838209adbc5e0193bb92cd992837ff2c',
        timestamp: '2026-05-21 08:30:11'
    },
    {
        id: 'CS-1029-B',
        patientName: 'David Miller',
        patientId: 'PAT-3382',
        department: 'Oncology',
        scope: 'Lab Reports Only',
        expiryTime: 118, // minutes left
        verified: true,
        proofHash: '0x12a88fa9001bdc8901fbc348de8829cf93218bf72de0938bb8c983a99283e1c2',
        timestamp: '2026-05-21 07:15:45'
    },
    {
        id: 'CS-4491-C',
        patientName: 'Elena Rostova',
        patientId: 'PAT-5421',
        department: 'Neurology',
        scope: 'Prescription Records',
        expiryTime: 5, // minutes left (soon expiring)
        verified: true,
        proofHash: '0xef8838a7c6e11ba829023bc2de88f013d2f32bb72de0938ffc11a8c992d3fcc3',
        timestamp: '2026-05-21 09:10:00'
    }
];

// Simulated emergency override events logged to the blockchain
const INITIAL_OVERRIDES = [
    {
        id: 'EO-7729',
        patientName: 'Michael Chang',
        patientId: 'PAT-1290',
        authorizedBy: 'Dr. Eleanor Vance',
        reason: 'Acute cardiovascular failure, patient unconscious',
        timestamp: '2026-05-20 14:22:15',
        txHash: '0xbc889fa7cc210ef8c34fbc88972ac83f1293e7fbd6e921dcb5567a2139e88aa1',
        blockNumber: '14,921,803'
    },
    {
        id: 'EO-3381',
        patientName: 'Grace Hopper',
        patientId: 'PAT-0042',
        authorizedBy: 'Dr. James Carter',
        reason: 'Trauma ICU intake, urgent drug allergy verification',
        timestamp: '2026-05-18 22:04:51',
        txHash: '0x33fc9bcf1209ac77b6cde290aef33bc712f5a5ef9876cd1122aef912fbc9821a',
        blockNumber: '14,895,302'
    }
];

export default function ConsentSessionsPage() {
    const { user: currentUser } = useAuthStore();
    const [sessions, setSessions] = useState(INITIAL_SESSIONS);
    const [overrides, setOverrides] = useState(INITIAL_OVERRIDES);
    const [searchQuery, setSearchQuery] = useState('');
    const [verifyingId, setVerifyingId] = useState(null);
    const [selectedProof, setSelectedProof] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filter sessions
    const filteredSessions = sessions.filter(s => 
        s.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Simulate session countdown
    useEffect(() => {
        const interval = setInterval(() => {
            setSessions(prev => 
                prev.map(s => {
                    if (s.expiryTime > 1) {
                        return { ...s, expiryTime: s.expiryTime - 1 };
                    }
                    return s;
                }).filter(s => s.expiryTime > 1)
            );
        }, 60000); // every minute
        return () => clearInterval(interval);
    }, []);

    // Refresh data simulation
    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            toast.success('Consent sessions ledger synchronized with local node.');
        }, 1000);
    };

    // Verify cryptographic signature
    const triggerVerification = (sessionId) => {
        setVerifyingId(sessionId);
        setTimeout(() => {
            setVerifyingId(null);
            setSessions(prev => 
                prev.map(s => s.id === sessionId ? { ...s, verified: true } : s)
            );
            toast.success('ZKP Proof & patient signature verified successfully against local ledger.');
        }, 1200);
    };

    // Revoke access early
    const handleRevoke = (sessionId) => {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        toast.info(`Consent session ${sessionId} revoked and key material flushed.`);
        
        // Log to audit
        if (currentUser) {
            accessRequestService.logAuditActivity('CONSENT_REVOKED_MANUALLY', currentUser.uid, {
                sessionId,
                action: 'Clinical operator manually terminated active consent session',
                operator: currentUser.displayName || currentUser.email || 'Clinical Staff'
            }).catch(console.error);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-2">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 font-display">
                        <Key className="w-6 h-6 text-[#00C8D4]" />
                        Consent Sessions Control
                    </h1>
                    <p className="text-sm text-[#8899AA] mt-1 font-mono">
                        Cryptographic Patient Approvals & Emergency Overrides Audit Panel
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-[#8899AA] hover:text-white rounded-xl text-sm font-medium transition-all duration-200"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#00C8D4]' : ''}`} />
                    Sync Ledger
                </button>
            </div>

            {/* Top overview metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 bg-gradient-to-br from-cyan-950/20 to-[#111827] border border-[#00C8D4]/15 rounded-2xl relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none">
                        <Key className="w-32 h-32 text-[#00C8D4]" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#00C8D4]/10 border border-[#00C8D4]/20 rounded-xl text-[#00C8D4]">
                            <Key className="w-5 h-5" />
                        </div>
                        <span className="text-xs text-[#8899AA] font-semibold tracking-wider uppercase font-mono">Active Consent Keys</span>
                    </div>
                    <p className="text-3xl font-bold text-white mt-4 font-display">{sessions.length}</p>
                    <p className="text-xs text-[#8899AA] mt-2">Active access parameters verified</p>
                </div>

                <div className="p-5 bg-gradient-to-br from-emerald-950/20 to-[#111827] border border-emerald-500/15 rounded-2xl relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none">
                        <ShieldCheck className="w-32 h-32 text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span className="text-xs text-[#8899AA] font-semibold tracking-wider uppercase font-mono">Security State</span>
                    </div>
                    <p className="text-3xl font-bold text-white mt-4 font-display">100%</p>
                    <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> All proofs verified
                    </p>
                </div>

                <div className="p-5 bg-gradient-to-br from-amber-950/20 to-[#111827] border border-amber-500/15 rounded-2xl relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none">
                        <ShieldAlert className="w-32 h-32 text-amber-400" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <span className="text-xs text-[#8899AA] font-semibold tracking-wider uppercase font-mono">Overrides Logged</span>
                    </div>
                    <p className="text-3xl font-bold text-white mt-4 font-display">{overrides.length}</p>
                    <p className="text-xs text-[#8899AA] mt-2">Bypass logs written to chain</p>
                </div>
            </div>

            {/* Active Sessions Grid / Table */}
            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl overflow-hidden backdrop-blur-md">
                <div className="p-6 border-b border-[#1E2D4580] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-white font-display">Attending Consent Keys</h2>
                        <p className="text-xs text-[#8899AA] font-mono mt-0.5">Patient authorized keys holding active medical records decryption rights</p>
                    </div>
                    <div className="relative max-w-sm w-full">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search Sarah, Patient ID, Session..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4] focus:ring-1 focus:ring-[#00C8D4] transition-all font-mono"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#1E2D4530] bg-[#0B0F1A]/50">
                                {['Session ID', 'Patient', 'Scope / Dept', 'Time Left', 'Verification State', 'Cryptographic Proof', 'Actions'].map((h, i) => (
                                    <th key={i} className="px-6 py-4 text-xs font-bold text-[#8899AA] uppercase tracking-wider font-mono">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E2D4520]">
                            <AnimatePresence mode="popLayout">
                                {filteredSessions.length > 0 ? (
                                    filteredSessions.map((session) => (
                                        <motion.tr
                                            key={session.id}
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="hover:bg-white/[0.01] transition-colors"
                                        >
                                            <td className="px-6 py-4.5 whitespace-nowrap">
                                                <span className="text-sm font-bold text-white font-mono">{session.id}</span>
                                            </td>
                                            <td className="px-6 py-4.5 whitespace-nowrap">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center text-[#00C8D4]">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-white">{session.patientName}</div>
                                                        <div className="text-xs text-[#8899AA] font-mono">{session.patientId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4.5 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm text-white font-medium">{session.scope}</div>
                                                    <div className="text-xs text-[#8899AA] font-mono">{session.department}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4.5 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className={`w-4 h-4 ${session.expiryTime <= 10 ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
                                                    <span className={`text-sm font-mono font-semibold ${session.expiryTime <= 10 ? 'text-red-400' : 'text-slate-300'}`}>
                                                        {session.expiryTime} min
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4.5 whitespace-nowrap">
                                                {session.verified ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Checked
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => triggerVerification(session.id)}
                                                        disabled={verifyingId === session.id}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#00C8D4]/10 border border-[#00C8D4]/25 hover:bg-[#00C8D4]/20 text-[#00C8D4] transition-all font-mono"
                                                    >
                                                        {verifyingId === session.id ? (
                                                            <>
                                                                <RefreshCw className="w-3 h-3 animate-spin" /> Verifying...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Activity className="w-3 h-3" /> Check Proof
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4.5 whitespace-nowrap">
                                                <button
                                                    onClick={() => setSelectedProof(session)}
                                                    className="inline-flex items-center gap-1 text-xs text-[#00C8D4] hover:underline font-mono"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> {session.proofHash.slice(0, 10)}...{session.proofHash.slice(-8)}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4.5 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleRevoke(session.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" /> Revoke Key
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-slate-500 font-mono">
                                            No active clinical consent keys found.
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Emergency Override Ledger */}
            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl overflow-hidden backdrop-blur-md">
                <div className="p-6 border-b border-[#1E2D4580]">
                    <div className="flex items-center gap-2 text-white">
                        <ShieldAlert className="w-5 h-5 text-amber-500" />
                        <h2 className="text-lg font-bold font-display">Emergency Access Overrides Ledger</h2>
                    </div>
                    <p className="text-xs text-[#8899AA] font-mono mt-0.5">
                        Immutable blockchain audit records generated when clinical staff bypassed consent in emergency states
                    </p>
                </div>

                <div className="divide-y divide-[#1E2D4530]">
                    {overrides.map((override) => (
                        <div key={override.id} className="p-6 hover:bg-white/[0.005] transition-all duration-200">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <span className="text-sm font-bold text-white font-mono">{override.id}</span>
                                        <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-500 font-mono uppercase tracking-wide">
                                            Consent Bypassed
                                        </span>
                                        <span className="text-xs text-[#8899AA] font-mono flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" /> {override.timestamp}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-200 font-medium">{override.reason}</p>
                                    <div className="flex items-center gap-3 text-xs text-[#8899AA]">
                                        <span>Patient: <strong className="text-slate-300 font-semibold">{override.patientName} ({override.patientId})</strong></span>
                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                        <span>Authorized By: <strong className="text-slate-300 font-semibold">{override.authorizedBy}</strong></span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1.5">
                                    <div className="text-xs font-semibold text-slate-400 font-mono flex items-center gap-1">
                                        <Database className="w-3.5 h-3.5 text-[#00C8D4]" /> Block #{override.blockNumber}
                                    </div>
                                    <a
                                        href={`https://etherscan.io/tx/${override.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-[#8899AA] hover:text-white rounded-lg transition-all font-mono"
                                    >
                                        Tx Receipt <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cryptographic Proof Detail Modal */}
            <AnimatePresence>
                {selectedProof && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#0B0F1A] border border-[#1E2D45] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-[#1E2D45] flex items-center justify-between bg-gradient-to-r from-cyan-950/20 to-transparent">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-[#00C8D4]" />
                                    <h3 className="text-lg font-bold text-white font-display">Cryptographic Proof Envelope</h3>
                                </div>
                                <button
                                    onClick={() => setSelectedProof(null)}
                                    className="text-slate-500 hover:text-white transition-colors text-xl font-bold"
                                >
                                    &times;
                                </button>
                            </div>

                            <div className="p-6 space-y-4.5 font-mono text-xs">
                                <div className="space-y-1">
                                    <div className="text-[#8899AA] font-semibold uppercase tracking-wider">Session Key ID</div>
                                    <div className="p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg text-white">
                                        {selectedProof.id}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-[#8899AA] font-semibold uppercase tracking-wider">Patient ID</div>
                                        <div className="p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg text-slate-300">
                                            {selectedProof.patientId}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[#8899AA] font-semibold uppercase tracking-wider">Authorized Date</div>
                                        <div className="p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg text-slate-300">
                                            {selectedProof.timestamp}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-[#8899AA] font-semibold uppercase tracking-wider">Zero-Knowledge Proof Signature (ZKP Hash)</div>
                                    <div className="p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg text-[#00C8D4] break-all select-all">
                                        {selectedProof.proofHash}
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1.5">
                                    <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                                        <CheckCircle className="w-4 h-4" /> Cryptographic Integrity Check Passed
                                    </div>
                                    <div className="text-slate-400 leading-relaxed font-sans text-xs">
                                        This signature validates that the clinical operator holds a decentralized view permit matching the patient's private access key. The session parameters restrict file visibility to <strong>{selectedProof.scope}</strong> only. All decrypt requests during this timeframe are recorded onto the public ledger block automatically.
                                    </div>
                                </div>
                            </div>

                            <div className="p-4.5 bg-[#111827] border-t border-[#1E2D45] flex justify-end">
                                <button
                                    onClick={() => setSelectedProof(null)}
                                    className="px-4 py-2 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-all"
                                >
                                    Dismiss Details
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
