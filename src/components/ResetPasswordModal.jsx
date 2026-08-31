import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ArrowLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { auth, db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { toast } from './Toast';

export default function ResetPasswordModal({ isOpen, onClose, role = 'patient' }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    // Live validation states
    const emailError = email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) 
        ? 'Please enter a valid email address' 
        : '';

    // Resend countdown timer logic
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(t => t - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    if (!isOpen) return null;

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        const targetEmail = email.trim().toLowerCase();
        if (!targetEmail || emailError) {
            toast.error('Please enter a valid email address.');
            return;
        }

        setLoading(true);

        try {
            // Optional role pre-check with 2.5s timeout (non-blocking if client adblocker blocks Firestore)
            try {
                const checkPromise = (async () => {
                    if (role === 'clinical') {
                        const q = query(collection(db, 'clinical_users'), where('email', '==', targetEmail));
                        const querySnapshot = await getDocs(q);
                        return !querySnapshot.empty;
                    } else {
                        const q = query(collection(db, 'users'), where('email', '==', targetEmail));
                        const querySnapshot = await getDocs(q);
                        if (!querySnapshot.empty) {
                            const userDoc = querySnapshot.docs[0].data();
                            return (userDoc.role || 'patient') === role;
                        }
                        return true; // Fallback to true if record not found in users doc
                    }
                })();

                const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(true), 2500));
                const isRegistered = await Promise.race([checkPromise, timeoutPromise]);

                if (isRegistered === false) {
                    setLoading(false);
                    toast.error(`This email is not registered as a ${role === 'clinical' ? 'clinical staff member' : role}.`);
                    return;
                }
            } catch (fsErr) {
                console.warn('[ResetPasswordModal] Role check notice:', fsErr.message);
            }

            // Trigger Firebase Password Reset Email directly
            await sendPasswordResetEmail(auth, targetEmail);
            setSuccess(true);
            setResendTimer(30); // 30 second cooldown
            toast.success('Reset password link sent successfully!');
        } catch (err) {
            console.error('Password reset failed:', err);
            if (err.code === 'auth/user-not-found') {
                toast.error('No registered user found with this email address.');
            } else if (err.message && (err.message.includes('BLOCKED') || err.message.includes('network'))) {
                toast.error('Network request blocked by browser ad blocker. Please disable your ad blocker for this site.');
            } else {
                toast.error(err.message || 'Failed to send password reset email.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email.trim().toLowerCase());
            setResendTimer(30);
            toast.success('Reset link resent successfully!');
        } catch (err) {
            toast.error(err.message || 'Failed to send reset link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                {/* Backdrop Blur */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#060913]/60 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.25 }}
                    className="relative w-full max-w-[420px] bg-[#0b0f19]/90 border border-slate-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl text-white z-10"
                >
                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute right-4 top-4 p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/50 text-slate-400 hover:text-white transition-colors"
                        aria-label="Close Modal"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <AnimatePresence mode="wait">
                        {!success ? (
                            <motion.div
                                key="reset-request"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="mb-6 flex flex-col items-center text-center">
                                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                                        <Mail className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <h2 className="text-xl font-bold font-display">Reset Password</h2>
                                    <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                                        Enter your work email address to receive your passphrase reset link
                                    </p>
                                </div>

                                <form onSubmit={handleResetSubmit} className="space-y-4">
                                    <div className="relative">
                                        <input 
                                            type="email" 
                                            required 
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="peer w-full text-sm rounded-xl px-4 pt-5 pb-1.5 border border-slate-850 bg-[#121b2d]/60 text-white focus:border-cyan-500/50 outline-none transition-all"
                                            placeholder=" "
                                        />
                                        <label className="absolute left-4 top-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:font-normal peer-focus:top-1 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-cyan-400">
                                            Work Email
                                        </label>
                                        {emailError && (
                                            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {emailError}
                                            </p>
                                        )}
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={loading || !email || !!emailError}
                                        className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:shadow-neon transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>Send Reset Link</>
                                        )}
                                    </button>

                                    <button 
                                        type="button"
                                        onClick={onClose}
                                        className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white pt-2 transition-colors"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="reset-success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-emerald-400 animate-pulse" />
                                </div>

                                <h3 className="text-lg font-bold font-display mb-1">Email Dispatched</h3>
                                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                                    A reset link has been dispatched to <span className="font-semibold text-cyan-400">{email}</span>. Click the link in the message to reset your account credentials.
                                </p>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleResend}
                                        disabled={loading || resendTimer > 0}
                                        className="w-full bg-[#121b2d] border border-slate-800 text-slate-200 hover:text-white py-3.5 rounded-xl transition-colors hover:bg-slate-800 disabled:opacity-50 text-sm font-semibold"
                                    >
                                        {resendTimer > 0 ? `Resend Link (${resendTimer}s)` : 'Resend Reset Email'}
                                    </button>

                                    <button 
                                        onClick={() => {
                                            setSuccess(false);
                                            setEmail('');
                                            onClose();
                                        }}
                                        className="w-full text-slate-400 hover:text-white py-3 text-xs transition-colors"
                                    >
                                        Back to Sign In
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
