import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Shield, Check, Lock, AlertTriangle,
  ArrowRight, ExternalLink, RefreshCw, CheckCircle2
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import {
  CURRENT_TERMS_VERSION,
  TERMS_LAST_UPDATED,
  recordTermsConsent
} from '../services/termsConsentService';

export default function TermsAcceptance() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useAuthStore();

  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Determine post-acceptance target destination
  const defaultDashboard = role === 'patient' ? '/patient/dashboard' : `/dashboard/${role || 'patient'}`;
  const redirectTarget = location.state?.from || defaultDashboard;

  const handleAccept = async () => {
    if (!agreed || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (!user) {
        throw new Error('Authenticated session required.');
      }
      await recordTermsConsent(user, CURRENT_TERMS_VERSION);
      // Navigate to intended destination
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      console.error('[TermsAcceptance Error]', err);
      setErrorMessage('Unable to save your acceptance. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EB] text-[#111111] font-sans flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-[#E8F0FE] selection:text-[#2563EB]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-2xl bg-white border border-[#ECECEC] rounded-3xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-[#F7F4EB] to-white border-b border-[#ECECEC]">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111111]/5 border border-[#111111]/10 text-xs font-bold text-[#111111]">
              <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Legal Consent Required</span>
            </div>
            <span className="text-[11px] font-mono text-[#666666] bg-[#ECECEC] px-2.5 py-0.5 rounded-full font-semibold">
              v{CURRENT_TERMS_VERSION} • {TERMS_LAST_UPDATED}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] mt-2 leading-relaxed">
            Please review and accept the current HealthChain Terms & Conditions before continuing to your secure healthcare portal.
          </p>
        </div>

        {/* Scrollable Summary & Links */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="p-5 rounded-2xl bg-[#FAFAFA] border border-[#ECECEC] space-y-3 text-xs text-[#555555] leading-relaxed max-h-52 overflow-y-auto">
            <p className="font-bold text-[#111111]">HealthChain Core Principles:</p>
            <ul className="list-disc pl-4 space-y-1.5">
              <li><strong>Self-Sovereign Consent:</strong> You control the decryption keys and sharing permissions for your health records.</li>
              <li><strong>Zero Plaintext Exposure:</strong> Medical documents are encrypted client-side using AES-GCM 256-bit ciphers before off-chain storage.</li>
              <li><strong>Tamper-Resistant Audits:</strong> Clinical lookups and prescription records are committed to an immutable ledger.</li>
              <li><strong>Healthcare Scope:</strong> HealthChain is an infrastructure provider, not a licensed medical practice. In an emergency, contact local emergency services immediately.</li>
            </ul>
          </div>

          {/* Full Document Links */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <a
              href="/terms"
              target="_blank"
              rel="noreferrer"
              className="flex-1 p-3.5 rounded-xl border border-[#ECECEC] hover:border-[#111111] bg-white transition-all flex items-center justify-between text-xs font-bold text-[#111111] group"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2563EB]" />
                <span>Read Full Terms of Service</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#888888] group-hover:text-[#111111]" />
            </a>

            <a
              href="/privacy"
              target="_blank"
              rel="noreferrer"
              className="flex-1 p-3.5 rounded-xl border border-[#ECECEC] hover:border-[#111111] bg-white transition-all flex items-center justify-between text-xs font-bold text-[#111111] group"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#16A34A]" />
                <span>Read Full Privacy Policy</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#888888] group-hover:text-[#111111]" />
            </a>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#DC2626] flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={handleAccept}
                className="px-3 py-1 bg-[#DC2626] text-white rounded-lg text-[11px] font-bold hover:bg-[#B91C1C] cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Checkbox Section */}
          <div className="pt-2 border-t border-[#F3F4F6]">
            <label className="flex items-start gap-3.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="mt-0.5 w-5 h-5 rounded border-gray-300 text-[#111111] focus:ring-[#111111] accent-[#111111] cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-[#333333] font-medium leading-tight">
                I have read and agree to the <Link to="/terms" target="_blank" className="text-[#2563EB] underline font-bold">Terms & Conditions</Link> and <Link to="/privacy" target="_blank" className="text-[#2563EB] underline font-bold">Privacy Policy</Link>.
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-[#FAFAFA] border-t border-[#ECECEC] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[11px] text-[#888888]">
            Acceptance recorded for: <strong className="text-[#111111]">{user?.email || user?.name || 'Authenticated User'}</strong>
          </span>

          <button
            type="button"
            onClick={handleAccept}
            disabled={!agreed || isSubmitting}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-sans text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 ${
              agreed && !isSubmitting
                ? 'bg-[#111111] text-white hover:bg-black hover:shadow-lg cursor-pointer'
                : 'bg-[#ECECEC] text-[#888888] cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Recording Acceptance...</span>
              </>
            ) : (
              <>
                <span>Accept & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
