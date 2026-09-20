'use client';

import React from 'react';
import { HelpCircle, AlertTriangle } from 'lucide-react';

export function HelpSupportView() {
  return (
    <div className="bg-[#12141F] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Citizen Help & Support</h2>
          <p className="text-xs text-slate-400">
            Frequently asked questions, data privacy, and technical support
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-[#090A0F] border border-white/[0.06] rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-bold text-white">Is my report completely anonymous?</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Yes. Res-Q does not require you to create an account or provide personal identity details to report emergencies. Only incident location and hazard imagery are transmitted to responders.
          </p>
        </div>

        <div className="bg-[#090A0F] border border-white/[0.06] rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-bold text-white">What should I do if my situation is life-threatening?</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Always tap the red <strong className="text-red-400">Emergency 112</strong> button at the top-right to initiate immediate voice communication with dispatchers while you submit your visual report.
          </p>
        </div>

        <div className="bg-[#090A0F] border border-white/[0.06] rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-bold text-white">How do I verify if help is on the way?</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Use the <strong className="text-white">Track My Report</strong> tab and enter your tracking code (e.g. <code>RESQ-2026-8491</code>). You will see the responding fire brigade or ambulance callsign with estimated arrival time.
          </p>
        </div>
      </div>

      <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl flex items-center gap-3 text-xs text-red-200">
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
        <span>Filing false emergency reports is punishable under Disaster Management Law.</span>
      </div>
    </div>
  );
}
