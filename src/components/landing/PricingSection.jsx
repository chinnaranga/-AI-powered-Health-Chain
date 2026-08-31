import React from 'react';
import { motion } from 'framer-motion';

export default function PricingSection() {
  const tiers = [
    {
      name: 'Starter',
      price: '$120',
      period: 'per clinic / month',
      desc: 'For small clinics and individual medical practices.',
      features: [
        'Up to 5 clinician nodes',
        '1,000 patient wallets / month',
        'Standard FHIR interoperability',
        'Email & community support',
      ],
      cta: 'Start Clinic Trial',
      primary: false,
    },
    {
      name: 'Professional',
      price: '$450',
      period: 'per clinic / month',
      desc: 'For multi-specialty clinics and regional centers.',
      features: [
        'Up to 25 clinician nodes',
        '10,000 patient wallets / month',
        'Advanced FHIR/HL7 database sync',
        '24/7 dedicated email support',
        'Custom consent expirations',
      ],
      cta: 'Get Started',
      primary: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'tailored setup',
      desc: 'For multi-facility hospital groups and health networks.',
      features: [
        'Unlimited clinician nodes',
        'Unlimited patient wallets',
        'Custom private ledger nodes',
        'Dedicated SLA & telephone support',
        'On-site ERP integration',
        'Trail of Bits audit report',
      ],
      cta: 'Contact Enterprise',
      primary: false,
    },
    {
      name: 'Government',
      price: 'Custom',
      period: 'regional deployment',
      desc: 'For state and national public health registries.',
      features: [
        'National ABHA identifier mapping',
        'Aggregate epidemiological reporting',
        'Multi-region validator consensus',
        'Dedicated defense-grade security',
        'Custom legislative compliance',
      ],
      cta: 'Contact Public Sector',
      primary: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-[#FFFFFF] border-b border-[#ECECEC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Title */}
        <div className="max-w-3xl mb-20">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
            Pricing Plans
          </span>
          <h2 className="font-sans text-4xl sm:text-5xl font-normal tracking-tight text-[#111111] leading-[1.1] mt-4">
            Scale Safely. Pay Predictably.
          </h2>
          <p className="text-sm text-[#666666] leading-relaxed mt-4 max-w-xl">
            Choose the deployment tier that suits your clinical infrastructure. Cancel, upgrade, or modify consensus nodes at any point.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          {tiers.map((tier, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className={`p-8 rounded border flex flex-col justify-between transition-all duration-300 ${
                tier.primary
                  ? 'bg-[#F7F4EB] border-[#111111] shadow-sm'
                  : 'bg-transparent border-[#ECECEC] hover:border-[#666666]'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
                  {tier.name}
                </span>
                
                <div className="mt-4 flex items-baseline text-[#111111]">
                  <span className="text-3xl sm:text-4xl font-bold tracking-tight">{tier.price}</span>
                  {tier.period && (
                    <span className="text-[10px] text-[#666666] ml-2 lowercase font-bold tracking-wider">{tier.period}</span>
                  )}
                </div>

                <p className="text-xs text-[#666666] leading-relaxed mt-4 mb-6">
                  {tier.desc}
                </p>

                <div className="h-px bg-[#ECECEC] mb-6" />

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex gap-2.5 items-start text-xs text-[#666666]">
                      <span className="text-[#111111] font-bold">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                className={`w-full py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors duration-200 ${
                  tier.primary
                    ? 'bg-[#111111] text-white hover:bg-black'
                    : 'bg-transparent text-[#111111] border border-[#111111] hover:bg-[#111111]/5'
                }`}
              >
                {tier.cta}
              </button>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
