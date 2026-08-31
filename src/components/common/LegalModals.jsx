import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, FileText, Cookie, Check, Lock, Eye, Database, Server, RefreshCw } from 'lucide-react';

export function PrivacyPolicyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-[#ECECEC] flex flex-col overflow-hidden text-[#111111]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#ECECEC] bg-[#F7F4EB]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#111111] text-white flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#14B8A6]" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-[#111111]">Privacy Policy</h3>
                <p className="text-xs text-[#666666]">Last Updated: August 2026 • HIPAA, GDPR & ABDM Compliant</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-black/5 text-[#666666] hover:text-[#111111] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#444444] leading-relaxed">
            <div className="bg-[#14B8A6]/10 border border-[#14B8A6]/30 p-4 rounded-xl flex items-start gap-3">
              <Lock className="w-5 h-5 text-[#0F766E] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#0F766E] font-medium">
                <strong>Zero-Knowledge Security:</strong> HealthChain operates under a cryptographic zero-knowledge architecture. Your health data is client-side encrypted before reaching any node. Only you and authorized doctors with valid cryptographic keys can decrypt your records.
              </p>
            </div>

            <section>
              <h4 className="text-base font-bold text-[#111111] mb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-[#2563EB]" /> 1. Information We Collect
              </h4>
              <p>We collect only the minimum required information necessary to provide decentralized health record management:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                <li><strong>Identity Data:</strong> Wallet public address, verifiable credential hashes, and optional phone/email for dual-factor verification.</li>
                <li><strong>Encrypted Medical Records:</strong> Hashed and encrypted payload pointers stored on IPFS / Cloudflare R2 decentralized clusters.</li>
                <li><strong>Audit & Access Telemetry:</strong> Immutable smart contract logs tracking time-stamped consent approvals and revocations.</li>
              </ul>
            </section>

            <section>
              <h4 className="text-base font-bold text-[#111111] mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#14B8A6]" /> 2. How Your Health Data is Handled
              </h4>
              <p>We do NOT sell, lease, or monetize personal health information. Data is processed strictly to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                <li>Facilitate encrypted data handshakes between patients and certified healthcare providers.</li>
                <li>Enable instant identity verification via ABHA and international digital health protocols.</li>
                <li>Power on-device and local privacy-preserving AI summarization models (Gemma/RAG) without transferring raw unencrypted telemetry to third parties.</li>
              </ul>
            </section>

            <section>
              <h4 className="text-base font-bold text-[#111111] mb-2 flex items-center gap-2">
                <Server className="w-4 h-4 text-[#8B5CF6]" /> 3. Data Ownership & Patient Rights
              </h4>
              <p className="text-xs">
                Under HIPAA and GDPR principles, you retain 100% sovereign ownership over your health records. You may revoke provider access permissions at any time directly through your dashboard with on-chain cryptographic finality.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#ECECEC] bg-[#FAFAFA] flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
            >
              Close Policy
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function TermsOfServiceModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-[#ECECEC] flex flex-col overflow-hidden text-[#111111]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#ECECEC] bg-[#F7F4EB]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#111111] text-white flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-[#111111]">Terms of Service</h3>
                <p className="text-xs text-[#666666]">Standard Platform Usage Agreement • Version 2.4</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-black/5 text-[#666666] hover:text-[#111111] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#444444] leading-relaxed">
            <section>
              <h4 className="text-base font-bold text-[#111111] mb-2">1. Acceptance of Terms</h4>
              <p className="text-xs">
                By accessing or connecting a wallet to the HealthChain platform, you agree to be bound by these Terms of Service, all applicable healthcare regulations, and decentralized protocol governance guidelines.
              </p>
            </section>

            <section>
              <h4 className="text-base font-bold text-[#111111] mb-2">2. Medical Disclaimer</h4>
              <p className="text-xs bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] p-3 rounded-lg">
                <strong>Important Notice:</strong> HealthChain is a decentralized record verification and cryptographic transfer infrastructure. The platform does not dispense medical advice, diagnosis, or clinical treatment plans. Always consult a licensed medical practitioner for healthcare decisions.
              </p>
            </section>

            <section>
              <h4 className="text-base font-bold text-[#111111] mb-2">3. User Responsibilities & Private Keys</h4>
              <p className="text-xs">
                Users are solely responsible for securing their private recovery phrases and security PINs. HealthChain cannot recover encrypted records if both your private encryption key and backup passphrases are lost.
              </p>
            </section>

            <section>
              <h4 className="text-base font-bold text-[#111111] mb-2">4. Smart Contract Execution & Auditing</h4>
              <p className="text-xs">
                All consent grants, electronic prescriptions, and health records are committed to distributed ledger contracts. Transactions are irreversible once confirmed on the consensus network.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#ECECEC] bg-[#FAFAFA] flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
            >
              I Understand
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function CookieSettingsModal({ isOpen, onClose }) {
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    functional: true,
  });
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#ECECEC] flex flex-col overflow-hidden text-[#111111]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#ECECEC] bg-[#F7F4EB]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#111111] text-white flex items-center justify-center">
                <Cookie className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-[#111111]">Cookie & Privacy Settings</h3>
                <p className="text-xs text-[#666666]">Customize your browsing and tracking preferences</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-black/5 text-[#666666] hover:text-[#111111] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preferences */}
          <div className="p-6 space-y-5">
            {/* Essential */}
            <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-[#ECECEC] bg-[#FAFAFA]">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#111111]">Strictly Essential Cookies</h4>
                  <span className="text-[10px] uppercase font-bold bg-[#ECECEC] text-[#555555] px-2 py-0.5 rounded">Always Active</span>
                </div>
                <p className="text-xs text-[#666666] mt-1">
                  Required for cryptographic wallet authentication, session security, and anti-CSRF token verification.
                </p>
              </div>
              <input type="checkbox" checked disabled className="mt-1 w-4 h-4 accent-[#111111] opacity-60 cursor-not-allowed" />
            </div>

            {/* Analytics */}
            <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-[#ECECEC] hover:border-[#CCCCCC] transition-colors">
              <div>
                <h4 className="text-sm font-bold text-[#111111]">Performance & APM Analytics</h4>
                <p className="text-xs text-[#666666] mt-1">
                  Anonymous transaction latency metrics to optimize IPFS and blockchain relay nodes.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                className="mt-1 w-4 h-4 accent-[#111111] cursor-pointer"
              />
            </div>

            {/* Functional */}
            <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-[#ECECEC] hover:border-[#CCCCCC] transition-colors">
              <div>
                <h4 className="text-sm font-bold text-[#111111]">Functional & Localization Cookies</h4>
                <p className="text-xs text-[#666666] mt-1">
                  Remembers your language preferences (English/Telugu) and UI theme mode.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.functional}
                onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                className="mt-1 w-4 h-4 accent-[#111111] cursor-pointer"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#ECECEC] bg-[#FAFAFA] flex items-center justify-between">
            <span className="text-xs text-[#666666]">Changes apply immediately</span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-[#ECECEC] text-[#666666] text-xs font-bold hover:bg-[#ECECEC] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-lg bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors flex items-center gap-1.5"
              >
                {saved ? <><Check className="w-3.5 h-3.5 text-[#14B8A6]" /> Saved</> : 'Save Preferences'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
