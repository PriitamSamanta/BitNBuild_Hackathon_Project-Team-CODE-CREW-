import { PhoneCall } from 'lucide-react';
import type { EmergencyContact } from '@/types';

const CONTACTS: EmergencyContact[] = [
  {
    id: '112',
    title: 'National Unified Emergency Helpline',
    number: '112',
    description: 'Single unified national emergency service for Police, Fire, and Ambulance response.',
    badgeColor: 'border-emergency/40 bg-emergency/15 text-emergency',
    availableHours: '24/7 Available • Toll-Free',
  },
  {
    id: '108',
    title: 'EMRI Emergency Medical Ambulance',
    number: '108',
    description: 'Immediate trauma care, advanced life support (ALS), and critical medical ambulance dispatch.',
    badgeColor: 'border-royal/40 bg-royal/15 text-royal',
    availableHours: '24/7 Available • Average ETA 10 mins',
  },
  {
    id: '101',
    title: 'Fire & Rescue Brigade',
    number: '101',
    description: 'Municipal fire suppression, hazardous material leaks, and high-rise structural rescue operations.',
    badgeColor: 'border-amber-500/40 bg-amber-500/15 text-amber-400',
    availableHours: '24/7 Available • Heavy Response Units',
  },
  {
    id: '100',
    title: 'Police Control Room',
    number: '100',
    description: 'Crime prevention, immediate law enforcement response, PCR vans, and highway patrolling.',
    badgeColor: 'border-blue-500/40 bg-blue-500/15 text-blue-400',
    availableHours: '24/7 Available • Local Precinct Dispatch',
  },
  {
    id: '1070',
    title: 'State Disaster Management (SEOC / NDRF)',
    number: '1070',
    description: 'Disaster response coordination for floods, cyclones, industrial accidents, and earthquakes.',
    badgeColor: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400',
    availableHours: '24/7 Available • District Emergency Cell',
  },
  {
    id: '1091',
    title: 'Women Helpline Desk',
    number: '1091',
    description: 'Specialized 24/7 immediate assistance, distress response, and safety escorts for women.',
    badgeColor: 'border-purple-500/40 bg-purple-500/15 text-purple-400',
    availableHours: '24/7 Available • Confidential & Safe',
  },
];

export function EmergencyContacts() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Emergency Helplines &amp; Contacts</h2>
        <p className="text-sm text-secondary mt-0.5">
          Direct toll-free access to national and municipal rapid response units.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CONTACTS.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-navy-border bg-navy-card p-5 space-y-4 shadow-lg hover:border-white/20 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <span className={`rounded-xl border px-3 py-1 font-mono text-xl font-extrabold ${c.badgeColor}`}>
                  {c.number}
                </span>
                <span className="text-[10px] text-muted uppercase font-semibold">
                  {c.availableHours}
                </span>
              </div>

              <h3 className="text-base font-bold text-white pt-1">{c.title}</h3>
              <p className="text-xs text-secondary leading-relaxed">{c.description}</p>
            </div>

            <div className="pt-2 border-t border-navy-border/60">
              <a
                href={`tel:${c.number}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-navy-secondary hover:bg-royal hover:text-white text-royal border border-navy-border py-2.5 text-xs font-bold transition-all"
              >
                <PhoneCall size={14} />
                <span>Dial {c.number} Immediately</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
