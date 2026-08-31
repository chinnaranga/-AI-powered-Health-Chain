import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search, Filter, FileText, ShieldCheck, ShieldAlert, Clock,
    Eye, RefreshCw, Flag, Download, ChevronDown, Pin, AlertTriangle, Plus, Loader2
} from 'lucide-react';
import { useRecords } from '../../hooks/useRecords';
import { userService } from '../../services/userService';
import UploadModal from '../../components/UploadModal';

const CATEGORIES = ['All', 'Prescriptions', 'Lab Reports', 'MRI', 'X-Ray', 'CT Scan', 'ECG', 'Vaccination', 'Surgery', 'Insurance'];

export default function ClinicalRecordsPage() {
    const navigate = useNavigate();
    const { records, isLoading: recordsLoading } = useRecords({ fetchAll: true });

    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    // User directory mapping states
    const [usersMap, setUsersMap] = useState({});
    const [usersLoading, setUsersLoading] = useState(true);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    // Fetch user directory to map patient ID to name and details
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersList = await userService.getUsers();
                const mapping = {};
                usersList.forEach(u => {
                    mapping[u.id] = {
                        name: u.name || u.email,
                        mrn: `MRN-${u.id.substring(0, 5).toUpperCase()}`
                    };
                });
                setUsersMap(mapping);
            } catch (err) {
                console.error(err);
            } finally {
                setUsersLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Format records with real user details
    const resolvedRecords = records.map(r => {
        const patientMeta = usersMap[r.patientId] || { name: `Patient ${r.patientId.substring(0, 4).toUpperCase()}`, mrn: 'MRN-NEW' };
        return {
            ...r,
            patientName: patientMeta.name,
            mrn: patientMeta.mrn,
            consent: 'Active', // Simulated consent status
            expiry: '24h remaining'
        };
    });

    const filtered = resolvedRecords.filter(r => {
        const matchSearch = r.patientName.toLowerCase().includes(search.toLowerCase()) ||
            r.mrn.toLowerCase().includes(search.toLowerCase()) ||
            (r.patientId || '').toLowerCase().includes(search.toLowerCase()) ||
            r.id.toLowerCase().includes(search.toLowerCase());
        const matchCat = filterCategory === 'All' || r.type === filterCategory;
        return matchSearch && matchCat;
    });

    const isLoading = recordsLoading || usersLoading;

    return (
        <div className="max-w-7xl mx-auto pb-12 flex flex-col h-[calc(100vh-120px)] animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0 text-left">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Authorized Workspace</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Patient Records Registry</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Direct cryptographically verifiable patient files list.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsUploadOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-[#00C8D4] text-[#0B0F1A] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#00E5F0] transition-all shadow-[0_0_15px_rgba(0,200,212,0.25)]">
                        <Plus className="w-4 h-4" /> Upload Medical Record
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by Patient, MRN, Record ID..."
                        className="w-full bg-[#111827] border border-[#1E2D4580] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00C8D4]/50 transition-all" />
                </div>
                <div className="flex gap-3">
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                        className="bg-[#111827] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-[#8899AA] focus:outline-none focus:border-[#00C8D4]/50 appearance-none min-w-[150px]">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 rounded-2xl bg-[#111827] border border-[#1E2D4580] overflow-hidden flex flex-col min-h-0">
                <div className="overflow-auto flex-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-8 h-8 text-[#00C8D4] animate-spin" />
                            <p className="text-sm text-[#8899AA] font-mono">Syncing authorized registers...</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#1A2236] sticky top-0 z-10">
                                <tr>
                                    {['Patient', 'Record ID', 'Category', 'Date Uploaded', 'Consent Status', 'Integrity', 'Actions'].map(h => (
                                        <th key={h} className="px-5 py-4 text-[11px] text-[#8899AA] font-bold uppercase tracking-wider border-b border-[#1E2D4580] whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={7} className="p-12 text-center text-[#8899AA]">No records match your filters.</td></tr>
                                ) : filtered.map((rec, i) => (
                                    <motion.tr key={rec.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                        className="border-b border-[#1E2D4580] last:border-0 hover:bg-[#1A2236]/40 transition-colors group">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="font-semibold text-white text-left">{rec.patientName}</p>
                                                    <p className="text-[11px] font-mono text-[#8899AA] text-left">{rec.mrn}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs font-mono text-[#8899AA]">{rec.id}</td>
                                        <td className="px-5 py-4">
                                            <span className="flex items-center gap-1.5 text-[#E2E8F0] text-xs">
                                                <FileText className="w-3.5 h-3.5 text-[#00C8D4]" /> {rec.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-[#8899AA] text-xs font-mono">{rec.date}</td>
                                        <td className="px-5 py-4">
                                            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                                {rec.consent}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {rec.status === 'verified' ? (
                                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                                                    <ShieldCheck className="w-3.5 h-3.5" /> Secured
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 animate-pulse">
                                                    <Clock className="w-3.5 h-3.5" /> Processing
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => navigate(`/dashboard/clinical/records/${rec.id}`)}
                                                    className="px-3 py-1.5 rounded-lg bg-[#00C8D4]/10 text-[#00C8D4] text-xs font-bold hover:bg-[#00C8D4]/20 transition-all flex items-center gap-1" title="View Record">
                                                    Open <Eye className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="px-5 py-3 border-t border-[#1E2D4580] bg-[#1A2236]/30 flex items-center justify-between flex-shrink-0">
                    <span className="text-xs text-[#8899AA]">Total registry documents: {filtered.length}</span>
                </div>
            </div>

            <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
        </div>
    );
}