import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code2, KeyRound, Users, Stethoscope, Calendar, FileSpreadsheet,
  Activity, Pill, TestTube, FileText, Shield, Eye, Copy, Check,
  ChevronRight, ArrowRight, Terminal, Server, Sparkles, Layers,
  ExternalLink, Lock, AlertCircle, Search
} from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function ApiReference() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('auth');
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 11 API Sections
  const apiSections = [
    {
      id: 'auth',
      name: 'Authentication',
      icon: KeyRound,
      desc: 'Bearer token exchange and cryptographic node authentication.',
      endpointCount: 2,
      endpoints: [
        {
          method: 'POST',
          path: '/v1/auth/token',
          title: 'Obtain Access Token',
          desc: 'Exchange node credentials or cryptographic signature for a short-lived bearer token.',
          headers: {
            'Content-Type': 'application/json',
            'X-HealthChain-NodeId': 'NODE-HOSPITAL-881'
          },
          requestBody: JSON.stringify({
            client_id: 'app_client_example_id',
            grant_type: 'client_credentials',
            signature: '0x3a4f89...example_sig'
          }, null, 2),
          response200: JSON.stringify({
            access_token: 'hc_token_example_eyJhbGciOi...',
            token_type: 'Bearer',
            expires_in: 3600,
            scope: 'records:read records:write consent:verify'
          }, null, 2),
          responseError: JSON.stringify({
            error: 'invalid_credentials',
            message: 'Signature verification failed for the specified node ID.',
            code: 401
          }, null, 2)
        }
      ]
    },
    {
      id: 'patients',
      name: 'Patients',
      icon: Users,
      desc: 'Look up sovereign patient identifiers and profile metadata.',
      endpointCount: 2,
      endpoints: [
        {
          method: 'GET',
          path: '/v1/patients/:id',
          title: 'Retrieve Patient Summary',
          desc: 'Fetch non-sensitive patient demographics and active emergency tags (requires patient consent token).',
          headers: {
            'Authorization': 'Bearer hc_token_example...',
            'X-Consent-Token': 'cst_example_91823'
          },
          response200: JSON.stringify({
            patient_id: 'HCG-7719-2041',
            demographics: {
              blood_group: 'O-Positive',
              age: 42,
              emergency_contact: '+1-555-0199'
            },
            active_allergies: ['Penicillin', 'Sulfa'],
            last_updated: '2026-06-28T14:30:00Z'
          }, null, 2),
          responseError: JSON.stringify({
            error: 'consent_expired',
            message: 'The provided patient consent token has expired or was revoked.',
            code: 403
          }, null, 2)
        }
      ]
    },
    {
      id: 'providers',
      name: 'Providers',
      icon: Stethoscope,
      desc: 'Verify practitioner medical licenses, NPI numbers, and hospital affiliations.',
      endpointCount: 2,
      endpoints: [
        {
          method: 'GET',
          path: '/v1/providers/:id',
          title: 'Get Practitioner Profile',
          desc: 'Retrieve verified clinical license status, registered specialty, and public attestation key.',
          headers: {
            'Authorization': 'Bearer hc_token_example...'
          },
          response200: JSON.stringify({
            provider_id: 'PRV-9182',
            name: 'Dr. Amanda Ross',
            specialty: 'Cardiology',
            license_status: 'Active',
            npi_number: '1982736401',
            public_key: '0x8a92e304f5619...example'
          }, null, 2),
          responseError: JSON.stringify({
            error: 'not_found',
            message: 'Practitioner identifier does not exist in national registry.',
            code: 404
          }, null, 2)
        }
      ]
    },
    {
      id: 'appointments',
      name: 'Appointments',
      icon: Calendar,
      desc: 'Manage outpatient bookings, triage slots, and clinical schedules.',
      endpointCount: 2,
      endpoints: [
        {
          method: 'POST',
          path: '/v1/appointments',
          title: 'Schedule Encounter',
          desc: 'Create an electronic outpatient or telemedicine appointment slot with automatic triage tagging.',
          headers: {
            'Authorization': 'Bearer hc_token_example...',
            'Content-Type': 'application/json'
          },
          requestBody: JSON.stringify({
            patient_id: 'HCG-7719-2041',
            provider_id: 'PRV-9182',
            slot_time: '2026-07-02T10:30:00Z',
            encounter_type: 'Outpatient_Followup',
            triage_priority: 'Standard'
          }, null, 2),
          response200: JSON.stringify({
            appointment_id: 'APT-90412',
            status: 'Confirmed',
            queue_position: 4,
            consent_challenge_url: 'https://app.healthchain.in/consent/verify/APT-90412'
          }, null, 2)
        }
      ]
    },
    {
      id: 'medical-records',
      name: 'Medical Records',
      icon: FileSpreadsheet,
      desc: 'Submit and query encrypted longitudinal electronic health records.',
      endpointCount: 2,
      endpoints: [
        {
          method: 'POST',
          path: '/v1/records',
          title: 'Commit Clinical Record',
          desc: 'Publish an encrypted, digitally-signed SOAP clinical note or discharge summary.',
          headers: {
            'Authorization': 'Bearer hc_token_example...',
            'Content-Type': 'application/json'
          },
          requestBody: JSON.stringify({
            patient_id: 'HCG-7719-2041',
            record_type: 'SOAP_Encounter',
            encrypted_payload_b64: 'U2FsdGVkX194819...example_ciphertext',
            payload_hash_sha256: '9f83c18b...example_hash',
            practitioner_signature: '0x882a...example_sig'
          }, null, 2),
          response200: JSON.stringify({
            record_id: 'REC-108495',
            block_height: 108495,
            transaction_hash: '0x3f1a4bc2...example_tx',
            status: 'Committed'
          }, null, 2)
        }
      ]
    },
    {
      id: 'diagnoses',
      name: 'Diagnoses',
      icon: Activity,
      desc: 'Standardized ICD-10 and SNOMED-CT clinical diagnostic codes.',
      endpointCount: 1,
      endpoints: [
        {
          method: 'POST',
          path: '/v1/diagnoses',
          title: 'Log ICD-10 Diagnosis',
          desc: 'Attach standardized diagnostic coding to an active consultation chart.',
          headers: {
            'Authorization': 'Bearer hc_token_example...',
            'Content-Type': 'application/json'
          },
          requestBody: JSON.stringify({
            encounter_id: 'APT-90412',
            icd10_code: 'I10',
            description: 'Essential (primary) hypertension',
            clinical_status: 'Active',
            verification_status: 'Confirmed'
          }, null, 2),
          response200: JSON.stringify({
            diagnosis_id: 'DX-4401',
            status: 'Recorded'
          }, null, 2)
        }
      ]
    },
    {
      id: 'prescriptions',
      name: 'Prescriptions',
      icon: Pill,
      desc: 'Generate, sign, and dispense tamper-proof digital prescriptions.',
      endpointCount: 2,
      endpoints: [
        {
          method: 'POST',
          path: '/v1/prescriptions',
          title: 'Issue Signed E-Prescription',
          desc: 'Create an e-prescription sealed with doctor cryptographic signature.',
          headers: {
            'Authorization': 'Bearer hc_token_example...',
            'Content-Type': 'application/json'
          },
          requestBody: JSON.stringify({
            patient_id: 'HCG-7719-2041',
            items: [
              { drug: 'Amlodipine 5mg', dosage: '1 tablet daily', duration_days: 30, refills: 2 }
            ],
            doctor_signature: '0x882a...example_sig'
          }, null, 2),
          response200: JSON.stringify({
            rx_number: 'RX-40922',
            dispensing_state: 'Active',
            qr_payload: 'hc://rx/RX-40922/verify?sig=0x882a...'
          }, null, 2)
        }
      ]
    },
    {
      id: 'lab-results',
      name: 'Lab Results',
      icon: TestTube,
      desc: 'Ingest specimen telemetry and dispatch pathologist-attested test reports.',
      endpointCount: 2,
      endpoints: [
        {
          method: 'POST',
          path: '/v1/labs/results',
          title: 'Publish Sealed Lab Result',
          desc: 'Upload laboratory panel parameters and attached DICOM/PDF files.',
          headers: {
            'Authorization': 'Bearer hc_token_example...',
            'Content-Type': 'application/json'
          },
          requestBody: JSON.stringify({
            specimen_barcode: 'SMP-8902',
            panel_name: 'Comprehensive Metabolic Panel',
            parameters: [
              { name: 'Glucose', value: '98', unit: 'mg/dL', status: 'Normal' },
              { name: 'Potassium', value: '4.2', unit: 'mmol/L', status: 'Normal' }
            ],
            pathologist_signature: '0x3f1a...example_sig'
          }, null, 2),
          response200: JSON.stringify({
            result_id: 'LAB-8902-RELEASE',
            integrity_hash: 'SHA256:4a88f...example',
            status: 'Dispatched_To_Doctor'
          }, null, 2)
        }
      ]
    },
    {
      id: 'documents',
      name: 'Documents',
      icon: FileText,
      desc: 'Upload and retrieve encrypted attachments via decentralized storage.',
      endpointCount: 2,
      endpoints: [
        {
          method: 'POST',
          path: '/v1/documents/upload',
          title: 'Upload Encrypted Document',
          desc: 'Persist encrypted imaging DICOM files, surgical scans, or insurance claim bills.',
          headers: {
            'Authorization': 'Bearer hc_token_example...',
            'Content-Type': 'multipart/form-data'
          },
          response200: JSON.stringify({
            document_id: 'DOC-9018-DICOM',
            content_type: 'application/dicom+encrypted',
            r2_storage_uri: 'r2://healthchain-vault/enc_doc_9018.bin',
            payload_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
          }, null, 2)
        }
      ]
    },
    {
      id: 'consent',
      name: 'Consent',
      icon: Shield,
      desc: 'Verify, query, and revoke cryptographic patient consent policies.',
      endpointCount: 2,
      endpoints: [
        {
          method: 'POST',
          path: '/v1/consent/verify',
          title: 'Verify Active Consent Policy',
          desc: 'Validate whether a practitioner or insurer holds active, non-revoked permission to access a record.',
          headers: {
            'Authorization': 'Bearer hc_token_example...',
            'Content-Type': 'application/json'
          },
          requestBody: JSON.stringify({
            patient_id: 'HCG-7719-2041',
            requestor_id: 'PRV-9182',
            scope: 'records:read'
          }, null, 2),
          response200: JSON.stringify({
            consent_valid: true,
            expires_at: '2026-06-28T18:00:00Z',
            allowed_categories: ['SOAP_Notes', 'Prescriptions', 'Lab_Reports'],
            policy_id: 'POL-JENK-90'
          }, null, 2)
        }
      ]
    },
    {
      id: 'audit-logs',
      name: 'Audit Logs',
      icon: Eye,
      desc: 'Query immutable access telemetry and verify ledger block integrity.',
      endpointCount: 2,
      endpoints: [
        {
          method: 'GET',
          path: '/v1/audit/logs',
          title: 'Query Node Audit Stream',
          desc: 'Retrieve tamper-evident event stream of chart reads, prescription edits, and export actions.',
          headers: {
            'Authorization': 'Bearer hc_token_example...'
          },
          response200: JSON.stringify({
            total_records: 1,
            events: [
              {
                event_id: 'EVT-904812',
                timestamp: '2026-06-28T14:32:01.401Z',
                actor_id: 'PRV-9182',
                actor_role: 'Cardiologist',
                action: 'DECRYPT_PATIENT_RECORD',
                resource_id: 'REC-108495',
                block_height: 108495
              }
            ]
          }, null, 2)
        }
      ]
    }
  ];

  const currentSectionData = apiSections.find((s) => s.id === activeSection) || apiSections[0];

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
                <Terminal className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                  HealthChain REST & JSON-LD API Reference
                </span>
              </div>

              <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] leading-[1.08] mb-6">
                Developer API <br />
                <span className="font-bold">Specification & Protocols</span>
              </h1>

              <p className="text-base sm:text-lg text-[#666666] leading-relaxed mb-6">
                Integrate electronic health records, diagnostic laboratories, hospital ERPs, and insurance claims portals directly with the HealthChain decentralized ledger network.
              </p>

              {/* API Conventions Note */}
              <div className="p-4 rounded-xl bg-white border border-[#ECECEC] text-xs text-[#666666] flex flex-wrap items-center gap-4">
                <span className="font-semibold text-[#111111]">Base URL:</span>
                <code className="px-2 py-1 rounded bg-[#F7F4EB] text-[#111111] font-mono text-[11px]">
                  https://api.healthchain.in/v1
                </code>
                <span className="text-[#888888]">|</span>
                <span>Format: <strong className="text-[#111111]">JSON & JSON-LD</strong></span>
                <span className="text-[#888888]">|</span>
                <span>Authentication: <strong className="text-[#111111]">Bearer Tokens & Signature Attestations</strong></span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* DOCUMENTATION WORKSPACE: SIDEBAR & ENDPOINTS                              */}
        {/* ========================================================================= */}
        <section className="py-12 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: API Sidebar Directory */}
              <div className="lg:col-span-4 space-y-2 sticky top-28">
                <div className="p-3 bg-white rounded-xl border border-[#ECECEC] mb-4">
                  <div className="flex items-center gap-2 text-xs text-[#888888] px-2 py-1">
                    <Search className="w-3.5 h-3.5" />
                    <span>Endpoints Directory (11 Modules)</span>
                  </div>
                </div>

                <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
                  {apiSections.map((sec) => {
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
                              {sec.endpoints.length} endpoint{sec.endpoints.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#CCCCCC]'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Endpoint Specification & Code Viewer */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* Active Section Header */}
                <div className="p-6 rounded-2xl bg-white border border-[#ECECEC]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F4EB] border border-[#ECECEC] flex items-center justify-center text-[#111111]">
                      <currentSectionData.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#111111]">{currentSectionData.name} API</h2>
                      <p className="text-xs text-[#666666]">{currentSectionData.desc}</p>
                    </div>
                  </div>
                </div>

                {/* Endpoints in Current Section */}
                {currentSectionData.endpoints.map((ep, idx) => (
                  <div key={ep.path} className="p-6 sm:p-8 rounded-2xl bg-white border border-[#ECECEC] shadow-sm space-y-6">
                    
                    {/* Method & Path Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F3F4F6]">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wider ${
                          ep.method === 'POST' ? 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20' : 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20'
                        }`}>
                          {ep.method}
                        </span>
                        <code className="text-sm font-mono font-bold text-[#111111]">
                          {ep.path}
                        </code>
                      </div>
                      <span className="text-[10px] font-mono text-[#888888] bg-[#FAFAFA] px-2.5 py-1 rounded border border-[#ECECEC]">
                        Documentation Example
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#111111] mb-1">{ep.title}</h3>
                      <p className="text-xs text-[#666666]">{ep.desc}</p>
                    </div>

                    {/* Headers */}
                    {ep.headers && (
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase font-bold text-[#888888] tracking-wider">Required Headers</p>
                        <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEC] font-mono text-xs space-y-1 text-[#333333]">
                          {Object.entries(ep.headers).map(([k, v]) => (
                            <div key={k} className="flex items-center justify-between">
                              <span className="text-[#2563EB]">{k}:</span>
                              <span className="text-[#666666]">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Request Body (If present) */}
                    {ep.requestBody && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] uppercase font-bold text-[#888888] tracking-wider">Request Body (JSON)</p>
                          <button
                            onClick={() => handleCopy(ep.requestBody, `${ep.path}-req`)}
                            className="text-[10px] font-mono text-[#666666] hover:text-[#111111] flex items-center gap-1"
                          >
                            {copiedId === `${ep.path}-req` ? <Check className="w-3 h-3 text-[#16A34A]" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedId === `${ep.path}-req` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="p-4 rounded-xl bg-[#111111] text-[#A3E635] font-mono text-xs overflow-x-auto border border-[#222222]">
                          <code>{ep.requestBody}</code>
                        </pre>
                      </div>
                    )}

                    {/* Response 200 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                          <p className="text-[10px] uppercase font-bold text-[#16A34A] tracking-wider">Response 200 OK</p>
                        </div>
                        <button
                          onClick={() => handleCopy(ep.response200, `${ep.path}-res`)}
                          className="text-[10px] font-mono text-[#666666] hover:text-[#111111] flex items-center gap-1"
                        >
                          {copiedId === `${ep.path}-res` ? <Check className="w-3 h-3 text-[#16A34A]" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === `${ep.path}-res` ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="p-4 rounded-xl bg-[#111111] text-[#60A5FA] font-mono text-xs overflow-x-auto border border-[#222222]">
                        <code>{ep.response200}</code>
                      </pre>
                    </div>

                    {/* Response Error (If present) */}
                    {ep.responseError && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                          <p className="text-[10px] uppercase font-bold text-[#DC2626] tracking-wider">Error Response</p>
                        </div>
                        <pre className="p-4 rounded-xl bg-[#1A1A1A] text-[#F87171] font-mono text-xs overflow-x-auto border border-[#2D2D2D]">
                          <code>{ep.responseError}</code>
                        </pre>
                      </div>
                    )}

                  </div>
                ))}

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
              Developer Ecosystem
            </span>

            <h2 className="font-sans text-4xl sm:text-5xl font-normal tracking-tight text-[#111111] mt-6 mb-6 leading-[1.1]">
              Build on the <br />
              <span className="font-bold">HealthChain Network</span>
            </h2>

            <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-xl mx-auto mb-10">
              Access smart contracts, open-source documentation, and integration sandboxes to connect your health applications.
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center">
              <a
                href="https://github.com/chinnaranga/-AI-powered-Health-Chain#readme"
                target="_blank"
                rel="noreferrer"
                className="px-9 py-4 rounded-xl bg-[#111111] text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-black hover:shadow-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <span>GitHub Repository & Contracts</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => navigate('/book-demo')}
                className="px-9 py-4 rounded-xl bg-white text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
              >
                Request Sandbox Keys
              </button>
            </div>

            <p className="mt-8 text-xs text-[#888888]">
              All code and schema are subject to HealthChain open data integration standards.
            </p>
          </div>
        </section>
      </main>

      {/* Universal Footer with Legal Modals & Newsletter */}
      <Footer />
    </div>
  );
}
