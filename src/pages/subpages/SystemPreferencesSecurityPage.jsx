import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Sliders, ShieldCheck, Lock, Smartphone, Bell, Eye, LogOut, 
    CheckCircle, AlertCircle, Sparkles, Brain, Clock, SmartphoneIcon, Laptop
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function SystemPreferencesSecurityPage() {
    const [user, setUser] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Toggles
    const [twoFA, setTwoFA] = useState(false);
    const [notifyEmail, setNotifyEmail] = useState(true);
    const [consentLogs, setConsentLogs] = useState(true);

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        const sessionRef = collection(db, 'system_sessions');
        const q = query(sessionRef, where('patientId', '==', user.uid));

        const unsub = onSnapshot(q, (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setSessions(data);
            setLoading(false);
        }, (error) => {
            console.error('[SystemPreferencesSecurityPage] Firestore error:', error);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    // Seed mock sessions if empty
    const handleInitializeSessions = async () => {
        if (!user) return;
        try {
            const sampleSessions = [
                { device: "MacBook Pro (Chrome)", location: "San Francisco, CA", ipAddress: "192.168.1.14", lastActive: new Date().toISOString(), isCurrent: true },
                { device: "iPhone 15 Pro (Safari)", location: "San Jose, CA", ipAddress: "172.56.21.90", lastActive: new Date(Date.now() - 3600000).toISOString(), isCurrent: false }
            ];

            for (const item of sampleSessions) {
                await addDoc(collection(db, 'system_sessions'), {
                    patientId: user.uid,
                    ...item
                });
            }
        } catch (err) {
            console.error('Error seeding sessions:', err);
        }
    };

    const handleLogoutAllSessions = async () => {
        if (!user) return;
        try {
            const sessionRef = collection(db, 'system_sessions');
            const q = query(sessionRef, where('patientId', '==', user.uid), where('isCurrent', '==', false));
            const snap = await getDocs(q);
            
            snap.forEach(async (dDoc) => {
                await deleteDoc(doc(db, 'system_sessions', dDoc.id));
            });
        } catch (err) {
            console.error('Error logging out sessions:', err);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 bg-[#00C8D4]/10 border border-[#00C8D4]/20 rounded-full px-3 py-1 w-fit mb-3">
                        <Sliders className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Platform Settings</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">System Preferences & Security</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Manage decentralized privacy settings, toggle two-factor authentication, and monitor active sessions.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-10 h-10 rounded-full border-4 border-teal-500/10 border-t-teal-400 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                    {/* Settings sections */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Modular Panel 1: Security parameters */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 space-y-4">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Lock className="w-4.5 h-4.5 text-teal-400" /> Security Safeguards
                            </h3>
                            
                            <div className="flex justify-between items-center py-2 border-b border-[#1E2D4580]/50">
                                <div>
                                    <span className="text-xs font-bold text-white block">Two-Factor Authentication (2FA)</span>
                                    <span className="text-[10px] text-slate-500">Requires verification code sent to authenticated smartphone.</span>
                                </div>
                                <button
                                    onClick={() => setTwoFA(!twoFA)}
                                    className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${twoFA ? 'bg-[#00C8D4]' : 'bg-[#0B0F1A] border border-[#1E2D4580]'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${twoFA ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Modular Panel 2: Notification & Consent Settings */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 space-y-4">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Bell className="w-4.5 h-4.5 text-purple-400" /> Notifications & Consent
                            </h3>

                            <div className="flex justify-between items-center py-2 border-b border-[#1E2D4580]/50">
                                <div>
                                    <span className="text-xs font-bold text-white block">Email Alerts</span>
                                    <span className="text-[10px] text-slate-500">Receive immediately when clinicians request patient records.</span>
                                </div>
                                <button
                                    onClick={() => setNotifyEmail(!notifyEmail)}
                                    className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${notifyEmail ? 'bg-[#00C8D4]' : 'bg-[#0B0F1A] border border-[#1E2D4580]'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notifyEmail ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="flex justify-between items-center py-2">
                                <div>
                                    <span className="text-xs font-bold text-white block">Auditable Ledger Logs</span>
                                    <span className="text-[10px] text-slate-500">Enable complete on-chain diagnostic logging of all changes.</span>
                                </div>
                                <button
                                    onClick={() => setConsentLogs(!consentLogs)}
                                    className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${consentLogs ? 'bg-[#00C8D4]' : 'bg-[#0B0F1A] border border-[#1E2D4580]'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${consentLogs ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right column: active session telemetry */}
                    <div className="space-y-6">
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Session Logs</h4>
                                {sessions.length > 1 && (
                                    <button
                                        onClick={handleLogoutAllSessions}
                                        className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        Logout Others
                                    </button>
                                )}
                            </div>

                            {sessions.length === 0 ? (
                                <div className="space-y-3">
                                    <p className="text-xs text-slate-500">No session logs found.</p>
                                    <button
                                        onClick={handleInitializeSessions}
                                        className="w-full py-2 rounded-xl border border-[#1E2D4580] text-xs font-bold text-slate-400 hover:text-white"
                                    >
                                        Sync Session Logs
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {sessions.map(s => (
                                        <div key={s.id} className="bg-[#0B0F1A]/60 border border-[#1E2D4580] p-4 rounded-xl flex items-center justify-between gap-3 text-xs">
                                            <div className="flex items-center gap-3">
                                                {s.device.toLowerCase().includes('macbook') ? <Laptop className="w-5 h-5 text-teal-400" /> : <SmartphoneIcon className="w-5 h-5 text-teal-400" />}
                                                <div>
                                                    <span className="font-bold text-white block">{s.device}</span>
                                                    <span className="text-[9px] text-slate-500 font-mono">{s.location} • {s.ipAddress}</span>
                                                </div>
                                            </div>
                                            {s.isCurrent && (
                                                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-bold font-mono">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
