import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ActivitySquare, TrendingUp, ShieldCheck, Clock, FileText, Zap,
    AlertTriangle, Activity, Download, Users, Brain
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-xl px-4 py-3 shadow-xl">
            <p className="text-[11px] text-[#8899AA] mb-2 uppercase tracking-wider">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="text-sm font-semibold flex items-center gap-2" style={{ color: p.color || p.fill }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
                    {p.name}: {p.value}
                </p>
            ))}
        </div>
    );
}

const trendData = [
    { day: 'Mon', Requests: 12, Approved: 9, Denied: 3 },
    { day: 'Tue', Requests: 18, Approved: 15, Denied: 3 },
    { day: 'Wed', Requests: 25, Approved: 21, Denied: 4 },
    { day: 'Thu', Requests: 14, Approved: 12, Denied: 2 },
    { day: 'Fri', Requests: 22, Approved: 18, Denied: 4 },
    { day: 'Sat', Requests: 8, Approved: 7, Denied: 1 },
    { day: 'Sun', Requests: 5, Approved: 5, Denied: 0 },
];

const peakHoursData = [
    { hour: '06:00', Requests: 2 }, { hour: '08:00', Requests: 14 }, { hour: '10:00', Requests: 28 },
    { hour: '12:00', Requests: 35 }, { hour: '14:00', Requests: 22 }, { hour: '16:00', Requests: 18 },
    { hour: '18:00', Requests: 10 }, { hour: '20:00', Requests: 4 },
];

const recordTypeData = [
    { name: 'Lab Results', value: 38 }, { name: 'Imaging', value: 24 },
    { name: 'Prescriptions', value: 18 }, { name: 'Full Chart', value: 12 }, { name: 'Notes', value: 8 },
];
const PIE_COLORS = ['#00C8D4', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

const kpis = [
    { label: 'Requests Sent', value: '104', icon: FileText, color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/20', trend: '+12% week' },
    { label: 'Approval Rate', value: '87%', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', trend: '↑ 3pts' },
    { label: 'Avg Approval Time', value: '3.8m', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', trend: '-0.4m' },
    { label: 'Active Consents', value: '23', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', trend: 'Live' },
    { label: 'Records Viewed', value: '261', icon: Activity, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', trend: 'This week' },
    { label: 'Security Events', value: '2', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', trend: 'Review needed' },
];

const aiInsights = [
    { type: 'warning', text: 'Peak request volume consistently at 12:00–13:00. Pre-authorizing routine lab result requests for high-frequency patients could reduce wait times by 40%.' },
    { type: 'info', text: '3 consent sessions are expiring within the next 12 hours for Oncology patients. Consider sending renewal reminders proactively.' },
    { type: 'positive', text: 'Approval rate increased from 84% to 87% this week following updated OTP delivery improvements.' },
];

export default function ClinicalAnalyticsPage() {
    const [timeRange, setTimeRange] = useState('7D');

    return (
        <div className="max-w-7xl mx-auto pb-12 flex flex-col h-[calc(100vh-120px)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ActivitySquare className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Operational Intelligence</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Clinical Analytics</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Patient access patterns, consent workflows, and security metrics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-[#111827] border border-[#1E2D4580] rounded-xl p-1">
                        {['24H', '7D', '30D', 'YTD'].map(r => (
                            <button key={r} onClick={() => setTimeRange(r)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    timeRange === r
                                        ? 'bg-[#00C8D4]/15 text-[#00C8D4] border border-[#00C8D4]/30'
                                        : 'text-[#8899AA] hover:text-white border border-transparent'
                                }`}>{r}</button>
                        ))}
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-[#00C8D4] text-[#0B0F1A] font-bold flex items-center gap-2 hover:bg-[#00E5F0] transition-all shadow-[0_0_15px_rgba(0,200,212,0.2)]">
                        <Download className="w-4 h-4" /> Export
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {kpis.map((k, i) => (
                        <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="p-4 rounded-2xl bg-[#111827] border border-[#1E2D4580] group hover:border-[#00C8D4]/20 transition-all">
                            <div className={`w-9 h-9 rounded-xl ${k.bg} border ${k.border} flex items-center justify-center mb-3`}>
                                <k.icon className={`w-4 h-4 ${k.color}`} />
                            </div>
                            <p className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-1">{k.label}</p>
                            <p className="text-2xl font-display font-bold text-white group-hover:text-[#00C8D4] transition-colors">{k.value}</p>
                            <p className="text-[10px] text-[#8899AA] mt-1">{k.trend}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                        className="p-6 rounded-2xl bg-[#111827] border border-[#1E2D4580]">
                        <div className="flex items-center gap-2 mb-5">
                            <TrendingUp className="w-4 h-4 text-[#00C8D4]" />
                            <h3 className="text-base font-display font-bold text-white">Access Request Trends</h3>
                        </div>
                        <div className="h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="cGrad1" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00C8D4" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#00C8D4" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="cGrad2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#1E2D45" strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="day" stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                                    <Area type="monotone" dataKey="Requests" stroke="#00C8D4" fill="url(#cGrad1)" strokeWidth={2.5} />
                                    <Area type="monotone" dataKey="Approved" stroke="#10B981" fill="url(#cGrad2)" strokeWidth={2.5} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}
                        className="p-6 rounded-2xl bg-[#111827] border border-[#1E2D4580]">
                        <div className="flex items-center gap-2 mb-5">
                            <Clock className="w-4 h-4 text-purple-400" />
                            <h3 className="text-base font-display font-bold text-white">Peak Access Hours</h3>
                        </div>
                        <div className="h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={peakHoursData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="cBarGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#1E2D45" strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="hour" stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1A2236' }} />
                                    <Bar dataKey="Requests" fill="url(#cBarGrad)" radius={[6, 6, 0, 0]} barSize={22} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                        className="p-6 rounded-2xl bg-[#111827] border border-[#1E2D4580] flex flex-col">
                        <div className="flex items-center gap-2 mb-5">
                            <FileText className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-base font-display font-bold text-white">Records by Type</h3>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={recordTypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                                            {recordTypeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="space-y-2 mt-2">
                            {recordTypeData.map((d, i) => (
                                <div key={d.name} className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                                        <span className="text-[#8899AA]">{d.name}</span>
                                    </span>
                                    <span className="font-bold text-white">{d.value}%</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}
                        className="lg:col-span-2 p-6 rounded-2xl bg-[#1A2236]/50 border border-[#1E2D4580] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#00C8D4]/5 rounded-full blur-[60px]" />
                        <div className="flex items-center gap-2 mb-5">
                            <Brain className="w-4 h-4 text-[#00C8D4]" />
                            <h3 className="text-base font-display font-bold text-white">AI Clinical Insights</h3>
                        </div>
                        <div className="space-y-3">
                            {aiInsights.map((ins, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[#111827] border border-[#1E2D4580]">
                                    {ins.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" /> :
                                     ins.type === 'info' ? <Clock className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" /> :
                                     <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
                                    <p className="text-sm text-[#C8D5E0] leading-relaxed">{ins.text}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
