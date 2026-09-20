'use client';

import { useState } from 'react';
import {
  ClipboardList,
  Search,
  MapPin,
  Clock,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  INCIDENT_TYPE_META,
  STATUS_META,
  SEVERITY_META,
  TEAM_STATUS_META,
  type IncidentStatus,
} from '@/types';
import type { UserPageId } from '@/components/user/UserHeader';

interface MyReportsProps {
  onNavigate: (page: UserPageId) => void;
  initialIncidentId?: string;
}

const LIFECYCLE_STEPS: { status: IncidentStatus; label: string }[] = [
  { status: 'reported', label: 'Reported' },
  { status: 'verified', label: 'Verified' },
  { status: 'assigned', label: 'Assigned' },
  { status: 'en-route', label: 'En Route' },
  { status: 'on-scene', label: 'On Scene' },
  { status: 'resolved', label: 'Resolved' },
];

function getStepIndex(status: IncidentStatus): number {
  switch (status) {
    case 'reported':
      return 0;
    case 'verified':
      return 1;
    case 'assigned':
      return 2;
    case 'responding':
    case 'en-route':
      return 3;
    case 'on-scene':
    case 'rescue-in-progress':
      return 4;
    case 'resolved':
    case 'closed':
      return 5;
    default:
      return 0;
  }
}

