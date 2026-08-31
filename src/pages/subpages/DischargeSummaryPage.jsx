import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    FileText, Calendar, CheckCircle, Clock, Landmark, Stethoscope, 
    ArrowRight, Printer, Download, HelpCircle, Shield, Award, CheckSquare, Square
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function DischargeSummaryPage() {
    const [user, setUser] = useState(null);
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        const summaryRef = collection(db, 'discharge_summaries');
        const q = query(summaryRef, where('patientId', '==', user.uid));

        const unsub = onSnapshot(q, (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setSummaries(data);
            setLoading(false);
        }, (error) => {
            console.error('[DischargeSummaryPage] Firestore error:', error);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    // Initial Discharge seed if empty
    const handleInitializeSummary = async () => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'discharge_summaries'), {
                patientId: user.uid,
                summaryId: 'DS-405-A',
                dischargeDate: '2026-05-15',
                hospital: 'Saint Jude Cardiac Center',
                diagnoses: 'Acute Coronary Syndrome, Post-PCI Stent Deployment',
                treatments: 'Primary Percutaneous Coronary Intervention (PCI) with drug-eluting stent deployment to Left Anterior Descending (LAD) artery. Stable post-procedure hemodynamic indices.',
                medications: [
                    { name: 'Clopidogrel 75mg', dosage: '1 tablet daily', duration: '12 Months' },
                    { name: 'Atorvastatin 80mg', dosage: '1 tablet every night', duration: 'Ongoing' },
                    { name: 'Metoprolol Succinate 25mg', dosage: '1 tablet daily', duration: 'Ongoing' }
                ],
                followUps: [
                    { title: 'Follow-up Cardiologist Consult (Dr. Liam Patel)', isCompleted: false, date: '2026-05-28' },
                    { title: 'Routine Metabolic Panel & Lipid Blood draws', isCompleted: false, date: '2026-06-05' }
                ],
                doctorRemarks: 'Patient was discharged in stable cardiac rhythm. Restrict physical load to under 15 lbs. Complete compliance with double anti-platelet therapy is absolute.'
            });
        } catch (err) {
            console.error('Error seeding discharge summary:', err);
        }
    };

    const handleToggleFollowup = async (summaryId, index) => {
        const summaryObj = summaries.find(s => s.id === summaryId);
        if (!summaryObj) return;

        const updatedFollowups = summaryObj.followUps.map((f, idx) => {
            if (idx === index) return { ...f, isCompleted: !f.isCompleted };
            return f;
        });

        try {
            await updateDoc(doc(db, 'discharge_summaries', summaryId), {
                followUps: updatedFollowups
            });
        } catch (err) {
            console.error('Error toggling follow-up item:', err);
        }
    };

    const activeSummary = summaries[0];

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 bg-[#00C8D4]/10 border border-[#00C8D4]/20 rounded-full px-3 py-1 w-fit mb-3">
                        <FileText className="w-4 h-4 text-[#00C8D4] animate-pulse" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Transition of Care</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Discharge Summary & Continuity</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Review official hospital discharge papers, track clinician post-visit directives, and download clinical PDFs.</p>
                </div>
                {activeSummary && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#1E2D4580] text-xs font-bold hover:text-white"
                        >
                            <Printer className="w-4 h-4" /> Print Document
                        </button>
                        <button
                            onClick={() => alert('Simulating PDF Summary document compile...')}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)]"
                        >
                            <Download className="w-4 h-4" /> Download Certified PDF
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-10 h-10 rounded-full border-4 border-teal-500/10 border-t-teal-400 animate-spin" />
                </div>
            ) : !activeSummary ? (
                <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[350px]">
                    <FileText className="w-16 h-16 text-slate-600 mb-4" />
                    <h3 className="text-lg font-bold text-white">No Discharge Record</h3>
                    <p className="text-xs text-[#8899AA] max-w-sm mt-2 leading-relaxed">
                        There are no active blockchain-logged transition summaries logged for your medical footprint.
                    </p>
                    <button
                        onClick={handleInitializeSummary}
                        className="mt-6 px-6 py-2.5 rounded-xl bg-[#00C8D4] text-[#0B0F1A] font-bold text-xs hover:shadow-[0_0_20px_rgba(0,200,212,0.3)] transition-all"
                    >
                        Sync Saint Jude Discharge Files
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                    {/* Left/Middle Column: Clinical details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Clinical summary sheet details */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-36 h-36 bg-[#00C8D4]/5 rounded-full blur-[40px] pointer-events-none" />
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1E2D4580] pb-5 mb-5">
                                <div>
                                    <span className="text-[9px] text-[#8899AA] font-mono block">Hospital Origin</span>
                                    <h3 className="text-base font-bold text-white">{activeSummary.hospital}</h3>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] text-[#8899AA] font-mono block">Discharge Date</span>
                                    <span className="text-xs font-bold text-slate-300 font-mono">{activeSummary.dischargeDate}</span>
                                </div>
                            </div>

                            {/* Medical diagnoses / treatments */}
                            <div className="space-y-5">
                                <div>
                                    <span className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider block mb-1">Primary Diagnosis</span>
                                    <p className="text-sm font-bold text-cyan-400">{activeSummary.diagnoses}</p>
                                </div>

                                <div>
                                    <span className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider block mb-1">Treatment Overview</span>
                                    <p className="text-xs text-slate-300 leading-relaxed bg-[#0B0F1A]/60 border border-[#1E2D4580] p-4 rounded-xl">
                                        {activeSummary.treatments}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Medications list */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Medications Logged at Discharge</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {activeSummary.medications?.map((med, idx) => (
                                    <div key={idx} className="bg-[#0B0F1A] border border-[#1E2D4580] p-4 rounded-xl text-left">
                                        <h4 className="text-xs font-bold text-white">{med.name}</h4>
                                        <span className="text-[10px] text-slate-500 block mt-1">{med.dosage}</span>
                                        <span className="inline-block mt-3 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-bold font-mono">
                                            {med.duration}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Physician instructions & checklist */}
                    <div className="space-y-6">
                        {/* Remarks card */}
                        <div className="bg-gradient-to-r from-purple-900/10 to-indigo-900/10 border border-purple-500/20 rounded-2xl p-5 text-left relative overflow-hidden">
                            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                <Stethoscope className="w-4 h-4" /> Doctor Remarks
                            </h4>
                            <p className="text-xs text-[#CBD5E1] leading-relaxed italic">
                                "{activeSummary.doctorRemarks}"
                            </p>
                        </div>

                        {/* Follow-up Checklist */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 space-y-4 text-left">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Discharge Follow-up Tasks</h4>
                            
                            <div className="space-y-3">
                                {activeSummary.followUps?.map((task, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => handleToggleFollowup(activeSummary.id, idx)}
                                        className="bg-[#0B0F1A]/60 border border-[#1E2D4580] hover:border-teal-500/40 p-3.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            {task.isCompleted ? (
                                                <CheckSquare className="w-4.5 h-4.5 text-[#00C8D4]" />
                                            ) : (
                                                <Square className="w-4.5 h-4.5 text-slate-600" />
                                            )}
                                            <span className={`text-[11px] font-medium ${
                                                task.isCompleted ? 'text-slate-500 line-through' : 'text-[#CBD5E1]'
                                            }`}>{task.title}</span>
                                        </div>
                                        <span className="text-[8px] text-slate-500 font-mono font-bold bg-[#111827] border border-[#1E2D4580] px-2 py-0.5 rounded">
                                            {task.date}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
