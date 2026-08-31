import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck, AlertTriangle, CheckCircle, Lock, Eye,
    FileText, Activity, Zap, Clock, TrendingUp, Download,
    BarChart3, RefreshCw, XCircle, Info, Database
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/* ── Custom Tooltip ── */
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#111827]/95 backdrop-blur-xl border border-[#1E2D4580] rounded-xl px-4 py-3 shadow-2xl">
            <p className="text-[11px] text-[#8899AA] mb-2 font-bold uppercase tracking-wider">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="text-sm font-semibold flex items-center gap-2" style={{ color: p.color }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name}: {p.value}
                </p>
            ))}
        </div>
    );
}

/* ── Mock data ── */
const SCORE_TREND = [
    { month: 'Dec', score: 84, incidents: 3 },
    { month: 'Jan', score: 87, incidents: 2 },
    { month: 'Feb', score: 89, incidents: 2 },
    { month: 'Mar', score: 92, incidents: 1 },
    { month: 'Apr', score: 95, incidents: 1 },
    { month: 'May', score: 98, incidents: 0 },
];

const AUDIT_TREND = [
    { week: 'W1', events: 42, violations: 2 },
    { week: 'W2', events: 58, violations: 1 },
    { week: 'W3', events: 51, violations: 0 },
    { week: 'W4', events: 67, violations: 1 },
    { week: 'W5', events: 73, violations: 0 },
    { week: 'W6', events: 69, violations: 0 },
];



