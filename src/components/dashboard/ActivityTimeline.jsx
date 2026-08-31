import React from 'react';
import { motion } from 'framer-motion';
import { Upload, UserCheck, UserX, ShieldCheck, Clock } from 'lucide-react';
import { GlassCard } from '../UIComponents';

const eventConfig = {
    upload: { icon: Upload, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', line: 'bg-cyan-500/30' },
    grant: { icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', line: 'bg-emerald-500/30' },
    revoke: { icon: UserX, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', line: 'bg-red-500/30' },
    verify: { icon: ShieldCheck, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', line: 'bg-purple-500/30' },
};

// Demo events to show timeline structure
const demoEvents = [
    { type: 'upload', title: 'Record Uploaded', description: 'Blood test report added to IPFS', time: '2 min ago' },
    { type: 'verify', title: 'Verification Completed', description: 'AES-256 encryption confirmed', time: '15 min ago' },
    { type: 'grant', title: 'Access Granted', description: 'Dr. Patel (0x7a2B...9f1C) authorized', time: '1 hour ago' },
    { type: 'upload', title: 'Record Uploaded', description: 'X-Ray scan stored on-chain', time: '3 hours ago' },
    { type: 'revoke', title: 'Access Revoked', description: 'Dr. Kumar (0x3eF1...8d2A) removed', time: '1 day ago' },
    { type: 'verify', title: 'Verification Completed', description: 'Smart contract audit passed', time: '2 days ago' },
];

const ActivityTimeline = ({ events = demoEvents }) => {
    return (
        <GlassCard className="h-full flex flex-col group/timeline" hover={true}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Clock className="w-6 h-6 text-[#00F5FF]" />
                        Activity Timeline
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Real-time ledger event monitoring</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">Live Node</span>
                </div>
            </div>

            <div className="relative flex-1 overflow-y-auto pr-4 custom-scrollbar">
                {/* Vertical Line Gradient */}
                <div className="absolute left-[23px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-[#00F5FF]/50 via-white/5 to-transparent" />

                <div className="space-y-6 pb-4">
                    {events.map((event, index) => {
                        const config = eventConfig[event.type] || eventConfig.upload;
                        const Icon = config.icon;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.08 }}
                                className="relative flex items-start gap-6 group/item"
                            >
                                {/* Event Indicator Hub */}
                                <div className="relative z-10 shrink-0">
                                    <div className={`w-12 h-12 rounded-2xl ${config.bg} border ${config.border} flex items-center justify-center shadow-lg group-hover/item:scale-110 group-hover/item:shadow-[0_0_20px_rgba(0,245,255,0.2)] transition-all duration-300`}>
                                        <Icon className={`w-5 h-5 ${config.color}`} />
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-navy-900 border ${config.border} flex items-center justify-center`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text-', 'bg-')} animate-pulse`} />
                                    </div>
                                </div>

                                {/* Content Card */}
                                <div className="flex-1 min-w-0 pt-1">
                                    <div className="flex items-center justify-between gap-4 mb-1">
                                        <h4 className="text-sm font-bold text-white group-hover/item:text-[#00F5FF] transition-colors">
                                            {event.title}
                                        </h4>
                                        <time className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter shrink-0 whitespace-nowrap">
                                            {event.time}
                                        </time>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed max-w-[300px]">
                                        {event.description}
                                    </p>

                                    {/* Action Link (Enterprise detail) */}
                                    <button className="mt-3 text-[10px] font-bold text-slate-600 hover:text-[#00F5FF] uppercase tracking-widest flex items-center gap-1 transition-colors">
                                        View Details
                                        <span className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all">→</span>
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </GlassCard>
    );
};

export default ActivityTimeline;
