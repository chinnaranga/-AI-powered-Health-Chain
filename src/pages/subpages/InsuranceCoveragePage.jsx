import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Shield, FileText, Upload, Calendar, Landmark, CreditCard, 
    Activity, Clock, CheckCircle2, AlertTriangle, Plus, XCircle
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function InsuranceCoveragePage() {
    const [user, setUser] = useState(null);
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showClaimModal, setShowClaimModal] = useState(false);

    // Form states
    const [serviceName, setServiceName] = useState('');
    const [claimAmount, setClaimAmount] = useState('');
    const [hospitalName, setHospitalName] = useState('');
    const [policyIdInput, setPolicyIdInput] = useState('');

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        const policyRef = collection(db, 'insurance_policies');
        const q = query(policyRef, where('patientId', '==', user.uid));

        const unsub = onSnapshot(q, (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setPolicies(data);
            setLoading(false);
        }, (error) => {
            console.error('[InsuranceCoveragePage] Firestore error:', error);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    // Handle creating a baseline mock policy if one doesn't exist
    const handleInitializePolicy = async () => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'insurance_policies'), {
                patientId: user.uid,
                providerName: 'Apex Health Premier Plan',
                policyNumber: `APX-${Math.floor(100000 + Math.random() * 900000)}`,
                coverageLimit: 50000,
                deductibleUsed: 1250,
                expiryDate: '2027-12-31',
                status: 'Active',
                claims: [
                    { claimId: 'CLM-782', service: 'Standard Outpatient Consultation', amount: 150, status: 'Approved', date: '2026-04-10' },
                    { claimId: 'CLM-901', service: 'Full Metabolic Lab Panel', amount: 320, status: 'Pending', date: '2026-05-12' }
                ],
                networkHospitals: ['Saint Jude Cardiac Center', 'Metro General Hospital', 'Apex Specialist Clinics']
            });
        } catch (err) {
            console.error('Error establishing policy:', err);
        }
    };

    const handleCreateClaim = async (e) => {
        e.preventDefault();
        if (!serviceName || !claimAmount || policies.length === 0) return;

        const targetPolicy = policies[0]; // targets active policy
        const newClaim = {
            claimId: `CLM-${Math.floor(100 + Math.random() * 900)}`,
            service: serviceName,
            amount: Number(claimAmount),
            status: 'Pending',
            date: new Date().toISOString().split('T')[0]
        };

        const updatedClaims = [...(targetPolicy.claims || []), newClaim];

        try {
            await updateDoc(doc(db, 'insurance_policies', targetPolicy.id), {
                claims: updatedClaims
            });

            // Reset Form
            setServiceName('');
            setClaimAmount('');
            setHospitalName('');
            setShowClaimModal(false);
        } catch (err) {
            console.error('Error logging claim:', err);
        }
    };

    const activePolicy = policies[0];

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 w-fit mb-3">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Financial Interoperability</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Insurance & Coverage Center</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Review active policies, track deductibles progress, and file secure reimbursement claims.</p>
                </div>
                {activePolicy && (
                    <button
                        onClick={() => setShowClaimModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all animate-shimmer"
                    >
                        <Plus className="w-4 h-4" /> Submit Reimbursement Claim
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-10 h-10 rounded-full border-4 border-emerald-500/10 border-t-emerald-400 animate-spin" />
                </div>
            ) : !activePolicy ? (
                <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[350px]">
                    <Shield className="w-16 h-16 text-slate-600 mb-4" />
                    <h3 className="text-lg font-bold text-white">No Policy Integrated</h3>
                    <p className="text-xs text-[#8899AA] max-w-sm mt-2 leading-relaxed">
                        You have not established or synced an insurance policy with your blockchain patient wallet credentials.
                    </p>
                    <button
                        onClick={handleInitializePolicy}
                        className="mt-6 px-6 py-2.5 rounded-xl bg-[#00C8D4] text-[#0B0F1A] font-bold text-xs hover:shadow-[0_0_20px_rgba(0,200,212,0.3)] transition-all"
                    >
                        Synchronize Apex Premier Plan
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                    {/* Left & Middle Column: Coverage details & Claims list */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Coverage policy details header */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1E2D4580] pb-5 mb-5">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{activePolicy.providerName}</h3>
                                    <p className="text-xs text-[#8899AA] font-mono mt-0.5">Policy ID: {activePolicy.policyNumber}</p>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
                                    {activePolicy.status}
                                </span>
                            </div>

                            {/* Deductibles meters */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-[#8899AA]">Annual Deductible Out-of-Pocket</span>
                                        <span className="text-white font-mono font-bold">${activePolicy.deductibleUsed} / $5,000</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-[#0B0F1A] border border-[#1E2D4580] rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                            style={{ width: `${(activePolicy.deductibleUsed / 5000) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                                        Reaching your deductible ensures the network policy covers 100% of major in-patient services.
                                    </p>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-[#8899AA]">Policy Coverage Limit</span>
                                        <span className="text-white font-mono font-bold">$12,350 / ${activePolicy.coverageLimit}</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-[#0B0F1A] border border-[#1E2D4580] rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-teal-500 to-[#00C8D4] rounded-full"
                                            style={{ width: `${(12350 / activePolicy.coverageLimit) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                                        Total clinical benefit limit established under current insurance fiscal year cycle.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Claims History */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Claims History & Status</h4>
                            
                            {activePolicy.claims?.length === 0 ? (
                                <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-8 text-center text-xs text-slate-500">
                                    No claims logged for this policy.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activePolicy.claims.map((claim, idx) => (
                                        <motion.div
                                            key={claim.claimId}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="bg-[#111827] border border-[#1E2D4580] rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-bold text-white">{claim.service}</h5>
                                                    <span className="text-[10px] text-slate-500 font-mono">{claim.claimId} • Submitted {claim.date}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 justify-between w-full md:w-auto">
                                                <span className="text-sm font-bold text-white font-mono">${claim.amount}</span>
                                                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono ${
                                                    claim.status === 'Approved' 
                                                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                                        : claim.status === 'Pending'
                                                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 animate-pulse'
                                                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                                                }`}>
                                                    {claim.status}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Network Hospitals & Expiry Alert */}
                    <div className="space-y-6">
                        {/* Expiry alerts */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 text-left relative overflow-hidden">
                            <div className="flex gap-3">
                                <Calendar className="w-5 h-5 text-emerald-400 mt-0.5" />
                                <div>
                                    <span className="text-[9px] text-[#8899AA] font-bold uppercase tracking-wider block">Policy Expiring In</span>
                                    <h4 className="text-lg font-bold text-white mt-1">December 31, 2027</h4>
                                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                                        Your comprehensive Apex Premier Plan will auto-renew. No direct action required to sustain coverage benefits.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Network Hospitals */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 text-left space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Network Hospital Interoperability</h4>
                            
                            <div className="space-y-2.5">
                                {activePolicy.networkHospitals?.map((hosp, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-[#CBD5E1] bg-[#0B0F1A]/60 p-2.5 border border-[#1E2D4580] rounded-xl font-medium">
                                        <Landmark className="w-4 h-4 text-emerald-400" />
                                        <span>{hosp}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                Network clinics utilize direct automated insurance claims dispatch, bypassing manual billing checklists.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Claim Modal */}
            <AnimatePresence>
                {showClaimModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#111827] border border-[#1E2D4580] rounded-2xl max-w-md w-full p-6 space-y-6 relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />

                            <div className="flex justify-between items-center border-b border-[#1E2D4580] pb-4">
                                <h3 className="font-display font-bold text-lg text-white">Reimbursement Claim</h3>
                                <button onClick={() => setShowClaimModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateClaim} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Service / Procedure Name</label>
                                    <input
                                        type="text"
                                        value={serviceName}
                                        onChange={(e) => setServiceName(e.target.value)}
                                        placeholder="e.g. Diagnostic Cardiac Ultrasound"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-emerald-500/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Claim Amount ($)</label>
                                    <input
                                        type="number"
                                        value={claimAmount}
                                        onChange={(e) => setClaimAmount(e.target.value)}
                                        placeholder="e.g. 450"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-emerald-500/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Hospital Center</label>
                                    <input
                                        type="text"
                                        value={hospitalName}
                                        onChange={(e) => setHospitalName(e.target.value)}
                                        placeholder="e.g. Saint Jude Cardiac Center"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-emerald-500/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Attachment / Bill Invoice (Simulation)</label>
                                    <div className="border border-dashed border-[#1E2D4580] hover:border-emerald-500/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#0B0F1A]">
                                        <Upload className="w-5 h-5 text-slate-500 mb-1.5" />
                                        <span className="text-[10px] text-slate-400 font-medium">Upload PDF Invoice receipt</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all mt-4"
                                >
                                    File Reimbursement Request
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
