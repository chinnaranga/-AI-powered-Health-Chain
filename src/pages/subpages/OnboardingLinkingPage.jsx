import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    UserPlus, ShieldCheck, Mail, Phone, Calendar, ArrowRight, ArrowLeft, 
    Hospital, Eye, Info, Sparkles, Brain, CheckCircle, Smartphone
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import useAuthStore from '../../store/authStore';


export default function OnboardingLinkingPage() {
    const [user, setUser] = useState(null);
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [onboarded, setOnboarded] = useState(false);

    // Form inputs
    const [fullName, setFullName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [phone, setPhone] = useState('');
    const [abhaId, setAbhaId] = useState('');
    const [selectedHospital, setSelectedHospital] = useState('Saint Jude Cardiac Center');
    const [shareConsent, setShareConsent] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Check if already onboarded
                const docRef = doc(db, 'users', currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().onboardingComplete) {
                    setOnboarded(true);
                }
            }
        });
        return () => unsub();
    }, []);

    const handleNext = () => setStep(prev => Math.min(4, prev + 1));
    const handleBack = () => setStep(prev => Math.max(1, prev - 1));

    const handleCompleteOnboarding = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const updatePayload = {
                fullName,
                birthDate,
                phone,
                abhaId: abhaId || `ABHA-${Math.floor(100000 + Math.random() * 900000)}`,
                preferredHospital: selectedHospital,
                shareConsentEnabled: shareConsent,
                onboardingComplete: true,
                updatedAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', user.uid), updatePayload, { merge: true });

            // Sync auth store
            const { setFirebaseUser, role } = useAuthStore.getState();
            await setFirebaseUser({ ...user, ...updatePayload }, role);

            setOnboarded(true);
            setSaving(false);
        } catch (err) {
            console.error('Error completing onboarding:', err);
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-8 flex items-center justify-center">
            {onboarded ? (
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-[#111827] border border-[#1E2D4580] rounded-3xl p-8 text-center space-y-6"
                >
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                        <CheckCircle className="w-8 h-8 animate-bounce" />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white">Onboarding Completed!</h3>
                    <p className="text-sm text-[#8899AA] leading-relaxed">
                        Your decentralized Health ID is mapped successfully. Your records are synced and protected by cryptographic consent.
                    </p>
                    <button
                        onClick={() => setOnboarded(false)}
                        className="w-full py-3 rounded-xl bg-[#00C8D4] text-[#0B0F1A] font-bold text-sm hover:shadow-[0_0_20px_rgba(0,200,212,0.3)] transition-all"
                    >
                        Configure Preferences Again
                    </button>
                </motion.div>
            ) : (
                <div className="max-w-2xl w-full bg-[#111827] border border-[#1E2D4580] rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[480px]">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00C8D4]/5 rounded-full blur-[40px] pointer-events-none" />

                    {/* Progress indicator */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-[#00C8D4]" />
                            <span className="text-xs font-bold text-slate-400 font-mono">Step {step} of 4</span>
                        </div>
                        <div className="w-32 bg-[#0B0F1A] h-1.5 rounded-full overflow-hidden border border-[#1E2D4580]">
                            <div 
                                className="bg-gradient-to-r from-teal-500 to-[#00C8D4] h-full transition-all duration-300"
                                style={{ width: `${(step / 4) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-4 text-left"
                                >
                                    <h3 className="text-xl font-bold text-white">Basic Profile Details</h3>
                                    <p className="text-xs text-[#8899AA]">Provide verified details to customize your medical ledger setup.</p>
                                    
                                    <div className="space-y-3 pt-2">
                                        <div>
                                            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Full Legal Name</label>
                                            <input 
                                                type="text" 
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="e.g. Sarah Miller"
                                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Birth Date</label>
                                            <input 
                                                type="date" 
                                                value={birthDate}
                                                onChange={(e) => setBirthDate(e.target.value)}
                                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-4 text-left"
                                >
                                    <h3 className="text-xl font-bold text-white">Map Your Health ID</h3>
                                    <p className="text-xs text-[#8899AA]">Map your sovereign ABHA Health ID or generate a randomized clinic ID tag.</p>

                                    <div className="space-y-4 pt-2">
                                        <div>
                                            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Existing Health ID (Optional)</label>
                                            <input 
                                                type="text" 
                                                value={abhaId}
                                                onChange={(e) => setAbhaId(e.target.value)}
                                                placeholder="e.g. ABHA-109283"
                                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Phone Number</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="tel" 
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    placeholder="+1 (555) 019-2831"
                                                    className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-4 text-left"
                                >
                                    <h3 className="text-xl font-bold text-white">Select Primary Provider</h3>
                                    <p className="text-xs text-[#8899AA]">Connect your previous clinical footprints with partner healthcare centers.</p>

                                    <div className="pt-2">
                                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Primary Care Facility</label>
                                        <select
                                            value={selectedHospital}
                                            onChange={(e) => setSelectedHospital(e.target.value)}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        >
                                            <option value="Saint Jude Cardiac Center">Saint Jude Cardiac Center</option>
                                            <option value="Apex Specialist Clinics">Apex Specialist Clinics</option>
                                            <option value="Metro General Hospital">Metro General Hospital</option>
                                        </select>
                                    </div>

                                    <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-4 flex gap-3 text-xs text-teal-400">
                                        <Hospital className="w-5 h-5 flex-shrink-0" />
                                        <span>Linking to this provider automatically schedules encrypted history synchronization.</span>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-4 text-left"
                                >
                                    <h3 className="text-xl font-bold text-white">Consent Walkthrough</h3>
                                    <p className="text-xs text-[#8899AA]">Verify parameters of medical record data usage rights.</p>

                                    <div className="bg-[#0B0F1A] border border-[#1E2D4580] p-4 rounded-xl space-y-3 text-xs">
                                        <div className="flex items-start gap-2.5">
                                            <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5" />
                                            <p className="text-slate-300">Your health data is cryptographically protected and never shared without active tokens.</p>
                                        </div>

                                        <label className="flex items-center gap-2 cursor-pointer pt-2">
                                            <input 
                                                type="checkbox" 
                                                checked={shareConsent}
                                                onChange={(e) => setShareConsent(e.target.checked)}
                                                className="accent-teal-500 rounded"
                                            />
                                            <span className="text-[#CBD5E1] font-semibold">Enable Global Auditable Access Consent</span>
                                        </label>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Bottom Nav actions */}
                    <div className="flex justify-between items-center mt-8 pt-4 border-t border-[#1E2D4580]">
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#1E2D4580] text-xs font-bold hover:text-white disabled:opacity-30"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>

                        {step < 4 ? (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)]"
                            >
                                Next <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleCompleteOnboarding}
                                disabled={saving}
                                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                            >
                                {saving ? 'Syncing...' : 'Complete & Launch Tour'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
