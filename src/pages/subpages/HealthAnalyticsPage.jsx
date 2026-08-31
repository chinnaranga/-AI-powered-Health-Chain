import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db, auth } from '../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import {
    HeartPulse, Droplets, Activity, Pill, FileText, Shield,
    TrendingUp, Download, ArrowUpRight, ArrowDownRight, Brain
} from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';

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

/* ── Mock data sets ── */
const bpData = [
    { month: 'Dec', systolic: 148, diastolic: 92 },
    { month: 'Jan', systolic: 145, diastolic: 90 },
    { month: 'Feb', systolic: 142, diastolic: 88 },
    { month: 'Mar', systolic: 139, diastolic: 86 },
    { month: 'Apr', systolic: 137, diastolic: 85 },
    { month: 'May', systolic: 135, diastolic: 84 },
];

const sugarData = [
    { month: 'Dec', fasting: 145, postMeal: 210 },
    { month: 'Jan', fasting: 138, postMeal: 198 },
    { month: 'Feb', fasting: 132, postMeal: 188 },
    { month: 'Mar', fasting: 128, postMeal: 182 },
    { month: 'Apr', fasting: 124, postMeal: 175 },
    { month: 'May', fasting: 120, postMeal: 168 },
];

const cholesterolData = [
    { month: 'Dec', LDL: 145, HDL: 42, Total: 228 },
    { month: 'Jan', LDL: 142, HDL: 44, Total: 224 },
    { month: 'Feb', LDL: 140, HDL: 45, Total: 220 },
    { month: 'Mar', LDL: 138, HDL: 46, Total: 218 },
    { month: 'Apr', LDL: 136, HDL: 47, Total: 214 },
    { month: 'May', LDL: 133, HDL: 48, Total: 210 },
];

const medicationData = [
    { med: 'Metformin', adherence: 92 },
    { med: 'Amlodipine', adherence: 88 },
    { med: 'Atorvastatin', adherence: 79 },
    { med: 'Aspirin', adherence: 95 },
    { med: 'Vitamin D', adherence: 65 },
];



/* ── KPI Card ── */
function KPICard({ icon: Icon, label, value, sub, trend, trendUp, color, bg, border, delay }) {
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
            className={`bg-[#111827] border ${border} rounded-2xl p-5 relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/[0.02] to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
                {trend && (
                    <span className={`text-[10px] font-bold flex items-center gap-0.5 px-2 py-1 rounded-md ${trendUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-3xl font-display font-bold group-hover:${color} text-white transition-colors`}>{value}</p>
            {sub && <p className="text-xs text-[#8899AA] mt-1">{sub}</p>}
        </motion.div>
    );
}

/* ── Chart Card ── */
function ChartCard({ title, icon: Icon, iconColor, iconBg, iconBorder, children, span }) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className={`bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 ${span || ''}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className={`w-9 h-9 rounded-xl ${iconBg} border ${iconBorder} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <h3 className="text-sm font-display font-bold text-white">{title}</h3>
            </div>
            {children}
        </motion.div>
    );
}

/* ── Time Range Filter ── */
function TimeRangeFilter({ value, onChange }) {
    return (
        <div className="flex bg-[#111827] border border-[#1E2D4580] rounded-xl p-1">
            {['1M', '3M', '6M', '1Y'].map(r => (
                <button key={r} onClick={() => onChange(r)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${value === r ? 'bg-[#00C8D4]/15 text-[#00C8D4] border border-[#00C8D4]/30' : 'text-[#8899AA] hover:text-white border border-transparent'}`}>
                    {r}
                </button>
            ))}
        </div>
    );
}

