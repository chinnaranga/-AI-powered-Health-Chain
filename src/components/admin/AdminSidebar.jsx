import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, Activity, Boxes, Shield, Terminal, Search,
    AlertTriangle, Cpu, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight,
    ShieldAlert, Key, Zap, FileText, Briefcase
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';
import useAuthStore from '../../store/authStore';

const adminNavItems = [
    {
        section: 'SYSTEM CONTROL',
        items: [
            { to: '', icon: LayoutDashboard, label: 'Overview', end: true },
            { to: 'user-management', icon: Users, label: 'User Directory' },
            { to: 'health', icon: Activity, label: 'System Health' },
        ]
    },
    {
        section: 'BLOCKCHAIN & SECURITY',
        items: [
            { to: 'network', icon: Boxes, label: 'Network Nodes' },
            { to: 'access', icon: Shield, label: 'Smart Contracts' },
            { to: 'records', icon: FileText, label: 'Patient Records' },
            { to: 'logs', icon: Terminal, label: 'Blockchain Logs' },
            { to: 'audit-explorer', icon: Search, label: 'Audit Explorer' },
        ]
    },
    {
        section: 'OPERATIONS & COMPLIANCE',
        items: [
            { to: 'incidents', icon: AlertTriangle, label: 'Incidents Center' },
            { to: 'integrations', icon: Cpu, label: 'Integrations Hub' },
            { to: 'compliance', icon: ShieldAlert, label: 'Compliance Panel' },
            { to: 'transactions', icon: Activity, label: 'Transactions' },
            { to: 'analytics', icon: BarChart3, label: 'Analytics' },
            { to: 'jobs', icon: Briefcase, label: 'Careers Manager' },
            { to: 'settings', icon: Settings, label: 'Settings' },
        ]
    }
];

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
    const [collapsed, setCollapsed] = useState(false);
    const logout = useAuthStore(s => s.logout);
    const [firebaseUser, setFirebaseUser] = useState(null);

    const handleLinkClick = () => {
        if (setSidebarOpen) {
            setSidebarOpen(false);
        }
    };

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => setFirebaseUser(user));
        return () => unsub();
    }, []);

    const initials = firebaseUser?.displayName
        ? firebaseUser.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'AD';

    return (
        <motion.aside
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`h-screen border-r border-white/[0.06] flex flex-col fixed lg:sticky top-0 bottom-0 left-0 z-50 lg:z-30 overflow-hidden bg-[#050914] text-slate-300 transition-transform duration-300 lg:transform-none ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
        >
            {/* Header */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-white/[0.06] flex-shrink-0">
                <AnimatePresence mode="wait">
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2.5"
                        >
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-500/20 to-orange-600/20 border border-red-500/20">
                                <Zap className="w-4 h-4 text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white leading-none font-display">HealthChain</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5 text-red-400">Admin Control</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-500 hover:text-white transition-all duration-200 flex-shrink-0"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Profile Card */}
            {!collapsed && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mx-3 mt-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                >
                    <div className="flex items-center gap-3">
                        {firebaseUser?.photoURL ? (
                            <img src={firebaseUser.photoURL} alt="Profile" className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10" />
                        ) : (
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                                {initials}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">
                                {firebaseUser?.displayName || 'Administrator'}
                            </p>
                            <p className="text-[10px] text-slate-500">Super Admin</p>
                        </div>
                        <div className="flex-shrink-0">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Navigation items list */}
            <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
                {adminNavItems.map((section, sIdx) => (
                    <div key={section.section} className="space-y-1.5">
                        {!collapsed && (
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3.5 mb-2 font-display">
                                {section.section}
                            </p>
                        )}
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.label}
                                        to={item.to ? `/dashboard/admin/${item.to}` : '/dashboard/admin'}
                                        end={item.end}
                                        onClick={handleLinkClick}
                                        className={({ isActive }) =>
                                            `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                                            ${isActive
                                                ? 'bg-red-500/[0.08] text-red-400 border border-red-500/10'
                                                : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="admin-sidebar-active"
                                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-red-500"
                                                        style={{ boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)' }}
                                                    />
                                                )}
                                                <div className="flex items-center gap-3">
                                                    <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-red-400' : 'text-slate-500 group-hover:text-white'}`} />
                                                    {!collapsed && (
                                                        <span className="whitespace-nowrap overflow-hidden">
                                                            {item.label}
                                                        </span>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-3 py-4 border-t border-white/[0.06] flex-shrink-0">
                <button
                    onClick={() => {
                        logout();
                        window.location.href = '/login/admin';
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200 w-full"
                >
                    <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="whitespace-nowrap"
                            >
                                Sign Out
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.aside>
    );
}
