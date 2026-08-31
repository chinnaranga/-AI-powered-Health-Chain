import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bell, ShieldCheck, ShieldAlert, Key, Clock, Trash2, Check,
    MailOpen, AlertTriangle, Activity, UserCheck
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, where, onSnapshot, getDocs, updateDoc, doc, writeBatch, deleteDoc } from 'firebase/firestore';
import useAuthStore from '../../store/authStore';
import { toast } from '../../components/Toast';

export default function NotificationsPage() {
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        // Subscribe to user notifications
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort by timestamp descending
            list.sort((a, b) => (b.timestamp?.seconds * 1000 || b.timestamp || 0) - (a.timestamp?.seconds * 1000 || a.timestamp || 0));

            setNotifications(list);
            setIsLoading(false);
        }, (err) => {
            console.error("Notifications error:", err);
            setNotifications([]);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    const markAsRead = async (notificationId) => {
        try {
            const ref = doc(db, 'notifications', notificationId);
            await updateDoc(ref, { read: true });
            toast.success("Notification marked as read");
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const markAllRead = async () => {
        const unread = notifications.filter(n => !n.read);
        if (unread.length === 0) return;

        toast.loading("Marking all as read...");

        try {
            const batch = writeBatch(db);
            unread.forEach(n => {
                const ref = doc(db, 'notifications', n.id);
                batch.update(ref, { read: true });
            });

            await batch.commit();

            toast.dismiss();
            toast.success("All notifications marked as read");
        } catch (err) {
            toast.dismiss();
            toast.error("Failed to mark all as read");
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const ref = doc(db, 'notifications', notificationId);
            await deleteDoc(ref);
            toast.success("Notification dismissed");
        } catch (err) {
            toast.error("Failed to dismiss notification");
        }
    };

    const getIcon = (category, type) => {
        if (category === 'security' || type === 'access_granted') return <ShieldAlert className="w-4 h-4 text-amber-400" />;
        if (category === 'records' || type === 'record_uploaded') return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
        if (category === 'network') return <Activity className="w-4 h-4 text-cyan-400" />;
        return <Bell className="w-4 h-4 text-purple-400" />;
    };

    const getBadgeStyle = (read) => {
        return read 
            ? "bg-[#1A2236] border-[#1E2D4580] text-[#8899AA]" 
            : "bg-[#00C8D4]/10 border-[#00C8D4]/20 text-[#00C8D4] shadow-[0_0_10px_rgba(0,200,212,0.1)]";
    };

    return (
        <div className="max-w-4xl mx-auto pb-12 animate-fade-in flex flex-col h-[calc(100vh-120px)] relative">
            {/* Header */}
            <div className="mb-6 flex-shrink-0 flex items-start justify-between text-left">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Bell className="w-5 h-5 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Network Alert Stream</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Security Alerts & Updates</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Real-time system events, record logs, and compliance notifications.</p>
                </div>
                {notifications.some(n => !n.read) && (
                    <button 
                        onClick={markAllRead}
                        className="px-4 py-2.5 rounded-xl bg-[#1A2236] border border-[#1E2D4580] text-xs text-white font-bold hover:bg-[#1E2D45] transition-all flex items-center gap-2"
                    >
                        <Check className="w-4 h-4 text-[#00C8D4]" /> Mark All as Read
                    </button>
                )}
            </div>

            {/* Notification Stream Container */}
            <div className="flex-1 overflow-y-auto rounded-2xl bg-[#111827] border border-[#1E2D4580] p-6 space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-[#00C8D4] animate-spin" />
                        <p className="text-sm text-[#8899AA] font-mono">Connecting secure event pipeline...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-14 h-14 rounded-2xl bg-[#1A2236] border border-[#1E2D4580] flex items-center justify-center mx-auto mb-4">
                            <MailOpen className="w-7 h-7 text-[#4A5568]" />
                        </div>
                        <p className="text-white font-medium text-lg">Inbox clear</p>
                        <p className="text-xs text-[#8899AA] mt-1">You do not have any alerts at this time.</p>
                    </div>
                ) : (
                    <div className="space-y-3.5">
                        <AnimatePresence initial={false}>
                            {notifications.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                                    className={`p-4 rounded-xl border flex gap-4 transition-all duration-300 relative group text-left ${
                                        item.read 
                                            ? 'bg-[#161D2C]/40 border-[#1E2D4580]' 
                                            : 'bg-[#1A2538]/70 border-[#00C8D4]/30 shadow-[0_0_15px_rgba(0,200,212,0.02)]'
                                    }`}
                                >
                                    {/* Icon Column */}
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                                        getBadgeStyle(item.read)
                                    }`}>
                                        {getIcon(item.category, item.type)}
                                    </div>

                                    {/* Content Column */}
                                    <div className="flex-1 min-w-0 pr-12">
                                        <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                                            <h4 className={`text-sm font-semibold truncate ${item.read ? 'text-slate-300 font-medium' : 'text-white'}`}>
                                                {item.title}
                                            </h4>
                                            {!item.read && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#00C8D4] animate-ping" />
                                            )}
                                        </div>
                                        <p className="text-xs text-[#8899AA] leading-relaxed mb-2.5">
                                            {item.message}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-[10px] text-[#4A5568] font-mono">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>
                                                {new Date(item.timestamp?.seconds * 1000 || item.timestamp).toLocaleDateString()} at {new Date(item.timestamp?.seconds * 1000 || item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Hover Options */}
                                    <div className="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!item.read && (
                                            <button 
                                                onClick={() => markAsRead(item.id)}
                                                className="p-1.5 rounded-lg bg-[#111827] border border-[#1E2D4580] hover:border-emerald-500/30 text-[#8899AA] hover:text-emerald-400 transition-colors"
                                                title="Mark as read"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => deleteNotification(item.id)}
                                            className="p-1.5 rounded-lg bg-[#111827] border border-[#1E2D4580] hover:border-red-500/30 text-[#8899AA] hover:text-red-400 transition-colors"
                                            title="Dismiss Alert"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
