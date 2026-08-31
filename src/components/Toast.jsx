import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { create } from 'zustand';

// Toast store for global access
export const useToastStore = create((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = Date.now() + Math.random();
        set((state) => ({
            toasts: [...state.toasts, { id, duration: 4000, ...toast }],
        }));
        return id;
    },
    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
}));

// Convenience functions
export const toast = {
    success: (message) => useToastStore.getState().addToast({ type: 'success', message }),
    error: (message) => useToastStore.getState().addToast({ type: 'error', message }),
    warning: (message) => useToastStore.getState().addToast({ type: 'warning', message }),
    info: (message) => useToastStore.getState().addToast({ type: 'info', message }),
};

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const colors = {
    success: 'border-emerald-500/30 text-emerald-400',
    error: 'border-red-500/30 text-red-400',
    warning: 'border-amber-500/30 text-amber-400',
    info: 'border-cyan-500/30 text-cyan-400',
};

function ToastItem({ toast: t, onRemove }) {
    const Icon = icons[t.type] || Info;

    useEffect(() => {
        const timer = setTimeout(() => onRemove(t.id), t.duration);
        return () => clearTimeout(timer);
    }, [t.id, t.duration, onRemove]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl bg-navy-900/90
        shadow-glass min-w-[300px] max-w-[420px]
        ${colors[t.type]}
      `}
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm text-slate-200 flex-1">{t.message}</p>
            <button onClick={() => onRemove(t.id)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

export default function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    const handleRemove = useCallback((id) => {
        removeToast(id);
    }, [removeToast]);

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onRemove={handleRemove} />
                ))}
            </AnimatePresence>
        </div>
    );
}
