import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-32 bg-[#FFFFFF] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#111111_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
            Get Started
          </span>

          {/* Large Headline */}
          <h2 className="font-sans text-4xl sm:text-5xl font-normal tracking-tight text-[#111111] leading-tight mt-4 mb-6">
            Ready to Modernize Healthcare?<br />
            <span className="font-bold">Book Your Live Demo Today.</span>
          </h2>

          <p className="text-sm text-[#666666] leading-relaxed max-w-lg mb-10">
            Speak with an integration specialist to deploy a localized gateway validator node or test patient-controlled medical records.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded bg-[#111111] text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
            >
              Book Demo
            </button>
            <button
              onClick={() => navigate('/login/patient')}
              className="w-full sm:w-auto px-8 py-3.5 rounded bg-transparent text-[#111111] text-xs font-bold uppercase tracking-widest border border-[#111111] hover:bg-[#111111]/5 transition-colors"
            >
              Sign In
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