/* ── PAGE ── */
export default function HealthAnalyticsPage() {
    const [timeRange, setTimeRange] = useState('6M');
    const [userId, setUserId] = useState(null);
    const [recordCategoryData, setRecordCategoryData] = useState([]);
    const [accessActivityData, setAccessActivityData] = useState([]);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, u => setUserId(u?.uid || null));
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!userId) return;
        const q = query(collection(db, 'records'), where('patientId', '==', userId));
        const unsub = onSnapshot(q, (snap) => {
            const counts = {};
            let total = 0;
            snap.forEach(doc => {
                const cat = doc.data().category || 'Other';
                counts[cat] = (counts[cat] || 0) + 1;
                total++;
            });
            if (total === 0) {
                setRecordCategoryData([]);
                return;
            }
            const data = Object.keys(counts).map(cat => {
                const value = Math.round((counts[cat] / total) * 100);
                let color = '#6366F1';
                if (cat === 'Lab Reports' || cat === 'Lab') color = '#00C8D4';
                else if (cat === 'Prescriptions' || cat === 'Prescription') color = '#8B5CF6';
                else if (cat === 'Imaging') color = '#10B981';
                else if (cat === 'Discharge' || cat === 'Discharge Summary') color = '#F59E0B';
                return { name: cat, value, color };
            });
            setRecordCategoryData(data);
        });
        return () => unsub();
    }, [userId]);

    useEffect(() => {
        if (!userId) return;
        const q = query(collection(db, 'auditLogs'), where('patientId', '==', userId));
        const unsub = onSnapshot(q, (snap) => {
            const weeks = ['W6', 'W5', 'W4', 'W3', 'W2', 'W1'];
            const accessesMap = { W1: 0, W2: 0, W3: 0, W4: 0, W5: 0, W6: 0 };
            
            const now = Date.now();
            snap.forEach(doc => {
                const data = doc.data();
                if (data.activityType === 'RECORD_DECRYPTED_VIEWED' || data.activityType === 'ACCESS_REQUEST_CREATED') {
                    const ts = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp || Date.now());
                    const diffDays = Math.floor((now - ts) / (1000 * 60 * 60 * 24));
                    const weekIdx = Math.floor(diffDays / 7) + 1;
                    if (weekIdx >= 1 && weekIdx <= 6) {
                        const wk = `W${7 - weekIdx}`;
                        accessesMap[wk] = (accessesMap[wk] || 0) + 1;
                    }
                }
            });
            
            const chartData = weeks.map(w => ({
                week: w,
                accesses: accessesMap[w]
            }));
            setAccessActivityData(chartData);
        });
        return () => unsub();
    }, [userId]);

    const kpis = [
        { icon: HeartPulse, label: 'Avg Blood Pressure', value: '136/85', sub: 'Target: <130/80', trend: '↓ Improving', trendUp: true, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', delay: 0 },
        { icon: Droplets, label: 'Fasting Sugar', value: '120 mg/dL', sub: 'Normal: 70-100', trend: '↓ 8.4%', trendUp: true, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', delay: 0.06 },
        { icon: Activity, label: 'LDL Cholesterol', value: '133 mg/dL', sub: 'Target: <130', trend: '↓ 8.3%', trendUp: true, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', delay: 0.12 },
        { icon: Pill, label: 'Med Adherence', value: '83.8%', sub: 'Based on 5 meds', trend: '+2.1%', trendUp: true, color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/20', delay: 0.18 },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Health Intelligence</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Health Analytics</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Track your vitals, medications and records over time.</p>
                </div>
                <div className="flex items-center gap-3">
                    <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00C8D4] hover:bg-[#00E5F0] text-[#0B0F1A] font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,200,212,0.25)]">
                        <Download className="w-3.5 h-3.5" /> Export
                    </button>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map(k => <KPICard key={k.label} {...k} />)}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Blood Pressure Trend" icon={HeartPulse} iconColor="text-red-400" iconBg="bg-red-500/10" iconBorder="border-red-500/20">
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={bpData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid stroke="#1E2D45" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} domain={[70, 160]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                            <Line type="monotone" dataKey="systolic" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3, fill: '#EF4444', strokeWidth: 0 }} name="Systolic" />
                            <Line type="monotone" dataKey="diastolic" stroke="#F97316" strokeWidth={2.5} dot={{ r: 3, fill: '#F97316', strokeWidth: 0 }} name="Diastolic" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Blood Sugar Trend" icon={Droplets} iconColor="text-amber-400" iconBg="bg-amber-500/10" iconBorder="border-amber-500/20">
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={sugarData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="fastingGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="postGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#1E2D45" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                            <Area type="monotone" dataKey="fasting" stroke="#F59E0B" fill="url(#fastingGrad)" strokeWidth={2} name="Fasting (mg/dL)" />
                            <Area type="monotone" dataKey="postMeal" stroke="#EF4444" fill="url(#postGrad)" strokeWidth={2} name="Post-meal (mg/dL)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartCard title="Cholesterol Trends" icon={Activity} iconColor="text-purple-400" iconBg="bg-purple-500/10" iconBorder="border-purple-500/20" span="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={cholesterolData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid stroke="#1E2D45" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                            <Line type="monotone" dataKey="LDL" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3, fill: '#EF4444', strokeWidth: 0 }} name="LDL" />
                            <Line type="monotone" dataKey="HDL" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }} name="HDL" />
                            <Line type="monotone" dataKey="Total" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="5 3" dot={false} name="Total" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Pie Chart */}
                <ChartCard title="Record Categories" icon={FileText} iconColor="text-[#00C8D4]" iconBg="bg-[#00C8D4]/10" iconBorder="border-[#00C8D4]/20">
                    {recordCategoryData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-xs text-[#8899AA] font-mono">
                            No records found.
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={recordCategoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                        {recordCategoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip content={({ active, payload }) => {
                                        if (!active || !payload?.length) return null;
                                        const d = payload[0].payload;
                                        return (
                                            <div className="bg-[#111827] border border-[#1E2D4580] rounded-xl px-3 py-2 text-xs">
                                                <p className="text-white font-bold">{d.name}</p>
                                                <p className="text-[#8899AA]">{d.value}%</p>
                                            </div>
                                        );
                                    }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1.5 mt-2">
                                {recordCategoryData.map(d => (
                                    <div key={d.name} className="flex items-center gap-2 text-xs">
                                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                                        <span className="text-[#8899AA] flex-1">{d.name}</span>
                                        <span className="text-white font-semibold">{d.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </ChartCard>
            </div>

            {/* Charts Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Medication Adherence" icon={Pill} iconColor="text-[#00C8D4]" iconBg="bg-[#00C8D4]/10" iconBorder="border-[#00C8D4]/20">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={medicationData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                            <CartesianGrid stroke="#1E2D45" strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                            <YAxis dataKey="med" type="category" stroke="#8899AA" fontSize={11} width={90} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1A2236' }} />
                            <Bar dataKey="adherence" name="Adherence %" radius={[0, 6, 6, 0]} barSize={14}
                                fill="#00C8D4" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Access Frequency (Weekly)" icon={Shield} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" iconBorder="border-emerald-500/20">
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={accessActivityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="accessGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#1E2D45" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="week" stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="accesses" stroke="#10B981" fill="url(#accessGrad)" strokeWidth={2.5} name="Accesses" dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* AI Insights */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="bg-[#1A2236]/50 border border-[#1E2D4580] rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C8D4]/5 rounded-full blur-[80px] pointer-events-none" />
                <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5 text-[#00C8D4]" />
                    <h3 className="text-lg font-display font-bold text-white">AI Health Insights</h3>
                    <span className="px-2 py-0.5 rounded-md bg-[#00C8D4]/10 text-[#00C8D4] text-[9px] font-bold uppercase tracking-wider border border-[#00C8D4]/20 ml-auto">Beta</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: HeartPulse, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'Blood pressure is trending downward — current regimen appears effective. Continue monitoring. Target <130/80 mmHg within 2 months.' },
                        { icon: Droplets, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'Fasting sugar improved 17.2% since December. HbA1c review due in 6 weeks to validate sustained control.' },
                        { icon: Pill, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'Vitamin D adherence at 65% — below threshold. Consider reminders or depot injection to improve compliance.' },
                    ].map((ins, i) => (
                        <div key={i} className={`p-4 rounded-xl ${ins.bg} border ${ins.border} flex items-start gap-3`}>
                            <ins.icon className={`w-5 h-5 ${ins.color} flex-shrink-0 mt-0.5`} />
                            <p className="text-sm text-[#CBD5E1] leading-relaxed">{ins.text}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
