import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, GitBranch, HeartPulse, Building2, BadgeCheck,
    Bell, Users, Shield, Activity, FileText, BarChart3,
    CheckCircle, Zap, Lock, Clock, ArrowRight, Eye,
    MessageSquare, Download, ShieldCheck, AlertTriangle,
    Server, Link2, Search
} from 'lucide-react';

/* ── Portal tabs ── */
const PORTALS = [
    {
        key: 'patient',
        label: 'Patient Portal',
        color: '#00C8D4',
        gradient: 'from-[#00C8D4]/20 to-transparent',
        features: [
            { icon: Brain, label: 'AI Medical Summary', desc: 'Instant AI-powered clinical insights from your reports' },
            { icon: GitBranch, label: 'Smart Timeline', desc: 'Visual blockchain audit trail of your health history' },
            { icon: HeartPulse, label: 'Health Analytics', desc: 'BP, sugar, cholesterol trends with Recharts' },
            { icon: Building2, label: 'Hospital Simulation', desc: 'Cross-hospital FHIR record transfer demo' },
            { icon: BadgeCheck, label: 'ABHA / ABDM Flow', desc: 'National health ID consent workflow' },
            { icon: Bell, label: 'Notifications Center', desc: 'Real-time alerts with priority filtering' },
        ],
        stats: [
            { label: 'Records', value: '128', color: '#00C8D4' },
            { label: 'AI Summaries', value: '14', color: '#8B5CF6' },
            { label: 'Compliance', value: '98%', color: '#10B981' },
        ],
        events: [
            { text: 'AI summary generated for Blood Panel', time: '2m', icon: Brain, color: '#8B5CF6' },
            { text: 'Dr. Sarah accessed ECG record', time: '8m', icon: Eye, color: '#00C8D4' },
            { text: 'OTP verified — session started', time: '15m', icon: CheckCircle, color: '#10B981' },
        ],
    },
    {
        key: 'doctor',
        label: 'Doctor Portal',
        color: '#8B5CF6',
        gradient: 'from-purple-500/20 to-transparent',
        features: [
            { icon: Brain, label: 'AI Summary View', desc: 'Doctor-grade clinical AI summaries for patients' },
            { icon: MessageSquare, label: 'Team Workspace', desc: 'Shared patient cases and handoff discussions' },
            { icon: Download, label: 'Reports & Export', desc: 'Audit-ready PDF/CSV exports for compliance' },
            { icon: ShieldCheck, label: 'Security & Settings', desc: '2FA, sessions, privacy controls' },
            { icon: Shield, label: 'Compliance', desc: 'HIPAA score and compliance check dashboard' },
            { icon: AlertTriangle, label: 'Emergency Access', desc: 'Break-glass override with full audit trail' },
        ],
        stats: [
            { label: 'Patients', value: '47', color: '#8B5CF6' },
            { label: 'Access Req.', value: '6', color: '#F59E0B' },
            { label: 'Team Cases', value: '3', color: '#10B981' },
        ],
        events: [
            { text: 'Access request from Dr. Singh approved', time: '1m', icon: CheckCircle, color: '#10B981' },
            { text: 'Team workspace note added to Case C1', time: '5m', icon: MessageSquare, color: '#8B5CF6' },
            { text: 'Compliance score updated to 98%', time: '1h', icon: ShieldCheck, color: '#00C8D4' },
        ],
    },
    {
        key: 'clinical',
        label: 'Clinical Staff',
        color: '#F59E0B',
        gradient: 'from-amber-500/20 to-transparent',
        features: [
            { icon: Bell, label: 'Clinical Notifications', desc: 'Prioritized alert stream for clinical events' },
            { icon: MessageSquare, label: 'Team Workspace', desc: 'Patient case board with discussion threads' },
            { icon: Download, label: 'Reports & Export', desc: 'Consent, audit, and analytics reports' },
            { icon: ShieldCheck, label: 'Compliance Dashboard', desc: 'Real-time HIPAA posture monitoring' },
            { icon: FileText, label: 'Patient Records', desc: 'FHIR-based record viewer with consent gating' },
            { icon: Activity, label: 'Audit Trail', desc: 'Blockchain-linked clinical audit logs' },
        ],
        stats: [
            { label: 'Active Cases', value: '9', color: '#F59E0B' },
            { label: 'Notifications', value: '3', color: '#EF4444' },
            { label: 'Records', value: '214', color: '#00C8D4' },
        ],
        events: [
            { text: 'Emergency override — ICU Bay 3', time: 'Now', icon: Zap, color: '#EF4444' },
            { text: 'Handoff ready for patient PX-0987', time: '4m', icon: AlertTriangle, color: '#F59E0B' },
            { text: 'Consent artifact CA-7F4A91BC created', time: '20m', icon: Lock, color: '#10B981' },
        ],
    },
    {
        key: 'admin',
        label: 'Admin Console',
        color: '#10B981',
        gradient: 'from-emerald-500/20 to-transparent',
        features: [
            { icon: Users, label: 'User Management', desc: 'Role-based IAM for all platform users' },
            { icon: AlertTriangle, label: 'Incident Management', desc: 'SOC-style security incident tracker' },
            { icon: Link2, label: 'Integrations Center', desc: 'Firebase, IPFS, Blockchain, AI connectors' },
            { icon: Server, label: 'System Health', desc: 'Service uptime, latency, error rate monitoring' },
            { icon: Search, label: 'Audit Explorer', desc: 'Forensic hash-verified audit investigation' },
            { icon: Shield, label: 'Compliance Monitor', desc: 'Enterprise-grade HIPAA compliance scoring' },
        ],
        stats: [
            { label: 'Total Users', value: '2,841', color: '#10B981' },
            { label: 'Uptime', value: '99.99%', color: '#00C8D4' },
            { label: 'Incidents', value: '2', color: '#EF4444' },
        ],
        events: [
            { text: 'Blockchain RPC degraded — APAC node', time: '2m', icon: AlertTriangle, color: '#F59E0B' },
            { text: 'User Dr. Arun suspended by admin', time: '15m', icon: Lock, color: '#EF4444' },
            { text: 'System health refresh — all nominal', time: '1h', icon: CheckCircle, color: '#10B981' },
        ],
    },
];

