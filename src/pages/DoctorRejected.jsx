import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, Stethoscope, LogOut, Mail, HelpCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function DoctorRejected() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        navigate('/login/doctor', { replace: true });
    };

    return (
        <div className="min-h-screen bg-[#050914] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-red-500/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-red-500/[0.04] blur-[120px]" />
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
            </div>

            {/* Header */}
            <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-white tracking-wide">HealthChain</h1>
                        <p className="text-[11px] text-red-400 font-mono uppercase tracking-wider">Clinical Verification Portal</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                </button>
            </header>

            {/* Main Card */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-xl bg-[#0B1120]/90 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 sm:p-10 shadow-2xl shadow-red-950/20 text-center"
                >
                    {/* Status Badge */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 mb-6">
                        <XCircle className="w-8 h-8" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-3">
                        Registration Not Approved
                    </h2>

                    <p className="text-sm text-slate-300 leading-relaxed mb-6">
                        Your doctor account registration was reviewed by the hospital administration and could not be approved at this time.
                    </p>

                    <div className="bg-[#070C18] border border-white/[0.08] rounded-xl p-4 text-xs text-left mb-6 space-y-2">
                        <div className="flex justify-between border-b border-white/[0.04] pb-2">
                            <span className="text-slate-500">Account Email</span>
                            <span className="text-white font-mono">{user?.email || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/[0.04] pb-2">
                            <span className="text-slate-500">Account Status</span>
                            <span className="text-red-400 font-semibold uppercase">Rejected</span>
                        </div>
                        <div className="flex justify-between pt-1">
                            <span className="text-slate-500">Action Required</span>
                            <span className="text-slate-300">Contact System Administrator</span>
                        </div>
                    </div>

                    <p className="text-xs text-slate-400 mb-8">
                        If you believe this is an error or wish to provide updated medical licensure documentation, please reach out to your department administrator or contact compliance support.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                            onClick={handleLogout}
                            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Return to Login</span>
                        </button>
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 text-center py-6 text-[11px] text-slate-500 border-t border-white/[0.04]">
                HealthChain Enterprise Clinical Security • Verification Department
            </footer>
        </div>
    );
}
