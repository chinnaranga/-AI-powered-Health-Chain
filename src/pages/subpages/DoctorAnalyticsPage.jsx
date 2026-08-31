import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Users, Clock, Brain, Download, HeartPulse, ShieldAlert,
    TrendingUp, FileText, ActivitySquare, AlertTriangle, ChevronRight
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-xl px-4 py-3 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <p className="text-[11px] text-[#8899AA] mb-2 font-medium uppercase tracking-wider">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="text-sm font-semibold flex items-center gap-2" style={{ color: p.color || p.fill }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
                    {p.name}: {p.value}
                </p>
            ))}
        </div>
    );
}

export default function DoctorAnalyticsPage() {
    const [timeRange, setTimeRange] = useState('7D');

    // KPIs for Population Health
    const kpis = [
        { label: 'Avg Time to Verification', value: '4.2s', icon: Clock, color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/20', trend: '-0.8s', trendUp: true },
        { label: 'High-Risk Patients Monitored', value: '42', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', trend: '+5', trendUp: false },
        { label: 'Records Synced Today', value: '1,284', icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', trend: '+12%', trendUp: true },
        { label: 'Population Health Score', value: '88/100', icon: HeartPulse, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', trend: '+2 pts', trendUp: true },
    ];

    // Mock Data for "Patient Risk Stratification" (Stacked Bar Chart)
    const riskData = [
        { department: 'Cardiology', Low: 120, Medium: 45, High: 15 },
        { department: 'Neurology', Low: 80, Medium: 30, High: 25 },
        { department: 'Oncology', Low: 40, Medium: 60, High: 45 },
        { department: 'Orthopedics', Low: 150, Medium: 20, High: 5 },
        { department: 'Pediatrics', Low: 200, Medium: 15, High: 2 },
    ];

    // Mock Data for "Access Bottlenecks" (Line Chart)
    const bottleneckData = [
        { time: '08:00', 'OTP Response Time (s)': 12, 'Emergency Overrides': 0 },
        { time: '10:00', 'OTP Response Time (s)': 18, 'Emergency Overrides': 1 },
        { time: '12:00', 'OTP Response Time (s)': 45, 'Emergency Overrides': 3 }, // Lunch rush bottleneck
        { time: '14:00', 'OTP Response Time (s)': 22, 'Emergency Overrides': 1 },
        { time: '16:00', 'OTP Response Time (s)': 15, 'Emergency Overrides': 0 },
        { time: '18:00', 'OTP Response Time (s)': 10, 'Emergency Overrides': 2 },
    ];

    const aiInsights = [
        { text: 'Peak access bottlenecks occur consistently between 11:30 AM and 1:00 PM. Consider pre-authorizing non-critical access during this window.', type: 'warning' },
        { text: 'Oncology department shows a 15% month-over-month increase in High-Risk patient stratifications.', type: 'info' },
        { text: 'Average time to verification has improved by 0.8s following the recent blockchain node upgrade.', type: 'positive' }
    ];

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-fade-in flex flex-col h-[calc(100vh-120px)] relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <ActivitySquare className="w-5 h-5 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Clinical Intelligence</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Population Health</h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-[#111827] border border-[#1E2D4580] rounded-xl p-1">
                        {['24H', '7D', '30D', 'YTD'].map(r => (
                            <button key={r} onClick={() => setTimeRange(r)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    timeRange === r 
                                    ? 'bg-[#00C8D4]/15 text-[#00C8D4] border border-[#00C8D4]/30 shadow-[0_0_10px_rgba(0,200,212,0.1)]' 
                                    : 'text-[#8899AA] hover:text-white border border-transparent'
                                }`}>
                                {r}
                            </button>
                        ))}
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-[#00C8D4] text-[#0B0F1A] font-bold flex items-center gap-2 hover:bg-[#00E5F0] transition-all shadow-[0_0_15px_rgba(0,200,212,0.3)]">
                        <Download className="w-4 h-4" /> Generate Report
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                
                {/* KPIs Top Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpis.map((k, i) => (
                        <motion.div key={k.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="p-5 rounded-2xl bg-[#111827] border border-[#1E2D4580] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/[0.02] to-transparent rounded-bl-full pointer-events-none" />
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-10 h-10 rounded-xl ${k.bg} border ${k.border} flex items-center justify-center`}>
                                    <k.icon className={`w-5 h-5 ${k.color}`} />
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                                    k.trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                    {k.trend}
                                </span>
                            </div>
                            <div>
                                <p className="text-[11px] text-[#8899AA] font-bold uppercase tracking-wider mb-1">{k.label}</p>
                                <p className="text-3xl font-display font-bold text-white group-hover:text-[#00C8D4] transition-colors">{k.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Patient Risk Stratification */}
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                        className="p-6 rounded-2xl bg-[#111827] border border-[#1E2D4580]">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                <Users className="w-4 h-4 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-display font-bold text-white">Patient Risk Stratification</h3>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={riskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid stroke="#1E2D45" strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="department" stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1A2236' }} />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                    <Bar dataKey="Low" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="Medium" stackId="a" fill="#F59E0B" />
                                    <Bar dataKey="High" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Access Bottlenecks */}
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                        className="p-6 rounded-2xl bg-[#111827] border border-[#1E2D4580]">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-[#00C8D4]" />
                            </div>
                            <h3 className="text-lg font-display font-bold text-white">Access Bottlenecks</h3>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={bottleneckData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid stroke="#1E2D45" strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="time" stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="left" stroke="#8899AA" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#EF4444" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                    <Line yAxisId="left" type="monotone" dataKey="OTP Response Time (s)" stroke="#00C8D4" strokeWidth={3} dot={{ r: 4, fill: '#00C8D4', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                    <Line yAxisId="right" type="monotone" dataKey="Emergency Overrides" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* AI Insights Panel */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="p-6 rounded-2xl bg-[#1A2236]/50 border border-[#1E2D4580] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C8D4]/5 rounded-full blur-[80px] pointer-events-none" />
                    
                    <div className="flex items-center gap-2 mb-4">
                        <Brain className="w-5 h-5 text-[#00C8D4]" />
                        <h3 className="text-lg font-display font-bold text-white">AI Population Insights</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {aiInsights.map((insight, i) => (
                            <div key={i} className="p-4 rounded-xl bg-[#111827] border border-[#1E2D4580] flex items-start gap-3">
                                {insight.type === 'warning' ? (
                                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                ) : insight.type === 'info' ? (
                                    <Activity className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <TrendingUp className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <p className="text-sm text-[#E2E8F0] leading-relaxed">{insight.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
