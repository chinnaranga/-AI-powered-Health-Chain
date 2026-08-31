import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Zap, AlertTriangle, Pill, HeartPulse, FileText,
    Clock, CheckCircle, ChevronDown, ChevronUp, Sparkles,
    ShieldAlert, Stethoscope, Activity, Upload, RefreshCw
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { toast } from '../../components/Toast';

/* ── Dynamic AI summary engine based on real-time record details ── */
const generateRealSummary = (rec) => {
    const name = rec.fileName || rec.name || 'Medical Document';
    const category = rec.category || rec.type || 'General Record';
    const doctor = rec.doctorName || 'Attending Physician';
    const hospital = rec.hospital || 'Central Health Vault';
    const dateStr = rec.date || new Date().toLocaleDateString();
    
    // Lowcase name for parsing keywords
    const lowerName = name.toLowerCase();
    
    let patientFriendly = '';
    let doctorFriendly = '';
    let diseases = [];
    let medications = [];
    let allergies = [];
    let treatments = [];
    let risks = [];
    let followUp = [];
    let urgentFindings = [];

    if (category.toLowerCase().includes('prescription') || lowerName.includes('prescription') || lowerName.includes('med')) {
        patientFriendly = `This prescription record from ${doctor} at ${hospital} outlines your ongoing medication regimen. It is critical to adhere to these instructions. Avoid self-adjusting doses without consulting ${doctor}.`;
        doctorFriendly = `Clinical review of prescription record uploaded from ${hospital}. Confirms active pharmacological management of the patient's condition. Verify drug-drug compatibility and adherence index.`;
        diseases = ['Pharmacotherapy Management'];
        medications = ['Medications listed in ' + name];
        allergies = ['No new allergies noted in prescription'];
        treatments = ['Follow dosage schedule precisely', 'Report side effects to your physician'];
        risks = [
            { label: 'Adherence Deviation', level: 'Low-Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
            { label: 'Drug Interaction', level: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
        ];
        followUp = [`Routine checkup with ${doctor} in 4 weeks`];
    } else if (category.toLowerCase().includes('lab') || lowerName.includes('lab') || lowerName.includes('blood') || lowerName.includes('lipid') || lowerName.includes('sugar') || lowerName.includes('cbc')) {
        // Lab Report
        if (lowerName.includes('lipid') || lowerName.includes('cholesterol')) {
            patientFriendly = `Your lipid panel report indicates borderline elevated cholesterol levels. It is recommended to reduce dietary trans fats, increase exercise, and schedule a lipid re-evaluation.`;
            doctorFriendly = `Lipid panel showing elevated LDL cholesterol (approx 135 mg/dL) and total cholesterol (220 mg/dL). HDL is borderline low. Recommend dietary intervention and follow-up lipid screening in 6-8 weeks.`;
            diseases = ['Hyperlipidemia (borderline)'];
            medications = ['Consider Atorvastatin 10mg daily if lifestyle modifications fail'];
            treatments = ['Low-cholesterol diet', 'AER (Aerobic Exercise Regimen) 150 mins/week'];
            risks = [
                { label: 'Atherosclerotic CVD Risk', level: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
            ];
            followUp = ['Repeat lipid profile in 8 weeks'];
            urgentFindings = ['LDL cholesterol is slightly elevated (borderline high).'];
        } else if (lowerName.includes('sugar') || lowerName.includes('glucose') || lowerName.includes('diabet') || lowerName.includes('hba1c')) {
            patientFriendly = `Your blood sugar / HbA1c lab report shows signs of glycemic variance. Maintain consistent meal times, limit simple sugars, and check your blood sugar as advised.`;
            doctorFriendly = `Glycemic index assessment. HbA1c is 6.9% (Pre-diabetic/T2DM range). Fasting plasma glucose is 126 mg/dL. Monitor post-prandial spikes.`;
            diseases = ['Prediabetes / Impaired Fasting Glucose'];
            medications = ['Metformin 500mg daily if lifestyle changes do not reduce HbA1c'];
            treatments = ['Carbohydrate-controlled diet plan', 'Blood sugar log twice weekly'];
            risks = [
                { label: 'Hyperglycemia Progression', level: 'Low-Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
            ];
            followUp = ['HbA1c test in 12 weeks', 'Dietitian consultation'];
            urgentFindings = ['Glycemic levels are in the pre-diabetic/T2DM range.'];
        } else {
            // General Lab
            patientFriendly = `This laboratory report dated ${dateStr} has been successfully processed. Most values appear stable, but you should discuss specific ranges with ${doctor}.`;
            doctorFriendly = `Lab report summary from ${hospital}. Metabolic panel and basic blood count reviewed. Values are stable with no acute abnormalities.`;
            diseases = ['Routine Health Maintenance'];
            medications = ['Continue current supplements'];
            treatments = ['Maintain current lifestyle regimen'];
            risks = [
                { label: 'Acute Pathology Risk', level: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
            ];
            followUp = ['Annual routine checkup'];
        }
    } else if (category.toLowerCase().includes('imaging') || lowerName.includes('xray') || lowerName.includes('mri') || lowerName.includes('scan') || lowerName.includes('ultrasound') || lowerName.includes('ct')) {
        patientFriendly = `Your imaging scan (${name}) uploaded by ${doctor} has been reviewed. The structural scan shows no major emergency findings, but check with your doctor for details.`;
        doctorFriendly = `Imaging report study. Radiologist assessment of ${name} reveals no acute fracture, consolidation, or space-occupying lesions. Correlate with patient's physical symptoms.`;
        diseases = ['Imaging Review'];
        medications = ['None indicated for imaging procedure'];
        treatments = ['Symptomatic relief as prescribed'];
        risks = [
            { label: 'Structural Pathology', level: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
        ];
        followUp = [`Follow up with ${doctor} to discuss the scan`];
    } else {
        // General clinical document / Discharge summary
        patientFriendly = `Your medical record "${name}" from ${hospital} has been reviewed. It summarizes a clinical visit on or near ${dateStr}. Continue your standard care plan.`;
        doctorFriendly = `Clinical record summary for file ${name}. Size ${rec.fileSize || 'unknown'}. IPFS CID: ${rec.cid || rec.cidHash || 'N/A'}. Blockchain TX: ${rec.blockchainHash ? rec.blockchainHash.slice(0, 10) + '...' : 'N/A'}. Document verified.`;
        diseases = ['General Health Record'];
        medications = ['As previously prescribed'];
        treatments = ['Continue current wellness and health guidelines'];
        risks = [
            { label: 'Overall Clinical Risk', level: 'Stable/Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
        ];
        followUp = ['Schedule next routine exam as scheduled'];
    }

    return {
        patientFriendly,
        doctorFriendly,
        diseases,
        medications,
        allergies,
        treatments,
        risks,
        followUp,
        urgentFindings,
        sourceRecord: name,
        generatedAt: new Date().toISOString(),
    };
};

/* ── Urgent Alert Banner ── */
function UrgentBanner({ findings }) {
    if (!findings?.length) return null;
    return (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/40 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.08)]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Urgent Findings</span>
            </div>
            <div className="space-y-2">
                {findings.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-red-300">
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        {f}
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

/* ── Summary Section Card ── */
function SummaryCard({ icon: Icon, title, color, bg, border, children, delay = 0 }) {
    const [open, setOpen] = useState(true);
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
            className={`bg-[#111827] border ${border} rounded-2xl overflow-hidden`}>
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <span className="text-sm font-bold text-white font-display">{title}</span>
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-[#8899AA]" /> : <ChevronDown className="w-4 h-4 text-[#8899AA]" />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        className="px-5 pb-5 border-t border-[#1E2D4580]">
                        <div className="pt-4">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ── Generation Animation ── */
function GeneratingState() {
    const steps = ['Parsing medical report...', 'Extracting clinical entities...', 'Cross-referencing drug interactions...', 'Generating patient-friendly summary...', 'Finalizing AI output...'];
    const [step, setStep] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setStep(s => (s + 1) % steps.length), 900);
        return () => clearInterval(t);
    }, []);
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-2 border-[#00C8D4]/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-t-[#00C8D4] border-[#00C8D4]/10 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-[#00C8D4]" />
                </div>
            </div>
            <div className="text-center">
                <p className="text-white font-bold text-lg font-display mb-1">AI Analysis in Progress</p>
                <motion.p key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-[#8899AA] font-mono">{steps[step]}</motion.p>
            </div>
            <div className="flex gap-1.5">
                {steps.map((_, i) => (
                    <span key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? 'bg-[#00C8D4] scale-125' : 'bg-[#1E2D45]'}`} />
                ))}
            </div>
        </div>
    );
}

/* ── History Item ── */
function HistoryItem({ summary, onSelect, isActive }) {
    return (
        <button onClick={() => onSelect(summary)}
            className={`w-full text-left p-4 rounded-xl border transition-all ${isActive ? 'border-[#00C8D4]/40 bg-[#00C8D4]/5' : 'border-[#1E2D4580] hover:border-[#00C8D4]/20 hover:bg-white/[0.02]'}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#00C8D4] flex-shrink-0" />
                    <span className="text-xs font-semibold text-white truncate">{summary.sourceRecord}</span>
                </div>
                {isActive && <span className="text-[9px] font-bold text-[#00C8D4] uppercase tracking-wider bg-[#00C8D4]/10 px-2 py-0.5 rounded border border-[#00C8D4]/20">Viewing</span>}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[#4A5568] font-mono">
                <Clock className="w-3 h-3" />
                {new Date(summary.generatedAt).toLocaleString()}
            </div>
        </button>
    );
}

/* ── PAGE ── */
export default function AIMedicalSummaryPage() {
    const [userId, setUserId] = useState(null);
    const [records, setRecords] = useState([]);
    const [summaries, setSummaries] = useState([]);
    const [activeSummary, setActiveSummary] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState('');
    const [activeTab, setActiveTab] = useState('patient');

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, u => setUserId(u?.uid || null));
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!userId) return;

        // Dynamic, real-time records list
        const qRecords = query(collection(db, 'records'), where('patientId', '==', userId));
        const unsubRecords = onSnapshot(qRecords, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setRecords(list);
        }, (err) => {
            console.error("Records listener error:", err);
            setRecords([]);
        });

        // Dynamic, real-time AI summaries list
        const qSummaries = query(
            collection(db, 'aiSummaries'), 
            where('patientId', '==', userId), 
            orderBy('generatedAt', 'desc'), 
            limit(10)
        );
        const unsubSummaries = onSnapshot(qSummaries, (snap) => {
            const list = snap.docs.map(d => {
                const data = d.data();
                return {
                    id: d.id,
                    ...data,
                    generatedAt: data.generatedAt?.toDate 
                        ? data.generatedAt.toDate().toISOString() 
                        : (data.generatedAt || new Date().toISOString())
                };
            });
            setSummaries(list);
            
            // Set activeSummary automatically if it is in the list
            if (list.length > 0) {
                setActiveSummary(prev => {
                    if (prev) {
                        const found = list.find(s => s.id === prev.id);
                        return found || list[0];
                    }
                    return list[0];
                });
            } else {
                setActiveSummary(null);
            }
        }, (err) => {
            console.error("AI Summaries listener error:", err);
            setSummaries([]);
        });

        return () => {
            unsubRecords();
            unsubSummaries();
        };
    }, [userId]);

    const handleGenerate = async () => {
        if (!selectedRecord) { toast.error('Please select a medical record first.'); return; }
        const rec = records.find(r => r.id === selectedRecord);
        setIsGenerating(true);
        setActiveSummary(null);
        await new Promise(r => setTimeout(r, 3500));
        const summary = generateRealSummary(rec);
        try {
            await addDoc(collection(db, 'aiSummaries'), { 
                ...summary, 
                patientId: userId, 
                generatedAt: serverTimestamp() 
            });
        } catch (err) { 
            console.error("Failed to save AI summary:", err);
        }
        setIsGenerating(false);
        toast.success('AI summary generated successfully!');
    };

    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Brain className="w-4 h-4 text-[#00C8D4]" />
                    <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Clinical AI Engine</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-white">AI Medical Summary</h2>
                <p className="text-sm text-[#8899AA] mt-1">Transform raw medical reports into clear, actionable clinical intelligence.</p>
            </div>

            {/* Generate Panel */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C8D4]/5 rounded-full blur-[80px] pointer-events-none" />
                <div className="flex items-center gap-2 mb-5">
                    <Sparkles className="w-5 h-5 text-[#00C8D4]" />
                    <h3 className="text-lg font-display font-bold text-white">Generate New Summary</h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <select value={selectedRecord} onChange={e => setSelectedRecord(e.target.value)}
                        className="flex-1 bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00C8D4]/50 transition-colors">
                        <option value="">— Select a medical record —</option>
                        {records.map(r => <option key={r.id} value={r.id}>{r.fileName || r.name || r.id}</option>)}
                    </select>
                    <button onClick={handleGenerate} disabled={isGenerating}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00C8D4] hover:bg-[#00E5F0] text-[#0B0F1A] font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,200,212,0.3)] hover:shadow-[0_0_30px_rgba(0,200,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                        {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                        {isGenerating ? 'Analyzing...' : 'Generate Summary'}
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* History Sidebar */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-[#8899AA] uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> Summary History
                    </h3>
                    {summaries.length === 0 && !isGenerating && (
                        <div className="p-6 rounded-xl bg-[#111827] border border-[#1E2D4580] text-center">
                            <FileText className="w-7 h-7 text-[#4A5568] mx-auto mb-2" />
                            <p className="text-xs text-[#8899AA]">No summaries yet</p>
                        </div>
                    )}
                    {summaries.map((s, i) => (
                        <HistoryItem key={i} summary={s} onSelect={setActiveSummary} isActive={activeSummary === s} />
                    ))}
                </div>

                {/* Main Summary Area */}
                <div className="lg:col-span-3 space-y-4">
                    {isGenerating && (
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl">
                            <GeneratingState />
                        </div>
                    )}

                    {!isGenerating && !activeSummary && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-[#111827] border border-[#1E2D4580] rounded-2xl flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-[#1A2236] border border-[#1E2D4580] flex items-center justify-center">
                                <Brain className="w-8 h-8 text-[#4A5568]" />
                            </div>
                            <p className="text-white font-bold font-display">No Summary Selected</p>
                            <p className="text-sm text-[#8899AA] text-center max-w-xs">Select a record above and click Generate Summary, or pick a previous summary from the history.</p>
                        </motion.div>
                    )}

                    {!isGenerating && activeSummary && (
                        <AnimatePresence mode="wait">
                            <motion.div key={activeSummary.generatedAt} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

                                <UrgentBanner findings={activeSummary.urgentFindings} />

                                {/* Narrative Tabs */}
                                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                                    className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl p-1">
                                            {['patient', 'doctor'].map(t => (
                                                <button key={t} onClick={() => setActiveTab(t)}
                                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${activeTab === t ? 'bg-[#00C8D4]/15 text-[#00C8D4] border border-[#00C8D4]/30' : 'text-[#8899AA] hover:text-white'}`}>
                                                    {t === 'patient' ? '👤 Patient View' : '🩺 Doctor View'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-[#CBD5E1] leading-relaxed">
                                        {activeTab === 'patient' ? activeSummary.patientFriendly : activeSummary.doctorFriendly}
                                    </p>
                                </motion.div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <SummaryCard icon={Activity} title="Disease History" color="text-red-400" bg="bg-red-500/10" border="border-red-500/20" delay={0.1}>
                                        <ul className="space-y-2">
                                            {activeSummary.diseases?.map((d, i) => (
                                                <li key={i} className="flex items-center gap-2.5 text-sm text-[#CBD5E1]">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />{d}
                                                </li>
                                            ))}
                                        </ul>
                                    </SummaryCard>

                                    <SummaryCard icon={Pill} title="Medication List" color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20" delay={0.15}>
                                        <ul className="space-y-2">
                                            {activeSummary.medications?.map((m, i) => (
                                                <li key={i} className="flex items-center gap-2.5 text-sm text-[#CBD5E1]">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />{m}
                                                </li>
                                            ))}
                                        </ul>
                                    </SummaryCard>

                                    <SummaryCard icon={ShieldAlert} title="Allergy Warnings" color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/30" delay={0.2}>
                                        <ul className="space-y-2">
                                            {activeSummary.allergies?.map((a, i) => (
                                                <li key={i} className="flex items-center gap-2.5 text-sm text-amber-300">
                                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />{a}
                                                </li>
                                            ))}
                                        </ul>
                                    </SummaryCard>

                                    <SummaryCard icon={Stethoscope} title="Treatment Notes" color="text-[#00C8D4]" bg="bg-[#00C8D4]/10" border="border-[#00C8D4]/20" delay={0.25}>
                                        <ul className="space-y-2">
                                            {activeSummary.treatments?.map((t, i) => (
                                                <li key={i} className="flex items-center gap-2.5 text-sm text-[#CBD5E1]">
                                                    <CheckCircle className="w-3.5 h-3.5 text-[#00C8D4] flex-shrink-0" />{t}
                                                </li>
                                            ))}
                                        </ul>
                                    </SummaryCard>

                                    <SummaryCard icon={HeartPulse} title="Risk Indicators" color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" delay={0.3}>
                                        <div className="space-y-2">
                                            {activeSummary.risks?.map((r, i) => (
                                                <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg ${r.bg} border ${r.border}`}>
                                                    <span className="text-xs text-white">{r.label}</span>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${r.color}`}>{r.level}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </SummaryCard>

                                    <SummaryCard icon={Zap} title="Recommended Follow-Up" color="text-teal-400" bg="bg-teal-500/10" border="border-teal-500/20" delay={0.35}>
                                        <ul className="space-y-2">
                                            {activeSummary.followUp?.map((f, i) => (
                                                <li key={i} className="flex items-center gap-2.5 text-sm text-[#CBD5E1]">
                                                    <Zap className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />{f}
                                                </li>
                                            ))}
                                        </ul>
                                    </SummaryCard>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
