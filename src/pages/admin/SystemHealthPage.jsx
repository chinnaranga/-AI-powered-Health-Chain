import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Server, Activity, Shield, Database, Zap, Brain,
    Cloud, CheckCircle, AlertTriangle, XCircle, RefreshCw,
    Clock, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#111827]/95 backdrop-blur-xl border border-[#1E2D4580] rounded-xl px-4 py-3 shadow-2xl">
            <p className="text-[11px] text-slate-400 mb-2 font-mono uppercase tracking-wider">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="text-sm font-semibold flex items-center gap-2" style={{ color: p.color }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name}: {p.value}{p.unit || ''}
                </p>
            ))}
        </div>
    );
}

/* ── Mock time-series ── */
function genSeries(base, variance, len = 12) {
    return Array.from({ length: len }, (_, i) => ({
        t: `${String(Math.floor(i * 5)).padStart(2, '0')}m`,
        v: Math.round(base + (Math.random() - 0.5) * variance),
    }));
}

const UPTIME_DATA = [
    { day: 'Mon', uptime: 99.99 }, { day: 'Tue', uptime: 99.97 },
    { day: 'Wed', uptime: 99.99 }, { day: 'Thu', uptime: 98.80 },
    { day: 'Fri', uptime: 99.92 }, { day: 'Sat', uptime: 99.99 },
    { day: 'Sun', uptime: 99.99 },
];

const SERVICES = [
    { id: 'firebase', name: 'Firebase Core', icon: Database, color: 'amber', status: 'operational', latency: 24, errorRate: 0.01, uptime: 99.99 },
    { id: 'auth', name: 'Auth Service', icon: Shield, color: 'purple', status: 'operational', latency: 45, errorRate: 0.00, uptime: 99.99 },
    { id: 'storage', name: 'Cloud Storage', icon: Cloud, color: 'blue', status: 'operational', latency: 38, errorRate: 0.03, uptime: 99.97 },
    { id: 'ipfs', name: 'IPFS Node', icon: Server, color: 'teal', status: 'operational', latency: 120, errorRate: 0.18, uptime: 99.82 },
    { id: 'blockchain', name: 'Blockchain RPC', icon: Zap, color: 'red', status: 'degraded', latency: 350, errorRate: 2.60, uptime: 97.40 },
    { id: 'ai', name: 'AI Engine', icon: Brain, color: 'indigo', status: 'operational', latency: 85, errorRate: 0.09, uptime: 99.91 },
];

const COLOR_MAP = {
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', stroke: '#F59E0B' },
    purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', stroke: '#8B5CF6' },
    blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', stroke: '#3B82F6' },
    teal: { text: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', stroke: '#14B8A6' },
    red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', stroke: '#EF4444' },
    indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', stroke: '#6366F1' },
};

function StatusChip({ status }) {
    const map = {
        operational: { label: 'Operational', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
        degraded: { label: 'Degraded', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400' },
        down: { label: 'Down', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-400' },
    };
    const cfg = map[status] || map.operational;
    return (
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === 'operational' ? 'animate-pulse' : ''}`} />
            {cfg.label}
        </span>
    );
}

function ServiceRow({ svc, latencyData, isRefreshing }) {
    const colors = COLOR_MAP[svc.color] || COLOR_MAP.teal;
    const Icon = svc.icon;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`bg-[#111827] border rounded-2xl p-5 ${svc.status === 'degraded' ? 'border-amber-500/20' : 'border-[#1E2D4580]'}`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-white">{svc.name}</p>
                        <StatusChip status={svc.status} />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                    { label: 'Latency', value: isRefreshing ? '—' : `${svc.latency}ms`, color: svc.latency > 200 ? 'text-amber-400' : 'text-emerald-400' },
                    { label: 'Error Rate', value: isRefreshing ? '—' : `${svc.errorRate}%`, color: svc.errorRate > 1 ? 'text-red-400' : 'text-emerald-400' },
                    { label: 'Uptime', value: isRefreshing ? '—' : `${svc.uptime}%`, color: svc.uptime < 99 ? 'text-amber-400' : 'text-emerald-400' },
                ].map(m => (
                    <div key={m.label} className="bg-[#0B0F1A] rounded-xl p-2.5 text-center border border-[#1E2D4580]">
                        <p className="text-[10px] text-slate-500 font-mono mb-1">{m.label}</p>
                        <p className={`text-sm font-bold font-mono ${m.color}`}>{m.value}</p>
                    </div>
                ))}
            </div>
            <div className="h-16">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={latencyData} margin={{ top: 2, right: 2, left: -40, bottom: 2 }}>
                        <Line type="monotone" dataKey="v" stroke={colors.stroke} strokeWidth={1.5} dot={false} name="Latency (ms)" />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

export default function SystemHealthPage() {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [latencyData] = useState(() => SERVICES.reduce((acc, s) => {
        acc[s.id] = genSeries(s.latency, s.latency * 0.2);
        return acc;
    }, {}));

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await new Promise(r => setTimeout(r, 1500));
        setLastRefresh(new Date());
        setIsRefreshing(false);
    };

    const operationalCount = SERVICES.filter(s => s.status === 'operational').length;
    const degradedCount = SERVICES.filter(s => s.status === 'degraded').length;
    const downCount = SERVICES.filter(s => s.status === 'down').length;
    const avgUptime = (SERVICES.reduce((a, s) => a + s.uptime, 0) / SERVICES.length).toFixed(2);

    const kpis = [
        { label: 'Operational', value: operationalCount, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        { label: 'Degraded', value: degradedCount, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', pulse: degradedCount > 0 },
        { label: 'Down', value: downCount, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', pulse: downCount > 0 },
        { label: 'Avg Uptime', value: `${avgUptime}%`, icon: TrendingUp, color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/20' },
    ];

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Server className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Infrastructure Observability</span>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white">System Health</h1>
                    <p className="text-sm text-slate-400 mt-1">Real-time service monitoring and infrastructure status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {lastRefresh.toLocaleTimeString()}
                    </span>
                    <button onClick={handleRefresh} disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111827] border border-[#1E2D4580] text-xs font-bold text-slate-400 hover:text-white transition-all disabled:opacity-50">
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((k, i) => (
                    <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className={`bg-[#111827] border ${k.border} rounded-2xl p-5`}>
                        <div className={`w-9 h-9 rounded-xl ${k.bg} border ${k.border} flex items-center justify-center mb-3 relative`}>
                            <k.icon className={`w-4 h-4 ${k.color}`} />
                            {k.pulse && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{k.label}</p>
                        <p className={`text-2xl font-display font-bold ${k.color}`}>{k.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Uptime Chart */}
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-display font-bold text-white">Platform Uptime — Last 7 Days</h3>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={UPTIME_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="uptimeGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#1E2D45" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} domain={[97, 100]} unit="%" />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="uptime" stroke="#10B981" fill="url(#uptimeGrad)" strokeWidth={2.5} name="Uptime" unit="%" dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Service Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {SERVICES.map((svc, i) => (
                    <motion.div key={svc.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                        <ServiceRow svc={svc} latencyData={latencyData[svc.id]} isRefreshing={isRefreshing} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
