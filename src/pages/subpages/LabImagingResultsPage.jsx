import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, Search, Filter, AlertTriangle, CheckCircle, 
    RefreshCw, Brain, BarChart3, Calendar, ShieldCheck, Download,
    Plus, ChevronDown, Activity, Info
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from '../../components/Toast';

export default function LabImagingResultsPage({ defaultTab = 'All' }) {
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState([]);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState(defaultTab === 'radiology' ? 'Imaging' : defaultTab === 'lab' ? 'Lab' : 'All');

    useEffect(() => {
        if (defaultTab === 'radiology') {
            setCategoryFilter('Imaging');
        } else if (defaultTab === 'lab') {
            setCategoryFilter('Lab');
        }
    }, [defaultTab]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setFirebaseUser(user);
                
                // Real-time listener for patient test results
                const reportsRef = collection(db, 'lab_results');
                const q = query(reportsRef, where('patientId', '==', user.uid));
                
                const unsubReports = onSnapshot(q, (snapshot) => {
                    const data = [];
                    snapshot.forEach((doc) => {
                        data.push({ id: doc.id, ...doc.data() });
                    });
                    setReports(data);
                    setLoading(false);
                }, (error) => {
                    console.error('[LabImagingResultsPage] Firestore error:', error);
                    setLoading(false);
                });

                return () => unsubReports();
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Filter reports
    const filteredReports = reports.filter(r => {
        const matchesSearch = (r.testName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (r.provider || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || r.type === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-[#00C8D4] animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-16 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1E2D4580] pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-[#00C8D4] animate-pulse" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Diagnostic & Imaging Dashboard</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Lab & Imaging Results</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Review diagnostic panels, track historical metric comparisons, and examine smart AI-generated insights.</p>
                </div>
            </div>

            {/* Historical Lab Metrics Graph - Rendered only when real patient report data exists */}
            {reports.length > 0 && (
                <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C8D4]/5 rounded-full blur-[40px] pointer-events-none" />
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-[#00C8D4]" /> Historical Lab Metrics Comparison
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={reports.map(r => ({ date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), ...(r.chartMetrics || {}) }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4530" />
                                <XAxis dataKey="date" stroke="#8899AA" fontSize={11} />
                                <YAxis yAxisId="left" stroke="#00C8D4" fontSize={11} />
                                <YAxis yAxisId="right" orientation="right" stroke="#a78bfa" fontSize={11} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#111827',
                                        border: '1px solid #1E2D4580',
                                        borderRadius: '12px',
                                        color: '#fff'
                                    }}
                                />
                                <Line yAxisId="left" type="monotone" dataKey="Glucose" stroke="#00C8D4" strokeWidth={2.5} name="Glucose (mg/dL)" />
                                <Line yAxisId="right" type="monotone" dataKey="Haemoglobin" stroke="#a78bfa" strokeWidth={2.5} name="Haemoglobin (g/dL)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Filter controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#111827]/40 border border-[#1E2D4580] rounded-2xl p-4">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899AA]" />
                    <input
                        type="text"
                        placeholder="Search diagnostics reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setCategoryFilter('All')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                            categoryFilter === 'All' ? 'bg-[#00C8D4]/10 border-[#00C8D4]/30 text-[#00C8D4]' : 'bg-[#0B0F1A] border-[#1E2D4580] text-[#8899AA]'
                        }`}
                    >
                        All Results
                    </button>
                    <button
                        onClick={() => setCategoryFilter('Lab')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                            categoryFilter === 'Lab' ? 'bg-[#00C8D4]/10 border-[#00C8D4]/30 text-[#00C8D4]' : 'bg-[#0B0F1A] border-[#1E2D4580] text-[#8899AA]'
                        }`}
                    >
                        Laboratory
                    </button>
                    <button
                        onClick={() => setCategoryFilter('Imaging')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                            categoryFilter === 'Imaging' ? 'bg-[#00C8D4]/10 border-[#00C8D4]/30 text-[#00C8D4]' : 'bg-[#0B0F1A] border-[#1E2D4580] text-[#8899AA]'
                        }`}
                    >
                        Imaging
                    </button>
                </div>
            </div>

            {/* Results Grid list */}
            {filteredReports.length === 0 ? (
                <div className="bg-[#111827] border border-[#1E2D4580] border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[250px]">
                    <Activity className="w-10 h-10 text-slate-600 mb-3" />
                    <h4 className="text-sm font-bold text-[#8899AA]">No Diagnostic Reports Found</h4>
                    <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                        No laboratory panels or imaging diagnostics match your filter or exist under your patient footprint.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredReports.map((r, i) => (
                        <motion.div
                            key={r.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 relative overflow-hidden text-left"
                        >
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                            <div>
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                    r.type === 'Lab' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                }`}>
                                    {r.type} Report
                                </span>
                                <h4 className="text-lg font-bold text-white mt-1.5">{r.testName}</h4>
                                <p className="text-xs text-[#8899AA] mt-0.5">{r.provider} • {new Date(r.date).toLocaleDateString()}</p>
                            </div>
                            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl font-bold">
                                <CheckCircle className="w-4 h-4" /> {r.status}
                            </span>
                        </div>

                        {/* Detailed Metrics Table */}
                        <div className="bg-[#0B0F1A] border border-[#1E2D4580] rounded-2xl overflow-hidden mb-6">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#1E2D4580] bg-white/[0.02]">
                                        <th className="px-4 py-3 font-bold text-[#8899AA] uppercase tracking-wider">Metric Test</th>
                                        <th className="px-4 py-3 font-bold text-[#8899AA] uppercase tracking-wider">Result Value</th>
                                        <th className="px-4 py-3 font-bold text-[#8899AA] uppercase tracking-wider">Reference Range</th>
                                        <th className="px-4 py-3 font-bold text-[#8899AA] uppercase tracking-wider text-right">Status Flag</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {r.details.map((d, index) => (
                                        <tr key={index} className="border-b border-[#1E2D4520] hover:bg-white/[0.01]">
                                            <td className="px-4 py-3 font-semibold text-white">{d.metric}</td>
                                            <td className="px-4 py-3 font-mono font-bold text-white">{d.value}</td>
                                            <td className="px-4 py-3 text-slate-500 font-mono">{d.reference}</td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider ${
                                                    d.status === 'Abnormal' ? 'bg-red-500/10 text-red-400 border border-red-500/25 animate-pulse' : 'bg-emerald-500/10 text-emerald-400'
                                                }`}>
                                                    {d.status === 'Abnormal' && <AlertTriangle className="w-3 h-3" />}
                                                    {d.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Smart AI Insights */}
                        {r.aiInsights && (
                            <div className="bg-gradient-to-r from-purple-900/10 to-indigo-900/10 border border-purple-500/20 rounded-2xl p-5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-[25px] pointer-events-none" />
                                <h5 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                    <Brain className="w-4 h-4 text-purple-400" /> AI Diagnostic Insights
                                </h5>
                                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                                    {r.aiInsights}
                                </p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
            )}
        </div>
    );
}
