import type { IncidentType } from "../models/Incident.js";
interface DuplicateCheckInput {
    description: string;
    latitude: number;
    longitude: number;
    type?: IncidentType;
}
interface DuplicateCandidate {
    incidentId: string;
    mongoId: string;
    type: IncidentType;
    title: string;
    severity: string;
    distanceKm: number;
    createdAt: Date | undefined;
    score: number;
}
export declare const findDuplicateIncidents: (input: DuplicateCheckInput) => Promise<DuplicateCandidate[]>;
export {};
//# sourceMappingURL=duplicate-detection.service.d.ts.map