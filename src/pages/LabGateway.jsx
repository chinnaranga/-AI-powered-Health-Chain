import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TestTube, Shield, Activity, FileSpreadsheet, Send, QrCode,
  CheckCircle2, Clock, Lock, Share2, Eye, Server, ChevronRight,
  ArrowRight, FileCheck, Layers, Sparkles, Building, Database,
  Cpu, AlertCircle, RefreshCw, BarChart3, Binary
} from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function LabGateway() {
  const navigate = useNavigate();
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  // 9 Core Lab Gateway Capability Modules
  const capabilities = [
    {
      id: 'lab-integration',
      icon: Server,
      title: 'Laboratory Integration',
      badge: 'Connectivity',
      status: 'Implemented',
      description: 'Standardized REST and JSON-LD data bridges connecting diagnostic laboratory information systems (LIS) directly to the HealthChain network.'
    },
    {
      id: 'test-orders',
      icon: FileSpreadsheet,
      title: 'Test Orders',
      badge: 'Order Entry',
      status: 'Implemented',
      description: 'Incoming electronic requisitions from hospitals and clinics with standardized test panels, clinical notes, and priority triage tags.'
    },
    {
      id: 'sample-tracking',
      icon: QrCode,
      title: 'Sample Tracking',
      badge: 'Specimen Custody',
      status: 'Implemented',
      description: 'Cryptographically hashed barcode identifiers tracking specimen collection, centrifuge processing, cold-chain transport, and lab receipt.'
    },
    {
      id: 'results-management',
      icon: Activity,
      title: 'Results Management',
      badge: 'Analyzer Feeds',
      status: 'Implemented',
      description: 'Structured parameter capture for hematology, biochemistry, and microbiology with automated reference-range flagging and delta checks.'
    },
    {
      id: 'lab-reports',
      icon: FileCheck,
      title: 'Lab Reports',
      badge: 'Sealed Outputs',
      status: 'Implemented',
      description: 'Generation of tamper-evident diagnostic PDFs and structured JSON payloads sealed with the laboratory pathologist digital signature.'
    },
    {
      id: 'provider-communication',
      icon: Send,
      title: 'Provider Communication',
      badge: 'Clinical Relay',
      status: 'Implemented',
      description: 'Instant notification dispatched to ordering physicians when critical values are detected or finalized test panels are ready for review.'
    },
    {
      id: 'patient-association',
      icon: Share2,
      title: 'Patient Record Association',
      badge: 'EHR Binding',
      status: 'Implemented',
      description: 'Automatic, encrypted binding of verified lab findings directly to the patient sovereign Health ID and decentralized timeline.'
    },
    {
      id: 'secure-transmission',
      icon: Lock,
      title: 'Secure Transmission',
      badge: 'Payload Security',
      status: 'Implemented',
      description: 'End-to-end AES-GCM payload encryption ensuring test results remain confidential across distributed storage nodes and transport gateways.'
    },
    {
      id: 'audit-logging',
      icon: Eye,
      title: 'Audit Logging',
      badge: 'Traceability',
      status: 'Implemented',
      description: 'Permanent timestamped ledger logging every diagnostic upload, signature verification, clinical view, and specimen status update.'
    }
  ];

  // 6-Stage Laboratory Workflow
  const workflowSteps = [
    {
      step: '01',
      title: 'Test Order',
      subtitle: 'Electronic Requisition',
      icon: FileSpreadsheet,
      description: 'Physician submits an electronic lab requisition with specific diagnostic panels, patient identifier, and clinical context.'
    },
    {
      step: '02',
      title: 'Sample Collection',
      subtitle: 'Specimen Barcoding',
      icon: QrCode,
      description: 'Phlebotomist or lab technician draws the specimen, generating a unique hashed barcode tracking chain-of-custody.'
    },
    {
      step: '03',
      title: 'Laboratory Processing',
      subtitle: 'Analyzer Execution',
      icon: TestTube,
      description: 'Specimen is processed through clinical analyzers, measuring biological parameters against calibrated reference ranges.'
    },
    {
      step: '04',
      title: 'Result Validation',
      subtitle: 'Pathologist Sign-off',
      icon: FileCheck,
      description: 'Certified pathologist reviews parameters, checks abnormal flags, and applies a cryptographic digital signature.'
    },
    {
      step: '05',
      title: 'Secure Delivery',
      subtitle: 'Encrypted Relay',
      icon: Lock,
      description: 'Finalized report is encrypted client-side and dispatched via secure gateway to the ordering hospital and patient vault.'
    },
    {
      step: '06',
      title: 'Patient Record',
      subtitle: 'Decentralized Sync',
      icon: Database,
      description: 'Diagnostic findings are permanently bound to the patient sovereign record with verifiable hash integrity.'
    }
  ];

  // Functional Status Breakdown
  const featureRoadmap = [
    {
      category: 'Diagnostic Processing',
      items: [
        { name: 'Standard Blood & Urine Chemistry Panels', status: 'Live', note: 'Standardized automated reference checks' },
        { name: 'Pathologist Cryptographic Signatures', status: 'Live', note: 'SHA-256 sealed digital signatures' },
        { name: 'Critical Panic-Value SMS/Push Alerts', status: 'Live', note: 'Instant notification to attending doctors' },
        { name: 'Automated Genomic Pipeline Interop', status: 'Planned', note: 'FastQ & VCF variant analysis gateway' }
      ]
    },
    {
      category: 'Interoperability & Network',
      items: [
        { name: 'REST & JSON-LD Diagnostic APIs', status: 'Live', note: 'Standardized data exchange schema' },
        { name: 'Decentralized R2 / IPFS Encrypted Storage', status: 'Live', note: 'Encrypted payload persistence' },
        { name: 'HL7 v2.x Legacy Socket Relay', status: 'Planned', note: 'Direct bridging for older LIS mainframes' },
        { name: 'Automated AI Reference Range Synthesizer', status: 'Planned', note: 'Age & demographic anomaly scoring' }
      ]
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
              
              {/* Left Column: Editorial Messaging */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-7 flex flex-col items-start"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111]/5 border border-[#111111]/10 mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                    HealthChain Diagnostic & Lab Interoperability
                  </span>
                </div>

                <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] leading-[1.08] mb-6">
                  Connected Diagnostics.<br />
                  <span className="font-bold">Cryptographically Verified.</span>
                </h1>

                <p className="text-lg sm:text-xl text-[#666666] leading-relaxed max-w-2xl mb-10">
                  Bridge clinical testing facilities with hospitals and patients. Deliver encrypted test orders, verify specimen chain-of-custody, and commit signed lab reports directly into patient-governed health records.
                </p>

                {/* Primary & Secondary CTAs */}
                <div className="flex flex-wrap gap-4 items-center">
                  <button
                    type="button"
                    onClick={() => navigate('/clinical/dashboard')}
                    className="px-8 py-4 rounded-xl bg-[#111111] text-[#FFFFFF] font-sans text-xs font-bold uppercase tracking-widest hover:bg-[#000000] hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer"
                  >
                    <span>Launch Lab Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href="#lab-modules"
                    className="px-8 py-4 rounded-xl bg-transparent text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
                  >
                    Explore Capabilities
                  </a>
                </div>

                {/* Diagnostic Badges */}
                <div className="mt-12 pt-8 border-t border-[#ECECEC] flex flex-wrap gap-6 text-xs text-[#666666] font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
                    <span>Sealed Digital Signatures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
                    <span>Hashed Specimen Custody</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
                    <span>Real-Time Doctor Relay</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Interactive Diagnostic Lab Gateway Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="lg:col-span-5 relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-[#0D9488]/20 to-[#2563EB]/20 rounded-3xl blur-2xl opacity-60" />
                
                {/* Laboratory Gateway Shell */}
                <div className="relative bg-white rounded-3xl border border-[#ECECEC] shadow-2xl p-6 sm:p-8 overflow-hidden">
                  
                  {/* Top Bar: Lab Gateway Node */}
                  <div className="flex items-center justify-between pb-5 border-b border-[#F3F4F6]">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#0D9488] text-white flex items-center justify-center font-bold text-sm">
                        <TestTube className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-[#111111]">Apex Clinical Pathology</h3>
                          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                        </div>
                        <p className="text-[11px] text-[#666666]">Gateway Node #APX-401 • Online</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-[#0D9488]/10 text-[#0F766E] rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Verified LIS
                    </span>
                  </div>

                  {/* Active Specimen Feed */}
                  <div className="my-5 p-4 rounded-2xl bg-[#F7F4EB] border border-[#ECECEC] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] uppercase font-bold text-[#666666]">Live Sample Analysis</span>
                      <span className="text-[10px] font-mono bg-[#16A34A]/10 text-[#16A34A] px-2 py-0.5 rounded font-bold">SHA-256 SIGNED</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <h4 className="text-sm font-bold text-[#111111]">SMP-9022: Cardiac Biomarker Panel</h4>
                        <p className="text-[11px] text-[#666666]">Patient: Eleanor Martinez (HCG-7719)</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#0D9488]">Completed</span>
                    </div>
                  </div>

                  {/* Key Operational Metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">Pending Runs</p>
                      <p className="text-base font-bold text-[#111111] mt-0.5">8 Samples</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">Turnaround</p>
                      <p className="text-base font-bold text-[#16A34A] mt-0.5">38 Mins</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">Sync State</p>
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
        {/* CAPABILITIES: 9 CORE LABORATORY MODULES                                  */}
        {/* ========================================================================= */}
        <section id="lab-modules" className="py-24 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            {/* Header */}
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#0D9488] bg-[#0D9488]/10 px-3 py-1 rounded-full border border-[#0D9488]/20">
                Diagnostic Capabilities
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-6">
                End-to-End Tools for <span className="font-bold">Modern Pathology Laboratories</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666] leading-relaxed">
                Connect electronic sample intake, analyzer data aggregation, digital report signing, and patient record linking into one unified gateway.
              </p>
            </div>

            {/* 9 Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capabilities.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white rounded-2xl p-6 sm:p-8 border border-[#ECECEC] hover:border-[#CCCCCC] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top icon and badge */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[#F7F4EB] border border-[#ECECEC] flex items-center justify-center text-[#111111] group-hover:bg-[#111111] group-hover:text-white transition-colors duration-300">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#555555] border border-[#ECECEC]">
                            {item.badge}
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-lg font-bold text-[#111111] mb-3 tracking-tight group-hover:text-[#0D9488] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Bottom Indicator */}
                    <div className="mt-6 pt-4 border-t border-[#F3F4F6] flex items-center justify-between text-xs font-bold text-[#111111]">
                      <span className="text-[11px] text-[#16A34A] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {item.status}
                      </span>
                      <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span className="text-xs">Learn more</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#666666]" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* LABORATORY WORKFLOW (6 STEPS)                                             */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FFFFFF] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            {/* Heading */}
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full border border-[#2563EB]/20">
                Connected Diagnostic Protocol
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-6">
                From Order to Patient Record: <span className="font-bold">The 6-Step Workflow</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                Trace the automated lifecycle of diagnostic test orders as they move from clinical requisition to encrypted, sealed patient records.
              </p>
            </div>

            {/* Workflow Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflowSteps.map((ws, idx) => {
                const StepIcon = ws.icon;
                return (
                  <motion.div
                    key={ws.step}
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
                          <StepIcon className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-xl font-bold text-[#CCCCCC]">
                          {ws.step}
                        </span>
                      </div>

                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">
                        {ws.subtitle}
                      </p>
                      <h3 className="text-base font-bold text-[#111111] mb-2">
                        {ws.title}
                      </h3>
                      <p className="text-xs text-[#555555] leading-relaxed">
                        {ws.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F3F4F6] text-[10px] font-mono text-[#888888]">
                      Stage {idx + 1} of 6
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Verification Banner */}
            <div className="mt-12 p-6 rounded-2xl bg-[#F7F4EB] border border-[#ECECEC] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-[#0D9488]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111111]">Cryptographic Specimen Chain-of-Custody</h4>
                  <p className="text-xs text-[#666666]">Every test run is sealed with SHA-256 hashes to guarantee sample authenticity and prevent data tampering.</p>
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
        {/* IMPLEMENTATION STATUS MATRIX                                              */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111] bg-[#ECECEC] px-3 py-1 rounded-full">
                Engineering Transparency
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                Implemented vs. <span className="font-bold">Planned Capabilities</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                Clear operational transparency distinguishing live production capabilities from our upcoming integration roadmap.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {featureRoadmap.map((category) => (
                <div key={category.category} className="p-8 rounded-2xl bg-white border border-[#ECECEC] shadow-sm">
                  <h3 className="text-lg font-bold text-[#111111] mb-6 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#0D9488]" />
                    {category.category}
                  </h3>
                  <div className="space-y-4">
                    {category.items.map((item) => (
                      <div key={item.name} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-[#FAFAFA] border border-[#F3F4F6]">
                        <div>
                          <p className="text-xs font-bold text-[#111111]">{item.name}</p>
                          <p className="text-[11px] text-[#666666] mt-0.5">{item.note}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'Live'
                            ? 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20'
                            : 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
              Connect Your Diagnostic Facility to <br />
              <span className="font-bold">HealthChain Today</span>
            </h2>

            <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-xl mx-auto mb-10">
              Streamline electronic test requisitions, dispatch tamper-proof reports, and link patient records directly with verified clinical trust.
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
              Standard REST APIs • JSON-LD compliant • End-to-end encrypted payloads
            </p>
          </div>
        </section>
      </main>

      {/* Universal Footer with Legal Modals & Newsletter */}
      <Footer />
    </div>
  );
}
