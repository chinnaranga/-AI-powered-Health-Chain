import React from 'react';
import { motion } from 'framer-motion';

// ── Base Card ────────────────────────────────────────────────────────────────
export const Card = ({ children, className = '', accent = null, ...props }) => (
    <div
        className={`bg-slate-800 border border-slate-700 rounded-xl shadow-soft ${accent ? `border-l-4 border-l-${accent}` : ''} ${className}`}
        {...props}
    >
        {children}
    </div>
);

// ── Primary Button ────────────────────────────────────────────────────────────
export const Button = ({
    children, onClick, variant = 'primary', type = 'button',
    className = '', disabled = false, size = 'md', ...props
}) => {
    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-2.5 text-sm',
    };
    const variants = {
        primary: 'bg-teal-600 hover:bg-teal-500 text-white',
        secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600',
        danger: 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30',
        ghost: 'text-slate-300 hover:bg-slate-700 hover:text-white',
        blue: 'bg-blue-600 hover:bg-blue-500 text-white',
        purple: 'bg-purple-600 hover:bg-purple-500 text-white',
        outline: 'border border-slate-600 text-slate-300 hover:bg-slate-700',
    };
    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            whileHover={disabled ? {} : { scale: 1.02 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
            className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    );
};

// ── Badge / Status Tag ────────────────────────────────────────────────────────
export const Badge = ({ label, variant = 'default' }) => {
    const variants = {
        default: 'bg-slate-700 text-slate-300',
        success: 'bg-teal-900/50 text-teal-400',
        warning: 'bg-amber-900/50 text-amber-400',
        danger: 'bg-red-900/50 text-red-400',
        info: 'bg-blue-900/50 text-blue-400',
        purple: 'bg-purple-900/50 text-purple-400',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${variants[variant]}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
            {label}
        </span>
    );
};

// ── Section Header ────────────────────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle, action }) => (
    <div className="flex items-start justify-between mb-5">
        <div>
            <h3 className="text-base font-semibold text-slate-100">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
    </div>
);

// ── Input ─────────────────────────────────────────────────────────────────────
export const Input = ({ label, className = '', ...props }) => (
    <div className={className}>
        {label && <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">{label}</label>}
        <input
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors"
            {...props}
        />
    </div>
);

// ── StatItem ──────────────────────────────────────────────────────────────────
export const StatItem = ({ label, value, sub, icon: Icon, accent = 'teal' }) => {
    const colors = { teal: 'text-teal-400', blue: 'text-blue-400', purple: 'text-purple-400', amber: 'text-amber-400', red: 'text-red-400' };
    return (
        <div className="flex items-center gap-4 p-5 bg-slate-800 border border-slate-700 rounded-xl">
            {Icon && (
                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                    <Icon className={`w-5 h-5 ${colors[accent]}`} />
                </div>
            )}
            <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">{label}</p>
                <p className={`text-2xl font-semibold mt-0.5 ${colors[accent]}`}>{value}</p>
                {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
};

// ── Divider ───────────────────────────────────────────────────────────────────
export const Divider = ({ className = '' }) => (
    <hr className={`border-slate-700 ${className}`} />
);

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        {Icon && <Icon className="w-10 h-10 text-slate-600 mb-3" />}
        <p className="text-sm font-medium text-slate-400">{title}</p>
        {description && <p className="text-xs text-slate-500 mt-1 max-w-xs">{description}</p>}
    </div>
);

// Legacy aliases (keep pages that import GlassCard/NeonButton working)
export const GlassCard = ({ children, className = '', ...props }) => (
    <div className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 ${className}`} {...props}>{children}</div>
);
export const NeonButton = ({ children, ...props }) => (
    <Button {...props}>{children}</Button>
);
