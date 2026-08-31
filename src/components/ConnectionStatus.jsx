import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useConnectionStatus } from '../hooks/useConnectionStatus';

export default function ConnectionStatus() {
    const isOnline = useConnectionStatus();
    const [showBanner, setShowBanner] = useState(!isOnline);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        // Automatically open banner when offline.
        // If we go online, show green "Restored" message and let it auto-close or manual sync.
        setShowBanner(!isOnline);
    }, [isOnline]);

    const handleManualSync = async () => {
        if (!navigator.onLine) {
            return;
        }
        setIsSyncing(true);
        // Dispatch global sync event so pages can re-trigger fetches if desired
        window.dispatchEvent(new CustomEvent('sync-requested'));
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSyncing(false);
        setShowBanner(false);
    };

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ opacity: 0, y: -60, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -60, x: '-50%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed top-24 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-lg"
                >
                    <div className={`backdrop-blur-xl border rounded-2xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex items-center justify-between gap-4 transition-colors duration-500 ${
                        isOnline 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl flex items-center justify-center ${
                                isOnline ? 'bg-emerald-500/15' : 'bg-amber-500/15'
                             }`}>
                                {isOnline ? (
                                    <Wifi className="w-5 h-5 animate-pulse" />
                                ) : (
                                    <WifiOff className="w-5 h-5 animate-pulse" />
                                )}
                            </div>
                            <div>
                                <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-100">
                                    {isOnline ? 'Connection Restored' : 'Offline Mode Active'}
                                </h4>
                                <p className="text-[11px] text-[#8899AA] mt-0.5 leading-tight">
                                    {isOnline 
                                        ? 'System is online. Sync to reload the latest database entries.' 
                                        : 'Operating on local-cached records. Actions will sync online later.'
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {isOnline ? (
                                <button
                                    onClick={handleManualSync}
                                    disabled={isSyncing}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30 transition-all cursor-pointer"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                                    Sync
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowBanner(false)}
                                    className="text-[10px] text-[#8899AA] hover:text-white font-bold uppercase tracking-wider px-2 py-1.5 transition-colors cursor-pointer"
                                >
                                    Dismiss
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
export { ConnectionStatus };
