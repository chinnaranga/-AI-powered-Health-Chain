import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function NeonButton({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon,
    className = '',
    onClick,
    type = 'button',
    ...props
}) {
    const variants = {
        primary: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/30 hover:shadow-neon hover:border-cyan-400/60',
        success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30 hover:shadow-neon-green hover:border-emerald-400/60',
        danger: 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30 hover:shadow-neon-red hover:border-red-400/60',
        ghost: 'bg-transparent text-slate-400 border-white/10 hover:bg-white/5 hover:text-white hover:border-white/20',
        solid: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent hover:from-cyan-400 hover:to-blue-500 hover:shadow-neon',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs gap-1.5',
        md: 'px-5 py-2.5 text-sm gap-2',
        lg: 'px-8 py-3.5 text-base gap-2.5',
    };

    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={`
        inline-flex items-center justify-center font-semibold rounded-xl border
        transition-all duration-300 
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
            {...props}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : Icon ? (
                <Icon className="w-4 h-4" />
            ) : null}
            {children}
        </motion.button>
    );
}
