'use client';
import { Siren, AlertTriangle, Users, Clock, Zap, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { KPICard } from '@/components/KPICard';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(
  () => import('@/components/LiveMap').then((mod) => mod.LiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-xl border border-navy-border bg-navy-card text-secondary">
        Loading emergency map...
      </div>
    ),
  }
);
import { IncidentCard } from '@/components/IncidentCard';
import { AIIntensityEngine } from '@/components/AIIntensityEngine';
import type { PageId } from '@/components/Sidebar';

interface DashboardProps {
  onNavigate: (page: PageId) => void;
  onOpenIncident: (id: string) => void;
}

export function Dashboard({ onNavigate, onOpenIncident }: DashboardProps) {
  const { incidents, teams } = useApp();

  const active = incidents.filter((i) => i.status !== 'resolved');
  const critical = active.filter((i) => i.severity === 'critical');
  const activeTeams = teams.filter((t) => t.status === 'en-route' || t.status === 'on-scene');
  const avgResponse = '08:42';

  const topPriority = active.sort((a, b) => b.score - a.score)[0];
  const recentActive = active.slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard
          label="Active Incidents"
          value={active.length}
          icon={<Siren size={18} />}
          color="#E63946"
          trend={{ value: '+3 today', direction: 'up' }}
          alert={critical.length > 0}
        />
        <KPICard
          label="Critical"
          value={critical.length}
          icon={<AlertTriangle size={18} />}
          color="#EF233C"
          trend={{ value: 'Needs attention', direction: 'down' }}
          alert
        />
        <KPICard
          label="Teams Active"
          value={activeTeams.length}
          icon={<Users size={18} />}
          color="#1565D8"
          trend={{ value: '2 available', direction: 'neutral' }}
        />
        <KPICard
          label="Avg Response"
          value={avgResponse}
          icon={<Clock size={18} />}
          color="#10B981"
          trend={{ value: '-1:20 vs avg', direction: 'up' }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Live Emergency Map</h3>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-lg bg-response/10 px-2.5 py-1">
                <span className="h-2 w-2 rounded-full bg-response animate-pulse" />
                <span className="text-xs font-bold text-response">LIVE</span>
              </span>
              <button
                onClick={() => onNavigate('map')}
                className="flex items-center gap-1 rounded-lg border border-navy-border bg-navy-card px-2.5 py-1 text-xs text-secondary transition-colors hover:text-white"
              >
                Full Map <ArrowRight size={12} />
              </button>
            </div>
          </div>
          <LiveMap
            onIncidentClick={onOpenIncident}
            height="420px"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Active Incidents</h3>
            <button
              onClick={() => onNavigate('incidents')}
              className="flex items-center gap-1 text-xs text-royal hover:text-royal/80"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {recentActive.map((inc) => (
              <IncidentCard key={inc.id} incident={inc} onClick={() => onOpenIncident(inc.id)} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {topPriority && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Zap size={16} className="text-aipurple" />
              <h3 className="text-sm font-bold text-white">AI Alert — Top Priority</h3>
            </div>
            <AIIntensityEngine incident={topPriority} />
          </div>
        )}

        <div className="rounded-xl border border-navy-border bg-navy-card p-4">
          <h3 className="mb-3 text-sm font-bold text-white">Response Status</h3>
          <div className="space-y-2">
            {activeTeams.slice(0, 5).map((team) => (
              <div
                key={team.id}
                className="flex items-center gap-3 rounded-lg border border-navy-border bg-navy-secondary/40 p-2.5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-card text-sm">
                  {team.type === 'fire' ? '🚒' : team.type === 'medical' ? '🚑' : team.type === 'chemical' ? '☣' : '🚗'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{team.name}</p>
                  <p className="text-[11px] text-secondary truncate">
                    {team.destination ? `→ ${team.destination}` : 'Available'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {team.eta ? (
                    <p className="text-xs font-bold text-white">{team.eta} min</p>
                  ) : (
                    <p className="text-xs font-bold text-response">Ready</p>
                  )}
                  <p className="text-[10px] text-secondary capitalize">{team.status.replace('-', ' ')}</p>
                </div>
              </div>
            ))}
            {activeTeams.length === 0 && (
              <p className="text-sm text-muted text-center py-4">No active teams</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
