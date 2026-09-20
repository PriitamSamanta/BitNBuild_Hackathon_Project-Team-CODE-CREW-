import { type TeamStatus } from "../models/Team.js";
export declare const updateTeamStatus: (teamId: string, status: TeamStatus) => Promise<{
    team: import("mongoose").Document<unknown, {}, import("../models/Team.js").ITeam, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Team.js").ITeam & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    };
    previousStatus: TeamStatus;
    status: TeamStatus;
    changed: boolean;
}>;
//# sourceMappingURL=team-status.service.d.ts.map