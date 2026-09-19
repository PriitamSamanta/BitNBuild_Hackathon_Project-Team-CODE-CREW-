import type { Incident } from '@/src/types';
import { INCIDENT_TYPE_META, STATUS_META, SOURCE_META } from '@/src/types';
import { SeverityBadge } from './SeverityBadge';
import { MapPin, Users, Clock } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
  onClick: () => void;
  compact?: boolean;
}

export function IncidentCard({ incident, onClick, compact }: IncidentCardProps) {
  const typeMeta = INCIDENT_TYPE_META[incident.type];
  const statusMeta = STATUS_META[incident.status];
  const sourceMeta = SOURCE_META[incident.source];

  return (
    <button
      onClick={onClick}
      className="group w-full overflow-hidden rounded-xl border border-navy-border bg-navy-card p-3.5 text-left transition-all hover:border-navy-border/80 hover:bg-navy-card/80 hover:shadow-lg"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-lg shrink-0"
          style={{ backgroundColor: `${typeMeta.color}20` }}
        >
          {typeMeta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white truncate">{incident.title}</h4>
            <SeverityBadge severity={incident.severity} size="xs" />
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-secondary">
            <MapPin size={11} className="shrink-0" />
            <span className="truncate">{incident.location}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div
            className="text-lg font-extrabold leading-none"
            style={{ color: typeMeta.color }}
          >
            {incident.score}
          </div>
          <div className="text-[9px] text-muted uppercase">/100</div>
        </div>
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-secondary">
          <span className="flex items-center gap-1">
            <Users size={11} />
            {incident.peopleAffected} affected
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {timeSince(incident.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            {sourceMeta.emoji} {sourceMeta.label}
          </span>
          {incident.duplicateReports > 1 && (
            <span className="flex items-center gap-1 text-aipurple">
              🔗 {incident.duplicateReports} reports
            </span>
          )}
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: statusMeta.color }}>
            {statusMeta.dot}
          </span>
          <span className="text-xs font-medium" style={{ color: statusMeta.color }}>
            {statusMeta.label}
          </span>
        </div>
        {incident.assignedTeams.length > 0 && (
          <span className="text-xs text-secondary">
            {incident.assignedTeams.length} team{incident.assignedTeams.length > 1 ? 's' : ''} dispatched
          </span>
        )}
      </div>
    </button>
  );
}

function timeSince(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}
