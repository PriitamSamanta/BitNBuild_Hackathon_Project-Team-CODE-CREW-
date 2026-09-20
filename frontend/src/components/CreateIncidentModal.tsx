'use client';

import { useState } from 'react';
import {
  useForm,
  type SubmitHandler,
} from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Siren,
  Loader2,
  Brain,
  Sparkles,
} from 'lucide-react';

import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { useApp } from '@/context/AppContext';
import {
  analyzeIncident,
  type AIAnalysisResult,
} from '@/services/aiService';

import {
  INCIDENT_TYPE_META,
  type IncidentType,
} from '@/types';

/* ========================================
   Form validation
======================================== */

const schema = z.object({
  location: z
    .string()
    .trim()
    .min(2, 'Location is required'),

  description: z
    .string()
    .trim()
    .min(10, 'Please provide at least 10 characters'),

  peopleAffected: z
    .number()
    .int()
    .min(0, 'People affected cannot be negative')
    .max(100000, 'Value is too large'),

  source: z.enum([
    'citizen',
    'call',
    'iot',
    'field',
    'hospital',
    'government',
  ]),

  priority: z.enum([
    'normal',
    'high',
  ]),
});

/*
 * Keep the form type aligned with the Zod schema.
 *
 * This avoids the resolver mismatch that happened when
 * the global IncidentSource type contained additional
 * backend-only values.
 */
type FormValues = z.infer<typeof schema>;

/* ========================================
   Props
======================================== */

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}

/* ========================================
   Component
======================================== */