function StatBar({ label, value, color }) {
    return (
        <div className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-0">
            <span className="text-[11px] text-[#8899AA] font-mono">{label}</span>
            <span className="text-sm font-bold font-mono" style={{ color }}>{value}</span>
        </div>
    );
}

function EventRow({ event, delay }) {
    const Icon = event.icon;
    return (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
            className="flex items-center gap-2.5 py-2 border-b border-white/5 last:border-0">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${event.color}20` }}>
                <Icon className="w-3 h-3" style={{ color: event.color }} />
            </div>
            <p className="text-[11px] text-[#CBD5E1] flex-1 leading-snug truncate">{event.text}</p>
            <span className="text-[10px] font-mono text-[#4A5568] flex-shrink-0">{event.time}</span>
        </motion.div>
    );
}

function FeatureChip({ feature, delay, accentColor }) {
    const Icon = feature.icon;
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
            className="group flex items-start gap-2.5 p-3 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-default">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${accentColor}20`, border: `1px solid ${accentColor}40` }}>
                <Icon className="w-3.5 h-3.5" style={{ color: accentColor }} />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-bold text-white leading-tight">{feature.label}</p>
                <p className="text-[10px] text-[#4A5568] mt-0.5 leading-snug">{feature.desc}</p>
            </div>
        </motion.div>
    );
}

