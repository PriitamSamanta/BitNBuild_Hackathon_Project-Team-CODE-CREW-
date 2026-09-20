import { useState } from 'react';
import { Truck, Ambulance, HardHat, Plane, Ship, BriefcaseMedical, Flame, GitBranch, AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/Modal';
import { RESOURCE_TYPE_META, type Resource, type ResourceType } from '@/types';

const ICON_MAP: Record<string, typeof Truck> = {
  'fire-tender': Flame,
  ambulance: Ambulance,
  'rescue-team': HardHat,
  drone: Plane,
  'rescue-boat': Ship,
  'medical-kit': BriefcaseMedical,
  'fire-equipment': Flame,
};

export function Resources() {
  const { resources, incidents, reallocateResource } = useApp();
  const [filter, setFilter] = useState<ResourceType | 'all'>('all');
  const [conflictModal, setConflictModal] = useState(false);

  const filtered = filter === 'all' ? resources : resources.filter((r) => r.type === filter);

  const stats = (type: ResourceType) => {
    const items = resources.filter((r) => r.type === type);
    return {
      total: items.length,
      available: items.filter((r) => r.status === 'available').length,
      dispatched: items.filter((r) => r.status === 'dispatched').length,
      busy: items.filter((r) => r.status === 'busy').length,
      offline: items.filter((r) => r.status === 'offline').length,
    };
  };

  const resourceTypes: ResourceType[] = ['fire-tender', 'ambulance', 'rescue-team', 'drone', 'rescue-boat', 'medical-kit', 'fire-equipment'];

  const conflictResource = resources.find((r) => r.id === 'FT-08');
  const conflictIncident = incidents.find((i) => i.id === '1042');

  const handleReallocate = () => {
    if (conflictResource && conflictIncident) {
      reallocateResource('FT-08', conflictResource.assignedIncident || '1021', conflictIncident.id);
      setConflictModal(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Resource Management</h2>
        <p className="text-sm text-secondary mt-0.5">Monitor and coordinate all emergency resources</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {resourceTypes.map((type) => {
          const s = stats(type);
          const meta = RESOURCE_TYPE_META[type];
          const Icon = ICON_MAP[type] || Truck;
          return (
            <div key={type} className="rounded-xl border border-navy-border bg-navy-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-secondary text-lg">
                  {meta.emoji}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{meta.label}s</p>
                  <p className="text-[10px] text-muted">{s.total} total units</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-response/10 px-2 py-1.5">
                  <p className="text-[10px] text-muted">Available</p>
                  <p className="font-bold text-response">{s.available}</p>
                </div>
                <div className="rounded-lg bg-royal/10 px-2 py-1.5">
                  <p className="text-[10px] text-muted">Dispatched</p>
                  <p className="font-bold text-royal">{s.dispatched}</p>
                </div>
                <div className="rounded-lg bg-warning/10 px-2 py-1.5">
                  <p className="text-[10px] text-muted">Busy</p>
                  <p className="font-bold text-warning">{s.busy}</p>
                </div>
                <div className="rounded-lg bg-navy-secondary px-2 py-1.5">
                  <p className="text-[10px] text-muted">Offline</p>
                  <p className="font-bold text-muted">{s.offline}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} className="text-warning" />
          <h3 className="text-sm font-bold text-warning">Resource Conflict Detected</h3>
        </div>
        <p className="text-xs text-secondary mb-3">
          Fire Tender 08 is assigned to Incident #1021, but new Incident #1042 has higher priority. AI recommends reallocation.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="rounded-lg bg-navy-card p-2.5">
            <p className="text-[10px] text-muted">Incident #1021</p>
            <p className="text-xs text-warning">+4 min response</p>
          </div>
          <div className="rounded-lg bg-navy-card p-2.5">
            <p className="text-[10px] text-muted">Incident #1042</p>
            <p className="text-xs text-response">-11 min response</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReallocate}
            className="flex-1 rounded-lg bg-emergency px-3 py-2 text-xs font-bold text-white transition-all hover:bg-emergency-critical"
          >
            Approve Reallocation
          </button>
          <button
            onClick={() => setConflictModal(false)}
            className="rounded-lg border border-navy-border bg-navy-card px-3 py-2 text-xs font-medium text-secondary hover:text-white"
          >
            Reject
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            filter === 'all' ? 'bg-royal text-white' : 'bg-navy-card text-secondary hover:text-white'
          }`}
        >
          All Resources
        </button>
        {resourceTypes.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === t ? 'bg-royal text-white' : 'bg-navy-card text-secondary hover:text-white'
            }`}
          >
            {RESOURCE_TYPE_META[t].emoji} {RESOURCE_TYPE_META[t].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((r) => {
          const meta = RESOURCE_TYPE_META[r.type];
          const incident = r.assignedIncident ? incidents.find((i) => i.id === r.assignedIncident) : null;
          const statusColor = r.status === 'available' ? '#10B981' : r.status === 'dispatched' ? '#1565D8' : r.status === 'busy' ? '#F59E0B' : '#64748B';
          return (
            <div key={r.id} className="rounded-xl border border-navy-border bg-navy-card p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{meta.emoji}</span>
                  <span className="text-sm font-bold text-white">{r.id}</span>
                </div>
                <span className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase" style={{ color: statusColor, backgroundColor: `${statusColor}20` }}>
                  {r.status}
                </span>
              </div>
              <p className="text-xs text-secondary mb-1">{meta.label}</p>
              <p className="text-xs text-muted">📍 {r.location}</p>
              {incident && (
                <p className="text-xs text-royal mt-1">→ Incident #{incident.id}</p>
              )}
              {r.eta ? (
                <p className="text-xs text-white mt-1">ETA: {r.eta} min</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { GitBranch };
