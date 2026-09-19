import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { generateSummary } from '@/src/services/aiService';
import { INCIDENT_TYPE_META, type ChatMessage } from '@/src/types';

const SUGGESTED_QUESTIONS = [
  'What is the highest priority incident?',
  'Which resources are available nearby?',
  'Why was Incident #1042 marked critical?',
  'What teams are currently delayed?',
  "Summarize today's emergency situation.",
];

function generateResponse(question: string, incidents: any[], teams: any[], resources: any[]): string {
  const lower = question.toLowerCase();
  const active = incidents.filter((i: any) => i.status !== 'resolved');
  const critical = active.filter((i: any) => i.severity === 'critical');
  const topPriority = active.sort((a: any, b: any) => b.score - a.score)[0];
  const available = resources.filter((r: any) => r.status === 'available');
  const delayed = teams.filter((t: any) => t.status === 'en-route' && (t.eta ?? 0) > 7);

  if (lower.includes('highest priority') || lower.includes('top priority') || lower.includes('most critical')) {
    if (topPriority) {
      const meta = INCIDENT_TYPE_META[topPriority.type as keyof typeof INCIDENT_TYPE_META];
      return `The highest priority incident is #${topPriority.id}, a ${meta.label.toLowerCase()} at ${topPriority.location}.\n\nSeverity: ${topPriority.score}/100 (${topPriority.severity.toUpperCase()})\nConfidence: ${topPriority.confidence}%\nPeople affected: ${topPriority.peopleAffected}\nStatus: ${topPriority.status}\n\n${topPriority.assignedTeams.length} team(s) are currently responding.`;
    }
    return 'No active incidents at this time.';
  }

  if (lower.includes('resource') || lower.includes('available') || lower.includes('nearby')) {
    const fireTenders = available.filter((r: any) => r.type === 'fire-tender');
    const ambulances = available.filter((r: any) => r.type === 'ambulance');
    const rescueTeams = available.filter((r: any) => r.type === 'rescue-team');
    return `Currently available resources:\n\n🚒 Fire Tenders: ${fireTenders.length} (${fireTenders.map((r: any) => r.id).join(', ')})\n🚑 Ambulances: ${ambulances.length} (${ambulances.map((r: any) => r.id).join(', ')})\n👨‍🚒 Rescue Teams: ${rescueTeams.length}\n🛸 Drones: ${available.filter((r: any) => r.type === 'drone').length}\n🚤 Rescue Boats: ${available.filter((r: any) => r.type === 'rescue-boat').length}\n\nTotal: ${available.length} units ready for dispatch.`;
  }

  if (lower.includes('1042') || lower.includes('critical') || lower.includes('why')) {
    const inc = incidents.find((i: any) => i.id === '1042');
    if (inc) {
      return `Incident #1042 was marked CRITICAL for the following reasons:\n\n${inc.riskFactors.map((f: string) => `✓ ${f}`).join('\n')}\n\nAI Intensity Score: ${inc.score}/100\nAI Confidence: ${inc.confidence}%\n\nThe AI engine analyzed multiple signals including people affected, fire spread, industrial zone proximity, and duplicate report detection to determine this severity.`;
    }
    return 'Incident #1042 not found.';
  }

  if (lower.includes('delay') || lower.includes('delayed') || lower.includes('late')) {
    if (delayed.length > 0) {
      return `${delayed.length} response team(s) are currently delayed:\n\n${delayed.map((t: any) => `• ${t.name} — ETA ${t.eta} min (going to ${t.destination})`).join('\n')}\n\nAI Recommendation: Consider dispatching backup teams or reallocating resources.`;
    }
    return 'No teams are currently delayed. All responses are within expected timeframes.';
  }

  if (lower.includes('summar') || lower.includes('situation') || lower.includes('today')) {
    return generateSummary(incidents, teams, resources);
  }

  return `I can help with:\n• Highest priority incidents\n• Available resources\n• Incident severity explanations\n• Delayed teams\n• Situation summaries\n\nTry asking: "${SUGGESTED_QUESTIONS[Math.floor(Math.random() * SUGGESTED_QUESTIONS.length)]}"`;
}

export function AIAssistantPage() {
  const { incidents, teams, resources, chatHistory, addChatMessage } = useApp();
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [chatHistory, thinking]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    addChatMessage({ role: 'user', content: msg });
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const response = generateResponse(msg, incidents, teams, resources);
      addChatMessage({ role: 'assistant', content: response });
      setThinking(false);
    }, 800 + Math.random() * 700);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">AI Assistant</h2>
        <p className="text-sm text-secondary mt-0.5">Your emergency operations copilot — ask about incidents, resources, and response status</p>
      </div>

      <div className="rounded-xl border border-navy-border bg-navy-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-navy-border bg-navy-secondary/50 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-aipurple/20 text-aipurple">
            <Bot size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Res-Q AI</p>
            <p className="text-[11px] text-response flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-response animate-pulse" />
              Online — ready to assist
            </p>
          </div>
        </div>

        <div ref={scrollRef} className="max-h-[450px] min-h-[300px] overflow-y-auto p-4 space-y-3">
          {chatHistory.length === 0 && !thinking && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-aipurple/15 text-aipurple">
                <Sparkles size={28} />
              </div>
              <p className="text-sm font-semibold text-white mb-1">Ask Res-Q AI anything</p>
              <p className="text-xs text-secondary mb-4">Get instant operational insights</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="rounded-lg border border-navy-border bg-navy-secondary/60 px-3 py-1.5 text-xs text-secondary transition-colors hover:border-aipurple/40 hover:text-white"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {chatHistory.map((msg: ChatMessage) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-royal text-white rounded-br-sm'
                    : 'bg-navy-secondary text-white rounded-bl-sm border border-navy-border'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="mb-1 flex items-center gap-1">
                    <Bot size={12} className="text-aipurple" />
                    <span className="text-[10px] font-bold text-aipurple">RES-Q AI</span>
                  </div>
                )}
                <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm border border-navy-border bg-navy-secondary px-4 py-3">
                <div className="mb-1 flex items-center gap-1">
                  <Bot size={12} className="text-aipurple" />
                  <span className="text-[10px] font-bold text-aipurple">RES-Q AI</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="typing-dot h-2 w-2 rounded-full bg-aipurple" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-aipurple" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-aipurple" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-navy-border p-3">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about incidents, resources, response status..."
              className="flex-1 rounded-lg border border-navy-border bg-navy-secondary px-3 py-2.5 text-sm text-white placeholder:text-muted focus:border-aipurple focus:outline-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || thinking}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-aipurple text-white transition-all hover:bg-aipurple/80 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
