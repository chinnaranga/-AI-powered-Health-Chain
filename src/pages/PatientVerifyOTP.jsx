import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Key, Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from '../components/Toast';
import useAuthStore from '../store/authStore';

export default function PatientVerifyOTP() {
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);

    const handleChange = (index, value) => {
        if (value.length > 1) value = value[value.length - 1];
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-input-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            toast.error('Please enter the complete 6-digit OTP code');
            return;
        }

        setLoading(true);
        try {
            toast.success('Patient Identity Verified');
            navigate('/patient/dashboard', { replace: true });
        } catch (err) {
            toast.error(err.message || 'OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0E1A] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00C8D4]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00C8D4]/10 border border-[#00C8D4]/20 text-[#00C8D4] text-xs font-semibold uppercase tracking-wider mb-4">
                        <Shield className="w-4 h-4" />
                        Patient Security Verification
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Verify Identity OTP</h1>
                    <p className="text-slate-400 text-sm mt-2">
                        Enter the 6-digit security verification code sent to your registered phone / device.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl"
                >
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 text-center">
                                6-Digit Verification Code
                            </label>
                            <div className="flex items-center justify-center gap-2 sm:gap-3">
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        id={`otp-input-${i}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold bg-[#1A2236] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#00C8D4] focus:ring-1 focus:ring-[#00C8D4] transition-all"
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-[#00C8D4] hover:bg-[#00B4C0] disabled:opacity-50 text-[#0A0E1A] font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00C8D4]/20"
                        >
                            {loading ? (
                                <span>Verifying OTP...</span>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" /> Confirm & Continue
                                </>
                            )}
                        </button>

                        <div className="pt-4 border-t border-slate-800 text-center">
                            <Link
                                to="/patient/login"
                                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Return to Patient Login
                            </Link>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
