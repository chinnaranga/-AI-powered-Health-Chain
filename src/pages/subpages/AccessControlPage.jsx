import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { toast } from '../../components/Toast';
import { accessRequestService } from '../../services/accessRequestService';
import {
    Shield, Key, Users, Trash2, Copy, CheckCircle, Clock, Lock,
    Zap, Fingerprint, UserCheck, Radio, AlertTriangle, XCircle, Activity,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';

/* ───── KPI Summary Cards ───── */
function KPISummary({ activeSessionsCount, pendingCount }) {
    const kpis = [
        { label: 'Active Sessions', value: activeSessionsCount.toString(), icon: Radio, color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/20', pulse: activeSessionsCount > 0 },
        { label: 'Pending Requests', value: pendingCount.toString(), icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', pulse: pendingCount > 0 },
        { label: 'Authorized Providers', value: activeSessionsCount.toString(), icon: UserCheck, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        { label: 'Security Level', value: 'High', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', isBadge: true },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpis.map((k, i) => (
                <motion.div
                    key={k.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 hover:border-[#00C8D4]/30 transition-all duration-300"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl ${k.bg} border ${k.border} flex items-center justify-center relative`}>
                            <k.icon className={`w-5 h-5 ${k.color}`} />
                            {k.pulse && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]" />}
                        </div>
                    </div>
                    <p className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-1">{k.label}</p>
                    {k.isBadge ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-1">
                            <ShieldCheck className="w-3 h-3" />
                            {k.value}
                        </span>
                    ) : (
                        <p className="text-2xl font-bold text-white font-display">{k.value}</p>
                    )}
                </motion.div>
            ))}
        </div>
    );
}

/* ───── PAGE ───── */
const AccessControlPage = () => {
    const [userId, setUserId] = useState(null);
    const [requests, setRequests] = useState([]);
    const [otpSessions, setOtpSessions] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [processingId, setProcessingId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [currentTime, setCurrentTime] = useState(Date.now() / 1000);
    const [selfAccessCode, setSelfAccessCode] = useState(null);

    // Listen to patient's own self-generated accessCode
    useEffect(() => {
        if (!userId) return;
        const userRef = doc(db, 'users', userId);
        const unsub = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
                setSelfAccessCode(snap.data().accessCode || null);
            }
        });
        return () => unsub();
    }, [userId]);

    // 1. Auth state
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setUserId(user?.uid ?? null);
        });
        return () => unsub();
    }, []);

    // Timer for ticking expiration
    useEffect(() => {
        const t = setInterval(() => setCurrentTime(Date.now() / 1000), 1000);
        return () => clearInterval(t);
    }, []);

    // 2. Listen to Access Requests
    useEffect(() => {
        if (!userId) return;
        const unsub = accessRequestService.listenToPatientRequests(userId, (fetchedRequests) => {
            setRequests(fetchedRequests);
        });
        return () => unsub();
    }, [userId]);

    // 3. Listen to OTP Sessions for this patient
    useEffect(() => {
        if (!userId) return;
        const q = query(collection(db, 'otpSessions'), where('patientId', '==', userId), where('active', '==', true));
        const unsub = onSnapshot(q, (snap) => {
            setOtpSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, [userId]);

    // 4. Listen to Active Sessions
    useEffect(() => {
        if (!userId) return;
        const q = query(collection(db, 'activeSessions'), where('patientId', '==', userId), where('active', '==', true));
        const unsub = onSnapshot(q, (snap) => {
            setActiveSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, [userId]);

    const handleApprove = async (requestId) => {
        setProcessingId(requestId);
        try {
            await accessRequestService.approveRequestAndGenerateOTP(requestId, userId);
            toast.success('Request approved. OTP generated.');
        } catch (err) {
            toast.error('Failed to approve request.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (requestId) => {
        setProcessingId(requestId);
        try {
            await accessRequestService.rejectRequest(requestId, userId);
            toast.success('Request rejected.');
        } catch (err) {
            toast.error('Failed to reject request.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleRevokeSession = async (sessionId) => {
        setProcessingId(sessionId);
        try {
            await accessRequestService.revokeActiveSession(sessionId, userId);
            toast.success('Connection successfully revoked and terminated.');
        } catch (err) {
            toast.error('Failed to revoke active connection.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleRevokeGeneralCode = async () => {
        setProcessingId('general');
        try {
            await accessRequestService.revokeGeneralAccessCode(userId);
            toast.success('General access code cleared.');
        } catch (err) {
            toast.error('Failed to revoke general access code.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedId(code);
        setTimeout(() => setCopiedId(null), 2000);
        toast.success('OTP copied to clipboard');
    };

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const approvedRequests = requests.filter(r => r.status === 'approved');

    const formatTimeLeft = (expiresAtSeconds) => {
        const left = Math.max(0, expiresAtSeconds - currentTime);
        if (left <= 0) return 'Expired';
        const m = Math.floor(left / 60);
        const s = Math.floor(left % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-[#00C8D4]" />
                    <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Consent Engine</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-white">Access Control Center</h2>
                <p className="text-sm text-[#8899AA] mt-1">Review interoperability requests and manage your active security sessions.</p>
            </div>

            <KPISummary activeSessionsCount={activeSessions.length} pendingCount={pendingRequests.length} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Pending Requests Column */}
                <div className="flex flex-col space-y-4">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" /> Action Required ({pendingRequests.length})
                    </h3>
                    
                    <AnimatePresence>
                        {pendingRequests.length === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-12 rounded-2xl bg-[#111827] border border-[#1E2D4580] text-center">
                                <div className="w-12 h-12 rounded-full bg-[#1A2236] flex items-center justify-center mb-3">
                                    <ShieldCheck className="w-6 h-6 text-[#4A5568]" />
                                </div>
                                <p className="text-sm text-white font-medium">No Pending Requests</p>
                                <p className="text-xs text-[#8899AA]">Your medical records are fully secure.</p>
                            </motion.div>
                        )}

                        {pendingRequests.map(req => (
                            <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[#111827] border border-amber-500/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                            <UserCheck className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{req.doctorName}</p>
                                            <p className="text-xs text-[#8899AA]">{req.hospital} · {req.department}</p>
                                        </div>
                                    </div>
                                    {req.urgency === 'Critical / Emergency' && (
                                        <span className="px-2 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase rounded flex items-center gap-1">
                                            <Zap className="w-3 h-3" /> Emergency
                                        </span>
                                    )}
                                </div>
                                
                                <div className="bg-[#0B0F1A] rounded-lg p-3 mb-4 border border-[#1E2D4580]">
                                    <p className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-1">Clinical Reason</p>
                                    <p className="text-sm text-white">{req.reason}</p>
                                    <p className="text-[10px] text-[#4A5568] mt-2 font-mono">Duration requested: {req.duration}</p>
                                </div>

                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleReject(req.id)}
                                        disabled={processingId === req.id}
                                        className="flex-1 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all disabled:opacity-50">
                                        <XCircle className="w-4 h-4" /> Deny
                                    </button>
                                    <button 
                                        onClick={() => handleApprove(req.id)}
                                        disabled={processingId === req.id}
                                        className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0B0F1A] text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50">
                                        <CheckCircle className="w-4 h-4" /> Approve
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Active OTPs & Sessions Column */}
                <div className="flex flex-col space-y-4">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 mb-2">
                        <Key className="w-4 h-4 text-[#00C8D4]" /> Active OTP Sessions
                    </h3>

                    <AnimatePresence>
                        {selfAccessCode && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[#111827] border border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(16,185,129,0.05)] text-center relative overflow-hidden mb-4">
                                
                                <div className="flex items-center justify-center gap-1.5 mb-4">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Your General Access OTP</span>
                                </div>

                                <p className="text-sm text-[#8899AA] mb-4">Give this active code to a clinician to grant temporary access</p>

                                <div 
                                    onClick={() => handleCopy(selfAccessCode)}
                                    className="text-4xl font-mono font-bold text-emerald-400 tracking-[0.3em] bg-emerald-500/5 py-6 rounded-xl border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/10 transition-all">
                                    {selfAccessCode}
                                </div>

                                <div className="flex gap-3 mt-4">
                                    <button 
                                        onClick={() => handleCopy(selfAccessCode)}
                                        className="flex-1 py-2.5 rounded-lg border border-[#1E2D4580] text-white hover:border-emerald-500/50 hover:text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition-all">
                                        {copiedId === selfAccessCode ? <><CheckCircle className="w-4 h-4"/> Copied</> : <><Copy className="w-4 h-4"/> Copy Code</>}
                                    </button>
                                    <button 
                                        onClick={handleRevokeGeneralCode}
                                        disabled={processingId === 'general'}
                                        className="py-2.5 px-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50">
                                        <XCircle className="w-3.5 h-3.5" /> Revoke
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {otpSessions.length === 0 && !selfAccessCode && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-12 rounded-2xl bg-[#111827] border border-[#1E2D4580] text-center">
                                <div className="w-12 h-12 rounded-full bg-[#1A2236] flex items-center justify-center mb-3">
                                    <Key className="w-6 h-6 text-[#4A5568]" />
                                </div>
                                <p className="text-sm text-white font-medium">No Active OTPs</p>
                                <p className="text-xs text-[#8899AA]">Approve a request to generate a secure OTP.</p>
                            </motion.div>
                        )}

                        {otpSessions.map(otp => {
                            const req = approvedRequests.find(r => r.id === otp.requestId);
                            const expiresAtSeconds = otp.expiresAt?.seconds || 0;
                            return (
                                <motion.div key={otp.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-[#111827] border border-[#00C8D4]/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(0,200,212,0.05)] text-center relative overflow-hidden">
                                    
                                    <div className="flex items-center justify-center gap-1.5 mb-4">
                                        <span className="w-2 h-2 rounded-full bg-[#00C8D4] animate-pulse" />
                                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Share this OTP with Provider</span>
                                    </div>

                                    {req && <p className="text-sm text-[#8899AA] mb-4">Requested by: <span className="text-white font-semibold">{req.doctorName}</span></p>}

                                    <div 
                                        onClick={() => handleCopy(otp.code)}
                                        className="text-4xl font-mono font-bold text-[#00C8D4] tracking-[0.3em] bg-[#00C8D4]/5 py-6 rounded-xl border border-[#00C8D4]/20 cursor-pointer hover:bg-[#00C8D4]/10 transition-all">
                                        {otp.code}
                                    </div>

                                    <div className="flex items-center justify-between mt-4 text-xs font-mono">
                                        <span className="text-[#8899AA] flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Expires in
                                        </span>
                                        <span className={formatTimeLeft(expiresAtSeconds) === 'Expired' ? 'text-red-400' : 'text-[#00C8D4]'}>
                                            {formatTimeLeft(expiresAtSeconds)}
                                        </span>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleCopy(otp.code)}
                                        className="w-full mt-4 py-2.5 rounded-lg border border-[#1E2D4580] text-white hover:border-[#00C8D4]/50 hover:text-[#00C8D4] text-sm font-bold flex items-center justify-center gap-2 transition-all">
                                        {copiedId === otp.code ? <><CheckCircle className="w-4 h-4"/> Copied</> : <><Copy className="w-4 h-4"/> Copy Code</>}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {activeSessions.length > 0 && (
                        <>
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 mb-2 mt-6">
                                <Radio className="w-4 h-4 text-emerald-400" /> Active Connections
                            </h3>
                            <div className="space-y-3">
                                {activeSessions.map(session => (
                                    <div key={session.id} className="p-4 rounded-xl bg-[#1A2236]/50 border border-emerald-500/30 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                                <Activity className="w-4 h-4 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">Secure Link Active</p>
                                                <p className="text-[10px] text-[#8899AA] font-mono">Session ID: {session.id.slice(0,8)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right hidden sm:block">
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Live</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleRevokeSession(session.id)}
                                                disabled={processingId === session.id}
                                                className="py-1.5 px-3 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all disabled:opacity-50"
                                                title="Revoke Connection"
                                            >
                                                Revoke
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AccessControlPage;
