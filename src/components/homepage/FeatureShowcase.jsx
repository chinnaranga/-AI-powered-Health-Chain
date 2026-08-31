import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, GitBranch, HeartPulse, Building2, BadgeCheck, Bell,
    Users, AlertTriangle, Link2, Server, Search, Shield,
    MessageSquare, Download, ShieldCheck, CheckCircle, ArrowRight,
    Sparkles
} from 'lucide-react';

const ALL_FEATURES = [
    /* Patient */
    { icon: Brain, label: 'AI Medical Summary', desc: 'Generate AI-powered clinical insights from uploaded reports. Extract diseases, medications, allergies, and risk indicators instantly.', role: 'Patient', color: '#8B5CF6', border: 'border-purple-500/30', bg: 'bg-purple-500/10', glow: 'shadow-[0_0_30px_rgba(139,92,246,0.1)]' },
    { icon: GitBranch, label: 'Smart Timeline', desc: 'Visual blockchain audit trail of your entire health history — immutable, chronological, and role-filtered.', role: 'Patient', color: '#00C8D4', border: 'border-[#00C8D4]/30', bg: 'bg-[#00C8D4]/10', glow: '' },
    { icon: HeartPulse, label: 'Health Analytics', desc: 'Track BP, blood sugar, cholesterol, and medication adherence with beautiful Recharts visualizations.', role: 'Patient', color: '#EF4444', border: 'border-red-500/30', bg: 'bg-red-500/10', glow: '' },
    { icon: Building2, label: 'Hospital Simulation', desc: 'Interactive 5-step FHIR cross-hospital record transfer demo with consent artifacts and emergency procedures.', role: 'Patient', color: '#F59E0B', border: 'border-amber-500/30', bg: 'bg-amber-500/10', glow: '' },
    { icon: BadgeCheck, label: 'ABHA / ABDM Flow', desc: 'National health ID 6-step identity verification and digital consent workflow per ABDM standards.', role: 'Patient', color: '#10B981', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', glow: '' },
    { icon: Bell, label: 'Notifications Center', desc: 'Real-time priority alerts — access requests, OTP events, AI summaries, emergency overrides, and audit events.', role: 'Patient', color: '#00C8D4', border: 'border-[#00C8D4]/30', bg: 'bg-[#00C8D4]/10', glow: '' },
    /* Doctor */
    { icon: MessageSquare, label: 'Team Workspace', desc: 'Shared patient cases with discussion threads, task checklists, handoff workflow, and department collaboration.', role: 'Doctor', color: '#8B5CF6', border: 'border-purple-500/30', bg: 'bg-purple-500/10', glow: '' },
    { icon: Download, label: 'Reports & Export', desc: 'Generate PDF and CSV reports for patient records, audit logs, consent history, and analytics summaries.', role: 'Doctor', color: '#00C8D4', border: 'border-[#00C8D4]/30', bg: 'bg-[#00C8D4]/10', glow: '' },
    { icon: ShieldCheck, label: 'Security & Settings', desc: '5-tab settings hub: profile, password change, 2FA, session management, and privacy controls.', role: 'Doctor', color: '#10B981', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', glow: '' },
    /* Clinical */
    { icon: Bell, label: 'Clinical Notifications', desc: 'Hospital-grade real-time alert stream with 7 categories, priority banding, and critical alert banners.', role: 'Clinical', color: '#F59E0B', border: 'border-amber-500/30', bg: 'bg-amber-500/10', glow: '' },
    { icon: Shield, label: 'Compliance Dashboard', desc: 'HIPAA score dial, 7 expandable compliance checks, trend charts, and exportable compliance summaries.', role: 'Clinical', color: '#10B981', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', glow: '' },
    /* Admin */
    { icon: Users, label: 'User Management', desc: 'Full IAM: role-based user table, invite flow, suspend/reactivate, department affiliation, and status badges.', role: 'Admin', color: '#00C8D4', border: 'border-[#00C8D4]/30', bg: 'bg-[#00C8D4]/10', glow: '' },
    { icon: AlertTriangle, label: 'Incident Management', desc: 'SOC-style severity-banded incident cards with status transitions, escalation badges, and response workflow.', role: 'Admin', color: '#EF4444', border: 'border-red-500/30', bg: 'bg-red-500/10', glow: '' },
    { icon: Link2, label: 'Integrations Center', desc: '8 service connectors: Firebase, IPFS, Blockchain RPC, AI Engine, ABHA, and hospital FHIR systems.', role: 'Admin', color: '#8B5CF6', border: 'border-purple-500/30', bg: 'bg-purple-500/10', glow: '' },
    { icon: Server, label: 'System Health', desc: 'Per-service latency sparklines, 7-day uptime chart, error rate tracking, and one-click refresh.', role: 'Admin', color: '#10B981', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', glow: '' },
    { icon: Search, label: 'Audit Explorer', desc: 'Forensic full-text search with hash-chain verification, flag-suspicious action, and CSV evidence export.', role: 'Admin', color: '#F59E0B', border: 'border-amber-500/30', bg: 'bg-amber-500/10', glow: '' },
];

const ROLES = ['All', 'Patient', 'Doctor', 'Clinical', 'Admin'];
const ROLE_COLORS = { All: '#00C8D4', Patient: '#00C8D4', Doctor: '#8B5CF6', Clinical: '#F59E0B', Admin: '#10B981' };

function FeatureCard({ feature, index }) {
    const Icon = feature.icon;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.04 }}
            layout
            className={`group relative bg-[#0D1117] border ${feature.border} rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300 cursor-default ${feature.glow}`}>
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `radial-gradient(ellipse at top left, ${feature.color}08, transparent 60%)` }} />
            <div className="flex items-start gap-4 relative z-10">
                <div className={`w-11 h-11 rounded-xl ${feature.bg} border ${feature.border} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" style={{ color: feature.color }} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-white">{feature.label}</h3>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                            style={{ color: ROLE_COLORS[feature.role], borderColor: `${ROLE_COLORS[feature.role]}40`, backgroundColor: `${ROLE_COLORS[feature.role]}10` }}>
                            {feature.role}
                        </span>
                    </div>
                    <p className="text-xs text-[#8899AA] leading-relaxed">{feature.desc}</p>
                </div>
            </div>
        </motion.div>
    );
}

export default function FeatureShowcase() {
    const [activeRole, setActiveRole] = useState('All');

    const filtered = activeRole === 'All'
        ? ALL_FEATURES
        : ALL_FEATURES.filter(f => f.role === activeRole);

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(rgba(0,200,212,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-14">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00C8D4]/10 border border-[#00C8D4]/20 mb-4">
                        <Sparkles className="w-3.5 h-3.5 text-[#00C8D4]" />
                        <span className="text-[11px] text-[#00C8D4] font-bold uppercase tracking-widest">16 Premium Features</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 font-display leading-tight">
                        Everything Your Healthcare<br />
                        <span className="text-[#00C8D4]">Network Needs</span>
                    </h2>
                    <p className="text-lg text-[#8899AA] max-w-2xl mx-auto">
                        From AI-powered clinical summaries to forensic audit exploration — every feature built to healthcare enterprise standards.
                    </p>
                </div>

                {/* Role Filter */}
                <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
                    {ROLES.map(role => (
                        <button key={role} onClick={() => setActiveRole(role)}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200"
                            style={{
                                backgroundColor: activeRole === role ? `${ROLE_COLORS[role]}20` : 'transparent',
                                borderColor: activeRole === role ? `${ROLE_COLORS[role]}50` : 'rgba(30,45,69,0.8)',
                                color: activeRole === role ? ROLE_COLORS[role] : '#8899AA',
                            }}>
                            {role}
                            <span className="ml-2 text-[10px] opacity-60">
                                {role === 'All' ? ALL_FEATURES.length : ALL_FEATURES.filter(f => f.role === role).length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Feature Grid */}
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((f, i) => (
                            <FeatureCard key={f.label} feature={f} index={i} />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Bottom stats strip */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Pages Built', value: '24+', color: '#00C8D4' },
                        { label: 'User Roles', value: '4', color: '#8B5CF6' },
                        { label: 'Firebase Routes', value: '49', color: '#10B981' },
                        { label: 'Compliance Score', value: '98%', color: '#F59E0B' },
                    ].map(s => (
                        <div key={s.label} className="bg-[#0D1117] border border-[#1E2D4580] rounded-2xl p-5 text-center">
                            <p className="text-3xl font-display font-bold" style={{ color: s.color }}>{s.value}</p>
                            <p className="text-[11px] text-[#8899AA] font-mono mt-1 uppercase tracking-wider">{s.label}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
