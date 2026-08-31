import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Building2, KeyRound, ArrowRight, ShieldCheck, Cpu, LayoutGrid, Heart,
  Activity, Star, CheckCircle, ChevronRight, Play, Server, Layers, Link as LinkIcon
} from 'lucide-react';
import Header from '../../components/landing/Header';
import Footer from '../../components/landing/Footer';

export default function HospitalLanding() {
  const navigate = useNavigate();
  const [mockHeight, setMockHeight] = useState(108495);

  // Simulating live blockchain heights on the mockup screenshot
  useEffect(() => {
    const timer = setInterval(() => {
      setMockHeight(prev => prev + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const integrations = [
    { name: 'Epic Systems', desc: 'Direct HL7/FHIR mappings for patient data synchronization.' },
    { name: 'Oracle Health (Cerner)', desc: 'Bi-directional EHR syncing and clinical record exports.' },
    { name: 'Salesforce Health Cloud', desc: 'Customer relationship and patient experience synchronization.' },
    { name: 'Microsoft Dynamics 365', desc: 'Enterprise ERP inventory and operational financials.' },
    { name: 'ABDM Sandboxed Node', desc: 'Ayushman Bharat Digital Mission sovereign integrations.' },
    { name: 'HL7 / FHIR Gateway', desc: 'International standard semantic clinical interoperability.' }
  ];

  const benefits = [
    { title: 'ABDM & FHIR Compliance', desc: 'Direct mapping into the Ayushman Bharat Digital Mission registry and HL7/FHIR compliant data stores.', icon: ShieldCheck },
    { title: 'Zero-Knowledge Consent', desc: 'Patient clinical files remain fully encrypted symmetrically until patient signature consensus grants decrypt permissions.', icon: KeyRound },
    { title: 'Inter-Branch Synced Nodes', desc: 'Deploy dedicated local validator nodes to sync outpatient queues, ward rosters, and lab findings instantly.', icon: Building2 },
    { title: 'Clinical AI Synthesizer', desc: 'Automate ICD-10 medical coding, summarize long patient files, and detect treatment alerts.', icon: Cpu }
  ];

  const testimonials = [
    {
      quote: "HealthChain reduced our pre-authorization clearance cycle from 12 days to immediate smart contract settlement. It's the standard for modern healthcare networks.",
      author: "Dr. Rachel Vance",
      role: "Chief Medical Officer, St. Jude Healthcare Network"
    },
    {
      quote: "The zero-knowledge consent architecture resolved our compliance vulnerabilities. Patient files sync seamlessly across 4 diagnostics labs with audit trails.",
      author: "Marcus Sterling",
      role: "IT Director, Northeast Regional Diagnostics"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans selection:bg-[#E8F0FE] selection:text-[#2563EB] scroll-smooth">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 border-b border-[#ECECEC] bg-[#FFFFFF]">
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#111111_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666] mb-4 bg-[#F7F4EB] px-3 py-1 rounded-[12px] border border-[#ECECEC]">
            Enterprise Suite For Hospitals
          </span>
          <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.08] max-w-4xl mb-8">
            Experience the Complete<br />
            <span className="font-bold">HealthChain Hospital ERP</span>
          </h1>
          <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-2xl mb-10">
            A secure clinical console for hospitals, laboratories, and insurance providers. Connect administrative workflows and patient records using zero-knowledge consent vaults.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center mb-16 relative z-10">
            <button
              onClick={() => navigate('/hospital/register')}
              className="px-6 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase tracking-widest rounded-[12px] transition-colors"
            >
              Register Hospital
            </button>
            <button
              onClick={() => navigate('/hospital/login')}
              className="px-6 py-3.5 bg-transparent border border-[#111111] text-[#111111] text-xs font-bold uppercase tracking-widest rounded-[12px] hover:bg-[#111111]/5 transition-colors"
            >
              Sign In to Console
            </button>
            <button
              onClick={() => navigate('/book-demo')}
              className="px-6 py-3.5 bg-[#F7F4EB] border border-[#ECECEC] text-[#111111] text-xs font-bold uppercase tracking-widest rounded-[12px] hover:bg-white transition-colors"
            >
              Book Enterprise Demo
            </button>
          </div>

          {/* Premium Handcrafted Interactive Dashboard Preview Frame (Simulated Screenshot) */}
          <div className="w-full max-w-5xl bg-[#F7F4EB] border border-[#ECECEC] rounded-[12px] overflow-hidden shadow-md">
            
            {/* Window bar */}
            <div className="bg-white border-b border-[#ECECEC] px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="text-[10px] font-mono text-[#666666] ml-3">console.healthchain.org/hospital/dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                <span className="text-[9px] font-mono text-[#666666]">Node #{mockHeight} Synced</span>
              </div>
            </div>
            
            {/* Dashboard Workspace */}
            <div className="flex bg-white h-[380px] text-left text-xs text-[#111111]">
              
              {/* Mock Sidebar */}
              <div className="w-48 bg-[#F7F4EB] border-r border-[#ECECEC] p-4 flex flex-col justify-between shrink-0">
                <div className="space-y-4">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-[#666666]">St. Jude Hospital</div>
                  <nav className="space-y-1 text-[11px] font-medium text-[#666666]">
                    <div className="flex items-center gap-2 p-1.5 bg-white border border-[#ECECEC] rounded-[8px] text-[#111111] font-bold"><LayoutGrid className="w-3.5 h-3.5" /> Dashboard</div>
                    <div className="flex items-center gap-2 p-1.5"><Users className="w-3.5 h-3.5" /> Patients</div>
                    <div className="flex items-center gap-2 p-1.5"><Calendar className="w-3.5 h-3.5" /> Appointments</div>
                    <div className="flex items-center gap-2 p-1.5"><TestTube className="w-3.5 h-3.5" /> Laboratory</div>
                    <div className="flex items-center gap-2 p-1.5"><Pill className="w-3.5 h-3.5" /> Pharmacy</div>
                    <div className="flex items-center gap-2 p-1.5"><KeyRound className="w-3.5 h-3.5" /> Blockchain</div>
                  </nav>
                </div>
                <div className="text-[10px] text-[#666666] font-mono border-t border-[#ECECEC] pt-2">
                  System operational
                </div>
              </div>

              {/* Mock Workspace Content */}
              <div className="flex-1 p-6 space-y-6 overflow-hidden">
                <div className="flex justify-between items-center pb-3 border-b border-[#ECECEC]">
                  <div>
                    <h3 className="font-bold text-sm">Dashboard Overview</h3>
                    <p className="text-[10px] text-[#666666]">Real-time operational sync status.</p>
                  </div>
                  <div className="px-2.5 py-1 bg-[#E8F0FE] text-[#2563EB] rounded-[8px] text-[10px] font-mono font-bold">ABDM Verified</div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#F7F4EB]/30 p-4 border border-[#ECECEC] rounded-[12px] space-y-1">
                    <span className="text-[9px] uppercase font-bold text-[#666666]">Outpatient Queue</span>
                    <p className="text-xl font-bold">14 Active</p>
                  </div>
                  <div className="bg-[#F7F4EB]/30 p-4 border border-[#ECECEC] rounded-[12px] space-y-1">
                    <span className="text-[9px] uppercase font-bold text-[#666666]">Total Bed Capacity</span>
                    <p className="text-xl font-bold">84% Occupied</p>
                  </div>
                  <div className="bg-[#F7F4EB]/30 p-4 border border-[#ECECEC] rounded-[12px] space-y-1">
                    <span className="text-[9px] uppercase font-bold text-[#666666]">Pending Lab Reports</span>
                    <p className="text-xl font-bold text-[#D97706]">6 Orders</p>
                  </div>
                </div>

                {/* Patient table preview */}
                <div className="border border-[#ECECEC] rounded-[8px] overflow-hidden">
                  <div className="bg-[#F7F4EB] p-2 border-b border-[#ECECEC] font-bold text-[10px] text-[#666666] uppercase">Active Queue</div>
                  <div className="p-3 space-y-2 text-[11px]">
                    <div className="flex justify-between border-b border-[#ECECEC] pb-1.5">
                      <span className="font-bold">Dr. Amanda Ross</span>
                      <span className="text-[#666666]">General OPD Clinic (Room 10)</span>
                      <span className="font-mono text-[#16A34A] font-bold">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Dr. Marcus Vance</span>
                      <span className="text-[#666666]">Cardiology Consultations (Room 12)</span>
                      <span className="font-mono text-[#2563EB] font-bold">On Call</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Hospital Workflow Visualization */}
      <section className="py-24 bg-[#F7F4EB] border-b border-[#ECECEC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666] bg-white px-3 py-1 rounded-[12px] border border-[#ECECEC]">
              Workflow Orchestration
            </span>
            <h2 className="font-sans text-3xl sm:text-4xl font-normal tracking-tight text-[#111111] mt-4">
              Connected Clinical Workflows.
            </h2>
            <p className="text-xs text-[#666666] mt-2">How HealthChain ERP coordinates hospital processes securely.</p>
          </div>

          {/* Workflow nodes */}
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white border border-[#ECECEC] p-6 rounded-[12px] space-y-3 relative">
              <div className="w-8 h-8 rounded-[8px] bg-[#E8F0FE] text-[#2563EB] flex items-center justify-center font-bold">1</div>
              <h4 className="font-bold text-xs uppercase tracking-wider">Patient Registration</h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Admissions desk pulls validated health credentials via ABHA. Verification is signed immutable.
              </p>
            </div>
            <div className="bg-white border border-[#ECECEC] p-6 rounded-[12px] space-y-3 relative">
              <div className="w-8 h-8 rounded-[8px] bg-[#E8F0FE] text-[#2563EB] flex items-center justify-center font-bold">2</div>
              <h4 className="font-bold text-xs uppercase tracking-wider">EMR Decryption</h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Consulting doctor requests access. Patient signs verification consent key on their device to decrypt files.
              </p>
            </div>
            <div className="bg-white border border-[#ECECEC] p-6 rounded-[12px] space-y-3 relative">
              <div className="w-8 h-8 rounded-[8px] bg-[#E8F0FE] text-[#2563EB] flex items-center justify-center font-bold">3</div>
              <h4 className="font-bold text-xs uppercase tracking-wider">Lab Verification</h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Lab results are uploaded. HealthChain auto-hashes the record and commits the hash audit to the consensus node.
              </p>
            </div>
            <div className="bg-white border border-[#ECECEC] p-6 rounded-[12px] space-y-3 relative">
              <div className="w-8 h-8 rounded-[8px] bg-[#E8F0FE] text-[#2563EB] flex items-center justify-center font-bold">4</div>
              <h4 className="font-bold text-xs uppercase tracking-wider">Claims Clearing</h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Billing pushes ICD codes. Insurance pre-auth matches the policy smart contract for instant claims validation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Benefits */}
      <section className="py-24 bg-white border-b border-[#ECECEC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
              Key Benefits
            </span>
            <h2 className="font-sans text-4xl font-normal tracking-tight text-[#111111] leading-tight mt-4">
              Modern Clinical Ledger Technology.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white border border-[#ECECEC] p-6 rounded-[12px] flex flex-col justify-between hover:border-[#111111] transition-all">
                  <div className="space-y-4">
                    <div className="w-8 h-8 rounded-[8px] bg-[#F7F4EB] flex items-center justify-center text-[#111111]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-xs uppercase tracking-wider">{item.title}</h3>
                    <p className="text-xs text-[#666666] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customer Success Stories */}
      <section className="py-24 bg-[#F7F4EB] border-b border-[#ECECEC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
              Customer Success
            </span>
            <h2 className="font-sans text-3xl font-normal tracking-tight text-[#111111] mt-4">
              Proven in Clinical Settings.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white border border-[#ECECEC] p-8 rounded-[12px] space-y-4 flex flex-col justify-between">
                <p className="text-xs text-[#111111] italic leading-relaxed">
                  "{t.quote}"
                </p>
                <div>
                  <h4 className="font-bold text-xs text-[#111111]">{t.author}</h4>
                  <p className="text-[10px] text-[#666666] mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Integrations Grid */}
      <section className="py-24 bg-white border-b border-[#ECECEC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
              Interoperability Grid
            </span>
            <h2 className="font-sans text-3xl font-normal tracking-tight text-[#111111] mt-4">
              Enterprise Integrations.
            </h2>
            <p className="text-xs text-[#666666] mt-2">Compatible with standard clinical setups and legacy record indexes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {integrations.map((item, idx) => (
              <div key={idx} className="p-5 border border-[#ECECEC] rounded-[12px] bg-[#F7F4EB]/20 space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#111111]">{item.name}</h3>
                <p className="text-xs text-[#666666] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-28 bg-[#F7F4EB] text-center border-b border-[#ECECEC]">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <h2 className="font-sans text-4xl font-normal tracking-tight text-[#111111] leading-tight">
            Deploy HealthChain inside Your Network Today.
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/hospital/register')}
              className="px-8 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase tracking-widest rounded-[12px] shadow-sm transition-colors"
            >
              Register Hospital
            </button>
            <button
              onClick={() => navigate('/hospital/login')}
              className="px-8 py-3.5 bg-transparent border border-[#111111] text-[#111111] text-xs font-bold uppercase tracking-widest rounded-[12px] hover:bg-[#111111]/5 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Helper icons needed in file
function TestTube(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 7 8.97 19.03a4.5 4.5 0 0 1-6.364-6.364L14.7 3" />
      <path d="M12 5 2.7 14.3" />
      <path d="m16 9 3-3" />
      <path d="M16 3h5v5" />
    </svg>
  );
}

function Stethoscope(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4.8 2.3A10.4 10.4 0 0 0 2 10a10 10 0 0 0 20 0v-4a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v2a2 2 0 0 0-2 2h-4" />
      <path d="M18 10a6 6 0 1 1-12 0" />
      <circle cx="12" cy="18" r="3" />
    </svg>
  );
}
