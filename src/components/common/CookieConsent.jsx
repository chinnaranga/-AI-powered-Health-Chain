import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Shield, X, Check, Sliders, Info, Lock, CheckCircle2 } from 'lucide-react';

const CONSENT_STORAGE_KEY = 'healthchain_cookie_consent';
const CONSENT_VERSION = '1.0';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    preferences: false,
    analytics: false,
  });

  // Check existing consent on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.version === CONSENT_VERSION) {
          setPreferences({
            essential: true,
            preferences: !!parsed.preferences,
            analytics: !!parsed.analytics,
          });
          setShowBanner(false);
        } else {
          // Version outdated, prompt again
          setShowBanner(true);
        }
      } else {
        // First-time visitor
        setShowBanner(true);
      }
    } catch (e) {
      console.warn('Could not access cookie consent storage:', e);
      setShowBanner(true);
    }

    // Global listener to reopen settings from footer or other links
    const handleOpenSettings = () => {
      setShowModal(true);
    };

    window.addEventListener('open_healthchain_cookie_settings', handleOpenSettings);
    return () => {
      window.removeEventListener('open_healthchain_cookie_settings', handleOpenSettings);
    };
  }, []);

  const saveConsent = (customPrefs) => {
    const consentPayload = {
      essential: true,
      preferences: !!customPrefs.preferences,
      analytics: !!customPrefs.analytics,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentPayload));
      setPreferences(consentPayload);
      setShowBanner(false);
      setShowModal(false);
    } catch (e) {
      console.error('Failed to persist cookie consent:', e);
    }
  };

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      preferences: true,
      analytics: false, // Set to false since no external tracking trackers exist in this deployment
    });
  };

  const handleRejectNonEssential = () => {
    saveConsent({
      essential: true,
      preferences: false,
      analytics: false,
    });
  };

  const handleSaveModalPreferences = () => {
    saveConsent(preferences);
  };

  return (
    <>
      {/* ── First-Time Visitor Bottom Banner / Card ── */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            role="region"
            aria-label="Cookie Consent Banner"
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-xl z-50 bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl p-5 md:p-6 text-[#111111] font-sans selection:bg-[#E8F0FE] selection:text-[#2563EB]"
          >
            <div className="flex items-start gap-3.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#F7F4EB] border border-[#ECECEC] flex items-center justify-center flex-shrink-0 text-[#111111]">
                <Cookie className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-[#111111]">
                  Your Privacy Matters
                </h2>
                <p className="text-xs text-[#666666] leading-relaxed mt-1">
                  We use cookies and similar technologies to keep HealthChain secure, remember your preferences, and understand how our website is used. You can choose which optional cookies you allow.
                </p>
              </div>
            </div>

            <div className="text-[11px] text-[#888888] mb-4 flex items-center gap-2">
              <Link to="/privacy" className="text-[#2563EB] hover:underline font-semibold">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link to="/terms" className="text-[#2563EB] hover:underline font-semibold">
                Terms of Service
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-[#F3F4F6]">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-4 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-black hover:shadow transition-all cursor-pointer text-center"
              >
                Accept All
              </button>

              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-4 py-2.5 rounded-xl bg-[#F7F4EB] text-[#111111] text-xs font-bold uppercase tracking-wider border border-[#ECECEC] hover:bg-[#EAE6D8] transition-all cursor-pointer text-center"
              >
                Reject Non-Essential
              </button>

              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-[#666666] hover:text-[#111111] hover:bg-[#F3F4F6] transition-colors cursor-pointer text-center"
              >
                Cookie Settings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Accessible Cookie Settings Modal ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cookie-modal-title"
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#ECECEC] flex flex-col overflow-hidden text-[#111111] font-sans max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#ECECEC] bg-[#F7F4EB]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center">
                    <Sliders className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div>
                    <h2 id="cookie-modal-title" className="text-lg font-bold tracking-tight text-[#111111]">
                      Cookie & Storage Settings
                    </h2>
                    <p className="text-xs text-[#666666]">Customize your browsing and preference permissions</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  aria-label="Close Cookie Settings"
                  className="p-2 rounded-xl hover:bg-black/5 text-[#666666] hover:text-[#111111] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Categories Content */}
              <div className="p-6 space-y-5 overflow-y-auto">
                
                {/* 1. Essential Cookies */}
                <div className="p-4 rounded-2xl border border-[#ECECEC] bg-[#FAFAFA] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#16A34A]" />
                      <h3 className="text-sm font-bold text-[#111111]">Essential Cookies</h3>
                    </div>
                    <span className="text-[10px] uppercase font-bold bg-[#ECECEC] text-[#555555] px-2.5 py-0.5 rounded-full">
                      Always Active
                    </span>
                  </div>
                  <p className="text-xs text-[#666666] leading-relaxed">
                    Required for website functionality, Web3 wallet authentication, security, anti-CSRF token verification, and active session management. This category cannot be disabled.
                  </p>
                </div>

                {/* 2. Preference Cookies */}
                <div className="p-4 rounded-2xl border border-[#ECECEC] hover:border-[#CCCCCC] transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#111111]">Preferences Cookies</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.preferences}
                        onChange={(e) => setPreferences({ ...preferences, preferences: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111111]" />
                    </label>
                  </div>
                  <p className="text-xs text-[#666666] leading-relaxed">
                    Used to remember your interface preferences, language selection (English/Telugu), and dashboard UI layout density.
                  </p>
                </div>

                {/* 3. Analytics Cookies */}
                <div className="p-4 rounded-2xl border border-[#ECECEC] hover:border-[#CCCCCC] transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#111111]">Analytics Cookies</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111111]" />
                    </label>
                  </div>
                  <p className="text-xs text-[#666666] leading-relaxed">
                    Analytics cookies are currently not enabled in this deployment. HealthChain does not use third-party advertising or commercial tracking cookies.
                  </p>
                </div>

                <div className="text-xs text-[#888888] pt-2">
                  For details, see our <Link to="/privacy" onClick={() => setShowModal(false)} className="text-[#2563EB] hover:underline font-semibold">Privacy Policy</Link> and <Link to="/terms" onClick={() => setShowModal(false)} className="text-[#2563EB] hover:underline font-semibold">Terms of Service</Link>.
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="px-6 py-4 border-t border-[#ECECEC] bg-[#FAFAFA] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#F7F4EB] text-[#111111] text-xs font-bold hover:bg-[#EAE6D8] transition-colors cursor-pointer"
                  >
                    Accept All
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectNonEssential}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-transparent border border-[#ECECEC] text-[#666666] text-xs font-bold hover:text-[#111111] hover:bg-[#ECECEC] transition-colors cursor-pointer"
                  >
                    Reject Non-Essential
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveModalPreferences}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Save Preferences</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
