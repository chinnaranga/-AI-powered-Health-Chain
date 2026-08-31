import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GitBranch, FileText, Shield, Key, Eye, Brain, Clock,
    AlertTriangle, CheckCircle, LogOut, Upload, ChevronDown, ChevronUp,
    Filter, Zap, Activity, User
} from 'lucide-react';
import { useAuditLogs } from '../../hooks/useAuditLogs';

/* ── Event type config ── */
const EVENT_CONFIG = {
    RECORD_UPLOADED: {
        label: 'Record Uploaded',
        icon: Upload,
        color: 'text-[#00C8D4]',
        bg: 'bg-[#00C8D4]/10',
        border: 'border-[#00C8D4]/30',
        barColor: 'bg-[#00C8D4]',
        category: 'records',
    },
    ACCESS_REQUEST_CREATED: {
        label: 'Doctor Requested Access',
        icon: Shield,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        barColor: 'bg-amber-400',
        category: 'access',
    },
    REQUEST_APPROVED_OTP_GENERATED: {
        label: 'Patient Approved & OTP Generated',
        icon: CheckCircle,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        barColor: 'bg-emerald-400',
        category: 'access',
    },
    OTP_VERIFIED_ACCESS_GRANTED: {
        label: 'OTP Verified — Access Granted',
        icon: Key,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        barColor: 'bg-purple-400',
        category: 'access',
    },
    RECORD_DECRYPTED_VIEWED: {
        label: 'Record Viewed',
        icon: Eye,
        color: 'text-teal-400',
        bg: 'bg-teal-500/10',
        border: 'border-teal-500/30',
        barColor: 'bg-teal-400',
        category: 'records',
    },
    AI_SUMMARY_GENERATED: {
        label: 'AI Summary Generated',
        icon: Brain,
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/30',
        barColor: 'bg-indigo-400',
        category: 'ai',
    },
    REQUEST_REJECTED: {
        label: 'Access Request Rejected',
        icon: LogOut,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        barColor: 'bg-red-400',
        category: 'access',
    },
    EMERGENCY_ACCESS: {
        label: 'Emergency Access Invoked',
        icon: Zap,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        barColor: 'bg-red-400',
        category: 'emergency',
    },
    ACCESS_GRANTED: {
        label: 'Workstation Access Granted',
        icon: Key,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        barColor: 'bg-purple-400',
        category: 'access',
    },
    ACCESS_REVOKED: {
        label: 'Workstation Access Revoked',
        icon: LogOut,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        barColor: 'bg-red-400',
        category: 'access',
    },
    OTP_GENERATED: {
        label: 'OTP Access Key Generated',
        icon: Key,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        barColor: 'bg-emerald-400',
        category: 'access',
    },
    OTP_REVOKED: {
        label: 'OTP Access Key Revoked',
        icon: LogOut,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        barColor: 'bg-amber-400',
        category: 'access',
    },
    SESSION_REVOKED: {
        label: 'Session Revoked',
        icon: LogOut,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        barColor: 'bg-amber-400',
        category: 'access',
    },
    GENERAL_ACCESS_CODE_REVOKED: {
        label: 'Access Code Revoked',
        icon: LogOut,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        barColor: 'bg-amber-400',
        category: 'access',
    },
};

const FALLBACK_CONFIG = {
    label: 'System Event',
    icon: Activity,
    color: 'text-[#8899AA]',
    bg: 'bg-white/5',
    border: 'border-white/10',
    barColor: 'bg-slate-500',
    category: 'other',
};

function getEventDescription(event) {
    const type = event.activityType;
    const details = event.details || {};
    switch (type) {
        case 'RECORD_UPLOADED':
            return `A new health record of type "${details.recordType || 'General Document'}" was uploaded by ${event.actorName || 'the patient'} and encrypted using AES-256 on the decentralized storage network.`;
        case 'ACCESS_REQUEST_CREATED':
            return `Dr. ${details.doctorName || event.actorName || 'Unknown Doctor'} requested read authorization for the patient profile. Request Urgency: ${details.urgency || 'Normal'}. Reason: ${details.reason || 'Medical Consultation'}.`;
        case 'REQUEST_APPROVED_OTP_GENERATED':
            return `Access request approved. A one-time verification passcode (OTP) was generated and dispatched to the patient's authenticated device.`;
        case 'OTP_VERIFIED_ACCESS_GRANTED':
            return `Cryptographic security validation successful. Doctor session established. Workstation authorized to access decrypt keys.`;
        case 'RECORD_DECRYPTED_VIEWED':
            return `Attending medical provider decrypted and viewed record "${details.recordTitle || 'Clinical Record'}". Transaction signed on-chain.`;
        case 'AI_SUMMARY_GENERATED':
            return `On-chain AI engine analyzed medical records and compiled a secure, decentralized health intelligence report.`;
        case 'REQUEST_REJECTED':
            return `Workstation access request declined by the patient. No cryptographic keys were exchanged.`;
        case 'EMERGENCY_ACCESS':
            return `EMERGENCY break-glass protocol triggered by attending physician. Patient record access granted instantly under critical care clause. Audit trail recorded.`;
        case 'SESSION_REVOKED':
            return `Active medical session terminated. Cryptographic access keys have been invalidated.`;
        case 'ACCESS_REVOKED':
            return `Active clinical workstation access revoked. System session key deleted.`;
        case 'OTP_GENERATED':
            return `One-Time PIN issued for provider validation.`;
        case 'OTP_REVOKED':
            return `One-Time PIN revoked and marked inactive.`;
        default:
            return typeof event.details === 'string' ? event.details : `System operation completed successfully on the decentralized ledger.`;
    }
}



