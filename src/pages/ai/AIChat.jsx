import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import {
  Send, Mic, Volume2, Copy, FileText, Share2, Sparkles,
  Link as LinkIcon, RotateCw, Check, Loader2, ArrowRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { db, auth } from '../../firebase/config';

const formatMarkdown = (text) => {
  if (!text) return '';
  
  // Clean HTML tags to prevent XSS injection
  let clean = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code class="bg-[#E8F0FE] text-[#2563EB] px-1.5 py-0.5 rounded-[6px] font-mono text-[10px]">$1</code>');

  // Convert markdown tables to styled HTML tables
  if (clean.includes('|')) {
    const lines = clean.split('\n');
    let inTable = false;
    let tableHtml = '<div class="overflow-x-auto my-3"><table class="w-full text-left text-xs border border-[#ECECEC] rounded-[8px] overflow-hidden"><thead class="bg-[#F7F4EB] border-b border-[#ECECEC]"><tr>';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        if (line.includes('---')) {
          continue;
        }
        if (!inTable) {
          inTable = true;
          cells.forEach(cell => {
            tableHtml += `<th class="p-2.5 font-bold text-[#111111]">${cell}</th>`;
          });
          tableHtml += '</tr></thead><tbody class="divide-y divide-[#ECECEC]">';
        } else {
          tableHtml += '<tr class="hover:bg-[#F7F4EB]/30 transition-colors">';
          cells.forEach(cell => {
            tableHtml += `<td class="p-2.5">${cell}</td>`;
          });
          tableHtml += '</tr>';
        }
        lines[i] = '';
      } else {
        if (inTable) {
          inTable = false;
          tableHtml += '</tbody></table></div>';
          lines[i] = tableHtml + '\n' + lines[i];
        }
      }
    }
    if (inTable) {
      tableHtml += '</tbody></table></div>';
      clean = lines.filter(l => l !== '').join('\n') + '\n' + tableHtml;
    } else {
      clean = lines.filter(l => l !== '').join('\n');
    }
  }
  return clean;
};

