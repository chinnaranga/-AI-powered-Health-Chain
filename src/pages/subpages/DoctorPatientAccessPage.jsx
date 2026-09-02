import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Key, Search, Shield, Lock, Unlock, Clock, FileText, AlertTriangle, CheckCircle, ChevronRight, Loader2, X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { accessRequestService } from '../../services/accessRequestService';
import { toast } from '../../components/Toast';

// RecordList removed, replaced with a direct link to the Patient Records Vault

export default function DoctorPatientAccessPage() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [patientId, setPatientId] = useState('');
    const [searchedId, setSearchedId] = useState('');
    const [status, setStatus] = useState('IDLE'); // IDLE, CHECKING, NO_REQUEST, PENDING, APPROVED (Needs OTP), HAS_ACCESS
    const [activeRequest, setActiveRequest] = useState(null);
    const [otpCode, setOtpCode] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            const currentToken = localStorage.getItem('hc_token');
            if (user) {
                setCurrentUser(user);
            } else if (currentToken) {
                setCurrentUser({ uid: currentToken, email: 'clinical@healthchain.com', displayName: 'Clinical Staff' });
            } else {
                setCurrentUser(null);
            }
        });

        const currentToken = localStorage.getItem('hc_token');
        if (currentToken) {
            setCurrentUser({ uid: currentToken, email: 'clinical@healthchain.com', displayName: 'Clinical Staff' });
        }

        return () => unsub();
    }, []);

    // Listen to active request if it's pending
    useEffect(() => {
        if (activeRequest && activeRequest.status === 'pending') {
            const unsub = accessRequestService.listenToDoctorRequest(activeRequest.id, (updatedReq) => {
                if (updatedReq.status === 'approved') {
                    setActiveRequest(updatedReq);
                    setStatus('APPROVED');
                } else if (updatedReq.status === 'rejected') {
                    setActiveRequest(null);
                    setStatus('NO_REQUEST');
                    toast.error('Patient rejected your access request.');
                }
            });
            return () => unsub();
        }
    }, [activeRequest]);

    // Real-time listener for active sessions when access has been granted
    useEffect(() => {
        if (status === 'HAS_ACCESS' && currentUser && searchedId) {
            const q = query(
                collection(db, 'activeSessions'),
                where('doctorId', '==', currentUser.uid),
                where('patientId', '==', searchedId),
                where('active', '==', true)
            );
            const unsub = onSnapshot(q, (snap) => {
                let hasValidSession = false;
                if (!snap.empty) {
                    const sessionData = snap.docs[0].data();
                    const expiry = sessionData.expiresAt?.toDate ? sessionData.expiresAt.toDate() : new Date(sessionData.expiresAt);
                    if (expiry > new Date()) {
                        hasValidSession = true;
                    }
                }
                if (!hasValidSession) {
                    toast.info('Your active secure session has ended or was revoked.');
                    setStatus('NO_REQUEST');
                }
            });
            return () => unsub();
        }
    }, [status, currentUser, searchedId]);

    const resolvePatientDetails = async (searchTerm) => {
        if (!searchTerm) return { uid: null, globalPatientId: null, email: null, phone: null, fullName: null };
        const rawTerm = searchTerm.trim();
        const lowerTerm = rawTerm.toLowerCase();
        const upperTerm = rawTerm.toUpperCase();
        const cleanPhone = rawTerm.replace(/[^0-9]/g, '');

        let resolved = {
            uid: rawTerm,
            globalPatientId: rawTerm.startsWith('HCG-') ? rawTerm : null,
            email: rawTerm.includes('@') ? lowerTerm : null,
            phone: cleanPhone.length >= 8 ? cleanPhone : null,
            fullName: !rawTerm.includes('@') && !rawTerm.startsWith('HCG-') && cleanPhone.length < 8 ? rawTerm : null
        };

        // 1. Direct UID check in users collection
        try {
            const snap = await getDoc(doc(db, 'users', rawTerm));
            if (snap.exists()) {
                const d = snap.data();
                return {
                    uid: snap.id,
                    globalPatientId: d.globalPatientId || snap.id,
                    email: d.email || '',
                    phone: d.phone || '',
                    fullName: d.fullName || d.displayName || ''
                };
            }
        } catch (e) {}

        // 2. Comprehensive Multi-Attribute Search in users & patients collections
        try {
            const usersSnap = await getDocs(query(collection(db, 'users')));
            for (const docSnap of usersSnap.docs) {
                const d = docSnap.data();
                const docEmail = (d.email || '').toLowerCase();
                const docPhone = (d.phone || '').replace(/[^0-9]/g, '');
                const docEmergencyPhone = (d.emergencyContactPhone || '').replace(/[^0-9]/g, '');
                const docName = (d.fullName || d.displayName || d.name || '').toLowerCase();
                const docGlobalId = (d.globalPatientId || '').toUpperCase();
                const docAbhaId = (d.abhaId || '').toUpperCase();
                const docPatientId = (d.patientId || '').toUpperCase();
                const docAccessCode = d.accessCode ? String(d.accessCode) : '';

                const matchesEmail = rawTerm.includes('@') && docEmail === lowerTerm;
                const matchesPhone = cleanPhone.length >= 8 && (docPhone.includes(cleanPhone.slice(-8)) || docEmergencyPhone.includes(cleanPhone.slice(-8)));
                const matchesName = rawTerm.length >= 3 && !rawTerm.includes('@') && docName.includes(lowerTerm);
                const matchesGlobalId = docGlobalId === upperTerm;
                const matchesAbha = docAbhaId === upperTerm;
                const matchesPatientId = docPatientId === upperTerm;
                const matchesCode = docAccessCode === rawTerm;
                const matchesDocId = docSnap.id === rawTerm;

                if (matchesEmail || matchesPhone || matchesName || matchesGlobalId || matchesAbha || matchesPatientId || matchesCode || matchesDocId) {
                    return {
                        uid: docSnap.id,
                        globalPatientId: d.globalPatientId || docSnap.id,
                        email: d.email || '',
                        phone: d.phone || '',
                        fullName: d.fullName || d.displayName || ''
                    };
                }
            }

            const patientsSnap = await getDocs(query(collection(db, 'patients')));
            for (const docSnap of patientsSnap.docs) {
                const d = docSnap.data();
                const docEmail = (d.email || '').toLowerCase();
                const docPhone = (d.phone || '').replace(/[^0-9]/g, '');
                const docName = (d.fullName || d.name || '').toLowerCase();
                const docGlobalId = (d.globalPatientId || '').toUpperCase();
                const docPatientId = (d.patientId || '').toUpperCase();

                const matchesEmail = rawTerm.includes('@') && docEmail === lowerTerm;
                const matchesPhone = cleanPhone.length >= 8 && docPhone.includes(cleanPhone.slice(-8));
                const matchesName = rawTerm.length >= 3 && !rawTerm.includes('@') && docName.includes(lowerTerm);
                const matchesGlobalId = docGlobalId === upperTerm;
                const matchesPatientId = docPatientId === upperTerm;

                if (matchesEmail || matchesPhone || matchesName || matchesGlobalId || matchesPatientId) {
                    return {
                        uid: d.uid || docSnap.id,
                        globalPatientId: d.globalPatientId || docSnap.id,
                        email: d.email || '',
                        phone: d.phone || '',
                        fullName: d.fullName || d.name || ''
                    };
                }
            }
        } catch (e) {
            console.warn('[DoctorAccess] User lookup notice:', e.message);
        }

        return resolved;
    };

    const [resolvedPatient, setResolvedPatient] = useState(null);

    const checkAccess = async (searchTerm) => {
        if (!searchTerm || !currentUser) return;
        setLoading(true);
        setStatus('CHECKING');
        
        const details = await resolvePatientDetails(searchTerm);
        const uid = details.uid || searchTerm;
        setResolvedPatient(details);
        setSearchedId(uid);

        try {
            // 1. Check Active Session
            const hasSession = await accessRequestService.checkActiveSession(currentUser.uid, uid);
            if (hasSession) {
                setStatus('HAS_ACCESS');
                setLoading(false);
                return;
            }

            // 2. Check Pending/Approved Requests (check across all patient identifiers)
            const q = query(
                collection(db, 'accessRequests'),
                where('doctorId', '==', currentUser.uid)
            );
            const snap = await getDocs(q);
            const searchIds = [
                uid, details.globalPatientId, details.email?.toLowerCase(), 
                details.phone, details.fullName?.toLowerCase(), searchTerm.toLowerCase()
            ].filter(Boolean);

            const requests = snap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(r => {
                    const reqPatientId = (r.patientId || '').toLowerCase();
                    const reqGlobalId = (r.globalPatientId || '').toLowerCase();
                    const reqEmail = (r.patientEmail || '').toLowerCase();
                    const reqPhone = (r.patientPhone || '').replace(/[^0-9]/g, '');
                    const reqName = (r.patientName || '').toLowerCase();

                    return searchIds.some(id => {
                        const cleanId = id.replace(/[^0-9]/g, '');
                        return (
                            id === reqPatientId ||
                            id === reqGlobalId ||
                            id === reqEmail ||
                            (reqName && reqName.includes(id)) ||
                            (cleanId.length >= 8 && reqPhone.includes(cleanId.slice(-8)))
                        );
                    });
                });
            
            // Find most relevant request
            const approvedReq = requests.find(r => r.status === 'approved');
            const pendingReq = requests.find(r => r.status === 'pending');

            if (approvedReq) {
                const otpRef = doc(db, 'otpSessions', approvedReq.id);
                const otpSnap = await getDoc(otpRef);
                let isOtpValid = false;
                if (otpSnap.exists()) {
                    const otpData = otpSnap.data();
                    const expiresAt = otpData.expiresAt?.toDate ? otpData.expiresAt.toDate() : new Date(otpData.expiresAt);
                    if (otpData.active && expiresAt > new Date()) {
                        isOtpValid = true;
                    }
                }

                if (isOtpValid) {
                    setActiveRequest(approvedReq);
                    setStatus('APPROVED');
                } else {
                    try {
                        const requestRef = doc(db, 'accessRequests', approvedReq.id);
                        await updateDoc(requestRef, { status: 'expired' });
                    } catch (err) {
                        console.warn('Failed to auto-expire request:', err);
                    }

                    if (pendingReq) {
                        setActiveRequest(pendingReq);
                        setStatus('PENDING');
                    } else {
                        setStatus('NO_REQUEST');
                    }
                }
            } else if (pendingReq) {
                setActiveRequest(pendingReq);
                setStatus('PENDING');
            } else {
                setStatus('NO_REQUEST');
            }
        } catch (error) {
            console.error('Error checking access:', error);
            toast.error('Failed to verify access status.');
            setStatus('IDLE');
        }
        setLoading(false);
    };

    const handleRequestAccess = async () => {
        setLoading(true);
        try {
            const reqId = await accessRequestService.createRequest(currentUser, searchedId, {
                hospital: currentUser?.hospital || 'HealthChain Central',
                department: currentUser?.department || 'General Medicine',
                reason: 'Standard Medical Consultation',
                duration: '1 hour',
                urgency: 'Normal',
                globalPatientId: resolvedPatient?.globalPatientId || (searchedId.startsWith('HCG-') ? searchedId : null),
                patientEmail: resolvedPatient?.email || (searchedId.includes('@') ? searchedId.toLowerCase() : null),
                patientPhone: resolvedPatient?.phone || null,
                patientName: resolvedPatient?.fullName || null
            });
            setActiveRequest({ id: reqId, status: 'pending' });
            setStatus('PENDING');
            toast.success('Access request sent to patient.');
        } catch (error) {
            toast.error('Failed to send request.');
        }
        setLoading(false);
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otpCode.length !== 6) return toast.error('OTP must be 6 digits.');
        
        setLoading(true);
        try {
            await accessRequestService.verifyOTPAndGrantAccess(activeRequest.id, otpCode, currentUser.uid);
            toast.success('Access Granted! Session active.');
            setStatus('HAS_ACCESS');
        } catch (error) {
            toast.error(error.message || 'Invalid or expired OTP.');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-[#8B5CF6]" />
                    <span className="text-[10px] text-[#8B5CF6] font-bold uppercase tracking-widest">Secure Gateway</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-white">Patient Access Portal</h2>
                <p className="text-sm text-[#8899AA] mt-1">
                    Request access and verify OTP via Patient Email, Phone Number, Name, or Global ID.
                </p>
            </div>

            {/* Search Box */}
            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 mb-6">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A5568]" />
                        <input
                            value={patientId}
                            onChange={e => setPatientId(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && checkAccess(patientId)}
                            placeholder="Enter Patient Email, Phone, Name, or Global ID (HCG-XXXXXXXX)..."
                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl pl-12 pr-4 py-3 text-white placeholder-[#4A5568] focus:border-[#8B5CF6]/50 transition-all text-sm font-mono"
                        />
                    </div>
                    <button onClick={() => checkAccess(patientId)} disabled={!patientId || loading}
                        className="px-6 py-3 rounded-xl bg-[#8B5CF6] text-white font-bold hover:bg-[#9333EA] transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                        {loading && status === 'CHECKING' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Check Access'}
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {status === 'NO_REQUEST' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-8 text-center">
                        <Lock className="w-12 h-12 text-[#4A5568] mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Access Required</h3>
                        <p className="text-sm text-[#8899AA] mb-6 max-w-md mx-auto">
                            You do not currently have an active session or pending request for patient <span className="font-mono text-[#8B5CF6]">{searchedId}</span>.
                        </p>
                        <button onClick={handleRequestAccess} disabled={loading}
                            className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all flex items-center gap-2 mx-auto">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                            Request Access
                        </button>
                    </motion.div>
                )}

                {status === 'PENDING' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/50" />
                        <Clock className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-pulse" />
                        <h3 className="text-xl font-bold text-amber-400 mb-2">Request Pending</h3>
                        <p className="text-sm text-[#8899AA] max-w-md mx-auto">
                            An access request has been sent to the patient. Waiting for them to approve and generate an OTP.
                        </p>
                    </motion.div>
                )}

                {status === 'APPROVED' && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="bg-[#111827] border border-[#8B5CF6]/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
                        <div className="text-center mb-6">
                            <Key className="w-12 h-12 text-[#8B5CF6] mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Request Approved</h3>
                            <p className="text-sm text-[#8899AA]">The patient has approved your request. Enter the 6-digit OTP from the patient to unlock records.</p>
                        </div>
                        <form onSubmit={handleVerifyOTP} className="max-w-xs mx-auto">
                            <input
                                type="text"
                                maxLength={6}
                                value={otpCode}
                                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="• • • • • •"
                                className="w-full bg-[#0B0F1A] border border-[#8B5CF6]/50 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] text-white font-mono focus:border-[#8B5CF6] transition-all mb-4"
                            />
                            <button type="submit" disabled={otpCode.length !== 6 || loading}
                                className="w-full py-3 rounded-xl bg-[#8B5CF6] text-white font-bold hover:bg-[#9333EA] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Unlock className="w-5 h-5" />}
                                Verify & Access
                            </button>
                        </form>
                    </motion.div>
                )}

                {status === 'HAS_ACCESS' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="space-y-6">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-emerald-400 font-bold text-lg">Secure Session Active</h3>
                                    <p className="text-xs text-[#8899AA] font-mono mt-1">Patient: {searchedId}</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-500/30">
                                Verified via OTP
                            </span>
                        </div>

                            <div className="mt-6 flex flex-col items-center justify-center p-8 border border-[#1E2D4580] rounded-2xl bg-[#0B0F1A]">
                                <FileText className="w-12 h-12 text-[#8B5CF6] mb-4" />
                                <h3 className="text-white font-bold mb-2">Access Granted</h3>
                                <p className="text-sm text-[#8899AA] mb-6 text-center max-w-md">
                                    You have an active secure session for this patient. You can now view their full medical history, clinical summaries, and reports.
                                </p>
                                <button 
                                    onClick={() => navigate(`/dashboard/doctor/records?patientId=${searchedId}`)}
                                    className="px-8 py-3.5 rounded-xl bg-[#8B5CF6] text-white font-bold hover:bg-[#9333EA] transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                                >
                                    Open Patient Records Vault <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
