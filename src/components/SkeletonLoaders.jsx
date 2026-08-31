import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable skeleton loader components for the HealthChain platform.
 * Usage: <SkeletonCard />, <SkeletonTable rows={5} />, <SkeletonList items={4} />
 */

/* ── Shimmer base ── */
function Shimmer({ className = '', rounded = 'rounded-lg' }) {
    return (
        <div className={`relative overflow-hidden bg-[#1A2236] ${rounded} ${className}`}>
            <motion.div
                className="absolute inset-0 -translate-x-full"
                animate={{ translateX: ['−100%', '100%'] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(0,200,212,0.06), transparent)',
                }}
            />
        </div>
    );
}

/* ── KPI card skeleton ── */
export function SkeletonKPI() {
    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
                <Shimmer className="w-9 h-9" rounded="rounded-xl" />
                <Shimmer className="w-12 h-3" />
            </div>
            <Shimmer className="w-24 h-2.5" />
            <Shimmer className="w-16 h-7" />
        </div>
    );
}

/* ── Generic card skeleton ── */
export function SkeletonCard({ lines = 3, hasHeader = true }) {
    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 space-y-4">
            {hasHeader && (
                <div className="flex items-center gap-3">
                    <Shimmer className="w-8 h-8" rounded="rounded-lg" />
                    <Shimmer className="w-36 h-3.5" />
                </div>
            )}
            <div className="space-y-2.5">
                {Array.from({ length: lines }).map((_, i) => (
                    <Shimmer key={i} className={`h-2.5 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
                ))}
            </div>
        </div>
    );
}

/* ── Table skeleton ── */
export function SkeletonTable({ rows = 5, cols = 4 }) {
    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex gap-4 px-5 py-3 border-b border-[#1E2D4580] bg-[#0B0F1A]/50">
                {Array.from({ length: cols }).map((_, i) => (
                    <Shimmer key={i} className="h-2.5 flex-1" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="flex items-center gap-4 px-5 py-4 border-b border-[#1E2D4580] last:border-0">
                    <div className="flex items-center gap-3 flex-[1.5]">
                        <Shimmer className="w-9 h-9" rounded="rounded-xl" />
                        <div className="space-y-1.5 flex-1">
                            <Shimmer className="h-2.5 w-28" />
                            <Shimmer className="h-2 w-20" />
                        </div>
                    </div>
                    {Array.from({ length: cols - 1 }).map((_, c) => (
                        <Shimmer key={c} className="h-2.5 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}

/* ── Notification list skeleton ── */
export function SkeletonList({ items = 4 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="bg-[#111827] border border-[#1E2D4580] rounded-xl p-4 flex gap-3">
                    <Shimmer className="w-10 h-10 flex-shrink-0" rounded="rounded-xl" />
                    <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                            <Shimmer className="h-2.5 w-40" />
                            <Shimmer className="h-2.5 w-14 ml-auto" />
                        </div>
                        <Shimmer className="h-2 w-full" />
                        <Shimmer className="h-2 w-3/4" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ── Chart skeleton ── */
export function SkeletonChart({ height = 200 }) {
    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-5">
                <Shimmer className="w-8 h-8" rounded="rounded-lg" />
                <Shimmer className="w-36 h-3.5" />
            </div>
            <div className="relative" style={{ height }}>
                {/* Y-axis lines */}
                {[0, 25, 50, 75].map(pct => (
                    <div key={pct} className="absolute left-0 right-0 border-t border-[#1E2D4580] flex items-center gap-2"
                        style={{ top: `${pct}%` }}>
                        <Shimmer className="w-6 h-2 flex-shrink-0" />
                    </div>
                ))}
                {/* Bars */}
                <div className="absolute inset-0 flex items-end gap-3 px-8 pt-4">
                    {[65, 80, 55, 90, 70, 85, 60].map((h, i) => (
                        <Shimmer key={i} rounded="rounded-t-md" className="flex-1 transition-all"
                            style={{ height: `${h}%` }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── Full page loader ── */
export function SkeletonPage({ title = true }) {
    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-6 animate-in">
            {title && (
                <div className="space-y-2">
                    <Shimmer className="w-48 h-4" />
                    <Shimmer className="w-72 h-8" />
                    <Shimmer className="w-96 h-3" />
                </div>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <SkeletonChart height={220} />
                <SkeletonChart height={220} />
            </div>
            <SkeletonTable rows={5} cols={4} />
        </div>
    );
}

export default Shimmer;
