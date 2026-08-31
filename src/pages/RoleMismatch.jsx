import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { toast } from '../components/Toast';
import { ShieldAlert, LogOut, ArrowRight, UserCheck } from 'lucide-react';

export default function RoleMismatch() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { logout, setRole } = useAuthStore();

    const storedRole = searchParams.get('stored') || 'patient';
    const requestedRole = searchParams.get('requested') || 'doctor';

    const roleNames = {
        patient: 'Patient',
        doctor: 'Doctor',
        clinical: 'Clinical Staff',
        admin: 'Administrator'
    };

    const friendlyStored = roleNames[storedRole] || storedRole;
    const friendlyRequested = roleNames[requestedRole] || requestedRole;

    const handleProceedCorrect = () => {
        // Enforce the stored role into their local state session
        setRole(storedRole);
        toast.info(`Routing to your authorized ${friendlyStored} dashboard`);
        navigate(`/dashboard/${storedRole}`, { replace: true });
    };

    const handleSignOut = async () => {
        try {
            await logout();
            toast.success("Logged out successfully");
            navigate('/login', { replace: true });
        } catch (e) {
            console.error("Signout failure:", e);
        }
    };

    return (
        <div className="min-h-screen bg-[#070f1a] text-white flex flex-col items-center justify-center p-6 relative font-sans overflow-hidden">
            {/* Alert Background Mesh */}
            <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent h-[200px] -translate-y-1/2 animate-[pulse_4s_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md bg-[#0F1C30]/80 border border-red-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.1)] relative z-10 text-center backdrop-blur-xl"
            >
                {/* Warning Icon */}
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 relative">
                    <div className="absolute inset-0 rounded-2xl border border-red-500/30 blur-[2px] animate-pulse" />
                    <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold font-display text-white mb-2 tracking-tight">
                    Security Clearance Mismatch
                </h1>
                <p className="text-xs text-red-400 font-mono uppercase tracking-widest mb-6">
                    Role-Based Access Conflict Detected
                </p>

                {/* Error Banner Box */}
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/10 text-sm text-[#8899AA] leading-relaxed text-left mb-6 space-y-3">
                    <p className="font-semibold text-white">
                        This Google account is already registered as a <span className="text-red-400 font-bold">{friendlyStored}</span> account.
                    </p>
                    <p className="text-xs text-[#6B83A6]">
                        In accordance with HealthChain node audit standards, credential profiles are restricted to a single organizational role. You cannot access the <span className="text-slate-300 font-semibold">{friendlyRequested}</span> workspace using this identity.
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-3 w-full">
                    <button 
                        onClick={handleProceedCorrect}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(16,185,129,0.2)] transition-all"
                    >
                        <UserCheck className="w-4 h-4" />
                        Proceed to {friendlyStored} Dashboard <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <button 
                        onClick={handleSignOut}
                        className="w-full py-3.5 rounded-xl bg-[#0B0F1A] border border-[#1D2F4A] hover:bg-[#1D2F4A] hover:border-slate-600 text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out / Switch Accounts
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-[#1D2F4A] text-[10px] text-[#6B83A6] leading-relaxed">
                    Security ID check triggered from client node. Swapping profiles requires administrative audit log verification.
                </div>
            </motion.div>
        </div>
    );
}
