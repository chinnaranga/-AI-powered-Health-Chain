import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Sparkles, X, Send, ArrowRight, ShieldCheck, 
  FileText, Building2, Calendar, UserPlus, HelpCircle, FileSpreadsheet, Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LandingAIChat() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Suggested starter questions
  const initialSuggestions = [
    'What is HealthChain?',
    'How does the Hospital ERP work?',
    'Show Patient Portal features.',
    'Show Doctor Portal features.',
    'Explain the AI Assistant.',
    'How does blockchain secure EMR?',
    'Is HealthChain ABDM compliant?',
    'Can I book a live demo?',
    'How do hospitals register?',
    'Show pricing.'
  ];

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Keyboard shortcut to open (Alt + C)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'c') {
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize with welcome message when opened first time
  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([
          {
            id: 'welcome',
            sender: 'bot',
            text: `👋 Welcome to HealthChain.

I'm your virtual product assistant.

I can help you learn about our healthcare platform, Hospital ERP, Patient Portal, Doctor Portal, AI capabilities, blockchain security, and guide you to the right solution.

How can I help you today?`,
            suggestions: [
              'What is HealthChain?',
              'Show Patient Portal features.',
              'Show Doctor Portal features.',
              'How does blockchain secure EMR?',
              'I want to see the platform.'
            ]
          }
        ]);
        setIsTyping(false);
      }, 600);
    }
  };

  const handleSend = async (textToSend) => {
    const queryText = (textToSend || inputVal).trim();
    if (!queryText) return;

    if (!textToSend) setInputVal('');

    // Append user query
    const userMsg = { id: Date.now(), sender: 'user', text: queryText };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    let responseText = '';
    let suggestions = [];
    let cta = null;
    let type = null;
    let backendSuccess = false;

    // Attempt to query FastAPI backend using guest credentials
    try {
      const response = await fetch('http://localhost:8000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock_token_uid_guest_patient'
        },
        body: JSON.stringify({
          message: queryText,
          role: 'patient',
          conversationId: 'landing_session'
        })
      });

      if (response.ok) {
        const data = await response.json();
        responseText = data.response;
        suggestions = ['I want to see the platform.', 'Show Patient Portal features.'];
        backendSuccess = true;
      }
    } catch (err) {
      console.warn('[LandingAIChat] Connection to FastAPI backend failed, using local RAG fallback:', err);
    }

    if (!backendSuccess) {
      const localRes = generateHeuristicResponse(queryText);
      responseText = localRes.text;
      suggestions = localRes.suggestions;
      cta = localRes.cta;
      type = localRes.type;
    }

    const botMsg = {
      id: Date.now() + 1,
      sender: 'bot',
      text: responseText,
      suggestions: suggestions,
      cta: cta,
      type: type
    };
    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  // Conversational Heuristics Engine
  const generateHeuristicResponse = (query) => {
    const text = query.toLowerCase();
    
    // 1. Demos
    if (text.includes('demo') || text.includes('see the platform') || text.includes('trial') || text.includes('explore')) {
      return {
        text: `I can help you explore HealthChain. Choose one of the following interactive portal demos:`,
        type: 'demo_options',
        cta: [
          { label: 'Patient Portal Demo', path: '/login' },
          { label: 'Doctor Portal Demo', path: '/doctor/login' },
          { label: 'Clinical Portal Demo', path: '/clinical/login' },
          { label: 'Hospital ERP Demo', path: '/hospital/login' }
        ],
        suggestions: ['How do hospitals register?', 'Explain the AI Assistant.']
      };
    }

    // 2. Medical records guard
    if (text.includes('record') || text.includes('medical') || text.includes('my data') || text.includes('report') || text.includes('vitals') || text.includes('prescription')) {
      return {
        text: `Medical records are available only after secure login. Please sign in to access your HealthChain account.`,
        type: 'login_prompt',
        cta: [
          { label: 'Login to Portal', path: '/login' }
        ],
        suggestions: ['How does blockchain secure EMR?', 'What is HealthChain?']
      };
    }

    // 3. Hospital
    if (text.includes('hospital') || text.includes('erp') || text.includes('institution') || text.includes('register')) {
      return {
        text: `HealthChain ERP empowers hospital administration with operational efficiency, real-time telemetry, and regulatory compliance.

Key Capabilities:
• Ward occupancy tracking & staff schedules
• Automated pharmacy & diagnostics workflow
• Consent-aware smart ledger integration
• Dynamic Indian locale formatting & Telugu voice modules`,
        cta: [
          { label: 'Register Hospital', path: '/hospital/register' },
          { label: 'Book Live Demo', path: '/book-demo' }
        ],
        suggestions: ['Show pricing.', 'Is HealthChain ABDM compliant?']
      };
    }

    // 4. Doctor
    if (text.includes('doctor') || text.includes('clinician') || text.includes('physician')) {
      return {
        text: `The Doctor Portal delivers AI-powered clinical support directly into your workflow.

Key Features:
• AI Copilot summarizing patient history and records
• Real-time digital prescriptions with drug interaction warning flags
• Seamless EMR lookup powered by cryptographically secure patient consent logs`,
        cta: [
          { label: 'Doctor Login', path: '/doctor/login' },
          { label: 'Book Demo', path: '/book-demo' }
        ],
        suggestions: ['Explain the AI Assistant.', 'How does blockchain secure EMR?']
      };
    }

    // 5. Patient
    if (text.includes('patient') || text.includes('user') || text.includes('personal')) {
      return {
        text: `The Patient Portal provides full control over your healthcare footprint.

Key Benefits:
• Store digital health cards (ABHA/ABDM compliant)
• Link wearables telemetry and track vitals dynamically
• Grant/revoke doctor access to your medical records instantly`,
        cta: [
          { label: 'Secure Login', path: '/login' },
          { label: 'Explore Features', path: '/#features' }
        ],
        suggestions: ['Is HealthChain ABDM compliant?', 'What is HealthChain?']
      };
    }

    // 6. Investor
    if (text.includes('invest') || text.includes('market') || text.includes('roadmap') || text.includes('funding')) {
      return {
        text: `Welcome! HealthChain is transforming digital healthcare security with decentralized technology.

Investor Resources:
• Product Roadmap (Multi-chain telemetry, automated insurer audit nodes)
• Technology Architecture (Symmetric key envelope encryption + Interplanetary File System)
• Commercial Model (Per-seat hospital ERP subscription + API transaction billing)`,
        cta: [
          { label: 'Book Investor Meeting', path: '/book-demo' },
          { label: 'Enterprise Contact', path: '/book-demo' }
        ],
        suggestions: ['Explain the AI Assistant.', 'Show pricing.']
      };
    }

    // 7. Blockchain / Security
    if (text.includes('block') || text.includes('secur') || text.includes('crypt') || text.includes('fhir') || text.includes('hl7') || text.includes('abdm') || text.includes('compliance')) {
      return {
        text: `Security is HealthChain's foundational element:
• **Immutable Audits**: Access logs are written permanently on-chain.
• **Envelope Encryption**: EMR records are encrypted locally before transit.
• **Standards-Ready**: Built natively with FHIR, HL7, and ABDM interoperability modules.`,
        suggestions: ['Show Patient Portal features.', 'Is HealthChain ABDM compliant?']
      };
    }

    // 8. AI
    if (text.includes('ai') || text.includes('copilot') || text.includes('intelligence') || text.includes('bot')) {
      return {
        text: `HealthChain integrates secure, role-based AI across all portals:
• **Patients**: Understand diagnostic reports.
• **Doctors**: Synthesize EMR timelines and notes.
• **Admins**: Forecast inventory and track drug consumption.

*Note: All AI workflows process data securely and require explicit patient consent.*`,
        suggestions: ['I want to see the platform.', 'Show Patient Portal features.']
      };
    }

    // 9. Pricing
    if (text.includes('pricing') || text.includes('price') || text.includes('cost') || text.includes('tier') || text.includes('subscription')) {
      return {
        text: `HealthChain features transparent, scale-friendly pricing structures:
• **Starter Node**: Ideal for individual practices and small clinics.
• **Enterprise Suite**: Complete Hospital ERP system for large networks.
• **State/Regional Nodes**: High-throughput public health integrations.`,
        cta: [
          { label: 'Contact Sales', path: '/book-demo' },
          { label: 'Register Hospital', path: '/hospital/register' }
        ],
        suggestions: ['Book Live Demo', 'Explain the AI Assistant.']
      };
    }

    // 10. General / What is HealthChain
    if (text.includes('what is') || text.includes('healthchain') || text.includes('overview') || text.includes('about')) {
      return {
        text: `**HealthChain** is a secure, decentralized healthcare platform designed to build trust between patients, hospitals, and doctors.

We combine an advanced **Hospital ERP**, a secure **Patient Portal**, a specialized **Doctor Workspace**, and an **AI Copilot** all under cryptographic consent logs.`,
        cta: [
          { label: 'Book Demo', path: '/book-demo' }
        ],
        suggestions: ['How does EMR security work?', 'Show Doctor Portal features.']
      };
    }

    // Fallback
    return {
      text: `I'm not sure I understand that query completely. HealthChain is a secure digital healthcare platform using blockchain and role-based AI interfaces.

Can I assist you with any of the following?`,
      cta: [
        { label: 'Book a Demo', path: '/book-demo' },
        { label: 'Contact Sales', path: '/book-demo' }
      ],
      suggestions: [
        'What is HealthChain?',
        'Show Patient Portal features.',
        'Show Doctor Portal features.',
        'I want to see the platform.'
      ]
    };
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans text-[#111111]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="w-[380px] h-[520px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)] bg-white border border-[#ECECEC] rounded-[24px] shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-[#2563EB] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#14B8A6]" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-xs">HealthChain Guide</h4>
                  <p className="text-[9px] text-white/70">Secure Virtual Consultant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((m) => (
                <div key={m.id} className="space-y-2">
                  <div className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-[16px] p-3 text-xs leading-relaxed text-left ${
                      m.sender === 'user'
                        ? 'bg-[#2563EB] text-white rounded-br-none shadow-sm'
                        : 'bg-white border border-[#ECECEC] text-[#111111] rounded-bl-none shadow-sm'
                    }`}>
                      <div className="whitespace-pre-wrap">{m.text}</div>
                    </div>
                  </div>

                  {/* Render CTA buttons inside BOT message */}
                  {m.sender === 'bot' && m.cta && (
                    <div className="flex flex-col gap-2 pl-2">
                      {m.cta.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setIsOpen(false);
                            navigate(c.path);
                          }}
                          className="w-full max-w-[240px] px-3.5 py-2 bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#2563EB] text-[10px] font-bold uppercase rounded-[10px] text-left border border-[#ECECEC] flex items-center justify-between group transition-all"
                        >
                          <span>{c.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Render inline suggestion chips */}
                  {m.sender === 'bot' && m.suggestions && (
                    <div className="flex flex-wrap gap-1.5 pt-1 pl-2">
                      {m.suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(s)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-[10px] text-[#666666] border border-[#ECECEC] rounded-full transition-all"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#ECECEC] rounded-[16px] rounded-bl-none p-3 shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Drawer when chat is fresh */}
            {messages.length === 1 && !isTyping && (
              <div className="p-3 border-t border-[#ECECEC] bg-white space-y-1.5 shrink-0">
                <span className="text-[9px] font-bold text-[#666666] uppercase tracking-wider block px-1 text-left">Suggested topics:</span>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {initialSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(s)}
                      className="px-3 py-1 bg-[#E8F0FE]/60 hover:bg-[#E8F0FE] text-[10px] text-[#2563EB] font-medium border border-[#E8F0FE] rounded-full whitespace-nowrap transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <div className="p-3 border-t border-[#ECECEC] bg-white flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask HealthChain Guide..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-[#ECECEC] text-xs rounded-[12px] focus:outline-none focus:border-[#2563EB] transition-colors"
              />
              <button
                onClick={() => handleSend()}
                className="p-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[12px] transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 bg-[#2563EB] hover:bg-[#1D4ED8] rounded-full shadow-2xl flex items-center justify-center text-white border border-[#2563EB]/10 transition-colors focus:outline-none"
        title="Open HealthChain Guide (Alt+C)"
      >
        <MessageSquare className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
