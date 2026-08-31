import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, CheckCircle, Clock, ShieldCheck, Lock } from 'lucide-react';

const mockRecords = [
    { id: 'REC-7841', patient: 'Alice M.', type: 'Blood Test', date: '2026-02-28', status: 'Verified', hash: '0x8f3a...c4d1' },
    { id: 'REC-7842', patient: 'Bob K.', type: 'MRI Scan', date: '2026-02-27', status: 'Encrypted', hash: '0x2b7e...f903' },
    { id: 'REC-7843', patient: 'Carol J.', type: 'Prescription', date: '2026-02-27', status: 'Pending', hash: '0x9d1c...a8b2' },
    { id: 'REC-7844', patient: 'David R.', type: 'Lab Report', date: '2026-02-26', status: 'Verified', hash: '0x4e6f...d7c5' },
    { id: 'REC-7845', patient: 'Eve S.', type: 'X-Ray', date: '2026-02-25', status: 'Verified', hash: '0x1a3b...e2f4' },
];

const StatusBadge = ({ status }) => {
    const styles = {
        Verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        Encrypted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    const icons = {
        Verified: CheckCircle,
        Encrypted: Lock,
        Pending: Clock,
    };
    const Icon = icons[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
            <Icon className="w-3 h-3" />
            {status}
        </span>
    );
};

const LivePreview = () => {
    return (
        <section className="relative py-24 px-6 lg:px-20">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                        Live System{' '}
                        <span className="bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
                            Preview
                        </span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        A glimpse into the HealthChain dashboard — real-time record management at your fingertips.
                    </p>
                </motion.div>

                {/* Mock Dashboard */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] overflow-hidden shadow-glass"
                >
                    {/* Dashboard Header Bar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                            </div>
                            <span className="text-gray-400 text-sm font-mono">healthchain-dashboard</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <Wallet className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-400 text-xs font-mono">0x7a9F...3b2D</span>
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-white/[0.06]">
                        {[
                            { label: 'Total Records', value: '2,847', icon: ShieldCheck, color: 'text-neon-cyan' },
                            { label: 'Verified', value: '2,614', icon: CheckCircle, color: 'text-emerald-400' },
                            { label: 'Pending', value: '18', icon: Clock, color: 'text-amber-400' },
                            { label: 'Encrypted', value: '215', icon: Lock, color: 'text-blue-400' },
                        ].map((stat, i) => (
                            <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <div className="flex items-center gap-2 mb-2">
                                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                    <span className="text-gray-500 text-xs">{stat.label}</span>
                                </div>
                                <span className="text-white text-2xl font-bold">{stat.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Records Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-white/[0.06]">
                                    <th className="px-6 py-4 font-medium">Record ID</th>
                                    <th className="px-6 py-4 font-medium">Patient</th>
                                    <th className="px-6 py-4 font-medium hidden sm:table-cell">Type</th>
                                    <th className="px-6 py-4 font-medium hidden md:table-cell">Date</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium hidden lg:table-cell">Tx Hash</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockRecords.map((record, i) => (
                                    <motion.tr
                                        key={record.id}
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="px-6 py-4 text-sm font-mono text-neon-cyan">{record.id}</td>
                                        <td className="px-6 py-4 text-sm text-white">{record.patient}</td>
                                        <td className="px-6 py-4 text-sm text-gray-400 hidden sm:table-cell">{record.type}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">{record.date}</td>
                                        <td className="px-6 py-4"><StatusBadge status={record.status} /></td>
                                        <td className="px-6 py-4 text-sm font-mono text-gray-500 hidden lg:table-cell">{record.hash}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default LivePreview;
