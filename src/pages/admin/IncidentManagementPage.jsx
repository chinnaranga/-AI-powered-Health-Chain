import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, Shield, Zap, Activity, Clock, CheckCircle,
    ChevronDown, ChevronUp, User, RefreshCw, Plus, Filter,
    XCircle, ArrowUpRight, Eye, MessageSquare, AlertCircle,
    ServerCrash, Lock, Database
} from 'lucide-react';

const SEVERITY = {
    critical: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', bar: 'bg-red-400', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.1)]' },
    high:     { label: 'High',     color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', bar: 'bg-amber-400', glow: '' },
    medium:   { label: 'Medium',   color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', bar: 'bg-yellow-400', glow: '' },
    low:      { label: 'Low',      color: 'text-slate-400',  bg: 'bg-white/[0.03]',  border: 'border-[#1E2D4580]', bar: 'bg-slate-500', glow: '' },
};

const INC_STATUS = {
    open:       { label: 'Open',       color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     dot: 'bg-red-400' },
    investigating: { label: 'Investigating', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400' },
    resolved:   { label: 'Resolved',   color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
};

const ICON_MAP = {
    security:   { Icon: Lock,        color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20' },
    outage:     { Icon: ServerCrash, color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
    access:     { Icon: Shield,      color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    blockchain: { Icon: Database,    color: 'text-[#00C8D4]',  bg: 'bg-[#00C8D4]/10',  border: 'border-[#00C8D4]/20' },
    auth:       { Icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
};

const MOCK_INCIDENTS = [
    { id: 'INC-001', title: 'Emergency Break-Glass Override Triggered', type: 'access', severity: 'critical', status: 'investigating', assignee: 'Sec Ops Team', created: '14 min ago', updated: '2 min ago', description: 'Dr. Kumar at City General invoked emergency override for patient PX-1042. All records unlocked. Break-glass used outside normal protocol window.', escalations: 2 },
    { id: 'INC-002', title: 'Multiple Failed OTP Attempts Detected', type: 'auth', severity: 'high', status: 'open', assignee: 'Auth Team', created: '1 hour ago', updated: '45 min ago', description: '6 consecutive OTP failures from IP 192.168.4.112 for patient record access. Possible brute-force attempt.', escalations: 1 },
    { id: 'INC-003', title: 'Blockchain RPC Node Degraded', type: 'blockchain', severity: 'high', status: 'investigating', assignee: 'Infra Team', created: '2 hours ago', updated: '30 min ago', description: 'APAC blockchain RPC node experiencing 350ms+ latency. Smart contract verification delays impacting access workflows.', escalations: 0 },
    { id: 'INC-004', title: 'IPFS Storage Sync Failure', type: 'outage', severity: 'medium', status: 'investigating', assignee: 'Storage Team', created: '4 hours ago', updated: '1 hour ago', description: 'IPFS pinning service intermittently failing. 3 medical record uploads pending re-sync. No data loss confirmed.', escalations: 0 },
    { id: 'INC-005', title: 'Suspicious API Pattern — User ID 9942', type: 'security', severity: 'medium', status: 'open', assignee: 'Unassigned', created: '6 hours ago', updated: '6 hours ago', description: 'Unusual bulk API request pattern from user_9942. 140 /v1/records requests within 5 minutes. Potential automated scraping.', escalations: 0 },
    { id: 'INC-006', title: 'Admin Password Reset via Recovery Email', type: 'security', severity: 'low', status: 'resolved', assignee: 'Auth Team', created: '1 day ago', updated: '20 hours ago', description: 'Admin password reset triggered via recovery email. Confirmed as authorized action by sysadmin_2. No breach detected.', escalations: 0 },
];

function timeAgo(str) { return str; }

function IncidentCard({ inc, isExpanded, onToggle, onStatusChange }) {
    const sev = SEVERITY[inc.severity] || SEVERITY.low;
    const st = INC_STATUS[inc.status] || INC_STATUS.open;
    const { Icon, color, bg, border } = ICON_MAP[inc.type] || { Icon: AlertTriangle, color: 'text-slate-400', bg: 'bg-white/[0.03]', border: 'border-[#1E2D4580]' };

    return (
        <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`relative bg-[#111827] rounded-2xl border overflow-hidden transition-all ${inc.status === 'open' ? sev.border : 'border-[#1E2D4580]'} ${sev.glow}`}>
            {/* Severity bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${sev.bar}`} />

            <button onClick={onToggle} className="w-full text-left px-6 py-4 pl-7">
                <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="text-[10px] font-mono text-slate-500">{inc.id}</span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${sev.bg} ${sev.border} ${sev.color}`}>{sev.label}</span>
                            <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${st.bg} ${st.border} ${st.color}`}>
                                <span className={`w-1 h-1 rounded-full ${st.dot} ${inc.status === 'open' ? 'animate-pulse' : ''}`} />
                                {st.label}
                            </span>
                            {inc.escalations > 0 && (
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-red-500/10 border-red-500/20 text-red-400 flex items-center gap-1">
                                    <ArrowUpRight className="w-2.5 h-2.5" /> {inc.escalations} escalation{inc.escalations > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        <p className="text-sm font-bold text-white mb-1">{inc.title}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {inc.created}</span>
                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {inc.assignee}</span>
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </div>
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-7 pb-5 border-t border-[#1E2D4580] pt-4 space-y-4">
                            <p className="text-sm text-slate-300 leading-relaxed">{inc.description}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-slate-500 font-medium">Update Status:</span>
                                {Object.entries(INC_STATUS).map(([k, v]) => (
                                    <button key={k} onClick={() => onStatusChange(inc.id, k)}
                                        className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${inc.status === k ? `${v.bg} ${v.border} ${v.color}` : 'border-[#1E2D4580] text-slate-500 hover:text-white hover:bg-[#1A2236]'}`}>
                                        {v.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function IncidentManagementPage() {
    const [incidents, setIncidents] = useState(MOCK_INCIDENTS);
    const [expandedId, setExpandedId] = useState('INC-001');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const handleStatusChange = (id, newStatus) => {
        setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: newStatus } : inc));
    };

    const filtered = incidents.filter(inc => {
        const matchSev = severityFilter === 'all' || inc.severity === severityFilter;
        const matchSt = statusFilter === 'all' || inc.status === statusFilter;
        return matchSev && matchSt;
    });

    const counts = {
        open: incidents.filter(i => i.status === 'open').length,
        critical: incidents.filter(i => i.severity === 'critical').length,
        investigating: incidents.filter(i => i.status === 'investigating').length,
        resolved: incidents.filter(i => i.status === 'resolved').length,
    };

    const kpis = [
        { label: 'Open', value: counts.open, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', pulse: counts.open > 0 },
        { label: 'Critical', value: counts.critical, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', pulse: counts.critical > 0 },
        { label: 'Investigating', value: counts.investigating, icon: Eye, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        { label: 'Resolved', value: counts.resolved, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    ];

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4 text-red-400" />
                        <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Security Operations Center</span>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white">Incident Management</h1>
                    <p className="text-sm text-slate-400 mt-1">Real-time security incident tracking and response center.</p>
                </div>
                <div className="flex items-center gap-2">
                    {counts.open > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30">
                            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                            <span className="text-xs font-bold text-red-400">{counts.open} active incident{counts.open > 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((k, i) => (
                    <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className={`bg-[#111827] border ${k.border} rounded-2xl p-5`}>
                        <div className={`w-9 h-9 rounded-xl ${k.bg} border ${k.border} flex items-center justify-center mb-3 relative`}>
                            <k.icon className={`w-4 h-4 ${k.color}`} />
                            {k.pulse && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{k.label}</p>
                        <p className={`text-2xl font-display font-bold ${k.color}`}>{k.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <Filter className="w-4 h-4 text-slate-500" />
                {['all', 'critical', 'high', 'medium', 'low'].map(s => (
                    <button key={s} onClick={() => setSeverityFilter(s)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize border transition-all ${severityFilter === s ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' : 'bg-[#111827] text-slate-400 border-[#1E2D4580] hover:text-white'}`}>
                        {s === 'all' ? 'All Severity' : s}
                    </button>
                ))}
                <div className="w-px h-5 bg-[#1E2D45] mx-1" />
                {['all', 'open', 'investigating', 'resolved'].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize border transition-all ${statusFilter === s ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' : 'bg-[#111827] text-slate-400 border-[#1E2D4580] hover:text-white'}`}>
                        {s === 'all' ? 'All Status' : s}
                    </button>
                ))}
            </div>

            {/* Incident List */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl flex flex-col items-center py-16 gap-3">
                        <CheckCircle className="w-10 h-10 text-slate-500" />
                        <p className="text-white font-semibold">No incidents match filters</p>
                        <p className="text-xs text-slate-500">All clear for the selected criteria.</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {filtered.map(inc => (
                            <IncidentCard key={inc.id} inc={inc}
                                isExpanded={expandedId === inc.id}
                                onToggle={() => setExpandedId(prev => prev === inc.id ? null : inc.id)}
                                onStatusChange={handleStatusChange}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
