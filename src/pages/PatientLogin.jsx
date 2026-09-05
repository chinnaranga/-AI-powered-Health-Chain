import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Shield, Activity, Lock, Mail, Key, ArrowRight, CheckCircle2, AlertCircle, ChevronDown, User, X } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { toast } from '../components/Toast';
import ParticleBackground from '../components/homepage/ParticleBackground';
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

    // Email authentication state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleIdentitySubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            localStorage.setItem('hc_email', email);
            const res = await login(email, password, 'patient');
            const user = res?.user || useAuthStore.getState().user;

            toast.success('Successfully logged in');
            navigate(user?.role === 'patient' ? '/patient/dashboard' : `/dashboard/${user?.role || 'patient'}`);
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
    };

    const handleGoogleSignIn = async () => {
        try {
            setIsGoogleLoading(true);
            setError('');
            
            const { auth, GoogleAuthProvider, signInWithPopup } = await import('../firebase/auth');
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, provider);
            const googleUser = result?.user;

            if (googleUser?.email) {
                localStorage.setItem('hc_email', googleUser.email);
            }
            if (googleUser?.displayName) {
                localStorage.setItem('hc_name', googleUser.displayName);
            }
            if (googleUser?.photoURL) {
                localStorage.setItem('hc_photo', googleUser.photoURL);
            }

            await loginGoogle('patient', googleUser);
            toast.success('Successfully logged in with Google');
            navigate('/patient/dashboard');
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
                    <form onSubmit={handleIdentitySubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-red-500 font-medium">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">
                                Email Address
                            </label>
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
                                <label className="block text-xs font-bold text-navy-400 uppercase tracking-wider">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsResetOpen(true)}
                                    className="text-xs text-sage-600 hover:text-sage-700 transition-colors"
                                >
                                    Forgot Password?
                                </button>
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-sage-600 hover:bg-sage-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In securely
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-navy-800" />
                            <span className="px-4 text-xs text-navy-400 uppercase tracking-wider">
                                Or continue with
                            </span>
                            <div className="flex-grow border-t border-navy-800" />
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isGoogleLoading}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-navy-800 hover:border-sage-600 disabled:opacity-60 disabled:cursor-not-allowed text-navy-700 font-semibold rounded-xl py-3.5 transition-all"
                        >
                            {isGoogleLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <span className="text-lg font-bold">G</span>
                            )}
                            {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
                        </button>

                        <div className="text-center pt-2">
                            <p className="text-sm text-navy-400">
                                Don't have an account?{' '}
                                <Link
                                    to="/patient/register"
                                    className="text-sage-600 hover:text-sage-700 font-semibold"
                                >
                                    Create one
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                    <ResetPasswordModal 
                        isOpen={isResetOpen} 
                        onClose={() => setIsResetOpen(false)} 
                        role="patient" 
                    />
                </motion.div>
            </div>
        </div>
    );
}
