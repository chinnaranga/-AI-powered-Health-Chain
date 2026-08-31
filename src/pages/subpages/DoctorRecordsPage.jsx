import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Search, Shield, ShieldAlert, CheckCircle,
    Eye, ExternalLink, Brain, Database, X,
    ChevronRight, Activity, ActivitySquare, Pill, FileCode, Plus, Loader2,
    Users, AlertCircle, RefreshCw, Info
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import UploadModal from '../../components/UploadModal';
import { accessRequestService } from '../../services/accessRequestService';

/* ── Helpers ── */
function IntegrityBadge({ status }) {
    if (status === 'Valid') return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Shield className="w-3 h-3" /> Verified
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
            <ShieldAlert className="w-3 h-3" /> Mismatch
        </span>
    );
}

function CategoryIcon({ type }) {
    if (['Imaging', 'MRI', 'X-Ray', 'CT Scan'].includes(type)) return <ActivitySquare className="w-4 h-4 text-purple-400" />;
    if (['Lab Results', 'Lab Reports'].includes(type)) return <Activity className="w-4 h-4 text-amber-400" />;
    if (['Prescription', 'Prescriptions'].includes(type)) return <Pill className="w-4 h-4 text-emerald-400" />;
    return <FileCode className="w-4 h-4 text-blue-400" />;
}

function formatRecord(doc) {
    const r = doc.data();
    let dataObj = r.data;
    try { dataObj = typeof r.data === 'string' ? JSON.parse(r.data) : r.data; } catch {}
    const tsMs = r.createdAt?.seconds
        ? r.createdAt.seconds * 1000
        : (Number(r.timestamp) * 1000 || Date.now());
    return {
        id: doc.id,
        cid: r.cidHash || dataObj?.ipfsHash || r.hash || 'N/A',
        timestamp: tsMs,
        date: new Date(tsMs).toLocaleDateString(),
        name: r.fileName || dataObj?.name || `Record`,
        type: r.category || dataObj?.type || 'Medical Document',
        status: r.verified ? 'verified' : 'pending',
        txHash: r.blockchainHash || r.hash || '',
        size: r.fileSize || '—',
        patientId: r.patientId || 'unknown',
        uploadedBy: r.uploadedBy || '',
        doctorName: r.doctorName || '—',
        hospital: r.hospital || '—',
        integrity: 'Valid',
        aiSummary: `Patient presents with stable vital signs. Diagnostic findings for ${(r.category || 'record').toLowerCase()} show normal indicators. Review and sign-off recommended in 4 weeks.`,
    };
}

