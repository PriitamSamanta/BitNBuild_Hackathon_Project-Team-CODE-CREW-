import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { generateSummary } from '@/src/services/aiService';
import { INCIDENT_TYPE_META, type ChatMessage } from '@/src/types';

const QUICK_QUESTIONS = [
  'Highest priority incident?',
  'Available resources?',
  'Summarize situation',
];

function generateResponse(question: string, incidents: any[], teams: any[], resources: any[]): string {
  const lower = question.toLowerCase();
  const active = incidents.filter((i: any) => i.status !== 'resolved');
  const topPriority = active.sort((a: any, b: any) => b.score - a.score)[0];
  const available = resources.filter((r: any) => r.status === 'available');
  const delayed = teams.filter((t: any) => t.status === 'en-route' && (t.eta ?? 0) > 7);

  if (lower.includes('highest') || lower.includes('priority') || lower.includes('top')) {
    if (topPriority) {
      const meta = INCIDENT_TYPE_META[topPriority.type as keyof typeof INCIDENT_TYPE_META];
      return `Highest priority: #${topPriority.id}, ${meta.label} at ${topPriority.location}. Score: ${topPriority.score}/100. ${topPriority.assignedTeams.length} team(s) responding.`;
    }
    return 'No active incidents.';
  }

  if (lower.includes('resource') || lower.includes('available')) {
    return `${available.length} resources available: ${available.filter((r: any) => r.type === 'fire-tender').length} fire tenders, ${available.filter((r: any) => r.type === 'ambulance').length} ambulances, ${available.filter((r: any) => r.type === 'rescue-team').length} rescue teams.`;
  }

  if (lower.includes('summar') || lower.includes('situation')) {
    return generateSummary(incidents, teams, resources);
  }

  if (lower.includes('delay')) {
    return delayed.length > 0 ? `${delayed.length} team(s) delayed.` : 'No teams delayed.';
  }

  return 'Try asking about priority incidents, available resources, or the current situation.';
}

export function AIAssistantWidget() {
  const { incidents, teams, resources, chatHistory, addChatMessage } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [chatHistory, thinking, open]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    addChatMessage({ role: 'user', content: msg });
    setInput('');
    setThinking(true);
    setTimeout(() => {
      addChatMessage({ role: 'assistant', content: generateResponse(msg, incidents, teams, resources) });
      setThinking(false);
    }, 700 + Math.random() * 600);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-[80] flex items-center gap-2 rounded-full bg-aipurple px-4 py-3 text-sm font-bold text-white shadow-2xl shadow-aipurple/30 transition-all hover:bg-aipurple/80 hover:scale-105 active:scale-95"
        >
          <Bot size={20} />
          <span className="hidden sm:inline">Res-Q AI</span>
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
            <span className="absolute h-full w-full animate-ping rounded-full bg-response opacity-75" />
            <span className="h-3 w-3 rounded-full bg-response" />
          </span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-[80] flex h-[500px] max-h-[calc(100vh-2rem)] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-navy-border bg-navy-card shadow-2xl animate-slide-up">
          <div className="flex items-center gap-2 border-b border-navy-border bg-navy-secondary px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-aipurple/20 text-aipurple">
              <Bot size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Res-Q AI</p>
              <p className="text-[11px] text-response flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-response animate-pulse" />
                Online
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="text-secondary hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {chatHistory.length === 0 && !thinking && (
              <div className="flex flex-col items-center py-4 text-center">
                <Sparkles size={24} className="text-aipurple mb-2" />
                <p className="text-xs text-secondary mb-3">Ask about incidents, resources, or response status</p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="rounded-lg border border-navy-border bg-navy-secondary/60 px-2.5 py-1 text-[11px] text-secondary transition-colors hover:border-aipurple/40 hover:text-white"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatHistory.map((msg: ChatMessage) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${
                    msg.role === 'user'
                      ? 'bg-royal text-white rounded-br-sm'
                      : 'bg-navy-secondary text-white rounded-bl-sm border border-navy-border'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="mb-0.5 flex items-center gap-1">
                      <Bot size={10} className="text-aipurple" />
                      <span className="text-[9px] font-bold text-aipurple">RES-Q AI</span>
                    </div>
                  )}
                  <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border border-navy-border bg-navy-secondary px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-aipurple" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-aipurple" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-aipurple" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-navy-border p-2.5">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
                className="flex-1 rounded-lg border border-navy-border bg-navy-secondary px-3 py-2 text-xs text-white placeholder:text-muted focus:border-aipurple focus:outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || thinking}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-aipurple text-white transition-all hover:bg-aipurple/80 disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
