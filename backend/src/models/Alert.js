import mongoose, { Schema } from "mongoose";
const alertSchema = new Schema({
    alertId: {
        type: String,
        required: true,
        unique: true,
    },
    type: {
        type: String,
        enum: [
            "critical_incident",
            "response_delay",
            "escalation",
            "resource_shortage",
        ],
        required: true,
    },
    severity: {
        type: String,
        enum: ["info", "warning", "critical"],
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    incidentId: {
        type: Schema.Types.ObjectId,
        ref: "Incident",
    },
    status: {
        type: String,
        enum: ["active", "acknowledged", "resolved"],
        default: "active",
    },
    metadata: {
        delayMinutes: Number,
        previousSeverity: String,
        currentSeverity: String,
        requiredResource: String,
    },
}, {
    timestamps: true,
});
const Alert = mongoose.model("Alert", alertSchema);
export default Alert;
//# sourceMappingURL=Alert.js.map