import mongoose, { Schema } from "mongoose";
const incidentSchema = new Schema({
    incidentId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    type: {
        type: String,
        enum: [
            "fire",
            "flood",
            "accident",
            "medical",
            "chemical",
            "structural",
            "road",
            "other",
        ],
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "medium",
        required: true,
    },
    status: {
        type: String,
        enum: [
            "reported",
            "verified",
            "assigned",
            "en_route",
            "on_scene",
            "rescue_in_progress",
            "resolved",
            "closed",
        ],
        default: "reported",
        required: true,
    },
    priority: {
        type: Number,
        default: 3,
        min: 1,
        max: 5,
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
    peopleAffected: {
        type: Number,
        default: 0,
        min: 0,
    },
    peopleTrapped: {
        type: Number,
        default: 0,
        min: 0,
    },
    medicalAssistance: {
        type: Boolean,
        default: false,
    },
    source: {
        type: String,
        enum: ["citizen", "field_team", "sensor", "admin", "system"],
        required: true,
    },
    assignedTeams: [
        {
            type: Schema.Types.ObjectId,
            ref: "Team",
        },
    ],
}, {
    timestamps: true,
});
const Incident = mongoose.model("Incident", incidentSchema);
export default Incident;
//# sourceMappingURL=Incident.js.map