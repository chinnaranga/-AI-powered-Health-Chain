import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, Shield, Users, Calendar, Activity, FileSpreadsheet,
  Share2, KeyRound, Eye, ArrowRight, CheckCircle2, Lock,
  Clock, Stethoscope, Layers, AlertCircle, FileCheck, Server,
  ChevronRight, Database, TrendingUp, Sparkles, FolderLock
} from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function HospitalsSolution() {
  const navigate = useNavigate();
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  // 4 Core Hospital Challenges
  const challenges = [
    {
      title: 'Fragmented Clinical Records',
      desc: 'Patient records remain trapped in disconnected departmental silos, forcing clinicians to make decisions without complete medical histories.',
      impact: 'Delayed diagnoses and repetitive tests'
    },
    {
      title: 'Consent & Privacy Overhead',
      desc: 'Manual paperwork and phone authorizations create operational bottlenecks during inter-facility referrals and emergency consultations.',
      impact: 'Administrative strain and compliance friction'
    },
    {
      title: 'Diagnostic Redundancy',
      desc: 'Hospitals frequently repeat expensive imaging and laboratory panels simply because external records cannot be securely verified or retrieved.',
      impact: 'Escalating healthcare expenses'
    },
    {
      title: 'Vulnerable Centralized Silos',
      desc: 'Single-point-of-failure databases create high-value targets for data breaches, ransomware disruptions, and unauthorized internal snooping.',
      impact: 'Severe institutional security risks'
    }
  ];

  // 10 Solution Capability Pillars
  const solutionCapabilities = [
    {
      id: 'patient-management',
      icon: Users,
      title: 'Patient Management',
      badge: 'Admission & Triage',
      desc: 'Manage inpatient and outpatient registries, triage queues, bed allocation, and demographic verifications with verified sovereign identifiers.'
    },
    {
      id: 'doctor-workflows',
      icon: Stethoscope,
      title: 'Doctor Workflows',
      badge: 'Clinical Charting',
      desc: 'Streamlined clinical consoles for attending physicians with longitudinal history views, SOAP charting, and departmental patient rosters.'
    },
    {
      id: 'appointment-coordination',
      icon: Calendar,
      title: 'Appointment Coordination',
      badge: 'Scheduling',
      desc: 'Centralized outpatient booking with estimated wait-time tracking, doctor availability sync, and automated specialty referral handoffs.'
    },
    {
      id: 'clinical-records',
      icon: FileSpreadsheet,
      title: 'Clinical Records',
      badge: 'EHR Persistence',
      desc: 'Immutable, structured medical records, operative summaries, and discharge documentation signed with verifiable digital signatures.'
    },
    {
      id: 'lab-connectivity',
      icon: Activity,
      title: 'Laboratory Connectivity',
      badge: 'LIS Integration',
      desc: 'Direct data exchange with in-house and external diagnostic labs with automated abnormal value alerts and DICOM imaging attachment sync.'
    },
    {
      id: 'secure-sharing',
      icon: Share2,
      title: 'Secure Data Sharing',
      badge: 'Inter-Facility Exchange',
      desc: 'Transfer encrypted patient files across hospital branches and external healthcare systems with cryptographic patient consent.'
    },
    {
      id: 'rbac',
      icon: KeyRound,
      title: 'Role-Based Access (RBAC)',
      badge: 'Governance',
      desc: 'Strict role segregation tailored for doctors, nursing supervisors, laboratory technicians, pharmacists, and hospital administrators.'
    },
    {
      id: 'audit-trails',
      icon: Eye,
      title: 'Audit Trails',
      badge: 'Compliance Telemetry',
      desc: 'Tamper-resistant access logs recording every chart lookup, diagnostic upload, record export, and doctor review with microsecond timestamps.'
    },
    {
      id: 'interoperability',
      icon: Server,
      title: 'Interoperability',
      badge: 'Open Standards',
      desc: 'Standardized REST and JSON-LD schema integrations designed to communicate seamlessly with modern and legacy enterprise health systems.'
    },
    {
      id: 'administrative-workflows',
      icon: Layers,
      title: 'Administrative Workflows',
      badge: 'Operations & ERP',
      desc: 'Comprehensive oversight for hospital administrators including ward occupancy metrics, claims verification, and operational reporting.'
    }
  ];

  // 5-Stage Hospital Operational Workflow
  const hospitalWorkflow = [
    {
      step: '01',
      title: 'Patient Intake & Triage',
      subtitle: 'Admissions Desk',
      icon: Users,
      description: 'Patient checks in at admissions using their Global Health ID. The triage coordinator verifies identity and assigns clinical priority.'
    },
    {
      step: '02',
      title: 'Consent-Backed Authorization',
      subtitle: 'Patient Approval',
      icon: KeyRound,
      description: 'The patient approves the hospital clinical encounter via app verification, generating scoped decryption keys for attending doctors.'
    },
    {
      step: '03',
      title: 'Diagnostic & Care Coordination',
      subtitle: 'Departmental Collaboration',
      icon: Stethoscope,
      description: 'Physicians review longitudinal history, order lab diagnostics, and collaborate with specialists across ward units in real time.'
    },
    {
      step: '04',
      title: 'Treatment & Record Signing',
      subtitle: 'Clinical Attestation',
      icon: FileCheck,
      description: 'Consultation notes, prescriptions, and lab findings are digitally signed by certified practitioners and added to the patient record.'
    },
    {
      step: '05',
      title: 'Discharge & Immutable Audit',
      subtitle: 'Complete Settlement',
      icon: Shield,
      description: 'Discharge summaries are sealed into the decentralized record, and a complete audit trail of all staff access events is archived.'
    }
  ];

  // Key Hospital Benefits
  const benefits = [
    {
      title: 'Eliminate Diagnostic Duplication',
      desc: 'Instant verification of recent laboratory panels and imaging from external clinics avoids unnecessary, costly repeat procedures.'
    },
    {
      title: 'Accelerate Emergency Triage',
      desc: 'Critical medical notes, allergy alerts, and blood type records become accessible in seconds when authorized during emergency encounters.'
    },
    {
      title: 'Zero-Trust Data Protection',
      desc: 'Defense-in-depth encryption and decentralized architecture protect hospital networks from catastrophic single-point data breaches.'
    },
    {
      title: 'Streamlined Regulatory Compliance',
      desc: 'Automated, non-repudiable audit trails simplify internal oversight and compliance audits with provable access logging.'
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
              
              {/* Left Column: Heading & Positioning */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-7 flex flex-col items-start"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111]/5 border border-[#111111]/10 mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                    Enterprise Health System Solutions
                  </span>
                </div>

                <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] leading-[1.08] mb-6">
                  Connected Hospital Operations.<br />
                  <span className="font-bold">Zero-Trust Clinical Security.</span>
                </h1>

                <p className="text-lg sm:text-xl text-[#666666] leading-relaxed max-w-2xl mb-10">
                  Unify outpatient triage, inpatient ward management, and diagnostic records across your healthcare system with patient-governed consent and immutable clinical auditability.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-4 items-center">
                  <button
                    type="button"
                    onClick={() => navigate('/hospital/register')}
                    className="px-8 py-4 rounded-xl bg-[#111111] text-[#FFFFFF] font-sans text-xs font-bold uppercase tracking-widest hover:bg-[#000000] hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer"
                  >
                    <span>Register Hospital</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href="#hospital-capabilities"
                    className="px-8 py-4 rounded-xl bg-transparent text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
                  >
                    Explore Capabilities
                  </a>
                </div>

                {/* Highlights */}
                <div className="mt-12 pt-8 border-t border-[#ECECEC] flex flex-wrap gap-6 text-xs text-[#666666] font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                    <span>Cross-Facility Synced Records</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                    <span>Granular Staff RBAC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                    <span>Tamper-Resistant Audit Logs</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Hospital Console Preview Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="lg:col-span-5 relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-[#2563EB]/20 to-[#14B8A6]/20 rounded-3xl blur-2xl opacity-60" />
                
                {/* Enterprise Console Shell */}
                <div className="relative bg-white rounded-3xl border border-[#ECECEC] shadow-2xl p-6 sm:p-8 overflow-hidden">
                  
                  {/* Hospital Identity Header */}
                  <div className="flex items-center justify-between pb-5 border-b border-[#F3F4F6]">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-[#111111]">Metropolitan Health System</h3>
                          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                        </div>
                        <p className="text-[11px] text-[#666666]">Enterprise Node #METRO-01 • Active</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-[#2563EB]/10 text-[#2563EB] rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Main Branch
                    </span>
                  </div>

                  {/* Ward & Triage Status Bar */}
                  <div className="grid grid-cols-3 gap-3 my-5">
                    <div className="p-3 rounded-xl bg-[#F7F4EB] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">Bed Occupancy</p>
                      <p className="text-base font-bold text-[#111111] mt-0.5">86% Active</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F7F4EB] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">OPD Queue</p>
                      <p className="text-base font-bold text-[#111111] mt-0.5">38 Patients</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F7F4EB] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">Active Staff</p>
                      <p className="text-base font-bold text-[#2563EB] mt-0.5">24 Clinicians</p>
                    </div>
                  </div>

                  {/* Real-Time Clinical Activity Log */}
                  <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#ECECEC] space-y-2.5 mb-5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] uppercase font-bold text-[#666666]">Recent Inter-Department Relay</span>
                      <span className="text-[10px] font-mono bg-[#16A34A]/10 text-[#16A34A] px-2 py-0.5 rounded font-bold">VERIFIED</span>
                    </div>
                    <div className="text-xs text-[#333333] space-y-1.5 pt-1">
                      <p className="flex items-center justify-between">
                        <span>Emergency Referral: Ward 4B ➔ ICU</span>
                        <span className="text-[10px] font-mono text-[#888888]">12s ago</span>
                      </p>
                      <p className="flex items-center justify-between text-[#666666]">
                        <span>Lab Diagnostic Release: Troponin T</span>
                        <span className="text-[10px] font-mono text-[#888888]">1m ago</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate('/hospital/login')}
                      className="py-2.5 px-3 rounded-xl border border-[#ECECEC] bg-white text-[#111111] text-xs font-bold hover:bg-[#F7F4EB] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" /> Staff Portal
                    </button>
                    <button
                      onClick={() => navigate('/HospitalERP')}
                      className="py-2.5 px-3 rounded-xl bg-[#111111] text-white text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" /> Open ERP
                    </button>
                  </div>

                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* HOSPITAL CHALLENGES SECTION                                              */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#DC2626] bg-[#DC2626]/10 px-3 py-1 rounded-full border border-[#DC2626]/20">
                Industry Bottlenecks
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                The Cost of <span className="font-bold">Fragmented Hospital Infrastructure</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                Modern healthcare systems face severe operational overhead caused by disconnected software, non-interoperable data silos, and complex patient consent procedures.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {challenges.map((c, idx) => (
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
                        Critical Challenge
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
        {/* HEALTHCHAIN SOLUTION: 10 ENTERPRISE CAPABILITIES                         */}
        {/* ========================================================================= */}
        <section id="hospital-capabilities" className="py-24 bg-[#FFFFFF] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full border border-[#2563EB]/20">
                HealthChain Solution
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                Enterprise Infrastructure Built for <span className="font-bold">Connected Hospitals</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                Ten specialized capability layers designed to connect clinical, diagnostic, and administrative hospital workflows securely.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solutionCapabilities.map((cap, idx) => {
                const CapIcon = cap.icon;
                return (
                  <motion.div
                    key={cap.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="p-6 sm:p-8 rounded-2xl bg-white border border-[#ECECEC] hover:border-[#CCCCCC] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[#F7F4EB] border border-[#ECECEC] flex items-center justify-center text-[#111111] group-hover:bg-[#111111] group-hover:text-white transition-colors duration-300">
                          <CapIcon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#555555] border border-[#ECECEC]">
                          {cap.badge}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#111111] mb-2 tracking-tight group-hover:text-[#2563EB] transition-colors">
                        {cap.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                        {cap.desc}
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
        {/* HOSPITAL WORKFLOW: 5 STAGES                                              */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full border border-[#2563EB]/20">
                End-to-End Hospital Pathway
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                The 5-Stage Connected <span className="font-bold">Care Protocol</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                From admissions desk intake to final discharge summary archiving, trace the seamless operational pathway of hospital encounters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {hospitalWorkflow.map((hw, idx) => {
                const HwIcon = hw.icon;
                return (
                  <motion.div
                    key={hw.step}
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
                          <HwIcon className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-xl font-bold text-[#CCCCCC]">
                          {hw.step}
                        </span>
                      </div>

                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">
                        {hw.subtitle}
                      </p>
                      <h3 className="text-base font-bold text-[#111111] mb-2">
                        {hw.title}
                      </h3>
                      <p className="text-xs text-[#555555] leading-relaxed">
                        {hw.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F3F4F6] text-[10px] font-mono text-[#888888]">
                      Phase {idx + 1} of 5
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECURITY ARCHITECTURE                                                    */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#111111] text-white border-b border-[#222222]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full border border-[#2563EB]/20">
                Institutional Security
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white mt-4 mb-6">
                Zero-Trust Data Protection for <br />
                <span className="font-bold text-[#2563EB]">Hospital Health Networks</span>
              </h2>
              <p className="text-base sm:text-lg text-[#A3A3A3] leading-relaxed">
                HealthChain applies defense-in-depth safeguards protecting medical files against unauthorized internal exposure and external data breaches.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D]">
                <Shield className="w-8 h-8 text-[#2563EB] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Role-Based Access Control</h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                  Clinicians, nursing staff, and billing personnel access only the minimum information required for their specific clinical role.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D]">
                <Lock className="w-8 h-8 text-[#2563EB] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Symmetric AES-GCM Encryption</h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                  All clinical documentation is encrypted client-side prior to decentralized persistence. No plaintext is exposed on storage nodes.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D]">
                <Eye className="w-8 h-8 text-[#2563EB] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Immutable Audit Telemetry</h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                  Every chart view, prescription modification, and diagnostic export is sealed into a tamper-evident audit record with exact timestamps.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* BENEFITS SECTION                                                         */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FFFFFF] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#16A34A] bg-[#16A34A]/10 px-3 py-1 rounded-full border border-[#16A34A]/20">
                Institutional Outcomes
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                Measurable Impact for <span className="font-bold">Healthcare Providers</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                Modernize hospital operations with verifiable clinical outcomes and significant operational efficiency.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((b, idx) => (
                <div key={b.title} className="p-8 rounded-2xl bg-[#FAFAFA] border border-[#ECECEC] flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-[#14B8A6]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#111111] mb-2">{b.title}</h3>
                    <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">{b.desc}</p>
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111] bg-white px-4 py-1.5 rounded-full border border-[#ECECEC] shadow-sm">
              Hospital Node Deployment
            </span>

            <h2 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] mt-6 mb-6 leading-[1.1]">
              Equip Your Hospital Network with <br />
              <span className="font-bold">Connected Clinical Trust</span>
            </h2>

            <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-xl mx-auto mb-10">
              Join leading hospital networks modernizing clinical triage, outpatient scheduling, and cross-facility electronic health records.
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center">
              <button
                type="button"
                onClick={() => navigate('/hospital/register')}
                className="px-9 py-4 rounded-xl bg-[#111111] text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-black hover:shadow-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <span>Register Hospital Node</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/HospitalERP')}
                className="px-9 py-4 rounded-xl bg-white text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
              >
                Experience Hospital ERP
              </button>
            </div>

            <p className="mt-8 text-xs text-[#888888]">
              Standard REST APIs • Granular RBAC • Full Auditability
            </p>
          </div>
        </section>
      </main>

      {/* Universal Footer with Legal Modals & Newsletter */}
      <Footer />
    </div>
  );
}
