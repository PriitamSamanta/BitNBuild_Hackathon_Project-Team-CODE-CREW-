// ================================
// RES-Q Frontend Shared Types
// ================================

export type IncidentType =
  | 'fire'
  | 'accident'
  | 'flood'
  | 'medical'
  | 'chemical'
  | 'infrastructure';

export type Severity =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type IncidentSource =
  | 'citizen'
  | 'call'
  | 'iot'
  | 'field'
  | 'hospital'
  | 'government';

export type IncidentStatus =
  | 'verified'
  | 'responding'
  | 'resolved';

export type ResourceType =
  | 'fire-tender'
  | 'ambulance'
  | 'rescue-team'
  | 'drone'
  | 'rescue-boat'
  | 'medical-kit'
  | 'fire-equipment';

export type ResourceStatus =
  | 'available'
  | 'dispatched'
  | 'busy'
  | 'offline';

export type TeamStatus =
  | 'available'
  | 'en-route'
  | 'on-scene'
  | 'offline';

export type TeamType =
  | IncidentType
  | 'general';

export type HospitalStatus =
  | 'available'
  | 'busy'
  | 'full';

export type NotificationType =
  | 'critical'
  | 'warning'
  | 'info'
  | 'success'
  | 'ai';

export type AlertStatus =
  | 'pending'
  | 'sent'
  | 'acknowledged';

export type ChatRole =
  | 'user'
  | 'assistant';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TimelineEvent {
  time: string;
  event: string;
  icon: string;
}

export interface RecommendedResource {
  resourceId: string;
  distance: number;
  eta: number;
  aiRecommended: boolean;
}

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  location: string;
  coordinates?: Coordinates;

  severity: Severity;
  score: number;
  confidence: number;

  source: IncidentSource;
  peopleAffected: number;

  status: IncidentStatus;

  assignedTeams: string[];
  recommendedResources: RecommendedResource[];

  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;

  description: string;

  timeline: TimelineEvent[];

  duplicateReports: number;
  riskFactors: string[];

  escalationLevel: number;

  expectedArrival?: string;
}

export interface Resource {
  id: string;
  type: ResourceType;
  status: ResourceStatus;

  coordinates: Coordinates;

  assignedIncident?: string;
  eta?: number;
}

export interface Team {
  id: string;
  name: string;

  type: TeamType;
  status: TeamStatus;

  vehicle: string;

  coordinates: Coordinates;

  assignedIncident?: string;
  destination?: string;
  eta?: number;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;

  coordinates: Coordinates;

  emergencyBeds: number;
  icuBeds: number;
  ambulance: number;

  distance: number;

  status: HospitalStatus;
}

export interface Notification {
  id: string;

  type: NotificationType;
  title: string;
  message: string;

  incidentId?: string;

  read: boolean;
  timestamp: string;
}

export interface Alert {
  id: string;

  title: string;
  message: string;
  targets: string[];

  notified: number;
  acknowledged: number;

  status: AlertStatus;
  timestamp: string;
}

export interface ChatMessage {
  id: string;

  role: ChatRole;
  content: string;

  timestamp: string;
}

// ========================================
// Incident metadata
// ========================================

export const INCIDENT_TYPE_META: Record<
  IncidentType,
  {
    label: string;
    emoji: string;
    color: string;
  }
> = {
  fire: {
    label: 'Fire',
    emoji: '🔥',
    color: '#EF4444',
  },

  accident: {
    label: 'Accident',
    emoji: '🚗',
    color: '#F59E0B',
  },

  flood: {
    label: 'Flood',
    emoji: '🌊',
    color: '#3B82F6',
  },

  medical: {
    label: 'Medical',
    emoji: '🚑',
    color: '#10B981',
  },

  chemical: {
    label: 'Chemical',
    emoji: '☣️',
    color: '#A855F7',
  },

  infrastructure: {
    label: 'Infrastructure',
    emoji: '🏗️',
    color: '#64748B',
  },
};

// ========================================
// Severity metadata
// ========================================

export const SEVERITY_META: Record<
  Severity,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  low: {
    label: 'Low',
    color: '#10B981',
    bgColor: '#10B98120',
    borderColor: '#10B98150',
  },

  medium: {
    label: 'Medium',
    color: '#F59E0B',
    bgColor: '#F59E0B20',
    borderColor: '#F59E0B50',
  },

  high: {
    label: 'High',
    color: '#F97316',
    bgColor: '#F9731620',
    borderColor: '#F9731650',
  },

  critical: {
    label: 'Critical',
    color: '#EF233C',
    bgColor: '#EF233C20',
    borderColor: '#EF233C50',
  },
};

// ========================================
// Incident status metadata
// ========================================

export const STATUS_META: Record<
  IncidentStatus,
  {
    label: string;
    color: string;
  }
> = {
  verified: {
    label: 'Verified',
    color: '#3B82F6',
  },

  responding: {
    label: 'Responding',
    color: '#F59E0B',
  },

  resolved: {
    label: 'Resolved',
    color: '#10B981',
  },
};

// ========================================
// Incident source metadata
// ========================================

export const SOURCE_META: Record<
  IncidentSource,
  {
    label: string;
    color: string;
  }
> = {
  citizen: {
    label: 'Citizen',
    color: '#3B82F6',
  },

  call: {
    label: 'Emergency Call',
    color: '#EF4444',
  },

  iot: {
    label: 'IoT Sensor',
    color: '#A855F7',
  },

  field: {
    label: 'Field Team',
    color: '#10B981',
  },

  hospital: {
    label: 'Hospital',
    color: '#06B6D4',
  },

  government: {
    label: 'Government',
    color: '#64748B',
  },
};

// ========================================
// Resource metadata
// ========================================

export const RESOURCE_TYPE_META: Record<
  ResourceType,
  {
    label: string;
    emoji: string;
  }
> = {
  'fire-tender': {
    label: 'Fire Tender',
    emoji: '🚒',
  },

  ambulance: {
    label: 'Ambulance',
    emoji: '🚑',
  },

  'rescue-team': {
    label: 'Rescue Team',
    emoji: '👨‍🚒',
  },

  drone: {
    label: 'Drone',
    emoji: '🛸',
  },

  'rescue-boat': {
    label: 'Rescue Boat',
    emoji: '🚤',
  },

  'medical-kit': {
    label: 'Medical Kit',
    emoji: '🩺',
  },

  'fire-equipment': {
    label: 'Fire Equipment',
    emoji: '🧯',
  },
};

// ========================================
// Team status metadata
// ========================================

export const TEAM_STATUS_META: Record<
  TeamStatus,
  {
    label: string;
    color: string;
  }
> = {
  available: {
    label: 'Available',
    color: '#10B981',
  },

  'en-route': {
    label: 'En Route',
    color: '#3B82F6',
  },

  'on-scene': {
    label: 'On Scene',
    color: '#F59E0B',
  },

  offline: {
    label: 'Offline',
    color: '#64748B',
  },
};

// ========================================
// Default map center
// ========================================

export const CITY_CENTER: Coordinates = {
  lat: 22.3072,
  lng: 73.1812,
};
