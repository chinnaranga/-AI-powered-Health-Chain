import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, KeyRound, FileCheck2, FileSpreadsheet, Share2,
  CheckCircle2, Clock, Lock, Eye, Server, ChevronRight,
  ArrowRight, Activity, Users, AlertCircle, Building2,
  Database, FileText, BadgePercent, Sparkles
} from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function InsurersSolution() {
  const navigate = useNavigate();
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  // 4 Core Health Insurance Claims Challenges
  const insurerChallenges = [
    {
      title: 'Manual Medical Record Retrieval',
      desc: 'Insurers spend weeks requesting, gathering, and chasing paper medical files and hospital discharge summaries for claim adjudication.',
      impact: 'Extended claim processing cycles'
    },
    {
      title: 'High Risk of Documentation Fraud',
      desc: 'Paper bills and PDF medical reports can be manipulated, falsified, or inflated without cryptographic verification from treating hospitals.',
      impact: 'Fraudulent payouts and compliance losses'
    },
    {
      title: 'Consent & Regulatory Friction',
      desc: 'Sharing sensitive patient diagnostic data without clear, auditable consent violates strict privacy laws and creates legal liability.',
      impact: 'Regulatory fines and compliance delays'
    },
    {
      title: 'Disconnected Insurer Core Systems',
      desc: 'Lack of standardized healthcare data formats forces claims adjusters into manual data entry across disconnected portals.',
      impact: 'Increased operational and staffing overhead'
    }
  ];

  // 8 Core Insurer Solution Modules
  const insurerModules = [
    {
      id: 'patient-consent',
      icon: KeyRound,
      title: 'Patient-Authorized Consent',
      badge: 'Consent Gateway',
      desc: 'Policyholders grant explicit, time-bounded consent directly from their mobile app, authorizing access only to relevant claim records.'
    },
    {
      id: 'claims-data',
      icon: FileSpreadsheet,
      title: 'Claims-Related Data Workflows',
      badge: 'Evidence Ingestion',
      desc: 'Direct transmission of attested medical evidence, operative summaries, itemized bills, and pharmacy slips from treating hospitals.'
    },
    {
      id: 'verification-workflows',
      icon: FileCheck2,
      title: 'Verification Workflows',
      badge: 'Digital Attestation',
      desc: 'Instant mathematical verification that medical records, diagnostic tests, and doctor signatures have not been altered post-treatment.'
    },
    {
      id: 'secure-record-sharing',
      icon: Share2,
      title: 'Secure Record Sharing',
      badge: 'Encrypted Exchange',
      desc: 'End-to-end encrypted transport protocols ensuring sensitive patient diagnostic histories are accessible only to authorized claims adjusters.'
    },
    {
      id: 'audit-trails',
      icon: Eye,
      title: 'Immutable Audit Trails',
      badge: 'Compliance Telemetry',
      desc: 'Non-repudiable audit logging recording every claim data query, document access, and adjuster review with immutable timestamps.'
    },
    {
      id: 'rbac',
      icon: Shield,
      title: 'Role-Based Access (RBAC)',
      badge: 'Governance',
      desc: 'Granular permission controls separating claims adjusters, medical reviewers, fraud investigators, and compliance supervisors.'
    },
    {
      id: 'secure-apis',
      icon: Server,
      title: 'Secure APIs & Standards',
      badge: 'Enterprise Integration',
      desc: 'Standardized REST endpoints and JSON-LD schema enabling direct integration into existing insurance core management platforms.'
    },
    {
      id: 'fraud-prevention',
      icon: Lock,
      title: 'Integrity Verification',
      badge: 'Anti-Tampering',
      desc: 'SHA-256 cryptographic hashes seal hospital records, eliminating retroactive bill alterations and falsified diagnostic reports.'
    }
  ];

  // 5-Stage Insurer Data Workflow
  const insurerWorkflow = [
    {
      step: '01',
      title: 'Patient Consent',
      subtitle: 'Policyholder Approval',
      icon: KeyRound,
      description: 'The patient initiates or approves a claim data request via their HealthChain app, generating scoped decryption keys.'
    },
    {
      step: '02',
      title: 'Authorized Data Query',
      subtitle: 'Hospital Data Fetch',
      icon: FileSpreadsheet,
      description: 'The insurer claims portal queries treating hospital and lab nodes for specific, consented medical encounter records.'
    },
    {
      step: '03',
      title: 'Secure Sharing',
      subtitle: 'Encrypted Transport',
      icon: Share2,
      description: 'Records, diagnostic summaries, and itemized billing statements are transmitted over end-to-end encrypted tunnels.'
    },
    {
      step: '04',
      title: 'Verification',
      subtitle: 'Attestation Check',
      icon: FileCheck2,
      description: 'Claims adjusters verify digital doctor signatures and hospital cryptographic hashes to confirm documentation authenticity.'
    },
    {
      step: '05',
      title: 'Audit Trail',
      subtitle: 'Permanent Record',
      icon: Eye,
      description: 'The entire exchange is permanently recorded to an immutable ledger for internal compliance and regulatory oversight.'
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
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-7 flex flex-col items-start"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111]/5 border border-[#111111]/10 mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                    Health Insurance Data & Consent Infrastructure
                  </span>
                </div>

                <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] leading-[1.08] mb-6">
                  Consent-Driven Data.<br />
                  <span className="font-bold">Cryptographically Verified Claims.</span>
                </h1>

                <p className="text-lg sm:text-xl text-[#666666] leading-relaxed max-w-2xl mb-10">
                  Enable fast, consent-backed verification of medical documentation for healthcare insurers. Eliminate claims paperwork delays, verify hospital attestations, and maintain immutable audit trails.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-4 items-center">
                  <button
                    type="button"
                    onClick={() => navigate('/book-demo')}
                    className="px-8 py-4 rounded-xl bg-[#111111] text-[#FFFFFF] font-sans text-xs font-bold uppercase tracking-widest hover:bg-[#000000] hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer"
                  >
                    <span>Request Insurer Demo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href="#insurer-modules"
                    className="px-8 py-4 rounded-xl bg-transparent text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
                  >
                    Explore Capabilities
                  </a>
                </div>

                {/* Badges */}
                <div className="mt-12 pt-8 border-t border-[#ECECEC] flex flex-wrap gap-6 text-xs text-[#666666] font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                    <span>Explicit Patient Consent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                    <span>Attested Medical Evidence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                    <span>Tamper-Resistant Audit Logs</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Insurer Claims Verification Preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="lg:col-span-5 relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-[#2563EB]/20 to-[#14B8A6]/20 rounded-3xl blur-2xl opacity-60" />
                
                {/* Insurer Shell */}
                <div className="relative bg-white rounded-3xl border border-[#ECECEC] shadow-2xl p-6 sm:p-8 overflow-hidden">
                  
                  {/* Top Bar: Insurer Node */}
                  <div className="flex items-center justify-between pb-5 border-b border-[#F3F4F6]">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-[#111111]">Apex Health Assurance</h3>
                          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                        </div>
                        <p className="text-[11px] text-[#666666]">Claims Gateway #INS-901 • Active</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-[#2563EB]/10 text-[#2563EB] rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Verified Node
                    </span>
                  </div>

                  {/* Active Claim Evidence Ingestion */}
                  <div className="my-5 p-4 rounded-2xl bg-[#F7F4EB] border border-[#ECECEC] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] uppercase font-bold text-[#666666]">Incoming Evidence Record</span>
                      <span className="text-[10px] font-mono bg-[#16A34A]/10 text-[#16A34A] px-2 py-0.5 rounded font-bold">CONSENT VERIFIED</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <h4 className="text-sm font-bold text-[#111111]">Claim #CLM-8831: IPD Cardiology</h4>
                        <p className="text-[11px] text-[#666666]">Policyholder: Sarah Jenkins • St. Jude Hospital</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#2563EB]">Match 100%</span>
                    </div>
                  </div>

                  {/* Operational Telemetry */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">Pending Verify</p>
                      <p className="text-base font-bold text-[#111111] mt-0.5">12 Records</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">Attestations</p>
                      <p className="text-base font-bold text-[#16A34A] mt-0.5">Valid</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">Audit State</p>
                      <p className="text-base font-bold text-[#2563EB] mt-0.5">Sealed</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate('/book-demo')}
                      className="py-2.5 px-3 rounded-xl border border-[#ECECEC] bg-white text-[#111111] text-xs font-bold hover:bg-[#F7F4EB] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Evidence
                    </button>
                    <button
                      onClick={() => navigate('/book-demo')}
                      className="py-2.5 px-3 rounded-xl bg-[#111111] text-white text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" /> Verify Attestation
                    </button>
                  </div>

                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* INSURANCE CHALLENGES SECTION                                             */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#DC2626] bg-[#DC2626]/10 px-3 py-1 rounded-full border border-[#DC2626]/20">
                Claims Overhead
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                The Cost of <span className="font-bold">Fragmented Claims Verification</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                Health insurers face prolonged review cycles, vulnerability to document tampering, and complex compliance challenges during claim data retrieval.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {insurerChallenges.map((c, idx) => (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="p-8 rounded-2xl bg-white border border-[#ECECEC] shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-8 h-8 rounded-lg bg-[#DC2626]/10 text-[#DC2626] font-bold text-xs flex items-center justify-center">
                        0{idx + 1}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] bg-[#DC2626]/5 px-2.5 py-1 rounded-full">
                        Claims Bottleneck
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#111111] mb-2">{c.title}</h3>
                    <p className="text-xs sm:text-sm text-[#666666] leading-relaxed mb-4">{c.desc}</p>
                  </div>
                  <div className="pt-4 border-t border-[#F3F4F6] text-xs font-semibold text-[#888888] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-[#DC2626]" />
                    <span>Consequence: {c.impact}</span>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SOLUTION MODULES: 8 CAPABILITY PILLARS                                    */}
        {/* ========================================================================= */}
        <section id="insurer-modules" className="py-24 bg-[#FFFFFF] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full border border-[#2563EB]/20">
                Insurer Capabilities
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                Enterprise Infrastructure for <span className="font-bold">Verified Claims Data</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                Secure data exchange tools enabling fast, consent-governed retrieval of hospital and diagnostic evidence for claims review.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {insurerModules.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="p-6 rounded-2xl bg-white border border-[#ECECEC] hover:border-[#CCCCCC] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[#F7F4EB] border border-[#ECECEC] flex items-center justify-center text-[#111111] group-hover:bg-[#111111] group-hover:text-white transition-colors duration-300">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#555555] border border-[#ECECEC]">
                          {item.badge}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#111111] mb-2 tracking-tight group-hover:text-[#2563EB] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#666666] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#F3F4F6] flex items-center justify-between text-xs font-bold text-[#111111]">
                      <span className="text-[11px] text-[#888888] font-medium">Pillar #{idx + 1}</span>
                      <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span className="text-xs">Learn more</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5-STAGE WORKFLOW                                                          */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full border border-[#2563EB]/20">
                Claims Evidence Protocol
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                The 5-Stage Consent & <span className="font-bold">Verification Pathway</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                Trace how patient-consented medical records are queried, encrypted, transmitted, and verified by insurance claims teams.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {insurerWorkflow.map((iw, idx) => {
                const IwIcon = iw.icon;
                return (
                  <motion.div
                    key={iw.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    onClick={() => setActiveWorkflowStep(idx)}
                    className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                      activeWorkflowStep === idx
                        ? 'bg-[#F7F4EB] border-[#111111] shadow-md'
                        : 'bg-white border-[#ECECEC] hover:border-[#CCCCCC]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                          activeWorkflowStep === idx
                            ? 'bg-[#111111] text-white'
                            : 'bg-[#F3F4F6] text-[#111111]'
                        }`}>
                          <IwIcon className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-xl font-bold text-[#CCCCCC]">
                          {iw.step}
                        </span>
                      </div>

                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">
                        {iw.subtitle}
                      </p>
                      <h3 className="text-base font-bold text-[#111111] mb-2">
                        {iw.title}
                      </h3>
                      <p className="text-xs text-[#555555] leading-relaxed">
                        {iw.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F3F4F6] text-[10px] font-mono text-[#888888]">
                      Phase {idx + 1} of 5
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Verification Disclaimer Banner */}
            <div className="mt-12 p-6 rounded-2xl bg-[#F7F4EB] border border-[#ECECEC] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111111]">Evidence Verification & Adjudication Support</h4>
                  <p className="text-xs text-[#666666]">HealthChain provides cryptographic attestation and data integrity verification to assist insurer claims teams in authenticating hospital documentation.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/book-demo')}
                className="px-6 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors flex-shrink-0"
              >
                Schedule Demo
              </button>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECURITY & GOVERNANCE                                                    */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#111111] text-white border-b border-[#222222]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full border border-[#2563EB]/20">
                Institutional Security Standards
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white mt-4 mb-6">
                Zero-Trust Data Protection for <br />
                <span className="font-bold text-[#2563EB]">Insurance Exchanges</span>
              </h2>
              <p className="text-base sm:text-lg text-[#A3A3A3] leading-relaxed">
                Ensure full regulatory compliance with patient-controlled authorization and end-to-end payload encryption.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D]">
                <KeyRound className="w-8 h-8 text-[#2563EB] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Scoped Decryption Keys</h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                  Decryption keys are granted by the patient only for specific claim encounters and expire automatically upon review.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D]">
                <Shield className="w-8 h-8 text-[#2563EB] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Hospital Attestation</h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                  Hospital nodes digitally sign every clinical encounter note and invoice, verifying data authenticity mathematically.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D]">
                <Eye className="w-8 h-8 text-[#2563EB] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Non-Repudiable Logs</h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                  Every query, document access, and adjuster review is stamped into an immutable audit registry for regulatory peace of mind.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL CALL TO ACTION (CTA)                                               */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#F7F4EB] relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111] bg-white px-4 py-1.5 rounded-full border border-[#ECECEC] shadow-sm">
              Insurer Integration
            </span>

            <h2 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] mt-6 mb-6 leading-[1.1]">
              Modernize Your Claims Verification <br />
              <span className="font-bold">with HealthChain</span>
            </h2>

            <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-xl mx-auto mb-10">
              Connect your insurance core system to verified hospital records with patient-governed consent and cryptographic data integrity.
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center">
              <button
                type="button"
                onClick={() => navigate('/book-demo')}
                className="px-9 py-4 rounded-xl bg-[#111111] text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-black hover:shadow-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <span>Request Insurer Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/patient-app')}
                className="px-9 py-4 rounded-xl bg-white text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
              >
                Explore Patient App
              </button>
            </div>

            <p className="mt-8 text-xs text-[#888888]">
              RESTful APIs • JSON-LD Schema • Cryptographic Evidence Attestation
            </p>
          </div>
        </section>
      </main>

      {/* Universal Footer with Legal Modals & Newsletter */}
      <Footer />
    </div>
  );
}