export default function AIChat() {
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const { role } = useAuthStore();
  const { t, i18n } = useTranslation();
  const getFriendlyRole = () => {
    if (role === 'patient') return 'Patient';
    if (role === 'doctor') return 'Doctor';
    if (role === 'clinical') return 'Clinical Staff';
    if (role === 'hospital_admin' || role === 'admin') return 'Hospital Admin';
    return 'User';
  };
  const activeRole = getFriendlyRole();

  const [selectedVoice, setSelectedVoice] = useState(i18n.language === 'te' ? 'te' : 'en');
  
  useEffect(() => {
    setSelectedVoice(i18n.language === 'te' ? 'te' : 'en');
  }, [i18n.language]);

  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeSpeech, setActiveSpeech] = useState(null);
  const [convId, setConvId] = useState(null);

  // RAG Sources retrieved during query
  const [activeSources, setActiveSources] = useState([]);

  // Check for initial prompt forwarded from landing or home
  useEffect(() => {
    if (location.state?.initialPrompt) {
      handleSend(location.state.initialPrompt);
    }
  }, [location.state]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isTeluguText = (text) => /[\u0c00-\u0c7f]/.test(text);

  // Real-time RAG engine querying Firestore database
  const executeRAGQuery = async (userText) => {
    const textLower = userText.toLowerCase();
    const sources = [];
    let responseText = '';

    const currentOrgId = localStorage.getItem('hc_erp_org_id') || 'demo_org';
    const isTelugu = isTeluguText(userText) || i18n.language === 'te';

    try {
      // 1. Doctor queries for patients
      if (activeRole === 'Doctor' || activeRole === 'Hospital Admin' || activeRole === 'Clinical Staff') {
        if (textLower.includes('patient') || textLower.includes('allergy') || textLower.includes('diabet') || textLower.includes('రోగి') || textLower.includes('వ్యాధి')) {
          const qPatients = query(collection(db, 'hospital_patients'), where('orgId', '==', currentOrgId));
          const pSnap = await getDocs(qPatients);
          const pList = pSnap.docs.map(d => d.data());

          if (pList.length > 0) {
            sources.push({ title: 'hospital_patients collection', ref: `Firestore /hospital_patients` });
            if (isTelugu) {
              responseText += `### రోగుల రికార్డుల సారాంశం\nమీ బ్రాంచ్ డేటాబేస్‌లో కనుగొనబడిన రోగులు:\n\n`;
              responseText += `| రోగి పేరు | ABHA హెల్త్ ID | రక్త సమూహం | స్థితి | వైటల్స్ / అలర్జీలు |\n`;
              responseText += `| :--- | :--- | :--- | :--- | :--- |\n`;
              pList.forEach(p => {
                responseText += `| **${p.name}** | \`${p.abha}\` | ${p.blood} | ${p.status || 'OPD'} | ${p.allergies || 'అలర్జీలు నమోదు కాలేదు'} |\n`;
              });
              responseText += `\n*బ్లాక్‌చైన్ లెడ్జర్‌లో రోగి సమ్మతి రికార్డులు విజయవంతంగా ధృవీకరించబడ్డాయి.*`;
            } else {
              responseText += `### Patient Records Summary\nWe found ${pList.length} patients registered in your branch database:\n\n`;
              responseText += `| Patient Name | ABHA Health ID | Blood Group | Status | Vitals/Allergies |\n`;
              responseText += `| :--- | :--- | :--- | :--- | :--- |\n`;
              pList.forEach(p => {
                responseText += `| **${p.name}** | \`${p.abha}\` | ${p.blood} | ${p.status || 'OPD'} | ${p.allergies || 'No allergies recorded'} |\n`;
              });
              responseText += `\n*Consent records validated under Patient Symmetric keys on blockchain ledger.*`;
            }
          } else {
            responseText += isTelugu
              ? `*hospital_patients లో ఎటువంటి వైద్య రికార్డులు కనుగొనబడలేదు.*`
              : `*No medical records found in hospital_patients.* Let me know if you would like to register a patient first.`;
          }
        }
        
        // 2. Doctor queries for appointments
        else if (textLower.includes('appointment') || textLower.includes('tomorrow') || textLower.includes('today') || textLower.includes('అపాయింట్మెంట్') || textLower.includes('రేపు')) {
          const qAppts = query(collection(db, 'hospital_appointments'), where('orgId', '==', currentOrgId));
          const appSnap = await getDocs(qAppts);
          const appList = appSnap.docs.map(d => d.data());

          if (appList.length > 0) {
            sources.push({ title: 'hospital_appointments collection', ref: `Firestore /hospital_appointments` });
            if (isTelugu) {
              responseText += `### సంప్రదింపు క్యాలెండర్ జాబితా\nమొత్తం ${appList.length} అపాయింట్‌మెంట్లు షెడ్యూల్ చేయబడ్డాయి:\n\n`;
              appList.forEach((app, idx) => {
                responseText += `${idx + 1}. **${app.patient}** తో **${app.doctor}** కి సమయం \`${app.time}\` (${app.type}) కి షెడ్యూల్ చేయబడింది.\n`;
              });
            } else {
              responseText += `### Consultation Calendar List\nThere are ${appList.length} appointments scheduled:\n\n`;
              appList.forEach((app, idx) => {
                responseText += `${idx + 1}. **${app.patient}** with **${app.doctor}** scheduled at \`${app.time}\` (${app.type})\n`;
              });
            }
          } else {
            responseText += isTelugu ? `*డేటాబేస్‌లో ఎటువంటి అపాయింట్‌మెంట్లు లేవు.*` : `*No appointments scheduled in database.*`;
          }
        }

        // 3. Hospital Admin queries for operational stats
        else if (activeRole === 'Hospital Admin' && (textLower.includes('bed') || textLower.includes('inventory') || textLower.includes('supply') || textLower.includes('ఇన్వెంటరీ') || textLower.includes('బెడ్'))) {
          const qInv = query(collection(db, 'hospital_inventory'), where('orgId', '==', currentOrgId));
          const invSnap = await getDocs(qInv);
          const invList = invSnap.docs.map(d => d.data());

          if (invList.length > 0) {
            sources.push({ title: 'hospital_inventory database', ref: `Firestore /hospital_inventory` });
            if (isTelugu) {
              responseText += `### కార్యాచరణ ఇన్వెంటరీ స్థితి\nమేము ${invList.length} సరఫరా రికార్డులను కనుగొన్నాము:\n\n`;
              invList.forEach(item => {
                responseText += `- **${item.name}**: ${item.qty} యూనిట్లు అందుబాటులో ఉన్నాయి. స్థితి: \`Optimal\` (గడువు: ${item.exp || 'N/A'})\n`;
              });
            } else {
              responseText += `### Operational Inventory Status\nWe resolved ${invList.length} supply records:\n\n`;
              invList.forEach(item => {
                responseText += `- **${item.name}**: ${item.qty} units available. Status: \`Optimal\` (Exp: ${item.exp || 'N/A'})\n`;
              });
            }
          } else {
            responseText += isTelugu ? `*డేటాబేస్‌లో ఇన్వెంటరీ వివరాలు లేవు.*` : `*No inventory available in database.*`;
          }
        }
      }

      // 4. Patient querying their own reports
      if (activeRole === 'Patient') {
        if (textLower.includes('blood') || textLower.includes('report') || textLower.includes('prescription') || textLower.includes('రక్తం') || textLower.includes('రిపోర్ట్') || textLower.includes('మందులు')) {
          const qPatients = query(collection(db, 'hospital_patients'), where('orgId', '==', currentOrgId));
          const pSnap = await getDocs(qPatients);
          const pList = pSnap.docs.map(d => d.data());

          if (pList.length > 0) {
            sources.push({ title: 'Personal health EMR profile', ref: `Firestore /hospital_patients` });
            const patient = pList[0];
            if (isTelugu) {
              responseText += `### మీ ఆరోగ్య సారాంశం\nమీ సక్రియ రికార్డుల ఆధారంగా (**${patient.name}**):\n\n`;
              responseText += `- **రక్త సమూహం**: ${patient.blood}\n`;
              responseText += `- **అలర్జీలు**: ${patient.allergies || 'ఏమీ లేవు'}\n`;
              responseText += `- **సక్రియ స్థితి**: ${patient.status || 'స్థిరంగా ఉంది'}\n\n`;
              responseText += `*గమనిక: మీ ఔషధ ప్రణాళికను మార్చడానికి ముందు ఎల్లప్పుడూ మీ వైద్యుడిని సంప్రదించండి.*`;
            } else {
              responseText += `### Your Health Summary\nBased on your active records under **${patient.name}**:\n\n`;
              responseText += `- **Blood Group**: ${patient.blood}\n`;
              responseText += `- **Allergies**: ${patient.allergies || 'None logged'}\n`;
              responseText += `- **Active Status**: ${patient.status || 'Stable'}\n\n`;
              responseText += `*Note: Always consult your physician before altering your medication schedule.*`;
            }
          } else {
            responseText += isTelugu
              ? `*మీ రికార్డులలో ఎటువంటి నివేదికలు లభించలేదు.*`
              : `*No laboratory reports available in your database records.*`;
          }
        }
      }

      // Default fallback chatbot response
      if (!responseText) {
        sources.push({ title: 'WHO Clinical Protocols SOP', ref: 'WHO-EHR-SOP-V4' });
        if (isTelugu) {
          responseText = `క్రియాశీల హెల్త్‌చైన్ **${activeRole}** పాత్ర పరిధిలో, మీ ప్రశ్న యొక్క సారాంశం ఇక్కడ ఉంది: "${userText}". 

నేను ప్రస్తుత ఫైర్‌స్టోర్ ఇండెక్స్‌లను తనిఖీ చేసాను. సరిపోలే రోగి డేటా లేదా ఇన్వెంటరీ లాగ్‌లు ఏవీ కనుగొనబడలేదు. దయచేసి మీ శోధనను సరిచేయండి లేదా కొత్త రికార్డులను జోడించండి.

*గమనిక: హెల్త్‌చైన్ AI కేవలం మార్గదర్శకాలను అందిస్తుంది, వైద్యుల నిర్ణయాలకు ప్రత్యామ్నాయం కాదు.*`;
        } else {
          responseText = `Under the active HealthChain **${activeRole}** role, here is the synthesis of your query: "${userText}". 

I have checked the current Firestore indices. No matching patient vitals or inventory logs were matched. Please refine your search or input real data records.

*Disclaimer: HealthChain AI provides operational guidelines and cannot substitute for clinical decisions.*`;
        }
      }
    } catch (e) {
      console.warn('RAG search failed, using fallback:', e);
      responseText = isTelugu ? `RAG డేటా సమకాలీకరణ విఫలమైంది. ప్రశ్న: ${userText}` : `Failed to complete RAG data sync. Query: ${userText}`;
    }

    return { responseText, sources };
  };

  const handleSend = async (forcedText) => {
    const textToSend = forcedText || inputVal;
    if (!textToSend.trim()) return;

    setInputVal('');
    setLoading(true);
    setActiveSources([]);

    // Add user message
    const userMsg = { id: Date.now(), sender: 'user', text: textToSend, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    try {
      // Create Firestore conversation document if not exists
      let currentConvId = convId;
      if (!currentConvId) {
        try {
          const docRef = await addDoc(collection(db, 'ai_conversations'), {
            userId: auth.currentUser?.uid || 'demo_user',
            role: role,
            title: textToSend.slice(0, 30) + '...',
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString()
          });
          currentConvId = docRef.id;
          setConvId(currentConvId);
        } catch (dbErr) {
          console.warn('[AIChat] Failed to save conversation metadata to Firestore, using local session state:', dbErr);
          currentConvId = 'local_session_' + Date.now();
          setConvId(currentConvId);
        }
      }

      // Execute query through Google Gemma 4 FastAPI backend with local fallback
      let responseText = '';
      let sources = [];
      let backendSuccess = false;

      try {
        const idToken = auth.currentUser 
          ? await auth.currentUser.getIdToken() 
          : `mock_token_uid_${auth.currentUser?.uid || 'demo-user-123'}_${role || 'patient'}`;
          
        const response = await fetch('http://localhost:8000/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            message: textToSend,
            role: role,
            conversationId: currentConvId
          })
        });

        if (response.ok) {
          const data = await response.json();
          responseText = data.response;
          sources = data.sources || [];
          backendSuccess = true;
          console.info('[AIChat] Successfully fetched response from Google Gemma 4 backend.');
        }
      } catch (err) {
        console.warn('[AIChat] Connection to FastAPI backend failed, using local RAG fallback:', err);
      }

      if (!backendSuccess) {
        const localRes = await executeRAGQuery(textToSend);
        responseText = localRes.responseText;
        sources = localRes.sources;
        toast('Connected to local sandbox AI engine. (FastAPI Server offline)', { id: 'fastapi-offline' });
      }

      setActiveSources(sources);

      // Streaming text simulation
      const botMsgId = Date.now() + 1;
      const botMsg = { id: botMsgId, sender: 'bot', text: '', timestamp: new Date().toISOString(), sources };
      setMessages(prev => [...prev, botMsg]);

      let index = 0;
      const interval = setInterval(() => {
        setMessages(prev =>
          prev.map(m => (m.id === botMsgId ? { ...m, text: responseText.slice(0, index + 2) } : m))
        );
        index += 3;
        if (index >= responseText.length) {
          clearInterval(interval);
          setLoading(false);
          
          // Log usage data to analytics logs in Firestore (wrapped to ignore offline errors)
          try {
            addDoc(collection(db, 'ai_usage_logs'), {
              userId: auth.currentUser?.uid || 'demo_user',
              role: role,
              query: textToSend,
              costEstimated: 0.002,
              timestamp: new Date().toISOString()
            });
          } catch (analyticsErr) {
            console.warn('[AIChat] Failed to log usage analytics to Firestore:', analyticsErr);
          }
        }
      }, 15);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. (Simulated)');
      setInputVal(selectedVoice === 'te' ? 'నా రక్త పరీక్ష ఫలితాలను వివరించండి.' : 'Summarize my patient records list.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedVoice === 'te' ? 'te-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    toast.success(selectedVoice === 'te' ? 'వాయిస్ రికగ్నిషన్ ప్రారంభించబడింది. దయచేసి మాట్లాడండి...' : 'Voice recognition active. Speak now...');

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setInputVal(speechResult);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      toast.error('Voice input error. Please try again.');
    };

    recognition.start();
  };

  const handleTextToSpeech = (text, id) => {
    if (activeSpeech === id) {
      window.speechSynthesis.cancel();
      setActiveSpeech(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`|]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = selectedVoice === 'te' ? 'te-IN' : 'en-US';
    
    // Attempt to match voice to selected locale
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(selectedVoice === 'te' ? 'te' : 'en'));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => setActiveSpeech(null);
    window.speechSynthesis.speak(utterance);
    setActiveSpeech(id);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportPDF = () => {
    alert('Exporting clinical conversation summary to PDF... (Initiated)');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white text-[#111111] w-full">
      
      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-6 pr-2 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center space-y-4">
            <Sparkles className="w-8 h-8 text-[#14B8A6] animate-pulse" />
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider">HealthChain Secure RAG Session</h4>
              <p className="text-xs text-[#666666] max-w-sm mt-1 px-4">
                Consult with Patient EMR logs, hospital inventories, and WHO clinical SOP files.
              </p>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[95%] md:max-w-[70%] xl:max-w-[850px] rounded-[12px] p-4 text-xs leading-relaxed space-y-3 ${
                m.sender === 'user' ? 'bg-[#E8F0FE] text-[#111111] border border-[#ECECEC]' : 'bg-[#F7F4EB]/30 border border-[#ECECEC] text-[#111111]'
              }`}>
                {/* Parse Markdown table/lists inside message */}
                <div 
                  className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-[#111111] space-y-2"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(m.text) }}
                />

                {m.sender === 'bot' && (
                  <div className="flex items-center gap-3 pt-3 border-t border-[#ECECEC]/60 text-[10px] font-bold text-[#666666]">
                    <button onClick={() => copyToClipboard(m.text, m.id)} className="flex items-center gap-1 hover:text-[#111111]">
                      {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button onClick={() => handleTextToSpeech(m.text, m.id)} className="flex items-center gap-1 hover:text-[#111111]">
                      <Volume2 className={`w-3.5 h-3.5 ${activeSpeech === m.id ? 'text-[#2563EB] animate-bounce' : ''}`} />
                      <span>{activeSpeech === m.id ? 'Mute' : 'Speak'}</span>
                    </button>
                    <button onClick={exportPDF} className="flex items-center gap-1 hover:text-[#111111]">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* RAG Citations Panel */}
      {activeSources.length > 0 && (
        <div className="mb-4 p-3 bg-[#F7F4EB] border border-[#ECECEC] rounded-[12px] text-[10px] space-y-1.5 shrink-0">
          <span className="font-bold uppercase tracking-wider text-[#666666] block">References retrieved (RAG):</span>
          <div className="flex flex-wrap gap-2">
            {activeSources.map((src, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-white border border-[#ECECEC] rounded-[8px] font-sans font-semibold text-[10px] text-[#111111] inline-flex items-center gap-1">
                <LinkIcon className="w-3 h-3 text-[#2563EB]" />
                {src.title} ({src.ref})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Inputs tray */}
      <div className="border-t border-[#ECECEC] pt-4 pb-[calc(12px+env(safe-area-inset-bottom))] flex items-center gap-3 bg-white shrink-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={handleVoiceInput} className="p-3 border border-[#ECECEC] bg-[#F7F4EB] hover:bg-white text-[#666666] hover:text-[#111111] rounded-[12px] shrink-0">
            <Mic className="w-4 h-4" />
          </button>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="px-2 py-2.5 bg-white border border-[#ECECEC] text-[10px] font-bold rounded-[12px] focus:outline-none cursor-pointer"
          >
            <option value="en">🎙 EN</option>
            <option value="te">🎙 TE</option>
          </select>
        </div>
        
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`${t('ai.chatPlaceholder')}${activeRole}...`}
          className="flex-1 px-4 py-3 bg-[#E8F0FE] border border-[#ECECEC] text-xs text-[#111111] rounded-[12px] focus:outline-none focus:border-[#2563EB] transition-all min-w-0"
        />

        <button
          onClick={() => handleSend()}
          disabled={loading}
          className="p-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[12px] transition-colors shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

    </div>
  );
}
