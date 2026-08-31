import { Bell, Search, Shield, AlertTriangle, Menu, ChevronRight, Lock, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../firebase/config';
import useAuthStore from '../store/authStore';
import { toast } from './Toast';

export default function Topbar({ onMenuClick }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [realtimeUser, setRealtimeUser] = useState(null);
    const [sessionTime, setSessionTime] = useState(0);

    const { role, logout, user: storeUser, changeUserLanguage } = useAuthStore();
    const { i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (user) => setFirebaseUser(user));
        
        const timer = setInterval(() => {
            setSessionTime(prev => prev + 1);
        }, 1000);
        
        return () => {
            unsubAuth();
            clearInterval(timer);
        };
    }, []);

    const targetUid = firebaseUser?.uid || storeUser?.uid || storeUser?.id;

    // Real-time listener for current user details from Firestore
    useEffect(() => {
        if (!targetUid) return;
        const userDocRef = doc(db, 'users', targetUid);
        const unsubFirestore = onSnapshot(userDocRef, (snap) => {
            if (snap.exists()) {
                setRealtimeUser(snap.data());
            }
        }, (err) => {
            console.warn('[Topbar Realtime] Firestore snapshot notice:', err.message);
        });
        return () => unsubFirestore();
    }, [targetUid]);

    const activeName = realtimeUser?.fullName || realtimeUser?.name || firebaseUser?.displayName || storeUser?.fullName || storeUser?.name || (role === 'doctor' ? 'Dr. Medical Staff' : role === 'clinical' ? 'Clinical Officer' : 'HealthChain Patient');
    const activeRole = (realtimeUser?.role || role || storeUser?.role || 'patient').toUpperCase();

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const currentPage = pathSegments[pathSegments.length - 1] || 'Dashboard';
    const breadcrumbName = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

    const notifications = [
        { id: 1, text: 'Patient record verification pending', time: '2 min ago', read: false, urgent: true },
        { id: 2, text: 'OTP access request from Alice Johnson', time: '15 min ago', read: false },
    ];
    const unreadCount = notifications.filter(n => !n.read).length;

    const initials = activeName
        ? activeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'HC';

    const handleViewProfile = () => {
        setShowProfileMenu(false);
        const userRole = (role || storeUser?.role || 'patient').toLowerCase();
        navigate(`/dashboard/${userRole}/settings`);
    };

    const handleLockSession = () => {
        setShowProfileMenu(false);
        toast.info('Session locked securely');
        window.location.reload();
    };

    const handleSignOut = async () => {
        setShowProfileMenu(false);
        await logout();
        toast.success('Signed out successfully');
        navigate('/login', { replace: true });
    };

    return (
        <div className="h-16 border-b border-white/[0.06] bg-navy-950/95 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40">
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
                    <span className="text-cyan-400 font-display">MedVault Clinical</span>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-300 capitalize">{breadcrumbName}</span>
                </div>

                {/* Search */}
                <div className="relative w-full max-w-[150px] sm:max-w-md ml-2 sm:ml-4">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search patients, records, requests..."
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-10 pr-4 py-2 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                    />
                </div>
            </div>

            {/* Right side: Timer, Security, Notifications, Avatar */}
            <div className="flex items-center gap-3 lg:gap-4">
                
                {/* Session Timer */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[11px] text-slate-500 font-medium">Session:</span>
                    <span className="text-xs text-white font-mono">{formatTime(sessionTime)}</span>
                </div>

                {/* Language Switcher */}
                <div className="flex items-center">
                    <select
                        value={i18n.language || 'en'}
                        onChange={(e) => changeUserLanguage(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-medium focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                    >
                        <option value="en" className="bg-[#111827] text-white">🌐 English</option>
                        <option value="te" className="bg-[#111827] text-white">🌐 తెలుగు</option>
                    </select>
                </div>

                {/* Security Indicator */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Encrypted</span>
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
                                className="absolute right-0 top-12 w-80 rounded-2xl bg-[#111827] border border-white/[0.08] shadow-2xl overflow-hidden z-50"
                            >
                                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-white font-display">Notifications</h4>
                                    <span className="text-[10px] text-cyan-400 font-medium cursor-pointer hover:text-cyan-300">Mark all read</span>
                                </div>
                                {notifications.map(n => (
                                    <div key={n.id} className="px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer">
                                        <p className="text-sm text-slate-300">{n.text}</p>
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
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]">
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
                                className="absolute right-0 top-12 w-56 rounded-xl bg-[#111827] border border-white/[0.08] shadow-2xl overflow-hidden z-50 py-1"
                            >
                                <div className="px-4 py-3 border-b border-white/[0.06] mb-1">
                                    <p className="text-sm font-medium text-white">{activeName}</p>
                                    <p className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider mt-0.5">{activeRole}</p>
                                </div>
                                <button 
                                    onClick={handleViewProfile}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.04] hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                    <User className="w-4 h-4 text-slate-500" /> View Profile
                                </button>
                                <button 
                                    onClick={handleLockSession}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.04] hover:text-amber-400 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                    <Lock className="w-4 h-4 text-slate-500" /> Lock Session
                                </button>
                                <div className="h-px bg-white/[0.06] my-1"></div>
                                <button 
                                    onClick={handleSignOut} 
                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                                >
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
