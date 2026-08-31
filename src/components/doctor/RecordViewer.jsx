import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge, EmptyState } from '../UIComponents';
import VerificationPanel from './VerificationPanel';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FileText, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = ['Overview', 'Records', 'Verification', 'Access History'];

const activityData = [
    { day: 'Mon', v: 3 }, { day: 'Tue', v: 7 }, { day: 'Wed', v: 2 },
    { day: 'Thu', v: 9 }, { day: 'Fri', v: 5 }, { day: 'Sat', v: 1 }, { day: 'Sun', v: 4 },
];

const accessHistory = [
    { action: 'Medical records viewed', time: '2 min ago', hash: '0x7a2B…9f1C' },
    { action: 'Access granted by patient', time: '1 hour ago', hash: '0x3eF1…8d2A' },
    { action: 'Bulk verification run', time: 'Yesterday', hash: '0xAb3C…1e4F' },
    { action: 'Session initiated', time: '2 days ago', hash: '0x9dE2…5a7B' },
];

const RecordViewer = ({ patient, records, tab, onTabChange, onRequestVerify, verifying }) => {
    const [selected, setSelected] = useState([]);
    const allSelected = selected.length === records.length && records.length > 0;
    const toggleAll = () => setSelected(allSelected ? [] : records.map((_, i) => i));
    const toggleRow = i => setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

    if (!patient) return (
        <div className="h-full flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-12 h-12 text-slate-700 mb-4" />
            <p className="text-sm font-medium text-slate-400">No patient selected</p>
            <p className="text-xs text-slate-600 mt-1">Search for a patient on the left to begin</p>
        </div>
    );

    const verified = records.filter(r => r.verified).length;
    const rate = records.length ? Math.round((verified / records.length) * 100) : 0;

    return (
        <div className="flex flex-col h-full">
            {/* Patient identity bar */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-900/50 border border-blue-700 flex items-center justify-center text-sm font-bold text-blue-400">
                        {patient.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-100">{patient.name || patient.email}</p>
                        <p className="text-xs text-slate-500">{patient.email}</p>
                    </div>
                </div>
                <Badge label="Access Verified" variant="success" />
            </div>

            {/* Sub-tabs */}
            <div className="flex border-b border-slate-700 mb-4 -mx-1 overflow-x-auto">
                {TABS.map(t => (
                    <button key={t} onClick={() => onTabChange(t)}
                        className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors relative ${tab === t
                                ? 'text-blue-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div key={tab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>

                        {tab === 'Overview' && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Total Records', value: records.length, color: 'text-blue-400' },
                                        { label: 'Verified', value: verified, color: 'text-teal-400' },
                                        { label: 'Verification Rate', value: `${rate}%`, color: 'text-amber-400' },
                                    ].map(s => (
                                        <div key={s.label} className="p-4 bg-slate-900 border border-slate-700 rounded-xl text-center">
                                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Record Activity (7 days)</p>
                                    <div className="h-40">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={activityData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                                <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} />
                                                <YAxis stroke="#475569" fontSize={10} tickLine={false} width={20} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} />
                                                <Line type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                        {tab === 'Records' && (
                            <div>
                                {selected.length > 0 && (
                                    <div className="flex items-center justify-between mb-3 px-3 py-2 bg-blue-900/20 border border-blue-800 rounded-lg">
                                        <span className="text-xs text-blue-400 font-medium">{selected.length} selected</span>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="blue" onClick={() => { toast.success(`Bulk verified ${selected.length} records`); setSelected([]); }}>
                                                <ShieldCheck className="w-3 h-3" /> Bulk Verify
                                            </Button>
                                            <Button size="sm" variant="secondary" onClick={() => toast.success('Downloading…')}>
                                                <Download className="w-3 h-3" /> Download
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {records.length === 0 ? (
                                    <EmptyState icon={FileText} title="No records on chain" description="Patient has not uploaded any records yet." />
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-slate-700">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-slate-900/60 border-b border-slate-700">
                                                    <th className="pl-4 pr-2 py-3">
                                                        <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-slate-600 bg-slate-800 text-blue-500" />
                                                    </th>
                                                    {['Record', 'CID', 'Date', 'Status', ''].map(h => (
                                                        <th key={h} className="px-3 py-3 text-left font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {records.map((r, i) => (
                                                    <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
                                                        <td className="pl-4 pr-2 py-3">
                                                            <input type="checkbox" checked={selected.includes(i)} onChange={() => toggleRow(i)} className="rounded border-slate-600 bg-slate-800 text-blue-500" />
                                                        </td>
                                                        <td className="px-3 py-3 text-slate-300 font-medium">{r.description || 'Medical Record'}</td>
                                                        <td className="px-3 py-3 font-mono text-slate-500">{(r.ipfsHash || '').substring(0, 12) || '—'}…</td>
                                                        <td className="px-3 py-3 text-slate-400">{new Date(r.timestamp).toLocaleDateString()}</td>
                                                        <td className="px-3 py-3"><Badge label={r.verified ? 'Verified' : 'Pending'} variant={r.verified ? 'success' : 'warning'} /></td>
                                                        <td className="px-3 py-3">
                                                            <div className="flex gap-1">
                                                                 {r.ipfsHash && (
                                                                     <button 
                                                                         onClick={() => {
                                                                             navigator.clipboard.writeText(r.ipfsHash);
                                                                             toast.success('IPFS hash copied to clipboard!');
                                                                         }} 
                                                                         className="p-1.5 rounded hover:bg-slate-700 text-slate-500 hover:text-blue-400 transition-colors"
                                                                         title="Copy IPFS hash to clipboard"
                                                                     >
                                                                         <ExternalLink className="w-3 h-3" />
                                                                     </button>
                                                                 )}
                                                                <button onClick={() => toast.success('Download started')} className="p-1.5 rounded hover:bg-slate-700 text-slate-500 hover:text-teal-400 transition-colors">
                                                                    <Download className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {tab === 'Verification' && <VerificationPanel />}

                        {tab === 'Access History' && (
                            <div>
                                {accessHistory.map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 py-3 border-b border-slate-800 last:border-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-slate-300">{item.action}</p>
                                            <p className="text-xs font-mono text-slate-600 mt-0.5 truncate">{item.hash}</p>
                                        </div>
                                        <span className="text-xs text-slate-600 shrink-0">{item.time}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RecordViewer;
