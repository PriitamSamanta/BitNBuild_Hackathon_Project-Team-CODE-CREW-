import api from "@/lib/api";
import type {
  Incident,
  IncidentType,
  Severity,
  RecommendedResource,
  Resource,
  ResourceType,
  Team,
  Hospital,
} from "@/types";

/* =========================================================
   AI TYPES
========================================================= */

export interface AIAnalysisResult {
  type: IncidentType;
  severity: Severity;
  score: number;
  confidence: number;
  peopleAffected: number;
  peopleTrapped: number;
  medicalAssistance: boolean;
  title: string;
  summary: string;
  riskFactors: string[];
  recommendedAction: string;
  recommendedResources: RecommendedResource[];
  duplicateReports: number;
}

interface BackendAIAnalysis {
  type: IncidentType;
  severity: Severity;
  priority: number;
  title: string;
  summary: string;
  peopleAffected: number;
  peopleTrapped: number;
  medicalAssistance: boolean;
  recommendedAction: string;
}

interface BackendAIResponse {
  success: boolean;
  message: string;
  data: BackendAIAnalysis;
}

/* =========================================================
   REAL BACKEND GEMINI ANALYSIS
========================================================= */

/**
 * Real Gemini-powered emergency analysis.
 *
 * Backend:
 * POST /api/ai/analyze
 *
 * Keep the optional arguments for compatibility with the
 * old CreateIncidentModal call.
 */
export async function analyzeIncident(
  description: string,
  _peopleAffected?: number,
  _source?: string,
  _existingIncidents?: Incident[],
  _resources?: Resource[],
  _coordinates?: {
    lat: number;
    lng: number;
  },
): Promise<AIAnalysisResult> {
  if (!description.trim()) {
    throw new Error(
      "Emergency description is required.",
    );
  }

  const response =
    await api.post<BackendAIResponse>(
      "/api/ai/analyze",
      {
        description: description.trim(),
      },
    );

  const analysis = response.data.data;

  if (!analysis) {
    throw new Error(
      "AI returned an empty analysis.",
    );
  }

  return {
    type: analysis.type,
    severity: analysis.severity,

    // Backend priority: 1-5
    // Existing frontend score: 0-100
    score: Math.min(
      100,
      Math.max(
        0,
        analysis.priority * 20,
      ),
    ),

    confidence: 100,

    peopleAffected:
      analysis.peopleAffected ?? 0,

    peopleTrapped:
      analysis.peopleTrapped ?? 0,

    medicalAssistance:
      analysis.medicalAssistance ?? false,

    title:
      analysis.title ||
      "Emergency Incident",

    summary:
      analysis.summary ||
      "Emergency analysis completed.",

    riskFactors: [],

    recommendedAction:
      analysis.recommendedAction ||
      "Assess the situation and dispatch appropriate emergency resources.",

    recommendedResources: [],

    duplicateReports: 0,
  };
}

/* =========================================================
   TEAM RECOMMENDATIONS
========================================================= */

export async function getAIRecommendations(
  incidentMongoId: string,
) {
  if (!incidentMongoId) {
    throw new Error(
      "Incident ID is required.",
    );
  }

  const response = await api.get(
    `/api/incidents/${incidentMongoId}/recommendations`,
  );

  return response.data.data;
}

/* =========================================================
   SUMMARY
========================================================= */

/**
 * Existing AIAssistant components call this function.
 *
 * It remains async because the real backend Gemini
 * endpoint is being used.
 */
export function generateSummary(
  incidents: Incident[],
  teams?: Team[],
  resources?: Resource[],
): string {
  if (!incidents.length) {
    return "No active incidents are currently available.";
  }

  const highestPriority =
    [...incidents].sort(
      (a, b) =>
        getIncidentPriority(b) -
        getIncidentPriority(a),
    )[0];

  const availableTeams =
    teams?.filter(
      (team) =>
        team.status === "available",
    ).length ?? 0;

  const availableResources =
    resources?.filter(
      (resource) =>
        resource.status === "available",
    ).length ?? 0;

  return (
    `Highest priority incident: ${highestPriority.title}\n\n` +
    `Type: ${highestPriority.type}\n` +
    `Severity: ${highestPriority.severity.toUpperCase()}\n` +
    `Priority: ${getIncidentPriority(highestPriority)}/5\n` +
    `People affected: ${highestPriority.peopleAffected}\n` +
    `Available response teams: ${availableTeams}\n` +
    `Available resources: ${availableResources}\n\n` +
    `Response teams should prioritize the highest-severity incident and maintain continuous monitoring.`
  );
}

/* =========================================================
   INCIDENT HELPERS
========================================================= */

/**
 * The backend Incident model has priority, while the
 * existing frontend Incident interface may not.
 *
 * This helper safely reads it without breaking the
 * existing frontend model.
 */