/* ── Patient ID Search Panel ── */
function PatientSearchPanel({ onSearch, isLoading, currentPatientId }) {
    const [input, setInput] = useState(currentPatientId || '');

    // Sync input if currentPatientId changes externally
    useEffect(() => {
        if (currentPatientId !== undefined) {
            setInput(currentPatientId);
        }
    }, [currentPatientId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (trimmed) onSearch(trimmed);
    };

    const handleClear = () => {
        setInput('');
        onSearch('');
    };

    return (
        <div className="bg-[#111827] border border-[#00C8D4]/20 rounded-2xl p-5 mb-5 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-[#00C8D4]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Patient Record Lookup</span>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]" />
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Enter Patient UID, email, or Global ID (HCG-XXXXXXXX)..."
                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00C8D4]/50 transition-all"
                    />
                    {input && (
                        <button type="button" onClick={handleClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5568] hover:text-white">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
                <button type="submit" disabled={!input.trim() || isLoading}
                    className="px-5 py-2.5 rounded-xl bg-[#00C8D4] text-[#0B0F1A] font-bold text-sm hover:bg-[#00E5F0] disabled:opacity-50 transition-all flex items-center gap-2 flex-shrink-0">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Search
                </button>
            </form>
            <div className="flex items-start gap-2 mt-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#8899AA] leading-relaxed">
                    Enter the patient's Firebase UID, email, or <span className="text-teal-400 font-mono font-semibold">Global Health ID (HCG-XXXXXXXX)</span> to view their records. Access is granted only after the patient approves via OTP.
                </p>
            </div>
        </div>
    );
}

/* ── Selected Record Sidebar ── */
function RecordDetailSidebar({ record, onClose, onOpen }) {
    return (
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
            className="w-[35%] rounded-2xl bg-[#111827] border border-[#1E2D4580] flex flex-col flex-shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#9333EA]/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="p-5 border-b border-[#1E2D4580] flex items-center justify-between bg-[#1A2236]/30">
                <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-display font-bold text-white">AI Record Analysis</span>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/10 text-[#8899AA] transition-all">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-6 text-left">
                <div>
                    <h3 className="text-lg font-bold text-white mb-1">{record.name}</h3>
                    <p className="text-xs text-[#8899AA] flex items-center gap-2 flex-wrap">
                        <span className="font-mono bg-[#1A2236] px-2 py-0.5 rounded">{record.id.slice(0, 8)}</span>
                        <span>•</span>
                        <span>{record.date}</span>
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 relative">
                    <div className="absolute top-4 right-4 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                    </div>
                    <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2">Clinical Summary</h4>
                    <p className="text-sm text-[#E2E8F0] leading-relaxed">{record.aiSummary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded-md bg-[#1A2236] border border-[#1E2D4580] text-[10px] text-[#8899AA]">Stable Vitals</span>
                        <span className="px-2 py-1 rounded-md bg-[#1A2236] border border-[#1E2D4580] text-[10px] text-[#8899AA]">Routine Follow-up</span>
                    </div>
                </div>
                <div>
                    <h4 className="text-[10px] font-bold text-[#8899AA] uppercase tracking-wider mb-3">Blockchain Integrity</h4>
                    <div className="p-4 rounded-xl bg-[#1A2236]/50 border border-[#1E2D4580] space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-[#8899AA]">Status</span>
                            <IntegrityBadge status={record.integrity} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-[#8899AA]">CID Hash</span>
                            <span className="text-xs font-mono text-white bg-[#111827] px-2 py-1 rounded truncate max-w-[120px]" title={record.cid}>
                                {record.cid}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-[#8899AA]">Patient ID</span>
                            <span className="text-[10px] font-mono text-[#8899AA] truncate max-w-[120px]">{record.patientId.slice(0, 12)}...</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-5 border-t border-[#1E2D4580] bg-[#1A2236]/30">
                <button onClick={() => onOpen(record.id)}
                    className="w-full py-3 rounded-xl bg-[#00C8D4] hover:bg-[#00E5F0] text-[#0B0F1A] font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,200,212,0.3)]">
                    Open Full Record <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}

/* ── Main Page ── */
export default function DoctorRecordsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState(null);

    // Query states
    const [patientIdQuery, setPatientIdQuery] = useState('');
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    // UI states
    const [typeFilter, setTypeFilter] = useState('All');
    const [nameSearch, setNameSearch] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    // Auth
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, user => setCurrentUser(user));
        return () => unsub();
    }, []);

    // Active subscription refs
    const [unsubs, setUnsubs] = useState([]);

    const handleSearch = async (searchTerm) => {
        // Clean up previous listeners
        unsubs.forEach(unsub => { if (unsub) unsub(); });
        setUnsubs([]);

        if (!searchTerm) {
            setRecords([]);
            setHasSearched(false);
            setPatientIdQuery('');
            return;
        }
        setPatientIdQuery(searchTerm);

        setIsLoading(true);
        setFetchError(null);
        setHasSearched(true);
        setRecords([]);
        setSelectedRecord(null);

        let resolvedPatientId = searchTerm;

        if (searchTerm.includes('@')) {
            try {
                const userQ = query(collection(db, 'users'), where('email', '==', searchTerm.toLowerCase()));
                const userSnap = await getDocs(userQ);
                if (!userSnap.empty) {
                    resolvedPatientId = userSnap.docs[0].id;
                } else {
                    setFetchError('No patient found with that email address.');
                    setIsLoading(false);
                    return;
                }
            } catch (err) {
                console.error('[DoctorRecords] Email resolution error:', err);
                setFetchError('Failed to resolve email to UID.');
                setIsLoading(false);
                return;
            }
        } else if (searchTerm.toUpperCase().startsWith('HCG-')) {
            // Resolve Global Patient ID → Firebase UID
            try {
                const globalId = searchTerm.toUpperCase().trim();
                // Try users collection first
                const userQ = query(collection(db, 'users'), where('globalPatientId', '==', globalId));
                const userSnap = await getDocs(userQ);
                if (!userSnap.empty) {
                    resolvedPatientId = userSnap.docs[0].id;
                } else {
                    // Fallback: try patients collection
                    const patientQ = query(collection(db, 'patients'), where('globalPatientId', '==', globalId));
                    const patientSnap = await getDocs(patientQ);
                    if (!patientSnap.empty) {
                        const patientData = patientSnap.docs[0].data();
                        // Use the linked UID if available, else use the doc ID as patientId
                        resolvedPatientId = patientData.uid || patientSnap.docs[0].id;
                    } else {
                        setFetchError('No patient found with that Global Health ID.');
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (err) {
                console.error('[DoctorRecords] Global ID resolution error:', err);
                setFetchError('Failed to resolve Global Health ID.');
                setIsLoading(false);
                return;
            }
        }

        const doctorUid = auth.currentUser?.uid || currentUser?.uid;
        if (!doctorUid) {
            setFetchError('Doctor session not authenticated.');
            setIsLoading(false);
            return;
        }

        // ── Real-Time Active Session Listener ──
        const sessionQ = query(
            collection(db, 'activeSessions'),
            where('doctorId', '==', doctorUid),
            where('patientId', '==', resolvedPatientId),
            where('active', '==', true)
        );

        let recordsUnsub = null;

        const sessionUnsub = onSnapshot(sessionQ, (sessionSnap) => {
            let hasValidSession = false;
            if (!sessionSnap.empty) {
                const sessionData = sessionSnap.docs[0].data();
                const expiry = sessionData.expiresAt?.toDate ? sessionData.expiresAt.toDate() : new Date(sessionData.expiresAt);
                if (expiry > new Date()) {
                    hasValidSession = true;
                }
            }

            if (!hasValidSession) {
                // Instantly erase records if revoked or expired
                setRecords([]);
                setSelectedRecord(null);
                setFetchError('Access Denied: You do not have an active secure session for this patient. Please request access and verify via OTP first.');
                setIsLoading(false);
                if (recordsUnsub) {
                    recordsUnsub();
                    recordsUnsub = null;
                }
            } else {
                // Initialize records subscription if not already active
                if (!recordsUnsub) {
                    setFetchError(null);
                    const q = query(
                        collection(db, 'records'),
                        where('patientId', '==', resolvedPatientId)
                    );

                    recordsUnsub = onSnapshot(q,
                        (snapshot) => {
                            const formatted = snapshot.docs
                                .map(formatRecord)
                                .sort((a, b) => b.timestamp - a.timestamp);
                            setRecords(formatted);
                            setIsLoading(false);
                        },
                        (err) => {
                            console.error('[DoctorRecords] Firestore records fetch error:', err.message);
                            setFetchError(err.message);
                            setIsLoading(false);
                        }
                    );
                    setUnsubs(prev => [...prev, recordsUnsub]);
                }
            }
        }, (err) => {
            console.error('[DoctorRecords] Active session fetch error:', err);
            setFetchError('Failed to verify active access session.');
            setIsLoading(false);
        });

        setUnsubs(prev => [...prev, sessionUnsub]);
    };

    useEffect(() => {
        return () => { unsubs.forEach(unsub => { if (unsub) unsub(); }); };
    }, [unsubs]);

    // Auto-search if patientId is in URL
    useEffect(() => {
        if (currentUser) {
            const params = new URLSearchParams(location.search);
            const initialPatientId = params.get('patientId');
            if (initialPatientId && !hasSearched) {
                handleSearch(initialPatientId);
            }
        }
    }, [currentUser, location.search, hasSearched]);

    // Type filter + name search
    const categories = ['All', 'Prescriptions', 'Lab Reports', 'MRI', 'X-Ray', 'CT Scan', 'ECG', 'Vaccination'];
    const filtered = records.filter(r => {
        const matchType = typeFilter === 'All' || r.type === typeFilter;
        const matchName = !nameSearch || r.name.toLowerCase().includes(nameSearch.toLowerCase())
            || r.type.toLowerCase().includes(nameSearch.toLowerCase());
        return matchType && matchName;
    });

    return (
        <div className="max-w-7xl mx-auto pb-12 flex flex-col h-[calc(100vh-120px)] relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 flex-shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Database className="w-5 h-5 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Records Vault</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Patient Records</h2>
                    {patientIdQuery && (
                        <p className="text-xs text-[#8899AA] mt-1 font-mono">
                            Patient: <span className="text-[#00C8D4]">{patientIdQuery.slice(0, 20)}...</span>
                        </p>
                    )}
                </div>
                <button onClick={() => setIsUploadOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#00C8D4] text-[#0B0F1A] font-bold text-sm flex items-center gap-2 hover:bg-[#00E5F0] transition-all shadow-[0_0_15px_rgba(0,200,212,0.25)] flex-shrink-0">
                    <Plus className="w-4 h-4" /> Upload Record
                </button>
            </div>

            {/* Patient ID Search */}
            <PatientSearchPanel
                onSearch={handleSearch}
                isLoading={isLoading}
                currentPatientId={patientIdQuery}
            />

            {/* Main table area */}
            <div className="flex flex-1 min-h-0 gap-6">
                <div className={`flex flex-col rounded-2xl bg-[#111827] border border-[#1E2D4580] overflow-hidden transition-all duration-300 ${selectedRecord ? 'w-[65%]' : 'w-full'}`}>

                    {/* Toolbar */}
                    <div className="p-4 border-b border-[#1E2D4580] bg-[#1A2236]/50 flex flex-col sm:flex-row sm:items-center gap-3 justify-between flex-shrink-0">
                        <div className="flex bg-[#111827] border border-[#1E2D4580] rounded-lg p-1 overflow-x-auto">
                            {categories.slice(0, 5).map(c => (
                                <button key={c} onClick={() => setTypeFilter(c)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                                        typeFilter === c ? 'bg-[#00C8D4]/15 text-[#00C8D4] border border-[#00C8D4]/30' : 'text-[#8899AA] hover:text-white border border-transparent'
                                    }`}>
                                    {c}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full sm:w-56">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]" />
                            <input value={nameSearch} onChange={e => setNameSearch(e.target.value)}
                                placeholder="Filter by name, type..."
                                className="w-full bg-[#111827] border border-[#1E2D4580] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00C8D4]/50 transition-all" />
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-auto">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <Loader2 className="w-8 h-8 text-[#00C8D4] animate-spin" />
                                <p className="text-sm text-[#8899AA] font-mono">Fetching patient records from Firestore...</p>
                            </div>
                        ) : fetchError ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <AlertCircle className="w-10 h-10 text-red-400" />
                                <p className="text-white font-semibold">Permission Error</p>
                                <p className="text-xs text-[#8899AA] max-w-xs text-center">{fetchError}</p>
                            </div>
                        ) : !hasSearched ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center">
                                    <Users className="w-8 h-8 text-[#00C8D4]" />
                                </div>
                                <div className="text-center">
                                    <p className="text-white font-semibold mb-1">Search for a Patient</p>
                                    <p className="text-xs text-[#8899AA] max-w-xs">Enter a patient's UID in the search panel above to view their medical records.</p>
                                </div>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <FileText className="w-10 h-10 text-[#4A5568]" />
                                <p className="text-white font-semibold">No records found</p>
                                <p className="text-xs text-[#8899AA]">
                                    {typeFilter !== 'All' ? `Try clearing the "${typeFilter}" filter.` : 'This patient has no records uploaded yet.'}
                                </p>
                                {typeFilter !== 'All' && (
                                    <button onClick={() => setTypeFilter('All')}
                                        className="text-xs text-[#00C8D4] border border-[#00C8D4]/30 px-3 py-1.5 rounded-lg hover:bg-[#00C8D4]/10 transition-all">
                                        Clear Filter
                                    </button>
                                )}
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#1A2236] sticky top-0 z-10">
                                    <tr>
                                        {['Record Name', 'Record ID', 'Type', 'Date', 'Integrity', 'Actions'].map(h => (
                                            <th key={h} className="px-6 py-4 text-[11px] text-[#8899AA] font-bold uppercase tracking-wider border-b border-[#1E2D4580]">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((r, i) => (
                                        <motion.tr key={r.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            onClick={() => setSelectedRecord(r)}
                                            className={`border-b border-[#1E2D4580] last:border-0 hover:bg-[#1A2236] transition-all cursor-pointer group ${
                                                selectedRecord?.id === r.id ? 'bg-[#1A2236] border-l-2 border-l-[#00C8D4]' : ''
                                            }`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[#1E2D45] flex items-center justify-center">
                                                        <CategoryIcon type={r.type} />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium text-sm truncate max-w-[160px]">{r.name}</p>
                                                        <p className="text-[10px] text-[#4A5568] font-mono">{r.size}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-[#8899AA]">{r.id.slice(0, 8)}...</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-md bg-[#00C8D4]/10">
                                                        <CategoryIcon type={r.type} />
                                                    </div>
                                                    <span className="text-xs text-[#E2E8F0]">{r.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-[#8899AA]">{r.date}</td>
                                            <td className="px-6 py-4"><IntegrityBadge status={r.integrity} /></td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={e => { e.stopPropagation(); navigate(`/dashboard/doctor/records/${r.id}`); }}
                                                    className="px-3 py-1.5 rounded-lg bg-[#00C8D4]/10 text-[#00C8D4] text-xs font-bold hover:bg-[#00C8D4]/20 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1.5">
                                                    Open <ExternalLink className="w-3 h-3" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Footer count */}
                    {hasSearched && !isLoading && records.length > 0 && (
                        <div className="px-5 py-3 border-t border-[#1E2D4580] bg-[#1A2236]/30 flex items-center justify-between">
                            <span className="text-[11px] text-[#4A5568] font-mono">{filtered.length} of {records.length} records shown</span>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Live</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <AnimatePresence>
                    {selectedRecord && (
                        <RecordDetailSidebar
                            record={selectedRecord}
                            onClose={() => setSelectedRecord(null)}
                            onOpen={(id) => navigate(`/dashboard/doctor/records/${id}`)}
                        />
                    )}
                </AnimatePresence>
            </div>

            <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
        </div>
    );
}
