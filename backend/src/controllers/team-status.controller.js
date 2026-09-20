import { updateTeamStatus } from "../services/team-status.service.js";
export const changeTeamStatus = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || Array.isArray(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid team ID",
            });
            return;
        }
        const { status } = req.body;
        if (!status) {
            res.status(400).json({
                success: false,
                message: "Status is required",
            });
            return;
        }
        const result = await updateTeamStatus(id, status);
        res.status(200).json({
            success: true,
            message: result.changed
                ? "Team status updated successfully"
                : "Team status is already set to this value",
            data: result,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to update team status";
        const statusCode = message === "Team not found"
            ? 404
            : message === "Invalid team status"
                ? 400
                : 500;
        res.status(statusCode).json({
            success: false,
            message,
        });
    }
};
//# sourceMappingURL=team-status.controller.js.map