export function CreateIncidentModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const {
    incidents,
    resources,
    addIncident,
    addNotification,
  } = useApp();

  const [type, setType] =
    useState<IncidentType>('fire');

  const [analyzing, setAnalyzing] =
    useState(false);

  const [result, setResult] =
    useState<AIAnalysisResult | null>(null);

  const [coordinates, setCoordinates] =
    useState<
      { lat: number; lng: number } | undefined
    >();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      location: '',
      description: '',
      peopleAffected: 0,
      source: 'citizen',
      priority: 'normal',
    },
  });

  /* ========================================
     Close / reset modal
  ======================================== */

  const close = () => {
    reset();

    setType('fire');
    setResult(null);
    setAnalyzing(false);
    setCoordinates(undefined);

    onClose();
  };

  /* ========================================
     Browser geolocation
  ======================================== */

  const getBrowserCoordinates = () =>
    new Promise<
      { lat: number; lng: number } | undefined
    >((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          resolve(undefined);
        },
        {
          enableHighAccuracy: false,
          timeout: 4000,
        },
      );
    });

  /* ========================================
     AI analysis
  ======================================== */

  const onAnalyze: SubmitHandler<FormValues> = async (
    values,
  ) => {
    setAnalyzing(true);
    setResult(null);

    try {
      const coords =
        await getBrowserCoordinates();

      setCoordinates(coords);

      const availableResources =
        resources.filter(
          (resource) =>
            resource.status === 'available',
        );

      /*
       * Keep the existing six-argument call.
       *
       * The updated aiService supports these optional
       * compatibility arguments while using the backend
       * Gemini API for the actual analysis.
       */
      const analysis = await analyzeIncident(
        values.description,
        values.peopleAffected,
        values.source,
        incidents,
        availableResources,
        coords,
      );

      setResult(analysis);
    } catch (error) {
      console.error(
        'Incident analysis failed:',
        error,
      );

      addNotification({
        type: 'critical',
        title: 'Analysis failed',
        message:
          'Unable to analyze the incident. Please try again.',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  /* ========================================
     Create incident
  ======================================== */

  const createIncident: SubmitHandler<FormValues> = (
    values,
  ) => {
    if (!result) {
      return;
    }

    const now =
      new Date().toISOString();

    const id = `INC-${crypto
      .randomUUID()
      .slice(0, 8)
      .toUpperCase()}`;

    /*
     * Use the AI result type instead of the manually
     * selected frontend type because Gemini may classify
     * the incident differently.
     */
    const incidentMeta =
      INCIDENT_TYPE_META[result.type];

    const title =
      incidentMeta?.label ??
      result.title ??
      'Emergency Incident';

    const incident = {
      id,

      type: result.type,

      title,

      location: values.location,

      coordinates,

      severity: result.severity,

      score: result.score,

      confidence: result.confidence,

      source: values.source,

      peopleAffected:
        values.peopleAffected,

      status: 'verified' as const,

      /*
       * Keep the correct property name.
       *
       * Backend/frontend models use assignedTeams.
       */
      assignedTeams: [],

      /*
       * Keep the legacy property because the current
       * frontend Incident interface still requires it.
       */
      assignedTeamss: [],

      recommendedResources:
        result.recommendedResources,

      createdAt: now,

      updatedAt: now,

      description: values.description,

      timeline: [
        {
          time: new Date().toLocaleTimeString(
            'en-IN',
            {
              hour: '2-digit',
              minute: '2-digit',
            },
          ),
          event: 'Incident created',
          icon: '📝',
        },

        {
          time: new Date().toLocaleTimeString(
            'en-IN',
            {
              hour: '2-digit',
              minute: '2-digit',
            },
          ),
          event: `AI classified as ${title}`,
          icon: '🤖',
        },

        {
          time: new Date().toLocaleTimeString(
            'en-IN',
            {
              hour: '2-digit',
              minute: '2-digit',
            },
          ),
          event: `Severity: ${result.severity.toUpperCase()} (${result.score}/100)`,
          icon: '⚠️',
        },
      ],

      duplicateReports:
        result.duplicateReports,

      riskFactors:
        result.riskFactors,

      escalationLevel: 0,
    };

    /*
     * Keep the existing frontend state workflow.
     * We are NOT replacing this with a backend POST yet,
     * so existing UI behavior is preserved.
     */
    addIncident(incident);

    addNotification({
      type:
        result.severity === 'critical'
          ? 'critical'
          : 'info',

      title: `New incident: ${title}`,

      message: `${title} at ${values.location} — Score ${result.score}/100`,

      incidentId: id,
    });

    close();

    onCreated(id);
  };

  /* ========================================
     Render
  ======================================== */

  return (
    <Modal
      open={open}
      onClose={close}
      title="Create Incident"
      subtitle="AI-powered emergency analysis"
      icon={<Siren size={20} />}
      maxWidth="max-w-xl"
    >
      <form
        onSubmit={handleSubmit(
          result
            ? createIncident
            : onAnalyze,
        )}
        className="space-y-4"
      >
        {/* ====================================
            Incident Type
        ==================================== */}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-secondary">
            Incident Type
          </label>

          <div className="grid grid-cols-3 gap-2">
            {(
              Object.keys(
                INCIDENT_TYPE_META,
              ) as IncidentType[]
            ).map((incidentType) => (
              <button
                type="button"
                key={incidentType}
                onClick={() =>
                  setType(incidentType)
                }
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${type === incidentType
                  ? 'border-emergency/50 bg-emergency/10 text-white'
                  : 'border-navy-border bg-navy-secondary text-secondary hover:text-white'
                  }`}
              >
                <span>
                  {
                    INCIDENT_TYPE_META[
                      incidentType
                    ].emoji
                  }
                </span>

                {
                  INCIDENT_TYPE_META[
                    incidentType
                  ].label
                }
              </button>
            ))}
          </div>
        </div>

        {/* ====================================
            Location + People affected
        ==================================== */}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-secondary">
              Location
            </label>

            <Input
              {...register('location')}
              placeholder="Enter incident location"
            />

            {errors.location && (
              <p className="mt-1 text-xs text-emergency">
                {errors.location.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-secondary">
              People Affected
            </label>

            <Input
              type="number"
              min={0}
              {...register(
                'peopleAffected',
                {
                  valueAsNumber: true,
                },
              )}
            />

            {errors.peopleAffected && (
              <p className="mt-1 text-xs text-emergency">
                {
                  errors.peopleAffected
                    .message
                }
              </p>
            )}
          </div>
        </div>

        {/* ====================================
            Description
        ==================================== */}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-secondary">
            Description
          </label>

          <Textarea
            rows={3}
            {...register('description')}
            placeholder="Describe what happened, hazards, injuries, or other relevant details."
          />

          {errors.description && (
            <p className="mt-1 text-xs text-emergency">
              {
                errors.description
                  .message
              }
            </p>
          )}
        </div>

        {/* ====================================
            Source + Priority
        ==================================== */}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-secondary">
              Source
            </label>

            <select
              {...register('source')}
              className="h-9 w-full rounded-lg border border-navy-border bg-navy-secondary px-3 text-sm text-white"
            >
              <option value="citizen">
                Citizen
              </option>

              <option value="call">
                Emergency Call
              </option>

              <option value="iot">
                IoT Sensor
              </option>

              <option value="field">
                Field Team
              </option>

              <option value="hospital">
                Hospital
              </option>

              <option value="government">
                Government
              </option>
            </select>

            {errors.source && (
              <p className="mt-1 text-xs text-emergency">
                {errors.source.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-secondary">
              Priority
            </label>

            <select
              {...register('priority')}
              className="h-9 w-full rounded-lg border border-navy-border bg-navy-secondary px-3 text-sm text-white"
            >
              <option value="normal">
                Normal
              </option>

              <option value="high">
                High Priority
              </option>
            </select>

            {errors.priority && (
              <p className="mt-1 text-xs text-emergency">
                {
                  errors.priority
                    .message
                }
              </p>
            )}
          </div>
        </div>

        {/* ====================================
            AI analyzing state
        ==================================== */}

        {analyzing && (
          <div className="rounded-xl border border-aipurple/30 bg-aipurple/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Loader2
                size={16}
                className="animate-spin text-aipurple"
              />

              <span className="text-sm font-semibold text-aipurple">
                Analyzing...
              </span>
            </div>

            <div className="relative h-1 overflow-hidden rounded-full bg-navy-secondary">
              <div className="scan-line absolute inset-y-0 w-1/3" />
            </div>

            <p className="mt-2 text-xs text-secondary">
              Running AI-powered emergency
              analysis and validation.
            </p>
          </div>
        )}

        {/* ====================================
            AI result
        ==================================== */}

        {result && !analyzing && (
          <div className="rounded-xl border border-response/30 bg-response/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Brain
                size={16}
                className="text-response"
              />

              <span className="text-sm font-semibold text-response">
                Analysis Complete
              </span>

              <Sparkles
                size={14}
                className="ml-auto text-aipurple"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-secondary">
                  Type
                </p>

                <p className="font-semibold text-white">
                  {
                    INCIDENT_TYPE_META[
                      result.type
                    ]?.emoji
                  }{' '}

                  {
                    INCIDENT_TYPE_META[
                      result.type
                    ]?.label ??
                    result.type
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-secondary">
                  Severity
                </p>

                <p className="font-semibold uppercase text-white">
                  {result.severity} —{' '}
                  {result.score}/100
                </p>
              </div>

              <div>
                <p className="text-xs text-secondary">
                  Confidence
                </p>

                <p className="font-semibold text-aipurple">
                  {result.confidence}%
                </p>
              </div>

              <div>
                <p className="text-xs text-secondary">
                  Location coordinates
                </p>

                <p className="font-semibold text-white">
                  {coordinates
                    ? 'Browser location captured'
                    : 'Not available'}
                </p>
              </div>
            </div>

            {/* Optional AI summary */}
            {result.summary && (
              <div className="mt-3 border-t border-response/20 pt-3">
                <p className="mb-1 text-xs text-secondary">
                  AI Summary
                </p>

                <p className="text-sm text-white">
                  {result.summary}
                </p>
              </div>
            )}

            {/* Optional recommended action */}
            {result.recommendedAction && (
              <div className="mt-3 border-t border-response/20 pt-3">
                <p className="mb-1 text-xs text-secondary">
                  Recommended Action
                </p>

                <p className="text-sm text-white">
                  {result.recommendedAction}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ====================================
            Actions
        ==================================== */}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={close}
          >
            Cancel
          </Button>

          {!result ? (
            <Button
              type="submit"
              disabled={analyzing}
            >
              <Brain size={16} />

              {analyzing
                ? 'Analyzing...'
                : 'Run Analysis'}
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={analyzing}
            >
              <Siren size={16} />

              Create Incident
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}