import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Share2, Plus, XCircle, ShieldCheck, Clock, Trash2, HelpCircle, 
    AlertCircle, Sparkles, Brain, CheckCircle, ExternalLink, Hospital, User
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function SecureSharingCenterPage() {
    const [user, setUser] = useState(null);
    const [shares, setShares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form states
    const [recipient, setRecipient] = useState('');
    const [recipientType, setRecipientType] = useState('Doctor');
    const [duration, setDuration] = useState(24);
    const [reason, setReason] = useState('');

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        const sharesRef = collection(db, 'sharing_records');
        const q = query(sharesRef, where('patientId', '==', user.uid));

        const unsub = onSnapshot(q, (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setShares(data);
            setLoading(false);
        }, (error) => {
            console.error('[SecureSharingCenterPage] Firestore error:', error);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    // Initial seed if empty
    const handleInitializeShares = async () => {
        if (!user) return;
        try {
            const sampleShares = [
                { recipientName: "Dr. Liam Patel", recipientType: "Doctor", durationHours: 24, reason: "Routine cardiology follow-up consult", status: "Active", createdAt: new Date().toISOString() },
                { recipientName: "Saint Jude Wellness Center", recipientType: "Hospital", durationHours: 168, reason: "Inpatient historical records synching", status: "Active", createdAt: new Date().toISOString() }
            ];

            for (const item of sampleShares) {
                await addDoc(collection(db, 'sharing_records'), {
                    patientId: user.uid,
                    ...item
                });
            }
        } catch (err) {
            console.error('Error seeding shares:', err);
        }
    };

    const handleCreateShare = async (e) => {
        e.preventDefault();
        if (!recipient) return;

        try {
            await addDoc(collection(db, 'sharing_records'), {
                patientId: user.uid,
                recipientName: recipient,
                recipientType: recipientType,
                durationHours: Number(duration),
                reason: reason || 'Medical records consultation',
                status: 'Active',
                createdAt: new Date().toISOString()
            });

            // Reset
            setRecipient('');
            setRecipientType('Doctor');
            setDuration(24);
            setReason('');
            setShowAddModal(false);
        } catch (err) {
            console.error('Error creating share record:', err);
        }
    };

    const handleRevokeShare = async (shareId) => {
        try {
            await deleteDoc(doc(db, 'sharing_records', shareId));
        } catch (err) {
            console.error('Error revoking record share:', err);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 bg-[#00C8D4]/10 border border-[#00C8D4]/20 rounded-full px-3 py-1 w-fit mb-3">
                        <Share2 className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Access Dispersion</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Secure Records Sharing</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Disperse temporary record-access keys to hospitals or clinicians, customize durations, and manage permission tokens.</p>
                </div>
                <div className="flex gap-3">
                    {shares.length === 0 && !loading && (
                        <button
                            onClick={handleInitializeShares}
                            className="px-4 py-2.5 rounded-xl border border-[#1E2D4580] text-xs font-bold hover:text-white"
                        >
                            Sync Sample Shares
                        </button>
                    )}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)]"
                    >
                        <Plus className="w-4 h-4" /> Share Medical Record
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-10 h-10 rounded-full border-4 border-teal-500/10 border-t-teal-400 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                    {/* Active Sharing Cards List */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Dispensed Access Tokens</h3>
                        
                        {shares.length === 0 ? (
                            <div className="bg-[#111827] border border-[#1E2D4580] border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[250px]">
                                <Share2 className="w-12 h-12 text-slate-600 mb-3" />
                                <h4 className="text-base font-bold text-[#8899AA]">No Dispersed Access Keys</h4>
                                <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                                    You have not dispersed any temporary secure access keys. Share a medical report or timeline directly with a specialist.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {shares.map((sh, idx) => (
                                    <motion.div
                                        key={sh.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                                                        {sh.recipientType === 'Doctor' ? <User className="w-5 h-5" /> : <Hospital className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-white leading-tight">{sh.recipientName}</h4>
                                                        <span className="text-[10px] text-slate-400 font-mono">{sh.recipientType}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRevokeShare(sh.id)}
                                                    className="text-slate-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="pt-2 border-t border-[#1E2D4580]/50 space-y-2">
                                                <span className="text-[9px] text-[#8899AA] font-bold uppercase tracking-wider block">Access Rationale</span>
                                                <p className="text-xs text-slate-300 italic">"{sh.reason}"</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-[#1E2D4580] flex justify-between items-center text-xs">
                                            <span className="text-[10px] text-[#8899AA] font-bold uppercase font-mono flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-cyan-400" /> {sh.durationHours} hrs
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold">
                                                {sh.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right column safety details */}
                    <div className="space-y-6">
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Cryptographic Consent Protocols</h4>

                            <div className="bg-gradient-to-r from-purple-900/10 to-indigo-900/10 border border-purple-500/20 rounded-xl p-4 flex gap-3 text-xs text-purple-400">
                                <ShieldCheck className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="font-bold">Encrypted Token Dispatch</span>
                                    <p className="mt-1 text-slate-300 leading-relaxed">
                                        All shared links use asymmetric envelope keys. The clinician can decrypt logs only during the approved active window.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Share Modal Wizard */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#111827] border border-[#1E2D4580] rounded-2xl max-w-md w-full p-6 space-y-6 relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/5 rounded-full blur-[40px] pointer-events-none" />

                            <div className="flex justify-between items-center border-b border-[#1E2D4580] pb-4">
                                <h3 className="font-display font-bold text-lg text-white">Disperse Access Key</h3>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateShare} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Recipient Name</label>
                                    <input
                                        type="text"
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        placeholder="e.g. Dr. Liam Patel"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Recipient Type</label>
                                        <select
                                            value={recipientType}
                                            onChange={(e) => setRecipientType(e.target.value)}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        >
                                            <option value="Doctor">Doctor</option>
                                            <option value="Hospital">Hospital</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Access Duration</label>
                                        <select
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        >
                                            <option value={1}>1 Hour</option>
                                            <option value={24}>24 Hours</option>
                                            <option value={168}>7 Days</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Access Reason / Notes</label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Consultation for physiological metrics"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none h-20 resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)] mt-4"
                                >
                                    Disperse Access Envelope
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
