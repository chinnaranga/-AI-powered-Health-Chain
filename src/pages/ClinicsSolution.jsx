import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Stethoscope, Shield, Users, Calendar, Activity, FileSpreadsheet,
  Pill, FileCheck2, Share2, Eye, ArrowRight, CheckCircle2,
  Lock, Clock, Building, ChevronRight, Database, AlertCircle,
  Sparkles, RefreshCw, Send, MessageSquare
} from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function ClinicsSolution() {
  const navigate = useNavigate();
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  // 4 Core Outpatient Clinic Challenges
  const clinicChallenges = [
    {
      title: 'Administrative Charting Burden',
      desc: 'Small to mid-sized practices spend excessive hours on manual data entry and fragmented paper charts rather than active patient care.',
      impact: 'Physician burnout and delayed patient turnaround'
    },
    {
      title: 'Lost Historical Context',
      desc: 'Patients arrive with incomplete paper folders, missing recent hospital discharge summaries, prior prescriptions, and allergies.',
      impact: 'Suboptimal clinical decision-making'
    },
    {
      title: 'Manual Prescription & Refill Follow-ups',
      desc: 'Phone calls and paper slips for refills cause dispensing friction and create opportunities for dosing misunderstandings.',
      impact: 'Medication non-adherence and pharmacy delays'
    },
    {
      title: 'Delayed Diagnostic Reports',
      desc: 'Waiting for faxed or emailed lab results delays urgent interventions and increases unnecessary clinic visits.',
      impact: 'Treatment delays and patient anxiety'
    }
  ];

  // 7 Core Clinic Solution Modules
  const clinicModules = [
    {
      id: 'patient-management',
      icon: Users,
      title: 'Patient Management',
      badge: 'Outpatient Roster',
      desc: 'Comprehensive outpatient directory with instant patient lookup, chronic disease cohort tracking, and verified contact profiles.'
    },
    {
      id: 'appointments',
      icon: Calendar,
      title: 'Appointments',
      badge: 'Smart Scheduling',
      desc: 'Automated consultation slot management, SMS/app reminder notifications, queue estimation, and walk-in triage handling.'
    },
    {
      id: 'clinical-records',
      icon: FileSpreadsheet,
      title: 'Clinical Records',
      badge: 'Rapid SOAP Charting',
      desc: 'Intuitive SOAP clinical notes, vitals recording, ICD-10 diagnostic tagging, and complete longitudinal medical history visualization.'
    },
    {
      id: 'prescriptions',
      icon: Pill,
      title: 'Prescriptions',
      badge: 'Digital E-Rx',
      desc: 'Tamper-proof electronic prescription generator with contraindication warnings, dosage instructions, and direct pharmacy relay.'
    },
    {
      id: 'lab-reports',
      icon: Activity,
      title: 'Lab Reports',
      badge: 'Diagnostic Sync',
      desc: 'Seamless ingestion of signed diagnostic results from partner pathology centers with abnormal parameter highlight badges.'
    },
    {
      id: 'secure-sharing',
      icon: Share2,
      title: 'Secure Sharing',
      badge: 'Specialist Referrals',
      desc: 'One-click encrypted patient referrals to tertiary hospital networks and imaging centers with patient-authorized consent.'
    },
    {
      id: 'security-governance',
      icon: Shield,
      title: 'Security & Telemetry',
      badge: 'Zero-Trust Storage',
      desc: 'Client-side AES-GCM encryption, staff role-based access, and immutable audit logs recording every chart consultation.'
    }
  ];

  // 6-Step Clinic Operational Workflow
  const clinicWorkflow = [
    {
      step: '01',
      title: 'Patient Check-In',
      subtitle: 'Reception Triage',
      icon: Users,
      description: 'Patient arrives or checks in digitally using their Global Health ID, confirming demographics and presenting symptoms.'
    },
    {
      step: '02',
      title: 'Appointment Queue',
      subtitle: 'Schedule Coordination',
      icon: Calendar,
      description: 'The clinic management queue automatically updates estimated consultation times and alerts the attending clinician.'
    },
    {
      step: '03',
      title: 'Clinical Consultation',
      subtitle: 'Examination & Review',
      icon: Stethoscope,
      description: 'Doctor accesses authorized past medical records, examines the patient, and enters concise structured SOAP notes.'
    },
    {
      step: '04',
      title: 'Record Attestation',
      subtitle: 'Digital Signing',
      icon: FileCheck2,
      description: 'Consultation notes and standardized diagnostic codes are digitally stamped and saved to the patient health vault.'
    },
    {
      step: '05',
      title: 'Prescription Dispatch',
      subtitle: 'E-Rx Generation',
      icon: Pill,
      description: 'Tamper-proof digital prescription is generated and transmitted to the patient wallet and preferred dispensing pharmacy.'
    },
    {
      step: '06',
      title: 'Follow-up & Monitoring',
      subtitle: 'Continued Care',
      icon: Clock,
      description: 'Automated follow-up reminders and scheduled check-in dates keep patients engaged with their personalized care plan.'
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
              
              {/* Left Column: Messaging */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-7 flex flex-col items-start"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111]/5 border border-[#111111]/10 mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                    Outpatient Practice & Specialty Clinics
                  </span>
                </div>

                <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] leading-[1.08] mb-6">
                  Intelligent Practice OS for <br />
                  <span className="font-bold">Modern Outpatient Clinics</span>
                </h1>

                <p className="text-lg sm:text-xl text-[#666666] leading-relaxed max-w-2xl mb-10">
                  Streamline outpatient appointments, rapid SOAP charting, and digital prescriptions. Deliver connected, personalized care with zero-trust security and seamless hospital referral links.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-4 items-center">
                  <button
                    type="button"
                    onClick={() => navigate('/clinical/register')}
                    className="px-8 py-4 rounded-xl bg-[#111111] text-[#FFFFFF] font-sans text-xs font-bold uppercase tracking-widest hover:bg-[#000000] hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer"
                  >
                    <span>Register Clinic Node</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href="#clinic-features"
                    className="px-8 py-4 rounded-xl bg-transparent text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
                  >
                    Explore Features
                  </a>
                </div>

                {/* Highlights */}
                <div className="mt-12 pt-8 border-t border-[#ECECEC] flex flex-wrap gap-6 text-xs text-[#666666] font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
                    <span>Rapid SOAP Charting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
                    <span>Instant Digital E-Prescriptions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
                    <span>Automated Lab Ingestion</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Clinic Console Preview Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="lg:col-span-5 relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-[#14B8A6]/20 to-[#2563EB]/20 rounded-3xl blur-2xl opacity-60" />
                
                {/* Outpatient Console Shell */}
                <div className="relative bg-white rounded-3xl border border-[#ECECEC] shadow-2xl p-6 sm:p-8 overflow-hidden">
                  
                  {/* Top Bar: Clinic Identity */}
                  <div className="flex items-center justify-between pb-5 border-b border-[#F3F4F6]">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#14B8A6] text-white flex items-center justify-center font-bold text-sm">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-[#111111]">Harbor Family Care</h3>
                          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                        </div>
                        <p className="text-[11px] text-[#666666]">Ambulatory Node #CLN-882 • Online</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-[#14B8A6]/10 text-[#0F766E] rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Consultation Active
                    </span>
                  </div>

                  {/* Active Patient In-Room */}
                  <div className="my-5 p-4 rounded-2xl bg-[#F7F4EB] border border-[#ECECEC] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] uppercase font-bold text-[#666666]">Current Patient In-Room</span>
                      <span className="text-[10px] font-mono bg-[#16A34A]/10 text-[#16A34A] px-2 py-0.5 rounded font-bold">VERIFIED CONSENT</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <h4 className="text-sm font-bold text-[#111111]">James Wilson</h4>
                        <p className="text-[11px] text-[#666666]">Hypertension Routine Follow-up • BP 128/82</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#14B8A6]">Room 3</span>
                    </div>
                  </div>

                  {/* Daily Operational Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">Today Queue</p>
                      <p className="text-base font-bold text-[#111111] mt-0.5">18 Patients</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">Avg Wait</p>
                      <p className="text-base font-bold text-[#16A34A] mt-0.5">8 Mins</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEC]">
                      <p className="text-[10px] uppercase font-bold text-[#666666]">Rx Signed</p>
                      <p className="text-base font-bold text-[#2563EB] mt-0.5">12 Sent</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate('/clinical/login')}
                      className="py-2.5 px-3 rounded-xl border border-[#ECECEC] bg-white text-[#111111] text-xs font-bold hover:bg-[#F7F4EB] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" /> Next Patient
                    </button>
                    <button
                      onClick={() => navigate('/clinical/login')}
                      className="py-2.5 px-3 rounded-xl bg-[#111111] text-white text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Pill className="w-3.5 h-3.5" /> Write E-Rx
                    </button>
                  </div>

                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CLINIC CHALLENGES SECTION                                                */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#DC2626] bg-[#DC2626]/10 px-3 py-1 rounded-full border border-[#DC2626]/20">
                Practice Challenges
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                Operational Friction in <span className="font-bold">Ambulatory Care</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                Independent practices and outpatient clinics often struggle with fragmented software and cumbersome administration that detracts from doctor-patient time.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {clinicChallenges.map((c, idx) => (
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
                        Clinical Friction
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
        {/* HEALTHCHAIN CLINIC SOLUTION: 7 CORE MODULES                               */}
        {/* ========================================================================= */}
        <section id="clinic-features" className="py-24 bg-[#FFFFFF] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#14B8A6] bg-[#14B8A6]/10 px-3 py-1 rounded-full border border-[#14B8A6]/20">
                Clinic Solution Modules
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                Everything Your Clinic Needs in <span className="font-bold">One Connected Workspace</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                Purpose-built modules designed to reduce charting overhead, speed up consultations, and coordinate patient care seamlessly.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinicModules.map((item, idx) => {
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

                      <h3 className="text-lg font-bold text-[#111111] mb-2 tracking-tight group-hover:text-[#14B8A6] transition-colors">
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
        {/* CLINIC WORKFLOW: 6 STAGES                                                */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full border border-[#2563EB]/20">
                Care Pathway
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                The 6-Step Outpatient <span className="font-bold">Care Protocol</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                Trace the end-to-end patient lifecycle through check-in, consultation, digital prescription, and automated follow-up.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinicWorkflow.map((cw, idx) => {
                const CwIcon = cw.icon;
                return (
                  <motion.div
                    key={cw.step}
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
                          <CwIcon className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-xl font-bold text-[#CCCCCC]">
                          {cw.step}
                        </span>
                      </div>

                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">
                        {cw.subtitle}
                      </p>
                      <h3 className="text-base font-bold text-[#111111] mb-2">
                        {cw.title}
                      </h3>
                      <p className="text-xs text-[#555555] leading-relaxed">
                        {cw.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F3F4F6] text-[10px] font-mono text-[#888888]">
                      Step {idx + 1} of 6
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Quality Care Banner */}
            <div className="mt-12 p-6 rounded-2xl bg-[#F7F4EB] border border-[#ECECEC] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-[#14B8A6]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111111]">Verifiable Outpatient Care Records</h4>
                  <p className="text-xs text-[#666666]">Every clinical consultation and prescription is digitally signed to prevent medical fraud and ensure patient safety.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/clinical/register')}
                className="px-6 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors flex-shrink-0"
              >
                Register Clinic Account
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
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#14B8A6] bg-[#14B8A6]/10 px-3 py-1 rounded-full border border-[#14B8A6]/20">
                Clinic Security Standards
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white mt-4 mb-6">
                Institutional Security for <br />
                <span className="font-bold text-[#14B8A6]">Every Medical Practice</span>
              </h2>
              <p className="text-base sm:text-lg text-[#A3A3A3] leading-relaxed">
                Even small clinics receive enterprise-level encryption and access governance to keep medical files strictly confidential.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D]">
                <Lock className="w-8 h-8 text-[#14B8A6] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Zero Plaintext Storage</h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                  Patient notes and diagnostic files are encrypted client-side using strong symmetric ciphers prior to decentralized persistence.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D]">
                <Shield className="w-8 h-8 text-[#14B8A6] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Patient Consent Gates</h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                  Clinicians can only view medical files during active consultation windows granted directly by the patient.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D]">
                <Eye className="w-8 h-8 text-[#14B8A6] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Non-Repudiable Logs</h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                  Every prescription signed, lab reviewed, and record viewed is indelibly logged for complete institutional accountability.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL CALL TO ACTION (CTA)                                               */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#F7F4EB] relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#14B8A6]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111] bg-white px-4 py-1.5 rounded-full border border-[#ECECEC] shadow-sm">
              Practice Onboarding
            </span>

            <h2 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] mt-6 mb-6 leading-[1.1]">
              Equip Your Practice with <br />
              <span className="font-bold">Next-Generation Clinical OS</span>
            </h2>

            <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-xl mx-auto mb-10">
              Join forward-thinking outpatient clinics and multi-specialty practices using HealthChain for connected, efficient patient care.
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center">
              <button
                type="button"
                onClick={() => navigate('/clinical/register')}
                className="px-9 py-4 rounded-xl bg-[#111111] text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-black hover:shadow-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <span>Register Clinic</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/clinical/login')}
                className="px-9 py-4 rounded-xl bg-white text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
              >
                Clinic Sign In
              </button>
            </div>

            <p className="mt-8 text-xs text-[#888888]">
              Zero setup hardware • Works in any browser • Immediate deployment
            </p>
          </div>
        </section>
      </main>

      {/* Universal Footer with Legal Modals & Newsletter */}
      <Footer />
    </div>
  );
}
