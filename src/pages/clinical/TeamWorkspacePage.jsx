import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, MessageSquare, CheckCircle, Clock, AlertTriangle,
    Plus, ChevronDown, ChevronUp, User, FileText, Stethoscope,
    Activity, Send, Tag, MoreHorizontal, Calendar
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const STATUS_CFG = {
    active: { label: 'Active', color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/30', dot: 'bg-[#00C8D4]' },
    'pending-handoff': { label: 'Handoff Pending', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-400' },
    resolved: { label: 'Resolved', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
};

const PRIORITY_CFG = {
    high: { label: 'High', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    low: { label: 'Low', color: 'text-[#8899AA]', bg: 'bg-white/[0.04]', border: 'border-[#1E2D4580]' },
};

/* ── Case Card ── */
function CaseCard({ c, isActive, onClick }) {
    const status = STATUS_CFG[c.status] || STATUS_CFG.active;
    const priority = PRIORITY_CFG[c.priority] || PRIORITY_CFG.low;
    return (
        <motion.button
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                isActive ? 'bg-[#00C8D4]/5 border-[#00C8D4]/40' : 'bg-[#111827] border-[#1E2D4580] hover:border-[#00C8D4]/20'
            }`}>
            <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                    <p className="text-sm font-bold text-white">{c.patientName}</p>
                    <p className="text-[10px] font-mono text-[#4A5568]">{c.patientId}</p>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${priority.bg} ${priority.border} ${priority.color} flex-shrink-0`}>
                    {priority.label}
                </span>
            </div>
            <p className="text-xs text-[#8899AA] mb-3 line-clamp-1">{c.condition}</p>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${c.status === 'active' ? 'animate-pulse' : ''}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${status.color}`}>{status.label}</span>
                </div>
                <span className="text-[10px] font-mono text-[#4A5568] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {c.lastUpdated}
                </span>
            </div>
            {c.handoff && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-400 font-bold">
                    <AlertTriangle className="w-3 h-3" /> Handoff Ready
                </div>
            )}
        </motion.button>
    );
}

/* ── Note Bubble ── */
function NoteBubble({ note }) {
    const isDoctor = note.role === 'doctor';
    return (
        <motion.div initial={{ opacity: 0, x: isDoctor ? -10 : 10 }} animate={{ opacity: 1, x: 0 }}
            className={`flex gap-3 ${isDoctor ? '' : 'flex-row-reverse'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${isDoctor ? 'bg-[#00C8D4]/10 border border-[#00C8D4]/20 text-[#00C8D4]' : 'bg-purple-500/10 border border-purple-500/20 text-purple-400'}`}>
                {note.author.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className={`max-w-[80%] ${isDoctor ? '' : 'text-right'}`}>
                <div className={`flex items-center gap-2 mb-1 ${isDoctor ? '' : 'justify-end'}`}>
                    <span className="text-[10px] font-bold text-white">{note.author}</span>
                    <span className="text-[10px] font-mono text-[#4A5568]">{note.time}</span>
                </div>
                <div className={`p-3 rounded-xl text-xs text-[#CBD5E1] leading-relaxed ${isDoctor ? 'bg-[#1A2236] border border-[#1E2D4580] rounded-tl-none' : 'bg-purple-500/10 border border-purple-500/20 rounded-tr-none text-left'}`}>
                    {note.text}
                </div>
            </div>
        </motion.div>
    );
}

/* ── PAGE ── */
export default function TeamWorkspacePage() {
    const { user } = useAuth();
    const [cases, setCases] = useState([]);
    const [activeCaseId, setActiveCaseId] = useState(null);
    const [newNote, setNewNote] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'clinicalCases'), async (snapshot) => {
            if (snapshot.empty) {
                const initialCases = [
                    {
                        patientName: 'Ravi Patel',
                        patientId: 'PX-1042',
                        status: 'active',
                        priority: 'high',
                        department: 'Cardiology',
                        assignedTo: ['Dr. Sarah Patel', 'Nurse Geeta'],
                        lastUpdated: '2 hours ago',
                        condition: 'Hypertensive Emergency',
                        notes: [
                            { author: 'Dr. Sarah Patel', text: 'Patient stabilised on IV nitroprusside. Monitor BP every 15 minutes. Target <160/100 in first hour.', time: '10:45 AM', role: 'doctor' },
                            { author: 'Nurse Geeta', text: 'BP reading 168/102 at 10:30. Urine output adequate. IV line patent.', time: '10:52 AM', role: 'nurse' },
                            { author: 'Dr. Kumar', text: 'Echo scheduled for 2 PM. Watch for pulmonary oedema signs.', time: '11:10 AM', role: 'doctor' },
                        ],
                        tasks: [
                            { label: 'Monitor BP every 15 min', done: true },
                            { label: 'Echo at 2 PM', done: false },
                            { label: 'Nephrology consult', done: false },
                            { label: 'Discharge summary', done: false },
                        ],
                        handoff: false,
                    },
                    {
                        patientName: 'Anjali Mehta',
                        patientId: 'PX-0987',
                        status: 'pending-handoff',
                        priority: 'medium',
                        department: 'Orthopedics',
                        assignedTo: ['Dr. Singh', 'Dr. Priya'],
                        lastUpdated: '4 hours ago',
                        condition: 'Post-op Hip Replacement Day 2',
                        notes: [
                            { author: 'Dr. Singh', text: 'Wound looks clean. DVT prophylaxis ongoing. Start physiotherapy tomorrow morning.', time: 'Yesterday', role: 'doctor' },
                            { author: 'Dr. Priya', text: 'Accepting handoff for night shift. Reviewed case notes. Will monitor for fever.', time: '8:00 PM', role: 'doctor' },
                        ],
                        tasks: [
                            { label: 'DVT prophylaxis', done: true },
                            { label: 'Start physiotherapy', done: false },
                            { label: 'Pain management review', done: true },
                        ],
                        handoff: true,
                    },
                    {
                        patientName: 'Ramesh Kumar',
                        patientId: 'PX-2211',
                        status: 'resolved',
                        priority: 'low',
                        department: 'General Medicine',
                        assignedTo: ['Dr. James'],
                        lastUpdated: '1 day ago',
                        condition: 'Viral Fever — Discharge Ready',
                        notes: [
                            { author: 'Dr. James', text: 'Patient afebrile for 48 hours. Discharge planned. Paracetamol SOS for 3 days. Follow-up in 1 week.', time: 'Yesterday', role: 'doctor' },
                        ],
                        tasks: [
                            { label: 'Discharge summary', done: true },
                            { label: 'Prescription issued', done: true },
                            { label: 'OPD follow-up scheduled', done: true },
                        ],
                        handoff: false,
                    }
                ];
                for (const caseObj of initialCases) {
                    await addDoc(collection(db, 'clinicalCases'), caseObj);
                }
                return;
            }
            const list = snapshot.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data()
            }));
            setCases(list);
        }, (err) => console.warn('Error fetching clinical cases:', err));

        return unsub;
    }, []);

    const activeCase = cases.find(c => c.id === activeCaseId) || cases[0];
    const notes = activeCase?.notes || [];

    const handleSelectCase = (c) => {
        setActiveCaseId(c.id);
        setNewNote('');
    };

    const handleSendNote = async () => {
        if (!newNote.trim() || !activeCase) return;
        const note = {
            author: user?.displayName || user?.name || user?.email || 'Dr. (You)',
            text: newNote,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            role: user?.role || 'doctor'
        };
        const updatedNotes = [...notes, note];
        try {
            await updateDoc(doc(db, 'clinicalCases', activeCase.id), {
                notes: updatedNotes,
                lastUpdated: 'Just now'
            });
        } catch (error) {
            console.error('Error adding note:', error);
        }
        setNewNote('');
    };

    const handleToggleTask = async (taskIdx) => {
        if (!activeCase) return;
        const updatedTasks = activeCase.tasks.map((t, i) => i === taskIdx ? { ...t, done: !t.done } : t);
        try {
            await updateDoc(doc(db, 'clinicalCases', activeCase.id), {
                tasks: updatedTasks,
                lastUpdated: 'Just now'
            });
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    };

    const filteredCases = filterStatus === 'all' ? cases : cases.filter(c => c.status === filterStatus);
    const status = activeCase ? STATUS_CFG[activeCase.status] || STATUS_CFG.active : null;
    const completedTasks = activeCase?.tasks?.filter(t => t.done).length || 0;

    return (
        <div className="max-w-7xl mx-auto pb-12 h-[calc(100vh-120px)] flex flex-col space-y-5">
            {/* Header */}
            <div className="flex-shrink-0">
                <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-[#00C8D4]" />
                    <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Clinical Collaboration</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-white">Team Workspace</h2>
                <p className="text-sm text-[#8899AA] mt-1">Shared patient cases, discussion threads, and clinical handoffs.</p>
            </div>

            {/* Main Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-0">

                {/* Cases Panel */}
                <div className="flex flex-col gap-3 overflow-hidden">
                    {/* Filter */}
                    <div className="flex gap-2">
                        {['all', 'active', 'pending-handoff', 'resolved'].map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all flex-1 ${
                                    filterStatus === s ? 'bg-[#00C8D4]/15 text-[#00C8D4] border-[#00C8D4]/30' : 'bg-[#111827] text-[#8899AA] border-[#1E2D4580] hover:text-white'
                                }`}>
                                {s === 'pending-handoff' ? 'Handoff' : s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {filteredCases.map(c => (
                            <CaseCard key={c.id} c={c} isActive={activeCase?.id === c.id} onClick={() => handleSelectCase(c)} />
                        ))}
                    </div>
                </div>

                {/* Discussion Panel */}
                <div className="lg:col-span-2 flex flex-col gap-4 min-h-0 overflow-hidden">
                    {activeCase && (
                        <>
                            {/* Case Header Card */}
                            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 flex-shrink-0">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${status?.bg} ${status?.border} ${status?.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${status?.dot} ${activeCase.status === 'active' ? 'animate-pulse' : ''}`} />
                                                {status?.label}
                                            </span>
                                            <span className="text-[10px] text-[#8899AA] font-mono">{activeCase.department}</span>
                                        </div>
                                        <h3 className="text-xl font-display font-bold text-white">{activeCase.patientName}</h3>
                                        <p className="text-sm text-[#8899AA]">{activeCase.condition} · <span className="font-mono">{activeCase.patientId}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-[#8899AA] mb-1">Assigned Team</p>
                                        <div className="flex gap-1.5 justify-end flex-wrap">
                                            {activeCase.assignedTo?.map(name => (
                                                <span key={name} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#1A2236] border border-[#1E2D4580] text-[#CBD5E1]">
                                                    {name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Task Progress */}
                                <div className="mt-4 pt-4 border-t border-[#1E2D4580]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold text-[#8899AA] uppercase tracking-wider">Task Progress</span>
                                        <span className="text-[10px] font-mono text-white">{completedTasks} / {activeCase.tasks?.length || 0}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-[#1A2236] rounded-full overflow-hidden mb-3">
                                        <motion.div className="h-full bg-[#00C8D4] rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${activeCase.tasks?.length ? (completedTasks / activeCase.tasks.length) * 100 : 0}%` }}
                                            transition={{ duration: 0.6, ease: 'easeOut' }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {activeCase.tasks?.map((t, i) => (
                                            <button key={i} onClick={() => handleToggleTask(i)}
                                                className="flex items-center gap-2 text-xs hover:text-cyan-400 transition-colors text-left focus:outline-none">
                                                <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${t.done ? 'text-emerald-400' : 'text-[#4A5568]'}`} />
                                                <span className={t.done ? 'text-[#8899AA] line-through' : 'text-white'}>{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Notes Thread */}
                            <div className="flex-1 bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 flex flex-col gap-4 min-h-0 overflow-hidden">
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <MessageSquare className="w-4 h-4 text-[#00C8D4]" />
                                    <h4 className="text-sm font-bold text-white font-display">Discussion Feed</h4>
                                    <span className="ml-auto text-[10px] text-[#4A5568] font-mono">{notes.length} notes</span>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                                    {notes.map((note, i) => <NoteBubble key={i} note={note} />)}
                                </div>
                                {/* Input */}
                                <div className="flex-shrink-0 flex gap-3 pt-3 border-t border-[#1E2D4580]">
                                    <input
                                        value={newNote}
                                        onChange={e => setNewNote(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendNote()}
                                        placeholder="Add a clinical note or handoff comment..."
                                        className="flex-1 bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00C8D4]/40 transition-colors"
                                    />
                                    <button onClick={handleSendNote} disabled={!newNote.trim()}
                                        className="w-10 h-10 rounded-xl bg-[#00C8D4] hover:bg-[#00E5F0] flex items-center justify-center text-[#0B0F1A] transition-all shadow-[0_0_15px_rgba(0,200,212,0.2)] disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
