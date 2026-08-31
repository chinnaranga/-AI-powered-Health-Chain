import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, FileText, Activity, Shield, BarChart3,
    Calendar, Filter, CheckCircle, Clock, Loader2,
    Database, FileDown, Table2, RefreshCw, Zap, Eye,
    ChevronRight, AlertTriangle, Brain, Lock
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { toast } from '../../components/Toast';

/* ── Report Types ── */
const REPORTS = [
    {
        id: 'patient-records',
        title: 'Patient Records Export',
        description: 'All encrypted medical records with metadata, timestamps, and IPFS hashes.',
        icon: FileText,
        color: 'text-[#00C8D4]',
        bg: 'bg-[#00C8D4]/10',
        border: 'border-[#00C8D4]/20',
        formats: ['PDF', 'CSV'],
        category: 'records',
        size: '~2.4 MB',
        lastGenerated: '2 days ago',
    },
    {
        id: 'audit-logs',
        title: 'Audit Log Report',
        description: 'Complete immutable blockchain audit trail with all access and verification events.',
        icon: Activity,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        formats: ['PDF', 'CSV'],
        category: 'audit',
        size: '~0.8 MB',
        lastGenerated: '1 day ago',
    },
    {
        id: 'consent-report',
        title: 'Consent & Compliance Report',
        description: 'All ABHA/ABDM consent artifacts, approved access records, and OTP sessions.',
        icon: Shield,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        formats: ['PDF'],
        category: 'compliance',
        size: '~0.4 MB',
        lastGenerated: '5 days ago',
    },
    {
        id: 'blockchain-verification',
        title: 'Blockchain Verification Report',
        description: 'On-chain transaction hashes, smart contract events, and network integrity proof.',
        icon: Lock,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        formats: ['PDF'],
        category: 'blockchain',
        size: '~0.6 MB',
        lastGenerated: '3 days ago',
    },
    {
        id: 'analytics-summary',
        title: 'Analytics Summary',
        description: 'Health trends, access frequency, medication adherence, and record activity analytics.',
        icon: BarChart3,
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
        formats: ['PDF', 'CSV'],
        category: 'analytics',
        size: '~1.2 MB',
        lastGenerated: '1 week ago',
    },
    {
        id: 'ai-summaries',
        title: 'AI Medical Summaries',
        description: 'All generated AI clinical summaries with source records and generation timestamps.',
        icon: Brain,
        color: 'text-teal-400',
        bg: 'bg-teal-500/10',
        border: 'border-teal-500/20',
        formats: ['PDF'],
        category: 'ai',
        size: '~0.9 MB',
        lastGenerated: 'Never',
    },
];



/* ── Simulated CSV generator ── */
function generateCSV(reportId) {
    const headers = {
        'patient-records': ['Record ID', 'File Name', 'Type', 'Upload Date', 'IPFS Hash', 'Encrypted'],
        'audit-logs': ['Event ID', 'Action', 'Actor', 'Patient', 'Timestamp', 'TX Hash'],
        'analytics-summary': ['Metric', 'Value', 'Trend', 'Period'],
    };
    const rows = {
        'patient-records': [
            ['REC-001', 'ECG_Report_2025.pdf', 'Cardiology', '2025-05-10', '0xQmABC...', 'Yes'],
            ['REC-002', 'BloodPanel_Dec2024.pdf', 'Lab Report', '2024-12-18', '0xQmDEF...', 'Yes'],
        ],
        'audit-logs': [
            ['LOG-001', 'RECORD_UPLOADED', 'Patient Self', 'Ravi Patel', '2025-05-10T10:12:00', '0x4f2a...'],
            ['LOG-002', 'OTP_VERIFIED', 'Dr. Sarah', 'Ravi Patel', '2025-05-11T14:32:00', '0x9c1b...'],
        ],
        'analytics-summary': [
            ['Avg Blood Pressure', '136/85', 'Improving', 'Last 6 months'],
            ['Fasting Sugar', '120 mg/dL', 'Improving', 'Last 6 months'],
        ],
    };
    const h = headers[reportId] || ['Field', 'Value'];
    const r = rows[reportId] || [['No data', 'available']];
    return [h, ...r].map(row => row.join(',')).join('\n');
}

/* ── Report Card ── */
function ReportCard({ report, onExport, isGenerating }) {
    const Icon = report.icon;
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className={`bg-[#111827] border ${report.border} rounded-2xl p-5 relative overflow-hidden group hover:border-opacity-60 transition-all duration-300`}>
            <div className={`absolute top-0 right-0 w-32 h-32 ${report.bg} rounded-full blur-[60px] opacity-20 pointer-events-none`} />
            <div className="flex items-start gap-4 mb-4">
                <div className={`w-11 h-11 rounded-xl ${report.bg} border ${report.border} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${report.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white font-display mb-1">{report.title}</h3>
                    <p className="text-xs text-[#8899AA] leading-relaxed">{report.description}</p>
                </div>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#4A5568] mb-4">
                <span className="flex items-center gap-1"><Database className="w-3 h-3" /> {report.size}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last: {report.lastGenerated}</span>
            </div>
            <div className="flex gap-2">
                {report.formats.map(fmt => (
                    <button key={fmt} onClick={() => onExport(report.id, fmt)}
                        disabled={isGenerating === `${report.id}-${fmt}`}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-all ${
                            isGenerating === `${report.id}-${fmt}`
                                ? 'border-[#00C8D4]/30 bg-[#00C8D4]/10 text-[#00C8D4] cursor-not-allowed'
                                : `${report.border} ${report.bg} ${report.color} hover:opacity-80`
                        }`}>
                        {isGenerating === `${report.id}-${fmt}` ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                        ) : (
                            <><FileDown className="w-3.5 h-3.5" /> {fmt}</>
                        )}
                    </button>
                ))}
            </div>
        </motion.div>
    );
}

