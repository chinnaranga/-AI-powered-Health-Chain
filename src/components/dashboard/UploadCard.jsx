import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Image, File, CheckCircle, X, CloudUpload } from 'lucide-react';
import { GlassCard, NeonButton } from '../UIComponents';

const fileIcons = {
    'application/pdf': { icon: FileText, color: 'text-red-400', label: 'PDF' },
    'image/jpeg': { icon: Image, color: 'text-blue-400', label: 'JPG' },
    'image/png': { icon: Image, color: 'text-emerald-400', label: 'PNG' },
    'image/webp': { icon: Image, color: 'text-purple-400', label: 'WEBP' },
};

const UploadCard = ({ onUpload, uploading }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const inputRef = useRef(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
            setUploadSuccess(false);
        }
    }, []);

    const handleFileSelect = (e) => {
        if (e.target.files?.[0]) {
            setSelectedFile(e.target.files[0]);
            setUploadSuccess(false);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || uploading) return;

        // Simulate progress
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) { clearInterval(interval); return 90; }
                return prev + Math.random() * 15;
            });
        }, 200);

        try {
            await onUpload(selectedFile);
            clearInterval(interval);
            setProgress(100);
            setUploadSuccess(true);
            setTimeout(() => {
                setSelectedFile(null);
                setProgress(0);
                setUploadSuccess(false);
            }, 3000);
        } catch (err) {
            clearInterval(interval);
            setProgress(0);
        }
    };

    const fileInfo = selectedFile ? (fileIcons[selectedFile.type] || { icon: File, color: 'text-slate-400', label: 'FILE' }) : null;
    const FileIcon = fileInfo?.icon;

    return (
        <GlassCard className="h-full flex flex-col relative overflow-hidden group/card" hover={true}>
            {/* Background Glow Detail */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl group-hover/card:bg-cyan-500/20 transition-all duration-700" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <CloudUpload className="w-6 h-6 text-[#00F5FF]" />
                        Upload Medical Record
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Securely store records on IPFS node</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[#00F5FF] text-[10px] font-bold tracking-wider uppercase shadow-[0_0_10px_rgba(0,245,255,0.2)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00F5FF] animate-pulse" />
                        IPFS Storage Active
                    </span>
                </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !selectedFile && inputRef.current?.click()}
                className={`relative flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-500 cursor-pointer overflow-hidden ${dragActive
                    ? 'border-[#00F5FF] bg-cyan-500/10 shadow-[0_0_40px_rgba(0,245,255,0.2)] scale-[1.02]'
                    : selectedFile
                        ? 'border-white/20 bg-white/5'
                        : 'border-white/10 hover:border-[#00F5FF]/50 hover:bg-white/5'
                    }`}
            >
                {/* Animated Border Dash Offset (Simulated via overlay for enterprise feel) */}
                {dragActive && (
                    <motion.div
                        className="absolute inset-0 z-0 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="absolute inset-0 border-2 border-[#00F5FF] rounded-2xl animate-[pulse_2s_infinite]" />
                    </motion.div>
                )}

                <input ref={inputRef} type="file" className="hidden" onChange={handleFileSelect} accept=".pdf,.jpg,.jpeg,.png,.webp" />

                <AnimatePresence mode="wait">
                    {uploadSuccess ? (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative z-10 py-4 flex flex-col items-center"
                        >
                            <motion.div
                                initial={{ scale: 0.5 }}
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                                className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(52,211,153,0.3)]"
                            >
                                <CheckCircle className="w-10 h-10 text-emerald-400" />
                            </motion.div>
                            <h4 className="text-emerald-400 text-lg font-bold">Mined Successfully</h4>
                            <p className="text-slate-400 text-xs mt-2 font-mono tracking-tight">Block #482,921 Verified</p>
                        </motion.div>
                    ) : selectedFile ? (
                        <motion.div
                            key="file"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative z-10 w-full"
                        >
                            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-navy-900/50 border border-white/10">
                                <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-lg ${fileInfo.color}`}>
                                    <FileIcon className="w-6 h-6" />
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                    <p className="text-white font-bold text-sm truncate">{selectedFile.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-500">{fileInfo.label}</span>
                                        <span className="text-[10px] text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setProgress(0); }}
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Progress & UI Buttons */}
                            <div className="space-y-4">
                                {progress > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                                            <span>Encryption Progress</span>
                                            <span>{Math.round(progress)}%</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-navy-900 border border-white/5 overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-[#00F5FF] via-cyan-400 to-emerald-400 shadow-[0_0_15px_rgba(0,245,255,0.5)]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <NeonButton
                                    onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                                    disabled={uploading}
                                    className="w-full py-4 group/btn"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin mr-2" />
                                            Mining to Node...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4 group-hover/btn:-translate-y-1 transition-transform" />
                                            Initialize On-Chain Sync
                                        </>
                                    )}
                                </NeonButton>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative z-10 flex flex-col items-center"
                        >
                            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Upload className="w-8 h-8 text-[#00F5FF] drop-shadow-[0_0_10px_rgba(0,245,255,0.5)]" />
                                </motion.div>
                            </div>
                            <h4 className="text-white text-lg font-bold mb-2">Initialize Pulse Upload</h4>
                            <p className="text-slate-500 text-sm max-w-[200px] mx-auto mb-6">Drag & drop medical files to verify on the decentralized network</p>

                            <div className="flex items-center gap-3">
                                {['PDF', 'JPG', 'PNG'].map(type => (
                                    <span key={type} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                        {type}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GlassCard>
    );
};

export default UploadCard;
