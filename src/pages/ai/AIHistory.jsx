import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { MessageSquare, Calendar, User, ArrowRight, Loader2 } from 'lucide-react';
import { db, auth } from '../../firebase/config';

export default function AIHistory() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = auth.currentUser?.uid || 'demo_user';
        const qHistory = query(
          collection(db, 'ai_conversations'),
          where('userId', '==', userId)
        );
        const querySnap = await getDocs(qHistory);
        const list = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setConversations(list);
      } catch (err) {
        console.warn('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const openConversation = (conv) => {
    navigate('/ai/chat', { state: { initialPrompt: `Review chat: "${conv.title}"` } });
  };

  return (
    <div className="space-y-6 w-full overflow-y-auto pr-1">
      <div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Conversation History Logs</h2>
        <p className="text-xs text-[#666666] mt-1">Access past clinical summaries and RAG session prompts.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-[#666666] py-12 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
          Querying audit log entries...
        </div>
      ) : conversations.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#ECECEC] rounded-[12px] bg-[#F7F4EB]/10 text-xs text-[#666666]">
          No past conversations logged.
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className="p-4 border border-[#ECECEC] rounded-[12px] bg-white hover:border-[#111111] transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#F7F4EB] border border-[#ECECEC] rounded-[8px] text-[#111111]">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-[#111111]">{conv.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#666666]">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> Persona: {conv.role}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Updated: {conv.lastUpdated ? conv.lastUpdated.split('T')[0] : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openConversation(conv)}
                className="px-3.5 py-1.5 border border-[#111111] hover:bg-[#F7F4EB] text-xs font-semibold rounded-[8px] flex items-center gap-1 transition-colors"
              >
                <span>Reopen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
