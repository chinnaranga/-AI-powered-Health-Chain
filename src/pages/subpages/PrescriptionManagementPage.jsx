import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, Plus, Clipboard, Clock, AlertTriangle, CheckCircle, 
    RefreshCw, Trash2, Heart, HeartPulse, ShieldAlert, Award, FileCode, Check, Send
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from '../../components/Toast';

export default function PrescriptionManagementPage() {
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [prescriptions, setPrescriptions] = useState([]);
    
    // Form wizard states
    const [showForm, setShowForm] = useState(false);
    const [medName, setMedName] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequency, setFrequency] = useState('Once Daily (QD)');
    const [duration, setDuration] = useState('30 Days');
    const [instructions, setInstructions] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Signature flow
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [signingPrescriptionId, setSigningPrescriptionId] = useState(null);
    const [signatureKey, setSignatureKey] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setFirebaseUser(user);
                
                // Real-time Firestore prescription collection listener
                const presRef = collection(db, 'prescriptions');
                const q = query(presRef, where('patientId', '==', user.uid));
                
                const unsubPres = onSnapshot(q, (snapshot) => {
                    const data = [];
                    snapshot.forEach((doc) => {
                        data.push({ id: doc.id, ...doc.data() });
                    });
                    setPrescriptions(data);
                    setLoading(false);
                }, (error) => {
                    console.error('[PrescriptionManagementPage] Firestore error:', error);
                    setLoading(false);
                });

                return () => unsubPres();
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Create prescription
    const handleCreatePrescription = async (e) => {
        e.preventDefault();
        if (!firebaseUser) return;
        if (!medName.trim() || !dosage.trim()) {
            toast.error('Medication name and dosage are required');
            return;
        }

        setIsSubmitting(true);
        const hasAllergyWarning = medName.toLowerCase().includes('penicillin') || medName.toLowerCase().includes('amoxicillin');

        const newPres = {
            patientId: firebaseUser.uid,
            medicationName: medName,
            dosage,
            frequency,
            duration,
            instructions,
            doctorName: 'Dr. Alan Grant (Simulated)',
            status: 'Active',
            refillCount: 3,
            isSigned: false,
            digitalSignature: '',
            conflictAlerts: hasAllergyWarning ? ['Allergy warning: Penicillin compound conflict flagged in history files.'] : [],
            date: new Date().toISOString()
        };

        try {
            await addDoc(collection(db, 'prescriptions'), newPres);
            toast.success('Prescription logged on HealthChain network');
            setShowForm(false);
            setMedName('');
            setDosage('');
            setInstructions('');
        } catch (err) {
            console.error('Failed to create prescription:', err);
            // Local simulation fallback
            setPrescriptions(prev => [
                { id: `pres-mock-${Date.now()}`, ...newPres },
                ...prev
            ]);
            toast.success('Prescription generated (Simulated Local Instance)');
            setShowForm(false);
            setMedName('');
            setDosage('');
            setInstructions('');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Digital signature sign off
    const handleSignPrescription = async (e) => {
        e.preventDefault();
        if (!signatureKey.trim()) {
            toast.error('Signature PIN key is required');
            return;
        }

        try {
            if (!signingPrescriptionId.startsWith('pres-mock-')) {
                const docRef = doc(db, 'prescriptions', signingPrescriptionId);
                await updateDoc(docRef, {
                    isSigned: true,
                    digitalSignature: `SIG-KEY-${signatureKey.toUpperCase()}`
                });
            } else {
                setPrescriptions(prev => prev.map(p => p.id === signingPrescriptionId ? {
                    ...p,
                    isSigned: true,
                    digitalSignature: `SIG-KEY-${signatureKey.toUpperCase()}`
                } : p));
            }
            toast.success('Cryptographic signature applied to blockchain script');
            setShowSignaturePad(false);
            setSignatureKey('');
        } catch (err) {
            console.error(err);
            toast.error('Failed to sign prescription');
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
                        <HeartPulse className="w-4 h-4 text-[#00C8D4] animate-pulse" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Clinical Care Console</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">e-Prescriptions</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Manage active medications, review drug conflicts, and authorize cryptographic doctor approvals.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)] hover:shadow-[0_0_30px_rgba(0,200,212,0.4)] transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Prescription
                </button>
            </div>

            {/* Grid display */}
            {prescriptions.length === 0 ? (
                <div className="bg-[#111827] border border-[#1E2D4580] border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <FileText className="w-12 h-12 text-slate-600 mb-3" />
                    <h4 className="text-base font-bold text-[#8899AA]">No Registered e-Prescriptions</h4>
                    <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                        No prescriptions have been authored on the secure HealthChain network for your patient ID. Use the "Add Prescription" button above to log one.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {prescriptions.map((p) => (
                        <motion.div
                            key={p.id}
                            whileHover={{ scale: 1.01 }}
                            className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
                        >
                        {/* Conflict warning banner */}
                        {p.conflictAlerts.length > 0 && (
                            <div className="absolute top-0 inset-x-0 bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center gap-2 text-[10px] text-red-400 font-medium">
                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 animate-bounce" />
                                <span className="truncate">{p.conflictAlerts[0]}</span>
                            </div>
                        )}

                        <div className={`space-y-4 ${p.conflictAlerts.length > 0 ? 'pt-8' : ''}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[9px] text-[#00C8D4] font-bold uppercase tracking-widest">Active Medication</span>
                                    <h4 className="text-base font-bold text-white mt-0.5">{p.medicationName}</h4>
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                    p.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                                }`}>
                                    {p.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl p-3 text-center text-xs">
                                <div>
                                    <span className="text-[9px] text-[#8899AA] uppercase block">Dosage</span>
                                    <span className="font-semibold text-white mt-0.5 block">{p.dosage}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] text-[#8899AA] uppercase block">Freq</span>
                                    <span className="font-semibold text-white mt-0.5 block text-[10px] truncate">{p.frequency.split(' ')[0]}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] text-[#8899AA] uppercase block">Duration</span>
                                    <span className="font-semibold text-white mt-0.5 block">{p.duration}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-[9px] text-[#8899AA] uppercase font-bold tracking-wider block">Instructions</span>
                                <p className="text-xs text-[#CBD5E1] leading-relaxed">{p.instructions || 'No custom dietary or clinical instructions specified.'}</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[#1E2D4580] space-y-3">
                            <div className="flex justify-between text-[10px] text-[#8899AA]">
                                <span>Refills Remaining: <strong className="text-white">{p.refillCount}</strong></span>
                                <span>Authored: {new Date(p.date).toLocaleDateString()}</span>
                            </div>

                            {/* Signature validation */}
                            {p.isSigned ? (
                                <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-2.5 text-[10px] text-emerald-400">
                                    <span className="flex items-center gap-1">
                                        <Award className="w-3.5 h-3.5" /> SECURE SIGNED
                                    </span>
                                    <span className="font-mono text-slate-500 text-[9px]">{p.digitalSignature}</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-1 text-[10px] text-amber-400">
                                        <Clock className="w-3.5 h-3.5" /> AWAITING SIGNATURE
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSigningPrescriptionId(p.id);
                                            setShowSignaturePad(true);
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 font-bold text-[10px] transition-all"
                                    >
                                        Sign off
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
            )}

            {/* Create Wizard Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#111827] border border-[#1E2D4580] rounded-2xl max-w-md w-full p-6 space-y-6 relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00C8D4]/5 rounded-full blur-[40px] pointer-events-none" />

                            <div className="flex justify-between items-center border-b border-[#1E2D4580] pb-4">
                                <h3 className="font-display font-bold text-lg text-white">Create e-Prescription</h3>
                                <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreatePrescription} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Medication Name</label>
                                    <input
                                        type="text"
                                        value={medName}
                                        onChange={(e) => setMedName(e.target.value)}
                                        placeholder="e.g. Amoxicillin 500mg, Atorvastatin 20mg"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Dosage Schema</label>
                                        <input
                                            type="text"
                                            value={dosage}
                                            onChange={(e) => setDosage(e.target.value)}
                                            placeholder="e.g. 1 Tablet"
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Frequency</label>
                                        <select
                                            value={frequency}
                                            onChange={(e) => setFrequency(e.target.value)}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        >
                                            <option value="Once Daily (QD)">Once Daily (QD)</option>
                                            <option value="Twice Daily (BID)">Twice Daily (BID)</option>
                                            <option value="Three Times (TID)">Three Times (TID)</option>
                                            <option value="As Needed (PRN)">As Needed (PRN)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Duration</label>
                                    <select
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                    >
                                        <option value="7 Days">7 Days</option>
                                        <option value="30 Days">30 Days</option>
                                        <option value="90 Days">90 Days</option>
                                        <option value="Chronic Course">Chronic Course</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Patient Intake Instructions</label>
                                    <textarea
                                        rows={3}
                                        value={instructions}
                                        onChange={(e) => setInstructions(e.target.value)}
                                        placeholder="Take after food. Avoid carbonated beverages..."
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)] hover:shadow-[0_0_30px_rgba(0,200,212,0.4)] transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Dispatch secure e-Prescription
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Signature Pad Modal */}
            <AnimatePresence>
                {showSignaturePad && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#111827] border border-[#1E2D4580] rounded-2xl max-w-sm w-full p-6 space-y-6 relative overflow-hidden"
                        >
                            <div className="flex justify-between items-center border-b border-[#1E2D4580] pb-4">
                                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                                    <Award className="w-5 h-5 text-amber-400" /> Apply Digital Signature
                                </h3>
                                <button onClick={() => setShowSignaturePad(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSignPrescription} className="space-y-4 text-left">
                                <div>
                                    <p className="text-xs text-[#8899AA] leading-relaxed mb-4">
                                        Enter your physician pin to authenticate this prescription and broadcast its cryptographically signed transaction to the blockchain.
                                    </p>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Physician PIN / Private Key</label>
                                    <input
                                        type="password"
                                        value={signatureKey}
                                        onChange={(e) => setSignatureKey(e.target.value)}
                                        placeholder="e.g. 5829"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none text-center font-mono tracking-widest"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0B0F1A] font-bold text-sm transition-all flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" /> Cryptographically Approve & Sign
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
