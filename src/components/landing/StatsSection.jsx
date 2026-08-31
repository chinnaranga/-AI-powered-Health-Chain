import React from 'react';
import { motion } from 'framer-motion';

export default function StatsSection() {
  const stats = [
    { value: '98%', label: 'Reduction in duplicate records', desc: 'Avoids diagnostic repeats and treatment administration errors.' },
    { value: '2 Seconds', label: 'Patient verification speed', desc: 'Consolidated consensus authentication across remote hospital nodes.' },
    { value: '99.99%', label: 'Platform node uptime', desc: 'Fault-tolerant distributed ledger hosting with zero single-points-of-failure.' },
    { value: '150+', label: 'Connected hospitals & labs', desc: 'Active clinical gateways serving local, regional, and national registries.' },
    { value: '500K+', label: 'Verified patient wallets', desc: 'Patients managing personal identity signatures natively.' },
    { value: '100M+', label: 'Encrypted records hashed', desc: 'Consultation transcripts, prescriptions, and diagnostics sealed.' },
  ];

  return (
    <section id="stats" className="py-24 bg-[#F7F4EB] border-b border-[#ECECEC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Title */}
        <div className="max-w-3xl mb-20">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
            Performance Metrics
          </span>
          <h2 className="font-sans text-4xl sm:text-5xl font-normal tracking-tight text-[#111111] leading-[1.1] mt-4">
            Real Impact. At Enterprise Scale.
          </h2>
        </div>

        {/* Stats Grid - Typographical focus */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="flex flex-col border-t border-[#ECECEC] pt-6"
            >
              <h3 className="font-sans text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
                {stat.value}
              </h3>
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#111111] mt-3 mb-2">
                {stat.label}
              </h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                {stat.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Ledger verification footnote */}
        <div className="mt-16 border-t border-[#ECECEC] pt-8 flex items-center justify-between text-[10px] font-mono text-[#666666]">
          <span>Verified against block heights #104,000 to #104,835</span>
          <span>Ledger state: Consensus reached</span>
        </div>

      </div>
    </section>
  );
}
