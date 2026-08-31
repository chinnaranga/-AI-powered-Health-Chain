import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ShieldCheck, Stethoscope, Building2, BadgeCheck, Network, LockKeyhole, FileKey2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { toast } from '../components/Toast';
import ResetPasswordModal from '../components/ResetPasswordModal';

export default function DoctorLogin() {
    const navigate = useNavigate();
    const { login, loginGoogle, isLoading, isAuthenticated, role } = useAuthStore();
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);

    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            if (role === 'doctor') {
                navigate('/doctor/dashboard', { replace: true });
            } else if (role) {
                navigate(`/dashboard/${role}`, { replace: true });
            } else {
                navigate('/select-role', { replace: true });
            }
        }
    }, [isAuthenticated, role, isLoading, navigate]);

    const [step, setStep] = useState(1);
    
    // Step 1: Credentials
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Step 2: Professional Details
    const [hospital, setHospital] = useState('Central General Hospital');
    const [department, setDepartment] = useState('Cardiology');
    const [license, setLicense] = useState('');
    
    // Step 3: 2FA
    const [authCode, setAuthCode] = useState('');

    const handleStep1 = (e) => {
        e.preventDefault();
        if (!email || !password) return toast.error('Enter credentials');
        setStep(2);
    };

    const handleStep2 = (e) => {
        e.preventDefault();
        if (!license) return toast.error('Medical license required');
        setStep(3);
    };

    const handleFinalLogin = async (e) => {
        e.preventDefault();
        if (authCode.length < 6) return toast.error('Invalid 2FA code');
        
        try {
            await login(email, password, 'doctor');
            toast.success('Enterprise Access Granted');
            navigate('/doctor/dashboard');
        } catch (err) {
            if (err.message?.startsWith('ROLE_MISMATCH:')) {
                const storedRole = err.message.split(':')[1];
                navigate(`/role-mismatch?stored=${storedRole}&requested=doctor`);
                return;
            }
            toast.error(err.message || 'Verification failed');
            setStep(1);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setIsGoogleLoading(true);
            await loginGoogle('doctor');
            toast.success('Enterprise Access Granted');
            navigate('/doctor/dashboard');
        } catch (err) {
            if (err.message?.startsWith('ROLE_MISMATCH:')) {
                const storedRole = err.message.split(':')[1];
                navigate(`/role-mismatch?stored=${storedRole}&requested=doctor`);
                return;
            }
            toast.error(err.message || 'Google sign-in failed');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-navy-950 flex flex-col md:flex-row font-sans">
            {/* Left Panel: Enterprise Identity */}
            <div className="hidden md:flex flex-col justify-between w-[400px] lg:w-[450px] bg-white border-r border-navy-800 p-10 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(64,93,78,0.05),transparent_50%)]" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 rounded-lg bg-sage-100/50 border border-sage-600/20 flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-sage-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-navy-50 tracking-wide">HealthChain</h1>
                            <p className="text-[10px] text-sage-600 font-bold uppercase tracking-widest">Provider Portal</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 shadow-soft">
                            <ShieldCheck className="w-6 h-6 text-sage-600 mb-2" />
                            <h3 className="text-navy-50 text-sm font-semibold mb-1">Zero-Trust Security</h3>
                            <p className="text-xs text-navy-400 leading-relaxed">Continuous verification of medical identity and hospital affiliation.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 shadow-soft">
                            <Network className="w-6 h-6 text-gold-500 mb-2" />
                            <h3 className="text-navy-50 text-sm font-semibold mb-1">Interoperability Engine</h3>
                            <p className="text-xs text-navy-400 leading-relaxed">Seamlessly exchange patient records across the regional health network.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 shadow-soft">
                            <BadgeCheck className="w-6 h-6 text-sage-600 mb-2" />
                            <h3 className="text-navy-50 text-sm font-semibold mb-1">Audit Compliance</h3>
                            <p className="text-xs text-navy-400 leading-relaxed">All record access is cryptographically signed and stored immutably.</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-3 mt-12">
                    <Building2 className="w-8 h-8 text-navy-400" />
                    <div>
                        <p className="text-[10px] text-navy-400 font-bold uppercase tracking-wider">Enterprise Mode</p>
                        <p className="text-xs text-navy-50">Central Health Node Connected</p>
                    </div>
                </div>
            </div>

            {/* Right Panel: Auth Flow */}
            <div className="flex-1 flex items-center justify-center p-6 relative">
                {/* Background accents */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sage-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
                </div>

                <div className="w-full max-w-sm relative z-10">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-navy-50 mb-2">Provider Access</h2>
                                    <p className="text-sm text-navy-400">Sign in to your clinical workstation</p>
                                </div>
                                <form onSubmit={handleStep1} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Institutional Email</label>
                                        <input 
                                            type="email" required
                                            autoComplete="email"
                                            value={email} onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-white border border-navy-800 rounded-lg px-4 py-3 text-sm text-navy-50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all placeholder-navy-600"
                                            placeholder="dr.smith@hospital.org"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider">Passphrase</label>
                                            <button type="button" onClick={() => setIsResetOpen(true)} className="text-xs text-sage-600 hover:text-sage-700 transition-colors">Forgot Passphrase?</button>
                                        </div>
                                        <input 
                                            type="password" required
                                            autoComplete="current-password"
                                            value={password} onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-white border border-navy-800 rounded-lg px-4 py-3 text-sm text-navy-50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all placeholder-navy-600"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <button className="w-full py-3 mt-4 rounded-lg bg-sage-600 text-white font-bold text-sm hover:bg-sage-700 transition-colors flex justify-center shadow-soft hover:shadow-md">
                                        Authenticate
                                    </button>
                                </form>

                                <div className="flex items-center gap-4 my-6">
                                    <div className="flex-1 h-px bg-navy-800" />
                                    <span className="text-xs text-navy-400 font-bold uppercase">Or</span>
                                    <div className="flex-1 h-px bg-navy-800" />
                                </div>

                                <button 
                                    onClick={handleGoogleSignIn}
                                    disabled={isGoogleLoading}
                                    type="button"
                                    className="w-full py-3 rounded-lg bg-white border border-navy-200 text-navy-600 font-semibold text-sm flex items-center justify-center gap-3 hover:bg-navy-50 hover:border-navy-300 transition-all disabled:opacity-50"
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
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-navy-50 mb-2">Identity Verification</h2>
                                    <p className="text-sm text-navy-400">Confirm your medical affiliation</p>
                                </div>
                                <form onSubmit={handleStep2} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Hospital Network</label>
                                        <select value={hospital} onChange={e => setHospital(e.target.value)} className="w-full bg-white border border-navy-800 rounded-lg px-4 py-3 text-sm text-navy-50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 appearance-none">
                                            <option>Central General Hospital</option>
                                            <option>Metro Medical Center</option>
                                            <option>Valley Regional Health</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Department</label>
                                        <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full bg-white border border-navy-800 rounded-lg px-4 py-3 text-sm text-navy-50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 appearance-none">
                                            <option>Cardiology</option>
                                            <option>Neurology</option>
                                            <option>Oncology</option>
                                            <option>Pediatrics</option>
                                            <option>Emergency Care</option>
                                            <option>Orthopedics</option>
                                            <option>General Medicine</option>
                                            <option>Radiology</option>
                                            <option>Pathology</option>
                                            <option>Gynecology</option>
                                            <option>Dermatology</option>
                                            <option>Psychiatry</option>
                                            <option>Anesthesiology</option>
                                            <option>Urology</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Medical License ID</label>
                                        <input 
                                            type="text" required
                                            value={license} onChange={e => setLicense(e.target.value)}
                                            className="w-full bg-white border border-navy-800 rounded-lg px-4 py-3 text-sm text-sage-600 font-mono focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all uppercase"
                                            placeholder="MED-8492-XX"
                                        />
                                    </div>
                                    <button className="w-full py-3 mt-4 rounded-lg bg-sage-600 text-white font-bold text-sm hover:bg-sage-700 transition-colors flex justify-center shadow-soft hover:shadow-md">
                                        Verify Identity
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                                <div className="mb-8 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-sage-100/50 border border-sage-600/20 flex items-center justify-center mx-auto mb-4">
                                        <LockKeyhole className="w-8 h-8 text-sage-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-navy-50 mb-2">2FA Required</h2>
                                    <p className="text-sm text-navy-400">Enter the code from your authenticator app</p>
                                </div>
                                <form onSubmit={handleFinalLogin} className="space-y-6">
                                    <div>
                                        <input 
                                            type="text" required maxLength={6}
                                            value={authCode} onChange={e => setAuthCode(e.target.value)}
                                            className="w-full bg-white border border-navy-800 rounded-lg px-4 py-4 text-center tracking-[0.5em] text-2xl text-navy-50 font-mono focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all"
                                            placeholder="••••••"
                                        />
                                    </div>
                                    <button disabled={isLoading} className="w-full py-3 rounded-lg bg-sage-600 text-white font-bold text-sm hover:bg-sage-700 transition-colors flex justify-center items-center gap-2 shadow-soft hover:shadow-md disabled:opacity-50">
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><FileKey2 className="w-4 h-4" /> Establish Secure Session</>}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <ResetPasswordModal 
                isOpen={isResetOpen} 
                onClose={() => setIsResetOpen(false)} 
                role="doctor" 
            />
        </div>
    );
}
