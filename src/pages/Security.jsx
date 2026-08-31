import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Lock, KeyRound, Eye, Server, Database, Activity,
  AlertTriangle, CheckCircle2, ArrowRight, FileCheck, Layers,
  Terminal, ShieldCheck, RefreshCw, Cpu, HardDrive, BellRing,
  FileKey, Code2, Users
} from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function Security() {
  const navigate = useNavigate();

  // 12 Comprehensive Security Architecture Pillars
  const securityPillars = [
    {
      id: 'encryption',
      icon: Lock,
      title: 'End-to-End Encryption',
      badge: 'Data Protection',
      desc: 'All medical records and diagnostic files are encrypted client-side using strong symmetric AES-GCM 256-bit ciphers before transmission. In-transit traffic is secured via TLS 1.3.'
    },
    {
      id: 'authentication',
      icon: KeyRound,
      title: 'Cryptographic Authentication',
      badge: 'Identity Verification',
      desc: 'Users authenticate via multi-factor authentication (MFA) and cryptographic Ethereum Web3 wallet signatures (EIP-712), eliminating weak password dependencies.'
    },
    {
      id: 'authorization',
      icon: FileKey,
      title: 'Patient-Governed Authorization',
      badge: 'Zero-Knowledge Consent',
      desc: 'Access to health records requires an explicit, time-bounded consent grant from the patient. Clinicians cannot browse non-consented files.'
    },
    {
      id: 'rbac',
      icon: Users,
      title: 'Role-Based Access Controls (RBAC)',
      badge: 'Governance',
      desc: 'Strict role segregation defines granular permissions for patients, attending physicians, nursing supervisors, hospital ERP admins, and lab pathologists.'
    },
    {
      id: 'access-control',
      icon: ShieldCheck,
      title: 'Least-Privilege Access Control',
      badge: 'Scoped Decryption',
      desc: 'Decryption keys are generated dynamically for specific consultation sessions and automatically expire once the encounter window concludes.'
    },
    {
      id: 'audit-logging',
      icon: Eye,
      title: 'Immutable Audit Logging',
      badge: 'Non-Repudiation',
      desc: 'Every chart lookup, diagnostic upload, e-prescription generation, and export action is indelibly recorded with microsecond timestamps.'
    },
    {
      id: 'api-security',
      icon: Code2,
      title: 'API & Gateway Security',
      badge: 'Transport Defense',
      desc: 'All REST and JSON-LD endpoints enforce strict request throttling, IP rate limiting, input sanitization, and bearer token signature validation.'
    },
    {
      id: 'data-isolation',
      icon: Layers,
      title: 'Multi-Tenant Data Isolation',
      badge: 'Partitioning',
      desc: 'Hospital department databases and decentralized storage vaults maintain strict cryptographic partition boundaries, preventing cross-tenant leakage.'
    },
    {
      id: 'backup-strategy',
      icon: HardDrive,
      title: 'Resilient Backup Strategy',
      badge: 'Disaster Recovery',
      desc: 'Encrypted ciphertext blobs are replicated across distributed Cloudflare R2 object stores and IPFS nodes with automated SHA-256 hash verification.'
    },
    {
      id: 'monitoring',
      icon: Activity,
      title: 'Continuous System Monitoring',
      badge: 'Telemetry & Alerts',
      desc: 'Real-time telemetry monitors node uptime, detects anomalous query surges, and generates immediate alerts for unauthorized access attempts.'
    },
    {
      id: 'incident-response',
      icon: BellRing,
      title: 'Incident Response Protocol',
      badge: 'Threat Mitigation',
      desc: 'Rapid-containment procedures allow instant revocation of compromised practitioner keys, automated node isolation, and emergency key rotations.'
    },
    {
      id: 'secure-development',
      icon: Terminal,
      title: 'Secure Development Practices',
      badge: 'CI/CD & Hardening',
      desc: 'Our codebase undergoes continuous static security analysis, dependency vulnerability scanning, zero secret commits in version control, and regression testing.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] font-sans selection:bg-[#E8F0FE] selection:text-[#2563EB] scroll-smooth">
      {/* Universal Navigation Header */}
      <Header />

      <main>
        {/* ========================================================================= */}
        {/* HERO SECTION                                                             */}
        {/* ========================================================================= */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 border-b border-[#ECECEC] bg-gradient-to-b from-[#F7F4EB]/70 via-white to-white overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#111111_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111]/5 border border-[#111111]/10 mb-6">
                <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                  HealthChain Security & Governance Architecture
                </span>
              </div>

              <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] leading-[1.08] mb-6">
                Institutional Security & <br />
                <span className="font-bold">Zero-Trust Data Governance</span>
              </h1>

              <p className="text-lg sm:text-xl text-[#666666] leading-relaxed mb-8 max-w-3xl">
                HealthChain is engineered from the ground up with defense-in-depth security principles. We combine client-side encryption, self-sovereign patient consent, and tamper-resistant cryptographic ledgers to protect sensitive medical data.
              </p>

              {/* Verified Architecture Disclaimer */}
              <div className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#ECECEC] text-xs text-[#555555] flex items-start gap-3 mb-10">
                <ShieldCheck className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-[#111111]">Cryptographic Engineering Standards:</strong> HealthChain relies on mathematically verified protocols — client-side AES-GCM symmetric encryption, SHA-256 payload digests, and Ethereum smart contract access controls — to ensure data confidentiality, integrity, and availability.
                </div>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <a
                  href="#security-pillars"
                  className="px-8 py-4 rounded-xl bg-[#111111] text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-black hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Security Pillars</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <Link
                  to="/developers/smart-contracts"
                  className="px-8 py-4 rounded-xl bg-transparent text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
                >
                  Review Smart Contracts
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 12 CORE SECURITY PILLARS                                                 */}
        {/* ========================================================================= */}
        <section id="security-pillars" className="py-24 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full border border-[#2563EB]/20">
                Technical Safeguards
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                Twelve Pillars of <span className="font-bold">HealthChain Security</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                Our multi-layered security model addresses every stage of the medical data lifecycle — from generation on clinical workstations to transmission, storage, and verification.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityPillars.map((pillar, idx) => {
                const PillarIcon = pillar.icon;
                return (
                  <motion.div
                    key={pillar.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.04 }}
                    className="p-6 sm:p-8 rounded-2xl bg-white border border-[#ECECEC] hover:border-[#CCCCCC] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[#F7F4EB] border border-[#ECECEC] flex items-center justify-center text-[#111111] group-hover:bg-[#111111] group-hover:text-white transition-colors duration-300">
                          <PillarIcon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#555555] border border-[#ECECEC]">
                          {pillar.badge}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#111111] mb-2 tracking-tight group-hover:text-[#2563EB] transition-colors">
                        {pillar.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#F3F4F6] flex items-center justify-between text-xs font-bold text-[#111111]">
                      <span className="text-[11px] text-[#888888] font-medium">Pillar #{idx + 1}</span>
                      <div className="flex items-center gap-1 text-[#16A34A]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Active Policy</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* ZERO-TRUST DATA FLOW HIGHLIGHT                                            */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#111111] text-white border-b border-[#222222]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full border border-[#2563EB]/20">
                Threat Mitigation
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white mt-4 mb-6">
                Defense Against <br />
                <span className="font-bold text-[#2563EB]">Centralized Attack Vectors</span>
              </h2>
              <p className="text-base sm:text-lg text-[#A3A3A3] leading-relaxed">
                Centralized healthcare databases represent massive, high-risk targets for ransomware and insider threats. HealthChain eliminates single points of failure.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D]">
                <Lock className="w-8 h-8 text-[#2563EB] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No Plaintext in the Cloud</h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                  Even if an external storage bucket or hosting node is breached, attackers only obtain encrypted ciphertext blobs without the patient private keys.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D]">
                <KeyRound className="w-8 h-8 text-[#2563EB] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No Central Master Key</h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                  There is no backdoor or global decryption key. Access requires the individual patient active signature and smart contract authorization.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D]">
                <Eye className="w-8 h-8 text-[#2563EB] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Tamper Detection</h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                  Any attempt to alter historical records or diagnostic reports is immediately detected through SHA-256 hash mismatch against the ledger.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL CALL TO ACTION (CTA)                                               */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#F7F4EB] relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111] bg-white px-4 py-1.5 rounded-full border border-[#ECECEC] shadow-sm">
              Security Governance
            </span>

            <h2 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] mt-6 mb-6 leading-[1.1]">
              Secure Your Healthcare <br />
              <span className="font-bold">Infrastructure with HealthChain</span>
            </h2>

            <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-xl mx-auto mb-10">
              Review our developer documentation, smart contract implementations, and cryptographic access protocols.
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center">
              <Link
                to="/developers/smart-contracts"
                className="px-9 py-4 rounded-xl bg-[#111111] text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-black hover:shadow-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <span>Review Smart Contracts</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/developers/documentation"
                className="px-9 py-4 rounded-xl bg-white text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
              >
                Platform Docs
              </Link>
            </div>

            <p className="mt-8 text-xs text-[#888888]">
              Client-Side AES-GCM • Decentralized Storage • Immutable Ledger Attestation
            </p>
          </div>
        </section>
      </main>

      {/* Universal Footer with Legal Modals & Newsletter */}
      <Footer />
    </div>
  );
}
