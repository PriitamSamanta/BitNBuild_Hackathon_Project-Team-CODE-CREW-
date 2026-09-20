import type { IncidentSeverity, IncidentStatus, IncidentType, IncidentSource } from "../models/Incident.js";
interface CreateIncidentData {
    type: IncidentType;
    title: string;
    description: string;
    severity?: IncidentSeverity;
    status?: IncidentStatus;
    priority?: number;
    location: {
        address?: string;
        latitude: number;
        longitude: number;
    };
    peopleAffected?: number;
    peopleTrapped?: number;
    medicalAssistance?: boolean;
    source: IncidentSource;
}
export declare const createIncident: (data: CreateIncidentData) => Promise<import("mongoose").Document<unknown, {}, import("../models/Incident.js").IIncident, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Incident.js").IIncident & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}>;
export declare const getIncidents: () => Promise<(import("mongoose").Document<unknown, {}, import("../models/Incident.js").IIncident, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Incident.js").IIncident & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
})[]>;
export declare const getIncidentById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/Incident.js").IIncident, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Incident.js").IIncident & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const updateIncident: (id: string, data: Partial<CreateIncidentData>) => Promise<(import("mongoose").Document<unknown, {}, import("../models/Incident.js").IIncident, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Incident.js").IIncident & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const deleteIncident: (id: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/Incident.js").IIncident, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Incident.js").IIncident & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | null>;
export {};
//# sourceMappingURL=incident.service.d.ts.map