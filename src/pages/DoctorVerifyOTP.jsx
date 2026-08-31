import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, KeyRound, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from '../components/Toast';

export default function DoctorVerifyOTP() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || 'dr.smith@hospital.org';
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = (e) => {
        e.preventDefault();
        if (otp.length < 6) {
            toast.error('Please enter a 6-digit authentication code');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success('Security code verified. Please proceed to log in.');
            navigate('/doctor/login');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-navy-950 flex flex-col md:flex-row font-sans">
            {/* Left Panel */}
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
                        <h3 className="text-navy-50 text-base font-bold">Two-Factor Security Verification</h3>
                        <p className="text-xs text-navy-400 leading-relaxed">
                            Verify your 6-digit security token dispatched to your institutional account to authenticate access.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center p-6 relative">
                <div className="w-full max-w-sm relative z-10">
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-100/50 border border-sage-600/20 text-sage-600 text-xs font-semibold uppercase tracking-wider mb-4">
                            <ShieldCheck className="w-4 h-4" />
                            Multi-Factor Verification
                        </div>
                        <h2 className="text-2xl font-bold text-navy-50 mb-2">Enter Verification Code</h2>
                        <p className="text-sm text-navy-400">Code dispatched to <span className="text-sage-600 font-medium">{email}</span></p>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-navy-800 rounded-2xl p-6 shadow-xl">
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">6-Digit Security Token</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    required
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    placeholder="123456"
                                    className="w-full bg-white border border-navy-800 rounded-lg px-4 py-3.5 text-center font-mono text-xl tracking-[0.4em] text-navy-50 focus:outline-none focus:border-sage-600 transition-all placeholder-navy-600"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-lg bg-sage-600 text-white font-bold text-sm hover:bg-sage-700 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <span>Verifying Code...</span> : <><KeyRound className="w-4 h-4" /> Verify Token</>}
                            </button>

                            <div className="pt-4 border-t border-navy-800 text-center">
                                <Link to="/doctor/login" className="inline-flex items-center gap-2 text-xs font-semibold text-navy-400 hover:text-sage-600 transition-colors">
                                    <ArrowLeft className="w-4 h-4" /> Back to Doctor Login
                                </Link>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
