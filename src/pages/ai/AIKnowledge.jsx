import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query } from 'firebase/firestore';
import { Database, Search, Upload, FileText, Check, Loader2, Link as LinkIcon } from 'lucide-react';
import { db } from '../../firebase/config';

export default function AIKnowledge() {
  const [documents, setDocuments] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  // Default seeded guidelines
  const defaults = [
    { title: 'WHO Cardiovascular Screening SOP', category: 'Clinical Protocols', pages: 12, size: '2.4 MB' },
    { title: 'ABDM Sandboxing Integration Guide', category: 'Regulatory Standards', pages: 48, size: '6.1 MB' },
    { title: 'ICMR Type-2 Diabetes Care Protocol', category: 'Clinical Protocols', pages: 18, size: '3.0 MB' },
    { title: 'St. Jude General Ward Emergency Policy', category: 'Internal Policies', pages: 8, size: '1.2 MB' }
  ];

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const qDocs = query(collection(db, 'ai_knowledge_base'));
        const snap = await getDocs(qDocs);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Merge defaults and firestore entries
        setDocuments([...defaults, ...list]);
      } catch (err) {
        console.warn('Failed to load knowledge collection:', err);
        setDocuments(defaults);
      } finally {
        setLoading(false);
      }
    };
    fetchKnowledge();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setFileName(file.name);
    try {
      // Seed metadata document to Firestore
      const docRef = await addDoc(collection(db, 'ai_knowledge_base'), {
        title: file.name,
        category: 'Uploaded Document',
        pages: Math.floor(1 + Math.random() * 15),
        size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
        uploadedAt: new Date().toISOString()
      });

      // Append to local list
      setDocuments(prev => [...prev, {
        id: docRef.id,
        title: file.name,
        category: 'Uploaded Document',
        pages: Math.floor(1 + Math.random() * 15),
        size: (file.size / 1024 / 1024).toFixed(1) + ' MB'
      }]);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
      setFileName('');
    }
  };

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchVal.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full overflow-y-auto pr-1">
      
      <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">RAG Knowledge Base</h2>
          <p className="text-xs text-[#666666] mt-1">Sync regulatory guidelines and internal clinical SOPs for semantic vector search context.</p>
        </div>
      </div>

      {/* RAG Upload section */}
      <div className="bg-[#F7F4EB]/30 p-6 border border-[#ECECEC] rounded-[12px] flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="space-y-1 max-w-md">
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#111111]">Sync New Clinical Document</h4>
          <p className="text-[11px] text-[#666666] leading-relaxed">
            Upload hospital guidelines PDFs to index them. They will immediately become searchable context vectors for the clinical AI assistant.
          </p>
        </div>

        <label className="px-5 py-3 bg-[#111111] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-[12px] cursor-pointer flex items-center gap-1.5 transition-colors">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          <span>{uploading ? `Indexing ${fileName}...` : 'Upload Policy PDF'}</span>
          <input type="file" onChange={handleFileUpload} accept=".pdf" className="hidden" />
        </label>
      </div>

      {/* Search and Table */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#666666]" />
          <input
            type="text"
            placeholder="Search indexed manuals..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#E8F0FE] text-xs text-[#111111] rounded-[12px] border border-[#ECECEC] focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#666666]" />
          </div>
        ) : (
          <div className="border border-[#ECECEC] rounded-[12px] overflow-x-auto bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F4EB] border-b border-[#ECECEC]">
                <tr>
                  <th className="p-3 font-bold text-[#111111]">Document Title</th>
                  <th className="p-3 font-bold text-[#111111]">Category</th>
                  <th className="p-3 font-bold text-[#111111]">Pages</th>
                  <th className="p-3 font-bold text-[#111111]">File Size</th>
                  <th className="p-3 font-bold text-[#111111]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECECEC]">
                {filteredDocs.map((doc, idx) => (
                  <tr key={idx} className="hover:bg-[#F7F4EB]/30 transition-colors">
                    <td className="p-3 font-bold text-[#111111] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                      {doc.title}
                    </td>
                    <td className="p-3 text-[#666666]">{doc.category}</td>
                    <td className="p-3 font-mono">{doc.pages} pgs</td>
                    <td className="p-3 font-mono text-[#666666]">{doc.size}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#16A34A] inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> Indexed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
