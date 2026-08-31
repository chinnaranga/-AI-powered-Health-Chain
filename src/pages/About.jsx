import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, KeyRound, Database, Globe, Layers, Stethoscope,
  Building2, TestTube, Users, ArrowRight, CheckCircle2, Lock,
  FileCheck2, Server, Activity, Share2, Sparkles, Binary,
  Eye, HeartPulse, HeartHandshake, Compass, Cpu, Code2
} from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function About() {
  const navigate = useNavigate();

  // Core Platform Values
  const values = [
    {
      title: 'Patient Sovereignty',
      icon: KeyRound,
      desc: 'Patients must hold the sole authority to grant, scope, and revoke access to their personal medical records.'
    },
    {
      title: 'Cryptographic Integrity',
      icon: Shield,
      desc: 'We replace institutional trust with mathematical proof. Every medical record and diagnostic finding is sealed with tamper-proof cryptographic hashes.'
    },
    {
      title: 'Open Interoperability',
      icon: Globe,
      desc: 'Healthcare systems should communicate seamlessly using standard REST and JSON-LD schema without proprietary vendor lock-in.'
    },
    {
      title: 'Radical Transparency',
      icon: Eye,
      desc: 'Every chart lookup, prescription modification, and diagnostic export produces a non-repudiable, timestamped audit log.'
    }
  ];

  // Product Ecosystem Modules
  const ecosystem = [
    {
      name: 'Patient App',
      route: '/patient-app',
      icon: Users,
      desc: 'Sovereign health record wallet enabling patients to view medical histories and manage practitioner consent policies.'
    },
    {
      name: 'Doctor Portal',
      route: '/doctor-portal',
      icon: Stethoscope,
      desc: 'Streamlined clinical workspace for attending physicians with longitudinal patient histories, SOAP notes, and e-prescriptions.'
    },
    {
      name: 'Hospital ERP',
      route: '/HospitalERP',
      icon: Building2,
      desc: 'Enterprise inpatient/outpatient triage management, bed allocations, staff rosters, and cross-department collaboration.'
    },
    {
      name: 'Lab Gateway',
      route: '/lab-gateway',
      icon: TestTube,
      desc: 'Diagnostic data bridge connecting pathology analyzers, barcode specimen custody, and pathologist-signed test reports.'
    },
    {
      name: 'API Reference',
      route: '/developers/api',
      icon: Code2,
      desc: 'Standardized REST and JSON-LD developer endpoints for integrating third-party hospital systems and digital health tools.'
    },
    {
      name: 'Smart Contracts',
      route: '/developers/smart-contracts',
      icon: Server,
      desc: 'Solidity ledger architecture managing decentralized access control and immutable off-chain record hash references.'
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
                <HeartPulse className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                  About HealthChain
                </span>
              </div>

              <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] leading-[1.08] mb-6">
                Rebuilding Healthcare Data <br />
                <span className="font-bold">on Cryptographic Trust</span>
              </h1>

              <p className="text-lg sm:text-xl text-[#666666] leading-relaxed mb-10 max-w-3xl">
                HealthChain is an open decentralized infrastructure designed to eliminate data silos, restore patient data sovereignty, and enable secure, interoperable communication between hospitals, clinicians, and diagnostic laboratories.
              </p>

              <div className="flex flex-wrap gap-4 items-center">
                <button
                  type="button"
                  onClick={() => navigate('/patient-app')}
                  className="px-8 py-4 rounded-xl bg-[#111111] text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-black hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  to="/developers/documentation"
                  className="px-8 py-4 rounded-xl bg-transparent text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
                >
                  Read Documentation
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* MISSION & VISION                                                          */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FFFFFF] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Mission Card */}
              <div className="p-8 sm:p-10 rounded-3xl bg-[#F7F4EB] border border-[#ECECEC] flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#111111] text-white flex items-center justify-center mb-6">
                    <Compass className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB]">Our Mission</span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#111111] mt-2 mb-4">
                    Data Sovereignty for Every Patient
                  </h2>
                  <p className="text-sm text-[#555555] leading-relaxed">
                    To return full ownership of medical histories to patients through self-sovereign cryptographic keys, while providing healthcare professionals with instant, consent-governed access to verified clinical data at every point of care.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-[#EAE6D8] text-xs font-semibold text-[#888888]">
                  Zero Vendor Lock-In • Patient-Governed Consent
                </div>
              </div>

              {/* Vision Card */}
              <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#ECECEC] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#111111] text-white flex items-center justify-center mb-6">
                    <Globe className="w-6 h-6 text-[#14B8A6]" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#14B8A6]">Our Vision</span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#111111] mt-2 mb-4">
                    A Unified Global Healthcare Fabric
                  </h2>
                  <p className="text-sm text-[#555555] leading-relaxed">
                    A connected future where clinical records, diagnostic imaging, laboratory tests, and e-prescriptions move frictionlessly across disparate healthcare institutions without sacrificing patient privacy or data integrity.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-[#F3F4F6] text-xs font-semibold text-[#888888]">
                  Universal Semantic Interoperability • Zero Plaintext Exposure
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* INTEROPERABILITY & PATIENT DATA OWNERSHIP                                 */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full border border-[#2563EB]/20">
                  Open Healthcare Standards
                </span>
                <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111]">
                  Solving Healthcare <span className="font-bold">Data Fragmentation</span>
                </h2>
                <p className="text-base text-[#666666] leading-relaxed">
                  Traditional electronic health record (EHR) systems operate in isolated proprietary silos. When patients switch doctors or visit external specialists, critical medical histories, past surgical notes, and allergy alerts are frequently lost.
                </p>
                <p className="text-sm text-[#666666] leading-relaxed">
                  HealthChain resolves this with an open REST and JSON-LD schema layer that bridges hospital ERPs, independent outpatient clinics, diagnostic laboratories, and insurance portals under a single cryptographic trust protocol.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2.5 text-xs text-[#333333] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    <span>Eliminates redundant diagnostic laboratory and imaging tests</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#333333] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    <span>Enables instant consent-backed specialist referrals</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#333333] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    <span>Compatible with legacy and modern clinical infrastructures</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-6">
                <div className="p-8 rounded-3xl bg-white border border-[#ECECEC] shadow-sm space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F4EB] text-[#111111] flex items-center justify-center">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#111111]">Patient Data Ownership Principles</h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                    We believe that medical records belong exclusively to the patient. HealthChain implements self-sovereign identity where patients control access permissions:
                  </p>

                  <div className="space-y-3 text-xs text-[#555555]">
                    <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEC]">
                      <strong className="text-[#111111] block mb-0.5">Explicit Consent Gates</strong>
                      No clinician, insurer, or hospital can decrypt records without an active, time-bound consent grant.
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEC]">
                      <strong className="text-[#111111] block mb-0.5">Instant Access Revocation</strong>
                      Patients can revoke permissions at any time directly from their personal mobile application.
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEC]">
                      <strong className="text-[#111111] block mb-0.5">Continuous Access Telemetry</strong>
                      Patients can inspect every staff member and hospital node that has reviewed their chart.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECURE HEALTHCARE DATA & TECHNOLOGY VISION                                */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#111111] text-white border-b border-[#222222]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full border border-[#2563EB]/20">
                Technology Vision
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white mt-4 mb-6">
                Zero-Trust Architecture for <br />
                <span className="font-bold text-[#2563EB]">Medical Data Protection</span>
              </h2>
              <p className="text-base sm:text-lg text-[#A3A3A3] leading-relaxed">
                HealthChain pairs client-side symmetric encryption with decentralized storage and smart contract verification to safeguard healthcare information.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D]">
                <Lock className="w-8 h-8 text-[#2563EB] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Off-Chain Encrypted Storage</h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                  Raw health records are encrypted on client devices before storage on decentralized cloud nodes (Cloudflare R2/IPFS). Plaintext data is never written to public ledgers.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D]">
                <Binary className="w-8 h-8 text-[#2563EB] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Immutable SHA-256 Proofs</h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                  Cryptographic hashes and doctor digital signatures are committed to the Solidity ledger, creating an immutable mathematical proof against record tampering.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D]">
                <Shield className="w-8 h-8 text-[#2563EB] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Non-Repudiable Auditability</h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                  Every query, diagnostic upload, and prescription issuance generates an unalterable timestamped event log for regulatory compliance.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* PRODUCT ECOSYSTEM OVERVIEW                                                */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FFFFFF] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111] bg-[#ECECEC] px-3 py-1 rounded-full">
                Product Ecosystem
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                Unified Solutions for <span className="font-bold">Every Healthcare Stakeholder</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                Explore the modular suite of applications and interfaces powering the HealthChain network.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ecosystem.map((prod) => {
                const ProdIcon = prod.icon;
                return (
                  <Link
                    key={prod.name}
                    to={prod.route}
                    className="p-6 sm:p-8 rounded-2xl bg-white border border-[#ECECEC] hover:border-[#111111] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-[#F7F4EB] text-[#111111] group-hover:bg-[#111111] group-hover:text-white transition-colors flex items-center justify-center mb-6">
                        <ProdIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-[#111111] mb-2 group-hover:text-[#2563EB] transition-colors">
                        {prod.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                        {prod.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#F3F4F6] flex items-center justify-between text-xs font-bold text-[#111111]">
                      <span>Open Product</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* COMPANY VALUES                                                            */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111] bg-[#ECECEC] px-3 py-1 rounded-full">
                Core Principles
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                What Guides <span className="font-bold">Our Engineering</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                Four fundamental values shaping every smart contract, security protocol, and clinical user interface we build.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {values.map((v, idx) => {
                const VIcon = v.icon;
                return (
                  <div key={v.title} className="p-8 rounded-2xl bg-white border border-[#ECECEC] shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F7F4EB] text-[#111111] flex items-center justify-center flex-shrink-0">
                      <VIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#111111] mb-2">{v.title}</h3>
                      <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">{v.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL CALL TO ACTION (CTA)                                               */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#F7F4EB] relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111] bg-white px-4 py-1.5 rounded-full border border-[#ECECEC] shadow-sm">
              Get Started with HealthChain
            </span>

            <h2 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] mt-6 mb-6 leading-[1.1]">
              Experience Decentralized <br />
              <span className="font-bold">Healthcare Today</span>
            </h2>

            <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-xl mx-auto mb-10">
              Explore our developer documentation, interactive smart contracts, and clinical portals.
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center">
              <button
                type="button"
                onClick={() => navigate('/patient-app')}
                className="px-9 py-4 rounded-xl bg-[#111111] text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-black hover:shadow-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <span>Launch Patient App</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/developers/documentation"
                className="px-9 py-4 rounded-xl bg-white text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
              >
                Platform Docs
              </Link>
            </div>

            <p className="mt-8 text-xs text-[#888888]">
              Self-Sovereign Identity • Zero-Knowledge Consent • Off-Chain Encrypted Storage
            </p>
          </div>
        </section>
      </main>

      {/* Universal Footer with Legal Modals & Newsletter */}
      <Footer />
    </div>
  );
}
