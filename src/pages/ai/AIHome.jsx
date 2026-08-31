import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, FileText, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/authStore';
import { auth } from '../../firebase/config';

export default function AIHome() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { role } = useAuthStore();
  const getFriendlyRole = () => {
    if (role === 'patient') return 'Patient';
    if (role === 'doctor') return 'Doctor';
    if (role === 'clinical') return 'Clinical Staff';
    if (role === 'hospital_admin' || role === 'admin') return 'Hospital Admin';
    return 'User';
  };
  const activeRole = getFriendlyRole();
  const [queryText, setQueryText] = useState('');

  const getQuickActions = () => {
    switch (role) {
      case 'patient':
        return [
          { title: 'Explain Blood Report', desc: 'Symmetric decryption checks for blood count lipid ranges.', prompt: 'Can you explain my recent blood panel report findings?' },
          { title: 'Summarize Medical History', desc: 'Get a clean history layout from on-chain FHIR records.', prompt: 'Give me a brief summary of my medical records timeline.' },
          { title: 'Book Appointment Consult', desc: 'Find active doctors matches and log schedule appointments.', prompt: 'Help me find a doctor and book an appointment slot.' },
          { title: 'Explain Prescription', desc: 'Translate complicated pharmacological names to patient guides.', prompt: 'Explain the dosage instructions and side effects for my prescription.' }
        ];
      case 'doctor':
        return [
          { title: 'Generate SOAP Notes', desc: 'Create structured clinical records from patient consultation reports.', prompt: 'Help me generate a SOAP note outline for an OPD visit.' },
          { title: 'Explain Laboratory Findings', desc: 'Correlate prior patient lipid panels and indicate risk levels.', prompt: 'Compare the patient\'s past 3 HbA1c test results.' },
          { title: 'Drug Interaction & Allergies', desc: 'Verify compatibility against patient allergy databases.', prompt: 'Check for potential drug interactions between Atorvastatin and Metformin.' },
          { title: 'Summarize Patient History', desc: 'Create diagnostic timeline summaries from ABDM registers.', prompt: 'Provide a chronological clinical summary of the patient EMR.' }
        ];
      case 'hospital_admin':
      case 'admin':
        return [
          { title: 'Operational Summary', desc: 'Track bed capacity ratios, doctors workload schedules.', prompt: 'Provide the daily operations summary including occupancy rate.' },
          { title: 'Revenue & Financial Audit', desc: 'Aggregate billing invoices and claim payments values.', prompt: 'Summarize total outstanding invoices and claim approvals for this week.' },
          { title: 'Supply Inventory Alerts', desc: 'Highlight stock warnings and expiration timelines.', prompt: 'List medical supply items nearing depletion or expiry.' },
          { title: 'Security Audit Logs', desc: 'Inspect blockchain consensus ledger logs and key updates.', prompt: 'Retrieve recent blockchain access keys logs and validator signatures.' }
        ];
      case 'clinical':
        return [
          { title: 'Analyze Abnormal Values', desc: 'Highlight critical flags and suggest re-test validations.', prompt: 'Identify and outline abnormal parameters in the recent cbc log.' },
          { title: 'Generate Patient Explanation', desc: 'Translate lab test metrics to patient friendly summaries.', prompt: 'Create a simple patient summary for a borderline high lipid profile.' }
        ];
      default:
        return [
          { title: 'Explain ABDM Policies', desc: 'Access Indian National Health registries setup SOPs.', prompt: 'How do we link a patient profile to ABDM sandboxes?' },
          { title: 'Verify Ledger Consensus', desc: 'Inspect hardhat hashes signatures audits.', prompt: 'Explain how cryptographic hashes match clinical records on-chain.' }
        ];
    }
  };

  const handleActionClick = (prompt) => {
    // Navigate relatively to child chat route
    navigate('chat', { state: { initialPrompt: prompt } });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (queryText.trim()) {
      navigate('chat', { state: { initialPrompt: queryText } });
    }
  };

  return (
    <div className="space-y-8 flex-1 w-full overflow-y-auto pr-1">
      
      {/* Welcome Heading */}
      <div className="space-y-2">
        <h1 className="text-3xl font-normal tracking-tight text-[#111111] leading-none">
          {t('auth.welcome')}, <span className="font-bold">{activeRole === 'Patient' ? t('patient.dashboardTitle') : t('common.profile')}</span>
        </h1>
        <p className="text-sm text-[#666666]">{t('ai.assistantTitle')}</p>
      </div>

      {/* Natural Language Search Box */}
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <Search className="w-5 h-5 text-[#666666] absolute left-4 top-4.5" />
        <input
          type="text"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder={`${t('ai.chatPlaceholder')}${activeRole}...`}
          className="w-full pl-12 pr-28 py-4.5 bg-[#E8F0FE] text-sm text-[#111111] rounded-[12px] border border-[#ECECEC] focus:outline-none focus:border-[#2563EB] transition-all"
        />
        <button
          type="submit"
          className="absolute right-3 top-3 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase rounded-[8px] flex items-center gap-1.5 transition-colors"
        >
          <span>{t('common.search')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Quick Action Tiles */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#111111] flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#14B8A6]" />
          {t('ai.prompts')}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {getQuickActions().map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleActionClick(action.prompt)}
              className="p-5 border border-[#ECECEC] rounded-[12px] text-left hover:border-[#111111] bg-white transition-all hover:shadow-sm space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#111111]">{action.title}</h4>
                <p className="text-xs text-[#666666] leading-relaxed">{action.desc}</p>
              </div>
              <span className="text-[10px] text-[#2563EB] font-bold uppercase tracking-wider inline-flex items-center gap-1 mt-2">
                Launch Copilot <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Trust & Verification info */}
      <div className="bg-[#F7F4EB]/30 p-4 border border-[#ECECEC] rounded-[12px] flex items-center gap-3 text-xs text-[#666666]">
        <ShieldCheck className="w-5 h-5 text-[#14B8A6] shrink-0" />
        <p>
          HealthChain AI runs decentralized RAG queries across verified clinical records in real-time. Patient credentials symmetric consent signatures required for all EMR access keys.
        </p>
      </div>

    </div>
  );
}

// ChevronRight custom helper
function ChevronRight(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
