import React, { useState } from 'react';
import useAuthStore from '../../store/authStore';
import { toast } from '../../components/Toast';
import { FileText, Download, ShieldCheck, Upload, Loader2, DatabaseZap, Search, Eye, Filter, ShieldAlert, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadModal from '../../components/UploadModal';
import { useRecords } from '../../hooks/useRecords';
import { recordService } from '../../services/recordService';

export default function RecordsPage() {
    const role = useAuthStore(s => s.role) || 'patient';
    const { records, isLoading } = useRecords();
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [deletingRecord, setDeletingRecord] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Filters
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    const handleDelete = async (recordId) => {
        setIsDeleting(true);
        try {
            await recordService.deleteRecord(recordId);
            toast.success('Record successfully deleted from vault');
            setDeletingRecord(null);
        } catch (err) {
            toast.error('Failed to delete record: ' + err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const categories = ['All', 'Lab Results', 'Imaging', 'Prescriptions', 'Clinical Notes', 'Medical Record'];

    const filtered = records.filter(r => {
        const matchSearch = r.name?.toLowerCase().includes(search.toLowerCase());
        const matchCat = filterCategory === 'All' || r.type === filterCategory || (!r.type && filterCategory === 'Medical Record');
        return matchSearch && matchCat;
    });

    return (
        <div className="max-w-7xl mx-auto pb-12 flex flex-col h-[calc(100vh-120px)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Protected Health Vault</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Medical Records Library</h2>
                    <p className="text-sm text-[#8899AA] mt-1">All your clinical files securely stored on the blockchain.</p>
                </div>
                {role === 'patient' && (
                    <button onClick={() => setIsUploadOpen(true)} className="px-5 py-2.5 rounded-xl bg-[#00C8D4] text-[#0B0F1A] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#00E5F0] transition-all shadow-[0_0_15px_rgba(0,200,212,0.25)]">
                        <Upload className="w-4 h-4" /> Upload New Record
                    </button>
                )}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search document name..."
                        className="w-full bg-[#111827] border border-[#1E2D4580] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00C8D4]/50 transition-all" />
                </div>
                <div className="flex gap-3">
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                        className="bg-[#111827] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-[#8899AA] focus:outline-none focus:border-[#00C8D4]/50 appearance-none min-w-[150px]">
                        {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 rounded-2xl bg-[#111827] border border-[#1E2D4580] overflow-hidden flex flex-col min-h-0">
                {/* Table Header Row */}
                <div className="px-5 py-4 border-b border-[#1E2D4580] flex items-center justify-between bg-[#1A2236] sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <DatabaseZap className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-xs text-[#8899AA] font-bold uppercase tracking-wider">
                            {isLoading ? 'Syncing...' : `${filtered.length} record${filtered.length !== 1 ? 's' : ''} found`}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                        <span className={`text-[10px] font-bold tracking-widest uppercase ${isLoading ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {isLoading ? 'SYNCING' : 'ON-CHAIN'}
                        </span>
                    </div>
                </div>

                <div className="overflow-auto flex-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-8 h-8 text-[#00C8D4] animate-spin" />
                            <p className="text-sm text-[#8899AA]">Syncing from blockchain network...</p>
                        </div>
                    ) : records.length === 0 ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24 gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-[#1A2236] border border-[#1E2D4580] flex items-center justify-center mb-2">
                                <FileText className="w-8 h-8 text-[#4A5568]" />
                            </div>
                            <p className="text-white font-medium text-lg">Your vault is empty</p>
                            <p className="text-sm text-[#8899AA]">Upload your first medical record to secure it cryptographically.</p>
                            {role === 'patient' && (
                                <button onClick={() => setIsUploadOpen(true)} className="mt-4 px-5 py-2.5 rounded-xl border border-[#00C8D4]/30 text-[#00C8D4] font-bold text-sm hover:bg-[#00C8D4]/10 transition-all">
                                    Upload First Record
                                </button>
                            )}
                        </motion.div>
                    ) : filtered.length === 0 ? (
                        <div className="p-12 text-center text-[#8899AA]">No records match your search criteria.</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#1A2236]/50">
                                <tr>
                                    {['Document', 'Date', 'CID Hash', 'Security', 'Actions'].map(h => (
                                        <th key={h} className="px-6 py-4 text-[11px] text-[#8899AA] font-bold uppercase tracking-wider border-b border-[#1E2D4580] whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filtered.map((r, i) => (
                                        <motion.tr
                                            key={r.id || i}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="border-b border-[#1E2D4580] last:border-0 hover:bg-[#1A2236]/40 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center group-hover:bg-[#00C8D4]/20 transition-colors">
                                                        <FileText className="w-4 h-4 text-[#00C8D4]" />
                                                    </div>
                                                    <div>
                                                        <span className="text-white font-semibold">{r.name}</span>
                                                        <p className="text-[11px] text-[#8899AA]">{r.type || 'Medical Record'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[#8899AA] text-xs font-mono">{r.date}</td>
                                            <td className="px-6 py-4 font-mono text-[11px] text-[#8899AA]">
                                                {r.cid && r.cid !== 'N/A' ? (
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(r.cid);
                                                            toast.success('IPFS CID copied to clipboard!');
                                                        }}
                                                        className="hover:text-[#00C8D4] transition-colors px-2 py-1 rounded bg-[#1A2236]"
                                                        title="Copy IPFS CID to clipboard"
                                                    >
                                                        {r.cid.substring(0, 14)}...
                                                    </button>
                                                ) : <span className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded">Pending</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                {r.status === 'verified' || !r.status ? (
                                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 w-fit">
                                                        <ShieldCheck className="w-3 h-3" /> Encrypted
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 w-fit">
                                                        <Loader2 className="w-3 h-3 animate-spin" /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => window.location.href = `/dashboard/patient/records/${r.id || 'REC-001'}`} className="p-1.5 rounded-lg bg-[#1A2236] text-[#8899AA] hover:text-[#00C8D4] transition-colors" title="View Record Details">
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => toast.success('Decryption initiated')} className="p-1.5 rounded-lg bg-[#1A2236] text-[#8899AA] hover:text-emerald-400 transition-colors" title="Verify on chain">
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                    </button>
                                                    {r.cid && r.cid !== 'N/A' && (
                                                        <button 
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(r.cid);
                                                                toast.success('IPFS CID copied to clipboard for local client download!');
                                                            }}
                                                            className="p-1.5 rounded-lg bg-[#1A2236] text-[#8899AA] hover:text-white transition-colors" 
                                                            title="Copy IPFS CID for Download"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    {role === 'patient' && (
                                                        <button onClick={() => setDeletingRecord(r)} className="p-1.5 rounded-lg bg-[#1A2236] text-[#8899AA] hover:text-red-400 transition-colors" title="Delete Record">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deletingRecord && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#111827] border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
                        >
                            {/* Decorative background glow */}
                            <div className="absolute -top-12 -left-12 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
                            
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 text-red-400">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-display font-bold text-white mb-1">Delete Medical Record?</h3>
                                    <p className="text-sm text-[#8899AA] leading-relaxed">
                                        Are you sure you want to permanently delete <span className="text-white font-semibold">{deletingRecord.name}</span>? This action will permanently remove it from your health vault.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end mt-6">
                                <button 
                                    onClick={() => setDeletingRecord(null)}
                                    disabled={isDeleting}
                                    className="px-4 py-2 rounded-xl border border-[#1E2D4580] text-[#8899AA] hover:text-white text-xs font-bold transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => handleDelete(deletingRecord.id)}
                                    disabled={isDeleting}
                                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] disabled:opacity-50"
                                >
                                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    Delete Permanently
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
