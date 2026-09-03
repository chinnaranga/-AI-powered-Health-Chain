import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Clock, ShieldAlert, Stethoscope, LogOut,
    RefreshCw, CheckCircle2, Building2, FileCheck2,
    ShieldCheck, ArrowRight, ExternalLink
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { toast } from '../components/Toast';
import { apiClient } from '../services/apiClient';

export default function DoctorPendingApproval() {
    const navigate = useNavigate();
    const { user, logout, setCurrentUser } = useAuthStore();
    const [isChecking, setIsChecking] = useState(false);

    const handleCheckStatus = async () => {
        try {
            setIsChecking(true);
            const res = await apiClient.get('/auth/me');
            if (res?.success && res?.user) {
                if (res.user.status === 'active') {
                    await setCurrentUser(res.user, 'doctor');
                    toast.success('Congratulations! Your doctor account has been approved.');
                    navigate('/doctor/dashboard', { replace: true });
                    return;
                } else if (res.user.status === 'rejected') {
                    await setCurrentUser(res.user, 'doctor');
                    navigate('/doctor/rejected', { replace: true });
                    return;
                } else {
                    toast.info('Account review is still in progress. Please check back shortly.');
                }
            }
        } catch (err) {
            toast.info('Verification in progress. Administrators review requests promptly.');
        } finally {
            setIsChecking(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login/doctor', { replace: true });
    };

    return (
        <div className="min-h-screen bg-[#050914] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-amber-500/30">
            {/* Background Ambient Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-amber-500/[0.04] blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-cyan-500/[0.03] blur-[120px]" />
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
            </div>

            {/* Top Navigation */}
            <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-white tracking-wide">HealthChain</h1>
                        <p className="text-[11px] text-amber-400/90 font-mono tracking-wider uppercase">Clinical Verification Portal</p>
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

            {/* Main Content Card */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-2xl bg-[#0B1120]/90 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 sm:p-10 shadow-2xl shadow-amber-950/20"
                >
                    {/* Status Pill */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider shadow-inner">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            <span>Doctor Approval Pending</span>
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
                            Verification in Progress
                        </h2>
                        <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                            Your doctor registration has been submitted to HealthChain administrators. To protect patient data integrity and comply with clinical privacy regulations, accounts undergo administrator review before dashboard access is activated.
                        </p>
                    </div>

                    {/* Credentials Preview Card */}
                    <div className="bg-[#070C18] border border-white/[0.08] rounded-xl p-5 mb-8">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                <FileCheck2 className="w-4 h-4 text-cyan-400" />
                                <span>Submitted Credentials</span>
                            </div>
                            <span className="text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                                Status: Awaiting Admin Approval
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                                <p className="text-slate-500 mb-0.5">Doctor Full Name</p>
                                <p className="text-white font-medium">{user?.name || user?.fullName || 'Doctor'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 mb-0.5">Email Address</p>
                                <p className="text-white font-mono">{user?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 mb-0.5">Specialty</p>
                                <p className="text-white font-medium">{user?.specialty || 'General Medicine'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 mb-0.5">Medical License Number</p>
                                <p className="text-white font-mono">{user?.licenseNumber || 'Verified in Review'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps List */}
                    <div className="space-y-3 mb-8 text-xs text-slate-300 bg-white/[0.02] p-4 rounded-xl border border-white/[0.04]">
                        <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>Administrator verifies medical license and hospital affiliation.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>Upon approval, access to clinical dashboard and patient records is immediately unlocked.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>You can click <strong>Check Status</strong> below at any time to verify real-time approval.</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <button
                            onClick={handleCheckStatus}
                            disabled={isChecking}
                            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                            <span>{isChecking ? 'Checking Approval Status...' : 'Check Approval Status'}</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white font-medium text-xs transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4 text-slate-400" />
                            <span>Log Out</span>
                        </button>
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 text-center py-6 text-[11px] text-slate-500 border-t border-white/[0.04]">
                HealthChain Enterprise Security & Verification Engine • Need assistance? Contact hospital system administrators.
            </footer>
        </div>
    );
}
