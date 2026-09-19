import mongoose, { Schema } from "mongoose";

export type TeamType =
    | "fire"
    | "medical"
    | "police"
    | "rescue"
    | "disaster_response";

export type TeamStatus =
    | "available"
    | "busy"
    | "en_route"
    | "on_scene"
    | "offline";

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

const teamSchema = new Schema<ITeam>(
    {
        teamId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        type: {
            type: String,
            enum: [
                "fire",
                "medical",
                "police",
                "rescue",
                "disaster_response",
            ],
            required: true,
        },

        status: {
            type: String,
            enum: [
                "available",
                "busy",
                "en_route",
                "on_scene",
                "offline",
            ],
            default: "available",
            required: true,
        },

        location: {
            address: {
                type: String,
                trim: true,
            },

            latitude: {
                type: Number,
                required: true,
            },

            longitude: {
                type: Number,
                required: true,
            },
        },

        members: {
            type: [String],
            default: [],
        },

        capabilities: {
            type: [String],
            default: [],
        },

        contactNumber: {
            type: String,
            trim: true,
        },

        currentIncident: {
            type: Schema.Types.ObjectId,
            ref: "Incident",
        },
    },

    {
        timestamps: true,
    }
);

// Geospatial index for nearest-team searches later
teamSchema.index({
    "location.latitude": 1,
    "location.longitude": 1,
});

const Team = mongoose.model<ITeam>("Team", teamSchema);

export default Team;