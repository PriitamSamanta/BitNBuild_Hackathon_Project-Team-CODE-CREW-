import { useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { IncidentCard } from '@/components/IncidentCard';
import { INCIDENT_TYPE_META, type Severity, type IncidentSource } from '@/types';

interface IncidentsProps {
  onOpenIncident: (id: string) => void;
}

export function Incidents({ onOpenIncident }: IncidentsProps) {
  const { incidents } = useApp();
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<IncidentSource | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = incidents.filter((i) => {
    if (severityFilter !== 'all' && i.severity !== severityFilter) return false;
    if (sourceFilter !== 'all' && i.source !== sourceFilter) return false;
    if (typeFilter !== 'all' && i.type !== typeFilter) return false;
    if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Incidents</h2>
        <p className="text-sm text-secondary mt-0.5">
          {filtered.length} incident{filtered.length !== 1 ? 's' : ''} — monitor and manage all emergency events
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incidents..."
            className="w-full rounded-lg border border-navy-border bg-navy-card py-2 pl-9 pr-3 text-sm text-white placeholder:text-muted focus:border-royal focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter size={14} className="text-muted shrink-0" />
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                severityFilter === s
                  ? 'bg-emergency text-white'
                  : 'bg-navy-card text-secondary hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Type:</span>
        <button
          onClick={() => setTypeFilter('all')}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
            typeFilter === 'all' ? 'bg-royal text-white' : 'bg-navy-card text-secondary hover:text-white'
          }`}
        >
          All
        </button>
        {(Object.keys(INCIDENT_TYPE_META) as (keyof typeof INCIDENT_TYPE_META)[]).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              typeFilter === t ? 'bg-royal text-white' : 'bg-navy-card text-secondary hover:text-white'
            }`}
          >
            {INCIDENT_TYPE_META[t].emoji} {INCIDENT_TYPE_META[t].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((inc) => (
          <IncidentCard key={inc.id} incident={inc} onClick={() => onOpenIncident(inc.id)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-navy-border bg-navy-card py-12 text-center">
          <p className="text-sm text-muted">No incidents match your filters</p>
        </div>
      )}
    </div>
  );
}
