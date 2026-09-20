'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { INCIDENT_TYPE_META, SEVERITY_META, STATUS_META } from '@/types';
import type { UserPageId } from '@/components/user/UserHeader';

const LiveMap = dynamic(
  () => import('@/components/LiveMap').then((mod) => mod.LiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] items-center justify-center rounded-2xl border border-navy-border bg-navy-card text-secondary">
        Loading emergency map...
      </div>
    ),
  }
);

interface UserMapProps {
  onNavigate: (page: UserPageId) => void;
  onOpenReport?: (id: string) => void;
}

export function UserMap({ onNavigate, onOpenReport }: UserMapProps) {
  const { incidents } = useApp();
  const [showTeams, setShowTeams] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);

  const activeIncidents = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed');

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Emergency Map</h2>
          <p className="text-sm text-secondary mt-0.5">
            Active regional emergency incidents, dispatched units, and healthcare facilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTeams((s) => !s)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors border ${
              showTeams
                ? 'border-royal bg-royal/20 text-white'
                : 'border-navy-border bg-navy-card text-secondary'
            }`}
          >
            <span>🚒</span> Response Teams
          </button>
          <button
            onClick={() => setShowHospitals((s) => !s)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors border ${
              showHospitals
                ? 'border-response bg-response/20 text-white'
                : 'border-navy-border bg-navy-card text-secondary'
            }`}
          >
            <span>🏥</span> Hospitals
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="rounded-2xl border border-navy-border overflow-hidden shadow-xl bg-navy-card">
        <LiveMap
          height="520px"
          showTeams={showTeams}
          showHospitals={showHospitals}
          onIncidentClick={(id) => {
            if (onOpenReport) {
              onOpenReport(id);
            } else {
              onNavigate('tracking');
            }
          }}
        />
      </div>

      {/* Quick Incident Cards Below Map */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 px-1">
          Active Local Incidents ({activeIncidents.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {activeIncidents.slice(0, 4).map((inc) => {
            const typeMeta = INCIDENT_TYPE_META[inc.type];
            const sevMeta = SEVERITY_META[inc.severity];
            const statMeta = STATUS_META[inc.status];

            return (
              <div
                key={inc.id}
                onClick={() => onNavigate('tracking')}
                className="rounded-xl border border-navy-border bg-navy-card p-3.5 space-y-2 cursor-pointer hover:border-royal/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{typeMeta?.emoji}</span>
                  <span
                    className="rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase"
                    style={{ color: sevMeta?.color, backgroundColor: sevMeta?.bgColor }}
                  >
                    {inc.severity}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white truncate">{inc.title}</h4>
                  <p className="text-[11px] text-secondary flex items-center gap-1 mt-0.5 truncate">
                    <MapPin size={11} className="text-muted shrink-0" />
                    <span>{inc.location}</span>
                  </p>
                </div>

                <div className="pt-1.5 border-t border-navy-border/50 flex items-center justify-between text-[10px]">
                  <span style={{ color: statMeta?.color }} className="font-bold capitalize">
                    {statMeta?.label || inc.status}
                  </span>
                  <span className="text-muted font-mono">{inc.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
