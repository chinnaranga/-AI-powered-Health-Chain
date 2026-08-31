import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, Shield } from 'lucide-react';
import { toast } from '../components/Toast';
import { resetPassword } from '../firebase/auth';

export default function PatientForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your patient account email');
            return;
        }
        setLoading(true);
        try {
            await resetPassword(email);
            setSubmitted(true);
            toast.success('Password reset email sent. Please check your inbox.');
        } catch (err) {
            toast.error(err.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0E1A] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00C8D4]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00C8D4]/10 border border-[#00C8D4]/20 text-[#00C8D4] text-xs font-semibold uppercase tracking-wider mb-4">
                        <Shield className="w-4 h-4" />
                        Patient Health Portal
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Forgot Password?</h1>
                    <p className="text-slate-400 text-sm mt-2">
                        Enter your registered email address to receive password reset instructions.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl"
                >
                    {submitted ? (
                        <div className="text-center py-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Reset Link Sent</h3>
                            <p className="text-slate-400 text-xs leading-relaxed mb-6">
                                We sent a secure reset link to <span className="text-cyan-400 font-medium">{email}</span>. Please verify your inbox and follow instructions.
                            </p>
                            <Link
                                to="/patient/login"
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#00C8D4] hover:bg-[#00B4C0] text-[#0A0E1A] font-bold text-sm transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" /> Return to Patient Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Patient Registered Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="patient@example.com"
                                        className="w-full pl-11 pr-4 py-3 bg-[#1A2236] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-[#00C8D4] focus:ring-1 focus:ring-[#00C8D4] transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-4 bg-[#00C8D4] hover:bg-[#00B4C0] disabled:opacity-50 text-[#0A0E1A] font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00C8D4]/20"
                            >
                                {loading ? (
                                    <span>Sending Reset Link...</span>
                                ) : (
                                    <>
                                        <KeyRound className="w-4 h-4" /> Send Reset Link
                                    </>
                                )}
                            </button>

                            <div className="pt-4 border-t border-slate-800 text-center">
                                <Link
                                    to="/patient/login"
                                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Patient Login
                                </Link>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
