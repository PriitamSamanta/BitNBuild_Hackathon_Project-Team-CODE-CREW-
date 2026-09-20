import api from '@/lib/api';
import type {
  CitizenReportPayload,
  CitizenIncident,
  IncidentCategory,
  IncidentSeverity,
  SafetyTipItem,
  EmergencyContact,
} from '@/types/incident';

const LOCAL_STORAGE_KEY = 'resq_citizen_incidents';

// Seed incidents for demo and immediate tracking testing
export const SEED_CITIZEN_INCIDENTS: CitizenIncident[] = [
  {
    id: 'RESQ-2026-8491',
    trackingCode: 'RESQ-2026-8491',
    category: 'fire',
    severity: 'critical',
    status: 'en_route',
    title: 'Commercial Facility Fire',
    description: 'Heavy smoke observed rising from secondary warehouse. Structure evacuated.',
    location: {
      lat: 23.0225,
      lng: 72.5714,
      address: 'Near Iscon Crossroad, SG Highway, Ahmedabad',
      area: 'SG Highway',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    assignedTeam: {
      id: 'TEAM-FIRE-04',
      name: 'Ahmedabad Fire Brigade Unit 4',
      unitType: 'fire_engine',
      etaMinutes: 5,
      phone: '+91 79 2658 4444',
    },
    aiAnalysis: {
      detectedCategory: 'fire',
      confidenceScore: 0.96,
      suggestedSeverity: 'critical',
      summary: 'High thermal signature detected with structure proximity hazard.',
      hazardKeywords: ['smoke', 'flames', 'structure', 'evacuated'],
    },
    timeline: [
      {
        status: 'submitted',
        title: 'Report Received',
        description: 'Citizen report logged through Res-Q Portal.',
        timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      },
      {
        status: 'ai_analyzed',
        title: 'Res-Q AI Triage Completed',
        description: 'Severity escalated to Critical based on multi-source sensor correlation.',
        timestamp: new Date(Date.now() - 1000 * 60 * 16).toISOString(),
      },
      {
        status: 'dispatched',
        title: 'Emergency Team Dispatched',
        description: 'Fire Engine Unit 4 assigned from Bodakdev Fire Station.',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      },
      {
        status: 'en_route',
        title: 'Unit En Route',
        description: 'ETA 5 minutes. SG Highway green corridor cleared.',
        timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      },
    ],
  },
  {
    id: 'RESQ-2026-3102',
    trackingCode: 'RESQ-2026-3102',
    category: 'accident',
    severity: 'high',
    status: 'dispatched',
    title: 'Multi-Vehicle Traffic Incident',
    description: 'Collision between two passenger vehicles. Traffic stalled on both lanes.',
    location: {
      lat: 23.0338,
      lng: 72.5126,
      address: 'Vastrapur Lake Outer Ring Road, Ahmedabad',
      area: 'Vastrapur',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    assignedTeam: {
      id: 'TEAM-MED-12',
      name: '108 EMRI Emergency Ambulance',
      unitType: 'ambulance',
      etaMinutes: 8,
      phone: '+91 108',
    },
    aiAnalysis: {
      detectedCategory: 'accident',
      confidenceScore: 0.91,
      suggestedSeverity: 'high',
      summary: 'Traffic blockage identified with possible minor injuries.',
      hazardKeywords: ['collision', 'stalled', 'traffic', 'vehicles'],
    },
    timeline: [
      {
        status: 'submitted',
        title: 'Report Received',
        description: 'Logged via Res-Q Citizen Photo upload.',
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      },
      {
        status: 'ai_analyzed',
        title: 'Automated Routing Completed',
        description: 'Dispatched 108 EMRI paramedic squad and notified traffic control.',
        timestamp: new Date(Date.now() - 1000 * 60 * 33).toISOString(),
      },
      {
        status: 'dispatched',
        title: 'Ambulance Dispatched',
        description: 'Unit 12 en route from Drive-In Road.',
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      },
    ],
  },
];

export function getLocalCitizenIncidents(): CitizenIncident[] {
  if (typeof window === 'undefined') return SEED_CITIZEN_INCIDENTS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_CITIZEN_INCIDENTS));
      return SEED_CITIZEN_INCIDENTS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_CITIZEN_INCIDENTS;
  }
}

