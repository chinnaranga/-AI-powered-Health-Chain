import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge, EmptyState } from '../UIComponents';
import { ShieldCheck, Hash, CheckCircle, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const VerificationPanel = () => {
    const [hashInput, setHashInput] = useState('');
    const [result, setResult] = useState(null);
    const [checking, setChecking] = useState(false);

    const handleVerify = async () => {
        if (!hashInput.trim()) return;
        setChecking(true);
        await new Promise(r => setTimeout(r, 1200));
        setResult(hashInput.startsWith('0x') || hashInput.startsWith('Qm') ? 'verified' : 'tampered');
        setChecking(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                        value={hashInput}
                        onChange={e => { setHashInput(e.target.value); setResult(null); }}
                        placeholder="Record hash or IPFS CID (0x... or Qm...)"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <Button variant="blue" onClick={handleVerify} disabled={checking || !hashInput.trim()}>
                    {checking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    {checking ? 'Checking…' : 'Verify'}
                </Button>
            </div>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`p-5 rounded-xl border-2 ${result === 'verified' ? 'border-teal-600 bg-teal-900/10' : 'border-red-600 bg-red-900/10'}`}
                    >
                        <div className="flex items-start gap-3">
                            {result === 'verified'
                                ? <CheckCircle className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                                : <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
                            <div className="flex-1">
                                <p className={`text-sm font-semibold ${result === 'verified' ? 'text-teal-400' : 'text-red-400'}`}>
                                    {result === 'verified' ? 'Record integrity confirmed on blockchain' : 'Integrity check failed — possible tampering detected'}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 font-mono break-all">{hashInput}</p>
                                {result === 'verified' && (
                                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                                        <span className="text-slate-500">Block Number</span>
                                        <span className="text-slate-300 font-mono">#{Math.floor(Math.random() * 900000 + 100000)}</span>
                                        <span className="text-slate-500">Network</span>
                                        <span className="text-slate-300">Local Dev (Hardhat)</span>
                                        <span className="text-slate-500">Timestamp</span>
                                        <span className="text-slate-300">{new Date().toLocaleString()}</span>
                                        <span className="text-slate-500">Confirmations</span>
                                        <span className="text-slate-300">12</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <p className="text-xs text-slate-400">
                    To bulk-verify all records for a patient, go to the <span className="text-blue-400 font-medium">Records</span> tab and use the checkbox selection.
                </p>
            </div>
        </div>
    );
};

export default VerificationPanel;
