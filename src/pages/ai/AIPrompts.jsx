import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, Sparkles, ChevronRight, User, Stethoscope, Building2, Code } from 'lucide-react';

export default function AIPrompts() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Doctor');

  const categories = ['Doctor', 'Patient', 'Hospital Admin', 'Developer'];

  const prompts = [
    {
      title: 'Generate SOAP Notes',
      category: 'Doctor',
      desc: 'Creates a structured SOAP format note from clinical transcriptions.',
      prompt: 'Generate a detailed SOAP note template for an adult patient reporting acute lower back pain.',
      icon: Stethoscope
    },
    {
      title: 'Explain MRI / CT Scans',
      category: 'Doctor',
      desc: 'Simplifies complicated anatomical findings for medical reports reviews.',
      prompt: 'Translate this MRI lumbar spine report details into clinical points: L4-L5 disc protrusion.',
      icon: Stethoscope
    },
    {
      title: 'Draft Clinical Follow-up',
      category: 'Doctor',
      desc: 'Creates patient-friendly home care plans and recovery checklists.',
      prompt: 'Create a clinical follow-up recovery care plan for a patient post-appendectomy.',
      icon: Stethoscope
    },
    {
      title: 'Decipher Blood Report',
      category: 'Patient',
      desc: 'Explains blood counts and lipid panel parameters in simple terms.',
      prompt: 'Translate my lipid panel report values: Total Cholesterol: 240, LDL: 160.',
      icon: User
    },
    {
      title: 'Symptom Consultation',
      category: 'Patient',
      desc: 'Get basic guidance on specialists to consult based on symptoms.',
      prompt: 'I have persistent joint pain in my knees and morning stiffness. What specialist should I consult?',
      icon: User
    },
    {
      title: 'Beds & Operations Summary',
      category: 'Hospital Admin',
      desc: 'Track bed capacity metrics, staff schedules, and outstanding claims.',
      prompt: 'Provide a bed occupancy and doctor duty roster operational summary query.',
      icon: Building2
    },
    {
      title: 'Supply Inventory Warnings',
      category: 'Hospital Admin',
      desc: 'Flag clinical supplies, oxygen cylinders, and medications expiring.',
      prompt: 'List inventory supplies nearing expiration dates or threshold limits.',
      icon: Building2
    },
    {
      title: 'Inspect FHIR Schema',
      category: 'Developer',
      desc: 'Generate valid HL7 FHIR JSON objects for patient diagnostic reports.',
      prompt: 'Create a mock FHIR JSON resource schema representing a Patient observation entry.',
      icon: Code
    }
  ];

  const filteredPrompts = prompts.filter(p => p.category === activeCategory);

  const usePrompt = (text) => {
    navigate('/ai/chat', { state: { initialPrompt: text } });
  };

  return (
    <div className="space-y-6 w-full overflow-y-auto pr-1">
      <div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Clinical Prompt Library</h2>
        <p className="text-xs text-[#666666] mt-1">Pre-engineered healthcare templates to extract structured clinical analysis.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#ECECEC] pb-3">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-xs font-bold rounded-[8px] transition-colors ${
              activeCategory === cat ? 'bg-[#2563EB] text-white' : 'bg-[#F7F4EB] text-[#666666] hover:text-[#111111]'
            }`}
          >
            {cat} Prompts
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrompts.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              className="p-5 border border-[#ECECEC] bg-white rounded-[12px] hover:border-[#111111] transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#F7F4EB] rounded-[8px] text-[#111111]">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#111111]">{p.title}</h4>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">{p.desc}</p>
              </div>

              <button
                onClick={() => usePrompt(p.prompt)}
                className="mt-4 w-full py-2.5 bg-[#E8F0FE] hover:bg-[#2563EB] hover:text-white text-[#2563EB] text-xs font-bold uppercase tracking-wider rounded-[8px] transition-all flex justify-center items-center gap-1.5"
              >
                <span>Run Prompt</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
