import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { toast } from './Toast';

const INACTIVITY_LIMIT = 10;   // Show warning after 10s of inactivity
const WARNING_PERIOD = 30;     // Warn for 30 seconds before logout

export default function SessionTimeoutHandler() {
    const { isAuthenticated, role, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const [showWarning, setShowWarning] = useState(false);
    const [secondsRemaining, setSecondsRemaining] = useState(WARNING_PERIOD);

    const lastActivityRef = useRef(Date.now());
    const checkIntervalRef = useRef(null);
    const warningCountdownRef = useRef(null);

    // Reset inactivity timer on user interaction
    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        if (showWarning) {
            setShowWarning(false);
            setSecondsRemaining(WARNING_PERIOD);
            toast.success('Session extended successfully');
        }
    }, [showWarning]);

    // Handle automatic logout due to inactivity
    const handleAutoLogout = useCallback(async () => {
        setShowWarning(false);
        try {
            await logout();
            toast.error('Session expired due to inactivity');
            navigate('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    }, [logout, navigate]);

    // Handle manual logout from warning dialog
    const handleManualLogout = useCallback(async () => {
        setShowWarning(false);
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    }, [logout, navigate]);

    // Reset activity timestamp when authentication state becomes true
    useEffect(() => {
        if (isAuthenticated) {
            lastActivityRef.current = Date.now();
            setShowWarning(false);
            setSecondsRemaining(WARNING_PERIOD);
        }
    }, [isAuthenticated]);

    // Listen to user activity events
    useEffect(() => {
        if (!isAuthenticated || !role) return;

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        const handleActivity = () => {
            // Only reset if we are not currently displaying the warning popup
            // If the warning is visible, the user must explicitly click "Extend Session"
            if (!showWarning) {
                lastActivityRef.current = Date.now();
            }
        };

        events.forEach(event => window.addEventListener(event, handleActivity));

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
        };
    }, [isAuthenticated, role, showWarning]);

    // Check inactivity periodically
    useEffect(() => {
        if (!isAuthenticated || !role) {
            // Clear any active intervals/timers if user logs out
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
            if (warningCountdownRef.current) clearInterval(warningCountdownRef.current);
            setShowWarning(false);
            return;
        }

        const warningStartMs = INACTIVITY_LIMIT * 1000;

        checkIntervalRef.current = setInterval(() => {
            if (showWarning) return; // Warning countdown handles itself

            const inactiveTime = Date.now() - lastActivityRef.current;
            if (inactiveTime >= warningStartMs) {
                setShowWarning(true);
                setSecondsRemaining(WARNING_PERIOD);
            }
        }, 1000);

        return () => {
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        };
    }, [isAuthenticated, role, showWarning]);

    // Warning countdown timer
    useEffect(() => {
        if (!showWarning) {
            if (warningCountdownRef.current) clearInterval(warningCountdownRef.current);
            return;
        }

        warningCountdownRef.current = setInterval(() => {
            setSecondsRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(warningCountdownRef.current);
                    handleAutoLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (warningCountdownRef.current) clearInterval(warningCountdownRef.current);
        };
    }, [showWarning, handleAutoLogout]);

    return (
        <AnimatePresence>
            {showWarning && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-[#0B0F1A]/95 border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.15)] relative overflow-hidden"
                    >
                        {/* Decorative glowing gradient */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/10 rounded-full blur-[50px] pointer-events-none" />
                        
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                                <ShieldAlert className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-white text-lg">Inactivity Timeout Warning</h3>
                                <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mt-0.5">Security Session Auto-Lock</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <p className="text-sm text-[#CBD5E1] leading-relaxed">
                                Your session will automatically expire in <span className="text-red-400 font-bold font-mono text-base">{secondsRemaining}</span> seconds due to inactivity.
                            </p>
                            <div className="flex items-center gap-2 p-3 bg-red-500/5 rounded-xl border border-red-500/10 text-[11px] text-red-400/80">
                                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>For security compliance, inactive dashboard sessions are locked.</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleManualLogout}
                                className="flex-1 py-3 rounded-xl border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-3.5 h-3.5" /> Log Out
                            </button>
                            <button
                                onClick={resetTimer}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] text-xs font-bold shadow-[0_0_20px_rgba(0,200,212,0.3)] hover:shadow-[0_0_30px_rgba(0,200,212,0.5)] transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} /> Extend Session
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
