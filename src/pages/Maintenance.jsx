import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldAlert, RefreshCw, Cpu, Activity, 
    CheckCircle2, Clock, Globe, ArrowRight, 
    Lock, HardDrive, Wifi 
} from 'lucide-react';

export default function Maintenance() {
    const [progress, setProgress] = useState(87.4);
    const [statusText, setStatusText] = useState('Syncing decentralised ledger consensus...');
    const [pingStatus, setPingStatus] = useState('idle'); // 'idle' | 'pinging' | 'success'
    const [logs, setLogs] = useState([
        { id: 1, text: 'Consensus engine upgrade: INITIATED', type: 'info', time: '12:00' },
        { id: 2, text: 'Migrating IPFS cryptographic hashes: COMPLETE', type: 'success', time: '12:08' },
        { id: 3, text: 'Synchronizing network validator nodes: PENDING', type: 'pending', time: '12:20' }
    ]);

    // Live progress simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 99.9) {
                    setStatusText('Ledger synchronization finalized. Awaiting gateway validation.');
                    return 99.9;
                }
                const increment = +(Math.random() * 0.4).toFixed(2);
                const nextVal = +(prev + increment).toFixed(1);
                
                // Dynamically update status messages
                if (nextVal > 98) {
                    setStatusText('Validating zero-knowledge proof contracts...');
                } else if (nextVal > 95) {
                    setStatusText('Securing clinical shard database transactions...');
                } else if (nextVal > 92) {
                    setStatusText('Synchronizing consensus validator signatures...');
                }
                
                return nextVal > 99.9 ? 99.9 : nextVal;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Live log tick simulation
    useEffect(() => {
        const interval = setInterval(() => {
            if (progress < 99.9) {
                const newLog = {
                    id: Date.now(),
                    text: `Node [HC-VALIDATOR-${Math.floor(Math.random() * 899 + 100)}] verified shard block integrity.`,
                    type: 'success',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                };
                setLogs(prev => [newLog, ...prev.slice(0, 4)]);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [progress]);

    const handleVerifyConnection = () => {
        setPingStatus('pinging');
        setTimeout(() => {
            setPingStatus('success');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#070f1a] text-white flex flex-col items-center justify-center p-6 relative font-sans overflow-hidden">
            {/* Ambient Animated Glow / Background Grid */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(0, 200, 212, 0.05) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                
                {/* Moving glowing gradient blobs */}
                <motion.div 
                    animate={{
                        x: [0, 40, -20, 0],
                        y: [0, -40, 20, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-teal-500/10 rounded-full blur-[120px]" 
                />
                <motion.div 
                    animate={{
                        x: [0, -30, 40, 0],
                        y: [0, 50, -30, 0],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[120px]" 
                />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-2xl relative z-10"
            >
                {/* System Badge */}
                <div className="flex justify-center mb-6">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wider uppercase"
                    >
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        System Maintenance Active
                    </motion.div>
                </div>

                {/* Core Header Card */}
                <div className="bg-[#0F1C30]/40 border border-[#1D2F4A] rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    {/* Decorative glass reflection */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />

                    <div className="text-center relative z-10">
                        {/* Interactive gear/cpu animated logo */}
                        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-2xl border-2 border-dashed border-[#00C8D4]/20"
                            />
                            <motion.div 
                                animate={{ rotate: -360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-2 rounded-xl border border-dotted border-[#00C8D4]/40"
                            />
                            <div className="w-12 h-12 rounded-xl bg-[#00C8D4]/10 border border-[#00C8D4]/30 flex items-center justify-center relative">
                                <Cpu className="w-6 h-6 text-[#00C8D4]" />
                                <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C8D4]/40 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00C8D4]"></span>
                                </span>
                            </div>
                        </div>

                        {/* Heading */}
                        <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                            HealthChain Ledger Upgrade
                        </h1>
                        
                        <p className="text-[#6B83A6] text-sm mt-3 max-w-md mx-auto leading-relaxed">
                            The HealthChain ledger network is currently undergoing cryptographic sharding updates and block height consensus sync. Normal patient and provider node operations will resume shortly.
                        </p>
                    </div>

                    {/* Interactive Live Progress Sync Block */}
                    <div className="mt-8 pt-6 border-t border-[#1D2F4A]/60">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#00C8D4] flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 animate-pulse text-[#00C8D4]" />
                                {statusText}
                            </span>
                            <span className="text-sm font-bold font-mono text-slate-300">{progress}%</span>
                        </div>
                        {/* Progress Bar Container */}
                        <div className="h-2 w-full bg-[#070f1a] rounded-full overflow-hidden border border-[#1D2F4A]/40 p-[2px]">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-teal-500 to-[#00C8D4] rounded-full" 
                                initial={{ width: '87.4%' }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8 }}
                            />
                        </div>
                    </div>

                    {/* Network Live logs ticker */}
                    <div className="mt-6 p-4 rounded-xl bg-[#070f1a]/80 border border-[#1D2F4A]/50">
                        <div className="flex items-center justify-between mb-3 border-b border-[#1D2F4A]/40 pb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B83A6] flex items-center gap-1">
                                <HardDrive className="w-3 h-3" /> Live Protocol Events
                            </span>
                            <span className="text-[10px] text-teal-400 font-mono flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span> Live Shard
                            </span>
                        </div>
                        <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                            <AnimatePresence initial={false}>
                                {logs.map((log) => (
                                    <motion.div 
                                        key={log.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="flex items-start justify-between text-[11px] font-mono leading-relaxed"
                                    >
                                        <span className="text-slate-400 text-left line-clamp-1 flex-1">
                                            <span className="text-teal-500/80 mr-1.5">›</span>{log.text}
                                        </span>
                                        <span className="text-[#6B83A6] ml-2 text-right shrink-0">{log.time}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Encryption & Security Guarantee badge */}
                    <div className="mt-6 flex items-center gap-3 p-4 bg-teal-950/20 border border-teal-500/10 rounded-xl">
                        <Lock className="w-5 h-5 text-teal-400 shrink-0" />
                        <div className="text-left text-xs leading-relaxed text-[#6B83A6]">
                            <strong className="text-teal-300">Data Integrity Guard:</strong> All electronic health records (EHR) remain secure on the decentralized ledger. Patient privacy and access control vectors are untouched.
                        </div>
                    </div>
                </div>

                {/* Interactive Connection Checker Box */}
                <div className="mt-6 bg-[#0F1C30]/20 border border-[#1D2F4A]/40 rounded-2xl p-5 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            pingStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800/50 text-slate-400'
                        }`}>
                            <Wifi className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <div className="text-xs font-semibold text-slate-200">Local Node Connectivity</div>
                            <div className="text-[11px] text-[#6B83A6]">
                                {pingStatus === 'idle' && 'Test your blockchain node connectivity'}
                                {pingStatus === 'pinging' && 'Pinging network validators...'}
                                {pingStatus === 'success' && 'Connection secure. Ping: 12ms. Gateway: Active.'}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleVerifyConnection}
                        disabled={pingStatus === 'pinging'}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                            pingStatus === 'success'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                                : 'bg-[#00C8D4] text-[#070f1a] hover:bg-[#00E5F0] shadow-[0_0_15px_rgba(0,200,212,0.15)] disabled:opacity-50'
                        }`}
                    >
                        {pingStatus === 'pinging' ? (
                            <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying...
                            </>
                        ) : pingStatus === 'success' ? (
                            <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Node Ready
                            </>
                        ) : (
                            <>
                                Verify Node <ArrowRight className="w-3.5 h-3.5" />
                            </>
                        )}
                    </button>
                </div>

                {/* Footer status link */}
                <div className="mt-8 text-center text-xs text-[#6B83A6] flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                    <span className="flex items-center gap-1 justify-center">
                        <Globe className="w-3.5 h-3.5" /> Network Status: <span className="text-amber-400 font-semibold">Maintenance</span>
                    </span>
                    <span className="hidden sm:inline text-slate-700">|</span>
                    <span>System Administration: <a href="mailto:support@healthchain.org" className="text-[#00C8D4] hover:underline transition-all font-semibold">support@healthchain.org</a></span>
                </div>
            </motion.div>
        </div>
    );
}
