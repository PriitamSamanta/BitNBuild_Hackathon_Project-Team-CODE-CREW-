'use client';

import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { CitizenIncident } from '@/types/incident';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: CitizenIncident | null;
  onTrackIncident: (code: string) => void;
}

export function SuccessModal({
  isOpen,
  onClose,
  incident,
  onTrackIncident,
}: SuccessModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !incident) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(incident.trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#12141F] border border-white/[0.1] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-center">
        {/* Animated Check icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-9 h-9 text-emerald-400 animate-in zoom-in duration-300" />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Report Submitted Successfully!
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Your emergency report has been prioritized and routed to active dispatch units in
            Ahmedabad.
          </p>
        </div>

        {/* Incident Tracking Code Box */}
        <div className="bg-[#090A0F] border border-white/[0.08] rounded-xl p-4 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Your Emergency Tracking ID
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-xl font-mono font-bold text-red-400 tracking-wider">
              {incident.trackingCode}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Copy ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Save this code to check real-time ambulance & fire brigade arrival status.
          </p>
        </div>

        {/* AI Triage & Routing Pill */}
        <div className="bg-[#161928] border border-white/[0.06] rounded-xl p-3.5 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-white">Res-Q AI Immediate Assessment</p>
              <p className="text-[11px] text-slate-400 capitalize">
                Category: {incident.category} • Priority: {incident.severity}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
            Active
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onTrackIncident(incident.trackingCode);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-600/30 transition-all"
          >
            <span>Track Live Status Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
