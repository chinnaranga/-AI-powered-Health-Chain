import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Link2, CheckCircle, XCircle, AlertTriangle, RefreshCw,
    Zap, Database, Server, Brain, Shield, Cloud, Activity,
    Wifi, WifiOff, Settings, ExternalLink, ChevronRight, Clock
} from 'lucide-react';

const STATUS_CFG = {
    connected:    { label: 'Connected',    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400', pulse: true },
    degraded:     { label: 'Degraded',     color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   dot: 'bg-amber-400',   pulse: true },
    disconnected: { label: 'Disconnected', color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30',     dot: 'bg-red-400',     pulse: false },
    syncing:      { label: 'Syncing...',   color: 'text-[#00C8D4]',   bg: 'bg-[#00C8D4]/10',   border: 'border-[#00C8D4]/30',   dot: 'bg-[#00C8D4]',  pulse: true },
};

const INTEGRATIONS = [
    {
        id: 'firebase-core',
        name: 'Firebase Core',
        category: 'Infrastructure',
        description: 'Firestore, Authentication, and Cloud Functions. Primary data and auth backbone.',
        icon: Database,
        iconColor: 'text-amber-400',
        iconBg: 'bg-amber-500/10',
        iconBorder: 'border-amber-500/20',
        status: 'connected',
        latency: '24ms',
        uptime: '99.99%',
        lastSync: '1 second ago',
    },
    {
        id: 'firebase-storage',
        name: 'Firebase Storage',
        category: 'Storage',
        description: 'Encrypted document storage for medical records, reports, and AI summaries.',
        icon: Cloud,
        iconColor: 'text-blue-400',
        iconBg: 'bg-blue-500/10',
        iconBorder: 'border-blue-500/20',
        status: 'connected',
        latency: '38ms',
        uptime: '99.97%',
        lastSync: '5 seconds ago',
    },
    {
        id: 'ipfs',
        name: 'IPFS Node',
        category: 'Decentralized Storage',
        description: 'Content-addressed distributed storage for immutable health record hashes.',
        icon: Server,
        iconColor: 'text-teal-400',
        iconBg: 'bg-teal-500/10',
        iconBorder: 'border-teal-500/20',
        status: 'connected',
        latency: '120ms',
        uptime: '99.82%',
        lastSync: '12 seconds ago',
    },
    {
        id: 'blockchain-rpc',
        name: 'Blockchain RPC',
        category: 'Blockchain',
        description: 'Smart contract execution node for access control, consent, and record verification.',
        icon: Zap,
        iconColor: 'text-purple-400',
        iconBg: 'bg-purple-500/10',
        iconBorder: 'border-purple-500/20',
        status: 'degraded',
        latency: '350ms',
        uptime: '97.4%',
        lastSync: '2 min ago',
    },
    {
        id: 'ai-engine',
        name: 'AI Analytics Engine',
        category: 'AI Services',
        description: 'Clinical summary generation, anomaly detection, and health insight analysis.',
        icon: Brain,
        iconColor: 'text-indigo-400',
        iconBg: 'bg-indigo-500/10',
        iconBorder: 'border-indigo-500/20',
        status: 'connected',
        latency: '85ms',
        uptime: '99.91%',
        lastSync: '30 seconds ago',
    },
    {
        id: 'abha-registry',
        name: 'ABHA Registry',
        category: 'National Stack',
        description: 'Ayushman Bharat Health Account identity verification and consent artifact API.',
        icon: Shield,
        iconColor: 'text-emerald-400',
        iconBg: 'bg-emerald-500/10',
        iconBorder: 'border-emerald-500/20',
        status: 'connected',
        latency: '210ms',
        uptime: '98.5%',
        lastSync: '1 min ago',
    },
    {
        id: 'hospital-a',
        name: 'Hospital A — Apollo',
        category: 'Hospital Connector',
        description: 'HL7 FHIR R4 interoperability connector for Apollo Hospital records system.',
        icon: Activity,
        iconColor: 'text-[#00C8D4]',
        iconBg: 'bg-[#00C8D4]/10',
        iconBorder: 'border-[#00C8D4]/20',
        status: 'connected',
        latency: '145ms',
        uptime: '99.1%',
        lastSync: '3 min ago',
    },
    {
        id: 'hospital-b',
        name: 'Hospital B — City General',
        category: 'Hospital Connector',
        description: 'HL7 FHIR R4 interoperability connector for City General Hospital.',
        icon: Activity,
        iconColor: 'text-[#00C8D4]',
        iconBg: 'bg-[#00C8D4]/10',
        iconBorder: 'border-[#00C8D4]/20',
        status: 'syncing',
        latency: '180ms',
        uptime: '98.8%',
        lastSync: 'Syncing now...',
    },
];

const CATEGORIES = ['All', 'Infrastructure', 'Storage', 'Decentralized Storage', 'Blockchain', 'AI Services', 'National Stack', 'Hospital Connector'];

function IntegrationCard({ intg, onToggle, isReconnecting }) {
    const Icon = intg.icon;
    const st = STATUS_CFG[intg.status];

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className={`bg-[#111827] border rounded-2xl p-5 relative overflow-hidden group transition-all duration-300 ${
                intg.status === 'degraded' ? 'border-amber-500/30 hover:border-amber-500/50' :
                intg.status === 'disconnected' ? 'border-red-500/20 hover:border-red-500/40' :
                'border-[#1E2D4580] hover:border-[#00C8D4]/30'
            }`}>
            <div className={`absolute top-0 right-0 w-32 h-32 ${intg.iconBg} rounded-full blur-[60px] opacity-20 pointer-events-none`} />

            <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl ${intg.iconBg} border ${intg.iconBorder} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${intg.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="text-sm font-bold text-white">{intg.name}</p>
                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ml-auto flex-shrink-0 ${st.bg} ${st.border} ${st.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${st.pulse ? (intg.status === 'syncing' ? 'animate-spin' : 'animate-pulse') : ''}`} />
                            {isReconnecting ? 'Reconnecting...' : st.label}
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">{intg.category}</p>
                </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">{intg.description}</p>

            <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                    { label: 'Latency', value: intg.latency },
                    { label: 'Uptime', value: intg.uptime },
                    { label: 'Last Sync', value: intg.lastSync },
                ].map(m => (
                    <div key={m.label} className="bg-[#0B0F1A] rounded-xl p-2.5 text-center border border-[#1E2D4580]">
                        <p className="text-[10px] text-slate-500 font-mono mb-0.5">{m.label}</p>
                        <p className="text-xs font-bold text-white truncate">{m.value}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                {intg.status === 'disconnected' || intg.status === 'degraded' ? (
                    <button onClick={() => onToggle(intg.id, 'reconnect')} disabled={isReconnecting}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all disabled:opacity-50">
                        {isReconnecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
                        {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
                    </button>
                ) : (
                    <button onClick={() => onToggle(intg.id, 'disconnect')}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-[#1A2236] border border-[#1E2D4580] text-slate-400 text-xs font-bold hover:text-red-400 hover:border-red-500/30 transition-all">
                        <WifiOff className="w-3.5 h-3.5" /> Disconnect
                    </button>
                )}
                <button className="py-2 px-3 rounded-xl bg-[#1A2236] border border-[#1E2D4580] text-slate-400 hover:text-white transition-all">
                    <Settings className="w-3.5 h-3.5" />
                </button>
            </div>
        </motion.div>
    );
}

export default function IntegrationsCenterPage() {
    const [integrations, setIntegrations] = useState(INTEGRATIONS);
    const [reconnecting, setReconnecting] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('All');

    const handleToggle = async (id, action) => {
        if (action === 'reconnect') {
            setReconnecting(id);
            await new Promise(r => setTimeout(r, 2000));
            setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: 'connected', latency: '42ms', uptime: '99.9%', lastSync: 'Just now' } : i));
            setReconnecting(null);
        } else {
            setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: 'disconnected' } : i));
        }
    };

    const filtered = categoryFilter === 'All' ? integrations : integrations.filter(i => i.category === categoryFilter);
    const connectedCount = integrations.filter(i => i.status === 'connected').length;
    const degradedCount = integrations.filter(i => i.status === 'degraded').length;
    const disconnectedCount = integrations.filter(i => i.status === 'disconnected').length;

    const kpis = [
        { label: 'Connected', value: connectedCount, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        { label: 'Degraded', value: degradedCount, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', pulse: degradedCount > 0 },
        { label: 'Disconnected', value: disconnectedCount, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', pulse: disconnectedCount > 0 },
        { label: 'Total Services', value: integrations.length, icon: Link2, color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/20' },
    ];

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link2 className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Infrastructure</span>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white">Integrations Center</h1>
                    <p className="text-sm text-slate-400 mt-1">Monitor and manage all connected services and APIs.</p>
                </div>
            </div>

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

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setCategoryFilter(c)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border flex-shrink-0 transition-all ${categoryFilter === c ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' : 'bg-[#111827] text-slate-400 border-[#1E2D4580] hover:text-white'}`}>
                        {c}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((intg, i) => (
                    <motion.div key={intg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <IntegrationCard intg={intg} onToggle={handleToggle} isReconnecting={reconnecting === intg.id} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
