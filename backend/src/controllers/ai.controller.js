import { analyzeEmergencyReport } from "../services/ai.service.js";
export const analyzeIncident = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description || typeof description !== "string") {
            res.status(400).json({
                success: false,
                message: "Description is required",
            });
            return;
        }
        const analysis = await analyzeEmergencyReport(description);
        res.status(200).json({
            success: true,
            message: "Emergency analyzed successfully",
            data: analysis,
        });
    }
    catch (error) {
        console.error("AI analysis error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to analyze emergency",
        });
    }
};
//# sourceMappingURL=ai.controller.js.map