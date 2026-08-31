import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Database, Search, Calendar, ShieldCheck, ShieldAlert,
    Copy, Eye, Zap, Lock, Unlock, Download, AlertTriangle, Activity
} from 'lucide-react';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { toast } from '../../components/Toast';

const actionTypes = ['All', 'Upload', 'Decryption', 'OTP Request', 'Access Granted', 'Access Denied'];

export default function ClinicalLogsPage() {
    const { logs, isLoading } = useAuditLogs();
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [copied, setCopied] = useState('');

    const getFriendlyAction = (activityType) => {
        switch (activityType) {
            case 'RECORD_UPLOADED': return 'Medical Record Uploaded';
            case 'RECORD_DECRYPTED_VIEWED': return 'Record Decrypted & Viewed';
            case 'ACCESS_REQUEST_CREATED': return 'Access Request Initiated';
            case 'REQUEST_APPROVED_OTP_GENERATED': return 'OTP Code Generated';
            case 'OTP_VERIFIED_ACCESS_GRANTED': return 'OTP Verified & Access Granted';
            case 'REQUEST_REJECTED': return 'Access Request Rejected';
            default: return activityType ? activityType.replace(/_/g, ' ') : 'Diagnostic Log';
        }
    };

    const getLogCategory = (activityType) => {
        switch (activityType) {
            case 'RECORD_UPLOADED': return 'Upload';
            case 'RECORD_DECRYPTED_VIEWED': return 'Decryption';
            case 'ACCESS_REQUEST_CREATED':
            case 'REQUEST_APPROVED_OTP_GENERATED':
                return 'OTP Request';
            case 'OTP_VERIFIED_ACCESS_GRANTED': return 'Access Granted';
            case 'REQUEST_REJECTED': return 'Access Denied';
            default: return 'System';
        }
    };

    const iconForCategory = (cat) => {
        if (cat === 'Decryption') return { icon: Eye, cls: 'text-blue-400' };
        if (cat === 'OTP Request') return { icon: Lock, cls: 'text-purple-400' };
        if (cat === 'Access Granted') return { icon: ShieldCheck, cls: 'text-emerald-400' };
        if (cat === 'Access Denied') return { icon: ShieldAlert, cls: 'text-red-400' };
        if (cat === 'Upload') return { icon: Zap, cls: 'text-[#00C8D4]' };
        return { icon: Activity, cls: 'text-[#8899AA]' };
    };

    // Parse the live log collection into table-ready items
    const parsedLogs = logs.map(log => {
        const dateObj = new Date(log.timestamp);
        const category = getLogCategory(log.activityType);
        return {
            id: log.id,
            timestamp: `${dateObj.toISOString().replace('T', ' ').substring(0, 23)}Z`,
            action: getFriendlyAction(log.activityType),
            type: category,
            actor: log.actorName || 'System Node',
            patient: log.patientName || 'System Node',
            txHash: log.txHash || '0x0000000000000000000000000000000000000000',
            status: category === 'Access Denied' ? 'Failed' : 'Success',
            reqId: log.details?.requestId ? log.details.requestId.slice(0, 8) : log.id.slice(0, 8),
        };
    });

    const filtered = parsedLogs.filter(l =>
        (filterType === 'All' || l.type === filterType) &&
        (l.patient.toLowerCase().includes(search.toLowerCase()) ||
            l.actor.toLowerCase().includes(search.toLowerCase()) ||
            l.txHash.toLowerCase().includes(search.toLowerCase()) ||
            l.reqId.toLowerCase().includes(search.toLowerCase()) ||
            l.action.toLowerCase().includes(search.toLowerCase()))
    );

    const handleCopy = (hash) => {
        navigator.clipboard.writeText(hash);
        setCopied(hash);
        toast.success('TxHash copied to clipboard');
        setTimeout(() => setCopied(''), 2000);
    };

    return (
        <div className="max-w-7xl mx-auto pb-12 flex flex-col h-[calc(100vh-120px)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Database className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Immutable Ledger</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Clinical Audit Trail</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Cryptographic log of every access request, approval, and record interaction.</p>
                </div>
                <button className="px-4 py-2.5 rounded-xl bg-[#1A2236] border border-[#1E2D4580] text-sm text-white font-semibold flex items-center gap-2 hover:bg-[#1E2D45] transition-all">
                    <Download className="w-4 h-4 text-[#8899AA]" /> Export Compliance Report
                </button>
            </div>

            {/* Main Table Card */}
            <div className="flex flex-col flex-1 min-h-0 rounded-2xl bg-[#111827] border border-[#1E2D4580] overflow-hidden">
                {/* Filter Bar */}
                <div className="p-4 border-b border-[#1E2D4580] bg-[#1A2236]/50 flex flex-col sm:flex-row gap-3 flex-shrink-0">
                    <div className="flex bg-[#111827] border border-[#1E2D4580] rounded-xl p-1 overflow-x-auto gap-1">
                        {actionTypes.map(t => (
                            <button key={t} onClick={() => setFilterType(t)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                                    filterType === t
                                        ? 'bg-[#00C8D4]/15 text-[#00C8D4] border border-[#00C8D4]/30'
                                        : 'text-[#8899AA] hover:text-white border border-transparent'
                                }`}>{t}</button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]" />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search hash, patient, actor..."
                                className="w-full bg-[#111827] border border-[#1E2D4580] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00C8D4]/50 font-mono transition-all" />
                        </div>
                        <button className="p-2 rounded-xl bg-[#111827] border border-[#1E2D4580] text-[#8899AA] hover:text-white transition-all">
                            <Calendar className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#1A2236] sticky top-0 z-10">
                            <tr>
                                {['Timestamp (UTC)', 'Actor', 'Action', 'Patient', 'Blockchain TxHash', 'Status'].map(h => (
                                    <th key={h} className="px-5 py-4 text-[11px] text-[#8899AA] font-bold uppercase tracking-wider border-b border-[#1E2D4580] whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="font-mono text-xs">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center font-sans">
                                        <Activity className="w-10 h-10 text-[#00C8D4] animate-spin mx-auto mb-3" />
                                        <p className="text-[#8899AA]">Synchronizing compliance trail...</p>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="p-12 text-center font-sans text-[#8899AA]">No audit events match criteria.</td></tr>
                            ) : filtered.map((log, i) => {
                                const category = log.type;
                                const { icon: Icon, cls } = iconForCategory(category);
                                return (
                                    <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.02, 0.4) }}
                                        className="border-b border-[#1E2D4580] last:border-0 hover:bg-[#1A2236]/50 transition-colors">
                                        <td className="px-5 py-3.5 text-[#8899AA] whitespace-nowrap">{log.timestamp}</td>
                                        <td className="px-5 py-3.5 font-sans text-white font-medium">{log.actor}</td>
                                        <td className="px-5 py-3.5 font-sans">
                                            <span className="flex items-center gap-2">
                                                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${cls}`} />
                                                <span className="text-[#E2E8F0]">{log.action}</span>
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 font-sans text-white">{log.patient}</td>
                                        <td className="px-5 py-3.5">
                                            <button onClick={() => handleCopy(log.txHash)}
                                                className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#0B0F1A] border border-[#1E2D4580] hover:border-[#00C8D4]/50 group transition-colors"
                                                title="Click to copy">
                                                <span className="text-[#00C8D4] group-hover:text-white transition-colors">
                                                    {log.txHash.substring(0, 10)}…{log.txHash.slice(-6)}
                                                </span>
                                                <Copy className={`w-3 h-3 ${copied === log.txHash ? 'text-emerald-400' : 'text-[#4A5568] group-hover:text-[#00C8D4]'} transition-colors`} />
                                            </button>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {log.status === 'Success' ? (
                                                <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase text-[10px] w-fit">
                                                    <ShieldCheck className="w-3 h-3" /> Success
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold uppercase text-[10px] w-fit">
                                                    <ShieldAlert className="w-3 h-3" /> Failed
                                                </span>
                                            )}
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-[#1E2D4580] bg-[#1A2236]/30 flex items-center justify-between flex-shrink-0">
                    <span className="text-xs text-[#4A5568]">{filtered.length} events · {filtered.filter(l => l.status === 'Failed').length} failed</span>
                    <span className="flex items-center gap-2 text-xs text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Compliant · SOC 2 Type II · 7-Year Retention
                    </span>
                </div>
            </div>
        </div>
    );
}
