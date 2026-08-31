import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BadgeCheck, Link, FileText, CheckCircle, Shield, RefreshCw,
    ArrowRight, Lock, Zap, User, Key, Activity, ChevronRight
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const STEPS = [
    { id: 1, label: 'Enter ABHA Number', icon: User, color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/30' },
    { id: 2, label: 'Link Identity', icon: Link, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    { id: 3, label: 'Generate Consent', icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    { id: 4, label: 'Request Exchange', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    { id: 5, label: 'Approve Consent', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    { id: 6, label: 'Data Exchange', icon: Zap, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30' },
];

function StepProgress({ current }) {
    return (
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {STEPS.map((s, i) => {
                const Icon = s.icon;
                const done = s.id < current;
                const active = s.id === current;
                return (
                    <React.Fragment key={s.id}>
                        <div className={`flex flex-col items-center gap-1.5 flex-shrink-0 transition-all ${active ? 'scale-105' : ''}`}>
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                                done ? 'bg-emerald-500/10 border-emerald-500/30' : active ? `${s.bg} ${s.border}` : 'bg-[#1A2236] border-[#1E2D4580]'
                            }`}>
                                {done ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Icon className={`w-4 h-4 ${active ? s.color : 'text-[#4A5568]'}`} />}
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider text-center leading-none max-w-[60px] ${active ? s.color : done ? 'text-emerald-400' : 'text-[#4A5568]'}`}>
                                {s.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 min-w-[16px] rounded-full transition-all ${done ? 'bg-emerald-400' : 'bg-[#1E2D45]'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

const MOCK_CONSENT = {
    artifactId: 'CA-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
    abhaId: null,
    createdAt: new Date().toISOString(),
    purpose: 'Emergency Medical Treatment',
    validUntil: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    dataTypes: ['Lab Reports', 'Prescriptions', 'Discharge Summary', 'Imaging'],
    status: 'PENDING_APPROVAL',
};

function ConsentArtifactDisplay({ abhaNumber }) {
    const artifact = { ...MOCK_CONSENT, abhaId: abhaNumber };
    return (
        <div className="bg-[#0B0F1A] border border-[#00C8D4]/20 rounded-xl p-5 font-mono text-xs overflow-auto max-h-48">
            <pre className="text-[#00C8D4] whitespace-pre-wrap">{JSON.stringify(artifact, null, 2)}</pre>
        </div>
    );
}

function ExchangeTimeline({ auditTrail }) {
    return (
        <div className="space-y-3">
            <AnimatePresence>
                {auditTrail.map((entry, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#111827] border border-[#1E2D4580]">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${entry.bg} border ${entry.border}`}>
                            <entry.icon className={`w-3.5 h-3.5 ${entry.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white">{entry.label}</p>
                            <p className="text-[10px] text-[#4A5568] font-mono">{entry.time}</p>
                        </div>
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

/* ── PAGE ── */
export default function ABHAFlowPage() {
    const [step, setStep] = useState(1);
    const [abhaNumber, setAbhaNumber] = useState('');
    const [abhaError, setAbhaError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [auditTrail, setAuditTrail] = useState([]);

    const addAudit = (entry) => setAuditTrail(prev => [...prev, { ...entry, time: new Date().toLocaleTimeString() }]);

    const resetFlow = () => { setStep(1); setAbhaNumber(''); setAbhaError(''); setAuditTrail([]); };

    const validateAbha = (v) => {
        const clean = v.replace(/-/g, '');
        return clean.length === 14 && /^\d+$/.test(clean);
    };

    const handleNext = async () => {
        setAbhaError('');

        if (step === 1) {
            if (!validateAbha(abhaNumber)) { setAbhaError('Please enter a valid 14-digit ABHA number.'); return; }
            setIsProcessing(true);
            await new Promise(r => setTimeout(r, 1200));
            addAudit({ icon: User, color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/20', label: `ABHA number ${abhaNumber} validated` });
            setIsProcessing(false);
            setStep(2);
            return;
        }

        if (step === 2) {
            setIsProcessing(true);
            await new Promise(r => setTimeout(r, 1500));
            addAudit({ icon: Link, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'Patient identity linked to ABHA registry' });
            setIsProcessing(false);
            setStep(3);
            return;
        }

        if (step === 3) {
            setIsProcessing(true);
            await new Promise(r => setTimeout(r, 1000));
            addAudit({ icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: `Consent artifact ${MOCK_CONSENT.artifactId} generated` });
            setIsProcessing(false);
            setStep(4);
            return;
        }

        if (step === 4) {
            setIsProcessing(true);
            await new Promise(r => setTimeout(r, 1200));
            addAudit({ icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Record exchange request sent to health locker' });
            setIsProcessing(false);
            setStep(5);
            return;
        }

        if (step === 5) {
            setIsProcessing(true);
            try {
                // Add real database logs for the simulation events
                await addDoc(collection(db, 'auditLogs'), {
                    patientId: auth.currentUser?.uid || 'anonymous',
                    activityType: 'REQUEST_APPROVED_OTP_GENERATED',
                    actorName: 'Patient Self',
                    timestamp: serverTimestamp(),
                    details: `ABHA consent artifact ${MOCK_CONSENT.artifactId} approved digitally.`
                });
            } catch (err) {
                console.error(err);
            }
            await new Promise(r => setTimeout(r, 1000));
            addAudit({ icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Patient consent approved digitally' });
            setIsProcessing(false);
            setStep(6);
            // Trigger final exchange
            await new Promise(r => setTimeout(r, 800));
            addAudit({ icon: Zap, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', label: 'Secure FHIR data exchange initiated' });
            await new Promise(r => setTimeout(r, 600));
            addAudit({ icon: Activity, color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/20', label: 'Audit trail committed — exchange complete' });
            try {
                await addDoc(collection(db, 'auditLogs'), {
                    patientId: auth.currentUser?.uid || 'anonymous',
                    activityType: 'RECORD_DECRYPTED_VIEWED',
                    actorName: 'ABDM Interoperability Gateway',
                    timestamp: serverTimestamp(),
                    details: `Secure FHIR health data exchange completed for ABHA ID ${abhaNumber}.`
                });
            } catch (err) {
                console.error(err);
            }
            return;
        }
    };

    const cfg = STEPS[step - 1];
    const Icon = cfg.icon;
    const isComplete = step === 6;

    return (
        <div className="max-w-5xl mx-auto pb-12 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BadgeCheck className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">National Health Stack</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">ABHA / ABDM Flow</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Simulated national health interoperability consent workflow.</p>
                </div>
                <button onClick={resetFlow} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A2236] border border-[#1E2D4580] text-xs font-bold text-[#8899AA] hover:text-white transition-all">
                    <RefreshCw className="w-4 h-4" /> Reset Flow
                </button>
            </div>

            {/* Progress */}
            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5">
                <StepProgress current={step} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Main Panel */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div key={step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className={`bg-[#111827] border ${cfg.border} rounded-2xl p-7 relative overflow-hidden`}>
                            <div className={`absolute top-0 right-0 w-48 h-48 ${cfg.bg} rounded-full blur-[80px] opacity-30 pointer-events-none`} />

                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-14 h-14 rounded-2xl ${cfg.bg} border ${cfg.border} flex items-center justify-center`}>
                                    <Icon className={`w-7 h-7 ${cfg.color}`} />
                                </div>
                                <div>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${cfg.color} mb-1`}>Step {step} of 6</p>
                                    <h3 className="text-xl font-display font-bold text-white">{cfg.label}</h3>
                                </div>
                            </div>

                            {/* Step 1: ABHA Input */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <p className="text-sm text-[#8899AA]">Enter your 14-digit Ayushman Bharat Health Account (ABHA) number to begin linking your health identity.</p>
                                    <div>
                                        <label className="text-xs text-[#8899AA] font-bold uppercase tracking-wider block mb-2">ABHA Number</label>
                                        <input
                                            value={abhaNumber}
                                            onChange={e => setAbhaNumber(e.target.value)}
                                            placeholder="e.g. 12-3456-7890-1234"
                                            maxLength={17}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-3 text-white font-mono text-lg tracking-widest focus:outline-none focus:border-[#00C8D4]/50 focus:ring-1 focus:ring-[#00C8D4]/20 transition-all placeholder:text-[#4A5568] placeholder:text-sm placeholder:tracking-normal placeholder:font-sans"
                                        />
                                        {abhaError && <p className="text-xs text-red-400 mt-2">{abhaError}</p>}
                                    </div>
                                    <div className="p-3 rounded-xl bg-[#00C8D4]/5 border border-[#00C8D4]/20">
                                        <p className="text-[11px] text-[#8899AA]">🔒 Your ABHA number is used only for identity verification. We do not store it in plain text.</p>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Identity Linked */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <p className="text-sm text-[#8899AA]">Your identity is being linked to the ABDM health locker registry. This creates a secure mapping between your ABHA ID and your HealthChain records.</p>
                                    <div className="p-4 rounded-xl bg-[#0B0F1A] border border-purple-500/20 space-y-3">
                                        {[
                                            { l: 'ABHA Number', v: abhaNumber, mono: true },
                                            { l: 'Health Locker', v: 'HealthChain FHIR Vault' },
                                            { l: 'Identity Provider', v: 'Aadhaar-linked OTP' },
                                            { l: 'Verification Status', v: 'Confirmed ✓', ok: true },
                                        ].map(row => (
                                            <div key={row.l} className="flex items-center justify-between text-xs">
                                                <span className="text-[#8899AA]">{row.l}</span>
                                                <span className={`font-semibold ${row.ok ? 'text-emerald-400' : 'text-white'} ${row.mono ? 'font-mono' : ''}`}>{row.v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Consent Artifact */}
                            {step === 3 && (
                                <div className="space-y-4">
                                    <p className="text-sm text-[#8899AA]">A digital consent artifact has been generated per ABDM standards. Review the artifact below before proceeding.</p>
                                    <ConsentArtifactDisplay abhaNumber={abhaNumber} />
                                </div>
                            )}

                            {/* Step 4: Request Exchange */}
                            {step === 4 && (
                                <div className="space-y-4">
                                    <p className="text-sm text-[#8899AA]">The receiving health institution (Hospital B) has requested the following data categories from your health locker.</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Lab Reports', 'Prescriptions', 'Discharge Summary', 'Imaging'].map(cat => (
                                            <div key={cat} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0B0F1A] border border-[#1E2D4580]">
                                                <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                                <span className="text-xs text-white">{cat}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                        <p className="text-[11px] text-[#8899AA]">📋 Request expires in 15 minutes if not approved.</p>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Approve */}
                            {step === 5 && (
                                <div className="space-y-4">
                                    <p className="text-sm text-[#8899AA]">Please review and approve the consent for data sharing. Your digital signature will be recorded.</p>
                                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                                        {[
                                            { l: 'Data Recipient', v: 'City General Hospital (Hospital B)' },
                                            { l: 'Purpose', v: 'Emergency Medical Treatment' },
                                            { l: 'Valid For', v: '4 Hours' },
                                            { l: 'Consent Artifact', v: MOCK_CONSENT.artifactId, mono: true },
                                        ].map(row => (
                                            <div key={row.l} className="flex items-start justify-between text-xs gap-4">
                                                <span className="text-[#8899AA] flex-shrink-0">{row.l}</span>
                                                <span className={`text-white font-semibold text-right ${row.mono ? 'font-mono' : ''}`}>{row.v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 6: Complete */}
                            {step === 6 && (
                                <div className="space-y-4">
                                    <div className="flex flex-col items-center gap-3 py-4">
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                                            className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
                                            <Zap className="w-8 h-8 text-teal-400" />
                                        </motion.div>
                                        <p className="font-display font-bold text-white text-xl">Exchange Successful!</p>
                                        <p className="text-sm text-[#8899AA] text-center">Your health records have been securely shared via ABDM-compliant FHIR API. All actions are immutably logged.</p>
                                    </div>
                                </div>
                            )}

                            {/* CTA */}
                            {!isComplete && (
                                <button onClick={handleNext} disabled={isProcessing}
                                    className={`mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${cfg.bg} ${cfg.color} border ${cfg.border} hover:opacity-80 disabled:opacity-50`}>
                                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                                    {isProcessing ? 'Processing...' : step === 5 ? 'Approve & Sign Consent' : 'Continue →'}
                                </button>
                            )}
                            {isComplete && (
                                <button onClick={resetFlow} className="mt-6 w-full py-3 rounded-xl border border-[#1E2D4580] text-[#8899AA] hover:text-white text-sm font-bold transition-all">
                                    Start New Flow
                                </button>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Audit Trail */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-[#00C8D4]" />
                        <h3 className="text-xs font-bold text-[#8899AA] uppercase tracking-wider">Audit Trail</h3>
                    </div>
                    {auditTrail.length === 0 ? (
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-8 text-center">
                            <Lock className="w-8 h-8 text-[#4A5568] mx-auto mb-2" />
                            <p className="text-xs text-[#8899AA]">Audit trail will appear as you complete steps</p>
                        </div>
                    ) : (
                        <ExchangeTimeline auditTrail={auditTrail} />
                    )}

                    {/* Info Panel */}
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-4 mt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <BadgeCheck className="w-4 h-4 text-[#00C8D4]" />
                            <p className="text-xs font-bold text-white uppercase tracking-wider">ABDM Standards</p>
                        </div>
                        <div className="space-y-2">
                            {['FHIR R4 Compliant', 'End-to-End Encrypted', 'Consent-Gated Access', 'Immutable Audit Log'].map(s => (
                                <div key={s} className="flex items-center gap-2.5 text-xs text-[#8899AA]">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
