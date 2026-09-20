import Incident from "../models/Incident.js";
import { createCriticalIncidentAlert } from "./alert-engine.service.js";
export const createIncident = async (data) => {
    const incidentCount = await Incident.countDocuments();
    const incidentId = `INC-${String(incidentCount + 1).padStart(4, "0")}`;
    const incident = await Incident.create({
        ...data,
        incidentId,
    });
    await createCriticalIncidentAlert(incident._id.toString());
    return incident;
};
export const getIncidents = async () => {
    return Incident.find()
        .sort({ createdAt: -1 })
        .populate("assignedTeams");
};
export const getIncidentById = async (id) => {
    return Incident.findById(id).populate("assignedTeams");
};
export const updateIncident = async (id, data) => {
    return Incident.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    }).populate("assignedTeams");
};
export const deleteIncident = async (id) => {
    return Incident.findByIdAndDelete(id);
};
//# sourceMappingURL=incident.service.js.map