import { createIncident, getIncidents, getIncidentById, updateIncident, deleteIncident, } from "../services/incident.service.js";
export const create = async (req, res) => {
    try {
        const incident = await createIncident(req.body);
        res.status(201).json({
            success: true,
            message: "Incident created successfully",
            data: incident,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Failed to create incident",
        });
    }
};
export const getAll = async (_req, res) => {
    try {
        const incidents = await getIncidents();
        res.status(200).json({
            success: true,
            data: incidents,
        });
    }
    catch (error) {
        console.error("GET INCIDENTS ERROR:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Failed to fetch incidents",
        });
    }
};
export const getOne = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || Array.isArray(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid incident ID",
            });
            return;
        }
        const incident = await getIncidentById(id);
        if (!incident) {
            res.status(404).json({
                success: false,
                message: "Incident not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: incident,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch incident",
        });
    }
};
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || Array.isArray(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid incident ID",
            });
            return;
        }
        const incident = await updateIncident(id, req.body);
        if (!incident) {
            res.status(404).json({
                success: false,
                message: "Incident not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Incident updated successfully",
            data: incident,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Failed to update incident",
        });
    }
};
export const remove = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || Array.isArray(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid incident ID",
            });
            return;
        }
        const incident = await deleteIncident(id);
        if (!incident) {
            res.status(404).json({
                success: false,
                message: "Incident not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Incident deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete incident",
        });
    }
};
//# sourceMappingURL=incident.controller.js.map