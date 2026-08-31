import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, ArrowRight, CheckCircle, Clock, Zap,
    Shield, Eye, FileText, AlertTriangle, Activity,
    RefreshCw, User, Key, Lock
} from 'lucide-react';

const STEPS = [
    { id: 1, label: 'Patient at Hospital A', description: 'Patient admitted with hypertension. Records uploaded to HealthChain.' },
    { id: 2, label: 'Emergency at Hospital B', description: 'Patient rushed to Hospital B. Dr. Kumar requests emergency record access.' },
    { id: 3, label: 'Patient Approves Consent', description: 'Patient receives push notification and approves cross-hospital data sharing.' },
    { id: 4, label: 'OTP Verification', description: 'Hospital B doctor enters OTP. Blockchain verifies and grants session.' },
    { id: 5, label: 'Records Transferred', description: 'Full health record securely decrypted and shared. All actions logged on-chain.' },
];

const ACTIVITY_LOG = [
    { step: 1, icon: FileText, color: 'text-[#00C8D4]', text: 'Record "ECG_2025.pdf" uploaded at Hospital A', time: '09:12:04' },
    { step: 2, icon: AlertTriangle, color: 'text-red-400', text: 'Emergency access request from Dr. Kumar (Hospital B)', time: '14:38:21' },
    { step: 3, icon: CheckCircle, color: 'text-emerald-400', text: 'Patient approved cross-hospital consent', time: '14:38:55' },
    { step: 4, icon: Key, color: 'text-purple-400', text: 'OTP 582910 verified — session established', time: '14:39:12' },
    { step: 5, icon: Shield, color: 'text-[#00C8D4]', text: 'Records decrypted and delivered to Hospital B securely', time: '14:39:18' },
];

/* ── Hospital Card ── */
function HospitalCard({ name, tag, records, status, color, bg, border, side }) {
    return (
        <motion.div initial={{ opacity: 0, x: side === 'left' ? -30 : 30 }} animate={{ opacity: 1, x: 0 }}
            className={`bg-[#111827] border ${border} rounded-2xl p-6 relative overflow-hidden flex-1`}>
            <div className={`absolute top-0 ${side === 'left' ? 'right' : 'left'}-0 w-40 h-40 ${bg} rounded-full blur-[60px] opacity-20 pointer-events-none`} />
            <div className="flex items-center gap-3 mb-5">
                <div className={`w-12 h-12 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
                    <Building2 className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                    <p className="text-lg font-display font-bold text-white">{name}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${bg} ${color} border ${border}`}>{tag}</span>
                </div>
            </div>
            <div className="space-y-3">
                {records.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#0B0F1A] border border-[#1E2D4580]">
                        <FileText className={`w-4 h-4 ${color} flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{r.name}</p>
                            <p className="text-[10px] text-[#8899AA]">{r.type}</p>
                        </div>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${r.available ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[#1A2236] text-[#4A5568] border border-[#1E2D4580]'}`}>
                            {r.available ? 'Available' : 'Locked'}
                        </span>
                    </div>
                ))}
            </div>
            <div className={`mt-5 flex items-center gap-2 p-3 rounded-xl border ${border} ${bg}`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${status === 'active' ? 'bg-emerald-400' : status === 'pending' ? 'bg-amber-400' : 'bg-red-400'}`} />
                <span className={`text-xs font-bold ${color}`}>{status === 'active' ? 'System Active' : status === 'pending' ? 'Awaiting Access' : 'Transfer Complete'}</span>
            </div>
        </motion.div>
    );
}

/* ── Step Indicator ── */
function StepIndicator({ steps, current }) {
    return (
        <div className="flex items-center gap-2 flex-wrap justify-center">
            {steps.map((s, i) => (
                <React.Fragment key={s.id}>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        s.id < current ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : s.id === current ? 'bg-[#00C8D4]/15 border-[#00C8D4]/30 text-[#00C8D4]'
                        : 'bg-[#1A2236] border-[#1E2D4580] text-[#4A5568]'
                    }`}>
                        {s.id < current ? <CheckCircle className="w-3.5 h-3.5" /> : <span className="w-4 h-4 flex items-center justify-center rounded-full border border-current text-[9px]">{s.id}</span>}
                        <span className="hidden sm:inline">{s.label}</span>
                    </div>
                    {i < steps.length - 1 && <ArrowRight className="w-3 h-3 text-[#1E2D45] flex-shrink-0" />}
                </React.Fragment>
            ))}
        </div>
    );
}

