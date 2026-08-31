import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import useAuthStore from '../store/authStore';
import { toast } from '../components/Toast';
import { 
    User, Stethoscope, Building2, Shield, Lock, 
    ArrowRight, Loader2, Cpu, CheckCircle 
} from 'lucide-react';

export default function SelectRole() {
    const navigate = useNavigate();
    const { user, setRole, logout, isLoading } = useAuthStore();
    const [selected, setSelected] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            navigate('/login', { replace: true });
        }
    }, [isLoading, user, navigate]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-[#070f1a] text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-sage-500" />
            </div>
        );
    }

    const handleSelectRole = async () => {
        if (!selected) {
            toast.error("Please select a role to proceed.");
            return;
        }

        setIsSubmitting(true);
        try {
            const uid = user.uid;
            const userDocRef = doc(db, 'users', uid);
            
            // Save selected role in Firestore
            await updateDoc(userDocRef, {
                role: selected,
                lastLoginAt: serverTimestamp()
            });

            // Update local storage and store state
            setRole(selected);

            // Update cached profile
            const cacheKey = `hc_profile_${uid}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                try {
                    const cachedData = JSON.parse(cached);
                    cachedData.role = selected;
                    localStorage.setItem(cacheKey, JSON.stringify(cachedData));
                } catch (e) {}
            }

            toast.success(`Identity bound as ${selected === 'patient' ? 'Patient' : selected === 'doctor' ? 'Doctor' : 'Clinical Staff'}`);
            
            // Redirect to appropriate dashboard
            navigate(`/dashboard/${selected}`);
        } catch (err) {
            console.error("Failed to select role:", err);
            toast.error(err.message || "Failed to initialize identity node.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = async () => {
        await logout();
        navigate('/login');
    };

    const rolesList = [
        {
            id: 'patient',
            title: 'Patient Node',
            icon: User,
            color: 'from-emerald-500/20 to-teal-500/20',
            borderColor: 'group-hover:border-emerald-500/30',
            glowColor: 'rgba(16, 185, 129, 0.15)',
            badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            description: 'Access personal health records, authorize medical sharing, and track vital telemetry logs.',
        },
        {
            id: 'doctor',
            title: 'Doctor Node',
            icon: Stethoscope,
            color: 'from-amber-500/20 to-orange-500/20',
            borderColor: 'group-hover:border-amber-500/30',
            glowColor: 'rgba(184, 144, 71, 0.15)',
            badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            description: 'Inspect patient-approved records, issue digital prescriptions, and record session audits.',
        },
        {
            id: 'clinical',
            title: 'Clinical Staff',
            icon: Building2,
            color: 'from-blue-500/20 to-indigo-500/20',
            borderColor: 'group-hover:border-blue-500/30',
            glowColor: 'rgba(59, 130, 246, 0.15)',
            badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            description: 'Manage clinic stations, process token authorization requests, and coordinate health data.',
        }
    ];

    return (
        <div className="min-h-screen bg-[#070f1a] text-white flex flex-col items-center justify-center p-6 relative font-sans overflow-hidden">
            {/* Tech Background Grid */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(0, 200, 212, 0.05) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl relative z-10 flex flex-col items-center"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <Cpu className="w-6 h-6 text-[#00C8D4]" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                        Initialize Ledger Identity
                    </h1>
                    <p className="text-sm text-[#6B83A6] mt-3 max-w-lg mx-auto">
                        To secure the healthcare node infrastructure, select your role once. This binding maps your Google account permanently to your ledger scope.
                    </p>
                </div>

                {/* Role selection Cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-10">
                    {rolesList.map((roleItem) => {
                        const Icon = roleItem.icon;
                        const isChosen = selected === roleItem.id;
                        return (
                            <motion.div
                                key={roleItem.id}
                                whileHover={{ y: -4, scale: 1.01 }}
                                onClick={() => setSelected(roleItem.id)}
                                className={`group cursor-pointer rounded-2xl bg-[#0F1C30]/50 border backdrop-blur-xl p-6 transition-all duration-300 relative ${
                                    isChosen 
                                    ? 'border-[#00C8D4] shadow-[0_0_30px_rgba(0,200,212,0.15)] bg-[#0F1C30]' 
                                    : 'border-[#1D2F4A] hover:border-slate-600'
                                }`}
                                style={{
                                    boxShadow: isChosen ? `0 0 30px ${roleItem.glowColor}` : 'none'
                                }}
                            >
                                <div className="absolute top-4 right-4">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                        isChosen ? 'border-[#00C8D4] bg-[#00C8D4]' : 'border-slate-600'
                                    }`}>
                                        {isChosen && <CheckCircle className="w-4 h-4 text-[#070f1a] stroke-[3]" />}
                                    </div>
                                </div>

                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${roleItem.color} border border-white/5 flex items-center justify-center mb-6`}>
                                    <Icon className={`w-6 h-6 ${isChosen ? 'text-[#00C8D4]' : 'text-slate-300'}`} />
                                </div>

                                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    {roleItem.title}
                                </h3>
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border mb-4 ${roleItem.badgeColor}`}>
                                    {roleItem.id}
                                </span>
                                
                                <p className="text-xs text-[#6B83A6] leading-relaxed">
                                    {roleItem.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Info block */}
                <div className="w-full max-w-xl p-4 rounded-xl bg-[#0B0F1A] border border-[#1D2F4A] flex gap-3 items-start mb-8 text-xs text-[#6B83A6] leading-relaxed">
                    <Shield className="w-5 h-5 text-[#00C8D4] shrink-0 mt-0.5" />
                    <div>
                        <strong className="text-white">Security Bound:</strong> Once set, role transformations require authorization from a network auditor. Ensure your role maps correctly to your workplace credentials.
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                    <button 
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-3 rounded-lg border border-[#1D2F4A] hover:bg-[#1D2F4A] text-slate-300 font-semibold transition-all"
                    >
                        Sign Out / Cancel
                    </button>
                    <button 
                        onClick={handleSelectRole}
                        disabled={isSubmitting || !selected}
                        className="w-full sm:w-auto px-10 py-3 rounded-lg bg-[#00C8D4] text-[#070f1a] font-bold hover:bg-[#00E5F0] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,200,212,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Binding Node...
                            </>
                        ) : (
                            <>
                                Authorize Role <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