function getIncidentPriority(
  incident: Incident,
): number {
  const value = (
    incident as Incident & {
      priority?: number;
    }
  ).priority;

  if (
    typeof value === "number"
  ) {
    return value;
  }

  /*
   * Fallback based on severity.
   */
  switch (incident.severity) {
    case "critical":
      return 5;

    case "high":
      return 4;

    case "medium":
      return 3;

    case "low":
      return 1;

    default:
      return 1;
  }
}

function getPeopleTrapped(
  incident: Incident,
): number {
  return (
    (
      incident as Incident & {
        peopleTrapped?: number;
      }
    ).peopleTrapped ?? 0
  );
}

function needsMedicalAssistance(
  incident: Incident,
): boolean {
  return (
    (
      incident as Incident & {
        medicalAssistance?: boolean;
      }
    ).medicalAssistance ?? false
  );
}

/* =========================================================
   ACTION PLAN
========================================================= */

export interface ActionPlanStep {
  step: number;
  emoji: string;
  action: string;
}

export interface AIActionPlan {
  immediateActions: {
    step: number;
    emoji: string;
    action: string;
  }[];

  escalation: boolean;
}

export function generateActionPlan(
  incident: Incident,
): AIActionPlan {
  const actions: AIActionPlan['immediateActions'] = [];

  const severity =
    incident.severity;

  const type =
    incident.type;

  let step = 1;

  /*
   * Immediate safety action
   */
  actions.push({
    step: step++,
    emoji: '🚨',
    action:
      'Verify the incident location and establish a safe response perimeter.',
  });

  /*
   * Severity-based response
   */
  if (
    severity === 'critical' ||
    severity === 'high'
  ) {
    actions.push({
      step: step++,
      emoji: '⚠️',
      action:
        'Activate priority emergency response and coordinate available response teams.',
    });
  } else {
    actions.push({
      step: step++,
      emoji: '📋',
      action:
        'Verify incident information and assign the appropriate response resources.',
    });
  }

  /*
   * Incident-specific actions
   */
  switch (type) {
    case 'fire':
      actions.push({
        step: step++,
        emoji: '🔥',
        action:
          'Dispatch fire and rescue personnel and assess evacuation requirements.',
      });
      break;

    case 'flood':
      actions.push({
        step: step++,
        emoji: '🌊',
        action:
          'Assess affected areas, identify trapped people, and coordinate rescue resources.',
      });
      break;

    case 'accident':
    case 'road':
      actions.push({
        step: step++,
        emoji: '🚑',
        action:
          'Secure the accident area and coordinate medical and traffic response.',
      });
      break;

    case 'medical':
      actions.push({
        step: step++,
        emoji: '🏥',
        action:
          'Prioritize medical assistance and coordinate emergency medical resources.',
      });
      break;

    case 'chemical':
      actions.push({
        step: step++,
        emoji: '☣️',
        action:
          'Restrict access to the affected area and request specialized hazardous-material response.',
      });
      break;

    case 'structural':
    case 'infrastructure':
      actions.push({
        step: step++,
        emoji: '🏗️',
        action:
          'Secure the structure and assess risks before allowing responders to enter.',
      });
      break;

    default:
      actions.push({
        step: step++,
        emoji: '🛡️',
        action:
          'Assess hazards and coordinate the appropriate emergency response team.',
      });
      break;
  }

  /*
   * General monitoring
   */
  actions.push({
    step: step++,
    emoji: '📡',
    action:
      'Monitor incident status and update the response plan as new information arrives.',
  });

  return {
    immediateActions: actions,
    escalation:
      severity === 'critical',
  };
}

export function detectEscalation(
  incident: Incident,
): {
  shouldEscalate: boolean;
  delayMinutes: number;
} {
  const shouldEscalate =
    incident.severity === "critical" ||
    getIncidentPriority(incident) >= 4 ||
    getPeopleTrapped(incident) > 0 ||
    (
      needsMedicalAssistance(incident) &&
      incident.peopleAffected >= 5
    );

  return {
    shouldEscalate,
    delayMinutes: shouldEscalate ? 10 : 0,
  };
}

/* =========================================================
   HOSPITAL ALLOCATION
========================================================= */

export interface HospitalAllocation {
  hospital: Hospital;
  patients: number;
}

/**
 * Preserve the old HospitalAllocation shape expected
 * by Hospitals.tsx.
 */
export function allocateHospitals(
  peopleAffected: number,
  hospitals: Hospital[],
): HospitalAllocation[] {
  if (
    peopleAffected <= 0 ||
    hospitals.length === 0
  ) {
    return [];
  }

  const availableHospitals =
    hospitals.filter(
      (hospital) =>
        hospital.status ===
        "available",
    );

  if (
    availableHospitals.length === 0
  ) {
    return [];
  }

  const allocations:
    HospitalAllocation[] = [];

  let remaining =
    peopleAffected;

  for (
    let i = 0;
    i <
    availableHospitals.length &&
    remaining > 0;
    i++
  ) {
    const hospital =
      availableHospitals[i];

    const remainingHospitals =
      availableHospitals.length -
      i;

    const patients =
      Math.ceil(
        remaining /
        remainingHospitals,
      );

    allocations.push({
      hospital,
      patients,
    });

    remaining -= patients;
  }

  return allocations;
}

