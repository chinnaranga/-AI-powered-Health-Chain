import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Shield, AlertTriangle, CheckCircle2, Lock,
  Building2, ArrowRight, Server, KeyRound, AlertCircle, HelpCircle
} from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] font-sans selection:bg-[#E8F0FE] selection:text-[#2563EB] scroll-smooth">
      {/* Universal Navigation Header */}
      <Header />

      <main>
        {/* ========================================================================= */}
        {/* HERO SECTION                                                             */}
        {/* ========================================================================= */}
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 border-b border-[#ECECEC] bg-gradient-to-b from-[#F7F4EB]/70 via-white to-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111]/5 border border-[#111111]/10 mb-6">
                <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                  Legal Agreement & Terms
                </span>
              </div>

              <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] leading-[1.08] mb-6">
                Terms of <span className="font-bold">Service</span>
              </h1>

              <p className="text-base sm:text-lg text-[#666666] leading-relaxed mb-6">
                Last Updated: June 2026 • Effective Date: June 2026
              </p>

              {/* Mandatory Legal Draft Review Banner */}
              <div className="p-5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-xs sm:text-sm text-[#92400E] flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-[#B45309]">DRAFT NOTICE:</strong> This document represents a standard architectural terms template and should be reviewed by qualified legal counsel before production use.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* TERMS CONTENT                                                             */}
        {/* ========================================================================= */}
        <section className="py-16 bg-[#FFFFFF] border-b border-[#ECECEC]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-12 text-sm text-[#444444] leading-relaxed">
            
            {/* 1. Acceptance of Terms */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#F7F4EB] text-[#111111] text-xs flex items-center justify-center font-bold">1</span>
                Acceptance of Terms
              </h2>
              <p>
                By accessing, registering for, or using the HealthChain decentralized health application, APIs, smart contracts, or clinician portals, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must discontinue use of the platform immediately.
              </p>
            </div>

            {/* 2. Account Responsibilities */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#F7F4EB] text-[#111111] text-xs flex items-center justify-center font-bold">2</span>
                Account & Credential Responsibilities
              </h2>
              <p>
                Users are responsible for maintaining the confidentiality of their authentication credentials, multi-factor keys, and Web3 cryptographic private keys. HealthChain operates on self-sovereign cryptographic principles: we cannot recover lost private keys or override smart contract signatures on your behalf.
              </p>
            </div>

            {/* 3. Acceptable Use */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#F7F4EB] text-[#111111] text-xs flex items-center justify-center font-bold">3</span>
                Acceptable Use Policy
              </h2>
              <p>
                You agree not to use HealthChain to:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-[#555555]">
                <li>Upload fraudulent, falsified, or forged medical certifications, prescriptions, or laboratory results.</li>
                <li>Attempt to bypass patient consent gates, smart contract permissions, or client-side encryption layers.</li>
                <li>Conduct automated scraping, denial-of-service (DoS) attacks, or malicious traffic floods against network nodes.</li>
                <li>Impersonate licensed healthcare practitioners or medical institutions.</li>
              </ul>
            </div>

            {/* 4. Healthcare Disclaimer */}
            <div className="p-6 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] space-y-3 text-[#92400E]">
              <h3 className="text-base font-bold text-[#B45309] flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#D97706]" />
                4. Medical Advice & Healthcare Disclaimer
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong>HEALTHCHAIN IS A SOFTWARE INFRASTRUCTURE PLATFORM, NOT A LICENSED MEDICAL PRACTITIONER OR HEALTHCARE PROVIDER.</strong>
              </p>
              <p className="text-xs leading-relaxed text-[#78350F]">
                The platform provides cryptographic storage, access management, and data routing between patients and certified healthcare providers. HealthChain does not diagnose, treat, or provide emergency medical services. In the event of a medical emergency, immediately contact your local emergency services or visit the nearest hospital emergency room.
              </p>
            </div>

            {/* 5. Service Availability */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#F7F4EB] text-[#111111] text-xs flex items-center justify-center font-bold">5</span>
                Service Availability & Decentralized Consensus
              </h2>
              <p>
                While HealthChain is architected for high availability across decentralized cloud nodes and blockchain ledgers, we do not guarantee uninterrupted or error-free operation. Periodic network maintenance, blockchain consensus delays, or third-party cloud outages may occasionally affect service responsiveness.
              </p>
            </div>

            {/* 6. User Responsibilities */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#F7F4EB] text-[#111111] text-xs flex items-center justify-center font-bold">6</span>
                User & Practitioner Responsibilities
              </h2>
              <p>
                Practitioners and hospital nodes warrant that all clinical information, diagnoses, and prescriptions entered into the system are accurate, professional, and compliant with applicable medical regulations.
              </p>
            </div>

            {/* 7. Data Responsibilities */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#F7F4EB] text-[#111111] text-xs flex items-center justify-center font-bold">7</span>
                Data Ownership & Encryption Integrity
              </h2>
              <p>
                Patients retain sovereign ownership of their personal medical documentation. By uploading records, you grant HealthChain the technical right to store, replicate in encrypted ciphertext, and route such data exclusively in accordance with your explicit consent authorizations.
              </p>
            </div>

            {/* 8. Intellectual Property */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#F7F4EB] text-[#111111] text-xs flex items-center justify-center font-bold">8</span>
                Intellectual Property
              </h2>
              <p>
                The HealthChain platform, software code, user interface designs, and smart contracts are protected under intellectual property laws and applicable open-source software licenses (MIT License where specified in the codebase).
              </p>
            </div>

            {/* 9. Third-Party Services */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#F7F4EB] text-[#111111] text-xs flex items-center justify-center font-bold">9</span>
                Third-Party Services & External Networks
              </h2>
              <p>
                HealthChain integrates with third-party infrastructure providers (e.g., Cloudflare R2, IPFS, Firebase, Ethereum nodes). HealthChain is not responsible for the independent uptime, policies, or actions of third-party network providers.
              </p>
            </div>

            {/* 10. Limitation of Liability */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#F7F4EB] text-[#111111] text-xs flex items-center justify-center font-bold">10</span>
                Limitation of Liability
              </h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, HEALTHCHAIN AND ITS CONTRIBUTORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, CLINICAL TREATMENT DELAYS, OR DEVICE MALFUNCTIONS ARISING OUT OF YOUR USE OF THE PLATFORM.
              </p>
            </div>

            {/* 11. Changes to Terms */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#F7F4EB] text-[#111111] text-xs flex items-center justify-center font-bold">11</span>
                Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. Material changes will be posted on this page with an updated revision date. Continued use of the platform constitutes acceptance of revised terms.
              </p>
            </div>

            {/* 12. Contact Information */}
            <div className="p-8 rounded-3xl bg-[#FAFAFA] border border-[#ECECEC] space-y-4">
              <h3 className="text-base font-bold text-[#111111] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#2563EB]" />
                12. Legal Inquiries & Contact
              </h3>
              <div className="space-y-2 text-xs font-mono text-[#666666]">
                <p><strong>Legal Entity:</strong> [LEGAL INFORMATION TO BE COMPLETED]</p>
                <p><strong>Registered Address:</strong> [LEGAL INFORMATION TO BE COMPLETED]</p>
                <p><strong>Legal Inquiries Email:</strong> [LEGAL INFORMATION TO BE COMPLETED]</p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL CALL TO ACTION (CTA)                                               */}
        {/* ========================================================================= */}
        <section className="py-20 bg-[#F7F4EB] relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111] bg-white px-4 py-1.5 rounded-full border border-[#ECECEC] shadow-sm">
              Regulatory Governance
            </span>

            <h2 className="font-sans text-3xl sm:text-4xl font-normal tracking-tight text-[#111111] mt-6 mb-4">
              Transparent, Verifiable <span className="font-bold">Healthcare Infrastructure</span>
            </h2>

            <p className="text-sm text-[#666666] leading-relaxed max-w-lg mx-auto mb-8">
              Explore our comprehensive privacy policy and institutional security architecture.
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center">
              <Link
                to="/privacy"
                className="px-8 py-3.5 rounded-xl bg-[#111111] text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-black hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                Review Privacy Policy
              </Link>

              <Link
                to="/security"
                className="px-8 py-3.5 rounded-xl bg-white text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] transition-all duration-200 cursor-pointer"
              >
                Security Architecture
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Universal Footer with Legal Modals & Newsletter */}
      <Footer />
    </div>
  );
}
