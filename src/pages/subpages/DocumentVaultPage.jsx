import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Lock, Search, ShieldCheck, Download, Share2, Plus, XCircle, 
    Folder, FileText, CheckCircle, ShieldAlert, Cpu, HardDrive
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function DocumentVaultPage() {
    const [user, setUser] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    
    // Category & Search filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Form states
    const [docName, setDocName] = useState('');
    const [category, setCategory] = useState('Prescription');
    const [fileSize, setFileSize] = useState('1.2 MB');
    const [encryption, setEncryption] = useState('AES-256 Bit');

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        const docRef = collection(db, 'vault_documents');
        const q = query(docRef, where('patientId', '==', user.uid));

        const unsub = onSnapshot(q, (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setDocuments(data);
            setLoading(false);
        }, (error) => {
            console.error('[DocumentVaultPage] Firestore error:', error);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    // Handle creating seed data if empty
    const handleInitializeVault = async () => {
        if (!user) return;
        try {
            const sampleDocs = [
                { docName: "Lipid Panel Lab Report.pdf", category: "Lab Report", fileSize: "2.4 MB", encryptionStatus: "AES-256", isVerified: true, uploadDate: "2026-05-10" },
                { docName: "Apex Insurance Policy Invoice.pdf", category: "Insurance", fileSize: "1.8 MB", encryptionStatus: "AES-256", isVerified: true, uploadDate: "2026-04-12" },
                { docName: "Cardiac Consult Summary Note.pdf", category: "Discharge Summary", fileSize: "4.1 MB", encryptionStatus: "AES-256", isVerified: true, uploadDate: "2026-05-14" }
            ];

            for (const item of sampleDocs) {
                await addDoc(collection(db, 'vault_documents'), {
                    patientId: user.uid,
                    ...item
                });
            }
        } catch (err) {
            console.error('Error seeding document vault:', err);
        }
    };

    const handleUploadDocument = async (e) => {
        e.preventDefault();
        if (!docName) return;

        try {
            await addDoc(collection(db, 'vault_documents'), {
                patientId: user.uid,
                docName: docName.endsWith('.pdf') ? docName : `${docName}.pdf`,
                category: category,
                fileSize: fileSize || '1.5 MB',
                encryptionStatus: encryption || 'AES-256',
                isVerified: true,
                uploadDate: new Date().toISOString().split('T')[0]
            });

            // Reset
            setDocName('');
            setCategory('Prescription');
            setFileSize('1.2 MB');
            setShowUploadModal(false);
        } catch (err) {
            console.error('Error uploading document metadata:', err);
        }
    };

    const categoriesList = ['All', 'Prescription', 'Lab Report', 'Insurance', 'Discharge Summary'];

    const filteredDocs = documents.filter(d => {
        const matchesSearch = d.docName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 bg-[#00C8D4]/10 border border-[#00C8D4]/20 rounded-full px-3 py-1 w-fit mb-3">
                        <Lock className="w-4 h-4 text-[#00C8D4] animate-pulse" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Digital Cryptography</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Secure Document Vault</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Review decentralized medical file folders secured via end-to-end local patient encryption keys.</p>
                </div>
                <div className="flex gap-3">
                    {documents.length === 0 && !loading && (
                        <button
                            onClick={handleInitializeVault}
                            className="px-4 py-2.5 rounded-xl border border-[#1E2D4580] text-xs font-bold hover:text-white"
                        >
                            Sync Sample Vault Files
                        </button>
                    )}
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)] hover:shadow-[0_0_30px_rgba(0,200,212,0.4)] transition-all"
                    >
                        <Plus className="w-4 h-4" /> Upload Document
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-10 h-10 rounded-full border-4 border-teal-500/10 border-t-teal-400 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-left">
                    {/* Left side category panel */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* Security stats card */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Vault Security Integrity</h4>
                            
                            <div className="space-y-3.5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                                        <ShieldCheck className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-[#8899AA] block">Key Provider</span>
                                        <span className="text-xs font-bold text-white">Personal Key (Decrypted)</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                        <Cpu className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-[#8899AA] block">Decentralized Storage</span>
                                        <span className="text-xs font-bold text-white">IPFS Interoperability</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Folder Filters */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Vault Folders</h4>
                            <div className="space-y-1">
                                {categoriesList.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                                            selectedCategory === cat
                                                ? 'bg-[#00C8D4]/10 border border-[#00C8D4]/20 text-[#00C8D4]'
                                                : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                                        }`}
                                    >
                                        <Folder className="w-4 h-4" />
                                        <span>{cat}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right side search & document grid */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Search input */}
                        <div className="relative">
                            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search vault files by filename or keyword..."
                                className="w-full bg-[#111827] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-2xl pl-12 pr-5 py-3 text-sm text-white focus:outline-none placeholder-slate-500"
                            />
                        </div>

                        {filteredDocs.length === 0 ? (
                            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-10 text-center text-slate-500">
                                Folder currently empty. Upload medical files to secure key logs.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {filteredDocs.map((docItem, idx) => (
                                    <motion.div
                                        key={docItem.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 flex flex-col justify-between"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                                                    <FileText className="w-4.5 h-4.5" />
                                                </div>
                                                <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-slate-800 text-slate-400 uppercase tracking-wider">
                                                    {docItem.category}
                                                </span>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">{docItem.docName}</h4>
                                                <span className="text-[10px] text-slate-500 block mt-1">{docItem.fileSize} • Uploaded {docItem.uploadDate}</span>
                                            </div>

                                            <div className="bg-[#0B0F1A]/60 border border-[#1E2D4580] rounded-xl p-2.5 flex items-center justify-between text-[10px]">
                                                <span className="text-slate-400">Encryption:</span>
                                                <span className="text-emerald-400 font-bold font-mono">{docItem.encryptionStatus}</span>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-[#1E2D4580] flex gap-2">
                                            <button className="flex-1 py-2 rounded-xl bg-[#0B0F1A] border border-[#1E2D4580] hover:border-[#00C8D4]/60 text-[10px] font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-all">
                                                <Share2 className="w-3.5 h-3.5" /> Share
                                            </button>
                                            <button className="flex-1 py-2 rounded-xl bg-[#0B0F1A] border border-[#1E2D4580] hover:border-emerald-500/60 text-[10px] font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-all">
                                                <Download className="w-3.5 h-3.5" /> Download
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Upload Document Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#111827] border border-[#1E2D4580] rounded-2xl max-w-md w-full p-6 space-y-6 relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00C8D4]/5 rounded-full blur-[40px] pointer-events-none" />

                            <div className="flex justify-between items-center border-b border-[#1E2D4580] pb-4">
                                <h3 className="font-display font-bold text-lg text-white">Upload Secure File</h3>
                                <button onClick={() => setShowUploadModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUploadDocument} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Document Name</label>
                                    <input
                                        type="text"
                                        value={docName}
                                        onChange={(e) => setDocName(e.target.value)}
                                        placeholder="e.g. Health Insurance Invoice"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Category</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        >
                                            <option value="Prescription">Prescription</option>
                                            <option value="Lab Report">Lab Report</option>
                                            <option value="Insurance">Insurance</option>
                                            <option value="Discharge Summary">Discharge Summary</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Simulated Size</label>
                                        <input
                                            type="text"
                                            value={fileSize}
                                            onChange={(e) => setFileSize(e.target.value)}
                                            placeholder="1.2 MB"
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Encryption Key Protocol</label>
                                    <input
                                        type="text"
                                        value={encryption}
                                        disabled
                                        className="w-full bg-[#0B0F1A]/50 border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-[#00C8D4] focus:outline-none font-mono"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)] hover:shadow-[0_0_30px_rgba(0,200,212,0.4)] transition-all mt-4"
                                >
                                    Verify Encrypt & Secure Vault
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
