import { type AlertSeverity, type AlertType } from "../models/Alert.js";
interface CreateAlertInput {
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    incidentId?: string;
    metadata?: {
        delayMinutes?: number;
        previousSeverity?: string;
        currentSeverity?: string;
        requiredResource?: string;
    };
}
export declare const createAlert: (data: CreateAlertInput) => Promise<import("mongoose").Document<unknown, {}, import("../models/Alert.js").IAlert, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Alert.js").IAlert & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}>;
export declare const getAllAlerts: () => Promise<(import("mongoose").Document<unknown, {}, import("../models/Alert.js").IAlert, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Alert.js").IAlert & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
})[]>;
export declare const getAlertById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/Alert.js").IAlert, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Alert.js").IAlert & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const acknowledgeAlert: (id: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/Alert.js").IAlert, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Alert.js").IAlert & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}>;
export declare const resolveAlert: (id: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/Alert.js").IAlert, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Alert.js").IAlert & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}>;
export {};
//# sourceMappingURL=alert.service.d.ts.map