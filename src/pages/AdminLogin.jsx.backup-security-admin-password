import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock, Mail, Eye, EyeOff, Shield, Loader2, AlertTriangle,
    Server, Activity, CheckCircle, Fingerprint, Key, Globe,
    Database, Cpu, Radio, ShieldAlert
} from 'lucide-react';
import { toast } from '../components/Toast';
import useAuthStore from '../store/authStore';

const ADMIN_EMAIL    = 'admin@healthchain.io';
const ADMIN_PASSWORD = 'Admin@2024';

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');
    const [step, setStep]         = useState(1); // 1 = credentials, 2 = 2FA

    // Simulated real-time node activity
    const [nodes, setNodes] = useState([
        { id: 'us-east-1', status: 'optimal', load: 42 },
        { id: 'eu-west-2', status: 'optimal', load: 38 },
        { id: 'ap-south-1', status: 'optimal', load: 45 },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setNodes(prev => prev.map(n => ({
                ...n,
                load: Math.max(20, Math.min(80, n.load + (Math.random() * 10 - 5)))
            })));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (step === 1) {
            setLoading(true);
            if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
                setError('Invalid administrator credentials.');
                setLoading(false);
                return;
            }
            // Simulate credential check before 2FA
            setTimeout(() => {
                setLoading(false);
                setStep(2);
            }, 800);
            return;
        }

        // Step 2: Proceed to firebase auth
        setLoading(true);
        try {
            await login(email, password, 'admin');
            localStorage.setItem('hc_admin', 'true');
            localStorage.setItem('hc_role', 'admin');
            toast.success('Security Clearance Granted');
            navigate('/dashboard/admin');
        } catch (err) {
            setError(err.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-navy-950 flex">
            {/* LEFT SIDE: Infrastructure Operations Panel */}
            <div className="hidden lg:flex w-[45%] border-r border-navy-800 relative flex-col justify-between overflow-hidden bg-white">
                {/* Background Effects */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(64,93,78,0.05),transparent_50%)]" />
                    <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(184,144,71,0.05),transparent_50%)]" />
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(26, 36, 33, 0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                </div>

                <div className="relative z-10 p-10 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 rounded-xl bg-sage-100/50 border border-sage-600/20 flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5 text-sage-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-navy-50 font-display tracking-tight">HealthChain Admin Console</h1>
                            <p className="text-[11px] text-gold-500 font-mono uppercase tracking-widest mt-0.5">Global Infrastructure Operations</p>
                        </div>
                    </div>

                    <div className="space-y-8 max-w-md">
                        <div>
                            <h2 className="text-sm font-semibold text-navy-50 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-sage-600" /> System Health
                            </h2>
                            <div className="space-y-3">
                                {nodes.map((node) => (
                                    <div key={node.id} className="p-3 rounded-lg bg-navy-900 border border-navy-800 shadow-soft">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <Server className="w-3.5 h-3.5 text-navy-400" />
                                                <span className="text-xs font-mono text-navy-50">{node.id}</span>
                                            </div>
                                            <span className="flex items-center gap-1.5 text-[10px] text-sage-600 uppercase font-bold">
                                                <span className="w-1.5 h-1.5 rounded-full bg-sage-600 animate-pulse" />
                                                {node.status}
                                            </span>
                                        </div>
                                        <div className="h-1 bg-navy-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-sage-600 rounded-full transition-all duration-500" style={{ width: `${node.load}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-navy-50 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Radio className="w-4 h-4 text-gold-500" /> Live Security Feed
                            </h2>
                            <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 font-mono text-[10px] text-navy-400 space-y-2 h-40 overflow-hidden relative shadow-soft">
                                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent z-10" />
                                <motion.div animate={{ y: [0, -20] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="space-y-2">
                                    <p><span className="text-sage-600 font-bold">[OK]</span> Syncing block #89421...</p>
                                    <p><span className="text-gold-500 font-bold">[INFO]</span> Auth node US-EAST active</p>
                                    <p><span className="text-sage-600 font-bold">[OK]</span> DB replication complete</p>
                                    <p><span className="text-gold-600 font-bold">[WARN]</span> Block height variance detected</p>
                                    <p><span className="text-sage-600 font-bold">[OK]</span> Resolving consensus...</p>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 p-10 mt-auto border-t border-navy-800 bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-6">
                        {['HIPAA Compliant', 'SOC 2 Type II', 'ISO 27001'].map(cert => (
                            <div key={cert} className="flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-sage-600" />
                                <span className="text-[10px] text-navy-400 font-bold uppercase tracking-wider">{cert}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Authentication Panel */}
            <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-8 relative z-10 bg-navy-950">
                
                {/* Emergency Header */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gold-500" />
                <div className="absolute top-6 right-8 flex items-center gap-2 px-3 py-1.5 rounded-md bg-gold-50 border border-gold-500/20">
                    <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
                    <span className="text-[10px] text-gold-600 font-bold uppercase tracking-wider">Restricted Area</span>
                </div>

                <div className="w-full max-w-[400px]">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-navy-800 flex items-center justify-center mx-auto mb-5 shadow-soft relative">
                            <div className="absolute inset-0 rounded-2xl border border-gold-500/20 blur-[1px]" />
                            <Lock className="w-7 h-7 text-sage-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-navy-50 font-display">Authentication Gateway</h2>
                        <p className="text-xs text-navy-400 mt-2 font-mono">Verify identity to access enterprise infrastructure</p>
                    </div>

                    <div className="bg-white border border-navy-800 rounded-2xl p-6 shadow-soft relative overflow-hidden">
                        
                        {/* Scanline effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-500/5 to-transparent h-[100px] -translate-y-full animate-[scan_3s_ease-in-out_infinite]" />

                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-5">
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                            <AnimatePresence mode="wait">
                                {step === 1 ? (
                                    <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] text-navy-400 font-bold mb-2 uppercase tracking-widest">Admin Identifier</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    placeholder="admin@healthchain.io"
                                                    required
                                                    autoComplete="email"
                                                    className="w-full bg-white border border-navy-800 rounded-xl pl-11 pr-4 py-3 text-sm text-navy-50 placeholder-navy-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-navy-400 font-bold mb-2 uppercase tracking-widest">Passphrase</label>
                                            <div className="relative">
                                                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                                                <input
                                                    type={showPass ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    required
                                                    autoComplete="current-password"
                                                    className="w-full bg-white border border-navy-800 rounded-xl pl-11 pr-10 py-3 text-sm text-navy-50 placeholder-navy-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all font-mono"
                                                />
                                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-50 transition-colors">
                                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4 text-center pb-2">
                                        <div className="w-12 h-12 rounded-full bg-sage-100 border border-sage-600/20 flex items-center justify-center mx-auto mb-4">
                                            <Fingerprint className="w-6 h-6 text-sage-600" />
                                        </div>
                                        <h3 className="text-sm font-bold text-navy-50 uppercase tracking-widest">Two-Factor Authentication</h3>
                                        <p className="text-xs text-navy-400">Enter the 6-digit code from your authenticator device or hardware security key.</p>
                                        <div className="flex justify-center gap-2 mt-4">
                                            {[...Array(6)].map((_, i) => (
                                                <input key={i} type="text" maxLength={1} className="w-10 h-12 bg-white border border-navy-800 rounded-lg text-center text-lg text-navy-50 font-mono focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 outline-none" />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 mt-6 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 border border-sage-600/50 shadow-soft hover:shadow-md"
                            >
                                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : step === 1 ? 'Verify Credentials' : 'Authenticate Session'}
                            </button>
                        </form>
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-navy-900 border border-navy-800 shadow-soft">
                            <div className="flex items-center gap-2 text-xs text-navy-400">
                                <Database className="w-3.5 h-3.5" /> IP Logged
                            </div>
                            <span className="text-xs font-mono text-navy-50">192.168.1.104</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-navy-900 border border-navy-800 shadow-soft">
                            <div className="flex items-center gap-2 text-xs text-navy-400">
                                <Globe className="w-3.5 h-3.5" /> Geolocation
                            </div>
                            <span className="text-xs font-mono text-sage-600 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-sage-600" /> Verified
                            </span>
                        </div>
                    </div>
                    
                    <div className="mt-8 text-center">
                        <p className="text-[10px] text-navy-400 font-mono uppercase tracking-widest">
                            Session Trust Score: <span className="text-sage-600 font-bold">98%</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
