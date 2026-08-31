import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    HelpCircle, Search, Plus, XCircle, FileText, CheckCircle, 
    AlertCircle, Sparkles, Brain, Clock, ChevronDown, ChevronUp, MessageSquare
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function SupportFeedbackCenterPage() {
    const [user, setUser] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [search, setSearch] = useState('');
    const [expandedFAQ, setExpandedFAQ] = useState(null);

    // Form inputs
    const [category, setCategory] = useState('Access Issue');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const faqs = [
        { q: "How is my medical data protected on the blockchain?", a: "Your medical files are encrypted locally before transit. The blockchain ledger registers only the signature envelope and consent tokens, ensuring no raw health files reside publicly." },
        { q: "How can I grant my cardiologist temporary visibility privileges?", a: "Navigate to the Secure Sharing section, select Dr. Liam Patel (or hospital origin), set the access duration window (e.g. 24 hours), and click Disperse Key." },
        { q: "What is the ABHA Health ID linking protocol?", a: "Your sovereign Health ID (e.g. ABHA) acts as a unique cryptographic footprint mapping your verified medical files across Saint Jude and Apex clinics." }
    ];

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        const ticketRef = collection(db, 'support_tickets');
        const q = query(ticketRef, where('patientId', '==', user.uid));

        const unsub = onSnapshot(q, (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setTickets(data);
            setLoading(false);
        }, (error) => {
            console.error('[SupportFeedbackCenterPage] Firestore error:', error);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    // Initial seed if empty
    const handleInitializeTickets = async () => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'support_tickets'), {
                patientId: user.uid,
                category: 'Access Issue',
                subject: 'Delay in Saint Jude record synchronization',
                message: 'My ECG reports are verified on-chain but show delay in the overview page.',
                status: 'Open',
                createdAt: new Date().toISOString()
            });
        } catch (err) {
            console.error('Error seeding support tickets:', err);
        }
    };

    const handleSubmitTicket = async (e) => {
        e.preventDefault();
        if (!subject || !message) return;

        try {
            await addDoc(collection(db, 'support_tickets'), {
                patientId: user.uid,
                category,
                subject,
                message,
                status: 'Open',
                createdAt: new Date().toISOString()
            });

            // Reset
            setSubject('');
            setMessage('');
            setCategory('Access Issue');
            setShowAddModal(false);
        } catch (err) {
            console.error('Error filing support ticket:', err);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 bg-[#00C8D4]/10 border border-[#00C8D4]/20 rounded-full px-3 py-1 w-fit mb-3">
                        <HelpCircle className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Support Portal</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Support & Feedback Desk</h2>
                    <p className="text-sm text-[#8899AA] mt-1">File secure access tickets, inspect record synchronization status, or browse standard FAQs.</p>
                </div>
                <div className="flex gap-3">
                    {tickets.length === 0 && !loading && (
                        <button
                            onClick={handleInitializeTickets}
                            className="px-4 py-2.5 rounded-xl border border-[#1E2D4580] text-xs font-bold hover:text-white"
                        >
                            Sync Ticket Logs
                        </button>
                    )}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)]"
                    >
                        <Plus className="w-4 h-4" /> Open Support Ticket
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-10 h-10 rounded-full border-4 border-teal-500/10 border-t-teal-400 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                    {/* Left Column: FAQS list */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Frequently Asked Questions</h3>
                        
                        <div className="space-y-3">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="bg-[#111827] border border-[#1E2D4580] rounded-2xl overflow-hidden">
                                    <button
                                        onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                                        className="w-full p-5 flex justify-between items-center text-left text-sm font-bold text-slate-200 hover:text-white transition-colors focus:outline-none"
                                    >
                                        <span>{faq.q}</span>
                                        {expandedFAQ === idx ? <ChevronUp className="w-4.5 h-4.5 text-[#00C8D4]" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-500" />}
                                    </button>

                                    <AnimatePresence>
                                        {expandedFAQ === idx && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-[#1E2D4580]/50 bg-[#0B0F1A]/60 p-5 text-xs text-slate-300 leading-relaxed"
                                            >
                                                {faq.a}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right column: active tickets tracking */}
                    <div className="space-y-6">
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Support Tickets</h4>
                            
                            {tickets.length === 0 ? (
                                <p className="text-xs text-slate-500 leading-relaxed">No active tickets registered. If you experience synchronization lag, file a ticket.</p>
                            ) : (
                                <div className="space-y-3">
                                    {tickets.map(tk => (
                                        <div key={tk.id} className="bg-[#0B0F1A]/60 border border-[#1E2D4580] p-4 rounded-xl space-y-2">
                                            <div className="flex justify-between items-start gap-2">
                                                <h5 className="text-xs font-bold text-white leading-tight">{tk.subject}</h5>
                                                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[8px] font-bold uppercase font-mono">
                                                    {tk.status}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 leading-relaxed">"{tk.message}"</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Submit ticket modal wizard */}
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
                                <h3 className="font-display font-bold text-lg text-white">Open Support Ticket</h3>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmitTicket} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                    >
                                        <option value="Access Issue">Access Issue</option>
                                        <option value="Record Discrepancy">Record Discrepancy</option>
                                        <option value="Product Feedback">Product Feedback</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Subject</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="e.g. Sync Lag in ECG summaries"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Detailed Message</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Explain the record synchronization error details..."
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none h-24 resize-none"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)] mt-4"
                                >
                                    Submit Ticket
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
