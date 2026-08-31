import React from 'react';
import { motion } from 'framer-motion';
import { Building, TestTube, AlertTriangle, Pill, ShieldAlert, Sparkles } from 'lucide-react';

export default function ProblemSection() {
  const silos = [
    {
      role: 'Hospitals',
      issue: 'Local ERP Silos',
      desc: 'Clinical diagnosis records are locked inside local databases. Sharing patient history requires legacy formats or manual faxes.',
      icon: Building,
    },
    {
      role: 'Laboratories',
      issue: 'Isolated Diagnostics',
      desc: 'Blood tests, MRIs, and genetic reports remain stored on private lab servers, forcing patients to carry paper summaries.',
      icon: TestTube,
    },
    {
      role: 'Pharmacies',
      issue: 'Paper Prescriptions',
      desc: 'Medications are dispensed without access to active cross-facility records, risking adverse interactions.',
      icon: Pill,
    },
    {
      role: 'Insurers',
      issue: 'Manual Verification',
      desc: 'Claims verification requires administrative reviews, waiting weeks for physical signature audits.',
      icon: ShieldAlert,
    },
  ];

  return (
    <section id="solutions" className="py-24 bg-[#FFFFFF] border-b border-[#ECECEC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Editorial Title Block */}
        <div className="grid lg:grid-cols-12 gap-8 mb-20 items-end">
          <div className="lg:col-span-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
              The Healthcare Crisis
            </span>
            <h2 className="font-sans text-4xl sm:text-5xl font-normal tracking-tight text-[#111111] leading-[1.1] mt-4 max-w-2xl">
              Healthcare Data Shouldn't Be Fragmented.
            </h2>
          </div>
          <div className="lg:col-span-4">
            <p className="text-sm text-[#666666] leading-relaxed">
              Every consultation, scan, and prescription spawns a new isolated record. Without a shared trust layer, patient care is delayed by administrative friction and verification gaps.
            </p>
          </div>
        </div>

        {/* Fragmented Visual Timeline */}
        <div className="relative border border-[#ECECEC] rounded bg-[#F7F4EB] p-8 md:p-12 overflow-hidden mb-16">
          {/* Subtle dotted grid overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#111111_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Timeline Nodes */}
          <div className="grid md:grid-cols-4 gap-8 relative z-10">
            {silos.map((silo, idx) => (
              <div key={idx} className="flex flex-col relative group">
                
                {/* Visual Step Marker */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded border border-[#ECECEC] bg-white flex items-center justify-center text-[#111111] group-hover:bg-[#111111] group-hover:text-white transition-colors duration-300">
                    <silo.icon className="w-5 h-5" />
                  </div>
                  <div className="h-px flex-1 bg-dashed bg-slate-350" />
                  <span className="text-[10px] font-mono text-[#666666] font-bold">0{idx + 1}</span>
                </div>

                {/* Node Status */}
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#DC2626]/5 text-[#DC2626] border border-[#DC2626]/10 text-[9px] font-bold uppercase tracking-wider w-fit mb-3">
                  <AlertTriangle className="w-3 h-3" />
                  {silo.issue}
                </div>

                <h3 className="font-sans text-base font-bold text-[#111111] mb-2">{silo.role}</h3>
                <p className="text-xs text-[#666666] leading-relaxed">{silo.desc}</p>
                
                {/* Warning message connector */}
                <div className="text-[9px] font-mono text-[#DC2626] mt-4 flex items-center gap-1">
                  <span>●</span> Interoperability block
                </div>
              </div>
            ))}
          </div>

          {/* Dotted path representing data fragmentation */}
          <div className="hidden md:block absolute top-[68px] left-[15%] right-[15%] h-px border-t border-dashed border-[#DC2626]/30 pointer-events-none" />
        </div>

      </div>
    </section>
  );
}
