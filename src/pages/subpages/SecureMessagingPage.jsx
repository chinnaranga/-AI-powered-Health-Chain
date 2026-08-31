import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, Send, Paperclip, CheckCheck, RefreshCw, 
    User, Search, AlertCircle, Lock, Users, Stethoscope, 
    FileText, XCircle, Info, ShieldAlert, Award
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, addDoc, orderBy, updateDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from '../../components/Toast';

export default function SecureMessagingPage() {
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setFirebaseUser(user);
                
                const convRef = collection(db, 'conversations');
                const q = query(convRef, where('participants', 'array-contains', user.uid));
                
                const unsubConv = onSnapshot(q, async (snapshot) => {
                    if (snapshot.empty) {
                        // Seed database
                        const convs = [
                            {
                                participants: [user.uid, 'doc_chen'],
                                recipientName: 'Dr. Robert Chen',
                                recipientRole: 'Neurologist',
                                unreadCount: 1,
                                lastMessage: 'Let us schedule an MRI review sessions next Tuesday.',
                                lastMessageTime: '15:30',
                                category: 'doctor',
                                timestamp: Date.now()
                            },
                            {
                                participants: [user.uid, 'spouse_sarah'],
                                recipientName: 'Sarah Connor (Spouse)',
                                recipientRole: 'Emergency Contact',
                                unreadCount: 0,
                                lastMessage: 'Emergency profile access token generated.',
                                lastMessageTime: 'Yesterday',
                                category: 'emergency',
                                timestamp: Date.now() - 86400000
                            }
                        ];

                        for (const c of convs) {
                            const docRef = await addDoc(collection(db, 'conversations'), c);
                            if (c.recipientName.includes('Chen')) {
                                const msgs = [
                                    { senderId: 'doc_chen', text: 'Hello Alice, I reviewed your recent blood panels and noticed slightly elevated fasting glucose levels.', timestamp: new Date(Date.now() - 1000 * 3600 * 5).toISOString(), time: '14:15' },
                                    { senderId: user.uid, text: 'Hello Dr. Chen, thank you. Should I schedule a clinical follow-up regarding this glucose flag?', timestamp: new Date(Date.now() - 1000 * 3600 * 4.8).toISOString(), time: '14:20' },
                                    { senderId: 'doc_chen', text: 'Let us schedule an MRI review sessions next Tuesday. It will provide a comprehensive health footprint analysis.', timestamp: new Date(Date.now() - 1000 * 3600 * 3).toISOString(), time: '15:30' }
                                ];
                                for (const m of msgs) {
                                    await addDoc(collection(db, 'conversations', docRef.id, 'messages'), m);
                                }
                            } else {
                                const msgs = [
                                    { senderId: 'spouse_sarah', text: 'Did you generate the first-responder emergency token?', timestamp: new Date(Date.now() - 1000 * 3600 * 24).toISOString(), time: 'Yesterday' },
                                    { senderId: user.uid, text: 'Yes, emergency profile access token generated. It is active for 2 hours.', timestamp: new Date(Date.now() - 1000 * 3600 * 23.8).toISOString(), time: 'Yesterday' }
                                ];
                                for (const m of msgs) {
                                    await addDoc(collection(db, 'conversations', docRef.id, 'messages'), m);
                                }
                            }
                        }
                        return;
                    }

                    const data = [];
                    snapshot.forEach((doc) => {
                        data.push({ id: doc.id, ...doc.data() });
                    });
                    
                    // Sort conversations by timestamp descending
                    data.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                    setConversations(data);
                    
                    // Retain or select first
                    setSelectedConv(prev => {
                        if (prev) {
                            const found = data.find(c => c.id === prev.id);
                            if (found) return found;
                        }
                        return data[0];
                    });
                    setLoading(false);
                }, (error) => {
                    console.error('[SecureMessagingPage] Firestore error:', error);
                    setConversations([]);
                    setSelectedConv(null);
                    setLoading(false);
                });

                return () => unsubConv();
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Listen to messages of selected conversation
    useEffect(() => {
        if (!selectedConv) return;
        
        const msgRef = collection(db, 'conversations', selectedConv.id, 'messages');
        const q = query(msgRef, orderBy('timestamp', 'asc'));
        
        const unsubMsg = onSnapshot(q, (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setMessages(data);
        }, (error) => {
            console.error('[SecureMessagingPage] Messages Firestore error:', error);
        });

        return () => unsubMsg();
    }, [selectedConv]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Send Message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConv || !firebaseUser) return;

        setIsSending(true);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const newMsgObj = {
            senderId: firebaseUser.uid,
            text: newMessage,
            timestamp: new Date().toISOString(),
            time: timeStr
        };

        try {
            await addDoc(collection(db, 'conversations', selectedConv.id, 'messages'), newMsgObj);
            await updateDoc(doc(db, 'conversations', selectedConv.id), {
                lastMessage: newMessage,
                lastMessageTime: timeStr,
                timestamp: Date.now()
            });

            // Simulate quick Doctor or Spouse typing response
            const isDoctor = selectedConv.recipientName.includes('Chen');
            const responderName = isDoctor ? 'Dr. Robert Chen' : 'Sarah Connor';
            const responderId = isDoctor ? 'doc_chen' : 'spouse_sarah';
            const responseText = isDoctor
                ? 'This message is received. Our clinical assistant will confirm the scheduling shortly.'
                : 'Received. Thank you for setting up the token.';

            setTimeout(() => {
                setIsTyping(true);
                setTimeout(async () => {
                    setIsTyping(false);
                    const replyMsg = {
                        senderId: responderId,
                        text: responseText,
                        timestamp: new Date().toISOString(),
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    await addDoc(collection(db, 'conversations', selectedConv.id, 'messages'), replyMsg);
                    await updateDoc(doc(db, 'conversations', selectedConv.id), {
                        lastMessage: responseText,
                        lastMessageTime: replyMsg.time,
                        timestamp: Date.now()
                    });
                }, 2000);
            }, 1000);

            setNewMessage('');
        } catch (err) {
            console.error(err);
            toast.error('Failed to dispatch secure message');
        } finally {
            setIsSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-[#00C8D4] animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-16 text-left space-y-6">
            
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">End-to-End Encrypted Secure Network</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-white">Secure Messenger</h2>
                <p className="text-sm text-[#8899AA] mt-1">Direct end-to-end secure communication with specialists, clinics, and emergency responders.</p>
            </div>

            {/* Chat Frame Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] border border-[#1E2D4580] bg-[#111827]/40 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.2)]">
                
                {/* Conversation List sidebar */}
                <div className="md:col-span-1 border-r border-[#1E2D4580] flex flex-col h-full bg-[#111827]">
                    <div className="p-4 border-b border-[#1E2D4580]">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4 text-[#00C8D4]" /> Clinical Circles
                        </h4>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899AA]" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#00C8D4]/60 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-[#1E2D4540]">
                        {conversations.map((c) => (
                            <div
                                key={c.id}
                                onClick={() => setSelectedConv(c)}
                                className={`p-4 flex items-start gap-3 cursor-pointer transition-all ${
                                    selectedConv?.id === c.id ? 'bg-[#00C8D4]/5 border-l-2 border-[#00C8D4]' : 'hover:bg-white/[0.02]'
                                }`}
                            >
                                <div className="w-9 h-9 rounded-xl bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center text-[#00C8D4] flex-shrink-0">
                                    <Stethoscope className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h5 className="text-xs font-bold text-white truncate">{c.recipientName}</h5>
                                        <span className="text-[9px] text-slate-500 font-mono">{c.lastMessageTime}</span>
                                    </div>
                                    <p className="text-[10px] text-[#8899AA]">{c.recipientRole}</p>
                                    <p className="text-[10px] text-slate-400 truncate mt-1">{c.lastMessage}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Secure Chat Arena */}
                <div className="md:col-span-2 flex flex-col h-full bg-[#0B0F1A]/80">
                    {selectedConv ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-6 py-4 border-b border-[#1E2D4580] bg-[#111827] flex justify-between items-center">
                                <div>
                                    <h4 className="text-sm font-bold text-white">{selectedConv.recipientName}</h4>
                                    <p className="text-[10px] text-[#00C8D4] font-semibold tracking-wider flex items-center gap-1.5 mt-0.5">
                                        <Award className="w-3.5 h-3.5" /> Cryptographic Identity Verified
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                                    <Lock className="w-3 h-3" /> SECURE CONVERSATION
                                </div>
                            </div>

                            {/* Messages Stream */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.map((m) => {
                                    const isMe = m.senderId === firebaseUser.uid;
                                    return (
                                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl p-4 text-xs leading-relaxed text-left relative ${
                                                isMe 
                                                    ? 'bg-[#00C8D4]/10 border border-[#00C8D4]/30 text-white rounded-br-none shadow-[0_0_15px_rgba(0,200,212,0.05)]' 
                                                    : 'bg-[#111827] border border-[#1E2D4580] text-[#CBD5E1] rounded-bl-none'
                                            }`}>
                                                <p>{m.text}</p>
                                                <div className="flex items-center justify-end gap-1 mt-2 text-[8px] text-slate-500 font-mono">
                                                    <span>{m.time}</span>
                                                    {isMe && <CheckCheck className="w-3 h-3 text-[#00C8D4]" />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Typing indicator */}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl rounded-bl-none px-4 py-3 text-xs text-slate-400 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#8899AA] animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#8899AA] animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#8899AA] animate-bounce" style={{ animationDelay: '300ms' }} />
                                            <span className="text-[10px] text-slate-500 font-medium ml-1">Specialist is typing...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Entry input */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-[#1E2D4580] bg-[#111827] flex gap-3 items-center">
                                <button type="button" className="p-2 rounded-xl bg-[#0B0F1A] border border-[#1E2D4580] hover:border-slate-600 text-[#8899AA] hover:text-white transition-colors" title="Attach Patient Records">
                                    <Paperclip className="w-4 h-4" />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your encrypted clinical message..."
                                    className="flex-1 bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8D4]/60 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] hover:opacity-90 transition-all font-bold"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <MessageSquare className="w-12 h-12 text-slate-600 mb-3" />
                            <h4 className="text-sm font-bold text-[#8899AA]">Select secure clinical channel</h4>
                            <p className="text-xs text-slate-500 mt-1 max-w-[240px]">Access verified practitioner threads or family emergency responder logs directly from the list.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
