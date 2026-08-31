import React, { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import AuthGuard from '../components/AuthGuard';

const ContentLoadingFallback = () => (
    <div className="w-full min-h-[400px] flex items-center justify-center flex-col gap-4">
        <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-teal-500/10 border-t-teal-400 animate-spin" />
            <div className="absolute inset-1.5 rounded-full border-2 border-[#00C8D4]/10 border-t-[#00C8D4] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
        </div>
        <div className="font-display font-medium text-[10px] text-[#00C8D4] uppercase tracking-wider animate-pulse">
            Loading View...
        </div>
    </div>
);

export default function DashboardLayout({ basePath }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <AuthGuard basePath={basePath}>
            <div className="flex h-screen overflow-hidden bg-navy-950">
                {/* Mobile Drawer Backdrop */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-[#080d1a]/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <Sidebar 
                    basePath={basePath} 
                    sidebarOpen={sidebarOpen} 
                    setSidebarOpen={setSidebarOpen} 
                />

                <div className="flex flex-col flex-1 overflow-hidden relative z-10">
                    <Topbar onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Suspense fallback={<ContentLoadingFallback />}>
                                <Outlet />
                            </Suspense>
                        </motion.div>
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}

