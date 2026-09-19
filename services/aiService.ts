import type {
  Incident,
  IncidentType,
  Severity,
  Resource,
  ResourceType,
  RecommendedResource,
  Team,
  Hospital,
} from '@/src/types';
import { INCIDENT_TYPE_META } from '@/src/types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface AIAnalysisResult {
  type: IncidentType;
  severity: Severity;
  score: number;
  confidence: number;
  peopleAffected: number;
  riskFactors: string[];
  recommendedResources: RecommendedResource[];
  duplicateReports: number;
}

const KEYWORDS: Record<IncidentType, string[]> = {
  fire: ['fire', 'smoke', 'flames', 'burning', 'blaze', 'warehouse', 'industrial'],
  accident: ['accident', 'crash', 'collision', 'vehicle', 'car', 'truck', 'highway'],
  flood: ['flood', 'water', 'rising', 'river', 'overflow', 'rain', 'submerge'],
  medical: ['medical', 'cardiac', 'heart', 'injury', 'unconscious', 'bleeding', 'patient', 'stroke'],
  chemical: ['chemical', 'spill', 'gas', 'toxic', 'hazard', 'leak', 'fume'],
  infrastructure: ['collapse', 'building', 'bridge', 'road', 'crack', 'structure', 'infrastructure'],
};

