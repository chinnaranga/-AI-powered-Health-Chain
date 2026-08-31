import React, { useState } from 'react';
import { Sliders, Shield, Brain, Volume2, Save, Trash2 } from 'lucide-react';

export default function AISettings() {
  const [provider, setProvider] = useState('Google Gemini');
  const [temperature, setTemperature] = useState(0.2);
  const [maxLength, setMaxLength] = useState(1000);
  const [voiceLang, setVoiceLang] = useState('English');
  const [saved, setSaved] = useState(false);

  const providers = ['Google Gemini', 'OpenAI GPT-5', 'Anthropic Claude', 'Llama 3.1', 'DeepSeek Coder'];
  const languages = ['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Marathi', 'Bengali'];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to purge all conversation logs? This is irreversible.')) {
      alert('Local and database conversation history logs cleared.');
    }
  };

  return (
    <div className="space-y-6 w-full overflow-y-auto pr-1">
      <div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">AI Assistant Settings</h2>
        <p className="text-xs text-[#666666] mt-1">Configure model parameters and API provider endpoints.</p>
      </div>

      <div className="bg-white border border-[#ECECEC] rounded-[12px] p-6 space-y-6">
        
        {/* LLM Provider */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666]">Primary LLM Provider Engine</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {providers.map(p => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={`py-3 text-xs font-bold rounded-[12px] border transition-all ${
                  provider === p ? 'border-[#2563EB] bg-[#E8F0FE] text-[#2563EB]' : 'border-[#ECECEC] bg-white text-[#666666] hover:border-[#111111]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-[#F3F3F3]">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#666666]">
              <span>Model Temperature (Creativity)</span>
              <span className="font-mono text-[#2563EB]">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#E8F0FE] rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-[10px] text-[#666666]">Lower values result in more deterministic clinical summaries.</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#666666]">
              <span>Max Response Length</span>
              <span className="font-mono text-[#2563EB]">{maxLength} tokens</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={maxLength}
              onChange={(e) => setMaxLength(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#E8F0FE] rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Audio / Languages */}
        <div className="space-y-2 pt-4 border-t border-[#F3F3F3]">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666]">Voice Assistant Language Output</label>
          <select
            value={voiceLang}
            onChange={(e) => setVoiceLang(e.target.value)}
            className="w-full px-4 py-3 bg-[#E8F0FE] text-xs font-semibold rounded-[12px] border border-[#ECECEC]"
          >
            {languages.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Actions buttons */}
        <div className="border-t border-[#ECECEC] pt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase tracking-wider rounded-[12px] flex justify-center items-center gap-1.5 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saved ? 'Settings Saved' : 'Save Configurations'}</span>
          </button>
          <button
            onClick={handleClearHistory}
            className="px-6 py-3 border border-[#DC2626] text-[#DC2626] text-xs font-bold uppercase tracking-wider rounded-[12px] hover:bg-red-50 flex justify-center items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Purge Logs History</span>
          </button>
        </div>

      </div>

    </div>
  );
}
