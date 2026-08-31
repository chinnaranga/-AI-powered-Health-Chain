import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, FileText, Clock, Lock } from 'lucide-react';
import { GlassCard } from '../UIComponents';
import { toast } from '../Toast';

const statusConfig = {
    encrypted: {
        label: 'Encrypted',
        classes: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    verified: {
        label: 'Verified',
        classes: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    pending: {
        label: 'Pending',
        classes: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
};

const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig.encrypted;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${config.classes}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {config.label}
        </span>
    );
};

import RecordStatus from './RecordStatus';

const RecordsTable = ({ records = [] }) => {
    return (
        <GlassCard className="h-full flex flex-col group/table" hover={true}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText className="w-6 h-6 text-[#00F5FF]" />
                        On-Chain History
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Verify immutable records via blockchain ledger</p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-xs font-bold text-[#00F5FF]">{records.length} <span className="text-slate-500">RECORDS</span></span>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
                {records.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col items-center justify-center py-12 text-center"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.05, 1],
                                opacity: [0.3, 0.5, 0.3]
                            }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className="w-24 h-24 rounded-full bg-navy-900 border-2 border-dashed border-white/10 flex items-center justify-center mb-6"
                        >
                            <FileText className="w-10 h-10 text-slate-700" />
                        </motion.div>
                        <p className="text-white font-bold mb-1">No Blocks Detected</p>
                        <p className="text-slate-500 text-xs max-w-[200px]">Synchronize your first medical record to prime the portfolio</p>
                    </motion.div>
                ) : (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Themed Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-white/10 bg-navy-900/40">
                            <div className="col-span-4">Record Hash / Node</div>
                            <div className="col-span-3">Timestamp</div>
                            <div className="col-span-3">Verification</div>
                            <div className="col-span-2 text-right">Access</div>
                        </div>

                        {/* Scrollable Container with custom scrollbar */}
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1 py-1">
                            {records.map((record, index) => {
                                const status = record.verified ? 'verified' : (record.ipfsHash ? 'encrypted' : 'pending');
                                return (
                                    <motion.div
                                        key={record.hash || record.id || index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="grid grid-cols-12 gap-4 items-center px-6 py-4 border border-transparent hover:border-cyan-500/20 hover:bg-cyan-500/5 transition-all duration-300 rounded-xl group/row"
                                    >
                                        <div className="col-span-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-navy-900 border border-white/5 flex items-center justify-center group-hover/row:border-[#00F5FF]/30 transition-colors">
                                                <Lock className="w-3.5 h-3.5 text-slate-600 group-hover/row:text-[#00F5FF] transition-colors" />
                                            </div>
                                            <span className="font-mono text-xs text-slate-400 font-medium tracking-tight truncate group-hover/row:text-white transition-colors">
                                                {(record.ipfsHash || record.hash || '').substring(0, 18)}...
                                            </span>
                                        </div>
                                        <div className="col-span-3">
                                            <span className="text-xs text-slate-500 font-medium flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-slate-600" />
                                                {new Date(record.timestamp).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="col-span-3">
                                            <RecordStatus status={status} />
                                        </div>
                                        <div className="col-span-2 text-right text-xs">
                                            <motion.button
                                                whileHover={{ scale: 1.05, x: 2 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    if (record.ipfsHash) {
                                                        navigator.clipboard.writeText(record.ipfsHash);
                                                        toast.success('IPFS CID hash copied to clipboard!');
                                                    } else {
                                                        toast.warn('IPFS CID hash is still pending on-chain validation.');
                                                    }
                                                }}
                                                className="inline-flex items-center gap-2 text-[#00F5FF] font-bold hover:text-white transition-colors py-1.5 px-3 rounded-lg border border-[#00F5FF]/20 hover:bg-[#00F5FF]/20"
                                            >
                                                COPY <ExternalLink className="w-3 h-3" />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </GlassCard>
    );
};

export default RecordsTable;
