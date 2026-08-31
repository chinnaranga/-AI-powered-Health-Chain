import { motion } from 'framer-motion';

export default function GlassCard({
    children,
    className = '',
    hover = true,
    glow = false,
    glowColor = 'cyan',
    padding = 'p-6',
    onClick,
    ...props
}) {
    const glowClasses = {
        cyan: 'glass-card-glow-cyan',
        teal: 'glass-card-glow-teal',
        emerald: 'glass-card-glow-emerald',
    };

    const baseClass = glow ? (glowClasses[glowColor] || glowClasses.cyan) : 'glass-card';

    return (
        <motion.div
            whileHover={hover ? { y: -3, scale: 1.008 } : {}}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClick}
            className={`
                ${baseClass}
                ${padding}
                ${hover ? 'transition-all duration-300 hover:bg-white/[0.07] hover:border-white/[0.12] cursor-pointer' : ''}
                ${className}
            `}
            {...props}
        >
            {children}
        </motion.div>
    );
}
