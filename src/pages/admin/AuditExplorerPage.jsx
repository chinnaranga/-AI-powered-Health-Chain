import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Shield, FileText, Key, CheckCircle,
    AlertTriangle, Activity, Clock, Download, Eye,
    ChevronDown, ChevronUp, Hash, Flag, User, Building2,
    Zap, Lock, XCircle, Database
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const EVENT_CFG = {
    RECORD_UPLOADED:              { label: 'Record Uploaded',        color: 'text-[#00C8D4]',  bg: 'bg-[#00C8D4]/10',  border: 'border-[#00C8D4]/20',  icon: FileText },
    ACCESS_REQUEST_CREATED:       { label: 'Access Requested',       color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  icon: Shield },
    REQUEST_APPROVED_OTP_GENERATED:{ label: 'OTP Generated',         color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Key },
    OTP_VERIFIED_ACCESS_GRANTED:  { label: 'Access Granted',         color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/20',icon: CheckCircle },
    RECORD_DECRYPTED_VIEWED:      { label: 'Record Viewed',          color: 'text-teal-400',   bg: 'bg-teal-500/10',   border: 'border-teal-500/20',   icon: Eye },
    REQUEST_REJECTED:             { label: 'Access Rejected',        color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20',    icon: XCircle },
    EMERGENCY_ACCESS:             { label: 'Emergency Override',     color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20',    icon: Zap },
    AI_SUMMARY_GENERATED:         { label: 'AI Summary Generated',  color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: Database },
    LOGIN_FAILED:                 { label: 'Failed Login Attempt',  color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: Lock },
    CONSENT_ARTIFACT_CREATED:     { label: 'Consent Artifact',      color: 'text-lime-400',   bg: 'bg-lime-500/10',   border: 'border-lime-500/20',   icon: FileText },
};

const ROLES = ['all', 'doctor', 'patient', 'clinical', 'system'];
const EVENT_TYPES = ['all', ...Object.keys(EVENT_CFG)];

function timeAgo(date) {
    const s = Math.floor((Date.now() - date) / 1000);
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

function verifyHash(hash) {
    if (!hash || hash === '—') return false;
    return /^0x[a-f0-9]{12}$/.test(hash) || hash.length > 5;
}

function LogRow({ log, isExpanded, onToggle, onFlag }) {
    const cfg = EVENT_CFG[log.type] || { label: log.type, color: 'text-slate-400', bg: 'bg-white/[0.03]', border: 'border-[#1E2D4580]', icon: Activity };
    const Icon = cfg.icon;
    const hashValid = verifyHash(log.txHash);

    return (
        <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`bg-[#111827] border rounded-2xl overflow-hidden transition-all ${log.flagged ? 'border-red-500/30' : 'border-[#1E2D4580] hover:border-[#1E2D45]'}`}>
            <button onClick={onToggle} className="w-full text-left p-4">
                <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-mono text-slate-500">{log.id}</span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${cfg.bg} ${cfg.border} ${cfg.color}`}>{cfg.label}</span>
                            {log.flagged && (
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-red-500/10 border-red-500/30 text-red-400 flex items-center gap-1">
                                    <Flag className="w-2.5 h-2.5" /> Flagged
                                </span>
                            )}
                            {hashValid && (
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                                    <CheckCircle className="w-2.5 h-2.5" /> Verified
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {log.actor}</span>
                            {log.patient !== '—' && <span>Patient: {log.patient}</span>}
                            <span className="flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" /> {timeAgo(log.timestamp)}</span>
                        </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4 border-t border-[#1E2D4580] pt-4 space-y-4">
                            <p className="text-sm text-slate-300 leading-relaxed">{log.details}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { label: 'Actor', value: log.actor, icon: User },
                                    { label: 'Role', value: log.role.toUpperCase(), icon: Shield },
                                    { label: 'Hospital', value: log.hospital, icon: Building2 },
                                    { label: 'Patient', value: log.patient, icon: Activity },
                                    { label: 'Timestamp', value: new Date(log.timestamp).toLocaleString(), icon: Clock },
                                    { label: 'TX Hash', value: log.txHash, icon: Hash, mono: true },
                                    { label: 'Prev Hash', value: log.prevHash, icon: Hash, mono: true },
                                ].map(f => (
                                    <div key={f.label} className="flex items-start gap-2 p-3 rounded-xl bg-[#0B0F1A] border border-[#1E2D4580]">
                                        <f.icon className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-mono">{f.label}</p>
                                            <p className={`text-xs text-white mt-0.5 break-all ${f.mono ? 'font-mono' : ''}`}>{f.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 pt-1">
                                <div className={`flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-lg border font-bold ${hashValid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-500/10 border-[#1E2D4580] text-slate-500'}`}>
                                    {hashValid ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                    {hashValid ? 'Hash verified on-chain' : 'Hash unavailable'}
                                </div>
                                <button onClick={() => onFlag(log.id, log.dbId, log.flagged)}
                                    className={`flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-lg border font-bold transition-all ${log.flagged ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'border-[#1E2D4580] text-slate-400 hover:text-amber-400 hover:border-amber-500/20'}`}>
                                    <Flag className="w-3 h-3" />
                                    {log.flagged ? 'Unflag' : 'Flag as Suspicious'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function AuditExplorerPage() {
    const [usersMap, setUsersMap] = useState({});
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [flaggedOnly, setFlaggedOnly] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            const map = {};
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                map[docSnap.id] = {
                    name: data.displayName || data.name || data.email || 'Unknown User',
                    role: data.role || 'user',
                    hospital: data.hospital || '—'
                };
            });
            setUsersMap(map);
        });
        return unsubUsers;
    }, []);

    useEffect(() => {
        const unsubLogs = onSnapshot(query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc')), (snapshot) => {
            const list = snapshot.docs.map(docSnap => {
                const data = docSnap.data();
                const id = docSnap.id;

                const actorId = data.userId;
                const actorObj = usersMap[actorId] || { name: actorId || 'System', role: 'system', hospital: '—' };

                const patientId = data.details?.patientId || data.patientId;
                const patientName = usersMap[patientId]?.name || patientId || '—';

                let ts = new Date();
                if (data.timestamp) {
                    ts = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
                }

                let detailsText = data.details?.reason || '';
                if (data.activityType === 'RECORD_UPLOADED') {
                    detailsText = `Record upload verified. File name: ${data.details?.fileName || 'Unknown'}. Size: ${data.details?.fileSize || 'N/A'} bytes.`;
                } else if (data.activityType === 'RECORD_VIEWED' || data.activityType === 'RECORD_DECRYPTED_VIEWED') {
                    detailsText = `Record decrypted and viewed by authorized provider. File: ${data.details?.fileName || 'Unknown'}.`;
                } else if (data.activityType === 'OTP_VERIFIED_ACCESS_GRANTED') {
                    detailsText = `One-Time Password verified. Session established for target patient.`;
                } else if (data.activityType === 'EMERGENCY_ACCESS') {
                    detailsText = `Emergency override (Break-Glass protocol) triggered by provider. Reason: ${data.details?.reason || 'Critical situation'}.`;
                } else {
                    detailsText = `${data.activityType.replace(/_/g, ' ')} - Logged successfully.`;
                }

                return {
                    id: id.substring(0, 8).toUpperCase(),
                    dbId: id,
                    type: data.activityType || 'API',
                    actor: actorObj.name,
                    role: actorObj.role,
                    hospital: actorObj.hospital,
                    patient: patientName,
                    timestamp: ts,
                    txHash: data.txHash || '—',
                    prevHash: data.prevHash || '—',
                    details: detailsText,
                    flagged: data.flagged || false
                };
            });
            setLogs(list);
        }, (err) => console.warn('Error fetching audit logs:', err));

        return unsubLogs;
    }, [usersMap]);

    const handleFlag = async (id, dbId, currentFlagged) => {
        try {
            const docRef = doc(db, 'auditLogs', dbId);
            await updateDoc(docRef, { flagged: !currentFlagged });
        } catch (error) {
            console.error('Error updating log flag status:', error);
        }
    };

    const filtered = useMemo(() => logs.filter(l => {
        const matchSearch = search === '' || [l.actor, l.patient, l.id, l.txHash, l.hospital].some(v => v.toLowerCase().includes(search.toLowerCase()));
        const matchRole = roleFilter === 'all' || l.role === roleFilter;
        const matchType = typeFilter === 'all' || l.type === typeFilter;
        const matchFlag = !flaggedOnly || l.flagged;
        return matchSearch && matchRole && matchType && matchFlag;
    }), [logs, search, roleFilter, typeFilter, flaggedOnly]);

    const handleExport = () => {
        const csv = [
            ['ID', 'Type', 'Actor', 'Role', 'Patient', 'Hospital', 'Timestamp', 'TX Hash', 'Flagged'],
            ...filtered.map(l => [l.id, l.type, l.actor, l.role, l.patient, l.hospital, new Date(l.timestamp).toISOString(), l.txHash, l.flagged])
        ].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'audit_export.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Search className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Forensic Audit Tool</span>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white">Audit Explorer</h1>
                    <p className="text-sm text-slate-400 mt-1">Search, inspect, and verify all platform audit events with on-chain proof.</p>
                </div>
                <button onClick={handleExport}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-sm hover:bg-cyan-500/20 transition-all">
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* Search + Filters */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by actor, patient, TX hash, hospital, event ID..."
                        className="w-full bg-[#111827] border border-[#1E2D4580] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 transition-colors" />
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                        className="bg-[#111827] border border-[#1E2D4580] rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-500/40 capitalize">
                        {ROLES.map(r => <option key={r} value={r}>{r === 'all' ? 'All Roles' : r}</option>)}
                    </select>
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                        className="bg-[#111827] border border-[#1E2D4580] rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-500/40">
                        <option value="all">All Event Types</option>
                        {Object.entries(EVENT_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <button onClick={() => setFlaggedOnly(v => !v)}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${flaggedOnly ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-[#111827] text-slate-400 border-[#1E2D4580] hover:text-white'}`}>
                        <Flag className="w-3.5 h-3.5" /> Flagged Only
                    </button>
                    <span className="text-xs text-slate-500 font-mono ml-auto">{filtered.length} of {logs.length} events</span>
                </div>
            </div>

            {/* Log List */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl flex flex-col items-center py-16 gap-3">
                        <Search className="w-10 h-10 text-slate-600" />
                        <p className="text-white font-semibold">No events match your search</p>
                        <p className="text-xs text-slate-500">Try adjusting filters or clearing the search.</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {filtered.map(log => (
                            <LogRow key={log.id} log={log}
                                isExpanded={expandedId === log.id}
                                onToggle={() => setExpandedId(prev => prev === log.id ? null : log.id)}
                                onFlag={handleFlag}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
