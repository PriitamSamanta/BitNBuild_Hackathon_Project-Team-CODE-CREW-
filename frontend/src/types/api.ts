export type ApiIncidentType =
    | "fire"
    | "flood"
    | "accident"
    | "medical"
    | "chemical"
    | "structural"
    | "road"
    | "other";

export type ApiIncidentSeverity =
    | "low"
    | "medium"
    | "high"
    | "critical";

export type ApiIncidentStatus =
    | "reported"
    | "verified"
    | "assigned"
    | "en_route"
    | "on_scene"
    | "rescue_in_progress"
    | "resolved"
    | "closed";

export type ApiIncidentSource =
    | "citizen"
    | "field_team"
    | "sensor"
    | "admin"
    | "system";

export type ApiTeamType =
    | "fire"
    | "medical"
    | "police"
    | "rescue"
    | "disaster_response";

export type ApiTeamStatus =
    | "available"
    | "busy"
    | "en_route"
    | "on_scene"
    | "offline";

export type ApiAlertType =
    | "critical_incident"
    | "response_delay"
    | "escalation"
    | "resource_shortage";

export type ApiAlertSeverity =
    | "info"
    | "warning"
    | "critical";

export type ApiAlertStatus =
    | "active"
    | "acknowledged"
    | "resolved";

export interface ApiLocation {
    address?: string;
    latitude: number;
    longitude: number;
}

export interface ApiIncident {
    _id: string;
    incidentId: string;

    type: ApiIncidentType;
    title: string;
    description: string;

    severity: ApiIncidentSeverity;
    status: ApiIncidentStatus;
    priority: number;

    location: ApiLocation;

    peopleAffected: number;
    peopleTrapped: number;
    medicalAssistance: boolean;

    source: ApiIncidentSource;

    assignedTeams: Array<
        | string
        | {
            _id: string;
            teamId: string;
            name: string;
            type: ApiTeamType;
            status: ApiTeamStatus;
        }
    >;

    createdAt: string;
    updatedAt: string;
}

export interface ApiTeam {
    _id: string;
    teamId: string;

    name: string;
    type: ApiTeamType;
    status: ApiTeamStatus;

    location: ApiLocation;

    members: string[];
    capabilities: string[];

    contactNumber?: string;
    currentIncident?: {
        _id: string;
        incidentId: string;
        type: ApiIncidentType;
        title: string;
        description: string;
        severity: ApiIncidentSeverity;
        status: ApiIncidentStatus;
        priority: number;
        location: ApiLocation;
        peopleAffected: number;
        peopleTrapped: number;
        medicalAssistance: boolean;
        source: ApiIncidentSource;
        assignedTeams: string[];
        createdAt: string;
        updatedAt: string;
    };

    createdAt: string;
    updatedAt: string;
}

export interface ApiAlertMetadata {
    delayMinutes?: number;
    previousSeverity?: string;
    currentSeverity?: string;
    requiredResource?: string;
}

export interface ApiAlert {
    _id: string;
    alertId: string;

    type: ApiAlertType;
    severity: ApiAlertSeverity;

    title: string;
    message: string;

    incidentId?: string;

    status: ApiAlertStatus;

    metadata?: ApiAlertMetadata;

    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}