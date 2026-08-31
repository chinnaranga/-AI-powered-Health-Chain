import React, { useState, useEffect } from 'react';
import { Bell, Search, Shield, AlertTriangle, Menu, ChevronRight, Lock, LogOut, User, RefreshCw, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import useAuthStore from '../../store/authStore';

export default function AdminTopbar({ onMenuClick }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [sessionTime, setSessionTime] = useState(0);
    const [systemHealth, setSystemHealth] = useState('Excellent');
    const { role } = useAuthStore();
    const location = useLocation();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => setFirebaseUser(user));
        
        // Session timer simulation
        const timer = setInterval(() => {
            setSessionTime(prev => prev + 1);
        }, 1000);
        
        return () => {
            unsub();
            clearInterval(timer);
        };
    }, []);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    // Derive breadcrumb from pathname
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const currentPage = pathSegments[pathSegments.length - 1] || 'Overview';
    const breadcrumbName = currentPage
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    const notifications = [
        { id: 1, text: 'High CPU usage detected on Node 2', time: '5 min ago', read: false, urgent: true },
        { id: 2, text: 'Backup transaction log complete', time: '1 hour ago', read: true },
        { id: 3, text: 'New clinical registration request: Apollo Group', time: '3 hours ago', read: false },
    ];
    const unreadCount = notifications.filter(n => !n.read).length;

    const initials = firebaseUser?.displayName
        ? firebaseUser.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'AD';

    const handleSignOut = () => {
        signOut(auth);
        window.location.href = '/login/admin';
    };

    return (
        <div className="h-16 border-b border-white/[0.06] bg-[#050914]/95 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40">
            {/* Left side: Hamburger, Breadcrumb, Search */}
            <div className="flex items-center gap-4 flex-1">
                <button 
                    onClick={onMenuClick}
                    className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all lg:hidden"
                >
                    <Menu className="w-5 h-5" />
                </button>
                
                {/* Breadcrumbs */}
                <div className="hidden lg:flex items-center gap-2 text-sm font-medium">
                    <span className="text-red-400 font-display">MedVault Control Center</span>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-300">{breadcrumbName}</span>
                </div>

                {/* Search */}
                <div className="relative w-full max-w-[150px] sm:max-w-md ml-2 sm:ml-4">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search system logs, users, nodes..."
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-10 pr-4 py-2 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20 transition-all"
                    />
                </div>
            </div>

            {/* Right side: Health, Timer, Security, Notifications, Avatar */}
            <div className="flex items-center gap-3 lg:gap-4">
                
                {/* Node Status */}
                <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ef4444]/5 border border-[#ef4444]/15">
                    <Cpu className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-[11px] text-slate-400 font-medium">Nodes:</span>
                    <span className="text-xs text-red-400 font-semibold">4 / 4 Active</span>
                </div>

                {/* Session Timer */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[11px] text-slate-500 font-medium">Session:</span>
                    <span className="text-xs text-white font-mono">{formatTime(sessionTime)}</span>
                </div>

                {/* Security Indicator */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                    <Shield className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-[11px] text-red-400 font-bold uppercase tracking-wider">Super Admin</span>
                </div>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-12 w-80 rounded-2xl bg-[#0f131e] border border-white/[0.08] shadow-2xl overflow-hidden z-50"
                            >
                                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-white font-display">System Notifications</h4>
                                    <span className="text-[10px] text-red-400 font-medium cursor-pointer hover:text-red-300">Mark all read</span>
                                </div>
                                {notifications.map(n => (
                                    <div key={n.id} className="px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="text-sm text-slate-300">{n.text}</p>
                                            {n.urgent && <span className="text-[9px] font-bold bg-red-500/10 text-red-400 px-1 py-0.5 rounded border border-red-500/20 uppercase">Urgent</span>}
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-1">{n.time}</p>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-white/[0.06] hidden sm:block"></div>

                {/* Avatar Menu */}
                <div className="relative">
                    <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/[0.04] transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_12px_rgba(239,68,68,0.3)]">
                            {initials}
                        </div>
                    </button>

                    <AnimatePresence>
                        {showProfileMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-12 w-56 rounded-xl bg-[#0f131e] border border-white/[0.08] shadow-2xl overflow-hidden z-50 py-1"
                            >
                                <div className="px-4 py-3 border-b border-white/[0.06] mb-1">
                                    <p className="text-sm font-medium text-white">{firebaseUser?.displayName || 'Administrator'}</p>
                                    <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">Super Admin</p>
                                </div>
                                <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.04] hover:text-white flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-500" /> View Profile
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.04] hover:text-red-400 flex items-center gap-2 transition-colors">
                                    <Lock className="w-4 h-4 text-slate-500" /> Lock Terminal
                                </button>
                                <div className="h-px bg-white/[0.06] my-1"></div>
                                <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors">
                                    <LogOut className="w-4 h-4 text-red-400" /> Sign Out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
