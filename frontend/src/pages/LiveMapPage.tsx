import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { LiveMap } from '@/components/LiveMap';
import { IncidentCard } from '@/components/IncidentCard';

interface LiveMapPageProps {
  onOpenIncident: (id: string) => void;
}

export function LiveMapPage({ onOpenIncident }: LiveMapPageProps) {
  const { incidents } = useApp();
  const [showTeams, setShowTeams] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const active = incidents.filter((i) => i.status !== 'resolved');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-white">Live Emergency Map</h2>
          <p className="text-sm text-secondary mt-0.5">Real-time incident, team, and hospital tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTeams((s) => !s)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              showTeams ? 'bg-royal/20 text-royal' : 'bg-navy-card text-secondary'
            }`}
          >
            <span>🚒</span> Teams
          </button>
          <button
            onClick={() => setShowHospitals((s) => !s)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              showHospitals ? 'bg-response/20 text-response' : 'bg-navy-card text-secondary'
            }`}
          >
            <span>🏥</span> Hospitals
          </button>
        </div>
      </div>

      <LiveMap
        onIncidentClick={onOpenIncident}
        height="calc(100vh - 240px)"
        showTeams={showTeams}
        showHospitals={showHospitals}
      />

      <div>
        <h3 className="mb-2 text-sm font-bold text-white">Active Incidents on Map</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {active.map((inc) => (
            <IncidentCard key={inc.id} incident={inc} onClick={() => onOpenIncident(inc.id)} compact />
          ))}
        </div>
      </div>
    </div>
  );
}
