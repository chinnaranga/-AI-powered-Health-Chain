import React from 'react';

export function CardSkeleton() {
    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 animate-pulse space-y-4">
            <div className="flex items-center justify-between">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-6 bg-slate-800 rounded w-16" />
            </div>
            <div className="h-3 bg-slate-800 rounded w-2/3" />
            <div className="space-y-2 pt-2">
                <div className="h-2 bg-slate-800 rounded w-full" />
                <div className="h-2 bg-slate-800 rounded w-5/6" />
            </div>
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <tr className="animate-pulse border-b border-[#1E2D4580]/50">
            <td className="p-4"><div className="h-3.5 bg-slate-800 rounded w-24" /></td>
            <td className="p-4"><div className="h-3.5 bg-slate-800 rounded w-44" /></td>
            <td className="p-4"><div className="h-3.5 bg-slate-800 rounded w-36" /></td>
            <td className="p-4"><div className="h-3.5 bg-slate-800 rounded w-16" /></td>
        </tr>
    );
}

export function SkeletonLoader({ type = 'card', count = 1 }) {
    const skeletons = Array(count).fill(0);
    return (
        <div className="space-y-4 w-full">
            {skeletons.map((_, i) => (
                type === 'table' ? <TableRowSkeleton key={i} /> : <CardSkeleton key={i} />
            ))}
        </div>
    );
}
export default SkeletonLoader;