/* ── PAGE ── */
export default function MultiHospitalSimPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isRunning, setIsRunning] = useState(false);
    const [showConsent, setShowConsent] = useState(false);
    const [log, setLog] = useState([ACTIVITY_LOG[0]]);

    const hospitalARecords = [
        { name: 'ECG Report 2025.pdf', type: 'Cardiology', available: currentStep >= 5 },
        { name: 'Blood Panel Dec 2024', type: 'Lab Report', available: currentStep >= 5 },
        { name: 'Discharge Summary', type: 'Clinical Notes', available: currentStep >= 5 },
    ];

    const hospitalBRecords = [
        { name: 'Trauma Assessment', type: 'Emergency', available: true },
        { name: 'ECG Report 2025.pdf', type: 'Transferred ✓', available: currentStep >= 5 },
    ];

    const advanceStep = async () => {
        if (currentStep >= STEPS.length) return;
        if (currentStep === 2) { setShowConsent(true); return; }
        setIsRunning(true);
        await new Promise(r => setTimeout(r, 900));
        const next = currentStep + 1;
        setCurrentStep(next);
        if (ACTIVITY_LOG[next - 1]) setLog(prev => [...prev, ACTIVITY_LOG[next - 1]]);
        setIsRunning(false);
    };

    const handleConsent = (approved) => {
        setShowConsent(false);
        if (!approved) return;
        const next = currentStep + 1;
        setCurrentStep(next);
        if (ACTIVITY_LOG[next - 1]) setLog(prev => [...prev, ACTIVITY_LOG[next - 1]]);
    };

    const resetSim = () => { setCurrentStep(1); setLog([ACTIVITY_LOG[0]]); setShowConsent(false); };

    const isComplete = currentStep >= STEPS.length;

    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Interoperability Demo</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Multi-Hospital Simulation</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Simulate a real cross-hospital health record exchange flow.</p>
                </div>
                <button onClick={resetSim} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A2236] border border-[#1E2D4580] text-xs font-bold text-[#8899AA] hover:text-white hover:border-[#00C8D4]/30 transition-all">
                    <RefreshCw className="w-4 h-4" /> Reset
                </button>
            </div>

            {/* Step Indicator */}
            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5">
                <StepIndicator steps={STEPS} current={currentStep} />
                <AnimatePresence mode="wait">
                    <motion.div key={currentStep} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className="text-center mt-4">
                        <p className="text-sm font-bold text-white">{STEPS[currentStep - 1]?.label}</p>
                        <p className="text-xs text-[#8899AA] mt-1">{STEPS[currentStep - 1]?.description}</p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Hospitals */}
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                <HospitalCard
                    name="Hospital A" tag="Source" side="left"
                    records={hospitalARecords}
                    status={currentStep >= 5 ? 'done' : 'active'}
                    color="text-[#00C8D4]" bg="bg-[#00C8D4]/10" border="border-[#00C8D4]/20"
                />

                {/* Transfer Arrow */}
                <div className="flex items-center justify-center flex-shrink-0">
                    <motion.div animate={currentStep >= 3 && currentStep < 5 ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                        className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${currentStep >= 5 ? 'border-emerald-400 bg-emerald-500/10' : currentStep >= 3 ? 'border-[#00C8D4] bg-[#00C8D4]/10' : 'border-[#1E2D45] bg-[#111827]'}`}>
                        <ArrowRight className={`w-6 h-6 ${currentStep >= 5 ? 'text-emerald-400' : currentStep >= 3 ? 'text-[#00C8D4]' : 'text-[#4A5568]'}`} />
                    </motion.div>
                </div>

                <HospitalCard
                    name="Hospital B" tag="Destination" side="right"
                    records={hospitalBRecords}
                    status={currentStep >= 5 ? 'done' : 'pending'}
                    color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20"
                />
            </div>

            {/* Consent Modal */}
            <AnimatePresence>
                {showConsent && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#111827] border border-amber-500/40 rounded-2xl p-8 max-w-md w-full shadow-[0_0_60px_rgba(245,158,11,0.15)]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <p className="font-display font-bold text-white text-lg">Consent Required</p>
                                    <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Emergency Access Request</p>
                                </div>
                            </div>
                            <p className="text-sm text-[#CBD5E1] mb-2"><span className="text-white font-semibold">Dr. Arun Kumar</span> at <span className="text-white font-semibold">City General Hospital</span> is requesting emergency access to your health records.</p>
                            <p className="text-xs text-[#8899AA] mb-6">Reason: Critical trauma management. Duration: 4 hours.</p>
                            <div className="flex gap-3">
                                <button onClick={() => handleConsent(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/10 transition-all">
                                    Deny
                                </button>
                                <button onClick={() => handleConsent(true)}
                                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0B0F1A] text-sm font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all">
                                    Approve Access
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Advance Step */}
                {!isComplete ? (
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 flex flex-col items-center justify-center gap-4">
                        <p className="text-sm text-[#8899AA] text-center">Click to advance to the next step in the simulation</p>
                        <button onClick={advanceStep} disabled={isRunning || showConsent}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#00C8D4] hover:bg-[#00E5F0] text-[#0B0F1A] font-bold transition-all shadow-[0_0_20px_rgba(0,200,212,0.3)] disabled:opacity-50">
                            {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            {isRunning ? 'Processing...' : `Step ${currentStep + 1}: ${STEPS[currentStep]?.label}`}
                        </button>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-3">
                        <CheckCircle className="w-12 h-12 text-emerald-400" />
                        <p className="font-display font-bold text-white text-xl">Transfer Complete!</p>
                        <p className="text-sm text-emerald-400 text-center">All records securely exchanged. Audit trail committed to blockchain.</p>
                        <button onClick={resetSim} className="mt-2 px-6 py-2.5 rounded-xl border border-emerald-500/30 text-emerald-400 text-sm font-bold hover:bg-emerald-500/10 transition-all">
                            Run Again
                        </button>
                    </motion.div>
                )}

                {/* Activity Log */}
                <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4 text-[#00C8D4]" />
                        <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">Audit Log</h3>
                        <span className="ml-auto flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] text-emerald-400 font-bold uppercase">Live</span>
                        </span>
                    </div>
                    <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                        <AnimatePresence>
                            {log.map((entry, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                    className="flex items-start gap-3 p-3 rounded-xl bg-[#0B0F1A] border border-[#1E2D4580]">
                                    <entry.icon className={`w-4 h-4 ${entry.color} flex-shrink-0 mt-0.5`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-white">{entry.text}</p>
                                        <p className="text-[10px] text-[#4A5568] font-mono mt-0.5">{entry.time}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
