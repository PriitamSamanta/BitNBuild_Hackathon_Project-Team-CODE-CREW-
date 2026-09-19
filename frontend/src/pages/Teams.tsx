import { useState } from 'react';
import { Phone, MapPin, Navigation } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { Modal } from '@/src/components/Modal';
import { INCIDENT_TYPE_META, TEAM_STATUS_META, type Team, type TeamStatus } from '@/src/types';

interface TeamsProps {
  onOpenIncident: (id: string) => void;
}

export function Teams({ onOpenIncident }: TeamsProps) {
  const { teams, incidents, dispatchTeam, updateTeamStatus } = useApp();
  const [filter, setFilter] = useState<TeamStatus | 'all'>('all');
  const [contactTeam, setContactTeam] = useState<Team | null>(null);

  const filtered = filter === 'all' ? teams : teams.filter((t) => t.status === filter);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Response Teams</h2>
        <p className="text-sm text-secondary mt-0.5">{teams.length} teams — dispatch, monitor, and coordinate</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto">
        {(['all', 'available', 'en-route', 'on-scene', 'busy', 'offline'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === s ? 'bg-royal text-white' : 'bg-navy-card text-secondary hover:text-white'
            }`}
          >
            {s.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((team) => {
          const meta = TEAM_STATUS_META[team.status];
          const typeMeta = INCIDENT_TYPE_META[team.type];
          const incident = team.assignedIncident ? incidents.find((i) => i.id === team.assignedIncident) : null;

          return (
            <div key={team.id} className="rounded-xl border border-navy-border bg-navy-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: `${typeMeta.color}20` }}>
                    {typeMeta.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{team.id}</p>
                    <p className="text-[11px] text-secondary">{typeMeta.label} Response</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: meta.color }}>
                  {meta.dot} {meta.label}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-secondary">
                  <MapPin size={12} className="shrink-0" />
                  <span>{team.destination || 'At base'}</span>
                </div>
                {team.assignedIncident && (
                  <button
                    onClick={() => onOpenIncident(team.assignedIncident!)}
                    className="flex items-center gap-2 text-royal hover:underline"
                  >
                    <Navigation size={12} />
                    Incident #{team.assignedIncident}
                  </button>
                )}
                <div className="flex items-center gap-2 text-secondary">
                  <span className="text-base">🚗</span>
                  <span>{team.vehicle}</span>
                </div>
                {team.eta ? (
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <span>⏱</span>
                    ETA: {team.eta} min
                  </div>
                ) : null}
              </div>

              <div className="mt-3 flex gap-1.5">
                {team.status === 'available' && team.assignedIncident === undefined && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) dispatchTeam(team.id, e.target.value);
                    }}
                    defaultValue=""
                    className="flex-1 rounded-lg border border-navy-border bg-navy-secondary px-2 py-1.5 text-xs text-white focus:border-royal focus:outline-none"
                  >
                    <option value="">Assign to incident...</option>
                    {incidents.filter((i) => i.status !== 'resolved').map((i) => (
                      <option key={i.id} value={i.id}>#{i.id} — {i.title}</option>
                    ))}
                  </select>
                )}
                <select
                  onChange={(e) => updateTeamStatus(team.id, e.target.value as TeamStatus)}
                  value={team.status}
                  className="flex-1 rounded-lg border border-navy-border bg-navy-secondary px-2 py-1.5 text-xs text-white focus:border-royal focus:outline-none"
                >
                  <option value="available">Available</option>
                  <option value="en-route">En Route</option>
                  <option value="on-scene">On Scene</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
                <button
                  onClick={() => setContactTeam(team)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-secondary text-secondary hover:text-white"
                >
                  <Phone size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={!!contactTeam}
        onClose={() => setContactTeam(null)}
        title={`Contact ${contactTeam?.id || ''}`}
        subtitle={contactTeam?.name}
        icon={<Phone size={18} />}
      >
        {contactTeam && (
          <div className="space-y-3">
            <div className="rounded-lg bg-navy-secondary/60 p-3">
              <p className="text-xs text-secondary">Vehicle</p>
              <p className="text-sm text-white">{contactTeam.vehicle}</p>
            </div>
            <div className="rounded-lg bg-navy-secondary/60 p-3">
              <p className="text-xs text-secondary">Current Location</p>
              <p className="text-sm text-white">{contactTeam.destination || 'At base'}</p>
            </div>
            <div className="rounded-lg bg-navy-secondary/60 p-3">
              <p className="text-xs text-secondary">Status</p>
              <p className="text-sm" style={{ color: TEAM_STATUS_META[contactTeam.status].color }}>
                {TEAM_STATUS_META[contactTeam.status].label}
              </p>
            </div>
            <button
              onClick={() => setContactTeam(null)}
              className="w-full rounded-lg bg-royal px-3 py-2 text-sm font-bold text-white hover:bg-royal/80"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
