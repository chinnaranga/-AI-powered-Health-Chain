import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check, ArrowRight, Shield, HelpCircle, Users, Stethoscope,
  Building2, TestTube, Sparkles, Server, CheckCircle2, X,
  ChevronDown, PhoneCall, Mail, MessageSquare
} from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function Pricing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // 5 Transparent Tier Plans
  const plans = [
    {
      id: 'patient',
      name: 'Patient Wallet',
      tagline: 'Self-sovereign personal health vault',
      price: 'Free',
      priceDetail: 'Always free for individuals',
      badge: 'Individual Tier',
      ctaText: 'Create Patient Wallet',
      ctaRoute: '/patient-app',
      isPrimary: false,
      targetAudience: 'Individuals and families looking to store, own, and share their medical history with complete privacy.',
      features: [
        'Sovereign Global Health ID (ABHA)',
        'Encrypted longitudinal medical timeline',
        'Time-bound clinician consent controls',
        'Direct lab report and e-prescription vault',
        'Emergency access contact sharing',
        'Standard decentralized storage'
      ]
    },
    {
      id: 'clinic',
      name: 'Clinic Workspace',
      tagline: 'Outpatient practice & specialty doctors',
      price: 'Coming Soon',
      priceDetail: 'Transparent practitioner licensing',
      badge: 'Ambulatory Care',
      ctaText: 'Register Interest',
      ctaRoute: '/book-demo',
      isPrimary: false,
      targetAudience: 'Outpatient clinics, solo practitioners, and group practices seeking streamlined charting without paperwork overhead.',
      features: [
        'Everything in Patient Wallet',
        'Doctor outpatient queue manager',
        'Rapid SOAP clinical charting',
        'Tamper-proof digital e-prescriptions',
        'Direct pathology lab report sync',
        'Standard audit logging & telemetry'
      ]
    },
    {
      id: 'hospital',
      name: 'Hospital ERP',
      tagline: 'Tertiary medical centers & hospital networks',
      price: 'Contact Sales',
      priceDetail: 'Tailored for bed capacity & departments',
      badge: 'Institutional Core',
      ctaText: 'Request Hospital Demo',
      ctaRoute: '/book-demo',
      isPrimary: true,
      targetAudience: 'Hospitals, medical campuses, and emergency centers requiring multi-ward coordination and claims attestation.',
      features: [
        'Everything in Clinic Workspace',
        'Full Inpatient (IPD) & Outpatient (OPD) ERP',
        'Bed allocation & triage management',
        'Multi-department clinical staff rosters',
        'Insurance claims attestation support',
        'Dedicated gateway connector node'
      ]
    },
    {
      id: 'laboratory',
      name: 'Lab Gateway',
      tagline: 'Pathology & diagnostic imaging networks',
      price: 'Coming Soon',
      priceDetail: 'Volume-based diagnostic routing',
      badge: 'Diagnostic LIS',
      ctaText: 'Contact Lab Team',
      ctaRoute: '/book-demo',
      isPrimary: false,
      targetAudience: 'Clinical pathology laboratories, diagnostic imaging centers, and specimen courier networks.',
      features: [
        'Direct LIS auto-analyzer data bridges',
        'Hashed specimen barcode tracking',
        'Pathologist cryptographic digital signatures',
        'Real-time doctor critical panic alerts',
        'DICOM radiology report attachment sync',
        'Automated REST/JSON-LD export pipelines'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise Health System',
      tagline: 'National registries & multi-region health networks',
      price: 'Contact Sales',
      priceDetail: 'Custom infrastructure & dedicated validators',
      badge: 'Sovereign Enclave',
      ctaText: 'Schedule Architecture Review',
      ctaRoute: '/book-demo',
      isPrimary: false,
      targetAudience: 'National health networks, government healthcare initiatives, and enterprise health insurers.',
      features: [
        'Dedicated private validator node cluster',
        'Custom zero-knowledge consent policies',
        'On-premise or sovereign cloud hosting',
        'Enterprise SLA & 24/7 technical incident team',
        'Custom EHR & mainframe API bridges',
        'Comprehensive compliance audit assistance'
      ]
    }
  ];

  // Comprehensive Feature Comparison Matrix
  const comparisonCategories = [
    {
      category: 'Data Sovereignty & Encryption',
      items: [
        { name: 'Client-Side AES-GCM Encryption', patient: true, clinic: true, hospital: true, lab: true, enterprise: true },
        { name: 'Self-Sovereign Consent Revocation', patient: true, clinic: true, hospital: true, lab: true, enterprise: true },
        { name: 'Zero Plaintext Ledger Exposure', patient: true, clinic: true, hospital: true, lab: true, enterprise: true },
        { name: 'Custom Private Key Enclaves', patient: false, clinic: false, hospital: false, lab: false, enterprise: true }
      ]
    },
    {
      category: 'Clinical & Operational Workflows',
      items: [
        { name: 'Longitudinal Patient History', patient: true, clinic: true, hospital: true, lab: false, enterprise: true },
        { name: 'SOAP Notes & Diagnostic Coding', patient: false, clinic: true, hospital: true, lab: false, enterprise: true },
        { name: 'Digital E-Prescription Dispatch', patient: true, clinic: true, hospital: true, lab: false, enterprise: true },
        { name: 'Multi-Ward ERP & Bed Allocation', patient: false, clinic: false, hospital: true, lab: false, enterprise: true },
        { name: 'Pathology Analyzer Auto-Ingestion', patient: false, clinic: false, hospital: true, lab: true, enterprise: true }
      ]
    },
    {
      category: 'Integration & Node Infrastructure',
      items: [
        { name: 'Standard Web Application Access', patient: true, clinic: true, hospital: true, lab: true, enterprise: true },
        { name: 'Developer REST & JSON-LD APIs', patient: false, clinic: true, hospital: true, lab: true, enterprise: true },
        { name: 'Dedicated Gateway Connector Node', patient: false, clinic: false, hospital: true, lab: true, enterprise: true },
        { name: 'Private Blockchain Validator Cluster', patient: false, clinic: false, hospital: false, lab: false, enterprise: true }
      ]
    }
  ];

  // Frequently Asked Questions
  const faqs = [
    {
      q: 'Why is the Patient Wallet completely free?',
      a: 'We believe health data ownership is a fundamental human right. Individuals should never have to pay to view, store, or grant permission to their own medical records.'
    },
    {
      q: 'How does pricing work for hospitals and clinic networks?',
      a: 'Institutional pricing is based on connected bed capacity, number of clinical seats, and diagnostic API query volumes. We provide transparent enterprise licensing with zero hidden data lock-in fees.'
    },
    {
      q: 'Can HealthChain be deployed on our own hospital private cloud?',
      a: 'Yes. Enterprise Health System plans support dedicated sovereign cloud enclaves and hybrid on-premise deployments connected securely to the decentralized ledger.'
    },
    {
      q: 'Can an institution export all patient data if they choose to migrate?',
      a: 'Always. HealthChain adheres strictly to open standards (JSON-LD and standard FHIR-compatible schemas). Data can be exported in open structured formats at any time without proprietary penalties.'
    },
    {
      q: 'Do you offer custom API integrations for legacy hospital EHR software?',
      a: 'Yes. Our engineering team provides implementation support to bridge legacy HL7 and proprietary database mainframes with HealthChain REST gateways.'
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
          
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111]/5 border border-[#111111]/10 mb-6">
                <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                  Transparent Institutional Licensing
                </span>
              </div>

              <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] leading-[1.08] mb-6">
                Predictable Plans for <br />
                <span className="font-bold">Every Healthcare Stakeholder</span>
              </h1>

              <p className="text-lg sm:text-xl text-[#666666] leading-relaxed mb-8">
                Always free for individual patients. Scalable, modular licensing designed for outpatient clinics, diagnostic laboratories, and enterprise hospital systems.
              </p>

              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#555555] bg-white px-4 py-2 rounded-xl border border-[#ECECEC]">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>Zero Data Lock-In • Open Standard Data Export • Cryptographic Proofs</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5 TIER PRICING CARDS                                                      */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {plans.map((plan, idx) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-300 ${
                    plan.isPrimary
                      ? 'bg-[#111111] text-white border-[#111111] shadow-xl xl:-translate-y-2'
                      : 'bg-white text-[#111111] border-[#ECECEC] shadow-sm hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Top Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        plan.isPrimary
                          ? 'bg-white/10 text-white border border-white/10'
                          : 'bg-[#F7F4EB] text-[#666666] border border-[#ECECEC]'
                      }`}>
                        {plan.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                    <p className={`text-xs mb-6 ${plan.isPrimary ? 'text-white/70' : 'text-[#666666]'}`}>
                      {plan.tagline}
                    </p>

                    {/* Price Header */}
                    <div className="pb-6 mb-6 border-b border-inherit/20">
                      <div className="text-2xl font-bold font-sans">
                        {plan.price}
                      </div>
                      <p className={`text-[11px] mt-0.5 ${plan.isPrimary ? 'text-white/60' : 'text-[#888888]'}`}>
                        {plan.priceDetail}
                      </p>
                    </div>

                    {/* Target Audience */}
                    <div className="mb-6">
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${plan.isPrimary ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`}>
                        Target Persona
                      </p>
                      <p className={`text-xs leading-relaxed ${plan.isPrimary ? 'text-white/80' : 'text-[#555555]'}`}>
                        {plan.targetAudience}
                      </p>
                    </div>

                    {/* Inclusions */}
                    <div className="space-y-2.5 mb-8">
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${plan.isPrimary ? 'text-white/60' : 'text-[#888888]'}`}>
                        Key Capabilities
                      </p>
                      {plan.features.map((feat) => (
                        <div key={feat} className="flex items-start gap-2 text-xs leading-tight">
                          <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${plan.isPrimary ? 'text-[#34D399]' : 'text-[#16A34A]'}`} />
                          <span className={plan.isPrimary ? 'text-white/90' : 'text-[#444444]'}>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plan CTA */}
                  <Link
                    to={plan.ctaRoute}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center transition-all duration-200 block ${
                      plan.isPrimary
                        ? 'bg-white text-[#111111] hover:bg-slate-100'
                        : 'bg-[#111111] text-white hover:bg-black'
                    }`}
                  >
                    {plan.ctaText}
                  </Link>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* DETAILED FEATURE COMPARISON TABLE                                         */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FFFFFF] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full border border-[#2563EB]/20">
                Detailed Matrix
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                Plan Comparison & <span className="font-bold">Feature Breakdown</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                Compare technical capabilities, security scopes, and infrastructure components across all tiers.
              </p>
            </div>

            <div className="border border-[#ECECEC] rounded-3xl overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F7F4EB] border-b border-[#ECECEC] text-[#111111]">
                    <th className="p-5 font-bold uppercase tracking-wider w-1/3">Feature Category</th>
                    <th className="p-5 font-bold text-center">Patient</th>
                    <th className="p-5 font-bold text-center">Clinic</th>
                    <th className="p-5 font-bold text-center bg-[#111111] text-white">Hospital</th>
                    <th className="p-5 font-bold text-center">Laboratory</th>
                    <th className="p-5 font-bold text-center">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECECEC]">
                  {comparisonCategories.map((category) => (
                    <React.Fragment key={category.category}>
                      <tr className="bg-[#FAFAFA] font-bold text-[#111111]">
                        <td colSpan={6} className="p-4 uppercase tracking-wider text-[11px] text-[#2563EB]">
                          {category.category}
                        </td>
                      </tr>
                      {category.items.map((item) => (
                        <tr key={item.name} className="hover:bg-[#F7F4EB]/30 transition-colors">
                          <td className="p-4 font-medium text-[#333333]">{item.name}</td>
                          <td className="p-4 text-center">{item.patient ? <Check className="w-4 h-4 text-[#16A34A] mx-auto" /> : <X className="w-4 h-4 text-[#CCCCCC] mx-auto" />}</td>
                          <td className="p-4 text-center">{item.clinic ? <Check className="w-4 h-4 text-[#16A34A] mx-auto" /> : <X className="w-4 h-4 text-[#CCCCCC] mx-auto" />}</td>
                          <td className="p-4 text-center bg-[#111111]/5">{item.hospital ? <Check className="w-4 h-4 text-[#16A34A] mx-auto" /> : <X className="w-4 h-4 text-[#CCCCCC] mx-auto" />}</td>
                          <td className="p-4 text-center">{item.lab ? <Check className="w-4 h-4 text-[#16A34A] mx-auto" /> : <X className="w-4 h-4 text-[#CCCCCC] mx-auto" />}</td>
                          <td className="p-4 text-center">{item.enterprise ? <Check className="w-4 h-4 text-[#16A34A] mx-auto" /> : <X className="w-4 h-4 text-[#CCCCCC] mx-auto" />}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* FREQUENTLY ASKED QUESTIONS (FAQ)                                          */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111] bg-[#ECECEC] px-3 py-1 rounded-full">
                Frequently Asked Questions
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                Got Questions? <span className="font-bold">We Have Answers</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                Common inquiries regarding HealthChain licensing, data ownership, and enterprise deployment.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={faq.q}
                    className="p-6 rounded-2xl bg-white border border-[#ECECEC] shadow-sm transition-all duration-200"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#111111] cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-[#888888] transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pt-4 mt-4 border-t border-[#F3F4F6] text-xs sm:text-sm text-[#666666] leading-relaxed"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* ENTERPRISE CONSULTATION CTA                                               */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#F7F4EB] relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111] bg-white px-4 py-1.5 rounded-full border border-[#ECECEC] shadow-sm">
              Custom Deployments
            </span>

            <h2 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] mt-6 mb-6 leading-[1.1]">
              Need a Tailored <br />
              <span className="font-bold">Institutional Solution?</span>
            </h2>

            <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-xl mx-auto mb-10">
              Speak directly with our technical solutions team to discuss custom validator nodes, hospital EHR bridges, or regional health network deployments.
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center">
              <button
                type="button"
                onClick={() => navigate('/book-demo')}
                className="px-9 py-4 rounded-xl bg-[#111111] text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-black hover:shadow-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <span>Schedule Architecture Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/developers/documentation"
                className="px-9 py-4 rounded-xl bg-white text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
              >
                Review Technical Specs
              </Link>
            </div>

            <p className="mt-8 text-xs text-[#888888]">
              No lock-in contracts • Transparent migration pathways • Dedicated engineering support
            </p>
          </div>
        </section>
      </main>

      {/* Universal Footer with Legal Modals & Newsletter */}
      <Footer />
    </div>
  );
}