const STATUS_CFG = {
    pass:    { label: 'Pass',    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: CheckCircle },
    warning: { label: 'Warning', color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',  icon: AlertTriangle },
    fail:    { label: 'Fail',    color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30',    icon: XCircle },
};

/* ── Score Dial ── */
function ScoreDial({ score }) {
    const r = 54;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const color = score >= 90 ? '#10B981' : score >= 70 ? '#F59E0B' : '#EF4444';
    return (
        <div className="relative w-36 h-36 flex items-center justify-center mx-auto">
            <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
                <circle cx="72" cy="72" r={r} fill="none" stroke="#1E2D45" strokeWidth="10" />
                <motion.circle cx="72" cy="72" r={r} fill="none" stroke={color} strokeWidth="10"
                    strokeLinecap="round" strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    style={{ filter: `drop-shadow(0 0 8px ${color}50)` }}
                />
            </svg>
            <div className="text-center z-10">
                <motion.p className="text-4xl font-display font-bold text-white"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    {score}
                </motion.p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8899AA]">Score</p>
            </div>
        </div>
    );
}

/* ── Compliance Check Row ── */
function CheckRow({ check, expanded, onToggle }) {
    const Icon = check.icon;
    const st = STATUS_CFG[check.status];
    const StIcon = st.icon;
    return (
        <motion.div layout className={`rounded-xl border transition-all ${check.status === 'warning' ? 'border-amber-500/30 bg-amber-500/5' : check.status === 'fail' ? 'border-red-500/30 bg-red-500/5' : 'border-[#1E2D4580] bg-[#0B0F1A]'}`}>
            <button onClick={onToggle} className="w-full flex items-center gap-4 p-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${check.status === 'pass' ? 'bg-emerald-500/10 border border-emerald-500/20' : check.status === 'warning' ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                    <Icon className={`w-4 h-4 ${check.status === 'pass' ? 'text-emerald-400' : check.status === 'warning' ? 'text-amber-400' : 'text-red-400'}`} />
                </div>
                <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-white">{check.label}</p>
                    <p className="text-[10px] text-[#4A5568] font-mono">Weight: {check.weight}%</p>
                </div>
                <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${st.bg} ${st.border} ${st.color} flex-shrink-0`}>
                    <StIcon className="w-3 h-3" /> {st.label}
                </span>
            </button>
            {expanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pl-16">
                        <p className="text-xs text-[#8899AA] leading-relaxed">{check.detail}</p>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

/* ── PAGE ── */
export default function ComplianceDashboardPage() {
    const [expandedCheck, setExpandedCheck] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [userId, setUserId] = useState(null);
    const [auditCount, setAuditCount] = useState(0);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, u => setUserId(u?.uid || null));
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!userId) return;
        const q = query(collection(db, 'auditLogs'), where('patientId', '==', userId));
        const unsub = onSnapshot(q, (snap) => {
            setAuditCount(snap.size);
        });
        return () => unsub();
    }, [userId]);

    const COMPLIANCE_CHECKS = [
        { id: 'hipaa', label: 'HIPAA Compliance', status: 'pass', detail: 'All PHI handling meets HIPAA Security Rule standards.', icon: ShieldCheck, weight: 30 },
        { id: 'encrypt', label: 'Data Encryption', status: 'pass', detail: 'AES-256 encryption active for all stored and in-transit data.', icon: Lock, weight: 20 },
        { id: 'access', label: 'Access Policy Enforcement', status: 'pass', detail: 'Role-based access control verified across all user sessions.', icon: Eye, weight: 15 },
        { id: 'consent', label: 'Consent Compliance', status: 'pass', detail: 'All data exchanges linked to valid ABHA consent artifacts.', icon: FileText, weight: 15 },
        { id: 'audit', label: 'Audit Trail Completeness', status: 'pass', detail: `All ${auditCount} events in the past 30 days committed to blockchain.`, icon: Activity, weight: 10 },
        { id: 'unauthorized', label: 'Unauthorized Access Checks', status: 'warning', detail: '2 failed OTP attempts detected (within acceptable threshold).', icon: AlertTriangle, weight: 5 },
        { id: 'retention', label: 'Data Retention Policy', status: 'pass', detail: '7-year retention enforced. Auto-archival rules configured.', icon: Database, weight: 5 },
    ];

    const overallScore = 98;
    const passCount = COMPLIANCE_CHECKS.filter(c => c.status === 'pass').length;
    const warningCount = COMPLIANCE_CHECKS.filter(c => c.status === 'warning').length;
    const failCount = COMPLIANCE_CHECKS.filter(c => c.status === 'fail').length;

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await new Promise(r => setTimeout(r, 1500));
        setIsRefreshing(false);
    };

    const kpis = [
        { label: 'HIPAA Status', value: 'Active', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', badge: true },
        { label: 'Checks Passed', value: `${passCount}/${COMPLIANCE_CHECKS.length}`, icon: CheckCircle, color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/20' },
        { label: 'Active Warnings', value: warningCount, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', pulse: warningCount > 0 },
        { label: 'Critical Failures', value: failCount, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', pulse: failCount > 0 },
        { label: 'Audit Events (30D)', value: String(auditCount), icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        { label: 'Encryption', value: 'AES-256', icon: Lock, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', badge: true },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Compliance Command Center</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Compliance Dashboard</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Real-time HIPAA, security posture, and audit compliance monitoring.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleRefresh} disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A2236] border border-[#1E2D4580] text-xs font-bold text-[#8899AA] hover:text-white transition-all disabled:opacity-50">
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00C8D4] hover:bg-[#00E5F0] text-[#0B0F1A] font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,200,212,0.25)]">
                        <Download className="w-3.5 h-3.5" /> Export Report
                    </button>
                </div>
            </div>

            {/* Warnings Banner */}
            {warningCount > 0 && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-500/10 border border-amber-500/40 rounded-2xl px-5 py-3.5 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <p className="text-sm text-amber-200 font-semibold">{warningCount} compliance warning{warningCount > 1 ? 's' : ''} detected — review recommended.</p>
                </motion.div>
            )}

            {/* Top Row: Score + KPIs */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Score Card */}
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#111827] border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center gap-4">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
                    <div className="text-center">
                        <div className="flex items-center gap-2 justify-center mb-4">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Compliance Score</span>
                        </div>
                        <ScoreDial score={overallScore} />
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="text-center">
                            <p className="text-emerald-400 font-bold text-lg">{passCount}</p>
                            <p className="text-[#8899AA]">Passed</p>
                        </div>
                        <div className="w-px h-8 bg-[#1E2D45]" />
                        <div className="text-center">
                            <p className="text-amber-400 font-bold text-lg">{warningCount}</p>
                            <p className="text-[#8899AA]">Warnings</p>
                        </div>
                        <div className="w-px h-8 bg-[#1E2D45]" />
                        <div className="text-center">
                            <p className="text-red-400 font-bold text-lg">{failCount}</p>
                            <p className="text-[#8899AA]">Failed</p>
                        </div>
                    </div>
                </motion.div>

                {/* KPI Grid */}
                <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {kpis.map((k, i) => (
                        <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                            className={`bg-[#111827] border ${k.border} rounded-2xl p-4 relative overflow-hidden`}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`w-9 h-9 rounded-xl ${k.bg} border ${k.border} flex items-center justify-center relative`}>
                                    <k.icon className={`w-4 h-4 ${k.color}`} />
                                    {k.pulse && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                                </div>
                            </div>
                            <p className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-1">{k.label}</p>
                            {k.badge ? (
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${k.bg} ${k.border} ${k.color} border`}>
                                    <CheckCircle className="w-3 h-3" /> {k.value}
                                </span>
                            ) : (
                                <p className={`text-2xl font-display font-bold ${k.color}`}>{k.value}</p>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Compliance Score Trend */}
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                    className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                        </div>
                        <h3 className="text-sm font-display font-bold text-white">Compliance Score Trend</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={SCORE_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#1E2D45" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} domain={[75, 100]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="score" stroke="#10B981" fill="url(#scoreGrad)" strokeWidth={2.5} name="Score" dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Audit Events Trend */}
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                    className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-purple-400" />
                        </div>
                        <h3 className="text-sm font-display font-bold text-white">Audit Events & Violations</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={AUDIT_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid stroke="#1E2D45" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="week" stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="events" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3, fill: '#8B5CF6', strokeWidth: 0 }} name="Events" />
                            <Line type="monotone" dataKey="violations" stroke="#EF4444" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 3, fill: '#EF4444', strokeWidth: 0 }} name="Violations" />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Compliance Checks */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                    <ShieldCheck className="w-5 h-5 text-[#00C8D4]" />
                    <h3 className="text-lg font-display font-bold text-white">Compliance Checks</h3>
                    <span className="ml-auto text-[10px] text-[#4A5568] font-mono">Last checked: {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="space-y-3">
                    {COMPLIANCE_CHECKS.map(check => (
                        <CheckRow
                            key={check.id}
                            check={check}
                            expanded={expandedCheck === check.id}
                            onToggle={() => setExpandedCheck(prev => prev === check.id ? null : check.id)}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
