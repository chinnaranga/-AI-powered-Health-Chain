import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Heart, Sparkles, Brain, Plus, XCircle, Award, CheckCircle, 
    Droplets, Clock, Zap, Flame, Trophy, FlameKindling
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function HealthGoalsLifestylePage() {
    const [user, setUser] = useState(null);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        const goalsRef = collection(db, 'lifestyle_goals');
        const q = query(goalsRef, where('patientId', '==', user.uid));

        const unsub = onSnapshot(q, (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setGoals(data);
            setLoading(false);
        }, (error) => {
            console.error('[HealthGoalsLifestylePage] Firestore error:', error);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    // Initial seed if empty
    const handleInitializeGoals = async () => {
        if (!user) return;
        try {
            const sampleGoals = [
                { goalType: "Hydration", targetValue: 2500, currentValue: 1250, unit: "ml", date: new Date().toISOString().split('T')[0] },
                { goalType: "Sleep", targetValue: 8, currentValue: 6, unit: "hrs", date: new Date().toISOString().split('T')[0] },
                { goalType: "Exercise", targetValue: 60, currentValue: 30, unit: "min", date: new Date().toISOString().split('T')[0] },
                { goalType: "Diet", targetValue: 2200, currentValue: 1400, unit: "kcal", date: new Date().toISOString().split('T')[0] }
            ];

            for (const item of sampleGoals) {
                await addDoc(collection(db, 'lifestyle_goals'), {
                    patientId: user.uid,
                    ...item
                });
            }
        } catch (err) {
            console.error('Error seeding goals:', err);
        }
    };

    const handleIncrementGoal = async (goalId, incrementVal) => {
        const goalObj = goals.find(g => g.id === goalId);
        if (!goalObj) return;

        const nextVal = Math.min(goalObj.targetValue, goalObj.currentValue + incrementVal);

        try {
            await updateDoc(doc(db, 'lifestyle_goals', goalId), {
                currentValue: nextVal
            });
        } catch (err) {
            console.error('Error incrementing wellness goal:', err);
        }
    };

    const hydration = goals.find(g => g.goalType === 'Hydration') || { id: null, currentValue: 1000, targetValue: 2500, unit: 'ml' };
    const sleep = goals.find(g => g.goalType === 'Sleep') || { id: null, currentValue: 6, targetValue: 8, unit: 'hrs' };
    const exercise = goals.find(g => g.goalType === 'Exercise') || { id: null, currentValue: 30, targetValue: 60, unit: 'min' };
    const diet = goals.find(g => g.goalType === 'Diet') || { id: null, currentValue: 1500, targetValue: 2200, unit: 'kcal' };

    // Function to calculate circle stroke-dashoffset
    const getStrokeOffset = (current, target, radius = 40) => {
        const circumference = radius * 2 * Math.PI;
        const percent = Math.min(100, (current / target) * 100);
        return circumference - (percent / 100) * circumference;
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 bg-[#00C8D4]/10 border border-[#00C8D4]/20 rounded-full px-3 py-1 w-fit mb-3">
                        <Heart className="w-4 h-4 text-[#00C8D4] animate-pulse" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Wellness & Habits</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Health Goals & Lifestyle Hub</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Track target hydration indexes, manage recovery sleep, and log lifestyle achievements.</p>
                </div>
                {goals.length === 0 && !loading && (
                    <button
                        onClick={handleInitializeGoals}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)]"
                    >
                        Sync Lifestyle Metrics
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-10 h-10 rounded-full border-4 border-teal-500/10 border-t-teal-400 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-left">
                    {/* Goals progress rings panels */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Panel 1: Hydration */}
                            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 flex items-center justify-between gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-cyan-400">
                                        <Droplets className="w-5 h-5" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Hydration Logs</span>
                                    </div>
                                    <div>
                                        <span className="text-2xl font-display font-extrabold text-white">{hydration.currentValue} / {hydration.targetValue}</span>
                                        <span className="text-xs text-slate-500 ml-1">{hydration.unit}</span>
                                    </div>
                                    {hydration.id && (
                                        <button
                                            onClick={() => handleIncrementGoal(hydration.id, 250)}
                                            className="px-3.5 py-1.5 rounded-lg bg-[#00C8D4]/10 hover:bg-[#00C8D4]/20 border border-[#00C8D4]/30 text-[#00C8D4] text-[10px] font-bold transition-all"
                                        >
                                            + Log 250ml Water
                                        </button>
                                    )}
                                </div>

                                {/* Progress Ring SVG */}
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-95">
                                        <circle cx="48" cy="48" r="38" stroke="#1E2D4580" strokeWidth="6" fill="none" />
                                        <circle 
                                            cx="48" cy="48" r="38" 
                                            stroke="#00C8D4" strokeWidth="6" fill="none"
                                            strokeDasharray={`${2 * Math.PI * 38}`}
                                            strokeDashoffset={getStrokeOffset(hydration.currentValue, hydration.targetValue, 38)}
                                            strokeLinecap="round"
                                            className="transition-all duration-300"
                                        />
                                    </svg>
                                    <span className="absolute text-[11px] font-bold font-mono text-[#00C8D4]">
                                        {Math.round((hydration.currentValue / hydration.targetValue) * 100)}%
                                    </span>
                                </div>
                            </div>

                            {/* Panel 2: Sleep */}
                            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 flex items-center justify-between gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-purple-400">
                                        <Clock className="w-5 h-5" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Sleep tracking</span>
                                    </div>
                                    <div>
                                        <span className="text-2xl font-display font-extrabold text-white">{sleep.currentValue} / {sleep.targetValue}</span>
                                        <span className="text-xs text-slate-500 ml-1">{sleep.unit}</span>
                                    </div>
                                    {sleep.id && (
                                        <button
                                            onClick={() => handleIncrementGoal(sleep.id, 1)}
                                            className="px-3.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 text-[10px] font-bold transition-all"
                                        >
                                            + Log 1 hr Sleep
                                        </button>
                                    )}
                                </div>

                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-95">
                                        <circle cx="48" cy="48" r="38" stroke="#1E2D4580" strokeWidth="6" fill="none" />
                                        <circle 
                                            cx="48" cy="48" r="38" 
                                            stroke="#A78BFA" strokeWidth="6" fill="none"
                                            strokeDasharray={`${2 * Math.PI * 38}`}
                                            strokeDashoffset={getStrokeOffset(sleep.currentValue, sleep.targetValue, 38)}
                                            strokeLinecap="round"
                                            className="transition-all duration-300"
                                        />
                                    </svg>
                                    <span className="absolute text-[11px] font-bold font-mono text-purple-400">
                                        {Math.round((sleep.currentValue / sleep.targetValue) * 100)}%
                                    </span>
                                </div>
                            </div>

                            {/* Panel 3: Exercise */}
                            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 flex items-center justify-between gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-rose-400">
                                        <Zap className="w-5 h-5" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Active Exercise</span>
                                    </div>
                                    <div>
                                        <span className="text-2xl font-display font-extrabold text-white">{exercise.currentValue} / {exercise.targetValue}</span>
                                        <span className="text-xs text-slate-500 ml-1">{exercise.unit}</span>
                                    </div>
                                    {exercise.id && (
                                        <button
                                            onClick={() => handleIncrementGoal(exercise.id, 10)}
                                            className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[10px] font-bold transition-all"
                                        >
                                            + Log 10 min Workout
                                        </button>
                                    )}
                                </div>

                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-95">
                                        <circle cx="48" cy="48" r="38" stroke="#1E2D4580" strokeWidth="6" fill="none" />
                                        <circle 
                                            cx="48" cy="48" r="38" 
                                            stroke="#F43F5E" strokeWidth="6" fill="none"
                                            strokeDasharray={`${2 * Math.PI * 38}`}
                                            strokeDashoffset={getStrokeOffset(exercise.currentValue, exercise.targetValue, 38)}
                                            strokeLinecap="round"
                                            className="transition-all duration-300"
                                        />
                                    </svg>
                                    <span className="absolute text-[11px] font-bold font-mono text-rose-400">
                                        {Math.round((exercise.currentValue / exercise.targetValue) * 100)}%
                                    </span>
                                </div>
                            </div>

                            {/* Panel 4: Diet */}
                            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 flex items-center justify-between gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <Flame className="w-5 h-5" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Dietary Calories</span>
                                    </div>
                                    <div>
                                        <span className="text-2xl font-display font-extrabold text-white">{diet.currentValue} / {diet.targetValue}</span>
                                        <span className="text-xs text-slate-500 ml-1">{diet.unit}</span>
                                    </div>
                                    {diet.id && (
                                        <button
                                            onClick={() => handleIncrementGoal(diet.id, 200)}
                                            className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold transition-all"
                                        >
                                            + Log 200kcal Intake
                                        </button>
                                    )}
                                </div>

                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-95">
                                        <circle cx="48" cy="48" r="38" stroke="#1E2D4580" strokeWidth="6" fill="none" />
                                        <circle 
                                            cx="48" cy="48" r="38" 
                                            stroke="#10B981" strokeWidth="6" fill="none"
                                            strokeDasharray={`${2 * Math.PI * 38}`}
                                            strokeDashoffset={getStrokeOffset(diet.currentValue, diet.targetValue, 38)}
                                            strokeLinecap="round"
                                            className="transition-all duration-300"
                                        />
                                    </svg>
                                    <span className="absolute text-[11px] font-bold font-mono text-emerald-400">
                                        {Math.round((diet.currentValue / diet.targetValue) * 100)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side Wellness rewards card */}
                    <div className="space-y-6">
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 text-left relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                                <Trophy className="w-4.5 h-4.5 text-amber-400" /> Goal Achievements
                            </h4>
                            
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-xs text-amber-400 leading-relaxed">
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                <div>
                                    <span className="font-bold">Habit Target Attained</span>
                                    <p className="mt-1 text-slate-300">
                                        Consistency score is currently rated exceptional! Sustaining stable hydration levels promotes optimal blood pressure readings.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* AI wellness recommendations */}
                        <div className="bg-gradient-to-r from-purple-900/10 to-indigo-900/10 border border-purple-500/20 rounded-2xl p-5 text-left relative overflow-hidden">
                            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                <Brain className="w-4 h-4" /> AI Health Coach
                            </h4>
                            <p className="text-xs text-[#CBD5E1] leading-relaxed">
                                Increasing hydration index values dynamically helps flush post-exercise lactic acid. Increase resting sleep duration to restore muscular recovery.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
