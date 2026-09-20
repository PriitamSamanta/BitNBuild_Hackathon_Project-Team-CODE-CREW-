import { dispatchTeams, } from "../services/dispatch.service.js";
export const dispatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { teamIds } = req.body;
        if (!id || Array.isArray(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid incident ID",
            });
            return;
        }
        if (!Array.isArray(teamIds) || teamIds.length === 0) {
            res.status(400).json({
                success: false,
                message: "teamIds must be a non-empty array",
            });
            return;
        }
        const result = await dispatchTeams(id, teamIds);
        res.status(200).json({
            success: true,
            message: "Teams dispatched successfully",
            data: result,
        });
    }
    catch (error) {
        console.error("Dispatch error:", error);
        const message = error instanceof Error
            ? error.message
            : "Failed to dispatch teams";
        if (message === "Incident not found" ||
            message.includes("not found")) {
            res.status(404).json({
                success: false,
                message,
            });
            return;
        }
        if (message.includes("not available")) {
            res.status(409).json({
                success: false,
                message,
            });
            return;
        }
        res.status(500).json({
            success: false,
            message,
        });
    }
};
//# sourceMappingURL=dispatch.controller.js.map