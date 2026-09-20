import Alert, {} from "../models/Alert.js";
import Incident from "../models/Incident.js";
import { emitSocketEvent } from "../config/socket.js";
const generateAlertId = async () => {
    const count = await Alert.countDocuments();
    return `ALT-${String(count + 1).padStart(4, "0")}`;
};
export const createAlert = async (data) => {
    const alertId = await generateAlertId();
    const alert = await Alert.create({
        alertId,
        type: data.type,
        severity: data.severity,
        title: data.title,
        message: data.message,
        ...(data.incidentId
            ? { incidentId: data.incidentId }
            : {}),
        ...(data.metadata
            ? { metadata: data.metadata }
            : {}),
        status: "active",
    });
    emitSocketEvent("alert:created", {
        alertId: alert.alertId,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        incidentId: alert.incidentId?.toString(),
    });
    return alert;
};
export const getAllAlerts = async () => {
    return Alert.find()
        .populate("incidentId")
        .sort({ createdAt: -1 });
};
export const getAlertById = async (id) => {
    return Alert.findById(id).populate("incidentId");
};
export const acknowledgeAlert = async (id) => {
    const alert = await Alert.findByIdAndUpdate(id, {
        status: "acknowledged",
    }, { new: true });
    if (!alert) {
        throw new Error("Alert not found");
    }
    emitSocketEvent("alert:acknowledged", {
        alertId: alert.alertId,
        status: alert.status,
    });
    return alert;
};
export const resolveAlert = async (id) => {
    const alert = await Alert.findByIdAndUpdate(id, {
        status: "resolved",
    }, { new: true });
    if (!alert) {
        throw new Error("Alert not found");
    }
    emitSocketEvent("alert:resolved", {
        alertId: alert.alertId,
        status: alert.status,
    });
    return alert;
};
//# sourceMappingURL=alert.service.js.map