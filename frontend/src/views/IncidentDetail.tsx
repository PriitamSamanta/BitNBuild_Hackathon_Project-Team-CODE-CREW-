'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Users,
  Clock,
  Zap,
  Send,
  AlertTriangle,
  CheckCircle2,
  Link2,
  Truck,
  Stethoscope,
  HardHat,
  Shield,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AIIntensityEngine } from '@/components/AIIntensityEngine';
import { ActionPlanModal } from '@/components/ActionPlanModal';
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
import { SeverityBadge } from '@/components/SeverityBadge';
import {
  INCIDENT_TYPE_META,
  STATUS_META,
  SOURCE_META,
  RESOURCE_TYPE_META,
  type Incident,
} from '@/types';
import { generateActionPlan, detectEscalation } from '@/services/aiService';

interface IncidentDetailProps {
  incident: Incident;
  onBack: () => void;
  onOpenIncident: (id: string) => void;
}

export function IncidentDetail({ incident, onBack, onOpenIncident }: IncidentDetailProps) {
  const { resolveIncident, dispatchTeam, teams, updateIncident, addNotification } = useApp();
  const [planOpen, setPlanOpen] = useState(false);
  const [escalated, setEscalated] = useState(false);

  const typeMeta = INCIDENT_TYPE_META[incident.type];
  const statusMeta = STATUS_META[incident.status];
  const sourceMeta = SOURCE_META[incident.source];
  const plan = generateActionPlan(incident);
  const escalation = detectEscalation(incident);
  const availableTeams = teams.filter((t) => t.status === 'available' && t.type === incident.type);

  const handleResolve = () => {
    resolveIncident(incident.id);
    addNotification({
      type: 'success',
      title: 'Incident Resolved',
      message: `${incident.title} at ${incident.location} has been resolved`,
      incidentId: incident.id,
    });
    onBack();
  };

  const handleDispatch = () => {
    const toDispatch = availableTeams.slice(0, incident.score > 75 ? 2 : 1);
    toDispatch.forEach((team) => dispatchTeam(team.id, incident.id));
    addNotification({
      type: 'success',
      title: 'Teams Dispatched',
      message: `${toDispatch.length} team(s) dispatched to ${incident.title}`,
      incidentId: incident.id,
    });
  };

  const handleEscalate = () => {
    const newLevel = (incident.escalationLevel ?? 0) + 1;
    const levels = ['', 'Team Supervisor', 'District Control', 'Emergency Command'];
    updateIncident(incident.id, { escalationLevel: newLevel });
    setEscalated(true);
    addNotification({
      type: 'warning',
      title: `Escalation Level ${newLevel}`,
      message: `Incident #${incident.id} escalated to ${levels[newLevel] || 'Emergency Command'}`,
      incidentId: incident.id,
    });
  };

  const escalationLevels = ['Team Supervisor', 'District Control', 'Emergency Command'];

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-secondary transition-colors hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to Incidents
      </button>

      <div className="flex flex-wrap items-start gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style={{ backgroundColor: `${typeMeta.color}20` }}>
          {typeMeta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-white">Incident #{incident.id}</h2>
            <SeverityBadge severity={incident.severity} size="md" />
          </div>
          <p className="text-sm text-secondary mt-0.5">
            {typeMeta.emoji} {incident.title} ·{' '}
            <span
              className="inline-flex items-center gap-1"
              style={{ color: sourceMeta.color }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: sourceMeta.color }}
              />
              {sourceMeta.label}
            </span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold" style={{ color: typeMeta.color }}>{incident.score}</div>
          <div className="text-[10px] text-muted uppercase">/100</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-navy-border bg-navy-card p-4">
            <h3 className="text-sm font-bold text-white mb-3">Description</h3>
            <p className="text-sm text-secondary leading-relaxed">{incident.description}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex items-center gap-2 rounded-lg bg-navy-secondary/50 p-2.5">
                <MapPin size={14} className="text-royal shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted uppercase">Location</p>
                  <p className="text-xs text-white truncate">{incident.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-navy-secondary/50 p-2.5">
                <Users size={14} className="text-warning shrink-0" />
                <div>
                  <p className="text-[10px] text-muted uppercase">Affected</p>
                  <p className="text-xs text-white">{incident.peopleAffected} people</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-navy-secondary/50 p-2.5">
                <Clock size={14} className="text-response shrink-0" />
                <div>
                  <p className="text-[10px] text-muted uppercase">Reported</p>
                  <p className="text-xs text-white">{new Date(incident.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-navy-secondary/50 p-2.5">
                <Link2 size={14} className="text-aipurple shrink-0" />
                <div>
                  <p className="text-[10px] text-muted uppercase">Reports</p>
                  <p className="text-xs text-white">{incident.duplicateReports} merged</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-navy-border bg-navy-card p-4">
            <h3 className="text-sm font-bold text-white mb-3">Live Map</h3>
            <LiveMap onIncidentClick={onOpenIncident} height="300px" showTeams showHospitals={false} />
          </div>

          <div className="rounded-xl border border-navy-border bg-navy-card p-4">
            <h3 className="text-sm font-bold text-white mb-3">Timeline</h3>
            <div className="space-y-0">
              {incident.timeline.map((event, i) => (
                <div key={i} className="flex gap-3 pb-3 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-secondary text-sm shrink-0">
                      {event.icon}
                    </div>
                    {i < incident.timeline.length - 1 && (
                      <div className="w-0.5 flex-1 bg-navy-border mt-1" />
                    )}
                  </div>
                  <div className="pt-1">
                    <p className="text-xs font-semibold text-white">{event.event}</p>
                    <p className="text-[11px] text-muted">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-navy-border bg-navy-card p-4">
            <h3 className="text-sm font-bold text-white mb-3">Response</h3>
            {incident.assignedTeamss.length > 0 ? (
              <div className="space-y-2">
                {incident.assignedTeamss.map((teamId) => {
                  const team = teams.find((t) => t.id === teamId);
                  const resource = teams.find((t) => t.id === teamId);
                  return (
                    <div key={teamId} className="flex items-center gap-3 rounded-lg border border-navy-border bg-navy-secondary/40 p-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-card text-sm">
                        {team?.type === 'fire' ? '🚒' : team?.type === 'medical' ? '🚑' : '👨‍🚒'}

                        {resource?.type === 'fire'
                          ? '🚒'
                          : resource?.type === 'medical'
                            ? '🚑'
                            : '👨‍🚒'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{team?.name || teamId}</p>
                        <p className="text-[11px] text-secondary">{team?.vehicle || 'Unknown'}</p>
                      </div>
                      {team?.eta ? (
                        <span className="text-xs font-bold text-white">ETA {team.eta}m</span>
                      ) : (
                        <span className="text-xs font-bold text-response">On Scene</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted">No teams dispatched yet</p>
            )}

            {incident.recommendedResources.length > 0 && (
              <div className="mt-3 border-t border-navy-border pt-3">
                <p className="text-xs font-semibold text-secondary mb-2">Recommended Resources</p>
                <div className="space-y-1.5">
                  {incident.recommendedResources.map((r) => (
                    <div key={r.resourceId} className="flex items-center justify-between rounded-lg bg-navy-secondary/40 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Truck size={13} className="text-royal" />
                        <span className="text-xs text-white">{r.resourceId}</span>
                        {r.aiRecommended && (
                          <span className="rounded bg-aipurple/20 px-1.5 py-0.5 text-[9px] font-bold text-aipurple">AI RECOMMENDED</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-secondary">
                        <span>{r.distance} km</span>
                        <span>ETA {r.eta} min</span>
                        <span className="font-bold text-response">AVAILABLE</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <AIIntensityEngine incident={incident} />

          <div className="rounded-xl border border-aipurple/30 bg-aipurple/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-aipurple" />
              <h3 className="text-sm font-bold text-white">AI Action Plan</h3>
            </div>
            <div className="space-y-1.5 mb-3">
              {plan.immediateActions.map((action) => (
                <div key={action.step} className="flex items-center gap-2 text-xs text-white">
                  <span className="font-bold text-royal">{String(action.step).padStart(2, '0')}</span>
                  <span>{action.emoji}</span>
                  <span>{action.action}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setPlanOpen(true)}
              className="w-full rounded-lg bg-aipurple px-3 py-2 text-xs font-bold text-white transition-all hover:bg-aipurple/80"
            >
              View Full Plan
            </button>
          </div>

          {escalation.shouldEscalate && incident.status !== 'resolved' && (
            <div className="rounded-xl border border-warning/40 bg-warning/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-warning" />
                <h3 className="text-sm font-bold text-warning">Response Delay</h3>
              </div>
              <p className="text-xs text-secondary mb-1">
                Delay: <span className="font-bold text-warning">{String(escalation.delayMinutes).padStart(2, '0')}:00</span>
              </p>
              <p className="text-xs text-secondary mb-3">AI recommendation: Dispatch backup team</p>
              <button
                onClick={handleEscalate}
                className="w-full rounded-lg bg-warning px-3 py-2 text-xs font-bold text-white transition-all hover:bg-warning/80"
              >
                Escalate
              </button>
            </div>
          )}

          {escalated && incident.escalationLevel && incident.escalationLevel > 0 && (
            <div className="rounded-xl border border-warning/30 bg-navy-card p-4">
              <h3 className="text-sm font-bold text-white mb-2">Escalation Level</h3>
              <div className="space-y-1.5">
                {escalationLevels.map((level, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${i < incident.escalationLevel! ? 'bg-warning text-white' : 'bg-navy-secondary text-muted'
                        }`}
                    >
                      {i + 1}
                    </span>
                    <span className={i < incident.escalationLevel! ? 'text-white' : 'text-muted'}>{level}</span>
                    {i < incident.escalationLevel! && <CheckCircle2 size={12} className="text-warning ml-auto" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={() => setPlanOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-aipurple px-3 py-2.5 text-sm font-bold text-white transition-all hover:bg-aipurple/80"
            >
              <Zap size={15} />
              AI Action Plan
            </button>
            <button
              onClick={handleDispatch}
              disabled={availableTeams.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-royal px-3 py-2.5 text-sm font-bold text-white transition-all hover:bg-royal/80 disabled:opacity-50"
            >
              <Send size={15} />
              Dispatch Resources
            </button>
            <button
              onClick={handleEscalate}
              disabled={incident.status === 'resolved'}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm font-bold text-warning transition-all hover:bg-warning/20 disabled:opacity-50"
            >
              <AlertTriangle size={15} />
              Escalate
            </button>
            <button
              onClick={handleResolve}
              disabled={incident.status === 'resolved'}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-response/40 bg-response/10 px-3 py-2.5 text-sm font-bold text-response transition-all hover:bg-response/20 disabled:opacity-50"
            >
              <CheckCircle2 size={15} />
              Resolve Incident
            </button>
          </div>
        </div>
      </div>

      <ActionPlanModal
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        incident={incident}
        onDispatch={handleDispatch}
      />
    </div>
  );
}

export { Stethoscope, HardHat, Shield };
