import mongoose from "mongoose";
export type IncidentType = "fire" | "flood" | "accident" | "medical" | "chemical" | "structural" | "road" | "other";
export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "reported" | "verified" | "assigned" | "en_route" | "on_scene" | "rescue_in_progress" | "resolved" | "closed";
export type IncidentSource = "citizen" | "field_team" | "sensor" | "admin" | "system";
export interface IIncident {
    incidentId: string;
    type: IncidentType;
    title: string;
    description: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
    priority: number;
    location: {
        address?: string;
        latitude: number;
        longitude: number;
    };
    peopleAffected: number;
    peopleTrapped: number;
    medicalAssistance: boolean;
    source: IncidentSource;
    assignedTeams?: mongoose.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}
declare const Incident: mongoose.Model<IIncident, {}, {}, {}, mongoose.Document<unknown, {}, IIncident, {}, mongoose.DefaultSchemaOptions> & IIncident & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IIncident>;
export default Incident;
//# sourceMappingURL=Incident.d.ts.map