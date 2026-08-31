import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope } from 'lucide-react';

/**
 * Fullscreen loading overlay aligned with the premium futuristic HealthChain medical theme.
 * Used during authentication state hydration and redirect locks.
 */
export default function LoadingOverlay({ message = "Initializing Vault Guard..." }) {
    return (
        <div className="min-h-screen bg-[#070b14] flex items-center justify-center flex-col gap-5 text-white relative overflow-hidden">
            {/* Soft Ambient Cyan Backlight */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(0, 200, 212, 0.015) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

            <div className="relative w-20 h-20 mb-2 z-10">
                {/* Double spinning glowing rings */}
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/10 border-t-cyan-400 animate-spin" style={{ animationDuration: '1s' }} />
                <div className="absolute inset-2 rounded-full border-4 border-blue-500/10 border-t-[#00C8D4] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.4s' }} />
                
                {/* Center glowing Stethoscope Icon */}
                <div className="absolute inset-4 rounded-xl bg-[#0f1524] border border-cyan-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,200,212,0.15)]">
                    <Stethoscope className="w-5 h-5 text-cyan-400" />
                </div>
            </div>
            
            {/* Animated Loading Text */}
            <motion.p 
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-xs text-cyan-400 uppercase tracking-widest font-semibold font-display z-10"
            >
                {message}
            </motion.p>
        </div>
    );
}
