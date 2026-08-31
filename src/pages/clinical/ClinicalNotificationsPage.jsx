import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Shield, Upload, Zap, Brain, Activity, Key, CheckCircle,
    Trash2, Check, MailOpen, Clock, AlertTriangle, X, Filter,
    ShieldAlert, Eye, FileText, RefreshCw, Archive, Settings
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, where, onSnapshot, updateDoc, doc, writeBatch, deleteDoc } from 'firebase/firestore';
import useAuthStore from '../../store/authStore';
import { toast } from '../../components/Toast';

/* ── Config ── */
const CATEGORIES = [
    { key: 'all', label: 'All', icon: Bell },
    { key: 'access', label: 'Access', icon: Shield },
    { key: 'records', label: 'Records', icon: FileText },
    { key: 'emergency', label: 'Emergency', icon: Zap },
    { key: 'otp', label: 'OTP', icon: Key },
    { key: 'ai', label: 'AI', icon: Brain },
    { key: 'audit', label: 'Audit', icon: Activity },
];

const PRIORITY = {
    critical: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', bar: 'bg-red-400', glow: 'shadow-[0_0_12px_rgba(239,68,68,0.12)]' },
    high:     { label: 'High',     color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', bar: 'bg-amber-400', glow: '' },
    medium:   { label: 'Medium',   color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/30', bar: 'bg-[#00C8D4]', glow: '' },
    low:      { label: 'Low',      color: 'text-[#8899AA]', bg: 'bg-white/[0.04]', border: 'border-[#1E2D4580]', bar: 'bg-[#4A5568]', glow: '' },
};

const ICON_MAP = {
    emergency: { Icon: Zap,         color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20' },
    access:    { Icon: Shield,       color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
    otp:       { Icon: Key,          color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    ai:        { Icon: Brain,        color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    records:   { Icon: FileText,     color: 'text-[#00C8D4]',  bg: 'bg-[#00C8D4]/10',  border: 'border-[#00C8D4]/20' },
    audit:     { Icon: Activity,     color: 'text-teal-400',   bg: 'bg-teal-500/10',   border: 'border-teal-500/20' },
    default:   { Icon: Bell,         color: 'text-[#8899AA]',  bg: 'bg-white/[0.04]',  border: 'border-[#1E2D4580]' },
};

function timeAgo(ts) {
    const s = Math.floor((Date.now() - (typeof ts === 'number' ? ts : ts?.seconds * 1000 || Date.now())) / 1000);
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

/* ── Notification Card ── */
function NotificationCard({ n, onRead, onDelete }) {
    const pri = PRIORITY[n.priority] || PRIORITY.low;
    const { Icon, color, bg, border } = ICON_MAP[n.icon] || ICON_MAP.default;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -24, transition: { duration: 0.18 } }}
            className={`relative flex gap-4 p-4 rounded-xl border overflow-hidden group transition-all duration-300 ${
                n.read ? 'bg-[#111827]/60 border-[#1E2D4580]' : `bg-[#141E30]/80 ${pri.border} ${pri.glow}`
            }`}
        >
            {/* Priority bar */}
            <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full transition-all ${n.read ? 'bg-[#1E2D45]' : pri.bar}`} />

            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${n.read ? 'bg-[#1A2236] border-[#1E2D4580]' : `${bg} ${border}`}`}>
                <Icon className={`w-5 h-5 ${n.read ? 'text-[#4A5568]' : color}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-14">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className={`text-sm font-semibold leading-snug ${n.read ? 'text-slate-400' : 'text-white'}`}>{n.title}</h4>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#00C8D4] animate-ping flex-shrink-0" />}
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ml-auto flex-shrink-0 ${pri.bg} ${pri.border} ${pri.color}`}>
                        {pri.label}
                    </span>
                </div>
                <p className="text-xs text-[#8899AA] leading-relaxed mb-2">{n.message}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-[#4A5568] font-mono">
                    <Clock className="w-3 h-3" /><span>{timeAgo(n.timestamp)}</span>
                </div>
            </div>

            {/* Hover actions */}
            <div className="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!n.read && (
                    <button onClick={() => onRead(n.id)} title="Mark read"
                        className="p-1.5 rounded-lg bg-[#0B0F1A] border border-[#1E2D4580] hover:border-emerald-500/40 text-[#8899AA] hover:text-emerald-400 transition-colors">
                        <Check className="w-3.5 h-3.5" />
                    </button>
                )}
                <button onClick={() => onDelete(n.id)} title="Dismiss"
                    className="p-1.5 rounded-lg bg-[#0B0F1A] border border-[#1E2D4580] hover:border-red-500/40 text-[#8899AA] hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </motion.div>
    );
}

/* ── PAGE ── */
export default function ClinicalNotificationsPage() {
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    useEffect(() => {
        if (!user?.uid) { setNotifications([]); setIsLoading(false); return; }
        setIsLoading(true);
        const q = query(collection(db, 'notifications'), where('userId', '==', user.uid));
        const unsub = onSnapshot(q, snap => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            list.sort((a, b) => (b.timestamp?.seconds * 1000 || b.timestamp || 0) - (a.timestamp?.seconds * 1000 || a.timestamp || 0));
            setNotifications(list);
            setIsLoading(false);
        }, () => { setNotifications([]); setIsLoading(false); });
        return () => unsub();
    }, [user?.uid]);

    const markRead = async (id) => {
        try {
            await updateDoc(doc(db, 'notifications', id), { read: true });
            toast.success('Marked as read');
        } catch {
            toast.error('Failed to update status');
        }
    };

    const deleteNotif = async (id) => {
        try {
            await deleteDoc(doc(db, 'notifications', id));
            toast.success('Dismissed');
        } catch {
            toast.error('Failed to dismiss notification');
        }
    };

    const markAllRead = async () => {
        const unread = notifications.filter(n => !n.read);
        if (!unread.length) return;
        toast.loading('Marking all as read...');
        try {
            const batch = writeBatch(db);
            unread.forEach(n => batch.update(doc(db, 'notifications', n.id), { read: true }));
            await batch.commit();
            toast.dismiss();
            toast.success(`Marked ${unread.length} as read`);
        } catch {
            toast.dismiss();
            toast.error('Failed to update status');
        }
    };

    const clearAll = async () => {
        if (!notifications.length) return;
        toast.loading('Clearing all...');
        try {
            const batch = writeBatch(db);
            notifications.forEach(n => batch.delete(doc(db, 'notifications', n.id)));
            await batch.commit();
            toast.dismiss();
            toast.success('All cleared');
        } catch {
            toast.dismiss();
            toast.error('Failed to clear notifications');
        }
    };

    let filtered = activeCategory === 'all' ? notifications : notifications.filter(n => n.category === activeCategory);
    if (showUnreadOnly) filtered = filtered.filter(n => !n.read);

    const unreadCount = notifications.filter(n => !n.read).length;
    const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.read).length;

    const catCounts = CATEGORIES.reduce((acc, c) => {
        acc[c.key] = c.key === 'all' ? notifications.length : notifications.filter(n => n.category === c.key).length;
        return acc;
    }, {});

    return (
        <div className="max-w-4xl mx-auto pb-12 flex flex-col h-[calc(100vh-120px)] space-y-5">

            {/* Header */}
            <div className="flex-shrink-0 flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Bell className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Clinical Alert Stream</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="text-sm bg-[#00C8D4]/15 text-[#00C8D4] border border-[#00C8D4]/30 px-2.5 py-1 rounded-xl font-bold">{unreadCount} new</span>
                        )}
                        {criticalCount > 0 && (
                            <span className="text-sm bg-red-500/15 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" /> {criticalCount} critical
                            </span>
                        )}
                    </h2>
                    <p className="text-sm text-[#8899AA] mt-1">Real-time clinical alerts, access events, and audit notifications.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => setShowUnreadOnly(v => !v)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${showUnreadOnly ? 'bg-[#00C8D4]/15 text-[#00C8D4] border-[#00C8D4]/30' : 'bg-[#1A2236] border-[#1E2D4580] text-[#8899AA] hover:text-white'}`}>
                        <Eye className="w-3.5 h-3.5" /> Unread Only
                    </button>
                    {unreadCount > 0 && (
                        <button onClick={markAllRead} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1A2236] border border-[#1E2D4580] text-xs font-bold text-[#8899AA] hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                            <CheckCircle className="w-3.5 h-3.5" /> Mark All Read
                        </button>
                    )}
                    <button onClick={clearAll} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1A2236] border border-[#1E2D4580] text-xs font-bold text-[#8899AA] hover:text-red-400 hover:border-red-500/30 transition-all">
                        <X className="w-3.5 h-3.5" /> Clear All
                    </button>
                </div>
            </div>

            {/* Critical Alert Banner */}
            <AnimatePresence>
                {criticalCount > 0 && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="flex-shrink-0 bg-red-500/10 border border-red-500/40 rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.08)]">
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)] flex-shrink-0" />
                        <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-300 font-semibold">{criticalCount} critical alert{criticalCount > 1 ? 's' : ''} require{criticalCount === 1 ? 's' : ''} your immediate attention.</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category Tabs */}
            <div className="flex-shrink-0 flex items-center gap-2 overflow-x-auto pb-1">
                {CATEGORIES.map(cat => {
                    const CatIcon = cat.icon;
                    const cnt = catCounts[cat.key] || 0;
                    return (
                        <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border flex-shrink-0 transition-all ${
                                activeCategory === cat.key
                                    ? 'bg-[#00C8D4]/15 text-[#00C8D4] border-[#00C8D4]/30'
                                    : 'bg-[#111827] text-[#8899AA] border-[#1E2D4580] hover:text-white hover:border-[#00C8D4]/20'
                            }`}>
                            <CatIcon className="w-3.5 h-3.5" />
                            {cat.label}
                            {cnt > 0 && (
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${activeCategory === cat.key ? 'bg-[#00C8D4]/20 text-[#00C8D4]' : 'bg-[#1A2236] text-[#8899AA]'}`}>{cnt}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Feed */}
            <div className="flex-1 overflow-y-auto bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 space-y-3">
                {isLoading ? (
                    <div className="flex flex-col items-center py-16 gap-3">
                        <RefreshCw className="w-7 h-7 text-[#00C8D4] animate-spin" />
                        <p className="text-sm text-[#8899AA] font-mono">Connecting clinical event pipeline...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center py-16 gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-[#1A2236] border border-[#1E2D4580] flex items-center justify-center">
                            <MailOpen className="w-7 h-7 text-[#4A5568]" />
                        </div>
                        <p className="text-white font-semibold">No notifications</p>
                        <p className="text-xs text-[#8899AA]">{showUnreadOnly ? 'All caught up — no unread alerts.' : 'No alerts in this category.'}</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {filtered.map(n => <NotificationCard key={n.id} n={n} onRead={markRead} onDelete={deleteNotif} />)}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
