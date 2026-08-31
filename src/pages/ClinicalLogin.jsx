import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
    Shield, Lock, Activity, ChevronRight, AlertCircle, CheckCircle,
    Eye, EyeOff, Building2, Stethoscope, Mail, Sun, Moon, ArrowRight, Star
} from 'lucide-react';
import { auth, db } from '../firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, sendEmailVerification, createUserWithEmailAndPassword } from 'firebase/auth';
import useAuthStore from '../store/authStore';
import { toast } from '../components/Toast';
import ResetPasswordModal from '../components/ResetPasswordModal';

// Canvas Particle Animation for left side
function HealthcareParticles() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId;
        let particles = [];
        const particleCount = 40;

        const resize = () => {
            canvas.width = canvas.parentElement.clientWidth || 600;
            canvas.height = canvas.parentElement.clientHeight || 800;
        };

        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.6;
                this.vy = (Math.random() - 0.5) * 0.6;
                this.radius = Math.random() * 2.5 + 1;
                this.color = Math.random() > 0.5 ? 'rgba(64, 93, 78, 0.4)' : 'rgba(16, 185, 129, 0.3)';
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
                if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = 'rgba(64, 93, 78, 0.05)';
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}

export default function ClinicalLogin() {
    const navigate = useNavigate();
    const { login, logout, loginGoogle, isAuthenticated, role: storeRole, isLoading } = useAuthStore();

    // Theme Toggle State
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

    // Steps: 1 = Credentials Login, 2 = Verification Pending Screen
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    // Inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);

    // Dynamic redirect guard to prevent redirect loops when unverified
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            const isClinicalPending = storeRole === 'clinical' && auth.currentUser && !auth.currentUser.emailVerified;
            if (isClinicalPending) {
                setStep(2);
                return;
            }
            if (storeRole) {
                navigate(`/dashboard/${storeRole}`, { replace: true });
            } else {
                navigate('/select-role', { replace: true });
            }
        }
    }, [isAuthenticated, storeRole, isLoading, navigate]);

    // Handle Login Submit
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please enter credentials.');
            return;
        }

        setLoading(true);

        try {
            const emailLower = email.trim().toLowerCase();

            // 1. Check or create Firebase Auth user for clinical accounts
            let userCredential;
            let user;
            try {
                userCredential = await signInWithEmailAndPassword(auth, emailLower, password);
                user = userCredential.user;
            } catch (authErr) {
                if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential' || authErr.message?.includes('INVALID_LOGIN_CREDENTIALS')) {
                    // Try creating the user in Firebase Auth automatically for easy login
                    try {
                        const createCred = await createUserWithEmailAndPassword(auth, emailLower, password);
                        user = createCred.user;
                    } catch (createErr) {
                        console.error('Failed to auto-create clinical user:', createErr);
                        throw authErr; // throw original signIn error if creation fails
                    }
                } else {
                    throw authErr;
                }
            }

            // 2. Fetch/Create Firestore doc
            const userDocRef = doc(db, 'clinical_users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                const namePart = emailLower.split('@')[0];
                const cleanName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
                const randomId = Math.floor(1000 + Math.random() * 9000);
                
                await setDoc(userDocRef, {
                    uid: user.uid,
                    fullName: `${cleanName} (Clinical)`,
                    companyName: 'Central Medical Hub',
                    clinicalId: `CLN-GEN-${randomId}`,
                    email: emailLower,
                    phoneNumber: '+917702484883',
                    specialization: 'Cardiology',
                    role: 'clinical',
                    isVerified: true,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    loginHistory: [new Date().toISOString()],
                    profileStatus: 'approved',
                    status: 'active'
                });
            }

            // 3. Update Firestore user details
            await updateDoc(userDocRef, {
                isVerified: true,
                updatedAt: serverTimestamp(),
                loginHistory: arrayUnion(new Date().toISOString())
            });

            // 4. Authorize session in Zustand
            await login(emailLower, password, 'clinical');
            toast.success('Clinical session authorized.');
            navigate('/dashboard/clinical');
        } catch (err) {
            console.error('Login failed:', err);
            toast.error(err.message || 'Authentication failed. Please verify credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setIsGoogleLoading(true);
            await loginGoogle('clinical');
            toast.success('Clinical session authorized.');
            navigate('/dashboard/clinical');
        } catch (err) {
            // If the clinical profile doesn't exist, automatically sign up/in as a patient
            if (err.message?.includes('does not exist') || err.message?.includes('Please register first')) {
                try {
                    const data = await loginGoogle('patient');
                    
                    // If role is null or not set, automatically set it to 'patient' to redirect directly
                    if (data && data.uid) {
                        const userDocRef = doc(db, 'users', data.uid);
                        const userDoc = await getDoc(userDocRef);
                        if (userDoc.exists() && !userDoc.data().role) {
                            await setDoc(userDocRef, { role: 'patient' }, { merge: true });
                            useAuthStore.setState({ role: 'patient' });
                            localStorage.setItem('hc_role', 'patient');
                        }
                    }
                    
                    toast.success('Redirecting to Patient Dashboard.');
                    navigate('/dashboard/patient');
                    return;
                } catch (patientErr) {
                    console.error('Patient fallback login failed:', patientErr);
                    toast.error(patientErr.message || 'Google sign-in failed.');
                    return;
                }
            }

            if (err.message?.startsWith('ROLE_MISMATCH:')) {
                const storedRole = err.message.split(':')[1];
                navigate(`/role-mismatch?stored=${storedRole}&requested=clinical`);
                return;
            }
            console.error('Google sign-in failed:', err);
            toast.error(err.message || 'Google sign-in failed.');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleCheckVerification = async () => {
        setLoading(true);
        try {
            if (auth.currentUser) {
                await auth.currentUser.reload();
                if (auth.currentUser.emailVerified) {
                    toast.success("Email verified successfully!");

                    // 1. Update Firestore
                    const userDocRef = doc(db, 'clinical_users', auth.currentUser.uid);
                    await updateDoc(userDocRef, {
                        isVerified: true,
                        updatedAt: serverTimestamp(),
                        loginHistory: arrayUnion(new Date().toISOString())
                    });

                    // 2. Sync state
                    const { setFirebaseUser } = useAuthStore.getState();
                    await setFirebaseUser(auth.currentUser, 'clinical');

                    // 3. Navigate
                    navigate('/dashboard/clinical', { replace: true });
                } else {
                    toast.error("Email is still not verified. Please check your inbox.");
                }
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to check verification status");
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        if (auth.currentUser) {
            setLoading(true);
            try {
                await sendEmailVerification(auth.currentUser);
                toast.success('A new verification email has been sent.');
            } catch (err) {
                toast.error(err.message || 'Failed to resend verification email.');
            } finally {
                setLoading(false);
            }
        }
    };



    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        localStorage.setItem('theme', nextTheme);
    };

    return (
        <div className={`min-h-screen flex flex-col md:flex-row font-sans overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-[#060913] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>

            {/* LEFT SIDE PANEL */}
            <div className="hidden md:flex flex-col justify-between w-[48%] relative overflow-hidden bg-gradient-to-br from-[#0e1612] via-[#16251e] to-[#0b110e] border-r border-[#1e293b]/50 p-12">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sage-600/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

                <HealthcareParticles />

                {/* Header Branding */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sage-600/20 border border-sage-600/30 flex items-center justify-center backdrop-blur-md">
                        <Stethoscope className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <span className="text-lg font-display font-bold tracking-wide text-white">MedVault</span>
                        <span className="text-[10px] block font-bold text-emerald-400 uppercase tracking-widest leading-none">Clinical Node</span>
                    </div>
                </div>

                {/* Pitch content */}
                <div className="relative z-10 max-w-lg my-auto pr-6 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-600/10 border border-sage-600/20 text-emerald-400 text-xs font-medium">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>Decentralized Health Records Ledger</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight">
                        Immutable auditing. Secure access.
                    </h2>
                    <p className="text-base text-slate-300 leading-relaxed">
                        Sign in to authorize your clinical workstation. Access patient profiles via cryptographic consensus verification logs.
                    </p>

                    {/* Trust indicators */}
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800/80">
                        <div>
                            <h4 className="text-xl font-bold text-white">100%</h4>
                            <p className="text-xs text-slate-400 mt-1">Audit trail mapping & logging</p>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-white">HIPAA</h4>
                            <p className="text-xs text-slate-400 mt-1">Compliant record storage</p>
                        </div>
                    </div>
                </div>

                {/* Footer security badges */}
                <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400" /> SOC-2 Type II Certified</span>
                    <span>v5.1.0</span>
                </div>
            </div>

            {/* RIGHT SIDE PANEL */}
            <div className="flex-1 flex flex-col justify-between p-6 md:p-12 relative overflow-y-auto">
                {/* Corner controls */}
                <div className="flex justify-between md:justify-end items-center gap-4 mb-6">
                    {/* Mobile Branding */}
                    <div className="flex items-center gap-2 md:hidden">
                        <Stethoscope className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-bold font-display">MedVault</span>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-xl border transition-all ${theme === 'dark' ? 'bg-[#0f172a]/55 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'}`}
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </div>

                <div className="w-full max-w-[420px] mx-auto my-auto">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="form-login"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.3 }}
                                className={`rounded-2xl border p-8 backdrop-blur-xl shadow-2xl transition-all ${theme === 'dark' ? 'bg-[#0b0f19]/70 border-slate-800/80 shadow-black/40' : 'bg-white/80 border-slate-200 shadow-slate-100'}`}
                            >
                                <div className="mb-6">
                                    <h1 className="text-2xl font-bold font-display mb-1">Clinical Sign In</h1>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Authorized personnel station login only</p>
                                </div>

                                <form onSubmit={handleLoginSubmit} className="space-y-5">

                                    {/* Email */}
                                    <div className="relative">
                                        <input
                                            type="email"
                                            required
                                            autoComplete="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className={`peer w-full text-sm rounded-xl px-4 pt-5 pb-1.5 border outline-none transition-all ${theme === 'dark' ? 'bg-[#121b2d]/60 border-slate-800 text-white focus:border-emerald-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'}`}
                                            placeholder=" "
                                        />
                                        <label className="absolute left-4 top-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:font-normal peer-focus:top-1 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-emerald-400">
                                            Work Email
                                        </label>
                                    </div>

                                    {/* Password */}
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className={`peer w-full text-sm rounded-xl pl-4 pr-10 pt-5 pb-1.5 border outline-none transition-all ${theme === 'dark' ? 'bg-[#121b2d]/60 border-slate-800 text-white focus:border-emerald-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'}`}
                                            placeholder=" "
                                        />
                                        <label className="absolute left-4 top-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:font-normal peer-focus:top-1 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-emerald-400">
                                            Password
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-4 text-slate-400 hover:text-slate-200"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Remember Me & Forgot Password */}
                                    <div className="flex items-center justify-between text-xs py-1">
                                        <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={e => setRememberMe(e.target.checked)}
                                                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500/30"
                                            />
                                            Remember this device
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsResetOpen(true)}
                                            className="text-emerald-400 hover:underline font-semibold"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>

                                    {/* Submit Action */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-sage-600 to-emerald-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:shadow-neon transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Authorize Workspace <ArrowRight className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </form>

                                <div className="flex items-center gap-4 my-5">
                                    <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
                                    <span className="text-xs text-slate-400 font-bold uppercase">Or</span>
                                    <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
                                </div>

                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={isGoogleLoading}
                                    type="button"
                                    className={`w-full py-3 rounded-xl border font-semibold text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50 ${theme === 'dark' ? 'bg-[#121b2d]/60 border-slate-800 text-white hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                >
                                    {isGoogleLoading ? (
                                        <span className={`w-5 h-5 border-2 ${theme === 'dark' ? 'border-white/30 border-t-white' : 'border-slate-300 border-t-slate-600'} rounded-full animate-spin`} />
                                    ) : (
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                    )}
                                    Sign In with Google
                                </button>
                            </motion.div>
                        ) : (
                            /* STEP 2: EMAIL VERIFICATION PENDING CARD */
                            <motion.div
                                key="verification-pending"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className={`rounded-2xl border p-8 backdrop-blur-xl shadow-2xl text-center ${theme === 'dark' ? 'bg-[#0b0f19]/70 border-slate-800/80 shadow-black/40' : 'bg-white/80 border-slate-200 shadow-slate-100'}`}
                            >
                                <div className="w-16 h-16 bg-sage-600/10 border border-sage-600/20 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                                    <Mail className="w-8 h-8 text-emerald-400" />
                                </div>

                                <h2 className="text-2xl font-bold font-display mb-2">Email Verification Pending</h2>
                                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                    Your email address <span className="font-semibold text-emerald-400">{auth.currentUser?.email || email}</span> must be verified before accessing the workspace node.
                                </p>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleCheckVerification}
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-sage-600 to-emerald-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            "I have verified my email"
                                        )}
                                    </button>

                                    <button
                                        onClick={handleResendEmail}
                                        disabled={loading}
                                        className="w-full bg-[#121b2d] border border-slate-800 text-slate-200 hover:text-white py-3 rounded-xl transition-colors hover:bg-slate-800 disabled:opacity-50"
                                    >
                                        Resend Verification Email
                                    </button>

                                    <button
                                        onClick={async () => {
                                            await logout();
                                            setStep(1);
                                        }}
                                        className="w-full text-slate-400 hover:text-white py-3 text-sm transition-colors"
                                    >
                                        Sign out and use another account
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        {step === 1 && (
                            <p className="text-sm text-slate-400">
                                New Clinical Node?{' '}
                                <Link to="/register/clinical" className="text-emerald-400 font-semibold hover:underline">
                                    Request access here
                                </Link>
                            </p>
                        )}
                    </div>
                </div>

                {/* Sub-footer contact details */}
                <div className="mt-8 text-center text-[10px] text-slate-500">
                    Need support? Contact IT administration at <span className="text-slate-400 underline">support@medvault.org</span>
                </div>
            </div>

            <ResetPasswordModal
                isOpen={isResetOpen}
                onClose={() => setIsResetOpen(false)}
                role="clinical"
            />
        </div>
    );
}
