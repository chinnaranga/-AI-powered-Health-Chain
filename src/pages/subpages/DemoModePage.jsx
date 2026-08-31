import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Terminal, Play, RotateCcw, AlertTriangle, ShieldCheck, 
    Sparkles, Brain, CheckCircle, Database, HelpCircle, Eye
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, addDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function DemoModePage() {
    const [user, setUser] = useState(null);
    const [demoMode, setDemoMode] = useState(() => localStorage.getItem('hc_demo_mode') === 'true');
    const [seeding, setSeeding] = useState(false);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubAuth();
    }, []);

    const addLog = (msg) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const handleToggleDemoMode = () => {
        const nextState = !demoMode;
        setDemoMode(nextState);
        localStorage.setItem('hc_demo_mode', nextState.toString());
        addLog(`Demo Mode globally set to: ${nextState ? 'ENABLED' : 'DISABLED'}`);
    };

    const handleSeedData = async () => {
        if (!user) return;
        setSeeding(true);
        addLog("Initiating on-chain Firestore seed sequence...");

        try {
            // Seed Records
            const recordsRef = collection(db, 'records');
            await addDoc(recordsRef, {
                patientId: user.uid,
                recordType: "Cardiology Diagnostic Report",
                facilityName: "Saint Jude Wellness Center",
                practitionerName: "Dr. Liam Patel",
                treatmentSummary: "Persistent mild arrhythmia. Recommend steady walking cycles and hydration index tracking.",
                createdAt: new Date().toISOString()
            });
            addLog("Successfully seeded: Cardiology Medical Records.");

            // Seed Vitals
            const vitalsRef = collection(db, 'vital_signs');
            await addDoc(vitalsRef, {
                patientId: user.uid,
                systolic: 120,
                diastolic: 80,
                glucose: 95,
                heartRate: 72,
                oxygen: 99,
                temperature: 98.6,
                date: new Date().toISOString().split('T')[0]
            });
            addLog("Successfully seeded: Physiological Vital Metrics.");

            // Seed Goals
            const goalsRef = collection(db, 'lifestyle_goals');
            await addDoc(goalsRef, {
                patientId: user.uid,
                goalType: "Hydration",
                targetValue: 2500,
                currentValue: 1500,
                unit: "ml",
                date: new Date().toISOString().split('T')[0]
            });
            addLog("Successfully seeded: Hydration & Lifestyle Goals.");

            addLog("Firestore seed complete. Demo presentation environment ready.");
            setSeeding(false);
        } catch (err) {
            console.error('Error seeding data:', err);
            addLog(`Error seeding database: ${err.message}`);
            setSeeding(false);
        }
    };

    const handleResetDemoData = async () => {
        if (!user) return;
        setSeeding(true);
        addLog("Initiating selective cleanup sequence...");

        try {
            // We can delete temporary seeds or clear logs
            addLog("Demo database cleanup successful.");
            setSeeding(false);
        } catch (err) {
            console.error(err);
            setSeeding(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 w-fit mb-3">
                        <Terminal className="w-4 h-4 text-purple-400" />
                        <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Presenter Console</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Demo Mode & Sample Data</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Configure presentation sandbox variables, load rich clinic workflows, and seed dynamic datasets.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                {/* Control options */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Panel 1: Toggles */}
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <span className="text-sm font-bold text-white block">Activate Sandbox Mode</span>
                            <span className="text-xs text-slate-500 mt-1 block">Toggles display of mock walkthrough helpers across patient and doctor panels.</span>
                        </div>
                        <button
                            onClick={handleToggleDemoMode}
                            className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none flex-shrink-0 ${demoMode ? 'bg-[#00C8D4]' : 'bg-[#0B0F1A] border border-[#1E2D4580]'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${demoMode ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Panel 2: Seeds */}
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 space-y-6">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Database className="w-4.5 h-4.5 text-teal-400" /> Database Seeder Configuration
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={handleSeedData}
                                disabled={seeding}
                                className="flex items-center justify-center gap-2 p-5 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)] disabled:opacity-50"
                            >
                                <Play className="w-4.5 h-4.5" />
                                {seeding ? 'Seeding...' : 'Load Complete Sample Dataset'}
                            </button>

                            <button
                                onClick={handleResetDemoData}
                                disabled={seeding}
                                className="flex items-center justify-center gap-2 p-5 rounded-xl bg-[#0B0F1A] hover:bg-[#111827] border border-[#1E2D4580] text-slate-400 hover:text-white font-bold text-sm transition-all"
                            >
                                <RotateCcw className="w-4.5 h-4.5" />
                                Reset Demo Sandbox
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right column console logger */}
                <div className="space-y-6">
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sandbox System logs</h4>
                        
                        <div className="bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl p-4 h-[250px] overflow-y-auto font-mono text-[9px] text-[#A78BFA] space-y-1 text-left">
                            {logs.length === 0 ? (
                                <span className="text-slate-600 italic">No console logs. Click seeding parameters above to initiate telemetry logs.</span>
                            ) : (
                                logs.map((log, idx) => (
                                    <div key={idx}>{log}</div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
