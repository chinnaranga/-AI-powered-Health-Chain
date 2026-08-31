import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, FileText, Calendar, Pill, Activity, FolderLock, KeyRound,
  Share2, Bell, History, ArrowRight, CheckCircle2, Lock, UserCheck,
  Eye, FileCheck, ChevronRight, Smartphone, Sparkles, Database,
  Fingerprint, Clock, Server, ArrowDown, HelpCircle
} from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function PatientApp() {
  const navigate = useNavigate();
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  // 10 Comprehensive Patient App Features
  const features = [
    {
      id: 'phr',
      icon: Activity,
      title: 'Personal Health Records',
      badge: 'Core PHR',
      description: 'A unified, real-time dashboard of your vital signs, blood type, active allergies, emergency medical notes, and chronic conditions aggregated across every hospital you visit.'
    },
    {
      id: 'history',
      icon: History,
      title: 'Medical History',
      badge: 'Timeline',
      description: 'Comprehensive chronic disease documentation, past surgical records, immunization tracking, and family heredity history organized into an intuitive lifelong timeline.'
    },
    {
      id: 'appointments',
      icon: Calendar,
      title: 'Appointments',
      badge: 'Scheduling',
      description: 'Book and manage outpatient visits, view estimated hospital queue wait times, receive doctor preparation checklists, and sync consultation reminders directly to your calendar.'
    },
    {
      id: 'prescriptions',
      icon: Pill,
      title: 'Prescriptions',
      badge: 'Pharmacy',
      description: 'Access digital, tamper-proof e-prescriptions with detailed dosage timings, drug interaction alerts, pharmacy dispensing updates, and automated refill notifications.'
    },
    {
      id: 'lab-reports',
      icon: FileText,
      title: 'Lab Reports',
      badge: 'Diagnostics',
      description: 'Interactive viewer for blood chemistry panels, pathology diagnostics, DICOM imaging links, and pathology findings complete with reference ranges and trend comparisons.'
    },
    {
      id: 'secure-docs',
      icon: FolderLock,
      title: 'Secure Documents',
      badge: 'Encrypted Vault',
      description: 'Client-side encrypted vault for storing health insurance policies, hospital discharge summaries, specialist referral slips, and government identity cards.'
    },
    {
      id: 'consent',
      icon: KeyRound,
      title: 'Consent Management',
      badge: 'Sovereignty',
      description: 'Granular, time-bounded permission controls that allow you to approve, customize, or immediately revoke clinical access rights with cryptographic certainty.'
    },
    {
      id: 'provider-sharing',
      icon: Share2,
      title: 'Provider Sharing',
      badge: 'Instant Handshake',
      description: 'Generate temporary QR codes or one-time verification tokens to share specific records with new doctors, emergency personnel, or specialists in under two seconds.'
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notifications',
      badge: 'Live Alerts',
      description: 'Real-time alerts whenever a physician submits an access request, a laboratory uploads a diagnostic report, or your consent window is nearing expiration.'
    },
    {
      id: 'access-history',
      icon: Eye,
      title: 'Access History',
      badge: 'Transparency',
      description: 'A complete, immutable audit ledger detailing every doctor, clinic, and administrative system that viewed or exported your medical files, including exact timestamps.'
    }
  ];

  // Workflow steps
  const workflowSteps = [
    {
      step: '01',
      title: 'Patient',
      subtitle: 'Initiation & Identity',
      icon: Smartphone,
      description: 'The patient opens the HealthChain application on their device and initiates access using secure biometric or passkey authentication.'
    },
    {
      step: '02',
      title: 'Secure Identity',
      subtitle: 'Cryptographic Binding',
      icon: Fingerprint,
      description: 'A unique cryptographic keypair and Global Health ID securely verify the patient without exposing private credentials to third parties.'
    },
    {
      step: '03',
      title: 'Health Records',
      subtitle: 'Client-Side Decryption',
      icon: Database,
      description: 'Encrypted clinical records are retrieved from decentralized storage nodes and decrypted locally on the patient device.'
    },
    {
      step: '04',
      title: 'Consent',
      subtitle: 'Granular Permission',
      icon: KeyRound,
      description: 'The patient explicitly authorizes a specific doctor, defining the exact records shared and setting an automated expiration window.'
    },
    {
      step: '05',
      title: 'Authorized Provider',
      subtitle: 'Secure Handshake',
      icon: UserCheck,
      description: 'The verified doctor receives temporary decryption keys to review records inside their clinical workstation for consultation.'
    },
    {
      step: '06',
      title: 'Audit Trail',
      subtitle: 'Immutable Logging',
      icon: FileCheck,
      description: 'Every view, verification, and consultation timestamp is permanently recorded in the patient access log for full transparency.'
    }
  ];

  // Security pillars
  const securityPillars = [
    {
      title: 'Authentication',
      icon: Fingerprint,
      description: 'Multi-factor authentication with passkeys, cryptographic signatures, and biometric device bindings ensure only verified patients access their account.'
    },
    {
      title: 'Authorization',
      icon: Shield,
      description: 'Role-Based Access Control (RBAC) guarantees that clinical staff and hospitals only see information explicitly permitted by patient consent rules.'
    },
    {
      title: 'Encryption',
      icon: Lock,
      description: 'All records are protected by symmetric AES-GCM encryption before leaving your device. Data in transit and at rest remains unreadable ciphertext.'
    },
    {
      title: 'Controlled Sharing',
      icon: Share2,
      description: 'Share specific lab reports or prescriptions rather than your full history, with automated time-based revocation and single-session access tokens.'
    },
    {
      title: 'Access History',
      icon: History,
      description: 'Every interaction with your records generates an identifiable event log showing provider name, organization, department, and exact time of access.'
    },
    {
      title: 'Auditability',
      icon: FileCheck,
      description: 'Tamper-resistant audit trails provide non-repudiable evidence of all data exchanges, protecting patients against unauthorized file disclosures.'
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
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 border-b border-[#ECECEC] bg-gradient-to-b from-[#F7F4EB]/60 via-white to-white overflow-hidden">
          {/* Subtle grid background */}
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
                  <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                    HealthChain Patient Portal & Mobile Suite
                  </span>
                </div>

                <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] leading-[1.08] mb-6">
                  Your Health Records.<br />
                  <span className="font-bold">Your Control.</span>
                </h1>

                <p className="text-lg sm:text-xl text-[#666666] leading-relaxed max-w-2xl mb-10">
                  Securely access, manage, and share your healthcare records with the providers you trust. Experience sovereign health data management with patient-directed consent.
                </p>

                {/* Primary & Secondary CTAs */}
                <div className="flex flex-wrap gap-4 items-center">
                  <button
                    type="button"
                    onClick={() => navigate('/patient/register')}
                    className="px-8 py-4 rounded-xl bg-[#111111] text-[#FFFFFF] font-sans text-xs font-bold uppercase tracking-widest hover:bg-[#000000] hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href="#features-section"
                    className="px-8 py-4 rounded-xl bg-transparent text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
                  >
                    Explore Features
                  </a>
                </div>

                {/* Patient Benefit Badges */}
                <div className="mt-12 pt-8 border-t border-[#ECECEC] flex flex-wrap gap-6 text-xs text-[#666666] font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
                    <span>Zero Data Reselling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
                    <span>Instant Revocation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
                    <span>Cross-Hospital Sync</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Interactive Patient App Mockup Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="lg:col-span-5 relative"
              >
                {/* Floating ambient glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#14B8A6]/20 to-[#2563EB]/20 rounded-3xl blur-2xl opacity-60" />
                
                {/* App Device Preview Shell */}
                <div className="relative bg-white rounded-3xl border border-[#ECECEC] shadow-2xl p-6 sm:p-8 overflow-hidden">
                  
                  {/* Top Phone Status & Identity */}
                  <div className="flex items-center justify-between pb-6 border-b border-[#F3F4F6]">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#111111] flex items-center justify-center text-white font-bold text-sm">
                        JD
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-[#111111]">John Doe</h3>
                          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                        </div>
                        <p className="text-[11px] font-mono text-[#666666]">HCG-8829-4102</p>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 bg-[#14B8A6]/10 border border-[#14B8A6]/30 text-[#0F766E] rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Verified
                    </div>
                  </div>

                  {/* Quick Vitals Summary Grid */}
                  <div className="grid grid-cols-3 gap-3 my-6">
                    <div className="p-3 rounded-xl bg-[#F7F4EB] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">Blood Group</p>
                      <p className="text-base font-bold text-[#111111] mt-0.5">O+ Positive</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F7F4EB] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">Latest BP</p>
                      <p className="text-base font-bold text-[#111111] mt-0.5">120/80</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F7F4EB] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">Active Sync</p>
                      <p className="text-base font-bold text-[#14B8A6] mt-0.5">4 Records</p>
                    </div>
                  </div>

                  {/* Active Consent & Doctor Access Status */}
                  <div className="p-4 rounded-2xl bg-[#111111] text-white space-y-3 mb-6">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#A3A3A3] font-medium flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#14B8A6]" /> Active Clinical Session
                      </span>
                      <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-white">
                        Exp in 42m
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold">Dr. Sarah Jenkins</p>
                        <p className="text-[11px] text-[#A3A3A3]">Metro General • Cardiology</p>
                      </div>
                      <span className="px-3 py-1 bg-[#14B8A6] text-black font-bold text-[10px] rounded-lg uppercase tracking-wider">
                        Authorized
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate('/patient/login')}
                      className="py-2.5 px-3 rounded-xl border border-[#ECECEC] bg-white text-[#111111] text-xs font-bold hover:bg-[#F7F4EB] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Share Record
                    </button>
                    <button
                      onClick={() => navigate('/patient/login')}
                      className="py-2.5 px-3 rounded-xl bg-[#111111] text-white text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FolderLock className="w-3.5 h-3.5" /> View Vault
                    </button>
                  </div>

                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FEATURES SECTION: 10 COMPREHENSIVE CARDS                                 */}
        {/* ========================================================================= */}
        <section id="features-section" className="py-24 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            {/* Section Header */}
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#666666] bg-[#ECECEC] px-3 py-1 rounded-full">
                Comprehensive Patient Capabilities
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-6">
                Everything You Need for <span className="font-bold">Lifelong Health Care</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666] leading-relaxed">
                Explore the ten foundational modules designed to give you effortless visibility and rigorous protection over every facet of your electronic health record.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((item, index) => {
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
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#555555] border border-[#ECECEC]">
                          {item.badge}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-lg font-bold text-[#111111] mb-3 tracking-tight group-hover:text-[#2563EB] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Interactive Bottom Indicator */}
                    <div className="mt-6 pt-4 border-t border-[#F3F4F6] flex items-center justify-between text-xs font-bold text-[#111111]">
                      <span className="text-[11px] text-[#888888] font-medium">Feature #{index + 1}</span>
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
        {/* PATIENT WORKFLOW SECTION                                                  */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FFFFFF] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            {/* Section Heading */}
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full border border-[#2563EB]/20">
                End-to-End Care Architecture
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-6">
                How HealthChain <span className="font-bold">Protects Your Journey</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                From logging in to sharing records with a specialist, follow the six-stage secure workflow that keeps your health records private, accurate, and completely in your hands.
              </p>
            </div>

            {/* Visual Workflow Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
              {workflowSteps.map((ws, idx) => {
                const StepIcon = ws.icon;
                return (
                  <motion.div
                    key={ws.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                    onClick={() => setActiveWorkflowStep(idx)}
                    className={`relative p-8 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      activeWorkflowStep === idx
                        ? 'bg-[#F7F4EB] border-[#111111] shadow-lg'
                        : 'bg-white border-[#ECECEC] hover:border-[#BBBBBB]'
                    }`}
                  >
                    {/* Step Number & Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                        activeWorkflowStep === idx
                          ? 'bg-[#111111] text-white'
                          : 'bg-[#F3F4F6] text-[#111111]'
                      }`}>
                        <StepIcon className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-2xl font-bold text-[#CCCCCC]">
                        {ws.step}
                      </span>
                    </div>

                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#666666] mb-1">
                      {ws.subtitle}
                    </p>
                    <h3 className="text-xl font-bold text-[#111111] mb-3">
                      {ws.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
                      {ws.description}
                    </p>

                    {/* Step Progress Connector indicator */}
                    {idx < workflowSteps.length - 1 && (
                      <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                        <div className="w-6 h-6 rounded-full bg-white border border-[#ECECEC] flex items-center justify-center text-[#888888] shadow-sm">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Workflow Diagram Banner */}
            <div className="mt-12 p-6 rounded-2xl bg-[#F7F4EB] border border-[#ECECEC] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-[#14B8A6]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111111]">Cryptographic Non-Repudiation</h4>
                  <p className="text-xs text-[#666666]">Every step from authorization to consultation is cryptographically attested and auditable.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/patient/register')}
                className="px-6 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors flex-shrink-0"
              >
                Create Patient Account
              </button>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECURITY & DATA PROTECTION ARCHITECTURE                                  */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#111111] text-white border-b border-[#222222]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            {/* Header */}
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#14B8A6] bg-[#14B8A6]/10 px-3 py-1 rounded-full border border-[#14B8A6]/20">
                Security by Architecture
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white mt-4 mb-6">
                Privacy-First Engineering <br />
                <span className="font-bold text-[#14B8A6]">Built Into Every Layer</span>
              </h2>
              <p className="text-base sm:text-lg text-[#A3A3A3] leading-relaxed">
                HealthChain applies defense-in-depth security principles. Your personal health records are shielded through layered cryptographic verification, fine-grained permissions, and verifiable audit logging.
              </p>
            </div>

            {/* 6 Security Pillars Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityPillars.map((pillar, idx) => {
                const PillarIcon = pillar.icon;
                return (
                  <motion.div
                    key={pillar.title}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.06 }}
                    className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D] hover:border-[#444444] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#14B8A6] mb-6">
                        <PillarIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        {pillar.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-[11px] font-mono text-[#14B8A6]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Zero Plaintext Exposure</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL CALL TO ACTION (CTA)                                               */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#F7F4EB] relative overflow-hidden">
          {/* Decorative ambient ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#14B8A6]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111] bg-white px-4 py-1.5 rounded-full border border-[#ECECEC] shadow-sm">
              Sovereign Health Journey
            </span>

            <h2 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] mt-6 mb-6 leading-[1.1]">
              Take Control of Your <br />
              <span className="font-bold">Health Data Today</span>
            </h2>

            <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-xl mx-auto mb-10">
              Join patients who own, protect, and effortlessly share their health records across clinics, hospitals, and diagnostic labs.
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center">
              <button
                type="button"
                onClick={() => navigate('/patient/register')}
                className="px-9 py-4 rounded-xl bg-[#111111] text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-black hover:shadow-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/patient/login')}
                className="px-9 py-4 rounded-xl bg-white text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
              >
                Sign In to Portal
              </button>
            </div>

            <p className="mt-8 text-xs text-[#888888]">
              Free account creation • No hardware key needed • Immediate access
            </p>
          </div>
        </section>
      </main>

      {/* Universal Footer with Legal Modals & Newsletter */}
      <Footer />
    </div>
  );
}
