import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
    Shield, Lock, Activity, ChevronRight, AlertCircle, CheckCircle,
    Eye, EyeOff, Key, Building2, MapPin, MonitorSmartphone, Stethoscope,
    User, Mail, ArrowLeft, ArrowRight, Loader2, FileKey2
} from 'lucide-react';
import {
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { googleAuthFallback } from '../firebase/auth';
import useAuthStore from '../store/authStore';
import { toast } from '../components/Toast';

export default function ClinicalRegister() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form state
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        hospital: 'Central Medical Hub',
        department: 'Cardiology',
        clinicalId: ''
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async () => {
        clearError();
        try {
            const payload = {
                name: form.name,
                email: form.email,
                password: form.password,
                role: 'clinical',
                hospital: form.hospital,
                department: form.department,
                clinicalId: form.clinicalId
            };
            await register(payload);
            setShowSuccess(true);
            toast.success('Clinical Staff registered. Please verify your email address to activate access.');
            setTimeout(() => navigate('/verify-email', { replace: true }), 1500);
        } catch (err) {
            toast.error(err.message || 'Registration failed');
        }
    };

    const handleGoogleRegister = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const googlePayload = {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                photo: user.photoURL,
                role: 'clinical',
                hospital: form.hospital || 'Central Medical Hub',
                department: form.department || 'Cardiology',
                clinicalId: form.clinicalId || ''
            };

            let data;
            try {
                const res = await fetch('/api/google-auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(googlePayload),
                });
                data = await res.json();
                if (!res.ok) throw new Error(data.error || data.message || 'Google sign-up failed');
            } catch (apiErr) {
                console.warn('Backend API offline, executing googleAuthFallback offline support:', apiErr);
                data = await googleAuthFallback(user, 'clinical', {
                    hospital: form.hospital || 'Central Medical Hub',
                    department: form.department || 'Cardiology',
                    clinicalId: form.clinicalId || ''
                });
            }

            localStorage.setItem('hc_token', data.token);
            localStorage.setItem('hc_role', data.role);
            if (data.walletAddress) localStorage.setItem('hc_wallet', data.walletAddress);

            toast.success(`Clinical account created for ${user.displayName?.split(' ')[0] || 'you'}!`);
            navigate('/dashboard/clinical');
        } catch (err) {
            console.error(err);
            if (err.code !== 'auth/popup-closed-by-user') {
                toast.error(err.message || 'Google signup failed');
            }
        }
    };

    const handleStep1 = (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (form.password.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }
        setStep(2);
    };

    const handleStep2 = (e) => {
        e.preventDefault();
        if (!form.hospital) {
            return toast.error('Facility name is required');
        }
        if (!form.clinicalId.trim()) {
            return toast.error('Clinical staff identification (Staff ID) is required');
        }
        setStep(3);
    };

    return (
        <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6 relative font-sans">

            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-[600px] h-[600px] bg-sage-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md bg-white border border-navy-800 rounded-2xl p-8 shadow-glass relative z-10"
            >
                {/* Success Overlay */}
                <AnimatePresence>
                    {showSuccess && (
                        <div className="absolute inset-0 z-50 rounded-2xl bg-white flex flex-col items-center justify-center text-center p-6">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                className="w-16 h-16 rounded-full border-2 border-sage-600/20 border-t-sage-600 mb-4"
                            />
                            <h3 className="text-lg font-bold text-navy-50">Initializing Clinician Access...</h3>
                            <p className="text-sm text-navy-400 mt-2">Syncing clinical nodes with global health ledger</p>
                        </div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-lg bg-sage-100/50 border border-sage-600/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-sage-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-navy-50 tracking-wide">HealthChain</h1>
                        <p className="text-[10px] text-sage-600 font-bold uppercase tracking-widest">Clinical Staff Register</p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Credentials */}
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-navy-50 mb-2">Create Staff Credentials</h2>
                                <p className="text-sm text-navy-400">Sign up for a clinical workspace node</p>
                            </div>

                            {error && (
                                <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-medium">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleStep1} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                                        <input
                                            type="text" required
                                            value={form.name} onChange={e => update('name', e.target.value)}
                                            className="w-full bg-white border border-navy-800 rounded-lg pl-10 pr-4 py-3 text-sm text-navy-50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all placeholder-navy-600"
                                            placeholder="Nurse Jane Miller"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Work Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                                        <input
                                            type="email" required
                                            value={form.email} onChange={e => update('email', e.target.value)}
                                            className="w-full bg-white border border-navy-800 rounded-lg pl-10 pr-4 py-3 text-sm text-navy-50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all placeholder-navy-600"
                                            placeholder="miller@hospital.org"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'} required
                                            value={form.password} onChange={e => update('password', e.target.value)}
                                            className="w-full bg-white border border-navy-800 rounded-lg pl-10 pr-10 py-3 text-sm text-navy-50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all placeholder-navy-600"
                                            placeholder="••••••••"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-50">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                                        <input
                                            type="password" required
                                            value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                                            className="w-full bg-white border border-navy-800 rounded-lg pl-10 pr-4 py-3 text-sm text-navy-50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all placeholder-navy-600"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button className="w-full py-3.5 mt-4 rounded-lg bg-sage-600 text-white font-bold text-sm hover:bg-sage-700 transition-colors flex justify-center shadow-soft hover:shadow-md gap-2">
                                    Continue <ChevronRight className="w-4 h-4" />
                                </button>
                            </form>

                            <div className="flex items-center gap-4 my-6">
                                <div className="flex-1 h-px bg-navy-800" />
                                <span className="text-xs text-navy-400 font-bold uppercase">Or</span>
                                <div className="flex-1 h-px bg-navy-800" />
                            </div>

                            <button
                                onClick={handleGoogleRegister}
                                type="button"
                                className="w-full py-3 rounded-lg bg-white border border-navy-200 text-navy-600 font-semibold text-sm flex items-center justify-center gap-3 hover:bg-navy-50 hover:border-navy-300 transition-all"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Sign Up with Google
                            </button>
                        </motion.div>
                    )}

                    {/* Step 2: Clinical Details */}
                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-navy-50 mb-2">Clinical Affiliation</h2>
                                <p className="text-sm text-navy-400">Define your active clinic unit</p>
                            </div>
                            <form onSubmit={handleStep2} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Hospital Center</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                                        <input
                                            type="text" required
                                            value={form.hospital} onChange={e => update('hospital', e.target.value)}
                                            className="w-full bg-white border border-navy-800 rounded-lg pl-10 pr-4 py-3 text-sm text-navy-50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all placeholder-navy-600"
                                            placeholder="Central Medical Hub"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Clinical Staff Identification (Staff ID)</label>
                                    <div className="relative">
                                        <FileKey2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                                        <input
                                            type="text" required
                                            value={form.clinicalId} onChange={e => update('clinicalId', e.target.value)}
                                            className="w-full bg-white border border-navy-800 rounded-lg pl-10 pr-4 py-3 text-sm text-navy-50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all placeholder-navy-600"
                                            placeholder="CLN-10492-NX"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Unit / Department</label>
                                    <select value={form.department} onChange={e => update('department', e.target.value)} className="w-full bg-white border border-navy-800 rounded-lg px-4 py-3 text-sm text-navy-50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all">
                                        <option value="Cardiology">Cardiology</option>
                                        <option value="Neurology">Neurology</option>
                                        <option value="Oncology">Oncology</option>
                                        <option value="Pediatrics">Pediatrics</option>
                                        <option value="Emergency Care">Emergency Care</option>
                                        <option value="Orthopedics">Orthopedics</option>
                                        <option value="General Medicine">General Medicine</option>
                                        <option value="Radiology">Radiology</option>
                                        <option value="Pathology">Pathology</option>
                                        <option value="Gynecology">Gynecology</option>
                                        <option value="Dermatology">Dermatology</option>
                                        <option value="Psychiatry">Psychiatry</option>
                                        <option value="Anesthesiology">Anesthesiology</option>
                                        <option value="Urology">Urology</option>
                                    </select>
                                </div>

                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setStep(1)} className="px-6 py-3.5 rounded-lg bg-white border border-navy-800 text-navy-400 font-semibold hover:text-navy-50 transition-colors flex items-center gap-2">
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </button>
                                    <button className="flex-1 py-3.5 rounded-lg bg-sage-600 text-white font-bold text-sm hover:bg-sage-700 transition-colors flex justify-center shadow-soft hover:shadow-md gap-2">
                                        Continue <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    
                </AnimatePresence>

                <p className="text-center text-sm text-navy-400 mt-6">
                    Registered Staff?{' '}
                    <Link to="/login/clinical" className="text-sage-600 hover:text-sage-700 font-semibold transition-colors">
                        Sign In Here
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
