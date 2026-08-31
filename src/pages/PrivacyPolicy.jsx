import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Lock, KeyRound, Eye, Database, FileText,
  AlertTriangle, CheckCircle2, ArrowRight, HelpCircle,
  Mail, Building2, UserCheck, HardDrive, RefreshCw
} from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

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
                <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                  Legal & Privacy Documentation
                </span>
              </div>

              <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] leading-[1.08] mb-6">
                Privacy <span className="font-bold">Policy</span>
              </h1>

              <p className="text-base sm:text-lg text-[#666666] leading-relaxed mb-6">
                Last Updated: June 2026 • Effective Date: June 2026
              </p>

              {/* Mandatory Legal Review Banner */}
              <div className="p-5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-xs sm:text-sm text-[#92400E] flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-[#B45309]">Notice:</strong> This policy should be reviewed by qualified legal counsel before production use.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PRIVACY POLICY CONTENT                                                    */}
        {/* ========================================================================= */}
        <section className="py-16 bg-[#FFFFFF] border-b border-[#ECECEC]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-12 text-sm text-[#444444] leading-relaxed">
            
            {/* 1. Information Collected */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#F7F4EB] text-[#111111] text-xs flex items-center justify-center font-bold">1</span>
                Information Collected
              </h2>
              <p>
                HealthChain collects only the minimum necessary information required to provide decentralized medical record management and patient-authorized data sharing. We operate on principles of data minimization and zero plaintext storage on public ledgers.
              </p>
            </div>

            {/* 2. Account Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#F7F4EB] text-[#111111] text-xs flex items-center justify-center font-bold">2</span>
                Account Information
              </h2>
              <p>
                When you create an account on HealthChain, we may collect:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[#555555]">
                <li><strong>Patient Identifiers:</strong> Sovereign Global Health ID (ABHA) or unique platform identifier.</li>
                <li><strong>Contact Credentials:</strong> Verified email address or phone number for two-factor authentication and alert notifications.</li>
                <li><strong>Cryptographic Identifiers:</strong> Public Ethereum/Web3 wallet addresses used for smart contract permission validation.</li>
                <li><strong>Practitioner Credentials:</strong> Medical license numbers, NPI numbers, and hospital department affiliations for clinical accounts.</li>
              </ul>
            </div>

            {/* 3. Healthcare Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#F7F4EB] text-[#111111] text-xs flex items-center justify-center font-bold">3</span>
                Healthcare Information
              </h2>
              <p>
                Healthcare records stored through HealthChain may include clinical SOAP consultation notes, diagnostic test parameters, digital e-prescriptions, discharge summaries, and DICOM radiology scans.
              </p>
              <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#ECECEC] text-xs text-[#555555]">
                <strong>Client-Side Encryption Standard:</strong> All healthcare files are encrypted client-side using AES-GCM 256-bit symmetric encryption prior to transmission and cloud persistence. HealthChain infrastructure nodes cannot view or decrypt raw healthcare documentation without your private keys.
              </div>
            </div>

            {/* 4. How Information is Used */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#F7F4EB] text-[#111111] text-xs flex items-center justify-center font-bold">4</span>
                How Information is Used
              </h2>
              <p>We use collected data solely to:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-[#555555]">
                <li>Facilitate secure, encrypted storage and retrieval of health records at your instruction.</li>
                <li>Execute cryptographic smart contract access policies granted by you to licensed clinicians.</li>
                <li>Dispatch critical panic-value alerts and appointment confirmations.</li>
                <li>Maintain immutable audit logs to safeguard legal and clinical accountability.</li>
              </ul>
              <p className="text-xs text-[#888888]">
                We do not sell, rent, monetize, or train commercial artificial intelligence models on your private medical records.
              </p>
            </div>

            {/* 5. Data Sharing */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#F7F4EB] text-[#111111] text-xs flex items-center justify-center font-bold">5</span>
                Data Sharing
              </h2>
              <p>
                Your medical records are shared <strong>strictly upon your explicit authorization</strong> with:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-[#555555]">
                <li><strong>Attending Doctors & Clinics:</strong> Only during active, time-bounded consultation sessions.</li>
                <li><strong>Hospitals & Diagnostic Centers:</strong> For specimen analysis and inpatient triage coordination.</li>
                <li><strong>Health Insurers:</strong> For claim evidence verification when authorized by the policyholder.</li>
              </ul>
            </div>

            {/* 6. Consent Architecture */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#F7F4EB] text-[#111111] text-xs flex items-center justify-center font-bold">6</span>
                Consent & Revocation
              </h2>
              <p>
                HealthChain puts you in control. Every access grant is bound by smart contract permissions that define the recipient, allowed categories, and expiration timestamp. You maintain the right to revoke active consent tokens instantly at any time from your mobile device.
              </p>
            </div>

            {/* 7. Security Safeguards */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#F7F4EB] text-[#111111] text-xs flex items-center justify-center font-bold">7</span>
                Security Safeguards
              </h2>
              <p>
                We implement multi-layered defenses including symmetric AES-GCM encryption, TLS 1.3 transport security, role-based access governance, and immutable SHA-256 ledger proofs. For technical architecture details, review our <Link to="/security" className="text-[#2563EB] font-bold hover:underline">Security Architecture</Link>.
              </p>
            </div>

            {/* 8. Data Retention */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#F7F4EB] text-[#111111] text-xs flex items-center justify-center font-bold">8</span>
                Data Retention
              </h2>
              <p>
                Encrypted healthcare files are retained in off-chain decentralized storage for as long as your account remains active or as required by applicable medical record keeping regulations. Upon verified account closure, off-chain storage pointers are scheduled for cryptographic deletion.
              </p>
            </div>

            {/* 9. User Rights */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#F7F4EB] text-[#111111] text-xs flex items-center justify-center font-bold">9</span>
                User Rights
              </h2>
              <p>You hold the following rights regarding your information:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-[#555555]">
                <li><strong>Right of Access:</strong> Review all personal records and demographic metadata.</li>
                <li><strong>Right to Portability:</strong> Export your complete longitudinal history in open JSON-LD formats.</li>
                <li><strong>Right to Audit:</strong> Inspect all staff and practitioner access events logged to the ledger.</li>
                <li><strong>Right to Revoke:</strong> Terminate third-party access permissions immediately.</li>
              </ul>
            </div>

            {/* 10. Data Requests */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#F7F4EB] text-[#111111] text-xs flex items-center justify-center font-bold">10</span>
                Data Requests & Inquiries
              </h2>
              <p>
                To submit a formal data export request, request account deletion, or ask questions regarding your privacy rights, please contact our privacy compliance desk.
              </p>
            </div>

            {/* 11. Contact Information */}
            <div className="p-8 rounded-3xl bg-[#FAFAFA] border border-[#ECECEC] space-y-4">
              <h3 className="text-base font-bold text-[#111111] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#2563EB]" />
                Contact & Legal Entity Information
              </h3>
              <div className="space-y-2 text-xs font-mono text-[#666666]">
                <p><strong>Legal Entity:</strong> [LEGAL INFORMATION TO BE COMPLETED]</p>
                <p><strong>Registered Address:</strong> [LEGAL INFORMATION TO BE COMPLETED]</p>
                <p><strong>Data Protection Officer:</strong> [LEGAL INFORMATION TO BE COMPLETED]</p>
                <p><strong>Compliance Email:</strong> [LEGAL INFORMATION TO BE COMPLETED]</p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL CALL TO ACTION (CTA)                                               */}
        {/* ========================================================================= */}
        <section className="py-20 bg-[#F7F4EB] relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111] bg-white px-4 py-1.5 rounded-full border border-[#ECECEC] shadow-sm">
              Patient Sovereignty
            </span>

            <h2 className="font-sans text-3xl sm:text-4xl font-normal tracking-tight text-[#111111] mt-6 mb-4">
              Your Data. Your Keys. <span className="font-bold">Your Control.</span>
            </h2>

            <p className="text-sm text-[#666666] leading-relaxed max-w-lg mx-auto mb-8">
              Take ownership of your healthcare history with cryptographic privacy and instant consent management.
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center">
              <button
                type="button"
                onClick={() => navigate('/patient-app')}
                className="px-8 py-3.5 rounded-xl bg-[#111111] text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-black hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                Launch Patient App
              </button>

              <Link
                to="/security"
                className="px-8 py-3.5 rounded-xl bg-white text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] transition-all duration-200 cursor-pointer"
              >
                Security Architecture
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Universal Footer with Legal Modals & Newsletter */}
      <Footer />
    </div>
  );
}
