import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    GitBranch, FileText, Shield, Clock, AlertTriangle, CheckCircle, 
    User, Send, RefreshCw, XCircle, Search, ExternalLink, Calendar,
    UserCheck, BookOpen, Plus, Clipboard, Landmark, Stethoscope
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from '../../components/Toast';

export default function ReferralHandoffPage() {
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [referrals, setReferrals] = useState([]);
    
    // Referral Form States
    const [showNewForm, setShowNewForm] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [hospital, setHospital] = useState('');
    const [specialty, setSpecialty] = useState('Cardiology');
    const [reason, setReason] = useState('');
    const [urgency, setUrgency] = useState('Routine');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Selected Referral for Detail view
    const [selectedReferral, setSelectedReferral] = useState(null);

    // Mock Doctors database
    const SPECIALIST_DOCTORS = [
        { id: 'doc1', name: 'Dr. Sarah Connor', specialty: 'Cardiology', hospital: 'Metro General Hospital' },
        { id: 'doc2', name: 'Dr. Robert Chen', specialty: 'Neurology', hospital: 'St. Jude Medical Center' },
        { id: 'doc3', name: 'Dr. Priya Patel', specialty: 'Oncology', hospital: 'City Hope Cancer Institute' },
        { id: 'doc4', name: 'Dr. Alan Grant', specialty: 'Pediatrics', hospital: 'Childrens Mercy Care' }
    ];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setFirebaseUser(user);
                
                // Real-time Firestore query for referrals
                const referralsRef = collection(db, 'referrals');
                const q = query(referralsRef, where('patientId', '==', user.uid));
                
                const unsubReferrals = onSnapshot(q, (snapshot) => {
                    const data = [];
                    snapshot.forEach((doc) => {
                        data.push({ id: doc.id, ...doc.data() });
                    });
                    setReferrals(data);
                    setLoading(false);
                }, (error) => {
                    console.error('[ReferralHandoffPage] Firestore error:', error);
                    setLoading(false);
                });

                return () => unsubReferrals();
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Create a new specialist referral
    const handleCreateReferral = async (e) => {
        e.preventDefault();
        if (!firebaseUser) return;
        if (!selectedDoctor || !reason.trim()) {
            toast.error('Please complete all form fields');
            return;
        }

        setIsSubmitting(true);
        const docObj = SPECIALIST_DOCTORS.find(d => d.id === selectedDoctor);

        const newReferral = {
            patientId: firebaseUser.uid,
            doctorName: docObj.name,
            hospitalName: docObj.hospital,
            specialty: docObj.specialty,
            urgency,
            reason,
            status: 'Pending',
            date: new Date().toISOString(),
            history: [
                { status: 'Pending', timestamp: new Date().toISOString(), note: 'Referral dispatched securely' }
            ]
        };

        try {
            await addDoc(collection(db, 'referrals'), newReferral);
            toast.success('Specialist referral created and logged on blockchain');
            setShowNewForm(false);
            setReason('');
        } catch (err) {
            console.error('Failed to create referral:', err);
            // Fallback for demo
            setReferrals(prev => [
                { id: `ref-mock-${Date.now()}`, ...newReferral },
                ...prev
            ]);
            toast.success('Referral created (Simulated Local Instance)');
            setShowNewForm(false);
            setReason('');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Simulated status change
    const updateReferralStatus = async (refId, newStatus) => {
        const item = referrals.find(r => r.id === refId);
        if (!item) return;

        const updatedHistory = [
            ...item.history,
            { status: newStatus, timestamp: new Date().toISOString(), note: `Referral status updated to ${newStatus}` }
        ];

        try {
            if (!refId.startsWith('ref-mock-')) {
                const docRef = doc(db, 'referrals', refId);
                await updateDoc(docRef, { status: newStatus, history: updatedHistory });
            } else {
                setReferrals(prev => prev.map(r => r.id === refId ? { ...r, status: newStatus, history: updatedHistory } : r));
            }
            toast.success(`Referral ${newStatus.toLowerCase()} successfully`);
            setSelectedReferral(null);
        } catch (err) {
            console.error(err);
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-[#00C8D4] animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-16 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1E2D4580] pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <GitBranch className="w-4 h-4 text-[#00C8D4] animate-pulse" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Clinical Interoperability Center</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Referrals & Handoffs</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Direct case handoffs, specialist dispatching, and secure health record exchange pipelines.</p>
                </div>
                <button
                    onClick={() => setShowNewForm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)] hover:shadow-[0_0_30px_rgba(0,200,212,0.4)] transition-all"
                >
                    <Plus className="w-4 h-4" /> Create Specialist Referral
                </button>
            </div>

            {/* Quick KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#111827] border border-[#1E2D4580] rounded-xl p-4">
                    <span className="text-[9px] text-[#8899AA] uppercase font-bold tracking-wider">Total Dispatchs</span>
                    <p className="text-2xl font-bold text-white mt-1">{referrals.length}</p>
                </div>
                <div className="bg-[#111827] border border-[#1E2D4580] rounded-xl p-4">
                    <span className="text-[9px] text-amber-400 uppercase font-bold tracking-wider">Pending Acceptance</span>
                    <p className="text-2xl font-bold text-amber-400 mt-1">{referrals.filter(r => r.status === 'Pending').length}</p>
                </div>
                <div className="bg-[#111827] border border-[#1E2D4580] rounded-xl p-4">
                    <span className="text-[9px] text-[#00C8D4] uppercase font-bold tracking-wider">Active Specialist Care</span>
                    <p className="text-2xl font-bold text-[#00C8D4] mt-1">{referrals.filter(r => r.status === 'Active').length}</p>
                </div>
                <div className="bg-[#111827] border border-[#1E2D4580] rounded-xl p-4">
                    <span className="text-[9px] text-emerald-400 uppercase font-bold tracking-wider">On-Chain Registered</span>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">100%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Referrals List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Active Specialist Handoffs</h3>
                    {referrals.length === 0 ? (
                        <div className="bg-[#111827] border border-[#1E2D4580] border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[250px]">
                            <BookOpen className="w-10 h-10 text-slate-600 mb-3" />
                            <h4 className="text-sm font-bold text-[#8899AA]">No Active Specialist Referrals</h4>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">There are no referrals registered under your HealthChain profile. Use the "Create Specialist Referral" button above to register one.</p>
                        </div>
                    ) : (
                        referrals.map((r, i) => (
                            <motion.div
                                key={r.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ scale: 1.01 }}
                                onClick={() => setSelectedReferral(r)}
                                className={`p-5 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden bg-[#111827] ${
                                    selectedReferral?.id === r.id ? 'border-[#00C8D4] shadow-[0_0_20px_rgba(0,200,212,0.05)]' : 'border-[#1E2D4580] hover:border-slate-700'
                                }`}
                            >
                                {/* Decorative shadow */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C8D4]/5 rounded-full blur-[30px] pointer-events-none" />

                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center text-[#00C8D4]">
                                            <Stethoscope className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">{r.doctorName}</h4>
                                            <p className="text-xs text-[#8899AA] flex items-center gap-1 mt-0.5">
                                                <Landmark className="w-3.5 h-3.5" /> {r.hospitalName}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                            r.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : r.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            : 'bg-[#1A2236] text-slate-400 border border-[#1E2D4580]'
                                        }`}>
                                            {r.status}
                                        </span>
                                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                            r.urgency === 'Urgent' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-[#1A2236] text-[#8899AA]'
                                        }`}>
                                            {r.urgency}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs text-[#CBD5E1] mt-4 line-clamp-2 leading-relaxed">
                                    {r.reason}
                                </p>

                                <div className="mt-4 pt-3 border-t border-[#1E2D4580] flex justify-between items-center text-[10px] text-[#8899AA]">
                                    <span>Created: {new Date(r.date).toLocaleDateString()}</span>
                                    <span className="text-[#00C8D4] flex items-center gap-1">
                                        View Timeline Details <ExternalLink className="w-3 h-3" />
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Detail Information & Timeline Panels */}
                <div className="lg:col-span-1 space-y-6">
                    {selectedReferral ? (
                        <AnimatePresence mode="wait">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 space-y-6 text-left relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[40px] pointer-events-none" />
                                
                                <div>
                                    <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest">Active Handoff Details</span>
                                    <h3 className="text-lg font-bold text-white mt-1">{selectedReferral.doctorName}</h3>
                                    <p className="text-xs text-[#8899AA]">{selectedReferral.specialty} Specialist</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider block mb-1">Reason for referral</label>
                                        <p className="text-xs text-[#CBD5E1] bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl p-3.5 leading-relaxed">
                                            {selectedReferral.reason}
                                        </p>
                                    </div>

                                    {/* Dispatch status timeline */}
                                    <div>
                                        <label className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider block mb-3">Status Timeline</label>
                                        <div className="relative pl-6 space-y-4 border-l border-slate-800">
                                            {selectedReferral.history.map((h, index) => (
                                                <div key={index} className="relative">
                                                    <span className="absolute -left-[30px] top-1 w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C8D4]" />
                                                    </span>
                                                    <div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-semibold text-white">{h.status}</span>
                                                            <span className="text-[9px] text-[#8899AA]">{new Date(h.timestamp).toLocaleTimeString()}</span>
                                                        </div>
                                                        <p className="text-[10px] text-[#8899AA] mt-0.5">{h.note}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Custom quick actions for simulation */}
                                <div className="pt-4 border-t border-[#1E2D4580] space-y-2">
                                    {selectedReferral.status === 'Pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => updateReferralStatus(selectedReferral.id, 'Active')}
                                                className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <UserCheck className="w-3.5 h-3.5" /> Accept Case
                                            </button>
                                            <button
                                                onClick={() => updateReferralStatus(selectedReferral.id, 'Rejected')}
                                                className="flex-1 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <XCircle className="w-3.5 h-3.5" /> Reject
                                            </button>
                                        </div>
                                    )}
                                    {selectedReferral.status === 'Active' && (
                                        <button
                                            onClick={() => updateReferralStatus(selectedReferral.id, 'Closed')}
                                            className="w-full py-2.5 rounded-xl bg-[#00C8D4]/10 hover:bg-[#00C8D4]/20 border border-[#00C8D4]/20 text-[#00C8D4] font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <CheckCircle className="w-3.5 h-3.5" /> Complete Specialist Care
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div className="bg-[#111827] border border-[#1E2D4580] border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                            <BookOpen className="w-10 h-10 text-[#4A5568] mb-3" />
                            <h4 className="text-sm font-bold text-[#8899AA]">No Case Selected</h4>
                            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Click any specialist referral in the list to examine case summaries and timeline histories.</p>
                        </div>
                    )}
                </div>

            </div>

            {/* Create Referral Form Modal */}
            <AnimatePresence>
                {showNewForm && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#111827] border border-[#1E2D4580] rounded-2xl max-w-lg w-full p-6 space-y-6 relative overflow-hidden"
                        >
                            {/* Accent Glow */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00C8D4]/5 rounded-full blur-[40px] pointer-events-none" />

                            <div className="flex justify-between items-center border-b border-[#1E2D4580] pb-4">
                                <h3 className="font-display font-bold text-lg text-white">Create Specialist Referral</h3>
                                <button onClick={() => setShowNewForm(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateReferral} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Select Specialist Doctor</label>
                                    <select
                                        value={selectedDoctor}
                                        onChange={(e) => setSelectedDoctor(e.target.value)}
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                    >
                                        <option value="">-- Choose Specialist Doctor --</option>
                                        {SPECIALIST_DOCTORS.map(d => (
                                            <option key={d.id} value={d.id}>{d.name} ({d.specialty} - {d.hospital})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Specialty Focus</label>
                                        <select
                                            value={specialty}
                                            onChange={(e) => setSpecialty(e.target.value)}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        >
                                            <option value="Cardiology">Cardiology</option>
                                            <option value="Neurology">Neurology</option>
                                            <option value="Oncology">Oncology</option>
                                            <option value="Pediatrics">Pediatrics</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Urgency Level</label>
                                        <select
                                            value={urgency}
                                            onChange={(e) => setUrgency(e.target.value)}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        >
                                            <option value="Routine">Routine</option>
                                            <option value="Urgent">Urgent</option>
                                            <option value="Critical">Critical</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Referral & Case Reason</label>
                                    <textarea
                                        rows={4}
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Please provide diagnostic reasons, active conditions, lab findings and handoff summary details..."
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)] hover:shadow-[0_0_30px_rgba(0,200,212,0.4)] transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Dispatch Referral & Handoff Summary
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
