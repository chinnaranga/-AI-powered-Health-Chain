import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, CheckCircle, Clock, Users, AlertTriangle, Key, Fingerprint,
    Lock, Eye, Trash2, Radio, Activity, Zap, Database, ChevronRight,
    Server, FileText, CheckSquare, XCircle, Unlock
} from 'lucide-react';
import { toast } from '../../components/Toast';
import { db } from '../../firebase/config';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc, getDocs, addDoc } from 'firebase/firestore';
import useAuthStore from '../../store/authStore';
import { userService } from '../../services/userService';

export default function DoctorAccessControlPage() {
    const { user } = useAuthStore();
    const [requests, setRequests] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [emergencyReason, setEmergencyReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!user?.uid) return;

        let unsubRequests;
        
        const init = async () => {
            try {
                // Fetch patients map to resolve names
                const allUsers = await userService.getUsers();
                const userMap = {};
                allUsers.forEach(u => {
                    userMap[u.id] = u.name || u.email || 'Unknown Patient';
                });
                
                const q = query(
                    collection(db, 'accessRequests'),
                    where('doctorId', '==', user.uid)
                );

                unsubRequests = onSnapshot(q, (snapshot) => {
                    const list = snapshot.docs.map(docSnap => {
                        const data = docSnap.data();
                        return {
                            id: docSnap.id,
                            patient: userMap[data.patientId] || data.patientId || 'Unknown Patient',
                            age: data.age || 62, 
                            bloodType: data.bloodType || 'O+', 
                            diagnosis: data.reason || 'Medical Consultation',
                            type: data.urgency === 'Critical / Emergency' ? 'Emergency' : 'OTP',
                            status: data.status === 'used' ? 'active' : data.status, 
                            time: data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleTimeString() : 'Recent',
                            risk: data.urgency || 'Normal',
                            ip: data.hospital || 'HealthChain Central',
                            patientId: data.patientId,
                            ...data
                        };
                    });
                    setRequests(list);
                    if (list.length > 0) {
                        setSelectedId(prev => list.some(r => r.id === prev) ? prev : list[0].id);
                    } else {
                        setSelectedId(null);
                    }
                });
            } catch (err) {
                console.error(err);
            }
        };

        init();

        return () => {
            if (unsubRequests) unsubRequests();
        };
    }, [user?.uid]);

    const selectedRequest = requests.find(r => r.id === selectedId);

    const handleAction = async (actionType) => {
        if (!selectedId || !selectedRequest) return;

        if (selectedRequest.type === 'Emergency' && actionType === 'approve' && !emergencyReason.trim()) {
            toast.error('Emergency override reason is mandatory.');
            return;
        }

        setProcessing(true);
        
        try {
            if (actionType === 'approve') {
                if (selectedRequest.type === 'Emergency') {
                    // Update request status to used/active
                    await updateDoc(doc(db, 'accessRequests', selectedId), { status: 'used' });
                    // Create active session
                    await addDoc(collection(db, 'activeSessions'), {
                        requestId: selectedId,
                        doctorId: user.uid,
                        patientId: selectedRequest.patientId,
                        createdAt: new Date(),
                        expiresAt: new Date(Date.now() + 4 * 60 * 60000), // 4 hours for emergency
                    });
                    toast.success('Emergency Access Granted');
                    setEmergencyReason('');
                }
            } else if (actionType === 'deny') {
                await deleteDoc(doc(db, 'accessRequests', selectedId));
                toast.success('Access Request Canceled');
            } else if (actionType === 'terminate') {
                const sessionsQ = query(
                    collection(db, 'activeSessions'),
                    where('requestId', '==', selectedId)
                );
                const snap = await getDocs(sessionsQ);
                for (const d of snap.docs) {
                    await deleteDoc(doc(db, 'activeSessions', d.id));
                }
                await updateDoc(doc(db, 'accessRequests', selectedId), { status: 'expired' });
                toast.success('Session Terminated');
            }
        } catch (err) {
            console.error(err);
            toast.error(`Action failed: ${err.message || 'database error'}`);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-fade-in h-[calc(100vh-120px)] flex flex-col">
            <div className="mb-6 flex-shrink-0">
                <div className="flex items-center gap-2 mb-2">
                    <Key className="w-5 h-5 text-[#00C8D4]" />
                    <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Access Wizard</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-white">Verification Queue</h2>
                <p className="text-sm text-[#8899AA] mt-1">Review and process incoming patient record access requests.</p>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                
                {/* LEFT PANE: Request Queue (35%) */}
                <div className="w-full lg:w-[35%] flex flex-col rounded-2xl bg-[#111827] border border-[#1E2D4580] overflow-hidden flex-shrink-0">
                    <div className="px-5 py-4 border-b border-[#1E2D4580] bg-[#1A2236]/50 flex items-center justify-between">
                        <span className="text-sm font-semibold text-white font-display">Pending & Active</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#00C8D4]/10 text-[#00C8D4] text-xs font-bold">{requests.length}</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        <AnimatePresence>
                            {requests.map((r, i) => (
                                <motion.button
                                    key={r.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setSelectedId(r.id)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                                        selectedId === r.id 
                                            ? 'bg-[#1A2236] border-[#00C8D4] shadow-[0_0_15px_rgba(0,200,212,0.1)]' 
                                            : 'bg-white/[0.02] border-[#1E2D4580] hover:bg-white/[0.04]'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#1E2D45] border border-white/[0.06] flex items-center justify-center text-sm font-bold text-white shadow-inner relative">
                                                {r.patient.split(' ').map(n => n[0]).join('')}
                                                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#111827] ${
                                                    r.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'
                                                }`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{r.patient}</p>
                                                <p className="text-[11px] text-[#8899AA] mt-0.5">{r.id}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1E2D4580]">
                                        <div className="flex items-center gap-1.5">
                                            {r.type === 'Emergency' ? (
                                                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                            ) : (
                                                <Unlock className="w-3.5 h-3.5 text-[#00C8D4]" />
                                            )}
                                            <span className={`text-[11px] font-semibold ${r.type === 'Emergency' ? 'text-red-400' : 'text-[#00C8D4]'}`}>
                                                {r.type} Request
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-[#8899AA] font-mono">{r.time}</span>
                                    </div>
                                </motion.button>
                            ))}
                        </AnimatePresence>

                        {requests.length === 0 && (
                            <div className="text-center py-12">
                                <CheckCircle className="w-8 h-8 text-emerald-400/50 mx-auto mb-3" />
                                <p className="text-sm text-[#8899AA]">Queue is empty.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANE: Context Viewer (65%) */}
                <div className="w-full lg:w-[65%] flex flex-col rounded-2xl bg-[#111827] border border-[#1E2D4580] overflow-hidden flex-shrink-0">
                    {selectedRequest ? (
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className={`p-6 border-b ${
                                selectedRequest.type === 'Emergency' 
                                    ? 'bg-red-500/10 border-red-500/20' 
                                    : 'bg-[#1A2236]/50 border-[#1E2D4580]'
                            }`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-inner ${
                                            selectedRequest.type === 'Emergency'
                                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                : 'bg-gradient-to-br from-[#00C8D4] to-blue-600 text-white'
                                        }`}>
                                            {selectedRequest.patient.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                                                {selectedRequest.patient}
                                                {selectedRequest.type === 'Emergency' && (
                                                    <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[10px] uppercase tracking-widest font-bold border border-red-500/30">
                                                        Break-Glass
                                                    </span>
                                                )}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1.5 text-xs text-[#8899AA]">
                                                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Age: {selectedRequest.age}</span>
                                                <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> Blood: {selectedRequest.bloodType}</span>
                                                <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {selectedRequest.diagnosis}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-[#8899AA] uppercase tracking-wider mb-1">Status</p>
                                        <div className="flex items-center gap-1.5 justify-end">
                                            <span className={`w-2 h-2 rounded-full ${selectedRequest.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                                            <span className="text-sm font-semibold text-white capitalize">{selectedRequest.status}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                
                                {/* Security Checklist */}
                                <div>
                                    <h4 className="text-xs font-semibold text-[#8899AA] uppercase tracking-wider mb-3">Pre-Flight Security Check</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {[
                                            { label: 'Identity matched on-chain', passed: true },
                                            { label: `Origin IP: ${selectedRequest.ip}`, passed: selectedRequest.type !== 'Emergency' },
                                            { label: 'Active Provider Scope', passed: true },
                                            { label: 'Consent Threshold Met', passed: selectedRequest.type !== 'Emergency' },
                                        ].map((check, i) => (
                                            <div key={i} className={`p-3 rounded-xl border flex items-center gap-3 ${
                                                check.passed ? 'bg-emerald-500/[0.04] border-emerald-500/10' : 'bg-amber-500/[0.04] border-amber-500/10'
                                            }`}>
                                                {check.passed ? (
                                                    <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                                ) : (
                                                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                                )}
                                                <span className={`text-xs font-medium ${check.passed ? 'text-emerald-400/90' : 'text-amber-400/90'}`}>
                                                    {check.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Emergency Overrides */}
                                {selectedRequest.type === 'Emergency' && selectedRequest.status === 'pending' && (
                                    <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertTriangle className="w-4 h-4 text-red-400" />
                                            <h4 className="text-sm font-bold text-red-400">Emergency Override Justification</h4>
                                        </div>
                                        <p className="text-xs text-red-400/80 mb-3">
                                            You are bypassing standard consent protocols. This action will be immutably logged on the blockchain and reported to the compliance board.
                                        </p>
                                        <textarea
                                            value={emergencyReason}
                                            onChange={e => setEmergencyReason(e.target.value)}
                                            placeholder="Enter clinical justification for break-glass access..."
                                            className="w-full bg-[#111827] border border-red-500/30 rounded-lg p-3 text-sm text-white placeholder-red-900/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30 outline-none resize-none h-24"
                                        />
                                    </div>
                                )}

                            </div>

                            {/* Action Area (Footer) */}
                            <div className="p-6 border-t border-[#1E2D4580] bg-[#1A2236]/30">
                                {selectedRequest.status === 'pending' ? (
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => handleAction('approve')}
                                            disabled={processing}
                                            className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                                selectedRequest.type === 'Emergency'
                                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                                    : 'bg-[#00C8D4] hover:bg-[#00E5F0] text-[#0B0F1A]'
                                            } disabled:opacity-50`}
                                        >
                                            {processing ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : (
                                                <>
                                                    {selectedRequest.type === 'Emergency' ? <Zap className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                                    {selectedRequest.type === 'Emergency' ? 'Execute Break-Glass Protocol' : 'Generate OTP Challenge'}
                                                </>
                                            )}
                                        </button>
                                        <button 
                                            onClick={() => handleAction('deny')}
                                            disabled={processing}
                                            className="px-6 py-3.5 rounded-xl font-bold text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center gap-2 transition-all disabled:opacity-50"
                                        >
                                            <XCircle className="w-4 h-4" /> Decline
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm font-bold font-mono">14:59</span>
                                        </div>
                                        <button 
                                            onClick={() => handleAction('terminate')}
                                            disabled={processing}
                                            className="px-6 py-3.5 rounded-xl font-bold text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                                        >
                                            {processing ? <span className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : (
                                                <><Trash2 className="w-4 h-4" /> Terminate Session</>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-[#1A2236] border border-[#1E2D4580] flex items-center justify-center mb-4">
                                <Key className="w-8 h-8 text-[#4A5568]" />
                            </div>
                            <h3 className="text-lg font-display font-semibold text-white mb-2">No Request Selected</h3>
                            <p className="text-sm text-[#8899AA] max-w-sm">Select a pending request from the queue to review security parameters and grant access.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
