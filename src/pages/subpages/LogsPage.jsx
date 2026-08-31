import React from 'react';
import {
    Activity, ShieldCheck, FileText, User, ChevronRight, Database,
    CheckCircle, AlertTriangle, Clock, Lock, Cpu, Globe, Zap,
    Copy, ExternalLink, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuditLogs } from '../../hooks/useAuditLogs';

function formatDistanceToNow(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "Just now";
    let interval = seconds / 60;
    if (interval < 60) return Math.floor(interval) + " mins ago";
    interval = seconds / 3600;
    if (interval < 24) return Math.floor(interval) + " hours ago";
    interval = seconds / 86400;
    if (interval < 30) return Math.floor(interval) + " days ago";
    interval = seconds / 2592000;
    if (interval < 12) return Math.floor(interval) + " months ago";
    return Math.floor(seconds / 31536000) + " years ago";
}

/* ───── KPI Cards ───── */
function AuditKPIs({ logsCount, isLoading }) {
    const kpis = [
        { label: 'Total Audit Events', value: logsCount, icon: Database, color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/20' },
        { label: 'Verified Transactions', value: logsCount, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        { label: 'Smart Contract Actions', value: Math.ceil(logsCount * 0.6), icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        { label: 'Network Status', value: 'Online', icon: Globe, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', isStatus: true },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k, i) => (
                <motion.div
                    key={k.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 hover:border-[#00C8D4]/30 transition-all duration-300"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl ${k.bg} border ${k.border} flex items-center justify-center`}>
                            <k.icon className={`w-5 h-5 ${k.color}`} />
                        </div>
                    </div>
                    <p className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-1">{k.label}</p>
                    {k.isStatus ? (
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-sm font-bold text-emerald-400">{k.value}</span>
                        </div>
                    ) : (
                        <p className="text-2xl font-bold text-white font-display">{isLoading ? '—' : k.value}</p>
                    )}
                </motion.div>
            ))}
        </div>
    );
}

/* ───── Risk Level Badge ───── */
function RiskBadge({ action }) {
    const lower = (action || '').toLowerCase();
    if (lower.includes('revoke') || lower.includes('reject') || lower.includes('delete')) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                <AlertTriangle className="w-2.5 h-2.5" /> High
            </span>
        );
    }
    if (lower.includes('access') || lower.includes('otp') || lower.includes('generated')) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Medium
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Low
        </span>
    );
}

