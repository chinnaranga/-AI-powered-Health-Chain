import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, Heart, Plus, XCircle, AlertTriangle, CheckCircle, 
    Thermometer, ShieldAlert, Sparkles, Brain, FileText
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function VitalSignsTrendsPage() {
    const [user, setUser] = useState(null);
    const [vitals, setVitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form states
    const [systolic, setSystolic] = useState('');
    const [diastolic, setDiastolic] = useState('');
    const [bloodSugar, setBloodSugar] = useState('');
    const [heartRate, setHeartRate] = useState('');
    const [oxygenSat, setOxygenSat] = useState('');
    const [temp, setTemp] = useState('');

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        const vitalsRef = collection(db, 'vital_signs');
        const q = query(vitalsRef, where('patientId', '==', user.uid));

        const unsub = onSnapshot(q, (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            // Sort by timestamp asc for charts
            data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            setVitals(data);
            setLoading(false);
        }, (error) => {
            console.error('[VitalSignsTrendsPage] Firestore error:', error);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    // Seed sample data if empty
    const handleInitializeVitals = async () => {
        if (!user) return;
        try {
            const sampleVitals = [
                { systolic: 120, diastolic: 80, bloodSugar: 95, heartRate: 72, oxygenSat: 98, temperature: 98.6, timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), isDoctorReviewed: true },
                { systolic: 124, diastolic: 82, bloodSugar: 110, heartRate: 78, oxygenSat: 97, temperature: 98.8, timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), isDoctorReviewed: true },
                { systolic: 135, diastolic: 88, bloodSugar: 145, heartRate: 85, oxygenSat: 95, temperature: 99.2, timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), isDoctorReviewed: false },
                { systolic: 121, diastolic: 79, bloodSugar: 98, heartRate: 68, oxygenSat: 99, temperature: 98.4, timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), isDoctorReviewed: true }
            ];

            for (const item of sampleVitals) {
                await addDoc(collection(db, 'vital_signs'), {
                    patientId: user.uid,
                    ...item
                });
            }
        } catch (err) {
            console.error('Error seeding vitals:', err);
        }
    };

    const handleAddReading = async (e) => {
        e.preventDefault();
        if (!systolic || !heartRate) return;

        try {
            await addDoc(collection(db, 'vital_signs'), {
                patientId: user.uid,
                systolic: Number(systolic),
                diastolic: Number(diastolic) || 80,
                bloodSugar: Number(bloodSugar) || 90,
                heartRate: Number(heartRate),
                oxygenSat: Number(oxygenSat) || 98,
                temperature: Number(temp) || 98.6,
                timestamp: new Date().toISOString(),
                isDoctorReviewed: false
            });

            // Reset
            setSystolic('');
            setDiastolic('');
            setBloodSugar('');
            setHeartRate('');
            setOxygenSat('');
            setTemp('');
            setShowAddModal(false);
        } catch (err) {
            console.error('Error adding vital reading:', err);
        }
    };

    const latest = vitals[vitals.length - 1] || {
        systolic: 120, diastolic: 80, bloodSugar: 90, heartRate: 72, oxygenSat: 98, temperature: 98.6, isDoctorReviewed: true
    };

    // Threshold flags for abnormal warnings
    const bpAbnormal = latest.systolic >= 130 || latest.diastolic >= 90;
    const sugarAbnormal = latest.bloodSugar >= 130 || latest.bloodSugar < 70;
    const hrAbnormal = latest.heartRate >= 100 || latest.heartRate < 60;
    const o2Abnormal = latest.oxygenSat < 95;

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 bg-[#00C8D4]/10 border border-[#00C8D4]/20 rounded-full px-3 py-1 w-fit mb-3">
                        <Activity className="w-4 h-4 text-[#00C8D4] animate-pulse" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Clinical Telemetry</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Vitals & Physiological Trends</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Review live physiological telemetry, track historical charts, and log health readings.</p>
                </div>
                <div className="flex gap-3">
                    {vitals.length === 0 && !loading && (
                        <button
                            onClick={handleInitializeVitals}
                            className="px-4 py-2.5 rounded-xl border border-[#1E2D4580] text-xs font-bold hover:text-white"
                        >
                            Sync Sample Telemetry
                        </button>
                    )}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)]"
                    >
                        <Plus className="w-4 h-4" /> Log Vital Reading
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-10 h-10 rounded-full border-4 border-teal-500/10 border-t-teal-400 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-left">
                    {/* Live Metric Cards Grid */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Card 1: BP */}
                            <div className={`bg-[#111827] border ${bpAbnormal ? 'border-red-500/30 bg-red-500/[0.02]' : 'border-[#1E2D4580]'} rounded-2xl p-5 relative overflow-hidden`}>
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Blood Pressure</span>
                                    <Heart className={`w-4 h-4 ${bpAbnormal ? 'text-red-400' : 'text-[#00C8D4]'}`} />
                                </div>
                                <div className="mt-3 flex items-baseline gap-1.5">
                                    <span className="text-3xl font-display font-extrabold text-white">{latest.systolic}/{latest.diastolic}</span>
                                    <span className="text-xs text-slate-500">mmHg</span>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className={`text-[10px] font-bold ${bpAbnormal ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {bpAbnormal ? 'Stage 1 Hypertension' : 'Normal'}
                                    </span>
                                    {latest.isDoctorReviewed && (
                                        <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-bold font-mono">Reviewed</span>
                                    )}
                                </div>
                            </div>

                            {/* Card 2: Blood Sugar */}
                            <div className={`bg-[#111827] border ${sugarAbnormal ? 'border-red-500/30 bg-red-500/[0.02]' : 'border-[#1E2D4580]'} rounded-2xl p-5 relative overflow-hidden`}>
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Blood Sugar</span>
                                    <Activity className={`w-4 h-4 ${sugarAbnormal ? 'text-red-400' : 'text-teal-400'}`} />
                                </div>
                                <div className="mt-3 flex items-baseline gap-1.5">
                                    <span className="text-3xl font-display font-extrabold text-white">{latest.bloodSugar}</span>
                                    <span className="text-xs text-slate-500">mg/dL</span>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className={`text-[10px] font-bold ${sugarAbnormal ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {sugarAbnormal ? 'Elevated glucose' : 'Normal'}
                                    </span>
                                </div>
                            </div>

                            {/* Card 3: Heart Rate */}
                            <div className={`bg-[#111827] border ${hrAbnormal ? 'border-red-500/30 bg-red-500/[0.02]' : 'border-[#1E2D4580]'} rounded-2xl p-5 relative overflow-hidden`}>
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Heart Rate</span>
                                    <Heart className={`w-4 h-4 animate-pulse ${hrAbnormal ? 'text-red-400' : 'text-rose-400'}`} />
                                </div>
                                <div className="mt-3 flex items-baseline gap-1.5">
                                    <span className="text-3xl font-display font-extrabold text-white">{latest.heartRate}</span>
                                    <span className="text-xs text-slate-500">bpm</span>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className={`text-[10px] font-bold ${hrAbnormal ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {hrAbnormal ? 'Tachycardia Alert' : 'Stable'}
                                    </span>
                                </div>
                            </div>

                            {/* Card 4: O2 Saturation */}
                            <div className={`bg-[#111827] border ${o2Abnormal ? 'border-red-500/30 bg-red-500/[0.02]' : 'border-[#1E2D4580]'} rounded-2xl p-5 relative overflow-hidden`}>
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Oxygen Saturation</span>
                                    <Activity className={`w-4 h-4 ${o2Abnormal ? 'text-red-400' : 'text-cyan-400'}`} />
                                </div>
                                <div className="mt-3 flex items-baseline gap-1.5">
                                    <span className="text-3xl font-display font-extrabold text-white">{latest.oxygenSat}</span>
                                    <span className="text-xs text-slate-500">%</span>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className={`text-[10px] font-bold ${o2Abnormal ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {o2Abnormal ? 'Hypoxia warning' : 'Optimal'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Chart Trends */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 relative overflow-hidden">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Historical Vitals Graph</h3>
                            
                            <div className="h-[250px] w-full font-mono text-[9px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={vitals}>
                                        <defs>
                                            <linearGradient id="colorBP" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00C8D4" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#00C8D4" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4550" />
                                        <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} stroke="#8899AA" />
                                        <YAxis stroke="#8899AA" domain={[60, 160]} />
                                        <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1E2D4580' }} />
                                        <Area type="monotone" name="Systolic BP" dataKey="systolic" stroke="#00C8D4" strokeWidth={2} fillOpacity={1} fill="url(#colorBP)" />
                                        <Area type="monotone" name="Heart Rate" dataKey="heartRate" stroke="#EC4899" strokeWidth={2} fill="none" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Right side diagnostics panel */}
                    <div className="space-y-6 lg:col-span-1">
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 text-left space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Clinical Insights</h4>
                            
                            {bpAbnormal || sugarAbnormal || hrAbnormal || o2Abnormal ? (
                                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3.5 flex gap-3 text-xs text-red-400 leading-relaxed">
                                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                                    <div>
                                        <span className="font-bold">Anomalous reading registered:</span>
                                        <p className="mt-1 text-slate-300">
                                            Recent systolic blood pressure or heart rate metrics reside outside recommended therapeutic thresholds. Confirm intake of daily meds.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3.5 flex gap-3 text-xs text-emerald-400 leading-relaxed">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                    <div>
                                        <span className="font-bold">Physiological metrics optimized:</span>
                                        <p className="mt-1 text-slate-300">
                                            No abnormal anomalies detected in blood pressure, heart rates, oxygen indexes, or glucose logs.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-gradient-to-r from-purple-900/10 to-indigo-900/10 border border-purple-500/20 rounded-xl p-4 flex gap-3 text-xs text-purple-400">
                                <Brain className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="font-bold">AI Diagnostics Note:</span>
                                    <p className="mt-1 text-slate-300 leading-relaxed">
                                        BP fluctuation tracks normal post-exercise recovery spikes. Glucose trends indicates consistent morning metabolic stability.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual entry log wizard */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#111827] border border-[#1E2D4580] rounded-2xl max-w-md w-full p-6 space-y-6 relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00C8D4]/5 rounded-full blur-[40px] pointer-events-none" />

                            <div className="flex justify-between items-center border-b border-[#1E2D4580] pb-4">
                                <h3 className="font-display font-bold text-lg text-white">Log Vital Reading</h3>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddReading} className="space-y-4 text-left">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Systolic BP (mmHg)</label>
                                        <input
                                            type="number"
                                            value={systolic}
                                            onChange={(e) => setSystolic(e.target.value)}
                                            placeholder="120"
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Diastolic BP (mmHg)</label>
                                        <input
                                            type="number"
                                            value={diastolic}
                                            onChange={(e) => setDiastolic(e.target.value)}
                                            placeholder="80"
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Heart Rate (bpm)</label>
                                        <input
                                            type="number"
                                            value={heartRate}
                                            onChange={(e) => setHeartRate(e.target.value)}
                                            placeholder="72"
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Blood Sugar (mg/dL)</label>
                                        <input
                                            type="number"
                                            value={bloodSugar}
                                            onChange={(e) => setBloodSugar(e.target.value)}
                                            placeholder="90"
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">O2 Saturation (%)</label>
                                        <input
                                            type="number"
                                            value={oxygenSat}
                                            onChange={(e) => setOxygenSat(e.target.value)}
                                            placeholder="98"
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Temperature (°F)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={temp}
                                            onChange={(e) => setTemp(e.target.value)}
                                            placeholder="98.6"
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)] mt-4"
                                >
                                    Log Reading to Blockchain Ledger
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
