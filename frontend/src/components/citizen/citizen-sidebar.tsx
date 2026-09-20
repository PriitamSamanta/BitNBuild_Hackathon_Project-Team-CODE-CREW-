'use client';

import React from 'react';
import {
  FileText,
  Compass,
  ShieldCheck,
  PhoneCall,
  Info,
  HelpCircle,
} from 'lucide-react';

interface CitizenSidebarProps {
  currentSection: string;
  onSelectSection: (section: string) => void;
  className?: string;
}

export function CitizenSidebar({
  currentSection,
  onSelectSection,
  className = '',
}: CitizenSidebarProps) {
  const navSections = [
    {
      group: 'REPORT',
      items: [
        {
          id: 'report',
          label: 'Report Incident',
          icon: FileText,
          activeGlow: true,
        },
      ],
    },
    {
      group: 'TRACKING',
      items: [
        {
          id: 'track',
          label: 'Track My Report',
          icon: Compass,
        },
      ],
    },
    {
      group: 'SAFETY',
      items: [
        {
          id: 'safety',
          label: 'Safety Tips',
          icon: ShieldCheck,
        },
      ],
    },
    {
      group: 'EMERGENCY',
      items: [
        {
          id: 'contacts',
          label: 'Emergency Contacts',
          icon: PhoneCall,
        },
      ],
    },
    {
      group: 'INFORMATION',
      items: [
        {
          id: 'how-it-works',
          label: 'How It Works',
          icon: Info,
        },
      ],
    },
    {
      group: 'SUPPORT',
      items: [
        {
          id: 'support',
          label: 'Help & Support',
          icon: HelpCircle,
        },
      ],
    },
  ];

  return (
    <aside
      className={`w-64 shrink-0 flex flex-col justify-between border-r border-white/[0.08] bg-[#090A0F] py-6 px-4 select-none ${className}`}
    >
      {/* Navigation Sections */}
      <div className="space-y-6">
        {navSections.map((sec) => (
          <div key={sec.group} className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider px-3">
              {sec.group}
            </span>
            <div className="space-y-1 pt-1">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left group ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600/15 via-red-500/10 to-transparent border border-red-500/40 text-white shadow-sm shadow-red-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-red-400'
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Card Widget: "Together for a Safer Tomorrow" matching Image 1 */}
      <div className="pt-6">
        <div className="rounded-2xl bg-gradient-to-b from-[#12141F] to-[#161928] border border-white/[0.08] p-4 relative overflow-hidden shadow-inner">
          <div className="space-y-1">
            <p className="text-xs text-slate-400">Together for a</p>
            <p className="text-sm font-bold text-white tracking-tight">Safer Tomorrow</p>
          </div>
          {/* Cyan to Emerald gradient progress bar */}
          <div className="mt-3.5 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </aside>
  );
}
