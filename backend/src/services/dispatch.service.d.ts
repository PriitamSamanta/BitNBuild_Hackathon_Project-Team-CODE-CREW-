export declare const dispatchTeams: (incidentId: string, teamIds: string[]) => Promise<{
    incident: (import("mongoose").Document<unknown, {}, import("../models/Incident.js").IIncident, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Incident.js").IIncident & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null;
    teams: (import("mongoose").Document<unknown, {}, import("../models/Team.js").ITeam, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Team.js").ITeam & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[];
}>;
//# sourceMappingURL=dispatch.service.d.ts.map