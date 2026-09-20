export type IncidentCategory =
  | 'fire'
  | 'accident'
  | 'flood'
  | 'medical'
  | 'chemical'
  | 'infrastructure'
  | 'natural'
  | 'other';

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';

export type IncidentStatus =
  | 'submitted'
  | 'ai_analyzed'
  | 'dispatched'
  | 'en_route'
  | 'on_scene'
  | 'resolved';

export type ReportMode = 'photo' | 'gallery' | 'voice';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address?: string;
  accuracyMeters?: number;
  area?: string;
}

export interface IncidentAttachment {
  id: string;
  type: 'image' | 'audio';
  url: string;
  name: string;
  sizeBytes?: number;
  durationSeconds?: number;
}

export interface CitizenReportPayload {
  mode: ReportMode;
  category?: IncidentCategory;
  description?: string;
  location: LocationCoordinates;
  attachment?: IncidentAttachment;
  reportedAt: string;
  anonymous: boolean;
  contactNumber?: string;
}

export interface CitizenIncident {
  id: string; // e.g. "RESQ-2026-8491"
  trackingCode: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  location: LocationCoordinates;
  createdAt: string;
  updatedAt: string;
  attachments?: IncidentAttachment[];
  assignedTeam?: {
    id: string;
    name: string;
    unitType: 'fire_engine' | 'ambulance' | 'tactical_rescue' | 'police_unit';
    etaMinutes: number;
    phone?: string;
  };
  aiAnalysis?: {
    detectedCategory: IncidentCategory;
    confidenceScore: number;
    suggestedSeverity: IncidentSeverity;
    summary: string;
    hazardKeywords: string[];
  };
  timeline: {
    status: IncidentStatus;
    title: string;
    description: string;
    timestamp: string;
  }[];
}

// Re-export as Incident for citizen module compatibility
export type Incident = CitizenIncident;

export interface SafetyTipItem {
  id: string;
  category: IncidentCategory | 'general';
  title: string;
  icon: string;
  description: string;
  actionItems: string[];
  emergencyNumber?: string;
}

export interface EmergencyContact {
  id: string;
  title: string;
  number: string;
  description: string;
  badgeColor?: string;
  availableHours?: string;
}
