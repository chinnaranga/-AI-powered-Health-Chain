import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, Mail, ArrowLeft, CheckCircle2, Shield, KeyRound } from 'lucide-react';
import { toast } from '../components/Toast';
import { resetPassword } from '../firebase/auth';

export default function DoctorForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your institutional email address');
            return;
        }
        setLoading(true);
        try {
            await resetPassword(email);
            setSubmitted(true);
            toast.success('Password reset link sent to your institutional email.');
        } catch (err) {
            toast.error(err.message || 'Failed to send password reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-navy-950 flex flex-col md:flex-row font-sans">
            {/* Left Panel: Enterprise Identity */}
            <div className="hidden md:flex flex-col justify-between w-[400px] lg:w-[450px] bg-white border-r border-navy-800 p-10 relative">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 rounded-lg bg-sage-100/50 border border-sage-600/20 flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-sage-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-navy-50 tracking-wide">HealthChain</h1>
                            <p className="text-[10px] text-sage-600 font-bold uppercase tracking-widest">Doctor Workstation</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-navy-50 text-base font-bold">Self-Service Account Recovery</h3>
                        <p className="text-xs text-navy-400 leading-relaxed">
                            Restoring access to your medical account is cryptographically verified to maintain patient record security and compliance.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel: Reset Form */}
            <div className="flex-1 flex items-center justify-center p-6 relative">
                <div className="w-full max-w-sm relative z-10">
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-100/50 border border-sage-600/20 text-sage-600 text-xs font-semibold uppercase tracking-wider mb-4">
                            <Shield className="w-4 h-4" />
                            Doctor Access Security
                        </div>
                        <h2 className="text-2xl font-bold text-navy-50 mb-2">Reset Passphrase</h2>
                        <p className="text-sm text-navy-400">Enter your medical institution email below</p>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-navy-800 rounded-2xl p-6 shadow-xl">
                        {submitted ? (
                            <div className="text-center py-2">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-bold text-navy-50 mb-2">Reset Instructions Dispatched</h3>
                                <p className="text-navy-400 text-xs leading-relaxed mb-6">
                                    We sent a verification link to <span className="text-sage-600 font-medium">{email}</span>. Please verify your email inbox.
                                </p>
                                <button
                                    onClick={() => navigate('/doctor/verify-otp', { state: { email } })}
                                    className="w-full py-3 rounded-lg bg-sage-600 hover:bg-sage-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                                >
                                    Proceed to Verify OTP <ArrowLeft className="w-4 h-4 rotate-180" />
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Institutional Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-white border border-navy-800 rounded-lg pl-10 pr-4 py-3 text-sm text-navy-50 focus:outline-none focus:border-sage-600 transition-all placeholder-navy-600"
                                            placeholder="dr.smith@hospital.org"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-lg bg-sage-600 text-white font-bold text-sm hover:bg-sage-700 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <span>Sending...</span> : <><KeyRound className="w-4 h-4" /> Send Reset Link</>}
                                </button>

                                <div className="pt-4 border-t border-navy-800 text-center">
                                    <Link to="/doctor/login" className="inline-flex items-center gap-2 text-xs font-semibold text-navy-400 hover:text-sage-600 transition-colors">
                                        <ArrowLeft className="w-4 h-4" /> Return to Doctor Login
                                    </Link>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
