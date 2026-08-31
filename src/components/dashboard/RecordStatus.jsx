import React from 'react';
import { motion } from 'framer-motion';

const statusConfig = {
    encrypted: {
        label: 'Encrypted',
        classes: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
        dotColor: 'bg-cyan-400',
        glow: 'shadow-[0_0_10px_rgba(0,245,255,0.3)]',
    },
    verified: {
        label: 'Verified',
        classes: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
        dotColor: 'bg-emerald-400',
        glow: 'shadow-[0_0_15px_rgba(52,211,153,0.4)]',
    },
    pending: {
        label: 'Pending',
        classes: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
        dotColor: 'bg-amber-400',
        glow: 'shadow-[0_0_15px_rgba(251,191,36,0.4)]',
    },
};

const RecordStatus = ({ status = 'encrypted' }) => {
    const config = statusConfig[status] || statusConfig.encrypted;

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${config.classes} ${config.glow}`}>
            <motion.span
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}
            />
            {config.label}
        </span>
    );
};

export default RecordStatus;
