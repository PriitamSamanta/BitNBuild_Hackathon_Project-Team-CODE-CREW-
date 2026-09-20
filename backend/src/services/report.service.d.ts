interface CreateReportData {
    description: string;
    type?: string;
    location: {
        address?: string;
        latitude: number;
        longitude: number;
    };
    peopleAffected?: number;
    peopleTrapped?: number;
    medicalAssistance?: boolean;
    reporterName?: string;
    reporterPhone?: string;
    source?: "citizen" | "field_team" | "sensor";
}
export declare const createReport: (data: CreateReportData) => Promise<{
    report: import("mongoose").Document<unknown, {}, import("../models/Report.js").IReport, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Report.js").IReport & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    };
    incident: import("mongoose").Document<unknown, {}, import("../models/Incident.js").IIncident, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Incident.js").IIncident & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    };
    aiAnalysis: import("./ai.service.js").IncidentAnalysis;
    duplicate: boolean;
    duplicateScore: number;
} | {
    duplicate?: never;
    duplicateScore?: never;
    report: import("mongoose").Document<unknown, {}, import("../models/Report.js").IReport, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Report.js").IReport & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    };
    incident: import("mongoose").Document<unknown, {}, import("../models/Incident.js").IIncident, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Incident.js").IIncident & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    };
    aiAnalysis: import("./ai.service.js").IncidentAnalysis;
}>;
export declare const getReports: () => Promise<(import("mongoose").Document<unknown, {}, import("../models/Report.js").IReport, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Report.js").IReport & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
})[]>;
export declare const getReportById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/Report.js").IReport, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Report.js").IReport & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const updateReport: (id: string, data: Record<string, unknown>) => Promise<(import("mongoose").Document<unknown, {}, import("../models/Report.js").IReport, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Report.js").IReport & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | null>;
export {};
//# sourceMappingURL=report.service.d.ts.map