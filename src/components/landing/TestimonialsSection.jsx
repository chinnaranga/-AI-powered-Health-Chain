import React from 'react';
import { motion } from 'framer-motion';

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: 'HealthChain has dramatically reduced administrative delays. Accessing cross-facility, verified history allows us to provide clinical assessments in minutes rather than days.',
      author: 'Dr. Sarah Jenkins, MD',
      role: 'Chief of Cardiology',
      org: 'Apollo Hospitals',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    },
    {
      quote: 'Operating hospital chains demands tight security and regulatory compliance. HealthChain fits into our existing ERP stack while guaranteeing HIPAA audit-compliance on a decentralized ledger.',
      author: 'Rajesh Nair',
      role: 'Chief Information Officer',
      org: 'Manipal Health Group',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    },
    {
      quote: 'I have absolute visibility over who queries my records. Being able to grant or revoke doctor access directly from my phone gives me peace of mind about my medical privacy.',
      author: 'Sarah Jenkins',
      role: 'Chronic Care Patient',
      org: 'Patient Wallet Owner',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    },
    {
      quote: 'By automating patient record verification via smart contracts, we have cut down claims processing reviews from weeks to seconds. Administrative overhead is virtually eliminated.',
      author: 'Michael Chen',
      role: 'VP of Operations',
      org: 'Star Health Insurance',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    },
  ];

  return (
    <section id="testimonials" className="py-24 bg-[#FFFFFF] border-b border-[#ECECEC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Editorial Title Block */}
        <div className="max-w-3xl mb-20">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
            User Reviews
          </span>
          <h2 className="font-sans text-4xl sm:text-5xl font-normal tracking-tight text-[#111111] leading-[1.1] mt-4">
            Endorsed by the Medical Community.
          </h2>
          <p className="text-sm text-[#666666] leading-relaxed mt-4 max-w-xl">
            Read opinions from clinicians, administrative directors, patients, and insurance partners using HealthChain.
          </p>
        </div>

        {/* Testimonials Grid (Square avatars, minimal containers) */}
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#F7F4EB] p-8 rounded border border-[#ECECEC] flex flex-col justify-between"
            >
              <p className="font-sans text-sm italic text-[#111111] leading-relaxed mb-8">
                "{t.quote}"
              </p>

              {/* Author Info - Square cropped image */}
              <div className="flex items-center gap-4 border-t border-[#ECECEC] pt-6">
                <img
                  src={t.image}
                  alt={t.author}
                  className="w-12 h-12 object-cover rounded-none grayscale border border-[#ECECEC]"
                />
                <div>
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#111111]">
                    {t.author}
                  </h4>
                  <p className="text-[11px] text-[#666666] mt-0.5">
                    {t.role} — <span className="font-semibold">{t.org}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
