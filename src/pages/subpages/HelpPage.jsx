import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    HelpCircle, Search, ChevronRight, BookOpen, ShieldAlert, Cpu, 
    Key, FileText, ArrowRight, ShieldCheck, Mail, HelpCircle as HelpIcon, ExternalLink
} from 'lucide-react';
import { toast } from '../../components/Toast';

export default function HelpPage() {
    const [search, setSearch] = useState('');
    const [activeSection, setActiveSection] = useState('getting-started');

    const topics = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            icon: BookOpen,
            articles: [
                {
                    q: 'How does client-side cryptographic medical record vaulting work?',
                    a: 'When you upload a clinical record, the browser performs on-device encryption using AES-256 GCM before the file ever leaves your workstation. The ciphertext is sent to decentralized secure storage (IPFS), and a cryptographic proof (CID hash) is committed to the blockchain, ensuring your patient data remains private and tamper-proof.'
                },
                {
                    q: 'How do I authenticate on a new shift or workstation?',
                    a: 'Providers must authenticate with institutional credentials, verify their Medical License ID, and verify with a physical hardware token (YubiKey) or biometric signature. This zero-trust architecture ensures that only authorized medical staff inside active sessions can query cryptographic records.'
                }
            ]
        },
        {
            id: 'records-security',
            title: 'Patient Records & Security',
            icon: ShieldCheck,
            articles: [
                {
                    q: 'What is the "Verification Mismatch" status indicator?',
                    a: 'The platform constantly runs integrity checks against files stored on the network. If the local SHA-256 hash does not match the cryptographic CID hash anchored in the blockchain record transaction ledger, the system flags a "Mismatch" warning. This prevents malicious alterations or file corruption from going undetected.'
                },
                {
                    q: 'How do I decrypt an encrypted clinical record?',
                    a: 'Decrypting happens dynamically behind the scenes. When you are authorized to view a patient record (either via explicit patient consent or an active OTP code), the platform fetches the patient\'s public key to securely generate the session key and decrypts the file client-side inside the browser memory.'
                }
            ]
        },
        {
            id: 'access-otp',
            title: 'OTP & Emergency Break-Glass',
            icon: Key,
            articles: [
                {
                    q: 'How do I request patient OTP access codes?',
                    a: 'Under your provider portal, navigate to Access Requests. Search for your target patient and trigger an OTP Request. The patient receives a notification inside their dashboard and generates a 6-digit Time-based One-Time Password (TOTP) that you enter to secure access.'
                },
                {
                    q: 'When should I use the "Emergency Break-Glass" override?',
                    a: 'The Emergency Break-Glass protocol bypasses standard patient consent in life-threatening scenarios. Invoking this protocol triggers a hardware-secured alert that notifies the regional health authority, sets a real-time monitor log, and starts an active network audit. This action is recorded permanently on the blockchain for legal compliance.'
                }
            ]
        }
    ];

    const handleContactSupport = () => {
        toast.success("Help request routed to network operators");
    };

    const filteredTopics = topics.map(t => {
        const matches = t.articles.filter(a => 
            a.q.toLowerCase().includes(search.toLowerCase()) || 
            a.a.toLowerCase().includes(search.toLowerCase())
        );
        return { ...t, articles: matches };
    }).filter(t => t.articles.length > 0);

    return (
        <div className="max-w-5xl mx-auto pb-12 animate-fade-in flex flex-col h-[calc(100vh-120px)] relative">
            
            {/* Header / Search */}
            <div className="mb-6 flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <HelpIcon className="w-5 h-5 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Clinical Support Center</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Documentation & Support</h2>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]" />
                    <input 
                        value={search} 
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search support articles..."
                        className="w-full bg-[#111827] border border-[#1E2D4580] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00C8D4]/50 transition-all" 
                    />
                </div>
            </div>

            {/* Split layout */}
            <div className="flex-1 flex gap-6 min-h-0">
                
                {/* Left navigation menu */}
                <div className="w-1/4 flex flex-col gap-3 flex-shrink-0">
                    <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E2D4580]">
                        <h3 className="text-[10px] font-bold text-[#8899AA] uppercase tracking-wider mb-3 text-left">Categories</h3>
                        <nav className="space-y-1">
                            {topics.map(topic => (
                                <button
                                    key={topic.id}
                                    onClick={() => { setSearch(''); setActiveSection(topic.id); }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                        activeSection === topic.id && !search
                                            ? 'bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/20'
                                            : 'text-[#8899AA] hover:bg-[#1A2236] hover:text-white border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <topic.icon className={`w-4 h-4 ${activeSection === topic.id && !search ? 'text-[#00C8D4]' : 'text-[#4A5568]'}`} />
                                        <span>{topic.title}</span>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Support card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#1A2236] border border-[#1E2D4580] relative overflow-hidden text-left flex-1 flex flex-col justify-between">
                        <div className="absolute inset-0 bg-[#00C8D4]/5 opacity-30 blur-[20px] pointer-events-none" />
                        <div>
                            <div className="w-8 h-8 rounded-lg bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center mb-3">
                                <Mail className="w-4 h-4 text-[#00C8D4]" />
                            </div>
                            <h4 className="text-sm font-semibold text-white mb-1">Direct Assistance</h4>
                            <p className="text-[11px] text-[#8899AA] leading-relaxed">Need real-time audit verification or node diagnostics?</p>
                        </div>
                        <button 
                            onClick={handleContactSupport}
                            className="mt-4 w-full py-2.5 rounded-xl bg-[#00C8D4] hover:bg-[#00E5F0] text-[#0B0F1A] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,200,212,0.15)]"
                        >
                            Contact Node Admin <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Right content display */}
                <div className="flex-1 rounded-2xl bg-[#111827] border border-[#1E2D4580] p-6 overflow-y-auto">
                    <div className="max-w-3xl mx-auto space-y-6 text-left">
                        {search ? (
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">Search Results for "{search}"</h3>
                                {filteredTopics.length === 0 ? (
                                    <p className="text-sm text-[#8899AA] italic">No articles found matching your query.</p>
                                ) : (
                                    <div className="space-y-6">
                                        {filteredTopics.map(t => (
                                            <div key={t.id} className="space-y-4">
                                                <h4 className="text-xs font-bold text-[#00C8D4] uppercase tracking-wider">{t.title}</h4>
                                                <div className="space-y-4">
                                                    {t.articles.map((art, idx) => (
                                                        <div key={idx} className="p-4 rounded-xl bg-[#1A2236]/30 border border-[#1E2D4580]">
                                                            <p className="text-sm font-semibold text-white mb-2">{art.q}</p>
                                                            <p className="text-xs text-[#8899AA] leading-relaxed">{art.a}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-lg font-bold text-white mb-5 pb-3 border-b border-[#1E2D4580] flex items-center gap-2">
                                    {React.createElement(topics.find(t => t.id === activeSection)?.icon || BookOpen, { className: "w-5 h-5 text-[#00C8D4]" })}
                                    {topics.find(t => t.id === activeSection)?.title}
                                </h3>
                                <div className="space-y-4">
                                    {topics.find(t => t.id === activeSection)?.articles.map((art, idx) => (
                                        <div key={idx} className="p-5 rounded-xl bg-[#1A2236]/30 border border-[#1E2D4580] hover:border-[#00C8D4]/20 transition-all group">
                                            <p className="text-sm font-semibold text-white mb-2 group-hover:text-[#00C8D4] transition-colors">{art.q}</p>
                                            <p className="text-xs text-[#8899AA] leading-relaxed">{art.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
