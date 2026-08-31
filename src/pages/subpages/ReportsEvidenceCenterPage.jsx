import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    FileArchive, Download, Search, Calendar, FileText, CheckCircle, 
    Award, ShieldAlert, Sparkles, Brain, Lock, ExternalLink
} from 'lucide-react';

export default function ReportsEvidenceCenterPage() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');

    const reports = [
        { id: "REP-901", name: "Annual Physiological Telemetry Summary", type: "Clinical Report", date: "2026-05-18", size: "2.4 MB", blockchainHash: "0x3f5c...921a" },
        { id: "REP-902", name: "Consent Token Authorization Log audit", type: "Consent Audit", date: "2026-05-15", size: "1.2 MB", blockchainHash: "0x8e2a...c3d0" },
        { id: "REP-903", name: " Saint Jude Cardiologist Lab results Package", type: "Clinical Report", date: "2026-05-12", size: "4.8 MB", blockchainHash: "0x7b4a...f8e1" },
        { id: "REP-904", name: "HIPAA Interoperability Standards Compliance Index", type: "Compliance Audit", date: "2026-05-01", size: "950 KB", blockchainHash: "0x9d1c...8172" }
    ];

    const filtered = reports.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = category === 'All' || r.type === category;
        return matchSearch && matchCategory;
    });

    const triggerDownload = (reportName) => {
        alert(`Initiating verified download package for: ${reportName}\nVerifying cryptographic integrity hash on-chain...`);
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 bg-[#00C8D4]/10 border border-[#00C8D4]/20 rounded-full px-3 py-1 w-fit mb-3">
                        <FileArchive className="w-4 h-4 text-[#00C8D4] animate-pulse" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Compliance & Audits</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Reports & Evidence Center</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Export certified medical summaries, download system consent audits, and inspect blockchain verification logs.</p>
                </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                        type="text"
                        placeholder="Search document name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#111827] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {['All', 'Clinical Report', 'Consent Audit', 'Compliance Audit'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                category === cat ? 'bg-[#00C8D4] text-[#0B0F1A]' : 'bg-[#111827] border border-[#1E2D4580] hover:text-white'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Document grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                <div className="lg:col-span-2 space-y-4">
                    {filtered.length === 0 ? (
                        <div className="bg-[#111827] border border-[#1E2D4580] border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[250px]">
                            <FileArchive className="w-12 h-12 text-slate-600 mb-3" />
                            <h4 className="text-sm font-bold text-[#8899AA]">No Certified Reports Found</h4>
                        </div>
                    ) : (
                        filtered.map((rep) => (
                            <div
                                key={rep.id}
                                className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-teal-500/30 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                                        <FileText className="w-5.5 h-5.5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-white leading-tight">{rep.name}</h4>
                                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-bold font-mono">
                                                {rep.type}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-mono mt-1">
                                            <span>Date: {rep.date}</span>
                                            <span>• Size: {rep.size}</span>
                                            <span>• Ledger Hash: <span className="text-[#00C8D4]">{rep.blockchainHash}</span></span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => triggerDownload(rep.name)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00C8D4]/10 hover:bg-[#00C8D4]/20 border border-[#00C8D4]/30 text-[#00C8D4] text-xs font-bold transition-all"
                                >
                                    <Download className="w-4 h-4" /> Export
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Right Diagnostics Sidebar */}
                <div className="space-y-6">
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Cryptographic Ledger Cues</h4>

                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex gap-3 text-xs text-emerald-400 leading-relaxed">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <div>
                                <span className="font-bold">Ledger Integrity Cleared</span>
                                <p className="mt-1 text-slate-300">
                                    All compliance reports undergo automatic on-chain validation. Modification or access logs without consent are locked immediately.
                                </p>
                            </div>
                        </div>

                        <div className="bg-[#0B0F1A]/60 border border-[#1E2D4580] p-4 rounded-xl space-y-2.5 text-xs text-left">
                            <div className="flex justify-between items-center text-[10px] text-[#8899AA] font-mono">
                                <span>Audit Standard</span>
                                <span className="text-white font-bold">SOC2 / HIPAA</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-[#8899AA] font-mono">
                                <span>Blockchain Signer</span>
                                <span className="text-[#00C8D4] font-bold">0x98b1...32af</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
