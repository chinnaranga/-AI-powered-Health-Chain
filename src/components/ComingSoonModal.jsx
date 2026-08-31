import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, HelpCircle, Shield } from 'lucide-react';

export default function ComingSoonModal({ isOpen, onClose, featureName }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
                    {/* Click outside to close */}
                    <div className="absolute inset-0" onClick={onClose} />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className="bg-[#0B0F1A]/90 border border-cyan-500/25 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,200,212,0.15)] relative overflow-hidden z-10"
                    >
                        {/* Decorative neon gradient glow */}
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
                        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex flex-col items-center text-center mt-4">
                            {/* Animated Lock Icon */}
                            <div className="relative mb-6">
                                <motion.div
                                    animate={{ 
                                        scale: [1, 1.05, 1],
                                        boxShadow: [
                                            "0 0 20px rgba(6, 182, 212, 0.2)",
                                            "0 0 35px rgba(6, 182, 212, 0.4)",
                                            "0 0 20px rgba(6, 182, 212, 0.2)"
                                        ]
                                    }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                    className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/35 flex items-center justify-center text-cyan-400"
                                >
                                    <Lock className="w-7 h-7" />
                                </motion.div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-500 border-2 border-[#0B0F1A] flex items-center justify-center">
                                    <Shield className="w-2.5 h-2.5 text-white" />
                                </div>
                            </div>

                            {/* Badge */}
                            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-3">
                                Future Module
                            </span>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-white mb-2 font-display">
                                {featureName || 'Advanced Module'}
                            </h3>

                            {/* Message */}
                            <p className="text-sm text-slate-300 leading-relaxed max-w-sm mb-6">
                                This feature is under development.
                            </p>

                            {/* Admin Note */}
                            <div className="w-full flex items-start gap-3 p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-left text-[11px] text-slate-400">
                                <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold text-white block mb-0.5">Administrator Note:</span>
                                    Enable instantly later from feature configuration.
                                </div>
                            </div>

                            {/* Dismiss button */}
                            <button
                                onClick={onClose}
                                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-[#00C8D4] text-[#0b0f1a] font-bold text-xs shadow-[0_0_20px_rgba(0,200,212,0.2)] hover:shadow-[0_0_30px_rgba(0,200,212,0.4)] transition-all"
                            >
                                Got it
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
