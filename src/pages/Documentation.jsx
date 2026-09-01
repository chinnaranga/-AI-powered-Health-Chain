import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Rocket, Layers, Lock, Users, Stethoscope, Building2,
  TestTube, Code2, Shield, Server, Wrench, ChevronRight, ArrowRight,
  ExternalLink, Search, FileText, CheckCircle2, Copy, Check, Terminal,
  Activity, KeyRound, AlertCircle, HelpCircle
} from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function Documentation() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  // 12 Comprehensive Documentation Sections
  const docSections = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: Rocket,
      badge: 'Quickstart',
      title: 'Quickstart & Environment Setup',
      summary: 'Learn how to clone, configure, and launch a local HealthChain development node and web interface.',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-[#555555] leading-relaxed">
            HealthChain combines a React + Vite frontend with Solidity smart contracts and Firebase/Cloudflare decentralized storage bridges. Follow the steps below to run a complete local instance.
          </p>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">1. Clone & Install Dependencies</h4>
            <div className="p-4 rounded-xl bg-[#111111] text-[#A3E635] font-mono text-xs overflow-x-auto relative">
              <code>git clone https://github.com/chinnaranga/-AI-powered-Health-Chain.git{'\n'}cd -AI-powered-Health-Chain{'\n'}npm install</code>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">2. Configure Environment Variables</h4>
            <p className="text-xs text-[#666666]">Copy the example configuration file and fill in your Firebase and Cloudflare R2 credentials:</p>
            <div className="p-4 rounded-xl bg-[#111111] text-[#60A5FA] font-mono text-xs overflow-x-auto">
              <code>cp .env.example .env</code>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">3. Launch Vite Development Server</h4>
            <div className="p-4 rounded-xl bg-[#111111] text-[#A3E635] font-mono text-xs overflow-x-auto">
              <code>npm run dev</code>
            </div>
            <p className="text-xs text-[#666666]">The application will be accessible at <code className="font-mono text-[#2563EB]">http://localhost:5173</code>.</p>
          </div>
        </div>
      )
    },
    {
      id: 'architecture',
      name: 'Architecture',
      icon: Layers,
      badge: 'System Design',
      title: 'Decentralized Healthcare Architecture',
      summary: 'Explore how HealthChain pairs client-side encryption with on-chain cryptographic proofs and off-chain storage.',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-[#555555] leading-relaxed">
            HealthChain strictly follows the zero-knowledge principle for medical data. Raw clinical documents are never exposed in plaintext or stored directly on the blockchain ledger.
          </p>

          <div className="p-5 rounded-2xl bg-[#F7F4EB] border border-[#ECECEC] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">Key Architectural Tenets:</h4>
            <ul className="text-xs text-[#555555] space-y-2 list-disc pl-4">
              <li><strong>Client-Side Encryption:</strong> Records are encrypted using AES-GCM prior to transmission.</li>
              <li><strong>Off-Chain Encrypted Storage:</strong> Encrypted blobs are persisted to Cloudflare R2 and IPFS nodes.</li>
              <li><strong>On-Chain Integrity Hashes:</strong> Only SHA-256 digests and access policies are committed to the Solidity ledger.</li>
              <li><strong>Self-Sovereign Access:</strong> Only the patient holds the authority to grant or revoke scoped clinician viewing tokens.</li>
            </ul>
          </div>

          <div className="pt-2">
            <Link to="/developers/smart-contracts" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:underline">
              <span>View Smart Contract Architecture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )
    },
    {
      id: 'authentication',
      name: 'Authentication',
      icon: Lock,
      badge: 'Identity & Tokens',
      title: 'Authentication & Session Governance',
      summary: 'Understand Web3 cryptographic wallet signatures, Firebase Auth sessions, and scoped access tokens.',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-[#555555] leading-relaxed">
            HealthChain implements dual-layer identity verification. Users can authenticate using standard enterprise federated login (Firebase Auth) or direct Ethereum cryptographic wallet signatures (EIP-712).
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white border border-[#ECECEC]">
              <h5 className="text-xs font-bold text-[#111111] mb-1">Web3 Signatures</h5>
              <p className="text-xs text-[#666666]">Practitioners sign cryptographic challenges using Ethereum private keys to prove identity without transmitting passwords.</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#ECECEC]">
              <h5 className="text-xs font-bold text-[#111111] mb-1">Scoped JWT Tokens</h5>
              <p className="text-xs text-[#666666]">Time-bound bearer tokens ensure sessions automatically expire after clinical consultation windows close.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'user-roles',
      name: 'User Roles',
      icon: Users,
      badge: 'RBAC',
      title: 'Role-Based Access Controls (RBAC)',
      summary: 'Detailed permissions, clearance scopes, and boundaries for each stakeholder persona in the ecosystem.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[#555555] leading-relaxed">
            Access to HealthChain interfaces is strictly gated by role definitions:
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-white border border-[#ECECEC] flex items-start gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2563EB]/10 text-[#2563EB]">PATIENT</span>
              <p className="text-xs text-[#555555]">Full sovereign ownership of personal health vault, consent grant/revocation, and download rights.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#ECECEC] flex items-start gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#16A34A]/10 text-[#16A34A]">DOCTOR</span>
              <p className="text-xs text-[#555555]">Clinical chart reading (with consent), SOAP note authoring, diagnostic coding, and e-prescription issuance.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#ECECEC] flex items-start gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D97706]/10 text-[#D97706]">HOSPITAL ADMIN</span>
              <p className="text-xs text-[#555555]">Inpatient triage, bed allocations, doctor staff rosters, claims submission, and institutional auditing.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#ECECEC] flex items-start gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0D9488]/10 text-[#0D9488]">LABORATORY</span>
              <p className="text-xs text-[#555555]">Test requisition ingestion, specimen custody logging, analyzer parameter upload, and digital signing.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'patient-workflow',
      name: 'Patient Workflow',
      icon: Users,
      badge: 'Patient Portal',
      title: 'Patient App & Consent Lifecycle',
      summary: 'How patients manage records, approve doctor access requests, and share records with external hospitals.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[#555555] leading-relaxed">
            Patients interact through the dedicated <Link to="/patient-app" className="text-[#2563EB] font-bold hover:underline">Patient App</Link>.
          </p>
          <div className="p-4 rounded-xl bg-white border border-[#ECECEC] space-y-2 text-xs text-[#555555]">
            <p>1. Patient authenticates and receives their unique sovereign Global Health ID (ABHA).</p>
            <p>2. During hospital intake, patient receives a push notification prompt requesting time-bound access.</p>
            <p>3. Patient approves request, releasing temporary scoped decryption keys to the attending physician.</p>
            <p>4. After discharge, the patient retains the complete, signed consultation record in their mobile app.</p>
          </div>
        </div>
      )
    },
    {
      id: 'doctor-workflow',
      name: 'Doctor Workflow',
      icon: Stethoscope,
      badge: 'Clinician Console',
      title: 'Practitioner & EHR Consultation Workflow',
      summary: 'How doctors search patients, verify consent, document clinical encounters, and issue e-prescriptions.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[#555555] leading-relaxed">
            Clinicians access the <Link to="/doctor-portal" className="text-[#2563EB] font-bold hover:underline">Doctor Portal</Link> to streamline outpatient consultations without charting friction.
          </p>
          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#ECECEC] space-y-2 text-xs text-[#555555]">
            <p>• <strong>Patient Lookup:</strong> Search by Health ID or active clinic queue roster.</p>
            <p>• <strong>History Synthesis:</strong> Review past hospital admissions, allergies, and chronic conditions.</p>
            <p>• <strong>SOAP Charting:</strong> Document subjective symptoms, physical examination findings, and vitals.</p>
            <p>• <strong>Signed Prescriptions:</strong> Seal digital e-prescriptions with digital practitioner signatures.</p>
          </div>
        </div>
      )
    },
    {
      id: 'hospital-workflow',
      name: 'Hospital Workflow',
      icon: Building2,
      badge: 'Enterprise ERP',
      title: 'Enterprise Hospital Triage & Operations',
      summary: 'Admissions, inpatient ward allocations, inter-department referrals, and claims verification.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[#555555] leading-relaxed">
            Hospitals deploy the <Link to="/HospitalERP" className="text-[#2563EB] font-bold hover:underline">Hospital ERP</Link> module to coordinate large-scale clinical teams and administrative operations.
          </p>
          <div className="p-4 rounded-xl bg-white border border-[#ECECEC] space-y-2 text-xs text-[#555555]">
            <p>• Inpatient (IPD) and Outpatient (OPD) registry synchronization.</p>
            <p>• Emergency triage overrides with immediate audit logging.</p>
            <p>• Direct laboratory diagnostic integration and pharmacy inventory tracking.</p>
          </div>
        </div>
      )
    },
    {
      id: 'laboratory-workflow',
      name: 'Laboratory Workflow',
      icon: TestTube,
      badge: 'Diagnostic LIS',
      title: 'Pathology & Specimen Chain-of-Custody',
      summary: 'Electronic test requisitions, barcode custody tracking, and pathologist cryptographic signatures.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[#555555] leading-relaxed">
            Diagnostic centers utilize the <Link to="/lab-gateway" className="text-[#0D9488] font-bold hover:underline">Lab Gateway</Link> to bridge diagnostic analyzers with attending physicians.
          </p>
          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#ECECEC] space-y-2 text-xs text-[#555555]">
            <p>• Ingest electronic test orders directly from hospitals and clinics.</p>
            <p>• Scan specimen barcodes to log physical chain-of-custody.</p>
            <p>• Attach pathologist digital signature to guarantee tamper-proof diagnostic results.</p>
          </div>
        </div>
      )
    },
    {
      id: 'api-reference',
      name: 'API Reference',
      icon: Code2,
      badge: 'REST & JSON-LD',
      title: 'Developer REST & JSON-LD Endpoints',
      summary: 'Comprehensive schema for patients, providers, appointments, clinical records, and consent verification.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[#555555] leading-relaxed">
            Integrate your existing healthcare software with HealthChain REST endpoints.
          </p>
          <div className="p-5 rounded-2xl bg-[#F7F4EB] border border-[#ECECEC] flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold text-[#111111]">Interactive API Documentation</h5>
              <p className="text-xs text-[#666666]">Explore 11 modules with request and response examples.</p>
            </div>
            <Link to="/developers/api" className="px-4 py-2 rounded-xl bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors">
              Open API Docs
            </Link>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      name: 'Security',
      icon: Shield,
      badge: 'Zero-Trust',
      title: 'Institutional Security & Cryptography',
      summary: 'Client-side AES-GCM encryption, SHA-256 hash sealing, and non-repudiable audit logging.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[#555555] leading-relaxed">
            HealthChain applies defense-in-depth principles across every network boundary:
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-xs text-[#555555]">
            <div className="p-4 rounded-xl bg-white border border-[#ECECEC]">
              <strong className="text-[#111111] block mb-1">AES-GCM Symmetric Encryption</strong>
              256-bit encryption applied client-side on clinical devices prior to cloud persistence.
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#ECECEC]">
              <strong className="text-[#111111] block mb-1">Immutable Audit Telemetry</strong>
              Every chart lookup and prescription issuance generates a permanent timestamped event.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'deployment',
      name: 'Deployment',
      icon: Server,
      badge: 'DevOps & Cloud',
      title: 'Production Build & Node Deployment',
      summary: 'Instructions for building production bundles and deploying to Firebase Hosting or custom cloud gateways.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[#555555] leading-relaxed">
            Deploy the HealthChain frontend to Firebase Hosting or standard static CDN edge networks:
          </p>
          <div className="p-4 rounded-xl bg-[#111111] text-[#A3E635] font-mono text-xs overflow-x-auto space-y-1">
            <p>npm run build</p>
            <p>npx firebase deploy --only hosting</p>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      name: 'Troubleshooting',
      icon: Wrench,
      badge: 'Support & FAQs',
      title: 'Frequently Asked Questions & Troubleshooting',
      summary: 'Solutions for common setup errors, CORS issues, wallet signature rejections, and consent timeouts.',
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white border border-[#ECECEC] space-y-1">
            <h5 className="text-xs font-bold text-[#111111]">Q: Why is my local Hardhat node not connecting?</h5>
            <p className="text-xs text-[#666666]">Ensure you have launched <code className="font-mono bg-[#EAEAEA] px-1 py-0.5 rounded">npx hardhat node</code> in a separate terminal before running the deployment script.</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-[#ECECEC] space-y-1">
            <h5 className="text-xs font-bold text-[#111111]">Q: Where are the Cloudflare R2 bucket keys configured?</h5>
            <p className="text-xs text-[#666666]">Set <code className="font-mono text-[#2563EB]">VITE_R2_ACCESS_KEY_ID</code> and <code className="font-mono text-[#2563EB]">VITE_R2_SECRET_ACCESS_KEY</code> in your root <code className="font-mono">.env</code> file.</p>
          </div>
        </div>
      )
    }
  ];

  const currentSection = docSections.find((s) => s.id === activeSection) || docSections[0];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] font-sans selection:bg-[#E8F0FE] selection:text-[#2563EB] scroll-smooth">
      {/* Universal Navigation Header */}
      <Header />

      <main>
        {/* ========================================================================= */}
        {/* HERO SECTION                                                             */}
        {/* ========================================================================= */}
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 border-b border-[#ECECEC] bg-gradient-to-b from-[#F7F4EB]/70 via-white to-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111]/5 border border-[#111111]/10 mb-6">
                <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                  HealthChain Documentation & Knowledge Base
                </span>
              </div>

              <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] leading-[1.08] mb-6">
                Platform Architecture & <br />
                <span className="font-bold">Developer Documentation</span>
              </h1>

              <p className="text-base sm:text-lg text-[#666666] leading-relaxed mb-6">
                Comprehensive guides, architectural deep-dives, clinical workflows, and integration tutorials for engineers and healthcare administrators.
              </p>

              {/* Quick Links Header Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Link to="/developers/api" className="px-3 py-1.5 rounded-lg bg-white border border-[#ECECEC] text-xs font-semibold text-[#111111] hover:border-[#111111] transition-colors flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>REST API Reference</span>
                </Link>
                <Link to="/developers/smart-contracts" className="px-3 py-1.5 rounded-lg bg-white border border-[#ECECEC] text-xs font-semibold text-[#111111] hover:border-[#111111] transition-colors flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Smart Contracts</span>
                </Link>
                <a href="https://github.com/chinnaranga/-AI-powered-Health-Chain" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-white border border-[#ECECEC] text-xs font-semibold text-[#111111] hover:border-[#111111] transition-colors flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-[#666666]" />
                  <span>GitHub Repo</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* DOCUMENTATION INTERFACE: SIDEBAR + CONTENT VIEWER                         */}
        {/* ========================================================================= */}
        <section className="py-12 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Sidebar: 12 Documentation Guides */}
              <div className="lg:col-span-4 space-y-2 sticky top-28">
                <div className="p-3 bg-white rounded-xl border border-[#ECECEC] mb-4">
                  <div className="flex items-center gap-2 text-xs text-[#888888] px-2 py-1">
                    <Search className="w-3.5 h-3.5" />
                    <span>Documentation Guides (12 Sections)</span>
                  </div>
                </div>

                <div className="space-y-1 max-h-[640px] overflow-y-auto pr-1">
                  {docSections.map((sec) => {
                    const SecIcon = sec.icon;
                    const isActive = activeSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => setActiveSection(sec.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                          isActive
                            ? 'bg-[#111111] border-[#111111] text-white shadow-sm'
                            : 'bg-white border-[#ECECEC] hover:border-[#CCCCCC] text-[#333333]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isActive ? 'bg-white/10 text-white' : 'bg-[#F7F4EB] text-[#111111]'
                          }`}>
                            <SecIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold">{sec.name}</p>
                            <p className={`text-[10px] ${isActive ? 'text-white/70' : 'text-[#888888]'}`}>
                              {sec.badge}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#CCCCCC]'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Guide Content Display */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Guide Header Banner */}
                <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#ECECEC] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F7F4EB] border border-[#ECECEC] flex items-center justify-center text-[#111111]">
                      <currentSection.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#555555] border border-[#ECECEC]">
                      {currentSection.badge}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-[#111111] mb-2">{currentSection.title}</h2>
                  <p className="text-sm text-[#666666] leading-relaxed mb-6">{currentSection.summary}</p>

                  <div className="pt-6 border-t border-[#F3F4F6]">
                    {currentSection.content}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL CALL TO ACTION (CTA)                                               */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#F7F4EB] relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111] bg-white px-4 py-1.5 rounded-full border border-[#ECECEC] shadow-sm">
              Developer Support & Community
            </span>

            <h2 className="font-sans text-4xl sm:text-5xl font-normal tracking-tight text-[#111111] mt-6 mb-6 leading-[1.1]">
              Need Help Integrating Your <br />
              <span className="font-bold">Healthcare Systems?</span>
            </h2>

            <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-xl mx-auto mb-10">
              Our engineering team is available to assist hospital IT departments, diagnostic networks, and digital health developers with custom integrations.
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center">
              <button
                type="button"
                onClick={() => navigate('/book-demo')}
                className="px-9 py-4 rounded-xl bg-[#111111] text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-black hover:shadow-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <span>Schedule Developer Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/developers/api"
                className="px-9 py-4 rounded-xl bg-white text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
              >
                Explore REST APIs
              </Link>
            </div>

            <p className="mt-8 text-xs text-[#888888]">
              Standardized REST & JSON-LD • Verifiable Off-Chain & On-Chain Architecture
            </p>
          </div>
        </section>
      </main>

      {/* Universal Footer with Legal Modals & Newsletter */}
      <Footer />
    </div>
  );
}
