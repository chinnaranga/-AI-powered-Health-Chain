import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Database, Search, Filter, Calendar, ShieldCheck, ShieldAlert,
    Copy, ExternalLink, Activity, Eye, Zap, Lock, Unlock, Download
} from 'lucide-react';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { toast } from '../../components/Toast';

export default function DoctorLogsPage() {
    const { logs, isLoading } = useAuditLogs();
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('All');

    const getFriendlyAction = (activityType) => {
        switch (activityType) {
            case 'RECORD_UPLOADED': return 'Medical Record Uploaded';
            case 'ACCESS_REQUEST_CREATED': return 'Access Request Initiated';
            case 'REQUEST_APPROVED_OTP_GENERATED': return 'OTP Session Approved';
            case 'REQUEST_REJECTED': return 'Access Challenge Rejected';
            case 'OTP_VERIFIED_ACCESS_GRANTED': return 'OTP Session Verified';
            case 'RECORD_DECRYPTED_VIEWED': return 'Encrypted Scan Decrypted';
            default: return activityType ? activityType.replace(/_/g, ' ') : 'Diagnostic Log';
        }
    };

    const getLogCategory = (activityType) => {
        switch (activityType) {
            case 'RECORD_UPLOADED': return 'Upload';
            case 'RECORD_DECRYPTED_VIEWED': return 'Decryption';
            case 'ACCESS_REQUEST_CREATED':
            case 'REQUEST_APPROVED_OTP_GENERATED':
            case 'OTP_VERIFIED_ACCESS_GRANTED':
                return 'OTP Session';
            case 'REQUEST_REJECTED':
                return 'Revoke';
            default: return 'System';
        }
    };

    // Parse the live log collection into table-ready items
    const parsedLogs = logs.map(log => {
        const dateObj = new Date(log.timestamp);
        return {
            id: log.id,
            timestamp: `${dateObj.toISOString().replace('T', ' ').substring(0, 23)}Z`,
            action: getFriendlyAction(log.activityType),
            type: getLogCategory(log.activityType),
            target: log.patientName || 'System Self',
            reqId: log.details?.requestId ? log.details.requestId.slice(0, 8) : log.id.slice(0, 8),
            txHash: log.txHash || '0x0000000000000000000000000000000000000000',
            status: 'Success'
        };
    });

    const filteredLogs = parsedLogs.filter(log => 
        (filterType === 'All' || log.type === filterType) &&
        (log.target.toLowerCase().includes(search.toLowerCase()) || 
         log.txHash.toLowerCase().includes(search.toLowerCase()) || 
         log.reqId.toLowerCase().includes(search.toLowerCase()) ||
         log.action.toLowerCase().includes(search.toLowerCase()))
    );

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('TxHash copied to clipboard');
    };

    const actionTypes = ['All', 'Upload', 'Decryption', 'OTP Session', 'Revoke'];

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-fade-in flex flex-col h-[calc(100vh-120px)] relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Database className="w-5 h-5 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Immutable Ledger</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Audit Trail</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Cryptographically secure log of all system interactions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 rounded-xl bg-[#1A2236] border border-[#1E2D4580] text-sm text-white font-semibold flex items-center gap-2 hover:bg-[#1E2D45] transition-all">
                        <Download className="w-4 h-4 text-[#8899AA]" /> Export Log (.csv)
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 min-h-0 rounded-2xl bg-[#111827] border border-[#1E2D4580] overflow-hidden">
                
                {/* Filter Bar */}
                <div className="p-4 border-b border-[#1E2D4580] bg-[#1A2236]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
                    <div className="flex bg-[#111827] border border-[#1E2D4580] rounded-lg p-1 overflow-x-auto">
                        {actionTypes.map(t => (
                            <button key={t} onClick={() => setFilterType(t)}
                                className={`px-4 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                                    filterType === t 
                                    ? 'bg-[#00C8D4]/15 text-[#00C8D4] border border-[#00C8D4]/30 shadow-[0_0_10px_rgba(0,200,212,0.1)]' 
                                    : 'text-[#8899AA] hover:text-white border border-transparent'
                                }`}>
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]" />
                            <input 
                                value={search} 
                                onChange={e => setSearch(e.target.value)} 
                                placeholder="Search Hash, Patient, ID..."
                                className="w-full bg-[#111827] border border-[#1E2D4580] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00C8D4]/50 focus:ring-1 focus:ring-[#00C8D4]/20 transition-all font-mono" 
                            />
                        </div>
                        <button className="p-2 rounded-lg bg-[#111827] border border-[#1E2D4580] text-[#8899AA] hover:text-white transition-all">
                            <Calendar className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Log Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#1A2236] sticky top-0 z-10">
                            <tr>
                                {['Timestamp (UTC)', 'Action', 'Target Patient', 'Blockchain TxHash', 'Status'].map((h, i) => (
                                    <th key={h} className={`px-6 py-4 text-[11px] text-[#8899AA] font-bold uppercase tracking-wider border-b border-[#1E2D4580] ${i === 3 ? 'w-[280px]' : ''}`}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="font-mono text-xs">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center font-sans">
                                        <Activity className="w-10 h-10 text-[#00C8D4] animate-spin mx-auto mb-3" />
                                        <p className="text-[#8899AA]">Synchronizing with decentralized ledger...</p>
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center font-sans">
                                        <Database className="w-10 h-10 text-[#4A5568] mx-auto mb-3" />
                                        <p className="text-[#8899AA]">No audit logs match criteria.</p>
                                    </td>
                                </tr>
                            ) : filteredLogs.map((log, i) => (
                                <motion.tr 
                                    key={log.id} 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    transition={{ delay: Math.min(i * 0.02, 0.5) }}
                                    className="border-b border-[#1E2D4580] last:border-0 hover:bg-[#1A2236]/50 transition-colors"
                                >
                                    <td className="px-6 py-4 text-[#8899AA] whitespace-nowrap">
                                        {log.timestamp}
                                    </td>
                                    <td className="px-6 py-4 font-sans">
                                        <div className="flex items-center gap-2">
                                            {log.type === 'Upload' && <Zap className="w-3.5 h-3.5 text-[#00C8D4] flex-shrink-0" />}
                                            {log.type === 'OTP Session' && <Lock className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}
                                            {log.type === 'Decryption' && <Eye className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                                            {log.type === 'Revoke' && <Unlock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                                            <span className="text-[#E2E8F0] font-medium">{log.action}: <span className="text-[#8899AA]">{log.reqId}</span></span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-sans font-medium text-white">
                                        {log.target}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div 
                                            onClick={() => handleCopy(log.txHash)}
                                            className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#111827] border border-[#1E2D4580] w-fit cursor-pointer hover:border-[#00C8D4]/50 group transition-colors"
                                            title="Click to copy full hash"
                                        >
                                            <span className="text-[#00C8D4] group-hover:text-white transition-colors">
                                                {log.txHash.substring(0, 10)}...{log.txHash.substring(log.txHash.length - 8)}
                                            </span>
                                            <Copy className="w-3 h-3 text-[#4A5568] group-hover:text-[#00C8D4] transition-colors" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.status === 'Success' ? (
                                            <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit font-bold uppercase text-[10px]">
                                                <ShieldCheck className="w-3 h-3" /> Success
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 w-fit font-bold uppercase text-[10px]">
                                                <ShieldAlert className="w-3 h-3" /> Failed
                                            </span>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
