import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, FileText, Blocks, Activity } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from '../../components/GlassCard';
import { apiClient } from '../../services/apiClient';

// Fallback mock data if API fails to provide data
const MOCK_STATS = {
    totalUsers: 1248,
    totalRecords: 8521,
    transactions: 145020,
    activeNodes: 42
};

const MOCK_UPLOADS = [
    { name: 'Mon', count: 120 }, { name: 'Tue', count: 142 }, { name: 'Wed', count: 168 },
    { name: 'Thu', count: 135 }, { name: 'Fri', count: 190 }, { name: 'Sat', count: 85 }, { name: 'Sun', count: 65 },
];

const MOCK_TX = [
    { name: '12am', tx: 400 }, { name: '4am', tx: 300 }, { name: '8am', tx: 1200 },
    { name: '12pm', tx: 2500 }, { name: '4pm', tx: 1800 }, { name: '8pm', tx: 900 },
];

export default function Overview() {
    // We would fetch the real stats here via react-query
    const { data: networkStats, isLoading } = useQuery({
        queryKey: ['networkStats'],
        queryFn: apiClient.getNetworkStats,
    });

    const stats = networkStats || MOCK_STATS;

    const statCards = [
        { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        { title: 'Total Records', value: stats.totalRecords, icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { title: 'Transactions', value: stats.transactions, icon: Blocks, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { title: 'Active Nodes', value: stats.activeNodes, icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold font-display text-white">System Overview</h1>
                <p className="text-sm text-slate-400">Real-time health pulse of the HealthChain network.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s, i) => (
                    <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <GlassCard className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                                <s.icon className={`w-6 h-6 ${s.color}`} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-400">{s.title}</p>
                                <p className="text-xl font-bold text-white">
                                    {isLoading ? <span className="animate-pulse w-16 h-6 bg-white/10 rounded block mt-1"></span> : s.value?.toLocaleString()}
                                </p>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard hover={false}>
                    <h3 className="text-sm font-semibold text-white mb-6">Records Uploaded (7 Days)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MOCK_UPLOADS}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00F5FF" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00F5FF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(11, 17, 32, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#00F5FF' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#00F5FF" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                <GlassCard hover={false}>
                    <h3 className="text-sm font-semibold text-white mb-6">Transactions Volume (24h)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={MOCK_TX}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(11, 17, 32, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="tx" fill="#7B2FFF" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>

            {/* Activity Feed */}
            <GlassCard hover={false}>
                <h3 className="text-sm font-semibold text-white mb-4">Recent Network Activity</h3>
                <div className="space-y-4">
                    {[
                        { msg: 'New node [AP-South-1] joined the network', time: '2 mins ago', icon: Activity, color: 'text-amber-400' },
                        { msg: 'User Dr. Sarah Connor registered', time: '15 mins ago', icon: Users, color: 'text-cyan-400' },
                        { msg: 'Smart Contract update 0x4B...8v deployed', time: '1 hour ago', icon: Blocks, color: 'text-purple-400' },
                        { msg: 'Batch of 150 medical records verified & pinned to IPFS', time: '2 hours ago', icon: FileText, color: 'text-emerald-400' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 text-sm">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                <item.icon className={`w-4 h-4 ${item.color}`} />
                            </div>
                            <div className="flex-1">
                                <p className="text-white">{item.msg}</p>
                                <p className="text-xs text-slate-500">{item.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
}
