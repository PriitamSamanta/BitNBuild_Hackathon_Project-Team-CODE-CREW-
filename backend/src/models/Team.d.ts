import mongoose from "mongoose";
export type TeamType = "fire" | "medical" | "police" | "rescue" | "disaster_response";
export type TeamStatus = "available" | "busy" | "en_route" | "on_scene" | "offline";
export interface ITeam {
    teamId: string;
    name: string;
    type: TeamType;
    status: TeamStatus;
    location: {
        address?: string;
        latitude: number;
        longitude: number;
    };
    members: string[];
    capabilities: string[];
    contactNumber?: string;
    currentIncident?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}
declare const Team: mongoose.Model<ITeam, {}, {}, {}, mongoose.Document<unknown, {}, ITeam, {}, mongoose.DefaultSchemaOptions> & ITeam & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, ITeam>;
export default Team;
//# sourceMappingURL=Team.d.ts.map