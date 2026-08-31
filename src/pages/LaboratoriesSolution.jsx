import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TestTube, Shield, Activity, FileSpreadsheet, Send, QrCode,
  CheckCircle2, Clock, Lock, Share2, Eye, Server, ChevronRight,
  ArrowRight, FileCheck, Layers, Sparkles, Building, Database,
  AlertCircle, Cpu, BarChart3, Binary
} from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function LaboratoriesSolution() {
  const navigate = useNavigate();
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  // 4 Core Diagnostic Sector Challenges
  const labChallenges = [
    {
      title: 'Manual Specimen Custody Tracking',
      desc: 'Specimens changing hands between clinics, couriers, and processing centers often lack a continuous, verified digital chain-of-custody.',
      impact: 'Sample misplacement and transcription errors'
    },
    {
      title: 'Delayed Results Relay',
      desc: 'Static paper prints and unencrypted emails delay vital diagnostic turnaround times for emergency and outpatient physicians.',
      impact: 'Delayed clinical interventions'
    },
    {
      title: 'Vulnerability to Result Forgery',
      desc: 'Standard paper and PDF diagnostic reports can be easily altered or forged without cryptographically provable digital signatures.',
      impact: 'Diagnostic fraud and legal liability'
    },
    {
      title: 'Fragmented EHR Integration',
      desc: 'Independent diagnostic networks struggle with high custom integration costs for every hospital and outpatient clinic.',
      impact: 'Elevated IT expenses and data silos'
    }
  ];

  // 9 Core Laboratory Solution Modules
  const labModules = [
    {
      id: 'lab-workflows',
      icon: Server,
      title: 'Laboratory Workflows',
      badge: 'LIS & Instruments',
      desc: 'Unified laboratory operating console connecting auto-analyzers, manual worklists, and specimen intake registries into a streamlined flow.'
    },
    {
      id: 'test-orders',
      icon: FileSpreadsheet,
      title: 'Test Orders',
      badge: 'Electronic Requisition',
      desc: 'Receive digital test requisitions from hospitals and clinics with detailed patient context, test panels, and emergency stat tags.'
    },
    {
      id: 'sample-tracking',
      icon: QrCode,
      title: 'Sample Tracking',
      badge: 'Custody Telemetry',
      desc: 'Unique hashed barcode identifiers tracking phlebotomy collection, centrifuge processing, cold-chain transport, and analyzer receipt.'
    },
    {
      id: 'result-processing',
      icon: Activity,
      title: 'Result Processing',
      badge: 'Analyzer Feeds',
      desc: 'Direct ingestion of analyzer telemetry with automated biological reference checks, delta checks, and abnormal flag detection.'
    },
    {
      id: 'report-generation',
      icon: FileCheck,
      title: 'Report Generation',
      badge: 'Cryptographic Seals',
      desc: 'Automated synthesis of standardized diagnostic reports sealed with the pathologist digital signature and SHA-256 integrity hash.'
    },
    {
      id: 'provider-delivery',
      icon: Send,
      title: 'Provider Delivery',
      badge: 'Instant Doctor Relay',
      desc: 'Instant, encrypted dispatch of finalized reports and panic-value SMS alerts to ordering physicians and hospital departments.'
    },
    {
      id: 'patient-association',
      icon: Share2,
      title: 'Patient Association',
      badge: 'Decentralized Vault',
      desc: 'Encrypted binding of verified diagnostic records directly to the patient sovereign Health ID and decentralized timeline.'
    },
    {
      id: 'secure-transmission',
      icon: Lock,
      title: 'Secure Data Transmission',
      badge: 'Payload Encryption',
      desc: 'Client-side AES-GCM encryption ensuring test data remains confidential across distributed networks and storage nodes.'
    },
    {
      id: 'audit-logs',
      icon: Eye,
      title: 'Audit Logs',
      badge: 'Compliance & History',
      desc: 'Permanent timestamped ledger recording every diagnostic upload, signature stamp, physician view, and patient access event.'
    }
  ];

  // 7-Stage Laboratory Operational Workflow
  const labWorkflow = [
    {
      step: '01',
      title: 'Order Placement',
      subtitle: 'Electronic Requisition',
      icon: FileSpreadsheet,
      description: 'Physician or hospital clinic generates an electronic diagnostic order with specific test panels and clinical context.'
    },
    {
      step: '02',
      title: 'Sample Collection',
      subtitle: 'Specimen Barcoding',
      icon: QrCode,
      description: 'The specimen is collected and assigned a unique cryptographically hashed barcode tracking its physical custody.'
    },
    {
      step: '03',
      title: 'Lab Processing',
      subtitle: 'Analyzer Execution',
      icon: TestTube,
      description: 'Laboratory analyzers execute diagnostic runs, capturing raw chemical, hematological, and immunological data.'
    },
    {
      step: '04',
      title: 'Result Validation',
      subtitle: 'Pathologist Review',
      icon: Activity,
      description: 'A certified pathologist evaluates abnormal parameters, delta variances, and attaches their digital signature.'
    },
    {
      step: '05',
      title: 'Report Generation',
      subtitle: 'Cryptographic Seal',
      icon: FileCheck,
      description: 'The finalized diagnostic report is encrypted and sealed with an immutable SHA-256 verification hash.'
    },
    {
      step: '06',
      title: 'Provider Delivery',
      subtitle: 'Instant Clinical Relay',
      icon: Send,
      description: 'Ordering physicians receive real-time access notifications and critical alerts directly in their clinical portal.'
    },
    {
      step: '07',
      title: 'Patient Record Sync',
      subtitle: 'Sovereign Health Vault',
      icon: Database,
      description: 'The patient receives the encrypted report in their personal app with full ownership and sharing control.'
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
                  <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                    Diagnostic & Pathology Network Infrastructure
                  </span>
                </div>

                <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] leading-[1.08] mb-6">
                  Connected Pathology.<br />
                  <span className="font-bold">Tamper-Proof Diagnostics.</span>
                </h1>

                <p className="text-lg sm:text-xl text-[#666666] leading-relaxed max-w-2xl mb-10">
                  Connect diagnostic laboratories with hospitals, attending physicians, and patients. Streamline test requisitions, track specimen chain-of-custody, and deliver digitally sealed lab reports instantly.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-4 items-center">
                  <button
                    type="button"
                    onClick={() => navigate('/clinical/register')}
                    className="px-8 py-4 rounded-xl bg-[#111111] text-[#FFFFFF] font-sans text-xs font-bold uppercase tracking-widest hover:bg-[#000000] hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer"
                  >
                    <span>Connect Laboratory</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href="#lab-solution-modules"
                    className="px-8 py-4 rounded-xl bg-transparent text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
                  >
                    Explore Capabilities
                  </a>
                </div>

                {/* Badges */}
                <div className="mt-12 pt-8 border-t border-[#ECECEC] flex flex-wrap gap-6 text-xs text-[#666666] font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
                    <span>Cryptographic Digital Seals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
                    <span>Hashed Chain of Custody</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
                    <span>Instant Physician Dispatch</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Lab Network Node Preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="lg:col-span-5 relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-[#0D9488]/20 to-[#2563EB]/20 rounded-3xl blur-2xl opacity-60" />
                
                {/* Lab Node Shell */}
                <div className="relative bg-white rounded-3xl border border-[#ECECEC] shadow-2xl p-6 sm:p-8 overflow-hidden">
                  
                  {/* Top Bar: Lab Gateway Identity */}
                  <div className="flex items-center justify-between pb-5 border-b border-[#F3F4F6]">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#0D9488] text-white flex items-center justify-center font-bold text-sm">
                        <TestTube className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-[#111111]">Metropolitan Central Pathology</h3>
                          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                        </div>
                        <p className="text-[11px] text-[#666666]">Diagnostic Node #LAB-402 • Operational</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-[#0D9488]/10 text-[#0F766E] rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Live LIS
                    </span>
                  </div>

                  {/* Active Specimen Run */}
                  <div className="my-5 p-4 rounded-2xl bg-[#F7F4EB] border border-[#ECECEC] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] uppercase font-bold text-[#666666]">In-Flight Diagnostic Run</span>
                      <span className="text-[10px] font-mono bg-[#16A34A]/10 text-[#16A34A] px-2 py-0.5 rounded font-bold">DIGITALLY SEALED</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <h4 className="text-sm font-bold text-[#111111]">SMP-8812: Comprehensive Metabolic Panel</h4>
                        <p className="text-[11px] text-[#666666]">Ordering Physician: Dr. Amanda Ross (St. Jude)</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#0D9488]">Validated</span>
                    </div>
                  </div>

                  {/* Daily Operational Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">Today Orders</p>
                      <p className="text-base font-bold text-[#111111] mt-0.5">142 Panels</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">Turnaround</p>
                      <p className="text-base font-bold text-[#16A34A] mt-0.5">42 Mins</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">Verified</p>
                      <p className="text-base font-bold text-[#2563EB] mt-0.5">100%</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate('/clinical/login')}
                      className="py-2.5 px-3 rounded-xl border border-[#ECECEC] bg-white text-[#111111] text-xs font-bold hover:bg-[#F7F4EB] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Scan Specimen
                    </button>
                    <button
                      onClick={() => navigate('/clinical/login')}
                      className="py-2.5 px-3 rounded-xl bg-[#111111] text-white text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Dispatch Report
                    </button>
                  </div>

                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* LABORATORY CHALLENGES SECTION                                            */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#DC2626] bg-[#DC2626]/10 px-3 py-1 rounded-full border border-[#DC2626]/20">
                Diagnostic Challenges
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                Operational Friction in <span className="font-bold">Laboratory Testing</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                Modern pathology operations are often burdened by manual specimen custody, fragmented communication with ordering doctors, and paper-based result forgery risks.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {labChallenges.map((c, idx) => (
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
                        Critical Risk
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#111111] mb-2">{c.title}</h3>
                    <p className="text-xs sm:text-sm text-[#666666] leading-relaxed mb-4">{c.desc}</p>
                  </div>
                  <div className="pt-4 border-t border-[#F3F4F6] text-xs font-semibold text-[#888888] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-[#DC2626]" />
                    <span>Impact: {c.impact}</span>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SOLUTION MODULES: 9 CAPABILITY PILLARS                                    */}
        {/* ========================================================================= */}
        <section id="lab-solution-modules" className="py-24 bg-[#FFFFFF] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#0D9488] bg-[#0D9488]/10 px-3 py-1 rounded-full border border-[#0D9488]/20">
                Diagnostic Suite
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                Connected Infrastructure for <span className="font-bold">Modern Pathology Centers</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                Nine core capabilities bridging diagnostic analyzers, certified pathologists, attending clinicians, and sovereign patient records.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {labModules.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="p-6 sm:p-8 rounded-2xl bg-white border border-[#ECECEC] hover:border-[#CCCCCC] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
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

                      <h3 className="text-lg font-bold text-[#111111] mb-2 tracking-tight group-hover:text-[#0D9488] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#F3F4F6] flex items-center justify-between text-xs font-bold text-[#111111]">
                      <span className="text-[11px] text-[#888888] font-medium">Module #{idx + 1}</span>
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
        {/* LABORATORY WORKFLOW: 7 STAGES                                             */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full border border-[#2563EB]/20">
                Connected Diagnostic Lifecycle
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                The 7-Stage Diagnostic <span className="font-bold">Chain of Trust</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                Trace the automated lifecycle from clinical requisition to specimen processing, pathologist sign-off, and direct patient vault delivery.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {labWorkflow.map((lw, idx) => {
                const LwIcon = lw.icon;
                return (
                  <motion.div
                    key={lw.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.06 }}
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
                          <LwIcon className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-xl font-bold text-[#CCCCCC]">
                          {lw.step}
                        </span>
                      </div>

                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">
                        {lw.subtitle}
                      </p>
                      <h3 className="text-base font-bold text-[#111111] mb-2">
                        {lw.title}
                      </h3>
                      <p className="text-xs text-[#555555] leading-relaxed">
                        {lw.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F3F4F6] text-[10px] font-mono text-[#888888]">
                      Stage {idx + 1} of 7
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Specimen Trust Banner */}
            <div className="mt-12 p-6 rounded-2xl bg-[#F7F4EB] border border-[#ECECEC] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-[#0D9488]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111111]">Non-Repudiable Pathologist Seals</h4>
                  <p className="text-xs text-[#666666]">Every test report is stamped with cryptographic hashes ensuring result authenticity and zero third-party manipulation.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/clinical/register')}
                className="px-6 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors flex-shrink-0"
              >
                Register Laboratory Node
              </button>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECURITY & DATA PROTECTION                                               */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#111111] text-white border-b border-[#222222]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#0D9488] bg-[#0D9488]/10 px-3 py-1 rounded-full border border-[#0D9488]/20">
                Diagnostic Integrity Standards
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white mt-4 mb-6">
                Institutional Security for <br />
                <span className="font-bold text-[#0D9488]">Diagnostic Pathology Networks</span>
              </h2>
              <p className="text-base sm:text-lg text-[#A3A3A3] leading-relaxed">
                HealthChain applies defense-in-depth security protecting diagnostic reports against data manipulation and unauthorized interception.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D]">
                <Lock className="w-8 h-8 text-[#0D9488] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Payload Encryption</h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                  All diagnostic findings and radiology files are encrypted client-side using strong symmetric ciphers prior to transmission.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D]">
                <Shield className="w-8 h-8 text-[#0D9488] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Hashed Signatures</h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                  Pathologist digital signatures and SHA-256 verification hashes permanently seal results against retrospective tampering.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D]">
                <Eye className="w-8 h-8 text-[#0D9488] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Immutable Telemetry</h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                  Every specimen intake, test completion, doctor dispatch, and chart export is logged in a tamper-resistant audit registry.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL CALL TO ACTION (CTA)                                               */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#F7F4EB] relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0D9488]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111] bg-white px-4 py-1.5 rounded-full border border-[#ECECEC] shadow-sm">
              Laboratory Integration
            </span>

            <h2 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] mt-6 mb-6 leading-[1.1]">
              Connect Your Diagnostic Network to <br />
              <span className="font-bold">HealthChain Today</span>
            </h2>

            <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-xl mx-auto mb-10">
              Join leading pathology laboratories and diagnostic imaging centers using HealthChain for connected, tamper-proof medical diagnostics.
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center">
              <button
                type="button"
                onClick={() => navigate('/clinical/register')}
                className="px-9 py-4 rounded-xl bg-[#111111] text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-black hover:shadow-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <span>Connect Lab Node</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/clinical/login')}
                className="px-9 py-4 rounded-xl bg-white text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
              >
                Diagnostic Console Sign In
              </button>
            </div>

            <p className="mt-8 text-xs text-[#888888]">
              Standard REST APIs • JSON-LD compliant • Direct Hospital Relay
            </p>
          </div>
        </section>
      </main>

      {/* Universal Footer with Legal Modals & Newsletter */}
      <Footer />
    </div>
  );
}
