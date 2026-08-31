import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    {
      q: 'What is a decentralized health identifier (ABHA)?',
      a: 'ABHA is India\'s national health account system under ABDM. HealthChain integrates directly with the ABHA registry, linking your credentials to a unique cryptographic wallet address rather than using phone numbers or emails, which protects your privacy.',
    },
    {
      q: 'How does patient consent revocation work in real-time?',
      a: 'When you grant access to a doctor, a smart contract issues an access token valid only for a set duration (e.g. 2 hours). If you revoke access, the contract updates instantly on the ledger, and the clinic gateway is blocked from decrypting your records.',
    },
    {
      q: 'Are medical records actually stored directly on the blockchain?',
      a: 'No. Storing large medical scans or files directly on-chain is expensive and exposes sensitive data. Instead, your files are encrypted and stored in decentralized file systems (IPFS). Only the secure cryptographic hash (checksum) and access lists are written to the blockchain ledger.',
    },
    {
      q: 'Is HealthChain HIPAA and GDPR compliant?',
      a: 'Yes. HealthChain is designed to comply with HIPAA and GDPR regulations. Because patient data is encrypted locally and access is controlled by the patient\'s private keys, HealthChain does not host unencrypted Protected Health Information (PHI), adhering to privacy laws.',
    },
    {
      q: 'What happens during a network outage or clinic node failure?',
      a: 'The HealthChain network relies on multiple validator nodes. If one clinic node goes offline, other nodes continue validating transactions. In a local outage, patients can access their records through backup local wallet keys cached on their devices.',
    },
  ];

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-24 bg-[#F7F4EB] border-b border-[#ECECEC]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-20">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
            Common Queries
          </span>
          <h2 className="font-sans text-4xl font-normal tracking-tight text-[#111111] leading-tight mt-4">
            Frequently Asked Questions
          </h2>
        </div>

        {/* FAQ Accordion List */}
        <div className="border border-[#ECECEC] rounded bg-[#FFFFFF] divide-y divide-[#ECECEC] overflow-hidden">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="w-full">
                <button
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-6 flex justify-between items-center transition-colors hover:bg-[#F7F4EB]/30"
                >
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#111111] pr-4">
                    {faq.q}
                  </span>
                  <div className="text-[#111111] flex-shrink-0">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 border-t border-[#ECECEC]/30 text-xs text-[#666666] leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
