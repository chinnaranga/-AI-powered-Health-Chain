import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Check, ClipboardCopy } from 'lucide-react';

export default function TrustSection() {
  const hospitalLogos = [
    { name: 'Apollo Hospitals', style: 'font-sans font-extrabold tracking-tight uppercase text-xs' },
    { name: 'Manipal Hospitals', style: 'font-serif italic font-bold tracking-normal text-sm' },
    { name: 'Narayana Health', style: 'font-sans font-light tracking-widest uppercase text-[10px]' },
    { name: 'Aster DM Healthcare', style: 'font-serif font-black tracking-tight text-xs' },
    { name: 'KIMS Hospitals', style: 'font-sans font-bold tracking-widest text-[11px] uppercase' },
    { name: 'CARE Hospitals', style: 'font-sans font-medium tracking-tight text-xs' },
    { name: 'AIIMS', style: 'font-serif font-semibold tracking-widest uppercase text-xs' },
    { name: 'PGIMER', style: 'font-sans font-extralight tracking-widest uppercase text-[11px]' },
  ];

  const standards = [
    {
      title: 'HIPAA Compliant',
      desc: 'Full alignment with national and global healthcare privacy regulations for protected health information (PHI).',
    },
    {
      title: 'GDPR Protected',
      desc: 'Upholds strict patient consent controls, data portability, and the absolute right to be forgotten.',
    },
    {
      title: 'SOC 2 Type II Certified',
      desc: 'Independently audited controls ensuring absolute availability, security, and integrity of network data logs.',
    },
    {
      title: 'ISO 27001 Secure',
      desc: 'Structured global information security management systems regulating every node and operational flow.',
    },
  ];

  return (
    <section id="trust" className="py-24 bg-[#FFFFFF] border-y border-[#ECECEC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Partnership Label */}
        <div className="text-center mb-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
            Trusted by India's Healthcare Leaders
          </p>
        </div>

        {/* Hospital Logo Grid - Elegant Monochrome */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8 items-center justify-items-center mb-24 opacity-60">
          {hospitalLogos.map((hospital, i) => (
            <div
              key={i}
              className="text-[#111111] hover:opacity-100 transition-opacity duration-200 cursor-default select-none py-2 text-center"
            >
              <span className={hospital.style}>{hospital.name}</span>
            </div>
          ))}
        </div>

        {/* Compliance Badges Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {standards.map((std, idx) => (
            <motion.div
              key={std.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#F7F4EB] p-8 rounded border border-[#ECECEC] hover:shadow-sm transition-all duration-300"
            >
              <div className="w-8 h-8 rounded bg-[#111111] flex items-center justify-center text-[#FFFFFF] mb-6">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-sans text-sm font-bold uppercase tracking-wider text-[#111111] mb-3">
                {std.title}
              </h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                {std.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Consensus Banner */}
        <div className="mt-16 bg-[#F7F4EB] border border-[#ECECEC] p-6 rounded flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-[#111111] flex items-center justify-center text-[#FFFFFF]">
              <ClipboardCopy className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-sans text-xs font-bold uppercase tracking-wider text-[#111111]">
                Patient-Consent First Cryptography
              </h5>
              <p className="text-xs text-[#666666] mt-1 max-w-2xl">
                Decentralized health identifiers (ABHA compliant) encrypt records with personal keys. Neither clinics nor HealthChain can decode histories without express patient authorization.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#111111]">
              100% Cryptographic Audit Trail
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
