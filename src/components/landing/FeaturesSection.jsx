import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, Video, FileText, Calendar, CheckSquare, Activity, Compass, Lock, BarChart2 } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      title: 'Encrypted Medical Wallet',
      subtitle: 'Sovereign patient records storage',
      desc: 'All health history logs, diagnostic papers, and demographic details are compiled into a single encrypted wallet. AES-256 local encryption ensures no file leaves your device in cleartext.',
      icon: ShieldCheck,
      svg: (
        <svg viewBox="0 0 320 220" className="w-full h-full max-w-[280px]">
          <rect x="20" y="40" width="280" height="140" rx="8" fill="none" stroke="#111111" strokeWidth="1.5" />
          <line x1="20" y1="90" x2="300" y2="90" stroke="#ECECEC" strokeWidth="1.5" />
          <circle cx="260" cy="65" r="10" fill="none" stroke="#111111" strokeWidth="1.5" />
          <circle cx="260" cy="65" r="4" fill="#14B8A6" />
          <rect x="50" y="115" width="120" height="8" rx="2" fill="#ECECEC" />
          <rect x="50" y="135" width="160" height="8" rx="2" fill="#ECECEC" />
          <circle cx="250" cy="140" r="18" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="3,3" />
          <path d="M246 137l3 3 5-5" fill="none" stroke="#2563EB" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      title: 'AI Health Assistant',
      subtitle: 'Clinical document parsing',
      desc: 'Simplify complex medical documentation. Our integrated local LLMs parse jargon-heavy lab summaries, medication guidelines, and clinical write-ups into plain English briefs.',
      icon: Cpu,
      svg: (
        <svg viewBox="0 0 320 220" className="w-full h-full max-w-[280px]">
          <circle cx="160" cy="110" r="60" fill="none" stroke="#ECECEC" strokeWidth="1" />
          <circle cx="160" cy="110" r="40" fill="none" stroke="#111111" strokeWidth="1.5" strokeDasharray="4,4" className="animate-[spin_40s_linear_infinite]" />
          <circle cx="160" cy="50" r="6" fill="#111111" />
          <circle cx="220" cy="110" r="6" fill="#14B8A6" />
          <circle cx="160" cy="170" r="6" fill="#2563EB" />
          <circle cx="100" cy="110" r="6" fill="#111111" />
          <line x1="160" y1="50" x2="160" y2="170" stroke="#ECECEC" strokeWidth="0.5" />
          <line x1="100" y1="110" x2="220" y2="110" stroke="#ECECEC" strokeWidth="0.5" />
          <circle cx="160" cy="110" r="15" fill="#111111" />
        </svg>
      ),
    },
    {
      title: 'Decentralized Telemedicine',
      subtitle: 'Verified point-to-point care',
      desc: 'Consult online with verified clinicians through encrypted peer-to-peer audio-video channels. Verify doctor license credentials dynamically against national registries before starting.',
      icon: Video,
      svg: (
        <svg viewBox="0 0 320 220" className="w-full h-full max-w-[280px]">
          <rect x="40" y="30" width="240" height="150" rx="8" fill="none" stroke="#111111" strokeWidth="1.5" />
          <rect x="30" y="180" width="260" height="10" rx="3" fill="#111111" />
          <circle cx="160" cy="45" r="3" fill="#14B8A6" />
          {/* Waves inside screen */}
          <path d="M70 120q25-30 50 0t50 0t50 0t50 0" fill="none" stroke="#2563EB" strokeWidth="1.5" />
          <path d="M70 130q25-20 50 0t50 0t50 0t50 0" fill="none" stroke="#14B8A6" strokeWidth="1" />
        </svg>
      ),
    },
    {
      title: 'Digital Prescriptions',
      subtitle: 'Signed medical credentials',
      desc: 'Receive prescriptions signed by your clinician using cryptographic key pairs. Pharmacy nodes query these signatures on-chain to authorize and fill prescriptions securely.',
      icon: FileText,
      svg: (
        <svg viewBox="0 0 320 220" className="w-full h-full max-w-[280px]">
          <rect x="50" y="30" width="220" height="160" rx="6" fill="none" stroke="#111111" strokeWidth="1.5" />
          <line x1="80" y1="65" x2="240" y2="65" stroke="#111111" strokeWidth="1.5" />
          <line x1="80" y1="90" x2="200" y2="90" stroke="#ECECEC" strokeWidth="1.5" />
          <line x1="80" y1="110" x2="220" y2="110" stroke="#ECECEC" strokeWidth="1.5" />
          <circle cx="210" cy="155" r="16" fill="none" stroke="#14B8A6" strokeWidth="1.5" />
          <path d="M205 155l3 3 5-5" fill="none" stroke="#14B8A6" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      title: 'Universal Medical Timeline',
      subtitle: 'Historical record indexing',
      desc: 'Visualize your entire clinical history sequentially. From infancy diagnoses to recent lab evaluations, your life logs are neatly indexed in a clean medical timeline.',
      icon: Calendar,
      svg: (
        <svg viewBox="0 0 320 220" className="w-full h-full max-w-[280px]">
          <line x1="160" y1="20" x2="160" y2="200" stroke="#111111" strokeWidth="1.5" strokeDasharray="3,3" />
          <circle cx="160" cy="50" r="8" fill="#111111" />
          <circle cx="160" cy="110" r="8" fill="#14B8A6" />
          <circle cx="160" cy="170" r="8" fill="#2563EB" />
          <text x="180" y="54" className="text-[10px] font-sans font-bold text-[#111111]">Admitted 2021</text>
          <text x="60" y="114" className="text-[10px] font-sans font-bold text-[#14B8A6]">MRI Verified</text>
          <text x="180" y="174" className="text-[10px] font-sans font-bold text-[#2563EB]">Vaccine #3</text>
        </svg>
      ),
    },
    {
      title: 'Appointment Scheduling',
      subtitle: 'Frictionless provider booking',
      desc: 'Schedule in-person or telemedicine reviews. Integrated double-booking checks guarantee real-time availability slots without third-party listing networks.',
      icon: CheckSquare,
      svg: (
        <svg viewBox="0 0 320 220" className="w-full h-full max-w-[280px]">
          <rect x="60" y="40" width="200" height="140" rx="6" fill="none" stroke="#111111" strokeWidth="1.5" />
          <line x1="60" y1="80" x2="260" y2="80" stroke="#111111" strokeWidth="1.5" />
          <circle cx="100" cy="60" r="4" fill="#14B8A6" />
          <circle cx="220" cy="60" r="4" fill="#2563EB" />
          <rect x="90" y="110" width="30" height="20" rx="3" fill="none" stroke="#ECECEC" strokeWidth="1.5" />
          <rect x="145" y="110" width="30" height="20" rx="3" fill="#111111" />
          <rect x="200" y="110" width="30" height="20" rx="3" fill="none" stroke="#ECECEC" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      title: 'Emergency Medical Profile',
      subtitle: 'Life-saving critical access',
      desc: 'Provide authorized emergency first responders with instant, read-only access to vital allergy lists, blood groupings, and cardiac flags, bypassing regular consent forms during trauma events.',
      icon: Activity,
      svg: (
        <svg viewBox="0 0 320 220" className="w-full h-full max-w-[280px]">
          <circle cx="160" cy="110" r="70" fill="none" stroke="#ECECEC" strokeWidth="1" />
          <circle cx="160" cy="110" r="50" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="5,5" className="animate-pulse" />
          <circle cx="160" cy="110" r="20" fill="#DC2626" />
          <path d="M154 110h12M160 104v12" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
        </svg>
      ),
    },
    {
      title: 'Blockchain Verification',
      subtitle: 'Immutable integrity logs',
      desc: 'Check the absolute integrity of your charts. HealthChain verifies records matching on-chain cryptographic signatures to expose modifications, data rot, or unauthorized writes.',
      icon: Compass,
      svg: (
        <svg viewBox="0 0 320 220" className="w-full h-full max-w-[280px]">
          <rect x="60" y="60" width="70" height="60" rx="4" fill="none" stroke="#111111" strokeWidth="1.5" />
          <rect x="190" y="60" width="70" height="60" rx="4" fill="none" stroke="#111111" strokeWidth="1.5" />
          <rect x="125" y="120" width="70" height="60" rx="4" fill="none" stroke="#14B8A6" strokeWidth="1.5" />
          <line x1="130" y1="90" x2="190" y2="90" stroke="#ECECEC" strokeWidth="1.5" />
          <line x1="95" y1="120" x2="125" y2="150" stroke="#ECECEC" strokeWidth="1.5" />
          <line x1="225" y1="120" x2="195" y2="150" stroke="#ECECEC" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      title: 'Sovereign Consent Management',
      subtitle: 'Dynamic granular access gates',
      desc: 'Toggle access on/off for specific clinics, doctors, or researchers. Set expiry rules (e.g. 2 hours, 1 day) that automatically lock your documents when consultations end.',
      icon: Lock,
      svg: (
        <svg viewBox="0 0 320 220" className="w-full h-full max-w-[280px]">
          {/* Toggles */}
          <rect x="60" y="60" width="80" height="30" rx="15" fill="#14B8A6" />
          <circle cx="125" cy="75" r="11" fill="#FFFFFF" />
          <rect x="180" y="60" width="80" height="30" rx="15" fill="#ECECEC" />
          <circle cx="195" cy="75" r="11" fill="#FFFFFF" />
          <text x="60" y="125" className="text-[10px] font-sans font-bold text-[#14B8A6]">St. Jude: ACTIVE</text>
          <text x="180" y="125" className="text-[10px] font-sans font-bold text-[#666666]">Aster Lab: REVOKED</text>
        </svg>
      ),
    },
    {
      title: 'Health Trend Analytics',
      subtitle: 'Integrated vitals logging',
      desc: 'Link wearable sensors and clinical metrics to a clean dashboard. Spot heart rate shifts, respiratory warnings, and glucose trends with fully privacy-masked visual charts.',
      icon: BarChart2,
      svg: (
        <svg viewBox="0 0 320 220" className="w-full h-full max-w-[280px]">
          <line x1="40" y1="160" x2="280" y2="160" stroke="#111111" strokeWidth="1.5" />
          <line x1="40" y1="40" x2="40" y2="160" stroke="#111111" strokeWidth="1" />
          <path d="M40 140l40-30 40 10 40-50 40 20 40-40 40 10" fill="none" stroke="#2563EB" strokeWidth="2" />
          <circle cx="280" cy="60" r="4" fill="#2563EB" />
          <path d="M40 150l40-10 40-20 40-5 40-15 40 10 40-30 40-5" fill="none" stroke="#14B8A6" strokeWidth="1" strokeDasharray="3,3" />
        </svg>
      ),
    },
  ];

  return (
    <section id="features" className="py-24 bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="max-w-3xl mb-24">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
            System Features
          </span>
          <h2 className="font-sans text-4xl sm:text-5xl font-normal tracking-tight text-[#111111] leading-[1.1] mt-4">
            Security & Portability, Combined
          </h2>
        </div>

        {/* Alternating Features Layout */}
        <div className="space-y-32">
          {features.map((feat, idx) => {
            const isEven = idx % 2 === 0;
            const Icon = feat.icon;

            return (
              <div
                key={idx}
                className="grid lg:grid-cols-12 gap-12 items-center"
              >
                {/* Text Content */}
                <div
                  className={`lg:col-span-6 flex flex-col text-left ${
                    isEven ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  <div className="w-10 h-10 rounded bg-[#F7F4EB] border border-[#ECECEC] flex items-center justify-center text-[#111111] mb-6">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#666666]">
                    {feat.subtitle}
                  </span>
                  <h3 className="font-sans text-2xl font-bold tracking-tight text-[#111111] mt-2 mb-4">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-[#666666] leading-relaxed max-w-lg">
                    {feat.desc}
                  </p>
                </div>

                {/* SVG Visual (Cream box wrapper) */}
                <div
                  className={`lg:col-span-6 flex justify-center items-center p-8 bg-[#F7F4EB] border border-[#ECECEC] rounded min-h-[260px] ${
                    isEven ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  {feat.svg}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
