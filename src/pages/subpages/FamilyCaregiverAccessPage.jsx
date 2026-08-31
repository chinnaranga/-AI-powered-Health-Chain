import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Plus, XCircle, ShieldCheck, Lock, Activity, Eye, Trash2,
    AlertCircle, ShieldAlert, Sparkles, Brain, Phone, Calendar
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function FamilyCaregiverAccessPage() {
    const [user, setUser] = useState(null);
    const [caregivers, setCaregivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form states
    const [cgName, setCgName] = useState('');
    const [cgEmail, setCgEmail] = useState('');
    const [relationship, setRelationship] = useState('Spouse');
    const [viewVitals, setViewVitals] = useState(true);
    const [viewRecords, setViewRecords] = useState(false);

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        const caregiverRef = collection(db, 'caregiver_permissions');
        const q = query(caregiverRef, where('patientId', '==', user.uid));

        const unsub = onSnapshot(q, (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setCaregivers(data);
            setLoading(false);
        }, (error) => {
            console.error('[FamilyCaregiverAccessPage] Firestore error:', error);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    // Initial seed if empty
    const handleInitializeCaregivers = async () => {
        if (!user) return;
        try {
            const sampleCaregivers = [
                { caregiverName: "Sarah Miller", caregiverEmail: "sarah.miller@example.com", relationship: "Spouse", permissions: ["Read Vitals", "Read Medications"], status: "Active", createdAt: new Date().toISOString() },
                { caregiverName: "Jonathan Miller Sr.", caregiverEmail: "jonathan.sr@example.com", relationship: "Parent", permissions: ["Read Vitals"], status: "Active", createdAt: new Date().toISOString() }
            ];

            for (const item of sampleCaregivers) {
                await addDoc(collection(db, 'caregiver_permissions'), {
                    patientId: user.uid,
                    ...item
                });
            }
        } catch (err) {
            console.error('Error seeding caregivers:', err);
        }
    };

    const handleGrantAccess = async (e) => {
        e.preventDefault();
        if (!cgName || !cgEmail) return;

        const activePermissions = [];
        if (viewVitals) activePermissions.push('Read Vitals');
        if (viewRecords) activePermissions.push('Read Records');

        try {
            await addDoc(collection(db, 'caregiver_permissions'), {
                patientId: user.uid,
                caregiverName: cgName,
                caregiverEmail: cgEmail,
                relationship: relationship,
                permissions: activePermissions,
                status: 'Active',
                createdAt: new Date().toISOString()
            });

            // Reset
            setCgName('');
            setCgEmail('');
            setRelationship('Spouse');
            setViewVitals(true);
            setViewRecords(false);
            setShowAddModal(false);
        } catch (err) {
            console.error('Error adding caregiver permissions:', err);
        }
    };

    const handleRevokeAccess = async (cgId) => {
        try {
            await deleteDoc(doc(db, 'caregiver_permissions', cgId));
        } catch (err) {
            console.error('Error revoking caregiver credentials:', err);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 bg-[#00C8D4]/10 border border-[#00C8D4]/20 rounded-full px-3 py-1 w-fit mb-3">
                        <Users className="w-4 h-4 text-[#00C8D4] animate-pulse" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Privacy Controls</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Family & Caregiver Access Management</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Grant trusted family members visibility privileges, set record limits, or revoke credentials instantly.</p>
                </div>
                <div className="flex gap-3">
                    {caregivers.length === 0 && !loading && (
                        <button
                            onClick={handleInitializeCaregivers}
                            className="px-4 py-2.5 rounded-xl border border-[#1E2D4580] text-xs font-bold hover:text-white"
                        >
                            Sync Active Caregivers
                        </button>
                    )}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)]"
                    >
                        <Plus className="w-4 h-4" /> Grant Caregiver Access
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-10 h-10 rounded-full border-4 border-teal-500/10 border-t-teal-400 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                    {/* Left Column: Access permission list */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Authorized Caregivers</h3>
                        
                        {caregivers.length === 0 ? (
                            <div className="bg-[#111827] border border-[#1E2D4580] border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[250px]">
                                <Lock className="w-12 h-12 text-slate-600 mb-3" />
                                <h4 className="text-base font-bold text-[#8899AA]">No Active Caregiver Privileges</h4>
                                <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                                    No trusted family members or caregivers hold active view credentials. Grant secure visibility configurations.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {caregivers.map((cg, idx) => (
                                    <motion.div
                                        key={cg.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                                                        <Users className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-white leading-tight">{cg.caregiverName}</h4>
                                                        <span className="text-[10px] text-slate-400 font-mono">{cg.caregiverEmail}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRevokeAccess(cg.id)}
                                                    className="text-slate-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="pt-2 border-t border-[#1E2D4580]/50 space-y-2">
                                                <span className="text-[9px] text-[#8899AA] font-bold uppercase tracking-wider block">Granted Visibility Rules</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {cg.permissions?.map((perm, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[8px] font-bold font-mono">
                                                            {perm}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-[#1E2D4580] flex justify-between items-center text-xs">
                                            <span className="text-[10px] text-[#8899AA] font-bold uppercase font-mono">Role: {cg.relationship}</span>
                                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold">
                                                {cg.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Safety Cues & Emergency Contacts */}
                    <div className="space-y-6">
                        {/* Security integrity details */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Consent Security Indicators</h4>
                            
                            <div className="bg-gradient-to-r from-purple-900/10 to-indigo-900/10 border border-purple-500/20 rounded-xl p-4 flex gap-3 text-xs text-purple-400">
                                <ShieldCheck className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="font-bold">Cryptographic Consents</span>
                                    <p className="mt-1 text-slate-300 leading-relaxed">
                                        All caregiver access triggers generate cryptographically signed logs on the patient authorization ledger.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Crisis Emergency contacts details */}
                        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 text-left space-y-3.5">
                            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4" /> Crisis Emergency Contact
                            </h4>
                            <div className="bg-[#0B0F1A]/60 border border-[#1E2D4580] p-3 rounded-xl space-y-1.5">
                                <h5 className="text-xs font-bold text-white">Sarah Miller (Spouse)</h5>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                                    <Phone className="w-3.5 h-3.5 text-red-400" />
                                    <span>+1 (555) 019-2831</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Grant access modal wizard */}
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
                                <h3 className="font-display font-bold text-lg text-white">Grant Caregiver Access</h3>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleGrantAccess} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Caregiver Full Name</label>
                                    <input
                                        type="text"
                                        value={cgName}
                                        onChange={(e) => setCgName(e.target.value)}
                                        placeholder="e.g. Sarah Miller"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Caregiver Email Credentials</label>
                                    <input
                                        type="email"
                                        value={cgEmail}
                                        onChange={(e) => setCgEmail(e.target.value)}
                                        placeholder="sarah.miller@example.com"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Relationship</label>
                                        <select
                                            value={relationship}
                                            onChange={(e) => setRelationship(e.target.value)}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        >
                                            <option value="Spouse">Spouse</option>
                                            <option value="Parent">Parent</option>
                                            <option value="Child">Child</option>
                                            <option value="Primary Caregiver">Primary Caregiver</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-1">Set Visibility Parameters</label>
                                    
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={viewVitals}
                                                onChange={(e) => setViewVitals(e.target.checked)}
                                                className="accent-teal-500 rounded"
                                            />
                                            <span>Telemetry Vitals</span>
                                        </label>

                                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={viewRecords}
                                                onChange={(e) => setViewRecords(e.target.checked)}
                                                className="accent-teal-500 rounded"
                                            />
                                            <span>Full Medical History</span>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)] mt-4"
                                >
                                    Log Cryptographic Consent Key
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
