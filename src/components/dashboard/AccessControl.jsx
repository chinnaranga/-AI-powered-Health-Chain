import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, UserCheck, UserX, Wallet, Copy, Trash2, Lock } from 'lucide-react';
import { GlassCard, NeonButton } from '../UIComponents';
import toast from 'react-hot-toast';

const AccessControl = ({ onGrant, onRevoke }) => {
    const [doctorAddress, setDoctorAddress] = useState('');
    const [authorizedDoctors, setAuthorizedDoctors] = useState([]);
    const [granting, setGranting] = useState(false);

    const handleGrant = async () => {
        if (!doctorAddress || !doctorAddress.startsWith('0x')) {
            toast.error('Enter a valid wallet address (0x...)');
            return;
        }

        if (authorizedDoctors.find(d => d.address === doctorAddress)) {
            toast.error('This address already has access');
            return;
        }

        setGranting(true);
        try {
            await onGrant(doctorAddress);
            setAuthorizedDoctors(prev => [
                ...prev,
                { address: doctorAddress, grantedAt: Date.now() }
            ]);
            toast.success('Access granted on-chain!');
            setDoctorAddress('');
        } catch (e) {
            toast.error('Grant failed: ' + (e.message || 'Unknown error'));
        } finally {
            setGranting(false);
        }
    };

    const handleRevoke = async (address) => {
        try {
            await onRevoke(address);
            setAuthorizedDoctors(prev => prev.filter(d => d.address !== address));
            toast.success('Access revoked');
        } catch (e) {
            toast.error('Revoke failed');
        }
    };

    const copyAddress = (addr) => {
        navigator.clipboard.writeText(addr);
        toast.success('Address copied');
    };

    return (
        <GlassCard className="h-full group/access" hover={true}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-[#00F5FF]" />
                        Smart Contract Access
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Manage clinician permissions via Ethereum network</p>
                </div>
            </div>

            {/* Wallet Input Area */}
            <div className="space-y-4 mb-8">
                <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/access:text-[#00F5FF] transition-colors" />
                    <input
                        value={doctorAddress}
                        onChange={e => setDoctorAddress(e.target.value)}
                        placeholder="Doctor Wallet Address (0x...)"
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-navy-900/50 border border-white/10 text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:border-[#00F5FF]/50 focus:shadow-[0_0_20px_rgba(0,245,255,0.1)] transition-all"
                    />
                </div>

                <div className="flex gap-3">
                    <NeonButton onClick={handleGrant} disabled={granting} className="flex-1" variant="primary">
                        <UserCheck className="w-4 h-4" />
                        {granting ? 'Processing...' : 'Grant Access'}
                    </NeonButton>
                    <NeonButton
                        variant="outline"
                        onClick={() => doctorAddress && handleRevoke(doctorAddress)}
                        className="flex-1"
                    >
                        <UserX className="w-4 h-4" />
                        Revoke Access
                    </NeonButton>
                </div>
            </div>

            {/* Authorized Doctors List */}
            <div className="border-t border-white/5 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        Authorized Clinicians
                    </h4>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-bold text-slate-400">
                        {authorizedDoctors.length}
                    </span>
                </div>

                {authorizedDoctors.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-8 bg-navy-900/30 rounded-2xl border border-dashed border-white/5"
                    >
                        <Lock className="w-8 h-8 text-slate-700 mb-2" />
                        <p className="text-slate-600 text-xs font-medium uppercase tracking-tighter">No Access Nodes Active</p>
                    </motion.div>
                ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence>
                            {authorizedDoctors.map((doc) => (
                                <motion.div
                                    key={doc.address}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all group/node"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-lg bg-navy-900 border border-white/10 flex items-center justify-center shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-mono text-xs text-white truncate font-medium">{doc.address}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-0.5">
                                                ID Verified • {new Date(doc.grantedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover/node:opacity-100 transition-all transform translate-x-2 group-hover/node:translate-x-0">
                                        <button
                                            onClick={() => copyAddress(doc.address)}
                                            className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-[#00F5FF] transition-colors"
                                            title="Copy Hash"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleRevoke(doc.address)}
                                            className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                                            title="Revoke Permission"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </GlassCard>
    );
};

export default AccessControl;
