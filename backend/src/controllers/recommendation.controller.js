import { getRecommendations, } from "../services/recommendation.service.js";
export const recommendTeams = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || Array.isArray(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid incident ID",
            });
            return;
        }
        const result = await getRecommendations(id);
        res.status(200).json({
            success: true,
            message: "Response teams recommended successfully",
            data: result,
        });
    }
    catch (error) {
        console.error("Recommendation error:", error);
        if (error instanceof Error &&
            error.message === "Incident not found") {
            res.status(404).json({
                success: false,
                message: "Incident not found",
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: "Failed to generate team recommendations",
        });
    }
};
//# sourceMappingURL=recommendation.controller.js.map