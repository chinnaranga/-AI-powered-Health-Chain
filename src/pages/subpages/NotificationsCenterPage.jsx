import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, ShieldAlert, Upload, Zap, Brain, Activity,
    Key, CheckCircle, Trash2, Check, MailOpen, Clock,
    AlertTriangle, Shield, Filter, X
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, where, onSnapshot, updateDoc, doc, writeBatch, deleteDoc, addDoc } from 'firebase/firestore';
import useAuthStore from '../../store/authStore';
import { toast } from '../../components/Toast';

const CATEGORIES = [
    { key: 'all', label: 'All', icon: Bell },
    { key: 'access', label: 'Access', icon: Shield },
    { key: 'records', label: 'Records', icon: Upload },
    { key: 'emergency', label: 'Emergency', icon: Zap },
    { key: 'ai', label: 'AI', icon: Brain },
    { key: 'audit', label: 'Audit', icon: Activity },
];

const PRIORITY_CONFIG = {
    critical: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', leftBar: 'bg-red-400' },
    high: { label: 'High', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', leftBar: 'bg-amber-400' },
    medium: { label: 'Medium', color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/30', leftBar: 'bg-[#00C8D4]' },
    low: { label: 'Low', color: 'text-[#8899AA]', bg: 'bg-white/5', border: 'border-[#1E2D4580]', leftBar: 'bg-[#4A5568]' },
};

const iconMap = {
    emergency: { Icon: Zap, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    access: { Icon: Shield, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    ai: { Icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    records: { Icon: Upload, color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/20' },
    audit: { Icon: Activity, color: 'text-[#8899AA]', bg: 'bg-white/5', border: 'border-[#1E2D4580]' },
    default: { Icon: Bell, color: 'text-[#8899AA]', bg: 'bg-white/5', border: 'border-[#1E2D4580]' },
};

function timeAgo(ts) {
    const s = Math.floor((Date.now() - (typeof ts === 'number' ? ts : ts?.seconds * 1000 || Date.now())) / 1000);
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

function NotificationCard({ n, onRead, onDelete }) {
    const pri = PRIORITY_CONFIG[n.priority] || PRIORITY_CONFIG.low;
    const { Icon, color, bg, border } = iconMap[n.icon] || iconMap.default;

    return (
        <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -30, transition: { duration: 0.18 } }}
            className={`relative flex gap-4 p-4 rounded-xl border overflow-hidden group transition-all duration-300 ${
                n.read ? 'bg-[#111827]/60 border-[#1E2D4580]' : `bg-[#1A2538]/70 ${pri.border} shadow-[0_0_15px_rgba(0,0,0,0.2)]`
            }`}>
            {/* Priority left bar */}
            <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${n.read ? 'bg-[#1E2D45]' : pri.leftBar}`} />

            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${n.read ? 'bg-[#1A2236] border-[#1E2D4580]' : `${bg} ${border}`}`}>
                <Icon className={`w-5 h-5 ${n.read ? 'text-[#4A5568]' : color}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-12">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className={`text-sm font-semibold ${n.read ? 'text-slate-400' : 'text-white'}`}>{n.title}</h4>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#00C8D4] animate-ping flex-shrink-0" />}
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ml-auto ${pri.bg} ${pri.border} ${pri.color}`}>{pri.label}</span>
                </div>
                <p className="text-xs text-[#8899AA] leading-relaxed mb-2">{n.message}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-[#4A5568] font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{timeAgo(n.timestamp)}</span>
                </div>
            </div>

            {/* Hover Actions */}
            <div className="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!n.read && (
                    <button onClick={() => onRead(n.id)} title="Mark read"
                        className="p-1.5 rounded-lg bg-[#111827] border border-[#1E2D4580] hover:border-emerald-500/30 text-[#8899AA] hover:text-emerald-400 transition-colors">
                        <Check className="w-3.5 h-3.5" />
                    </button>
                )}
                <button onClick={() => onDelete(n.id)} title="Dismiss"
                    className="p-1.5 rounded-lg bg-[#111827] border border-[#1E2D4580] hover:border-red-500/30 text-[#8899AA] hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </motion.div>
    );
}

/* ── PAGE ── */
export default function NotificationsCenterPage() {
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        if (!user?.uid) { setNotifications([]); setIsLoading(false); return; }
        setIsLoading(true);
        const q = query(collection(db, 'notifications'), where('userId', '==', user.uid));
        const unsub = onSnapshot(q, async (snap) => {
            if (snap.empty) {
                const initialNotifications = [
                    {
                        category: 'emergency', priority: 'critical', read: false,
                        title: 'Emergency Access Invoked',
                        message: 'Dr. Arun Kumar at City General invoked emergency break-glass access. All records temporarily accessible.',
                        timestamp: Date.now() - 1000 * 60 * 5,
                        icon: 'emergency',
                        userId: user.uid
                    },
                    {
                        category: 'access', priority: 'high', read: false,
                        title: 'New Access Request',
                        message: 'Dr. Sarah Patel (Apollo Hospital, Cardiology) has requested access to your ECG and blood panel records.',
                        timestamp: Date.now() - 1000 * 60 * 25,
                        icon: 'access',
                        userId: user.uid
                    },
                    {
                        category: 'ai', priority: 'medium', read: false,
                        title: 'AI Summary Ready',
                        message: 'Your AI Medical Summary for Blood Panel Report has been generated and is ready to review.',
                        timestamp: Date.now() - 1000 * 60 * 60,
                        icon: 'ai',
                        userId: user.uid
                    },
                    {
                        category: 'records', priority: 'medium', read: true,
                        title: 'New Record Uploaded',
                        message: 'ECG Report 2025.pdf was successfully encrypted and uploaded to IPFS.',
                        timestamp: Date.now() - 1000 * 60 * 60 * 3,
                        icon: 'records',
                        userId: user.uid
                    },
                    {
                        category: 'access', priority: 'medium', read: true,
                        title: 'OTP Sent Successfully',
                        message: 'A 6-digit OTP was sent to Dr. Sarah Patel for your approved access request.',
                        timestamp: Date.now() - 1000 * 60 * 60 * 5,
                        icon: 'access',
                        userId: user.uid
                    },
                    {
                        category: 'audit', priority: 'low', read: true,
                        title: 'Blockchain Ledger Synced',
                        message: 'All 14 audit events have been committed to block #492810 on Mainnet.',
                        timestamp: Date.now() - 1000 * 60 * 60 * 24,
                        icon: 'audit',
                        userId: user.uid
                    },
                    {
                        category: 'audit', priority: 'low', read: true,
                        title: 'Session Expired',
                        message: 'Access session for Dr. James automatically expired after the 15-minute timeout.',
                        timestamp: Date.now() - 1000 * 60 * 60 * 36,
                        icon: 'audit',
                        userId: user.uid
                    }
                ];
                for (const notif of initialNotifications) {
                    await addDoc(collection(db, 'notifications'), notif);
                }
                return;
            }
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
            toast.error('Failed to update');
        }
    };

    const deleteNotif = async (id) => {
        try {
            await deleteDoc(doc(db, 'notifications', id));
            toast.success('Notification dismissed');
        } catch {
            toast.error('Failed to dismiss notification');
        }
    };

    const markAllRead = async () => {
        const unread = notifications.filter(n => !n.read);
        if (!unread.length) return;
        try {
            const batch = writeBatch(db);
            unread.forEach(n => batch.update(doc(db, 'notifications', n.id), { read: true }));
            await batch.commit();
            toast.success(`Marked ${unread.length} as read`);
        } catch {
            toast.error('Failed to mark all as read');
        }
    };

    const clearAll = async () => {
        if (!notifications.length) return;
        try {
            const batch = writeBatch(db);
            notifications.forEach(n => batch.delete(doc(db, 'notifications', n.id)));
            await batch.commit();
            toast.success('All notifications cleared');
        } catch {
            toast.error('Failed to clear notifications');
        }
    };

    const filtered = activeCategory === 'all'
        ? notifications
        : notifications.filter(n => n.category === activeCategory);

    const unreadCount = notifications.filter(n => !n.read).length;
    const categoryCounts = CATEGORIES.reduce((acc, c) => {
        acc[c.key] = c.key === 'all' ? notifications.length : notifications.filter(n => n.category === c.key).length;
        return acc;
    }, {});

    return (
        <div className="max-w-4xl mx-auto pb-12 space-y-6 h-[calc(100vh-120px)] flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Bell className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Alert Center</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="text-sm bg-[#00C8D4]/15 text-[#00C8D4] border border-[#00C8D4]/30 px-2.5 py-1 rounded-xl font-bold">
                                {unreadCount} unread
                            </span>
                        )}
                    </h2>
                    <p className="text-sm text-[#8899AA] mt-1">Real-time healthcare alerts and system events.</p>
                </div>
                <div className="flex items-center gap-2">
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

            {/* Category Tabs */}
            <div className="flex-shrink-0 flex items-center gap-2 overflow-x-auto pb-1">
                {CATEGORIES.map(cat => {
                    const CatIcon = cat.icon;
                    const count = categoryCounts[cat.key] || 0;
                    return (
                        <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0 ${
                                activeCategory === cat.key
                                    ? 'bg-[#00C8D4]/15 text-[#00C8D4] border-[#00C8D4]/30'
                                    : 'bg-[#111827] text-[#8899AA] border-[#1E2D4580] hover:text-white hover:border-[#00C8D4]/20'
                            }`}>
                            <CatIcon className="w-3.5 h-3.5" />
                            {cat.label}
                            {count > 0 && (
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${activeCategory === cat.key ? 'bg-[#00C8D4]/20 text-[#00C8D4]' : 'bg-[#1A2236] text-[#8899AA]'}`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Notification Feed */}
            <div className="flex-1 overflow-y-auto bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 space-y-3">
                {isLoading ? (
                    <div className="flex flex-col items-center py-16 gap-3">
                        <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-[#00C8D4] animate-spin" />
                        <p className="text-sm text-[#8899AA] font-mono">Connecting event pipeline...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center py-16 gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-[#1A2236] border border-[#1E2D4580] flex items-center justify-center">
                            <MailOpen className="w-7 h-7 text-[#4A5568]" />
                        </div>
                        <p className="text-white font-semibold">No notifications</p>
                        <p className="text-xs text-[#8899AA]">
                            {activeCategory === 'all' ? 'You have no alerts at this time.' : `No ${activeCategory} alerts.`}
                        </p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {filtered.map(n => (
                            <NotificationCard key={n.id} n={n} onRead={markRead} onDelete={deleteNotif} />
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
