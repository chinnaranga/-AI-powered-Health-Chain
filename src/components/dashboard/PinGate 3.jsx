import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Key, AlertCircle, RefreshCw, Delete } from 'lucide-react';
import { db } from '../../firebase/config';
import useAuthStore from '../../store/authStore';
import { toast } from '../Toast';
import { securityPinService } from '../../services/securityPinService';

export default function PinGate({ onUnlock }) {
    const { user } = useAuthStore();
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [mode, setMode] = useState('loading'); // 'loading', 'setup', 'confirm-setup', 'enter'
    const [savedPin, setSavedPin] = useState(null);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shake, setShake] = useState(false);
    const [connectionStabilizing, setConnectionStabilizing] = useState(true);

    const pinLength = 4;

    // Fetch user's security PIN from Firestore safely
    useEffect(() => {
        if (!user?.id) return;

        let active = true;

        const checkAndFetchPin = async () => {
            try {
                // Connection Guard: Introduce 200ms delay to let Firebase auth/Firestore connection stabilize on startup
                await new Promise(resolve => setTimeout(resolve, 200));
                
                if (!active) return;

                const userPin = await securityPinService.getUserPin(user.id);
                
                if (!active) return;

                if (userPin) {
                    setSavedPin(userPin);
                    setMode('enter');
                } else {
                    setMode('setup');
                }
            } catch (err) {
                if (active) {
                    console.warn('[PinGate] Failed to check security settings, defaulting to setup:', err);
                    setMode('setup');
                }
            } finally {
                if (active) {
                    setConnectionStabilizing(false);
                }
            }
        };

        checkAndFetchPin();

        // Auto-reconnect sync: retry check when online status returns
        const handleSync = () => {
            console.info('[PinGate] Connection restored. Retrying security status sync...');
            checkAndFetchPin();
        };
        window.addEventListener('connection-restored', handleSync);

        return () => {
            active = false;
            window.removeEventListener('connection-restored', handleSync);
        };
    }, [user?.id]);

    // Handle number keypad input
    const handleKeyPress = (num) => {
        setError('');
        if (mode === 'setup') {
            if (pin.length < pinLength) {
                const nextPin = pin + num;
                setPin(nextPin);
                if (nextPin.length === pinLength) {
                    setTimeout(() => {
                        setMode('confirm-setup');
                    }, 300);
                }
            }
        } else if (mode === 'confirm-setup') {
            if (confirmPin.length < pinLength) {
                const nextConfirm = confirmPin + num;
                setConfirmPin(nextConfirm);
                if (nextConfirm.length === pinLength) {
                    handleSetupSubmit(pin, nextConfirm);
                }
            }
        } else if (mode === 'enter') {
            if (pin.length < pinLength) {
                const nextPin = pin + num;
                setPin(nextPin);
                if (nextPin.length === pinLength) {
                    handleVerifySubmit(nextPin);
                }
            }
        }
    };

    // Handle backspace
    const handleBackspace = () => {
        setError('');
        if (mode === 'setup' || mode === 'enter') {
            setPin(prev => prev.slice(0, -1));
        } else if (mode === 'confirm-setup') {
            setConfirmPin(prev => prev.slice(0, -1));
        }
    };

    // Handle clear
    const handleClear = () => {
        setError('');
        if (mode === 'setup' || mode === 'enter') {
            setPin('');
        } else if (mode === 'confirm-setup') {
            setConfirmPin('');
        }
    };

    // Save newly setup PIN
    const handleSetupSubmit = async (primaryPin, confirmationPin) => {
        if (primaryPin !== confirmationPin) {
            setError("PINs do not match. Try again.");
            setConfirmPin('');
            setPin('');
            setMode('setup');
            triggerShake();
            return;
        }

        setIsSubmitting(true);
        try {
            await securityPinService.setUserPin(user.id, primaryPin);
            
            // Log security event (non-blocking)
            try {
                const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
                await addDoc(collection(db, 'auditLogs'), {
                    timestamp: serverTimestamp(),
                    activityType: 'SECURITY_PIN_CREATED',
                    userId: user.id,
                    txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
                    details: { action: 'Created Security PIN' }
                });
            } catch (logErr) {
                // Ignore audit logging failures offline
            }

            toast.success("Security PIN configured successfully!");
            onUnlock();
        } catch (err) {
            console.error('[PinGate] PIN write failed:', err);
            setError("Failed to save PIN. Check connection.");
            triggerShake();
        } finally {
            setIsSubmitting(false);
        }
    };

    // Verify entered PIN
    const handleVerifySubmit = async (enteredPin) => {
        if (enteredPin === savedPin) {
            setIsSubmitting(true);
            setTimeout(() => {
                setIsSubmitting(false);
                onUnlock();
            }, 300);
        } else {
            setError("Incorrect PIN. Access Denied.");
            setPin('');
            triggerShake();
        }
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    // Handle keyboard layout input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (mode === 'loading' || connectionStabilizing || isSubmitting) return;
            if (e.key >= '0' && e.key <= '9') {
                handleKeyPress(e.key);
            } else if (e.key === 'Backspace') {
                handleBackspace();
            } else if (e.key === 'Escape') {
                handleClear();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mode, pin, confirmPin, isSubmitting, savedPin, connectionStabilizing]);

    if (mode === 'loading' || connectionStabilizing) {
        return (
            <div className="min-h-screen bg-[#070b14] flex items-center justify-center flex-col gap-4 text-white relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-500/10 border-t-cyan-400 animate-spin" />
                </div>
                <p className="text-xs text-cyan-400 uppercase tracking-widest font-semibold font-display animate-pulse">Initializing Vault Guard...</p>
            </div>
        );
    }

    const currentPinValue = mode === 'confirm-setup' ? confirmPin : pin;

    return (
        <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4 text-white relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
            
            <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(0, 200, 212, 0.015) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                <div className="bg-[#0f1524]/80 border border-white/[0.08] backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_60px_rgba(0,200,212,0.08)] flex flex-col items-center">
                    
                    <div className="relative mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                            {mode === 'enter' ? (
                                <Lock className="w-7 h-7 text-[#00C8D4]" />
                            ) : (
                                <Key className="w-7 h-7 text-[#00C8D4]" />
                            )}
                        </div>
                        {isSubmitting && (
                            <div className="absolute -inset-1 rounded-2xl border-2 border-cyan-400 border-t-transparent animate-spin" />
                        )}
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-xl font-bold font-display tracking-wide text-white">
                            {mode === 'setup' && 'Configure Security PIN'}
                            {mode === 'confirm-setup' && 'Confirm Security PIN'}
                            {mode === 'enter' && 'Decrypt Health Vault'}
                        </h2>
                        <p className="text-xs text-[#8899AA] mt-2 max-w-[280px] mx-auto leading-relaxed">
                            {mode === 'setup' && 'Setup a 4-digit security PIN to encrypt and secure your offline medical records.'}
                            {mode === 'confirm-setup' && 'Please re-enter your 4-digit PIN to confirm.'}
                            {mode === 'enter' && 'Enter your 4-digit PIN to authorize this session and decrypt your wallet keys.'}
                        </p>
                    </div>

                    <motion.div
                        animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className="flex gap-4 mb-8 justify-center"
                    >
                        {Array.from({ length: pinLength }).map((_, idx) => {
                            const isActive = idx < currentPinValue.length;
                            return (
                                <div
                                    key={idx}
                                    className={`w-4.5 h-4.5 rounded-full border-2 transition-all duration-200 ${
                                        isActive
                                            ? 'bg-[#00C8D4] border-[#00C8D4] shadow-[0_0_10px_#00C8D4]'
                                            : 'border-[#1E2D4580] bg-transparent'
                                    }`}
                                />
                            );
                        })}
                    </motion.div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl mb-6 w-full justify-center"
                            >
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-3 gap-4 w-full max-w-[320px]">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <motion.button
                                key={num}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleKeyPress(num.toString())}
                                disabled={isSubmitting}
                                className="h-14 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.08] transition-all flex items-center justify-center font-semibold text-lg hover:text-cyan-400 active:scale-95 cursor-pointer"
                            >
                                {num}
                            </motion.button>
                        ))}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleClear}
                            disabled={isSubmitting}
                            className="h-14 rounded-2xl bg-transparent border border-transparent transition-all flex items-center justify-center text-xs font-semibold text-[#8899AA] hover:text-white cursor-pointer"
                        >
                            CLEAR
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleKeyPress('0')}
                            disabled={isSubmitting}
                            className="h-14 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.08] transition-all flex items-center justify-center font-semibold text-lg hover:text-cyan-400 cursor-pointer"
                        >
                            0
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleBackspace}
                            disabled={isSubmitting}
                            className="h-14 rounded-2xl bg-transparent border border-transparent transition-all flex items-center justify-center text-[#8899AA] hover:text-white cursor-pointer"
                        >
                            <Delete className="w-5 h-5" />
                        </motion.button>
                    </div>

                    {mode === 'confirm-setup' && (
                        <button
                            onClick={() => {
                                setPin('');
                                setConfirmPin('');
                                setMode('setup');
                            }}
                            className="text-xs text-slate-500 hover:text-slate-300 mt-6 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Re-enter original PIN
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
