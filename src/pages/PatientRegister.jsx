import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Lock, Eye, EyeOff, Shield, ArrowRight, ArrowLeft,
    Loader2, CheckCircle
} from 'lucide-react';
import {
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { googleAuthFallback } from '../firebase/auth';
import useAuthStore from '../store/authStore';
import { toast } from '../components/Toast';
import ParticleBackground from '../components/homepage/ParticleBackground';

export default function PatientRegister() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: '',
        email: '',
        role: 'patient',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const stepsList = [
        { id: 1, label: 'Identity' },
        { id: 2, label: 'Password' }
    ];

    const { register, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const handleSubmit = async () => {
        clearError();
        try {
            const payload = {
                name: form.name,
                email: form.email,
                password: form.password,
                role: 'patient',
            };
            await register(payload);
            sessionStorage.setItem('hc_is_new_user', 'true');
            setShowSuccess(true);
            toast.success('Patient account initialized. Proceeding to onboarding...');
            setTimeout(() => navigate('/patient/onboarding', { replace: true }), 1500);
        } catch (err) {
            toast.error(err.message || 'Registration failed');
        }
    };

    const handleGoogleRegister = async () => {
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const googlePayload = {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                photo: user.photoURL,
                role: 'patient',
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
                data = await googleAuthFallback(user, 'patient');
            }

            sessionStorage.setItem('hc_is_new_user', 'true');
            localStorage.setItem('hc_token', data.token);
            localStorage.setItem('hc_role', data.role);
            if (user.displayName) localStorage.setItem('hc_name', user.displayName);
            if (user.email) localStorage.setItem('hc_email', user.email);
            if (user.photoURL) localStorage.setItem('hc_photo', user.photoURL);
            if (data.walletAddress) localStorage.setItem('hc_wallet', data.walletAddress);
            
            toast.success(`Patient account created for ${user.displayName?.split(' ')[0] || 'you'}! Welcome to onboarding.`);
            navigate('/patient/onboarding');
        } catch (err) {
            console.error(err);
            if (err.code !== 'auth/popup-closed-by-user') {
                toast.error(err.message || 'Google sign-up failed');
            }
        }
    };

    const goToPasswordStep = () => {
        if (!form.name || !form.email) {
            toast.warning('Please enter your name and email');
            return;
        }
        setStep(2);
    };

    const handleCreateAccount = async () => {
        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (form.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        await handleSubmit();
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-6 pt-20 pb-12 bg-navy-950">
            <ParticleBackground />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-lg"
            >
                <div className="bg-white/90 backdrop-blur-xl border border-navy-800/80 shadow-card rounded-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sage-600 to-gold-500 flex items-center justify-center mx-auto mb-4 shadow-md shadow-sage-600/10">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-navy-50 font-display">Create Patient Account</h1>
                        <p className="text-sm text-navy-400 mt-2">Initialize your secure electronic health vault</p>
                    </div>

                    {/* Step Progress Indicator */}
                    <div className="flex items-center gap-2 mb-8">
                        {stepsList.map((s, idx) => (
                            <div key={s.id} className="flex-1 flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${step >= s.id
                                    ? 'bg-sage-600 border-sage-600 text-white'
                                    : 'bg-white border-navy-800 text-navy-400'
                                    }`}>
                                    {step > s.id ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                                </div>
                                <span className={`text-xs font-medium hidden sm:block ${step >= s.id ? 'text-navy-50' : 'text-navy-400'}`}>
                                    {s.label}
                                </span>
                                {idx < stepsList.length - 1 && (
                                    <div className="flex-1 h-px bg-navy-800 mx-2">
                                        <div className={`h-full transition-all duration-500 bg-sage-600 ${step > s.id ? 'w-full' : 'w-0'}`} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Success Overlay */}
                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 z-20 rounded-2xl bg-white/95 backdrop-blur-xl flex items-center justify-center"
                            >
                                <div className="text-center p-6">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        className="w-16 h-16 rounded-full border-2 border-sage-600/20 border-t-sage-600 mx-auto mb-4"
                                    />
                                    <h3 className="text-lg font-bold text-navy-50">Creating Cryptographic Wallet...</h3>
                                    <p className="text-sm text-navy-400 mt-2">Setting up patient access credentials</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {/* Step 1: Basic Identity */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-5"
                            >
                                {error && (
                                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                        <p>{error}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs text-navy-400 font-bold uppercase tracking-wider mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={e => update('name', e.target.value)}
                                            placeholder="Jane Doe"
                                            required
                                            className="w-full bg-white border border-navy-800 rounded-xl pl-10 pr-4 py-3 text-sm text-navy-50 placeholder-navy-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-navy-400 font-bold uppercase tracking-wider mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={e => update('email', e.target.value)}
                                            placeholder="jane.doe@example.com"
                                            required
                                            className="w-full bg-white border border-navy-800 rounded-xl pl-10 pr-4 py-3 text-sm text-navy-50 placeholder-navy-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    type="button"
                                    onClick={goToPasswordStep}
                                    className="w-full py-3.5 rounded-xl bg-sage-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-sage-700 transition-all shadow-soft hover:shadow-md"
                                >
                                    Create Account <ArrowRight className="w-4 h-4" />
                                </motion.button>
                            </motion.div>
                        )}

                        {/* Step 2: Password Credentials */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="block text-xs text-navy-400 font-bold uppercase tracking-wider mb-2">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="new-password"
                                            value={form.password}
                                            onChange={e => update('password', e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            className="w-full bg-white border border-navy-800 rounded-xl pl-10 pr-10 py-3 text-sm text-navy-50 placeholder-navy-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-50 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-navy-400 font-bold uppercase tracking-wider mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                                        <input
                                            type="password"
                                            autoComplete="new-password"
                                            value={form.confirmPassword}
                                            onChange={e => update('confirmPassword', e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="w-full bg-white border border-navy-800 rounded-xl pl-10 pr-4 py-3 text-sm text-navy-50 placeholder-navy-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                {form.confirmPassword && (
                                    <div className={`flex items-center gap-2 text-xs ${form.password === form.confirmPassword ? 'text-sage-600' : 'text-red-500'}`}>
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        {form.password === form.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="px-6 py-3.5 rounded-xl bg-white border border-navy-800 text-navy-50 font-semibold flex items-center gap-2 hover:bg-navy-900/30 transition-all"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        type="button"
                                        onClick={handleCreateAccount}
                                        className="flex-1 py-3.5 rounded-xl bg-sage-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-sage-700 transition-all shadow-soft hover:shadow-md"
                                    >
                                        Continue <ArrowRight className="w-4 h-4" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>

                    {/* OAuth Divider */}
                    {step === 1 && (
                        <>
                            <div className="flex items-center gap-3 my-6">
                                <div className="flex-1 h-px bg-navy-800" />
                                <span className="text-xs text-navy-400 font-semibold uppercase tracking-wider">Or Register With</span>
                                <div className="flex-1 h-px bg-navy-800" />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="button"
                                onClick={handleGoogleRegister}
                                className="w-full py-3 rounded-xl border border-navy-200 bg-white text-navy-600 font-semibold text-sm flex items-center justify-center gap-3 hover:bg-navy-50 hover:border-navy-300 transition-all"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Sign Up with Google
                            </motion.button>
                        </>
                    )}

                    <p className="text-center text-sm text-navy-400 mt-6">
                        Already have a portal?{' '}
                        <Link to="/login/patient" className="text-sage-600 hover:text-sage-700 font-semibold transition-colors">
                            Authenticate
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
