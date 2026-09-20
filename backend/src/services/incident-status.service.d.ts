import { type IncidentStatus } from "../models/Incident.js";
export declare const updateIncidentStatus: (incidentId: string, status: IncidentStatus) => Promise<{
    incident: (import("mongoose").Document<unknown, {}, import("../models/Incident.js").IIncident, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Incident.js").IIncident & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null;
    previousStatus: IncidentStatus;
    status: IncidentStatus;
    changed: boolean;
}>;
//# sourceMappingURL=incident-status.service.d.ts.map