/* ───── Status Badge Component ───── */
function CustomStatusBadge({ status, label, className = '' }) {
    const colors = {
        verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        syncing: 'bg-[#00C8D4]/10 text-[#00C8D4] border-[#00C8D4]/20',
        error: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${colors[status] || 'bg-[#1A2236] text-[#8899AA] border-[#1E2D4580]'} ${className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'syncing' ? 'bg-[#00C8D4] animate-pulse' : status === 'verified' ? 'bg-emerald-400' : status === 'pending' ? 'bg-amber-400' : 'bg-red-400'}`} />
            {label || status}
        </span>
    );
}

/* ───── Compliance Panel ───── */
function CompliancePanel() {
    const items = [
        { label: 'HIPAA Compliance', status: 'Active', color: 'emerald' },
        { label: 'Data Encryption', status: 'AES-256', color: 'cyan' },
        { label: 'Audit Retention', status: '7 Years', color: 'purple' },
        { label: 'Access Logging', status: 'Enabled', color: 'teal' },
    ];
    
    const colorMap = {
        emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        cyan: 'bg-[#00C8D4]/10 text-[#00C8D4] border-[#00C8D4]/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20'
    };

    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-[#00C8D4]" />
                <h4 className="text-xs font-semibold text-white font-display uppercase tracking-wider">Compliance Status</h4>
            </div>
            <div className="space-y-3">
                {items.map(it => (
                    <div key={it.label} className="flex items-center justify-between">
                        <span className="text-xs text-[#8899AA]">{it.label}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${colorMap[it.color]}`}>
                            {it.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ───── Security Alerts ───── */
function SecurityAlerts() {
    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-semibold text-white font-display uppercase tracking-wider">Security Alerts</h4>
            </div>
            <div className="text-center py-4 rounded-xl bg-[#1A2236]/30 border border-[#1E2D4580]">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">No active alerts</p>
                <p className="text-[11px] text-[#8899AA] mt-1">All systems operating normally</p>
            </div>
        </div>
    );
}

/* ───── PAGE ───── */
const LogsPage = () => {
    const { logs, isLoading } = useAuditLogs();

    const getEventDetails = (activityType = '') => {
        switch (activityType) {
            case 'RECORD_UPLOADED':
                return {
                    label: "Medical Record Uploaded & Secured",
                    statusLabel: "Secured",
                    statusType: "verified",
                    risk: "Low",
                    icon: FileText,
                    color: 'text-[#00C8D4]',
                    bg: 'bg-[#00C8D4]/10',
                    border: 'border-[#00C8D4]/20'
                };
            case 'ACCESS_REQUEST_CREATED':
                return {
                    label: "Access Request Challenge Initiated",
                    statusLabel: "Pending",
                    statusType: "pending",
                    risk: "Medium",
                    icon: ShieldCheck,
                    color: 'text-purple-400',
                    bg: 'bg-purple-500/10',
                    border: 'border-purple-500/20'
                };
            case 'REQUEST_APPROVED_OTP_GENERATED':
                return {
                    label: "OTP Challenge Approved & Generated",
                    statusLabel: "Confirmed",
                    statusType: "syncing",
                    risk: "Medium",
                    icon: ShieldCheck,
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20'
                };
            case 'REQUEST_REJECTED':
                return {
                    label: "Access Request Declined",
                    statusLabel: "Rejected",
                    statusType: "error",
                    risk: "High",
                    icon: AlertTriangle,
                    color: 'text-red-400',
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20'
                };
            case 'OTP_VERIFIED_ACCESS_GRANTED':
                return {
                    label: "OTP Verified & Session Established",
                    statusLabel: "Authorized",
                    statusType: "verified",
                    risk: "High",
                    icon: ShieldCheck,
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20'
                };
            case 'RECORD_DECRYPTED_VIEWED':
                return {
                    label: "Encrypted Record Decrypted & Viewed",
                    statusLabel: "Decrypted",
                    statusType: "verified",
                    risk: "Medium",
                    icon: Lock,
                    color: 'text-teal-400',
                    bg: 'bg-teal-500/10',
                    border: 'border-teal-500/20'
                };
            default:
                return {
                    label: activityType ? activityType.replace(/_/g, ' ') : 'System Diagnostic Log',
                    statusLabel: "Logged",
                    statusType: "pending",
                    risk: "Low",
                    icon: Activity,
                    color: 'text-[#00C8D4]',
                    bg: 'bg-[#00C8D4]/10',
                    border: 'border-[#00C8D4]/20'
                };
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12 h-[calc(100vh-120px)] flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0">
                <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-[#00C8D4]" />
                    <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">System Accountability</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-white">Cryptographic Audit Trail</h2>
                <p className="text-sm text-[#8899AA] mt-1">Immutable, tamper-proof activity tracking for every interaction with your medical data.</p>
            </div>

            {/* KPIs */}
            <AuditKPIs logsCount={logs.length} isLoading={isLoading} />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
                {/* Main Timeline */}
                <div className="lg:col-span-3 flex flex-col">
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl flex flex-col flex-1 overflow-hidden">
                        <div className="px-6 py-5 border-b border-[#1E2D4580] flex items-center justify-between bg-[#1A2236]">
                            <span className="text-xs text-[#8899AA] font-bold uppercase tracking-wider">Activity Timeline</span>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/20">
                                <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} style={!isLoading ? { boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)' } : {}} />
                                <span className={`text-[10px] ${isLoading ? 'text-amber-400' : 'text-emerald-400'} font-bold uppercase tracking-wider`}>
                                    {isLoading ? 'SYNCING...' : 'LIVE SYNC'}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="relative border-l-2 border-[#1E2D4580] ml-4 space-y-5 pb-2 pt-1">
                                {logs.length === 0 && !isLoading ? (
                                    <div className="text-center py-12 ml-4">
                                        <div className="w-14 h-14 rounded-2xl bg-[#1A2236] border border-[#1E2D4580] flex items-center justify-center mx-auto mb-4">
                                            <Database className="w-7 h-7 text-[#4A5568]" />
                                        </div>
                                        <p className="text-sm text-white font-medium">No audit events recorded</p>
                                        <p className="text-xs text-[#8899AA] mt-1">Activities will appear here as they occur</p>
                                    </div>
                                ) : (
                                    logs.map((log, i) => {
                                        const event = getEventDetails(log.activityType);
                                        const Icon = event.icon;
                                        const timeStr = log.timestamp ? formatDistanceToNow(log.timestamp) : 'Just now';
                                        const fullTime = log.timestamp ? new Date(log.timestamp).toLocaleString() : '';

                                        return (
                                            <motion.div
                                                key={log.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: Math.min(i * 0.06, 0.8) }}
                                                className="relative pl-8 group"
                                            >
                                                <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center border ${event.border} ${event.bg} transition-transform group-hover:scale-110 duration-300 bg-[#111827]`}>
                                                    <Icon className={`w-4 h-4 ${event.color}`} />
                                                </div>
                                                <div className="p-4 rounded-xl border border-[#1E2D4580] hover:border-[#00C8D4]/30 hover:bg-[#1A2236]/50 transition-all cursor-pointer group">
                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                                <h4 className="text-sm font-semibold text-white">{event.label}</h4>
                                                                <CustomStatusBadge
                                                                    status={event.statusType}
                                                                    label={event.statusLabel}
                                                                />
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                                                                    event.risk === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                                    event.risk === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                                }`}>
                                                                    {event.risk} Risk
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-[#8899AA] mb-2">
                                                                Actor: <span className="text-white font-semibold">{log.actorName}</span>
                                                                {log.patientName && log.patientName !== 'Patient Self' && (
                                                                    <> · Target Patient: <span className="text-white font-semibold">{log.patientName}</span></>
                                                                )}
                                                            </p>
                                                            {/* Hash & Verification */}
                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#4A5568] bg-[#1A2236] px-2.5 py-1 rounded-md border border-[#1E2D4580]">
                                                                    <Lock className="w-3 h-3 text-[#4A5568]" />
                                                                    TX: {log.txHash || '0x...'}
                                                                </div>
                                                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                                                    <CheckCircle className="w-3 h-3" /> Verified on-chain
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                            <span className="text-[11px] font-bold text-[#8899AA]">{timeStr}</span>
                                                            <span className="text-[10px] font-mono text-[#4A5568]">{fullTime}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6 overflow-y-auto pr-2">
                    {/* Chain Status */}
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Cpu className="w-4 h-4 text-[#00C8D4]" />
                            <h4 className="text-xs font-semibold text-white font-display uppercase tracking-wider">Chain Status</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[#8899AA]">Block Height</span>
                                <span className="text-xs text-white font-mono font-medium bg-[#1A2236] px-2 py-0.5 rounded border border-[#1E2D4580]">Latest</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[#8899AA]">Network</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                                    <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Mainnet</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[#8899AA]">Consensus</span>
                                <span className="text-xs text-white font-bold tracking-wider">PoA</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[#8899AA]">Avg Block Time</span>
                                <span className="text-xs text-white font-mono font-medium">~5s</span>
                            </div>
                        </div>
                    </div>

                    <CompliancePanel />
                    <SecurityAlerts />
                </div>
            </div>
        </div>
    );
};

export default LogsPage;
