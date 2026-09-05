import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, Eye, Building2, TestTube, FileText,
  UserCheck, Database, LayoutGrid, Smartphone, ChevronRight,
  TrendingUp, Map, Layers, Cpu, Code, ArrowRight, Settings, Check, Clock
} from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function BookDemo() {
  const [activePortal, setActivePortal] = useState(0);
  const [selectedWalkthroughStep, setSelectedWalkthroughStep] = useState(0);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [activeDemoCard, setActiveDemoCard] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    organization: '',
    jobTitle: '',
    email: '',
    phone: '',
    country: '',
    orgType: 'Hospital Group',
    hospitalSize: '100-500 beds',
    preferredDate: '',
    preferredTime: '',
    message: ''
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        fullName: '',
        organization: '',
        jobTitle: '',
        email: '',
        phone: '',
        country: '',
        orgType: 'Hospital Group',
        hospitalSize: '100-500 beds',
        preferredDate: '',
        preferredTime: '',
        message: ''
      });
    }, 4000);
  };

  const portals = [
    {
      name: 'Patient Portal',
      icon: Smartphone,
      tagline: 'Sovereign patient records wallet & identity manager',
      permissions: ['Read Own Records', 'Grant/Revoke Doctor Access', 'Export PDF', 'View Access Logs'],
      integrations: ['ABDM Ayushman Bharat', 'SMS Gateway', 'Encrypted Cloud Vault'],
      workflow: [
        { name: 'Registration', desc: 'Verify mobile OTP, authenticate Aadhaar, and generate digital health ID (ABHA).' },
        { name: 'Profile Setup', desc: 'Add emergency contacts, allergies, blood group, and chronic condition declarations.' },
        { name: 'Medical Records', desc: 'Upload lab papers, MRIs, vaccinations, and view cryptographically-signed provider records.' },
        { name: 'Appointment Booking', desc: 'Search regional practitioners and schedule virtual or clinic visits.' },
        { name: 'Consent Management', desc: 'Audit access logs and set time-limited access tokens for clinical teams.' }
      ],
      preview: (
        <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded p-5 text-[#111111] h-full flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#F3F3F3] pb-3">
            <div>
              <p className="text-[9px] font-mono text-[#666666]">PATIENT IDENTITY</p>
              <h4 className="text-xs font-bold font-mono">ABHA: 91-8294-8291</h4>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
          </div>
          <div className="space-y-2.5 my-4 flex-1 justify-center flex flex-col">
            <p className="text-[9px] font-bold text-[#666666] uppercase tracking-wider">Access Authorizations</p>
            <div className="p-2.5 bg-[#F7F4EB] rounded border border-[#ECECEC] flex items-center justify-between text-xs">
              <span className="font-semibold">Dr. Sarah Jenkins (Cardiology)</span>
              <span className="text-[9px] bg-[#16A34A]/10 text-[#16A34A] px-1.5 py-0.5 rounded font-bold">ACTIVE (2h)</span>
            </div>
            <div className="p-2.5 bg-[#FFFFFF] rounded border border-[#ECECEC] flex items-center justify-between text-xs">
              <span className="text-[#666666]">St. Jude Pathology Lab</span>
              <span className="text-[9px] bg-[#666666]/10 text-[#666666] px-1.5 py-0.5 rounded font-bold">REVOKED</span>
            </div>
          </div>
          <div className="border-t border-[#F3F3F3] pt-3 flex items-center justify-between text-[9px] text-[#666666]">
            <span>Keys stored in Device Secure Enclave</span>
            <span className="font-mono">Block: #104,835</span>
          </div>
        </div>
      )
    },
    {
      name: 'Doctor Portal',
      icon: Eye,
      tagline: 'Zero-trust historical medical record viewer',
      permissions: ['Read Permitted Patient Records', 'Write Prescriptions', 'Request Lab Test', 'Sign Document'],
      integrations: ['FHIR API Server', 'AI Summarizer Engine', 'E-Signature Gateway'],
      workflow: [
        { name: 'Secure Login', desc: 'Two-factor auth and hardware token check to activate clinician sessions.' },
        { name: 'Patient Search', desc: 'Lookup patients using registered ABHA codes or QR scanning.' },
        { name: 'Clinical Review', desc: 'Read historical reports decrypted via patient keys.' },
        { name: 'Prescription Signing', desc: 'Sign clinical notes and medications using personal keys.' }
      ],
      preview: (
        <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded p-5 text-[#111111] h-full flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#F3F3F3] pb-3">
            <div>
              <p className="text-[9px] font-mono text-[#666666]">CLINICIAN SESSION</p>
              <h4 className="text-xs font-bold">Dr. Amanda Ross, MD</h4>
            </div>
            <span className="text-[9px] font-mono text-[#16A34A] font-bold">AUTH_TOKEN_OK</span>
          </div>
          <div className="space-y-2.5 my-4 flex-1 justify-center flex flex-col">
            <p className="text-[9px] font-bold text-[#666666] uppercase tracking-wider">Active Patient Chart</p>
            <div className="p-2 bg-[#F3F3F3] rounded text-xs flex justify-between">
              <span className="font-semibold text-xs">Patient: Sarah Jenkins</span>
              <span className="text-[10px] font-mono">ID: 91-8294</span>
            </div>
            <div className="p-2 border border-[#ECECEC] rounded text-xs text-[#666666]">
              <span className="font-bold text-[#111111] block mb-1">AI Record Summary:</span>
              Chronic asthma since childhood. Last CBC test (June 10) indicates normal leukocyte count.
            </div>
          </div>
          <div className="border-t border-[#F3F3F3] pt-3 flex items-center justify-between text-[9px] text-[#666666]">
            <span>Session Decryption Active</span>
            <span className="font-mono">Expires: 12m</span>
          </div>
        </div>
      )
    },
    {
      name: 'Clinical Portal',
      icon: LayoutGrid,
      tagline: 'Clinic administrative queue & practitioner database manager',
      permissions: ['Manage Schedules', 'Register Patient Queues', 'Create Billing Logs', 'View Clinic Audits'],
      integrations: ['Payment Gateway', 'Doctor Schedule Sync', 'Local ERP Gateway'],
      workflow: [
        { name: 'Clinic Registration', desc: 'Establish corporate identity and bind regional medical licensing keys.' },
        { name: 'Staff Management', desc: 'Invite clinicians and configure RBAC authorization groups.' },
        { name: 'Patient Queueing', desc: 'Sync scheduled check-ins with doctor dashboard timelines.' }
      ],
      preview: (
        <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded p-5 text-[#111111] h-full flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#F3F3F3] pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider">St. Jude Medical Queue</h4>
            <span className="text-[9px] bg-[#2563EB]/10 text-[#2563EB] px-1.5 py-0.5 rounded font-bold">4 Active Doctor Nodes</span>
          </div>
          <div className="space-y-1.5 my-3 flex-1 justify-center flex flex-col text-xs">
            <div className="flex justify-between border-b border-[#F3F3F3] py-1">
              <span> Sarah Jenkins</span>
              <span className="text-[#666666]">Room 102 — Cardiology</span>
            </div>
            <div className="flex justify-between border-b border-[#F3F3F3] py-1">
              <span> Michael Chen</span>
              <span className="text-[#666666]">Room 104 — Pediatrics</span>
            </div>
            <div className="flex justify-between border-b border-[#F3F3F3] py-1">
              <span> Amanda Ross</span>
              <span className="text-[#666666]">Room 108 — General Medicine</span>
            </div>
          </div>
          <div className="border-t border-[#F3F3F3] pt-3 text-[9px] text-[#666666] flex justify-between">
            <span>Billing Sync: Complete</span>
            <span>Uptime: 99.99%</span>
          </div>
        </div>
      )
    },
    {
      name: 'Hospital Portal',
      icon: Building2,
      tagline: 'Enterprise multi-specialty bed & department supervisor',
      permissions: ['Manage Multi-branch ERPs', 'Admissions Control', 'Bed Allocation', 'Rad/Lab Logs'],
      integrations: ['HL7/FHIR Protocol Engine', 'Legacy Hospital ERP', 'Aadhaar Biometric API'],
      preview: (
        <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded p-5 text-[#111111] h-full flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#F3F3F3] pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider">Apex Medical Central Hospital</h4>
            <span className="text-[9px] text-[#16A34A] font-bold">ALL_BRANCHES_ONLINE</span>
          </div>
          <div className="space-y-3 my-4 flex-1 justify-center flex flex-col text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-[#F7F4EB] border border-[#ECECEC] rounded text-center">
                <p className="text-[8px] text-[#666666] uppercase font-bold">Bed Occupancy</p>
                <p className="text-sm font-bold mt-0.5">84%</p>
              </div>
              <div className="p-2 bg-[#F7F4EB] border border-[#ECECEC] rounded text-center">
                <p className="text-[8px] text-[#666666] uppercase font-bold">Emergency Queue</p>
                <p className="text-sm font-bold mt-0.5">2 mins wait</p>
              </div>
            </div>
          </div>
          <div className="border-t border-[#F3F3F3] pt-3 text-[9px] text-[#666666] flex justify-between">
            <span>Branch Synchronizer: Active</span>
            <span>ABDM Bridge: Live</span>
          </div>
        </div>
      )
    },
    {
      name: 'Laboratory Portal',
      icon: TestTube,
      tagline: 'Cryptographic result certification & signature publisher',
      permissions: ['Issue Test Results', 'Sign Checksums', 'Query Lab Order Lists', 'Audit Diagnostics'],
      integrations: ['LIS System Gateway', 'Ledger Signer API', 'Doctor Referral webhook'],
      preview: (
        <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded p-5 text-[#111111] h-full flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#F3F3F3] pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider">Diagnostic Sign-off Center</h4>
            <span className="text-[9px] text-[#666666]">Pending Signatures</span>
          </div>
          <div className="space-y-2 my-4 flex-1 justify-center flex flex-col text-xs">
            <div className="p-2 bg-[#F7F4EB] border border-[#ECECEC] rounded flex justify-between items-center">
              <span>Blood Pathology - Sarah Jenkins</span>
              <button className="px-2.5 py-1 bg-[#111111] text-white text-[9px] font-bold uppercase tracking-wider rounded">Sign report</button>
            </div>
          </div>
          <div className="border-t border-[#F3F3F3] pt-3 text-[9px] text-[#666666] flex justify-between">
            <span>Cryptographic Keys: Secp256k1</span>
            <span>Signed logs: 104k</span>
          </div>
        </div>
      )
    },
    {
      name: 'Pharmacy Portal',
      icon: FileText,
      tagline: 'Digital prescription verification & dispensing log',
      permissions: ['Read Signed Prescriptions', 'Update Medication Logs', 'Verify Expiry dates'],
      integrations: ['National Drug Registry', 'SMS Patient Alerts'],
      preview: (
        <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded p-5 text-[#111111] h-full flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#F3F3F3] pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider">Pharmacy Dispenser Console</h4>
            <span className="text-[9px] bg-[#16A34A]/10 text-[#16A34A] px-1.5 py-0.5 rounded font-bold">VERIFIED</span>
          </div>
          <div className="space-y-1.5 my-4 flex-1 justify-center flex flex-col text-xs">
            <p className="font-bold">Prescription Details:</p>
            <p className="text-[#666666]">- Albuterol Inhaler (1x)</p>
            <p className="text-[#666666]">- Amoxicillin 500mg (14ct)</p>
            <p className="text-[10px] font-mono text-[#2563EB] mt-1">Signature Hash: 0x4f12...e304</p>
          </div>
          <div className="border-t border-[#F3F3F3] pt-3 text-[9px] text-[#666666] flex justify-between">
            <span>Verified against ABDM Registry</span>
            <span>Ledger status: Signed</span>
          </div>
        </div>
      )
    },
    {
      name: 'Insurance Portal',
      icon: UserCheck,
      tagline: 'Smart-contract claim validation & settlement trigger',
      permissions: ['Audit Medical Logs', 'Verify Claim Requests', 'Approve Settlements'],
      integrations: ['Insurance Claims Engine', 'Smart Contract Auditor'],
      preview: (
        <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded p-5 text-[#111111] h-full flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#F3F3F3] pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider">Automated Insurer Audits</h4>
            <span className="text-[9px] bg-[#16A34A]/10 text-[#16A34A] px-1.5 py-0.5 rounded font-bold">MATCH_OK</span>
          </div>
          <div className="space-y-1 my-4 flex-1 justify-center flex flex-col text-xs">
            <div className="flex justify-between border-b border-[#F3F3F3] py-1">
              <span className="text-[#666666]">Claim ID</span>
              <span className="font-mono">CLAIM-4091</span>
            </div>
            <div className="flex justify-between border-b border-[#F3F3F3] py-1">
              <span className="text-[#666666]">Policy Number</span>
              <span className="font-mono">POL-Jenkins-90</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#666666]">Smart Contract Audit</span>
              <span className="text-[#16A34A] font-bold font-mono">PASS (100%)</span>
            </div>
          </div>
          <div className="border-t border-[#F3F3F3] pt-3 text-[9px] text-[#666666] flex justify-between">
            <span>Settlement payout trigger complete</span>
            <span className="font-bold">Authorized</span>
          </div>
        </div>
      )
    },
    {
      name: 'Admin Portal',
      icon: Settings,
      tagline: 'Central node auditor, access logging & user supervisor',
      permissions: ['Manage User Roles', 'Audit Ledger blocks', 'Monitor Node Health', 'Set Security Parameters'],
      integrations: ['Syslog Collector', 'Audit Registry'],
      preview: (
        <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded p-5 text-[#111111] h-full flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#F3F3F3] pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider">System Administration</h4>
            <span className="text-[9px] font-mono text-[#16A34A] font-bold">ALL_SERVICES_GREEN</span>
          </div>
          <div className="space-y-2 my-4 flex-1 justify-center flex flex-col text-xs">
            <div className="p-2 border border-[#ECECEC] rounded flex justify-between">
              <span>Active Validator Nodes</span>
              <span className="font-mono font-bold">18 Nodes</span>
            </div>
            <div className="p-2 border border-[#ECECEC] rounded flex justify-between">
              <span>Daily Consensus Rounds</span>
              <span className="font-mono font-bold">1.2M rounds</span>
            </div>
          </div>
          <div className="border-t border-[#F3F3F3] pt-3 text-[9px] text-[#666666] flex justify-between">
            <span>Encryption standards: SHA-256</span>
            <span>Vite Server Active</span>
          </div>
        </div>
      )
    },
    {
      name: 'Government Portal',
      icon: Database,
      tagline: 'Anonymized epidemiology & public health registry mapping',
      permissions: ['Query Aggregated Stats', 'Track Disease Outbreaks', 'Audit Hospital Networks'],
      integrations: ['Government Registry API', 'Epidemiology Index Engine'],
      preview: (
        <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded p-5 text-[#111111] h-full flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#F3F3F3] pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider">National Public Health Registry</h4>
            <span className="text-[9px] font-mono text-[#666666]">Query active</span>
          </div>
          <div className="space-y-2 my-4 flex-1 justify-center flex flex-col text-xs">
            <div className="flex justify-between items-center">
              <span>Active outpatient rate</span>
              <span className="font-bold">4.2% (Normal)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Vaccination status index</span>
              <span className="font-bold">98.42%</span>
            </div>
            <div className="w-full bg-[#F3F3F3] h-1 rounded overflow-hidden mt-1">
              <div className="bg-[#111111] h-full rounded w-[98%]" />
            </div>
          </div>
          <div className="border-t border-[#F3F3F3] pt-3 text-[9px] text-[#666666] flex justify-between">
            <span>Aggregated metrics (zero PII)</span>
            <span className="text-[#16A34A] font-bold">HIPAA Audit Safe</span>
          </div>
        </div>
      )
    },
    {
      name: 'Developer API Portal',
      icon: Code,
      tagline: 'Standard JSON-LD clinical schemas & web3 API nodes',
      permissions: ['Generate API Keys', 'Access Sandbox Node', 'Read Schema Specs', 'View Webhook logs'],
      integrations: ['GitHub codebase', 'Smart contract library', 'FHIR API Reference'],
      preview: (
        <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded p-5 text-[#111111] h-full flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#F3F3F3] pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider">Developer Sandbox Console</h4>
            <span className="text-[9px] font-mono text-[#2563EB] font-bold">KEYS_ACTIVE</span>
          </div>
          <div className="space-y-2 my-4 flex-1 justify-center flex flex-col text-[10px] font-mono bg-[#111111] text-[#FFFFFF] p-2.5 rounded">
            <p className="text-teal-400">curl -X POST \</p>
            <p className="pl-2">https://api.healthchain.in/v1/consent \</p>
            <p className="pl-2">-H "Authorization: Bearer hc_key_90a12"</p>
          </div>
          <div className="border-t border-[#F3F3F3] pt-3 text-[9px] text-[#666666] flex justify-between">
            <span>OpenAPI v3 standard specification</span>
            <span>SSL: Active</span>
          </div>
        </div>
      )
    }
  ];

  const integrations = [
    { name: 'FHIR', version: 'v4.0.1', health: 'Healthy (99.9%)', desc: 'Fast Healthcare Interoperability Resources data mappings.' },
    { name: 'HL7', version: 'v2.6', health: 'Healthy (99.9%)', desc: 'Standardized messaging protocols for healthcare databases.' },
    { name: 'ABDM', version: 'v2.1', health: 'Healthy (100%)', desc: 'Ayushman Bharat Digital Mission compliance gateway integration.' },
    { name: 'Ayushman Bharat', version: 'v3.0', health: 'Healthy (100%)', desc: 'Outpatient treatment authorization smart contracts.' },
    { name: 'Hospital ERP', version: 'v12.0', health: 'Healthy (99.8%)', desc: 'Direct database synchronizers for local hospital databases.' },
    { name: 'Laboratory Systems', version: 'v8.4', health: 'Healthy (99.9%)', desc: 'Diagnostic results publisher & signer bridge.' },
    { name: 'Insurance APIs', version: 'v4.2', health: 'Healthy (99.9%)', desc: 'Automated claim validation smart contracts hook.' },
    { name: 'SMS Gateway', version: 'v2.0', health: 'Healthy (100%)', desc: 'Patient notifications & one-time-passwords system.' },
    { name: 'Email Gateway', version: 'v1.4', health: 'Healthy (100%)', desc: 'Enterprise report copies and alert messages delivery.' },
    { name: 'Cloud Storage', version: 'v3.0', health: 'Healthy (100%)', desc: 'Encrypted clinical records storage (IPFS backup).' },
    { name: 'Payment Gateway', version: 'v5.1', health: 'Healthy (99.9%)', desc: 'Consultation transaction settlement processing.' },
    { name: 'Blockchain Network', version: 'v1.0', health: 'Healthy (100%)', desc: 'Distributed immutable transactions database consensus.' },
    { name: 'AI Assistant', version: 'v2.4', health: 'Healthy (99.6%)', desc: 'On-device LLM summarizing clinic transcripts.' }
  ];

  const demoCards = [
    { name: 'Patient Demo', desc: 'Test data wallet controls, consent switches, and reports uploads.', login: 'patient_sandbox@healthchain.in', features: 'Consent switches, medical documents uploads, logs audit', tab: 'patients' },
    { name: 'Doctor Demo', desc: 'Search records, query historical diagnostics, and sign prescriptions.', login: 'doctor_sandbox@healthchain.in', features: 'Patient search, records decryption, e-signatures creator', tab: 'doctors' },
    { name: 'Clinical Demo', desc: 'Manage patient appointments list, doctor schedules, and queues.', login: 'clinical_sandbox@healthchain.in', features: 'Queue coordinator, appointments calendar, billing sync', tab: 'appointments' },
    { name: 'Hospital Demo', desc: 'Monitor admissions, allocate beds, and track multi-branch logs.', login: 'hospital_sandbox@healthchain.in', features: 'ERP statistics, bed allocation, branch management console', tab: 'dashboard' },
    { name: 'Lab Demo', desc: 'Verify orders checklist, write tests, and sign diagnostic documents.', login: 'lab_sandbox@healthchain.in', features: 'Diagnostics verification, cryptographic sign-off tools', tab: 'laboratory' },
    { name: 'Insurance Demo', desc: 'Approve treatment claims automatically via smart contract audit proofs.', login: 'insurance_sandbox@healthchain.in', features: 'Policy rules engine, smart contract validation console', tab: 'insurance' },
    { name: 'Government Demo', desc: 'Check aggregated epidemiological index rates and outbound charts.', login: 'govt_sandbox@healthchain.in', features: 'Outbreaks tracking, disease maps charts, aggregate metrics', tab: 'dashboard' },
    { name: 'Admin Demo', desc: 'Coordinate validator nodes, verify logs, and audit system status.', login: 'admin_sandbox@healthchain.in', features: 'User management database, node configuration audit', tab: 'settings' },
    { name: 'Developer API Demo', desc: 'Verify API sandbox queries and retrieve JSON-LD reference schemes.', login: 'developer_sandbox@healthchain.in', features: 'Curl request tests, smart contracts references', tab: 'blockchain' }
  ];

  const investorItems = [
    { title: 'Product Vision', desc: 'Unifying clinical databases under a patient-consent framework, eliminating legacy faxes, and enabling automated claims settlements.' },
    { title: 'Market Opportunity', desc: 'Bridging 150,000+ Indian hospitals and clinics under the ABDM mandate, tapping into a $12B healthcare data infrastructure market.' },
    { title: 'Revenue Model', desc: 'Transaction fees on blockchain record verification, monthly API nodes queries subscriptions, and enterprise ERP integration licenses.' },
    { title: 'Competitive Advantage', desc: 'Zero-knowledge architecture. No clinical file can be decrypted without the patient\'s active private-key signature.' },
    { title: 'Technology Stack', desc: 'Node.js, Vite/React, Tailwind CSS, Hardhat consensus nodes, Solidity smart contracts, AES-256 data envelope encryption.' },
    { title: 'Growth Metrics', desc: '500,000+ patient wallets linked, 100M+ encrypted records hashed, and 150+ clinical network partners globally.' }
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] font-sans selection:bg-[#E8F0FE] selection:text-[#2563EB] scroll-smooth">
      <Header />
      
      {/* ───── HERO SECTION ───── */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 overflow-hidden border-b border-[#ECECEC]">
        {/* Background split split design */}
        <div className="absolute inset-0 flex flex-col lg:flex-row pointer-events-none z-0">
          <div className="w-full lg:w-1/2 bg-[#FFFFFF]" />
          <div className="w-full lg:w-1/2 bg-[#F7F4EB]" />
        </div>

        <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 grid lg:grid-cols-2 items-center gap-12 relative z-10">
          {/* Hero Left Content */}
          <div className="flex flex-col text-left text-[#111111]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666] mb-4">
              Enterprise Overview Portal
            </span>
            <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.08] mb-8">
              Experience the Complete <br />
              <span className="font-bold">HealthChain Platform.</span>
            </h1>
            <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-xl mb-10">
              Explore every module of HealthChain through interactive demonstrations. See how patients, doctors, hospitals, laboratories, pharmacies, insurance providers, and administrators collaborate securely using blockchain-powered healthcare infrastructure.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#explorer"
                className="px-6 py-3 bg-[#111111] text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors rounded"
              >
                Launch Interactive Demo
              </a>
              <a
                href="#book-form"
                className="px-6 py-3 bg-transparent text-[#111111] text-xs font-bold uppercase tracking-widest border border-[#111111] hover:bg-[#111111]/5 transition-colors rounded"
              >
                Book Live Demo
              </a>
              <a
                href="#book-form"
                className="px-6 py-3 bg-transparent text-[#666666] text-xs font-bold uppercase tracking-widest hover:text-[#111111] transition-colors rounded"
              >
                Contact Enterprise Sales
              </a>
            </div>
          </div>

          {/* Hero Right Visual: Isometric schematic block nodes grid */}
          <div className="relative h-[300px] lg:h-[450px] w-full flex items-center justify-center bg-[#F7F4EB] border border-[#ECECEC] rounded p-6">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#111111_1px,transparent_1px)] [background-size:14px_14px]" />
            
            <div className="w-full max-w-[420px] bg-white border border-[#ECECEC] rounded p-6 shadow-sm relative z-10 flex flex-col justify-between h-[300px]">
              <div className="flex justify-between items-center border-b border-[#F3F3F3] pb-3">
                <span className="text-[9px] font-mono text-[#666666]">Consensus Node Ledger</span>
                <span className="text-[9px] bg-[#16A34A]/10 text-[#16A34A] px-2 py-0.5 rounded font-bold">18 NODES_SYNCED</span>
              </div>
              
              <div className="space-y-2 flex-1 justify-center flex flex-col">
                <div className="p-2 border border-[#ECECEC] rounded flex items-center justify-between text-xs">
                  <span className="font-bold text-[#111111]">FHIR Interoperability Bridge</span>
                  <span className="text-[10px] text-[#16A34A] font-mono">v4.0.1</span>
                </div>
                <div className="p-2 border border-[#ECECEC] rounded flex items-center justify-between text-xs">
                  <span className="font-bold text-[#111111]">Decryption Consent Key</span>
                  <span className="text-[10px] text-[#2563EB] font-mono">0x7a39...4bc2</span>
                </div>
                <div className="p-2 border border-[#ECECEC] rounded flex items-center justify-between text-xs">
                  <span className="font-bold text-[#111111]">IPFS Record Reference Hashed</span>
                  <span className="text-[10px] text-[#666666] font-mono">Block #104k</span>
                </div>
              </div>

              <div className="border-t border-[#F3F3F3] pt-3 flex items-center justify-between text-[9px] text-[#666666]">
                <span>Transaction Latency: 1.2s</span>
                <span>Audit state: Pass</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── INTERACTIVE PLATFORM EXPLORER ───── */}
      <section id="explorer" className="py-24 bg-[#FFFFFF] border-b border-[#ECECEC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="max-w-3xl mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
              Interactive Modules
            </span>
            <h2 className="font-sans text-4xl font-normal tracking-tight text-[#111111] leading-tight mt-4">
              Explore the Complete Ecosystem.
            </h2>
            <p className="text-sm text-[#666666] leading-relaxed mt-4">
              Switch between the different application portals below to inspect the interface layout, integrated features list, permissions schema, and deployment workflows.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Tabs List (Left Column) */}
            <div className="lg:col-span-4 flex flex-col gap-2">
              {portals.map((p, idx) => {
                const Icon = p.icon;
                const isActive = activePortal === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setActivePortal(idx);
                      setSelectedWalkthroughStep(0);
                    }}
                    className={`w-full text-left p-4 rounded border transition-all duration-200 flex items-center gap-3.5 ${
                      isActive
                        ? 'bg-[#F7F4EB] border-[#111111] shadow-sm'
                        : 'bg-transparent border-transparent hover:border-[#ECECEC] hover:bg-[#F7F4EB]/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded flex items-center justify-center border transition-colors ${
                      isActive ? 'bg-[#111111] border-[#111111] text-white' : 'bg-white border-[#ECECEC] text-[#666666]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#111111]">{p.name}</h4>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Portal Inspector Panel (Right Column) */}
            <div className="lg:col-span-8 bg-[#F7F4EB] border border-[#ECECEC] rounded p-8 flex flex-col justify-between min-h-[480px]">
              
              {/* Card Header Info */}
              <div className="border-b border-[#ECECEC] pb-4 mb-6">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#666666]">Active Explorer Module</span>
                <h3 className="font-sans text-2xl font-bold text-[#111111] mt-1">{portals[activePortal].name}</h3>
                <p className="text-xs text-[#666666] leading-relaxed mt-2">{portals[activePortal].tagline}</p>
              </div>

              {/* Inspector Content Grid */}
              <div className="grid md:grid-cols-2 gap-6 flex-1 items-start mb-6">
                
                {/* Text Spec Column */}
                <div className="space-y-4">
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#111111] mb-2">Access Permissions</h5>
                    <ul className="space-y-1 text-xs text-[#666666]">
                      {portals[activePortal].permissions.map((perm, pIdx) => (
                        <li key={pIdx} className="flex gap-2 items-center">
                          <span className="text-[#16A34A] font-bold">✓</span>
                          <span>{perm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#111111] mb-2">Connected Protocols</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {portals[activePortal].integrations.map((integ, iIdx) => (
                        <span key={iIdx} className="px-2 py-0.5 bg-white border border-[#ECECEC] text-[#111111] text-[9px] font-semibold rounded font-mono">
                          {integ}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Simulated Screen Preview Column */}
                <div className="border border-[#ECECEC] rounded overflow-hidden shadow-sm h-64 bg-white">
                  {portals[activePortal].preview}
                </div>

              </div>

              {/* Workflow timelines inside explorer */}
              {portals[activePortal].workflow && (
                <div className="border-t border-[#ECECEC] pt-6">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#111111] mb-4">Module Transaction Flow</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {portals[activePortal].workflow.map((step, sIdx) => {
                      const stepActive = selectedWalkthroughStep === sIdx;
                      return (
                        <button
                          key={sIdx}
                          onClick={() => setSelectedWalkthroughStep(sIdx)}
                          className={`p-2.5 rounded border text-left transition-all ${
                            stepActive ? 'bg-[#111111] border-[#111111] text-white shadow-sm' : 'bg-white border-[#ECECEC] hover:border-[#666666]'
                          }`}
                        >
                          <p className="text-[9px] font-mono text-[#666666] font-bold">Step 0{sIdx + 1}</p>
                          <p className="text-[10px] font-bold mt-1 truncate">{step.name}</p>
                        </button>
                      );
                    })}
                  </div>
                  <div className="p-3 bg-[#FFFFFF]/80 border border-[#ECECEC] rounded mt-4 text-xs leading-relaxed text-[#666666]">
                    <span className="font-bold text-[#111111] block mb-1">
                      {portals[activePortal].workflow[selectedWalkthroughStep].name} Specification:
                    </span>
                    {portals[activePortal].workflow[selectedWalkthroughStep].desc}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* ───── PORTAL WALKTHROUGHS DETAILED SEQUENCE ───── */}
      <section className="py-24 bg-[#F7F4EB] border-b border-[#ECECEC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="max-w-3xl mb-20">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
              Detailed Workflows
            </span>
            <h2 className="font-sans text-4xl font-normal tracking-tight text-[#111111] leading-tight mt-4">
              System Transaction Blueprints.
            </h2>
            <p className="text-sm text-[#666666] leading-relaxed mt-4">
              Detailed workflow mappings illustrating step-by-step logic checks across the core operational interfaces.
            </p>
          </div>

          <div className="space-y-16">
            
            {/* Patient Workflow */}
            <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded p-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#111111] mb-6 pb-2 border-b border-[#F3F3F3] flex justify-between items-center">
                <span>Patient Registration & Records Wallet</span>
                <span className="text-[10px] text-[#666666] font-mono">13 steps total</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-[#F7F4EB] border border-[#ECECEC] rounded">
                  <span className="text-[9px] font-mono text-[#666666] font-bold">STEP 01</span>
                  <h4 className="font-sans text-xs font-bold text-[#111111] uppercase tracking-wider mt-2 mb-1">Registration</h4>
                  <p className="text-[11px] text-[#666666] leading-relaxed">OTP verification, Aadhaar credential sync, and ABHA national ID generation.</p>
                </div>
                <div className="p-4 bg-[#F7F4EB] border border-[#ECECEC] rounded">
                  <span className="text-[9px] font-mono text-[#666666] font-bold">STEP 02</span>
                  <h4 className="font-sans text-xs font-bold text-[#111111] uppercase tracking-wider mt-2 mb-1">Profile Setup</h4>
                  <p className="text-[11px] text-[#666666] leading-relaxed">Local config of demographics, allergies history, and emergency contacts.</p>
                </div>
                <div className="p-4 bg-[#F7F4EB] border border-[#ECECEC] rounded">
                  <span className="text-[9px] font-mono text-[#666666] font-bold">STEP 03</span>
                  <h4 className="font-sans text-xs font-bold text-[#111111] uppercase tracking-wider mt-2 mb-1">Medical Records</h4>
                  <p className="text-[11px] text-[#666666] leading-relaxed">Local document ingestion (MRI, X-ray, lab logs) and symmetric encrypt payload.</p>
                </div>
                <div className="p-4 bg-[#F7F4EB] border border-[#ECECEC] rounded">
                  <span className="text-[9px] font-mono text-[#666666] font-bold">STEP 04</span>
                  <h4 className="font-sans text-xs font-bold text-[#111111] uppercase tracking-wider mt-2 mb-1">Consent & Sync</h4>
                  <p className="text-[11px] text-[#666666] leading-relaxed">Cryptographic hash written to ledger, locking permissions to patient key pairs.</p>
                </div>
              </div>
            </div>

            {/* Doctor Workflow */}
            <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded p-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#111111] mb-6 pb-2 border-b border-[#F3F3F3] flex justify-between items-center">
                <span>Doctor Consultation & Prescriptions</span>
                <span className="text-[10px] text-[#666666] font-mono">12 steps total</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-[#F7F4EB] border border-[#ECECEC] rounded">
                  <span className="text-[9px] font-mono text-[#666666] font-bold">STEP 01</span>
                  <h4 className="font-sans text-xs font-bold text-[#111111] uppercase tracking-wider mt-2 mb-1">Login & Auth</h4>
                  <p className="text-[11px] text-[#666666] leading-relaxed">Node-specific credentials session, signing on-chain to unlock consultation queue.</p>
                </div>
                <div className="p-4 bg-[#F7F4EB] border border-[#ECECEC] rounded">
                  <span className="text-[9px] font-mono text-[#666666] font-bold">STEP 02</span>
                  <h4 className="font-sans text-xs font-bold text-[#111111] uppercase tracking-wider mt-2 mb-1">Records Request</h4>
                  <p className="text-[11px] text-[#666666] leading-relaxed">Querying patient ABHA ID and requesting decrypt key permission contract.</p>
                </div>
                <div className="p-4 bg-[#F7F4EB] border border-[#ECECEC] rounded">
                  <span className="text-[9px] font-mono text-[#666666] font-bold">STEP 03</span>
                  <h4 className="font-sans text-xs font-bold text-[#111111] uppercase tracking-wider mt-2 mb-1">Diagnose & Sign</h4>
                  <p className="text-[11px] text-[#666666] leading-relaxed">Completing consultation, creating digital prescriptions, and signing via ECDSA.</p>
                </div>
                <div className="p-4 bg-[#F7F4EB] border border-[#ECECEC] rounded">
                  <span className="text-[9px] font-mono text-[#666666] font-bold">STEP 04</span>
                  <h4 className="font-sans text-xs font-bold text-[#111111] uppercase tracking-wider mt-2 mb-1">Share Ledger</h4>
                  <p className="text-[11px] text-[#666666] leading-relaxed">Publishing prescription block checksum to consensus validators index.</p>
                </div>
              </div>
            </div>

            {/* Other Portals workflows summaries */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] pb-2 border-b border-[#F3F3F3] mb-3">Clinical Portal</h4>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Clinic registration → Doctor listings management → Patient queues sync → EHR mappings → Billing logs generation.
                </p>
              </div>

              <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] pb-2 border-b border-[#F3F3F3] mb-3">Laboratory Portal</h4>
                <p className="text-xs text-[#666666] leading-relaxed">
                  LIS test request intake → Sample collection log → Result parsing → Hash checksum publish → Patient notification.
                </p>
              </div>

              <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] pb-2 border-b border-[#F3F3F3] mb-3">Insurance Portal</h4>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Claim ticket intake → Ledger history confirmation → ICD-10 code validator → Policy verification → Automated payout.
                </p>
              </div>

              <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] pb-2 border-b border-[#F3F3F3] mb-3">Government Portal</h4>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Regional index mapping → Zero-PII epidemiological audits → Disease outbreak radar charts → System health metrics.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ───── PLATFORM INTEGRATIONS ───── */}
      <section className="py-24 bg-[#FFFFFF] border-b border-[#ECECEC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="max-w-3xl mb-20">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
              Connected Systems
            </span>
            <h2 className="font-sans text-4xl font-normal tracking-tight text-[#111111] leading-tight mt-4">
              Integrated Standards & Protocols.
            </h2>
            <p className="text-sm text-[#666666] leading-relaxed mt-4 max-w-xl">
              HealthChain integrates natively with standard clinical databases and regional health API endpoints.
            </p>
          </div>

          {/* Integrations Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#F7F4EB] p-6 rounded border border-[#ECECEC] hover:border-[#666666] transition-colors duration-200"
              >
                <div className="flex justify-between items-baseline mb-4">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#111111]">
                    {item.name}
                  </h4>
                  <span className="font-mono text-[9px] text-[#666666] bg-white border border-[#ECECEC] px-1.5 py-0.5 rounded font-bold">
                    {item.version}
                  </span>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed mb-4">
                  {item.desc}
                </p>
                <div className="flex items-center gap-1.5 border-t border-[#ECECEC] pt-4 text-[9px] font-mono text-[#666666]">
                  <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full inline-block animate-pulse" />
                  <span>Status: {item.health}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ───── INTERACTIVE DATA-FLOW ARCHITECTURE ───── */}
      <section className="py-24 bg-[#F7F4EB] border-b border-[#ECECEC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="max-w-3xl mb-20">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
              Architecture Map
            </span>
            <h2 className="font-sans text-4xl font-normal tracking-tight text-[#111111] leading-tight mt-4">
              Zero-Knowledge Data Flow.
            </h2>
            <p className="text-sm text-[#666666] leading-relaxed mt-4 max-w-xl">
              An architectural schematic mapping patient diagnostics encryption, on-chain consensus, and analytical pipeline ingestion.
            </p>
          </div>

          {/* Architecture Diagram Canvas */}
          <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#111111_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <div className="w-full flex items-center justify-center min-h-[300px]">
              <svg viewBox="0 0 600 300" className="w-full h-full max-w-[550px] relative z-10">
                {/* Node paths */}
                <line x1="80" y1="60" x2="200" y2="100" stroke="#111111" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="80" y1="140" x2="200" y2="100" stroke="#111111" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="80" y1="220" x2="200" y2="100" stroke="#111111" strokeWidth="1" strokeDasharray="3,3" />
                
                <line x1="200" y1="100" x2="360" y2="150" stroke="#111111" strokeWidth="1.5" />
                <line x1="500" y1="150" x2="360" y2="150" stroke="#111111" strokeWidth="1.5" />

                <circle cx="280" cy="125" r="3" fill="#14B8A6" className="animate-ping" style={{ animationDuration: '2s' }} />

                {/* Nodes markers */}
                {/* Patient */}
                <g className="translate-x-[80px] translate-y-[60px]">
                  <circle cx="0" cy="0" r="15" fill="#F7F4EB" stroke="#111111" strokeWidth="1" />
                  <User className="w-4 h-4 text-[#111111] -translate-x-2 -translate-y-2" />
                  <text x="22" y="4" className="text-[9px] font-bold uppercase tracking-wider fill-[#666666]">Patient wallet</text>
                </g>
                {/* Doctor */}
                <g className="translate-x-[80px] translate-y-[140px]">
                  <circle cx="0" cy="0" r="15" fill="#F7F4EB" stroke="#111111" strokeWidth="1" />
                  <Eye className="w-4 h-4 text-[#111111] -translate-x-2 -translate-y-2" />
                  <text x="22" y="4" className="text-[9px] font-bold uppercase tracking-wider fill-[#666666]">Clinician portal</text>
                </g>
                {/* Hospital */}
                <g className="translate-x-[80px] translate-y-[220px]">
                  <circle cx="0" cy="0" r="15" fill="#F7F4EB" stroke="#111111" strokeWidth="1" />
                  <Building2 className="w-4 h-4 text-[#111111] -translate-x-2 -translate-y-2" />
                  <text x="22" y="4" className="text-[9px] font-bold uppercase tracking-wider fill-[#666666]">Hospital ERP</text>
                </g>

                {/* Encryption layer */}
                <g className="translate-x-[200px] translate-y-[100px]">
                  <rect x="-20" y="-20" width="40" height="40" rx="4" fill="#111111" stroke="#111111" strokeWidth="1.5" />
                  <Layers className="w-4 h-4 text-white -translate-x-2 -translate-y-2" />
                  <text x="-42" y="32" className="text-[8px] font-bold uppercase tracking-wider fill-[#111111]">Encryption Bridge</text>
                </g>

                {/* Blockchain hub */}
                <g className="translate-x-[360px] translate-y-[150px]">
                  <circle cx="0" cy="0" r="28" fill="#FFFFFF" stroke="#111111" strokeWidth="1.5" />
                  <Shield className="w-6 h-6 text-[#111111] -translate-x-3 -translate-y-3" />
                  <text x="-48" y="42" className="text-[8px] font-bold uppercase tracking-wider fill-[#111111]">Blockchain Validator Ledger</text>
                </g>

                {/* AI Assistant */}
                <g className="translate-x-[500px] translate-y-[150px]">
                  <rect x="-20" y="-20" width="40" height="40" rx="4" fill="#F7F4EB" stroke="#111111" strokeWidth="1.5" />
                  <Cpu className="w-4 h-4 text-[#111111] -translate-x-2 -translate-y-2" />
                  <text x="-32" y="32" className="text-[8px] font-bold uppercase tracking-wider fill-[#111111]">AI Summarizer</text>
                </g>
              </svg>
            </div>

            <div className="border-t border-[#ECECEC] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#666666]">
              <span>Verified under ECDSA & SHA-256 signatures consensus</span>
              <span>All nodes synced</span>
            </div>
          </div>

        </div>
      </section>

      {/* ───── LIVE DEMO ENVIRONMENT CARDS ───── */}
      <section className="py-24 bg-[#FFFFFF] border-b border-[#ECECEC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="max-w-3xl mb-20">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
              Live Sandboxes
            </span>
            <h2 className="font-sans text-4xl font-normal tracking-tight text-[#111111] leading-tight mt-4">
              Evaluate Active Mock Sandboxes.
            </h2>
            <p className="text-sm text-[#666666] leading-relaxed mt-4 max-w-xl">
              Launch demo sessions to evaluate data schemas, consent controls, and ledger validation interfaces.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {demoCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-[#F7F4EB] p-8 rounded border border-[#ECECEC] flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
                    Sandbox Node
                  </span>
                  <h3 className="font-sans text-lg font-bold text-[#111111] mt-2 mb-3">
                    {card.name}
                  </h3>
                  <p className="text-xs text-[#666666] leading-relaxed mb-6">
                    {card.desc}
                  </p>
                  <div className="border-t border-[#ECECEC] pt-4 mb-6">
                    <p className="text-[9px] uppercase font-bold text-[#111111]">Sandbox Login:</p>
                    <p className="text-xs font-mono text-[#666666] mt-1">{card.login}</p>
                    <p className="text-[9px] uppercase font-bold text-[#111111] mt-3">Included features:</p>
                    <p className="text-xs text-[#666666] mt-1">{card.features}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    window.open(`/hospital/dashboard?tab=${card.tab || 'dashboard'}`, '_blank');
                  }}
                  className="w-full py-3 bg-[#111111] hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded"
                >
                  Launch Demo
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ───── INVESTOR SECTION ───── */}
      <section className="py-24 bg-[#F7F4EB] border-b border-[#ECECEC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-12 gap-8 items-end mb-20">
            <div className="lg:col-span-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
                Investor Relations
              </span>
              <h2 className="font-sans text-4xl sm:text-5xl font-normal tracking-tight text-[#111111] leading-[1.1] mt-4">
                Why Investors Choose HealthChain.
              </h2>
            </div>
            <div className="lg:col-span-4 flex flex-wrap gap-3 lg:justify-end">
              <button className="px-5 py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded">
                Download Investor Deck
              </button>
              <button className="px-5 py-2.5 bg-transparent border border-[#111111] text-[#111111] text-xs font-bold uppercase tracking-widest rounded hover:bg-[#111111]/5">
                Schedule Meeting
              </button>
            </div>
          </div>

          {/* Investor Highlights Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {investorItems.map((item, idx) => (
              <div key={idx} className="bg-white border border-[#ECECEC] p-8 rounded flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono text-[#666666] font-bold">HIGHLIGHT 0{idx + 1}</span>
                  <h4 className="font-sans text-sm font-bold uppercase tracking-wider text-[#111111] mt-2 mb-3">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#666666] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ───── BOOK DEMO SIGNUP FORM ───── */}
      <section id="book-form" className="py-24 bg-[#FFFFFF] border-b border-[#ECECEC]">
        <div className="max-w-3xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
              Request Live Demo
            </span>
            <h2 className="font-sans text-4xl font-normal tracking-tight text-[#111111] leading-tight mt-4">
              Schedule a Custom Session.
            </h2>
            <p className="text-sm text-[#666666] leading-relaxed mt-4">
              Coordinate an overview demonstration mapped to your organization's specific clinical EHR and ERP needs.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111] mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-[#111111] text-xs rounded focus:outline-none focus:border-[#666666]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111] mb-2">Organization</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-[#111111] text-xs rounded focus:outline-none focus:border-[#666666]"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111] mb-2">Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-[#111111] text-xs rounded focus:outline-none focus:border-[#666666]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111] mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-[#111111] text-xs rounded focus:outline-none focus:border-[#666666]"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111] mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-[#111111] text-xs rounded focus:outline-none focus:border-[#666666]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111] mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-[#111111] text-xs rounded focus:outline-none focus:border-[#666666]"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111] mb-2">Organization Type</label>
                <select
                  name="orgType"
                  value={formData.orgType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-[#111111] text-xs rounded focus:outline-none focus:border-[#666666]"
                >
                  <option value="Hospital Group">Hospital Group</option>
                  <option value="Multi-specialty Clinic">Multi-specialty Clinic</option>
                  <option value="Diagnostic Laboratory">Diagnostic Laboratory</option>
                  <option value="Insurance Provider">Insurance Provider</option>
                  <option value="Government Agency">Government Agency</option>
                  <option value="Investor Partner">Investor Partner</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111] mb-2">Hospital Size</label>
                <select
                  name="hospitalSize"
                  value={formData.hospitalSize}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-[#111111] text-xs rounded focus:outline-none focus:border-[#666666]"
                >
                  <option value="Under 50 beds">Under 50 beds</option>
                  <option value="50-100 beds">50-100 beds</option>
                  <option value="100-500 beds">100-500 beds</option>
                  <option value="500+ beds">500+ beds</option>
                  <option value="Not Applicable">Not Applicable</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111] mb-2">Preferred Date</label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-[#111111] text-xs rounded focus:outline-none focus:border-[#666666]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111] mb-2">Preferred Time</label>
                <input
                  type="time"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-[#111111] text-xs rounded focus:outline-none focus:border-[#666666]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111] mb-2">Brief message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-[#111111] text-xs rounded focus:outline-none focus:border-[#666666] resize-none"
              />
            </div>

            {formSubmitted && (
              <div className="p-4 bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/25 rounded text-xs text-center font-bold">
                ✓ Demo Booking Request Submitted Successfully. We will contact you shortly.
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 py-3.5 bg-[#111111] hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded"
              >
                Book Demo
              </button>
              <button
                type="button"
                className="flex-1 py-3.5 bg-transparent border border-[#111111] text-[#111111] text-xs font-bold uppercase tracking-widest rounded hover:bg-[#111111]/5"
              >
                Contact Sales
              </button>
            </div>

          </form>

        </div>
      </section>

      {/* ───── FINAL CTA SECTION ───── */}
      <section className="py-32 bg-[#F7F4EB] text-center border-b border-[#ECECEC]">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
            Get Started
          </span>
          <h2 className="font-sans text-4xl sm:text-5xl font-normal tracking-tight text-[#111111] leading-tight mt-4 mb-6">
            Ready to Experience HealthChain?<br />
            <span className="font-bold">Schedule an Enterprise Review.</span>
          </h2>
          <p className="text-sm text-[#666666] leading-relaxed max-w-lg mx-auto mb-10">
            Explore every portal, understand the complete healthcare workflow, and schedule a personalized enterprise demonstration with our team.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#explorer"
              className="px-8 py-3.5 bg-[#111111] text-white text-xs font-bold uppercase tracking-widest hover:bg-black rounded"
            >
              Launch Demo
            </a>
            <a
              href="#book-form"
              className="px-8 py-3.5 bg-transparent text-[#111111] text-xs font-bold uppercase tracking-widest border border-[#111111] hover:bg-[#111111]/5 rounded"
            >
              Book a Live Demo
            </a>
            <a
              href="#book-form"
              className="px-8 py-3.5 bg-transparent text-[#666666] text-xs font-bold uppercase tracking-widest hover:text-[#111111] rounded"
            >
              Contact Enterprise Sales
            </a>
          </div>
        </div>
      </section>

      {/* Demo Modal for sandboxes */}
      <AnimatePresence>
        {showDemoModal && activeDemoCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#ECECEC] rounded p-6 max-w-sm w-full text-center relative shadow-xl text-[#111111]"
            >
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#111111] mb-2">
                Launching {activeDemoCard.name}
              </h4>
              <div className="w-12 h-12 rounded bg-[#111111] flex items-center justify-center mx-auto my-6 text-white">
                <Clock className="w-5 h-5 animate-spin" />
              </div>
              <p className="text-xs text-[#666666] leading-relaxed mb-6">
                Spinning up a dedicated sandbox validator node...
              </p>
              <div className="bg-[#F7F4EB] p-3 rounded border border-[#ECECEC] text-[10px] text-[#666666] text-left space-y-1">
                <p><strong>Configured URL:</strong> sandbox.{activeDemoCard.name.toLowerCase().replace(' ', '')}.healthchain.in</p>
                <p><strong>Status:</strong> Spawning VM node...</p>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                className="w-full mt-6 py-2.5 border border-[#111111] text-xs font-bold uppercase tracking-widest rounded hover:bg-[#F3F3F3]"
              >
                Close Sandbox
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
