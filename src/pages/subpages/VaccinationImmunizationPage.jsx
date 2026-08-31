import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Shield, Calendar, Plus, XCircle, Award, CheckCircle, FileText, 
    Upload, AlertCircle, Sparkles, Brain, Clock, ClipboardList
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function VaccinationImmunizationPage() {
    const [user, setUser] = useState(null);
    const [immunizations, setImmunizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form states
    const [vaxName, setVaxName] = useState('');
    const [dose, setDose] = useState(1);
    const [batch, setBatch] = useState('');
    const [facility, setFacility] = useState('');
    const [adminDate, setAdminDate] = useState('');

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        const immunizationRef = collection(db, 'immunizations');
        const q = query(immunizationRef, where('patientId', '==', user.uid));

        const unsub = onSnapshot(q, (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setImmunizations(data);
            setLoading(false);
        }, (error) => {
            console.error('[VaccinationImmunizationPage] Firestore error:', error);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    // Seed mock records if empty
    const handleInitializeImmunizations = async () => {
        if (!user) return;
        try {
            const sampleImmunizations = [
                { vaccineName: "COVID-19 Bivalent Booster", doseNumber: 3, batchNumber: "MRN-908A", facility: " Saint Jude Wellness Center", isVerified: true, dateAdministered: "2026-02-14" },
                { vaccineName: "Influenza Quadrivalent", doseNumber: 1, batchNumber: "FLU-781B", facility: "Apex Specialist Clinics", isVerified: true, dateAdministered: "2025-10-10" }
            ];

            for (const item of sampleImmunizations) {
                await addDoc(collection(db, 'immunizations'), {
                    patientId: user.uid,
                    ...item
                });
            }
        } catch (err) {
            console.error('Error seeding immunizations:', err);
        }
    };

    const handleAddImmunization = async (e) => {
        e.preventDefault();
        if (!vaxName || !batch) return;

        try {
            await addDoc(collection(db, 'immunizations'), {
                patientId: user.uid,
                vaccineName: vaxName,
                doseNumber: Number(dose),
                batchNumber: batch,
                facility: facility || 'Self-Reported Health Clinic',
                isVerified: true,
                dateAdministered: adminDate || new Date().toISOString().split('T')[0]
            });

            // Reset
            setVaxName('');
            setDose(1);
            setBatch('');
            setFacility('');
            setAdminDate('');
            setShowAddModal(false);
        } catch (err) {
            console.error('Error adding immunization:', err);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 w-fit mb-3">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Travel & Immunity Clearance</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Immunization & Vaccine Ledger</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Review verified vaccine schedules, upload credentials, and check booster timelines.</p>
                </div>
                <div className="flex gap-3">
                    {immunizations.length === 0 && !loading && (
                        <button
                            onClick={handleInitializeImmunizations}
                            className="px-4 py-2.5 rounded-xl border border-[#1E2D4580] text-xs font-bold hover:text-white"
                        >
                            Sync Immunity Records
                        </button>
                    )}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    >
                        <Plus className="w-4 h-4" /> Log Immunization Dose
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-10 h-10 rounded-full border-4 border-emerald-500/10 border-t-emerald-400 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                    {/* Left & Middle Column: Timeline of vaccine cards */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Vaccine Records history</h3>
                        
                        {immunizations.length === 0 ? (
                            <div className="bg-[#111827] border border-[#1E2D4580] border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[250px]">
                                <Shield className="w-12 h-12 text-slate-600 mb-3" />
                                <h4 className="text-base font-bold text-[#8899AA]">No Immunization History</h4>
                                <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                                    You have not registered any vaccine records. Click "Log Immunization Dose" to synchronize immunity tags.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {immunizations.map((vax, idx) => (
                                    <motion.div
                                        key={vax.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                                                <Shield className="w-5.5 h-5.5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm font-bold text-white leading-tight">{vax.vaccineName}</h4>
                                                    {vax.isVerified && (
                                                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-bold uppercase font-mono tracking-widest flex items-center gap-0.5">
                                                            <Award className="w-2.5 h-2.5" /> Verified
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                                                    Dose {vax.doseNumber} • Batch: {vax.batchNumber} • Facility: {vax.facility}
                                                </span>
                                            </div>
                                        </div>

                                        <span className="text-xs font-bold text-slate-300 font-mono bg-[#0B0F1A] border border-[#1E2D4580] px-3 py-1 rounded-xl">
                                            {vax.dateAdministered}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: travel badge checks & upload certificates */}
                    <div className="space-y-6">
                        {/* Travel Ready verified board */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 text-left relative overflow-hidden">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Travel Clearance Index</h4>
                            
                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex gap-3 text-xs text-emerald-400">
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                <div>
                                    <span className="font-bold">Travel Status: Cleared</span>
                                    <p className="mt-1 text-slate-300 leading-relaxed">
                                        Active COVID-19 booster and influenza records satisfy standard international travel entry mandates.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Certificate uploader */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 text-left space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Immunization Passports (Simulation)</h4>
                            
                            <div className="border border-dashed border-[#1E2D4580] hover:border-emerald-500/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#0B0F1A]">
                                <Upload className="w-5 h-5 text-slate-500 mb-1.5" />
                                <span className="text-[10px] text-slate-400 font-medium">Upload PDF Vaccination Card</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Log vaccine modal wizard */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#111827] border border-[#1E2D4580] rounded-2xl max-w-md w-full p-6 space-y-6 relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />

                            <div className="flex justify-between items-center border-b border-[#1E2D4580] pb-4">
                                <h3 className="font-display font-bold text-lg text-white">Log Immunization Dose</h3>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddImmunization} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Vaccine Name</label>
                                    <input
                                        type="text"
                                        value={vaxName}
                                        onChange={(e) => setVaxName(e.target.value)}
                                        placeholder="e.g. COVID-19 Bivalent Booster"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-emerald-500/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Dose Number</label>
                                        <input
                                            type="number"
                                            value={dose}
                                            onChange={(e) => setDose(e.target.value)}
                                            placeholder="1"
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-emerald-500/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Batch Number</label>
                                        <input
                                            type="text"
                                            value={batch}
                                            onChange={(e) => setBatch(e.target.value)}
                                            placeholder="MRN-908A"
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-emerald-500/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Healthcare Center / Facility</label>
                                    <input
                                        type="text"
                                        value={facility}
                                        onChange={(e) => setFacility(e.target.value)}
                                        placeholder="Saint Jude Wellness Center"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-emerald-500/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Administration Date</label>
                                    <input
                                        type="date"
                                        value={adminDate}
                                        onChange={(e) => setAdminDate(e.target.value)}
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-emerald-500/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)] mt-4"
                                >
                                    Log Immunization Dose
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
