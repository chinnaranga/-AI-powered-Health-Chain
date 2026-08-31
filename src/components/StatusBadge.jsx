const statusStyles = {
    verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    revoked: 'bg-red-500/10 text-red-400 border-red-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    syncing: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    offline: 'bg-white/5 text-slate-400 border-white/10',
};

const dotColors = {
    verified: 'bg-emerald-500',
    active: 'bg-emerald-500',
    pending: 'bg-amber-500',
    revoked: 'bg-red-500',
    error: 'bg-red-500',
    syncing: 'bg-cyan-500 animate-pulse',
    offline: 'bg-slate-500',
};

export default function StatusBadge({ status, label, className = '' }) {
    const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

    return (
        <span
            className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
        ${statusStyles[status] || statusStyles.pending}
        ${className}
      `}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status] || dotColors.pending}`} />
            {displayLabel}
        </span>
    );
}