export function classifyIncident(description: string): IncidentType {
  const lower = description.toLowerCase();
  let bestType: IncidentType = 'fire';
  let bestScore = 0;
  (Object.keys(KEYWORDS) as IncidentType[]).forEach((type) => {
    const score = KEYWORDS[type].reduce(
      (acc, kw) => acc + (lower.includes(kw) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      bestType = type;
    }
  });
  return bestType;
}

export function calculateIntensity(
  type: IncidentType,
  peopleAffected: number,
  description: string,
  duplicateReports: number,
): { severity: Severity; score: number } {
  const lower = description.toLowerCase();
  let score = 30;

  score += Math.min(peopleAffected * 3, 35);
  if (lower.match(/spreading|rapid|large|massive|huge|major/)) score += 15;
  if (lower.match(/trapped|stuck|inside/)) score += 10;
  if (lower.match(/industrial|warehouse|factory|chemical|gas/)) score += 10;
  if (lower.match(/highway|traffic|multi/)) score += 8;
  if (lower.match(/cardiac|stroke|critical|unconscious/)) score += 12;
  if (lower.match(/collapse|structural/)) score += 8;
  score += Math.min(duplicateReports * 3, 12);

  score = Math.min(Math.max(score, 5), 100);

  let severity: Severity = 'low';
  if (score > 75) severity = 'critical';
  else if (score > 50) severity = 'high';
  else if (score > 25) severity = 'medium';

  return { severity, score };
}

export function calculateConfidence(
  type: IncidentType,
  peopleAffected: number,
  duplicateReports: number,
  source: string,
): number {
  let conf = 70;
  if (duplicateReports > 1) conf += duplicateReports * 5;
  if (source === 'iot') conf += 10;
  if (source === 'field') conf += 8;
  if (source === 'call') conf += 5;
  if (peopleAffected > 0) conf += 5;
  if (peopleAffected > 10) conf += 5;
  return Math.min(conf, 98);
}

export function detectDuplicates(
  newDesc: string,
  existingIncidents: Incident[],
): { isDuplicate: boolean; matchId?: string; count: number } {
  const lower = newDesc.toLowerCase();
  for (const inc of existingIncidents) {
    if (inc.status === 'resolved') continue;
    const words = inc.description.toLowerCase().split(/\s+/);
    const overlap = words.filter((w) => w.length > 4 && lower.includes(w)).length;
    if (overlap >= 3) {
      return { isDuplicate: true, matchId: inc.id, count: inc.duplicateReports + 1 };
    }
  }
  return { isDuplicate: false, count: 1 };
}

export function generateRiskFactors(
  type: IncidentType,
  peopleAffected: number,
  description: string,
  duplicateReports: number,
  source: string,
): string[] {
  const factors: string[] = [];
  const lower = description.toLowerCase();

  if (peopleAffected > 0) factors.push(`${peopleAffected} people potentially affected`);
  if (lower.match(/spreading|rapid/)) factors.push('Fire spreading');
  if (lower.match(/industrial|warehouse|factory/)) factors.push('Industrial area');
  if (duplicateReports > 1) factors.push(`${duplicateReports} reports detected`);
  if (source === 'iot') factors.push('Sensor confirmation');
  if (source === 'field') factors.push('Field team confirmation');
  if (lower.match(/trapped|stuck/)) factors.push('People trapped');
  if (lower.match(/highway|traffic/)) factors.push('Highway location');
  if (lower.match(/chemical|toxic|gas/)) factors.push('Hazardous material');
  if (lower.match(/cardiac|stroke|critical/)) factors.push('Life-threatening condition');
  if (lower.match(/collapse/)) factors.push('Structural risk');
  if (lower.match(/rising|flood|overflow/)) factors.push('Water level rising');
  if (factors.length === 0) factors.push('Initial assessment');

  return factors;
}

export function recommendResources(
  type: IncidentType,
  score: number,
  availableResources: Resource[],
  incidentCoords: { lat: number; lng: number },
): RecommendedResource[] {
  const needs: Record<IncidentType, ResourceType[]> = {
    fire: ['fire-tender', 'ambulance', 'rescue-team'],
    accident: ['ambulance', 'rescue-team'],
    flood: ['rescue-boat', 'rescue-team', 'ambulance'],
    medical: ['ambulance', 'medical-kit'],
    chemical: ['fire-tender', 'ambulance', 'rescue-team'],
    infrastructure: ['rescue-team', 'ambulance'],
  };

  const requiredTypes = needs[type];
  const count = score > 75 ? 3 : score > 50 ? 2 : 1;
  const recommendations: RecommendedResource[] = [];

  requiredTypes.slice(0, count).forEach((rType, idx) => {
    const candidates = availableResources
      .filter((r) => r.type === rType && r.status === 'available')
      .map((r) => ({
        resource: r,
        distance: haversine(
          incidentCoords.lat,
          incidentCoords.lng,
          r.coordinates.lat,
          r.coordinates.lng,
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    if (candidates.length > 0) {
      const best = candidates[0];
      recommendations.push({
        resourceId: best.resource.id,
        distance: parseFloat(best.distance.toFixed(1)),
        eta: Math.max(2, Math.round(best.distance * 1.5)),
        aiRecommended: idx === 0,
      });
    }
  });

  return recommendations;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface ActionPlan {
  immediateActions: { step: number; emoji: string; action: string }[];
  escalation: string;
}

export function generateActionPlan(incident: Incident): ActionPlan {
  const actions: { step: number; emoji: string; action: string }[] = [];
  const typeMeta = INCIDENT_TYPE_META[incident.type];

  let step = 1;
  if (incident.type === 'fire' || incident.type === 'chemical') {
    actions.push({ step: step++, emoji: '🚒', action: `Dispatch ${incident.score > 75 ? 2 : 1} Fire Tender(s)` });
  }
  if (incident.peopleAffected > 0 || incident.score > 50) {
    actions.push({ step: step++, emoji: '🚑', action: `Dispatch ${incident.score > 75 ? 2 : 1} Ambulance(s)` });
  }
  actions.push({ step: step++, emoji: '👨‍🚒', action: 'Deploy Rescue Team' });
  if (incident.type === 'accident' || incident.type === 'fire') {
    actions.push({ step: step++, emoji: '👮', action: 'Activate Traffic Control' });
  }
  actions.push({ step: step++, emoji: '🏥', action: 'Notify Nearby Hospital' });
  if (incident.score > 80) {
    actions.push({ step: step++, emoji: '🚨', action: 'Consider Zone Evacuation' });
  }
  if (incident.type === 'chemical') {
    actions.push({ step: step++, emoji: '☣', action: 'Activate Hazmat Protocol' });
  }
  if (incident.type === 'flood') {
    actions.push({ step: step++, emoji: '🚤', action: 'Deploy Rescue Boats' });
  }

  return {
    immediateActions: actions,
    escalation: `If no team arrives within ${incident.score > 75 ? 8 : 12} minutes:\n→ Notify supervisor\n→ Recommend backup team`,
  };
}

export function generateSummary(incidents: Incident[], teams: Team[], resources: Resource[]): string {
  const active = incidents.filter((i) => i.status !== 'resolved');
  const critical = active.filter((i) => i.severity === 'critical');
  const topPriority = active.sort((a, b) => b.score - a.score)[0];
  const activeTeams = teams.filter((t) => t.status === 'en-route' || t.status === 'on-scene');
  const delayed = teams.filter((t) => t.status === 'en-route' && (t.eta ?? 0) > 8);

  let summary = `There are currently ${active.length} active incidents.\n\n`;
  if (critical.length > 0) {
    summary += `${critical.length} of these are critical.\n\n`;
  }
  if (topPriority) {
    summary += `The highest priority is Incident #${topPriority.id},\n`;
    summary += `a ${INCIDENT_TYPE_META[topPriority.type].label.toLowerCase()} at ${topPriority.location}.\n\n`;
    summary += `Severity:\n${topPriority.score}/100\n\n`;
  }
  summary += `${activeTeams.length} teams are currently responding.\n\n`;
  if (delayed.length > 0) {
    summary += `${delayed.length} response team${delayed.length > 1 ? 's are' : ' is'} delayed.\n`;
  }
  return summary;
}

export function detectEscalation(incident: Incident): { shouldEscalate: boolean; delayMinutes: number; level: number } {
  if (incident.status === 'resolved' || !incident.expectedArrival) {
    return { shouldEscalate: false, delayMinutes: 0, level: 0 };
  }
  const [expM, expS] = incident.expectedArrival.split(':').map(Number);
  const expectedSec = expM * 60 + expS;
  const elapsedMin = Math.floor((Date.now() - new Date(incident.createdAt).getTime()) / 60000);
  const delayMin = Math.max(0, elapsedMin - Math.floor(expectedSec / 60));

  if (delayMin > 3) {
    const level = delayMin > 8 ? 3 : delayMin > 5 ? 2 : 1;
    return { shouldEscalate: true, delayMinutes: delayMin, level };
  }
  return { shouldEscalate: false, delayMinutes: 0, level: 0 };
}

export function allocateHospitals(
  patients: number,
  hospitals: Hospital[],
): { hospital: Hospital; patients: number }[] {
  const available = hospitals.filter((h) => h.status !== 'full' && h.emergencyBeds > 0);
  const sorted = [...available].sort((a, b) => b.emergencyBeds - a.emergencyBeds);
  const allocation: { hospital: Hospital; patients: number }[] = [];
  let remaining = patients;

  for (const h of sorted) {
    if (remaining <= 0) break;
    const assigned = Math.min(remaining, Math.ceil(h.emergencyBeds / 2));
    allocation.push({ hospital: h, patients: assigned });
    remaining -= assigned;
  }
  return allocation;
}

export async function analyzeIncident(
  description: string,
  peopleAffected: number,
  source: string,
  existingIncidents: Incident[],
  availableResources: Resource[],
  coords?: { lat: number; lng: number },
): Promise<AIAnalysisResult> {
  await delay(800 + Math.random() * 700);
  const type = classifyIncident(description);
  const { severity, score } = calculateIntensity(type, peopleAffected, description, 1);
  const confidence = calculateConfidence(type, peopleAffected, 1, source);
  const dup = detectDuplicates(description, existingIncidents);
  const riskFactors = generateRiskFactors(type, peopleAffected, description, dup.count, source);
  const recommended = coords ? recommendResources(type, score, availableResources, coords) : [];

  return {
    type,
    severity,
    score,
    confidence,
    peopleAffected,
    riskFactors,
    recommendedResources: recommended,
    duplicateReports: dup.count,
  };
}
