import React, { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import AdminAuthGuard from '../components/AdminAuthGuard';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

const ContentLoadingFallback = () => (
    <div className="w-full min-h-[400px] flex items-center justify-center flex-col gap-4">
        <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/10 border-t-cyan-400 animate-spin" />
            <div className="absolute inset-1.5 rounded-full border-2 border-[#00C8D4]/10 border-t-[#00C8D4] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
        </div>
        <div className="font-display font-medium text-[10px] text-cyan-400 uppercase tracking-wider animate-pulse">
            Loading Admin Panel...
        </div>
    </div>
);

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <AdminAuthGuard>
            <QueryClientProvider client={queryClient}>
                <div className="flex h-screen overflow-hidden bg-[#080d1a] text-slate-100 antialiased selection:bg-cyan-500/30">
                    {/* Global Background Layer */}
                    <div className="fixed inset-0 z-0 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.03),transparent_50%)]" />
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    </div>

                    {/* Mobile Drawer Backdrop */}
                    {sidebarOpen && (
                        <div 
                            className="fixed inset-0 bg-[#080d1a]/60 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}

                    <AdminSidebar 
                        sidebarOpen={sidebarOpen} 
                        setSidebarOpen={setSidebarOpen} 
                    />

                    <div className="flex-1 flex flex-col min-w-0 z-10 relative">
                        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />

                        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full">
                            <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 w-full">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={window.location.pathname}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="w-full"
                                    >
                                        <Suspense fallback={<ContentLoadingFallback />}>
                                            <Outlet />
                                        </Suspense>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </main>
                    </div>
                </div>
            </QueryClientProvider>
        </AdminAuthGuard>
    );
}
