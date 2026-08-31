import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Shield, Key, Eye, UserCheck, BarChart2 } from 'lucide-react';

export default function ProductShowcase() {
  const [activeTab, setActiveTab] = useState(0);

  const products = [
    {
      title: 'Patient App',
      tagline: 'Personal health data wallet & sovereign identity manager',
      icon: Smartphone,
      previewTitle: 'Sovereign Medical Wallet',
      uiComponent: (
        <div className="bg-[#FFFFFF] rounded border border-[#ECECEC] p-4 text-[#111111] h-full flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#F3F3F3] pb-3 mb-3">
            <div>
              <p className="text-[9px] font-mono text-[#666666]">PATIENT IDENTIFIER</p>
              <h5 className="text-xs font-bold font-mono">ABHA: 91-8294-8291</h5>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-[#666666] uppercase tracking-wider">Active Credentials</p>
            <div className="p-2 bg-[#F7F4EB] rounded border border-[#ECECEC] flex items-center justify-between text-xs">
              <span className="font-semibold">St. Jude Cardiologist</span>
              <span className="text-[9px] font-mono bg-[#16A34A]/10 text-[#16A34A] px-1.5 py-0.5 rounded font-bold">GRANTED</span>
            </div>
            <div className="p-2 bg-[#FFFFFF] rounded border border-[#ECECEC] flex items-center justify-between text-xs">
              <span className="text-[#666666]">Max Imaging Lab</span>
              <span className="text-[9px] font-mono bg-[#666666]/10 text-[#666666] px-1.5 py-0.5 rounded">EXPIRED</span>
            </div>
          </div>

          <div className="border-t border-[#F3F3F3] pt-3 mt-3 flex items-center justify-between">
            <span className="text-[9px] text-[#666666]">Consent Keys: Enclave Encrypted</span>
            <button className="px-3 py-1 bg-[#111111] text-white text-[9px] font-bold uppercase tracking-wider rounded">Revoke All</button>
          </div>
        </div>
      ),
    },
    {
      title: 'Doctor Dashboard',
      tagline: 'Clinical record viewer with zero-trust authorization',
      icon: Eye,
      previewTitle: 'Clinician EHR Portal',
      uiComponent: (
        <div className="bg-[#FFFFFF] rounded border border-[#ECECEC] p-4 text-[#111111] h-full flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#F3F3F3] pb-3 mb-3">
            <h5 className="text-xs font-bold uppercase tracking-wider">Patient History: Sarah Jenkins</h5>
            <span className="text-[9px] font-mono bg-[#2563EB]/10 text-[#2563EB] px-1.5 py-0.5 rounded font-bold">AES_DECRYPTED</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[11px] border-b border-[#F3F3F3] py-1">
              <span className="text-[#666666]">Cardiology Assessment</span>
              <span className="font-mono text-[#111111]">St. Jude Hospital</span>
            </div>
            <div className="flex justify-between text-[11px] border-b border-[#F3F3F3] py-1">
              <span className="text-[#666666]">CBC Panel & Thyroid Profile</span>
              <span className="font-mono text-[#111111]">Dr. Lal PathLabs</span>
            </div>
            <div className="flex justify-between text-[11px] border-b border-[#F3F3F3] py-1">
              <span className="text-[#666666]">Discharge Summary</span>
              <span className="font-mono text-[#111111]">Apex Heart Institute</span>
            </div>
          </div>

          <div className="border-t border-[#F3F3F3] pt-3 mt-3 flex items-center justify-between">
            <span className="text-[9px] text-[#666666]">Access expires in: 14 mins</span>
            <button className="px-3 py-1 bg-[#111111] text-white text-[9px] font-bold uppercase tracking-wider rounded">Extend Session</button>
          </div>
        </div>
      ),
    },
    {
      title: 'Hospital ERP',
      tagline: 'National registry mapping and local gateway synchronizer',
      icon: Shield,
      previewTitle: 'Healthcare Gatekeeper Console',
      uiComponent: (
        <div className="bg-[#FFFFFF] rounded border border-[#ECECEC] p-4 text-[#111111] h-full flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#F3F3F3] pb-3 mb-3">
            <h5 className="text-xs font-bold uppercase tracking-wider">Gateway Status: Syncing</h5>
            <span className="text-[9px] font-mono text-[#16A34A] font-bold uppercase">LEDGER_OK</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center my-2">
            <div className="p-2 bg-[#F7F4EB] border border-[#ECECEC] rounded">
              <p className="text-[8px] uppercase tracking-wider text-[#666666] font-bold">Unsynced Records</p>
              <p className="text-sm font-bold mt-1">0</p>
            </div>
            <div className="p-2 bg-[#F7F4EB] border border-[#ECECEC] rounded">
              <p className="text-[8px] uppercase tracking-wider text-[#666666] font-bold">Verification Rate</p>
              <p className="text-sm font-bold mt-1">99.98%</p>
            </div>
          </div>

          <div className="border-t border-[#F3F3F3] pt-3 mt-1 flex items-center justify-between text-[9px] text-[#666666]">
            <span>Local DB Hash matching Blockchain</span>
            <span>Blocks: 104,835</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Lab Portal',
      tagline: 'Cryptographic report generation and patient key signing',
      icon: Key,
      previewTitle: 'Diagnostic Cryptography Engine',
      uiComponent: (
        <div className="bg-[#FFFFFF] rounded border border-[#ECECEC] p-4 text-[#111111] h-full flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#F3F3F3] pb-3 mb-3">
            <h5 className="text-xs font-bold uppercase tracking-wider">Laboratory Sign-off</h5>
            <span className="text-[9px] font-mono text-[#666666]">Pending Signatures</span>
          </div>

          <div className="space-y-1.5 text-[10px]">
            <div className="p-1 rounded bg-[#F3F3F3] border border-[#ECECEC] flex items-center justify-between">
              <span>Pathology Panel - #L-839</span>
              <button className="px-2 py-0.5 bg-[#111111] text-white rounded text-[8px] font-bold uppercase tracking-wider">Sign & Sync</button>
            </div>
            <div className="p-1 rounded bg-white border border-[#ECECEC] flex items-center justify-between">
              <span>Lipid Profile - #L-837</span>
              <span className="text-[8px] text-[#16A34A] font-bold uppercase tracking-wider">Signed & Synced</span>
            </div>
          </div>

          <div className="border-t border-[#F3F3F3] pt-3 mt-3 flex items-center justify-between text-[9px] text-[#666666]">
            <span>Keys signed under ECDSA SHA256</span>
            <span>Signer: Aster Lab Node 4</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Insurance Portal',
      tagline: 'Smart contract query system for instant claim processing',
      icon: UserCheck,
      previewTitle: 'Automated Claims Console',
      uiComponent: (
        <div className="bg-[#FFFFFF] rounded border border-[#ECECEC] p-4 text-[#111111] h-full flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#F3F3F3] pb-3 mb-3">
            <h5 className="text-xs font-bold uppercase tracking-wider">Insurer Auditing</h5>
            <span className="text-[9px] font-mono bg-[#16A34A]/10 text-[#16A34A] px-1.5 py-0.5 rounded font-bold">CLAIM_VERIFIED</span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between py-1 border-b border-[#F3F3F3]">
              <span className="text-[#666666]">Policy Number</span>
              <span className="font-mono font-bold">POL-4091-Jenkins</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F3F3F3]">
              <span className="text-[#666666]">Diagnosis Code</span>
              <span className="font-mono">ICD-10 (I25.1)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#666666]">Ledger Proof</span>
              <span className="font-mono text-[#2563EB] cursor-pointer">Verify Hash</span>
            </div>
          </div>

          <div className="border-t border-[#F3F3F3] pt-3 mt-2 flex items-center justify-between text-[9px] text-[#666666]">
            <span>Verified by Smart Contract</span>
            <span className="font-bold text-[#111111]">Payout authorized</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Government Portal',
      tagline: 'Aggregated analytics and regional healthcare index',
      icon: BarChart2,
      previewTitle: 'Public Health Registry & Index',
      uiComponent: (
        <div className="bg-[#FFFFFF] rounded border border-[#ECECEC] p-4 text-[#111111] h-full flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#F3F3F3] pb-3 mb-3">
            <h5 className="text-xs font-bold uppercase tracking-wider">National Health Registry</h5>
            <span className="text-[9px] font-mono text-[#666666]">Query active</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#666666]">Weekly Outbreak Reports</span>
              <span className="font-bold font-mono">0 Anomalies</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#666666]">Identity Registries Synced</span>
              <span className="font-bold font-mono">99.99%</span>
            </div>
            <div className="w-full bg-[#F3F3F3] h-1 rounded overflow-hidden mt-1">
              <div className="bg-[#111111] h-full rounded w-[85%]" />
            </div>
          </div>

          <div className="border-t border-[#F3F3F3] pt-3 mt-3 flex items-center justify-between text-[9px] text-[#666666]">
            <span>Aggregated compliance logs</span>
            <span className="text-[#16A34A] font-bold">HIPAA Audit Safe</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-24 bg-[#FFFFFF] border-b border-[#ECECEC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Editorial Heading Block */}
        <div className="max-w-3xl mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
            Healthcare Ecosystem
          </span>
          <h2 className="font-sans text-4xl sm:text-5xl font-normal tracking-tight text-[#111111] leading-[1.1] mt-4">
            Custom Interfaces for Every Stakeholder
          </h2>
          <p className="text-sm text-[#666666] leading-relaxed mt-4 max-w-xl">
            A cohesive suite of user applications, portal gateways, and auditing boards connecting patients, clinicians, and support networks.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Selector Tabs (Left Column) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-2">
              {products.map((p, idx) => {
                const Icon = p.icon;
                const isActive = activeTab === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`w-full text-left p-5 rounded border transition-all duration-300 flex items-center gap-4 ${
                      isActive ? 'bg-[#F7F4EB] border-[#111111] shadow-sm' : 'bg-transparent border-transparent hover:border-[#ECECEC] hover:bg-[#F7F4EB]/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded flex items-center justify-center border transition-colors ${
                      isActive ? 'bg-[#111111] border-[#111111] text-white' : 'bg-white border-[#ECECEC] text-[#666666]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#111111]">{p.title}</h4>
                      <p className="text-xs text-[#666666] mt-0.5">{p.tagline}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Realistic UI Mockup Display (Right Column) */}
          <div className="lg:col-span-7 bg-[#F7F4EB] border border-[#ECECEC] rounded p-8 md:p-12 flex flex-col justify-between relative overflow-hidden h-[420px]">
            {/* Screen decoration background */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#E8F0FE] rounded-full blur-3xl pointer-events-none opacity-40" />

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
                Ecosystem Application Interface
              </span>
              <h3 className="font-sans text-lg font-bold text-[#111111] mt-2 mb-6">
                {products[activeTab].previewTitle}
              </h3>
            </div>

            {/* Container for mock UI */}
            <div className="flex-1 max-w-md w-full mx-auto relative z-10 shadow-sm border border-[#ECECEC] rounded overflow-hidden h-fit">
              {products[activeTab].uiComponent}
            </div>

            <div className="mt-6 flex items-center justify-between text-[9px] text-[#666666]">
              <span>HealthChain Connected Node</span>
              <span>RESTful & JSON-LD standard</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
