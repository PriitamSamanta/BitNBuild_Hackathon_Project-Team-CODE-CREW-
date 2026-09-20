import { findDuplicateIncidents } from "../services/duplicate-detection.service.js";
export const checkDuplicateIncidents = async (req, res) => {
    try {
        const { description, latitude, longitude, type, } = req.body;
        if (!description ||
            latitude === undefined ||
            longitude === undefined) {
            res.status(400).json({
                success: false,
                message: "Description, latitude and longitude are required",
            });
            return;
        }
        const candidates = await findDuplicateIncidents({
            description,
            latitude,
            longitude,
            ...(type !== undefined ? { type } : {}),
        });
        const topCandidate = candidates[0];
        res.status(200).json({
            success: true,
            message: "Duplicate incident check completed",
            data: {
                isDuplicate: topCandidate !== undefined &&
                    topCandidate.score >= 0.6,
                matchedIncident: topCandidate && topCandidate.score >= 0.6
                    ? topCandidate
                    : null,
                candidates,
            },
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Duplicate detection failed";
        res.status(500).json({
            success: false,
            message,
        });
    }
};
//# sourceMappingURL=duplicate-detection.controller.js.map