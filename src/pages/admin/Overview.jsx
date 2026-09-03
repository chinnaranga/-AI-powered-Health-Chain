import React, { useCallback, useEffect, useState } from 'react';
import {
    Activity,
    Database,
    FileText,
    RefreshCw,
    Server,
    ShieldCheck,
    Users,
    Wifi,
    WifiOff
} from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

import GlassCard from '../../components/GlassCard';
import apiClient from '../../services/apiClient';
import { useRealtime } from '../../hooks/useRealtime';

const EMPTY_STATS = {
    totalUsers: 0,
    totalRecords: 0,
    transactions: 0,
    activeUsers: 0,
    patients: 0,
    doctors: 0,
    clinicalStaff: 0,
    admins: 0,
    pendingUsers: 0,
    uploadCount: 0,
    storageBytes: 0
};

function formatBytes(bytes) {
    const value = Number(bytes || 0);
    if (!value) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(
        Math.floor(Math.log(value) / Math.log(1024)),
        units.length - 1
    );

    return `${(value / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

function formatTime(value) {
    if (!value) return 'Unknown time';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString();
}

function StatCard({ icon: Icon, label, value, description }) {
    return (
        <GlassCard hover={false}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                        {label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                        {Number(value || 0).toLocaleString()}
                    </p>
                    {description && (
                        <p className="mt-1 text-xs text-slate-500">
                            {description}
                        </p>
                    )}
                </div>

                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-cyan-400" />
                </div>
            </div>
        </GlassCard>
    );
}

export default function Overview() {
    const [stats, setStats] = useState(EMPTY_STATS);
    const [uploadsByDay, setUploadsByDay] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const loadOverview = useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) setRefreshing(true);
            else setLoading(true);

            setError('');

            const response = await apiClient.get('/admin/overview');

            if (!response?.success) {
                throw new Error(response?.message || 'Failed to load admin overview');
            }

            setStats({
                ...EMPTY_STATS,
                ...(response.stats || {})
            });

            setUploadsByDay(Array.isArray(response.uploadsByDay) ? response.uploadsByDay : []);
            setRecentActivity(
                Array.isArray(response.recentActivity)
                    ? response.recentActivity
                    : []
            );
        } catch (err) {
            console.error('Admin overview load failed:', err);
            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Failed to load live admin data'
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const handleRealtimeEvent = useCallback((event) => {
        const eventType = event?.type || event?.event || '';

        const refreshEvents = new Set([
            'USER_REGISTERED',
            'USER_UPDATED',
            'DOCTOR_REGISTERED',
            'DOCTOR_APPROVED',
            'DOCTOR_REJECTED',
            'RECORD_ADDED',
            'RECORD_DELETED',
            'APPOINTMENT_CREATED',
            'CONSENT_CHANGED',
            'CONSENT_GRANTED',
            'ACCESS_REQUEST_CREATED',
            'ACCESS_REQUEST_APPROVED',
            'ACCESS_REQUEST_REJECTED'
        ]);

        if (refreshEvents.has(eventType)) {
            loadOverview(true);
        }
    }, [loadOverview]);

    const { isConnected: realtimeConnected } = useRealtime(['admin'], handleRealtimeEvent);

    useEffect(() => {
        loadOverview();
    }, [loadOverview]);

    const cards = [
        {
            icon: Users,
            label: 'Total Users',
            value: stats.totalUsers,
            description: `${stats.activeUsers.toLocaleString()} active`
        },
        {
            icon: Users,
            label: 'Patients',
            value: stats.patients,
            description: 'Registered patients'
        },
        {
            icon: ShieldCheck,
            label: 'Doctors',
            value: stats.doctors,
            description: `${stats.pendingUsers.toLocaleString()} pending users`
        },
        {
            icon: FileText,
            label: 'Medical Records',
            value: stats.totalRecords,
            description: 'Neon records'
        },
        {
            icon: Database,
            label: 'Audit Events',
            value: stats.transactions,
            description: 'Recorded system events'
        },
        {
            icon: Server,
            label: 'Uploads',
            value: stats.uploadCount,
            description: formatBytes(stats.storageBytes)
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Admin Control Center
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Live system data from Neon PostgreSQL and the HealthChain event bus.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                            realtimeConnected
                                ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                                : 'border-amber-400/20 bg-amber-400/10 text-amber-300'
                        }`}
                    >
                        {realtimeConnected ? (
                            <Wifi className="w-4 h-4" />
                        ) : (
                            <WifiOff className="w-4 h-4" />
                        )}
                        <span className="text-xs font-medium">
                            {realtimeConnected ? 'Realtime Connected' : 'Realtime Offline'}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => loadOverview(true)}
                        disabled={loading || refreshing}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                        />
                        Refresh
                    </button>
                </div>
            </div>

            {error && (
                <GlassCard hover={false}>
                    <div className="flex items-center gap-3 text-red-300">
                        <Activity className="w-5 h-5" />
                        <p className="text-sm">{error}</p>
                    </div>
                </GlassCard>
            )}

            {loading ? (
                <GlassCard hover={false}>
                    <div className="flex items-center justify-center py-16 text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mr-3" />
                        Loading live system data...
                    </div>
                </GlassCard>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {cards.map((card) => (
                            <StatCard key={card.label} {...card} />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <GlassCard hover={false}>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-sm font-semibold text-white">
                                        Records Uploaded
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Last 7 days from Neon
                                    </p>
                                </div>
                            </div>

                            <div className="h-72">
                                {uploadsByDay.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-sm text-slate-500">
                                        No upload activity recorded.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={uploadsByDay}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fill: '#64748b', fontSize: 11 }}
                                            />
                                            <YAxis
                                                allowDecimals={false}
                                                tick={{ fill: '#64748b', fontSize: 11 }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    background: '#0f172a',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: 8,
                                                    color: '#fff'
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="count"
                                                stroke="#00f5ff"
                                                fill="rgba(0,245,255,0.15)"
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </GlassCard>

                        <GlassCard hover={false}>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-sm font-semibold text-white">
                                        System Activity
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Latest audit events
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 max-h-72 overflow-auto">
                                {recentActivity.length === 0 ? (
                                    <p className="text-sm text-slate-500">
                                        No audit activity recorded yet.
                                    </p>
                                ) : (
                                    recentActivity.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-4 text-sm"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                                <Activity className="w-4 h-4 text-cyan-400" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-white truncate">
                                                    {item.msg || item.action || 'System event'}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {formatTime(item.time || item.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </GlassCard>
                    </div>

                    <GlassCard hover={false}>
                        <h3 className="text-sm font-semibold text-white mb-4">
                            Current System Distribution
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                                ['Patients', stats.patients],
                                ['Doctors', stats.doctors],
                                ['Clinical Staff', stats.clinicalStaff],
                                ['Admins', stats.admins],
                                ['Pending Users', stats.pendingUsers]
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <p className="text-xs text-slate-500">{label}</p>
                                    <p className="text-lg font-semibold text-white">
                                        {Number(value || 0).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </>
            )}
        </div>
    );
}