/* =========================================================
   BACKWARD-COMPATIBILITY HELPERS
========================================================= */

/**
 * These functions are intentionally kept because some
 * older parts of the UI may still import them.
 *
 * They are no longer responsible for the main Gemini
 * analysis path.
 */

export function classifyIncident(
  description: string,
): IncidentType {
  const text =
    description.toLowerCase();

  if (
    text.includes("fire") ||
    text.includes("flame") ||
    text.includes("smoke")
  ) {
    return "fire";
  }

  if (
    text.includes("flood") ||
    text.includes("water")
  ) {
    return "flood";
  }

  if (
    text.includes("accident") ||
    text.includes("collision") ||
    text.includes("crash")
  ) {
    return "accident";
  }

  if (
    text.includes("medical") ||
    text.includes("injury") ||
    text.includes("unconscious")
  ) {
    return "medical";
  }

  if (
    text.includes("chemical") ||
    text.includes("gas") ||
    text.includes("toxic")
  ) {
    return "chemical";
  }

  if (
    text.includes("road") ||
    text.includes("traffic")
  ) {
    return "road";
  }

  if (
    text.includes("building") ||
    text.includes("collapse") ||
    text.includes("structure")
  ) {
    return "structural";
  }

  return "other";
}

/**
 * Compatibility wrapper.
 */
export function calculateIntensity(
  type: IncidentType,
  peopleAffected: number,
  description: string,
  priority = 1,
): {
  severity: Severity;
  score: number;
} {
  const text =
    description.toLowerCase();

  let score =
    priority * 20;

  if (
    peopleAffected >= 10
  ) {
    score += 20;
  } else if (
    peopleAffected >= 5
  ) {
    score += 10;
  }

  if (
    text.includes("trapped") ||
    text.includes("critical") ||
    text.includes("major")
  ) {
    score += 20;
  }

  score = Math.min(
    100,
    score,
  );

  let severity: Severity =
    "low";

  if (score >= 80) {
    severity = "critical";
  } else if (score >= 60) {
    severity = "high";
  } else if (score >= 35) {
    severity = "medium";
  }

  return {
    severity,
    score,
  };
}

/**
 * Compatibility confidence calculation.
 */
export function calculateConfidence(
  _type: IncidentType,
  _peopleAffected: number,
  _priority: number,
  _source: string,
): number {
  return 100;
}

/**
 * Compatibility duplicate detector.
 */
export function detectDuplicates(
  description: string,
  existingIncidents: Incident[],
): {
  count: number;
  incidents: Incident[];
} {
  const text =
    description
      .toLowerCase()
      .trim();

  const words =
    text
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 4,
      );

  const matches =
    existingIncidents.filter(
      (incident) => {
        const incidentText =
          `${incident.title} ${incident.description}`
            .toLowerCase();

        const matchingWords =
          words.filter(
            (word) =>
              incidentText.includes(
                word,
              ),
          );

        return (
          matchingWords.length >=
          Math.min(2, words.length)
        );
      },
    );

  return {
    count: matches.length,
    incidents: matches,
  };
}

/**
 * Compatibility risk-factor generator.
 */
export function generateRiskFactors(
  type: IncidentType,
  peopleAffected: number,
  description: string,
  duplicateCount: number,
  source: string,
): string[] {
  const risks: string[] = [];

  const text =
    description.toLowerCase();

  if (
    peopleAffected >= 10
  ) {
    risks.push(
      "Large number of people affected",
    );
  }

  if (
    text.includes("trapped")
  ) {
    risks.push(
      "People may be trapped",
    );
  }

  if (
    type === "fire"
  ) {
    risks.push(
      "Potential fire spread",
    );
  }

  if (
    type === "chemical"
  ) {
    risks.push(
      "Potential hazardous-material exposure",
    );
  }

  if (
    type === "flood"
  ) {
    risks.push(
      "Potential water-related access hazards",
    );
  }

  if (
    duplicateCount > 0
  ) {
    risks.push(
      "Possible duplicate emergency reports",
    );
  }

  if (
    source === "sensor" ||
    source === "iot"
  ) {
    risks.push(
      "Incident originated from an automated source",
    );
  }

  return risks;
}

/**
 * Compatibility resource recommendation.
 */
export function recommendResources(
  _type: IncidentType,
  _score: number,
  availableResources: Resource[],
  _coordinates?: {
    lat: number;
    lng: number;
  },
): RecommendedResource[] {
  return availableResources
    .filter(
      (resource) =>
        resource.status === "available",
    )
    .slice(0, 5)
    .map((resource) => ({
      resourceId: resource.id,
      resourceType:
        resource.type as ResourceType,
      quantity: 1,
      reason:
        "Available emergency resource.",
      distance: 0,
      eta: 0,
      aiRecommended: true,
    }));
}