export default function DashboardPreview() {
    const [activePortal, setActivePortal] = useState(0);
    const [autoplay, setAutoplay] = useState(true);
    const portal = PORTALS[activePortal];

    useEffect(() => {
        if (!autoplay) return;
        const t = setInterval(() => setActivePortal(p => (p + 1) % PORTALS.length), 4000);
        return () => clearInterval(t);
    }, [autoplay]);

    return (
        <section className="py-24 relative overflow-hidden" id="platform">
            {/* Background glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-10"
                    style={{ background: `radial-gradient(circle, ${portal.color}, transparent)` }} />
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00C8D4]/10 border border-[#00C8D4]/20 mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C8D4] animate-pulse" />
                        <span className="text-[11px] text-[#00C8D4] font-bold uppercase tracking-widest">Interactive Platform Demo</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 font-display">
                        4 Portals. <span style={{ color: portal.color }}>One Platform.</span>
                    </h2>
                    <p className="text-lg text-[#8899AA] max-w-2xl mx-auto">
                        HealthChain delivers role-specific dashboards for every stakeholder — patients, doctors, clinical staff, and admins.
                    </p>
                </div>

                {/* Portal Tabs */}
                <div className="flex items-center gap-2 justify-center mb-8 flex-wrap">
                    {PORTALS.map((p, i) => (
                        <button key={p.key}
                            onClick={() => { setActivePortal(i); setAutoplay(false); }}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-300"
                            style={{
                                backgroundColor: activePortal === i ? `${p.color}20` : 'transparent',
                                borderColor: activePortal === i ? `${p.color}50` : 'rgba(30,45,69,0.5)',
                                color: activePortal === i ? p.color : '#8899AA',
                            }}>
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Main Preview */}
                <AnimatePresence mode="wait">
                    <motion.div key={portal.key}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.35 }}
                        className="bg-[#0D1117] border rounded-3xl overflow-hidden shadow-2xl"
                        style={{ borderColor: `${portal.color}30` }}>

                        {/* Mock browser bar */}
                        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] bg-[#070B10]">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/40" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/40" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
                            </div>
                            <div className="flex-1 mx-4">
                                <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1 text-[11px] font-mono text-[#4A5568] max-w-xs mx-auto text-center">
                                    healthcare-ac5a3.web.app/dashboard/{portal.key}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: portal.color }}>
                                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: portal.color }} />
                                Live
                            </div>
                        </div>

                        {/* Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.05]">

                            {/* Left — Features */}
                            <div className="p-5 space-y-2">
                                <p className="text-[10px] text-[#4A5568] font-bold uppercase tracking-widest mb-4">
                                    {portal.label} Features
                                </p>
                                {portal.features.map((f, i) => (
                                    <FeatureChip key={f.label} feature={f} delay={i * 0.05} accentColor={portal.color} />
                                ))}
                            </div>

                            {/* Center — Stats */}
                            <div className="p-5">
                                <p className="text-[10px] text-[#4A5568] font-bold uppercase tracking-widest mb-4">
                                    Live Metrics
                                </p>
                                {/* Stat bars */}
                                <div className="bg-[#111827] rounded-2xl border border-white/[0.05] p-4 mb-4">
                                    {portal.stats.map((s, i) => (
                                        <StatBar key={s.label} {...s} />
                                    ))}
                                </div>
                                {/* Uptime ring */}
                                <div className="bg-[#111827] rounded-2xl border border-white/[0.05] p-5 flex flex-col items-center justify-center gap-3">
                                    <div className="relative w-24 h-24">
                                        <svg className="-rotate-90 w-full h-full" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="#1E2D45" strokeWidth="8" />
                                            <motion.circle cx="50" cy="50" r="40" fill="none"
                                                stroke={portal.color} strokeWidth="8" strokeLinecap="round"
                                                strokeDasharray="251.2"
                                                initial={{ strokeDashoffset: 251.2 }}
                                                animate={{ strokeDashoffset: 251.2 * 0.02 }}
                                                transition={{ duration: 1.2, ease: 'easeOut' }}
                                                style={{ filter: `drop-shadow(0 0 6px ${portal.color}60)` }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <p className="text-xl font-bold text-white font-display">99%</p>
                                            <p className="text-[9px] text-[#4A5568] font-mono">Uptime</p>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-[#8899AA] text-center">Platform infrastructure healthy</p>
                                </div>
                            </div>

                            {/* Right — Event feed */}
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: portal.color }} />
                                    <p className="text-[10px] text-[#4A5568] font-bold uppercase tracking-widest">
                                        Recent Events
                                    </p>
                                </div>
                                <div className="bg-[#111827] rounded-2xl border border-white/[0.05] p-4 mb-4">
                                    {portal.events.map((e, i) => (
                                        <EventRow key={i} event={e} delay={i * 0.08} />
                                    ))}
                                </div>

                                {/* Role badge */}
                                <div className="rounded-xl border p-4 flex items-center gap-3"
                                    style={{ borderColor: `${portal.color}30`, backgroundColor: `${portal.color}08` }}>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: `${portal.color}20` }}>
                                        <Shield className="w-5 h-5" style={{ color: portal.color }} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white">{portal.label}</p>
                                        <p className="text-[10px]" style={{ color: portal.color }}>
                                            Role-based secure access
                                        </p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 ml-auto" style={{ color: portal.color }} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Bottom progress indicators */}
                <div className="flex justify-center gap-2 mt-6">
                    {PORTALS.map((p, i) => (
                        <button key={p.key} onClick={() => { setActivePortal(i); setAutoplay(false); }}
                            className="h-1 rounded-full transition-all duration-500"
                            style={{
                                width: activePortal === i ? '32px' : '8px',
                                backgroundColor: activePortal === i ? p.color : '#1E2D45',
                            }} />
                    ))}
                </div>
            </div>
        </section>
    );
}