/* ── Time formatter ── */
function timeAgo(date) {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

/* ── Filter Tabs ── */
const FILTERS = [
    { key: 'all', label: 'All Events' },
    { key: 'records', label: 'Records' },
    { key: 'access', label: 'Access' },
    { key: 'ai', label: 'AI' },
    { key: 'emergency', label: 'Emergency' },
];

/* ── Timeline Event Card ── */
function TimelineEvent({ event, index }) {
    const [expanded, setExpanded] = useState(false);
    const cfg = EVENT_CONFIG[event.activityType] || FALLBACK_CONFIG;
    const Icon = cfg.icon;
    const isLast = false;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(index * 0.06, 0.6) }}
            className="relative pl-10 group"
        >
            {/* Connector dot */}
            <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center border ${cfg.border} ${cfg.bg} z-10 bg-[#0B0F1A] transition-transform duration-300 group-hover:scale-110`}>
                <Icon className={`w-4 h-4 ${cfg.color}`} />
            </div>

            {/* Card */}
            <div
                onClick={() => setExpanded(e => !e)}
                className={`ml-4 p-4 rounded-xl border transition-all cursor-pointer ${expanded ? `${cfg.border} ${cfg.bg}` : 'border-[#1E2D4580] hover:border-[#1E2D45] hover:bg-white/[0.015]'}`}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-bold text-white">{cfg.label}</span>
                            {event.activityType === 'EMERGENCY_ACCESS' && (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                                    <AlertTriangle className="w-2.5 h-2.5" /> Critical
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#4A5568] font-mono">
                            <User className="w-3 h-3" />
                            <span>{event.actorName}</span>
                            {event.hospital && <><span className="text-[#1E2D45]">·</span><span>{event.hospital}</span></>}
                            <span className="text-[#1E2D45]">·</span>
                            <Clock className="w-3 h-3" />
                            <span>{timeAgo(event.timestamp)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] font-mono text-[#8899AA] hidden sm:block">
                            {new Date(event.timestamp).toLocaleDateString()}
                        </span>
                        {expanded ? <ChevronUp className="w-4 h-4 text-[#8899AA]" /> : <ChevronDown className="w-4 h-4 text-[#8899AA]" />}
                    </div>
                </div>

                <AnimatePresence>
                    {expanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                            className="overflow-hidden">
                            <div className="mt-3 pt-3 border-t border-[#1E2D4580]">
                                <p className="text-xs text-[#8899AA] leading-relaxed">{getEventDescription(event)}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] font-mono text-[#4A5568]">
                                        {new Date(event.timestamp).toLocaleString()}
                                    </span>
                                    {event.txHash && (
                                        <span className="text-[10px] font-mono text-[#4A5568] flex items-center gap-1">
                                            <span className="text-[#1E2D45]">·</span> TX: {event.txHash}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

/* ── PAGE ── */
export default function SmartTimelinePage() {
    const { logs: events = [], isLoading } = useAuditLogs();
    const [activeFilter, setActiveFilter] = useState('all');

    const filtered = useMemo(() => {
        if (activeFilter === 'all') return events;
        return events.filter(e => {
            const cfg = EVENT_CONFIG[e.activityType] || FALLBACK_CONFIG;
            return cfg.category === activeFilter;
        });
    }, [events, activeFilter]);

    const kpis = [
        { label: 'Total Events', value: events.length, color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/20' },
        { label: 'Record Activities', value: events.filter(e => (EVENT_CONFIG[e.activityType]?.category) === 'records').length, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        { label: 'Access Events', value: events.filter(e => (EVENT_CONFIG[e.activityType]?.category) === 'access').length, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        { label: 'Emergency Events', value: events.filter(e => e.activityType === 'EMERGENCY_ACCESS').length, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    ];

    return (
        <div className="max-w-5xl mx-auto pb-12 space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <GitBranch className="w-4 h-4 text-[#00C8D4]" />
                    <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Medical Intelligence</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-white">Smart Medical Timeline</h2>
                <p className="text-sm text-[#8899AA] mt-1">Your complete chronological health and interoperability history.</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((k, i) => (
                    <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className={`bg-[#111827] border ${k.border} rounded-2xl p-5`}>
                        <div className={`w-9 h-9 rounded-xl ${k.bg} border ${k.border} flex items-center justify-center mb-3`}>
                            <Activity className={`w-4 h-4 ${k.color}`} />
                        </div>
                        <p className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-1">{k.label}</p>
                        <p className={`text-2xl font-display font-bold ${k.color}`}>{isLoading ? '—' : k.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-[#8899AA]" />
                {FILTERS.map(f => (
                    <button key={f.key} onClick={() => setActiveFilter(f.key)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            activeFilter === f.key
                                ? 'bg-[#00C8D4]/15 text-[#00C8D4] border-[#00C8D4]/30'
                                : 'bg-[#111827] text-[#8899AA] border-[#1E2D4580] hover:text-white hover:border-[#00C8D4]/20'
                        }`}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Timeline */}
            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">Event Timeline</h3>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Live</span>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center py-16 gap-3">
                        <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-[#00C8D4] animate-spin" />
                        <p className="text-sm text-[#8899AA] font-mono">Loading timeline...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <GitBranch className="w-10 h-10 text-[#4A5568] mx-auto mb-3" />
                        <p className="text-white font-medium">No events in this category</p>
                        <p className="text-sm text-[#8899AA] mt-1">Try switching the filter above.</p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Vertical timeline line */}
                        <div className="absolute left-3.5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#00C8D4]/40 via-[#1E2D45] to-transparent" />
                        <div className="space-y-4">
                            {filtered.map((event, i) => (
                                <TimelineEvent key={event.id} event={event} index={i} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
