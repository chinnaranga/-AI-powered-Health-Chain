import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    HelpCircle, Search, LifeBuoy, FileQuestion, Plus, XCircle, 
    ChevronDown, Send, MessageSquare, AlertCircle, ShieldAlert, CheckCircle2
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const defaultFaqs = [
    {
        q: "How does blockchain secure my clinical records?",
        a: "Every clinical update, consent log, or specialist handoff generates an immutable transaction block. HealthChain stores your medical files encrypted in secure IPFS nodes, referencing authorization signatures on-chain."
    },
    {
        q: "How do I grant or revoke clinician access?",
        a: "Navigate to the 'Access Control' tab. From there, you can issue secure digital access keys or instantly revoke real-time view rights for active doctors or diagnostic clinics."
    },
    {
        q: "What should I do if my medical history contains an error?",
        a: "You can submit an official 'Record Discrepancy' ticket here. Select 'Record Discrepancy' as the category, link your record UID, and our hospital compliance liaison will coordinate a review."
    },
    {
        q: "Can I download or export my overall clinical health history?",
        a: "Yes. Navigate to 'Reports & Export'. You can compile your entire decrypted history, including lab reports, medications, and care schedules, into an audit-logged PDF format."
    }
];

export default function SupportHelpCenterPage() {
    const [user, setUser] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTicketModal, setShowTicketModal] = useState(false);
    
    // Accordion active index
    const [activeFaqIdx, setActiveFaqIdx] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form states
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('Access Error');
    const [priority, setPriority] = useState('Medium');
    const [message, setMessage] = useState('');

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
            console.error('[SupportHelpCenterPage] Firestore error:', error);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    const handleSubmitTicket = async (e) => {
        e.preventDefault();
        if (!subject || !message) return;

        try {
            await addDoc(collection(db, 'support_tickets'), {
                patientId: user.uid,
                ticketId: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
                subject: subject,
                category: category,
                priority: priority,
                status: 'Open',
                createdAt: new Date().toISOString(),
                messages: [
                    { sender: 'patient', content: message, timestamp: new Date().toISOString() }
                ]
            });

            // Reset Form
            setSubject('');
            setCategory('Access Error');
            setPriority('Medium');
            setMessage('');
            setShowTicketModal(false);
        } catch (err) {
            console.error('Error submitting support ticket:', err);
        }
    };

    const filteredFaqs = defaultFaqs.filter(faq => 
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 bg-[#00C8D4]/10 border border-[#00C8D4]/20 rounded-full px-3 py-1 w-fit mb-3">
                        <HelpCircle className="w-4 h-4 text-[#00C8D4] animate-pulse" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Support Operations</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Support & Help Center</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Submit support tickets, report patient access anomalies, and search system documentation.</p>
                </div>
                <button
                    onClick={() => setShowTicketModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)] hover:shadow-[0_0_30px_rgba(0,200,212,0.4)] transition-all"
                >
                    <Plus className="w-4 h-4" /> Open Support Ticket
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                {/* Left Column: FAQ & Search */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C8D4]/5 rounded-full blur-[40px] pointer-events-none" />
                        
                        <h3 className="text-lg font-bold text-white mb-4">Frequently Asked Questions</h3>
                        
                        {/* Search FAQ */}
                        <div className="relative mb-6">
                            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search queries, encryption, clinical access keys..."
                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl pl-12 pr-5 py-3 text-sm text-white focus:outline-none placeholder-slate-500"
                            />
                        </div>

                        {/* Accordion List */}
                        <div className="space-y-3">
                            {filteredFaqs.map((faq, idx) => {
                                const isOpen = activeFaqIdx === idx;
                                return (
                                    <div key={idx} className="border border-[#1E2D4580] rounded-xl overflow-hidden bg-[#0B0F1A]/40">
                                        <button
                                            onClick={() => setActiveFaqIdx(isOpen ? null : idx)}
                                            className="w-full px-5 py-4 flex justify-between items-center text-left text-sm font-bold text-white hover:bg-white/[0.02] transition-colors"
                                        >
                                            <span>{faq.q}</span>
                                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        
                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: 'auto' }}
                                                    exit={{ height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="px-5 pb-5 pt-1 text-xs text-[#8899AA] leading-relaxed border-t border-[#1E2D4580]/50">
                                                        {faq.a}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Ticket history */}
                <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Support Tickets</h3>
                    
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="w-6 h-6 rounded-full border-2 border-teal-500/10 border-t-teal-400 animate-spin" />
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-8 text-center text-xs text-slate-500 flex flex-col items-center">
                            <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
                            <span>No open tickets found.</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tickets.map((t, idx) => (
                                <motion.div
                                    key={t.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 relative overflow-hidden space-y-3"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[9px] text-[#8899AA] font-mono block mb-1">{t.ticketId} • {t.category}</span>
                                            <h4 className="text-sm font-bold text-white">{t.subject}</h4>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono ${
                                            t.status === 'Open'
                                                ? 'bg-sky-500/10 border border-sky-500/30 text-sky-400 animate-pulse'
                                                : t.status === 'In Progress'
                                                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                                                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                        }`}>
                                            {t.status}
                                        </span>
                                    </div>

                                    {/* Priority marker */}
                                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2.5 border-t border-[#1E2D4580]">
                                        <span className="flex items-center gap-1">
                                            <AlertCircle className={`w-3.5 h-3.5 ${
                                                t.priority === 'High' ? 'text-red-400' : 'text-slate-400'
                                            }`} />
                                            <span>Priority: <strong className="text-white">{t.priority}</strong></span>
                                        </span>
                                        <span className="text-[9px] text-slate-500">Active</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Ticket Modal */}
            <AnimatePresence>
                {showTicketModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#111827] border border-[#1E2D4580] rounded-2xl max-w-md w-full p-6 space-y-6 relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00C8D4]/5 rounded-full blur-[40px] pointer-events-none" />

                            <div className="flex justify-between items-center border-b border-[#1E2D4580] pb-4">
                                <h3 className="font-display font-bold text-lg text-white">Create Support Ticket</h3>
                                <button onClick={() => setShowTicketModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmitTicket} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Subject</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Briefly state your concern"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Category</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        >
                                            <option value="Access Error">Access Error</option>
                                            <option value="Record Discrepancy">Record Discrepancy</option>
                                            <option value="Billing Support">Billing Support</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Priority</label>
                                        <select
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value)}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Message Description</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Describe the discrepancy or access barrier details in full..."
                                        rows={4}
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none resize-none"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)] hover:shadow-[0_0_30px_rgba(0,200,212,0.4)] transition-all mt-4"
                                >
                                    Log Support Case
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
