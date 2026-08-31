import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Upload, Shield, Eye, FileCheck, Key, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const workflowSteps = [
    {
      title: 'Digital Identity Creation',
      subtitle: 'Patient creates secure digital identity',
      desc: 'Verify your ID using national healthcare markers (ABHA). An asymmetrical key-pair is generated directly on your local device. The private key remains in your secure enclave.',
      icon: User,
      actionText: 'Key pair generated',
    },
    {
      title: 'Encrypted Record Upload',
      subtitle: 'Hospital uploads encrypted clinical record',
      desc: 'The hospital compiles diagnosis, prescription, or lab reports, encrypts the document with your public key, and publishes the hash reference to the blockchain ledger.',
      icon: Upload,
      actionText: 'AES-256 encrypted payload',
    },
    {
      title: 'Blockchain Consensus Verification',
      subtitle: 'Blockchain verification processes hash',
      desc: 'A decentralized validator consensus checks the integrity, timestamp, and signature of the file, writing the transaction record block permanently on the ledger.',
      icon: Shield,
      actionText: 'Block signed & sealed',
    },
    {
      title: 'Provider Decryption Request',
      subtitle: 'Doctor receives secure time-limited access',
      desc: 'Your consulting physician requests access to your clinical record wallet. A smart contract issues a decryption request requiring your validation signature.',
      icon: Eye,
      actionText: 'Access token requested',
    },
    {
      title: 'Automated Claim Review',
      subtitle: 'Insurance verifies credentials instantly',
      desc: 'A smart contract queries the ledger history to confirm diagnosis codes and treatment timestamps, authorizing insurance claims without manual reviews.',
      icon: FileCheck,
      actionText: 'Contract verifies signature',
    },
    {
      title: 'Sovereign Permission Control',
      subtitle: 'Patient controls permissions in real-time',
      desc: 'Revoke or extend doctor permissions at any point directly from the medical wallet. You retain full auditing rights over who has queried your files.',
      icon: Key,
      actionText: 'Rights revoked or renewed',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#F7F4EB] border-b border-[#ECECEC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Editorial Header */}
        <div className="max-w-3xl mb-20">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
            The Security Ledger Protocol
          </span>
          <h2 className="font-sans text-4xl sm:text-5xl font-normal tracking-tight text-[#111111] leading-[1.1] mt-4">
            How Connected Healthcare Works
          </h2>
          <p className="text-sm text-[#666666] leading-relaxed mt-4 max-w-xl">
            A secure transaction sequence mapping the lifecycle of patient health records from creation to decentralized access control.
          </p>
        </div>

        {/* Dynamic Workflow Grid */}
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Interactive Steps List */}
          <div className="lg:col-span-5 space-y-4">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-5 rounded border transition-all duration-350 flex gap-4 items-start ${
                    isActive
                      ? 'bg-white border-[#111111] shadow-sm'
                      : 'bg-transparent border-transparent hover:border-[#ECECEC] hover:bg-white/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded flex items-center justify-center border transition-colors ${
                    isActive ? 'bg-[#111111] border-[#111111] text-[#FFFFFF]' : 'bg-white border-[#ECECEC] text-[#666666]'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#111111]">
                        {step.title}
                      </h4>
                      <span className="text-[9px] font-mono text-[#666666] font-bold">0{idx + 1}</span>
                    </div>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.25 }}
                        className="text-xs text-[#666666] leading-relaxed mt-2"
                      >
                        {step.desc}
                      </motion.p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Visualization Diagram Box */}
          <div className="lg:col-span-7 border border-[#ECECEC] rounded bg-white p-8 h-[400px] flex flex-col justify-between relative overflow-hidden">
            {/* Soft grid background */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#111111_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

            {/* Active stage details */}
            <div className="relative z-10 flex items-center justify-between border-b border-[#F3F3F3] pb-4">
              <div>
                <span className="text-[9px] font-mono text-[#666666] uppercase">Active Lifecycle Node</span>
                <h4 className="text-sm font-bold text-[#111111] mt-0.5">{workflowSteps[activeStep].subtitle}</h4>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#E8F0FE] text-[#2563EB] text-[9px] font-mono font-bold uppercase tracking-wider">
                {workflowSteps[activeStep].actionText}
              </span>
            </div>

            {/* Interactive SVG Network nodes */}
            <div className="relative flex-1 flex items-center justify-center">
              <svg viewBox="0 0 500 240" className="w-full h-full max-w-[450px]">
                {/* Node coordinates: Patient (80, 120), Hospital (200, 60), Validator (320, 120), Doctor (200, 180), Insurance (420, 120) */}
                {/* Animated Paths depending on activeStep */}
                {/* Step 1: Patient Active */}
                <line x1="80" y1="120" x2="200" y2="60" stroke={activeStep >= 1 ? '#111111' : '#ECECEC'} strokeWidth={activeStep === 1 ? '2' : '1'} className={activeStep === 1 ? 'stroke-dasharray-[4] animate-[dash_1s_linear_infinite]' : ''} />
                
                {/* Step 2: Hospital -> Validator */}
                <line x1="200" y1="60" x2="320" y2="120" stroke={activeStep >= 2 ? '#111111' : '#ECECEC'} strokeWidth={activeStep === 2 ? '2' : '1'} />
                
                {/* Step 3: Validator writes to Ledger */}
                <line x1="320" y1="120" x2="200" y2="180" stroke={activeStep >= 3 ? '#111111' : '#ECECEC'} strokeWidth={activeStep === 3 ? '2' : '1'} />
                
                {/* Step 4: Doctor -> Patient Access Request */}
                <line x1="200" y1="180" x2="80" y2="120" stroke={activeStep >= 4 ? '#111111' : '#ECECEC'} strokeWidth={activeStep === 4 ? '2' : '1'} />
                
                {/* Step 5: Insurer checks ledger */}
                <line x1="320" y1="120" x2="420" y2="120" stroke={activeStep >= 5 ? '#111111' : '#ECECEC'} strokeWidth={activeStep === 5 ? '2' : '1'} />

                {/* Patient Node */}
                <g className="translate-x-[80px] translate-y-[120px]">
                  <circle cx="0" cy="0" r="20" fill={activeStep === 0 ? '#111111' : '#FFFFFF'} stroke="#111111" strokeWidth="1.5" />
                  <User className={`w-4 h-4 -translate-x-2 -translate-y-2 ${activeStep === 0 ? 'text-white' : 'text-[#111111]'}`} />
                  <text x="-25" y="32" className="text-[9px] font-bold uppercase tracking-wider fill-[#666666]">Patient</text>
                </g>

                {/* Hospital Node */}
                <g className="translate-x-[200px] translate-y-[60px]">
                  <circle cx="0" cy="0" r="20" fill={activeStep === 1 ? '#111111' : '#FFFFFF'} stroke="#111111" strokeWidth="1.5" />
                  <Upload className={`w-4 h-4 -translate-x-2 -translate-y-2 ${activeStep === 1 ? 'text-white' : 'text-[#111111]'}`} />
                  <text x="-25" y="-28" className="text-[9px] font-bold uppercase tracking-wider fill-[#666666]">Hospital</text>
                </g>

                {/* Ledger Validator Node */}
                <g className="translate-x-[320px] translate-y-[120px]">
                  <circle cx="0" cy="0" r="20" fill={activeStep === 2 ? '#111111' : '#FFFFFF'} stroke="#111111" strokeWidth="1.5" />
                  <Shield className={`w-4 h-4 -translate-x-2 -translate-y-2 ${activeStep === 2 ? 'text-white' : 'text-[#111111]'}`} />
                  <text x="-22" y="32" className="text-[9px] font-bold uppercase tracking-wider fill-[#666666]">Validator</text>
                </g>

                {/* Doctor Node */}
                <g className="translate-x-[200px] translate-y-[180px]">
                  <circle cx="0" cy="0" r="20" fill={activeStep === 3 || activeStep === 5 ? '#111111' : '#FFFFFF'} stroke="#111111" strokeWidth="1.5" />
                  <Eye className={`w-4 h-4 -translate-x-2 -translate-y-2 ${(activeStep === 3 || activeStep === 5) ? 'text-white' : 'text-[#111111]'}`} />
                  <text x="-22" y="32" className="text-[9px] font-bold uppercase tracking-wider fill-[#666666]">Clinician</text>
                </g>

                {/* Insurance Node */}
                <g className="translate-x-[420px] translate-y-[120px]">
                  <circle cx="0" cy="0" r="20" fill={activeStep === 4 ? '#111111' : '#FFFFFF'} stroke="#111111" strokeWidth="1.5" />
                  <FileCheck className={`w-4 h-4 -translate-x-2 -translate-y-2 ${activeStep === 4 ? 'text-white' : 'text-[#111111]'}`} />
                  <text x="-24" y="32" className="text-[9px] font-bold uppercase tracking-wider fill-[#666666]">Insurance</text>
                </g>
              </svg>
            </div>

            {/* Bottom logs display */}
            <div className="bg-[#F7F4EB] border border-[#ECECEC] p-3 rounded flex items-center justify-between text-[9px] font-mono text-[#666666]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full inline-block" /> Ledger checksum synced
              </span>
              <span>Block: #{(104829 + activeStep).toLocaleString()}</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
