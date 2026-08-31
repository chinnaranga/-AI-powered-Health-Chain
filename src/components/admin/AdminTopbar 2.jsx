import { Bell, Search, ShieldAlert, Globe, Activity, Zap, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function AdminTopbar() {
    const [showNotifications, setShowNotifications] = useState(false);

    const notifications = [
        { id: 1, text: 'CRITICAL: High latency detected on EU-West node', time: '1 min ago', type: 'critical' },
        { id: 2, text: 'WARNING: 5 failed admin logins from unknown IP', time: '12 min ago', type: 'warning' },
        { id: 3, text: 'INFO: Automated database backup completed', time: '1 hr ago', type: 'info' },
    ];

    const unreadCount = 2;

    return (
        <div className="h-14 border-b border-white/[0.05] bg-[#0B0F19]/90 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40">
            {/* Search */}
            <div className="flex items-center gap-3 flex-1 max-w-lg">
                <div className="relative w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search infrastructure, logs, or users... [⌘K]"
                        className="w-full bg-[#111726] border border-white/[0.08] rounded-lg pl-10 pr-4 py-1.5 text-[11px] text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* AI Assistant */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 cursor-pointer hover:bg-purple-500/20 transition-colors">
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Ask AI</span>
                </div>

                {/* Region Selector */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.05] cursor-pointer hover:bg-white/[0.05] transition-colors">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Global</span>
                </div>

                {/* Live Sync */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Synced</span>
                </div>

                {/* Notifications */}
                <div className="relative ml-2">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-md bg-[#111726] border border-white/[0.08] hover:bg-white/[0.05] transition-colors"
                    >
                        <Bell className="w-4 h-4 text-slate-400" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-12 w-80 rounded-xl bg-[#0B0F19] border border-white/[0.08] shadow-2xl overflow-hidden z-50"
                            >
                                <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between bg-[#111726]">
                                    <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">System Alerts</h4>
                                    <span className="text-[10px] text-cyan-400 font-bold uppercase cursor-pointer hover:text-cyan-300">Clear All</span>
                                </div>
                                {notifications.map(n => (
                                    <div key={n.id} className="px-4 py-3 border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors cursor-pointer flex gap-3 items-start">
                                        {n.type === 'critical' ? <ShieldAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" /> : 
                                         n.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" /> : 
                                         <Server className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />}
                                        <div>
                                            <p className={`text-xs ${n.type === 'critical' ? 'text-red-400 font-bold' : n.type === 'warning' ? 'text-amber-400 font-bold' : 'text-slate-300'}`}>{n.text}</p>
                                            <p className="text-[10px] text-slate-500 mt-1 font-mono">{n.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
