import mongoose, { Schema } from "mongoose";
const reportSchema = new Schema({
    reportId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        trim: true,
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
    reporterName: {
        type: String,
        trim: true,
    },
    reporterPhone: {
        type: String,
        trim: true,
    },
    source: {
        type: String,
        enum: ["citizen", "field_team", "sensor"],
        default: "citizen",
        required: true,
    },
    status: {
        type: String,
        enum: [
            "received",
            "processing",
            "linked",
            "consolidated",
        ],
        default: "received",
    },
    incidentId: {
        type: Schema.Types.ObjectId,
        ref: "Incident",
    },
}, {
    timestamps: true,
});
const Report = mongoose.model("Report", reportSchema);
export default Report;
//# sourceMappingURL=Report.js.map