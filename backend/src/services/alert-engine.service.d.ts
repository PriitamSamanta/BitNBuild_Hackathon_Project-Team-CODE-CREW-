export declare const createCriticalIncidentAlert: (incidentId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/Alert.js").IAlert, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Alert.js").IAlert & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const checkDelayedResponses: () => Promise<void>;
export declare const checkEscalations: () => Promise<void>;
//# sourceMappingURL=alert-engine.service.d.ts.map