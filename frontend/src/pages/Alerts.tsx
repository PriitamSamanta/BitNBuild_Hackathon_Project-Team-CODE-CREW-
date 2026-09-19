import { useState } from 'react';
import { Megaphone, Send, CheckCircle2, Radio } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';

const TARGETS = [
  { id: 'Fire Teams', emoji: '🚒' },
  { id: 'Police', emoji: '👮' },
  { id: 'Ambulances', emoji: '🚑' },
  { id: 'Hospitals', emoji: '🏥' },
  { id: 'Government', emoji: '🏛' },
];

export function Alerts() {
  const { alerts, sendAlert } = useApp();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTargets, setSelectedTargets] = useState<string[]>(['Fire Teams', 'Ambulances']);
  const [sent, setSent] = useState(false);

  const toggleTarget = (id: string) => {
    setSelectedTargets((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleSend = () => {
    if (!title.trim() || !message.trim() || selectedTargets.length === 0) return;
    sendAlert({ title, message, targets: selectedTargets });
    setTitle('');
    setMessage('');
    setSelectedTargets(['Fire Teams', 'Ambulances']);
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Alerts &amp; Broadcast</h2>
        <p className="text-sm text-secondary mt-0.5">Send emergency broadcasts to response teams and agencies</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-navy-border bg-navy-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emergency/15 text-emergency">
              <Megaphone size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Emergency Broadcast</h3>
              <p className="text-[11px] text-secondary">Compose and send alert</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-secondary">Alert Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Evacuation Alert"
                className="w-full rounded-lg border border-navy-border bg-navy-secondary px-3 py-2 text-sm text-white placeholder:text-muted focus:border-royal focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-secondary">Target Recipients</label>
              <div className="flex flex-wrap gap-2">
                {TARGETS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => toggleTarget(t.id)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      selectedTargets.includes(t.id)
                        ? 'border-royal/50 bg-royal/15 text-white'
                        : 'border-navy-border bg-navy-secondary text-secondary hover:text-white'
                    }`}
                  >
                    <span>{t.emoji}</span>
                    {t.id}
                    {selectedTargets.includes(t.id) && <CheckCircle2 size={12} className="text-royal" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-secondary">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Evacuation required in Sector B."
                rows={3}
                className="w-full resize-none rounded-lg border border-navy-border bg-navy-secondary px-3 py-2 text-sm text-white placeholder:text-muted focus:border-royal focus:outline-none"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!title.trim() || !message.trim() || selectedTargets.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emergency px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-emergency-critical disabled:opacity-50"
            >
              {sent ? (
                <>
                  <CheckCircle2 size={16} />
                  Alert Sent!
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Alert
                </>
              )}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-navy-border bg-navy-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-royal/15 text-royal">
              <Radio size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Sent Alerts</h3>
              <p className="text-[11px] text-secondary">{alerts.length} total broadcasts</p>
            </div>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {alerts.map((alert) => (
              <div key={alert.id} className="rounded-lg border border-navy-border bg-navy-secondary/40 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-bold text-white">{alert.title}</p>
                  <span className="rounded-md bg-response/15 px-2 py-0.5 text-[10px] font-bold text-response">
                    {alert.status}
                  </span>
                </div>
                <p className="text-xs text-secondary mb-2">{alert.message}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {alert.targets.map((t) => (
                    <span key={t} className="rounded bg-navy-card px-1.5 py-0.5 text-[10px] text-secondary">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-royal">
                    <CheckCircle2 size={12} />
                    {alert.notified} notified
                  </span>
                  <span className="flex items-center gap-1 text-response">
                    <CheckCircle2 size={12} />
                    {alert.acknowledged} acknowledged
                  </span>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="text-sm text-muted text-center py-4">No alerts sent yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