export function MyReports({ onNavigate, initialIncidentId }: MyReportsProps) {
  const { incidents, teams } = useApp();
  const [searchQuery, setSearchQuery] = useState(initialIncidentId || '');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(initialIncidentId || null);

  // Filter incidents: show citizen-reported or all incidents if user searches
  const filteredIncidents = incidents.filter((i) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      i.id.toLowerCase().includes(q) ||
      i.title.toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q) ||
      (i.trackingCode && i.trackingCode.toLowerCase().includes(q))
    );
  });

  const activeIncident = selectedIncidentId
    ? incidents.find((i) => i.id === selectedIncidentId)
    : filteredIncidents[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Emergency Report Tracking</h2>
          <p className="text-sm text-secondary mt-0.5">
            Monitor real-time dispatch progress, assigned response teams, and resolution milestones.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID (e.g. INC-..., SOS-...)"
            className="w-full rounded-xl border border-navy-border bg-navy-card py-2 pl-9 pr-3 text-xs text-white placeholder:text-muted focus:border-royal focus:outline-none"
          />
        </div>
      </div>

      {incidents.length === 0 ? (
        <div className="rounded-2xl border border-navy-border bg-navy-card py-16 text-center space-y-3">
          <ClipboardList size={40} className="text-muted mx-auto" />
          <h3 className="text-base font-bold text-white">No Emergency Reports Yet</h3>
          <p className="text-xs text-secondary max-w-sm mx-auto">
            You have not filed any reports yet. In case of an emergency, use the reporting form or SOS trigger.
          </p>
          <button
            onClick={() => onNavigate('report')}
            className="rounded-xl bg-emergency px-4 py-2 text-xs font-bold text-white shadow-lg"
          >
            File Emergency Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Report List (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted px-1">
              Your Reports ({filteredIncidents.length})
            </h3>

            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {filteredIncidents.map((inc) => {
                const isSelected = activeIncident?.id === inc.id;
                const typeMeta = INCIDENT_TYPE_META[inc.type];
                const sevMeta = SEVERITY_META[inc.severity];
                const statMeta = STATUS_META[inc.status];

                return (
                  <button
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`w-full text-left rounded-xl border p-3.5 transition-all ${
                      isSelected
                        ? 'border-royal bg-royal/10 shadow-lg shadow-royal/10'
                        : 'border-navy-border bg-navy-card hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-mono text-[11px] font-extrabold text-white">
                        #{inc.id}
                      </span>
                      <span
                        className="rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase"
                        style={{ color: sevMeta?.color, backgroundColor: sevMeta?.bgColor }}
                      >
                        {inc.severity}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{typeMeta?.emoji}</span>
                      <span className="truncate">{inc.title}</span>
                    </p>

                    <p className="text-[11px] text-secondary flex items-center gap-1 mt-1">
                      <MapPin size={11} className="text-muted shrink-0" />
                      <span className="truncate">{inc.location}</span>
                    </p>

                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-navy-border/50 text-[10px]">
                      <span
                        className="inline-flex items-center gap-1 font-bold capitalize"
                        style={{ color: statMeta?.color }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statMeta?.dot }} />
                        <span>{statMeta?.label || inc.status}</span>
                      </span>
                      <span className="text-muted">
                        {new Date(inc.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Tracking View (8 Cols) */}
          <div className="lg:col-span-8">
            {activeIncident ? (
              <div className="rounded-2xl border border-navy-border bg-navy-card p-5 lg:p-6 space-y-6 shadow-xl">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-navy-border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {INCIDENT_TYPE_META[activeIncident.type]?.emoji}
                      </span>
                      <h3 className="text-lg font-bold text-white">
                        {activeIncident.title}
                      </h3>
                      <span className="font-mono text-xs text-secondary font-semibold">
                        #{activeIncident.id}
                      </span>
                    </div>
                    <p className="text-xs text-secondary flex items-center gap-1.5">
                      <MapPin size={13} className="text-royal shrink-0" />
                      <span>{activeIncident.location}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-lg px-2.5 py-1 text-xs font-bold uppercase"
                      style={{
                        color: SEVERITY_META[activeIncident.severity]?.color,
                        backgroundColor: SEVERITY_META[activeIncident.severity]?.bgColor,
                      }}
                    >
                      {activeIncident.severity}
                    </span>
                    <span
                      className="rounded-lg px-2.5 py-1 text-xs font-bold capitalize"
                      style={{
                        color: STATUS_META[activeIncident.status]?.color,
                        backgroundColor: `${STATUS_META[activeIncident.status]?.color}20`,
                      }}
                    >
                      {STATUS_META[activeIncident.status]?.label || activeIncident.status}
                    </span>
                  </div>
                </div>

                {/* Visual Progress Stepper */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                    Response Lifecycle Status
                  </h4>

                  <div className="relative flex items-center justify-between py-2">
                    {/* Connecting Bar */}
                    <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-navy-secondary" />
                    <div
                      className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-response transition-all duration-500"
                      style={{
                        width: `${(getStepIndex(activeIncident.status) / (LIFECYCLE_STEPS.length - 1)) * 100}%`,
                      }}
                    />

                    {LIFECYCLE_STEPS.map((step, idx) => {
                      const currentIdx = getStepIndex(activeIncident.status);
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={step.status} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-all ${
                              isCompleted
                                ? 'border-response bg-response text-navy-deep'
                                : 'border-navy-border bg-navy-secondary text-secondary'
                            } ${isCurrent ? 'ring-4 ring-response/30 animate-pulse' : ''}`}
                          >
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span
                            className={`mt-1.5 text-[10px] font-semibold text-center whitespace-nowrap ${
                              isCompleted ? 'text-white' : 'text-muted'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dispatched Teams Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                    Dispatched Response Units
                  </h4>

                  {activeIncident.assignedTeamss && activeIncident.assignedTeamss.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeIncident.assignedTeamss.map((teamId) => {
                        const team = teams.find((t) => t.id === teamId);
                        const statusMeta = team ? TEAM_STATUS_META[team.status] : null;

                        return (
                          <div
                            key={teamId}
                            className="rounded-xl border border-response/40 bg-navy-secondary/40 p-3.5 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-response/20 text-response font-bold">
                                  🚒
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-white">{team?.name || teamId}</p>
                                  <p className="text-[10px] text-secondary">{team?.vehicle || 'Emergency Vehicle'}</p>
                                </div>
                              </div>
                              <span
                                className="rounded px-2 py-0.5 text-[10px] font-bold capitalize"
                                style={{
                                  color: statusMeta?.color || '#10B981',
                                  backgroundColor: `${statusMeta?.color || '#10B981'}20`,
                                }}
                              >
                                {team?.status?.replace('-', ' ') || 'Dispatched'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
                              <div>
                                <span className="text-muted">Estimated ETA:</span>
                                <p className="font-bold text-response">{team?.eta ?? 5} minutes</p>
                              </div>
                              <div>
                                <span className="text-muted">Destination:</span>
                                <p className="font-medium text-white truncate">{team?.destination || activeIncident.location}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-navy-border bg-navy-secondary/30 p-4 text-center">
                      <Clock size={20} className="text-muted mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-white">Triage in Progress</p>
                      <p className="text-[11px] text-secondary mt-0.5">
                        The incident is logged. Command Center is currently assigning the nearest medical, fire, or police team.
                      </p>
                    </div>
                  )}
                </div>

                {/* Description & Incident Details */}
                <div className="rounded-xl border border-navy-border bg-navy-secondary/40 p-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                    Report Description
                  </h4>
                  <p className="text-xs text-white/90 leading-relaxed">
                    {activeIncident.description || 'No description provided.'}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-navy-border/50 text-xs">
                    <div>
                      <span className="text-[10px] text-muted">People Affected</span>
                      <p className="font-bold text-white">{activeIncident.peopleAffected} persons</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted">Report Source</span>
                      <p className="font-bold text-white capitalize">{activeIncident.source}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted">Priority Score</span>
                      <p className="font-bold text-royal">{activeIncident.score}/100</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted">Reported At</span>
                      <p className="font-bold text-white">
                        {new Date(activeIncident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                {activeIncident.timeline && activeIncident.timeline.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                      Dispatch Event Log
                    </h4>
                    <div className="space-y-2 border-l-2 border-navy-border pl-3 ml-2">
                      {activeIncident.timeline.map((evt, i) => (
                        <div key={i} className="relative text-xs">
                          <span className="absolute -left-[19px] top-0.5 flex h-2.5 w-2.5 rounded-full bg-royal" />
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-muted">{evt.time}</span>
                            <span className="font-medium text-white">{evt.icon} {evt.event}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-navy-border bg-navy-card p-12 text-center text-muted">
                Select an incident from the list to view live tracking details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
