import { acknowledgeAlert, createAlert, getAlertById, getAllAlerts, resolveAlert, } from "../services/alert.service.js";
export const create = async (req, res) => {
    try {
        const alert = await createAlert(req.body);
        res.status(201).json({
            success: true,
            message: "Alert created successfully",
            data: alert,
        });
    }
    catch (error) {
        console.error("CREATE ALERT ERROR:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Failed to create alert",
        });
    }
};
export const getAll = async (_req, res) => {
    try {
        const alerts = await getAllAlerts();
        res.status(200).json({
            success: true,
            data: alerts,
        });
    }
    catch (error) {
        console.error("GET ALERTS ERROR:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Failed to fetch alerts",
        });
    }
};
export const getOne = async (req, res) => {
    try {
        const alertId = req.params.id;
        if (typeof alertId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid alert ID",
            });
            return;
        }
        const alert = await getAlertById(alertId);
        if (!alert) {
            res.status(404).json({
                success: false,
                message: "Alert not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: alert,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Failed to fetch alert",
        });
    }
};
export const acknowledge = async (req, res) => {
    try {
        const alertId = req.params.id;
        if (typeof alertId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid alert ID",
            });
            return;
        }
        const alert = await acknowledgeAlert(alertId);
        res.status(200).json({
            success: true,
            message: "Alert acknowledged successfully",
            data: alert,
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Failed to acknowledge alert",
        });
    }
};
export const resolve = async (req, res) => {
    try {
        const alertId = req.params.id;
        if (typeof alertId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid alert ID",
            });
            return;
        }
        const alert = await resolveAlert(alertId);
        res.status(200).json({
            success: true,
            message: "Alert resolved successfully",
            data: alert,
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Failed to resolve alert",
        });
    }
};
//# sourceMappingURL=alert.controller.js.map