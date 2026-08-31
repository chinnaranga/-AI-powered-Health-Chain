import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  Brain, Plus, MessageSquare, History, Terminal, Library,
  Sliders, Database, ShieldCheck, BarChart3, Settings2,
  SlidersHorizontal, ChevronRight, Menu, X, User, Activity, Link as LinkIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/authStore';
import { auth } from '../../firebase/config';

export default function AILayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, changeUserLanguage } = useAuthStore();
  const { i18n } = useTranslation();
  const getFriendlyRole = () => {
    if (role === 'patient') return 'Patient';
    if (role === 'doctor') return 'Doctor';
    if (role === 'clinical') return 'Clinical Staff';
    if (role === 'hospital_admin' || role === 'admin') return 'Hospital Admin';
    return 'User';
  };
  const activeRole = getFriendlyRole();

  // Layout triggers
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isContextOpen, setIsContextOpen] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      const token = localStorage.getItem('hc_token');
      if (!token) {
        navigate('/hospital/login');
      }
    }
  }, [navigate]);

  const getMenuItems = () => {
    const base = [
      { id: 'home', name: 'AI Homepage', path: '', icon: Brain },
      { id: 'chat', name: 'New Conversation', path: 'chat', icon: Plus },
      { id: 'history', name: 'History Logs', path: 'history', icon: History },
      { id: 'prompts', name: 'Prompt Library', path: 'prompts', icon: Library },
      { id: 'settings', name: 'Settings', path: 'settings', icon: Settings2 }
    ];

    if (role === 'hospital_admin' || role === 'admin' || role === 'doctor') {
      base.push({ id: 'knowledge', name: 'Knowledge Base', path: 'knowledge', icon: Database });
    }
    if (role === 'hospital_admin' || role === 'admin') {
      base.push({ id: 'admin', name: 'AI Admin Panel', path: 'admin', icon: BarChart3 });
    }
    return base;
  };

  const menuItems = getMenuItems();

  return (
    <div className="h-screen w-screen bg-white text-[#111111] font-sans flex flex-col overflow-hidden [&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans [&_h4]:font-sans [&_h5]:font-sans [&_h6]:font-sans">
      
      {/* 1. Fully Responsive Header */}
      <header className="h-16 border-b border-[#ECECEC] bg-white px-4 md:px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          {/* Hamburger (Mobile/Tablet Only) */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-[#666666] hover:text-[#111111] rounded-[8px] hover:bg-[#F7F4EB]"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo Brand */}
          <div onClick={() => navigate('/ai')} className="flex items-center gap-2 cursor-pointer">
            <img src="/logo.svg" alt="HealthChain Logo" className="w-7 h-7 rounded-[8px] object-contain" />
            <span className="font-bold tracking-tight text-sm uppercase hidden sm:inline-block">HealthChain <span className="text-[#2563EB] font-mono font-normal">AI</span></span>
          </div>
        </div>

        {/* Center Indicators (Desktop Only) */}
        <div className="hidden md:flex items-center gap-4 text-[10px] text-[#666666] font-mono">
          <span className="px-2 py-0.5 bg-[#F7F4EB] rounded border border-[#ECECEC] inline-flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-[#14B8A6]" />
            Ledger Consensus: Synced
          </span>
          <span className="px-2 py-0.5 bg-[#F7F4EB] rounded border border-[#ECECEC] inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
            Compliance: HIPAA / ABDM
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="px-3 py-1.5 bg-[#E8F0FE] text-[#2563EB] text-xs font-bold uppercase rounded-[8px] border border-[#ECECEC]">
              {activeRole} Console
            </span>
          </div>
          <div className="flex items-center">
            <select
              value={i18n.language || 'en'}
              onChange={(e) => changeUserLanguage(e.target.value)}
              className="px-2.5 py-1.5 bg-white text-xs font-bold rounded-[8px] border border-[#ECECEC] focus:outline-none cursor-pointer"
            >
              <option value="en">🌐 English</option>
              <option value="te">🌐 తెలుగు</option>
            </select>
          </div>
          <button 
            onClick={() => {
              if (role === 'patient') {
                navigate('/dashboard/patient');
              } else if (role === 'doctor') {
                navigate('/dashboard/doctor');
              } else if (role === 'clinical') {
                navigate('/dashboard/clinical');
              } else {
                navigate('/hospital/dashboard');
              }
            }}
            className="px-3.5 py-1.5 border border-[#ECECEC] hover:border-[#111111] text-xs font-bold uppercase rounded-[8px] transition-colors"
          >
            Exit Console
          </button>
        </div>
      </header>

      {/* Main Content Layout Wrapper */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* 2. Slide Sidebar (Mobile/Tablet Hidden, Desktop Inline) */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <aside className={`
          fixed lg:static inset-y-0 left-0 w-64 bg-[#F7F4EB] border-r border-[#ECECEC] flex flex-col justify-between z-50 
          transform transition-transform duration-300 ease-in-out shrink-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 space-y-6 flex-1 flex flex-col overflow-y-auto">
            {/* Drawer Header (Mobile/Tablet Only) */}
            <div className="flex items-center justify-between lg:hidden border-b border-[#ECECEC] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">Navigation Drawer</span>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-[#ECECEC] rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar Identity (Mobile Screen Fallback) */}
            <div className="sm:hidden p-3 bg-white border border-[#ECECEC] rounded-[12px] space-y-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-[#666666]">Active Identity Persona</span>
              <span className="block px-2 py-1.5 bg-[#E8F0FE] text-[#2563EB] text-xs font-bold uppercase rounded-[8px] border border-[#ECECEC]">
                {activeRole}
              </span>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1.5">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-[12px] text-xs text-left transition-colors ${
                      isActive ? 'bg-white text-[#111111] border border-[#ECECEC] font-bold shadow-sm' : 'text-[#666666] hover:text-[#111111] hover:bg-white/40'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-[#ECECEC] space-y-1.5 text-[9px] font-mono text-[#666666]">
            <p>Security Class: ZK-Consent</p>
            <p>LLM Host: Google Gemini API</p>
            <p>RAG Synchronization: Synchronized</p>
          </div>
        </aside>

        {/* 3. Core Workspace Sizing */}
        <main className="flex-1 bg-white overflow-hidden flex flex-col relative h-full">
          {/* Internal subpage header */}
          <div className="px-6 py-4 border-b border-[#ECECEC] flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#666666]">
              <span>HealthChain AI</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#111111] capitalize font-bold">{location.pathname.split('/').pop() || 'Portal'}</span>
            </div>

            {/* Floating Context Panel Trigger for Mobile/Tablet */}
            <button
              onClick={() => setIsContextOpen(true)}
              className="xl:hidden px-3 py-1.5 bg-[#F7F4EB] border border-[#ECECEC] hover:border-[#111111] text-[10px] font-bold uppercase rounded-[8px] inline-flex items-center gap-1.5 transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Context Sheet</span>
            </button>
          </div>

          {/* Child Outlet Container */}
          <div className="flex-1 overflow-hidden p-6 md:p-8 flex flex-col">
            <Outlet />
          </div>
        </main>

        {/* 4. Adaptive Right Context Panel (Desktop Inline, Mobile Drawer) */}
        {isContextOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-40 xl:hidden"
            onClick={() => setIsContextOpen(false)}
          />
        )}
        
        <aside className={`
          fixed xl:static inset-y-0 right-0 w-80 bg-[#F7F4EB] border-l border-[#ECECEC] flex flex-col z-50 
          transform transition-transform duration-300 ease-in-out shrink-0 p-6 space-y-6
          ${isContextOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
        `}>
          <div className="flex items-center justify-between border-b border-[#ECECEC] pb-3 shrink-0">
            <h3 className="font-bold text-xs uppercase tracking-widest text-[#111111]">Clinical Context</h3>
            <button onClick={() => setIsContextOpen(false)} className="xl:hidden p-1 hover:bg-[#ECECEC] rounded">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dynamic role stats */}
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            <div className="p-4 bg-white border border-[#ECECEC] rounded-[12px] space-y-3 shadow-xs">
              <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-bold text-[#666666]">
                <span>Active User Node</span>
                <span className="text-[#16A34A] flex items-center gap-1">● Online</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#111111]">HealthChain Administrator</p>
                <p className="text-[10px] text-[#666666] font-mono mt-0.5">UID: hc-demo-admin-usr</p>
              </div>
            </div>

            <div className="p-4 bg-white border border-[#ECECEC] rounded-[12px] space-y-3 shadow-xs">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-[#666666]">Consensus Signatures</span>
              <div className="space-y-2 text-[10px] font-mono text-[#666666]">
                <p className="flex justify-between"><span>Validator Node:</span> <span className="text-[#111111] font-bold">VAL-849</span></p>
                <p className="flex justify-between"><span>Block Height:</span> <span className="text-[#111111] font-bold">14,892,102</span></p>
                <p className="flex justify-between"><span>Zero Knowledge:</span> <span className="text-[#16A34A] font-bold">Decrypted</span></p>
              </div>
            </div>

            <div className="p-4 bg-white border border-[#ECECEC] rounded-[12px] space-y-3 shadow-xs">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-[#666666]">Decryption Access Keys</span>
              <div className="space-y-1.5">
                <span className="px-2 py-1 bg-[#E8F0FE] text-[#2563EB] rounded-[8px] text-[9px] font-mono font-bold block truncate">
                  SHA-256: 8a93bf81d2...
                </span>
                <span className="px-2 py-1 bg-emerald-50 text-[#16A34A] rounded-[8px] text-[9px] font-mono font-bold block truncate">
                  ECDSA Signature Verified
                </span>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
