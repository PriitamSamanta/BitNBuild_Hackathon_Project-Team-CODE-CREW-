'use client';

import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, PhoneCall } from 'lucide-react';
import { SAFETY_TIPS } from '@/lib/citizenApi';

interface SafetyTipsPanelProps {
  onOpenEmergencyCall?: () => void;
}

export function SafetyTipsPanel({ onOpenEmergencyCall }: SafetyTipsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>('fire-safety');

  const toggleTip = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-[#12141F] border border-white/[0.08] rounded-2xl p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-1">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-base tracking-tight">Safety Tips</h3>
          <p className="text-[11px] text-slate-400">
            Immediate emergency survival & protocol actions
          </p>
        </div>
      </div>

      {/* Accordion / List */}
      <div className="space-y-2">
        {SAFETY_TIPS.map((tip) => {
          const isExpanded = expandedId === tip.id;
          return (
            <div
              key={tip.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                isExpanded
                  ? 'bg-[#090A0F] border-red-500/30 shadow-md'
                  : 'bg-[#090A0F]/60 border-white/[0.06] hover:border-white/[0.15]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleTip(tip.id)}
                className="w-full flex items-center justify-between p-3.5 text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg leading-none">{tip.icon}</span>
                  <span
                    className={`text-xs font-semibold transition-colors ${
                      isExpanded ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}
                  >
                    {tip.title}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-red-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-white/[0.04] space-y-3">
                  <p className="text-[11px] text-slate-400 leading-relaxed">{tip.description}</p>
                  <ul className="space-y-1.5 pl-1">
                    {tip.actionItems.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-300 flex items-start gap-2 leading-tight"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {tip.emergencyNumber && (
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Hotline: {tip.emergencyNumber}
                      </span>
                      <a
                        href={`tel:${tip.emergencyNumber}`}
                        onClick={(e) => {
                          if (onOpenEmergencyCall) {
                            e.preventDefault();
                            onOpenEmergencyCall();
                          }
                        }}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-lg border border-red-500/20 transition-all"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Call {tip.emergencyNumber}</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
