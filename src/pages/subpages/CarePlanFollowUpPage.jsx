import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle, Calendar, ClipboardList, Sparkles, Brain, Plus, 
    XCircle, Clock, CheckSquare, Square, Heart, Award, ArrowRight
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function CarePlanFollowUpPage() {
    const [user, setUser] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTaskModal, setShowTaskModal] = useState(false);

    // Form states
    const [taskTitle, setTaskTitle] = useState('');
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        const planRef = collection(db, 'care_plans');
        const q = query(planRef, where('patientId', '==', user.uid));

        const unsub = onSnapshot(q, (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setPlans(data);
            setLoading(false);
        }, (error) => {
            console.error('[CarePlanFollowUpPage] Firestore error:', error);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    // Initialize post-cardiac plan if empty
    const handleInitializePlan = async () => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'care_plans'), {
                patientId: user.uid,
                planName: 'Post-Cardiac Discharge Plan',
                startDate: new Date().toISOString().split('T')[0],
                tasks: [
                    { taskId: 'TSK-101', title: 'Record Morning Blood Pressure logs', isCompleted: true, dueDate: 'Daily' },
                    { taskId: 'TSK-102', title: 'Schedule 2-Week Follow-up Cardiology Consult', isCompleted: false, dueDate: '2026-05-28' },
                    { taskId: 'TSK-103', title: 'Order Lipid Metabolic Blood Panel Refill', isCompleted: false, dueDate: '2026-06-05' }
                ],
                milestones: [
                    { title: 'Immediate Discharge Transition', isReached: true, targetDate: 'Day 1' },
                    { title: 'Full Exercise EKG Assessment', isReached: false, targetDate: 'Month 1' },
                    { title: 'Routine Lifestyle Stabilization', isReached: false, targetDate: 'Month 3' }
                ],
                doctorNotes: 'Keep low-sodium meal patterns. Avoid heavy physical lifting until standard EKG assessment has been officially verified.'
            });
        } catch (err) {
            console.error('Error establishing recovery plan:', err);
        }
    };

    const handleToggleTask = async (taskId) => {
        if (plans.length === 0) return;
        const targetPlan = plans[0];
        
        const updatedTasks = targetPlan.tasks.map(t => {
            if (t.taskId === taskId) {
                return { ...t, isCompleted: !t.isCompleted };
            }
            return t;
        });

        try {
            await updateDoc(doc(db, 'care_plans', targetPlan.id), {
                tasks: updatedTasks
            });
        } catch (err) {
            console.error('Error toggling task:', err);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!taskTitle || plans.length === 0) return;

        const targetPlan = plans[0];
        const newTask = {
            taskId: `TSK-${Math.floor(100 + Math.random() * 900)}`,
            title: taskTitle,
            isCompleted: false,
            dueDate: dueDate || 'As Directed'
        };

        const updatedTasks = [...(targetPlan.tasks || []), newTask];

        try {
            await updateDoc(doc(db, 'care_plans', targetPlan.id), {
                tasks: updatedTasks
            });

            // Reset
            setTaskTitle('');
            setDueDate('');
            setShowTaskModal(false);
        } catch (err) {
            console.error('Error logging care plan task:', err);
        }
    };

    const activePlan = plans[0];

    // Calculate progress
    const totalTasks = activePlan?.tasks?.length || 0;
    const completedTasks = activePlan?.tasks?.filter(t => t.isCompleted).length || 0;
    const progressRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 bg-[#00C8D4]/10 border border-[#00C8D4]/20 rounded-full px-3 py-1 w-fit mb-3">
                        <ClipboardList className="w-4 h-4 text-[#00C8D4] animate-pulse" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Care Coordination</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Care Plan & Recovery Timeline</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Review active post-visit checklists, log target milestone thresholds, and coordinate care plans.</p>
                </div>
                {activePlan && (
                    <button
                        onClick={() => setShowTaskModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)]"
                    >
                        <Plus className="w-4 h-4" /> Add Recovery Task
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-10 h-10 rounded-full border-4 border-teal-500/10 border-t-teal-400 animate-spin" />
                </div>
            ) : !activePlan ? (
                <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[350px]">
                    <ClipboardList className="w-16 h-16 text-slate-600 mb-4" />
                    <h3 className="text-lg font-bold text-white">No Care Plan Assigned</h3>
                    <p className="text-xs text-[#8899AA] max-w-sm mt-2 leading-relaxed">
                        Your clinical provider has not initialized an active post-discharge care plan on the blockchain node.
                    </p>
                    <button
                        onClick={handleInitializePlan}
                        className="mt-6 px-6 py-2.5 rounded-xl bg-[#00C8D4] text-[#0B0F1A] font-bold text-xs hover:shadow-[0_0_20px_rgba(0,200,212,0.3)] transition-all"
                    >
                        Initialize Post-Cardiac Care Plan
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                    {/* Left & Mid columns: Tasks checklist and Notes */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Care Plan Progress Card */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-[#00C8D4]/5 rounded-full blur-[40px] pointer-events-none" />
                            
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{activePlan.planName}</h3>
                                    <span className="text-[10px] text-slate-400 font-mono">Assigned {activePlan.startDate}</span>
                                </div>
                                <span className="text-2xl font-display font-extrabold text-[#00C8D4]">{progressRate}%</span>
                            </div>

                            <div className="w-full h-3 bg-[#0B0F1A] border border-[#1E2D4580] rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-teal-500 to-[#00C8D4] rounded-full"
                                    style={{ width: `${progressRate}%` }}
                                />
                            </div>
                        </div>

                        {/* Checklist */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Post-Discharge Recovery Checklist</h4>
                            
                            <div className="space-y-3">
                                {activePlan.tasks?.map((task, idx) => (
                                    <motion.div
                                        key={task.taskId}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => handleToggleTask(task.taskId)}
                                        className="bg-[#111827] border border-[#1E2D4580] rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-[#00C8D4]/40 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            {task.isCompleted ? (
                                                <CheckSquare className="w-5 h-5 text-teal-400 flex-shrink-0" />
                                            ) : (
                                                <Square className="w-5 h-5 text-slate-500 flex-shrink-0" />
                                            )}
                                            <span className={`text-xs font-medium leading-relaxed ${
                                                task.isCompleted ? 'text-slate-500 line-through' : 'text-[#CBD5E1]'
                                            }`}>
                                                {task.title}
                                            </span>
                                        </div>

                                        <span className="text-[10px] text-slate-500 font-mono bg-[#0B0F1A] border border-[#1E2D4580] px-2.5 py-0.5 rounded-lg flex-shrink-0">
                                            {task.dueDate}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right column: timeline milestones & physician instructions */}
                    <div className="space-y-6">
                        {/* Care Physician Instructions */}
                        <div className="bg-gradient-to-r from-purple-900/10 to-indigo-900/10 border border-purple-500/20 rounded-2xl p-5 text-left relative overflow-hidden">
                            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                <Heart className="w-4 h-4" /> Doctor Discharge Instructions
                            </h4>
                            <p className="text-xs text-[#CBD5E1] leading-relaxed italic">
                                "{activePlan.doctorNotes}"
                            </p>
                        </div>

                        {/* Timelines Milestones */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 text-left space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recovery Milestones</h4>
                            
                            <div className="space-y-4 relative pl-4 border-l border-[#1E2D4580] ml-2">
                                {activePlan.milestones?.map((mil, idx) => (
                                    <div key={idx} className="relative space-y-1">
                                        <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border ${
                                            mil.isReached 
                                                ? 'bg-teal-400 border-teal-400 shadow-[0_0_8px_#2dd4bf]' 
                                                : 'bg-[#111827] border-[#1E2D4580]'
                                        }`} />
                                        
                                        <h5 className={`text-xs font-bold ${
                                            mil.isReached ? 'text-teal-400' : 'text-slate-400'
                                        }`}>{mil.title}</h5>
                                        <span className="text-[10px] text-slate-500 font-mono block">{mil.targetDate}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Task Modal */}
            <AnimatePresence>
                {showTaskModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#111827] border border-[#1E2D4580] rounded-2xl max-w-md w-full p-6 space-y-6 relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00C8D4]/5 rounded-full blur-[40px] pointer-events-none" />

                            <div className="flex justify-between items-center border-b border-[#1E2D4580] pb-4">
                                <h3 className="font-display font-bold text-lg text-white">Add Recovery Task</h3>
                                <button onClick={() => setShowTaskModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddTask} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Task Title</label>
                                    <input
                                        type="text"
                                        value={taskTitle}
                                        onChange={(e) => setTaskTitle(e.target.value)}
                                        placeholder="e.g. Complete morning therapeutic walk"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Due Date / Interval</label>
                                    <input
                                        type="text"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        placeholder="e.g. Daily, 2026-06-01"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)] hover:shadow-[0_0_30px_rgba(0,200,212,0.4)] transition-all mt-4"
                                >
                                    Insert Task
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
