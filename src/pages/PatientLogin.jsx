import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Shield, Activity, Lock, Mail, Key, ArrowRight, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { toast } from '../components/Toast';
import ParticleBackground from '../components/homepage/ParticleBackground';
import { countryCodes } from '../utils/countryCodes';
import ResetPasswordModal from '../components/ResetPasswordModal';

export default function PatientLogin() {
    const navigate = useNavigate();
    const { login, loginGoogle, isAuthenticated, role, isLoading } = useAuthStore();
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            if (role) {
                navigate(`/dashboard/${role}`, { replace: true });
            } else {
                navigate('/select-role', { replace: true });
            }
        }
    }, [isAuthenticated, role, isLoading, navigate]);

    // Flow state
    const [step, setStep] = useState(1);
    const [loginMode, setLoginMode] = useState('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isResetOpen, setIsResetOpen] = useState(false);

    // Email state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Phone state
    const [selectedCountry, setSelectedCountry] = useState(countryCodes.find(c => c.code === 'US') || countryCodes[0]);
    const [phone, setPhone] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);

    // MFA/OTP state
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [countdown, setCountdown] = useState(167); // 2:47

    useEffect(() => {
        if (step === 2 && countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [step, countdown]);

    const handleIdentitySubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (loginMode === 'email') {
            if (!email || !password) {
                setError('Please enter email and password');
                return;
            }
            setLoading(true);
            try {
                await login(email, password, 'patient');
                toast.success('Successfully logged in');
                navigate('/dashboard/patient');
            } catch (err) {
                if (err.message?.startsWith('ROLE_MISMATCH:')) {
                    const storedRole = err.message.split(':')[1];
                    navigate(`/role-mismatch?stored=${storedRole}&requested=patient`);
                    return;
                }
                setError(err.message || 'Login failed');
                toast.error(err.message || 'Login failed');
            } finally {
                setLoading(false);
            }
        } else {
            if (!phone) {
                setError('Please enter phone number');
                return;
            }
            setLoading(true);
            try {
                let recaptchaVerifier = window.recaptchaVerifier;
                if (!recaptchaVerifier) {
                    const { setUpRecaptcha } = await import('../firebase/auth');
                    recaptchaVerifier = setUpRecaptcha('recaptcha-container');
                    window.recaptchaVerifier = recaptchaVerifier;
                }
                
                const fullPhone = `${selectedCountry.dial}${phone}`;
                const { loginPhone } = useAuthStore.getState();
                const confirmation = await loginPhone(fullPhone, recaptchaVerifier);
                
                setConfirmationResult(confirmation);
                setStep(2);
                setCountdown(167); // reset timer
            } catch (err) {
                setError(err.message || 'Failed to send OTP code');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleMfaSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            setError('Enter 6-digit code');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const { verifyPhoneOtp } = useAuthStore.getState();
            await verifyPhoneOtp(confirmationResult, code, 'patient');
            toast.success('Successfully logged in');
            navigate('/dashboard/patient');
        } catch (err) {
            if (err.message?.startsWith('ROLE_MISMATCH:')) {
                const storedRole = err.message.split(':')[1];
                navigate(`/role-mismatch?stored=${storedRole}&requested=patient`);
                return;
            }
            setError(err.message || 'Invalid verification code');
            toast.error(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setIsGoogleLoading(true);
            setError('');
            await loginGoogle('patient');
            toast.success('Successfully logged in');
            navigate('/dashboard/patient');
        } catch (err) {
            if (err.message?.startsWith('ROLE_MISMATCH:')) {
                const storedRole = err.message.split(':')[1];
                navigate(`/role-mismatch?stored=${storedRole}&requested=patient`);
                return;
            }
            setError(err.message || 'Google sign-in failed');
            toast.error(err.message || 'Google sign-in failed');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value.slice(-1);
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    return (
        <div className="relative min-h-screen flex bg-navy-950 overflow-hidden">
            <ParticleBackground />

            {/* Left Panel - Branding & Benefits */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative z-10 border-r border-navy-800 bg-white/80 backdrop-blur-md">
                <div>
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-12 h-12 rounded-xl bg-sage-100/50 border border-sage-600/30 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-sage-600" />
                        </div>
                        <span className="text-2xl font-display font-bold text-navy-50 tracking-wide">HealthChain</span>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-md">
                        <h1 className="text-4xl font-display font-bold text-navy-50 leading-tight mb-6">
                            Your health records, secured on the <span className="text-sage-600">blockchain.</span>
                        </h1>
                        <p className="text-navy-400 text-lg mb-12">
                            Take complete control over your medical data. Grant access to doctors securely and track every interaction.
                        </p>

                        <div className="space-y-6">
                            {[
                                { icon: Shield, title: 'End-to-End Encrypted', desc: 'Your data is encrypted before it leaves your device.' },
                                { icon: Lock, title: 'Consent-First Sharing', desc: 'No one accesses your records without your explicit OTP approval.' },
                                { icon: CheckCircle2, title: 'Immutable Audit Trail', desc: 'Every record view is permanently logged on the network.' }
                            ].map((feature, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + (i * 0.1) }} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-sage-100/50 border border-sage-600/20 flex items-center justify-center flex-shrink-0">
                                        <feature.icon className="w-5 h-5 text-sage-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-navy-50 font-semibold text-sm">{feature.title}</h3>
                                        <p className="text-navy-400 text-sm mt-1">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-navy-400">
                    <span className="w-2 h-2 rounded-full bg-sage-600 animate-pulse" />
                    Network Status: Secure & Operational
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
                    
                    <div className="text-center lg:text-left mb-8">
                        <h2 className="text-3xl font-display font-bold text-navy-50 mb-2">Welcome Back</h2>
                        <p className="text-navy-400">Sign in to your patient portal</p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-xl border border-navy-800/80 rounded-2xl p-6 md:p-8 shadow-card">
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.form 
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleIdentitySubmit} 
                                    className="space-y-5"
                                >
                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
                                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-red-500 font-medium">{error}</p>
                                        </div>
                                    )}

                                    {/* Login Mode Toggle Switcher */}
                                    <div className="flex p-1 bg-white border border-navy-800 rounded-xl mb-2 relative">
                                        <button
                                            type="button"
                                            onClick={() => { setLoginMode('email'); setError(''); }}
                                            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all relative z-10 ${loginMode === 'email' ? 'text-white' : 'text-navy-400 hover:text-navy-50'}`}
                                        >
                                            {loginMode === 'email' && (
                                                <motion.div layoutId="patientActiveTab" className="absolute inset-0 bg-sage-600 rounded-lg -z-10" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                                            )}
                                            Email / Password
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setLoginMode('phone'); setError(''); }}
                                            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all relative z-10 ${loginMode === 'phone' ? 'text-white' : 'text-navy-400 hover:text-navy-50'}`}
                                        >
                                            {loginMode === 'phone' && (
                                                <motion.div layoutId="patientActiveTab" className="absolute inset-0 bg-sage-600 rounded-lg -z-10" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                                            )}
                                            Phone Number
                                        </button>
                                    </div>

                                    {loginMode === 'email' ? (
                                        <>
                                            <div>
                                                <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Email Address</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                                                    <input 
                                                        type="email" 
                                                        required
                                                        autoComplete="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="w-full bg-white border border-navy-800 rounded-xl pl-12 pr-4 py-3.5 text-sm text-navy-50 placeholder-navy-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all"
                                                        placeholder="patient@example.com"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider">Password</label>
                                                    <button type="button" onClick={() => setIsResetOpen(true)} className="text-xs text-sage-600 hover:text-sage-700 transition-colors">Forgot Password?</button>
                                                </div>
                                                <div className="relative">
                                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                                                    <input 
                                                        type="password" 
                                                        required
                                                        autoComplete="current-password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="w-full bg-white border border-navy-800 rounded-xl pl-12 pr-4 py-3.5 text-sm text-navy-50 placeholder-navy-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider mb-2">Phone Number</label>
                                                <div className="flex gap-2 relative">
                                                    {/* Custom Country Select Dropdown */}
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                            className="h-full flex items-center gap-2 bg-white border border-navy-800 rounded-xl px-3 py-3.5 text-sm text-navy-50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 outline-none transition-all hover:bg-navy-900/30"
                                                        >
                                                            <span className="text-base">{selectedCountry.flag}</span>
                                                            <span className="font-mono text-xs">{selectedCountry.dial}</span>
                                                            <ChevronDown className="w-3.5 h-3.5 text-navy-400" />
                                                        </button>
                                                        
                                                        {isDropdownOpen && (
                                                            <div className="absolute left-0 mt-2 w-72 bg-white border border-navy-800 rounded-xl shadow-card p-2 z-50 max-h-64 overflow-y-auto backdrop-blur-xl">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search country or code..."
                                                                    value={searchQuery}
                                                                    onChange={e => setSearchQuery(e.target.value)}
                                                                    className="w-full bg-white border border-navy-850 rounded-lg px-3 py-2 text-xs text-navy-50 placeholder-navy-600 focus:border-gold-500 outline-none mb-2"
                                                                    autoFocus
                                                                />
                                                                <div className="space-y-0.5 animate-none">
                                                                    {countryCodes
                                                                        .filter(c => 
                                                                            c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                                                            c.dial.includes(searchQuery) ||
                                                                            c.code.toLowerCase().includes(searchQuery.toLowerCase())
                                                                        )
                                                                        .map((c) => (
                                                                            <button
                                                                                key={c.code}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setSelectedCountry(c);
                                                                                    setIsDropdownOpen(false);
                                                                                    setSearchQuery('');
                                                                                }}
                                                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors hover:bg-navy-900/30 ${c.code === selectedCountry.code ? 'bg-sage-100/50 text-sage-600 font-semibold' : 'text-navy-50'}`}
                                                                            >
                                                                                <div className="flex items-center gap-2 truncate">
                                                                                    <span>{c.flag}</span>
                                                                                    <span className="truncate max-w-[140px]">{c.name}</span>
                                                                                </div>
                                                                                <span className="font-mono text-navy-400 text-[10px]">{c.dial}</span>
                                                                            </button>
                                                                        ))
                                                                    }
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Phone input */}
                                                    <input 
                                                        type="tel" 
                                                        required
                                                        autoFocus
                                                        value={phone}
                                                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                                                        className="flex-1 bg-white border border-navy-800 rounded-xl px-4 py-3.5 text-sm text-navy-50 placeholder-navy-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all font-mono"
                                                        placeholder="555-0100"
                                                    />
                                                </div>
                                            </div>

                                            <div id="recaptcha-container"></div>
                                        </>
                                    )}

                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full py-3.5 rounded-xl bg-sage-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-sage-700 transition-all disabled:opacity-50 shadow-soft hover:shadow-md mt-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <>
                                                {loginMode === 'email' ? 'Sign In securely' : 'Send Verification OTP'}
                                                {!loading && <ArrowRight className="w-4 h-4" />}
                                            </>
                                        )}
                                    </button>

                                    <div className="flex items-center gap-4 my-6">
                                        <div className="flex-1 h-px bg-navy-800" />
                                        <span className="text-xs text-navy-400 font-bold uppercase">Or continue with</span>
                                        <div className="flex-1 h-px bg-navy-800" />
                                    </div>

                                    <button 
                                        type="button"
                                        onClick={handleGoogleSignIn}
                                        disabled={isGoogleLoading}
                                        className="w-full py-3.5 rounded-xl bg-white border border-navy-200 text-navy-600 font-semibold text-sm flex items-center justify-center gap-3 hover:bg-navy-50 hover:border-navy-300 transition-all disabled:opacity-50"
                                    >
                                        {isGoogleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                        )}
                                        Sign in with Google
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.form 
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleMfaSubmit} 
                                    className="space-y-6"
                                >
                                    <div className="p-4 rounded-xl bg-sage-50 border border-sage-100 text-center">
                                        <div className="w-12 h-12 rounded-full bg-sage-100 mx-auto mb-3 flex items-center justify-center">
                                            <Key className="w-5 h-5 text-sage-600" />
                                        </div>
                                        <h3 className="text-navy-50 font-medium mb-1">Two-Factor Verification</h3>
                                        <p className="text-xs text-navy-400">Enter the 6-digit code sent to your phone number.</p>
                                    </div>

                                    {error && (
                                        <p className="text-xs text-red-500 text-center font-medium">{error}</p>
                                    )}

                                    <div className="flex justify-between gap-2">
                                        {otp.map((digit, i) => (
                                            <input
                                                key={i}
                                                id={`otp-${i}`}
                                                type="text"
                                                maxLength="1"
                                                value={digit}
                                                onChange={e => handleOtpChange(i, e.target.value)}
                                                onKeyDown={e => handleOtpKeyDown(i, e)}
                                                className="w-12 h-14 bg-white border border-navy-800 rounded-xl text-center text-xl font-mono text-navy-50 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 outline-none transition-all"
                                                autoFocus={i === 0}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between text-xs font-mono">
                                        <button type="button" onClick={() => { setStep(1); setError(''); }} className="text-navy-400 hover:text-navy-50 transition-colors">Resend Code</button>
                                        <span className="text-sage-600">Code expires in {formatTime(countdown)}</span>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={loading || otp.join('').length < 6}
                                        className="w-full py-3.5 rounded-xl bg-sage-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-sage-700 transition-all disabled:opacity-50 shadow-soft hover:shadow-md mt-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Sign In'}
                                    </button>
                                    
                                    <button 
                                        type="button" 
                                        onClick={() => { setStep(1); setError(''); }}
                                        className="w-full text-xs text-navy-400 hover:text-navy-50 pt-2 text-center block transition-colors"
                                    >
                                        Cancel and return
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            <ResetPasswordModal 
                isOpen={isResetOpen} 
                onClose={() => setIsResetOpen(false)} 
                role="patient" 
            />
        </div>
    );
}
