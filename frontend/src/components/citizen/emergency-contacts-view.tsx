'use client';

import React from 'react';
import { PhoneCall, ShieldAlert } from 'lucide-react';
import { EMERGENCY_CONTACTS } from '@/lib/citizenApi';

interface EmergencyContactsViewProps {
  onCallInitiate: (number: string) => void;
}

export function EmergencyContactsView({ onCallInitiate }: EmergencyContactsViewProps) {
  return (
    <div className="bg-[#12141F] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Official Emergency Helplines</h2>
          <p className="text-xs text-slate-400">
            Direct priority access numbers for state and national first responders
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {EMERGENCY_CONTACTS.map((contact) => (
          <div
            key={contact.id}
            className="bg-[#090A0F] border border-white/[0.06] hover:border-white/[0.15] rounded-xl p-4 flex flex-col justify-between gap-3 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white">{contact.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{contact.description}</p>
              </div>
              <span className="text-lg font-mono font-black text-red-400">
                {contact.number}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
              <span className="text-[11px] text-slate-400 font-medium">
                {contact.availableHours}
              </span>
              <button
                type="button"
                onClick={() => onCallInitiate(contact.number)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
