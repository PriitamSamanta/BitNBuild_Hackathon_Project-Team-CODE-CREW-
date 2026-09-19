import type { Incident } from '@/src/types';
import { SEVERITY_META } from '@/src/types';
import { Brain, CheckCircle2 } from 'lucide-react';

export function AIIntensityEngine({ incident }: { incident: Incident }) {
  const meta = SEVERITY_META[incident.severity];
  const pct = incident.score;

  return (
    <div className="rounded-xl border border-navy-border bg-navy-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-aipurple/20 text-aipurple">
          <Brain size={15} />
        </div>
        <h4 className="text-sm font-bold text-white">AI Intensity Engine</h4>
      </div>

      <div className="flex items-end gap-2 mb-2">
        <span className="text-3xl font-extrabold" style={{ color: meta.color }}>
          {incident.score}
        </span>
        <span className="text-sm text-secondary mb-1">/ 100</span>
        <span
          className="ml-auto rounded-md px-2 py-0.5 text-xs font-bold uppercase"
          style={{ color: meta.color, backgroundColor: meta.bgColor, border: `1px solid ${meta.borderColor}` }}
        >
          {meta.label}
        </span>
      </div>

      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-navy-secondary">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${meta.color}80, ${meta.color})`,
          }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[9px] text-muted">
        <span>LOW</span>
        <span>MEDIUM</span>
        <span>HIGH</span>
        <span>CRITICAL</span>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg bg-navy-secondary/60 px-3 py-2">
        <span className="text-xs text-secondary">AI Confidence</span>
        <span className="text-sm font-bold text-aipurple">{incident.confidence}%</span>
      </div>

      <div className="mt-3">
        <p className="text-xs font-semibold text-secondary mb-2">Why?</p>
        <div className="space-y-1.5">
          {incident.riskFactors.map((factor, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 size={13} className="text-response shrink-0 mt-0.5" />
              <span className="text-xs text-white/90">{factor}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
