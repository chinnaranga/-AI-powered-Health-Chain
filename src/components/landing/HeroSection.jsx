import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Laptop, ShieldCheck, Database, Key, Users } from 'lucide-react';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen xl:h-screen flex flex-col justify-center pt-24 overflow-hidden">
      {/* Background Split */}
      <div className="absolute inset-0 flex flex-col xl:flex-row pointer-events-none z-0">
        <div className="w-full xl:w-1/2 bg-[#FFFFFF]" />
        <div className="w-full xl:w-1/2 bg-[#F7F4EB]" />
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 grid xl:grid-cols-2 items-center gap-12 relative z-10 py-12 xl:py-0">
        
        {/* Left Side: Editorial Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-center xl:pr-12 text-[#111111]"
        >
          {/* Trust indicator */}
          <div className="inline-flex items-center gap-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#14B8A6]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
              Next-Gen Patient Sovereign Identity
            </span>
          </div>

          {/* Large Editorial Headline */}
          <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] leading-[1.08] mb-8">
            Your Health Data.<br />
            <span className="font-bold">Finally Yours.</span>
          </h1>

          {/* Generous body description */}
          <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-xl mb-10">
            HealthChain bridges clinical operations with decentralized trust. Own, encrypt, and license your medical history across hospitals, labs, and insurers instantly. No middleware, no single point of failure.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-12">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                navigate('/book-demo');
              }}
              className="px-8 py-3.5 rounded bg-[#111111] text-[#FFFFFF] font-sans text-xs font-bold uppercase tracking-widest hover:bg-[#000000] transition-colors duration-200 cursor-pointer"
            >
              Book a Demo
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
              className="px-8 py-3.5 rounded bg-transparent text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#111111] hover:bg-[#111111]/5 transition-colors duration-200 cursor-pointer"
            >
              Sign In
            </button>
          </div>

          {/* Real Customer Statistics */}
          <div className="border-t border-[#ECECEC] pt-8 grid grid-cols-3 gap-6 max-w-md">
            <div>
              <p className="text-2xl font-bold tracking-tight text-[#111111]">500K+</p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#666666] mt-1">Verified Patients</p>
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-[#111111]">150+</p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#666666] mt-1">Connected Hospitals</p>
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-[#111111]">100M+</p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#666666] mt-1">Secured Records</p>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Laptop Mockup & Connection Graph */}
        <div className="relative w-full h-[380px] sm:h-[480px] xl:h-full flex items-center justify-center">
          
          {/* Ecosystem Graph background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 600 600" className="w-full h-full max-w-[550px] opacity-70">
              {/* Central Block Chain Hub */}
              <circle cx="300" cy="300" r="140" fill="none" stroke="#2563EB" strokeWidth="1" strokeDasharray="3,6" className="animate-[spin_90s_linear_infinite]" />
              <circle cx="300" cy="300" r="220" fill="none" stroke="#14B8A6" strokeWidth="0.5" strokeDasharray="4,8" className="animate-[spin_120s_linear_infinite]" />
              
              {/* Connector lines (from central hub to nodes) */}
              {/* Patient Node */}
              <line x1="300" y1="300" x2="120" y2="150" stroke="#CCCCCC" strokeWidth="1" />
              {/* Doctor Node */}
              <line x1="300" y1="300" x2="480" y2="150" stroke="#CCCCCC" strokeWidth="1" />
              {/* Hospital Node */}
              <line x1="300" y1="300" x2="100" y2="350" stroke="#CCCCCC" strokeWidth="1" />
              {/* Lab Node */}
              <line x1="300" y1="300" x2="500" y2="350" stroke="#CCCCCC" strokeWidth="1" />
              {/* Insurance Node */}
              <line x1="300" y1="300" x2="200" y2="520" stroke="#CCCCCC" strokeWidth="1" />
              {/* Pharmacy Node */}
              <line x1="300" y1="300" x2="400" y2="520" stroke="#CCCCCC" strokeWidth="1" />

              {/* Pulsing signal dots on connection lines */}
              <circle cx="210" cy="225" r="3" fill="#2563EB" className="animate-pulse" />
              <circle cx="390" cy="225" r="3" fill="#14B8A6" className="animate-pulse" />
              <circle cx="200" cy="325" r="3" fill="#14B8A6" className="animate-pulse" />
              <circle cx="400" cy="325" r="3" fill="#2563EB" className="animate-pulse" />
              
              {/* Outer nodes labels/markers */}
              {/* Patient */}
              <g className="translate-x-[120px] translate-y-[150px]">
                <circle cx="0" cy="0" r="5" fill="#111111" />
                <text x="12" y="4" className="font-sans text-[10px] font-bold uppercase tracking-wider fill-[#666666]">Patient</text>
              </g>
              {/* Doctor */}
              <g className="translate-x-[480px] translate-y-[150px]">
                <circle cx="0" cy="0" r="5" fill="#111111" />
                <text x="-65" y="4" className="font-sans text-[10px] font-bold uppercase tracking-wider fill-[#666666]">Doctor</text>
              </g>
              {/* Hospital */}
              <g className="translate-x-[100px] translate-y-[350px]">
                <circle cx="0" cy="0" r="5" fill="#111111" />
                <text x="12" y="4" className="font-sans text-[10px] font-bold uppercase tracking-wider fill-[#666666]">Hospital</text>
              </g>
              {/* Laboratory */}
              <g className="translate-x-[500px] translate-y-[350px]">
                <circle cx="0" cy="0" r="5" fill="#111111" />
                <text x="-80" y="4" className="font-sans text-[10px] font-bold uppercase tracking-wider fill-[#666666]">Laboratory</text>
              </g>
              {/* Insurance */}
              <g className="translate-x-[200px] translate-y-[520px]">
                <circle cx="0" cy="0" r="5" fill="#111111" />
                <text x="-68" y="4" className="font-sans text-[10px] font-bold uppercase tracking-wider fill-[#666666]">Insurance</text>
              </g>
              {/* Pharmacy */}
              <g className="translate-x-[400px] translate-y-[520px]">
                <circle cx="0" cy="0" r="5" fill="#111111" />
                <text x="12" y="4" className="font-sans text-[10px] font-bold uppercase tracking-wider fill-[#666666]">Pharmacy</text>
              </g>
              {/* Blockchain network center label */}
              <g className="translate-x-[300px] translate-y-[300px]">
                <circle cx="0" cy="0" r="8" fill="#111111" />
                <circle cx="0" cy="0" r="16" fill="none" stroke="#111111" strokeWidth="1" className="animate-ping" style={{ animationDuration: '3s' }} />
              </g>
            </svg>
          </div>

          {/* Premium Laptop Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="relative z-10 w-full max-w-[460px] sm:max-w-[500px]"
          >
            {/* Screen border */}
            <div className="bg-[#1f1f1f] p-3 rounded-t-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border border-[#333333]">
              {/* Screen Content */}
              <div className="bg-[#FFFFFF] rounded-lg aspect-[16/10] overflow-hidden flex flex-col text-[#111111] relative font-sans select-none border border-[#ECECEC]">
                {/* Platform Header */}
                <div className="bg-[#F7F4EB] border-b border-[#ECECEC] px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#DC2626]/20 border border-[#DC2626]/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#D97706]/20 border border-[#D97706]/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A]/20 border border-[#16A34A]/40" />
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-[#666666] uppercase">
                    HealthChain Console v2.4
                  </span>
                  <span className="text-[9px] font-mono font-bold text-[#16A34A] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] inline-block animate-pulse" />
                    NODE_ONLINE
                  </span>
                </div>

                {/* Platform Inner Grid */}
                <div className="flex-1 grid grid-cols-3">
                  
                  {/* Left Column: Navigation / Nodes */}
                  <div className="border-r border-[#ECECEC] bg-[#FFFFFF] p-3 flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-[#666666] uppercase tracking-wider mb-2">Connected Entities</p>
                      <div className="space-y-1.5">
                        <div className="p-1 rounded bg-[#F7F4EB] border border-[#ECECEC] flex items-center justify-between">
                          <span className="text-[9px] font-bold">St. Jude Medical</span>
                          <span className="text-[8px] text-[#16A34A] font-bold">OK</span>
                        </div>
                        <div className="p-1 rounded bg-white border border-[#ECECEC] flex items-center justify-between">
                          <span className="text-[9px] text-[#666666]">Aster Diagnostics</span>
                          <span className="text-[8px] text-[#16A34A] font-bold">OK</span>
                        </div>
                        <div className="p-1 rounded bg-white border border-[#ECECEC] flex items-center justify-between">
                          <span className="text-[9px] text-[#666666]">Max Health ERP</span>
                          <span className="text-[8px] text-[#16A34A] font-bold">OK</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-[#ECECEC] pt-2">
                      <p className="text-[8px] text-[#666666] font-mono">Consensus: POS</p>
                      <p className="text-[8px] text-[#666666] font-mono">Gas: 0.00 Gwei</p>
                    </div>
                  </div>

                  {/* Middle & Right: Active ledger & charts */}
                  <div className="col-span-2 p-3 flex flex-col justify-between bg-[#FFFFFF]">
                    <div>
                      <div className="flex items-center justify-between border-b border-[#F3F3F3] pb-2 mb-2">
                        <h4 className="text-[10px] font-bold">Patient Ledger Records</h4>
                        <span className="text-[9px] font-mono font-bold text-[#2563EB]">0x98...3c9e</span>
                      </div>

                      {/* Transaction Feed */}
                      <div className="space-y-1.5">
                        <div className="p-1.5 rounded border border-[#ECECEC] bg-[#FFFFFF]">
                          <div className="flex items-center justify-between text-[9px] font-semibold">
                            <span>Block #104829</span>
                            <span className="text-[#16A34A]">Consent Set</span>
                          </div>
                          <p className="text-[8px] text-[#666666] font-mono mt-0.5">Checksum: 0x8a92...bc01</p>
                        </div>

                        <div className="p-1.5 rounded border border-[#ECECEC] bg-[#FFFFFF]">
                          <div className="flex items-center justify-between text-[9px] font-semibold">
                            <span>Block #104828</span>
                            <span className="text-[#2563EB]">Record Uploaded</span>
                          </div>
                          <p className="text-[8px] text-[#666666] font-mono mt-0.5">Checksum: 0x4f12...e304</p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom row */}
                    <div className="border-t border-[#ECECEC] pt-2 flex items-center justify-between">
                      <span className="text-[9px] text-[#666666]">System load: 0.12%</span>
                      <span className="px-2 py-0.5 bg-[#E8F0FE] text-[#2563EB] rounded text-[8px] font-bold">128 ms Latency</span>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Laptop Base */}
            <div className="bg-[#dcdcdc] h-2.5 rounded-b-xl border-t border-[#f0f0f0] relative shadow-lg">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#b0b0b0] rounded-b" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
