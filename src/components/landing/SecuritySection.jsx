import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Key, Users, EyeOff, Lock, RefreshCw, Layers } from 'lucide-react';

export default function SecuritySection() {
  const securityItems = [
    { title: 'Zero Trust Access', desc: 'No client or API is trusted implicitly. Credentials expire dynamically.', icon: EyeOff },
    { title: 'Military Grade Encryption', desc: 'Medical records are encrypted at rest with AES-256-GCM prior to storage.', icon: Lock },
    { title: 'Role Based Auditing', desc: 'Fine-grained smart contracts map access boundaries for patients vs clinicians.', icon: Users },
    { title: 'On-chain Immutable Logs', desc: 'Consent updates write hashes straight onto the ledger, creating verifiable logs.', icon: RefreshCw },
  ];

  return (
    <section id="security" className="py-24 bg-[#F7F4EB] border-b border-[#ECECEC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Title and Intro */}
        <div className="grid lg:grid-cols-12 gap-8 mb-20 items-end">
          <div className="lg:col-span-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
              Enterprise Infrastructure
            </span>
            <h2 className="font-sans text-4xl sm:text-5xl font-normal tracking-tight text-[#111111] leading-[1.1] mt-4">
              Cryptographical Guardrails Built In.
            </h2>
          </div>
          <div className="lg:col-span-4">
            <p className="text-sm text-[#666666] leading-relaxed">
              HealthChain operates a zero-knowledge trust environment. No administrative override keys exist, preserving medical record privacy at all node layers.
            </p>
          </div>
        </div>

        {/* Schematic Architecture Diagram Box */}
        <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded p-8 md:p-12 mb-16 relative overflow-hidden">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#111111_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Schematic SVG */}
          <div className="w-full flex items-center justify-center min-h-[220px]">
            <svg viewBox="0 0 600 220" className="w-full h-full max-w-[550px] relative z-10">
              {/* Process flow paths */}
              <line x1="60" y1="110" x2="160" y2="110" stroke="#111111" strokeWidth="1.5" />
              <line x1="200" y1="110" x2="300" y2="110" stroke="#111111" strokeWidth="1.5" />
              <line x1="340" y1="110" x2="440" y2="110" stroke="#111111" strokeWidth="1.5" />
              <line x1="480" y1="110" x2="540" y2="110" stroke="#111111" strokeWidth="1.5" />

              {/* Data payload input */}
              <g className="translate-x-[60px] translate-y-[110px]">
                <circle cx="0" cy="0" r="6" fill="#14B8A6" className="animate-ping" style={{ animationDuration: '2s' }} />
                <circle cx="0" cy="0" r="4" fill="#14B8A6" />
                <text x="-40" y="-15" className="text-[9px] font-mono fill-[#666666] uppercase">Record Payload</text>
              </g>

              {/* Phase 1: Local Encrypt */}
              <g className="translate-x-[180px] translate-y-[110px]">
                <rect x="-20" y="-20" width="40" height="40" rx="4" fill="#FFFFFF" stroke="#111111" strokeWidth="1.5" />
                <Key className="w-4 h-4 text-[#111111] -translate-x-2 -translate-y-2" />
                <text x="-32" y="32" className="text-[8px] font-bold uppercase tracking-wider fill-[#111111]">AES-256 Key</text>
              </g>

              {/* Phase 2: Access Check (Consent Engine) */}
              <g className="translate-x-[320px] translate-y-[110px]">
                <rect x="-20" y="-20" width="40" height="40" rx="4" fill="#FFFFFF" stroke="#111111" strokeWidth="1.5" />
                <ShieldCheck className="w-4 h-4 text-[#111111] -translate-x-2 -translate-y-2" />
                <text x="-38" y="32" className="text-[8px] font-bold uppercase tracking-wider fill-[#111111]">Consent Verified</text>
              </g>

              {/* Phase 3: Blockchain verification (Contract ledger) */}
              <g className="translate-x-[460px] translate-y-[110px]">
                <rect x="-20" y="-20" width="40" height="40" rx="4" fill="#FFFFFF" stroke="#111111" strokeWidth="1.5" />
                <Layers className="w-4 h-4 text-[#111111] -translate-x-2 -translate-y-2" />
                <text x="-30" y="32" className="text-[8px] font-bold uppercase tracking-wider fill-[#111111]">Ledger Block</text>
              </g>

              {/* Verified output */}
              <g className="translate-x-[540px] translate-y-[110px]">
                <circle cx="0" cy="0" r="4" fill="#16A34A" />
                <text x="-35" y="-15" className="text-[9px] font-mono fill-[#16A34A] uppercase">Sync Verified</text>
              </g>
            </svg>
          </div>

          <div className="border-t border-[#ECECEC] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#666666]">
            <span>Encryption standards: ECDSA secp256k1 & SHA-256 hashing.</span>
            <span>Audited by Trail of Bits & Quantstamp (2025).</span>
          </div>
        </div>

        {/* Security Grid Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {securityItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-transparent border border-[#ECECEC] p-6 rounded hover:bg-white hover:border-[#111111] hover:shadow-sm transition-all duration-300">
                <div className="w-8 h-8 rounded bg-[#111111] flex items-center justify-center text-white mb-4">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#111111] mb-2">{item.title}</h4>
                <p className="text-xs text-[#666666] leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
