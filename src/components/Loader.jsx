import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function Spinner({ size = 'md', className = '' }) {
    const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
    return <Loader2 className={`animate-spin text-cyan-400 ${sizes[size]} ${className}`} />;
}

export function SkeletonLine({ width = 'w-full', height = 'h-4', className = '' }) {
    return (
        <div className={`skeleton-shimmer rounded ${width} ${height} ${className}`} />
    );
}

export function SkeletonCard({ lines = 3, className = '' }) {
    return (
        <div className={`glass-card p-6 space-y-4 ${className}`}>
            <SkeletonLine width="w-1/3" height="h-5" />
            {Array.from({ length: lines }).map((_, i) => (
                <SkeletonLine key={i} width={i === lines - 1 ? 'w-2/3' : 'w-full'} />
            ))}
        </div>
    );
}

export function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
            >
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-cyan-400/50 animate-spin-slow" />
                </div>
                <p className="text-sm text-slate-400 font-medium tracking-wide">Loading HealthChain...</p>
            </motion.div>
        </div>
    );
}

export default Spinner;
