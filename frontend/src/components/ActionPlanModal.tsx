'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Zap,
  Check,
  X,
  Send,
  Loader2,
  MapPin,
  Users,
  AlertTriangle,
} from 'lucide-react';

import { Modal } from './Modal';
import { useApp } from '@/context/AppContext';

import {
  generateActionPlan,
  getAIRecommendations,
} from '@/services/aiService';

import { getIncidents } from '@/services/incidentService';

import {
  INCIDENT_TYPE_META,
  type Incident,
} from '@/types';

/* ========================================
   Backend recommendation type

   Matches recommendation.service.ts
======================================== */

interface RecommendedTeam {
  teamId: string;
  name: string;
  type: string;
  status: string;
  distanceKm: number;
  capabilities: string[];
  contactNumber?: string;
  reason: string;
}

/* ========================================
   Props
======================================== */

interface ActionPlanModalProps {
  open: boolean;
  onClose: () => void;
  incident: Incident | null;
  onDispatch?: () => void;
}

/* ========================================
   Component
======================================== */

export function ActionPlanModal({
  open,
  onClose,
  incident,
  onDispatch,
}: ActionPlanModalProps) {
  const {
    dispatchTeam,
    teams,
    addNotification,
  } = useApp();

  const [approved, setApproved] =
    useState(false);

  const [dispatched, setDispatched] =
    useState(false);

  const [loadingRecommendations, setLoadingRecommendations] =
    useState(false);

  const [recommendations, setRecommendations] =
    useState<RecommendedTeam[]>([]);

  const [selectedTeams, setSelectedTeams] =
    useState<string[]>([]);

  const [recommendationError, setRecommendationError] =
    useState<string | null>(null);

  /* ========================================
     No incident
  ======================================== */

  if (!incident) {
    return null;
  }

  /* ========================================
     AI action plan

     This remains your existing working
     frontend AI action-plan generation.
  ======================================== */

  const plan =
    generateActionPlan(incident);

  const typeMeta =
    INCIDENT_TYPE_META[incident.type] ??
    INCIDENT_TYPE_META.other;

  /* ========================================
     Load backend recommendations

     The frontend Incident uses INC-XXXX IDs,
     while the backend recommendation endpoint
     requires the MongoDB incident _id.

     Therefore we first fetch backend incidents
     and find the matching incidentId.
  ======================================== */

  useEffect(() => {
    if (!open || !incident) {
      return;
    }

    let cancelled = false;

    const loadRecommendations =
      async () => {
        setLoadingRecommendations(true);
        setRecommendationError(null);
        setRecommendations([]);
        setSelectedTeams([]);

        try {
          /*
           * Get current backend incidents.
           */
          const backendIncidents =
            await getIncidents();

          /*
           * Match frontend incident ID
           * such as INC-0001 with backend
           * incidentId.
           */
          const backendIncident =
            backendIncidents.find(
              (item) =>
                item.incidentId ===
                incident.id,
            );

          /*
           * The incident may currently exist
           * only in frontend state because
           * CreateIncidentModal still uses
           * addIncident().
           */
          if (!backendIncident) {
            if (!cancelled) {
              setRecommendationError(
                'This incident is not yet stored in the backend. Backend team recommendations are available for backend incidents.',
              );
            }

            return;
          }

          /*
           * Call:
           *
           * GET /api/incidents/:id/recommendations
           */
          const result =
            await getAIRecommendations(
              backendIncident._id,
            );

          /*
           * The service returns:
           *
           * {
           *   incident,
           *   recommendations
           * }
           *
           * Keep the defensive check so the
           * UI does not crash if the response
           * is empty.
           */
          const backendRecommendations =
            Array.isArray(
              result?.recommendations,
            )
              ? result.recommendations
              : [];

          if (!cancelled) {
            setRecommendations(
              backendRecommendations as RecommendedTeam[],
            );

            /*
             * Select all recommended teams
             * by default.
             */
            setSelectedTeams(
              backendRecommendations.map(
                (team: RecommendedTeam) => team.teamId,
              ),
            );
          }
        } catch (error) {
          console.error(
            'Failed to load team recommendations:',
            error,
          );

          if (!cancelled) {
            setRecommendationError(
              error instanceof Error
                ? error.message
                : 'Unable to load team recommendations.',
            );
          }
        } finally {
          if (!cancelled) {
            setLoadingRecommendations(false);
          }
        }
      };

    void loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [open, incident]);

  /* ========================================
     Fallback local teams

     Keep this only as a compatibility fallback
     for the existing frontend workflow.
  ======================================== */

  const fallbackTeams =
    useMemo(() => {
      return teams.filter(
        (team) =>
          team.status === 'available' &&
          team.type === incident.type,
      );
    }, [teams, incident.type]);

  /* ========================================
     Toggle recommended team
  ======================================== */

  const toggleTeam = (
    teamId: string,
  ) => {
    setSelectedTeams((current) => {
      if (current.includes(teamId)) {
        return current.filter(
          (id) => id !== teamId,
        );
      }

      return [...current, teamId];
    });
  };

  /* ========================================
     Approve action plan
  ======================================== */

  const handleApprove = () => {
    setApproved(true);

    addNotification({
      type: 'ai',
      title: 'AI Action Plan Approved',
      message: `Plan approved for Incident #${incident.id}`,
      incidentId: incident.id,
    });
  };

  /* ========================================
     Dispatch recommended teams
  ======================================== */

  const handleDispatch = () => {
    /*
     * Prefer real backend recommendations.
     */
    if (
      recommendations.length > 0 &&
      selectedTeams.length === 0
    ) {
      addNotification({
        type: 'warning',
        title: 'No Teams Selected',
        message:
          'Select at least one recommended team before dispatching.',
        incidentId: incident.id,
      });

      return;
    }

    /*
     * Backend recommendation IDs are TEAM-001,
     * TEAM-002, etc. This is exactly what
     * dispatchTeam() expects.
     */
    const teamsToDispatch =
      recommendations.length > 0
        ? recommendations.filter((team: RecommendedTeam) =>
          selectedTeams.includes(
            team.teamId,
          ),
        )
        : fallbackTeams.slice(
          0,
          incident.score > 75 ? 2 : 1,
        );

    if (teamsToDispatch.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Available Teams',
        message:
          'No available response teams were found for this incident.',
        incidentId: incident.id,
      });

      return;
    }

    /*
     * Dispatch through existing AppContext.
     *
     * AppContext already converts the frontend
     * incident ID to the backend MongoDB ID
     * and calls POST /dispatch.
     */
    teamsToDispatch.forEach((team) => {
      const teamId =
        'teamId' in team
          ? team.teamId
          : team.id;

      void dispatchTeam(
        teamId,
        incident.id,
      );
    });

    setDispatched(true);

    addNotification({
      type: 'success',
      title: 'Teams Dispatched',
      message: `${teamsToDispatch.length} team(s) dispatched to Incident #${incident.id}`,
      incidentId: incident.id,
    });

    onDispatch?.();

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  /* ========================================
     Reset modal
  ======================================== */

  const handleClose = () => {
    setApproved(false);
    setDispatched(false);
    setRecommendations([]);
    setSelectedTeams([]);
    setRecommendationError(null);

    onClose();
  };

  /* ========================================
     Render
  ======================================== */

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="AI Response Plan"
      subtitle={`Incident #${incident.id} — ${typeMeta.emoji} ${incident.title}`}
      icon={
        <Zap
          size={20}
          className="text-aipurple"
        />
      }
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">

        {/* ====================================
            Incident summary
        ==================================== */}

        <div className="flex items-center gap-3 rounded-xl border border-navy-border bg-navy-secondary/60 p-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
            style={{
              backgroundColor: `${typeMeta.color}20`,
            }}
          >
            {typeMeta.emoji}
          </div>

          <div className="flex-1">
            <p className="text-sm font-bold text-white">
              {incident.title}
            </p>

            <p className="text-xs text-secondary">
              {incident.location}
            </p>
          </div>

          <div className="text-right">
            <p
              className="text-2xl font-extrabold"
              style={{
                color: typeMeta.color,
              }}
            >
              {incident.score}
            </p>

            <p className="text-[10px] text-muted uppercase">
              {incident.severity}
            </p>
          </div>
        </div>

        {/* ====================================
            Immediate Actions
        ==================================== */}

        <div>
          <h4 className="mb-2 text-sm font-bold text-white">
            Immediate Actions
          </h4>

          <div className="space-y-2">
            {plan.immediateActions.map(
              (action) => (
                <div
                  key={action.step}
                  className="flex items-center gap-3 rounded-lg border border-navy-border bg-navy-secondary/40 p-2.5"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-card text-xs font-bold text-royal">
                    {String(
                      action.step,
                    ).padStart(2, '0')}
                  </span>

                  <span className="text-base">
                    {action.emoji}
                  </span>

                  <span className="flex-1 text-sm text-white">
                    {action.action}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* ====================================
            Escalation
        ==================================== */}

        <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={15}
              className="text-warning"
            />

            <h4 className="text-sm font-bold text-warning">
              Escalation
            </h4>
          </div>

          <p className="mt-1.5 text-xs text-secondary">
            {plan.escalation
              ? 'This incident requires priority escalation and close response monitoring.'
              : 'No immediate escalation is required based on the current incident assessment.'}
          </p>
        </div>

        {/* ====================================
            Backend Recommendations
        ==================================== */}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">
              Recommended Response Teams
            </h4>

            {loadingRecommendations && (
              <Loader2
                size={15}
                className="animate-spin text-aipurple"
              />
            )}
          </div>

          {/* Loading */}

          {loadingRecommendations && (
            <div className="rounded-lg border border-navy-border bg-navy-secondary/40 p-4 text-center">
              <p className="text-xs text-secondary">
                Finding the nearest available
                response teams...
              </p>
            </div>
          )}

          {/* Error */}

          {!loadingRecommendations &&
            recommendationError && (
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                <div className="flex gap-2">
                  <AlertTriangle
                    size={15}
                    className="mt-0.5 shrink-0 text-warning"
                  />

                  <div>
                    <p className="text-xs font-semibold text-warning">
                      Backend recommendations unavailable
                    </p>

                    <p className="mt-1 text-xs text-secondary">
                      {recommendationError}
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Recommendations */}

          {!loadingRecommendations &&
            recommendations.length > 0 && (
              <div className="space-y-2">
                {recommendations.map(
                  (team: RecommendedTeam) => {
                    const selected =
                      selectedTeams.includes(
                        team.teamId,
                      );

                    return (
                      <button
                        key={team.teamId}
                        type="button"
                        onClick={() =>
                          toggleTeam(
                            team.teamId,
                          )
                        }
                        disabled={
                          team.status !==
                          'available'
                        }
                        className={`w-full rounded-lg border p-3 text-left transition-all ${selected
                          ? 'border-response/50 bg-response/10'
                          : 'border-navy-border bg-navy-secondary/40 hover:border-navy-border/80'
                          }`}
                      >
                        <div className="flex items-start gap-3">

                          {/* Checkbox */}

                          <div
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${selected
                              ? 'border-response bg-response text-white'
                              : 'border-navy-border'
                              }`}
                          >
                            {selected && (
                              <Check
                                size={13}
                              />
                            )}
                          </div>

                          {/* Team */}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-white">
                                {team.name}
                              </p>

                              <span className="shrink-0 rounded-full bg-response/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-response">
                                {team.type.replace(
                                  '_',
                                  ' ',
                                )}
                              </span>
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-secondary">
                              <span className="flex items-center gap-1">
                                <MapPin
                                  size={12}
                                />
                                {team.distanceKm.toFixed(
                                  2,
                                )}{' '}
                                km
                              </span>

                              <span className="flex items-center gap-1">
                                <Users
                                  size={12}
                                />
                                Available
                              </span>
                            </div>

                            <p className="mt-2 text-xs text-secondary">
                              {team.reason}
                            </p>

                            {team.capabilities?.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {team.capabilities.map(
                                  (capability: string) => (
                                    <span
                                      key={capability}
                                      className="rounded bg-navy-card px-1.5 py-0.5 text-[9px] text-muted"
                                    >
                                      {capability}
                                    </span>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            )}

          {/* No recommendations */}

          {!loadingRecommendations &&
            !recommendationError &&
            recommendations.length === 0 && (
              <div className="rounded-lg border border-navy-border bg-navy-secondary/40 p-3">
                <p className="text-xs text-secondary">
                  No backend recommendations are
                  available for this incident.
                </p>
              </div>
            )}
        </div>

        {/* ====================================
            Dispatch result
        ==================================== */}

        {dispatched ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-response/10 p-3 text-response animate-fade-in">
            <Check size={18} />

            <span className="text-sm font-bold">
              Teams Dispatched Successfully
            </span>
          </div>
        ) : (
          <div className="flex gap-2">

            {/* Approve */}

            {!approved ? (
              <button
                onClick={handleApprove}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-aipurple px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-aipurple/80"
              >
                <Check size={16} />

                Approve Plan
              </button>
            ) : (
              /* Dispatch */

              <button
                onClick={handleDispatch}
                disabled={
                  loadingRecommendations ||
                  (
                    recommendations.length >
                    0 &&
                    selectedTeams.length ===
                    0
                  ) ||
                  (
                    recommendations.length ===
                    0 &&
                    fallbackTeams.length ===
                    0
                  )
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emergency px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-emergency-critical disabled:opacity-50"
              >
                <Send size={16} />

                {loadingRecommendations
                  ? 'Finding Teams...'
                  : `Dispatch (${recommendations.length >
                    0
                    ? selectedTeams.length
                    : fallbackTeams.length
                  })`}
              </button>
            )}

            {/* Cancel / Modify */}

            <button
              onClick={() => {
                setApproved(false);
                setDispatched(false);
                onClose();
              }}
              className="flex items-center justify-center gap-2 rounded-lg border border-navy-border bg-navy-secondary px-4 py-2.5 text-sm font-medium text-secondary transition-all hover:text-white"
            >
              <X size={16} />

              {approved
                ? 'Cancel'
                : 'Modify'}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}