import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2, ShieldCheck, Stethoscope, Building2, BadgeCheck,
    Network, LockKeyhole, FileKey2, Mail, User, Phone, CheckCircle,
    ArrowRight, ArrowLeft, MessageSquare, Key, Eye, EyeOff
} from 'lucide-react';
import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { googleAuthFallback } from '../firebase/auth';
import useAuthStore from '../store/authStore';
import { toast } from '../components/Toast';

export default function DoctorRegister() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form State
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        hospital: 'Central General Hospital',
        department: 'Cardiology',
        license: '',
        phone: ''
    });

    const [showPassword, setShowPassword] = useState(false);

    // Phone verification state
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [otpTimer, setOtpTimer] = useState(0);
    const otpRefs = useRef([]);
    const recaptchaRef = useRef(null);

    const { register, isLoading, error, clearError } = useAuthStore();

    const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

    // OTP Timer
    useEffect(() => {
        if (otpTimer > 0) {
            const timer = setTimeout(() => setOtpTimer(t => t - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [otpTimer]);

    // Setup invisible reCAPTCHA
    const setupRecaptcha = () => {
        if (recaptchaRef.current) {
            try { recaptchaRef.current.clear(); } catch (_) {}
            recaptchaRef.current = null;
        }
        recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {},
        });
        return recaptchaRef.current;
    };

    const handleSendOtp = async () => {
        let phone = form.phone.trim().replace(/[\s\-()]/g, '');
        if (phone && !phone.startsWith('+')) {
            if (phone.length === 10) {
                phone = '+91' + phone;
            } else {
                phone = '+' + phone;
            }
        }
        if (!phone || phone.length < 10) {
            toast.error('Enter a valid phone number with country code (e.g. +91xxxxxxxxxx)');
            return;
        }
        update('phone', phone);
        try {
            setIsSendingOtp(true);
            const verifier = setupRecaptcha();
            const result = await signInWithPhoneNumber(auth, phone, verifier);
            setConfirmationResult(result);
            setOtpSent(true);
            setOtpTimer(60);
            toast.success(`Verification code sent to ${phone}`);
        } catch (err) {
            console.error(err);
            if (recaptchaRef.current) {
                try { recaptchaRef.current.clear(); } catch (_) {}
                recaptchaRef.current = null;
            }
            toast.error(err.message || 'Failed to send OTP code');
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const next = [...otp];
        next[index] = value;
        setOtp(next);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
        if (!value && index > 0) otpRefs.current[index - 1]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = async () => {
        const code = otp.join('');
        if (code.length !== 6) {
            toast.error('Enter the full 6-digit verification code');
            return;
        }
        try {
            setIsVerifyingOtp(true);
            await confirmationResult.confirm(code);
            setPhoneVerified(true);
            toast.success('Phone verified! Enrolling doctor node...');
            await handleSubmit();
        } catch (err) {
            console.error(err);
            toast.error('Invalid code. Please try again.');
            setOtp(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleSubmit = async () => {
        clearError();
        try {
            const payload = {
                name: form.name,
                email: form.email,
                password: form.password,
                role: 'doctor',
                phone: form.phone,
                hospital: form.hospital,
                department: form.department,
                specialty: form.department || 'General Medicine',
                licenseNumber: form.license,
                license: form.license
            };
            const res = await register(payload);
            sessionStorage.setItem('hc_is_new_user', 'true');
            setShowSuccess(true);
            toast.success('Doctor account submitted! Awaiting administrator approval.');
            setTimeout(() => navigate('/doctor/pending-approval', { replace: true }), 1200);
        } catch (err) {
            toast.error(err.message || 'Enrolment failed');
        }
    };

    const handleGoogleRegister = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const { loginGoogle } = useAuthStore.getState();
            const res = await loginGoogle('doctor', user);
            const userStatus = res?.user?.status || res?.status || 'pending';

            if (userStatus === 'pending') {
                toast.info('Google doctor registration submitted! Awaiting administrator approval.');
                navigate('/doctor/pending-approval', { replace: true });
            } else {
                toast.success(`Welcome Dr. ${user.displayName?.split(' ')[0] || ''}!`);
                navigate('/doctor/dashboard', { replace: true });
            }
        } catch (err) {
            console.error(err);
            if (err.code !== 'auth/popup-closed-by-user') {
                toast.error(err.message || 'Google enrollment failed');
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
        if (!form.license) {
            return toast.error('Medical License number is required for doctor authorization');
        }
        setStep(3);
    };

    return (
        <div className="min-h-screen bg-navy-950 flex flex-col md:flex-row font-sans">
            <div id="recaptcha-container" />

            {/* Left Panel: Enterprise Graphics */}
            <div className="hidden md:flex flex-col justify-between w-[400px] lg:w-[450px] bg-white border-r border-navy-800 p-10 relative shrink-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(64,93,78,0.05),transparent_50%)]" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 rounded-lg bg-sage-100/50 border border-sage-600/20 flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-sage-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-navy-50 tracking-wide">HealthChain</h1>
                            <p className="text-[10px] text-sage-600 font-bold uppercase tracking-widest">Provider Registration</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 shadow-soft">
                            <ShieldCheck className="w-6 h-6 text-sage-600 mb-2" />
                            <h3 className="text-navy-50 text-sm font-semibold mb-1">Decentralized Credentials</h3>
                            <p className="text-xs text-navy-400 leading-relaxed">Medical identity is verified against public license boards to secure network compliance.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 shadow-soft">
                            <Network className="w-6 h-6 text-gold-500 mb-2" />
                            <h3 className="text-navy-50 text-sm font-semibold mb-1">Role-Based Cryptography</h3>
                            <p className="text-xs text-navy-400 leading-relaxed">Access keys are tied dynamically to active institutional status and patient authorization.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 shadow-soft">
                            <BadgeCheck className="w-6 h-6 text-sage-600 mb-2" />
                            <h3 className="text-navy-50 text-sm font-semibold mb-1">Instant Auditability</h3>
                            <p className="text-xs text-navy-400 leading-relaxed">All registration events are recorded securely, maintaining high-fidelity patient trust.</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-3 mt-12">
                    <Building2 className="w-8 h-8 text-navy-400" />
                    <div>
                        <p className="text-[10px] text-navy-400 font-bold uppercase tracking-wider">Enterprise Mode</p>
                        <p className="text-xs text-navy-50">Central Provider Node Initialization</p>
                    </div>
                </div>
            </div>

            {/* Right Panel: Registration Wizard */}
            <div className="flex-1 flex items-center justify-center p-8 relative z-10 overflow-y-auto">
                <div className="w-full max-w-md relative">
                    
                    {/* Success Overlay */}
                    <AnimatePresence>
                        {showSuccess && (
                            <div className="absolute inset-0 z-50 rounded-2xl bg-white flex flex-col items-center justify-center text-center p-6">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="w-16 h-16 rounded-full border-2 border-sage-600/20 border-t-sage-600 mb-4"
                                />
                                <h3 className="text-lg font-bold text-navy-50">Configuring Secure Workstation...</h3>
                                <p className="text-sm text-navy-400 mt-2">Setting up provider credentials on the blockchain</p>
                            </div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {/* Step 1: Institutional Credentials */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-navy-50 mb-2">Provider Enrolment</h2>
                                    <p className="text-sm text-navy-400">Establish your institutional workstation profile</p>
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
                                                placeholder="Dr. John Watson"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Institutional Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                                            <input 
                                                type="email" required
                                                value={form.email} onChange={e => update('email', e.target.value)}
                                                className="w-full bg-white border border-navy-800 rounded-lg pl-10 pr-4 py-3 text-sm text-navy-50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all placeholder-navy-600"
                                                placeholder="watson@hospital.org"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Passphrase</label>
                                        <div className="relative">
                                            <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
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
                                        <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Confirm Passphrase</label>
                                        <div className="relative">
                                            <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                                            <input 
                                                type="password" required
                                                value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                                                className="w-full bg-white border border-navy-800 rounded-lg pl-10 pr-4 py-3 text-sm text-navy-50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all placeholder-navy-600"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <button className="w-full py-3.5 mt-4 rounded-lg bg-sage-600 text-white font-bold text-sm hover:bg-sage-700 transition-colors flex justify-center shadow-soft hover:shadow-md gap-2">
                                        Continue <ArrowRight className="w-4 h-4" />
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

                        {/* Step 2: Affiliation Details */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-navy-50 mb-2">Affiliation & License</h2>
                                    <p className="text-sm text-navy-400">Verify your medical authority</p>
                                </div>
                                <form onSubmit={handleStep2} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Hospital Network</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                                            <input 
                                                type="text" required
                                                value={form.hospital} onChange={e => update('hospital', e.target.value)}
                                                className="w-full bg-white border border-navy-800 rounded-lg pl-10 pr-4 py-3 text-sm text-navy-50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all placeholder-navy-600"
                                                placeholder="Central General Hospital"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Department</label>
                                        <select value={form.department} onChange={e => update('department', e.target.value)} className="w-full bg-white border border-navy-800 rounded-lg px-4 py-3 text-sm text-navy-50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 appearance-none">
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
                                    <div>
                                        <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Medical License ID</label>
                                        <div className="relative">
                                            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                                            <input 
                                                type="text" required
                                                value={form.license} onChange={e => update('license', e.target.value)}
                                                className="w-full bg-white border border-navy-800 rounded-lg pl-10 pr-4 py-3 text-sm text-sage-600 font-mono focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all uppercase placeholder-navy-600"
                                                placeholder="MED-8492-XX"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => setStep(1)} className="px-6 py-3.5 rounded-lg bg-white border border-navy-800 text-navy-50 font-semibold hover:bg-navy-900/30 transition-colors flex items-center gap-2">
                                            <ArrowLeft className="w-4 h-4" /> Back
                                        </button>
                                        <button className="flex-1 py-3.5 rounded-lg bg-sage-600 text-white font-bold text-sm hover:bg-sage-700 transition-colors flex justify-center shadow-soft hover:shadow-md gap-2">
                                            Continue <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 3: PIN / Verification */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                                <div className="mb-6 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-sage-100/50 border border-sage-600/20 flex items-center justify-center mx-auto mb-4">
                                        <LockKeyhole className="w-8 h-8 text-sage-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-navy-50 mb-2">Workstation Security</h2>
                                    <p className="text-sm text-navy-400">Bind clinical session with your active device</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Phone Number</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                                                <input 
                                                    type="tel" required
                                                    value={form.phone} onChange={e => update('phone', e.target.value)}
                                                    className="w-full bg-white border border-navy-800 rounded-lg pl-10 pr-4 py-3 text-sm text-navy-50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all placeholder-navy-600"
                                                    placeholder="+1 555-0199"
                                                    disabled={otpSent && !phoneVerified}
                                                />
                                            </div>
                                            <button 
                                                onClick={handleSendOtp}
                                                disabled={isSendingOtp || (otpTimer > 0 && otpSent)}
                                                className="shrink-0 px-4 py-3 rounded-lg bg-sage-100 border border-sage-600/30 text-sage-600 text-xs font-bold hover:bg-sage-200/50 transition-all disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {isSendingOtp ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : otpSent ? (
                                                    otpTimer > 0 ? `${otpTimer}s` : 'Resend'
                                                ) : (
                                                    <><MessageSquare className="w-4 h-4" /> Send OTP</>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {otpSent && !phoneVerified && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                            <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider">Verification PIN</label>
                                            <div className="flex gap-2 justify-between">
                                                {otp.map((digit, i) => (
                                                    <input 
                                                        key={i}
                                                        ref={el => otpRefs.current[i] = el}
                                                        type="text" maxLength={1} inputMode="numeric"
                                                        value={digit}
                                                        onChange={e => handleOtpChange(i, e.target.value)}
                                                        onKeyDown={e => handleOtpKeyDown(i, e)}
                                                        className="w-12 h-12 text-center text-lg font-bold bg-white border border-navy-800 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 text-navy-50 font-mono"
                                                    />
                                                ))}
                                            </div>

                                            <button 
                                                onClick={handleVerifyOtp}
                                                disabled={isVerifyingOtp || isLoading || otp.join('').length < 6}
                                                className="w-full py-3.5 rounded-lg bg-sage-600 text-white font-bold text-sm hover:bg-sage-700 transition-colors flex justify-center shadow-soft hover:shadow-md items-center gap-2 disabled:opacity-50"
                                            >
                                                {isVerifyingOtp || isLoading ? (
                                                    <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                                                ) : (
                                                    <><FileKey2 className="w-4 h-4" /> Verify & Authorize Station</>
                                                )}
                                            </button>
                                        </motion.div>
                                    )}

                                    {!phoneVerified && (
                                        <button onClick={() => setStep(2)} className="w-full py-3.5 rounded-lg bg-white border border-navy-800 text-navy-50 font-semibold hover:bg-navy-900/30 transition-colors flex justify-center items-center gap-2">
                                            <ArrowLeft className="w-4 h-4" /> Back
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <p className="text-center text-sm text-navy-400 mt-6">
                        Authorized Provider?{' '}
                        <Link to="/login/doctor" className="text-sage-600 hover:text-sage-700 font-semibold transition-colors">
                            Authenticate Station
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
