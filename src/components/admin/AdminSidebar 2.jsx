import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, FileText, Blocks, Shield,
    Activity, BarChart3, Settings, ChevronLeft, ChevronRight,
    Server, LogOut, CheckCircle, AlertTriangle, Link2, Brain,
    HeartPulse, Search
} from 'lucide-react';
import useAdminStore from '../../store/adminStore';
import useAuthStore from '../../store/authStore';

const navItems = [
    { to: '', icon: LayoutDashboard, label: 'Command Center', end: true },
    { to: 'users', icon: Users, label: 'Users & Roles' },
    { to: 'network', icon: Server, label: 'Blockchain Infrastructure' },
    { to: 'access', icon: Shield, label: 'Security Center' },
    { to: 'ai', icon: Brain, label: 'AI Monitoring' },
    { to: 'logs', icon: FileText, label: 'Audit Logs' },
    { to: 'audit-explorer', icon: Search, label: 'Audit Explorer' },
    { to: 'analytics', icon: BarChart3, label: 'Analytics' },
    { to: 'health', icon: HeartPulse, label: 'System Health' },
    { to: 'settings', icon: Settings, label: 'System Configuration' },
    { to: 'compliance', icon: CheckCircle, label: 'Compliance' },
    { to: 'incidents', icon: AlertTriangle, label: 'Incident Management' },
    { to: 'integrations', icon: Link2, label: 'Integrations' },
    { to: 'user-management', icon: Users, label: 'User Management' },
];

export default function AdminSidebar() {
    const { sidebarCollapsed, toggleSidebar } = useAdminStore();
    const logout = useAuthStore(s => s.logout);

    return (
        <motion.aside
            animate={{ width: sidebarCollapsed ? 72 : 280 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-screen bg-[#060913] border-r border-white/[0.05] flex flex-col sticky top-0 z-30 overflow-hidden font-sans"
        >
            {/* Header */}
            <div className="h-[72px] px-5 flex items-center justify-between border-b border-white/[0.05] flex-shrink-0 bg-[#0B0F19]">
                <AnimatePresence mode="wait">
                    {!sidebarCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                                <Server className="w-4.5 h-4.5 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white tracking-wide font-display">HealthChain</p>
                                <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest mt-0.5">Admin Ops Center</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-lg hover:bg-white/[0.05] text-slate-500 hover:text-white transition-colors flex-shrink-0"
                >
                    {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Admin Profile Panel (Only when expanded) */}
            <AnimatePresence>
                {!sidebarCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 py-4 border-b border-white/[0.05]"
                    >
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#0B0F19] border border-white/[0.1] flex items-center justify-center font-bold text-slate-300 font-mono text-sm">
                                AD
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate font-mono">sysadmin_root</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">US-EAST-1</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={`/dashboard/admin/${item.to}`.replace(/\/$/, '')}
                        end={item.end}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 group relative
                            ${isActive
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] border border-transparent'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.div
                                        layoutId="admin-sidebar-active"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                                    />
                                )}
                                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'group-hover:text-slate-300'}`} />
                                <AnimatePresence mode="wait">
                                    {!sidebarCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="whitespace-nowrap overflow-hidden"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-white/[0.05] flex-shrink-0 bg-[#0B0F19]">
                <button
                    onClick={() => {
                        logout();
                        window.location.href = '/login';
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all duration-200 w-full"
                >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    <AnimatePresence mode="wait">
                        {!sidebarCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="whitespace-nowrap"
                            >
                                Terminate Session
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.aside>
    );
}