export function saveLocalCitizenIncidents(incidents: CitizenIncident[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(incidents));
    window.dispatchEvent(new Event('resq_incident_updated'));
  } catch (err) {
    console.error('Failed to save citizen incidents locally', err);
  }
}

export async function submitCitizenReport(payload: CitizenReportPayload): Promise<CitizenIncident> {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const trackingCode = `RESQ-2026-${randNum}`;
  const now = new Date().toISOString();

  const category: IncidentCategory = payload.category || 'other';
  let severity: IncidentSeverity = 'high';
  if (category === 'fire' || category === 'chemical') severity = 'critical';
  if (category === 'medical' || category === 'accident') severity = 'high';
  if (category === 'natural' || category === 'flood') severity = 'medium';

  const defaultUnitName =
    category === 'fire'
      ? 'Ahmedabad Fire Brigade Station 3'
      : category === 'medical'
      ? '108 EMRI Ambulance Squad #7'
      : category === 'accident'
      ? 'Ahmedabad Traffic Quick Response Unit'
      : 'Ahmedabad Civil Disaster Team';

  const unitType =
    category === 'fire'
      ? 'fire_engine'
      : category === 'medical'
      ? 'ambulance'
      : category === 'accident'
      ? 'police_unit'
      : 'tactical_rescue';

  const newIncident: CitizenIncident = {
    id: trackingCode,
    trackingCode,
    category,
    severity,
    status: 'dispatched',
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Emergency - ${payload.location.area || 'Ahmedabad'}`,
    description: payload.description || `Citizen reported emergency via ${payload.mode} intake.`,
    location: payload.location,
    createdAt: now,
    updatedAt: now,
    attachments: payload.attachment ? [payload.attachment] : undefined,
    assignedTeam: {
      id: `TEAM-${category.toUpperCase()}-01`,
      name: defaultUnitName,
      unitType,
      etaMinutes: Math.floor(4 + Math.random() * 7),
      phone: category === 'medical' ? '108' : category === 'fire' ? '101' : '112',
    },
    aiAnalysis: {
      detectedCategory: category,
      confidenceScore: 0.94,
      suggestedSeverity: severity,
      summary: `Automated triage completed from ${payload.mode} input. Responding units deployed.`,
      hazardKeywords: [category, payload.location.area || 'urban', 'priority'],
    },
    timeline: [
      {
        status: 'submitted',
        title: 'Report Received',
        description: `Citizen logged via ${payload.mode} intake mode.`,
        timestamp: now,
      },
      {
        status: 'ai_analyzed',
        title: 'Res-Q AI Triage Complete',
        description: `Severity classified as ${severity.toUpperCase()}. Priority green route established.`,
        timestamp: now,
      },
      {
        status: 'dispatched',
        title: 'Emergency Team Dispatched',
        description: `${defaultUnitName} assigned and dispatched to coordinates.`,
        timestamp: now,
      },
    ],
  };

  // 1. Save to citizen local storage
  const existing = getLocalCitizenIncidents();
  saveLocalCitizenIncidents([newIncident, ...existing]);

  // 2. Also register into AppContext shared storage (resq_frontend_state_v2) so admin sees it immediately
  if (typeof window !== 'undefined') {
    try {
      const adminStorage = localStorage.getItem('resq_frontend_state_v2');
      if (adminStorage) {
        const parsed = JSON.parse(adminStorage);
        const mappedType =
          category === 'medical'
            ? 'medical'
            : category === 'fire'
            ? 'fire'
            : category === 'accident'
            ? 'accident'
            : category === 'flood'
            ? 'flood'
            : category === 'chemical'
            ? 'chemical'
            : 'hazard';

        const adminIncident = {
          id: trackingCode,
          type: mappedType,
          title: newIncident.title,
          description: newIncident.description,
          severity: severity === 'critical' ? 'critical' : severity === 'high' ? 'high' : 'medium',
          status: 'dispatched',
          source: 'citizen',
          location: payload.location.address || 'Ahmedabad, Gujarat',
          coordinates: { lat: payload.location.lat, lng: payload.location.lng },
          reportedAt: now,
          updatedAt: now,
          reportedBy: 'Citizen Reporter (Anonymous)',
          trackingCode,
          assignedTeamss: [newIncident.assignedTeam?.name || 'Unit 1'],
          resources: ['Water Tender', 'Oxygen Kit'],
          recommendedResources: [],
          timeline: [
            { time: 'Just now', event: 'Citizen report received', icon: '📝' },
            { time: 'Just now', event: 'AI Triage completed', icon: '⚡' },
            { time: 'Just now', event: 'First response unit dispatched', icon: '🚒' },
          ],
          peopleAffected: 1,
          duplicateReports: 0,
        };

        parsed.incidents = [adminIncident, ...(parsed.incidents || []).filter((i: { id: string }) => i.id !== trackingCode)];
        localStorage.setItem('resq_frontend_state_v2', JSON.stringify(parsed));
      }
    } catch (e) {
      console.warn('Failed to sync to admin storage:', e);
    }
  }

  // 3. Post to backend if server is active
  try {
    await api.post('/api/incidents', {
      type: category === 'medical' ? 'medical' : category === 'fire' ? 'fire' : category === 'accident' ? 'accident' : 'hazard',
      title: newIncident.title,
      description: newIncident.description,
      severity: severity === 'critical' ? 'critical' : 'high',
      source: 'citizen',
      location: {
        address: payload.location.address || 'Ahmedabad',
        latitude: payload.location.lat,
        longitude: payload.location.lng,
      },
      peopleAffected: 1,
      priority: severity === 'critical' ? 5 : 4,
    });
  } catch (err) {
    console.warn('Backend /api/incidents notification fallback:', err);
  }

  // Notify listeners across app
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('resq_citizen_submitted', { detail: newIncident }));
    window.dispatchEvent(new Event('resq_incident_updated'));
  }

  return newIncident;
}

export async function trackIncidentStatus(trackingCode: string): Promise<CitizenIncident | null> {
  const clean = trackingCode.trim().toUpperCase();
  if (!clean) return null;

  // 1. Search citizen local incidents
  const citizenIncidents = getLocalCitizenIncidents();
  const matchedCitizen = citizenIncidents.find(
    (inc) =>
      inc.trackingCode.toUpperCase() === clean ||
      inc.id.toUpperCase() === clean ||
      inc.id.toUpperCase().includes(clean)
  );

  if (matchedCitizen) return matchedCitizen;

  // 2. Search Admin local storage
  if (typeof window !== 'undefined') {
    try {
      const adminStorage = localStorage.getItem('resq_frontend_state_v2');
      if (adminStorage) {
        const parsed = JSON.parse(adminStorage);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const found = (parsed.incidents || []).find((i: any) =>
          (i.trackingCode && i.trackingCode.toUpperCase() === clean) ||
          i.id.toUpperCase() === clean ||
          i.id.toUpperCase().includes(clean)
        );

        if (found) {
          return {
            id: found.id,
            trackingCode: found.trackingCode || found.id,
            category: (found.type || 'other') as IncidentCategory,
            severity: (found.severity || 'high') as IncidentSeverity,
            status: found.status === 'resolved' ? 'resolved' : 'dispatched',
            title: found.title || 'Emergency Incident',
            description: found.description || '',
            location: {
              lat: found.coordinates?.lat || 23.0225,
              lng: found.coordinates?.lng || 72.5714,
              address: found.location,
              area: 'Ahmedabad',
            },
            createdAt: found.reportedAt || new Date().toISOString(),
            updatedAt: found.updatedAt || new Date().toISOString(),
            assignedTeam: {
              id: 'TEAM-01',
              name: found.assignedTeamss?.[0] || '108 EMRI Unit',
              unitType: found.type === 'fire' ? 'fire_engine' : 'ambulance',
              etaMinutes: 6,
              phone: '112',
            },
            timeline: [
              {
                status: 'submitted',
                title: 'Report Received',
                description: 'Incident verified in Res-Q Network.',
                timestamp: found.reportedAt || new Date().toISOString(),
              },
              {
                status: 'dispatched',
                title: 'Team Dispatched',
                description: `${found.assignedTeamss?.[0] || 'Response unit'} on scene or in transit.`,
                timestamp: found.updatedAt || new Date().toISOString(),
              },
            ],
          };
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Search seed incidents
  const seedMatch = SEED_CITIZEN_INCIDENTS.find(
    (inc) =>
      inc.trackingCode.toUpperCase() === clean ||
      inc.id.toUpperCase() === clean ||
      inc.id.toUpperCase().includes(clean)
  );

  return seedMatch || null;
}

export const SAFETY_TIPS: SafetyTipItem[] = [
  {
    id: 'fire-safety',
    category: 'fire',
    title: 'What to do during a fire',
    icon: '🔥',
    description: 'Immediate protective steps if you encounter smoke, sparks, or building fire.',
    actionItems: [
      'Crawl low under smoke — the cleanest air is closest to the ground.',
      'Feel door handles before opening. If hot, DO NOT OPEN and seek an alternate exit.',
      'Never use elevators during a fire; always take designated fire stairs.',
      'Stop, Drop, and Roll if your clothing catches fire.',
      'Call Emergency 101 or 112 once you reach a safe assembly point outside.',
    ],
    emergencyNumber: '101',
  },
  {
    id: 'road-safety',
    category: 'accident',
    title: 'Road safety & collision protocol',
    icon: '🚗',
    description: 'Protect yourself and others immediately following a vehicular crash.',
    actionItems: [
      'Turn on hazard blinkers and pull to the shoulder if vehicles are drivable.',
      'Place reflective emergency triangles 50 meters behind the crash site.',
      'Do not move severely injured victims unless there is immediate risk of explosion or fire.',
      'Exchange contact/insurance details and note down license plates.',
      'Call 108 for medical ambulances and 100/112 for traffic police.',
    ],
    emergencyNumber: '108',
  },
  {
    id: 'flood-safety',
    category: 'flood',
    title: 'Flood preparedness & safety',
    icon: '🌊',
    description: 'Crucial steps during flash floods, river overflows, and severe waterlogging.',
    actionItems: [
      'Never drive through flooded roads ("Turn Around, Don\'t Drown"). Just 6 inches of moving water can knock you down.',
      'Disconnect electrical main switches and gas valves before evacuating.',
      'Move to higher floors or designated emergency shelter shelters immediately.',
      'Avoid walking in standing water due to open drains, submerged debris, and electrical leakage.',
      'Keep your phone battery conserved and tune into official NDRF/SDRF advisories.',
    ],
    emergencyNumber: '1070',
  },
  {
    id: 'chemical-safety',
    category: 'chemical',
    title: 'Chemical leak & hazardous fumes',
    icon: '☣️',
    description: 'Guidelines for industrial gas leaks, toxic fumes, or hazardous spills.',
    actionItems: [
      'Move crosswind or upwind immediately — do not run in the direction of the wind.',
      'Cover nose and mouth with a damp cloth or mask to filter airborne particulates.',
      'Shelter indoors, close all windows, doors, and shut off air conditioning / ventilation systems.',
      'Wash eyes and skin with clean running water for at least 15 minutes if exposed.',
      'Do not consume open food or water that was exposed to outdoor air.',
    ],
    emergencyNumber: '112',
  },
  {
    id: 'emergency-contacts',
    category: 'general',
    title: 'Official Emergency Directory',
    icon: '📞',
    description: 'Instant national and state emergency response contact numbers.',
    actionItems: [
      '112 - Unified National Emergency Number (Police, Fire, Ambulance)',
      '108 - EMRI Emergency Medical & Trauma Ambulance',
      '101 - Fire Brigade Services',
      '100 - Police Control Room',
      '1077 - District Disaster Management Authority (DDMA)',
    ],
    emergencyNumber: '112',
  },
];

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'all-in-one',
    title: 'National Emergency Helpline',
    number: '112',
    description: 'Unified single-number access for Police, Fire, and Ambulance emergencies.',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40',
    availableHours: '24/7 Available • Toll-Free',
  },
  {
    id: 'ambulance',
    title: 'EMRI Emergency Ambulance',
    number: '108',
    description: 'Advanced Life Support & Basic Life Support trauma ambulance dispatch.',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    availableHours: '24/7 Available • Average ETA 12 mins',
  },
  {
    id: 'fire',
    title: 'Fire & Rescue Services',
    number: '101',
    description: 'Municipal Fire Brigade and rapid rescue command operations.',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    availableHours: '24/7 Available • Heavy Equipment',
  },
  {
    id: 'police',
    title: 'Police Control Room',
    number: '100',
    description: 'Crime response, traffic management, and law enforcement support.',
    badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    availableHours: '24/7 Available • Immediate Dispatch',
  },
  {
    id: 'disaster',
    title: 'Disaster Management Helpline',
    number: '1070',
    description: 'State disaster response force (SDRF / NDRF) coordination hotline.',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    availableHours: '24/7 Available • Severe Events',
  },
];
