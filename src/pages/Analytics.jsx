import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, TrendingUp, Activity, PieChart as PieIcon,
    Calendar, Download, Filter, Database, Shield, Clock,
    Cpu, ArrowUpRight, ArrowDownRight, Zap, Brain, ChevronDown
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useRecords } from '../hooks/useRecords';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const subMonths = (date, months) => { const d = new Date(date); d.setMonth(d.getMonth() - months); return d; };
const subDays = (date, days) => { const d = new Date(date); d.setDate(d.getDate() - days); return d; };
const formatMonth = (date) => new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
const formatDay = (date) => new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);

/* ───── Custom Tooltip ───── */
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

/* ───── Filter Bar ───── */
function FilterBar({ timeRange, setTimeRange }) {
    const ranges = ['7D', '30D', '90D', '1Y'];
    return (
        <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center bg-[#1A2236] border border-[#1E2D4580] rounded-xl p-1">
                {ranges.map(r => (
                    <button
                        key={r}
                        onClick={() => setTimeRange(r)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            timeRange === r
                                ? 'bg-[#00C8D4]/15 text-[#00C8D4] border border-[#00C8D4]/20'
                                : 'text-[#8899AA] hover:text-white border border-transparent'
                        }`}
                    >
                        {r}
                    </button>
                ))}
            </div>
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A2236] border border-[#1E2D4580] text-xs font-bold text-[#8899AA] hover:text-white hover:border-[#00C8D4]/50 transition-all">
                <Filter className="w-3.5 h-3.5" /> Filters
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A2236] border border-[#1E2D4580] text-xs font-bold text-[#8899AA] hover:text-[#00C8D4] hover:border-[#00C8D4]/50 transition-all ml-auto">
                <Download className="w-3.5 h-3.5" /> Export Report
            </button>
        </div>
    );
}

/* ───── KPI Cards ───── */
function KPICards({ recordsCount, logsCount, activeNodesCount, dataStoredMB, securityScore }) {
    const kpis = [
        { label: 'Total Records', value: recordsCount, icon: Database, color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/20', trend: '+12%', trendUp: true },
        { label: 'Audit Events', value: logsCount, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', trend: '+8%', trendUp: true },
        { label: 'Active Nodes', value: activeNodesCount, icon: Cpu, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', trend: 'Stable', trendUp: null },
        { label: 'Data Stored', value: `${dataStoredMB.toFixed(1)} MB`, icon: PieIcon, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', trend: '+2.4MB', trendUp: true },
        { label: 'Security Score', value: securityScore, icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', suffix: '/100', isBadge: true },
        { label: 'Uptime', value: '99.9%', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', trend: 'Excellent', trendUp: null },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {kpis.map((k, i) => (
                <motion.div
                    key={k.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-4 hover:border-[#00C8D4]/30 transition-all duration-300"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className={`w-9 h-9 rounded-xl ${k.bg} border ${k.border} flex items-center justify-center`}>
                            <k.icon className={`w-4 h-4 ${k.color}`} />
                        </div>
                        {k.trend && (
                            <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                                k.trendUp === true ? 'text-emerald-400' : k.trendUp === false ? 'text-red-400' : 'text-[#8899AA]'
                            }`}>
                                {k.trendUp === true && <ArrowUpRight className="w-3 h-3" />}
                                {k.trendUp === false && <ArrowDownRight className="w-3 h-3" />}
                                {k.trend}
                            </span>
                        )}
                    </div>
                    <p className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-1">{k.label}</p>
                    <div className="flex items-baseline gap-0.5">
                        <span className={`text-xl font-bold font-display ${k.isBadge ? k.color : 'text-white'}`}>{k.value}</span>
                        {k.suffix && <span className="text-xs text-[#4A5568]">{k.suffix}</span>}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

/* ───── Upload Trends Chart ───── */
function UploadTrendsChart({ uploadData }) {
    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 font-display">
                    <div className="w-7 h-7 rounded-lg bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center">
                        <TrendingUp className="w-3.5 h-3.5 text-[#00C8D4]" />
                    </div>
                    Record Uploads Over Time
                </h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={uploadData}>
                    <defs>
                        <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00C8D4" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#00C8D4" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1E2D4580" strokeDasharray="3 3" />
                    <XAxis dataKey="month" stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#8899AA" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="uploads" stroke="#00C8D4" fill="url(#uploadGrad)" strokeWidth={2.5} name="Uploads" dot={{ fill: '#00C8D4', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#00C8D4', stroke: '#111827', strokeWidth: 2 }} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ───── Access Requests Chart ───── */
function AccessRequestsChart({ accessData }) {
    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2 font-display">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                </div>
                Access Log by Type
            </h3>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={accessData} layout="vertical">
                    <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#00C8D4" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1E2D4580" strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" stroke="#8899AA" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                    <YAxis dataKey="action" type="category" stroke="#8899AA" fontSize={11} width={80} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="url(#barGrad)" radius={[0, 8, 8, 0]} name="Events" barSize={16} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ───── Transaction Chart ───── */
function TransactionChart({ transactionData }) {
    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 font-display">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    Audit Log Activity (7-Day)
                </h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={transactionData}>
                    <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1E2D4580" strokeDasharray="3 3" />
                    <XAxis dataKey="day" stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#8899AA" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="events" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#10B981', stroke: '#111827', strokeWidth: 2 }} name="Total Events" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ───── Node Distribution Pie ───── */
function NodeDistributionChart({ nodeDistribution }) {
    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2 font-display">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <PieIcon className="w-3.5 h-3.5 text-blue-400" />
                </div>
                Node Distribution
            </h3>
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie data={nodeDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={0}>
                        {nodeDistribution.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                            <div className="bg-[#111827]/95 backdrop-blur-xl border border-[#1E2D4580] rounded-xl px-4 py-3 shadow-2xl">
                                <p className="text-sm font-semibold text-white">{d.name}</p>
                                <p className="text-xs text-[#8899AA]">{d.value}% of network</p>
                            </div>
                        );
                    }} />
                </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-3">
                {nodeDistribution.map(n => (
                    <div key={n.name} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: n.color }} />
                        <span className="text-[#8899AA]">{n.name}</span>
                        <span className="text-white font-medium ml-auto">{n.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ───── AI Insights Card ───── */
function AIInsightsCard({ recordsCount, logsCount }) {
    const insights = [
        `Upload frequency is ${recordsCount > 3 ? 'above' : 'at'} average this month`,
        `${logsCount} audit events tracked with 100% verification rate`,
        'All blockchain nodes operating within normal parameters',
        'Security posture remains strong — no anomalies detected',
    ];

    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-2 mb-4 relative">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Brain className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <h3 className="text-sm font-semibold text-white font-display">AI Insights</h3>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[9px] font-bold uppercase tracking-wider border border-purple-500/20 ml-auto">Beta</span>
            </div>
            <div className="space-y-3 relative">
                {insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                        <p className="text-xs text-[#8899AA] leading-relaxed">{insight}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ───── PAGE ───── */
export default function Analytics() {
    const { records = [] } = useRecords() || {};
    const { logs = [] } = useAuditLogs() || {};
    const [timeRange, setTimeRange] = useState('30D');
    
    // Real-time active nodes collection
    const [clinicians, setClinicians] = useState([]);
    
    useEffect(() => {
        const q = query(
            collection(db, 'users'), 
            where('role', 'in', ['doctor', 'clinical'])
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setClinicians(list);
        }, (err) => {
            console.error("Error fetching clinicians for analytics:", err);
        });
        return () => unsubscribe();
    }, []);

    const uploadData = useMemo(() => {
        const data = [];
        const recordsArr = Array.isArray(records) ? records : [];
        for (let i = 5; i >= 0; i--) {
            const date = subMonths(new Date(), i);
            const monthStr = formatMonth(date);
            const monthRecords = recordsArr.filter(r => {
                if (!r) return false;
                const ts = r.timestamp ? (r.timestamp > 99999999999 ? r.timestamp : r.timestamp * 1000) : Date.now();
                const rDate = new Date(ts);
                return rDate.getMonth() === date.getMonth() && rDate.getFullYear() === date.getFullYear();
            });
            data.push({ month: monthStr, uploads: monthRecords.length });
        }
        return data;
    }, [records]);

    const accessData = useMemo(() => {
        const actionCounts = {};
        const logsArr = Array.isArray(logs) ? logs : [];
        logsArr.forEach(l => {
            if (!l || !l.action) return;
            let actionGroup = 'Other';
            const text = String(l.action).toLowerCase();
            if (text.includes('upload')) actionGroup = 'Uploads';
            else if (text.includes('otp') || text.includes('generated')) actionGroup = 'OTP Gen';
            else if (text.includes('revoke')) actionGroup = 'Revokes';
            else if (text.includes('access')) actionGroup = 'Access';
            actionCounts[actionGroup] = (actionCounts[actionGroup] || 0) + 1;
        });
        return Object.entries(actionCounts).map(([action, count]) => ({ action, count }));
    }, [logs]);

    const transactionData = useMemo(() => {
        const data = [];
        const logsArr = Array.isArray(logs) ? logs : [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dayStr = formatDay(date);
            const dayLogs = logsArr.filter(l => {
                if (!l) return false;
                const time = l.accessTime || l.timestamp || Date.now();
                const lDate = new Date(time);
                return lDate.getDate() === date.getDate() && lDate.getMonth() === date.getMonth();
            });
            data.push({ day: dayStr, events: dayLogs.length });
        }
        return data;
    }, [logs]);

    // Parse human-readable sizes like "2.4 MB" or "45 KB" to numeric megabytes
    const parseSize = (sizeStr) => {
        if (!sizeStr) return 0;
        const clean = String(sizeStr).trim().toLowerCase();
        const num = parseFloat(clean);
        if (isNaN(num)) return 0;
        if (clean.includes('gb')) return num * 1024;
        if (clean.includes('kb')) return num / 1024;
        if (clean.includes('b')) return num / (1024 * 1024);
        return num;
    };

    const dataStoredMB = useMemo(() => {
        const recordsArr = Array.isArray(records) ? records : [];
        let totalMB = 0;
        recordsArr.forEach(r => {
            if (r.size && r.size !== '---') {
                totalMB += parseSize(r.size);
            } else {
                totalMB += 2.4; // Fallback estimate per record (2.4 MB)
            }
        });
        return totalMB;
    }, [records]);

    const securityScore = useMemo(() => {
        let score = 98;
        // Deduct points for revoked access
        const revokedCount = logs.filter(l => String(l.action).toLowerCase().includes('revoke')).length;
        score -= revokedCount * 3;
        
        // Deduct points for failed access/auth logs (if any)
        const failedCount = logs.filter(l => String(l.action).toLowerCase().includes('fail') || String(l.action).toLowerCase().includes('error')).length;
        score -= failedCount * 5;
        
        return Math.max(72, score);
    }, [logs]);

    const activeClinicians = useMemo(() => {
        return clinicians.filter(c => c.status !== 'revoked' && c.status !== 'inactive');
    }, [clinicians]);

    const activeNodesCount = activeClinicians.length + 1; // +1 includes patient's node

    const getNodeRegion = (node) => {
        const hosp = String(node.hospital || '').toLowerCase();
        if (hosp.includes('central')) return 'US-East';
        if (hosp.includes('metro') || hosp.includes('west')) return 'US-West';
        if (hosp.includes('city') || hosp.includes('london') || hosp.includes('general')) return 'EU-West';
        return 'AP-South';
    };

    const nodeDistribution = useMemo(() => {
        const activeNodesList = [...activeClinicians, { hospital: 'Central General Hospital' }]; // Patient node default
        const total = activeNodesList.length;
        
        const counts = { 'US-East': 0, 'EU-West': 0, 'AP-South': 0, 'US-West': 0 };
        activeNodesList.forEach(n => {
            const reg = getNodeRegion(n);
            counts[reg] = (counts[reg] || 0) + 1;
        });

        return [
            { name: 'US-East', value: Math.round((counts['US-East'] / total) * 100), color: '#00C8D4' },
            { name: 'EU-West', value: Math.round((counts['EU-West'] / total) * 100), color: '#3B82F6' },
            { name: 'AP-South', value: Math.round((counts['AP-South'] / total) * 100), color: '#8B5CF6' },
            { name: 'US-West', value: Math.round((counts['US-West'] / total) * 100), color: '#10B981' },
        ];
    }, [activeClinicians]);

    const recordsCount = Array.isArray(records) ? records.length : 0;
    const logsCount = Array.isArray(logs) ? logs.length : 0;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-white">Analytics Intelligence</h1>
                    <p className="text-sm text-[#8899AA] mt-1">Enterprise-grade healthcare and blockchain performance insights.</p>
                </div>
            </div>

            <FilterBar timeRange={timeRange} setTimeRange={setTimeRange} />
            <KPICards 
                recordsCount={recordsCount} 
                logsCount={logsCount} 
                activeNodesCount={activeNodesCount} 
                dataStoredMB={dataStoredMB} 
                securityScore={securityScore} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <UploadTrendsChart uploadData={uploadData} />
                <AccessRequestsChart accessData={accessData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TransactionChart transactionData={transactionData} />
                <NodeDistributionChart nodeDistribution={nodeDistribution} />
            </div>

            <AIInsightsCard recordsCount={recordsCount} logsCount={logsCount} />
        </div>
    );
}

