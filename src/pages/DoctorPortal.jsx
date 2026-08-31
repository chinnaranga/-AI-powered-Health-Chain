import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Stethoscope, Shield, Users, Calendar, Activity, FileText,
  Pill, FileCheck2, Share2, History, ArrowRight, CheckCircle2,
  Lock, KeyRound, Search, UserCheck, ChevronRight, Eye,
  Building2, Sparkles, Database, FileSpreadsheet, Send, MessageSquare
} from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function DoctorPortal() {
  const navigate = useNavigate();
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  // 10 Detailed Doctor Portal Features
  const features = [
    {
      id: 'dashboard',
      icon: Stethoscope,
      title: 'Doctor Dashboard',
      badge: 'Command Center',
      description: 'An executive clinical cockpit displaying daily outpatient queues, pending emergency consultation requests, recent lab alerts, and assigned hospital wards at a glance.'
    },
    {
      id: 'patient-management',
      icon: Users,
      title: 'Patient Management',
      badge: 'Roster & Demographics',
      description: 'Unified patient registry linking outpatient visits, chronic care cohorts, demographic records, and insurance coverage with cross-hospital lookup capabilities.'
    },
    {
      id: 'appointments',
      icon: Calendar,
      title: 'Appointments',
      badge: 'Schedule & Roster',
      description: 'Intelligent scheduling with automated triage status, telemedicine video links, slot availability management, and emergency consultation overrides.'
    },
    {
      id: 'medical-history',
      icon: History,
      title: 'Medical History',
      badge: 'Longitudinal View',
      description: 'Instant visualization of chronic illness progression, previous surgical interventions, allergies, family heredity notes, and historical hospital admissions.'
    },
    {
      id: 'clinical-records',
      icon: FileText,
      title: 'Clinical Records',
      badge: 'Decentralized EHR',
      description: 'Structured SOAP consultation notes, clinical progress logs, vitals telemetry charts, and high-fidelity discharge summaries sealed with cryptographic signatures.'
    },
    {
      id: 'diagnoses',
      icon: Activity,
      title: 'Diagnoses & ICD-10',
      badge: 'Clinical Coding',
      description: 'Standardized diagnosis logging with integrated ICD-10 and SNOMED-CT clinical terminologies, chronic condition tags, and severity risk indicators.'
    },
    {
      id: 'prescriptions',
      icon: Pill,
      title: 'Prescriptions',
      badge: 'E-Rx & Dispensing',
      description: 'Tamper-proof digital prescription generator with dosage calculators, contraindication checks, and instant dispatch to certified hospital pharmacies.'
    },
    {
      id: 'lab-results',
      icon: FileSpreadsheet,
      title: 'Lab Results',
      badge: 'Diagnostics & DICOM',
      description: 'Real-time sync with hospital diagnostic laboratories, DICOM radiology viewer integration for CT/MRI scans, and abnormal value alert highlights.'
    },
    {
      id: 'patient-sharing',
      icon: Share2,
      title: 'Secure Patient Sharing',
      badge: 'Inter-Hospital Referral',
      description: 'Handoff and refer complex cases across department specialists and external hospitals with zero-knowledge consent verification.'
    },
    {
      id: 'audit-history',
      icon: Eye,
      title: 'Audit History',
      badge: 'Compliance & Telemetry',
      description: 'Immutable access record logging each physician consultation, record export, prescription update, and diagnostic view for total regulatory compliance.'
    }
  ];

  // 7-Step Doctor Workflow
  const workflowSteps = [
    {
      step: '01',
      title: 'Doctor Login',
      subtitle: 'Verified Authentication',
      icon: Lock,
      description: 'Doctor authenticates using multi-factor credentials and verified clinical practitioner credentials attached to their hospital department.'
    },
    {
      step: '02',
      title: 'Patient Search',
      subtitle: 'Global Lookup',
      icon: Search,
      description: 'Physician searches for the patient using their Global Health ID, phone number, or authorized hospital appointment registry entry.'
    },
    {
      step: '03',
      title: 'Patient Authorization',
      subtitle: 'Explicit Consent',
      icon: KeyRound,
      description: 'Patient receives an instant permission prompt or OTP verification on their mobile app to grant temporary clinical decryption rights.'
    },
    {
      step: '04',
      title: 'Medical History',
      subtitle: 'Longitudinal Review',
      icon: History,
      description: 'Doctor reviews past diagnoses, medications, surgical procedures, and cross-hospital consultation notes in a synthesized timeline.'
    },
    {
      step: '05',
      title: 'Clinical Assessment',
      subtitle: 'Examination & SOAP Notes',
      icon: Stethoscope,
      description: 'Physician conducts the clinical exam, records vitals, logs findings, and assigns standardized diagnostic codes.'
    },
    {
      step: '06',
      title: 'Prescription & Update',
      subtitle: 'Signed Electronic Record',
      icon: Pill,
      description: 'E-prescription and updated clinical notes are digitally signed by the doctor and securely committed to the decentralized health vault.'
    },
    {
      step: '07',
      title: 'Audit Trail',
      subtitle: 'Immutable Ledger',
      icon: FileCheck2,
      description: 'Every interaction, timestamp, and consultation detail is immutably logged to ensure patient transparency and legal accountability.'
    }
  ];

  // Security & Compliance Pillars
  const securityFeatures = [
    {
      title: 'Role-Based Access (RBAC)',
      icon: Shield,
      description: 'Physicians, nurse coordinators, and department heads receive scoped permissions based on their medical credentials and department assignments.'
    },
    {
      title: 'Verified Authentication',
      icon: Lock,
      description: 'Multi-factor authentication, cryptographic keypairs, and session management prevent unauthorized session takeovers on clinical devices.'
    },
    {
      title: 'Granular Authorization',
      icon: KeyRound,
      description: 'Doctors can only access specific records within active consultation windows, preventing unrestricted browsing of non-consented files.'
    },
    {
      title: 'Patient-Controlled Access',
      icon: UserCheck,
      description: 'Patients retain complete control with real-time approval prompts and instant revocation capabilities directly from their patient app.'
    },
    {
      title: 'Audit Logging',
      icon: History,
      description: 'Every search, file read, prescription dispatch, and export action generates a non-repudiable audit event with exact timestamps and workstation details.'
    },
    {
      title: 'Secure Communication',
      icon: MessageSquare,
      description: 'All intra-department referrals, doctor-to-doctor notes, and lab queries operate over end-to-end encrypted transport protocols.'
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
              
              {/* Left Column: Editorial Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-7 flex flex-col items-start"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111]/5 border border-[#111111]/10 mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                    HealthChain Clinician & Practitioner Suite
                  </span>
                </div>

                <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] leading-[1.08] mb-6">
                  Clinical Intelligence at <br />
                  <span className="font-bold">Every Point of Care</span>
                </h1>

                <p className="text-lg sm:text-xl text-[#666666] leading-relaxed max-w-2xl mb-10">
                  Give healthcare professionals secure access to the information they need to deliver connected patient care. Review longitudinal medical histories, sign prescriptions, and collaborate seamlessly across hospital networks.
                </p>

                {/* Primary & Secondary CTAs */}
                <div className="flex flex-wrap gap-4 items-center">
                  <button
                    type="button"
                    onClick={() => navigate('/doctor/dashboard')}
                    className="px-8 py-4 rounded-xl bg-[#111111] text-[#FFFFFF] font-sans text-xs font-bold uppercase tracking-widest hover:bg-[#000000] hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer"
                  >
                    <span>Explore Doctor Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href="#clinical-features"
                    className="px-8 py-4 rounded-xl bg-transparent text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
                  >
                    Explore Features
                  </a>
                </div>

                {/* Practitioner Trust Badges */}
                <div className="mt-12 pt-8 border-t border-[#ECECEC] flex flex-wrap gap-6 text-xs text-[#666666] font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                    <span>Instant Patient Consent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                    <span>Tamper-Proof E-Prescriptions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                    <span>DICOM Radiology Sync</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Interactive Clinical Workstation Preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="lg:col-span-5 relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-[#2563EB]/20 to-[#14B8A6]/20 rounded-3xl blur-2xl opacity-60" />
                
                {/* Clinical Workstation Shell */}
                <div className="relative bg-white rounded-3xl border border-[#ECECEC] shadow-2xl p-6 sm:p-8 overflow-hidden">
                  
                  {/* Doctor Profile Banner */}
                  <div className="flex items-center justify-between pb-6 border-b border-[#F3F4F6]">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-[#111111]">Dr. Alexander Vance</h3>
                          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                        </div>
                        <p className="text-[11px] text-[#666666]">Chief of Internal Medicine • NPI-91823</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-[#2563EB]/10 text-[#2563EB] rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Active
                    </span>
                  </div>

                  {/* Active Patient Encounter */}
                  <div className="my-5 p-4 rounded-2xl bg-[#F7F4EB] border border-[#ECECEC] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] uppercase font-bold text-[#666666]">Active Consultation</span>
                      <span className="text-[10px] font-mono bg-[#16A34A]/10 text-[#16A34A] px-2 py-0.5 rounded font-bold">CONSENT GRANTED</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <h4 className="text-sm font-bold text-[#111111]">Eleanor Martinez</h4>
                        <p className="text-[11px] text-[#666666]">42 yrs • HCG-7719-2041 • Type 2 Diabetes</p>
                      </div>
                      <button 
                        onClick={() => navigate('/doctor/dashboard')}
                        className="px-3 py-1.5 bg-[#111111] text-white text-xs font-bold rounded-lg hover:bg-black transition-colors"
                      >
                        Open Chart
                      </button>
                    </div>
                  </div>

                  {/* Key Stats Bar */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">Today Queue</p>
                      <p className="text-base font-bold text-[#111111] mt-0.5">14 Patients</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">Lab Alerts</p>
                      <p className="text-base font-bold text-[#DC2626] mt-0.5">2 Critical</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">E-Rx Sent</p>
                      <p className="text-base font-bold text-[#2563EB] mt-0.5">8 Signed</p>
                    </div>
                  </div>

                  {/* Quick Action Navigation */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate('/doctor/login')}
                      className="py-2.5 px-3 rounded-xl border border-[#ECECEC] bg-white text-[#111111] text-xs font-bold hover:bg-[#F7F4EB] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5" /> Search Patient
                    </button>
                    <button
                      onClick={() => navigate('/doctor/login')}
                      className="py-2.5 px-3 rounded-xl bg-[#111111] text-white text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Activity className="w-3.5 h-3.5" /> Doctor Login
                    </button>
                  </div>

                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FEATURES SECTION: 10 CLINICAL CARDS                                       */}
        {/* ========================================================================= */}
        <section id="clinical-features" className="py-24 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            {/* Section Header */}
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full border border-[#2563EB]/20">
                Clinician Platform Capabilities
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-6">
                Purpose-Built Tools for <span className="font-bold">Accurate Care Delivery</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666] leading-relaxed">
                Empower your practice with ten essential modules engineered to streamline consultations, minimize charting friction, and coordinate medical decisions securely.
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

                    {/* Bottom Indicator */}
                    <div className="mt-6 pt-4 border-t border-[#F3F4F6] flex items-center justify-between text-xs font-bold text-[#111111]">
                      <span className="text-[11px] text-[#888888] font-medium">Module #{index + 1}</span>
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
        {/* DOCTOR WORKFLOW SECTION (7 STEPS)                                         */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FFFFFF] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            {/* Section Heading */}
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#14B8A6] bg-[#14B8A6]/10 px-3 py-1 rounded-full border border-[#14B8A6]/20">
                Connected Clinical Workflow
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-6">
                From Login to Signed Record: <span className="font-bold">The 7-Step Protocol</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                Follow the standard clinical pathway designed to eliminate data fragmentation while safeguarding patient privacy at every consultation phase.
              </p>
            </div>

            {/* Workflow Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                      Step {idx + 1} of 7
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Workflow Certification Banner */}
            <div className="mt-12 p-6 rounded-2xl bg-[#F7F4EB] border border-[#ECECEC] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111111]">Non-Repudiable Clinical Attestation</h4>
                  <p className="text-xs text-[#666666]">Every diagnosis, electronic prescription, and consultation note is digitally stamped for medical veracity.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/doctor/register')}
                className="px-6 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors flex-shrink-0"
              >
                Register Practitioner Account
              </button>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECURITY & CLINICAL INTEGRITY ARCHITECTURE                                */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#111111] text-white border-b border-[#222222]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            {/* Section Header */}
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full border border-[#2563EB]/20">
                Institutional Security & Governance
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white mt-4 mb-6">
                Clinical Rigor Meets <br />
                <span className="font-bold text-[#2563EB]">Zero-Trust Architecture</span>
              </h2>
              <p className="text-base sm:text-lg text-[#A3A3A3] leading-relaxed">
                The Doctor Portal implements strict role segregation and cryptographic consent verification to ensure only authorized physicians access sensitive patient files.
              </p>
            </div>

            {/* Security Pillars Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityFeatures.map((sec, idx) => {
                const SecIcon = sec.icon;
                return (
                  <motion.div
                    key={sec.title}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.06 }}
                    className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D] hover:border-[#444444] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#2563EB] mb-6">
                        <SecIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        {sec.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                        {sec.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-[11px] font-mono text-[#2563EB]">
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111] bg-white px-4 py-1.5 rounded-full border border-[#ECECEC] shadow-sm">
              Practitioner Onboarding
            </span>

            <h2 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] mt-6 mb-6 leading-[1.1]">
              Connect Your <br />
              <span className="font-bold">Clinical Workflow</span>
            </h2>

            <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-xl mx-auto mb-10">
              Join leading physicians, outpatient clinics, and multi-specialty healthcare networks using HealthChain for connected patient care.
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center">
              <button
                type="button"
                onClick={() => navigate('/doctor/register')}
                className="px-9 py-4 rounded-xl bg-[#111111] text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-black hover:shadow-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/doctor/login')}
                className="px-9 py-4 rounded-xl bg-white text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
              >
                Practitioner Sign In
              </button>
            </div>

            <p className="mt-8 text-xs text-[#888888]">
              Instant credential validation • Cross-hospital compatible • NPI / Registry verified
            </p>
          </div>
        </section>
      </main>

      {/* Universal Footer with Legal Modals & Newsletter */}
      <Footer />
    </div>
  );
}
