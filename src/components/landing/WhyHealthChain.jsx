import React from 'react';
import { motion } from 'framer-motion';

export default function WhyHealthChain() {
  const comparisons = [
    {
      attribute: 'Data Sovereignty',
      traditional: 'Hospital owns the clinical database; patients must request exports.',
      healthchain: 'Patient retains absolute private-key ownership. No clinic holds unilateral access.',
    },
    {
      attribute: 'Record Fragmentation',
      traditional: 'Scattered across hospital ERPs, pharmacies, and imaging databases.',
      healthchain: 'Unified index on an immutable ledger pointing to encrypted off-chain storage.',
    },
    {
      attribute: 'Sharing Latency',
      traditional: 'Hours or days. Relies on physical faxes, email attachments, or CD-ROMs.',
      healthchain: 'Instant (under 2 seconds) validation of consent and decryption keys.',
    },
    {
      attribute: 'Interoperability Standards',
      traditional: 'Fragmented custom APIs, inconsistent HL7/FHIR mappings.',
      healthchain: 'Consolidated JSON-LD schema natively resolving cross-provider requests.',
    },
    {
      attribute: 'Claims Audit',
      traditional: 'Manual checks, physical receipts, phone confirmations. Takes weeks.',
      healthchain: 'Smart contracts audit treatment logs to settle claims automatically.',
    },
    {
      attribute: 'Access Revocation',
      traditional: 'Virtually impossible to track or revoke once records are exported.',
      healthchain: 'Granular, time-limited tokens. Access privileges can be revoked in real-time.',
    },
  ];

  return (
    <section className="py-24 bg-[#FFFFFF] border-b border-[#ECECEC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Editorial Heading */}
        <div className="max-w-3xl mb-20">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
            Comparative Analysis
          </span>
          <h2 className="font-sans text-4xl sm:text-5xl font-normal tracking-tight text-[#111111] leading-[1.1] mt-4">
            A New Standard for Health Infrastructure.
          </h2>
          <p className="text-sm text-[#666666] leading-relaxed mt-4 max-w-xl">
            Compare how legacy hospital databases scale against decentralized cryptographic networks.
          </p>
        </div>

        {/* Premium Comparison Table */}
        <div className="border border-[#ECECEC] rounded overflow-hidden">
          
          {/* Table Headers */}
          <div className="grid md:grid-cols-12 bg-[#F7F4EB] border-b border-[#ECECEC] p-5 text-xs font-bold uppercase tracking-wider text-[#111111]">
            <div className="md:col-span-3">Attribute</div>
            <div className="md:col-span-4.5 mt-2 md:mt-0">Traditional Hospital Systems</div>
            <div className="md:col-span-4.5 mt-2 md:mt-0">HealthChain Platform</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#ECECEC]">
            {comparisons.map((row, idx) => (
              <div
                key={idx}
                className="grid md:grid-cols-12 p-6 text-xs leading-relaxed items-center hover:bg-[#F7F4EB]/20 transition-colors duration-200"
              >
                {/* Attribute */}
                <div className="md:col-span-3 font-sans font-bold uppercase tracking-wider text-[#111111] mb-2 md:mb-0">
                  {row.attribute}
                </div>
                
                {/* Traditional */}
                <div className="md:col-span-4.5 text-[#666666] pr-4 mb-2 md:mb-0">
                  {row.traditional}
                </div>
                
                {/* HealthChain */}
                <div className="md:col-span-4.5 font-semibold text-[#111111] border-l-0 md:border-l border-transparent md:border-[#ECECEC]/30 md:pl-4">
                  {row.healthchain}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
