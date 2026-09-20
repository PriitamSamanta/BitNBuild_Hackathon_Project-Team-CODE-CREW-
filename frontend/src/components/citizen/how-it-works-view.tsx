'use client';

import React from 'react';
import { Sparkles, Radio, CheckCircle, Shield, ArrowRight } from 'lucide-react';

export function HowItWorksView({ onStartReporting }: { onStartReporting: () => void }) {
  const steps = [
    {
      step: '01',
      title: 'Multimodal Intake',
      desc: 'Snap a photo, record a 15-second voice memo, or upload an image. Res-Q captures your GPS coordinates automatically.',
      icon: Radio,
    },
    {
      step: '02',
      title: 'Res-Q AI Computer Vision & Triage',
      desc: 'Our neural models verify the hazard category (Fire, Collision, Medical), evaluate threat level, and extract hazard keywords.',
      icon: Sparkles,
    },
    {
      step: '03',
      title: 'Emergency Command Dispatch',
      desc: 'Incidents instantly appear on the Central Operations Center map. The nearest available fire engine or ambulance is dispatched.',
      icon: Shield,
    },
    {
      step: '04',
      title: 'Real-Time Citizen Tracking',
      desc: 'You receive an anonymous tracking code to view live vehicle ETA, arriving unit callsign, and scene resolution status.',
      icon: CheckCircle,
    },
  ];

  return (
    <div className="bg-[#12141F] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white tracking-tight">How Res-Q Works</h2>
        <p className="text-xs text-slate-400">
          The end-to-end pipeline from citizen observation to tactical scene response
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.step}
              className="bg-[#090A0F] border border-white/[0.06] rounded-xl p-5 space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-red-400" />
                </div>
                <span className="text-xl font-mono font-bold text-slate-600">{st.step}</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{st.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{st.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onStartReporting}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/20 transition-all"
        >
          <span>Report an Incident Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
