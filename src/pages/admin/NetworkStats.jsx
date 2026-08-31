import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Globe, Server, Activity, ShieldCheck } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { apiClient } from '../../services/apiClient';

const MOCK_NODE_DISTRIBUTION = [
    { name: 'US East (N. Virginia)', value: 145, color: '#00C8D4' },
    { name: 'US West (Oregon)', value: 85, color: '#10B981' },
    { name: 'EU (Frankfurt)', value: 112, color: '#8B5CF6' },
    { name: 'AP (Singapore)', value: 64, color: '#F59E0B' },
];

const MOCK_NETWORK_HEALTH = [
    { time: '00:00', latency: 45, load: 30 },
    { time: '04:00', latency: 42, load: 25 },
    { time: '08:00', latency: 68, load: 65 },
    { time: '12:00', latency: 85, load: 88 },
    { time: '16:00', latency: 72, load: 75 },
    { time: '20:00', latency: 50, load: 45 },
];

export default function NetworkStats() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['adminNetworkStats'],
        queryFn: apiClient.getNetworkStats,
    });

    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-[#111827]/95 backdrop-blur-xl border border-[#1E2D4580] rounded-xl px-4 py-3 shadow-2xl">
                {payload.map((p, i) => (
                    <p key={i} className="text-sm font-semibold flex items-center gap-2" style={{ color: p.color || p.fill }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
                        {p.name}: {p.value}
                    </p>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold font-display text-white">Network Analytics</h1>
                <p className="text-sm text-[#8899AA]">Detailed geographical and health metrics of the decentralized nodes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Global Status Card */}
                <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl flex flex-col justify-center items-center text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 relative">
                        <div className="absolute inset-0 rounded-full border border-emerald-400 animate-ping opacity-20"></div>
                        <Globe className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-3xl font-display font-bold text-white mb-1">Global 100%</h3>
                    <p className="text-sm text-emerald-400 font-bold flex items-center gap-1.5 justify-center">
                        <ShieldCheck className="w-4 h-4" /> Fully Operational
                    </p>
                    <div className="mt-8 grid grid-cols-2 gap-4 w-full text-left">
                        <div className="bg-[#1A2236]/50 p-3 rounded-xl border border-[#1E2D4580]">
                            <p className="text-xs text-[#8899AA] font-bold mb-1 uppercase tracking-wider">Total Nodes</p>
                            <p className="text-lg font-bold text-white flex items-center gap-2"><Server className="w-4 h-4 text-[#00C8D4]" /> 406</p>
                        </div>
                        <div className="bg-[#1A2236]/50 p-3 rounded-xl border border-[#1E2D4580]">
                            <p className="text-xs text-[#8899AA] font-bold mb-1 uppercase tracking-wider">Avg Latency</p>
                            <p className="text-lg font-bold text-white flex items-center gap-2"><Activity className="w-4 h-4 text-amber-400" /> 56ms</p>
                        </div>
                    </div>
                </div>

                {/* Node Distribution */}
                <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 md:col-span-2">
                    <h3 className="text-sm font-semibold text-white mb-6">Node Geographical Distribution</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="h-48 flex-1 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={MOCK_NODE_DISTRIBUTION}
                                        cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {MOCK_NODE_DISTRIBUTION.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full sm:w-48 space-y-3">
                            {MOCK_NODE_DISTRIBUTION.map(n => (
                                <div key={n.name}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-[#8899AA]">{n.name}</span>
                                        <span className="text-white font-medium">{n.value}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-[#1A2236] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(n.value / 406) * 100}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: n.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Health Chart */}
            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 h-80 flex flex-col">
                <h3 className="text-sm font-semibold text-white mb-6">Network Load & Latency (24h)</h3>
                <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={MOCK_NETWORK_HEALTH} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4580" vertical={false} />
                            <XAxis dataKey="time" stroke="#8899AA" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="left" stroke="#8899AA" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="right" orientation="right" stroke="#8899AA" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1A2236' }} />
                            <Bar yAxisId="left" dataKey="load" name="Network Load %" fill="#00C8D4" radius={[4, 4, 0, 0]} />
                            <Bar yAxisId="right" dataKey="latency" name="Latency (ms)" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
