import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, CheckCircle2, AlertCircle, Loader2, Shield, 
    ArrowRight, LogOut, RefreshCw 
} from 'lucide-react';
import { auth, db } from '../firebase/config';
import { sendEmailVerification } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import useAuthStore from '../store/authStore';
import { toast } from '../components/Toast';
import ParticleBackground from '../components/homepage/ParticleBackground';

export default function VerifyEmail() {
    const navigate = useNavigate();
    const { user, role, logout, setFirebaseUser } = useAuthStore();
    const [isChecking, setIsChecking] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [isActivated, setIsActivated] = useState(false);

    // Auto-countdown timer for resending email verification
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Check if user is already verified on page load
    useEffect(() => {
        const checkInitialVerification = async () => {
            if (auth.currentUser) {
                await auth.currentUser.reload();
                if (auth.currentUser.emailVerified) {
                    setIsActivated(true);
                    
                    // Synchronize the emailVerified state immediately to Firestore
                    if (role && role !== 'clinical') {
                        try {
                            const docRef = doc(db, 'users', auth.currentUser.uid);
                            await updateDoc(docRef, { emailVerified: true });
                        } catch (err) {
                            console.warn('Sync emailVerified state on load error:', err);
                        }
                    }
                }
            }
        };
        checkInitialVerification();
    }, [role]);

    // Handles manual verification checking
    const handleCheckVerification = async () => {
        if (!auth.currentUser) {
            toast.error('No active session found. Please log in.');
            navigate('/login');
            return;
        }

        setIsChecking(true);
        try {
            await auth.currentUser.reload();
            if (auth.currentUser.emailVerified) {
                toast.success('Email verified successfully!');
                
                // Sync verification state to Firestore database
                if (role && role !== 'clinical') {
                    try {
                        const docRef = doc(db, 'users', auth.currentUser.uid);
                        await updateDoc(docRef, { emailVerified: true });
                        console.info('[VerifyPage] Email status synced to Firestore.');
                    } catch (firestoreErr) {
                        console.warn('Failed to update Firestore document with emailVerified:', firestoreErr);
                    }
                }

                // Update ZUSTAND store state
                await setFirebaseUser(auth.currentUser, role);
                
                // Trigger success screen state
                setIsActivated(true);
            } else {
                toast.warning('Email is still unverified. Please check your spam folder or click Resend.');
            }
        } catch (err) {
            console.error('Check verification error:', err);
            toast.error(err.message || 'Verification check failed.');
        } finally {
            setIsChecking(false);
        }
    };

    // Resends Firebase Auth email verification
    const handleResendEmail = async () => {
        if (!auth.currentUser) return;
        setIsResending(true);
        try {
            await sendEmailVerification(auth.currentUser);
            toast.success('A new verification email has been sent to your inbox.');
            setResendTimer(60); // Rate-limiting timer of 60 seconds
        } catch (err) {
            console.error('Resend verification email error:', err);
            toast.error(err.message || 'Failed to resend verification email.');
        } finally {
            setIsResending(false);
        }
    };

    // Cancels and logs the user out
    const handleCancel = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            toast.error('Logout failed.');
        }
    };

    // Transitions verified users into their corresponding dashboards
    const handleEnterPortal = () => {
        if (role) {
            navigate(`/dashboard/${role}`, { replace: true });
        } else {
            navigate('/select-role', { replace: true });
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-6 pt-20 pb-12 bg-navy-950 text-slate-100">
            <ParticleBackground />

            {/* Glowing Ambient Ambient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 25, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="backdrop-blur-xl bg-[#0b0f19]/70 border border-slate-800/80 shadow-black/40 shadow-2xl rounded-3xl p-8 lg:p-10 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {!isActivated ? (
                            /* ─── PENDING VERIFICATION SCREEN ─── */
                            <motion.div
                                key="pending-view"
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 15 }}
                                transition={{ duration: 0.3 }}
                                className="text-center"
                            >
                                {/* Glow Pulsing Icon */}
                                <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse shadow-neon-sm">
                                    <Mail className="w-8 h-8 text-cyan-400" />
                                </div>

                                <h2 className="text-2xl font-bold font-display text-white mb-2">Please Verify Your Email</h2>
                                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                                    We have sent a verification link to <span className="font-semibold text-cyan-400 font-mono break-all">{auth.currentUser?.email || user?.email}</span>. Click the link inside the email to activate your account.
                                </p>

                                <div className="rounded-2xl bg-cyan-950/20 border border-cyan-500/10 p-4 text-xs text-slate-400 leading-relaxed flex gap-3 text-left mb-6">
                                    <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                    <span>To preserve clinical compliance and audit fidelity on the health registry, all provider and patient nodes require email verification prior to network authorization.</span>
                                </div>

                                <div className="space-y-3">
                                    {/* Check Verification Status */}
                                    <button
                                        onClick={handleCheckVerification}
                                        disabled={isChecking || isResending}
                                        className="w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:shadow-cyan-500/10 hover:shadow-lg hover:-translate-y-0.5 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                    >
                                        {isChecking ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Verifying Identity...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="w-4 h-4" />
                                                Check Verification Status
                                            </>
                                        )}
                                    </button>

                                    {/* Resend Link */}
                                    <button
                                        onClick={handleResendEmail}
                                        disabled={isChecking || isResending || resendTimer > 0}
                                        className="w-full bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-white py-3 rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        {isResending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : resendTimer > 0 ? (
                                            `Resend link in ${resendTimer}s`
                                        ) : (
                                            'Resend Verification Email'
                                        )}
                                    </button>

                                    {/* Cancel / Switch Accounts */}
                                    <button
                                        onClick={handleCancel}
                                        className="w-full text-slate-500 hover:text-slate-300 py-3 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        Sign out and use another account
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            /* ─── ACTIVATED/SUCCESS SCREEN ─── */
                            <motion.div
                                key="success-view"
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                transition={{ duration: 0.3 }}
                                className="text-center"
                            >
                                {/* Animated Check Circle */}
                                <motion.div
                                    initial={{ scale: 0.6, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                                    className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full mx-auto mb-6 flex items-center justify-center shadow-neon-emerald"
                                >
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                </motion.div>

                                <h2 className="text-2xl font-bold font-display text-white mb-2">Your Account is Activated</h2>
                                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                                    Your email address has been successfully verified. Your cryptographical node is now activated and ready on the HealthChain network.
                                </p>

                                {/* List of unlocked features */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-left text-xs text-slate-400 space-y-3 mb-6">
                                    <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Activated Ledger Services:</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        <span>Personal Medical Record Envelopes (Vault)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        <span>Consensual Data Tunneling & Authorization Logs</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        <span>HIPAA-Compliant AI Medical Summary Engine</span>
                                    </div>
                                </div>

                                {/* Enter Portal Button */}
                                <button
                                    onClick={handleEnterPortal}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-emerald-500/10 hover:shadow-lg hover:-translate-y-0.5 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer group"
                                >
                                    Access Your Portal Dashboard
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
