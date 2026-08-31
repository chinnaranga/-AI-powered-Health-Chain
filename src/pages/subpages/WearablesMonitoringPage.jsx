import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Cpu, Activity, RefreshCw, Smartphone, Zap, Heart, Sparkles, 
    Brain, ShieldCheck, AlertCircle, TrendingUp, HelpCircle
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function WearablesMonitoringPage() {
    const [user, setUser] = useState(null);
    const [telemetry, setTelemetry] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        const telemetryRef = collection(db, 'wearables_telemetry');
        const q = query(telemetryRef, where('patientId', '==', user.uid));

        const unsub = onSnapshot(q, (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            // Sort by syncTimestamp
            data.sort((a, b) => new Date(a.syncTimestamp) - new Date(b.syncTimestamp));
            setTelemetry(data);
            setLoading(false);
        }, (error) => {
            console.error('[WearablesMonitoringPage] Firestore error:', error);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    // Initial telemetry sync if empty
    const handleInitializeTelemetry = async () => {
        if (!user) return;
        try {
            const sampleLogs = [
                { stepsCount: 6500, activeMinutes: 30, sleepHours: 7.2, averageHeartRate: 74, syncTimestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
                { stepsCount: 8200, activeMinutes: 45, sleepHours: 6.8, averageHeartRate: 72, syncTimestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
                { stepsCount: 10400, activeMinutes: 60, sleepHours: 7.5, averageHeartRate: 70, syncTimestamp: new Date(Date.now() - 1 * 86400000).toISOString() }
            ];

            for (const item of sampleLogs) {
                await addDoc(collection(db, 'wearables_telemetry'), {
                    patientId: user.uid,
                    ...item
                });
            }
        } catch (err) {
            console.error('Error seeding telemetry:', err);
        }
    };

    const handleSyncDevice = async () => {
        if (!user || telemetry.length === 0) return;
        setSyncing(true);

        const targetLog = telemetry[telemetry.length - 1];
        
        // Simulating step count boost & live HRV sync
        const nextSteps = targetLog.stepsCount + Math.floor(500 + Math.random() * 1500);
        const nextActive = targetLog.activeMinutes + Math.floor(5 + Math.random() * 15);
        const nextHR = Math.floor(65 + Math.random() * 10);

        try {
            await addDoc(collection(db, 'wearables_telemetry'), {
                patientId: user.uid,
                stepsCount: nextSteps,
                activeMinutes: nextActive,
                sleepHours: 7.2 + (Math.random() * 0.5),
                averageHeartRate: nextHR,
                syncTimestamp: new Date().toISOString()
            });

            setTimeout(() => setSyncing(false), 1500);
        } catch (err) {
            console.error('Error syncing remote device:', err);
            setSyncing(false);
        }
    };

    const latestLog = telemetry[telemetry.length - 1] || {
        stepsCount: 8000, activeMinutes: 45, sleepHours: 7.0, averageHeartRate: 72, syncTimestamp: new Date().toISOString()
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 bg-[#00C8D4]/10 border border-[#00C8D4]/20 rounded-full px-3 py-1 w-fit mb-3">
                        <Cpu className="w-4 h-4 text-[#00C8D4] animate-pulse" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Medical Internet of Things</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Wearables & Remote Telemetry</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Synchronize remote biosensors, track circadian sleep hours, and stream heart rate data.</p>
                </div>
                
                <div className="flex gap-3">
                    {telemetry.length === 0 && !loading && (
                        <button
                            onClick={handleInitializeTelemetry}
                            className="px-4 py-2.5 rounded-xl border border-[#1E2D4580] text-xs font-bold hover:text-white"
                        >
                            Connect Fitbit Simulation
                        </button>
                    )}
                    {telemetry.length > 0 && (
                        <button
                            onClick={handleSyncDevice}
                            disabled={syncing}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)] disabled:opacity-55"
                        >
                            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                            {syncing ? 'Syncing Biosensors...' : 'Sync Wearable telemetry'}
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-10 h-10 rounded-full border-4 border-teal-500/10 border-t-teal-400 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-left">
                    {/* Telemetry charts and metrics */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Live cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Steps Card */}
                            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 relative overflow-hidden">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Daily Steps Count</span>
                                <div className="mt-3 flex items-baseline gap-1.5">
                                    <span className="text-3xl font-display font-extrabold text-teal-400">{latestLog.stepsCount.toLocaleString()}</span>
                                    <span className="text-xs text-slate-500">steps</span>
                                </div>
                                <span className="text-[9px] text-slate-500 block mt-2">Target: 10,000</span>
                            </div>

                            {/* Active minutes */}
                            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 relative overflow-hidden">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Minutes</span>
                                <div className="mt-3 flex items-baseline gap-1.5">
                                    <span className="text-3xl font-display font-extrabold text-[#00C8D4]">{latestLog.activeMinutes}</span>
                                    <span className="text-xs text-slate-500">min</span>
                                </div>
                                <span className="text-[9px] text-slate-500 block mt-2">Target: 45 min</span>
                            </div>

                            {/* Sleep Hours */}
                            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 relative overflow-hidden">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Circadian Sleep</span>
                                <div className="mt-3 flex items-baseline gap-1.5">
                                    <span className="text-3xl font-display font-extrabold text-purple-400">{latestLog.sleepHours.toFixed(1)}</span>
                                    <span className="text-xs text-slate-500">hours</span>
                                </div>
                                <span className="text-[9px] text-slate-500 block mt-2">Target: 7.5 hrs</span>
                            </div>

                            {/* Heart Rate */}
                            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 relative overflow-hidden">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Resting Heart Rate</span>
                                <div className="mt-3 flex items-baseline gap-1.5">
                                    <span className="text-3xl font-display font-extrabold text-rose-400">{latestLog.averageHeartRate}</span>
                                    <span className="text-xs text-slate-500">bpm</span>
                                </div>
                                <span className="text-[9px] text-slate-500 block mt-2">Average: 72 bpm</span>
                            </div>
                        </div>

                        {/* Chart steps trends */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 relative overflow-hidden">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Biosensor Steps Trend</h3>
                            
                            <div className="h-[230px] w-full font-mono text-[9px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={telemetry}>
                                        <defs>
                                            <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="syncTimestamp" tickFormatter={(t) => new Date(t).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} stroke="#8899AA" />
                                        <YAxis stroke="#8899AA" domain={[4000, 15000]} />
                                        <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1E2D4580' }} />
                                        <Area type="monotone" name="Telemetry Steps" dataKey="stepsCount" stroke="#2dd4bf" strokeWidth={2} fillOpacity={1} fill="url(#colorSteps)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Connection details & AI reports */}
                    <div className="space-y-6">
                        {/* Wearable Connection Panel */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Device Status</h4>
                            
                            <div className="bg-[#0B0F1A]/60 border border-[#1E2D4580] p-4 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Smartphone className="w-5 h-5 text-teal-400" />
                                    <div>
                                        <span className="text-xs font-bold text-white">Apple Watch Series 9</span>
                                        <span className="text-[8px] text-slate-500 block font-mono">Syncing enabled</span>
                                    </div>
                                </div>
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            </div>
                        </div>

                        {/* AI Health coaching */}
                        <div className="bg-gradient-to-r from-purple-900/10 to-indigo-900/10 border border-purple-500/20 rounded-2xl p-5 text-left relative overflow-hidden">
                            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                <Brain className="w-4 h-4" /> AI Telemetry Analytics
                            </h4>
                            <p className="text-xs text-[#CBD5E1] leading-relaxed">
                                Stable sleep metrics and progressive step volumes correlate positively with cardiorespiratory index improvements. Keep steady pacing during tomorrow's walks.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
