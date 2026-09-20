interface CreateTeamData {
    name: string;
    type: "fire" | "medical" | "police" | "rescue" | "disaster_response";
    status?: "available" | "busy" | "en_route" | "on_scene" | "offline";
    location: {
        address?: string;
        latitude: number;
        longitude: number;
    };
    members?: string[];
    capabilities?: string[];
    contactNumber?: string;
}
export declare const createTeam: (data: CreateTeamData) => Promise<import("mongoose").Document<unknown, {}, import("../models/Team.js").ITeam, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Team.js").ITeam & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}>;
export declare const getTeams: () => Promise<(import("mongoose").Document<unknown, {}, import("../models/Team.js").ITeam, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Team.js").ITeam & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
})[]>;
export declare const getTeamById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/Team.js").ITeam, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Team.js").ITeam & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const updateTeam: (id: string, data: Record<string, unknown>) => Promise<(import("mongoose").Document<unknown, {}, import("../models/Team.js").ITeam, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Team.js").ITeam & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const deleteTeam: (id: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/Team.js").ITeam, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Team.js").ITeam & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | null>;
export {};
//# sourceMappingURL=team.service.d.ts.map