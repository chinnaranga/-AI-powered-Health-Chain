import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cookie, Shield, Check, Lock, Sliders, RefreshCw,
  CheckCircle2, ArrowRight, Info, Eye, Layers, Bell
} from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

const STORAGE_KEY = 'healthchain_cookie_preferences';

export default function CookieSettings() {
  const navigate = useNavigate();

  // Load preferences from localStorage or set defaults
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read cookie preferences from storage:', e);
    }
    return {
      essential: true, // Always true and non-configurable
      preferences: true,
      analytics: false,
    };
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggle = (key) => {
    if (key === 'essential') return;
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (e) {
      console.error('Failed to save cookie preferences:', e);
    }
  };

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, preferences: true, analytics: true };
    setPreferences(allAccepted);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allAccepted));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectOptional = () => {
    const essentialOnly = { essential: true, preferences: false, analytics: false };
    setPreferences(essentialOnly);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(essentialOnly));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] font-sans selection:bg-[#E8F0FE] selection:text-[#2563EB] scroll-smooth">
      {/* Universal Navigation Header */}
      <Header />

      <main>
        {/* ========================================================================= */}
        {/* HERO SECTION                                                             */}
        {/* ========================================================================= */}
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 border-b border-[#ECECEC] bg-gradient-to-b from-[#F7F4EB]/70 via-white to-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111]/5 border border-[#111111]/10 mb-6">
                <Cookie className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                  Privacy & Cookie Preferences
                </span>
              </div>

              <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] leading-[1.08] mb-6">
                Cookie & Storage <span className="font-bold">Settings</span>
              </h1>

              <p className="text-base sm:text-lg text-[#666666] leading-relaxed mb-6 max-w-3xl">
                Control how HealthChain uses browser storage and session cookies. We prioritize privacy: we never use third-party marketing trackers or sell telemetry to advertising brokers.
              </p>

              <div className="flex items-center gap-3 text-xs text-[#555555]">
                <Shield className="w-4 h-4 text-[#16A34A]" />
                <span>Zero third-party advertising cookies • Client-side preference storage</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* COOKIE SETTINGS INTERFACE                                                 */}
        {/* ========================================================================= */}
        <section className="py-16 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            
            {/* Success Toast */}
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-8 p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    <span className="text-xs sm:text-sm font-bold">Preferences saved successfully to browser storage.</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#047857]">Active</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-6">
              
              {/* 1. Essential Cookies */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ECECEC] shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F7F4EB] text-[#111111] flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <h2 className="text-lg font-bold text-[#111111]">Strictly Essential Cookies & Storage</h2>
                    <span className="text-[10px] uppercase font-bold bg-[#ECECEC] text-[#555555] px-2.5 py-0.5 rounded-full">
                      Always Active
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#666666] leading-relaxed max-w-2xl">
                    Required for core system functions including cryptographic Web3 wallet authentication, CSRF security tokens, active patient session maintenance, and decentralized node routing. The platform cannot function securely without these cookies.
                  </p>
                  <div className="pt-2 text-xs text-[#888888] font-mono">
                    Includes: auth_token, session_id, wallet_signature_state, csrf_token
                  </div>
                </div>

                <div className="flex-shrink-0 pt-1">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="w-5 h-5 accent-[#111111] opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* 2. Preference Cookies */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ECECEC] shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F7F4EB] text-[#111111] flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h2 className="text-lg font-bold text-[#111111]">Preference & Localization Cookies</h2>
                    <span className="text-[10px] uppercase font-bold bg-[#E0F2FE] text-[#0369A1] px-2.5 py-0.5 rounded-full">
                      Customizable
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#666666] leading-relaxed max-w-2xl">
                    Allows the application to remember your personal UI preferences, such as selected interface language (English/Telugu), clinical dashboard table density, sidebar collapsed state, and notification sound toggles.
                  </p>
                  <div className="pt-2 text-xs text-[#888888] font-mono">
                    Includes: language_pref, ui_density_setting, sidebar_state
                  </div>
                </div>

                <div className="flex-shrink-0 pt-1">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.preferences}
                      onChange={() => handleToggle('preferences')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111111]" />
                  </label>
                </div>
              </div>

              {/* 3. Analytics Cookies */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ECECEC] shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F7F4EB] text-[#111111] flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <h2 className="text-lg font-bold text-[#111111]">System Telemetry & Performance Analytics</h2>
                    <span className="text-[10px] uppercase font-bold bg-[#E0F2FE] text-[#0369A1] px-2.5 py-0.5 rounded-full">
                      Optional
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#666666] leading-relaxed max-w-2xl">
                    Collects aggregated, non-identifying telemetry regarding smart contract relay latency and storage node response times. Used strictly by engineering to detect node bottlenecks and improve service performance.
                  </p>
                  <div className="pt-2 text-xs text-[#888888] font-mono">
                    Includes: latency_sample_id, node_perf_metric
                  </div>
                </div>

                <div className="flex-shrink-0 pt-1">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => handleToggle('analytics')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111111]" />
                  </label>
                </div>
              </div>

            </div>

            {/* Action Bar */}
            <div className="mt-10 p-6 rounded-3xl bg-white border border-[#ECECEC] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-5 py-2.5 rounded-xl bg-[#F7F4EB] border border-[#ECECEC] text-xs font-bold text-[#111111] hover:bg-[#EAE6D8] transition-colors cursor-pointer"
                >
                  Accept All
                </button>
                <button
                  type="button"
                  onClick={handleRejectOptional}
                  className="px-5 py-2.5 rounded-xl bg-transparent border border-[#ECECEC] text-xs font-bold text-[#666666] hover:text-[#111111] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
                >
                  Reject Optional
                </button>
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#111111] text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4 text-[#16A34A]" />
                <span>Save Preferences</span>
              </button>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* DETAILED EXPLANATIONS                                                     */}
        {/* ========================================================================= */}
        <section className="py-16 bg-[#FFFFFF] border-b border-[#ECECEC]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-8 text-xs sm:text-sm text-[#555555] leading-relaxed">
            <h3 className="text-xl font-bold text-[#111111]">How HealthChain Handles Browser Storage</h3>
            <p>
              Unlike traditional web platforms that install tracking cookies across thousands of third-party advertising networks, HealthChain operates strictly on cryptographic necessity. When you log in, your browser stores session credentials locally to authenticate API calls and sign transactions.
            </p>
            <p>
              If you have any questions regarding our storage mechanisms or privacy standards, review our <Link to="/privacy" className="text-[#2563EB] font-bold hover:underline">Privacy Policy</Link> or consult our <Link to="/security" className="text-[#2563EB] font-bold hover:underline">Security Architecture</Link>.
            </p>
          </div>
        </section>
      </main>

      {/* Universal Footer with Legal Modals & Newsletter */}
      <Footer />
    </div>
  );
}