/* ── Date Range Filter ── */
function DateRangeFilter({ value, onChange }) {
    const ranges = ['7D', '30D', '90D', '1Y', 'All'];
    return (
        <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#8899AA]" />
            <div className="flex bg-[#111827] border border-[#1E2D4580] rounded-xl p-1">
                {ranges.map(r => (
                    <button key={r} onClick={() => onChange(r)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${value === r ? 'bg-[#00C8D4]/15 text-[#00C8D4] border border-[#00C8D4]/30' : 'text-[#8899AA] hover:text-white border border-transparent'}`}>
                        {r}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ── PAGE ── */
export default function ReportsExportPage() {
    const [dateRange, setDateRange] = useState('30D');
    const [isGenerating, setIsGenerating] = useState(null);
    const [recentFiles, setRecentFiles] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState('all');

    const handleExport = async (reportId, format) => {
        const key = `${reportId}-${format}`;
        setIsGenerating(key);
        toast.loading(`Generating ${format} report...`);
        await new Promise(r => setTimeout(r, 2000));
        setIsGenerating(null);
        toast.dismiss();

        if (format === 'CSV') {
            const csv = generateCSV(reportId);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${reportId}_${dateRange}.csv`; a.click();
            URL.revokeObjectURL(url);
        } else {
            // PDF simulation — download a simple text blob labelled as PDF
            const report = REPORTS.find(r => r.id === reportId);
            const content = `HealthChain Medical Report\n\nReport: ${report?.title}\nDate Range: ${dateRange}\nGenerated: ${new Date().toLocaleString()}\n\nThis report is blockchain-verified and HIPAA compliant.`;
            const blob = new Blob([content], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `${reportId}_${dateRange}.pdf`; a.click();
            URL.revokeObjectURL(url);
        }

        const report = REPORTS.find(r => r.id === reportId);
        const newFile = { name: `${reportId}_${dateRange}.${format.toLowerCase()}`, type: format, size: report?.size || '—', date: 'Just now', status: 'ready' };
        setRecentFiles(prev => [newFile, ...prev.slice(0, 4)]);
        toast.success(`${format} report downloaded!`);
    };

    const categories = ['all', 'records', 'audit', 'compliance', 'blockchain', 'analytics', 'ai'];
    const filtered = categoryFilter === 'all' ? REPORTS : REPORTS.filter(r => r.category === categoryFilter);

    const kpis = [
        { label: 'Reports Generated', value: '24', icon: FileText, color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/20' },
        { label: 'Total Exports', value: '18', icon: Download, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        { label: 'Compliance Score', value: '98%', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        { label: 'Audit Ready', value: 'Yes', icon: CheckCircle, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <FileDown className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Compliance Export</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Reports & Export Center</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Generate, download, and archive reports for compliance and audits.</p>
                </div>
                <DateRangeFilter value={dateRange} onChange={setDateRange} />
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((k, i) => (
                    <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className={`bg-[#111827] border ${k.border} rounded-2xl p-5`}>
                        <div className={`w-10 h-10 rounded-xl ${k.bg} border ${k.border} flex items-center justify-center mb-3`}>
                            <k.icon className={`w-5 h-5 ${k.color}`} />
                        </div>
                        <p className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-1">{k.label}</p>
                        <p className={`text-2xl font-display font-bold ${k.color}`}>{k.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <Filter className="w-4 h-4 text-[#8899AA] flex-shrink-0" />
                {categories.map(c => (
                    <button key={c} onClick={() => setCategoryFilter(c)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap border transition-all flex-shrink-0 ${
                            categoryFilter === c ? 'bg-[#00C8D4]/15 text-[#00C8D4] border-[#00C8D4]/30' : 'bg-[#111827] text-[#8899AA] border-[#1E2D4580] hover:text-white hover:border-[#00C8D4]/20'
                        }`}>{c === 'all' ? 'All Reports' : c === 'ai' ? 'AI Summaries' : c.charAt(0).toUpperCase() + c.slice(1)}</button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Report Cards Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
                    {filtered.map((report, i) => (
                        <motion.div key={report.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                            <ReportCard report={report} onExport={handleExport} isGenerating={isGenerating} />
                        </motion.div>
                    ))}
                </div>

                {/* Recent Downloads */}
                <div className="space-y-4">
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-4 h-4 text-[#00C8D4]" />
                            <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">Recent Exports</h3>
                        </div>
                        <div className="space-y-3">
                            {recentFiles.map((f, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-[#0B0F1A] border border-[#1E2D4580] group hover:border-[#00C8D4]/20 transition-all">
                                    <div className="w-8 h-8 rounded-lg bg-[#1A2236] flex items-center justify-center flex-shrink-0">
                                        <FileDown className="w-4 h-4 text-[#8899AA]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-white truncate">{f.name}</p>
                                        <p className="text-[10px] font-mono text-[#4A5568]">{f.size} · {f.date}</p>
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${f.type === 'PDF' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>{f.type}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Compliance Notice */}
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Compliance Ready</h4>
                        </div>
                        <div className="space-y-2">
                            {['HIPAA Compliant Exports', 'Blockchain-Verified Hashes', 'AES-256 Encrypted Records', '7-Year Retention Policy'].map(s => (
                                <div key={s} className="flex items-center gap-2 text-xs text-[#8899AA]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
